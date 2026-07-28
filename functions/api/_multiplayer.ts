type JsonRecord = Record<string, unknown>;

type DurableObjectNamespaceLike = {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(request: Request): Promise<Response> };
};

type KVListResult = {
  keys: { name: string }[];
  list_complete: boolean;
  cursor?: string;
};

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; cursor?: string }): Promise<KVListResult>;
};

type MultiplayerEnv = {
  MULTIPLAYER_ROOMS?: DurableObjectNamespaceLike;
  MULTIPLAYER_RATE_LIMITS?: KVNamespaceLike;
};

type MultiplayerContext = {
  request: Request;
  env: MultiplayerEnv;
};

type Player = {
  id: string;
  name: string;
  town: string;
  joinedAt: number;
  lastSeen: number;
  socket: WebSocket | null;
  reconnectToken: string;
  reconnectDeadline: number | null;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  rateWindowStartedAt: number;
  rateCount: number;
};

type Snapshot = {
  from: string;
  tick: number;
  roster: JsonRecord[];
  byteLength: number;
  createdAt: string;
  snapshot: unknown;
};

type RoomSetup = {
  contractId: string;
  seed: string;
  difficultyPreset: string;
  meta: JsonRecord;
  research: JsonRecord;
};

type ReplayBundle = {
  v: number;
  type: 'tick-inputs';
  tick: number;
  roster: JsonRecord[];
  inputs: Array<{ playerId: string; input: unknown }>;
};

const PROTOCOL_VERSION = 3;
const MAX_PLAYERS = 4;
const ROOM_CODE_BYTES = 12;
const RECONNECT_TOKEN_BYTES = 16;
const RECONNECT_GRACE_MS = 60_000;
const MAX_REPLAY_BUNDLES = 128;
const EMPTY_TTL_MS = 120_000;
const IDLE_TIMEOUT_MS = 60_000;
const RATE_WINDOW_MS = 10_000;
const RATE_LIMIT_MESSAGES = 600;
const SMALL_JSON_BYTES = 8 * 1024;
const MAX_MESSAGE_BYTES = 220 * 1024;
const MAX_SNAPSHOT_BYTES = 200 * 1024;
const MAX_INPUT_BYTES = 4 * 1024;
const MAX_REJOIN_BOOTSTRAP_BYTES = 512 * 1024;
const MAX_FUTURE_TICKS = 512;
const ROOM_UNAVAILABLE_MESSAGE = "riding together isn't saddled yet";
const RATE_LIMIT_MESSAGE = 'The wire is busy. Try again later.';
const RATE_TTL_SECONDS = 60 * 60;
const MAX_CREATE_REQUESTS_PER_IP = 10;
const MAX_CONNECT_REQUESTS_PER_IP = 30;
const MAX_INSPECT_REQUESTS_PER_IP = 120;
const HANDSHAKE_TIMEOUT_MS = 10_000;
const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);

export async function createRoom(context: MultiplayerContext): Promise<Response> {
  return route(context, async ({ request, env, cors }) => {
    if (request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    const rooms = requireRooms(env, cors);
    if (rooms instanceof Response) return rooms;
    const limiter = requireRateLimits(env, cors);
    if (limiter instanceof Response) return limiter;
    const allowed = await bumpCounter(limiter, `mp:ratelimit:create:${await clientIpHash(request)}`, MAX_CREATE_REQUESTS_PER_IP);
    if (!allowed) return error(cors, 429, 'rate_limited', RATE_LIMIT_MESSAGE);
    const body = await readJson(request, SMALL_JSON_BYTES);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const code = randomRoomCode();
      const stub = rooms.get(rooms.idFromName(code));
      const response = await stub.fetch(roomRequest('/create', { code, setup: body.setup }));
      if (response.status !== 409) return withCors(response, cors);
    }
    return error(cors, 503, 'room_unavailable', ROOM_UNAVAILABLE_MESSAGE);
  });
}

