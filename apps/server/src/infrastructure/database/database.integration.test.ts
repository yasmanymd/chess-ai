import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabase, verifyDatabase, type DatabaseSchema } from './database.js';
import type { Kysely } from 'kysely';

let container: PostgreSqlContainer;
let database: Kysely<DatabaseSchema>;

describe('database integration', () => {
  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:18.6-bookworm').start();
    database = createDatabase(container.getConnectionUri());
  });

  afterAll(async () => {
    await database?.destroy();
    await container?.stop();
  });

  it('connects to an isolated PostgreSQL instance', async () => {
    await expect(verifyDatabase(database)).resolves.toBeUndefined();
  });
});
