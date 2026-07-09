import { assetSlots } from '../assets/slots';
import { heroLedgerControlLines } from '../core/InputController';
import { Balance } from '../game/Balance';
import { buildableBlurb, buildableDefs, buildableTierEffectLine, getBuildableDef, type BuildableId } from '../game/buildables';
import { STEAMWORKS_THRESHOLD } from '../meta/ResearchTree';
import { DEFAULT_CONTRACT_ID, listContracts, loadContract, loadEpoch } from '../meta/ContractFamilies';
import { TOWN_ACTORS, townActorBark, type TownActorDefinition, type TownActorId } from '../town/townsfolk';
import { LEDGER_DISCOVERED_STORAGE_KEY } from './storage';

const heroUrl = new URL('../../assets/processed/char-hero-sheet-front-r0c0.png', import.meta.url).href;
const prospectorUrl = new URL('../../assets/processed/char-prospector-portrait.png', import.meta.url).href;
const claimJumperUrl = new URL('../../assets/processed/char-jumper-sheet-front-r0c0.png', import.meta.url).href;
const baronUrl = new URL('../../assets/processed/char-baron-sheet-walk4-b-r0c0.png', import.meta.url).href;
const sentryBeaconUrl = new URL('../../assets/processed/bld-sentry-beacon.png', import.meta.url).href;
const palisadeUrl = new URL('../../assets/processed/bld-palisade.png', import.meta.url).href;
const sluiceUrl = new URL('../../assets/processed/bld-sluice-works.png', import.meta.url).href;
const stockpileUrl = new URL('../../assets/processed/bld-stockpile-yard.png', import.meta.url).href;
const turretUrl = new URL('../../assets/processed/bld-signal-turret.png', import.meta.url).href;
const claimOfficeUrl = new URL('../../assets/processed/bld-claim-office.png', import.meta.url).href;
const titleEmblemUrl = new URL('../../assets/processed/ui-title-emblem.png', import.meta.url).href;

export const LEDGER_CATEGORIES = [
  'The People',
  'The Deputy',
  'The Opponents',
  'The Buildings',
  'The Claim',
  'The Eras',
] as const;

export type LedgerCategory = (typeof LEDGER_CATEGORIES)[number];
export type TownActorLedgerEntryId =
  | 'town_tavernkeeper'
  | 'town_storekeeper'
  | 'town_elder'
  | 'town_preacher'
  | 'town_schoolteacher'
  | 'town_assay_clerk'
  | 'town_youngster_a'
  | 'town_youngster_b';
export type EnemyLedgerEntryId = 'claim_jumper' | 'outlaw' | 'wrecker' | 'baron';
export type EnemyStatsDiscoveryId = `${EnemyLedgerEntryId}_stats`;
export type BuildableLedgerEntryId =
  | 'building_sentry_beacon'
  | 'building_palisade'
  | 'building_sluice'
  | 'building_stockpile'
  | 'building_turret'
  | 'building_assay_office'
  | 'building_lantern_post';
export type ContractLedgerEntryId =
  | 'the_claim'
  | 'contract_e1_dry_gulch'
  | 'contract_e1_night_shift'
  | 'contract_e1_twin_banks'
  | 'contract_e1_baron';
export type LedgerEntryId =
  | 'hero'
  | 'prospector'
  | TownActorLedgerEntryId
  | EnemyLedgerEntryId
  | BuildableLedgerEntryId
  | ContractLedgerEntryId
  | 'era_frontier';
export type LedgerDiscoveryId = LedgerEntryId | EnemyStatsDiscoveryId;

export type LedgerEntry = {
  id: LedgerEntryId;
  name: string;
  category: LedgerCategory;
  unlockSignal: string;
  factLines: () => string[];
  portraitLocked?: () => boolean;
  loreLine: string;
  spriteRef: {
    slot: string;
    imageUrl: string;
  };
};

export const townActorLedgerEntryById: Record<TownActorId, LedgerEntryId> = {
  tavernkeeper: 'town_tavernkeeper',
  storekeeper: 'town_storekeeper',
  elder: 'town_elder',
  preacher: 'town_preacher',
  schoolteacher: 'town_schoolteacher',
  assay_clerk: 'town_assay_clerk',
  youngster_a: 'town_youngster_a',
  youngster_b: 'town_youngster_b',
  prospector: 'prospector',
};

