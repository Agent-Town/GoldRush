import dispatchSource from '../../lore/world-dispatches.md?raw';
import { hasBaronMedal } from '../game/Medals';
import { META_PROGRESS_KEY } from '../game/MetaProgress';
import { activeProfile, markHintSeen } from '../game/ProfileStorage';
import { loadScores } from '../game/Scoreboard';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../encyclopedia/storage';
import { activeEpochId, listEpochs, loadEpoch } from '../meta/ContractFamilies';
import { researchStateKey } from '../meta/ResearchTree';

type DispatchTrigger =
  | { kind: 'era'; id: string }
  | { kind: 'contract'; id: string }
  | { kind: 'boss'; id: string }
  | { kind: 'science'; eraId: string; steps: number }
  | { kind: 'wave'; era?: number; waves: number }
  | { kind: 'ledger'; id: string }
  | { kind: 'story'; id: string }
  | { kind: 'board'; id: 'baron-rumor-1' | 'baron-rumor-2' };

export type MeiWorldDispatch = {
  id: string;
  era: number;
  milestone: string;
  line: string;
  trigger: DispatchTrigger;
};

const MILESTONE_TRIGGERS: Readonly<Record<string, DispatchTrigger>> = {
  'M2-2': { kind: 'ledger', id: 'building_boiler_house' },
  'M2-3': { kind: 'story', id: 'e2-hill-mine-first-visit' },
  'M2-4': { kind: 'wave', era: 2, waves: 1 },
  'M2-5': { kind: 'boss', id: 'e2-hill-mine' },
  'M3-2': { kind: 'contract', id: 'e3-blackout-ridge' },
  'M3-3': { kind: 'contract', id: 'e3-blackout-ridge' },
  'M3-4': { kind: 'contract', id: 'e3-fairground' },
  'M3-5': { kind: 'boss', id: 'e3-canyon-works' },
  'M4-2': { kind: 'contract', id: 'e4-gusher-county' },
  'M4-3': { kind: 'contract', id: 'e4-long-road' },
  'M4-4': { kind: 'contract', id: 'e4-dust-flats' },
  'M4-5': { kind: 'boss', id: 'e4-dust-flats' },
  'M5-2': { kind: 'contract', id: 'e5-deepwater-claim' },
  'M5-3': { kind: 'contract', id: 'e5-deepwater-claim' },
  'M5-4': { kind: 'contract', id: 'e5-deepwater-claim' },
  'M5-5': { kind: 'boss', id: 'e5-deepwater-claim' },
  'M6-2': { kind: 'contract', id: 'e6-glow-mesa' },
  'M6-3': { kind: 'contract', id: 'e6-glow-mesa' },
  'M6-4': { kind: 'boss', id: 'e6-glow-mesa' },
  'M6-5': { kind: 'contract', id: 'e6-picnic' },
  'M7-2': { kind: 'contract', id: 'e7-relay-valley' },
  'M7-3': { kind: 'contract', id: 'e7-relay-valley' },
  'M7-4': { kind: 'contract', id: 'e7-echo-canyon' },
  'M7-5': { kind: 'contract', id: 'e7-relay-rush' },
  'M8-2': { kind: 'contract', id: 'e8-mare-claim' },
  'M8-3': { kind: 'contract', id: 'e8-mare-claim' },
  'M8-4': { kind: 'contract', id: 'e8-far-side' },
  'M8-5': { kind: 'boss', id: 'e8-low-orbit' },
  'M9-2': { kind: 'contract', id: 'e9-dome-basin' },
  'M9-3': { kind: 'contract', id: 'e9-old-canal' },
  'M9-4': { kind: 'contract', id: 'e9-old-canal' },
  'M9-5': { kind: 'contract', id: 'e9-old-canal' },
  'M10-2': { kind: 'contract', id: 'e10-ember-shore' },
  'M10-3': { kind: 'contract', id: 'e10-last-claim' },
  'M10-4': { kind: 'contract', id: 'e10-last-claim' },
  'M10-5': { kind: 'contract', id: 'e10-river' },
};

const dispatchRows = [...dispatchSource.matchAll(/^\| (M(\d+)-(\d+)) \| ([^|]+?) \| "(.+)"(?: \[[^\n]+\])? \|$/gm)];

export const MEI_WORLD_DISPATCHES: readonly MeiWorldDispatch[] = dispatchRows.map((match) => {
  const era = Number(match[2]);
  const ordinal = Number(match[3]);
  return {
    id: match[1]!,
    era,
    milestone: match[4]!.trim(),
    line: match[5]!,
    trigger: dispatchTrigger(era, ordinal),
  };
});

