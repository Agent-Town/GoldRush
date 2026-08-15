import type { Intents } from '../core/InputController';
import type { RunEndReason } from '../core/EventBus';
import {
  lockstepActionsFromSample,
  lockstepInputFromIntents,
  normalizeLockstepAction,
  stableHash,
  zeroLockstepSampleEdgeState,
  type LockstepAction,
  type LockstepSampleEdgeState,
} from '../mp/LockstepClient';
import {
  MAX_PLAYBOOK_INTENTS,
  MAX_PLAYBOOK_TICKS,
  PLAYBOOK_STEP_SECONDS,
  PLAYBOOK_VERSION,
  quantizePlaybookCoordinate,
  validateEntries,
  validatePlaybook,
  type PlaybookEntry,
  type PlaybookRecording,
  type PlaybookTruncation,
} from '../playbook/PlaybookFormat';
import type { PlaybookProbe } from '../playbook/PlaybookSession';
import type { EconomySummary } from './Economy';
import type { StandingOrdersView } from '../agent/StandingOrders';
import { freshMetaProgress, type MetaProgress } from './MetaProgress';
import { freshResearchState, type ResearchState } from '../meta/ResearchTree';

export const RUN_TAPES_KEY = 'gr.tapes.v1';
export const RUN_TAPE_VERSION = 2 as const;
export const RUN_TAPE_SIM_VERSION = 1 as const;
export const RUN_TAPE_RECENT_LIMIT = 10;
export const MAX_SUBMITTED_TAPE_BYTES = 64 * 1024;

export type RunTapeOutcome = {
  reason: RunEndReason;
  secured: boolean;
  waves: number;
  timeAlive: number;
  gold: number;
};

export type RunTapeEventLog = {
  probes: PlaybookProbe[];
  kills: number;
  gold: number;
  wave: number;
  economy: EconomySummary;
};

export type RunTapeInputStream = {
  slot: number;
  start: { x: number; z: number };
  entries: PlaybookEntry[];
};

export type RunTapeInputLog = PlaybookRecording & {
  primarySlot: number;
  streams: RunTapeInputStream[];
};

export type RunTapeRunStart = {
  meta: MetaProgress;
  research: ResearchState;
};

export type RunTape = {
  version: 1 | typeof RUN_TAPE_VERSION;
  id: string;
  createdAt: number;
  kept: boolean;
  contract: string;
  seed: string;
  difficulty: string;
  simVersion: number;
  runStart?: RunTapeRunStart;
  inputLog: RunTapeInputLog;
  eventLogHash: string;
  outcome: RunTapeOutcome;
  annotations?: Array<{ atMs: number; text: string }>;
};

type RunTapeHeader = Pick<RunTape, 'contract' | 'seed' | 'difficulty'> & {
  start: { x: number; z: number };
  runStart?: RunTapeRunStart;
};

type TapeStorage = Pick<Storage, 'getItem' | 'setItem'>;
type StreamState = RunTapeInputStream & {
  edgeState: LockstepSampleEdgeState;
  mx: number;
  my: number;
};

const EVENT_HASH = /^fnv1a32:[a-f0-9]{8}$/;
const RUN_TAPE_RING_VERSION = 1;

export class RunTapeRecorder {
  private readonly id = crypto.randomUUID();
  private readonly createdAt = Date.now();
  private readonly entries: PlaybookEntry[] = [];
  private readonly probes: PlaybookProbe[] = [];
  private readonly pendingActions: LockstepAction[] = [];
  private readonly streams = new Map<number, StreamState>();
  private edgeState: LockstepSampleEdgeState = zeroLockstepSampleEdgeState();
  private tick = 0;
  private mx = 0;
  private my = 0;
  private truncation: PlaybookTruncation | null = null;
  private frozenEventLog: RunTapeEventLog | null = null;
  private primarySlot = 0;
  private stopped = false;

  private readonly header: RunTapeHeader & { runStart: RunTapeRunStart };

  constructor(header: RunTapeHeader) {
    const meta = freshMetaProgress();
    this.header = structuredClone({ ...header, runStart: header.runStart ?? { meta, research: freshResearchState(meta) } });
  }

  record(intents: Intents, position: { x: number; z: number }, queuedActions: LockstepAction[] = [], primarySlot = 0): void {
    if (this.stopped || this.truncation) return;
    if (this.tick >= MAX_PLAYBOOK_TICKS) return this.truncate('max-ticks');
    this.primarySlot = primarySlot;
    const queued = [...queuedActions];
    const seen = new Set(queued.map(stableHash));
    for (const action of this.pendingActions.splice(0)) {
      const hash = stableHash(action);
      if (!seen.has(hash)) queued.push(action);
      seen.add(hash);
    }
    const sample = lockstepInputFromIntents(intents, { queuedActions: queued });
    const { actions, next } = lockstepActionsFromSample(sample, this.edgeState);
    this.edgeState = next;
    this.append(this.tick, sample.mx, sample.my, actions);
    if (this.tick % 30 === 0) {
      this.probes.push({
        t: this.tick,
        x: quantizePlaybookCoordinate(position.x),
        z: quantizePlaybookCoordinate(position.z),
      });
    }
    this.tick += 1;
  }

