type RateLimitRule = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

const identityRule: RateLimitRule = {
  key: 'identity',
  limit: 10,
  windowMs: 60_000,
};
const gameRule: RateLimitRule = {
  key: 'game',
  limit: 60,
  windowMs: 60_000,
};

export function ruleForRequest(method: string, url: string): RateLimitRule | undefined {
  if (
    method === 'POST' &&
    (url === '/temporary-identities' || url === '/temporary-identities/recover')
  ) {
    return identityRule;
  }
  if (
    method === 'POST' &&
    (/^\/lobby\/waiting-games\/[\w-]+\/join$/.test(url) ||
      /^\/games\/[\w-]+\/(moves|actions)$/.test(url))
  ) {
    return gameRule;
  }
  return undefined;
}

/**
 * Process-local limiter for the single-instance reference topology. Replace with a
 * shared store before horizontal API scaling.
 */
export function createRateLimiter() {
  const attempts = new Map<string, number[]>();

  return (clientKey: string, rule: RateLimitRule, now = Date.now()): RateLimitResult => {
    const key = `${rule.key}:${clientKey}`;
    const windowStart = now - rule.windowMs;
    const recent = (attempts.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

    if (recent.length >= rule.limit) {
      attempts.set(key, recent);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + rule.windowMs - now) / 1_000)),
      };
    }

    recent.push(now);
    attempts.set(key, recent);
    return { allowed: true };
  };
}
