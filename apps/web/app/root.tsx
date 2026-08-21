import { useEffect, useState } from 'react';
import { Links, Outlet, Scripts, ScrollRestoration, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import i18n, { languageLabels, supportedLanguages, type SupportedLanguage } from './i18n.js';
import './styles.css';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isEnhanced, setIsEnhanced] = useState(false);
  const requestedLanguage = new URLSearchParams(location.search).get('lang');
  const activeLanguage = supportedLanguages.includes(requestedLanguage as SupportedLanguage)
    ? (requestedLanguage as SupportedLanguage)
    : 'en';

  if (i18n.resolvedLanguage !== activeLanguage) {
    void i18n.changeLanguage(activeLanguage);
  }

  useEffect(() => {
    setIsEnhanced(true);
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
                defaultValue={activeLanguage}
                id="language"
                name="lang"
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
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
