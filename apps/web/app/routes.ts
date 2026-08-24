import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route('api/ready', './routes/api.ready.ts'),
  route('identity', './routes/identity.ts'),
  route('lobby', './routes/lobby.tsx'),
  route('games/:gameId', './routes/game.tsx'),
  index('./routes/home.tsx'),
] satisfies RouteConfig;
