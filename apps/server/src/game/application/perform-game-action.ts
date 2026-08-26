import { randomUUID } from 'node:crypto';
import type { Kysely } from 'kysely';

import type { ChessRulesPort } from '../domain/chess-rules-port.js';
import type { DatabaseSchema } from '../../infrastructure/database/database.js';

export type GameAction = 'resign' | 'offer_draw' | 'accept_draw' | 'reject_draw' | 'claim_draw';

export interface PerformGameActionCommand {
  gameId: string;
  identityId: string;
  expectedVersion: number;
  commandId: string;
  action: GameAction;
}

export type PerformGameActionResult =
  | {
      accepted: true;
      game: { id: string; version: number; white_identity_id: string; black_identity_id: string };
    }
  | {
      accepted: false;
      code: 'GAME_NOT_FOUND' | 'GAME_NOT_ACTIVE' | 'ACTION_STALE' | 'ACTION_NOT_AVAILABLE';
    };

/** Applies player lifecycle actions in the same transaction as their audit event. */
export async function performGameAction(
  database: Kysely<DatabaseSchema>,
  rules: ChessRulesPort,
  command: PerformGameActionCommand,
): Promise<PerformGameActionResult> {
  return database.transaction().execute(async (transaction) => {
    const game = await transaction
      .selectFrom('active_games')
      .selectAll()
      .where('id', '=', command.gameId)
      .forUpdate()
      .executeTakeFirst();
    if (
      !game ||
      (game.white_identity_id !== command.identityId &&
        game.black_identity_id !== command.identityId)
    ) {
      return { accepted: false, code: 'GAME_NOT_FOUND' };
    }
    const previousCommand = await transaction
      .selectFrom('game_command_ledger')
      .select('response')
      .where('game_id', '=', game.id)
      .where('command_id', '=', command.commandId)
      .executeTakeFirst();
    if (previousCommand) return previousCommand.response as PerformGameActionResult;

    if (game.status !== 'active') return { accepted: false, code: 'GAME_NOT_ACTIVE' };
    if (game.version !== command.expectedVersion) return { accepted: false, code: 'ACTION_STALE' };

    const playerColor = game.white_identity_id === command.identityId ? 'white' : 'black';
    const nextVersion = game.version + 1;
    let status: 'active' | 'completed' = 'active';
    let result: 'white_win' | 'black_win' | 'draw' | null = null;
    let reason: 'resignation' | 'agreed_draw' | 'draw_claim' | null = null;
    let drawOffer: string | null = game.draw_offered_by_identity_id;

    if (command.action === 'resign') {
      status = 'completed';
      result = playerColor === 'white' ? 'black_win' : 'white_win';
      reason = 'resignation';
      drawOffer = null;
    } else if (command.action === 'offer_draw') {
      if (drawOffer) return { accepted: false, code: 'ACTION_NOT_AVAILABLE' };
      drawOffer = command.identityId;
    } else if (command.action === 'accept_draw') {
      if (!drawOffer || drawOffer === command.identityId) {
        return { accepted: false, code: 'ACTION_NOT_AVAILABLE' };
      }
      status = 'completed';
      result = 'draw';
      reason = 'agreed_draw';
      drawOffer = null;
    } else if (command.action === 'reject_draw') {
      if (!drawOffer || drawOffer === command.identityId) {
        return { accepted: false, code: 'ACTION_NOT_AVAILABLE' };
      }
      drawOffer = null;
    } else {
      const moves = await transaction
        .selectFrom('game_moves')
        .select(['from_square', 'to_square', 'promotion'])
        .where('game_id', '=', game.id)
        .orderBy('sequence', 'asc')
        .execute();
      const position = rules.replay(
        rules.initialPosition().fen,
        moves.map((move) => ({
          from: move.from_square,
          to: move.to_square,
          promotion: move.promotion ?? undefined,
        })),
      );
      if (!position.status.canClaimThreefoldRepetition && !position.status.canClaimFiftyMoveRule) {
        return { accepted: false, code: 'ACTION_NOT_AVAILABLE' };
      }
      status = 'completed';
      result = 'draw';
      reason = 'draw_claim';
      drawOffer = null;
    }

    const updated = await transaction
      .updateTable('active_games')
      .set({
        status,
        result,
        termination_reason: reason,
        draw_offered_by_identity_id: drawOffer,
        turn_started_at: status === 'completed' ? null : game.turn_started_at,
        version: nextVersion,
      })
      .where('id', '=', game.id)
      .where('version', '=', game.version)
      .returning(['id', 'version', 'white_identity_id', 'black_identity_id'])
      .executeTakeFirstOrThrow();
    await transaction
      .insertInto('game_events')
      .values({
        id: randomUUID(),
        game_id: game.id,
        sequence: nextVersion,
        actor_identity_id: command.identityId,
        event_type: command.action,
        payload: { result, terminationReason: reason },
      })
      .execute();
    const response: PerformGameActionResult = { accepted: true, game: updated };
    await transaction
      .insertInto('game_command_ledger')
      .values({
        id: randomUUID(),
        game_id: game.id,
        command_id: command.commandId,
        actor_identity_id: command.identityId,
        command_type: 'game_action',
        response,
      })
      .execute();
    await transaction
      .insertInto('game_outbox')
      .values({
        id: randomUUID(),
        game_id: game.id,
        event_type: 'game.updated',
        payload: {
          gameId: game.id,
          recipientIdentityIds: [game.white_identity_id, game.black_identity_id],
        },
        delivered_at: null,
        lease_token: null,
        lease_expires_at: null,
      })
      .execute();
    return response;
  });
}
