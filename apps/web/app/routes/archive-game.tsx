import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

type ReplayGame = {
  id: string;
  whiteDisplayName: string;
  blackDisplayName: string;
  timeControl: string;
  initialFen: string;
  finalFen: string;
  result: 'white_win' | 'black_win' | 'draw';
  terminationReason: string;
  completedAt: string;
  moves: Array<{
    sequence: number;
    san: string;
    fromSquare: string;
    toSquare: string;
    fenAfter: string;
  }>;
};
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const pieceAsset: Record<string, string> = {
  P: '/pieces/cburnett/wP.svg',
  N: '/pieces/cburnett/wN.svg',
  B: '/pieces/cburnett/wB.svg',
  R: '/pieces/cburnett/wR.svg',
  Q: '/pieces/cburnett/wQ.svg',
  K: '/pieces/cburnett/wK.svg',
  p: '/pieces/cburnett/bP.svg',
  n: '/pieces/cburnett/bN.svg',
  b: '/pieces/cburnett/bB.svg',
  r: '/pieces/cburnett/bR.svg',
  q: '/pieces/cburnett/bQ.svg',
  k: '/pieces/cburnett/bK.svg',
};
function piecesFromFen(fen: string): Record<string, string> {
  const pieces: Record<string, string> = {};
  fen
    .split(' ')[0]
    .split('/')
    .forEach((rank, rankIndex) => {
      let fileIndex = 0;
      for (const token of rank) {
        if (/\d/.test(token)) fileIndex += Number(token);
        else {
          pieces[`${files[fileIndex]}${8 - rankIndex}`] = token;
          fileIndex += 1;
        }
      }
    });
  return pieces;
}
export async function loader({ params }: { params: { gameId?: string } }) {
  const response = await fetch(`http://server:3000/archive/games/${params.gameId ?? ''}`);
  if (!response.ok) throw new Response('Archived game unavailable', { status: response.status });
  return (await response.json()) as { game: ReplayGame };
}
export default function ArchiveGame() {
  const { t } = useTranslation();
  const { game } = useLoaderData<typeof loader>();
  const [ply, setPly] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const currentMoveRef = useRef<HTMLButtonElement>(null);
  const fen = ply === 0 ? game.initialFen : game.moves[ply - 1]!.fenAfter;
  const pieces = useMemo(() => piecesFromFen(fen), [fen]);
  const squares = Array.from(
    { length: 64 },
    (_, index) => `${files[index % 8]}${8 - Math.floor(index / 8)}`,
  );
  const lastMove = ply > 0 ? game.moves[ply - 1] : null;
  const currentMoveLabel = lastMove
    ? `${Math.ceil(lastMove.sequence / 2)}${lastMove.sequence % 2 === 0 ? '…' : '.'} ${lastMove.san}`
    : null;
  const result =
    game.result === 'draw'
      ? t('archiveResult.draw')
      : t('gameWinner', {
          name: game.result === 'white_win' ? game.whiteDisplayName : game.blackDisplayName,
        });
  useEffect(() => {
    if (!playing) return undefined;
    if (ply >= game.moves.length) {
      setPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setPly((current) => current + 1), 800);
    return () => window.clearTimeout(timer);
  }, [game.moves.length, playing, ply]);
  useEffect(() => {
    currentMoveRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [ply]);
  const copyPgn = async () => {
    try {
      const response = await fetch(`/archive/games/${game.id}/pgn`);
      if (!response.ok) throw new Error('PGN request failed');
      await navigator.clipboard.writeText(await response.text());
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };
  return (
    <main className="archive-game-page" id="main-content">
      <a className="text-link" href="/archive">
        ← {t('archiveBack')}
      </a>
      <p className="eyebrow">
        <span aria-hidden="true">✦</span> {t('archiveReplayEyebrow')}
      </p>
      <h1>
        {game.whiteDisplayName} <span aria-hidden="true">—</span> {game.blackDisplayName}
      </h1>
      <p className="game-meta">
        {result} · {new Date(game.completedAt).toLocaleDateString()}
      </p>
      <section className="archive-replay-layout">
        <div className="archive-board-panel">
          <div
            className="match-board archive-board"
            aria-label={t('archiveReplayBoard')}
            role="img"
          >
            {squares.map((square, index) => {
              const piece = pieces[square];
              const className = `square ${(Math.floor(index / 8) + (index % 8)) % 2 === 0 ? 'square-light' : 'square-dark'}${lastMove?.fromSquare === square ? ' square-last-from' : ''}${lastMove?.toSquare === square ? ' square-last-to' : ''}`;
              return (
                <span className={className} key={square}>
                  {piece ? (
                    <img
                      alt=""
                      aria-hidden="true"
                      className="chess-piece"
                      src={pieceAsset[piece]}
                    />
                  ) : null}
                  {index % 8 === 0 ? (
                    <span aria-hidden="true" className="board-coordinate board-rank">
                      {square[1]}
                    </span>
                  ) : null}
                  {Math.floor(index / 8) === 7 ? (
                    <span aria-hidden="true" className="board-coordinate board-file">
                      {square[0]}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
          <div className="replay-controls" role="group" aria-label={t('archiveReplayControls')}>
            <button onClick={() => setPly(0)} type="button">
              {t('archiveStart')}
            </button>
            <button onClick={() => setPly((current) => Math.max(0, current - 1))} type="button">
              {t('archivePrevious')}
            </button>
            <button onClick={() => setPlaying((current) => !current)} type="button">
              {playing ? t('archivePause') : t('archivePlay')}
            </button>
            <button
              onClick={() => setPly((current) => Math.min(game.moves.length, current + 1))}
              type="button"
            >
              {t('archiveNext')}
            </button>
            <button onClick={() => setPly(game.moves.length)} type="button">
              {t('archiveEnd')}
            </button>
          </div>
          <div className="archive-export-actions">
            <a className="button button-secondary" href={`/archive/games/${game.id}/pgn`}>
              {t('archiveDownloadPgn')}
            </a>
            <button className="button button-quiet" onClick={() => void copyPgn()} type="button">
              {t('archiveCopyPgn')}
            </button>
            {copyStatus === 'copied' ? <span role="status">{t('archivePgnCopied')}</span> : null}
            {copyStatus === 'failed' ? (
              <span className="field-error" role="status">
                {t('archivePgnCopyFailed')}
              </span>
            ) : null}
          </div>
        </div>
        <aside className="archive-replay-sidebar" aria-label={t('moveHistory')}>
          <div className="archive-player-row">
            <span>
              <i className="piece-color-indicator piece-color-light" />
              {game.whiteDisplayName}
            </span>
            <span>
              <i className="piece-color-indicator piece-color-dark" />
              {game.blackDisplayName}
            </span>
          </div>
          <p className="archive-current-position" role="status">
            {ply === 0
              ? t('archiveInitialPosition')
              : t('archiveCurrentPosition', { move: currentMoveLabel })}
          </p>
          <ol className="move-history-list archive-replay-moves">
            {Array.from({ length: Math.ceil(game.moves.length / 2) }, (_, index) => ({
              number: index + 1,
              white: game.moves[index * 2],
              black: game.moves[index * 2 + 1],
            })).map((move) => (
              <li key={move.number}>
                <span className="move-number">{move.number}.</span>
                <button
                  aria-current={Number(move.white?.sequence) === ply ? 'step' : undefined}
                  className={
                    Number(move.white?.sequence) === ply ? 'last-move current-replay-move' : ''
                  }
                  onClick={() => setPly(move.white!.sequence)}
                  ref={Number(move.white?.sequence) === ply ? currentMoveRef : undefined}
                  type="button"
                >
                  {move.white?.san}
                </button>
                <button
                  aria-current={Number(move.black?.sequence) === ply ? 'step' : undefined}
                  className={
                    Number(move.black?.sequence) === ply ? 'last-move current-replay-move' : ''
                  }
                  disabled={!move.black}
                  onClick={() => setPly(move.black!.sequence)}
                  ref={Number(move.black?.sequence) === ply ? currentMoveRef : undefined}
                  type="button"
                >
                  {move.black?.san ?? '—'}
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
}
