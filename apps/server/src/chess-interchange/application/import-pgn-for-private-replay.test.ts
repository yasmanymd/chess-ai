import { describe, expect, it } from 'vitest';

import { importPgnForPrivateReplay } from './import-pgn-for-private-replay.js';

describe('importPgnForPrivateReplay', () => {
  it('creates a replay-only view of one valid PGN', () => {
    const imported = importPgnForPrivateReplay(`
[Event "Friendly game"]
[White "Mari"]
[Black "Yas"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0
`);

    expect(imported).toMatchObject({ accepted: true });
    if (!imported.accepted) return;
    expect(imported.game.headers.White).toBe('Mari');
    expect(imported.game.result).toBe('white_win');
    expect(imported.game.moves).toHaveLength(7);
    expect(imported.game.moves.at(-1)).toMatchObject({ sequence: 7, san: 'Qxf7#' });
  });

  it('uses the supplied FEN as the replay starting position', () => {
    const imported = importPgnForPrivateReplay(`
[SetUp "1"]
[FEN "8/8/8/8/8/8/4K3/7k w - - 0 1"]
[Result "*"]

1. Kf2 *
`);

    expect(imported).toMatchObject({ accepted: true });
    if (!imported.accepted) return;
    expect(imported.game.initialFen).toBe('8/8/8/8/8/8/4K3/7k w - - 0 1');
    expect(imported.game.moves[0]).toMatchObject({ san: 'Kf2', fromSquare: 'e2' });
  });

  it('keeps only the main line when comments and variations are present', () => {
    const imported = importPgnForPrivateReplay('1. e4 {A central move.} e5 (1... c5) 2. Nf3 *');

    expect(imported).toMatchObject({ accepted: true });
    if (!imported.accepted) return;
    expect(imported.game.moves.map((move) => move.san)).toEqual(['e4', 'e5', 'Nf3']);
  });

  it('rejects empty, invalid, and inconsistent PGN input', () => {
    expect(importPgnForPrivateReplay('  ')).toEqual({ accepted: false, code: 'PGN_EMPTY' });
    expect(importPgnForPrivateReplay('1. nope')).toEqual({ accepted: false, code: 'PGN_INVALID' });
    expect(importPgnForPrivateReplay('[Result "1-0"]\n\n1. e4 e5 0-1')).toEqual({
      accepted: false,
      code: 'PGN_RESULT_INCONSISTENT',
    });
    expect(importPgnForPrivateReplay('[Variant "Atomic"]\n\n1. e4 e5 *')).toEqual({
      accepted: false,
      code: 'PGN_UNSUPPORTED_VARIANT',
    });
  });
});
