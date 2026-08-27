type RateLimitRule = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export type RateLimitConfiguration = {
  identityMaxPerMinute: number;
  gameMaxPerMinute: number;
};

export function ruleForRequest(
  method: string,
  url: string,
  configuration: RateLimitConfiguration,
): RateLimitRule | undefined {
  if (
    method === 'POST' &&
    (url === '/temporary-identities' || url === '/temporary-identities/recover')
  ) {
    return { key: 'identity', limit: configuration.identityMaxPerMinute, windowMs: 60_000 };
  }
  if (
    method === 'POST' &&
    (/^\/lobby\/waiting-games\/[\w-]+\/join$/.test(url) ||
      /^\/games\/[\w-]+\/(moves|actions)$/.test(url))
  ) {
    return { key: 'game', limit: configuration.gameMaxPerMinute, windowMs: 60_000 };
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
