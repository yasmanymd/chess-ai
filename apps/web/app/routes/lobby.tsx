import { useEffect, useRef } from 'react';
import { redirect, useLoaderData, useRevalidator } from 'react-router';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import { getCurrentActiveGame } from '../api.client.js';

type WaitingGame = {
  id: string;
  title: string;
  creatorDisplayName: string;
  time_control: 'none' | 'rapid_10_0' | 'blitz_5_3';
};
function serverHeaders(request: Request): HeadersInit {
  return request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {};
}

function readCookie(header: string | null, name: string): string | undefined {
  const item = header
    ?.split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : undefined;
}

async function errorRedirect(response: Response): Promise<Response> {
  const body = (await response.json().catch(() => null)) as { error?: { code?: string } } | null;
  const code = body?.error?.code ?? 'LOBBY_ACTION_FAILED';
  return redirect(`/lobby?error=${encodeURIComponent(code)}`);
}

export async function loader({ request }: { request: Request }) {
  const headers = serverHeaders(request);
  const [identityResponse, gamesResponse] = await Promise.all([
    fetch('http://server:3000/temporary-identities/me', { headers }),
    fetch('http://server:3000/lobby/waiting-games', { headers }),
  ]);
  if (!identityResponse.ok) return redirect('/');
  const identity = (await identityResponse.json()) as {
    identity: { id: string; displayName: string };
  };
  const lobby = (await gamesResponse.json()) as { games: WaitingGame[] };
  return {
    identity: identity.identity,
    games: lobby.games,
    recoveryCode: readCookie(request.headers.get('cookie'), 'chess_ai_recovery_notice'),
  };
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const headers = serverHeaders(request);
  if (form.get('_intent') === 'create') {
    const response = await fetch('http://server:3000/lobby/waiting-games', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({
        title: form.get('title'),
        timeControl: form.get('timeControl'),
        colorPreference: form.get('colorPreference'),
      }),
    });
    return redirect(
      response.ok
        ? '/lobby?notice=waiting-game-created'
        : '/lobby?error=waiting-game-create-failed',
    );
  }
  if (form.get('_intent') === 'join' && typeof form.get('gameId') === 'string') {
    const response = await fetch(
      `http://server:3000/lobby/waiting-games/${form.get('gameId') as string}/join`,
      { method: 'POST', headers },
    );
    if (response.ok) {
      const payload = (await response.json()) as { game: { id: string } };
      return redirect(`/games/${payload.game.id}`);
    }
    return errorRedirect(response);
  }
  if (form.get('_intent') === 'cancel' && typeof form.get('gameId') === 'string') {
    const response = await fetch(
      `http://server:3000/lobby/waiting-games/${form.get('gameId') as string}`,
      { method: 'DELETE', headers },
    );
    return response.ok ? redirect('/lobby?notice=waiting-game-cancelled') : errorRedirect(response);
  }
  return redirect('/lobby');
}

