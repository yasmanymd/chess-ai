import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route('api/ready', './routes/api.ready.ts'),
  route('identity', './routes/identity.ts'),
  route('lobby', './routes/lobby.tsx'),
  route('games/:gameId', './routes/game.tsx'),
  route('archive', './routes/archive.tsx'),
  route('import', './routes/import-pgn.tsx'),
  route('archive/games/:gameId', './routes/archive-game.tsx'),
  route('archive/games/:gameId/pgn', './routes/archive-game-pgn.ts'),
  index('./routes/home.tsx'),
] satisfies RouteConfig;
