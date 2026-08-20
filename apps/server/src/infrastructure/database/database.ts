import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

export interface DatabaseSchema {}

export function createDatabase(connectionString: string): Kysely<DatabaseSchema> {
  return new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });
}

export async function verifyDatabase(database: Kysely<DatabaseSchema>): Promise<void> {
  await sql`select 1`.execute(database);
}
