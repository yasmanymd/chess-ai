import { Generated, Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

export interface TemporaryIdentitiesTable {
  id: string;
  display_name: string;
  normalized_name: string;
  session_digest: string;
  status: 'lobby';
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface WaitingGamesTable {
  id: string;
  creator_identity_id: string;
  title: string;
  color_preference: 'white' | 'black' | 'random';
  time_control: 'none' | 'rapid_10_0' | 'blitz_5_3';
  status: 'waiting';
  created_at: Generated<Date>;
}

export interface ActiveGamesTable {
  id: string;
  white_identity_id: string;
  black_identity_id: string;
  time_control: string;
  status: 'active';
  created_at: Generated<Date>;
}

export interface DatabaseSchema {
  temporary_identities: TemporaryIdentitiesTable;
  waiting_games: WaitingGamesTable;
  active_games: ActiveGamesTable;
}

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
