import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('active_games')
    .addColumn('white_time_remaining_ms', 'integer')
    .addColumn('black_time_remaining_ms', 'integer')
    .addColumn('turn_started_at', 'timestamptz')
    .addColumn('result', 'text')
    .addColumn('termination_reason', 'text')
    .addColumn('draw_offered_by_identity_id', 'uuid')
    .execute();

  await sql`
    alter table active_games
      add constraint active_games_status check (status in ('active', 'completed')),
      add constraint active_games_result check (result is null or result in ('white_win', 'black_win', 'draw'))
  `.execute(db);

  await db.schema
    .createTable('game_events')
    .addColumn('id', 'uuid', (column) => column.primaryKey())
    .addColumn('game_id', 'uuid', (column) => column.notNull().references('active_games.id'))
    .addColumn('sequence', 'integer', (column) => column.notNull())
    .addColumn('actor_identity_id', 'uuid', (column) => column.references('temporary_identities.id'))
    .addColumn('event_type', 'text', (column) => column.notNull())
    .addColumn('payload', 'jsonb', (column) => column.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint('game_events_game_sequence_unique', ['game_id', 'sequence'])
    .execute();
}
