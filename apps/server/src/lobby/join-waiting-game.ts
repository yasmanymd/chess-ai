import { randomInt, randomUUID } from 'node:crypto';
import type { Kysely } from 'kysely';
import type { DatabaseSchema } from '../infrastructure/database/database.js';
import type { ChessRulesPort } from '../game/domain/chess-rules-port.js';

type ActiveGame = {
  id: string;
  white_identity_id: string;
  black_identity_id: string;
  time_control: string;
  status: 'active' | 'completed';
  created_at: Date;
};

export type JoinWaitingGameResult =
  | { accepted: true; game: ActiveGame }
  | { accepted: false; code: 'WAITING_GAME_UNAVAILABLE' | 'WAITING_GAME_OWNED_BY_PLAYER' };

export async function joinWaitingGame(
  database: Kysely<DatabaseSchema>,
  rules: ChessRulesPort,
  gameId: string,
  opponentId: string,
): Promise<JoinWaitingGameResult> {
  return database.transaction().execute(async (transaction) => {
    const waiting = await transaction
      .selectFrom('waiting_games')
      .selectAll()
      .where('id', '=', gameId)
      .where('status', '=', 'waiting')
      .forUpdate()
      .executeTakeFirst();
    if (!waiting) return { accepted: false, code: 'WAITING_GAME_UNAVAILABLE' };
    if (waiting.creator_identity_id === opponentId) {
      return { accepted: false, code: 'WAITING_GAME_OWNED_BY_PLAYER' };
    }
    const creatorIsWhite =
      waiting.color_preference === 'white' ||
      (waiting.color_preference === 'random' && randomInt(2) === 0);
    const [whiteIdentityId, blackIdentityId] = creatorIsWhite
      ? [waiting.creator_identity_id, opponentId]
      : [opponentId, waiting.creator_identity_id];
    await transaction
      .deleteFrom('waiting_games')
      .where('id', '=', waiting.id)
      .where('status', '=', 'waiting')
      .executeTakeFirstOrThrow();
    const game = await transaction
      .insertInto('active_games')
      .values({
        id: randomUUID(),
        white_identity_id: whiteIdentityId,
        black_identity_id: blackIdentityId,
        time_control: waiting.time_control,
        status: 'active',
        current_fen: rules.initialPosition().fen,
        side_to_move: 'white',
        version: 0,
        white_time_remaining_ms: initialTimeMilliseconds(waiting.time_control),
        black_time_remaining_ms: initialTimeMilliseconds(waiting.time_control),
        turn_started_at: waiting.time_control === 'none' ? null : new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return { accepted: true, game };
  });
}

function initialTimeMilliseconds(timeControl: string): number | null {
  if (timeControl === 'rapid_10_0') return 10 * 60 * 1_000;
  if (timeControl === 'blitz_5_3') return 5 * 60 * 1_000;
  return null;
}
