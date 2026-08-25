import { useEffect, useRef } from 'react';
import {
  redirect,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useRevalidator,
} from 'react-router';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';

type BoardGame = {
  id: string;
  time_control: string;
  status: 'active';
  current_fen: string;
  side_to_move: 'white' | 'black';
  version: number;
  white_identity_id: string;
  black_identity_id: string;
  whiteDisplayName: string;
  blackDisplayName: string;
};
type BoardMove = { sequence: number; from_square: string; to_square: string; san: string };
type LegalMove = { to: string };
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

function serverHeaders(request: Request): HeadersInit {
  return request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {};
}
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
function owns(piece: string | undefined, color: 'white' | 'black') {
  return (
    Boolean(piece) &&
    (color === 'white' ? piece === piece!.toUpperCase() : piece === piece!.toLowerCase())
  );
}
function renderPiece(piece: string | undefined) {
  if (!piece) return null;

  return <img alt="" aria-hidden="true" className="chess-piece" src={pieceAsset[piece]} />;
}
function renderSquareContents(piece: string | undefined, square: string, index: number) {
  const isFirstFile = index % 8 === 0;
  const isLastRank = Math.floor(index / 8) === 7;

  return (
    <>
      {renderPiece(piece)}
      {isFirstFile ? (
        <span aria-hidden="true" className="board-coordinate board-rank">
          {square[1]}
        </span>
      ) : null}
      {isLastRank ? (
        <span aria-hidden="true" className="board-coordinate board-file">
          {square[0]}
        </span>
      ) : null}
    </>
  );
}

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { gameId?: string };
}) {
  const headers = serverHeaders(request);
  const [identityResponse, gameResponse] = await Promise.all([
    fetch('http://server:3000/temporary-identities/me', { headers }),
    fetch(`http://server:3000/games/${params.gameId ?? ''}`, { headers }),
  ]);
  if (!identityResponse.ok || !gameResponse.ok) return redirect('/lobby');
  const identity = (await identityResponse.json()) as { identity: { id: string } };
  const payload = (await gameResponse.json()) as { game: BoardGame; moves: BoardMove[] };
  const selected = new URL(request.url).searchParams.get('selected');
  const color = payload.game.white_identity_id === identity.identity.id ? 'white' : 'black';
  const canMove = payload.game.status === 'active' && payload.game.side_to_move === color;
  const pieces = piecesFromFen(payload.game.current_fen);
  const selection =
    selected && /^[a-h][1-8]$/.test(selected) && canMove && owns(pieces[selected], color)
      ? selected
      : null;
  const destinations = selection
    ? await fetch(`http://server:3000/games/${payload.game.id}/legal-moves?from=${selection}`, {
        headers,
      }).then(async (response) =>
        response.ok ? ((await response.json()) as { moves: LegalMove[] }).moves : [],
      )
    : [];
  return { identity: identity.identity, ...payload, selection, destinations };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { gameId?: string };
}) {
  const form = await request.formData();
  const enhanced = form.get('_enhanced') === 'true';
  const response = await fetch(`http://server:3000/games/${params.gameId ?? ''}/moves`, {
    method: 'POST',
    headers: { ...serverHeaders(request), 'content-type': 'application/json' },
    body: JSON.stringify({
      commandId: crypto.randomUUID(),
      expectedVersion: Number(form.get('expectedVersion')),
      from: form.get('from'),
      to: form.get('to'),
    }),
  });
  if (response.ok) {
    if (enhanced) return { accepted: true as const };
    return redirect(`/games/${params.gameId ?? ''}#game-board`);
  }
  const payload = (await response.json().catch(() => null)) as { error?: { code?: string } } | null;
  const errorCode = payload?.error?.code ?? 'MOVE_FAILED';
  if (enhanced) return { accepted: false as const, errorCode };
  return redirect(
    `/games/${params.gameId ?? ''}?error=${encodeURIComponent(errorCode)}#game-board`,
  );
}