  recordAdditional(slot: number, intents: Intents, position: { x: number; z: number }, queuedActions: LockstepAction[] = []): void {
    if (this.stopped || this.truncation || slot === this.primarySlot || this.tick === 0) return;
    let stream = this.streams.get(slot);
    if (!stream) {
      stream = {
        slot,
        start: { x: quantizePlaybookCoordinate(position.x), z: quantizePlaybookCoordinate(position.z) },
        entries: [],
        edgeState: zeroLockstepSampleEdgeState(),
        mx: 0,
        my: 0,
      };
      this.streams.set(slot, stream);
    }
    const sample = lockstepInputFromIntents(intents, { queuedActions });
    const { actions, next } = lockstepActionsFromSample(sample, stream.edgeState);
    stream.edgeState = next;
    this.appendStream(stream, this.tick - 1, sample.mx, sample.my, actions);
  }

  recordAction(action: LockstepAction): void {
    if (this.stopped || this.truncation) return;
    const normalized = normalizeLockstepAction(action);
    if (normalized) this.pendingActions.push(normalized);
  }

  get truncated(): boolean {
    return this.truncation !== null;
  }

  freezeEventLog(eventLog: RunTapeEventLog): void {
    this.frozenEventLog ??= structuredClone(eventLog);
  }

  finish(outcome: RunTapeOutcome, eventLog: RunTapeEventLog): RunTape {
    this.stopped = true;
    return this.snapshot(outcome, eventLog);
  }

  snapshot(outcome: RunTapeOutcome, eventLog: RunTapeEventLog): RunTape {
    const inputLog: RunTapeInputLog = {
      version: PLAYBOOK_VERSION,
      name: this.id,
      contractId: this.header.contract,
      seed: this.header.seed,
      difficultyPreset: this.header.difficulty,
      stepSeconds: PLAYBOOK_STEP_SECONDS,
      start: {
        x: quantizePlaybookCoordinate(this.header.start.x),
        z: quantizePlaybookCoordinate(this.header.start.z),
      },
      durationTicks: this.truncation?.atTick ?? this.tick,
      entries: this.entries.map((entry) => ({ ...entry, a: entry.a.map((action) => ({ ...action })) })),
      truncated: this.truncation,
      primarySlot: this.primarySlot,
      streams: [...this.streams.values()]
        .sort((a, b) => a.slot - b.slot)
        .map((stream) => ({
          slot: stream.slot,
          start: { ...stream.start },
          entries: stream.entries.map((entry) => ({ ...entry, a: entry.a.map((action) => ({ ...action })) })),
        })),
    };
    return {
      version: RUN_TAPE_VERSION,
      id: this.id,
      createdAt: this.createdAt,
      kept: false,
      contract: this.header.contract,
      seed: this.header.seed,
      difficulty: this.header.difficulty,
      simVersion: RUN_TAPE_SIM_VERSION,
      runStart: structuredClone(this.header.runStart),
      inputLog,
      eventLogHash: runTapeEventLogHash(this.frozenEventLog ?? eventLog),
      outcome,
    };
  }

  eventLog(): Pick<RunTapeEventLog, 'probes'> {
    return { probes: this.probes.map((probe) => ({ ...probe })) };
  }

  private append(t: number, mx: number, my: number, actions: LockstepAction[]): void {
    const moved = mx !== this.mx || my !== this.my;
    if (!moved && actions.length === 0) return;
    const last = this.entries.at(-1);
    if (last?.t === t) {
      last.mx = mx;
      last.my = my;
      last.a.push(...actions.map((action) => ({ ...action })));
    } else {
      if (this.entries.length >= MAX_PLAYBOOK_INTENTS) return this.truncate('max-entries');
      this.entries.push({ t, mx, my, a: actions.map((action) => ({ ...action })) });
    }
    this.mx = mx;
    this.my = my;
  }

  private appendStream(stream: StreamState, t: number, mx: number, my: number, actions: LockstepAction[]): void {
    if (mx === stream.mx && my === stream.my && actions.length === 0) return;
    if (stream.entries.length >= MAX_PLAYBOOK_INTENTS) return this.truncate('max-entries');
    stream.entries.push({ t, mx, my, a: actions.map((action) => ({ ...action })) });
    stream.mx = mx;
    stream.my = my;
  }

