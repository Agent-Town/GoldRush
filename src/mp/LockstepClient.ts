import * as THREE from 'three';
import type { Intents } from '../core/InputController';
import { gunzipJsonBase64, gzipTextBase64 } from '../core/GzipJson';
import { isBuildableId } from '../game/buildables';

export type LockstepPoint = { x: number; z: number };
export type LockstepBuildingRef = { id: string; index: number };

export type LockstepAction =
  | { type: 'place_build'; id: string; position: LockstepPoint; rotationSteps: number }
  | { type: 'weapon_toggle' }
  | { type: 'restart' }
  | { type: 'set_pause'; paused: boolean }
  | { type: 'debug_spawn' }
  | { type: 'debug_xp' }
  | { type: 'pick_upgrade'; id: string }
  | { type: 'skip_ceremony' }
  | { type: 'death_action'; choice: 'done' | 'secondary' }
  | { type: 'research_pick'; id: string }
  | { type: 'research_skip' }
  | { type: 'secure_choice'; choice: 'bank' | 'rush' }
  | { type: 'context_action'; action: 'upgrade' | 'demolish'; target: LockstepBuildingRef }
  | { type: 'context_action'; action: 'fund' }
  | { type: 'set_agent_rung'; level: number; granted: boolean }
  | { type: 'set_agent_ability'; ability: string; granted: boolean };

export type LockstepInput = {
  mx: number;
  my: number;
  actions: LockstepAction[];
};

export type LockstepSample = {
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
  pauseTarget: boolean | null;
  debugSpawn: boolean;
  debugXp: boolean;
  queuedActions: LockstepAction[];
};

export type MultiplayerSetup = {
  contractId: string;
  seed: string;
  difficultyPreset: string;
  meta: unknown;
  research: unknown;
};

export type MultiplayerPlayer = {
  playerId: string;
  name: string;
  town: string;
};

export type LockstepTick = {
  tick: number;
  roster: MultiplayerPlayer[];
  inputs: Array<{ playerId: string; input: LockstepInput }>;
};

export type MultiplayerState = {
  active: boolean;
  connected: boolean;
  partySize: number;
  started: boolean;
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
  reconnecting: boolean;
  reconnects: number;
  lastReconnectTick: number | null;
  lastReconnectReplayTicks: number | null;
  heldPlayerIds: string[];
  paused: boolean;
  error: string | null;
  setup: MultiplayerSetup | null;
};

type WireMessage = Record<string, unknown>;

export type LockstepClientOptions = {
  relayBase: string;
  code: string | null;
  player: { name: string; town: string };
  inputDelayTicks?: number;
  hashEveryTicks?: number;
  partySize?: number;
  desyncAtTick?: number | null;
  reconnectToken?: string | null;
  setup?: MultiplayerSetup;
  onDesync?: (tick: number) => void;
  onSnapshot?: (snapshot: unknown, tick: number) => boolean;
  captureReconnectInitialState?: () => unknown;
  onReconnectFromInitialState?: (snapshot: unknown) => boolean;
  onReconnectToken?: (token: string | null) => void;
};