export async function connectRoom(context: MultiplayerContext): Promise<Response> {
  const cors = corsHeaders(context.request);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'Origin not allowed.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const rooms = requireRooms(context.env, cors);
  if (rooms instanceof Response) return rooms;
  const limiter = requireRateLimits(context.env, cors);
  if (limiter instanceof Response) return limiter;
  const allowed = await bumpCounter(limiter, `mp:ratelimit:connect:${await clientIpHash(context.request)}`, MAX_CONNECT_REQUESTS_PER_IP);
  if (!allowed) return error(cors, 429, 'rate_limited', RATE_LIMIT_MESSAGE);

  const code = normalizeRoomCode(new URL(context.request.url).searchParams.get('code'));
  if (!code) return error(cors, 400, 'bad_room_code', 'Room code not accepted.');

  const stub = rooms.get(rooms.idFromName(code));
  return stub.fetch(context.request);
}

export async function inspectRoom(context: MultiplayerContext): Promise<Response> {
  const cors = corsHeaders(context.request);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'Origin not allowed.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'GET') return error(cors, 405, 'method_not_allowed', 'GET only');
  const rooms = requireRooms(context.env, cors);
  if (rooms instanceof Response) return rooms;
  const limiter = requireRateLimits(context.env, cors);
  if (limiter instanceof Response) return limiter;
  const allowed = await bumpCounter(
    limiter,
    `mp:ratelimit:inspect:${await clientIpHash(context.request)}`,
    MAX_INSPECT_REQUESTS_PER_IP,
  );
  if (!allowed) return error(cors, 429, 'rate_limited', RATE_LIMIT_MESSAGE);
  const code = normalizeRoomCode(new URL(context.request.url).searchParams.get('code'));
  if (!code) return error(cors, 400, 'bad_room_code', 'Room code not accepted.');
  const stub = rooms.get(rooms.idFromName(code));
  const response = await stub.fetch(new Request('https://gold-rush-room.local/inspect'));
  return withCors(response, cors);
}

