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
    enemyRoster?: readonly ContractEnemyVariant[];
    baron?: ContractBaronTwist;
  };
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
  | { ok: false; message: typeof CONTRACT_EDITOR_REJECTION_LINE };

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
  if (text.length > CONTRACT_EDITOR_MAX_DOCUMENT_CHARS) return { ok: false, message: CONTRACT_EDITOR_REJECTION_LINE };
  let candidate: unknown;
  try {
    candidate = JSON.parse(text);
  } catch {
    return { ok: false, message: CONTRACT_EDITOR_REJECTION_LINE };
  }
  const normalized = normalizeContractDescriptor(candidate, template);
  if (!normalized || normalized.id !== template.id) {
    return { ok: false, message: CONTRACT_EDITOR_REJECTION_LINE };
  }
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
    if (!globalThis.sessionStorage) return { ok: false, message: CONTRACT_EDITOR_REJECTION_LINE };
    globalThis.sessionStorage.setItem(contractEditorDocumentKey(template.id), contractDescriptorJson(parsed.contract));
  } catch {
    return { ok: false, message: CONTRACT_EDITOR_REJECTION_LINE };
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
  const requestedId = params.get('power') === 'dev' ? 'gt-test-basin' : params.get('tile');
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
};

function sameDescriptorShape(value: unknown, template: unknown, path = ''): boolean {
  const variableArray = variableDescriptorArrayShape(value, path);
  if (variableArray !== null) return variableArray;
  if (typeof template === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) return false;
    const range = contractNumberRange(path, template);
    return value >= range.min && value <= range.max && (range.step !== 1 || Number.isInteger(value));
  }
  if (typeof template === 'string') {
    const choices = DESCRIPTOR_ENUMS[path];
    return typeof value === 'string' && value.trim().length > 0 && value.length <= 1_024 && (!choices || choices.includes(value));
  }
  if (typeof template === 'boolean' || template === null) return typeof value === typeof template;
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return false;
    return value.length === template.length && value.every((entry, index) => sameDescriptorShape(entry, template[index], `${path}[]`));
  }
  if (!isRecord(template) || !isRecord(value) || Array.isArray(value)) return false;
  const templateKeys = Object.keys(template);
  const valueKeys = Object.keys(value);
  const childPath = (key: string) => (path ? `${path}.${key}` : key);
  if (valueKeys.some((key) => !Object.hasOwn(template, key) && !optionalDescriptorPath(childPath(key)))) return false;
  if (templateKeys.some((key) => !Object.hasOwn(value, key) && !optionalDescriptorPath(childPath(key)))) return false;
  return [...new Set([...templateKeys, ...valueKeys])].every((key) => sameDescriptorShape(value[key], template[key], childPath(key)));
}

function normalizeContractDescriptor(value: unknown, template: ContractManifest): ContractManifest | null {
  if (!isRecord(value) || !isRecord(value.tileParams)) return null;
  const candidateShape = withoutAuthoredTerrain(value);
  const templateShape = withoutAuthoredTerrain(template as unknown as Record<string, unknown>);
  if (!sameDescriptorShape(candidateShape, templateShape)) return null;

  const rawLayer = Object.hasOwn(value.tileParams, 'authoredTerrain') ? value.tileParams.authoredTerrain : undefined;
  const claimSize = typeof value.tileParams.size === 'number' ? value.tileParams.size : 64;
  const authoredTerrain = rawLayer === undefined ? undefined : decodeAuthoredTerrainLayer(rawLayer, claimSize);
  if (rawLayer !== undefined && !authoredTerrain) return null;

  const normalized = structuredClone(value) as unknown as ContractManifest;
  if (authoredTerrain) normalized.tileParams.authoredTerrain = authoredTerrain;
  else delete normalized.tileParams.authoredTerrain;
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

function variableDescriptorArrayShape(value: unknown, path: string): boolean | null {
  if (path === 'tileParams.buildZones') {
    if (value === undefined) return true;
    if (!Array.isArray(value) || value.length > 32) return false;
    const ids = new Set<string>();
    return value.every((entry) => {
      if (!exactRecord(entry, ['id', 'bank', 'minX', 'maxX', 'minZ', 'maxZ'])) return false;
      if (!shortText(entry.id) || ids.has(entry.id)) return false;
      ids.add(entry.id);
      return (
        (entry.bank === 'north' || entry.bank === 'south') &&
        finiteInRange(entry.minX, -AUTHORED_TERRAIN_MAX_ORIGIN, AUTHORED_TERRAIN_MAX_ORIGIN) &&
        finiteInRange(entry.maxX, -AUTHORED_TERRAIN_MAX_ORIGIN, AUTHORED_TERRAIN_MAX_ORIGIN) &&
        finiteInRange(entry.minZ, -AUTHORED_TERRAIN_MAX_ORIGIN, AUTHORED_TERRAIN_MAX_ORIGIN) &&
        finiteInRange(entry.maxZ, -AUTHORED_TERRAIN_MAX_ORIGIN, AUTHORED_TERRAIN_MAX_ORIGIN) &&
        (entry.minX as number) <= (entry.maxX as number) &&
        (entry.minZ as number) <= (entry.maxZ as number)
      );
    });
  }
  if (path === 'tileParams.waterSources') {
    if (!Array.isArray(value) || value.length > 32) return false;
    return value.every(
      (entry) =>
        exactRecord(entry, ['kind', 'x', 'z', 'radius']) &&
        entry.kind === 'spring_pond' &&
        finiteInRange(entry.x, -AUTHORED_TERRAIN_MAX_ORIGIN, AUTHORED_TERRAIN_MAX_ORIGIN) &&
        finiteInRange(entry.z, -AUTHORED_TERRAIN_MAX_ORIGIN, AUTHORED_TERRAIN_MAX_ORIGIN) &&
        finiteInRange(entry.radius, 0.01, 128),
    );
  }
  if (path === 'tileParams.lanes.spawnEdges') {
    if (!Array.isArray(value) || value.length < 1 || value.length > 4) return false;
    return new Set(value).size === value.length && value.every((entry) => DESCRIPTOR_ENUMS['tileParams.lanes.spawnEdges[]']!.includes(entry as string));
  }
  return null;
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
