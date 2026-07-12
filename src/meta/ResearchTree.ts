import {
  freshMetaProgress,
  loadMetaProgress,
  saveMetaProgress,
  type MetaProgress,
  type MetaProgressStorage,
} from '../game/MetaProgress';
import {
  activeEpochId,
  DEFAULT_EPOCH_ID,
  listEpochs,
  loadEpoch,
  type ContractTier,
  type EpochResearchBranch,
  type EpochResearchNode,
} from './ContractFamilies';
import { MEGAPROJECT_STATE_KEY } from './Megaproject';

/** Legacy Frontier key; retained as an additive first-read migration source. */
export const RESEARCH_STATE_KEY = 'gr.research.v1';
export const STEAMWORKS_THRESHOLD = loadEpoch(DEFAULT_EPOCH_ID).scienceThreshold;
export const SKY_ROCKET_BATTERY_NODE_ID = 'sky_rocket_battery';
export const SCIENCE_CEILING_TEXT =
  'Epoch science complete — the Steamworks awaits a town to build it. (Steps beyond the threshold are banked for the new era.)';
export const SCIENCE_BUILDING_TEXT =
  'Epoch science complete — the town is building the Steamworks. (Steps beyond the threshold are already in the ledger.)';

export type ResearchBranch = string;

export type ResearchNode = Omit<EpochResearchNode, 'requires'> & {
  branch: ResearchBranch;
  requires: readonly string[];
  repeatable?: boolean;
};

export type ScienceMeter = {
  steps: number;
  remaining: number;
  threshold: number;
  overflow: number;
  complete: boolean;
  text: string;
  bankedText?: string;
};

export type ScienceBuildStatus = 'awaiting-town' | 'building';
export type SteamworksBuildStatus = ScienceBuildStatus;

export type ContinuedStudyBonuses = {
  seamYieldMult: number;
  turretDamageMult: number;
  stockpileCapBonus: number;
};

export type ResearchState = {
  version: 1;
  epochId?: string;
  metaScienceCursor?: number;
  progress: MetaProgress;
  taken: string[];
  proposalSalt: number;
  pinnedTarget: string | null;
  unlocks?: ResearchUnlockFlags;
};

export type ResearchUnlockFlags = {
  rocketCartCaptured?: boolean;
};

type ResearchRegistry = {
  version: 1;
  steps: number;
  metaScienceCursor?: number;
  taken: string[];
  proposalSalt: number;
  pinnedTarget?: string | null;
};

const NO_RESEARCH_STORAGE = {};
const inheritedByStorage = new WeakMap<object, Map<string, ReadonlySet<string>>>();
const inheritedByEpoch = new Map<string, ReadonlySet<string>>();
const inheritedByState = new WeakMap<ResearchState, ReadonlySet<string>>();

const RESEARCH_ID_MIGRATIONS: Record<string, string> = {
  receipt_shelves: 'refined_assay',
  contract_tier_one: 'pattern_library',
  schoolhouse_notes: 'agent_schooling',
};

export function researchStateKey(epochId: string): string {
  return `gr.research.${epochId}.v1`;
}

export function researchBranches(epochId = activeEpochId()): readonly EpochResearchBranch[] {
  return loadEpoch(epochId).research.branches;
}

export function researchNodes(epochId = activeEpochId()): ResearchNode[] {
  return researchBranches(epochId).flatMap((branch) =>
    branch.nodes.map((node) => ({ ...node, branch: branch.id, requires: node.requires ?? [] })),
  );
}

// ponytail: array Proxy preserves legacy imports; delete it when callers use researchNodes().
export const RESEARCH_NODES = new Proxy([] as ResearchNode[], {
  get: (_target, property) => {
    const nodes = researchNodes();
    const value = Reflect.get(nodes, property, nodes);
    return typeof value === 'function' ? value.bind(nodes) : value;
  },
}) as readonly ResearchNode[];

export const researchNodeById = listEpochs().reduce(
  (nodes, epoch) => {
    for (const node of researchNodes(epoch.id)) nodes[node.id] = node;
    return nodes;
  },
  {} as Record<string, ResearchNode>,
);

export function freshResearchState(
  progress: MetaProgress = freshMetaProgress(),
  epochId = activeEpochId(),
): ResearchState {
  return {
    version: 1,
    epochId,
    metaScienceCursor: progress.tracks.science,
    progress: progressForEpoch(progress, epochId, progress.tracks.science),
    taken: [],
    proposalSalt: 0,
    pinnedTarget: null,
    unlocks: {},
  };
}

