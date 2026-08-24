export type DisplayNameValidation =
  | { valid: true; displayName: string; normalizedName: string }
  | { valid: false; code: 'DISPLAY_NAME_INVALID' };

const allowedDisplayName = /^[\p{L}\p{N} _-]+$/u;

export function validateDisplayName(value: string): DisplayNameValidation {
  const displayName = value.trim().normalize('NFKC');

  if (displayName.length < 2 || displayName.length > 30 || !allowedDisplayName.test(displayName)) {
    return { valid: false, code: 'DISPLAY_NAME_INVALID' };
  }

  return {
    valid: true,
    displayName,
    normalizedName: displayName.toLowerCase(),
  };
}
