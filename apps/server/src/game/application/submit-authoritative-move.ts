import { randomUUID } from 'node:crypto';
import type { Kysely } from 'kysely';

import type {
  ChessMoveIntent,
  ChessPromotionPiece,
  ChessRulesPort,
} from '../domain/chess-rules-port.js';
import type { DatabaseSchema } from '../../infrastructure/database/database.js';

export interface SubmitAuthoritativeMoveCommand extends ChessMoveIntent {
  gameId: string;
  identityId: string;
  expectedVersion: number;
  commandId: string;
}

type AcceptedAuthoritativeMove = {
  accepted: true;
  game: {
    id: string;
    current_fen: string;
    side_to_move: 'white' | 'black';
    version: number;
    white_identity_id: string;
    black_identity_id: string;
    status: 'active' | 'completed';
    result: 'white_win' | 'black_win' | 'draw' | null;
    termination_reason: string | null;
    white_time_remaining_ms: number | null;
    black_time_remaining_ms: number | null;
  };
  move: {
    sequence: number;
    san: string;
    from: string;
    to: string;
    promotion: ChessPromotionPiece | null;
  };
};

type RejectedAuthoritativeMove = {
  accepted: false;
  code:
    | 'GAME_NOT_FOUND'
    | 'GAME_NOT_ACTIVE'
    | 'MOVE_STALE'
    | 'MOVE_NOT_YOUR_TURN'
    | 'MOVE_ILLEGAL'
    | 'MOVE_FLAGGED';
};

export type SubmitAuthoritativeMoveResult = AcceptedAuthoritativeMove | RejectedAuthoritativeMove;

/**
 * Transactional command handler for a move. The browser supplies an intent;
 * only this use case obtains the confirmed next position from ChessRulesPort.
 */
export async function submitAuthoritativeMove(
  database: Kysely<DatabaseSchema>,
  rules: ChessRulesPort,
  command: SubmitAuthoritativeMoveCommand,
): Promise<SubmitAuthoritativeMoveResult> {
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
    if (previousCommand) return previousCommand.response as SubmitAuthoritativeMoveResult;

    if (game.status !== 'active') return { accepted: false, code: 'GAME_NOT_ACTIVE' };

    if (game.version !== command.expectedVersion) {
      return { accepted: false, code: 'MOVE_STALE' };
    }

    const playerColor = game.white_identity_id === command.identityId ? 'white' : 'black';
    if (game.side_to_move !== playerColor) {
      return { accepted: false, code: 'MOVE_NOT_YOUR_TURN' };
    }

    const clock = calculateClock(game, new Date());
    if (clock.flagged) {
      const nextVersion = game.version + 1;
      const result = playerColor === 'white' ? 'black_win' : 'white_win';
      await transaction
        .updateTable('active_games')
        .set({
          status: 'completed',
          result,
          termination_reason: 'timeout',
          white_time_remaining_ms: clock.whiteTimeRemainingMs,
          black_time_remaining_ms: clock.blackTimeRemainingMs,
          version: nextVersion,
          draw_offered_by_identity_id: null,
        })
        .where('id', '=', game.id)
        .where('version', '=', game.version)
        .executeTakeFirstOrThrow();
      await transaction
        .insertInto('game_events')
        .values({
          id: randomUUID(),
          game_id: game.id,
          sequence: nextVersion,
          actor_identity_id: null,
          event_type: 'timeout',
          payload: { flagged: playerColor },
        })
        .execute();
      const response: RejectedAuthoritativeMove = { accepted: false, code: 'MOVE_FLAGGED' };
      await recordConfirmedCommand(transaction, game.id, command, response);
      await enqueueGameUpdated(
        transaction,
        game.id,
        game.white_identity_id,
        game.black_identity_id,
      );
      return response;
    }

    const moveResult = rules.tryMove(game.current_fen, command);
    if (!moveResult.accepted) return { accepted: false, code: 'MOVE_ILLEGAL' };

    const nextVersion = game.version + 1;
    const sequence = nextVersion;
    await transaction
      .insertInto('game_moves')
      .values({
        id: randomUUID(),
        game_id: game.id,
        sequence,
        command_id: command.commandId,
        player_identity_id: command.identityId,
        from_square: moveResult.move.from,
        to_square: moveResult.move.to,
        promotion: moveResult.move.promotion ?? null,
        san: moveResult.move.san,
        fen_before: moveResult.move.fenBefore,
        fen_after: moveResult.move.fenAfter,
      })
      .execute();
    const confirmedMoves = await transaction
      .selectFrom('game_moves')
      .select(['from_square', 'to_square', 'promotion'])
      .where('game_id', '=', game.id)
      .orderBy('sequence', 'asc')
      .execute();
    const replayedPosition = rules.replay(
      rules.initialPosition().fen,
      confirmedMoves.map((move) => ({
        from: move.from_square,
        to: move.to_square,
        promotion: move.promotion ?? undefined,
      })),
    );
    const termination = terminalResult(replayedPosition.status, playerColor);
    const updatedGame = await transaction
      .updateTable('active_games')
      .set({
        current_fen: moveResult.position.fen,
        side_to_move: moveResult.position.sideToMove,
        version: nextVersion,
        status: termination ? 'completed' : 'active',
        result: termination?.result ?? null,
        termination_reason: termination?.reason ?? null,
        white_time_remaining_ms: clock.afterMoveWhiteTimeRemainingMs,
        black_time_remaining_ms: clock.afterMoveBlackTimeRemainingMs,
        turn_started_at: termination || game.time_control === 'none' ? null : new Date(),
        draw_offered_by_identity_id: null,
      })
      .where('id', '=', game.id)
      .where('version', '=', game.version)
      .returning([
        'id',
        'current_fen',
        'side_to_move',
        'version',
        'white_identity_id',
        'black_identity_id',
        'status',
        'result',
        'termination_reason',
        'white_time_remaining_ms',
        'black_time_remaining_ms',
      ])
      .executeTakeFirstOrThrow();

    const response: AcceptedAuthoritativeMove = {
      accepted: true,
      game: updatedGame,
      move: {
        sequence,
        san: moveResult.move.san,
        from: moveResult.move.from,
        to: moveResult.move.to,
        promotion: moveResult.move.promotion ?? null,
      },
    };
    await recordConfirmedCommand(transaction, game.id, command, response);
    await enqueueGameUpdated(transaction, game.id, game.white_identity_id, game.black_identity_id);
    return response;
  });
}