  private truncate(reason: PlaybookTruncation['reason']): void {
    this.truncation = { reason, atTick: this.tick };
    console.warn(`[run-tape] recording truncated: ${reason} at tick ${this.tick}`);
  }
}

export function runTapeEventLogHash(eventLog: RunTapeEventLog): string {
  return stableHash(eventLog);
}

export function agentOrdersEventLogHash(orders: StandingOrdersView): string {
  return stableHash({ orders: orders.log
    .filter((event) => event.type === 'orders_replaced')
    .map(({ at: _at, seq: _seq, ...event }) => event) });
}

export function submittedRunTape(tape: RunTape): RunTape | undefined {
  return byteSize(JSON.stringify(tape)) <= MAX_SUBMITTED_TAPE_BYTES ? tape : undefined;
}

export function readRunTapes(storage: TapeStorage): RunTape[] {
  try {
    const value = JSON.parse(storage.getItem(RUN_TAPES_KEY) ?? 'null') as unknown;
    if (!isRecord(value) || value.version !== RUN_TAPE_RING_VERSION || !Array.isArray(value.tapes)) return [];
    return value.tapes.map(validateRunTape).filter((tape): tape is RunTape => tape !== null);
  } catch {
    return [];
  }
}

export function appendRunTape(storage: TapeStorage, tape: RunTape): boolean {
  const tapes = readRunTapes(storage).filter((entry) => entry.id !== tape.id);
  tapes.push(tape);
  return writeRing(storage, tapes);
}

export function keepRunTape(storage: TapeStorage, id: string): boolean {
  const tapes = readRunTapes(storage);
  const tape = tapes.find((entry) => entry.id === id);
  if (!tape) return false;
  tape.kept = true;
  return writeRing(storage, tapes);
}

function writeRing(storage: TapeStorage, tapes: RunTape[]): boolean {
  const sorted = tapes.sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));
  const kept = sorted.filter((tape, index) => index < RUN_TAPE_RECENT_LIMIT || tape.kept);
  try {
    storage.setItem(RUN_TAPES_KEY, JSON.stringify({ version: RUN_TAPE_RING_VERSION, tapes: kept }));
    return true;
  } catch {
    return false;
  }
}

// Exported for TAPE-03: a reel fetched from the county board is untrusted bytes off the network
// and gets the same validator the local ring already trusts, rather than a second, weaker one.
export function validateRunTape(value: unknown): RunTape | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ['version', 'id', 'createdAt', 'kept', 'contract', 'seed', 'difficulty', 'simVersion', 'runStart', 'inputLog', 'eventLogHash', 'outcome', 'annotations'])) return null;
  if ((value.version !== 1 && value.version !== RUN_TAPE_VERSION) || !Number.isSafeInteger(value.simVersion) || (value.simVersion as number) < 1) return null;
  if (typeof value.id !== 'string' || !value.id || typeof value.createdAt !== 'number' || !Number.isSafeInteger(value.createdAt)) return null;
  if (typeof value.kept !== 'boolean' || typeof value.contract !== 'string' || !value.contract) return null;
  if (typeof value.seed !== 'string' || typeof value.difficulty !== 'string' || !value.difficulty) return null;
  if (typeof value.eventLogHash !== 'string' || !EVENT_HASH.test(value.eventLogHash)) return null;
  const parsed = validatePlaybook(value.inputLog);
  const streams = validateInputStreams(value.inputLog, parsed.ok ? parsed.playbook.durationTicks : 0);
  const outcome = validateOutcome(value.outcome);
  const annotations = validateAnnotations(value.annotations);
  const runStart = validateRunStart(value.runStart);
  if (!parsed.ok || !streams || !outcome || annotations === null || (value.version === RUN_TAPE_VERSION ? !runStart : value.runStart !== undefined) || parsed.playbook.contractId !== value.contract || parsed.playbook.seed !== value.seed || parsed.playbook.difficultyPreset !== value.difficulty) return null;
  return {
    version: value.version,
    id: value.id,
    createdAt: value.createdAt,
    kept: value.kept,
    contract: value.contract,
    seed: value.seed,
    difficulty: value.difficulty,
    simVersion: value.simVersion as number,
    ...(runStart ? { runStart } : {}),
    inputLog: { ...parsed.playbook, ...streams },
    eventLogHash: value.eventLogHash,
    outcome,
    ...(annotations ? { annotations } : {}),
  };
}

