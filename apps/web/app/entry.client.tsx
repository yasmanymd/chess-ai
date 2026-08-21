import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

// The public development preview must become interactive promptly on devices
// reached through the local network. Avoid deferring hydration behind a
// transition so touch events are available as soon as the client modules load.
hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
);