if (MEI_WORLD_DISPATCHES.length !== 60) {
  throw new Error(`Expected 60 Mei world dispatches, found ${MEI_WORLD_DISPATCHES.length}.`);
}

export function takeMeiWorldDispatch(storage: Storage | undefined = browserStorage()): MeiWorldDispatch | undefined {
  if (!storage) return undefined;
  const reachedEra = loadEpoch(activeEpochId()).order;
  const scores = loadScores();
  const profile = activeProfile(storage);
  const seen = new Set(profile.hintsSeen);
  let selectedIndex = -1;

  for (let index = 0; index < MEI_WORLD_DISPATCHES.length; index += 1) {
    const dispatch = MEI_WORLD_DISPATCHES[index]!;
    if (dispatch.era > reachedEra) break;
    if (!seen.has(seenKey(dispatch.id)) && triggerReached(dispatch.trigger, storage, scores, seen)) selectedIndex = index;
  }
  if (selectedIndex < 0) return undefined;

  // Progress can jump several authored beats between town visits. Deliver only
  // the nearest reached line and retire older misses: reveal late, never dump.
  for (let index = 0; index <= selectedIndex; index += 1) markHintSeen(storage, seenKey(MEI_WORLD_DISPATCHES[index]!.id));
  return MEI_WORLD_DISPATCHES[selectedIndex];
}

function dispatchTrigger(era: number, ordinal: number): DispatchTrigger {
  if (era === 1) {
    if (ordinal === 1) return { kind: 'contract', id: '*' };
    if (ordinal === 2) return { kind: 'wave', waves: 1 };
    if (ordinal === 3) return { kind: 'board', id: 'baron-rumor-1' };
    if (ordinal === 4) return { kind: 'board', id: 'baron-rumor-2' };
    if (ordinal === 5) return { kind: 'boss', id: 'e1-baron' };
  }
  if (ordinal === 1) return { kind: 'era', id: epochId(era) };
  if (ordinal === 6) return { kind: 'science', eraId: epochId(era), steps: era * 2 + 4 };
  const trigger = MILESTONE_TRIGGERS[`M${era}-${ordinal}`];
  if (!trigger) throw new Error(`No WD-02 progress mapping for M${era}-${ordinal}.`);
  return trigger;
}

function triggerReached(trigger: DispatchTrigger, storage: Storage, scores: ReturnType<typeof loadScores>, seen: ReadonlySet<string>): boolean {
  if (trigger.kind === 'era') return loadEpoch(activeEpochId()).order >= loadEpoch(trigger.id).order;
  if (trigger.kind === 'contract') return scores.some((score) => score.secured === true && (trigger.id === '*' || score.contractId === trigger.id));
  if (trigger.kind === 'boss') return (trigger.id === 'e1-baron' && hasBaronMedal()) || scores.some((score) => score.secured === true && score.contractId === trigger.id);
  if (trigger.kind === 'science') return scienceSteps(storage, trigger.eraId) >= trigger.steps;
  if (trigger.kind === 'wave') return scores.some((score) => score.waves >= trigger.waves && (!trigger.era || score.contractId?.startsWith(`e${trigger.era}-`)));
  if (trigger.kind === 'ledger') return storedStrings(storage.getItem(LEDGER_DISCOVERED_STORAGE_KEY)).includes(trigger.id);
  if (trigger.kind === 'story') return seen.has(`story:${trigger.id}`);
  const science = scienceSteps(storage, 'epoch-1-frontier');
  if (trigger.id === 'baron-rumor-1') return science >= 4;
  return science >= 6 && new Set(scores.filter((score) => score.secured).map((score) => score.contractId ?? 'the-claim')).size >= 2;
}

function storedStrings(raw: string | null): readonly string[] {
  try {
    const value: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
  } catch {
    return [];
  }
}

function scienceSteps(storage: Storage, eraId: string): number {
  const epochSteps = storedNumber(storage.getItem(researchStateKey(eraId)), 'steps');
  if (epochSteps > 0 || eraId !== 'epoch-1-frontier') return epochSteps;
  return storedNumber(storage.getItem(META_PROGRESS_KEY), 'tracks', 'science');
}

function storedNumber(raw: string | null, ...path: string[]): number {
  try {
    let value: unknown = raw ? JSON.parse(raw) : null;
    for (const key of path) value = value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined;
    return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  } catch {
    return 0;
  }
}

function epochId(era: number): string {
  const epoch = listEpochs().find((candidate) => candidate.order === era);
  if (!epoch) throw new Error(`No epoch registered for WD-02 era ${era}.`);
  return epoch.id;
}

function seenKey(id: string): string {
  return `wd02:${id}`;
}

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
