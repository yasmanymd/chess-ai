import { ColumnType, Generated, Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

export interface TemporaryIdentitiesTable {
  id: string;
  display_name: string;
  normalized_name: string;
  session_digest: string;
  recovery_digest: ColumnType<string | null, string | null | undefined, string | null>;
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
  status: 'active' | 'completed';
  current_fen: string;
  side_to_move: 'white' | 'black';
  version: number;
  white_time_remaining_ms: number | null;
  black_time_remaining_ms: number | null;
  turn_started_at: Date | null;
  result: 'white_win' | 'black_win' | 'draw' | null;
  termination_reason:
    | 'checkmate'
    | 'stalemate'
    | 'insufficient_material'
    | 'timeout'
    | 'resignation'
    | 'agreed_draw'
    | 'draw_claim'
    | null;
  draw_offered_by_identity_id: string | null;
  created_at: Generated<Date>;
}

export interface GameMovesTable {
  id: string;
  game_id: string;
  sequence: number;
  command_id: string;
  player_identity_id: string;
  from_square: string;
  to_square: string;
  promotion: 'queen' | 'rook' | 'bishop' | 'knight' | null;
  san: string;
  fen_before: string;
  fen_after: string;
  created_at: Generated<Date>;
}

export interface GameEventsTable {
  id: string;
  game_id: string;
  sequence: number;
  actor_identity_id: string | null;
  event_type: string;
  payload: unknown;
  created_at: Generated<Date>;
}

export interface DatabaseSchema {
  temporary_identities: TemporaryIdentitiesTable;
  waiting_games: WaitingGamesTable;
  active_games: ActiveGamesTable;
  game_moves: GameMovesTable;
  game_events: GameEventsTable;
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
