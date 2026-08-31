import { normalizeLockstepAction, stableHash, type LockstepAction } from '../mp/LockstepClient';
import { validateStandingOrders, type StandingOrder } from '../agent/StandingOrders';
import atomicContracts from '../../assets/contracts/epoch-6-atomic/contracts.json' with { type: 'json' };
import deepwaterContracts from '../../assets/contracts/epoch-5-deepwater/contracts.json' with { type: 'json' };
import deepskyContracts from '../../assets/contracts/epoch-10-deepsky/contracts.json' with { type: 'json' };
import frontierContracts from '../../assets/contracts/epoch-1-frontier/contracts.json' with { type: 'json' };
import motorContracts from '../../assets/contracts/epoch-4-motor/contracts.json' with { type: 'json' };
import orbitalContracts from '../../assets/contracts/epoch-8-orbital/contracts.json' with { type: 'json' };
import redfieldsContracts from '../../assets/contracts/epoch-9-redfields/contracts.json' with { type: 'json' };
import signalContracts from '../../assets/contracts/epoch-7-signal/contracts.json' with { type: 'json' };
import steamworksContracts from '../../assets/contracts/epoch-2-steamworks/contracts.json' with { type: 'json' };
import voltageContracts from '../../assets/contracts/epoch-3-voltage/contracts.json' with { type: 'json' };
import { Balance } from '../game/Balance';

// PB-01 format law (specs/playbook-core/README.md): a playbook is SIM TRUTH only —
// per-tick movement intent plus semantic lockstep actions. Never raw input codes,
// never camera/screen coordinates, never wall-clock times. Validation hashes the
// canonical text (audit boundary: normalized semantics, never raw UUID-bearing logs).
export const PLAYBOOK_VERSION = 1 as const;
export const PLAYBOOK_STEP_SECONDS = 1 / 30;
// Law 6 bounds: one tile, one actor, <=10 minutes of sim time, <=2,000 intents.
// F-2302-1 split: this is the playbook-authoring bound. Door tapes use the
// contract envelope below because a faithful epic is not an authored strategy artifact.
export const MAX_PLAYBOOK_TICKS = 18_000;
export const MAX_PLAYBOOK_INTENTS = 2_000;

type EnvelopeContract = {
  id: string;
  twist?: { secureWave?: number; waveCadenceMult?: number; baron?: { wave: number } };
};

export type RunTapeEnvelope = {
  maxTicks: number;
  maxEntries: number;
  maxTapeBytes: number;
};

export const CONTRACT_BUNDLES = [
  frontierContracts,
  steamworksContracts,
  voltageContracts,
  motorContracts,
  deepwaterContracts,
  atomicContracts,
  signalContracts,
  orbitalContracts,
  redfieldsContracts,
  deepskyContracts,
];

const ASSAY_BOSS_GRACE_WAVES = 6;
// The retained Baron proof averages one change-point per 5.44 ticks and 140.7 bytes per entry.
// Five ticks, 160 bytes, and 16 KiB fixed overhead preserve measured margin without an open cap.
const RUN_TAPE_ENVELOPE_TICKS_PER_ENTRY = 5;
const RUN_TAPE_BYTES_PER_ENTRY = 160;
const RUN_TAPE_FIXED_BYTES = 16 * 1024;
const RUN_TAPE_CONTRACTS = new Map(
  CONTRACT_BUNDLES.flatMap((bundle) => (bundle.contracts as EnvelopeContract[])
    .map((contract) => [contract.id, contract.twist] as const)),
);

