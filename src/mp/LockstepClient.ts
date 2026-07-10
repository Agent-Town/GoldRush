import * as THREE from 'three';
import type { Intents } from '../core/InputController';
import { gunzipJsonBase64, gzipTextBase64 } from '../core/GzipJson';

export type LockstepInput = {
  mx: number;
  my: number;
  confirm: boolean;
  upgrade: boolean;
  rotateBuild: boolean;
  weaponToggle: boolean;
  build: boolean;
  cancel: boolean;
  buildSlot: number | null;
  restart: boolean;
  pause: boolean;
  debugSpawn: boolean;
  debugXp: boolean;
};

export type MultiplayerPlayer = {
  playerId: string;
  name: string;
  town: string;
};

export type LockstepTick = {
  tick: number;
  inputs: Array<{ playerId: string; input: LockstepInput }>;
};

export type MultiplayerState = {
  active: boolean;
  connected: boolean;
  code: string;
  playerId: string | null;
  roster: MultiplayerPlayer[];
  tick: number;
  buffered: number;
  latencyMs: number | null;
  tickRate: number;
  hashes: Array<{ tick: number; hash: string }>;
  desyncs: number;
  resyncs: number;
  lastResyncTick: number | null;
  paused: boolean;
  error: string | null;
};

type WireMessage = Record<string, unknown>;

export type LockstepClientOptions = {
  relayBase: string;
  code: string | null;
  player: { name: string; town: string };
  inputDelayTicks?: number;
  hashEveryTicks?: number;
  desyncAtTick?: number | null;
  onDesync?: (tick: number) => void;
  onSnapshot?: (snapshot: unknown, tick: number) => boolean;
};

const VERSION = 1;
const DEFAULT_DELAY_TICKS = 3;
const DEFAULT_HASH_EVERY_TICKS = 30;
const MAX_HASH_HISTORY = 128;
const SNAPSHOT_RAW_LIMIT_BYTES = 180 * 1024;
const SNAPSHOT_WIRE_LIMIT_BYTES = 190 * 1024;
const SNAPSHOT_CODEC = 'gzip-base64-v1';
const ZERO_INPUT: LockstepInput = {
  mx: 0,
  my: 0,
  confirm: false,
  upgrade: false,
  rotateBuild: false,
  weaponToggle: false,
  build: false,
  cancel: false,
  buildSlot: null,
  restart: false,
  pause: false,
  debugSpawn: false,
  debugXp: false,
};

export class LockstepClient {
  readonly stepSeconds = 1 / 30;
  private socket: WebSocket | null = null;
  private connected = false;
  private code = '';
  private playerId: string | null = null;
  private roster: MultiplayerPlayer[] = [];
  private nextInputTick = 0;
  private nextSimTick = 0;
  private readonly bundles = new Map<number, LockstepTick>();
  private readonly consumedBundles = new Map<number, LockstepTick>();
  private readonly sendTimes = new Map<number, number>();
  private readonly localHashes = new Map<number, string>();
  private readonly remoteHashes = new Map<number, Map<string, string>>();
  private readonly authoritySnapshots = new Map<number, unknown>();
  private readonly hashLog: Array<{ tick: number; hash: string }> = [];
  private startedAt = performance.now();
  private latencyMs: number | null = null;
  private desyncs = 0;
  private resyncs = 0;
  private lastResyncTick: number | null = null;
  private paused = false;
  private error: string | null = null;
  private pendingDesyncTick: number | null = null;
  private snapshotSendQueue: Promise<void> = Promise.resolve();
  private desyncAtTick: number | null;
  private readonly inputDelayTicks: number;
  private readonly hashEveryTicks: number;

  constructor(private readonly options: LockstepClientOptions) {
    this.code = options.code ?? '';
    this.inputDelayTicks = options.inputDelayTicks ?? DEFAULT_DELAY_TICKS;
    this.hashEveryTicks = options.hashEveryTicks ?? DEFAULT_HASH_EVERY_TICKS;
    this.desyncAtTick = options.desyncAtTick ?? null;
  }

