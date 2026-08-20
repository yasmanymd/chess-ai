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

app.enableShutdownHooks();
app.getHttpAdapter().getInstance().addHook('onClose', async () => database.destroy());
await app.listen({ port, host: '0.0.0.0' });
logger.info({ port }, 'Server listening');
