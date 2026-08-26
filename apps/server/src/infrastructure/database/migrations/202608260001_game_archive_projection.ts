import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable('active_games').addColumn('completed_at', 'timestamptz').execute();

  await db.schema
    .createTable('archived_games')
    .addColumn('game_id', 'uuid', (column) =>
      column.primaryKey().references('active_games.id').onDelete('cascade'),
    )
    .addColumn('white_display_name', 'text', (column) => column.notNull())
    .addColumn('black_display_name', 'text', (column) => column.notNull())
    .addColumn('time_control', 'text', (column) => column.notNull())
    .addColumn('initial_fen', 'text', (column) => column.notNull())
    .addColumn('final_fen', 'text', (column) => column.notNull())
    .addColumn('result', 'text', (column) => column.notNull())
    .addColumn('termination_reason', 'text', (column) => column.notNull())
    .addColumn('completed_at', 'timestamptz', (column) => column.notNull())
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable('archived_game_moves')
    .addColumn('archived_game_id', 'uuid', (column) =>
      column.notNull().references('archived_games.game_id').onDelete('cascade'),
    )
    .addColumn('sequence', 'integer', (column) => column.notNull())
    .addColumn('san', 'text', (column) => column.notNull())
    .addColumn('from_square', 'text', (column) => column.notNull())
    .addColumn('to_square', 'text', (column) => column.notNull())
    .addColumn('promotion', 'text')
    .addColumn('fen_after', 'text', (column) => column.notNull())
    .addPrimaryKeyConstraint('archived_game_moves_game_sequence_key', [
      'archived_game_id',
      'sequence',
    ])
    .execute();

  await sql`
    create index archived_games_completed_at_index
      on archived_games (completed_at desc, game_id desc)
  `.execute(db);
}
