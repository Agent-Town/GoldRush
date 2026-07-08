import { createRng } from '../core/Rng';
import { Balance } from '../game/Balance';
import { contractBudgetOk, contractTierBudget } from '../meta/ContractFamilies';
import {
  parseApprovedQueueEntry,
  type CraftedItemDef,
  type CraftedStatDeltas,
  type CraftingQueueApproved,
  type CraftingQueueReason,
  type CraftingQueueVerdict,
} from './CraftingQueueContract';

export const STAT_SIM_TOLERANCE = 1.25;

const EPOCH_ID = 'epoch-1-frontier';
const STEP_SECONDS = 1 / 30;
const DPS_WINDOW_SECONDS = 45;
const SURVIVAL_WINDOW_SECONDS = 90;
const GOLD_WINDOW_SECONDS = 180;
const BUDGET_WEIGHTS: Record<keyof CraftedStatDeltas, number> = {
  damageMult: 8,
  fireRateMult: 8,
  rangeMult: 5,
  moveSpeedMult: 10,
  panTickMult: 8,
  maxHpBonus: 0.06,
};

export type StatSimMetrics = {
  dps: number;
  survivalTime: number;
  goldRate: number;
};

export type StatSimRun = {
  itemId: string;
  status: 'within-tolerance' | 'overperforming';
  tolerance: number;
  seed: string;
  contract: {
    tier: number;
    rarityBudget: number;
    declaredBudget: number;
    budgetOk: boolean;
  };
  baseline: StatSimMetrics;
  measured: StatSimMetrics;
  deltas: StatSimMetrics;
  measuredBudget: number;
  hash: string;
  verdict: CraftingQueueVerdict & {
    status: StatSimRun['status'];
    tolerance: number;
    declaredBudget: number;
    measuredBudget: number;
    measurements: {
      baseline: StatSimMetrics;
      measured: StatSimMetrics;
      deltas: StatSimMetrics;
    };
    hash: string;
  };
};

export type StatSimWindow = { ok: true; itemId: string; result: StatSimRun } | { ok: false; error: string };

export function runStatSimHarness(item: CraftedItemDef, options: { seed?: string; tier?: number } = {}): StatSimRun {
  const seed = options.seed ?? `m5-03:${item.id}`;
  const tier = options.tier ?? 1;
  const baseline = runWindows(null, seed);
  const measured = runWindows(item.stats, seed);
  const deltas = metricDeltas(baseline, measured);
  const declaredBudget = round(declaredStatBudget(item.stats), 3);
  const rarityBudget = contractTierBudget(EPOCH_ID, tier).rarityBudgets[item.rarity];
  const measuredBudget = round(measuredUtilityBudget(deltas), 3);
  const status = measuredBudget <= declaredBudget * STAT_SIM_TOLERANCE ? 'within-tolerance' : 'overperforming';
  const reasons: CraftingQueueReason[] =
    status === 'overperforming'
      ? [
          {
            code: 'overperforming',
            message: `Measured utility budget ${measuredBudget} exceeds declared ${declaredBudget} x ${STAT_SIM_TOLERANCE}.`,
            path: 'stats',
          },
        ]
      : [];
  const hash = hashText(
    stableStringify({
      itemId: item.id,
      seed,
      baseline,
      measured,
      deltas,
      declaredBudget,
      measuredBudget,
      status,
    }),
  );
  const verdict: StatSimRun['verdict'] = {
    ok: status === 'within-tolerance',
    status,
    tolerance: STAT_SIM_TOLERANCE,
    declaredBudget,
    measuredBudget,
    measurements: { baseline, measured, deltas },
    hash,
    reasons,
    summary:
      status === 'within-tolerance'
        ? `M5-03 stat sim within tolerance: measured ${measuredBudget} <= declared ${declaredBudget} x ${STAT_SIM_TOLERANCE}.`
        : `M5-03 stat sim overperforming: measured ${measuredBudget} > declared ${declaredBudget} x ${STAT_SIM_TOLERANCE}.`,
  };

  return {
    itemId: item.id,
    status,
    tolerance: STAT_SIM_TOLERANCE,
    seed,
    contract: {
      tier,
      rarityBudget,
      declaredBudget,
      budgetOk: contractBudgetOk(EPOCH_ID, tier, item.rarity, declaredBudget),
    },
    baseline,
    measured,
    deltas,
    measuredBudget,
    hash,
    verdict,
  };
}

