import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route('api/ready', './routes/api.ready.ts'),
  index('./routes/home.tsx'),
] satisfies RouteConfig;
