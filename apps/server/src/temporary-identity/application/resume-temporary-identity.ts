import { createHash } from 'node:crypto';
import type { Kysely } from 'kysely';
import type { DatabaseSchema } from '../../infrastructure/database/database.js';

export async function resumeTemporaryIdentity(
  database: Kysely<DatabaseSchema>,
  sessionCredential: string | undefined,
) {
  if (!sessionCredential) {
    return null;
  }

  const sessionDigest = createHash('sha256').update(sessionCredential).digest('base64url');
  const identity = await database
    .selectFrom('temporary_identities')
    .select(['id', 'display_name'])
    .where('session_digest', '=', sessionDigest)
    .executeTakeFirst();

  return identity ? { id: identity.id, displayName: identity.display_name } : null;
}