export default function Lobby() {
  const { t } = useTranslation();
  const { identity, games, recoveryCode } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const revalidatorRef = useRef(revalidator);
  const refreshPendingRef = useRef(false);
  const query = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const ownGame = games.find((game) => game.creatorDisplayName === identity.displayName);
  const visibleGames = games.filter((game) => game.creatorDisplayName !== identity.displayName);
  useEffect(() => {
    revalidatorRef.current = revalidator;
  });
  useEffect(() => {
    const refreshLobby = () => {
      if (revalidatorRef.current.state === 'idle') revalidatorRef.current.revalidate();
      else refreshPendingRef.current = true;
    };
    const socket = io({
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socket.on('lobby.changed', refreshLobby);
    socket.on('game.started', (event: { gameId?: string }) => {
      if (event.gameId) window.location.assign(`/games/${event.gameId}`);
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    if (revalidator.state === 'idle' && refreshPendingRef.current) {
      refreshPendingRef.current = false;
      revalidator.revalidate();
    }
  }, [revalidator.revalidate, revalidator.state]);
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (revalidatorRef.current.state === 'idle') revalidatorRef.current.revalidate();
      else refreshPendingRef.current = true;
    }, 10_000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    let mounted = true;
    const checkForMatch = async () => {
      const game = await getCurrentActiveGame();
      if (mounted && game) window.location.assign(`/games/${game.id}`);
    };
    const interval = window.setInterval(() => void checkForMatch(), 3_000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);
  return (
    <main className="lobby-page" id="main-content">
      <section className="lobby-intro">
        <p className="eyebrow">
          <span aria-hidden="true">✦</span> {t('lobbyEyebrow')}
        </p>
        <h1>{t('lobbyTitle')}</h1>
        <p>{t('lobbyDescription')}</p>
        <p className="identity-chip">
          <span aria-hidden="true">♞</span> {identity.displayName}
        </p>
      </section>
      {query.get('notice') ? (
        <p className="lobby-notice" role="status">
          {t(
            query.get('notice') === 'waiting-game-cancelled'
              ? 'waitingGameCancelled'
              : 'waitingGameCreated',
          )}
        </p>
      ) : null}
      {recoveryCode ? (
        <aside className="recovery-notice" role="status">
          <strong>{t('recoveryCodeTitle')}</strong>
          <p>{t('recoveryCodeDescription')}</p>
          <code>{recoveryCode}</code>
        </aside>
      ) : null}
      {query.get('error') ? (
        <p className="field-error" role="alert">
          {t(`lobbyError.${query.get('error')}`)}
        </p>
      ) : null}
      <div className="lobby-grid">
        <section className="lobby-card" aria-labelledby="create-game-title">
          <p className="card-kicker">{t('createGame')}</p>
          <h2 id="create-game-title">{ownGame ? t('yourOpenTable') : t('setYourTable')}</h2>
          {ownGame ? (
            <div className="own-game">
              <strong>{ownGame.title}</strong>
              <p>
                {t(ownGame.time_control)} · {t('waitingForOpponent')}
              </p>
              <form method="post">
                <input name="_intent" type="hidden" value="cancel" />
                <input name="gameId" type="hidden" value={ownGame.id} />
                <button className="button button-secondary" type="submit">
                  {t('cancelTable')}
                </button>
              </form>
            </div>
          ) : (
            <form method="post" className="lobby-form">
              <input name="_intent" type="hidden" value="create" />
              <label htmlFor="game-title">{t('gameTitle')}</label>
              <input
                id="game-title"
                name="title"
                maxLength={80}
                placeholder={t('gameTitlePlaceholder')}
              />
              <label htmlFor="time-control">{t('timeControl')}</label>
              <select defaultValue="none" id="time-control" name="timeControl">
                <option value="none">{t('noClock')}</option>
                <option value="rapid_10_0">{t('rapid')}</option>
                <option value="blitz_5_3">{t('blitz')}</option>
              </select>
              <label htmlFor="color-preference">{t('colorPreference')}</label>
              <select defaultValue="random" id="color-preference" name="colorPreference">
                <option value="random">{t('randomColor')}</option>
                <option value="white">{t('white')}</option>
                <option value="black">{t('black')}</option>
              </select>
              <button className="button button-primary" type="submit">
                {t('openTable')}
              </button>
            </form>
          )}
        </section>
        <section className="lobby-card lobby-games" aria-labelledby="open-games-title">
          <div className="lobby-card-heading">
            <div>
              <p className="card-kicker">{t('openTables')}</p>
              <h2 id="open-games-title">{t('joinAPlayer')}</h2>
            </div>
            <a className="text-link" href="/lobby">
              {t('refresh')}
            </a>
          </div>
          {visibleGames.length ? (
            <ul className="game-list">
              {visibleGames.map((game) => (
                <li className="game-card" key={game.id}>
                  <div>
                    <strong>{game.title}</strong>
                    <p>
                      {game.creatorDisplayName} · {t(game.time_control)}
                    </p>
                  </div>
                  <form method="post">
                    <input name="_intent" type="hidden" value="join" />
                    <input name="gameId" type="hidden" value={game.id} />
                    <button className="button button-secondary" type="submit">
                      {t('joinGame')}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-games">{t('noOpenGames')}</p>
          )}
        </section>
      </div>
    </main>
  );
}