const VERSION = 3;
const DEFAULT_DELAY_TICKS = 3;
const DEFAULT_HASH_EVERY_TICKS = 30;
const DEFAULT_RECONNECT_GRACE_MS = 60_000;
const RECONNECT_RETRY_MS = 10_000;
const HEARTBEAT_EVERY_MS = 15_000;
const MAX_HASH_HISTORY = 128;
const MAX_ACTIONS_PER_TICK = 24;
const SNAPSHOT_RAW_LIMIT_BYTES = 180 * 1024;
const SNAPSHOT_WIRE_LIMIT_BYTES = 190 * 1024;
const SNAPSHOT_CODEC = 'gzip-base64-v1';
const ZERO_INPUT: LockstepInput = {
  mx: 0,
  my: 0,
  actions: [],
};
type SampleActionState = Omit<LockstepSample, 'mx' | 'my' | 'queuedActions' | 'pauseTarget'>;
const ZERO_SAMPLE: SampleActionState = {
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
  private setup: MultiplayerSetup | null = null;
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
  private hashFloorTick: number | null = null;
  private reconnecting = false;
  private reconnects = 0;
  private lastReconnectTick: number | null = null;
  private lastReconnectReplayTicks: number | null = null;
  private reconnectToken: string | null;
  private reconnectGraceMs = DEFAULT_RECONNECT_GRACE_MS;
  private reconnectDeadline = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lastHeartbeatAt = performance.now();
  private connecting = false;
  private disposed = false;
  private terminal = false;
  private readonly heldPlayerIds = new Set<string>();
  private paused = false;
  private error: string | null = null;
  private pendingDesyncTick: number | null = null;
  private snapshotSendQueue: Promise<void> = Promise.resolve();
  private snapshotSendEpoch = 0;
  private socketGeneration = 0;
  private desyncAtTick: number | null;
  private readonly inputDelayTicks: number;
  private readonly hashEveryTicks: number;
  private readonly pendingActions: LockstepAction[] = [];
  private previousSample = { ...ZERO_SAMPLE };
  private reconnectInitialState: unknown;
  private hasReconnectInitialState = false;
  private reconnectSoloAfterReplay = false;
  private reconnectCurrentRoster: MultiplayerPlayer[] = [];

  constructor(private readonly options: LockstepClientOptions) {
    this.code = options.code ?? '';
    this.inputDelayTicks = options.inputDelayTicks ?? DEFAULT_DELAY_TICKS;
    this.hashEveryTicks = options.hashEveryTicks ?? DEFAULT_HASH_EVERY_TICKS;
    this.desyncAtTick = options.desyncAtTick ?? null;
    this.reconnectToken = normalizeReconnectToken(options.reconnectToken);
    if (this.reconnectToken) {
      this.reconnecting = true;
      this.paused = true;
      this.reconnectDeadline = Date.now() + this.reconnectGraceMs;
    }
  }

  async connect(): Promise<void> {
    this.disposed = false;
    await this.openSocket();
  }

  private async openSocket(): Promise<void> {
    if (this.disposed || this.terminal || this.connecting) return;
    this.connecting = true;
    let handshakeSent = false;
    try {
      if (!this.code) this.code = await this.createRoom();
      const socket = new WebSocket(`${this.options.relayBase.replace(/^http/, 'ws')}/api/multiplayer/connect?code=${this.code}`);
      this.socket = socket;
      this.socketGeneration += 1;
      this.snapshotSendQueue = Promise.resolve();
      socket.addEventListener('message', (event) => {
        if (this.socket !== socket) return;
        this.handle(JSON.parse(String(event.data)) as WireMessage, socket);
      });
      socket.addEventListener('close', () => {
        if (this.socket !== socket) return;
        this.socket = null;
        this.connected = false;
        if (this.disposed || this.terminal) return;
        if (this.reconnectToken) this.beginReconnect();
        else this.error = this.error ?? 'websocket_closed';
      });
      socket.addEventListener('error', () => {
        if (this.socket !== socket) return;
        if (!this.reconnecting) this.error = 'websocket_error';
      });
      await new Promise<void>((resolve, reject) => {
        socket.addEventListener('open', () => resolve(), { once: true });
        socket.addEventListener('error', () => reject(new Error('websocket_error')), { once: true });
      });
      this.send(this.reconnectToken
        ? { v: VERSION, type: 'rejoin', code: this.code, reconnectToken: this.reconnectToken }
        : { v: VERSION, type: 'join', code: this.code, player: this.options.player, setup: this.options.setup });
      handshakeSent = true;
    } catch (error) {
      if (this.reconnectToken) this.beginReconnect();
      else this.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.connecting = false;
      if (!handshakeSent && this.reconnecting && !this.connected) this.scheduleReconnect();
    }
  }

  dispose(): void {
    this.disposed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.close();
    this.socket = null;
    this.connected = false;
  }

  pump(localInput: LockstepSample): LockstepTick | null {
    const now = performance.now();
    if (this.connected && now - this.lastHeartbeatAt >= HEARTBEAT_EVERY_MS) {
      this.send({ v: VERSION, type: 'ping' });
      this.lastHeartbeatAt = now;
    }
    this.captureLocalActions(localInput);
    if (!this.connected || this.paused) return null;
    if (this.reconnectSoloAfterReplay && !this.bundles.has(this.nextSimTick)) {
      this.roster = this.reconnectCurrentRoster;
      return null;
    }
    if (this.roster.length < 2 && !this.reconnectSoloAfterReplay) return null;
    if (this.nextSimTick === 0 && this.roster.length < (this.options.partySize ?? 2)) return null;
    while (!this.reconnectSoloAfterReplay && this.nextInputTick <= this.nextSimTick + this.inputDelayTicks) {
      const input: LockstepInput = {
        mx: roundAxis(localInput.mx),
        my: roundAxis(localInput.my),
        actions: this.pendingActions.splice(0, MAX_ACTIONS_PER_TICK),
      };
      this.send({ v: VERSION, type: 'input', tick: this.nextInputTick, input });
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
    this.roster = bundle.roster;
    for (const playerId of this.heldPlayerIds) {
      if (!this.roster.some((player) => player.playerId === playerId)) this.heldPlayerIds.delete(playerId);
    }
    return bundle;
  }

  shouldExchangeHash(tick: number): boolean {
    return tick >= 0 && tick % this.hashEveryTicks === 0;
  }

  afterSimTick(tick: number, hash: string, snapshot: unknown | null): void {
    if (!this.connected || !this.shouldExchangeHash(tick)) return;
    const sentHash = tick === this.desyncAtTick ? `${hash}:injected` : hash;
    if (snapshot && this.playerId === this.roster[0]?.playerId) {
      const prepared = prepareLockstepSnapshotTransport(snapshot);
      if (prepared instanceof Promise) {
        const sourceSocket = this.socket;
        const sourceGeneration = this.socketGeneration;
        const sourceEpoch = this.snapshotSendEpoch;
        const encoded = prepared.then(
          (wireSnapshot) => ({ ok: true as const, wireSnapshot }),
          () => ({ ok: false as const }),
        );
        this.snapshotSendQueue = this.snapshotSendQueue.then(async () => {
          if (sourceEpoch !== this.snapshotSendEpoch) return;
          const result = await encoded;
          if (sourceEpoch !== this.snapshotSendEpoch || !this.connected || !this.isCurrentSocket(sourceSocket, sourceGeneration)) return;
          if (!result.ok) return this.failSession('snapshot_encode_failed');
          this.rememberAuthoritySnapshot(tick, result.wireSnapshot);
          this.send({ v: VERSION, type: 'snapshot-push', tick, snapshot: result.wireSnapshot });
          this.recordHash(tick, sentHash);
        }).catch(() => {
          if (sourceEpoch === this.snapshotSendEpoch && this.isCurrentSocket(sourceSocket, sourceGeneration)) {
            this.failSession('snapshot_encode_failed');
          }
        });
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
      partySize: this.options.partySize ?? 2,
      started: this.nextSimTick > 0,
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
      reconnecting: this.reconnecting,
      reconnects: this.reconnects,
      lastReconnectTick: this.lastReconnectTick,
      lastReconnectReplayTicks: this.lastReconnectReplayTicks,
      heldPlayerIds: [...this.heldPlayerIds],
      paused: this.paused,
      error: this.error,
      setup: this.setup ? structuredClone(this.setup) : null,
    };
  }

  injectDesyncAt(tick: number): void {
    this.desyncAtTick = Math.max(0, Math.floor(tick));
  }

  dropConnectionForTest(): void {
    this.socket?.close(4000, 'test_drop');
  }

  private async createRoom(): Promise<string> {
    const response = await fetch(`${this.options.relayBase}/api/multiplayer/create`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ setup: this.options.setup }),
    });
    const body = (await response.json()) as { code?: string; error?: string };
    if (!response.ok || !body.code) throw new Error(body.error ?? 'room_create_failed');
    return body.code;
  }

  private handle(message: WireMessage, sourceSocket?: WebSocket): void {
    if (message.type === 'joined') {
      const reconnectToken = normalizeReconnectToken(message.reconnectToken);
      if (!reconnectToken) return this.failSession('reconnect_token_missing');
      this.connected = true;
      this.playerId = typeof message.playerId === 'string' ? message.playerId : null;
      this.roster = normalizeRoster(message.roster);
      this.setup = normalizeSetup(message.setup) ?? normalizeSetup(this.options.setup);
      this.reconnectToken = reconnectToken;
      this.reconnectGraceMs = normalizeGraceMs(message.reconnectGraceMs);
      if (this.roster.length >= (this.options.partySize ?? 2)) this.rememberReconnectInitialState(true);
      this.options.onReconnectToken?.(reconnectToken);
      this.startedAt = performance.now();
      return;
    }
    if (message.type === 'rejoined') {
      this.reconnecting = true;
      this.paused = true;
      void this.restoreReconnect(message, sourceSocket);
      return;
    }
    if (message.type === 'player-held') {
      const playerId = cleanToken(message.playerId, 32);
      if (playerId) this.heldPlayerIds.add(playerId);
      return;
    }
    if (message.type === 'player-returned') {
      const playerId = cleanToken(message.playerId, 32);
      if (playerId) this.heldPlayerIds.delete(playerId);
      return;
    }
    if (message.type === 'roster') {
      const roster = normalizeRoster(message.players);
      const effectiveTick = normalizeTick(message.effectiveTick);
      // Once tick 0 starts, only the roster embedded in an authoritative tick
      // bundle may change simulation membership.
      if (effectiveTick === null || effectiveTick === 0) {
        this.roster = roster;
        if (this.connected && roster.length >= (this.options.partySize ?? 2)) this.rememberReconnectInitialState(true);
      }
      return;
    }
    if (message.type === 'tick-inputs') {
      const tick = normalizeTick(message.tick);
      if (tick === null || tick < this.nextSimTick) return;
      const roster = normalizeRoster(message.roster);
      this.bundles.set(tick, { tick, roster: roster.length > 0 ? roster : this.roster, inputs: normalizeInputs(message.inputs) });
      return;
    }
    if (message.type === 'hash') {
      const tick = normalizeTick(message.tick);
      if (tick === null || typeof message.hash !== 'string') return;
      if (this.hashFloorTick !== null && tick <= this.hashFloorTick) return;
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
      if (tick !== null) void this.restoreSnapshot(message.snapshot, tick, from, sourceSocket);
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
    if (message.type === 'error') {
      const error = typeof message.error === 'string' ? message.error : 'relay_error';
      if ((error === 'reconnect_snapshot_unavailable' || error === 'reconnect_replay_incomplete') && this.reconnectToken) {
        this.socket?.close(4002, error);
        this.beginReconnect();
      } else if (this.reconnecting || this.reconnectToken) this.failSession(error);
      else this.error = error;
    }
  }

  private async restoreReconnect(message: WireMessage, sourceSocket?: WebSocket): Promise<void> {
    const playerId = cleanToken(message.playerId, 32);
    const reconnectToken = normalizeReconnectToken(message.reconnectToken);
    const nextTick = normalizeTick(message.nextTick);
    const currentRoster = normalizeRoster(message.roster);
    const setup = normalizeSetup(message.setup) ?? normalizeSetup(this.options.setup);
    const replay = normalizeReplay(message.replay);
    if (!playerId || !reconnectToken || nextTick === null || currentRoster.length < 1 ||
      !currentRoster.some((player) => player.playerId === playerId) || !setup || !replay) {
      this.failSession('reconnect_bootstrap_invalid');
      return;
    }

    this.playerId = playerId;
    this.roster = currentRoster;
    this.setup = setup;
    this.reconnectGraceMs = normalizeGraceMs(message.reconnectGraceMs);
    let resumeTick = 0;
    let snapshotTick: number | null = null;
    let snapshotTransport: unknown;
    let restoreFromInitialState = false;
    let restoreRoster = currentRoster;
    if (isRecord(message.authoritySnapshot)) {
      const from = cleanToken(message.authoritySnapshot.from, 32);
      snapshotTick = normalizeTick(message.authoritySnapshot.tick);
      const snapshotRoster = normalizeRoster(message.authoritySnapshot.roster);
      if (snapshotTick === null || snapshotTick >= nextTick || snapshotRoster.length < 2 || from !== snapshotRoster[0]?.playerId) {
        this.failSession('reconnect_snapshot_invalid');
        return;
      }
      snapshotTransport = message.authoritySnapshot.snapshot;
      resumeTick = snapshotTick + 1;
      restoreRoster = snapshotRoster;
    } else if (message.authoritySnapshot !== null) {
      this.failSession('reconnect_snapshot_invalid');
      return;
    } else {
      restoreFromInitialState = nextTick > 0;
      restoreRoster = replay[0]?.roster ?? currentRoster;
    }

    let previousRoster = restoreRoster;
    const invalidReplay = replay.some((bundle, index) => {
      if (bundle.tick !== resumeTick + index || !isOrderedRosterSubset(bundle.roster, previousRoster)) return true;
      previousRoster = bundle.roster;
      return false;
    });
    if (replay.length !== nextTick - resumeTick || invalidReplay || !isOrderedRosterSubset(currentRoster, previousRoster)) {
      this.failSession('reconnect_replay_incomplete');
      return;
    }

    this.connected = true;
    this.roster = restoreRoster;
    if (restoreFromInitialState && !this.rememberReconnectInitialState()) {
      this.failSession('reconnect_initial_state_missing');
      return;
    }
    if (snapshotTick !== null) {
      let decoded: unknown;
      try {
        decoded = await decodeLockstepSnapshotTransport(snapshotTransport);
      } catch {
        if (sourceSocket && this.socket !== sourceSocket) return;
        this.failSession('snapshot_decode_failed');
        return;
      }
      if (sourceSocket && this.socket !== sourceSocket) return;
      if (!this.options.onSnapshot?.(decoded, snapshotTick)) {
        this.failSession('snapshot_restore_failed');
        return;
      }
    } else if (restoreFromInitialState && !this.options.onReconnectFromInitialState?.(this.reconnectInitialState)) {
      this.failSession('reconnect_initial_state_restore_failed');
      return;
    }

    this.bundles.clear();
    this.consumedBundles.clear();
    this.sendTimes.clear();
    this.localHashes.clear();
    this.remoteHashes.clear();
    this.authoritySnapshots.clear();
    this.hashLog.splice(0);
    this.pendingDesyncTick = null;
    for (const bundle of replay) this.bundles.set(bundle.tick, bundle);
    this.nextSimTick = resumeTick;
    this.nextInputTick = nextTick;
    this.reconnectSoloAfterReplay = currentRoster.length < 2 && nextTick > 0;
    this.reconnectCurrentRoster = currentRoster;
    this.reconnectToken = reconnectToken;
    this.options.onReconnectToken?.(reconnectToken);
    this.reconnecting = false;
    this.reconnectDeadline = 0;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.heldPlayerIds.delete(playerId);
    this.paused = false;
    this.error = null;
    this.reconnects += 1;
    this.lastReconnectTick = snapshotTick;
    this.lastReconnectReplayTicks = replay.length;
    this.hashFloorTick = snapshotTick;
    this.startedAt = performance.now() - this.nextSimTick * this.stepSeconds * 1000;
  }

  private rememberReconnectInitialState(replace = false): boolean {
    if (this.hasReconnectInitialState && !replace) return true;
    try {
      const state = this.options.captureReconnectInitialState?.();
      if (state === undefined) return false;
      this.reconnectInitialState = structuredClone(state);
      this.hasReconnectInitialState = true;
      return true;
    } catch {
      return false;
    }
  }

  private beginReconnect(): void {
    if (!this.reconnectToken || this.disposed || this.terminal) return;
    if (!this.reconnecting) {
      this.reconnecting = true;
      this.paused = true;
      this.error = null;
      this.reconnectDeadline = Date.now() + this.reconnectGraceMs;
      if (this.playerId) this.heldPlayerIds.add(this.playerId);
    }
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.connecting || this.disposed || this.terminal) return;
    if (Date.now() >= this.reconnectDeadline) return this.failSession('reconnect_expired');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (Date.now() >= this.reconnectDeadline) return this.failSession('reconnect_expired');
      void this.openSocket();
    }, RECONNECT_RETRY_MS);
  }

  private desync(tick: number): void {
    if (this.paused) return;
    this.paused = true;
    this.pendingDesyncTick = tick;
    this.snapshotSendEpoch += 1;
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

  private async restoreSnapshot(snapshot: unknown, tick: number, from: string | null, sourceSocket?: WebSocket): Promise<void> {
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
      if (sourceSocket && this.socket !== sourceSocket) return;
      this.failSession('snapshot_decode_failed');
      return;
    }
    if (sourceSocket && this.socket !== sourceSocket) return;
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
    this.hashFloorTick = tick;
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
    const sourceSocket = this.socket;
    const sourceGeneration = this.socketGeneration;
    this.snapshotSendQueue = this.snapshotSendQueue
      .then(async () => {
        if (!this.connected || !this.paused || this.pendingDesyncTick !== tick ||
          sourceSocket?.readyState !== WebSocket.OPEN || !this.isCurrentSocket(sourceSocket, sourceGeneration)) return;
        this.send({ v: VERSION, type: 'snapshot-push', tick, snapshot });
        await this.restoreSnapshot(snapshot, tick, this.playerId, sourceSocket ?? undefined);
      })
      .catch(() => {
        if (this.isCurrentSocket(sourceSocket, sourceGeneration)) this.failSession('snapshot_republish_failed');
      });
  }

  private isCurrentSocket(socket: WebSocket | null, generation: number): boolean {
    return this.socket === socket && this.socketGeneration === generation;
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
    this.terminal = true;
    this.error = error;
    this.paused = false;
    this.pendingDesyncTick = null;
    this.reconnecting = false;
    this.reconnectDeadline = 0;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.connected = false;
    this.reconnectToken = null;
    this.heldPlayerIds.clear();
    this.options.onReconnectToken?.(null);
    this.socket?.close(4001, error.slice(0, 120));
  }

  private send(value: WireMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(value));
  }

  private captureLocalActions(sample: LockstepSample): void {
    const { actions, next } = lockstepActionsFromSample(sample, this.previousSample);
    this.pendingActions.push(...actions);
    this.previousSample = next;
  }

}

