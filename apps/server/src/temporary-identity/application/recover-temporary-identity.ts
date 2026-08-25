import { randomBytes } from 'node:crypto';
import type { Kysely } from 'kysely';
import type { DatabaseSchema } from '../../infrastructure/database/database.js';
import { validateDisplayName } from '../domain/display-name.js';
import { digest, normalizeRecoveryCode } from './claim-temporary-identity.js';

export type RecoverTemporaryIdentityResult =
  | { accepted: true; identity: { id: string; displayName: string }; sessionCredential: string }
  | { accepted: false; code: 'DISPLAY_NAME_INVALID' | 'RECOVERY_CODE_INVALID' };

export async function recoverTemporaryIdentity(
  database: Kysely<DatabaseSchema>,
  requestedDisplayName: string,
  requestedRecoveryCode: string,
): Promise<RecoverTemporaryIdentityResult> {
  const validatedName = validateDisplayName(requestedDisplayName);
  if (!validatedName.valid) {
    return { accepted: false, code: validatedName.code };
  }

  const recoveryCode = normalizeRecoveryCode(requestedRecoveryCode);
  if (recoveryCode.length !== 32 || !/^[A-F0-9]+$/.test(recoveryCode)) {
    return { accepted: false, code: 'RECOVERY_CODE_INVALID' };
  }

  const identity = await database
    .selectFrom('temporary_identities')
    .select(['id', 'display_name'])
    .where('normalized_name', '=', validatedName.normalizedName)
    .where('recovery_digest', '=', digest(recoveryCode))
    .executeTakeFirst();

  if (!identity) {
    return { accepted: false, code: 'RECOVERY_CODE_INVALID' };
  }

  const sessionCredential = randomBytes(32).toString('base64url');
  await database
    .updateTable('temporary_identities')
    .set({ session_digest: digest(sessionCredential) })
    .where('id', '=', identity.id)
    .executeTakeFirstOrThrow();

  return {
    accepted: true,
    identity: { id: identity.id, displayName: identity.display_name },
    sessionCredential,
  };
}
