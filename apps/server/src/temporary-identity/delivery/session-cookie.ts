const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? 'chess_ai_session';
const sessionCookieSecure = process.env.SESSION_COOKIE_SECURE !== 'false';

export function buildTemporarySessionCookie(credential: string): string {
  return [
    `${sessionCookieName}=${encodeURIComponent(credential)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    ...(sessionCookieSecure ? ['Secure'] : []),
  ].join('; ');
}

export function readTemporarySessionCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const prefix = `${sessionCookieName}=`;
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined;
}
