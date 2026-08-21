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
import './styles.css';

export async function loader() {
  try {
    const response = await fetch(process.env.API_INTERNAL_URL ?? 'http://server:3000/ready', {
      signal: AbortSignal.timeout(5_000),
    });

    return { applicationReady: response.ok };
  } catch {
    return { applicationReady: false };
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { applicationReady } = useLoaderData<typeof loader>();
  const location = useLocation();
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
            <form action="/" className="language-selector" method="get">
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
  const error = useRouteError();
  const reference =
    typeof error === 'object' && error !== null && 'status' in error
      ? `HTTP-${String(error.status)}`
      : 'UNEXPECTED';

  return (
    <main className="error-page" id="main-content">
      <p className="eyebrow">
        <span aria-hidden="true">✦</span> {t('errorEyebrow')}
      </p>
      <h1>{t('errorTitle')}</h1>
      <p>{t('errorDescription')}</p>
      <p className="error-reference">
        {t('errorReferenceLabel')}: <code>{reference}</code>
      </p>
      <a className="button button-primary" href="/">
        {t('returnHome')}
      </a>
    </main>
  );
}