export function loadResearchState(
  registryStorage?: MetaProgressStorage,
  progressStorage: MetaProgressStorage | undefined = registryStorage,
  unlocks: ResearchUnlockFlags = {},
  epochId = activeEpochId(),
): ResearchState {
  const inherited = cacheInheritedTaken(registryStorage, epochId);
  const progress = progressStorage ? loadMetaProgress(progressStorage) : freshMetaProgress();
  const key = researchStateKey(epochId);
  const saved = readStorage(registryStorage, key);
  const legacy = epochId === DEFAULT_EPOCH_ID && saved === null ? readStorage(registryStorage, RESEARCH_STATE_KEY) : null;
  const raw = parseRegistry(saved ?? legacy);
  const storedSteps =
    epochId === DEFAULT_EPOCH_ID
      ? progress.tracks.science
      : saved === null
        ? initialEpochSteps(registryStorage, progress, epochId, raw)
        : registrySteps(raw);
  const cursor = registryScienceCursor(raw, progress.tracks.science);
  const steps =
    epochId === DEFAULT_EPOCH_ID || saved === null
      ? storedSteps
      : storedSteps + Math.max(0, progress.tracks.science - cursor);
  const next = { ...migrateResearchState(raw, progressForEpoch(progress, epochId, steps), epochId, progress.tracks.science), unlocks };
  if (saved === null || steps !== storedSteps) writeStorage(registryStorage, key, JSON.stringify(toRegistry(next)));
  inheritedByState.set(next, inherited);
  return next;
}

export function saveResearchState(
  registryStorage: MetaProgressStorage | undefined,
  state: ResearchState,
  progressStorage: MetaProgressStorage | undefined = registryStorage,
): ResearchState {
  const next = saveResearchRegistryState(registryStorage, state, progressStorage);
  const epochId = state.epochId ?? activeEpochId();
  if (epochId === DEFAULT_EPOCH_ID && progressStorage) next.progress = saveMetaProgress(progressStorage, next.progress);
  return next;
}

export function saveResearchRegistryState(
  registryStorage: MetaProgressStorage | undefined,
  state: ResearchState,
  progressStorage: MetaProgressStorage | undefined = registryStorage,
): ResearchState {
  const epochId = state.epochId ?? activeEpochId();
  const cursor =
    epochId === DEFAULT_EPOCH_ID
      ? state.progress.tracks.science
      : state.metaScienceCursor ?? (progressStorage ? loadMetaProgress(progressStorage).tracks.science : 0);
  const next = migrateResearchState(toRegistry(state), state.progress, epochId, cursor);
  if (state.unlocks !== undefined) next.unlocks = state.unlocks;
  const serialized = JSON.stringify(toRegistry(next));
  writeStorage(registryStorage, researchStateKey(epochId), serialized);
  if (epochId === DEFAULT_EPOCH_ID) writeStorage(registryStorage, RESEARCH_STATE_KEY, serialized);
  inheritedByState.set(next, cacheInheritedTaken(registryStorage, epochId));
  return next;
}

export function normalizeResearchState(state: ResearchState): ResearchState {
  const epochId = state.epochId ?? activeEpochId();
  const next = migrateResearchState(
    toRegistry(state),
    state.progress,
    epochId,
    state.metaScienceCursor ?? state.progress.tracks.science,
  );
  // migrate zeroes unlocks; normalization must preserve them (071 flags live here).
  if (state.unlocks !== undefined) next.unlocks = state.unlocks;
  else delete (next as { unlocks?: unknown }).unlocks;
  inheritedByState.set(next, inheritedByState.get(state) ?? inheritedTaken(epochId));
  return next;
}

export function availablePicks(state: ResearchState): ResearchNode[] {
  const frontier = frontierNodes(state);
  if (frontier.length > 0) return seededShuffle(frontier, proposalSeed(state)).slice(0, 2);
  return continuedStudyPicks(state);
}

export function frontierNodes(state: ResearchState): ResearchNode[] {
  const taken = new Set(state.taken);
  return nodesForState(state).filter((node) => !taken.has(node.id) && nodeAvailable(state, node, taken));
}

export function takeNode(state: ResearchState, id: string): ResearchState {
  const pick = availablePicks(state).find((node) => node.id === id);
  if (!pick || (!pick.repeatable && state.taken.includes(id))) return state;
  return {
    version: 1,
    epochId: stateEpochId(state),
    metaScienceCursor: state.metaScienceCursor,
    progress: progressForEpoch(state.progress, stateEpochId(state), state.progress.tracks.science + pick.cost),
    taken: [...state.taken, id],
    proposalSalt: state.proposalSalt + 1,
    pinnedTarget: state.pinnedTarget,
    unlocks: state.unlocks,
  };
}

