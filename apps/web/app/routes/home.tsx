import { FormEvent, useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

type PlayerIntent = 'create' | 'browse' | null;
const boardSquares = Array.from({ length: 64 }, (_, index) => index);

function readPlayerIntent(search: string): PlayerIntent {
  const intent = new URLSearchParams(search).get('intent');
  return intent === 'create' || intent === 'browse' ? intent : null;
}

function buildHomeHref(intent: PlayerIntent, search: string): string {
  const parameters = new URLSearchParams(search);

  if (intent) {
    parameters.set('intent', intent);
  } else {
    parameters.delete('intent');
  }

  const query = parameters.toString();
  return query ? `?${query}` : '/';
}

export default function Home() {
  const { t } = useTranslation();
  const location = useLocation();
  const intent = readPlayerIntent(location.search);
  const [visibleName, setVisibleName] = useState('');
  const [nameError, setNameError] = useState(false);
  const handleNameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError(visibleName.trim().length === 0);
  };

  return (
    <main id="main-content" className="home-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span aria-hidden="true">✦</span> {t('eyebrow')}
          </p>
          <h1 id="hero-title">{t('heroTitle')}</h1>
          <p className="hero-description">{t('heroDescription')}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={buildHomeHref('create', location.search)}>
              <span aria-hidden="true">+</span>
              {t('createGame')}
            </a>
            <a className="button button-secondary" href={buildHomeHref('browse', location.search)}>
              <span aria-hidden="true">⌕</span>
              {t('browseGames')}
            </a>
          </div>
          <p className="prototype-notice">{t('prototypeNotice')}</p>
        </div>
        <div className="board-area">
          <div className="board-orbit board-orbit-one" aria-hidden="true" />
          <div className="board-orbit board-orbit-two" aria-hidden="true" />
          <figure className="board-figure">
            <div className="board" role="img" aria-label={t('boardLabel')}>
              {boardSquares.map((square) => (
                <span
                  key={square}
                  className={
                    (Math.floor(square / 8) + (square % 8)) % 2 === 0
                      ? 'square square-light'
                      : 'square square-dark'
                  }
                >
                  {square === 11 ? <span className="chess-piece chess-piece-light">♘</span> : null}
                  {square === 28 ? <span className="chess-piece chess-piece-dark">♟</span> : null}
                  {square === 52 ? <span className="chess-piece chess-piece-light">♙</span> : null}
                </span>
              ))}
            </div>
            <figcaption>{t('boardCaption')}</figcaption>
          </figure>
          <aside className="open-tables-card">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <strong>{t('openTables')}</strong>
              <p>{t('openTablesDescription')}</p>
            </div>
          </aside>
        </div>
      </section>
      <section className="learning-card" aria-labelledby="learning-title">
        <div className="learning-icon" aria-hidden="true">
          ♜
        </div>
        <div>
          <p className="card-kicker">{t('learningStatus')}</p>
          <h2 id="learning-title">{t('learningTitle')}</h2>
          <p>{t('learningDescription')}</p>
        </div>
        <span className="card-arrow" aria-hidden="true">
          ↗
        </span>
      </section>
      {intent ? (
        <div className="dialog-backdrop" role="presentation">
          <section
            aria-describedby="name-dialog-description"
            aria-labelledby="name-dialog-title"
            aria-modal="true"
            className="name-dialog"
            role="dialog"
          >
            <a
              className="dialog-close"
              href={buildHomeHref(null, location.search)}
              aria-label={t('cancel')}
            >
              ×
            </a>
            <p className="dialog-symbol" aria-hidden="true">
              ♞
            </p>
            <h2 id="name-dialog-title">{t('nameDialogTitle')}</h2>
            <p id="name-dialog-description">{t('nameDialogDescription')}</p>
            <form onSubmit={handleNameSubmit}>
              <label htmlFor="visible-name">{t('nameLabel')}</label>
              <input
                aria-describedby={nameError ? 'visible-name-error' : undefined}
                aria-invalid={nameError}
                autoFocus
                id="visible-name"
                maxLength={32}
                onChange={(event) => setVisibleName(event.target.value)}
                placeholder={t('namePlaceholder')}
                required
                value={visibleName}
              />
              {nameError ? (
                <p id="visible-name-error" className="field-error">
                  {t('nameRequired')}
                </p>
              ) : null}
              <div className="dialog-actions">
                <a className="button button-quiet" href={buildHomeHref(null, location.search)}>
                  {t('cancel')}
                </a>
                <button className="button button-primary" type="submit">
                  {intent === 'create'
                    ? t('createGameWithName', { name: visibleName || '…' })
                    : t('browseGamesWithName', { name: visibleName || '…' })}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
