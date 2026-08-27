import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { io } from 'socket.io-client';

const apiBaseUrl = process.env.RESILIENCE_API_BASE_URL ?? 'http://caddy:8080/api';
const socketUrl = process.env.RESILIENCE_SOCKET_URL ?? 'http://caddy:8080';
const phase = process.env.RESILIENCE_PHASE ?? 'setup';
const stateFile =
  process.env.RESILIENCE_STATE_FILE ?? '/workspace/artifacts/capacity/resilience-state.json';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
  });
  return { response, payload: await response.json().catch(() => null) };
}

async function claimIdentity(displayName) {
  const { response, payload } = await request('/temporary-identities', {
    method: 'POST',
    body: JSON.stringify({ displayName }),
  });
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  assert(
    response.status === 201 && cookie && payload?.identity?.id,
    'Could not claim a resilience identity.',
  );
  return { cookie, displayName: payload.identity.display_name };
}

async function connect(cookie) {
  return new Promise((resolve, reject) => {
    const socket = io(socketUrl, {
      extraHeaders: { cookie },
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

async function readGame(gameId, cookie) {
  const { response, payload } = await request(`/games/${gameId}`, { headers: { cookie } });
  assert(
    response.ok && payload?.game && Array.isArray(payload.moves),
    'Could not read the authoritative game snapshot.',
  );
  return payload;
}

async function runSetup() {
  const suffix = `${Date.now().toString(36)}-${process.pid}`;
  const white = await claimIdentity(`res-w-${suffix}`);
  const black = await claimIdentity(`res-b-${suffix}`);
  const created = await request('/lobby/waiting-games', {
    method: 'POST',
    headers: { cookie: white.cookie },
    body: JSON.stringify({
      title: 'Resilience drill',
      colorPreference: 'white',
      timeControl: 'rapid_10_0',
    }),
  });
  const waitingGameId = created.payload?.game?.id;
  assert(created.response.status === 201 && waitingGameId, 'Could not create the resilience game.');
  const joined = await request(`/lobby/waiting-games/${waitingGameId}/join`, {
    method: 'POST',
    headers: { cookie: black.cookie },
    body: JSON.stringify({}),
  });
  const gameId = joined.payload?.game?.id;
  assert(joined.response.status === 201 && gameId, 'Could not join the resilience game.');

  for (const [index, [player, from, to]] of [
    [white, 'e2', 'e4'],
    [black, 'e7', 'e5'],
  ].entries()) {
    const result = await request(`/games/${gameId}/moves`, {
      method: 'POST',
      headers: { cookie: player.cookie },
      body: JSON.stringify({ commandId: crypto.randomUUID(), expectedVersion: index, from, to }),
    });
    assert(result.response.status === 201, `Could not submit resilience move ${index + 1}.`);
  }

  const sockets = await Promise.all([connect(white.cookie), connect(black.cookie)]);
  for (const socket of sockets) socket.close();
  const snapshot = await readGame(gameId, white.cookie);
  await mkdir(dirname(stateFile), { recursive: true });
  await writeFile(
    stateFile,
    `${JSON.stringify({ gameId, white, black, snapshot: snapshot.game, moves: snapshot.moves }, null, 2)}\n`,
  );
  console.log(JSON.stringify({ phase, gameId, moves: snapshot.moves.length, stateFile }, null, 2));
}

async function runVerify() {
  const state = JSON.parse(await readFile(stateFile, 'utf8'));
  const sockets = await Promise.all([connect(state.white.cookie), connect(state.black.cookie)]);
  for (const socket of sockets) socket.close();
  const snapshot = await readGame(state.gameId, state.white.cookie);
  const fields = ['current_fen', 'side_to_move', 'status', 'version', 'time_control'];
  for (const field of fields) {
    assert(
      snapshot.game[field] === state.snapshot[field],
      `Recovered ${field} does not match the pre-restart snapshot.`,
    );
  }
  assert(
    snapshot.moves.length === state.moves.length,
    'Recovered move history length does not match.',
  );
  assert(
    snapshot.moves.map((move) => move.san).join(' ') ===
      state.moves.map((move) => move.san).join(' '),
    'Recovered move history does not match.',
  );
  assert(
    Number.isFinite(Number(snapshot.game.white_time_remaining_ms)),
    'White clock was not recovered.',
  );
  assert(
    Number.isFinite(Number(snapshot.game.black_time_remaining_ms)),
    'Black clock was not recovered.',
  );
  console.log(
    JSON.stringify(
      { phase, gameId: state.gameId, verified: fields, moves: snapshot.moves.length },
      null,
      2,
    ),
  );
}

if (phase === 'setup') await runSetup();
else if (phase === 'verify') await runVerify();
else throw new Error(`Unsupported resilience phase: ${phase}`);
