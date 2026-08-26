import { randomUUID } from 'node:crypto';
import type { Kysely } from 'kysely';

import type { DatabaseSchema } from '../../infrastructure/database/database.js';

export type TimedOutGame = {
  id: string;
  whiteIdentityId: string;
  blackIdentityId: string;
};

/**
 * Materializes expired clocks without requiring a browser command. The browser
 * may render a countdown, but only this server-side transaction completes a game.
 */
export async function expireTimedOutGames(
  database: Kysely<DatabaseSchema>,
  now = new Date(),
): Promise<TimedOutGame[]> {
  const candidates = await database
    .selectFrom('active_games')
    .select('id')
    .where('status', '=', 'active')
    .where('time_control', '!=', 'none')
    .execute();
  const expired: TimedOutGame[] = [];

  for (const candidate of candidates) {
    const result = await database.transaction().execute(async (transaction) => {
      const game = await transaction
        .selectFrom('active_games')
        .selectAll()
        .where('id', '=', candidate.id)
        .forUpdate()
        .executeTakeFirst();
      if (!game || game.status !== 'active' || game.time_control === 'none') return null;

      const elapsed = Math.max(
        0,
        now.getTime() - (game.turn_started_at?.getTime() ?? now.getTime()),
      );
      const remaining =
        game.side_to_move === 'white'
          ? Math.max(0, (game.white_time_remaining_ms ?? 0) - elapsed)
          : Math.max(0, (game.black_time_remaining_ms ?? 0) - elapsed);
      if (remaining > 0) return null;

      const nextVersion = game.version + 1;
      await transaction
        .updateTable('active_games')
        .set({
          status: 'completed',
          result: game.side_to_move === 'white' ? 'black_win' : 'white_win',
          termination_reason: 'timeout',
          white_time_remaining_ms: game.side_to_move === 'white' ? 0 : game.white_time_remaining_ms,
          black_time_remaining_ms: game.side_to_move === 'black' ? 0 : game.black_time_remaining_ms,
          turn_started_at: null,
          draw_offered_by_identity_id: null,
          version: nextVersion,
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
          payload: { flagged: game.side_to_move },
        })
        .execute();
      return {
        id: game.id,
        whiteIdentityId: game.white_identity_id,
        blackIdentityId: game.black_identity_id,
      };
    });
    if (result) expired.push(result);
  }
  return expired;
}
