import { Balance } from './Balance';
import { loadEpoch } from '../meta/ContractFamilies';
import { parseApprovedQueueEntry, type CraftedItemDef, type CraftingQueueApproved } from '../crafting/CraftingQueueContract';

export type UpgradeDeltas = {
  fireRateMult?: number;
  damageMult?: number;
  rangeMult?: number;
  boltSpeedMult?: number;
  volleyBonus?: number;
  maxHpBonus?: number;
  heal?: number;
  goldGrant?: number;
  moveSpeedMult?: number;
  panTickMult?: number;
  seamCapacityBonus?: number;
  seamRespawnReduction?: number;
  stockpileCapBonus?: number;
  beaconFireRateMult?: number;
  blastDamageMult?: number;
  blastRadiusMult?: number;
  blastCooldownMult?: number;
  agentPolicySlots?: number;
};

export type UpgradeDef = {
  id: string;
  name: string;
  description: string;
  iconFamily: string;
  familyId?: string;
  familyGate?: string;
  minWave?: number;
  crafted?: boolean;
  craftedProfile?: string;
  maxStacks: number;
  weight?: number;
  filler?: boolean;
  deltas: UpgradeDeltas;
};

const baselineUpgradeDefs = [
  {
    id: 'double_tap_coil',
    name: 'Double-Tap Coil',
    description: 'A second spring where one sufficed.',
    iconFamily: 'firerate',
    maxStacks: Balance.upgrades.doubleTapCoilMaxStacks,
    deltas: { fireRateMult: 0.25 },
  },
  {
    id: 'heavy_spark',
    name: 'Heavy Spark Charge',
    description: 'A brighter charge, stamped twice by the assay clerk.',
    iconFamily: 'damage',
    maxStacks: 3,
    deltas: { damageMult: 0.3 },
  },
  {
    id: 'long_resonator',
    name: 'Long-Barrel Resonator',
    description: 'A brass throat for sparks that dislike short errands.',
    iconFamily: 'range',
    maxStacks: 2,
    deltas: { rangeMult: 0.2, boltSpeedMult: 0.2 },
  },
  {
    id: 'split_spark',
    name: 'Split Spark',
    description: 'One patent, two signatures, both arriving hot.',
    iconFamily: 'volley',
    maxStacks: 2,
    deltas: { volleyBonus: 1 },
  },
  {
    id: 'tinkers_plating',
    name: "Tinker's Plating",
    description: 'Thin brass mercy, fitted under the coat.',
    iconFamily: 'plating',
    maxStacks: 3,
    deltas: { maxHpBonus: 25, heal: 25 },
  },
  {
    id: 'spring_heels',
    name: 'Spring Heels',
    description: 'Boot springs filed for urgent claim work.',
    iconFamily: 'mobility',
    maxStacks: 3,
    deltas: { moveSpeedMult: 0.12 },
  },
  {
    id: 'pan_legend',
    name: 'Pan Like a Legend',
    description: 'A patent rhythm for finding color before doubt.',
    iconFamily: 'panning',
    maxStacks: 2,
    deltas: { panTickMult: -0.3 },
  },
  {
    id: 'auto_pan',
    name: 'Auto-Pan',
    description: 'A pressure-fed shaking tool that works beside the untouched pan.',
    iconFamily: 'panning',
    familyGate: 'steam_parts',
    maxStacks: 1,
    weight: 0.45,
    deltas: { panTickMult: Balance.steamworksArsenal.autoPan.panTickMult },
  },
  {
    id: 'prospectors_luck',
    name: "Prospector's Luck",
    description: 'A ledger margin where richer seams keep appearing.',
    iconFamily: 'prospecting',
    maxStacks: 2,
    deltas: { seamCapacityBonus: 10, seamRespawnReduction: 5 },
  },
  {
    id: 'beacon_dynamo',
    name: 'Beacon Dynamo',
    description: 'A humming coil that teaches beacons impatience.',
    iconFamily: 'beacon',
    maxStacks: 2,
    deltas: { beaconFireRateMult: 0.3 },
  },
  {
    id: 'powder_charge',
    name: 'Powder Charge',
    description: 'A tighter powder cup for the charge rig.',
    iconFamily: 'blast',
    maxStacks: 2,
    deltas: { blastDamageMult: 0.25 },
  },
  {
    id: 'wide_ring',
    name: 'Wide Ring',
    description: 'A broader brass collar for the blast pattern.',
    iconFamily: 'blast',
    maxStacks: 2,
    deltas: { blastRadiusMult: 0.15 },
  },
  {
    id: 'quick_fuse',
    name: 'Quick Fuse',
    description: 'Shorter fuse cord, same steady hand.',
    iconFamily: 'blast',
    maxStacks: 2,
    deltas: { blastCooldownMult: -0.15 },
  },
  {
    id: 'assay_bonus',
    name: 'Assay Bonus',
    description: 'A tidy receipt from the Assay Office.',
    iconFamily: 'gold',
    filler: true,
    weight: 1,
    maxStacks: Number.POSITIVE_INFINITY,
    deltas: { goldGrant: 15 },
  },
  {
    id: 'field_dressing',
    name: 'Field Dressing',
    description: 'A practical bandage from the claim kit.',
    iconFamily: 'mend',
    filler: true,
    weight: 1,
    maxStacks: Number.POSITIVE_INFINITY,
    deltas: { heal: 30 },
  },
  {
    id: 'sharpen',
    name: 'Sharpen',
    description: 'A finer point filed onto the spark patent.',
    iconFamily: 'damage',
    filler: true,
    weight: 1,
    maxStacks: Number.POSITIVE_INFINITY,
    deltas: { damageMult: 0.05 },
  },
] as const satisfies readonly UpgradeDef[];

