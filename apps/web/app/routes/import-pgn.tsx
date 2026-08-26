import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';

type ImportedGame = {
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
type ImportResponse = { game?: ImportedGame; error?: { code?: string } };

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

function formatPlayerName(name: string) {
  return name.replace(/,\s*/g, ', ');
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const response = await fetch('http://server:3000/chess-interchange/import-pgn', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pgn: form.get('pgn') }),
  });
  return (await response.json()) as ImportResponse;
}

export default function ImportPgn() {
  const { t } = useTranslation();
  const fetcher = useFetcher<typeof action>();
  const [pgn, setPgn] = useState('');
  const [game, setGame] = useState<ImportedGame | null>(null);
  const [ply, setPly] = useState(0);
  const [playing, setPlaying] = useState(false);
  const currentMoveRef = useRef<HTMLButtonElement>(null);
  const response = fetcher.data as ImportResponse | undefined;
  const fen = game ? (ply === 0 ? game.initialFen : game.moves[ply - 1]!.fenAfter) : '';
  const pieces = useMemo(() => (fen ? piecesFromFen(fen) : {}), [fen]);

  useEffect(() => {
    if (response?.game) {
      setGame(response.game);
      setPly(0);
      setPlaying(false);
    }
  }, [response?.game]);
  useEffect(() => {
    if (!playing || !game) return undefined;
    if (ply >= game.moves.length) {
      setPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setPly((current) => current + 1), 800);
    return () => window.clearTimeout(timer);
  }, [game, playing, ply]);
  useEffect(() => {
    currentMoveRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [ply]);

  const selectFile = async (file: File | undefined) => {
    if (file) setPgn(await file.text());
  };

  if (!game) {
    return (
      <main className="import-page" id="main-content">
        <p className="eyebrow">
          <span aria-hidden="true">✦</span> {t('importEyebrow')}
        </p>
        <h1>{t('importTitle')}</h1>
        <p className="import-description">{t('importDescription')}</p>
        <fetcher.Form className="import-form" method="post">
          <label>
            <span>{t('importPasteLabel')}</span>
            <textarea
              name="pgn"
              onChange={(event) => setPgn(event.currentTarget.value)}
              placeholder={t('importPlaceholder')}
              required
              rows={14}
              value={pgn}
            />
          </label>
          <label className="import-file-label">
            <span>{t('importFileLabel')}</span>
            <input
              accept=".pgn,application/x-chess-pgn,text/plain"
              onChange={(event) => void selectFile(event.currentTarget.files?.[0])}
              type="file"
            />
          </label>
          {response?.error?.code ? (
            <p className="field-error" role="alert">
              {t(`importError.${response.error.code}`)}
            </p>
          ) : null}
          <button
            className="button button-primary"
            disabled={fetcher.state !== 'idle'}
            type="submit"
          >
            {fetcher.state === 'idle' ? t('importReplay') : t('importing')}
          </button>
        </fetcher.Form>
        <p className="import-private-note">{t('importPrivateNote')}</p>
      </main>
    );
  }

  const lastMove = ply > 0 ? game.moves[ply - 1] : null;
  const whiteName = formatPlayerName(game.headers.White || t('white'));
  const blackName = formatPlayerName(game.headers.Black || t('black'));
  const gameTitle = game.headers.Event || `${whiteName} — ${blackName}`;
  const squares = Array.from(
    { length: 64 },
    (_, index) => `${files[index % 8]}${8 - Math.floor(index / 8)}`,
  );
  const currentMoveLabel = lastMove
    ? `${Math.ceil(lastMove.sequence / 2)}${lastMove.sequence % 2 === 0 ? '…' : '.'} ${lastMove.san}`
    : null;
  return (
    <main className="archive-game-page" id="main-content">
      <button className="text-link import-another" onClick={() => setGame(null)} type="button">
        ← {t('importAnother')}
      </button>
      <p className="eyebrow">
        <span aria-hidden="true">✦</span> {t('importReplayEyebrow')}
      </p>
      <h1>{gameTitle}</h1>
      <p className="import-game-players">
        {whiteName} <span aria-hidden="true">—</span> {blackName}
      </p>
      {game.headers.Site || game.headers.Date || game.headers.Round ? (
        <p className="import-game-details">
          {[game.headers.Site, game.headers.Date, game.headers.Round].filter(Boolean).join(' · ')}
        </p>
      ) : null}
      <p className="game-meta">{t('importPrivateNote')}</p>
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
        </div>
        <aside className="archive-replay-sidebar" aria-label={t('moveHistory')}>
          <div className="archive-player-row import-player-row">
            <span title={whiteName}>
              <i className="piece-color-indicator piece-color-light" />
              {whiteName}
            </span>
            <span title={blackName}>
              <i className="piece-color-indicator piece-color-dark" />
              {blackName}
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
