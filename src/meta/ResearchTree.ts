import {
  freshMetaProgress,
  loadMetaProgress,
  saveMetaProgress,
  type MetaProgress,
  type MetaProgressStorage,
} from '../game/MetaProgress';
import { loadEpoch, type ContractTier } from './ContractFamilies';

export const RESEARCH_STATE_KEY = 'gr.research.v1';
export const STEAMWORKS_THRESHOLD = loadEpoch('epoch-1-frontier').threshold ?? 6;

export type ResearchBranch = 'Prospecting Works' | 'Arsenal Works' | 'Assay Works';

export type ResearchNode = {
  id: string;
  branch: ResearchBranch;
  name: string;
  description: string;
  effect: string;
  requires?: readonly string[];
  live?: boolean;
};

export type ResearchState = {
  version: 1;
  progress: MetaProgress;
  taken: string[];
  proposalSalt: number;
};

type ResearchRegistry = {
  version: 1;
  taken: string[];
  proposalSalt: number;
};

const RESEARCH_ID_MIGRATIONS: Record<string, string> = {
  receipt_shelves: 'refined_assay',
  contract_tier_one: 'pattern_library',
  schoolhouse_notes: 'agent_schooling',
};

export const RESEARCH_NODES = [
  {
    id: 'assay_grading',
    branch: 'Prospecting Works',
    name: 'Assay Grading',
    description: 'Seam cards start raising the stockpile cap, and prospecting offers show up more often.',
    effect: 'Prospecting cards add stockpile room and carry more offer weight.',
    live: true,
  },
  {
    id: 'mother_lode_survey',
    branch: 'Prospecting Works',
    name: 'Mother Lode Survey',
    description: 'The town marks richer seams after a claim runs long.',
    effect: 'Seam returns prepare to scale with waves survived.',
    requires: ['assay_grading'],
  },
  {
    id: 'sluice_accounting',
    branch: 'Prospecting Works',
    name: 'Sluice Accounting',
    description: 'Sluice crews keep cleaner receipts when the river gets crowded.',
    effect: 'Sluice families prepare to deepen.',
    requires: ['mother_lode_survey'],
  },
  {
    id: 'claim_map_table',
    branch: 'Prospecting Works',
    name: 'Claim Map Table',
    description: 'Old claim marks become a better map for the next crew.',
    effect: 'Map picks prepare to remember better seams.',
    requires: ['sluice_accounting'],
  },
  {
    id: 'pact_ledger',
    branch: 'Prospecting Works',
    name: 'Pact Ledger',
    description: 'The town learns riskier gold bargains for hard nights.',
    effect: 'Unlocks pact cards: richer seams for slower pan work.',
    requires: ['claim_map_table'],
    live: true,
  },
  {
    id: 'chain_spark_primer',
    branch: 'Arsenal Works',
    name: 'Chain Spark Primer',
    description: 'A new spark family enters the Patent Office after this note is taken.',
    effect: 'Unlocks Chain Spark Arc cards in the run pool.',
    live: true,
  },
  {
    id: 'beacon_cadence',
    branch: 'Arsenal Works',
    name: 'Beacon Cadence',
    description: 'Beacon keepers learn a steadier handoff from rig to tower.',
    effect: 'Unlocks Beacon Handoff cards in the run pool.',
    requires: ['chain_spark_primer'],
    live: true,
  },
  {
    id: 'brass_coil_standards',
    branch: 'Arsenal Works',
    name: 'Brass Coil Standards',
    description: 'The town files one shared pattern for coils and charge cups.',
    effect: 'Cross-family mastery offers prepare to unlock.',
    requires: ['beacon_cadence'],
  },
  {
    id: 'powder_math',
    branch: 'Arsenal Works',
    name: 'Powder Math',
    description: 'Blast crews mark safer circles before the rush gets loud.',
    effect: 'Blast mastery families prepare to deepen.',
    requires: ['brass_coil_standards'],
  },
  {
    id: 'rush_pattern',
    branch: 'Arsenal Works',
    name: 'Rush Pattern',
    description: 'The Arsenal keeps a playbook for the late-wave wall.',
    effect: 'Rare rush offers prepare to appear.',
    requires: ['powder_math'],
  },
  {
    id: 'second_order_slot',
    branch: 'Assay Works',
    name: 'Second Order Slot',
    description: 'The Assay bench can keep two orders waiting at the works.',
    effect: 'Pending order room rises to 2.',
    live: true,
  },
  {
    id: 'refined_assay',
    branch: 'Assay Works',
    name: 'Refined Assay',
    description: 'Tier 2 orders raise common/uncommon/rare stat budgets by 20%: 3.6 / 6 / 9.6.',
    effect: 'Contract tier becomes 2; new orders carry the 20% higher assay ceiling.',
    requires: ['second_order_slot'],
    live: true,
  },
  {
    id: 'pattern_library',
    branch: 'Assay Works',
    name: 'Pattern Library',
    description: 'Tier 3 lets up to 2 approved crafted cards enter each run offer pool.',
    effect: 'Approved family-tagged inventions can appear as run cards, capped at 2 per offer.',
    requires: ['refined_assay'],
    live: true,
  },
  {
    id: 'agent_schooling',
    branch: 'Assay Works',
    name: 'Agent Schooling',
    description: 'After wave 15, schooling offers can grant the Prospector +1 policy slot for that run.',
    effect: 'Unlocks late-run Agent Schooling offers with +1 run-only policy slot.',
    requires: ['pattern_library'],
    live: true,
  },
  {
    id: 'prospector_lessons',
    branch: 'Assay Works',
    name: 'Prospector Lessons',
    description: 'The Prospector carries approved lessons into the claim.',
    effect: 'Agent schooling prepares to enter late offers.',
    requires: ['agent_schooling'],
  },
] as const satisfies readonly ResearchNode[];

