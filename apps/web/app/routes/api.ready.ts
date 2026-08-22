import { isApplicationReady } from '../readiness.server.js';

export async function loader() {
  return new Response(null, {
    status: (await isApplicationReady()) ? 204 : 503,
    headers: { 'cache-control': 'no-store' },
  });
}
