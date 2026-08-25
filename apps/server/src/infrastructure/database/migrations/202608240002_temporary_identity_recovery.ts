import { type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('temporary_identities')
    .addColumn('recovery_digest', 'text')
    .execute();
}