export const enemyStatsDiscoveryByEntryId: Record<EnemyLedgerEntryId, EnemyStatsDiscoveryId> = {
  claim_jumper: 'claim_jumper_stats',
  outlaw: 'outlaw_stats',
  wrecker: 'wrecker_stats',
  baron: 'baron_stats',
};
export const enemyStatsDiscoveryIds = Object.values(enemyStatsDiscoveryByEntryId) as readonly EnemyStatsDiscoveryId[];

export const buildableLedgerEntryById: Record<BuildableId, BuildableLedgerEntryId> = {
  sentry_beacon: 'building_sentry_beacon',
  palisade: 'building_palisade',
  sluice: 'building_sluice',
  stockpile: 'building_stockpile',
  turret: 'building_turret',
  assay_office: 'building_assay_office',
  lantern_post: 'building_lantern_post',
};

export const contractLedgerEntryById: Record<string, ContractLedgerEntryId> = {
  [DEFAULT_CONTRACT_ID]: 'the_claim',
  'e1-dry-gulch': 'contract_e1_dry_gulch',
  'e1-night-shift': 'contract_e1_night_shift',
  'e1-twin-banks': 'contract_e1_twin_banks',
  'e1-baron': 'contract_e1_baron',
};

const buildableSpriteById: Record<BuildableId, { imageUrl: string; slot: string }> = {
  sentry_beacon: { imageUrl: sentryBeaconUrl, slot: assetSlots.bldSentryBeacon },
  palisade: { imageUrl: palisadeUrl, slot: assetSlots.bldPortraitPalisade },
  sluice: { imageUrl: sluiceUrl, slot: assetSlots.bldPortraitSluice },
  stockpile: { imageUrl: stockpileUrl, slot: assetSlots.bldPortraitStockpile },
  turret: { imageUrl: turretUrl, slot: assetSlots.bldPortraitTurret },
  assay_office: { imageUrl: claimOfficeUrl, slot: 'building.assay_office' },
  lantern_post: { imageUrl: titleEmblemUrl, slot: 'building.lantern_post' },
};

export const alwaysDiscoveredEntryIds: readonly LedgerEntryId[] = ['hero', 'prospector', 'era_frontier'];

export const ledgerEntries: readonly LedgerEntry[] = [
  {
    id: 'hero',
    name: 'The Hero',
    category: 'The People',
    unlockSignal: 'profile:init',
    spriteRef: { slot: assetSlots.charHero, imageUrl: heroUrl },
    loreLine: 'The claim-holder is a young woman; never call her the Prospector. (lore/characters.md, 2026-07-09)',
    factLines: heroFactLines,
  },
  {
    id: 'prospector',
    name: 'The Prospector',
    category: 'The Deputy',
    unlockSignal: 'profile:init',
    spriteRef: { slot: assetSlots.charProspectorAgent, imageUrl: prospectorUrl },
    loreLine: 'The Prospector is the deputy-agent, earning trust by work. (lore/characters.md, 2026-07-09)',
    factLines: () => [
      `Home post: ${formatNumber(Balance.agent.homeX)}, ${formatNumber(Balance.agent.homeZ)}`,
      `Move speed: ${formatNumber(Balance.agent.moveSpeed)}wu/s`,
      `First survey: ${formatNumber(Balance.agent.surveyFirstSeconds)}s`,
      `Priority chase mark: ${Balance.agent.priorityChaseMark}`,
    ],
  },
  ...TOWN_ACTORS.filter((actor) => actor.id !== 'prospector').map(townActorEntry),
  enemyEntry('claim_jumper', 'Claim Jumper', claimJumperUrl, assetSlots.charClaimJumper, claimJumperFactLines),
  enemyEntry('outlaw', 'Outlaw Runner', claimJumperUrl, assetSlots.charClaimJumper, outlawFactLines),
  enemyEntry('wrecker', 'Wrecker', claimJumperUrl, assetSlots.charClaimJumper, wreckerFactLines),
  enemyEntry('baron', 'The Claim-Jumper Baron', baronUrl, assetSlots.charBaron, baronFactLines),
  ...buildableDefs.map((def) => {
    const sprite = buildableSpriteById[def.id];
    return buildableEntry(buildableLedgerEntryById[def.id], def.id, sprite.imageUrl, sprite.slot);
  }),
  {
    id: 'the_claim',
    name: 'The Claim',
    category: 'The Claim',
    unlockSignal: 'town:entered',
    spriteRef: { slot: 'contract.the-claim', imageUrl: claimOfficeUrl },
    loreLine: 'The river stake is where the town begins.',
    factLines: () => {
      const contract = loadContract('the-claim');
      return [
        contract.briefing.geographyLine,
        contract.briefing.goals[0] ?? '',
        contract.briefing.rules[0] ?? '',
        `Spawn edges: ${contract.tileParams.lanes.spawnEdges.join(', ')}`,
      ].filter(Boolean);
    },
  },
  ...listContracts()
    .filter((contract) => contract.id !== DEFAULT_CONTRACT_ID)
    .map((contract) => contractEntry(contract.id)),
  {
    id: 'era_frontier',
    name: 'Epoch 1 Frontier',
    category: 'The Eras',
    unlockSignal: 'profile:init',
    spriteRef: { slot: 'epoch.frontier', imageUrl: titleEmblemUrl },
    loreLine: 'Frontier days begin at the river claim.',
    factLines: () => {
      const epoch = loadEpoch('epoch-1-frontier');
      return [
        epoch.displayName,
        `${epoch.contracts.length} contract cards in the board set`,
        `Steamworks threshold: ${STEAMWORKS_THRESHOLD} science steps`,
        `${epoch.families.length} upgrade families in this era`,
      ];
    },
  },
] as const;

