import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

type ArchivedGame = {
  id: string;
  whiteDisplayName: string;
  blackDisplayName: string;
  timeControl: string;
  result: 'white_win' | 'black_win' | 'draw';
  terminationReason: string;
  completedAt: string;
};

const timeControls = ['none', 'rapid_10_0', 'blitz_5_3'] as const;

function archiveUrl(search: URLSearchParams, changes: Record<string, string | undefined>) {
  const next = new URLSearchParams(search);
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return `/archive?${next.toString()}`;
}

export async function loader({ request }: { request: Request }) {
  const search = new URL(request.url).searchParams;
  const response = await fetch(`http://server:3000/archive/games?${search.toString()}`);
  if (!response.ok) throw new Response('Archive unavailable', { status: response.status });
  return {
    ...((await response.json()) as { games: ArchivedGame[]; nextOffset: number | null }),
    search: Object.fromEntries(search),
  };
}

export default function Archive() {
  const { t } = useTranslation();
  const { games, nextOffset, search } = useLoaderData<typeof loader>();
  const searchParams = new URLSearchParams(search);
  const currentLanguage = search.lang ?? 'en';
  const resultLabel = (result: ArchivedGame['result']) => t(`archiveResult.${result}`);

  return (
    <main className="archive-page" id="main-content">
      <div className="archive-intro">
        <p className="eyebrow">
          <span aria-hidden="true">✦</span> {t('archiveEyebrow')}
        </p>
        <h1>{t('archiveTitle')}</h1>
        <p>{t('archiveDescription')}</p>
      </div>
      <form className="archive-filters" method="get">
        <input name="lang" type="hidden" value={currentLanguage} />
        <label>
          <span>{t('archivePlayer')}</span>
          <input defaultValue={search.player ?? ''} name="player" type="search" />
        </label>
        <label>
          <span>{t('archiveResult')}</span>
          <select defaultValue={search.result ?? ''} name="result">
            <option value="">{t('archiveAllResults')}</option>
            <option value="white_win">{t('archiveResult.white_win')}</option>
            <option value="black_win">{t('archiveResult.black_win')}</option>
            <option value="draw">{t('archiveResult.draw')}</option>
          </select>
        </label>
        <label>
          <span>{t('timeControl')}</span>
          <select defaultValue={search.timeControl ?? ''} name="timeControl">
            <option value="">{t('archiveAllTimeControls')}</option>
            {timeControls.map((timeControl) => (
              <option key={timeControl} value={timeControl}>
                {t(
                  timeControl === 'none'
                    ? 'noClock'
                    : timeControl === 'rapid_10_0'
                      ? 'rapid'
                      : 'blitz',
                )}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t('archiveFrom')}</span>
          <input defaultValue={search.from ?? ''} name="from" type="date" />
        </label>
        <label>
          <span>{t('archiveTo')}</span>
          <input defaultValue={search.to ?? ''} name="to" type="date" />
        </label>
        <button className="button button-secondary" type="submit">
          {t('archiveApplyFilters')}
        </button>
      </form>
      {games.length ? (
        <ol className="archive-list">
          {games.map((game) => (
            <li key={game.id}>
              <a href={`/archive/games/${game.id}?lang=${currentLanguage}`}>
                <span className="archive-players">
                  <strong>{game.whiteDisplayName}</strong>
                  <span aria-hidden="true">—</span>
                  <strong>{game.blackDisplayName}</strong>
                </span>
                <span className="archive-game-meta">
                  {resultLabel(game.result)} ·{' '}
                  {t(
                    game.timeControl === 'none'
                      ? 'noClock'
                      : game.timeControl === 'rapid_10_0'
                        ? 'rapid'
                        : 'blitz',
                  )}
                </span>
                <time dateTime={game.completedAt}>
                  {new Date(game.completedAt).toLocaleDateString()}
                </time>
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className="archive-empty">{t('archiveEmpty')}</p>
      )}
      {nextOffset !== null ? (
        <a
          className="button button-secondary archive-more"
          href={archiveUrl(searchParams, { offset: String(nextOffset) })}
        >
          {t('archiveLoadMore')}
        </a>
      ) : null}
    </main>
  );
}