/** One bounded door envelope, derived from the contract clock for every admission axis. */
export function runTapeEnvelopeForContract(contractId: string): RunTapeEnvelope {
  const twist = RUN_TAPE_CONTRACTS.get(contractId);
  let maxTicks = MAX_PLAYBOOK_TICKS;
  if (twist?.secureWave) {
    const finalWave = twist.baron
      ? Math.max(twist.secureWave, twist.baron.wave) + ASSAY_BOSS_GRACE_WAVES
      : twist.secureWave;
    const cadence = Math.max(0.1, twist.waveCadenceMult ?? 1);
    // The sim takes one step through the final wave boundary, and gr-sim may record an accepted
    // order at that terminal instant. durationTicks is an exclusive end, so that lawful endpoint
    // needs one more slot: nominal boundary + terminal step + inclusive endpoint.
    const contractTicks = Math.ceil((finalWave * Balance.waves.waveInterval / cadence) / PLAYBOOK_STEP_SECONDS) + 2;
    maxTicks = Math.max(MAX_PLAYBOOK_TICKS, contractTicks);
  }
  const maxEntries = Math.ceil(maxTicks / RUN_TAPE_ENVELOPE_TICKS_PER_ENTRY);
  return {
    maxTicks,
    maxEntries,
    maxTapeBytes: RUN_TAPE_FIXED_BYTES + maxEntries * RUN_TAPE_BYTES_PER_ENTRY,
  };
}

export function maxRunTapeTicksForContract(contractId: string): number {
  return runTapeEnvelopeForContract(contractId).maxTicks;
}

/** One change-point on the tape: movement holds (mx,my) from tick t until the next entry; actions fire exactly at t. */
export type AgentOrdersAction = { kind: 'agent_orders'; orders: StandingOrder[] };
export type PlaybookAction = LockstepAction | AgentOrdersAction;
export type PlaybookEntry = { t: number; mx: number; my: number; a: PlaybookAction[] };

export function isAgentOrdersAction(action: PlaybookAction): action is AgentOrdersAction {
  return 'kind' in action && action.kind === 'agent_orders';
}

export type PlaybookTruncation = {
  reason: 'max-ticks' | 'max-entries' | 'run-ended';
  atTick: number;
};

export type PlaybookRecording = {
  version: typeof PLAYBOOK_VERSION;
  name: string;
  contractId: string;
  seed: string;
  difficultyPreset: string;
  stepSeconds: number;
  start: { x: number; z: number };
  durationTicks: number;
  entries: PlaybookEntry[];
  truncated: PlaybookTruncation | null;
};

export function quantizePlaybookCoordinate(value: number): number {
  return Math.round(Math.max(-256, Math.min(256, value)) * 1000) / 1000;
}

function isQuantizedAxis(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= -1 &&
    value <= 1 &&
    value === Math.round(value * 1000) / 1000
  );
}

/** Canonical serialization: key-sorted, no whitespace. Byte-stability is a gate; this is the byte layout. */
export function canonicalPlaybookText(playbook: PlaybookRecording): string {
  return stableStringify(playbook);
}

export function playbookHash(playbook: PlaybookRecording): string {
  return stableHash(playbook);
}

export type PlaybookParseResult =
  | { ok: true; playbook: PlaybookRecording }
  | { ok: false; reason: string };

export function parsePlaybookText(text: string): PlaybookParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }
  return validatePlaybook(raw);
}

