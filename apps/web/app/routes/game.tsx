import { redirect, useLoaderData } from 'react-router';
import { useTranslation } from 'react-i18next';

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { gameId?: string };
}) {
  const cookie = request.headers.get('cookie');
  const response = await fetch(`http://server:3000/games/${params.gameId ?? ''}`, {
    headers: cookie ? { cookie } : {},
  });
  if (!response.ok) return redirect('/lobby');
  return (await response.json()) as {
    game: { time_control: string; whiteDisplayName: string; blackDisplayName: string };
  };
}
export default function Game() {
  const { t } = useTranslation();
  const { game } = useLoaderData<typeof loader>();
  const squares = Array.from({ length: 64 }, (_, index) => index);
  return (
    <main className="game-page" id="main-content">
      <p className="eyebrow">
        <span aria-hidden="true">✦</span> {t('gameReady')}
      </p>
      <h1>{t('yourGameIsReady')}</h1>
      <p className="game-meta">
        {t(game.time_control)} · {t('boardWaiting')}
      </p>
      <section className="game-layout">
        <div className="player-card player-card-dark">
          <span>{t('black')}</span>
          <strong>{game.blackDisplayName}</strong>
        </div>
        <div className="match-board" role="img" aria-label={t('boardLabel')}>
          {squares.map((square) => (
            <span
              className={
                (Math.floor(square / 8) + (square % 8)) % 2 === 0
                  ? 'square square-light'
                  : 'square square-dark'
              }
              key={square}
            />
          ))}
        </div>
        <div className="player-card">
          <span>{t('white')}</span>
          <strong>{game.whiteDisplayName}</strong>
        </div>
      </section>
      <p className="game-note">{t('gameBoardNote')}</p>
    </main>
  );
}
