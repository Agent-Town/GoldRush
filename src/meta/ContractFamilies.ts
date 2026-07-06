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
};

export type EpochUpgradeCard = {
  id: string;
  name: string;
  description: string;
  iconFamily: string;
  familyId?: string;
  maxStacks: number;
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

export type EpochBundle = EpochMeta & {
  families: EpochUpgradeFamily[];
  gates: string[];
  masteryConversions: MasteryConversionRule[];
  synergyCards: EpochUpgradeCard[];
};

type EpochManifest = EpochMeta & {
  parts: {
    families?: string;
    caps?: string;
    [part: string]: string | undefined;
  };
};

const fallbackManifests: Record<string, EpochManifest> = {
  '../../assets/contracts/epoch-1-frontier/manifest.json': frontierManifest as EpochManifest,
  '../../assets/contracts/epoch-2-steamworks/manifest.json': steamworksManifest as EpochManifest,
};
const fallbackFamilyBundles: Record<string, EpochFamiliesBundle> = {
  '../../assets/contracts/epoch-1-frontier/families.json': frontierFamilies as EpochFamiliesBundle,
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

const orderedManifests = Object.values(manifests).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
const manifestsById = new Map(orderedManifests.map((manifest) => [manifest.id, manifest]));

export function listEpochs(): EpochMeta[] {
  return orderedManifests.map(toMeta);
}

export function loadEpoch(id: string): EpochBundle {
  const manifest = manifestsById.get(id);
  if (!manifest) throw new Error(`Unknown contract epoch: ${id}`);
  const families = loadFamilies(manifest);
  return {
    ...toMeta(manifest),
    families: families.families,
    gates: [...new Set(families.families.map((family) => family.unlockNodeId))],
    masteryConversions: families.masteryConversions,
    synergyCards: families.synergyCards,
  };
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
    window.__GR_CONTRACT_REGISTRY__ = { listEpochs, loadEpoch };
  }
} catch {}
