import { useEffect } from 'react';
import { redirect, useLoaderData, useLocation, useRevalidator } from 'react-router';
import { useTranslation } from 'react-i18next';

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
type BoardMove = { sequence: number; san: string };
type LegalMove = { to: string };
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const glyph: Record<string, string> = {
  P: '♙',
  N: '♘',
  B: '♗',
  R: '♖',
  Q: '♕',
  K: '♔',
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
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
  if (response.ok) return redirect(`/games/${params.gameId ?? ''}`);
  const payload = (await response.json().catch(() => null)) as { error?: { code?: string } } | null;
  return redirect(
    `/games/${params.gameId ?? ''}?error=${encodeURIComponent(payload?.error?.code ?? 'MOVE_FAILED')}`,
  );
}

export default function Game() {
  const { t } = useTranslation();
  const { game, identity, moves, selection, destinations } = useLoaderData<typeof loader>();
  const location = useLocation();
  const revalidator = useRevalidator();
  const query = new URLSearchParams(location.search);
  const hasSelection = query.has('selected');
  const color = game.white_identity_id === identity.id ? 'white' : 'black';
  const canMove = game.status === 'active' && game.side_to_move === color;
  const pieces = piecesFromFen(game.current_fen);
  const squares = Array.from(
    { length: 64 },
    (_, index) => `${files[index % 8]}${8 - Math.floor(index / 8)}`,
  );
  const movePairs = Array.from({ length: Math.ceil(moves.length / 2) }, (_, index) => ({
    number: index + 1,
    white: moves[index * 2]?.san,
    black: moves[index * 2 + 1]?.san,
  }));

  useEffect(() => {
    if (hasSelection) return;

    const interval = window.setInterval(() => {
      if (revalidator.state === 'idle') revalidator.revalidate();
    }, 3_000);

    return () => window.clearInterval(interval);
  }, [hasSelection, revalidator]);

  return (
    <main className="game-page" id="main-content">
      <p className="eyebrow">
        <span aria-hidden="true">✦</span> {t('gameReady')}
      </p>
      <h1>{t('yourGameIsReady')}</h1>
      <p className="game-meta">
        {t(game.time_control === 'none' ? 'noClock' : game.time_control)} ·{' '}
        {t(game.side_to_move === color ? 'yourTurn' : 'opponentTurn')}
      </p>
      {query.get('error') ? (
        <p className="field-error" role="alert">
          {t(`moveError.${query.get('error')}`)}
        </p>
      ) : null}
      <section className="game-layout">
        <div className="game-board-panel">
          <div className="player-card player-card-dark">
            <span>{t('black')}</span>
            <strong>{game.blackDisplayName}</strong>
          </div>
          <div className="match-board interactive-board" aria-label={t('boardLabel')} role="group">
            {squares.map((square, index) => {
              const piece = pieces[square];
              const destination = destinations.some((move) => move.to === square);
              const className = `square ${(Math.floor(index / 8) + (index % 8)) % 2 === 0 ? 'square-light' : 'square-dark'}${selection === square ? ' square-selected' : ''}${destination ? ' square-destination' : ''}`;
              if (destination && selection)
                return (
                  <form className={className} key={square} method="post">
                    <input name="expectedVersion" type="hidden" value={game.version} />
                    <input name="from" type="hidden" value={selection} />
                    <input name="to" type="hidden" value={square} />
                    <button aria-label={`${selection} to ${square}`} type="submit">
                      {piece ? (
                        <span aria-hidden="true" className="chess-piece">
                          {glyph[piece]}
                        </span>
                      ) : null}
                    </button>
                  </form>
                );
              if (canMove && owns(piece, color))
                return (
                  <a
                    aria-label={`Select ${square}`}
                    className={className}
                    href={`?selected=${square}`}
                    key={square}
                  >
                    {piece ? (
                      <span aria-hidden="true" className="chess-piece">
                        {glyph[piece]}
                      </span>
                    ) : null}
                  </a>
                );
              return (
                <span className={className} key={square}>
                  {piece ? (
                    <span aria-hidden="true" className="chess-piece">
                      {glyph[piece]}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
          <div className="player-card">
            <span>{t('white')}</span>
            <strong>{game.whiteDisplayName}</strong>
          </div>
        </div>
      </section>
      <section className="move-history" aria-label={t('moveHistory')}>
        <h2>{t('moveHistory')}</h2>
        {moves.length ? (
          <ol className="move-history-list">
            {movePairs.map((move) => (
              <li key={move.number}>
                <span className="move-number">{move.number}.</span>
                <span>{move.white}</span>
                <span>{move.black ?? '—'}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p>{t('noMovesYet')}</p>
        )}
      </section>
      <p className="game-note">{t('confirmedBoardNote')}</p>
    </main>
  );
}
