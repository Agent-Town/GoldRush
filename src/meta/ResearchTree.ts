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
export const SCIENCE_CEILING_TEXT =
  'Epoch science complete — the Steamworks awaits a town to build it. (Steps beyond the threshold are banked for the new era.)';

export type ResearchBranch = 'Prospecting Works' | 'Arsenal Works' | 'Assay Works';

export type ResearchNode = {
  id: string;
  branch: ResearchBranch;
  name: string;
  description: string;
  effect: string;
  requires?: readonly string[];
  live?: boolean;
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

export type ContinuedStudyBonuses = {
  seamYieldMult: number;
  turretDamageMult: number;
  stockpileCapBonus: number;
};

export type ResearchState = {
  version: 1;
  progress: MetaProgress;
  taken: string[];
  proposalSalt: number;
  pinnedTarget: string | null;
};

type ResearchRegistry = {
  version: 1;
  taken: string[];
  proposalSalt: number;
  pinnedTarget?: string | null;
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
    description: 'Seam cards become a stockpile plan: +35 cap per prospecting stack and +1.25 offer weight.',
    effect: 'Seam cards now add +35 stockpile cap per prospecting stack and carry +1.25 offer weight.',
    live: true,
  },
  {
    id: 'mother_lode_survey',
    branch: 'Prospecting Works',
    name: 'Mother Lode Survey',
    description: 'Banks +1 economy step toward seam returns that scale with waves survived.',
    effect: 'Mother Lode Survey banks +1 economy step toward long-claim seam scaling.',
    requires: ['assay_grading'],
  },
  {
    id: 'sluice_accounting',
    branch: 'Prospecting Works',
    name: 'Sluice Accounting',
    description: 'Banks +1 economy step toward deeper Sluice card families.',
    effect: 'Sluice Accounting banks +1 economy step toward deeper Sluice card families.',
    requires: ['mother_lode_survey'],
  },
  {
    id: 'claim_map_table',
    branch: 'Prospecting Works',
    name: 'Claim Map Table',
    description: 'Banks +1 economy step toward map picks that remember better seams.',
    effect: 'Claim Map Table banks +1 economy step toward map picks that remember better seams.',
    requires: ['sluice_accounting'],
  },
  {
    id: 'pact_ledger',
    branch: 'Prospecting Works',
    name: 'Pact Ledger',
    description: 'Rich Seam Pact enters the pool with +18 seam gold and 10% slower panning.',
    effect: 'Unlocks Rich Seam Pact: +18 gold per seam and 10% slower panning.',
    requires: ['claim_map_table'],
    live: true,
  },
  {
    id: 'chain_spark_primer',
    branch: 'Arsenal Works',
    name: 'Chain Spark Primer',
    description: 'Chain Spark Arc enters the pool with +12% rig fire rate and +12% beacon fire rate.',
    effect: 'Unlocks Chain Spark Arc: +12% rig fire rate and +12% beacon fire rate.',
    live: true,
  },
  {
    id: 'beacon_cadence',
    branch: 'Arsenal Works',
    name: 'Beacon Cadence',
    description: 'Beacon Handoff enters the pool with +18% beacon fire rate and +6% rig fire rate.',
    effect: 'Unlocks Beacon Handoff: +18% beacon fire rate and +6% rig fire rate.',
    requires: ['chain_spark_primer'],
    live: true,
  },
  {
    id: 'brass_coil_standards',
    branch: 'Arsenal Works',
    name: 'Brass Coil Standards',
    description: "Banks +1 arsenal step toward mastery offers like Spark Pressure Ring's +8% blast radius.",
    effect: "Brass Coil Standards banks +1 arsenal step toward Spark Pressure Ring's +8% blast radius mastery.",
    requires: ['beacon_cadence'],
  },
  {
    id: 'powder_math',
    branch: 'Arsenal Works',
    name: 'Powder Math',
    description: 'Banks +1 arsenal step toward blast mastery while Frontier blast radius stays capped at 1.4x.',
    effect: 'Powder Math banks +1 arsenal step toward the 1.4x Frontier blast-radius cap.',
    requires: ['brass_coil_standards'],
  },
  {
    id: 'rush_pattern',
    branch: 'Arsenal Works',
    name: 'Rush Pattern',
    description: 'Banks +1 arsenal step toward rare rush offers for the wave-30 wall.',
    effect: 'Rush Pattern banks +1 arsenal step toward rare rush offers for the wave-30 wall.',
    requires: ['powder_math'],
  },
  {
    id: 'second_order_slot',
    branch: 'Assay Works',
    name: 'Second Order Slot',
    description: 'Order room rises to 2 pending Assay bench orders.',
    effect: 'Pending Assay orders rise to 2.',
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
    description: 'Not yet live: banks the Agent Schooling +1 policy slot toward a permanent run-start head start.',
    effect: 'Design hook for a permanent +1 Prospector policy slot; not yet applied in a run.',
    requires: ['agent_schooling'],
  },
] as const satisfies readonly ResearchNode[];

const CONTINUED_STUDY_PREFIX = 'continued_study:';
type ContinuedStudyTemplate = Omit<ResearchNode, 'id' | 'repeatable'> & { slug: string };