export function validatePlaybook(
  raw: unknown,
  maxDurationTicks = MAX_PLAYBOOK_TICKS,
  maxEntries = MAX_PLAYBOOK_INTENTS,
): PlaybookParseResult {
  if (!isRecord(raw)) return { ok: false, reason: 'not-an-object' };
  if (raw.version !== PLAYBOOK_VERSION) return { ok: false, reason: 'unsupported-version' };
  if (typeof raw.name !== 'string' || !raw.name.trim()) return { ok: false, reason: 'missing-name' };
  if (typeof raw.contractId !== 'string' || !raw.contractId) return { ok: false, reason: 'missing-contract' };
  if (typeof raw.seed !== 'string') return { ok: false, reason: 'missing-seed' };
  if (typeof raw.difficultyPreset !== 'string' || !raw.difficultyPreset) return { ok: false, reason: 'missing-difficulty' };
  if (raw.stepSeconds !== PLAYBOOK_STEP_SECONDS) return { ok: false, reason: 'step-mismatch' };
  if (!isRecord(raw.start) || typeof raw.start.x !== 'number' || typeof raw.start.z !== 'number') {
    return { ok: false, reason: 'missing-start' };
  }
  const durationTicks = raw.durationTicks;
  if (!Number.isInteger(durationTicks) || (durationTicks as number) < 0 || (durationTicks as number) > maxDurationTicks) {
    return { ok: false, reason: 'invalid-duration' };
  }
  const truncated = validateTruncation(raw.truncated);
  if (truncated === false) return { ok: false, reason: 'invalid-truncation' };
  const entries = validateEntries(raw.entries, durationTicks as number, maxEntries);
  if (!entries.ok) return { ok: false, reason: entries.reason };
  return {
    ok: true,
    playbook: {
      version: PLAYBOOK_VERSION,
      name: raw.name.trim(),
      contractId: raw.contractId,
      seed: raw.seed,
      difficultyPreset: raw.difficultyPreset,
      stepSeconds: PLAYBOOK_STEP_SECONDS,
      start: { x: quantizePlaybookCoordinate(raw.start.x), z: quantizePlaybookCoordinate(raw.start.z) },
      durationTicks: durationTicks as number,
      entries: entries.entries,
      truncated,
    },
  };
}

export type PlaybookEntriesResult =
  | { ok: true; entries: PlaybookEntry[] }
  | { ok: false; reason: string };

/**
 * Shared by tape validation and the debug intent-script input. A script shares
 * the tape's entry schema but is a DEMONSTRATION, not a playbook: it may run
 * longer than the intent bound — the recorder is what truncates the tape
 * loudly at law-6 limits.
 */
export function validateEntries(
  raw: unknown,
  durationTicks = MAX_PLAYBOOK_TICKS,
  maxEntries = MAX_PLAYBOOK_INTENTS,
): PlaybookEntriesResult {
  if (!Array.isArray(raw)) return { ok: false, reason: 'entries-not-array' };
  if (raw.length > maxEntries) return { ok: false, reason: 'too-many-entries' };
  const entries: PlaybookEntry[] = [];
  let previousTick = -1;
  for (const value of raw) {
    if (!isRecord(value)) return { ok: false, reason: 'entry-not-object' };
    const { t, mx, my, a } = value;
    if (!Number.isInteger(t) || (t as number) <= previousTick || (t as number) >= Math.max(durationTicks, 1)) {
      return { ok: false, reason: 'entry-tick-order' };
    }
    if (!isQuantizedAxis(mx) || !isQuantizedAxis(my)) return { ok: false, reason: 'entry-axis' };
    if (!Array.isArray(a)) return { ok: false, reason: 'entry-actions' };
    const actions: PlaybookAction[] = [];
    for (const candidate of a) {
      if (isRecord(candidate) && candidate.kind === 'agent_orders') {
        if (mx !== 0 || my !== 0) return { ok: false, reason: 'entry-axis' };
        if (Object.keys(candidate).some((key) => key !== 'kind' && key !== 'orders')) {
          return { ok: false, reason: 'entry-action-invalid' };
        }
        const validated = validateStandingOrders(candidate.orders);
        if (!validated.ok) return { ok: false, reason: 'entry-action-invalid' };
        actions.push({ kind: 'agent_orders', orders: structuredClone(validated.orders) });
        continue;
      }
      const action = normalizeLockstepAction(candidate);
      if (!action) return { ok: false, reason: 'entry-action-invalid' };
      actions.push(action);
    }
    previousTick = t as number;
    entries.push({ t: t as number, mx, my, a: actions });
  }
  return { ok: true, entries };
}

function validateTruncation(raw: unknown): PlaybookTruncation | null | false {
  if (raw === null || raw === undefined) return null;
  if (!isRecord(raw)) return false;
  if (raw.reason !== 'max-ticks' && raw.reason !== 'max-entries' && raw.reason !== 'run-ended') return false;
  if (!Number.isInteger(raw.atTick) || (raw.atTick as number) < 0) return false;
  return { reason: raw.reason, atTick: raw.atTick as number };
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