function validateRunStart(value: unknown): RunTapeRunStart | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ['meta', 'research'])) return null;
  const meta = validateMeta(value.meta);
  if (!meta || !isRecord(value.research) || !hasOnlyKeys(value.research, ['version', 'epochId', 'metaScienceCursor', 'progress', 'taken', 'proposalSalt', 'pinnedTarget', 'unlocks'])) return null;
  const researchMeta = validateMeta(value.research.progress);
  const epochId = value.research.epochId;
  const cursor = value.research.metaScienceCursor;
  const taken = value.research.taken;
  const salt = value.research.proposalSalt;
  const target = value.research.pinnedTarget;
  const unlocks = value.research.unlocks;
  if (value.research.version !== 1 || !researchMeta || (epochId !== undefined && !token(epochId)) || (cursor !== undefined && !nonNegativeInteger(cursor))
    || !Array.isArray(taken) || taken.length > 256 || !taken.every(token) || new Set(taken).size !== taken.length
    || !nonNegativeInteger(salt) || (target !== null && !token(target))
    || (unlocks !== undefined && (!isRecord(unlocks) || !hasOnlyKeys(unlocks, ['rocketCartCaptured']) || (unlocks.rocketCartCaptured !== undefined && typeof unlocks.rocketCartCaptured !== 'boolean')))) return null;
  return {
    meta,
    research: {
      version: 1,
      ...(epochId === undefined ? {} : { epochId }),
      ...(cursor === undefined ? {} : { metaScienceCursor: cursor }),
      progress: researchMeta,
      taken: [...taken],
      proposalSalt: salt,
      pinnedTarget: target,
      ...(unlocks === undefined ? {} : { unlocks: { ...unlocks } }),
    },
  };
}

function validateMeta(value: unknown): MetaProgress | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ['version', 'tracks']) || value.version !== 1 || !isRecord(value.tracks)
    || !hasOnlyKeys(value.tracks, ['territory', 'science', 'hero', 'agent'])) return null;
  const { territory, science, hero, agent } = value.tracks;
  if (!nonNegativeInteger(territory) || !nonNegativeInteger(science) || !nonNegativeInteger(hero) || !nonNegativeInteger(agent)) return null;
  return { version: 1, tracks: { territory, science, hero, agent } };
}

function token(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 64;
}

function nonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function validateAnnotations(value: unknown): RunTape['annotations'] | null {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return null;
  const annotations: NonNullable<RunTape['annotations']> = [];
  for (const annotation of value) {
    if (!isRecord(annotation) || !hasOnlyKeys(annotation, ['atMs', 'text'])) return null;
    if (!nonNegativeNumber(annotation.atMs) || typeof annotation.text !== 'string') return null;
    annotations.push({ atMs: annotation.atMs, text: annotation.text });
  }
  return annotations;
}

function validateInputStreams(value: unknown, durationTicks: number): Pick<RunTapeInputLog, 'primarySlot' | 'streams'> | null {
  if (!isRecord(value) || !Number.isInteger(value.primarySlot) || (value.primarySlot as number) < 0 || (value.primarySlot as number) > 3) return null;
  if (!Array.isArray(value.streams) || value.streams.length > 3) return null;
  const streams: RunTapeInputStream[] = [];
  const slots = new Set<number>([value.primarySlot as number]);
  for (const candidate of value.streams) {
    if (!isRecord(candidate) || !hasOnlyKeys(candidate, ['slot', 'start', 'entries'])) return null;
    if (!Number.isInteger(candidate.slot) || (candidate.slot as number) < 0 || (candidate.slot as number) > 3 || slots.has(candidate.slot as number)) return null;
    if (!isRecord(candidate.start) || !hasOnlyKeys(candidate.start, ['x', 'z'])) return null;
    if (!nonNegativeCoordinate(candidate.start.x) || !nonNegativeCoordinate(candidate.start.z)) return null;
    const entries = validateEntries(candidate.entries, durationTicks);
    if (!entries.ok) return null;
    slots.add(candidate.slot as number);
    streams.push({
      slot: candidate.slot as number,
      start: { x: candidate.start.x, z: candidate.start.z },
      entries: entries.entries,
    });
  }
  return { primarySlot: value.primarySlot as number, streams };
}

function nonNegativeCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -256 && value <= 256;
}

function validateOutcome(value: unknown): RunTapeOutcome | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ['reason', 'secured', 'waves', 'timeAlive', 'gold'])) return null;
  if (value.reason !== 'death' && value.reason !== 'secured' && value.reason !== 'rush') return null;
  if (typeof value.secured !== 'boolean' || !nonNegativeNumber(value.timeAlive) || !nonNegativeNumber(value.gold)) return null;
  if (!Number.isSafeInteger(value.waves) || (value.waves as number) < 0) return null;
  return { reason: value.reason, secured: value.secured, waves: value.waves as number, timeAlive: value.timeAlive, gold: value.gold };
}

function nonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function byteSize(value: string): number {
  return new TextEncoder().encode(value).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
