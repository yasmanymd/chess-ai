import { z } from 'zod';

const booleanFromEnvironment = z.enum(['true', 'false']).optional();

const runtimeConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SERVER_PORT: z.coerce.number().int().positive().max(65535).default(3000),
  SESSION_COOKIE_NAME: z.string().min(1).default('chess_ai_session'),
  SESSION_COOKIE_SECURE: booleanFromEnvironment,
  TRUST_PROXY: booleanFromEnvironment,
  WEB_ORIGINS: z.string().min(1).default('http://localhost:5173,http://127.0.0.1:5173'),
});

export type RuntimeConfig = ReturnType<typeof readRuntimeConfig>;

export function readRuntimeConfig(environment = process.env) {
  const parsed = runtimeConfigSchema.parse(environment);
  const allowedWebOrigins = parsed.WEB_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    ...parsed,
    allowedWebOrigins,
    sessionCookieSecure:
      parsed.SESSION_COOKIE_SECURE === 'true' ||
      (parsed.SESSION_COOKIE_SECURE === undefined && parsed.NODE_ENV === 'production'),
    trustProxy:
      parsed.TRUST_PROXY === 'true' ||
      (parsed.TRUST_PROXY === undefined && parsed.NODE_ENV === 'production'),
  };
}

export function isAllowedWebOrigin(origin: string | undefined, config: RuntimeConfig): boolean {
  return !origin || config.allowedWebOrigins.includes(origin);
}