const frontierEpoch = loadEpoch('epoch-1-frontier');
const epochFamilyUpgradeDefs = frontierEpoch.families.flatMap((family) =>
  family.cards.map((card) => ({
    ...card,
    familyId: card.familyId ?? family.id,
    familyGate: family.unlockNodeId,
  })),
);
const craftedUpgradeDefs = loadCraftedUpgradeDefs();
const masterySynergyDefs = frontierEpoch.synergyCards;
const masteryConversionRules = frontierEpoch.masteryConversions;
const craftedOfferCap = frontierEpoch.contractTiers.find((tier) => tier.tier === 3)?.craftedOfferCap ?? 2;

export const upgradeDefs: readonly UpgradeDef[] = [
  ...baselineUpgradeDefs,
  ...epochFamilyUpgradeDefs,
  ...craftedUpgradeDefs,
  ...masterySynergyDefs,
];
export type UpgradeId = string;
export type ResolvedFiller = { goldGrant?: number; heal?: number; effectText: string };

export const upgradeDefById: Record<string, UpgradeDef> = upgradeDefs.reduce(
  (defs, def) => {
    defs[def.id] = def;
    return defs;
  },
  {} as Record<string, UpgradeDef>,
);

const masteryOfferIds = new Set(masteryConversionRules.flatMap((rule) => rule.offers));

export function isUpgradeId(id: string): id is UpgradeId {
  return id in upgradeDefById;
}

export function applyUpgradeBudgetsFromBalance(): void {
  (upgradeDefById.double_tap_coil as { maxStacks: number }).maxStacks = Balance.upgrades.doubleTapCoilMaxStacks;
}

export function upgradeEffect(def: UpgradeDef): string {
  const deltas: UpgradeDeltas = def.deltas;
  const parts: string[] = [];
  if (deltas.fireRateMult !== undefined) parts.push(`+${percent(deltas.fireRateMult)}% fire rate`);
  if (deltas.damageMult !== undefined) parts.push(`+${percent(deltas.damageMult)}% spark damage`);
  if (deltas.rangeMult !== undefined) parts.push(`+${percent(deltas.rangeMult)}% range`);
  if (deltas.boltSpeedMult !== undefined) parts.push(`+${percent(deltas.boltSpeedMult)}% bolt speed`);
  if (deltas.volleyBonus !== undefined) parts.push(`+${deltas.volleyBonus} spark per volley`);
  if (deltas.maxHpBonus !== undefined) parts.push(`+${deltas.maxHpBonus} max HP`);
  if (deltas.heal !== undefined) parts.push(`heals ${deltas.heal}`);
  if (deltas.goldGrant !== undefined) parts.push(`+${deltas.goldGrant} gold now`);
  if (deltas.moveSpeedMult !== undefined) parts.push(`+${percent(deltas.moveSpeedMult)}% move speed`);
  if (deltas.panTickMult !== undefined) {
    parts.push(
      deltas.panTickMult < 0
        ? `${percent(Math.abs(deltas.panTickMult))}% faster panning`
        : `${percent(deltas.panTickMult)}% slower panning`,
    );
  }
  if (deltas.seamCapacityBonus !== undefined) parts.push(`+${deltas.seamCapacityBonus} gold per seam`);
  if (deltas.seamRespawnReduction !== undefined) parts.push(`-${deltas.seamRespawnReduction}s seam respawn`);
  if (deltas.stockpileCapBonus !== undefined) parts.push(`+${deltas.stockpileCapBonus} stockpile room`);
  if (deltas.beaconFireRateMult !== undefined) parts.push(`+${percent(deltas.beaconFireRateMult)}% beacon fire rate`);
  if (deltas.blastDamageMult !== undefined) parts.push(`+${percent(deltas.blastDamageMult)}% blast damage`);
  if (deltas.blastRadiusMult !== undefined) parts.push(`+${percent(deltas.blastRadiusMult)}% blast radius`);
  if (deltas.blastCooldownMult !== undefined) parts.push(`${percent(Math.abs(deltas.blastCooldownMult))}% faster blast fuse`);
  if (deltas.agentPolicySlots !== undefined) parts.push(`+${deltas.agentPolicySlots} Prospector policy slot this run`);
  return parts.join(', ');
}