const CONTINUED_STUDIES = [
  {
    slug: 'seam_yield',
    branch: 'Prospecting Works',
    name: 'Continued Study: Seam Yield',
    description: 'Repeatable: seam pans yield +1% gold for each take.',
    effect: '+1% seam panning yield.',
  },
  {
    slug: 'turret_damage',
    branch: 'Arsenal Works',
    name: 'Continued Study: Turret Damage',
    description: 'Repeatable: turret sparks hit +1% harder for each take.',
    effect: '+1% turret damage.',
  },
  {
    slug: 'stockpile_cap',
    branch: 'Assay Works',
    name: 'Continued Study: Stockpile Ledger',
    description: 'Repeatable: stockpile ledgers hold +5 more gold for each take.',
    effect: '+5 stockpile cap.',
  },
] as const satisfies readonly ContinuedStudyTemplate[];

export const researchNodeById = RESEARCH_NODES.reduce(
  (nodes, node) => {
    nodes[node.id] = node;
    return nodes;
  },
  {} as Record<string, ResearchNode>,
);

export function freshResearchState(progress: MetaProgress = freshMetaProgress()): ResearchState {
  return { version: 1, progress, taken: [], proposalSalt: 0, pinnedTarget: null };
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
  const frontier = frontierNodes(state);
  if (frontier.length > 0) return seededShuffle(frontier, proposalSeed(state)).slice(0, 2);
  return continuedStudyPicks(state);
}

export function frontierNodes(state: ResearchState): ResearchNode[] {
  const taken = new Set(state.taken);
  return RESEARCH_NODES.filter((node) => {
    if (taken.has(node.id)) return false;
    const requires = (node as ResearchNode).requires ?? [];
    return requires.every((id) => taken.has(id));
  });
}

export function takeNode(state: ResearchState, id: string): ResearchState {
  const pick = availablePicks(state).find((node) => node.id === id);
  if (!pick || (!pick.repeatable && state.taken.includes(id))) return state;
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
    pinnedTarget: state.pinnedTarget,
  };
}

export function skipResearchPick(state: ResearchState): ResearchState {
  return { ...state, proposalSalt: state.proposalSalt + 1 };
}

export function hasResearchNode(state: ResearchState, id: string): boolean {
  return state.taken.includes(id);
}

export function setPinnedResearchTarget(state: ResearchState, id: string | null): ResearchState {
  return { ...state, pinnedTarget: id && id in researchNodeById ? id : null };
}

export function pinnedResearchPath(state: ResearchState): string[] {
  return state.pinnedTarget ? researchPathIds(state.pinnedTarget) : [];
}

export function researchPathIds(id: string): string[] {
  const path: string[] = [];
  const seen = new Set<string>();
  const visit = (nodeId: string) => {
    if (seen.has(nodeId)) return;
    seen.add(nodeId);
    const node = researchNodeById[nodeId];
    if (!node) return;
    for (const required of node.requires ?? []) visit(required);
    path.push(nodeId);
  };
  visit(id);
  return path;
}

export function researchDistance(state: ResearchState, id: string): number {
  const taken = new Set(state.taken);
  return researchPathIds(id).filter((nodeId) => !taken.has(nodeId)).length;
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

export function scienceMeter(state: ResearchState): ScienceMeter {
  const steps = Math.max(0, Math.floor(state.progress.tracks.science));
  const remaining = Math.max(0, STEAMWORKS_THRESHOLD - steps);
  const overflow = Math.max(0, steps - STEAMWORKS_THRESHOLD);
  const complete = steps >= STEAMWORKS_THRESHOLD;
  const bankedText = complete ? `banked: +${overflow} toward the Steamworks` : undefined;
  return {
    steps,
    remaining,
    threshold: STEAMWORKS_THRESHOLD,
    overflow,
    complete,
    bankedText,
    text: complete ? SCIENCE_CEILING_TEXT : `Science: ${steps} steps - ${remaining} to the Steamworks`,
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
    .filter((id): id is string => typeof id === 'string' && (id in researchNodeById || isContinuedStudyId(id)));
  const proposalSalt =
    typeof raw.proposalSalt === 'number' && Number.isFinite(raw.proposalSalt) ? Math.max(0, Math.floor(raw.proposalSalt)) : 0;
  const rawPinnedTarget = typeof raw.pinnedTarget === 'string' ? (RESEARCH_ID_MIGRATIONS[raw.pinnedTarget] ?? raw.pinnedTarget) : null;
  const pinnedTarget = rawPinnedTarget && rawPinnedTarget in researchNodeById ? rawPinnedTarget : null;
  return { version: 1, progress, taken: [...new Set(taken)], proposalSalt, pinnedTarget };
}

function toRegistry(state: ResearchState): ResearchRegistry {
  return { version: 1, taken: state.taken, proposalSalt: state.proposalSalt, pinnedTarget: state.pinnedTarget };
}

function proposalSeed(state: ResearchState): string {
  return `${state.proposalSalt}:${state.progress.tracks.science}:${state.taken.join(',')}`;
}

function continuedStudyPicks(state: ResearchState): ResearchNode[] {
  const start = state.taken.filter(isContinuedStudyId).length + state.proposalSalt;
  return [0, 1].map((offset) => {
    const template = CONTINUED_STUDIES[(start + offset) % CONTINUED_STUDIES.length]!;
    return {
      ...template,
      id: `${CONTINUED_STUDY_PREFIX}${template.slug}:${state.progress.tracks.science}:${state.proposalSalt}:${offset}`,
      repeatable: true,
      live: true,
    };
  });
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
