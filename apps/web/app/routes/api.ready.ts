const readinessUrl = process.env.API_INTERNAL_URL ?? 'http://server:3000/ready';

export async function loader() {
  try {
    const response = await fetch(readinessUrl, {
      signal: AbortSignal.timeout(5_000),
    });

    return new Response(null, {
      status: response.ok ? 204 : 503,
      headers: { 'cache-control': 'no-store' },
    });
  } catch {
    return new Response(null, {
      status: 503,
      headers: { 'cache-control': 'no-store' },
    });
  }
}
