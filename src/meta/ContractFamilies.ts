import frontierCaps from '../../assets/contracts/epoch-1-frontier/caps.json' with { type: 'json' };
import frontierContracts from '../../assets/contracts/epoch-1-frontier/contracts.json' with { type: 'json' };
import frontierFamilies from '../../assets/contracts/epoch-1-frontier/families.json' with { type: 'json' };
import frontierManifest from '../../assets/contracts/epoch-1-frontier/manifest.json' with { type: 'json' };
import steamworksManifest from '../../assets/contracts/epoch-2-steamworks/manifest.json' with { type: 'json' };
import type { MegaprojectManifest } from './Megaproject';

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

export type ContractEdge = 'north' | 'south' | 'east' | 'west';
export type ContractWaterSource = {
  kind: 'spring_pond';
  x: number;
  z: number;
  radius: number;
};
export type ContractLightRamp = {
  duskWave: number;
  darkWave: number;
  dawnWave: number;
};
export type ContractFord = {
  id: string;
  x: number;
  halfWidth: number;
};
export type ContractBuildZone = {
  id: string;
  bank: 'north' | 'south';
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};
export type ContractStakeMarker = {
  id: string;
  x: number;
  z: number;
  lossCondition: boolean;
};
export type ContractManifest = {
  id: string;
  name: string;
  tileParams: {
    tileId: string;
    biome: string;
    river: boolean;
    ford: boolean;
    fords?: ContractFord[];
    buildZones?: ContractBuildZone[];
    stakeMarkers?: ContractStakeMarker[];
    waterSources: ContractWaterSource[];
    lanes: {
      spawnEdges: ContractEdge[];
      territoryRingBiasWaves: number;
      territoryRingLaneBias: number;
    };
  };
  twist: {
    sluicesNeedWaterSource?: boolean;
    seamYieldMult?: number;
    secureWave?: number;
    lightRamp?: ContractLightRamp;
  };
  boardRow: {
    name: string;
    ledgerBlurb: string;
    tags: string[];
    unlock: string;
  };
};
export type ContractsBundle = {
  version: 1;
  epochId: string;
  contracts: ContractManifest[];
};

export type ActiveContractDiagnostics = {
  activeId: string;
  requestedId: string | null;
  fallbackReason: 'debug-disabled' | 'unknown-contract' | null;
  warningSuppressed: boolean;
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
  devTiles: EpochTileDescriptor[];
  megaprojects: MegaprojectManifest[];
  contracts: ContractManifest[];
  families: EpochUpgradeFamily[];
  gates: string[];
  masteryConversions: MasteryConversionRule[];
  synergyCards: EpochUpgradeCard[];
  contractTiers: ContractTierBudget[];
};

type EpochManifest = EpochMeta & {
  tile?: EpochTileDescriptor;
  devTiles?: EpochTileDescriptor[];
  megaprojects?: MegaprojectManifest[];
  parts: {
    families?: string;
    caps?: string;
    contracts?: string;
    [part: string]: string | undefined;
  };
};

const DEFAULT_EPOCH_ID = 'epoch-1-frontier';
export const DEFAULT_CONTRACT_ID = 'the-claim';

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
const fallbackContractBundles: Record<string, ContractsBundle> = {
  '../../assets/contracts/epoch-1-frontier/contracts.json': frontierContracts as ContractsBundle,
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
const contractBundles =
  typeof import.meta.env === 'object'
    ? import.meta.glob<ContractsBundle>('../../assets/contracts/*/contracts.json', {
        eager: true,
        import: 'default',
      })
    : fallbackContractBundles;

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
  const contracts = loadContracts(manifest);
  return {
    ...toMeta(manifest),
    tile: manifest.tile,
    devTiles: manifest.devTiles ?? [],
    megaprojects: manifest.megaprojects ?? [],
    contracts: contracts.contracts,
    families: families.families,
    gates: [...new Set(families.families.map((family) => family.unlockNodeId))],
    masteryConversions: families.masteryConversions,
    synergyCards: families.synergyCards,
    contractTiers: caps.contractTiers,
  };
}