export class MultiplayerRoom {
  private code: string | null = null;
  private readonly players = new Map<string, Player>();
  private readonly inputTicks = new Map<number, Map<string, unknown>>();
  private readonly replayBundles = new Map<number, ReplayBundle>();
  private latestSnapshot: Snapshot | null = null;
  private setup: RoomSetup | null = null;
  private nextFlushTick = 0;
  private nextPlayerNumber = 1;
  private emptySince = 0;
  private emptyTimer: ReturnType<typeof setTimeout> | null = null;

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/create')) return this.create(request);
    if (url.pathname.endsWith('/inspect')) return this.inspect();
    if (url.pathname.endsWith('/connect')) return this.connect(request);
    return json({}, { ok: false, error: 'not_found', message: 'Room route not found.' }, 404);
  }

  private async create(request: Request): Promise<Response> {
    if (request.method !== 'POST') return json({}, { ok: false, error: 'method_not_allowed', message: 'POST only' }, 405);
    const body = await readJson(request, SMALL_JSON_BYTES);
    const code = normalizeRoomCode(body.code);
    if (!code) return json({}, { ok: false, error: 'bad_room_code', message: 'Room code not accepted.' }, 400);
    if (this.code && this.code !== code && this.players.size > 0) {
      return json({}, { ok: false, error: 'room_exists', message: 'Room is already riding.' }, 409);
    }
    this.code = code;
    const setup = normalizeSetup(body.setup);
    if (body.setup !== undefined && !setup) {
      return json({}, { ok: false, error: 'bad_setup', message: 'Ride setup not accepted.' }, 400);
    }
    this.setup = setup;
    this.armEmptyTimer();
    return json({}, {
      ok: true,
      v: PROTOCOL_VERSION,
      type: 'room-created',
      code,
      maxPlayers: MAX_PLAYERS,
      emptyTtlMs: EMPTY_TTL_MS,
    });
  }

  private connect(request: Request): Response {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return json({}, { ok: false, error: 'upgrade_required', message: 'WebSocket required.' }, 426);
    }
    const code = normalizeRoomCode(new URL(request.url).searchParams.get('code'));
    if (!code || code !== this.code) {
      return json({}, { ok: false, error: 'room_not_found', message: 'Room not found.' }, 404);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    let playerId: string | null = null;
    let handshakeTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      if (!playerId) server.close(1008, 'join timeout');
    }, HANDSHAKE_TIMEOUT_MS);
    const clearHandshakeTimer = () => {
      if (!handshakeTimer) return;
      clearTimeout(handshakeTimer);
      handshakeTimer = null;
    };
    server.accept();
    server.addEventListener('message', (event) => {
      try {
        if (!playerId) {
          playerId = this.handshake(server, event.data);
          clearHandshakeTimer();
        }
        if (playerId && this.players.get(playerId)?.socket === server) this.handle(playerId, event.data);
      } catch (err) {
        clearHandshakeTimer();
        send(server, {
          v: PROTOCOL_VERSION,
          type: 'error',
          error: err instanceof Error ? err.message : 'bad_message',
        });
        if (playerId) this.leave(playerId);
        server.close(1008, 'bad message');
      }
    });
    server.addEventListener('close', () => {
      clearHandshakeTimer();
      if (playerId) this.hold(playerId, server);
    });
    server.addEventListener('error', () => {
      clearHandshakeTimer();
      if (playerId) this.hold(playerId, server);
    });
    return new Response(null, { status: 101, webSocket: client });
  }

  private inspect(): Response {
    if (!this.code) return json({}, { ok: false, error: 'room_not_found', message: 'Room not found.' }, 404);
    return json({}, {
      ok: true,
      v: PROTOCOL_VERSION,
      type: 'room-info',
      code: this.code,
      setup: this.setup,
      started: this.nextFlushTick > 0,
      players: this.players.size,
    });
  }

  private handshake(socket: WebSocket, raw: unknown): string | null {
    const message = parseSocketMessage(raw);
    if (message.type === 'rejoin') return this.rejoin(socket, message);
    if (message.type !== 'join') throw new Error('join_required');
    return this.join(socket, message);
  }

  private join(socket: WebSocket, message: JsonRecord): string {
    const code = normalizeRoomCode(message.code);
    if (!code || code !== this.code) throw new Error('bad_room_code');
    if (this.players.size >= MAX_PLAYERS) throw new Error('room_full');
    if (this.nextFlushTick > 0) throw new Error('ride_started');

    const setup = normalizeSetup(message.setup);
    if (!setup) throw new Error('setup_required');
    if (this.setup && stableStringify(this.setup) !== stableStringify(setup)) throw new Error('setup_mismatch');
    this.setup ??= setup;

    const player = normalizePlayer(message.player);
    const id = `p${this.nextPlayerNumber}`;
    this.nextPlayerNumber += 1;
    this.players.set(id, {
      id,
      name: player.name,
      town: player.town,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      socket,
      reconnectToken: randomReconnectToken(),
      reconnectDeadline: null,
      reconnectTimer: null,
      rateWindowStartedAt: Date.now(),
      rateCount: 0,
    });
    const joined = this.players.get(id)!;
    this.cancelEmptyTimer();
    send(socket, {
      v: PROTOCOL_VERSION,
      type: 'joined',
      code: this.code,
      playerId: id,
      maxPlayers: MAX_PLAYERS,
      roster: this.roster(),
      setup: this.setup,
      reconnectToken: joined.reconnectToken,
      reconnectGraceMs: RECONNECT_GRACE_MS,
    });
    this.broadcastRoster();
    this.armIdleTimer(id, socket);
    return id;
  }

  private rejoin(socket: WebSocket, message: JsonRecord): string {
    const code = normalizeRoomCode(message.code);
    const reconnectToken = normalizeReconnectToken(message.reconnectToken);
    if (!code || code !== this.code) throw new Error('bad_room_code');
    if (!reconnectToken) throw new Error('reconnect_required');
    const player = [...this.players.values()].find((candidate) => candidate.reconnectToken === reconnectToken);
    if (!player) throw new Error('reconnect_rejected');
    if (player.reconnectDeadline !== null && player.reconnectDeadline <= Date.now()) {
      this.leave(player.id);
      throw new Error('reconnect_expired');
    }

    const response = {
      v: PROTOCOL_VERSION,
      type: 'rejoined',
      code: this.code,
      playerId: player.id,
      maxPlayers: MAX_PLAYERS,
      roster: this.roster(),
      setup: this.setup,
      reconnectToken: player.reconnectToken,
      reconnectGraceMs: RECONNECT_GRACE_MS,
      nextTick: this.nextFlushTick,
      ...this.rejoinBootstrap(),
    };
    if (utf8Length(JSON.stringify(response)) > MAX_REJOIN_BOOTSTRAP_BYTES) throw new Error('reconnect_bootstrap_too_large');
    this.clearPendingInputs(player.id);
    const previousSocket = player.socket;
    if (player.reconnectTimer) clearTimeout(player.reconnectTimer);
    player.reconnectTimer = null;
    player.reconnectDeadline = null;
    player.socket = socket;
    player.lastSeen = Date.now();
    player.rateWindowStartedAt = Date.now();
    player.rateCount = 0;
    if (previousSocket && previousSocket !== socket) previousSocket.close(4000, 'reconnected');
    send(socket, response);
    this.broadcast({ v: PROTOCOL_VERSION, type: 'player-returned', playerId: player.id }, player.id);
    this.armIdleTimer(player.id, socket);
    return player.id;
  }

  private rejoinBootstrap(): { authoritySnapshot: Snapshot | null; replay: ReplayBundle[] } {
    if (this.nextFlushTick === 0) return { authoritySnapshot: null, replay: [] };
    const snapshot = this.latestSnapshot;
    if (snapshot && (snapshot.from !== snapshot.roster[0]?.playerId || snapshot.tick >= this.nextFlushTick)) {
      throw new Error('reconnect_snapshot_unavailable');
    }
    const replay: ReplayBundle[] = [];
    for (let tick = snapshot ? snapshot.tick + 1 : 0; tick < this.nextFlushTick; tick += 1) {
      const bundle = this.replayBundles.get(tick);
      if (!bundle) throw new Error('reconnect_replay_incomplete');
      replay.push(bundle);
    }
    return { authoritySnapshot: snapshot, replay };
  }

  private handle(playerId: string, raw: unknown): void {
    const player = this.players.get(playerId);
    if (!player) return;
    player.lastSeen = Date.now();
    this.checkRate(player);
    const message = parseSocketMessage(raw);
    if (message.type === 'join' || message.type === 'rejoin') return;
    if (message.type === 'input') return this.handleInput(playerId, message);
    if (message.type === 'hash') return this.forward(playerId, 'hash', message);
    if (message.type === 'snapshot-push') return this.handleSnapshot(playerId, message);
    if (message.type === 'snapshot-request') return this.sendSnapshot(player);
    if (message.type === 'ping' && player.socket) return send(player.socket, { v: PROTOCOL_VERSION, type: 'pong', now: Date.now() });
    throw new Error('unknown_message');
  }

  private handleInput(playerId: string, message: JsonRecord): void {
    const tick = normalizeTick(message.tick);
    if (tick === null || tick < this.nextFlushTick || tick > this.nextFlushTick + MAX_FUTURE_TICKS) throw new Error('bad_tick');
    const input = message.input ?? null;
    if (utf8Length(JSON.stringify(input)) > MAX_INPUT_BYTES) throw new Error('input_too_large');
    let inputs = this.inputTicks.get(tick);
    if (!inputs) {
      inputs = new Map();
      this.inputTicks.set(tick, inputs);
    }
    inputs.set(playerId, input);
    this.flushInputs();
  }

  private flushInputs(): void {
    while (this.players.size > 0) {
      const inputs = this.inputTicks.get(this.nextFlushTick);
      const roster = [...this.players.values()].sort((a, b) => a.joinedAt - b.joinedAt);
      if (!inputs || !roster.every((player) => inputs.has(player.id))) break;
      const bundle: ReplayBundle = {
        v: PROTOCOL_VERSION,
        type: 'tick-inputs',
        tick: this.nextFlushTick,
        roster: this.roster(),
        inputs: roster.map((player) => ({ playerId: player.id, input: inputs?.get(player.id) ?? null })),
      };
      this.replayBundles.set(bundle.tick, bundle);
      while (this.replayBundles.size > MAX_REPLAY_BUNDLES) {
        const oldest = this.replayBundles.keys().next().value as number | undefined;
        if (oldest === undefined) break;
        this.replayBundles.delete(oldest);
      }
      this.broadcast(bundle);
      this.inputTicks.delete(this.nextFlushTick);
      this.nextFlushTick += 1;
    }
  }

  private forward(from: string, type: string, message: JsonRecord): void {
    const tick = normalizeTick(message.tick);
    if (tick === null) throw new Error('bad_tick');
    this.broadcast({
      v: PROTOCOL_VERSION,
      type,
      from,
      tick,
      hash: typeof message.hash === 'string' ? message.hash.slice(0, 128) : undefined,
      payload: message.payload,
    }, from);
  }

  private handleSnapshot(from: string, message: JsonRecord): void {
    const tick = normalizeTick(message.tick);
    if (tick === null) throw new Error('bad_tick');
    const snapshot = message.snapshot ?? null;
    const byteLength = utf8Length(JSON.stringify(snapshot));
    if (byteLength > MAX_SNAPSHOT_BYTES) throw new Error('snapshot_too_large');
    if (from !== this.roster()[0]?.playerId) throw new Error('snapshot_authority_required');
    if (tick >= this.nextFlushTick) throw new Error('snapshot_future_tick');
    if (this.latestSnapshot && tick < this.latestSnapshot.tick) return;
    if (this.latestSnapshot?.tick === tick) {
      this.broadcast({ v: PROTOCOL_VERSION, type: 'snapshot-available', from, tick, byteLength }, from);
      return;
    }
    const roster = this.replayBundles.get(tick)?.roster;
    if (!roster) throw new Error('snapshot_roster_unavailable');
    this.latestSnapshot = { from, tick, roster, byteLength, createdAt: new Date().toISOString(), snapshot };
    for (const replayTick of this.replayBundles.keys()) if (replayTick <= tick) this.replayBundles.delete(replayTick);
    this.broadcast({ v: PROTOCOL_VERSION, type: 'snapshot-available', from, tick, byteLength }, from);
  }

  private sendSnapshot(player: Player): void {
    if (!player.socket) return;
    send(player.socket, this.latestSnapshot
      ? { v: PROTOCOL_VERSION, type: 'snapshot', ...this.latestSnapshot }
      : { v: PROTOCOL_VERSION, type: 'snapshot-missing' });
  }

  private hold(playerId: string, socket: WebSocket): void {
    const player = this.players.get(playerId);
    if (!player || player.socket !== socket) return;
    player.socket = null;
    if (player.reconnectDeadline !== null) return;
    this.clearPendingInputs(playerId);
    player.reconnectDeadline = Date.now() + RECONNECT_GRACE_MS;
    player.reconnectTimer = setTimeout(() => this.expireHeldPlayer(playerId), RECONNECT_GRACE_MS + 25);
    this.broadcast({
      v: PROTOCOL_VERSION,
      type: 'player-held',
      playerId,
      reconnectDeadline: player.reconnectDeadline,
    });
  }

  private expireHeldPlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player || player.socket || player.reconnectDeadline === null) return;
    const remaining = player.reconnectDeadline - Date.now();
    if (remaining > 0) {
      player.reconnectTimer = setTimeout(() => this.expireHeldPlayer(playerId), remaining + 25);
      return;
    }
    this.leave(playerId);
  }

  private leave(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;
    if (player.reconnectTimer) clearTimeout(player.reconnectTimer);
    this.players.delete(playerId);
    this.clearPendingInputs(playerId);
    this.broadcastRoster();
    this.flushInputs();
    if (this.players.size === 0) this.armEmptyTimer();
  }

  private clearPendingInputs(playerId: string): void {
    for (const [tick, inputs] of this.inputTicks) {
      inputs.delete(playerId);
      if (tick < this.nextFlushTick || inputs.size === 0) this.inputTicks.delete(tick);
    }
  }

  private checkRate(player: Player): void {
    const now = Date.now();
    if (now - player.rateWindowStartedAt > RATE_WINDOW_MS) {
      player.rateWindowStartedAt = now;
      player.rateCount = 0;
    }
    player.rateCount += 1;
    if (player.rateCount > RATE_LIMIT_MESSAGES) throw new Error('rate_limited');
  }

  private armIdleTimer(playerId: string, socket: WebSocket): void {
    setTimeout(() => {
      const player = this.players.get(playerId);
      if (!player || player.socket !== socket) return;
      if (Date.now() - player.lastSeen >= IDLE_TIMEOUT_MS) {
        socket.close(1001, 'timeout');
        this.hold(playerId, socket);
      } else {
        this.armIdleTimer(playerId, socket);
      }
    }, IDLE_TIMEOUT_MS + 250);
  }

  private armEmptyTimer(): void {
    this.emptySince = Date.now();
    this.cancelEmptyTimer();
    this.emptyTimer = setTimeout(() => {
      if (this.players.size > 0 || Date.now() - this.emptySince < EMPTY_TTL_MS) return;
      this.code = null;
      this.inputTicks.clear();
      this.replayBundles.clear();
      this.latestSnapshot = null;
      this.setup = null;
      this.nextFlushTick = 0;
      this.nextPlayerNumber = 1;
    }, EMPTY_TTL_MS);
  }

  private cancelEmptyTimer(): void {
    if (this.emptyTimer) clearTimeout(this.emptyTimer);
    this.emptyTimer = null;
  }

  private roster(): JsonRecord[] {
    return [...this.players.values()]
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map(({ id, name, town }) => ({ playerId: id, name, town }));
  }

  private broadcastRoster(): void {
    this.broadcast({
      v: PROTOCOL_VERSION,
      type: 'roster',
      code: this.code,
      players: this.roster(),
      maxPlayers: MAX_PLAYERS,
      effectiveTick: this.nextFlushTick,
    });
  }

  private broadcast(value: JsonRecord, except?: string): void {
    for (const player of this.players.values()) {
      if (player.id !== except && player.socket) send(player.socket, value);
    }
  }
}