export function isUpgradeUnlocked(def: UpgradeDef, hasResearchNode: (id: string) => boolean): boolean {
  return !('familyGate' in def) || !def.familyGate || hasResearchNode(def.familyGate);
}

export function isMasteryConversionUnlocked(
  def: UpgradeDef,
  stacks: Partial<Record<string, number>>,
  hasResearchNode?: (id: string) => boolean,
): boolean {
  if (!masteryOfferIds.has(def.id)) return true;
  if (!hasResearchNode) return false;
  return masteryConversionRules.some(
    (rule) => rule.offers.includes(def.id) && isUpgradeFamilyMaxed(rule.whenFamilyMaxed, stacks, hasResearchNode),
  );
}

export function upgradeFamilyId(def: UpgradeDef): string {
  return def.familyId ?? def.iconFamily;
}

export function isUpgradeFamilyMaxed(
  familyId: string,
  stacks: Partial<Record<string, number>>,
  hasResearchNode: (id: string) => boolean,
): boolean {
  const family = upgradeDefs.filter(
    (def) =>
      upgradeFamilyId(def) === familyId &&
      !isFiller(def) &&
      !masteryOfferIds.has(def.id) &&
      isUpgradeUnlocked(def, hasResearchNode),
  );
  return family.length > 0 && family.every((def) => (stacks[def.id] ?? 0) >= def.maxStacks);
}

export function resolveFiller(def: UpgradeDef, ctx: { wave: number; maxHp: number }): ResolvedFiller {
  if (def.id === 'assay_bonus') {
    const goldGrant = Balance.upgrades.assayGoldPerWave * Math.max(1, ctx.wave);
    return { goldGrant, effectText: `+${goldGrant} gold now` };
  }
  if (def.id === 'field_dressing') {
    const heal = Math.round(Balance.upgrades.fieldDressingHealFrac * ctx.maxHp);
    return { heal, effectText: `heals ${heal}` };
  }
  return { effectText: upgradeEffect(def) };
}

function percent(value: number): number {
  return Math.round(value * 100);
}

function isFiller(def: UpgradeDef): boolean {
  return def.filler === true;
}

function loadCraftedUpgradeDefs(): UpgradeDef[] {
  const files =
    typeof import.meta.env === 'object'
      ? import.meta.glob<CraftingQueueApproved>('../../assets/crafting-queue/approved/*.json', {
          eager: true,
          import: 'default',
        })
      : {};
  const byId = new Map<string, UpgradeDef>();
  for (const value of Object.keys(files).sort().map((path) => files[path])) {
    const entry = parseApprovedQueueEntry(value);
    const card = entry?.item.family ? craftedItemCard(entry) : null;
    if (card) byId.set(card.id, card);
  }
  return [...byId.values()];
}

function craftedItemCard(entry: CraftingQueueApproved): UpgradeDef {
  const item: CraftedItemDef = entry.item;
  const family = item.family!;
  return {
    id: `crafted_${item.id}`,
    name: item.name,
    description: item.blurb,
    iconFamily: family,
    familyId: `crafted_${family}`,
    familyGate: 'pattern_library',
    crafted: true,
    craftedProfile: entry.request.profile,
    maxStacks: 1,
    weight: 0.85,
    deltas: { ...item.stats },
  };
}

export function craftedOfferLimit(): number {
  return craftedOfferCap;
}
