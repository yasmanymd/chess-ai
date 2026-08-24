import { describe, expect, it } from 'vitest';

import { ChessJsRulesAdapter } from './chess-js-rules-adapter.js';

const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('ChessJsRulesAdapter', () => {
  const rules = new ChessJsRulesAdapter();

  it('accepts a normal move, produces SAN, and preserves a reconstructable FEN', () => {
    const result = rules.tryMove(initialFen, { from: 'e2', to: 'e4' });

    expect(result).toMatchObject({ accepted: true });
    if (!result.accepted) throw new Error('Expected e2-e4 to be legal.');

    expect(result.move.san).toBe('e4');
    expect(result.position.sideToMove).toBe('black');
    expect(rules.inspect(result.position.fen)).toEqual(result.position);
    expect(
      rules.exportPgn(initialFen, [
        { from: 'e2', to: 'e4' },
        { from: 'e7', to: 'e5' },
      ]),
    ).toContain('1. e4 e5');
  });

  it('rejects an illegal move without changing the confirmed position', () => {
    const result = rules.tryMove(initialFen, { from: 'e2', to: 'e5' });

    expect(result).toEqual({
      accepted: false,
      reason: 'illegal-move',
      position: rules.inspect(initialFen),
    });
  });

  it('reports checkmate and stalemate from reference FEN positions', () => {
    expect(rules.inspect('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1').status).toMatchObject({
      isCheck: true,
      isCheckmate: true,
      isStalemate: false,
    });
    expect(rules.inspect('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1').status).toMatchObject({
      isCheck: false,
      isCheckmate: false,
      isStalemate: true,
    });
  });

  it('handles castling, en passant, and promotion through project-owned moves', () => {
    const castle = rules.tryMove('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', {
      from: 'e1',
      to: 'g1',
    });
    const enPassant = rules.tryMove('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', {
      from: 'e5',
      to: 'd6',
    });
    const promotion = rules.tryMove('4k3/P7/8/8/8/8/8/4K3 w - - 0 1', {
      from: 'a7',
      to: 'a8',
      promotion: 'queen',
    });

    expect(castle).toMatchObject({ accepted: true, move: { san: 'O-O', isCastle: true } });
    expect(enPassant).toMatchObject({ accepted: true, move: { san: 'exd6', isEnPassant: true } });
    expect(promotion).toMatchObject({ accepted: true, move: { san: 'a8=Q+', promotion: 'queen' } });
  });

  it('keeps repetition and move-count policies explicit instead of using a generic draw flag', () => {
    const repeated = rules.replay(initialFen, [
      { from: 'g1', to: 'f3' },
      { from: 'g8', to: 'f6' },
      { from: 'f3', to: 'g1' },
      { from: 'f6', to: 'g8' },
      { from: 'g1', to: 'f3' },
      { from: 'g8', to: 'f6' },
      { from: 'f3', to: 'g1' },
      { from: 'f6', to: 'g8' },
    ]);

    expect(repeated.status).toMatchObject({
      canClaimThreefoldRepetition: true,
      automaticFivefoldRepetition: false,
    });
    expect(
      rules.replay(
        initialFen,
        Array.from({ length: 4 }, () => [
          { from: 'g1', to: 'f3' },
          { from: 'g8', to: 'f6' },
          { from: 'f3', to: 'g1' },
          { from: 'f6', to: 'g8' },
        ]).flat(),
      ).status,
    ).toMatchObject({ automaticFivefoldRepetition: true });
    expect(rules.inspect('7k/8/8/8/8/8/8/K6R w - - 100 1').status).toMatchObject({
      canClaimFiftyMoveRule: true,
      automaticSeventyFiveMoveRule: false,
    });
    expect(rules.inspect('7k/8/8/8/8/8/8/K6R w - - 150 1').status).toMatchObject({
      automaticSeventyFiveMoveRule: true,
    });
  });

  it('exposes legal destinations from a selected square without exposing library types', () => {
    expect(rules.legalMoves(initialFen, 'e2')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: 'e2', to: 'e3', san: 'e3' }),
        expect.objectContaining({ from: 'e2', to: 'e4', san: 'e4' }),
      ]),
    );
  });
});
