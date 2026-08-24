import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Kysely } from 'kysely';
import type { DatabaseSchema } from '../../infrastructure/database/database.js';
import { validateDisplayName } from '../domain/display-name.js';

export type ClaimTemporaryIdentityResult =
  | { accepted: true; identity: { id: string; displayName: string }; sessionCredential: string }
  | { accepted: false; code: 'DISPLAY_NAME_INVALID' | 'DISPLAY_NAME_UNAVAILABLE' };

export async function claimTemporaryIdentity(
  database: Kysely<DatabaseSchema>,
  requestedDisplayName: string,
): Promise<ClaimTemporaryIdentityResult> {
  const validatedName = validateDisplayName(requestedDisplayName);
  if (!validatedName.valid) {
    return { accepted: false, code: validatedName.code };
  }

  const identity = {
    id: randomUUID(),
    displayName: validatedName.displayName,
    normalizedName: validatedName.normalizedName,
  };
  const sessionCredential = randomBytes(32).toString('base64url');
  const sessionDigest = createHash('sha256').update(sessionCredential).digest('base64url');

  try {
    await database
      .insertInto('temporary_identities')
      .values({
        id: identity.id,
        display_name: identity.displayName,
        normalized_name: identity.normalizedName,
        session_digest: sessionDigest,
        status: 'lobby',
      })
      .executeTakeFirstOrThrow();
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { accepted: false, code: 'DISPLAY_NAME_UNAVAILABLE' };
    }
    throw error;
  }

  return { accepted: true, identity, sessionCredential };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}
