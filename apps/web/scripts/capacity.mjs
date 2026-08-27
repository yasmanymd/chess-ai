import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { io } from 'socket.io-client';

const apiBaseUrl = process.env.CAPACITY_API_BASE_URL ?? 'http://caddy:8080/api';
const socketUrl = process.env.CAPACITY_SOCKET_URL ?? 'http://caddy:8080';
const durationSeconds = integerEnvironment('CAPACITY_DURATION_SECONDS', 300);
const gameCount = integerEnvironment('CAPACITY_GAME_COUNT', 100);
const connectionCount = integerEnvironment('CAPACITY_CONNECTION_COUNT', 500);
const moveIntervalMs = integerEnvironment('CAPACITY_MOVE_INTERVAL_MS', 27_000);
const reportDirectory = process.env.CAPACITY_REPORT_DIRECTORY ?? '/workspace/artifacts/capacity';
const runId = `${Date.now().toString(36)}-${process.pid}`;

const openingMoves = [
  ['e2', 'e4'],
  ['e7', 'e5'],
  ['g1', 'f3'],
  ['b8', 'c6'],
  ['f1', 'c4'],
  ['g8', 'f6'],
  ['d2', 'd3'],
  ['f8', 'c5'],
  ['c2', 'c3'],
  ['d7', 'd6'],
  ['b1', 'd2'],
  ['c8', 'e6'],
];

function integerEnvironment(name, fallback) {
  const candidate = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isSafeInteger(candidate) && candidate > 0 ? candidate : fallback;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function percentile(values, value) {
  if (values.length === 0) return null;
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * value) - 1)];
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

async function claimIdentity(index) {
  const { response, payload } = await request('/temporary-identities', {
    method: 'POST',
    body: JSON.stringify({ displayName: `cap-${runId}-${index}` }),
  });
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  if (!response.ok || !cookie || !payload?.identity?.id) {
    throw new Error(`Identity ${index} could not be claimed (${response.status}).`);
  }
  return { cookie, id: payload.identity.id, displayName: payload.identity.display_name };
}

async function inBatches(items, size, work) {
  const output = [];
  for (let start = 0; start < items.length; start += size) {
    output.push(...(await Promise.all(items.slice(start, start + size).map(work))));
  }
  return output;
}

async function createGame(white, black, index) {
  const created = await request('/lobby/waiting-games', {
    method: 'POST',
    headers: { cookie: white.cookie },
    body: JSON.stringify({
      title: `Capacity game ${index + 1}`,
      colorPreference: 'white',
      timeControl: 'none',
    }),
  });
  const waitingGameId = created.payload?.game?.id;
  if (!created.response.ok || !waitingGameId) {
    throw new Error(`Waiting game ${index + 1} could not be created (${created.response.status}).`);
  }

  const joined = await request(`/lobby/waiting-games/${waitingGameId}/join`, {
    method: 'POST',
    headers: { cookie: black.cookie },
    body: JSON.stringify({}),
  });
  if (!joined.response.ok || !joined.payload?.game?.id) {
    throw new Error(`Waiting game ${index + 1} could not be joined (${joined.response.status}).`);
  }
  return { id: joined.payload.game.id, players: [white, black], version: 0 };
}

function connect(identity) {
  return new Promise((resolve, reject) => {
    const socket = io(socketUrl, {
      extraHeaders: { cookie: identity.cookie },
      forceNew: true,
      reconnection: false,
      transports: ['websocket'],
    });
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error('Socket connection timed out.'));
    }, 10_000);
    socket.once('connect', () => {
      clearTimeout(timeout);
      resolve(socket);
    });
    socket.once('connect_error', (error) => {
      clearTimeout(timeout);
      socket.close();
      reject(error);
    });
  });
}

async function submitMove(game, move) {
  const player = game.players[game.version % 2];
  const startedAt = performance.now();
  const result = await request(`/games/${game.id}/moves`, {
    method: 'POST',
    headers: { cookie: player.cookie },
    body: JSON.stringify({
      commandId: crypto.randomUUID(),
      expectedVersion: game.version,
      from: move[0],
      to: move[1],
    }),
  });
  return {
    durationMs: performance.now() - startedAt,
    accepted: result.response.status === 201,
    status: result.response.status,
    error: result.payload?.error?.code,
  };
}

const report = {
  schemaVersion: 1,
  runId,
  startedAt: new Date().toISOString(),
  configuration: {
    apiBaseUrl,
    socketUrl,
    durationSeconds,
    gameCount,
    connectionCount,
    moveIntervalMs,
    moveStaggerMs: Math.floor(moveIntervalMs / gameCount),
  },
  environment: { node: process.version, platform: process.platform, architecture: process.arch },
  setup: {
    identities: 0,
    games: 0,
    requestedConnections: connectionCount,
    connectedConnections: 0,
  },
  moves: { attempted: 0, accepted: 0, rejected: 0, latenciesMs: [] },
  socketDisconnects: 0,
  errors: [],
};
const sockets = [];

try {
  const identities = await inBatches(
    Array.from({ length: gameCount * 2 }, (_, index) => index),
    25,
    claimIdentity,
  );
  report.setup.identities = identities.length;

  const games = await inBatches(
    Array.from({ length: gameCount }, (_, index) => index),
    20,
    (index) => createGame(identities[index * 2], identities[index * 2 + 1], index),
  );
  report.setup.games = games.length;

  const socketIdentities = Array.from(
    { length: connectionCount },
    (_, index) => identities[index % identities.length],
  );
  const connected = await inBatches(socketIdentities, 50, connect);
  for (const socket of connected) {
    socket.on('disconnect', () => {
      report.socketDisconnects += 1;
    });
    sockets.push(socket);
  }
  report.setup.connectedConnections = sockets.length;

  const deadline = Date.now() + durationSeconds * 1_000;
  let moveIndex = 0;
  const moveStaggerMs = Math.floor(moveIntervalMs / games.length);
  while (Date.now() + moveIntervalMs <= deadline && moveIndex < openingMoves.length) {
    const outcomes = await Promise.all(
      games.map(async (game, index) => {
        await sleep(index * moveStaggerMs);
        return submitMove(game, openingMoves[moveIndex]);
      }),
    );
    for (const outcome of outcomes) {
      report.moves.attempted += 1;
      report.moves.latenciesMs.push(Math.round(outcome.durationMs));
      if (outcome.accepted) report.moves.accepted += 1;
      else {
        report.moves.rejected += 1;
        report.errors.push({ type: 'move', ...outcome });
      }
    }
    for (const game of games) game.version += 1;
    moveIndex += 1;
  }

  if (Date.now() < deadline) await sleep(deadline - Date.now());
} catch (error) {
  report.errors.push({
    type: 'fatal',
    message: error instanceof Error ? error.message : String(error),
  });
} finally {
  report.finishedAt = new Date().toISOString();
  report.summary = {
    moveP50Ms: percentile(report.moves.latenciesMs, 0.5),
    moveP95Ms: percentile(report.moves.latenciesMs, 0.95),
    validMoveErrorRate: report.moves.attempted ? report.moves.rejected / report.moves.attempted : 1,
    activeConnectionsAtEnd: sockets.filter((socket) => socket.connected).length,
    processMemory: process.memoryUsage(),
  };
  const reportPath = join(reportDirectory, `capacity-${runId}.json`);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  for (const socket of sockets) socket.close();
  console.log(JSON.stringify({ reportPath, summary: report.summary }, null, 2));
}

if (report.errors.length > 0 || report.setup.connectedConnections !== connectionCount)
  process.exitCode = 1;
