const readinessUrl = process.env.API_INTERNAL_URL ?? 'http://server:3000/ready';

export async function isApplicationReady(): Promise<boolean> {
  try {
    const response = await fetch(readinessUrl, {
      signal: AbortSignal.timeout(5_000),
    });

    return response.ok;
  } catch {
    return false;
  }
}
