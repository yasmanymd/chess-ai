import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import i18n, { i18nReady, supportedLanguages, type SupportedLanguage } from './i18n.js';

// The public development preview must become interactive promptly on devices
// reached through the local network. Wait until static translations are ready,
// then hydrate immediately so a slower mobile device never replaces visible
// copy with translation keys during startup.
void i18nReady.then(async () => {
  const requestedLanguage = new URL(window.location.href).searchParams.get('lang');
  if (supportedLanguages.includes(requestedLanguage as SupportedLanguage)) {
    await i18n.changeLanguage(requestedLanguage ?? undefined);
  }

  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
