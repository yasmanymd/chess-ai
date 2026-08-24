import { sql, type Kysely } from 'kysely';

const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('active_games')
    .addColumn('current_fen', 'text', (column) => column.notNull().defaultTo(initialFen))
    .addColumn('side_to_move', 'text', (column) => column.notNull().defaultTo('white'))
    .addColumn('version', 'integer', (column) => column.notNull().defaultTo(0))
    .execute();

  await db.schema
    .createTable('game_moves')
    .addColumn('id', 'uuid', (column) => column.primaryKey())
    .addColumn('game_id', 'uuid', (column) => column.notNull().references('active_games.id'))
    .addColumn('sequence', 'integer', (column) => column.notNull())
    .addColumn('command_id', 'uuid', (column) => column.notNull())
    .addColumn('player_identity_id', 'uuid', (column) =>
      column.notNull().references('temporary_identities.id'),
    )
    .addColumn('from_square', 'text', (column) => column.notNull())
    .addColumn('to_square', 'text', (column) => column.notNull())
    .addColumn('promotion', 'text')
    .addColumn('san', 'text', (column) => column.notNull())
    .addColumn('fen_before', 'text', (column) => column.notNull())
    .addColumn('fen_after', 'text', (column) => column.notNull())
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint('game_moves_game_sequence_unique', ['game_id', 'sequence'])
    .addUniqueConstraint('game_moves_game_command_unique', ['game_id', 'command_id'])
    .execute();
}