export const researchNodeById = RESEARCH_NODES.reduce(
  (nodes, node) => {
    nodes[node.id] = node;
    return nodes;
  },
  {} as Record<string, ResearchNode>,
);

export function freshResearchState(progress: MetaProgress = freshMetaProgress()): ResearchState {
  return { version: 1, progress, taken: [], proposalSalt: 0 };
}

export function loadResearchState(
  registryStorage?: MetaProgressStorage,
  progressStorage: MetaProgressStorage | undefined = registryStorage,
): ResearchState {
  const progress = progressStorage ? loadMetaProgress(progressStorage) : freshMetaProgress();
  let raw: unknown = null;
  try {
    const saved = registryStorage?.getItem(RESEARCH_STATE_KEY);
    raw = saved ? JSON.parse(saved) : null;
  } catch {
    raw = null;
  }
  return migrateResearchState(raw, progress);
}

export function saveResearchState(
  registryStorage: MetaProgressStorage | undefined,
  state: ResearchState,
  progressStorage: MetaProgressStorage | undefined = registryStorage,
): ResearchState {
  const next = migrateResearchState(toRegistry(state), state.progress);
  try {
    registryStorage?.setItem(RESEARCH_STATE_KEY, JSON.stringify(toRegistry(next)));
  } catch {}
  if (progressStorage) next.progress = saveMetaProgress(progressStorage, next.progress);
  return next;
}

export function availablePicks(state: ResearchState): ResearchNode[] {
  const taken = new Set(state.taken);
  const frontier = RESEARCH_NODES.filter((node) => {
    if (taken.has(node.id)) return false;
    const requires = 'requires' in node ? node.requires : [];
    return requires.every((id) => taken.has(id));
  });
  return seededShuffle(frontier, proposalSeed(state)).slice(0, 2);
}

export function takeNode(state: ResearchState, id: string): ResearchState {
  if (!researchNodeById[id] || state.taken.includes(id)) return state;
  if (!availablePicks(state).some((node) => node.id === id)) return state;
  return {
    version: 1,
    progress: {
      ...state.progress,
      tracks: {
        ...state.progress.tracks,
        science: state.progress.tracks.science + 1,
      },
    },
    taken: [...state.taken, id],
    proposalSalt: state.proposalSalt + 1,
  };
}

export function skipResearchPick(state: ResearchState): ResearchState {
  return { ...state, proposalSalt: state.proposalSalt + 1 };
}

export function hasResearchNode(state: ResearchState, id: string): boolean {
  return state.taken.includes(id);
}

export function contractTierForResearch(state: ResearchState): ContractTier {
  if (hasResearchNode(state, 'pattern_library')) return 3;
  if (hasResearchNode(state, 'refined_assay')) return 2;
  return 1;
}

export function scienceMeter(state: ResearchState): { steps: number; remaining: number; threshold: number; text: string } {
  const steps = Math.max(0, Math.floor(state.progress.tracks.science));
  const remaining = Math.max(0, STEAMWORKS_THRESHOLD - steps);
  return {
    steps,
    remaining,
    threshold: STEAMWORKS_THRESHOLD,
    text: `Science: ${steps} steps - ${remaining} to the Steamworks (locked)`,
  };
}

export function browserResearchStorage(): MetaProgressStorage | undefined {
  try {
    return globalThis.localStorage || undefined;
  } catch {
    return undefined;
  }
}

function migrateResearchState(raw: unknown, progress: MetaProgress): ResearchState {
  if (!isRecord(raw)) return freshResearchState(progress);
  const rawTaken = Array.isArray(raw.taken) ? raw.taken : [];
  const taken = rawTaken
    .map((id) => (typeof id === 'string' ? (RESEARCH_ID_MIGRATIONS[id] ?? id) : id))
    .filter((id): id is string => typeof id === 'string' && id in researchNodeById);
  const proposalSalt =
    typeof raw.proposalSalt === 'number' && Number.isFinite(raw.proposalSalt) ? Math.max(0, Math.floor(raw.proposalSalt)) : 0;
  return { version: 1, progress, taken: [...new Set(taken)], proposalSalt };
}

function toRegistry(state: ResearchState): ResearchRegistry {
  return { version: 1, taken: state.taken, proposalSalt: state.proposalSalt };
}

function proposalSeed(state: ResearchState): string {
  return `${state.proposalSalt}:${state.progress.tracks.science}:${state.taken.join(',')}`;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
