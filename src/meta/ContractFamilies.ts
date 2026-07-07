import frontierCaps from '../../assets/contracts/epoch-1-frontier/caps.json' with { type: 'json' };
import frontierFamilies from '../../assets/contracts/epoch-1-frontier/families.json' with { type: 'json' };
import frontierManifest from '../../assets/contracts/epoch-1-frontier/manifest.json' with { type: 'json' };
import steamworksManifest from '../../assets/contracts/epoch-2-steamworks/manifest.json' with { type: 'json' };

export type EpochUpgradeDeltas = {
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

export type EpochUpgradeCard = {
  id: string;
  name: string;
  description: string;
  iconFamily: string;
  familyId?: string;
  maxStacks: number;
  minWave?: number;
  weight?: number;
  filler?: boolean;
  deltas: EpochUpgradeDeltas;
};

export type EpochUpgradeFamily = {
  id: string;
  branch: string;
  unlockNodeId: string;
  cards: EpochUpgradeCard[];
};

export type MasteryConversionRule = {
  whenFamilyMaxed: string;
  offers: string[];
};

export type EpochFamiliesBundle = {
  version: 1;
  epochId: string;
  families: EpochUpgradeFamily[];
  masteryConversions: MasteryConversionRule[];
  synergyCards: EpochUpgradeCard[];
};

export type EpochMeta = {
  id: string;
  displayName: string;
  order: number;
  locked: boolean;
  threshold: number | null;
};

export type ContractRarity = 'common' | 'uncommon' | 'rare';
export type ContractTier = 1 | 2 | 3;
export type ContractTierBudget = {
  tier: ContractTier;
  name: string;
  rarityBudgets: Record<ContractRarity, number>;
  statCaps: {
    fireRateMult: number;
    damageMult: number;
    rangeMult: number;
    moveSpeedMult: number;
    panTickMult: number;
    maxHpBonus: number;
  };
  craftedOfferCap: number;
  agentPolicySlots: number;
};

export type EpochCapsBundle = {
  version: 1;
  epochId: string;
  contractTiers: ContractTierBudget[];
};

export type TileElevationDescriptor = {
  grid?: {
    columns: number;
    rows: number;
  };
  cellSize: number;
  heightsRef?: string;
  analytic?: Record<string, number>;
  slopeMax: number;
  waterline?: number;
};

export type EpochTileDescriptor = {
  id: string;
  biome: string;
  elevation?: TileElevationDescriptor;
};

export type EpochBundle = EpochMeta & {
  tile?: EpochTileDescriptor;
  families: EpochUpgradeFamily[];
  gates: string[];
  masteryConversions: MasteryConversionRule[];
  synergyCards: EpochUpgradeCard[];
  contractTiers: ContractTierBudget[];
};

type EpochManifest = EpochMeta & {
  tile?: EpochTileDescriptor;
  parts: {
    families?: string;
    caps?: string;
    [part: string]: string | undefined;
  };
};

// Future locked-stub example:
// tile: { id: 'steamworks-forge-yard', biome: 'steamworks', elevation: { grid: { columns: 33, rows: 33 }, cellSize: 2, heightsRef: 'tiles/forge-yard.hf32', slopeMax: 0.7, waterline: -0.1 } }
const fallbackManifests: Record<string, EpochManifest> = {
  '../../assets/contracts/epoch-1-frontier/manifest.json': frontierManifest as EpochManifest,
  '../../assets/contracts/epoch-2-steamworks/manifest.json': steamworksManifest as EpochManifest,
};
const fallbackFamilyBundles: Record<string, EpochFamiliesBundle> = {
  '../../assets/contracts/epoch-1-frontier/families.json': frontierFamilies as EpochFamiliesBundle,
};
const fallbackCapsBundles: Record<string, EpochCapsBundle> = {
  '../../assets/contracts/epoch-1-frontier/caps.json': frontierCaps as EpochCapsBundle,
};

const manifests =
  typeof import.meta.env === 'object'
    ? import.meta.glob<EpochManifest>('../../assets/contracts/*/manifest.json', {
        eager: true,
        import: 'default',
      })
    : fallbackManifests;
const familyBundles =
  typeof import.meta.env === 'object'
    ? import.meta.glob<EpochFamiliesBundle>('../../assets/contracts/*/families.json', {
        eager: true,
        import: 'default',
      })
    : fallbackFamilyBundles;
const capsBundles =
  typeof import.meta.env === 'object'
    ? import.meta.glob<EpochCapsBundle>('../../assets/contracts/*/caps.json', {
        eager: true,
        import: 'default',
      })
    : fallbackCapsBundles;

const orderedManifests = Object.values(manifests).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
const manifestsById = new Map(orderedManifests.map((manifest) => [manifest.id, manifest]));

export function listEpochs(): EpochMeta[] {
  return orderedManifests.map(toMeta);
}

export function loadEpoch(id: string): EpochBundle {
  const manifest = manifestsById.get(id);
  if (!manifest) throw new Error(`Unknown contract epoch: ${id}`);
  const families = loadFamilies(manifest);
  const caps = loadCaps(manifest);
  return {
    ...toMeta(manifest),
    tile: manifest.tile,
    families: families.families,
    gates: [...new Set(families.families.map((family) => family.unlockNodeId))],
    masteryConversions: families.masteryConversions,
    synergyCards: families.synergyCards,
    contractTiers: caps.contractTiers,
  };
}

export function activeTileDescriptor(): EpochTileDescriptor {
  const tile = loadEpoch('epoch-1-frontier').tile;
  if (!tile) throw new Error('Missing active tile descriptor: epoch-1-frontier');
  return tile;
}

export function contractTierBudget(epochId: string, tier: number): ContractTierBudget {
  const epoch = loadEpoch(epochId);
  const cleaned = Math.max(1, Math.min(3, Math.floor(tier))) as ContractTier;
  return epoch.contractTiers.find((entry) => entry.tier === cleaned) ?? epoch.contractTiers[0]!;
}

export function contractBudgetOk(epochId: string, tier: number, rarity: ContractRarity, budget: number): boolean {
  return budget <= contractTierBudget(epochId, tier).rarityBudgets[rarity];
}

function loadFamilies(manifest: EpochManifest): EpochFamiliesBundle {
  const familiesPath = manifest.parts.families;
  if (!familiesPath) {
    return { version: 1, epochId: manifest.id, families: [], masteryConversions: [], synergyCards: [] };
  }
  const bundle = familyBundles[`../../assets/contracts/${manifest.id}/${familiesPath}`];
  if (!bundle) throw new Error(`Missing families bundle for contract epoch: ${manifest.id}`);
  return bundle;
}

function loadCaps(manifest: EpochManifest): EpochCapsBundle {
  const capsPath = manifest.parts.caps;
  if (!capsPath) return { version: 1, epochId: manifest.id, contractTiers: [] };
  const bundle = capsBundles[`../../assets/contracts/${manifest.id}/${capsPath}`];
  if (!bundle) throw new Error(`Missing caps bundle for contract epoch: ${manifest.id}`);
  return bundle;
}

function toMeta(manifest: EpochManifest): EpochMeta {
  return {
    id: manifest.id,
    displayName: manifest.displayName,
    order: manifest.order,
    locked: manifest.locked,
    threshold: manifest.threshold,
  };
}

try {
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')) {
    window.__GR_CONTRACT_REGISTRY__ = { listEpochs, loadEpoch, activeTileDescriptor, contractTierBudget, contractBudgetOk };
  }
} catch {}
