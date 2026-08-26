import type { Kysely } from 'kysely';

import type { CompletedGameForArchive } from '../../game/application/read-completed-game-for-archive.js';
import type { DatabaseSchema } from '../../infrastructure/database/database.js';

export type CompletedGameSource = (gameId: string) => Promise<CompletedGameForArchive | null>;

/**
 * Creates Archive-owned replay data from the explicit Game public read contract.
 * It is intentionally idempotent because outbox delivery is at-least-once.
 */
export async function projectCompletedGame(
  database: Kysely<DatabaseSchema>,
  source: CompletedGameSource,
  gameId: string,
): Promise<boolean> {
  const game = await source(gameId);
  if (!game) return false;
  return database.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom('archived_games')
      .select('game_id')
      .where('game_id', '=', game.gameId)
      .executeTakeFirst();
    if (existing) return false;

    await transaction
      .insertInto('archived_games')
      .values({
        game_id: game.gameId,
        white_display_name: game.whiteDisplayName,
        black_display_name: game.blackDisplayName,
        time_control: game.timeControl,
        initial_fen: game.initialFen,
        final_fen: game.finalFen,
        result: game.result,
        termination_reason: game.terminationReason,
        completed_at: game.completedAt,
      })
      .execute();
    if (game.moves.length > 0) {
      await transaction
        .insertInto('archived_game_moves')
        .values(
          game.moves.map((move) => ({
            archived_game_id: game.gameId,
            sequence: move.sequence,
            san: move.san,
            from_square: move.fromSquare,
            to_square: move.toSquare,
            promotion: move.promotion,
            fen_after: move.fenAfter,
          })),
        )
        .execute();
    }
    return true;
  });
}

/** Replays the Game public completed-game list; existing projections are skipped. */
export async function backfillCompletedGames(
  database: Kysely<DatabaseSchema>,
  listCompletedGameIds: () => Promise<string[]>,
  source: CompletedGameSource,
): Promise<number> {
  const gameIds = await listCompletedGameIds();
  let projected = 0;
  for (const gameId of gameIds) {
    if (await projectCompletedGame(database, source, gameId)) projected += 1;
  }
  return projected;
}
