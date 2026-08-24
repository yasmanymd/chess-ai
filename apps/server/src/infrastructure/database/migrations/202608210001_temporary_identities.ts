import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('temporary_identities')
    .addColumn('id', 'uuid', (column) => column.primaryKey())
    .addColumn('display_name', 'text', (column) => column.notNull())
    .addColumn('normalized_name', 'text', (column) => column.notNull().unique())
    .addColumn('session_digest', 'text', (column) => column.notNull().unique())
    .addColumn('status', 'text', (column) => column.notNull().defaultTo('lobby'))
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .execute();
}
