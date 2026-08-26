import type { Kysely } from 'kysely';

import type { DatabaseSchema } from '../../infrastructure/database/database.js';

export type CompletedGameForArchive = {
  gameId: string;
  whiteDisplayName: string;
  blackDisplayName: string;
  timeControl: string;
  initialFen: string;
  finalFen: string;
  result: 'white_win' | 'black_win' | 'draw';
  terminationReason: string;
  completedAt: Date;
  moves: Array<{
    sequence: number;
    san: string;
    fromSquare: string;
    toSquare: string;
    promotion: 'queen' | 'rook' | 'bishop' | 'knight' | null;
    fenAfter: string;
  }>;
};

/** Public read contract from Game to Game Archive for already completed games. */
export async function readCompletedGameForArchive(
  database: Kysely<DatabaseSchema>,
  gameId: string,
): Promise<CompletedGameForArchive | null> {
  const game = await database
    .selectFrom('active_games')
    .innerJoin(
      'temporary_identities as white_player',
      'white_player.id',
      'active_games.white_identity_id',
    )
    .innerJoin(
      'temporary_identities as black_player',
      'black_player.id',
      'active_games.black_identity_id',
    )
    .select([
      'active_games.id',
      'active_games.time_control',
      'active_games.current_fen',
      'active_games.result',
      'active_games.termination_reason',
      'active_games.completed_at',
      'active_games.created_at',
      'white_player.display_name as white_display_name',
      'black_player.display_name as black_display_name',
    ])
    .where('active_games.id', '=', gameId)
    .where('active_games.status', '=', 'completed')
    .executeTakeFirst();
  if (!game || !game.result || !game.termination_reason) return null;

  const moves = await database
    .selectFrom('game_moves')
    .select(['sequence', 'san', 'from_square', 'to_square', 'promotion', 'fen_before', 'fen_after'])
    .where('game_id', '=', game.id)
    .orderBy('sequence', 'asc')
    .execute();
  const initialFen =
    moves[0]?.fen_before ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  return {
    gameId: game.id,
    whiteDisplayName: game.white_display_name,
    blackDisplayName: game.black_display_name,
    timeControl: game.time_control,
    initialFen,
    finalFen: game.current_fen,
    result: game.result,
    terminationReason: game.termination_reason,
    completedAt: game.completed_at ?? game.created_at,
    moves: moves.map((move) => ({
      sequence: move.sequence,
      san: move.san,
      fromSquare: move.from_square,
      toSquare: move.to_square,
      promotion: move.promotion,
      fenAfter: move.fen_after,
    })),
  };
}

/** Public Game contract used by Archive's explicit, repeatable projection backfill. */
export async function listCompletedGameIdsForArchive(
  database: Kysely<DatabaseSchema>,
  limit = 100,
): Promise<string[]> {
  const games = await database
    .selectFrom('active_games')
    .select('id')
    .where('status', '=', 'completed')
    .orderBy('created_at', 'asc')
    .limit(limit)
    .execute();
  return games.map((game) => game.id);
}