  async connect(): Promise<void> {
    try {
      if (!this.code) this.code = await this.createRoom();
      const socket = new WebSocket(`${this.options.relayBase.replace(/^http/, 'ws')}/api/multiplayer/connect?code=${this.code}`);
      this.socket = socket;
      socket.addEventListener('message', (event) => this.handle(JSON.parse(String(event.data)) as WireMessage));
      socket.addEventListener('close', () => {
        if (this.connected) this.error = this.error ?? 'websocket_closed';
        this.connected = false;
      });
      socket.addEventListener('error', () => {
        this.error = 'websocket_error';
      });
      await new Promise<void>((resolve, reject) => {
        socket.addEventListener('open', () => resolve(), { once: true });
        socket.addEventListener('error', () => reject(new Error('websocket_error')), { once: true });
      });
      this.send({ v: VERSION, type: 'join', code: this.code, player: this.options.player });
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    }
  }

  dispose(): void {
    this.socket?.close();
    this.socket = null;
    this.connected = false;
  }

  pump(localInput: LockstepInput): LockstepTick | null {
    if (!this.connected || this.paused || this.roster.length < 2) return null;
    while (this.nextInputTick <= this.nextSimTick + this.inputDelayTicks) {
      this.send({ v: VERSION, type: 'input', tick: this.nextInputTick, input: localInput });
      this.sendTimes.set(this.nextInputTick, performance.now());
      this.nextInputTick += 1;
    }
    const bundle = this.bundles.get(this.nextSimTick);
    if (!bundle) return null;
    const tick = this.nextSimTick;
    this.bundles.delete(tick);
    this.consumedBundles.set(tick, bundle);
    this.pruneConsumedBundles(tick);
    this.latencyMs = Math.round(performance.now() - (this.sendTimes.get(tick) ?? performance.now()));
    this.sendTimes.delete(tick);
    this.nextSimTick = tick + 1;
    return bundle;
  }

  shouldExchangeHash(tick: number): boolean {
    return tick > 0 && tick % this.hashEveryTicks === 0;
  }

  afterSimTick(tick: number, hash: string, snapshot: unknown | null): void {
    if (!this.connected || !this.shouldExchangeHash(tick)) return;
    const sentHash = tick === this.desyncAtTick ? `${hash}:injected` : hash;
    if (snapshot && this.playerId === this.roster[0]?.playerId) {
      const prepared = prepareLockstepSnapshotTransport(snapshot);
      if (prepared instanceof Promise) {
        this.snapshotSendQueue = this.snapshotSendQueue
          .then(async () => {
            const wireSnapshot = await prepared;
            if (!this.connected) return;
            this.rememberAuthoritySnapshot(tick, wireSnapshot);
            this.send({ v: VERSION, type: 'snapshot-push', tick, snapshot: wireSnapshot });
            this.recordHash(tick, sentHash);
          })
          .catch(() => this.failSession('snapshot_encode_failed'));
        return;
      }
      this.rememberAuthoritySnapshot(tick, prepared);
      this.send({ v: VERSION, type: 'snapshot-push', tick, snapshot: prepared });
    }
    this.recordHash(tick, sentHash);
  }

  private recordHash(tick: number, sentHash: string): void {
    this.localHashes.set(tick, sentHash);
    this.hashLog.push({ tick, hash: sentHash });
    if (this.hashLog.length > MAX_HASH_HISTORY) this.hashLog.splice(0, this.hashLog.length - MAX_HASH_HISTORY);
    this.send({ v: VERSION, type: 'hash', tick, hash: sentHash });
    this.pruneHashState(tick);
    this.compareHashes(tick);
  }

  state(): MultiplayerState {
    return {
      active: true,
      connected: this.connected,
      code: this.code,
      playerId: this.playerId,
      roster: [...this.roster],
      tick: this.nextSimTick,
      buffered: this.bundles.size,
      latencyMs: this.latencyMs,
      tickRate: Number((this.nextSimTick / Math.max(0.001, (performance.now() - this.startedAt) / 1000)).toFixed(1)),
      hashes: [...this.hashLog],
      desyncs: this.desyncs,
      resyncs: this.resyncs,
      lastResyncTick: this.lastResyncTick,
      paused: this.paused,
      error: this.error,
    };
  }