export async function installStatSimHarnessFromSearch(search = window.location.search): Promise<void> {
  const raw = new URLSearchParams(search).get('simitem');
  if (!raw) return;

  try {
    const item = await resolveSimItem(raw);
    window.__GR_STAT_SIM__ = { ok: true, itemId: item.id, result: runStatSimHarness(item) };
  } catch (error) {
    window.__GR_STAT_SIM__ = { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function resolveSimItem(raw: string): Promise<CraftedItemDef> {
  if (raw.trim().startsWith('{')) return assertCraftedItem(JSON.parse(raw));
  const found = approvedItems().find((item) => item.id === raw);
  if (!found) throw new Error(`Unknown simitem: ${raw}`);
  return found;
}

function approvedItems(): CraftedItemDef[] {
  const files =
    typeof import.meta.env === 'object'
      ? import.meta.glob<CraftingQueueApproved>('../../assets/crafting-queue/approved/*.json', {
          eager: true,
          import: 'default',
        })
      : {};
  return Object.values(files)
    .map((value) => parseApprovedQueueEntry(value)?.item ?? null)
    .filter((item): item is CraftedItemDef => Boolean(item));
}

function runWindows(stats: CraftedStatDeltas | null, seed: string): StatSimMetrics {
  return {
    dps: round(runDpsWindow(stats, seed), 3),
    survivalTime: round(runSurvivalWindow(stats, seed), 3),
    goldRate: round(runGoldWindow(stats, seed), 3),
  };
}

function runDpsWindow(stats: CraftedStatDeltas | null, seed: string): number {
  const rng = createRng(`${seed}:dps`);
  const damage = Balance.sparkRig.damage * statMult(stats?.damageMult);
  const fireRate = Balance.sparkRig.fireRate * statMult(stats?.fireRateMult);
  const range = Balance.sparkRig.range * statMult(stats?.rangeMult);
  let cooldown = 0;
  let damageDone = 0;

  for (let time = 0; time < DPS_WINDOW_SECONDS; time += STEP_SECONDS) {
    cooldown -= STEP_SECONDS;
    const targetDistance = 8.5 + Math.sin(time * 0.85) * 3.2 + rng.range(-0.25, 0.25);
    if (cooldown <= 0 && targetDistance <= range) {
      damageDone += damage;
      cooldown += 1 / fireRate;
    }
  }

  return damageDone / DPS_WINDOW_SECONDS;
}

function runSurvivalWindow(stats: CraftedStatDeltas | null, seed: string): number {
  const rng = createRng(`${seed}:survival`);
  const dps = runDpsWindow(stats, seed);
  const baseDps = runDpsWindow(null, seed);
  const moveMult = statMult(stats?.moveSpeedMult);
  let hp = Balance.hero.maxHp + (stats?.maxHpBonus ?? 0);
  let nextContact = 1.2;

  for (let time = 0; time < SURVIVAL_WINDOW_SECONDS; time += STEP_SECONDS) {
    nextContact -= STEP_SECONDS;
    if (nextContact > 0) continue;

    const dodgeChance = clamp(0.18 + (moveMult - 1) * 1.7 + ((dps / baseDps) - 1) * 0.2, 0, 0.72);
    if (rng.next() >= dodgeChance) hp -= Balance.enemy.contactDamage;
    if (hp <= 0) return time;
    nextContact += Balance.enemy.contactCooldown + 0.45 + rng.range(-0.08, 0.22);
  }

  return SURVIVAL_WINDOW_SECONDS;
}

function runGoldWindow(stats: CraftedStatDeltas | null, seed: string): number {
  const rng = createRng(`${seed}:gold`);
  const panTickMult = Math.max(0.1, statMult(stats?.panTickMult));
  const moveMult = statMult(stats?.moveSpeedMult);
  const channelShare = clamp(0.68 + (moveMult - 1) * 0.55, 0.55, 0.88);
  let progress = 0;
  let gold = 0;

  for (let time = 0; time < GOLD_WINDOW_SECONDS; time += STEP_SECONDS) {
    const cycle = (time + rng.seed * 0.000001) % 8;
    const channeling = cycle < 8 * channelShare;
    if (channeling) {
      progress += STEP_SECONDS / (Balance.goldSeam.tickSeconds * panTickMult);
      while (progress >= 1) {
        gold += Balance.goldSeam.tickGold;
        progress -= 1;
      }
    } else {
      progress = Math.max(
        0,
        progress - (STEP_SECONDS / (Balance.goldSeam.tickSeconds * panTickMult)) * Balance.goldSeam.decayMultiplier,
      );
    }
  }

  return gold / GOLD_WINDOW_SECONDS;
}

function metricDeltas(baseline: StatSimMetrics, measured: StatSimMetrics): StatSimMetrics {
  return {
    dps: round((measured.dps - baseline.dps) / baseline.dps, 4),
    survivalTime: round((measured.survivalTime - baseline.survivalTime) / baseline.survivalTime, 4),
    goldRate: round((measured.goldRate - baseline.goldRate) / baseline.goldRate, 4),
  };
}

function declaredStatBudget(stats: CraftedStatDeltas): number {
  return statBudgetValue(stats.damageMult, BUDGET_WEIGHTS.damageMult) +
    statBudgetValue(stats.fireRateMult, BUDGET_WEIGHTS.fireRateMult) +
    statBudgetValue(stats.rangeMult, BUDGET_WEIGHTS.rangeMult) +
    statBudgetValue(stats.moveSpeedMult, BUDGET_WEIGHTS.moveSpeedMult) +
    statBudgetValue(stats.panTickMult, BUDGET_WEIGHTS.panTickMult) +
    statBudgetValue(stats.maxHpBonus, BUDGET_WEIGHTS.maxHpBonus);
}

function measuredUtilityBudget(deltas: StatSimMetrics): number {
  return Math.max(0, deltas.dps) * 8 + Math.max(0, deltas.survivalTime) * 4 + Math.max(0, deltas.goldRate) * 3;
}

function statBudgetValue(value: number | undefined, weight: number): number {
  return Math.abs(value ?? 0) * weight;
}

function statMult(value: number | undefined): number {
  return Math.max(0.1, 1 + (value ?? 0));
}

function assertCraftedItem(value: unknown): CraftedItemDef {
  if (!isRecord(value)) throw new Error('simitem inline JSON must be an object');
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.blurb !== 'string') {
    throw new Error('simitem is missing id, name, or blurb');
  }
  if (!['weapon_mod', 'tool', 'trinket'].includes(String(value.kind))) throw new Error('simitem has invalid kind');
  if (!['common', 'uncommon', 'rare'].includes(String(value.rarity))) throw new Error('simitem has invalid rarity');
  if (typeof value.cost !== 'number' || !Number.isFinite(value.cost)) throw new Error('simitem has invalid cost');
  if (!isRecord(value.stats)) throw new Error('simitem is missing stats');
  for (const key of Object.keys(value.stats)) {
    if (!(key in BUDGET_WEIGHTS)) throw new Error(`simitem has unknown stat: ${key}`);
    const stat = value.stats[key];
    if (typeof stat !== 'number' || !Number.isFinite(stat)) throw new Error(`simitem has invalid stat: ${key}`);
  }
  return value as CraftedItemDef;
}

function stableStringify(value: unknown): string {
  if (!isRecord(value)) return JSON.stringify(value);
  const entries = Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(',')}}`;
}

function hashText(text: string): string {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function round(value: number, places = 4): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
