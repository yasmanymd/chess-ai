import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('active_games')
    .addColumn('id', 'uuid', (column) => column.primaryKey())
    .addColumn('white_identity_id', 'uuid', (column) =>
      column.notNull().references('temporary_identities.id'),
    )
    .addColumn('black_identity_id', 'uuid', (column) =>
      column.notNull().references('temporary_identities.id'),
    )
    .addColumn('time_control', 'text', (column) => column.notNull())
    .addColumn('status', 'text', (column) => column.notNull().defaultTo('active'))
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addCheckConstraint(
      'active_games_distinct_players',
      sql`white_identity_id <> black_identity_id`,
    )
    .execute();
}
