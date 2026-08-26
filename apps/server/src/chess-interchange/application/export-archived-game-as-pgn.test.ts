import { describe, expect, it } from 'vitest';

import { exportArchivedGameAsPgn } from './export-archived-game-as-pgn.js';

describe('exportArchivedGameAsPgn', () => {
  it('exports standard headers, the confirmed main line, result, and FEN setup when needed', () => {
    const pgn = exportArchivedGameAsPgn({
      id: '11111111-1111-4111-8111-111111111111',
      whiteDisplayName: 'White "Player"',
      blackDisplayName: 'Black',
      timeControl: 'blitz_5_3',
      initialFen: '8/8/8/8/8/8/8/K6k w - - 0 1',
      finalFen: '8/8/8/8/8/8/8/K6k b - - 1 1',
      result: 'draw',
      terminationReason: 'agreed_draw',
      completedAt: new Date('2026-08-26T10:00:00.000Z'),
      moves: [
        {
          sequence: 1,
          san: 'Ka2',
          fromSquare: 'a1',
          toSquare: 'a2',
          promotion: null,
          fenAfter: '8/8/8/8/8/8/K7/7k b - - 1 1',
        },
        {
          sequence: 2,
          san: 'Kh2',
          fromSquare: 'h1',
          toSquare: 'h2',
          promotion: null,
          fenAfter: '8/8/8/8/8/8/K6k/8 w - - 2 2',
        },
      ],
    });

    expect(pgn).toContain('[Event "Chess AI Public Game"]');
    expect(pgn).toContain('[Date "2026.08.26"]');
    expect(pgn).toContain('[White "White \\"Player\\""]');
    expect(pgn).toContain('[TimeControl "300+3"]');
    expect(pgn).toContain('[SetUp "1"]');
    expect(pgn).toContain('[FEN "8/8/8/8/8/8/8/K6k w - - 0 1"]');
    expect(pgn).toContain('1. Ka2 Kh2 1/2-1/2');
  });
});