  injectDesyncAt(tick: number): void {
    this.desyncAtTick = Math.max(0, Math.floor(tick));
  }

  private async createRoom(): Promise<string> {
    const response = await fetch(`${this.options.relayBase}/api/multiplayer/create`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    const body = (await response.json()) as { code?: string; error?: string };
    if (!response.ok || !body.code) throw new Error(body.error ?? 'room_create_failed');
    return body.code;
  }

  private handle(message: WireMessage): void {
    if (message.type === 'joined') {
      this.connected = true;
      this.playerId = typeof message.playerId === 'string' ? message.playerId : null;
      this.roster = normalizeRoster(message.roster);
      this.startedAt = performance.now();
      return;
    }
    if (message.type === 'roster') {
      this.roster = normalizeRoster(message.players);
      return;
    }
    if (message.type === 'tick-inputs') {
      const tick = normalizeTick(message.tick);
      if (tick === null || tick < this.nextSimTick) return;
      this.bundles.set(tick, { tick, inputs: normalizeInputs(message.inputs) });
      return;
    }
    if (message.type === 'hash') {
      const tick = normalizeTick(message.tick);
      if (tick === null || typeof message.hash !== 'string') return;
      if (this.lastResyncTick !== null && tick <= this.lastResyncTick) return;
      const from = typeof message.from === 'string' ? message.from : 'remote';
      const peers = this.remoteHashes.get(tick) ?? new Map<string, string>();
      peers.set(from, message.hash);
      this.remoteHashes.set(tick, peers);
      this.compareHashes(tick);
      return;
    }
    if (message.type === 'snapshot') {
      const tick = normalizeTick(message.tick);
      const from = typeof message.from === 'string' ? message.from : null;
      if (tick !== null) void this.restoreSnapshot(message.snapshot, tick, from);
      return;
    }
    if (message.type === 'snapshot-available') {
      const tick = normalizeTick(message.tick);
      const from = typeof message.from === 'string' ? message.from : null;
      if (
        tick !== null &&
        this.paused &&
        tick === this.pendingDesyncTick &&
        from === this.roster[0]?.playerId &&
        this.playerId !== from
      ) {
        this.send({ v: VERSION, type: 'snapshot-request', tick });
      }
      return;
    }
    if (message.type === 'snapshot-missing' && this.paused) {
      this.failSession('snapshot_missing');
      return;
    }
    if (message.type === 'error') this.error = typeof message.error === 'string' ? message.error : 'relay_error';
  }

  private desync(tick: number): void {
    if (this.paused) return;
    this.paused = true;
    this.pendingDesyncTick = tick;
    this.desyncs += 1;
    this.options.onDesync?.(tick);
    if (this.playerId === this.roster[0]?.playerId) this.republishAuthoritySnapshot(tick);
  }

  private compareHashes(tick: number): void {
    const local = this.localHashes.get(tick);
    const remotes = this.remoteHashes.get(tick);
    if (!local || !remotes || remotes.size < Math.max(1, this.roster.length - 1)) return;
    this.localHashes.delete(tick);
    this.remoteHashes.delete(tick);
    if ([...remotes.values()].some((remote) => remote !== local)) this.desync(tick);
  }

  private async restoreSnapshot(snapshot: unknown, tick: number, from: string | null): Promise<void> {
    if (this.lastResyncTick !== null && tick <= this.lastResyncTick) {
      if (this.paused) this.failSession('snapshot_stale');
      return;
    }
    if (!this.paused || this.pendingDesyncTick === null || tick !== this.pendingDesyncTick) {
      this.failSession('snapshot_tick_mismatch');
      return;
    }
    if (!from || from !== this.roster[0]?.playerId) {
      this.failSession('snapshot_authority_mismatch');
      return;
    }
    const resumeTick = tick + 1;
    const replay: LockstepTick[] = [];
    for (let replayTick = resumeTick; replayTick < this.nextSimTick; replayTick += 1) {
      const bundle = this.consumedBundles.get(replayTick);
      if (!bundle) {
        this.failSession('snapshot_replay_incomplete');
        return;
      }
      replay.push(bundle);
    }
    let decoded: unknown;
    try {
      decoded = await decodeLockstepSnapshotTransport(snapshot);
    } catch {
      this.failSession('snapshot_decode_failed');
      return;
    }
    if (!this.options.onSnapshot?.(decoded, tick)) {
      this.failSession('snapshot_restore_failed');
      return;
    }

    for (const bufferedTick of this.bundles.keys()) {
      if (bufferedTick < resumeTick) this.bundles.delete(bufferedTick);
    }
    for (const bundle of replay) this.bundles.set(bundle.tick, bundle);
    for (const consumedTick of this.consumedBundles.keys()) {
      if (consumedTick < resumeTick) this.consumedBundles.delete(consumedTick);
    }
    for (const sentTick of this.sendTimes.keys()) {
      if (sentTick < resumeTick) this.sendTimes.delete(sentTick);
    }
    this.localHashes.clear();
    this.remoteHashes.clear();
    for (let index = this.hashLog.length - 1; index >= 0; index -= 1) {
      if ((this.hashLog[index]?.tick ?? -1) > tick) this.hashLog.splice(index, 1);
    }
    this.nextSimTick = resumeTick;
    this.nextInputTick = Math.max(this.nextInputTick, resumeTick);
    this.lastResyncTick = tick;
    this.pendingDesyncTick = null;
    this.paused = false;
    this.resyncs += 1;
  }

  private rememberAuthoritySnapshot(tick: number, snapshot: unknown): void {
    this.authoritySnapshots.set(tick, snapshot);
    const oldestRetainedTick = tick - this.hashEveryTicks * 2;
    for (const savedTick of this.authoritySnapshots.keys()) {
      if (savedTick < oldestRetainedTick) this.authoritySnapshots.delete(savedTick);
    }
  }

  private republishAuthoritySnapshot(tick: number): void {
    const snapshot = this.authoritySnapshots.get(tick);
    if (snapshot === undefined) {
      this.failSession('snapshot_authority_missing');
      return;
    }
    this.snapshotSendQueue = this.snapshotSendQueue
      .then(() => {
        if (!this.connected || !this.paused || this.pendingDesyncTick !== tick) return;
        this.send({ v: VERSION, type: 'snapshot-push', tick, snapshot });
        // WebSocket message order makes the exact-tick republish visible to the
        // relay before this request; peers request after snapshot-available.
        this.send({ v: VERSION, type: 'snapshot-request', tick });
      })
      .catch(() => this.failSession('snapshot_republish_failed'));
  }

  private pruneConsumedBundles(latestTick: number): void {
    const oldestRetainedTick = latestTick - (this.hashEveryTicks * 2 + this.inputDelayTicks);
    for (const tick of this.consumedBundles.keys()) {
      if (tick < oldestRetainedTick) this.consumedBundles.delete(tick);
    }
  }

  private pruneHashState(latestTick: number): void {
    const oldestRetainedTick = latestTick - this.hashEveryTicks * MAX_HASH_HISTORY;
    for (const tick of this.localHashes.keys()) if (tick < oldestRetainedTick) this.localHashes.delete(tick);
    for (const tick of this.remoteHashes.keys()) if (tick < oldestRetainedTick) this.remoteHashes.delete(tick);
  }

  private failSession(error: string): void {
    this.error = error;
    this.paused = false;
    this.pendingDesyncTick = null;
    this.connected = false;
    this.socket?.close(4001, error.slice(0, 120));
  }

  private send(value: WireMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(value));
  }
}