export default {
  fetch(): Response {
    return new Response('Gold Rush multiplayer room worker');
  },
};

async function route(
  context: MultiplayerContext,
  handler: (value: { request: Request; env: MultiplayerEnv; cors: Record<string, string> }) => Promise<Response>,
): Promise<Response> {
  const cors = corsHeaders(context.request);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'Origin not allowed.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  try {
    return await handler({ request: context.request, env: context.env, cors });
  } catch (err) {
    if (err instanceof HttpError) return error(cors, err.status, err.code, err.message);
    return error(cors, 500, 'server_error', 'The relay office could not finish that request.');
  }
}

function corsHeaders(request: Request): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  if (!origin) return headers;
  if (ALLOWED_ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+\.gold-rush-3in\.pages\.dev$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return { ...headers, 'Access-Control-Allow-Origin': origin };
  }
  return null;
}

function requireRooms(env: MultiplayerEnv, cors: Record<string, string>): DurableObjectNamespaceLike | Response {
  return env.MULTIPLAYER_ROOMS ?? error(cors, 503, 'multiplayer_not_enabled', ROOM_UNAVAILABLE_MESSAGE);
}

function requireRateLimits(env: MultiplayerEnv, cors: Record<string, string>): KVNamespaceLike | Response {
  return env.MULTIPLAYER_RATE_LIMITS ?? error(cors, 503, 'multiplayer_not_enabled', ROOM_UNAVAILABLE_MESSAGE);
}

