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
    | 'MOVE_COMMAND_DUPLICATE'
    | 'MOVE_STALE'
    | 'MOVE_NOT_YOUR_TURN'
    | 'MOVE_ILLEGAL';
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
    if (game.status !== 'active') return { accepted: false, code: 'GAME_NOT_ACTIVE' };

    const previousCommand = await transaction
      .selectFrom('game_moves')
      .select('id')
      .where('game_id', '=', game.id)
      .where('command_id', '=', command.commandId)
      .executeTakeFirst();
    if (previousCommand) return { accepted: false, code: 'MOVE_COMMAND_DUPLICATE' };

    if (game.version !== command.expectedVersion) {
      return { accepted: false, code: 'MOVE_STALE' };
    }

    const playerColor = game.white_identity_id === command.identityId ? 'white' : 'black';
    if (game.side_to_move !== playerColor) {
      return { accepted: false, code: 'MOVE_NOT_YOUR_TURN' };
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
    const updatedGame = await transaction
      .updateTable('active_games')
      .set({
        current_fen: moveResult.position.fen,
        side_to_move: moveResult.position.sideToMove,
        version: nextVersion,
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
      ])
      .executeTakeFirstOrThrow();

    return {
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
  });
}
