import { randomUUID } from 'node:crypto';
import { sql, type Kysely } from 'kysely';

import type { DatabaseSchema } from '../../infrastructure/database/database.js';

export type GameOutboxEvent =
  | { type: 'game.updated'; gameId: string; recipientIdentityIds: string[] }
  | { type: 'game.completed'; gameId: string };

type ClaimedOutboxRecord = {
  id: string;
  eventType: GameOutboxEvent['type'];
  gameId: string;
  recipientIdentityIds?: string[];
  leaseToken: string;
  attempts: number;
};

/**
 * Publishes durable game-update facts at least once. Claiming and marking a
 * record delivered use a lease so a process restart or failed publish leaves
 * the record available for another attempt rather than losing the intent.
 */
export async function dispatchPendingGameOutbox(
  database: Kysely<DatabaseSchema>,
  publish: (event: GameOutboxEvent) => Promise<void> | void,
  now = new Date(),
): Promise<{ delivered: number; failed: number }> {
  const candidates = await database
    .selectFrom('game_outbox')
    .select('id')
    .where('delivered_at', 'is', null)
    .where('available_at', '<=', now)
    .where((builder) =>
      builder.or([builder('lease_token', 'is', null), builder('lease_expires_at', '<=', now)]),
    )
    .orderBy('available_at', 'asc')
    .orderBy('created_at', 'asc')
    .limit(50)
    .execute();

  let delivered = 0;
  let failed = 0;
  for (const candidate of candidates) {
    const claimed = await claimOutboxRecord(database, candidate.id, now);
    if (!claimed) continue;

    try {
      await publish(
        claimed.eventType === 'game.updated'
          ? {
              type: 'game.updated',
              gameId: claimed.gameId,
              recipientIdentityIds: claimed.recipientIdentityIds ?? [],
            }
          : { type: 'game.completed', gameId: claimed.gameId },
      );
      await database
        .updateTable('game_outbox')
        .set({
          delivered_at: new Date(),
          lease_token: null,
          lease_expires_at: null,
        })
        .where('id', '=', claimed.id)
        .where('lease_token', '=', claimed.leaseToken)
        .execute();
      delivered += 1;
    } catch {
      const retryAt = new Date(now.getTime() + retryDelayMs(claimed.attempts));
      await database
        .updateTable('game_outbox')
        .set({
          available_at: retryAt,
          lease_token: null,
          lease_expires_at: null,
        })
        .where('id', '=', claimed.id)
        .where('lease_token', '=', claimed.leaseToken)
        .execute();
      failed += 1;
    }
  }
  return { delivered, failed };
}

async function claimOutboxRecord(
  database: Kysely<DatabaseSchema>,
  id: string,
  now: Date,
): Promise<ClaimedOutboxRecord | null> {
  const leaseToken = randomUUID();
  const record = await database
    .updateTable('game_outbox')
    .set({
      attempts: sql<number>`attempts + 1`,
      lease_token: leaseToken,
      lease_expires_at: new Date(now.getTime() + 30_000),
    })
    .where('id', '=', id)
    .where('event_type', 'in', ['game.updated', 'game.completed'])
    .where('delivered_at', 'is', null)
    .where('available_at', '<=', now)
    .where((builder) =>
      builder.or([builder('lease_token', 'is', null), builder('lease_expires_at', '<=', now)]),
    )
    .returningAll()
    .executeTakeFirst();
  if (!record) return null;

  const payload = record.payload as { gameId?: string; recipientIdentityIds?: string[] };
  const gameId = payload.gameId ?? record.game_id;
  let recipientIdentityIds: string[] | null = null;
  if (record.event_type === 'game.updated') {
    recipientIdentityIds = Array.isArray(payload.recipientIdentityIds)
      ? payload.recipientIdentityIds
      : null;
  }
  if (record.event_type === 'game.updated' && !recipientIdentityIds) {
    const game = await database
      .selectFrom('active_games')
      .select(['white_identity_id', 'black_identity_id'])
      .where('id', '=', gameId)
      .executeTakeFirst();
    recipientIdentityIds = game ? [game.white_identity_id, game.black_identity_id] : null;
  }
  if (record.event_type === 'game.updated' && !recipientIdentityIds) {
    await database
      .updateTable('game_outbox')
      .set({ lease_token: null, lease_expires_at: null })
      .where('id', '=', record.id)
      .where('lease_token', '=', leaseToken)
      .execute();
    return null;
  }
  return {
    id: record.id,
    eventType: record.event_type as GameOutboxEvent['type'],
    gameId,
    recipientIdentityIds: recipientIdentityIds ?? undefined,
    leaseToken,
    attempts: record.attempts,
  };
}

function retryDelayMs(attempts: number): number {
  return Math.min(30_000, 1_000 * 2 ** Math.min(attempts - 1, 5));
}
