import { Chess } from 'chess.js';

import type {
  ChessColor,
  ChessLegalMove,
  ChessMoveIntent,
  ChessMoveResult,
  ChessPosition,
  ChessPositionStatus,
  ChessPromotionPiece,
  ChessRulesPort,
} from '../domain/chess-rules-port.js';

const promotionToLibraryPiece: Record<ChessPromotionPiece, string> = {
  queen: 'q',
  rook: 'r',
  bishop: 'b',
  knight: 'n',
};

const libraryPieceToProjectPiece = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
} as const;

const libraryColorToProjectColor = (color: 'w' | 'b'): ChessColor =>
  color === 'w' ? 'white' : 'black';

const libraryPromotionToProjectPromotion = (
  promotion: string | undefined,
): ChessPromotionPiece | undefined => {
  switch (promotion) {
    case 'q':
      return 'queen';
    case 'r':
      return 'rook';
    case 'b':
      return 'bishop';
    case 'n':
      return 'knight';
    default:
      return undefined;
  }
};

const halfMoveClock = (fen: string): number => Number(fen.split(' ')[4] ?? 0);

const repetitionKey = (fen: string): string => fen.split(' ').slice(0, 4).join(' ');

/** The only server module allowed to import chess.js. */
export class ChessJsRulesAdapter implements ChessRulesPort {
  initialPosition(): ChessPosition {
    return this.positionFrom(new Chess());
  }

  inspect(fen: string): ChessPosition {
    return this.positionFrom(new Chess(fen));
  }

  legalMoves(fen: string, from?: string): ChessLegalMove[] {
    const chess = new Chess(fen);
    return chess
      .moves({ verbose: true })
      .filter((move) => from === undefined || move.from === from)
      .map((move) => ({
        from: move.from,
        to: move.to,
        promotion: libraryPromotionToProjectPromotion(move.promotion),
        san: move.san,
        isCapture: move.isCapture(),
        isEnPassant: move.isEnPassant(),
        isCastle: move.isKingsideCastle() || move.isQueensideCastle(),
      }));
  }

  tryMove(fen: string, intent: ChessMoveIntent): ChessMoveResult {
    const chess = new Chess(fen);
    const fenBefore = chess.fen();

    try {
      const move = chess.move({
        from: intent.from,
        to: intent.to,
        promotion: intent.promotion ? promotionToLibraryPiece[intent.promotion] : undefined,
      });

      return {
        accepted: true,
        move: {
          from: move.from,
          to: move.to,
          promotion: libraryPromotionToProjectPromotion(move.promotion),
          color: libraryColorToProjectColor(move.color),
          piece: libraryPieceToProjectPiece[move.piece],
          capturedPiece: move.captured ? libraryPieceToProjectPiece[move.captured] : undefined,
          san: move.san,
          fenBefore,
          fenAfter: move.after,
          isCapture: move.isCapture(),
          isEnPassant: move.isEnPassant(),
          isCastle: move.isKingsideCastle() || move.isQueensideCastle(),
        },
        position: this.positionFrom(chess),
      };
    } catch {
      return {
        accepted: false,
        reason: 'illegal-move',
        position: this.positionFrom(chess),
      };
    }
  }

  replay(initialFen: string, moves: ChessMoveIntent[]): ChessPosition {
    const { chess, occurrenceCount } = this.replayMoves(initialFen, moves);

    return this.positionFrom(chess, occurrenceCount);
  }

  exportPgn(initialFen: string, moves: ChessMoveIntent[]): string {
    const { chess } = this.replayMoves(initialFen, moves);
    return chess.pgn();
  }

  private replayMoves(
    initialFen: string,
    moves: ChessMoveIntent[],
  ): { chess: Chess; occurrenceCount: number } {
    const chess = new Chess(initialFen);
    const occurrences = new Map<string, number>([[repetitionKey(chess.fen()), 1]]);

    for (const intent of moves) {
      try {
        chess.move({
          from: intent.from,
          to: intent.to,
          promotion: intent.promotion ? promotionToLibraryPiece[intent.promotion] : undefined,
        });
      } catch {
        throw new Error(`Cannot replay illegal move ${intent.from}-${intent.to}.`);
      }

      const key = repetitionKey(chess.fen());
      occurrences.set(key, (occurrences.get(key) ?? 0) + 1);
    }

    return {
      chess,
      occurrenceCount: occurrences.get(repetitionKey(chess.fen())) ?? 1,
    };
  }

  private positionFrom(chess: Chess, repetitionCount = 1): ChessPosition {
    const fen = chess.fen();
    return {
      fen,
      sideToMove: libraryColorToProjectColor(chess.turn()),
      status: this.statusFrom(chess, fen, repetitionCount),
    };
  }

  private statusFrom(chess: Chess, fen: string, repetitionCount: number): ChessPositionStatus {
    const isCheckmate = chess.isCheckmate();
    const clock = halfMoveClock(fen);

    return {
      isCheck: chess.isCheck(),
      isCheckmate,
      isStalemate: chess.isStalemate(),
      isInsufficientMaterial: chess.isInsufficientMaterial(),
      canClaimThreefoldRepetition: repetitionCount >= 3,
      automaticFivefoldRepetition: repetitionCount >= 5,
      canClaimFiftyMoveRule: clock >= 100,
      automaticSeventyFiveMoveRule: !isCheckmate && clock >= 150,
    };
  }
}
