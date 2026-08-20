import { Outlet, Scripts, ScrollRestoration } from 'react-router';
import { useTranslation } from 'react-i18next';
import i18n, { languageLabels, supportedLanguages, type SupportedLanguage } from './i18n.js';
import './styles.css';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <html lang={i18n.resolvedLanguage ?? 'en'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{t('title')}</title>
      </head>
      <body>
        <header className="site-header">
          <label>
            <span className="visually-hidden">{t('localeLabel')}</span>
            <select
              aria-label={t('localeLabel')}
              onChange={(event) => void i18n.changeLanguage(event.target.value)}
              value={i18n.resolvedLanguage ?? 'en'}
            >
              {supportedLanguages.map((language) => (
                <option key={language} value={language}>
                  {languageLabels[language as SupportedLanguage]}
                </option>
              ))}
            </select>
          </label>
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
