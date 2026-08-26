import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import pino from 'pino';
import { z } from 'zod';
import { AppModule } from './app.module.js';
import { submitAuthoritativeMove } from './game/application/submit-authoritative-move.js';
import { performGameAction } from './game/application/perform-game-action.js';
import { expireTimedOutGames } from './game/application/expire-timed-out-games.js';
import { dispatchPendingGameOutbox } from './game/application/dispatch-game-outbox.js';
import {
  listCompletedGameIdsForArchive,
  readCompletedGameForArchive,
} from './game/application/read-completed-game-for-archive.js';
import { ChessJsRulesAdapter } from './game/infrastructure/chess-js-rules-adapter.js';
import {
  backfillCompletedGames,
  projectCompletedGame,
} from './game-archive/application/project-completed-game.js';
import {
  listPublicArchivedGames,
  readPublicArchivedGame,
} from './game-archive/application/read-public-game-archive.js';
import { exportArchivedGameAsPgn } from './chess-interchange/application/export-archived-game-as-pgn.js';
import { importPgnForPrivateReplay } from './chess-interchange/application/import-pgn-for-private-replay.js';
import { BootstrapGateway } from './infrastructure/realtime/bootstrap.gateway.js';
import { createDatabase, verifyDatabase } from './infrastructure/database/database.js';
import { joinWaitingGame } from './lobby/join-waiting-game.js';
import { claimTemporaryIdentity } from './temporary-identity/application/claim-temporary-identity.js';
import { recoverTemporaryIdentity } from './temporary-identity/application/recover-temporary-identity.js';
import { resumeTemporaryIdentity } from './temporary-identity/application/resume-temporary-identity.js';
import {
  buildTemporarySessionCookie,
  readTemporarySessionCookie,
} from './temporary-identity/delivery/session-cookie.js';
import { isAllowedWebOrigin, readRuntimeConfig } from './infrastructure/config/runtime-config.js';
import { createRateLimiter, ruleForRequest } from './infrastructure/http/rate-limiter.js';

