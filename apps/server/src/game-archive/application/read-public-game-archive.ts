import type { Kysely } from 'kysely';

import type { DatabaseSchema } from '../../infrastructure/database/database.js';

export type ArchiveResult = 'white_win' | 'black_win' | 'draw';
export type ArchiveTimeControl = 'none' | 'rapid_10_0' | 'blitz_5_3';

export type PublicArchiveFilters = {
  player?: string;
  result?: ArchiveResult;
  timeControl?: ArchiveTimeControl;
  from?: Date;
  to?: Date;
  offset?: number;
  limit?: number;
};

export type PublicArchivedGame = {
  id: string;
  whiteDisplayName: string;
  blackDisplayName: string;
  timeControl: string;
  result: ArchiveResult;
  terminationReason: string;
  completedAt: Date;
};

export type PublicArchivedGameReplay = PublicArchivedGame & {
  initialFen: string;
  finalFen: string;
  moves: Array<{
    sequence: number;
    san: string;
    fromSquare: string;
    toSquare: string;
    promotion: 'queen' | 'rook' | 'bishop' | 'knight' | null;
    fenAfter: string;
  }>;
};

/**
 * Archive's public read contract. It queries only Archive-owned projections,
 * never the Game write model or temporary player identities.
 */
export async function listPublicArchivedGames(
  database: Kysely<DatabaseSchema>,
  filters: PublicArchiveFilters = {},
): Promise<{ games: PublicArchivedGame[]; nextOffset: number | null }> {
  const offset = Math.max(0, filters.offset ?? 0);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
  let query = database
    .selectFrom('archived_games')
    .select([
      'game_id as id',
      'white_display_name as whiteDisplayName',
      'black_display_name as blackDisplayName',
      'time_control as timeControl',
      'result',
      'termination_reason as terminationReason',
      'completed_at as completedAt',
    ]);

  const player = filters.player?.trim().toLowerCase();
  if (player) {
    query = query.where((builder) =>
      builder.or([
        builder('white_display_name', 'ilike', `%${player}%`),
        builder('black_display_name', 'ilike', `%${player}%`),
      ]),
    );
  }
  if (filters.result) query = query.where('result', '=', filters.result);
  if (filters.timeControl) query = query.where('time_control', '=', filters.timeControl);
  if (filters.from) query = query.where('completed_at', '>=', filters.from);
  if (filters.to) query = query.where('completed_at', '<', filters.to);

  const rows = await query
    .orderBy('completed_at', 'desc')
    .orderBy('game_id', 'desc')
    .limit(limit + 1)
    .offset(offset)
    .execute();
  const hasMore = rows.length > limit;
  return {
    games: rows.slice(0, limit),
    nextOffset: hasMore ? offset + limit : null,
  };
}

export async function readPublicArchivedGame(
  database: Kysely<DatabaseSchema>,
  gameId: string,
): Promise<PublicArchivedGameReplay | null> {
  const game = await database
    .selectFrom('archived_games')
    .select([
      'game_id as id',
      'white_display_name as whiteDisplayName',
      'black_display_name as blackDisplayName',
      'time_control as timeControl',
      'initial_fen as initialFen',
      'final_fen as finalFen',
      'result',
      'termination_reason as terminationReason',
      'completed_at as completedAt',
    ])
    .where('game_id', '=', gameId)
    .executeTakeFirst();
  if (!game) return null;

  const moves = await database
    .selectFrom('archived_game_moves')
    .select([
      'sequence',
      'san',
      'from_square as fromSquare',
      'to_square as toSquare',
      'promotion',
      'fen_after as fenAfter',
    ])
    .where('archived_game_id', '=', gameId)
    .orderBy('sequence', 'asc')
    .execute();
  return { ...game, moves };
}
