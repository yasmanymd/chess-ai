import { useEffect, useState } from 'react';
import {
  Links,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useRouteError,
} from 'react-router';
import { useTranslation } from 'react-i18next';
import i18n, { languageLabels, supportedLanguages, type SupportedLanguage } from './i18n.js';
import { isApplicationReady } from './readiness.server.js';
import './styles.css';

export async function loader() {
  return { applicationReady: await isApplicationReady() };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { applicationReady } = useLoaderData<typeof loader>();
  const location = useLocation();
  const isGameRoute = location.pathname.startsWith('/games/');
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [connectionUnavailable, setConnectionUnavailable] = useState(!applicationReady);
  const requestedLanguage = new URLSearchParams(location.search).get('lang');
  const requestedSupportedLanguage = supportedLanguages.includes(
    requestedLanguage as SupportedLanguage,
  )
    ? (requestedLanguage as SupportedLanguage)
    : undefined;
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>(
    requestedSupportedLanguage ?? 'en',
  );

  if (
    (requestedSupportedLanguage || typeof window === 'undefined') &&
    i18n.resolvedLanguage !== activeLanguage
  ) {
    void i18n.changeLanguage(activeLanguage);
  }

  useEffect(() => {
    setIsEnhanced(true);

    if (requestedSupportedLanguage) {
      window.localStorage.setItem('i18nextLng', requestedSupportedLanguage);
      return;
    }

    const persistedLanguage = window.localStorage.getItem('i18nextLng');
    if (supportedLanguages.includes(persistedLanguage as SupportedLanguage)) {
      const nextLanguage = persistedLanguage as SupportedLanguage;
      if (nextLanguage !== activeLanguage) {
        void i18n.changeLanguage(nextLanguage);
        setActiveLanguage(nextLanguage);
      }
    }
  }, [activeLanguage, requestedSupportedLanguage]);

  useEffect(() => {
    let active = true;

    const checkReadiness = async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5_000);

      try {
        const response = await fetch('/api/ready', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Readiness request failed.');
        }
        if (active) {
          setConnectionUnavailable(false);
        }
      } catch {
        if (active) {
          setConnectionUnavailable(true);
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };

    void checkReadiness();
    const interval = window.setInterval(() => void checkReadiness(), 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <html lang={i18n.resolvedLanguage ?? 'en'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f5f1e9" />
        {isGameRoute ? (
          <noscript>
            <meta httpEquiv="refresh" content="10" />
          </noscript>
        ) : null}
        <title>{t('title')}</title>
        <Links />
      </head>
      <body data-enhanced={isEnhanced ? 'true' : 'false'}>
        {connectionUnavailable ? (
          <p className="connection-notice" role="status">
            {t('connectionUnavailable')}
          </p>
        ) : null}
        <header className="site-header">
          <a className="brand" href="#main-content" aria-label={t('title')}>
            <span className="brand-mark" aria-hidden="true">
              ♞
            </span>
            <span>Chess AI</span>
          </a>
          <div className="header-controls">
            <a className="archive-nav" href={`/archive?lang=${activeLanguage}`}>
              {t('archiveNav')}
            </a>
            <a className="archive-nav" href={`/import?lang=${activeLanguage}`}>
              {t('importNav')}
            </a>
            <form action={location.pathname} className="language-selector" method="get">
              {new URLSearchParams(location.search).get('intent') ? (
                <input
                  name="intent"
                  type="hidden"
                  value={new URLSearchParams(location.search).get('intent')!}
                />
              ) : null}
              <label className="visually-hidden" htmlFor="language">
                {t('localeLabel')}
              </label>
              <select
                id="language"
                name="lang"
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
                value={activeLanguage}
              >
                {supportedLanguages.map((language) => (
                  <option key={language} value={language}>
                    {languageLabels[language as SupportedLanguage]}
                  </option>
                ))}
              </select>
              <button className="language-apply" type="submit">
                {t('applyLanguage')}
              </button>
            </form>
            <button className="theme-control" type="button" disabled title={t('themeComingSoon')}>
              <span aria-hidden="true">◐</span>
              <span>{t('currentTheme')}</span>
            </button>
          </div>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const { t } = useTranslation();
  const translated = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };
  const error = useRouteError();
  const reference =
    typeof error === 'object' && error !== null && 'status' in error
      ? `HTTP-${String(error.status)}`
      : 'UNEXPECTED';

  return (
    <main className="error-page" id="main-content">
      <p className="eyebrow">
        <span aria-hidden="true">✦</span> {translated('errorEyebrow', 'A safe place to return to')}
      </p>
      <h1>{translated('errorTitle', 'This page is unavailable.')}</h1>
      <p>
        {translated(
          'errorDescription',
          'The page may have moved, or something unexpected happened. Your game data is safe.',
        )}
      </p>
      <p className="error-reference">
        {translated('errorReferenceLabel', 'Reference')}: <code>{reference}</code>
      </p>
      <a className="button button-primary" href="/">
        {translated('returnHome', 'Return to home')}
      </a>
    </main>
  );
}
