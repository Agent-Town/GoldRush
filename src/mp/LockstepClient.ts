import * as THREE from 'three';
import type { Intents } from '../core/InputController';

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
  onSnapshot?: (snapshot: unknown) => boolean;
};

const VERSION = 1;
const DEFAULT_DELAY_TICKS = 3;
const DEFAULT_HASH_EVERY_TICKS = 30;
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
  private readonly sendTimes = new Map<number, number>();
  private readonly localHashes = new Map<number, string>();
  private readonly hashLog: Array<{ tick: number; hash: string }> = [];
  private startedAt = performance.now();
  private latencyMs: number | null = null;
  private desyncs = 0;
  private resyncs = 0;
  private paused = false;
  private error: string | null = null;
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
    this.bundles.delete(this.nextSimTick);
    this.latencyMs = Math.round(performance.now() - (this.sendTimes.get(this.nextSimTick) ?? performance.now()));
    this.sendTimes.delete(this.nextSimTick);
    this.nextSimTick += 1;
    return bundle;
  }

  shouldExchangeHash(tick: number): boolean {
    return tick > 0 && tick % this.hashEveryTicks === 0;
  }

  afterSimTick(tick: number, hash: string, snapshot: unknown | null): void {
    if (!this.connected || !this.shouldExchangeHash(tick)) return;
    if (snapshot) this.send({ v: VERSION, type: 'snapshot-push', tick, snapshot });
    const sentHash = tick === this.desyncAtTick ? `${hash}:injected` : hash;
    this.localHashes.set(tick, sentHash);
    this.hashLog.push({ tick, hash: sentHash });
    this.send({ v: VERSION, type: 'hash', tick, hash: sentHash });
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
      if (tick === null) return;
      this.bundles.set(tick, { tick, inputs: normalizeInputs(message.inputs) });
      return;
    }
    if (message.type === 'hash') {
      const tick = normalizeTick(message.tick);
      if (tick === null || typeof message.hash !== 'string') return;
      const local = this.localHashes.get(tick);
      if (local && local !== message.hash) this.desync(tick);
      return;
    }
    if (message.type === 'snapshot') {
      if (this.options.onSnapshot?.(message.snapshot)) {
        this.paused = false;
        this.resyncs += 1;
      }
      return;
    }
    if (message.type === 'error') this.error = typeof message.error === 'string' ? message.error : 'relay_error';
  }

  private desync(tick: number): void {
    if (this.paused) return;
    this.paused = true;
    this.desyncs += 1;
    this.options.onDesync?.(tick);
    this.send({ v: VERSION, type: 'snapshot-request' });
  }

  private send(value: WireMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(value));
  }
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
