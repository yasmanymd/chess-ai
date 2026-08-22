import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import pino from 'pino';
import { AppModule } from './app.module.js';
import { createDatabase, verifyDatabase } from './infrastructure/database/database.js';

const port = Number(process.env.SERVER_PORT ?? 3000);
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required.');
}

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const database = createDatabase(connectionString);
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
  logger: false,
});
const fastify = app.getHttpAdapter().getInstance();

fastify.addHook(
  'onRequest',
  async (request: { id: string }, reply: { header: (name: string, value: string) => void }) => {
    reply.header('x-request-id', request.id);
  },
);

fastify.addHook('onResponse', async (request, reply) => {
  const context = {
    requestId: request.id,
    method: request.method,
    route: request.routeOptions.url ?? 'unmatched',
    statusCode: reply.statusCode,
    durationMs: Math.round(reply.elapsedTime),
  };

  if (reply.statusCode >= 500) {
    logger.error(context, 'HTTP request completed');
  } else if (reply.statusCode >= 400) {
    logger.warn(context, 'HTTP request completed');
  } else {
    logger.info(context, 'HTTP request completed');
  }
});

fastify.get('/health', async () => ({ status: 'ok' }));
fastify.get('/ready', async (_request: unknown, reply: { code: (status: number) => unknown }) => {
  try {
    await verifyDatabase(database);
    return { status: 'ready' };
  } catch (error) {
    logger.error({ error }, 'Readiness check failed');
    return reply.code(503);
  }
});
fastify.setErrorHandler(
  (
    error: Error,
    request: { id: string; method: string; url: string },
    reply: { code: (status: number) => { send: (payload: unknown) => unknown } },
  ) => {
    logger.error(
      { error, requestId: request.id, method: request.method, url: request.url },
      'Unhandled request error',
    );
    return reply.code(500).send({ error: { code: 'INTERNAL_ERROR', requestId: request.id } });
  },
);

app.enableShutdownHooks();
app
  .getHttpAdapter()
  .getInstance()
  .addHook('onClose', async () => database.destroy());
await app.listen({ port, host: '0.0.0.0' });
logger.info({ port }, 'Server listening');
