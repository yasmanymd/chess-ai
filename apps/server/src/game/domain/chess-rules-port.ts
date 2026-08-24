export type ChessColor = 'white' | 'black';

export type ChessPromotionPiece = 'queen' | 'rook' | 'bishop' | 'knight';

export interface ChessMoveIntent {
  from: string;
  to: string;
  promotion?: ChessPromotionPiece;
}

export interface ChessLegalMove extends ChessMoveIntent {
  san: string;
  isCapture: boolean;
  isEnPassant: boolean;
  isCastle: boolean;
}

export interface AcceptedChessMove extends ChessMoveIntent {
  color: ChessColor;
  piece: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
  capturedPiece?: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
  san: string;
  fenBefore: string;
  fenAfter: string;
  isCapture: boolean;
  isEnPassant: boolean;
  isCastle: boolean;
}

export interface ChessPositionStatus {
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isInsufficientMaterial: boolean;
  canClaimThreefoldRepetition: boolean;
  automaticFivefoldRepetition: boolean;
  canClaimFiftyMoveRule: boolean;
  automaticSeventyFiveMoveRule: boolean;
}

export interface ChessPosition {
  fen: string;
  sideToMove: ChessColor;
  status: ChessPositionStatus;
}

export type ChessMoveResult =
  | { accepted: true; move: AcceptedChessMove; position: ChessPosition }
  | { accepted: false; reason: 'illegal-move'; position: ChessPosition };

/**
 * Project-owned boundary for standard-chess rules. External chess libraries
 * must be contained in an infrastructure adapter implementing this contract.
 */
export interface ChessRulesPort {
  initialPosition(): ChessPosition;
  inspect(fen: string): ChessPosition;
  legalMoves(fen: string, from?: string): ChessLegalMove[];
  tryMove(fen: string, intent: ChessMoveIntent): ChessMoveResult;
  replay(initialFen: string, moves: ChessMoveIntent[]): ChessPosition;
  exportPgn(initialFen: string, moves: ChessMoveIntent[]): string;
}