type EncodedLockstepSnapshot = {
  codec: typeof SNAPSHOT_CODEC;
  data: string;
};

export function prepareLockstepSnapshotTransport(snapshot: unknown): unknown | Promise<EncodedLockstepSnapshot> {
  const json = JSON.stringify(snapshot);
  const bytes = new TextEncoder().encode(json);
  if (bytes.byteLength <= SNAPSHOT_RAW_LIMIT_BYTES) return snapshot;
  return gzipTextBase64(json).then((data) => {
    const encoded: EncodedLockstepSnapshot = { codec: SNAPSHOT_CODEC, data };
    if (new TextEncoder().encode(JSON.stringify(encoded)).byteLength > SNAPSHOT_WIRE_LIMIT_BYTES) {
      throw new Error('snapshot_too_large');
    }
    return encoded;
  });
}

export async function decodeLockstepSnapshotTransport(snapshot: unknown): Promise<unknown> {
  if (!isEncodedLockstepSnapshot(snapshot)) return snapshot;
  return gunzipJsonBase64(snapshot.data, 5_000_000);
}

function isEncodedLockstepSnapshot(value: unknown): value is EncodedLockstepSnapshot {
  if (!value || typeof value !== 'object') return false;
  const encoded = value as { codec?: unknown; data?: unknown };
  return encoded.codec === SNAPSHOT_CODEC && typeof encoded.data === 'string';
}