export const ledgerEntryById: Record<LedgerEntryId, LedgerEntry> = Object.fromEntries(
  ledgerEntries.map((entry) => [entry.id, entry]),
) as Record<LedgerEntryId, LedgerEntry>;

export function ledgerEntryIdForDiscoveryId(id: LedgerDiscoveryId): LedgerEntryId | undefined {
  if (id in ledgerEntryById) return id as LedgerEntryId;
  const match = (Object.entries(enemyStatsDiscoveryByEntryId) as Array<[EnemyLedgerEntryId, EnemyStatsDiscoveryId]>).find(
    ([, statsId]) => statsId === id,
  );
  return match?.[0];
}

export function ledgerEntryNameForDiscoveryId(id: LedgerDiscoveryId): string | undefined {
  const entryId = ledgerEntryIdForDiscoveryId(id);
  if (!entryId) return undefined;
  const name = ledgerEntryById[entryId].name;
  return enemyStatsDiscoveryIds.includes(id as EnemyStatsDiscoveryId) ? `${name} measurements` : name;
}

function heroFactLines(): string[] {
  const [move, primary, ability] = heroLedgerControlLines();
  const diagnostics = browserDiagnostics();
  const arsenal = diagnostics?.arsenal;
  const stateLine = arsenal
    ? `Current: ${formatNumber(diagnostics?.maxHp ?? Balance.hero.maxHp)} HP; blast ${formatNumber(arsenal.blastDamage)} dmg/${formatNumber(
        arsenal.blastRadius,
      )}wu`
    : `Base: ${Balance.hero.maxHp} HP; ${formatNumber(Balance.hero.speed)}wu/s`;
  return [move, primary, ability, stateLine];
}

function townActorEntry(actor: TownActorDefinition): LedgerEntry {
  return {
    id: townActorLedgerEntryById[actor.id] as TownActorLedgerEntryId,
    name: actor.name,
    category: 'The People',
    unlockSignal: `town:met:${actor.id}`,
    spriteRef: { slot: actor.assetSlot, imageUrl: actor.portraitUrl },
    loreLine: `${actor.post} belongs to the batch-009 town roster. (lore/characters.md, 2026-07-09)`,
    factLines: () => [
      `Post: ${actor.post}`,
      `Place: ${actor.anchor.replace(/_/g, ' ')}`,
      `Bark range: ${formatNumber(actor.barkRadius)}wu`,
      townActorBark(actor, null, 0),
    ],
  };
}

function enemyEntry(
  id: EnemyLedgerEntryId,
  name: string,
  imageUrl: string,
  slot: string,
  measuredLines: () => string[],
): LedgerEntry {
  return {
    id,
    name,
    category: 'The Opponents',
    unlockSignal: `enemy:sighted:${id}`,
    spriteRef: { slot, imageUrl },
    loreLine:
      id === 'baron'
        ? 'The Baron rides under an oxblood banner.'
        : 'Claim jumpers press the town without making it cruel.',
    portraitLocked: () => !isDiscoveryStored(enemyStatsDiscoveryByEntryId[id]),
    factLines: () =>
      isDiscoveryStored(enemyStatsDiscoveryByEntryId[id])
        ? measuredLines()
        : ['HP: Not yet measured', 'Contact: Not yet measured', 'Behavior: Not yet measured'],
  };
}