export type LockstepSampleEdgeState = SampleActionState;

export function zeroLockstepSampleEdgeState(): LockstepSampleEdgeState {
  return { ...ZERO_SAMPLE };
}

/**
 * Converts one sampled tick into the semantic action list, edge-detected
 * against the previous sample. Shared by the multiplayer client and the
 * playbook recorder so both surfaces speak the identical intent vocabulary.
 */
export function lockstepActionsFromSample(
  sample: LockstepSample,
  previous: LockstepSampleEdgeState,
): { actions: LockstepAction[]; next: LockstepSampleEdgeState } {
  const edge = (key: keyof typeof ZERO_SAMPLE): boolean => sample[key] === true && previous[key] !== true;
  // InputController already emits these as one-sample pulses. Edge-detecting
  // them a second time drops legitimate consecutive samples (the rapid-Q
  // race that parked the snapshot gate).
  const actions: LockstepAction[] = [];
  if (sample.weaponToggle) actions.push({ type: 'weapon_toggle' });
  if (edge('restart')) actions.push({ type: 'restart' });
  if (edge('pause')) actions.push({ type: 'set_pause', paused: sample.pauseTarget ?? true });
  if (edge('debugSpawn')) actions.push({ type: 'debug_spawn' });
  if (sample.debugXp) actions.push({ type: 'debug_xp' });
  for (const action of sample.queuedActions) {
    const normalized = normalizeAction(action);
    if (normalized) actions.push(normalized);
  }
  return {
    actions,
    next: {
      confirm: sample.confirm,
      upgrade: sample.upgrade,
      rotateBuild: sample.rotateBuild,
      weaponToggle: sample.weaponToggle,
      build: sample.build,
      cancel: sample.cancel,
      buildSlot: sample.buildSlot,
      restart: sample.restart,
      pause: sample.pause,
      debugSpawn: sample.debugSpawn,
      debugXp: sample.debugXp,
    },
  };
}