export function activeTileDescriptor(): EpochTileDescriptor {
  const tileOverride = activeDevTileOverride();
  if (tileOverride) return tileOverride;
  const contract = activeContract();
  const tile = {
    id: contract.tileParams.tileId,
    biome: contract.tileParams.biome,
  };
  if (!tile) throw new Error('Missing active tile descriptor: epoch-1-frontier');
  return tile;
}

export function listContracts(epochId = DEFAULT_EPOCH_ID): ContractManifest[] {
  return loadEpoch(epochId).contracts;
}

export function loadContract(id: string, epochId = DEFAULT_EPOCH_ID): ContractManifest {
  const contract = listContracts(epochId).find((entry) => entry.id === id);
  if (!contract) throw new Error(`Unknown contract: ${id}`);
  return contract;
}

export function activeContract(): ContractManifest {
  return activeContractSelection().contract;
}

export function activeContractDiagnostics(): ActiveContractDiagnostics {
  return activeContractSelection().diagnostics;
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

function loadContracts(manifest: EpochManifest): ContractsBundle {
  const contractsPath = manifest.parts.contracts;
  if (!contractsPath) {
    return { version: 1, epochId: manifest.id, contracts: [defaultContractFor(manifest)] };
  }
  const bundle = contractBundles[`../../assets/contracts/${manifest.id}/${contractsPath}`];
  if (!bundle) throw new Error(`Missing contracts bundle for contract epoch: ${manifest.id}`);
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

let activeSelection: { contract: ContractManifest; diagnostics: ActiveContractDiagnostics } | null = null;

function activeContractSelection(): { contract: ContractManifest; diagnostics: ActiveContractDiagnostics } {
  if (activeSelection) return activeSelection;

  const contracts = listContracts(DEFAULT_EPOCH_ID);
  const fallback = contracts.find((contract) => contract.id === DEFAULT_CONTRACT_ID) ?? defaultContractFor(manifestsById.get(DEFAULT_EPOCH_ID)!);
  const params = readSearchParams();
  const requestedId = params.get('contract');
  const debug = params.has('debug') || params.get('bench') === 'fullbase';
  let contract = fallback;
  let fallbackReason: ActiveContractDiagnostics['fallbackReason'] = null;

  if (requestedId && !debug) {
    fallbackReason = 'debug-disabled';
  } else if (requestedId) {
    contract = contracts.find((entry) => entry.id === requestedId) ?? fallback;
    if (contract.id !== requestedId) fallbackReason = 'unknown-contract';
  }

  activeSelection = {
    contract,
    diagnostics: {
      activeId: contract.id,
      requestedId,
      fallbackReason,
      warningSuppressed: fallbackReason === 'unknown-contract',
    },
  };
  return activeSelection;
}

function activeDevTileOverride(): EpochTileDescriptor | null {
  const params = readSearchParams();
  const requestedId = params.get('tile');
  if (!requestedId || !params.has('debug')) return null;
  return manifestsById.get(DEFAULT_EPOCH_ID)?.devTiles?.find((tile) => tile.id === requestedId) ?? null;
}

function defaultContractFor(manifest: EpochManifest): ContractManifest {
  return {
    id: DEFAULT_CONTRACT_ID,
    name: 'The Claim',
    tileParams: {
      tileId: manifest.tile?.id ?? 'frontier-river-claim',
      biome: manifest.tile?.biome ?? 'river-claim',
      river: true,
      ford: true,
      waterSources: [],
      lanes: {
        spawnEdges: ['north', 'south', 'east', 'west'],
        territoryRingBiasWaves: 3,
        territoryRingLaneBias: 0.75,
      },
    },
    twist: {},
    boardRow: {
      name: 'The Claim',
      ledgerBlurb: 'The classic river claim.',
      tags: ['trail'],
      unlock: 'default',
    },
  };
}

function readSearchParams(): URLSearchParams {
  try {
    return new URLSearchParams(globalThis.location?.search ?? '');
  } catch {
    return new URLSearchParams('');
  }
}

try {
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')) {
    window.__GR_CONTRACT_REGISTRY__ = {
      listEpochs,
      loadEpoch,
      listContracts,
      loadContract,
      activeContract,
      activeContractDiagnostics,
      activeTileDescriptor,
      contractTierBudget,
      contractBudgetOk,
    };
  }
} catch {}
