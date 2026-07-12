import frontierCaps from '../../assets/contracts/epoch-1-frontier/caps.json' with { type: 'json' };
import frontierContracts from '../../assets/contracts/epoch-1-frontier/contracts.json' with { type: 'json' };
import frontierFamilies from '../../assets/contracts/epoch-1-frontier/families.json' with { type: 'json' };
import frontierManifest from '../../assets/contracts/epoch-1-frontier/manifest.json' with { type: 'json' };
import steamworksContracts from '../../assets/contracts/epoch-2-steamworks/contracts.json' with { type: 'json' };
import steamworksManifest from '../../assets/contracts/epoch-2-steamworks/manifest.json' with { type: 'json' };
import voltageManifest from '../../assets/contracts/epoch-3-voltage/manifest.json' with { type: 'json' };
import { MEGAPROJECT_STATE_KEY, type MegaprojectManifest } from './Megaproject';

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

export const RESEARCH_ICON_KEYS = [
  'ui.upgrade.icon.panning',
  'ui.upgrade.icon.prospecting',
  'ui.upgrade.icon.beacon',
  'ui.upgrade.icon.blast',
  'ui.upgrade.icon.firerate',
  'ui.upgrade.icon.gold',
  'ui.upgrade.icon.mend',
  'ui.upgrade.icon.mobility',
  'ui.upgrade.icon.range',
  'ui.upgrade.icon.volley',
  'bld.sentry_beacon',
  'bld.sluice_works',
  'char.prospector_agent.portrait',
  'node.gold_seam',
] as const;

export type ResearchIconKey = (typeof RESEARCH_ICON_KEYS)[number];

export type EpochResearchNode = {
  id: string;
  name: string;
  description: string;
  iconKey: ResearchIconKey;
  effect: string;
  effectRef: string;
  cost: number;
  requires?: readonly string[];
  live?: boolean;
};

export type EpochResearchBranch = {
  id: string;
  label: string;
  iconKey: ResearchIconKey;
  nodes: readonly EpochResearchNode[];
};

export type EpochResearchManifest = {
  branches: readonly EpochResearchBranch[];
};

export type EpochMegaprojectTarget = {
  id: string;
  surfaceRef: string;
  cost: { gold: number; bankedScience: number };
  raiseActionText: string;
};

export type EpochTransition = {
  ceremonyBeatId: string;
  kitArtKey: string;
  displayName: string;
};

export type EpochResourceDeclaration = {
  id: string;
  name: string;
  iconSlot: string;
  capDefault: number;
  ledgerBlurb: string;
};

export type ClaimOfficeExchangeRow = {
  id: string;
  from: string;
  to: string;
  fromAmount: number;
  toAmount: number;
  ledgerBlurb: string;
};