export function skipResearchPick(state: ResearchState): ResearchState {
  return { ...state, proposalSalt: state.proposalSalt + 1 };
}

export function hasResearchNode(state: ResearchState, id: string): boolean {
  return state.taken.includes(id) || (inheritedByState.get(state) ?? inheritedTaken(stateEpochId(state))).has(id);
}

export function setPinnedResearchTarget(state: ResearchState, id: string | null): ResearchState {
  return { ...state, pinnedTarget: id && id in nodeMapForState(state) ? id : null };
}

export function pinnedResearchPath(state: ResearchState): string[] {
  return state.pinnedTarget ? researchPathIds(state.pinnedTarget, stateEpochId(state)) : [];
}

export function researchPathIds(id: string, epochId = activeEpochId()): string[] {
  const nodes = nodeMap(epochId);
  const path: string[] = [];
  const seen = new Set<string>();
  const visit = (nodeId: string) => {
    if (seen.has(nodeId)) return;
    seen.add(nodeId);
    const node = nodes[nodeId];
    if (!node) return;
    for (const required of node.requires ?? []) visit(required);
    path.push(nodeId);
  };
  visit(id);
  return path;
}

export function researchDistance(state: ResearchState, id: string): number {
  const taken = new Set(state.taken);
  return researchPathIds(id, stateEpochId(state)).filter((nodeId) => !taken.has(nodeId)).length;
}

export function contractTierForResearch(state: ResearchState): ContractTier {
  if (hasResearchNode(state, 'pattern_library')) return 3;
  if (hasResearchNode(state, 'refined_assay')) return 2;
  return 1;
}