const config = readRuntimeConfig();
const logger = pino({ level: config.LOG_LEVEL });
const database = createDatabase(config.DATABASE_URL);
const chessRules = new ChessJsRulesAdapter();
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ trustProxy: config.trustProxy }),
  {
    logger: false,
  },
);
app.enableCors({
  credentials: true,
  origin: (origin, callback) => {
    if (isAllowedWebOrigin(origin, config)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed.'), false);
  },
});
const fastify = app.getHttpAdapter().getInstance();
const notifications = app.get(BootstrapGateway);
const limitRequest = createRateLimiter();
let outboxSweepInProgress = false;
async function flushGameOutbox() {
  if (outboxSweepInProgress) return;
  outboxSweepInProgress = true;
  try {
    await dispatchPendingGameOutbox(database, async (event) => {
      if (event.type === 'game.updated') {
        notifications.gameUpdated(event.recipientIdentityIds, event.gameId);
        return;
      }
      await projectCompletedGame(
        database,
        (gameId) => readCompletedGameForArchive(database, gameId),
        event.gameId,
      );
    });
  } catch (error) {
    logger.error({ error }, 'Game outbox dispatch failed');
  } finally {
    outboxSweepInProgress = false;
  }
}
const clockSweep = setInterval(async () => {
  try {
    await expireTimedOutGames(database);
    await flushGameOutbox();
  } catch (error) {
    logger.error({ error }, 'Clock expiry sweep failed');
  }
}, 1_000);
clockSweep.unref();
const outboxSweep = setInterval(() => void flushGameOutbox(), 500);
outboxSweep.unref();

fastify.addHook(
  'onRequest',
  async (
    request: { id: string; ip: string; method: string; url: string },
    reply: {
      code: (statusCode: number) => { send: (payload: unknown) => unknown };
      header: (name: string, value: string) => void;
    },
  ) => {
    reply.header('x-request-id', request.id);
    reply.header('x-content-type-options', 'nosniff');
    reply.header('x-frame-options', 'DENY');
    reply.header('referrer-policy', 'strict-origin-when-cross-origin');
    reply.header('cross-origin-opener-policy', 'same-origin');
    reply.header('permissions-policy', 'camera=(), geolocation=(), microphone=()');
    reply.header(
      'content-security-policy',
      "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    );
    if (config.sessionCookieSecure) {
      reply.header('strict-transport-security', 'max-age=31536000; includeSubDomains');
    }

    const rule = ruleForRequest(request.method, request.url);
    if (!rule) return;
    const result = limitRequest(request.ip, rule);
    if (!result.allowed) {
      reply.header('retry-after', String(result.retryAfterSeconds));
      return reply.code(429).send({ error: { code: 'RATE_LIMITED' } });
    }
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
fastify.post('/temporary-identities', async (request, reply) => {
  const body = request.body;
  const displayName =
    typeof body === 'object' &&
    body !== null &&
    'displayName' in body &&
    typeof body.displayName === 'string'
      ? body.displayName
      : '';
  const result = await claimTemporaryIdentity(database, displayName);

  if (!result.accepted) {
    return reply.code(400).send({ error: { code: result.code } });
  }

  reply.header('set-cookie', buildTemporarySessionCookie(result.sessionCredential));
  return reply.code(201).send({ identity: result.identity, recoveryCode: result.recoveryCode });
});
fastify.post('/temporary-identities/recover', async (request, reply) => {
  const body = request.body;
  const displayName =
    typeof body === 'object' &&
    body !== null &&
    'displayName' in body &&
    typeof body.displayName === 'string'
      ? body.displayName
      : '';
  const recoveryCode =
    typeof body === 'object' &&
    body !== null &&
    'recoveryCode' in body &&
    typeof body.recoveryCode === 'string'
      ? body.recoveryCode
      : '';
  const result = await recoverTemporaryIdentity(database, displayName, recoveryCode);

  if (!result.accepted) {
    return reply.code(400).send({ error: { code: result.code } });
  }

  reply.header('set-cookie', buildTemporarySessionCookie(result.sessionCredential));
  return { identity: result.identity };
});
fastify.get('/temporary-identities/me', async (request, reply) => {
  const identity = await resumeTemporaryIdentity(
    database,
    readTemporarySessionCookie(request.headers.cookie),
  );

  if (!identity) {
    return reply.code(401).send({ error: { code: 'TEMPORARY_IDENTITY_REQUIRED' } });
  }
  return { identity };
});
fastify.get('/lobby/waiting-games', async () => {
  const games = await database
    .selectFrom('waiting_games')
    .innerJoin(
      'temporary_identities',
      'temporary_identities.id',
      'waiting_games.creator_identity_id',
    )
    .select([
      'waiting_games.id',
      'waiting_games.title',
      'waiting_games.color_preference',
      'waiting_games.time_control',
      'waiting_games.created_at',
      'temporary_identities.display_name as creatorDisplayName',
    ])
    .where('waiting_games.status', '=', 'waiting')
    .orderBy('waiting_games.created_at', 'desc')
    .execute();
  return { games };
});
fastify.post('/lobby/waiting-games', async (request, reply) => {
  const identity = await resumeTemporaryIdentity(
    database,
    readTemporarySessionCookie(request.headers.cookie),
  );
  if (!identity) {
    return reply.code(401).send({ error: { code: 'TEMPORARY_IDENTITY_REQUIRED' } });
  }
  const existingGame = await database
    .selectFrom('active_games')
    .select('id')
    .where((builder) =>
      builder.or([
        builder('white_identity_id', '=', identity.id),
        builder('black_identity_id', '=', identity.id),
      ]),
    )
    .where('status', '=', 'active')
    .executeTakeFirst();
  if (existingGame) {
    return reply.code(409).send({ error: { code: 'IDENTITY_ALREADY_IN_GAME' } });
  }
  const body = request.body;
  const title =
    typeof body === 'object' && body !== null && 'title' in body && typeof body.title === 'string'
      ? body.title.trim()
      : '';
  const colorPreference =
    typeof body === 'object' && body !== null && 'colorPreference' in body
      ? body.colorPreference
      : 'random';
  const timeControl =
    typeof body === 'object' && body !== null && 'timeControl' in body ? body.timeControl : 'none';
  if (
    !['white', 'black', 'random'].includes(String(colorPreference)) ||
    !['none', 'rapid_10_0', 'blitz_5_3'].includes(String(timeControl))
  ) {
    return reply.code(400).send({ error: { code: 'WAITING_GAME_INVALID' } });
  }
  try {
    const game = await database
      .insertInto('waiting_games')
      .values({
        id: crypto.randomUUID(),
        creator_identity_id: identity.id,
        title: title || `${identity.displayName}'s game`,
        color_preference: colorPreference as 'white' | 'black' | 'random',
        time_control: timeControl as 'none' | 'rapid_10_0' | 'blitz_5_3',
        status: 'waiting',
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    notifications.lobbyChanged();
    return reply.code(201).send({ game });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return reply.code(409).send({ error: { code: 'WAITING_GAME_ALREADY_EXISTS' } });
    }
    throw error;
  }
});
fastify.delete('/lobby/waiting-games/:gameId', async (request, reply) => {
  const identity = await resumeTemporaryIdentity(
    database,
    readTemporarySessionCookie(request.headers.cookie),
  );
  if (!identity) {
    return reply.code(401).send({ error: { code: 'TEMPORARY_IDENTITY_REQUIRED' } });
  }
  const gameId = Object.values(request.params as Record<string, string>)[0] ?? '';
  const removed = await database
    .deleteFrom('waiting_games')
    .where('id', '=', gameId)
    .where('creator_identity_id', '=', identity.id)
    .where('status', '=', 'waiting')
    .executeTakeFirst();
  if (Number(removed.numDeletedRows) !== 1) {
    return reply.code(404).send({ error: { code: 'WAITING_GAME_NOT_FOUND' } });
  }
  notifications.lobbyChanged();
  return reply.code(204).send();
});
fastify.post('/lobby/waiting-games/:gameId/join', async (request, reply) => {
  const identity = await resumeTemporaryIdentity(
    database,
    readTemporarySessionCookie(request.headers.cookie),
  );
  if (!identity) {
    return reply.code(401).send({ error: { code: 'TEMPORARY_IDENTITY_REQUIRED' } });
  }
  const parameters = request.params as Record<string, string>;
  const gameId = parameters.gameId ?? parameters.gameid ?? Object.values(parameters)[0];
  if (!gameId) {
    return reply.code(400).send({ error: { code: 'WAITING_GAME_INVALID' } });
  }
  const alreadyInGame = await database
    .selectFrom('active_games')
    .select('id')
    .where((builder) =>
      builder.or([
        builder('white_identity_id', '=', identity.id),
        builder('black_identity_id', '=', identity.id),
      ]),
    )
    .where('status', '=', 'active')
    .executeTakeFirst();
  const ownWaitingGame = await database
    .selectFrom('waiting_games')
    .select('id')
    .where('creator_identity_id', '=', identity.id)
    .where('status', '=', 'waiting')
    .executeTakeFirst();
  if (alreadyInGame || ownWaitingGame) {
    return reply.code(409).send({ error: { code: 'IDENTITY_ALREADY_IN_GAME' } });
  }
  const result = await joinWaitingGame(database, chessRules, gameId, identity.id);
  if (!result.accepted) {
    return reply.code(409).send({ error: { code: result.code } });
  }
  notifications.lobbyChanged();
  notifications.gameStarted(
    [result.game.white_identity_id, result.game.black_identity_id],
    result.game.id,
  );
  return reply.code(201).send({ game: result.game });
});
fastify.get('/games/:gameId', async (request, reply) => {
  const identity = await resumeTemporaryIdentity(
    database,
    readTemporarySessionCookie(request.headers.cookie),
  );
  if (!identity) {
    return reply.code(401).send({ error: { code: 'TEMPORARY_IDENTITY_REQUIRED' } });
  }
  const gameId = Object.values(request.params as Record<string, string>)[0];
  const game = await database
    .selectFrom('active_games')
    .innerJoin(
      'temporary_identities as white_player',
      'white_player.id',
      'active_games.white_identity_id',
    )
    .innerJoin(
      'temporary_identities as black_player',
      'black_player.id',
      'active_games.black_identity_id',
    )
    .select([
      'active_games.id',
      'active_games.time_control',
      'active_games.status',
      'active_games.current_fen',
      'active_games.side_to_move',
      'active_games.version',
      'active_games.white_identity_id',
      'active_games.black_identity_id',
      'active_games.white_time_remaining_ms',
      'active_games.black_time_remaining_ms',
      'active_games.turn_started_at',
      'active_games.result',
      'active_games.termination_reason',
      'active_games.draw_offered_by_identity_id',
      'white_player.display_name as whiteDisplayName',
      'black_player.display_name as blackDisplayName',
    ])
    .where('active_games.id', '=', gameId ?? '')
    .executeTakeFirst();
  if (!game || (game.white_identity_id !== identity.id && game.black_identity_id !== identity.id)) {
    return reply.code(404).send({ error: { code: 'GAME_NOT_FOUND' } });
  }
  const moves = await database
    .selectFrom('game_moves')
    .select(['sequence', 'from_square', 'to_square', 'promotion', 'san', 'created_at'])
    .where('game_id', '=', game.id)
    .orderBy('sequence', 'asc')
    .execute();
  return { game, moves };
});
fastify.get('/games/:gameId/legal-moves', async (request, reply) => {
  const identity = await resumeTemporaryIdentity(
    database,
    readTemporarySessionCookie(request.headers.cookie),
  );
  if (!identity) {
    return reply.code(401).send({ error: { code: 'TEMPORARY_IDENTITY_REQUIRED' } });
  }
  const gameId = Object.values(request.params as Record<string, string>)[0] ?? '';
  const from =
    typeof (request.query as Record<string, unknown>).from === 'string'
      ? ((request.query as Record<string, string>).from ?? '')
      : '';
  if (!/^[a-h][1-8]$/.test(from)) {
    return reply.code(400).send({ error: { code: 'MOVE_INVALID' } });
  }
  const game = await database
    .selectFrom('active_games')
    .select([
      'id',
      'current_fen',
      'side_to_move',
      'status',
      'white_identity_id',
      'black_identity_id',
    ])
    .where('id', '=', gameId)
    .executeTakeFirst();
  if (!game || (game.white_identity_id !== identity.id && game.black_identity_id !== identity.id)) {
    return reply.code(404).send({ error: { code: 'GAME_NOT_FOUND' } });
  }
  const playerColor = game.white_identity_id === identity.id ? 'white' : 'black';
  if (game.status !== 'active' || game.side_to_move !== playerColor) {
    return { moves: [] };
  }
  return { moves: chessRules.legalMoves(game.current_fen, from) };
});
const moveCommandSchema = z.object({
  commandId: z.uuid(),
  expectedVersion: z.number().int().nonnegative(),
  from: z.string().regex(/^[a-h][1-8]$/),
  to: z.string().regex(/^[a-h][1-8]$/),
  promotion: z.enum(['queen', 'rook', 'bishop', 'knight']).optional(),
});
fastify.post('/games/:gameId/moves', async (request, reply) => {
  const identity = await resumeTemporaryIdentity(
    database,
    readTemporarySessionCookie(request.headers.cookie),
  );
  if (!identity) {
    return reply.code(401).send({ error: { code: 'TEMPORARY_IDENTITY_REQUIRED' } });
  }
  const body = moveCommandSchema.safeParse(request.body);
  if (!body.success) {
    return reply.code(400).send({ error: { code: 'MOVE_INVALID' } });
  }
  const gameId = Object.values(request.params as Record<string, string>)[0];
  const result = await submitAuthoritativeMove(database, chessRules, {
    gameId: gameId ?? '',
    identityId: identity.id,
    ...body.data,
  });
  if (!result.accepted) {
    const status =
      result.code === 'GAME_NOT_FOUND'
        ? 404
        : result.code === 'MOVE_ILLEGAL' ||
            result.code === 'MOVE_NOT_YOUR_TURN' ||
            result.code === 'MOVE_FLAGGED'
          ? 422
          : 409;
    return reply.code(status).send({ error: { code: result.code } });
  }
  void flushGameOutbox();
  return reply.code(201).send({ game: result.game, move: result.move });
});
const gameActionSchema = z.object({
  expectedVersion: z.number().int().nonnegative(),
  commandId: z.uuid(),
  action: z.enum(['resign', 'offer_draw', 'accept_draw', 'reject_draw', 'claim_draw']),
});
fastify.post('/games/:gameId/actions', async (request, reply) => {
  const identity = await resumeTemporaryIdentity(
    database,
    readTemporarySessionCookie(request.headers.cookie),
  );
  if (!identity) {
    return reply.code(401).send({ error: { code: 'TEMPORARY_IDENTITY_REQUIRED' } });
  }
  const body = gameActionSchema.safeParse(request.body);
  if (!body.success) return reply.code(400).send({ error: { code: 'ACTION_INVALID' } });
  const gameId = Object.values(request.params as Record<string, string>)[0] ?? '';
  const result = await performGameAction(database, chessRules, {
    gameId,
    identityId: identity.id,
    ...body.data,
  });
  if (!result.accepted) {
    const status =
      result.code === 'GAME_NOT_FOUND' ? 404 : result.code === 'ACTION_NOT_AVAILABLE' ? 422 : 409;
    return reply.code(status).send({ error: { code: result.code } });
  }
  void flushGameOutbox();
  return reply.code(201).send({ game: result.game });
});
fastify.get('/games/current', async (request, reply) => {
  const identity = await resumeTemporaryIdentity(
    database,
    readTemporarySessionCookie(request.headers.cookie),
  );
  if (!identity) {
    return reply.code(401).send({ error: { code: 'TEMPORARY_IDENTITY_REQUIRED' } });
  }
  const game = await database
    .selectFrom('active_games')
    .select('id')
    .where((builder) =>
      builder.or([
        builder('white_identity_id', '=', identity.id),
        builder('black_identity_id', '=', identity.id),
      ]),
    )
    .where('status', '=', 'active')
    .orderBy('created_at', 'desc')
    .executeTakeFirst();
  return { game: game ?? null };
});
const archiveQuerySchema = z.object({
  player: z.string().trim().max(80).optional(),
  result: z.enum(['white_win', 'black_win', 'draw']).optional(),
  timeControl: z.enum(['none', 'rapid_10_0', 'blitz_5_3']).optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  offset: z.coerce.number().int().nonnegative().max(100_000).optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});
fastify.get('/archive/games', async (request, reply) => {
  const query = archiveQuerySchema.safeParse(request.query);
  if (!query.success) return reply.code(400).send({ error: { code: 'ARCHIVE_QUERY_INVALID' } });
  const dateAtStartOfDay = (value: string) => new Date(`${value}T00:00:00.000Z`);
  const nextDay = (value: string) => {
    const date = dateAtStartOfDay(value);
    date.setUTCDate(date.getUTCDate() + 1);
    return date;
  };
  const { from, to, ...filters } = query.data;
  return listPublicArchivedGames(database, {
    ...filters,
    from: from ? dateAtStartOfDay(from) : undefined,
    to: to ? nextDay(to) : undefined,
  });
});
fastify.get('/archive/games/:gameId', async (request, reply) => {
  const gameId = Object.values(request.params as Record<string, string>)[0] ?? '';
  if (!z.uuid().safeParse(gameId).success) {
    return reply.code(404).send({ error: { code: 'ARCHIVE_GAME_NOT_FOUND' } });
  }
  const game = await readPublicArchivedGame(database, gameId);
  if (!game) return reply.code(404).send({ error: { code: 'ARCHIVE_GAME_NOT_FOUND' } });
  return { game };
});
fastify.get('/archive/games/:gameId/pgn', async (request, reply) => {
  const gameId = Object.values(request.params as Record<string, string>)[0] ?? '';
  if (!z.uuid().safeParse(gameId).success) {
    return reply.code(404).send({ error: { code: 'ARCHIVE_GAME_NOT_FOUND' } });
  }
  const game = await readPublicArchivedGame(database, gameId);
  if (!game) return reply.code(404).send({ error: { code: 'ARCHIVE_GAME_NOT_FOUND' } });
  reply.header('content-type', 'application/x-chess-pgn; charset=utf-8');
  reply.header('content-disposition', `attachment; filename="chess-ai-${game.id}.pgn"`);
  return exportArchivedGameAsPgn(game);
});
fastify.post('/chess-interchange/import-pgn', async (request, reply) => {
  const body = request.body;
  const pgn =
    typeof body === 'object' && body !== null && 'pgn' in body && typeof body.pgn === 'string'
      ? body.pgn
      : '';
  const result = importPgnForPrivateReplay(pgn);
  if (!result.accepted) return reply.code(422).send({ error: { code: result.code } });
  return { game: result.game };
});
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
  .addHook('onClose', async () => {
    clearInterval(clockSweep);
    clearInterval(outboxSweep);
    await database.destroy();
  });
await app.listen({ port: config.SERVER_PORT, host: '0.0.0.0' });
logger.info({ port: config.SERVER_PORT }, 'Server listening');
void flushGameOutbox();
void backfillCompletedGames(
  database,
  () => listCompletedGameIdsForArchive(database),
  (gameId) => readCompletedGameForArchive(database, gameId),
).catch((error) => logger.error({ error }, 'Game Archive backfill failed'));