function buildableEntry(id: LedgerEntryId, buildableId: BuildableId, imageUrl: string, slot: string): LedgerEntry {
  return {
    id,
    name: getBuildableDef(buildableId)?.displayName ?? buildableId,
    category: 'The Buildings',
    unlockSignal: `build:${buildableId}`,
    spriteRef: { slot, imageUrl },
    loreLine: 'Town works stand where hands and plans meet.',
    factLines: () => {
      const def = getBuildableDef(buildableId);
      if (!def) return [];
      return [
        buildableBlurb(def) ?? '',
        `Cost: ${def.costCurve(0)} gold`,
        def.hpMax === null ? 'No structure HP' : `HP: ${formatNumber(def.hpMax)}`,
        buildableTierEffectLine(def.id, 1) ?? '',
      ].filter(Boolean);
    },
  };
}

function contractEntry(contractId: string): LedgerEntry {
  const id = contractLedgerEntryById[contractId];
  const contract = loadContract(contractId);
  return {
    id,
    name: contract.boardRow.name,
    category: 'The Claim',
    unlockSignal: `contract:seen:${contractId}`,
    spriteRef: { slot: `contract.${contractId}`, imageUrl: titleEmblemUrl },
    loreLine: 'Trail cards are chosen from the town board.',
    factLines: () => {
      const live = loadContract(contractId);
      return [
        live.boardRow.ledgerBlurb,
        live.briefing.goals[0] ?? '',
        live.briefing.rules[0] ?? '',
        `Spawn edges: ${live.tileParams.lanes.spawnEdges.join(', ')}`,
      ].filter(Boolean);
    },
  };
}

function claimJumperFactLines(): string[] {
  return [
    `HP: ${formatNumber(Balance.enemy.hp)}`,
    `Speed: ${formatNumber(Balance.enemy.speed)}wu/s`,
    `Contact: ${formatNumber(Balance.enemy.contactDamage)} damage`,
    `Drops: ${Balance.xp.perKill} XP`,
  ];
}

function outlawFactLines(): string[] {
  return [
    `HP: ${formatNumber(Balance.enemy.hp)}`,
    `Speed: ${formatNumber(Balance.enemy.speed)}wu/s`,
    `Contact: ${formatNumber(Balance.enemy.contactDamage)} damage`,
    'Behavior: steals carried gold',
  ];
}

function wreckerFactLines(): string[] {
  return [
    `HP: ${formatNumber(Balance.enemy.hp)}`,
    `Contact: ${formatNumber(Balance.enemy.contactDamage)} damage`,
    `Building hit: ${formatNumber(Balance.wreck.damage)} damage`,
    `Starts: wave ${Balance.wreck.minWave}`,
  ];
}

function baronFactLines(): string[] {
  const baron = loadContract('e1-baron').twist.baron;
  if (!baron) return [];
  const waveHp = Math.pow(Balance.waves.hpScalePerWave, baron.wave);
  return [
    `HP: ${formatNumber(Balance.enemy.hp * waveHp * baron.hpScale)}`,
    `Contact: ${formatNumber(Balance.enemy.contactDamage * (baron.contactDamageScale ?? 1))} damage`,
    `Building hit: ${formatNumber(Balance.wreck.damage * (baron.buildingDamageScale ?? 1))}`,
    `Arrives: wave ${baron.wave}`,
  ];
}

function isDiscoveryStored(id: LedgerDiscoveryId): boolean {
  const storage = browserStorage();
  if (!storage) return false;
  try {
    const raw = storage.getItem(LEDGER_DISCOVERED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) && parsed.includes(id);
  } catch {
    return false;
  }
}

function browserDiagnostics():
  | {
      maxHp?: number;
      arsenal?: { blastDamage: number; blastRadius: number };
    }
  | undefined {
  try {
    const root = globalThis as typeof globalThis & {
      __THREE_GAME_DIAGNOSTICS__?: {
        maxHp?: number;
        arsenal?: { blastDamage: number; blastRadius: number };
      };
    };
    return root.__THREE_GAME_DIAGNOSTICS__;
  } catch {
    return undefined;
  }
}

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}