export function continuedStudyBonuses(state: ResearchState): ContinuedStudyBonuses {
  const counts = new Map<string, number>();
  for (const id of state.taken) {
    const slug = continuedStudySlug(id);
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return {
    seamYieldMult: (counts.get('seam_yield') ?? 0) * 0.01,
    turretDamageMult: (counts.get('turret_damage') ?? 0) * 0.01,
    stockpileCapBonus: (counts.get('stockpile_cap') ?? 0) * 5,
  };
}

export function scienceMeter(state: ResearchState, buildStatus: ScienceBuildStatus = 'awaiting-town'): ScienceMeter {
  const epoch = loadEpoch(stateEpochId(state));
  const steps = Math.max(0, Math.floor(state.progress.tracks.science));
  const remaining = Math.max(0, epoch.scienceThreshold - steps);
  const overflow = Math.max(0, steps - epoch.scienceThreshold);
  const complete = steps >= epoch.scienceThreshold;
  const nextEpoch = epoch.transition.displayName.replace(/^The\s+/, 'the ');
  const bankedText = complete ? `banked: +${overflow} toward ${nextEpoch}` : undefined;
  return {
    steps,
    remaining,
    threshold: epoch.scienceThreshold,
    overflow,
    complete,
    bankedText,
    text: complete
      ? buildStatus === 'building'
        ? `Epoch science complete — the town is building ${nextEpoch}. (Steps beyond the threshold are already in the ledger.)`
        : `Epoch science complete — ${nextEpoch} awaits a town to build it. (Steps beyond the threshold are banked for the new era.)`
      : `Science: ${steps} steps - ${remaining} to ${nextEpoch}`,
  };
}

export function savedEpochMegaprojectBuildStarted(epochId = activeEpochId()): boolean {
  try {
    const project = (JSON.parse(globalThis.localStorage?.getItem(MEGAPROJECT_STATE_KEY) ?? 'null') as {
      projects?: Record<string, { funded?: boolean; stage?: number; complete?: boolean }>;
    } | null)?.projects?.[loadEpoch(epochId).megaproject.id];
    return project?.funded === true || project?.complete === true || (project?.stage ?? 0) > 0;
  } catch {
    return false;
  }
}

export function savedStampMillBuildStarted(): boolean {
  return savedEpochMegaprojectBuildStarted(DEFAULT_EPOCH_ID);
}

export function browserResearchStorage(): MetaProgressStorage | undefined {
  try {
    return globalThis.localStorage || undefined;
  } catch {
    return undefined;
  }
}

function migrateResearchState(raw: unknown, progress: MetaProgress, epochId: string, metaScienceCursor: number): ResearchState {
  if (!isRecord(raw)) {
    return { ...freshResearchState(progress, epochId), metaScienceCursor: Math.max(0, Math.floor(metaScienceCursor)) };
  }
  const nodes = nodeMap(epochId);
  const rawTaken = Array.isArray(raw.taken) ? raw.taken : [];
  const taken = rawTaken
    .map((id) => (typeof id === 'string' ? (RESEARCH_ID_MIGRATIONS[id] ?? id) : id))
    .filter((id): id is string => typeof id === 'string' && (id in nodes || isContinuedStudyId(id)));
  const proposalSalt =
    typeof raw.proposalSalt === 'number' && Number.isFinite(raw.proposalSalt) ? Math.max(0, Math.floor(raw.proposalSalt)) : 0;
  const rawPinnedTarget = typeof raw.pinnedTarget === 'string' ? (RESEARCH_ID_MIGRATIONS[raw.pinnedTarget] ?? raw.pinnedTarget) : null;
  const pinnedTarget = rawPinnedTarget && rawPinnedTarget in nodes ? rawPinnedTarget : null;
  return {
    version: 1,
    epochId,
    metaScienceCursor: Math.max(0, Math.floor(metaScienceCursor)),
    progress,
    taken: [...new Set(taken)],
    proposalSalt,
    pinnedTarget,
    unlocks: {},
  };
}

function toRegistry(state: ResearchState): ResearchRegistry {
  const registry: ResearchRegistry = {
    version: 1,
    steps: Math.max(0, Math.floor(state.progress.tracks.science)),
    taken: state.taken,
    proposalSalt: state.proposalSalt,
    pinnedTarget: state.pinnedTarget,
  };
  if (stateEpochId(state) !== DEFAULT_EPOCH_ID) {
    registry.metaScienceCursor = Math.max(0, Math.floor(state.metaScienceCursor ?? 0));
  }
  return registry;
}

function stateEpochId(state: ResearchState): string {
  return state.epochId ?? activeEpochId();
}

function inheritedTaken(epochId: string): ReadonlySet<string> {
  return inheritedByEpoch.get(epochId) ?? new Set();
}

function cacheInheritedTaken(storage: MetaProgressStorage | undefined, epochId: string): ReadonlySet<string> {
  const activeIds = new Set(researchNodes(epochId).map((node) => node.id));
  const taken = new Set<string>();
  let prior = loadEpoch(DEFAULT_EPOCH_ID);
  while (prior.id !== epochId) {
    for (const id of storedTaken(storage, prior.id)) if (!activeIds.has(id)) taken.add(id);
    if (!prior.successor) {
      taken.clear();
      break;
    }
    prior = loadEpoch(prior.successor);
  }
  const identity = (storage as object | undefined) ?? NO_RESEARCH_STORAGE;
  let cache = inheritedByStorage.get(identity);
  if (!cache) inheritedByStorage.set(identity, (cache = new Map()));
  cache.set(epochId, taken);
  inheritedByEpoch.set(epochId, taken);
  return taken;
}

function storedTaken(storage: MetaProgressStorage | undefined, epochId: string): string[] {
  const saved = readStorage(storage, researchStateKey(epochId));
  const legacy = epochId === DEFAULT_EPOCH_ID && saved === null ? readStorage(storage, RESEARCH_STATE_KEY) : null;
  const raw = parseRegistry(saved ?? legacy);
  if (!isRecord(raw) || !Array.isArray(raw.taken)) return [];
  const nodes = nodeMap(epochId);
  return raw.taken
    .map((id) => (typeof id === 'string' ? (RESEARCH_ID_MIGRATIONS[id] ?? id) : ''))
    .filter((id) => id in nodes);
}

function nodesForState(state: ResearchState): ResearchNode[] {
  return researchNodes(stateEpochId(state));
}

function nodeMapForState(state: ResearchState): Record<string, ResearchNode> {
  return nodeMap(stateEpochId(state));
}

function nodeMap(epochId: string): Record<string, ResearchNode> {
  return researchNodes(epochId).reduce((nodes, node) => {
    nodes[node.id] = node;
    return nodes;
  }, {} as Record<string, ResearchNode>);
}

function initialEpochSteps(
  storage: MetaProgressStorage | undefined,
  progress: MetaProgress,
  epochId: string,
  currentRaw: unknown,
): number {
  if (epochId === DEFAULT_EPOCH_ID) return progress.tracks.science;
  if (isRecord(currentRaw)) return registrySteps(currentRaw);
  const epochs = listEpochs();
  const currentIndex = epochs.findIndex((epoch) => epoch.id === epochId);
  const previous = currentIndex > 0 ? loadEpoch(epochs[currentIndex - 1]!.id) : null;
  if (!previous) return 0;
  const previousSaved = readStorage(storage, researchStateKey(previous.id));
  const previousLegacy = previous.id === DEFAULT_EPOCH_ID && previousSaved === null ? readStorage(storage, RESEARCH_STATE_KEY) : null;
  const previousRaw = parseRegistry(previousSaved ?? previousLegacy);
  const previousSteps = previous.id === DEFAULT_EPOCH_ID ? progress.tracks.science : registrySteps(previousRaw);
  return Math.max(0, previousSteps - previous.scienceThreshold);
}

function progressForEpoch(progress: MetaProgress, _epochId: string, science: number): MetaProgress {
  return { version: 1, tracks: { ...progress.tracks, science: Math.max(0, Math.floor(science)) } };
}

function registrySteps(raw: unknown): number {
  return isRecord(raw) && typeof raw.steps === 'number' && Number.isFinite(raw.steps) ? Math.max(0, Math.floor(raw.steps)) : 0;
}

function registryScienceCursor(raw: unknown, fallback: number): number {
  return isRecord(raw) && typeof raw.metaScienceCursor === 'number' && Number.isFinite(raw.metaScienceCursor)
    ? Math.max(0, Math.floor(raw.metaScienceCursor))
    : Math.max(0, Math.floor(fallback));
}

const CONTINUED_STUDY_PREFIX = 'continued_study:';
const CONTINUED_STUDIES = [
  {
    slug: 'seam_yield',
    name: 'Continued Study: Seam Yield',
    description: 'Repeatable: seam pans yield +1% gold for each take.',
    effect: '+1% seam panning yield.',
    iconKey: 'ui.upgrade.icon.gold',
  },
  {
    slug: 'turret_damage',
    name: 'Continued Study: Turret Damage',
    description: 'Repeatable: turret sparks hit +1% harder for each take.',
    effect: '+1% turret damage.',
    iconKey: 'bld.sentry_beacon',
  },
  {
    slug: 'stockpile_cap',
    name: 'Continued Study: Stockpile Ledger',
    description: 'Repeatable: stockpile ledgers hold +5 more gold for each take.',
    effect: '+5 stockpile cap.',
    iconKey: 'ui.upgrade.icon.mend',
  },
] as const;

function proposalSeed(state: ResearchState): string {
  const legacy = `${state.proposalSalt}:${state.progress.tracks.science}:${state.taken.join(',')}`;
  return stateEpochId(state) === DEFAULT_EPOCH_ID ? legacy : `${stateEpochId(state)}:${legacy}`;
}

function continuedStudyPicks(state: ResearchState): ResearchNode[] {
  const start = state.taken.filter(isContinuedStudyId).length + state.proposalSalt;
  const branches = researchBranches(stateEpochId(state));
  return [0, 1].map((offset) => {
    const index = (start + offset) % CONTINUED_STUDIES.length;
    const template = CONTINUED_STUDIES[index]!;
    return {
      ...template,
      id: `${CONTINUED_STUDY_PREFIX}${template.slug}:${state.progress.tracks.science}:${state.proposalSalt}:${offset}`,
      branch: branches[index]?.id ?? branches[0]!.id,
      effectRef: `continued.${template.slug}`,
      cost: 1,
      requires: [],
      repeatable: true,
      live: true,
    };
  });
}

function nodeAvailable(state: ResearchState, node: ResearchNode, taken: Set<string>): boolean {
  if (node.id === SKY_ROCKET_BATTERY_NODE_ID && !state.unlocks?.rocketCartCaptured) return false;
  return (node.requires ?? []).every((id) => taken.has(id));
}

function isContinuedStudyId(id: string): boolean {
  return id.startsWith(CONTINUED_STUDY_PREFIX);
}

function continuedStudySlug(id: string): string | undefined {
  if (!isContinuedStudyId(id)) return undefined;
  const slug = id.slice(CONTINUED_STUDY_PREFIX.length).split(':')[0];
  return CONTINUED_STUDIES.some((study) => study.slug === slug) ? slug : undefined;
}

function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const next = [...items];
  let value = hash(seed);
  for (let i = next.length - 1; i > 0; i -= 1) {
    value = (value * 1664525 + 1013904223) >>> 0;
    const j = value % (i + 1);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function hash(value: string): number {
  let h = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    h ^= value.charCodeAt(index);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function readStorage(storage: MetaProgressStorage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(storage: MetaProgressStorage | undefined, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {}
}

function parseRegistry(saved: string | null): unknown {
  try {
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