export type ClaimOfficeManifest = {
  exchange: ClaimOfficeExchangeRow[];
  // META-CURRENCY SLOT: future overall-currency rows fit this exchange shape; no meta currency ships in E2.
  metaCurrencySlot?: {
    reserved: boolean;
    note: string;
  };
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
export type ContractBaronTwist = {
  wave: number;
  bossKind?: 'baron' | 'railcar';
  hpScale: number;
  speedScale: number;
  scale: number;
  contactDamageScale?: number;
  buildingDamageScale?: number;
  supportBuildingDamageScale?: number;
  pursuitRange?: number;
  escortCount: number;
  tauntWaves: readonly number[];
  taunt: string;
  arrivalTitle?: string;
  tauntTitle?: string;
  defeatTitle?: string;
  defeatLine?: string;
  ledgerLabel?: string;
  secureCallout?: string;
  awardMedal?: boolean;
  defeatBeat: string;
  medalBlurb: string;
  sciencePayoutMult: number;
  railRouteIndex?: number;
  railSpeed?: number;
  componentDegradeSpeedMult?: number;
  components?: readonly ContractBossComponent[];
  rocketVolley?: {
    count: number;
    damage: number;
    radius: number;
    cadenceSeconds: number;
    telegraphSeconds: number;
    airTime: number;
    spreadRadius: number;
  };
};
export type ContractEnemyVariant = {
  id: string;
  label: string;
  waveMin?: number;
  hpScale?: number;
  speedMult?: number;
  visualScale?: number;
  tint?: string;
  boltDamageMult?: number;
  thief?: boolean;
  wrecker?: boolean;
  contactDamageScale?: number;
  buildingDamageScale?: number;
  supportBuildingDamageScale?: number;
  heroPursuitRange?: number;
  spawnEdges?: readonly ContractEdge[];
  spawnGates?: readonly ContractEnemySpawnGate[];
};
export type ContractEnemyLanternClass = 'rusher' | 'thief';
export type ContractEnemySpawnGate = {
  edge: ContractEdge;
  x: number;
  z: number;
};
export type ContractBossComponent = {
  id: string;
  label: string;
  hpScale: number;
  visualScale?: number;
  xOffset?: number;
  zOffset?: number;
  tint?: string;
  boltDamageMult?: number;
  contactDamageScale?: number;
  buildingDamageScale?: number;
  supportBuildingDamageScale?: number;
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
export type RailPathPoint = {
  x: number;
  z: number;
};
export type RailPathDescriptor = {
  points: RailPathPoint[];
  style?: 'placeholder' | 'steamworks' | 'mine-spur';
};
export type ContractHarvestAnchor = {
  x: number;
  z: number;
};
export type ContractHeightfieldDescriptor = {
  id: string;
  mode: 'visual';
  springBasin?: {
    x: number;
    z: number;
    radius: number;
    depth: number;
  };
  washChannels?: Array<{
    id: string;
    x: number;
    z: number;
    length: number;
    width: number;
    depth: number;
    angle: number;
  }>;
  bankRelief?: {
    amount: number;
    width: number;
  };
};
export type ContractAuthoredTerrainLayer = {
  version: 1;
  mode: 'visual-delta';
  columns: number;
  rows: number;
  cellSize: number;
  originX: number;
  originZ: number;
  heightDeltas: number[];
};
export type TerrainMeshRenderMode = 'required' | 'preferred' | 'off';
export type TileRenderDescriptor = {
  terrainMesh?: TerrainMeshRenderMode;
};
export type ContractPaletteDescriptor = {
  id: string;
  tint: [number, number, number];
  dampTint?: [number, number, number];
  dampAmount?: number;
  splat?: {
    rockAmount?: number;
    dampBand?: number;
    scrubAmount?: number;
    macroWarmth?: number;
    antiTile?: number;
  };
};
export type ContractDetailClass = 'rocks' | 'stumps' | 'dry_grass' | 'wagon_ruts' | 'claim_posts' | 'cactus' | 'reeds';
export type ContractScatterDescriptor = {
  id: string;
  density?: number;
  classCounts?: Partial<Record<ContractDetailClass, number>>;
  nearWaterBias?: number;
};
export type ContractGravelBar = {
  id: string;
  x: number;
  z: number;
  length: number;
  width: number;
  rotation: number;
};
export type ContractWaterZone = 'river' | 'ford' | 'shallows' | 'springPond';
export type ContractWaterDescriptor = {
  id: string;
  visualHalfWidth?: number;
  gravelBars?: ContractGravelBar[];
  depths?: Partial<Record<ContractWaterZone, number>>;
  speedMul?: Partial<Record<ContractWaterZone, number>>;
  heroCanWadeDeep?: boolean;
};
export type ContractBuildableFixture = {
  id: 'lantern_post';
  x: number;
  z: number;
  rotationSteps?: number;
  wrecked?: boolean;
  relightCost?: number;
};
export type ContractBriefing = {
  goals: string[];
  rules: string[];
  geographyLine: string;
};
export type ContractEscortMode = {
  id: 'escort';
  label: string;
  objective: string;
  cartsRequired: number;
  payout: number;
  railRouteIndex: number;
};
export type ContractManifest = {
  id: string;
  name: string;
  tileParams: {
    tileId: string;
    biome: string;
    size?: number;
    river: boolean;
    ford: boolean;
    fords?: ContractFord[];
    buildZones?: ContractBuildZone[];
    stakeMarkers?: ContractStakeMarker[];
    rails?: RailPathDescriptor[];
    waterSources: ContractWaterSource[];
    harvestAnchors?: ContractHarvestAnchor[];
    render?: TileRenderDescriptor;
    elevation?: TileElevationDescriptor;
    heightfield?: ContractHeightfieldDescriptor;
    authoredTerrain?: ContractAuthoredTerrainLayer;
    palette?: ContractPaletteDescriptor;
    scatter?: ContractScatterDescriptor;
    water?: ContractWaterDescriptor;
    prePlacedBuildables?: ContractBuildableFixture[];
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
    waveCadenceMult?: number;
    lightRamp?: ContractLightRamp;
    enemyLanternClasses?: readonly ContractEnemyLanternClass[];
    enemyRoster?: readonly ContractEnemyVariant[];
    baron?: ContractBaronTwist;
  };
  modes?: ContractEscortMode[];
  boardRow: {
    name: string;
    ledgerBlurb: string;
    tags: string[];
    unlock: string;
  };
  briefing: ContractBriefing;
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
  render?: TileRenderDescriptor;
  elevation?: TileElevationDescriptor;
  water?: ContractWaterDescriptor;
  rails?: RailPathDescriptor[];
};

export type EpochBundle = EpochMeta & {
  tile?: EpochTileDescriptor;
  devTiles: EpochTileDescriptor[];
  megaprojects: MegaprojectManifest[];
  resources: EpochResourceDeclaration[];
  claimOffice: ClaimOfficeManifest | null;
  contracts: ContractManifest[];
  families: EpochUpgradeFamily[];
  gates: string[];
  masteryConversions: MasteryConversionRule[];
  synergyCards: EpochUpgradeCard[];
  contractTiers: ContractTierBudget[];
  research: EpochResearchManifest;
  scienceThreshold: number;
  megaproject: EpochMegaprojectTarget;
  transition: EpochTransition;
  successor: string | null;
};

type EpochManifest = Omit<EpochMeta, 'threshold'> & {
  tile?: EpochTileDescriptor;
  devTiles?: EpochTileDescriptor[];
  megaprojects?: MegaprojectManifest[];
  resources?: EpochResourceDeclaration[];
  claimOffice?: ClaimOfficeManifest;
  research: EpochResearchManifest;
  scienceThreshold: number;
  megaproject: EpochMegaprojectTarget;
  transition: EpochTransition;
  successor: string | null;
  parts: {
    families?: string;
    caps?: string;
    contracts?: string;
    [part: string]: string | undefined;
  };
};

export const DEFAULT_EPOCH_ID = 'epoch-1-frontier';
export const ACTIVE_EPOCH_KEY = 'gr.activeEpoch.v1';
export const EPOCH_CEREMONY_KEY = 'gr.epochCeremony.v1';
export const DEFAULT_CONTRACT_ID = 'the-claim';
export const CONTRACT_EDITOR_PARAM = 'editorDescriptor';
export const CONTRACT_EDITOR_SESSION_REF = 'session';
export const CONTRACT_EDITOR_DOCUMENT_KEY = 'gr.editor.contract.v1';
export const CONTRACT_EDITOR_REJECTION_LINE = 'This page of the ledger is water-damaged. The contract stayed as it was.';
const PLAYER_CONTRACT_LAUNCH_KEY = 'gr.contract.launch.v1';
const CONTRACT_EDITOR_MAX_DOCUMENT_CHARS = 512 * 1_024;
const AUTHORED_TERRAIN_MAX_DIMENSION = 41;
const AUTHORED_TERRAIN_MAX_CELLS = AUTHORED_TERRAIN_MAX_DIMENSION * AUTHORED_TERRAIN_MAX_DIMENSION;
const AUTHORED_TERRAIN_MAX_DELTA = 16;
const AUTHORED_TERRAIN_MAX_ORIGIN = 512;

// Future locked-stub example:
// tile: { id: 'steamworks-forge-yard', biome: 'steamworks', elevation: { grid: { columns: 33, rows: 33 }, cellSize: 2, heightsRef: 'tiles/forge-yard.hf32', slopeMax: 0.7, waterline: -0.1 } }
const fallbackManifests: Record<string, EpochManifest> = {
  '../../assets/contracts/epoch-1-frontier/manifest.json': frontierManifest as EpochManifest,
  '../../assets/contracts/epoch-2-steamworks/manifest.json': steamworksManifest as EpochManifest,
  '../../assets/contracts/epoch-3-voltage/manifest.json': voltageManifest as EpochManifest,
};
const fallbackFamilyBundles: Record<string, EpochFamiliesBundle> = {
  '../../assets/contracts/epoch-1-frontier/families.json': frontierFamilies as EpochFamiliesBundle,
};
const fallbackCapsBundles: Record<string, EpochCapsBundle> = {
  '../../assets/contracts/epoch-1-frontier/caps.json': frontierCaps as EpochCapsBundle,
};
const fallbackContractBundles: Record<string, ContractsBundle> = {
  '../../assets/contracts/epoch-1-frontier/contracts.json': frontierContracts as ContractsBundle,
  '../../assets/contracts/epoch-2-steamworks/contracts.json': steamworksContracts as unknown as ContractsBundle,
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
  validateEpochManifest(manifest);
  const families = loadFamilies(manifest);
  const caps = loadCaps(manifest);
  const contracts = loadContracts(manifest);
  return {
    ...toMeta(manifest),
    tile: manifest.tile,
    devTiles: manifest.devTiles ?? [],
    megaprojects: manifest.megaprojects ?? [],
    resources: manifest.resources ?? [],
    claimOffice: manifest.claimOffice ?? null,
    contracts: contracts.contracts,
    families: families.families,
    gates: [...new Set(families.families.map((family) => family.unlockNodeId))],
    masteryConversions: families.masteryConversions,
    synergyCards: families.synergyCards,
    contractTiers: caps.contractTiers,
    research: manifest.research,
    scienceThreshold: manifest.scienceThreshold,
    megaproject: manifest.megaproject,
    transition: manifest.transition,
    successor: manifest.successor,
  };
}

export function activeTileDescriptor(): EpochTileDescriptor {
  const tileOverride = activeDevTileOverride();
  if (tileOverride) return tileOverride;
  const contract = activeContract();
  const tile: EpochTileDescriptor = {
    id: contract.tileParams.tileId,
    biome: contract.tileParams.biome,
  };
  if (contract.tileParams.render) tile.render = contract.tileParams.render;
  if (contract.tileParams.elevation) tile.elevation = contract.tileParams.elevation;
  if (contract.tileParams.rails) tile.rails = contract.tileParams.rails;
  if (!tile) throw new Error('Missing active tile descriptor: epoch-1-frontier');
  return tile;
}

export function activeWaterDescriptor(): ContractWaterDescriptor | undefined {
  const devWater = activeDevTileWaterOverride();
  if (devWater) return devWater;
  const contract = activeContract();
  const epochTile = manifestsById.get(DEFAULT_EPOCH_ID)?.tile;
  if (epochTile?.id === contract.tileParams.tileId) return mergeWaterDescriptor(epochTile.water, contract.tileParams.water);
  return contract.tileParams.water;
}

export function listContracts(epochId = DEFAULT_EPOCH_ID): ContractManifest[] {
  return loadEpoch(epochId).contracts;
}

export function listBoardContracts(): ContractManifest[] {
  return orderedManifests.flatMap((manifest) => (manifest.parts.contracts ? loadContracts(manifest).contracts : []));
}

export function loadContract(id: string, epochId?: string): ContractManifest {
  const contract = (epochId ? listContracts(epochId) : listBoardContracts()).find((entry) => entry.id === id);
  if (!contract) throw new Error(`Unknown contract: ${id}`);
  return contract;
}

export type ContractDescriptorParseResult =
  | { ok: true; contract: ContractManifest }
  | { ok: false; message: typeof CONTRACT_EDITOR_REJECTION_LINE; reasons: ContractDescriptorReason[] };

export type ContractDescriptorReason = {
  code: string;
  message: string;
  path?: string;
};

export function contractDescriptorJson(contract: ContractManifest): string {
  return `${JSON.stringify(contract, null, 2)}\n`;
}

export type ContractNumberRange = { min: number; max: number; step: number };

export function contractNumberRange(path: string, value: number): ContractNumberRange {
  const key = path.split('.').at(-1) ?? '';
  const signed = path.includes('.elevation.analytic.') || /^(?:.*X|.*Z|xOffset|zOffset|angle|rotation|waterline|.*Height)$/i.test(key);
  const discrete = path.includes('.classCounts.') || /^(?:size|columns|rows|rotationSteps|territoryRingBiasWaves)$/i.test(key);
  const magnitude = Math.max(1, Math.abs(value) * 3);
  if (key === 'rotationSteps') return { min: 0, max: 3, step: 1 };
  return {
    min: signed ? -Math.max(64, magnitude) : 0,
    max: signed ? Math.max(64, magnitude) : Math.max(discrete ? 20 : 1, magnitude),
    step: discrete ? 1 : 0.01,
  };
}

export function parseContractDescriptor(text: string, template: ContractManifest): ContractDescriptorParseResult {
  if (text.length > CONTRACT_EDITOR_MAX_DOCUMENT_CHARS) {
    return descriptorRejection(reason('document_too_large', 'This contract page is too large for the ledger.'));
  }
  let candidate: unknown;
  try {
    candidate = JSON.parse(text);
  } catch {
    return descriptorRejection(reason('document_unreadable', 'The marks on this contract page could not be read.'));
  }
  const reasons: ContractDescriptorReason[] = [];
  const normalized = normalizeContractDescriptor(candidate, template, reasons);
  if (!normalized) return descriptorRejection(reasons);
  if (normalized.id !== template.id) return descriptorRejection(reason('contract_id', 'This page belongs to a different contract.', 'id'));
  return { ok: true, contract: normalized };
}

export function readContractEditorDocument(template: ContractManifest): ContractDescriptorParseResult | null {
  try {
    const text = globalThis.sessionStorage?.getItem(contractEditorDocumentKey(template.id));
    return text === null || text === undefined ? null : parseContractDescriptor(text, template);
  } catch {
    return null;
  }
}

export function stageContractEditorDocument(text: string, template: ContractManifest): ContractDescriptorParseResult {
  const parsed = parseContractDescriptor(text, template);
  if (!parsed.ok) return parsed;
  try {
    if (!globalThis.sessionStorage) {
      return descriptorRejection(reason('document_storage', 'The ledger could not hold this contract page for the next scene.'));
    }
    globalThis.sessionStorage.setItem(contractEditorDocumentKey(template.id), contractDescriptorJson(parsed.contract));
  } catch {
    return descriptorRejection(reason('document_storage', 'The ledger could not hold this contract page for the next scene.'));
  }
  activeSelection = null;
  activeSelectionSearch = '';
  return parsed;
}

export function activeEpoch(): EpochBundle {
  return loadEpoch(activeEpochId());
}

export function activeEpochId(): string {
  const params = readSearchParams();
  const requestedId = params.get('epoch');
  const debug = params.has('debug') || params.has('editor') || params.get('bench') === 'fullbase';
  if (requestedId && debug && manifestsById.has(requestedId)) return requestedId;
  try {
    const persisted = globalThis.localStorage?.getItem(ACTIVE_EPOCH_KEY);
    if (persisted && manifestsById.has(persisted)) return persisted;
  } catch {}
  return DEFAULT_EPOCH_ID;
}

export function epochIsActive(id: string): boolean {
  const active = manifestsById.get(activeEpochId());
  const requested = manifestsById.get(id);
  return !!active && !!requested && active.order >= requested.order;
}

export function activateEpoch(id: string): boolean {
  const active = loadEpoch(activeEpochId());
  if (active.successor !== id || !epochMegaprojectComplete(active)) return false;
  loadEpoch(id);
  try {
    globalThis.localStorage?.setItem(EPOCH_CEREMONY_KEY, id);
    globalThis.localStorage?.setItem(ACTIVE_EPOCH_KEY, id);
    return globalThis.localStorage?.getItem(ACTIVE_EPOCH_KEY) === id;
  } catch {
    return false;
  }
}

export function epochMegaprojectComplete(epoch: EpochBundle): boolean {
  let raw: unknown;
  try {
    const saved = globalThis.localStorage?.getItem(MEGAPROJECT_STATE_KEY);
    raw = saved ? JSON.parse(saved) : null;
  } catch {
    return false;
  }
  if (!isRecord(raw) || !isRecord(raw.projects)) return false;
  const project = raw.projects[epoch.megaproject.id];
  if (!isRecord(project)) return false;
  if (project.complete === true) return true;
  const legacy = epoch.megaprojects.find((entry) => entry.id === epoch.megaproject.id);
  return !!legacy && typeof project.stage === 'number' && project.stage >= legacy.stages.length;
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
    threshold: manifest.scienceThreshold,
  };
}

let activeSelection: { contract: ContractManifest; diagnostics: ActiveContractDiagnostics } | null = null;
let activeSelectionSearch = '';

export function stagePlayerContractLaunch(id: string): void {
  activeSelection = null;
  activeSelectionSearch = '';
  try {
    globalThis.sessionStorage?.setItem(PLAYER_CONTRACT_LAUNCH_KEY, id);
  } catch {}
}

function activeContractSelection(): { contract: ContractManifest; diagnostics: ActiveContractDiagnostics } {
  const search = currentSearch();
  if (activeSelection && activeSelectionSearch === search) return activeSelection;

  const contracts = listContracts(DEFAULT_EPOCH_ID);
  const fallback = contracts.find((contract) => contract.id === DEFAULT_CONTRACT_ID) ?? defaultContractFor(manifestsById.get(DEFAULT_EPOCH_ID)!);
  const params = new URLSearchParams(search);
  const requestedId = params.get('contract');
  const debug = params.has('debug') || params.has('editor') || params.get('bench') === 'fullbase';
  const launched = requestedId ? isPlayerContractLaunch(requestedId) : false;
  let contract = fallback;
  let fallbackReason: ActiveContractDiagnostics['fallbackReason'] = null;

  if (requestedId && !debug && !launched) {
    fallbackReason = 'debug-disabled';
  } else if (requestedId) {
    const candidates = debug || launched ? listBoardContracts() : contracts;
    contract = candidates.find((entry) => entry.id === requestedId) ?? fallback;
    if (contract.id !== requestedId) fallbackReason = 'unknown-contract';
  }

  if (params.has('editor')) {
    const legacyText = params.get(CONTRACT_EDITOR_PARAM);
    if (legacyText === CONTRACT_EDITOR_SESSION_REF) {
      const staged = readContractEditorDocument(contract);
      if (staged?.ok) contract = staged.contract;
    } else if (legacyText !== null) {
      const legacy = parseContractDescriptor(legacyText, contract);
      if (legacy.ok) contract = legacy.contract;
      else {
        const staged = readContractEditorDocument(contract);
        if (staged?.ok) contract = staged.contract;
      }
    } else {
      const staged = readContractEditorDocument(contract);
      if (staged?.ok) contract = staged.contract;
    }
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
  activeSelectionSearch = search;
  return activeSelection;
}

function isPlayerContractLaunch(id: string): boolean {
  try {
    return globalThis.sessionStorage?.getItem(PLAYER_CONTRACT_LAUNCH_KEY) === id;
  } catch {
    return false;
  }
}

function activeDevTileOverride(): EpochTileDescriptor | null {
  const params = readSearchParams();
  const requestedId = params.has('powergraph') || params.get('power') === 'dev' ? 'gt-test-basin' : params.get('tile');
  if (!requestedId || !params.has('debug')) return null;
  const tile = manifestsById.get(DEFAULT_EPOCH_ID)?.devTiles?.find((entry) => entry.id === requestedId);
  if (!tile) return null;
  const active: EpochTileDescriptor = { id: tile.id, biome: tile.biome };
  if (tile.render) active.render = tile.render;
  if (tile.elevation) active.elevation = tile.elevation;
  if (tile.rails && params.get('rails') === 'dev') active.rails = tile.rails;
  return active;
}

function activeDevTileWaterOverride(): ContractWaterDescriptor | undefined {
  const params = readSearchParams();
  const requestedId = params.get('tile');
  if (!requestedId || !params.has('debug')) return undefined;
  return manifestsById.get(DEFAULT_EPOCH_ID)?.devTiles?.find((entry) => entry.id === requestedId)?.water;
}

function mergeWaterDescriptor(
  base: ContractWaterDescriptor | undefined,
  override: ContractWaterDescriptor | undefined,
): ContractWaterDescriptor | undefined {
  if (!base) return override;
  if (!override) return base;
  return {
    ...base,
    ...override,
    depths: { ...base.depths, ...override.depths },
    speedMul: { ...base.speedMul, ...override.speedMul },
    gravelBars: override.gravelBars ?? base.gravelBars,
  };
}

function validateEpochManifest(manifest: EpochManifest): void {
  const fail = (path: string): never => {
    throw new Error(`Invalid contract epoch ${manifest.id}: ${path}`);
  };
  const text = (value: unknown, path: string) => {
    if (typeof value !== 'string' || value.trim() === '') fail(path);
  };
  const whole = (value: unknown, path: string, minimum = 0) => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum) fail(path);
  };
  const icon = (value: unknown, path: string) => {
    if (!RESEARCH_ICON_KEYS.includes(value as ResearchIconKey)) fail(path);
  };

  whole(manifest.scienceThreshold, 'scienceThreshold must be a positive integer', 1);
  if (!isRecord(manifest.research) || !Array.isArray(manifest.research.branches) || manifest.research.branches.length !== 3) {
    fail('research.branches must contain exactly three branches');
  }

  const branchIds = new Set<string>();
  const nodes = new Map<string, EpochResearchNode>();
  for (const [branchIndex, branch] of manifest.research.branches.entries()) {
    if (!isRecord(branch)) fail(`research.branches[${branchIndex}] must be an object`);
    text(branch.id, `research.branches[${branchIndex}].id must be non-empty`);
    text(branch.label, `research.branches[${branchIndex}].label must be non-empty`);
    icon(branch.iconKey, `research.branches[${branchIndex}].iconKey is unknown`);
    if (branchIds.has(branch.id)) fail(`research branch id is duplicated: ${branch.id}`);
    branchIds.add(branch.id);
    if (!Array.isArray(branch.nodes)) fail(`research.branches[${branchIndex}].nodes must be an array`);
    for (const [nodeIndex, node] of branch.nodes.entries()) {
      if (!isRecord(node)) fail(`research.branches[${branchIndex}].nodes[${nodeIndex}] must be an object`);
      text(node.id, `research node id at ${branchIndex}:${nodeIndex} must be non-empty`);
      text(node.name, `research node ${node.id}.name must be non-empty`);
      text(node.description, `research node ${node.id}.description must be non-empty`);
      text(node.effect, `research node ${node.id}.effect must be non-empty`);
      text(node.effectRef, `research node ${node.id}.effectRef must be non-empty`);
      icon(node.iconKey, `research node ${node.id}.iconKey is unknown`);
      whole(node.cost, `research node ${node.id}.cost must be a positive integer`, 1);
      if (node.requires !== undefined && (!Array.isArray(node.requires) || node.requires.some((id) => typeof id !== 'string'))) {
        fail(`research node ${node.id}.requires must contain ids`);
      }
      if (nodes.has(node.id)) fail(`research node id is duplicated: ${node.id}`);
      nodes.set(node.id, node as unknown as EpochResearchNode);
    }
  }
  for (const node of nodes.values()) {
    for (const required of node.requires ?? []) {
      if (!nodes.has(required) || required === node.id) fail(`research node ${node.id} has invalid requirement: ${required}`);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) fail(`research requirements contain a cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const required of nodes.get(id)?.requires ?? []) visit(required);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of nodes.keys()) visit(id);

  if (!isRecord(manifest.megaproject)) fail('megaproject must be an object');
  text(manifest.megaproject.id, 'megaproject.id must be non-empty');
  text(manifest.megaproject.surfaceRef, 'megaproject.surfaceRef must be non-empty');
  text(manifest.megaproject.raiseActionText, 'megaproject.raiseActionText must be non-empty');
  if (!isRecord(manifest.megaproject.cost)) fail('megaproject.cost must be an object');
  whole(manifest.megaproject.cost.gold, 'megaproject.cost.gold must be a non-negative integer');
  whole(manifest.megaproject.cost.bankedScience, 'megaproject.cost.bankedScience must be a non-negative integer');

  if (!isRecord(manifest.transition)) fail('transition must be an object');
  text(manifest.transition.ceremonyBeatId, 'transition.ceremonyBeatId must be non-empty');
  text(manifest.transition.kitArtKey, 'transition.kitArtKey must be non-empty');
  text(manifest.transition.displayName, 'transition.displayName must be non-empty');
  if (manifest.successor !== null) {
    text(manifest.successor, 'successor must be a non-empty id or null');
    if (manifest.successor === manifest.id) fail('successor cannot be the current epoch');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const DESCRIPTOR_ENUMS: Record<string, readonly string[]> = {
  'tileParams.render.terrainMesh': ['required', 'preferred', 'off'],
  'tileParams.heightfield.mode': ['visual'],
  'tileParams.waterSources[].kind': ['spring_pond'],
  'tileParams.buildZones[].bank': ['north', 'south'],
  'tileParams.rails[].style': ['placeholder', 'steamworks', 'mine-spur'],
  'tileParams.prePlacedBuildables[].id': ['lantern_post'],
  'tileParams.lanes.spawnEdges[]': ['north', 'south', 'east', 'west'],
  'twist.enemyRoster[].spawnGates[].edge': ['north', 'south', 'east', 'west'],
};

const CONTRACT_DESCRIPTOR_REASON_LIMIT = 12;
const CONTRACT_DEFAULT_CLAIM_SIZE = 64;
const CONTRACT_RIVER_DRY_BANK_Z = 6.25;

function sameDescriptorShape(
  value: unknown,
  template: unknown,
  path: string,
  reasons: ContractDescriptorReason[],
): boolean {
  const variableArray = variableDescriptorArrayShape(value, path, reasons);
  if (variableArray !== null) return variableArray;
  if (typeof template === 'number') {
    const range = contractNumberRange(descriptorSchemaPath(path), template);
    const valid =
      typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= range.min &&
      value <= range.max &&
      (range.step !== 1 || Number.isInteger(value));
    if (!valid) addDescriptorReason(reasons, reason('field_number', 'A number on this contract page is outside its allowed range.', path));
    return valid;
  }
  if (typeof template === 'string') {
    const choices = DESCRIPTOR_ENUMS[descriptorSchemaPath(path)];
    const valid = typeof value === 'string' && value.trim().length > 0 && value.length <= 1_024 && (!choices || choices.includes(value));
    if (!valid) addDescriptorReason(reasons, textDescriptorReason(path, value, choices));
    return valid;
  }
  if (typeof template === 'boolean' || template === null) {
    const valid = typeof value === typeof template;
    if (!valid) addDescriptorReason(reasons, reason('field_type', 'A contract mark has the wrong kind of value.', path));
    return valid;
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) {
      addDescriptorReason(reasons, reason('field_list', 'A contract list has the wrong shape.', path));
      return false;
    }
    if (value.length !== template.length) {
      addDescriptorReason(reasons, arrayLengthDescriptorReason(path));
      return false;
    }
    let valid = true;
    value.forEach((entry, index) => {
      if (!sameDescriptorShape(entry, template[index], `${path}[${index}]`, reasons)) valid = false;
    });
    return valid;
  }
  if (!isRecord(template) || !isRecord(value) || Array.isArray(value)) {
    addDescriptorReason(reasons, reason('field_section', 'A contract section has the wrong shape.', path || undefined));
    return false;
  }
  const templateKeys = Object.keys(template);
  const valueKeys = Object.keys(value);
  const childPath = (key: string) => (path ? `${path}.${key}` : key);
  let valid = true;
  for (const key of [...new Set([...templateKeys, ...valueKeys])].sort()) {
    const nextPath = childPath(key);
    const inTemplate = Object.hasOwn(template, key);
    const inValue = Object.hasOwn(value, key);
    if (!inTemplate && !optionalDescriptorPath(nextPath)) {
      addDescriptorReason(reasons, reason('field_unknown', 'This contract page carries an unknown field.', nextPath));
      valid = false;
      continue;
    }
    if (!inValue && !optionalDescriptorPath(nextPath)) {
      addDescriptorReason(reasons, reason('field_missing', 'This contract page is missing a required field.', nextPath));
      valid = false;
      continue;
    }
    if (!sameDescriptorShape(value[key], template[key], nextPath, reasons)) valid = false;
  }
  return valid;
}

function normalizeContractDescriptor(
  value: unknown,
  template: ContractManifest,
  reasons: ContractDescriptorReason[],
): ContractManifest | null {
  if (!isRecord(value) || Array.isArray(value)) {
    addDescriptorReason(reasons, reason('field_section', 'The contract page must be one complete ledger record.'));
    return null;
  }
  if (!isRecord(value.tileParams) || Array.isArray(value.tileParams)) {
    addDescriptorReason(reasons, reason('field_section', 'The terrain section has the wrong shape.', 'tileParams'));
    return null;
  }
  const candidateShape = withoutAuthoredTerrain(value);
  const templateShape = withoutAuthoredTerrain(template as unknown as Record<string, unknown>);
  if (!sameDescriptorShape(candidateShape, templateShape, '', reasons)) return null;

  const rawLayer = Object.hasOwn(value.tileParams, 'authoredTerrain') ? value.tileParams.authoredTerrain : undefined;
  const claimSize = typeof value.tileParams.size === 'number' ? value.tileParams.size : 64;
  const authoredTerrain = rawLayer === undefined ? undefined : decodeAuthoredTerrainLayer(rawLayer, claimSize);
  if (rawLayer !== undefined && !authoredTerrain) {
    addDescriptorReason(reasons, reason('authored_terrain', 'The authored terrain marks do not fit this claim.', 'tileParams.authoredTerrain'));
    return null;
  }

  const normalized = structuredClone(value) as unknown as ContractManifest;
  if (authoredTerrain) normalized.tileParams.authoredTerrain = authoredTerrain;
  else delete normalized.tileParams.authoredTerrain;
  const semanticStart = reasons.length;
  validateContractMap(normalized, reasons);
  if (reasons.length > semanticStart) return null;
  return normalized;
}

function decodeAuthoredTerrainLayer(value: unknown, claimSize: number): ContractAuthoredTerrainLayer | null {
  if (!isRecord(value) || Array.isArray(value)) return null;
  const keys = ['version', 'mode', 'columns', 'rows', 'cellSize', 'originX', 'originZ', 'heightDeltas'];
  if (Object.keys(value).length !== keys.length || keys.some((key) => !Object.hasOwn(value, key))) return null;
  if (value.version !== 1 || value.mode !== 'visual-delta') return null;
  if (!Number.isInteger(value.columns) || !Number.isInteger(value.rows)) return null;
  const columns = value.columns as number;
  const rows = value.rows as number;
  if (columns < 3 || rows !== columns || columns > AUTHORED_TERRAIN_MAX_DIMENSION) return null;
  const cellCount = columns * rows;
  if (cellCount > AUTHORED_TERRAIN_MAX_CELLS || !Array.isArray(value.heightDeltas) || value.heightDeltas.length !== cellCount) return null;
  if (claimSize <= 0) return null;
  const expectedOrigin = -claimSize / 2;
  const expectedCellSize = claimSize / (columns - 1);
  if (!approximately(value.cellSize, expectedCellSize) || !approximately(value.originX, expectedOrigin) || !approximately(value.originZ, expectedOrigin)) {
    return null;
  }
  if (!value.heightDeltas.every((entry) => finiteInRange(entry, -AUTHORED_TERRAIN_MAX_DELTA, AUTHORED_TERRAIN_MAX_DELTA))) return null;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (row !== 0 && row !== rows - 1 && column !== 0 && column !== columns - 1) continue;
      if (value.heightDeltas[row * columns + column] !== 0) return null;
    }
  }
  return structuredClone(value) as unknown as ContractAuthoredTerrainLayer;
}

function withoutAuthoredTerrain(value: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...value };
  if (!isRecord(copy.tileParams)) return copy;
  const tileParams = { ...copy.tileParams };
  delete tileParams.authoredTerrain;
  copy.tileParams = tileParams;
  return copy;
}

function optionalDescriptorPath(path: string): boolean {
  return path === 'tileParams.buildZones';
}

function variableDescriptorArrayShape(
  value: unknown,
  path: string,
  reasons: ContractDescriptorReason[],
): boolean | null {
  if (path === 'tileParams.buildZones') {
    if (value === undefined) return true;
    if (!Array.isArray(value)) {
      addDescriptorReason(reasons, reason('build_zone_list', 'Build zones must be a list of surveyed rectangles.', path));
      return false;
    }
    if (value.length > 32) {
      addDescriptorReason(reasons, reason('build_zone_limit', 'A contract can hold at most 32 build zones.', path));
      return false;
    }
    const ids = new Set<string>();
    let valid = true;
    value.forEach((entry, index) => {
      const itemPath = `${path}[${index}]`;
      if (!exactRecord(entry, ['id', 'bank', 'minX', 'maxX', 'minZ', 'maxZ'])) {
        addDescriptorReason(reasons, reason('build_zone_shape', 'A build zone must carry one ID, bank, and rectangle.', itemPath));
        valid = false;
        return;
      }
      if (!shortText(entry.id)) {
        addDescriptorReason(reasons, reason('build_zone_id', 'Every build zone needs a short ID.', `${itemPath}.id`));
        valid = false;
      } else if (ids.has(entry.id)) {
        addDescriptorReason(reasons, reason('build_zone_duplicate', 'Each build zone needs a different ID.', `${itemPath}.id`));
        valid = false;
      } else {
        ids.add(entry.id);
      }
      if (entry.bank !== 'north' && entry.bank !== 'south') {
        addDescriptorReason(reasons, reason('build_zone_bank', 'Choose the north or south bank for this build zone.', `${itemPath}.bank`));
        valid = false;
      }
      for (const key of ['minX', 'maxX', 'minZ', 'maxZ'] as const) {
        if (!finiteInRange(entry[key], -AUTHORED_TERRAIN_MAX_ORIGIN, AUTHORED_TERRAIN_MAX_ORIGIN)) {
          addDescriptorReason(reasons, reason('build_zone_coordinate', 'A build-zone edge lies beyond the survey ledger.', `${itemPath}.${key}`));
          valid = false;
        }
      }
      if (typeof entry.minX === 'number' && typeof entry.maxX === 'number' && entry.minX > entry.maxX) {
        addDescriptorReason(reasons, reason('build_zone_order', 'A build zone must begin before it ends on the east-west line.', `${itemPath}.minX`));
        valid = false;
      }
      if (typeof entry.minZ === 'number' && typeof entry.maxZ === 'number' && entry.minZ > entry.maxZ) {
        addDescriptorReason(reasons, reason('build_zone_order', 'A build zone must begin before it ends on the north-south line.', `${itemPath}.minZ`));
        valid = false;
      }
    });
    return valid;
  }
  if (path === 'tileParams.waterSources') {
    if (!Array.isArray(value) || value.length > 32) {
      addDescriptorReason(reasons, reason('water_source_list', 'Water sources must be a list of at most 32 spring ponds.', path));
      return false;
    }
    let valid = true;
    value.forEach((entry, index) => {
      if (
        !exactRecord(entry, ['kind', 'x', 'z', 'radius']) ||
        entry.kind !== 'spring_pond' ||
        !finiteInRange(entry.x, -AUTHORED_TERRAIN_MAX_ORIGIN, AUTHORED_TERRAIN_MAX_ORIGIN) ||
        !finiteInRange(entry.z, -AUTHORED_TERRAIN_MAX_ORIGIN, AUTHORED_TERRAIN_MAX_ORIGIN) ||
        !finiteInRange(entry.radius, 0.01, 128)
      ) {
        addDescriptorReason(reasons, reason('water_source_shape', 'A spring pond needs a surveyed center and radius.', `${path}[${index}]`));
        valid = false;
      }
    });
    return valid;
  }
  if (path === 'tileParams.lanes.spawnEdges') {
    if (!Array.isArray(value)) {
      addDescriptorReason(reasons, reason('spawn_edge_list', 'Spawn edges must be a list of compass sides.', path));
      return false;
    }
    if (value.length === 0) {
      addDescriptorReason(reasons, reason('spawn_edge_required', 'Keep at least one open edge for incoming waves.', path));
      return false;
    }
    if (value.length > 4) {
      addDescriptorReason(reasons, reason('spawn_edge_limit', 'A claim has only four compass edges.', path));
    }
    let valid = value.length <= 4;
    const seen = new Set<unknown>();
    value.forEach((entry, index) => {
      const itemPath = `${path}[${index}]`;
      if (!DESCRIPTOR_ENUMS['tileParams.lanes.spawnEdges[]']!.includes(entry as string)) {
        addDescriptorReason(reasons, reason('spawn_edge_unknown', 'Choose north, south, east, or west for a spawn edge.', itemPath));
        valid = false;
      } else if (seen.has(entry)) {
        addDescriptorReason(reasons, reason('spawn_edge_duplicate', 'Each spawn edge may appear only once.', itemPath));
        valid = false;
      }
      seen.add(entry);
    });
    return valid;
  }
  return null;
}

function validateContractMap(contract: ContractManifest, reasons: ContractDescriptorReason[]): void {
  const claimHalf = (contract.tileParams.size ?? CONTRACT_DEFAULT_CLAIM_SIZE) / 2;
  for (const [index, zone] of (contract.tileParams.buildZones ?? []).entries()) {
    const path = `tileParams.buildZones[${index}]`;
    if (zone.minX < -claimHalf || zone.maxX > claimHalf || zone.minZ < -claimHalf || zone.maxZ > claimHalf) {
      addDescriptorReason(reasons, reason('build_zone_outside_claim', 'This build zone reaches beyond the claim stakes.', path));
    }
    if (zone.minX >= zone.maxX || zone.minZ >= zone.maxZ) {
      addDescriptorReason(reasons, reason('build_zone_zero_area', 'This build zone needs both width and depth.', path));
    }
    if (!contract.tileParams.river) continue;
    const hasDeclaredDryGround = zone.bank === 'north' ? zone.maxZ > CONTRACT_RIVER_DRY_BANK_Z : zone.minZ < -CONTRACT_RIVER_DRY_BANK_Z;
    if (hasDeclaredDryGround) continue;
    const hasOppositeDryGround = zone.bank === 'north' ? zone.minZ < -CONTRACT_RIVER_DRY_BANK_Z : zone.maxZ > CONTRACT_RIVER_DRY_BANK_Z;
    addDescriptorReason(
      reasons,
      hasOppositeDryGround
        ? reason('build_zone_wrong_bank', `This ${zone.bank}-bank zone reaches dry ground only on the other bank.`, path)
        : reason('build_zone_no_dry_ground', 'This build zone contains no dry bank ground.', path),
    );
  }
  for (const [index, source] of contract.tileParams.waterSources.entries()) {
    if (Math.abs(source.x) + source.radius <= claimHalf && Math.abs(source.z) + source.radius <= claimHalf) continue;
    addDescriptorReason(
      reasons,
      reason('water_source_outside_claim', 'This spring pond reaches beyond the claim stakes.', `tileParams.waterSources[${index}]`),
    );
  }
  for (const [index, fixture] of (contract.tileParams.prePlacedBuildables ?? []).entries()) {
    if (Math.abs(fixture.x) <= claimHalf && Math.abs(fixture.z) <= claimHalf) continue;
    addDescriptorReason(
      reasons,
      reason('fixture_outside_claim', 'This fixture stands beyond the claim stakes.', `tileParams.prePlacedBuildables[${index}]`),
    );
  }
}

function descriptorRejection(
  value: ContractDescriptorReason | ContractDescriptorReason[],
): Extract<ContractDescriptorParseResult, { ok: false }> {
  const reasons = (Array.isArray(value) ? value : [value]).slice();
  if (reasons.length === 0) reasons.push(reason('descriptor_invalid', 'This contract page could not pass the Assayer.'));
  reasons.sort(compareDescriptorReasons);
  return { ok: false, message: CONTRACT_EDITOR_REJECTION_LINE, reasons: reasons.slice(0, CONTRACT_DESCRIPTOR_REASON_LIMIT) };
}

function reason(code: string, message: string, path?: string): ContractDescriptorReason {
  return path === undefined ? { code, message } : { code, message, path };
}

function addDescriptorReason(reasons: ContractDescriptorReason[], next: ContractDescriptorReason): void {
  if (reasons.some((entry) => entry.code === next.code && entry.path === next.path)) return;
  if (reasons.length < CONTRACT_DESCRIPTOR_REASON_LIMIT) {
    reasons.push(next);
    return;
  }
  let lowestPriority = 0;
  for (let index = 1; index < reasons.length; index += 1) {
    if (compareDescriptorReasons(reasons[index]!, reasons[lowestPriority]!) > 0) lowestPriority = index;
  }
  if (compareDescriptorReasons(next, reasons[lowestPriority]!) < 0) reasons[lowestPriority] = next;
}

function compareDescriptorReasons(a: ContractDescriptorReason, b: ContractDescriptorReason): number {
  const rank = descriptorReasonRank(a.path) - descriptorReasonRank(b.path);
  if (rank !== 0) return rank;
  const path = compareDescriptorPaths(a.path ?? '', b.path ?? '');
  return path || compareDescriptorPaths(a.code, b.code);
}

function descriptorReasonRank(path?: string): number {
  if (path?.startsWith('tileParams.buildZones')) return 0;
  if (path?.startsWith('tileParams.lanes.spawnEdges')) return 1;
  if (path?.startsWith('briefing')) return 2;
  return 3;
}

function compareDescriptorPaths(a: string, b: string): number {
  const left = a.replace(/\[(\d+)\]/g, (_, index: string) => `[${index.padStart(6, '0')}]`);
  const right = b.replace(/\[(\d+)\]/g, (_, index: string) => `[${index.padStart(6, '0')}]`);
  return left < right ? -1 : left > right ? 1 : 0;
}

function descriptorSchemaPath(path: string): string {
  return path.replace(/\[\d+\]/g, '[]');
}

function textDescriptorReason(path: string, value: unknown, choices?: readonly string[]): ContractDescriptorReason {
  if (typeof value !== 'string') return reason('field_type', 'A contract line has the wrong kind of value.', path);
  if (value.length > 1_024) {
    return path.startsWith('briefing.')
      ? reason('briefing_too_long', 'This briefing line must fit within 1,024 characters.', path)
      : reason('field_text_too_long', 'This contract line must fit within 1,024 characters.', path);
  }
  if (choices && !choices.includes(value)) return reason('field_choice', 'Choose one of the authored values for this contract line.', path);
  if (path === 'briefing.geographyLine') {
    return reason('briefing_blank', 'The briefing needs a geography line.', path);
  }
  if (path.startsWith('briefing.goals[')) {
    return reason('briefing_blank', 'Every briefing goal needs plainspoken text.', path);
  }
  if (path.startsWith('briefing.rules[')) {
    return reason('briefing_blank', 'Every briefing rule needs plainspoken text.', path);
  }
  return reason('field_text', 'A line on this contract page is blank, unknown, or too long.', path);
}

function arrayLengthDescriptorReason(path: string): ContractDescriptorReason {
  if (path === 'briefing.goals') return reason('briefing_goal_count', 'Keep the contract briefing\'s authored goal rows.', path);
  if (path === 'briefing.rules') return reason('briefing_rule_count', 'Keep the contract briefing\'s authored rule rows.', path);
  return reason('field_list_length', 'A contract list has the wrong number of entries.', path);
}

function exactRecord(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return isRecord(value) && !Array.isArray(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function shortText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 96;
}

function finiteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function approximately(value: unknown, expected: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value - expected) <= 1e-9;
}

function contractEditorDocumentKey(contractId: string): string {
  return `${CONTRACT_EDITOR_DOCUMENT_KEY}:${contractId}`;
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
    briefing: {
      goals: ['Pan. Build. Hold the claim.'],
      rules: ['Secure the claim at wave 20, then stay for the rush.', 'Protect the stake; overrun ends the run.'],
      geographyLine: 'The classic river claim.',
    },
  };
}

function readSearchParams(): URLSearchParams {
  return new URLSearchParams(currentSearch());
}

function currentSearch(): string {
  try {
    return globalThis.location?.search ?? '';
  } catch {
    return '';
  }
}

try {
  if (typeof window !== 'undefined' && readDebugParamsForRegistry().debug) {
    window.__GR_CONTRACT_REGISTRY__ = {
      listEpochs,
      loadEpoch,
      activeEpoch,
      activeEpochId,
      epochIsActive,
      listContracts,
      listBoardContracts,
      loadContract,
      activeContract,
      activeContractDiagnostics,
      activeTileDescriptor,
      activeWaterDescriptor,
      contractTierBudget,
      contractBudgetOk,
    };
  }
} catch {}

function readDebugParamsForRegistry(): { debug: boolean } {
  const params = new URLSearchParams(window.location.search);
  return { debug: params.has('debug') || params.has('editor') || params.get('bench') === 'fullbase' };
}
