import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('game_command_ledger')
    .addColumn('id', 'uuid', (column) => column.primaryKey())
    .addColumn('game_id', 'uuid', (column) => column.notNull().references('active_games.id'))
    .addColumn('command_id', 'uuid', (column) => column.notNull())
    .addColumn('actor_identity_id', 'uuid', (column) =>
      column.notNull().references('temporary_identities.id'),
    )
    .addColumn('command_type', 'text', (column) => column.notNull())
    .addColumn('response', 'jsonb', (column) => column.notNull())
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint('game_command_ledger_game_command_unique', ['game_id', 'command_id'])
    .execute();

  await db.schema
    .createTable('game_outbox')
    .addColumn('id', 'uuid', (column) => column.primaryKey())
    .addColumn('game_id', 'uuid', (column) => column.notNull().references('active_games.id'))
    .addColumn('event_type', 'text', (column) => column.notNull())
    .addColumn('payload', 'jsonb', (column) => column.notNull())
    .addColumn('available_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn('delivered_at', 'timestamptz')
    .addColumn('attempts', 'integer', (column) => column.notNull().defaultTo(0))
    .addColumn('lease_token', 'uuid')
    .addColumn('lease_expires_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`
    create index game_outbox_pending_index
      on game_outbox (available_at, created_at)
      where delivered_at is null
  `.execute(db);
}