export default function Game() {
  const { t } = useTranslation();
  const { game, identity, moves, selection, destinations } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const moveFetcher = useFetcher<typeof action>();
  const historyRef = useRef<HTMLOListElement>(null);
  const revalidatorRef = useRef(revalidator);
  const handledMoveResponseRef = useRef<typeof moveFetcher.data>(undefined);
  const refreshPendingRef = useRef(false);
  const query = new URLSearchParams(location.search);
  const moveError =
    query.get('error') ??
    (moveFetcher.data && !moveFetcher.data.accepted ? moveFetcher.data.errorCode : undefined);
  const color = game.white_identity_id === identity.id ? 'white' : 'black';
  const canMove = game.status === 'active' && game.side_to_move === color;
  const pieces = piecesFromFen(game.current_fen);
  const squaresFromWhitePerspective = Array.from(
    { length: 64 },
    (_, index) => `${files[index % 8]}${8 - Math.floor(index / 8)}`,
  );
  const squares =
    color === 'white' ? squaresFromWhitePerspective : squaresFromWhitePerspective.reverse();
  const lastMove = moves.at(-1);
  const movePairs = Array.from({ length: Math.ceil(moves.length / 2) }, (_, index) => ({
    number: index + 1,
    white: moves[index * 2]?.san,
    black: moves[index * 2 + 1]?.san,
  }));

  useEffect(() => {
    revalidatorRef.current = revalidator;
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (revalidatorRef.current.state === 'idle') {
        revalidatorRef.current.revalidate();
      } else {
        refreshPendingRef.current = true;
      }
    }, 5_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = io({
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    const refreshGame = (event: { gameId?: string }) => {
      if (event.gameId !== game.id) return;

      if (revalidatorRef.current.state === 'idle') {
        revalidatorRef.current.revalidate();
      } else {
        refreshPendingRef.current = true;
      }
    };

    socket.on('game.updated', refreshGame);
    return () => {
      socket.disconnect();
    };
  }, [game.id]);

  useEffect(() => {
    if (revalidator.state === 'idle' && refreshPendingRef.current) {
      refreshPendingRef.current = false;
      revalidator.revalidate();
    }
  }, [revalidator.revalidate, revalidator.state]);

  useEffect(() => {
    if (
      moveFetcher.state === 'idle' &&
      moveFetcher.data?.accepted &&
      handledMoveResponseRef.current !== moveFetcher.data
    ) {
      handledMoveResponseRef.current = moveFetcher.data;
      revalidatorRef.current.revalidate();
    }
  }, [moveFetcher.data, moveFetcher.state]);

  useEffect(() => {
    historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight });
  }, [moves.length]);

  return (
    <main className="game-page" id="main-content">
      <p className="eyebrow">
        <span aria-hidden="true">✦</span> {t('gameReady')}
      </p>
      <h1>{t('yourGameIsReady')}</h1>
      {moveError ? (
        <p className="field-error" role="alert">
          {t(`moveError.${moveError}`)}
        </p>
      ) : null}
      <section className="game-layout" id="game-board">
        <div className="game-board-panel">
          <div className="match-board interactive-board" aria-label={t('boardLabel')} role="group">
            {squares.map((square, index) => {
              const piece = pieces[square];
              const destination = destinations.some((move) => move.to === square);
              const className = `square ${(Math.floor(index / 8) + (index % 8)) % 2 === 0 ? 'square-light' : 'square-dark'}${lastMove?.from_square === square ? ' square-last-from' : ''}${lastMove?.to_square === square ? ' square-last-to' : ''}${selection === square ? ' square-selected' : ''}${destination ? ' square-destination' : ''}`;
              if (destination && selection)
                return (
                  <form
                    className={className}
                    key={square}
                    method="post"
                    onSubmit={(event) => {
                      event.preventDefault();
                      moveFetcher.submit(
                        {
                          _enhanced: 'true',
                          expectedVersion: String(game.version),
                          from: selection,
                          to: square,
                        },
                        { method: 'post' },
                      );
                    }}
                  >
                    <input name="expectedVersion" type="hidden" value={game.version} />
                    <input name="from" type="hidden" value={selection} />
                    <input name="to" type="hidden" value={square} />
                    <button aria-label={`${selection} to ${square}`} type="submit">
                      {renderSquareContents(piece, square, index)}
                    </button>
                  </form>
                );
              if (canMove && owns(piece, color))
                return (
                  <a
                    aria-label={`Select ${square}`}
                    className={className}
                    href={`/games/${game.id}?selected=${square}#game-board`}
                    key={square}
                    onClick={(event) => {
                      event.preventDefault();
                      void navigate(`/games/${game.id}?selected=${square}#game-board`, {
                        preventScrollReset: true,
                      });
                    }}
                  >
                    {renderSquareContents(piece, square, index)}
                  </a>
                );
              return (
                <span className={className} key={square}>
                  {renderSquareContents(piece, square, index)}
                </span>
              );
            })}
          </div>
        </div>
        <aside className="game-sidebar" aria-label={t('moveHistory')}>
          <section className="move-history" aria-label={t('moveHistory')}>
            <div className="move-history-players">
              <span aria-hidden="true" />
              <div
                className={`move-history-player${game.side_to_move === 'white' ? ' is-active' : ''}`}
              >
                <span className="player-color">
                  <i aria-hidden="true" className="piece-color-indicator piece-color-light" />
                  {t('white')}
                </span>
                <div className="player-name-row">
                  <strong>{game.whiteDisplayName}</strong>
                  {color === 'white' ? <span className="you-indicator">{t('you')}</span> : null}
                  {game.side_to_move === 'white' ? (
                    <span className="turn-indicator">
                      {color === 'white' ? t('yourTurn') : t('opponentTurn')}
                    </span>
                  ) : null}
                </div>
              </div>
              <div
                className={`move-history-player${game.side_to_move === 'black' ? ' is-active' : ''}`}
              >
                <span className="player-color">
                  <i aria-hidden="true" className="piece-color-indicator piece-color-dark" />
                  {t('black')}
                </span>
                <div className="player-name-row">
                  <strong>{game.blackDisplayName}</strong>
                  {color === 'black' ? <span className="you-indicator">{t('you')}</span> : null}
                  {game.side_to_move === 'black' ? (
                    <span className="turn-indicator">
                      {color === 'black' ? t('yourTurn') : t('opponentTurn')}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            {moves.length ? (
              <ol className="move-history-list" ref={historyRef}>
                {movePairs.map((move) => (
                  <li key={move.number}>
                    <span className="move-number">{move.number}.</span>
                    <span className={lastMove?.sequence === move.number * 2 - 1 ? 'last-move' : ''}>
                      {move.white}
                    </span>
                    <span className={lastMove?.sequence === move.number * 2 ? 'last-move' : ''}>
                      {move.black ?? '—'}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{t('noMovesYet')}</p>
            )}
          </section>
        </aside>
      </section>
      <p className="game-note">{t('confirmedBoardNote')}</p>
    </main>
  );
}
