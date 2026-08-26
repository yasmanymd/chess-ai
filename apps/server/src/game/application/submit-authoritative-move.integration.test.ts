import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { FileMigrationProvider, Migrator } from 'kysely/migration';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ChessJsRulesAdapter } from '../infrastructure/chess-js-rules-adapter.js';
import { createDatabase, type DatabaseSchema } from '../../infrastructure/database/database.js';
import { submitAuthoritativeMove } from './submit-authoritative-move.js';
import { expireTimedOutGames } from './expire-timed-out-games.js';
import { performGameAction } from './perform-game-action.js';

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

  it('commits one legal transition and rejects duplicate, stale, and out-of-turn commands', async () => {
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
    ).resolves.toEqual({ accepted: false, code: 'MOVE_COMMAND_DUPLICATE' });
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
    await expect(
      performGameAction(database, rules, {
        gameId: drawGameId,
        identityId: whiteIdentityId,
        expectedVersion: 0,
        action: 'offer_draw',
      }),
    ).resolves.toMatchObject({ accepted: true, game: { version: 1 } });
    await expect(
      performGameAction(database, rules, {
        gameId: drawGameId,
        identityId: blackIdentityId,
        expectedVersion: 1,
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
  });
});