function withCors(response: Response, cors: Record<string, string>): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(cors)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function roomRequest(path: string, body: JsonRecord): Request {
  return new Request(`https://gold-rush-room.local${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function readJson(request: Request, maxBytes: number): Promise<JsonRecord> {
  const type = request.headers.get('content-type') ?? '';
  if (!/^application\/json\b/i.test(type)) throw new HttpError(415, 'unsupported_media_type', 'Send application/json.');
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > maxBytes) throw new HttpError(413, 'payload_too_large', 'Request payload is too large.');
  const text = await request.text();
  if (utf8Length(text) > maxBytes) throw new HttpError(413, 'payload_too_large', 'Request payload is too large.');
  let value: unknown;
  try {
    value = JSON.parse(text || '{}');
  } catch {
    throw new HttpError(400, 'bad_json', 'JSON not accepted.');
  }
  if (!isRecord(value)) throw new HttpError(400, 'bad_json', 'JSON not accepted.');
  return value;
}

async function bumpCounter(kv: KVNamespaceLike, key: string, limit: number): Promise<boolean> {
  const current = Number(await kv.get(key));
  const count = Number.isFinite(current) && current > 0 ? Math.trunc(current) : 0;
  if (count >= limit) return false;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_TTL_SECONDS });
  return true;
}

async function clientIpHash(request: Request): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'local';
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

function parseSocketMessage(raw: unknown): JsonRecord {
  const text = socketText(raw);
  if (utf8Length(text) > MAX_MESSAGE_BYTES) throw new Error('message_too_large');
  const value = JSON.parse(text);
  if (!isRecord(value) || value.v !== PROTOCOL_VERSION || typeof value.type !== 'string') throw new Error('bad_envelope');
  return value;
}

function socketText(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (raw instanceof ArrayBuffer) return new TextDecoder().decode(raw);
  throw new Error('unsupported_message');
}

function normalizePlayer(value: unknown): { name: string; town: string } {
  const record = isRecord(value) ? value : {};
  const name = cleanName(record.name, 'Rider', 24);
  const town = cleanName(record.town, 'Home Claim', 32);
  return { name, town };
}

function normalizeSetup(value: unknown): RoomSetup | null {
  if (!isRecord(value)) return null;
  const contractId = cleanName(value.contractId, '', 64);
  const seed = cleanName(value.seed, '', 96);
  const difficultyPreset = cleanName(value.difficultyPreset, '', 32);
  if (!contractId || !seed || !difficultyPreset || !isRecord(value.meta) || !isRecord(value.research)) return null;
  return {
    contractId,
    seed,
    difficultyPreset,
    meta: value.meta,
    research: value.research,
  };
}

function cleanName(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
  return cleaned || fallback;
}

function normalizeRoomCode(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const code = value.replace(/[^a-f0-9]/gi, '').toUpperCase();
  return /^[A-F0-9]{24}$/.test(code) ? code : null;
}

function normalizeReconnectToken(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const token = value.toUpperCase();
  return /^[A-F0-9]{32}$/.test(token) ? token : null;
}

function normalizeTick(value: unknown): number | null {
  return Number.isInteger(value) && value >= 0 && value <= 10_000_000 ? value : null;
}

function randomRoomCode(): string {
  return randomHex(ROOM_CODE_BYTES);
}

function randomReconnectToken(): string {
  return randomHex(RECONNECT_TOKEN_BYTES);
}

function randomHex(byteLength: number): string {
  const values = crypto.getRandomValues(new Uint8Array(byteLength));
  return [...values].map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!isRecord(value)) return JSON.stringify(value);
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
}

function send(socket: WebSocket, value: JsonRecord): void {
  socket.send(JSON.stringify(value));
}

function json(cors: Record<string, string>, value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...cors, 'content-type': 'application/json; charset=utf-8' },
  });
}

function error(cors: Record<string, string>, status: number, code: string, message: string): Response {
  return json(cors, { ok: false, error: code, message }, status);
}

function utf8Length(value: string): number {
  return new TextEncoder().encode(value).length;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
