import type { PublicArchivedGameReplay } from '../../game-archive/application/read-public-game-archive.js';

const standardInitialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function escapeTagValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function resultToken(result: PublicArchivedGameReplay['result']) {
  return result === 'white_win' ? '1-0' : result === 'black_win' ? '0-1' : '1/2-1/2';
}

function pgnTimeControl(timeControl: string) {
  if (timeControl === 'rapid_10_0') return '600';
  if (timeControl === 'blitz_5_3') return '300+3';
  return '-';
}

function termination(reason: string) {
  const values: Record<string, string> = {
    checkmate: 'normal',
    stalemate: 'normal',
    insufficient_material: 'normal',
    fivefold_repetition: 'normal',
    seventy_five_move_rule: 'normal',
    timeout: 'time forfeit',
    resignation: 'resignation',
    agreed_draw: 'agreed draw',
    draw_claim: 'draw claim',
  };
  return values[reason] ?? 'normal';
}

/**
 * Chess Interchange's pure public-game exporter. Its only input is Archive's
 * replay contract, so it cannot access Game persistence or active state.
 */
export function exportArchivedGameAsPgn(game: PublicArchivedGameReplay): string {
  const completed = game.completedAt;
  const date = `${completed.getUTCFullYear()}.${String(completed.getUTCMonth() + 1).padStart(2, '0')}.${String(completed.getUTCDate()).padStart(2, '0')}`;
  const result = resultToken(game.result);
  const headers: Array<[string, string]> = [
    ['Event', 'Chess AI Public Game'],
    ['Site', 'Chess AI'],
    ['Date', date],
    ['Round', '-'],
    ['White', game.whiteDisplayName],
    ['Black', game.blackDisplayName],
    ['Result', result],
    ['TimeControl', pgnTimeControl(game.timeControl)],
    ['Termination', termination(game.terminationReason)],
  ];
  if (game.initialFen !== standardInitialFen) {
    headers.push(['SetUp', '1'], ['FEN', game.initialFen]);
  }
  const moves = Array.from({ length: Math.ceil(game.moves.length / 2) }, (_, index) => {
    const white = game.moves[index * 2]?.san;
    const black = game.moves[index * 2 + 1]?.san;
    return `${index + 1}. ${white ?? ''}${black ? ` ${black}` : ''}`.trim();
  });
  return `${headers.map(([name, value]) => `[${name} "${escapeTagValue(value)}"]`).join('\n')}\n\n${[...moves, result].join(' ')}\n`;
}