export function multiplayerConfigFromSearch(search = window.location.search): LockstepClientOptions | null {
  const params = new URLSearchParams(search);
  if (params.get('mp') !== 'dev') return null;
  return {
    relayBase: (params.get('mpRelay') ?? window.location.origin).replace(/\/$/, ''),
    code: params.get('mpCode'),
    player: {
      name: params.get('mpName') ?? 'Rider',
      town: params.get('mpTown') ?? 'Home Claim',
    },
    desyncAtTick: params.has('mpDesyncAt') ? Number(params.get('mpDesyncAt')) : null,
  };
}

export function lockstepInputFromIntents(intents: Intents): LockstepInput {
  return {
    mx: roundAxis(intents.move.x),
    my: roundAxis(intents.move.y),
    confirm: intents.confirm,
    upgrade: intents.upgrade,
    rotateBuild: intents.rotateBuild,
    weaponToggle: intents.weaponToggle,
    build: intents.build,
    cancel: intents.cancel,
    buildSlot: intents.buildSlot,
    restart: intents.restart,
    pause: intents.pause,
    debugSpawn: intents.debugSpawn,
    debugXp: intents.debugXp,
  };
}

export function intentsFromLockstepInput(input: LockstepInput | null | undefined): Intents {
  const source = input ?? ZERO_INPUT;
  return {
    move: new THREE.Vector2(source.mx, source.my),
    confirm: source.confirm,
    upgrade: source.upgrade,
    rotateBuild: source.rotateBuild,
    weaponToggle: source.weaponToggle,
    build: source.build,
    cancel: source.cancel,
    buildSlot: source.buildSlot,
    restart: source.restart,
    pause: source.pause,
    mute: false,
    debugSpawn: source.debugSpawn,
    debugXp: source.debugXp,
  };
}

export function stableHash(value: unknown): string {
  const text = stableStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function normalizeRoster(value: unknown): MultiplayerPlayer[] {
  return Array.isArray(value)
    ? value
        .filter(isRecord)
        .map((entry) => ({
          playerId: String(entry.playerId ?? ''),
          name: String(entry.name ?? 'Rider'),
          town: String(entry.town ?? 'Home Claim'),
        }))
        .filter((entry) => entry.playerId)
    : [];
}

function normalizeInputs(value: unknown): LockstepTick['inputs'] {
  return Array.isArray(value)
    ? value
        .filter(isRecord)
        .map((entry) => ({
          playerId: String(entry.playerId ?? ''),
          input: normalizeInput(entry.input),
        }))
        .filter((entry) => entry.playerId)
    : [];
}

function normalizeInput(value: unknown): LockstepInput {
  if (!isRecord(value)) return ZERO_INPUT;
  return {
    mx: roundAxis(value.mx),
    my: roundAxis(value.my),
    confirm: value.confirm === true,
    upgrade: value.upgrade === true,
    rotateBuild: value.rotateBuild === true,
    weaponToggle: value.weaponToggle === true,
    build: value.build === true,
    cancel: value.cancel === true,
    buildSlot: Number.isInteger(value.buildSlot) ? Number(value.buildSlot) : null,
    restart: value.restart === true,
    pause: value.pause === true,
    debugSpawn: value.debugSpawn === true,
    debugXp: value.debugXp === true,
  };
}

function normalizeTick(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function roundAxis(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(-1, Math.min(1, Math.round(value * 1000) / 1000)) : 0;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!isRecord(value)) return JSON.stringify(value);
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
