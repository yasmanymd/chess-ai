import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { FileMigrationProvider, Migrator } from 'kysely/migration';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ChessJsRulesAdapter } from '../infrastructure/chess-js-rules-adapter.js';
import { createDatabase } from '../../infrastructure/database/database.js';
import { submitAuthoritativeMove } from './submit-authoritative-move.js';
import { expireTimedOutGames } from './expire-timed-out-games.js';
import { performGameAction } from './perform-game-action.js';
import { dispatchPendingGameOutbox } from './dispatch-game-outbox.js';

const migrationFolder = fileURLToPath(
  new URL('../../infrastructure/database/migrations', import.meta.url),
);
const whiteIdentityId = randomUUID();
const blackIdentityId = randomUUID();
const gameId = randomUUID();

let container: StartedPostgreSqlContainer;
let database: ReturnType<typeof createDatabase>;
const rules = new ChessJsRulesAdapter();

describe('submitAuthoritativeMove integration', () => {
  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:18.6-bookworm').start();
    database = createDatabase(container.getConnectionUri());
    const migrator = new Migrator({
      db: database,
      provider: new FileMigrationProvider({ fs, path, migrationFolder }),
    });
    const { error } = await migrator.migrateToLatest();
    if (error) throw error;

    await database
      .insertInto('temporary_identities')
      .values([
        {
          id: whiteIdentityId,
          display_name: 'White',
          normalized_name: 'white',
          session_digest: 'white-session',
          status: 'lobby',
        },
        {
          id: blackIdentityId,
          display_name: 'Black',
          normalized_name: 'black',
          session_digest: 'black-session',
          status: 'lobby',
        },
      ])
      .execute();
    await database
      .insertInto('active_games')
      .values({
        id: gameId,
        white_identity_id: whiteIdentityId,
        black_identity_id: blackIdentityId,
        time_control: 'none',
        status: 'active',
        current_fen: rules.initialPosition().fen,
        side_to_move: 'white',
        version: 0,
      })
      .execute();
  });

  afterAll(async () => {
    await database?.destroy();
    await container?.stop();
  });

  it('commits one legal transition, records its result, and replays it idempotently', async () => {
    const commandId = randomUUID();
    const accepted = await submitAuthoritativeMove(database, rules, {
      gameId,
      identityId: whiteIdentityId,
      commandId,
      expectedVersion: 0,
      from: 'e2',
      to: 'e4',
    });

    expect(accepted).toMatchObject({
      accepted: true,
      move: { sequence: 1, san: 'e4' },
      game: { version: 1, side_to_move: 'black' },
    });
    await expect(
      submitAuthoritativeMove(database, rules, {
        gameId,
        identityId: whiteIdentityId,
        commandId,
        expectedVersion: 1,
        from: 'e2',
        to: 'e4',
      }),
    ).resolves.toEqual(accepted);
    await expect(
      submitAuthoritativeMove(database, rules, {
        gameId,
        identityId: blackIdentityId,
        commandId: randomUUID(),
        expectedVersion: 0,
        from: 'e7',
        to: 'e5',
      }),
    ).resolves.toEqual({ accepted: false, code: 'MOVE_STALE' });
    await expect(
      submitAuthoritativeMove(database, rules, {
        gameId,
        identityId: whiteIdentityId,
        commandId: randomUUID(),
        expectedVersion: 1,
        from: 'g1',
        to: 'f3',
      }),
    ).resolves.toEqual({ accepted: false, code: 'MOVE_NOT_YOUR_TURN' });

    const stored = await database
      .selectFrom('game_moves')
      .select(['sequence', 'san', 'fen_before', 'fen_after'])
      .where('game_id', '=', gameId)
      .execute();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ sequence: 1, san: 'e4' });
    await expect(
      database
        .selectFrom('game_command_ledger')
        .select(['command_type', 'response'])
        .where('game_id', '=', gameId)
        .execute(),
    ).resolves.toHaveLength(1);
    await expect(
      database
        .selectFrom('game_outbox')
        .select(['event_type', 'payload'])
        .where('game_id', '=', gameId)
        .execute(),
    ).resolves.toEqual([
      {
        event_type: 'game.updated',
        payload: { gameId, recipientIdentityIds: [whiteIdentityId, blackIdentityId] },
      },
    ]);
  });

  it('closes an expired clock without waiting for another browser command', async () => {
    const expiredGameId = randomUUID();
    const now = new Date();
    await database
      .insertInto('active_games')
      .values({
        id: expiredGameId,
        white_identity_id: whiteIdentityId,
        black_identity_id: blackIdentityId,
        time_control: 'rapid_10_0',
        status: 'active',
        current_fen: rules.initialPosition().fen,
        side_to_move: 'white',
        version: 0,
        white_time_remaining_ms: 10,
        black_time_remaining_ms: 600_000,
        turn_started_at: new Date(now.getTime() - 20),
      })
      .execute();

    await expect(expireTimedOutGames(database, now)).resolves.toEqual([
      {
        id: expiredGameId,
        whiteIdentityId,
        blackIdentityId,
      },
    ]);
    await expect(
      database
        .selectFrom('active_games')
        .select(['status', 'result', 'termination_reason', 'white_time_remaining_ms'])
        .where('id', '=', expiredGameId)
        .executeTakeFirstOrThrow(),
    ).resolves.toMatchObject({
      status: 'completed',
      result: 'black_win',
      termination_reason: 'timeout',
      white_time_remaining_ms: 0,
    });
    await expect(
      database
        .selectFrom('game_outbox')
        .select('event_type')
        .where('game_id', '=', expiredGameId)
        .execute(),
    ).resolves.toEqual([{ event_type: 'game.updated' }]);
  });

  it('persists an agreed draw as an explicit game lifecycle event', async () => {
    const drawGameId = randomUUID();
    await database
      .insertInto('active_games')
      .values({
        id: drawGameId,
        white_identity_id: whiteIdentityId,
        black_identity_id: blackIdentityId,
        time_control: 'none',
        status: 'active',
        current_fen: rules.initialPosition().fen,
        side_to_move: 'white',
        version: 0,
      })
      .execute();
    const offerCommandId = randomUUID();
    const offer = await performGameAction(database, rules, {
      gameId: drawGameId,
      identityId: whiteIdentityId,
      expectedVersion: 0,
      commandId: offerCommandId,
      action: 'offer_draw',
    });
    expect(offer).toMatchObject({ accepted: true, game: { version: 1 } });
    await expect(
      performGameAction(database, rules, {
        gameId: drawGameId,
        identityId: whiteIdentityId,
        expectedVersion: 1,
        commandId: offerCommandId,
        action: 'offer_draw',
      }),
    ).resolves.toEqual(offer);
    await expect(
      performGameAction(database, rules, {
        gameId: drawGameId,
        identityId: blackIdentityId,
        expectedVersion: 1,
        commandId: randomUUID(),
        action: 'accept_draw',
      }),
    ).resolves.toMatchObject({ accepted: true, game: { version: 2 } });
    await expect(
      database
        .selectFrom('active_games')
        .select(['status', 'result', 'termination_reason'])
        .where('id', '=', drawGameId)
        .executeTakeFirstOrThrow(),
    ).resolves.toMatchObject({
      status: 'completed',
      result: 'draw',
      termination_reason: 'agreed_draw',
    });
    await expect(
      database
        .selectFrom('game_events')
        .select('event_type')
        .where('game_id', '=', drawGameId)
        .orderBy('sequence', 'asc')
        .execute(),
    ).resolves.toEqual([{ event_type: 'offer_draw' }, { event_type: 'accept_draw' }]);
    await expect(
      database
        .selectFrom('game_outbox')
        .select('event_type')
        .where('game_id', '=', drawGameId)
        .orderBy('created_at', 'asc')
        .execute(),
    ).resolves.toEqual([{ event_type: 'game.updated' }, { event_type: 'game.updated' }]);
  });

  it('retries an outbox publication without repeating game state', async () => {
    const outboxGameId = randomUUID();
    const outboxId = randomUUID();
    const now = new Date();
    await database.deleteFrom('game_outbox').execute();
    await database
      .insertInto('active_games')
      .values({
        id: outboxGameId,
        white_identity_id: whiteIdentityId,
        black_identity_id: blackIdentityId,
        time_control: 'none',
        status: 'active',
        current_fen: rules.initialPosition().fen,
        side_to_move: 'white',
        version: 0,
      })
      .execute();
    await database
      .insertInto('game_outbox')
      .values({
        id: outboxId,
        game_id: outboxGameId,
        event_type: 'game.updated',
        payload: {
          gameId: outboxGameId,
          recipientIdentityIds: [whiteIdentityId, blackIdentityId],
        },
        available_at: now,
        delivered_at: null,
        lease_token: null,
        lease_expires_at: null,
      })
      .execute();

    await expect(
      dispatchPendingGameOutbox(
        database,
        () => {
          throw new Error('simulated publish failure');
        },
        now,
      ),
    ).resolves.toEqual({ delivered: 0, failed: 1 });
    await expect(
      database
        .selectFrom('game_outbox')
        .select(['attempts', 'delivered_at', 'lease_token'])
        .where('id', '=', outboxId)
        .executeTakeFirstOrThrow(),
    ).resolves.toMatchObject({ attempts: 1, delivered_at: null, lease_token: null });

    const published: string[] = [];
    await expect(
      dispatchPendingGameOutbox(
        database,
        ({ gameId: publishedGameId }) => {
          published.push(publishedGameId);
        },
        new Date(now.getTime() + 1_001),
      ),
    ).resolves.toEqual({ delivered: 1, failed: 0 });
    expect(published).toEqual([outboxGameId]);
    await expect(
      database
        .selectFrom('game_outbox')
        .select(['attempts', 'delivered_at'])
        .where('id', '=', outboxId)
        .executeTakeFirstOrThrow(),
    ).resolves.toMatchObject({ attempts: 2 });
  });

  it('accepts one of two concurrent retries for the same move command', async () => {
    const concurrentGameId = randomUUID();
    const commandId = randomUUID();
    await database
      .insertInto('active_games')
      .values({
        id: concurrentGameId,
        white_identity_id: whiteIdentityId,
        black_identity_id: blackIdentityId,
        time_control: 'none',
        status: 'active',
        current_fen: rules.initialPosition().fen,
        side_to_move: 'white',
        version: 0,
      })
      .execute();
    const command = {
      gameId: concurrentGameId,
      identityId: whiteIdentityId,
      commandId,
      expectedVersion: 0,
      from: 'e2',
      to: 'e4',
    };
    const [first, second] = await Promise.all([
      submitAuthoritativeMove(database, rules, command),
      submitAuthoritativeMove(database, rules, command),
    ]);
    expect(first).toEqual(second);
    await expect(
      database
        .selectFrom('game_moves')
        .select('id')
        .where('game_id', '=', concurrentGameId)
        .execute(),
    ).resolves.toHaveLength(1);
  });

  it('automatically ends on fivefold repetition', async () => {
    const repetitionGameId = randomUUID();
    await database
      .insertInto('active_games')
      .values({
        id: repetitionGameId,
        white_identity_id: whiteIdentityId,
        black_identity_id: blackIdentityId,
        time_control: 'none',
        status: 'active',
        current_fen: rules.initialPosition().fen,
        side_to_move: 'white',
        version: 0,
      })
      .execute();
    const cycle = [
      [whiteIdentityId, 'g1', 'f3'],
      [blackIdentityId, 'g8', 'f6'],
      [whiteIdentityId, 'f3', 'g1'],
      [blackIdentityId, 'f6', 'g8'],
    ] as const;
    let version = 0;
    for (const [identityId, from, to] of Array.from({ length: 4 }, () => cycle).flat()) {
      const result = await submitAuthoritativeMove(database, rules, {
        gameId: repetitionGameId,
        identityId,
        commandId: randomUUID(),
        expectedVersion: version,
        from,
        to,
      });
      expect(result.accepted).toBe(true);
      version += 1;
    }
    await expect(
      database
        .selectFrom('active_games')
        .select(['status', 'result', 'termination_reason', 'version'])
        .where('id', '=', repetitionGameId)
        .executeTakeFirstOrThrow(),
    ).resolves.toMatchObject({
      status: 'completed',
      result: 'draw',
      termination_reason: 'fivefold_repetition',
      version: 16,
    });
  });
});
