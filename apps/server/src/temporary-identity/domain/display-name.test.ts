import { describe, expect, it } from 'vitest';
import { validateDisplayName } from './display-name.js';

describe('validateDisplayName', () => {
  it('trims, normalizes, and compares names independently of case', () => {
    expect(validateDisplayName('  Yasmany  ')).toEqual({
      valid: true,
      displayName: 'Yasmany',
      normalizedName: 'yasmany',
    });
  });

  it('accepts international letters, numbers, spaces, hyphens, and underscores', () => {
    expect(validateDisplayName('Échecs_2026-Club')).toMatchObject({ valid: true });
  });

  it.each([' ', 'x', 'name!', 'a'.repeat(31)])('rejects invalid name %j', (value) => {
    expect(validateDisplayName(value)).toEqual({ valid: false, code: 'DISPLAY_NAME_INVALID' });
  });
});
