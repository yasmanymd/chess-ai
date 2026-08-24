import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('waiting_games')
    .addColumn('id', 'uuid', (column) => column.primaryKey())
    .addColumn('creator_identity_id', 'uuid', (column) =>
      column.notNull().unique().references('temporary_identities.id').onDelete('cascade'),
    )
    .addColumn('title', 'text', (column) => column.notNull())
    .addColumn('color_preference', 'text', (column) => column.notNull().defaultTo('random'))
    .addColumn('time_control', 'text', (column) => column.notNull().defaultTo('none'))
    .addColumn('status', 'text', (column) => column.notNull().defaultTo('waiting'))
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .execute();
}
