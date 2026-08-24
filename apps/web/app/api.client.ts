function apiOrigin(): string {
  return `${window.location.protocol}//${window.location.hostname}:3000`;
}

export async function claimTemporaryIdentity(displayName: string) {
  const response = await fetch(`${apiOrigin()}/temporary-identities`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ displayName }),
  });

  if (response.ok) {
    return { accepted: true as const };
  }

  const body = (await response.json()) as { error?: { code?: string } };
  return { accepted: false as const, code: body.error?.code ?? 'TEMPORARY_IDENTITY_REQUIRED' };
}

export async function getWaitingGames() {
  const response = await fetch(`${apiOrigin()}/lobby/waiting-games`, { credentials: 'include' });
  return (await response.json()) as {
    games: Array<{
      id: string;
      title: string;
      creatorDisplayName: string;
      color_preference: string;
      time_control: string;
    }>;
  };
}

export async function createWaitingGame(input: {
  title: string;
  colorPreference: string;
  timeControl: string;
}) {
  const response = await fetch(`${apiOrigin()}/lobby/waiting-games`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return response.ok;
}

export async function getCurrentActiveGame(): Promise<{ id: string } | null> {
  const response = await fetch(`${apiOrigin()}/games/current`, { credentials: 'include' });
  if (!response.ok) return null;
  const payload = (await response.json()) as { game: { id: string } | null };
  return payload.game;
}