async function recordConfirmedCommand(
  transaction: Kysely<DatabaseSchema>,
  gameId: string,
  command: SubmitAuthoritativeMoveCommand,
  response: SubmitAuthoritativeMoveResult,
) {
  await transaction
    .insertInto('game_command_ledger')
    .values({
      id: randomUUID(),
      game_id: gameId,
      command_id: command.commandId,
      actor_identity_id: command.identityId,
      command_type: 'move',
      response,
    })
    .execute();
}

async function enqueueGameUpdated(
  transaction: Kysely<DatabaseSchema>,
  gameId: string,
  whiteIdentityId: string,
  blackIdentityId: string,
) {
  await transaction
    .insertInto('game_outbox')
    .values({
      id: randomUUID(),
      game_id: gameId,
      event_type: 'game.updated',
      payload: { gameId, recipientIdentityIds: [whiteIdentityId, blackIdentityId] },
      delivered_at: null,
      lease_token: null,
      lease_expires_at: null,
    })
    .execute();
}

type ClockGame = {
  time_control: string;
  side_to_move: 'white' | 'black';
  white_time_remaining_ms: number | null;
  black_time_remaining_ms: number | null;
  turn_started_at: Date | null;
};

function calculateClock(game: ClockGame, now: Date) {
  if (game.time_control === 'none') {
    return {
      flagged: false,
      whiteTimeRemainingMs: null,
      blackTimeRemainingMs: null,
      afterMoveWhiteTimeRemainingMs: null,
      afterMoveBlackTimeRemainingMs: null,
    };
  }
  const elapsed = Math.max(0, now.getTime() - (game.turn_started_at?.getTime() ?? now.getTime()));
  const whiteTimeRemainingMs =
    game.side_to_move === 'white'
      ? Math.max(0, (game.white_time_remaining_ms ?? 0) - elapsed)
      : game.white_time_remaining_ms;
  const blackTimeRemainingMs =
    game.side_to_move === 'black'
      ? Math.max(0, (game.black_time_remaining_ms ?? 0) - elapsed)
      : game.black_time_remaining_ms;
  const increment = game.time_control === 'blitz_5_3' ? 3_000 : 0;
  return {
    flagged: (game.side_to_move === 'white' ? whiteTimeRemainingMs : blackTimeRemainingMs) === 0,
    whiteTimeRemainingMs,
    blackTimeRemainingMs,
    afterMoveWhiteTimeRemainingMs:
      game.side_to_move === 'white'
        ? (whiteTimeRemainingMs ?? 0) + increment
        : whiteTimeRemainingMs,
    afterMoveBlackTimeRemainingMs:
      game.side_to_move === 'black'
        ? (blackTimeRemainingMs ?? 0) + increment
        : blackTimeRemainingMs,
  };
}

function terminalResult(
  status: ReturnType<ChessRulesPort['inspect']>['status'],
  mover: 'white' | 'black',
): {
  result: 'white_win' | 'black_win' | 'draw';
  reason:
    | 'checkmate'
    | 'stalemate'
    | 'insufficient_material'
    | 'fivefold_repetition'
    | 'seventy_five_move_rule';
} | null {
  if (status.isCheckmate) {
    return { result: mover === 'white' ? 'white_win' : 'black_win', reason: 'checkmate' };
  }
  if (status.isStalemate) return { result: 'draw', reason: 'stalemate' };
  if (status.isInsufficientMaterial) return { result: 'draw', reason: 'insufficient_material' };
  if (status.automaticFivefoldRepetition) {
    return { result: 'draw', reason: 'fivefold_repetition' };
  }
  if (status.automaticSeventyFiveMoveRule) {
    return { result: 'draw', reason: 'seventy_five_move_rule' };
  }
  return null;
}