/** Public wrapper over the wire-level action validator (used by playbook tape validation). */
export function normalizeLockstepAction(value: unknown): LockstepAction | null {
  return normalizeAction(value);
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
  const partySize = Number(params.get('mpParty'));
  return {
    relayBase: (params.get('mpRelay') ?? window.location.origin).replace(/\/$/, ''),
    code: params.get('mpCode'),
    player: {
      name: params.get('mpName') ?? 'Rider',
      town: params.get('mpTown') ?? 'Home Claim',
    },
    partySize: Number.isInteger(partySize) && partySize >= 2 && partySize <= 4 ? partySize : 2,
    desyncAtTick: params.has('mpDesyncAt') ? Number(params.get('mpDesyncAt')) : null,
  };
}

export function lockstepInputFromIntents(
  intents: Intents,
  options: {
    pauseTarget?: boolean | null;
    queuedActions?: LockstepAction[];
  } = {},
): LockstepSample {
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
    pauseTarget: options.pauseTarget ?? null,
    debugSpawn: intents.debugSpawn,
    debugXp: intents.debugXp,
    queuedActions: options.queuedActions ?? [],
  };
}

export function intentsFromLockstepInput(input: LockstepInput | null | undefined): Intents {
  const source = input ?? ZERO_INPUT;
  return {
    move: new THREE.Vector2(source.mx, source.my),
    confirm: false,
    upgrade: false,
    rotateBuild: false,
    weaponToggle: false,
    build: false,
    cancel: false,
    buildSlot: null,
    restart: false,
    pause: false,
    mute: false,
    debugSpawn: false,
    debugXp: false,
    debugPlant: false,
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

function isOrderedRosterSubset(next: readonly MultiplayerPlayer[], previous: readonly MultiplayerPlayer[]): boolean {
  let previousIndex = 0;
  for (const player of next) {
    let match: MultiplayerPlayer | undefined;
    while (previousIndex < previous.length && !match) {
      const candidate = previous[previousIndex];
      previousIndex += 1;
      if (candidate?.playerId === player.playerId) match = candidate;
    }
    if (!match || match.name !== player.name || match.town !== player.town) return false;
  }
  return true;
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

function normalizeReplay(value: unknown): LockstepTick[] | null {
  if (!Array.isArray(value) || value.length > 128) return null;
  const replay: LockstepTick[] = [];
  for (const entry of value) {
    if (!isRecord(entry) || entry.type !== 'tick-inputs') return null;
    const tick = normalizeTick(entry.tick);
    const roster = normalizeRoster(entry.roster);
    const inputs = normalizeInputs(entry.inputs);
    if (tick === null || roster.length < 1 || inputs.length !== roster.length ||
      inputs.some((input, index) => input.playerId !== roster[index]?.playerId)) return null;
    replay.push({ tick, roster, inputs });
  }
  return replay;
}

function normalizeInput(value: unknown): LockstepInput {
  if (!isRecord(value)) return ZERO_INPUT;
  return {
    mx: roundAxis(value.mx),
    my: roundAxis(value.my),
    actions: Array.isArray(value.actions)
      ? value.actions.map(normalizeAction).filter((action): action is LockstepAction => action !== null).slice(0, MAX_ACTIONS_PER_TICK)
      : [],
  };
}

function normalizeAction(value: unknown): LockstepAction | null {
  if (!isRecord(value) || typeof value.type !== 'string') return null;
  if (value.type === 'place_build') {
    const id = cleanToken(value.id, 64);
    const position = normalizePoint(value.position);
    const rotationSteps = Number.isInteger(value.rotationSteps) ? ((Number(value.rotationSteps) % 4) + 4) % 4 : 0;
    return id && position ? { type: 'place_build', id, position, rotationSteps } : null;
  }
  if (
    value.type === 'weapon_toggle' ||
    value.type === 'restart' ||
    value.type === 'debug_spawn' ||
    value.type === 'debug_xp' ||
    value.type === 'skip_ceremony' ||
    value.type === 'research_skip'
  ) {
    return { type: value.type };
  }
  if (value.type === 'set_pause' && typeof value.paused === 'boolean') return { type: 'set_pause', paused: value.paused };
  if (value.type === 'pick_upgrade') {
    const id = cleanToken(value.id, 64);
    return id ? { type: 'pick_upgrade', id } : null;
  }
  if (value.type === 'death_action' && (value.choice === 'done' || value.choice === 'secondary')) {
    return { type: 'death_action', choice: value.choice };
  }
  if (value.type === 'research_pick') {
    const id = cleanToken(value.id, 64);
    return id ? { type: 'research_pick', id } : null;
  }
  if (value.type === 'secure_choice' && (value.choice === 'bank' || value.choice === 'rush')) {
    return { type: 'secure_choice', choice: value.choice };
  }
  if (value.type === 'context_action' && value.action === 'fund') return { type: 'context_action', action: 'fund' };
  if (value.type === 'context_action' && (value.action === 'upgrade' || value.action === 'demolish')) {
    const target = normalizeBuildingRef(value.target);
    return target ? { type: 'context_action', action: value.action, target } : null;
  }
  if (value.type === 'set_agent_rung' && Number.isInteger(value.level) && typeof value.granted === 'boolean') {
    return { type: 'set_agent_rung', level: Math.max(0, Math.min(3, Number(value.level))), granted: value.granted };
  }
  if (value.type === 'set_agent_ability' && typeof value.granted === 'boolean') {
    const ability = cleanToken(value.ability, 64);
    return ability === 'auto_collect' || ability === 'auto_repair' || ability === 'auto_pan' || ability === 'light_duty'
      ? { type: 'set_agent_ability', ability, granted: value.granted }
      : null;
  }
  return null;
}

function normalizePoint(value: unknown): LockstepPoint | null {
  if (!isRecord(value)) return null;
  const x = quantizedCoordinate(value.x);
  const z = quantizedCoordinate(value.z);
  return x === null || z === null ? null : { x, z };
}

function normalizeBuildingRef(value: unknown): LockstepBuildingRef | null {
  if (!isRecord(value)) return null;
  const id = cleanToken(value.id, 64);
  const index = Number.isInteger(value.index) ? Math.max(0, Math.min(255, Number(value.index))) : null;
  return isBuildableId(id) && index !== null ? { id, index } : null;
}

function quantizedCoordinate(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.round(Math.max(-256, Math.min(256, value)) * 1000) / 1000;
}

function normalizeSetup(value: unknown): MultiplayerSetup | null {
  if (!isRecord(value)) return null;
  const contractId = cleanToken(value.contractId, 64);
  const seed = cleanToken(value.seed, 96);
  const difficultyPreset = cleanToken(value.difficultyPreset, 32);
  if (!contractId || !seed || !difficultyPreset || !isRecord(value.meta) || !isRecord(value.research)) return null;
  return { contractId, seed, difficultyPreset, meta: structuredClone(value.meta), research: structuredClone(value.research) };
}

function cleanToken(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || null;
}

function normalizeTick(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function normalizeReconnectToken(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const token = value.toUpperCase();
  return /^[A-F0-9]{32}$/.test(token) ? token : null;
}

function normalizeGraceMs(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(1_000, Math.min(120_000, Math.floor(value)))
    : DEFAULT_RECONNECT_GRACE_MS;
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
