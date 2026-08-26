import { Chess } from 'chess.js';

const standardInitialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const maximumPgnBytes = 512 * 1024;

export type PrivateImportedGame = {
  headers: Record<string, string>;
  initialFen: string;
  finalFen: string;
  result: 'white_win' | 'black_win' | 'draw' | 'unfinished';
  moves: Array<{
    sequence: number;
    san: string;
    fromSquare: string;
    toSquare: string;
    fenAfter: string;
  }>;
};

export function importPgnForPrivateReplay(pgn: string):
  | { accepted: true; game: PrivateImportedGame }
  | {
      accepted: false;
      code:
        | 'PGN_EMPTY'
        | 'PGN_TOO_LARGE'
        | 'PGN_INVALID'
        | 'PGN_RESULT_INCONSISTENT'
        | 'PGN_UNSUPPORTED_VARIANT';
    } {
  if (!pgn.trim()) return { accepted: false, code: 'PGN_EMPTY' };
  if (Buffer.byteLength(pgn, 'utf8') > maximumPgnBytes)
    return { accepted: false, code: 'PGN_TOO_LARGE' };
  try {
    const chess = new Chess();
    chess.loadPgn(pgn, { strict: true });
    const headers = chess.getHeaders();
    if (headers.Variant && !['Standard', 'From Position'].includes(headers.Variant)) {
      return { accepted: false, code: 'PGN_UNSUPPORTED_VARIANT' };
    }
    const marker = pgn.trim().match(/(?:^|\s)(1-0|0-1|1\/2-1\/2|\*)\s*$/)?.[1];
    const declaredResult = pgn.match(/^\[Result\s+"(1-0|0-1|1\/2-1\/2|\*)"\]\s*$/m)?.[1];
    if (declaredResult && marker && declaredResult !== marker) {
      return { accepted: false, code: 'PGN_RESULT_INCONSISTENT' };
    }
    const initialFen = headers.SetUp === '1' && headers.FEN ? headers.FEN : standardInitialFen;
    const replay = new Chess(initialFen);
    const moves = chess.history({ verbose: true }).map((move, index) => {
      replay.move(move.san);
      return {
        sequence: index + 1,
        san: move.san,
        fromSquare: move.from,
        toSquare: move.to,
        fenAfter: replay.fen(),
      };
    });
    const result =
      headers.Result === '1-0'
        ? 'white_win'
        : headers.Result === '0-1'
          ? 'black_win'
          : headers.Result === '1/2-1/2'
            ? 'draw'
            : 'unfinished';
    return { accepted: true, game: { headers, initialFen, finalFen: chess.fen(), result, moves } };
  } catch {
    return { accepted: false, code: 'PGN_INVALID' };
  }
}
