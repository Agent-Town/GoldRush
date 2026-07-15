import { assetSlots } from '../assets/slots';
import { heroLedgerControlLines } from '../core/InputController';
import { Balance } from '../game/Balance';
import { loadMetaProgress } from '../game/MetaProgress';
import { loadScores, type ScoreRecord } from '../game/Scoreboard';
import { buildableBlurb, buildableDefs, buildableTierEffectLine, getBuildableDef, type BuildableId } from '../game/buildables';
import { browserResearchStorage, loadResearchState, scienceMeter } from '../meta/ResearchTree';
import { DEFAULT_CONTRACT_ID, epochIsActive, listContracts, listEpochs, loadContract, loadEpoch } from '../meta/ContractFamilies';
import { TOWN_ACTORS, townActorBark, type TownActorDefinition, type TownActorId } from '../town/townsfolk';
import { LEDGER_DISCOVERED_STORAGE_KEY } from './storage';

const heroUrl = new URL('../../assets/processed/char-hero-sheet-front-r0c0.png', import.meta.url).href;
const prospectorUrl = new URL('../../assets/processed/char-prospector-portrait.png', import.meta.url).href;
const claimJumperUrl = new URL('../../assets/processed/char-jumper-sheet-front-r0c0.png', import.meta.url).href;
const banditBaseUrl = new URL('../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png', import.meta.url).href;
const baronUrl = new URL('../../assets/processed/char-baron-sheet-walk4-b-r0c0.png', import.meta.url).href;
const railToughUrl = new URL('../../assets/processed/char-railtough-sheet-walk4-a-r0c0.png', import.meta.url).href;
const steamWreckerUrl = new URL('../../assets/processed/char-steamwrecker-sheet-walk4-a-r0c0.png', import.meta.url).href;
const coalThiefUrl = new URL('../../assets/processed/char-coalthief-sheet-walk4-a-r0c0.png', import.meta.url).href;
const sentryBeaconUrl = new URL('../../assets/processed/bld-sentry-beacon.png', import.meta.url).href;
const palisadeUrl = new URL('../../assets/processed/bld-palisade.png', import.meta.url).href;
const sluiceUrl = new URL('../../assets/processed/bld-sluice-works.png', import.meta.url).href;
const stockpileUrl = new URL('../../assets/processed/bld-stockpile-yard.png', import.meta.url).href;
const turretUrl = new URL('../../assets/processed/bld-signal-turret.png', import.meta.url).href;
const claimOfficeUrl = new URL('../../assets/processed/bld-claim-office.png', import.meta.url).href;
const titleEmblemUrl = new URL('../../assets/processed/ui-title-emblem.png', import.meta.url).href;
const STEAMWORKS_EPOCH_ID = 'epoch-2-steamworks';
const CONTRACT_LOCKED_TERMS_LINE = "The clerk draws up the terms when you're ready.";
export const epochLedgerEntryById = {
  'epoch-1-frontier': 'era_frontier',
  'epoch-2-steamworks': 'era_steamworks',
  'epoch-3-voltage': 'era_voltage',
  'epoch-4-motor': 'era_motor',
  'epoch-5-deepwater': 'era_deepwater',
  'epoch-6-atomic': 'era_atomic',
  'epoch-7-signal': 'era_signal',
  'epoch-8-orbital': 'era_orbital',
} as const;

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
export type EnemyLedgerEntryId = 'claim_jumper' | 'outlaw' | 'wrecker' | 'baron' | 'rail_tough' | 'steam_wrecker' | 'coal_thief' | 'moth_swarm';
export type EnemyStatsDiscoveryId = `${EnemyLedgerEntryId}_stats`;
export type BuildableLedgerEntryId =
  | 'building_sentry_beacon'
  | 'building_palisade'
  | 'building_sluice'
  | 'building_stockpile'
  | 'building_boiler_house'
  | 'building_turret'
  | 'building_assay_office'
  | 'building_lantern_post'
  | 'building_decoy_shed'
  | 'building_capacitor_bank';
export type ContractLedgerEntryId =
  | 'the_claim'
  | 'assay_office_records'
  | 'contract_e1_dry_gulch'
  | 'contract_e1_night_shift'
  | 'contract_e1_twin_banks'
  | 'contract_e1_baron';
export type EpochLedgerEntryId = (typeof epochLedgerEntryById)[keyof typeof epochLedgerEntryById];
export type LedgerEpochId = keyof typeof epochLedgerEntryById;
export type LedgerEntryId =
  | 'hero'
  | 'prospector'
  | TownActorLedgerEntryId
  | EnemyLedgerEntryId
  | BuildableLedgerEntryId
  | ContractLedgerEntryId
  | EpochLedgerEntryId;
export type LedgerDiscoveryId = LedgerEntryId | EnemyStatsDiscoveryId;

export type LedgerEntry = {
  id: LedgerEntryId;
  epochId: LedgerEpochId;
  name: string;
  category: LedgerCategory;
  unlockSignal: string;
  factLines: () => string[];
  hiddenUntilDiscovered?: boolean;
  portraitLocked?: () => boolean;
  loreLine: string;
  spriteRef: {
    slot: string;
    imageUrl: string;
  };
};

export const townActorLedgerEntryById: Partial<Record<TownActorId, LedgerEntryId>> = {
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
  rail_tough: 'rail_tough_stats',
  steam_wrecker: 'steam_wrecker_stats',
  coal_thief: 'coal_thief_stats',
  moth_swarm: 'moth_swarm_stats',
};
export const enemyStatsDiscoveryIds = Object.values(enemyStatsDiscoveryByEntryId) as readonly EnemyStatsDiscoveryId[];

export const buildableLedgerEntryById: Record<BuildableId, BuildableLedgerEntryId> = {
  sentry_beacon: 'building_sentry_beacon',
  palisade: 'building_palisade',
  sluice: 'building_sluice',
  stockpile: 'building_stockpile',
  boiler_house: 'building_boiler_house',
  turret: 'building_turret',
  assay_office: 'building_assay_office',
  lantern_post: 'building_lantern_post',
  decoy_shed: 'building_decoy_shed',
  capacitor_bank: 'building_capacitor_bank',
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
  boiler_house: { imageUrl: titleEmblemUrl, slot: 'building.boiler_house' },
  turret: { imageUrl: turretUrl, slot: assetSlots.bldPortraitTurret },
  assay_office: { imageUrl: claimOfficeUrl, slot: 'building.assay_office' },
  lantern_post: { imageUrl: titleEmblemUrl, slot: 'building.lantern_post' },
  decoy_shed: { imageUrl: titleEmblemUrl, slot: 'building.decoy_shed' },
  capacitor_bank: { imageUrl: titleEmblemUrl, slot: 'building.capacitor_bank' },
};

export const epochLedgerEntryByIdForEpoch: Readonly<Record<string, EpochLedgerEntryId | undefined>> = epochLedgerEntryById;
export const alwaysDiscoveredEntryIds: readonly LedgerEntryId[] = ['hero', 'prospector', 'era_frontier'];

export const ledgerEntries: readonly LedgerEntry[] = [
  {
    id: 'hero',
    epochId: 'epoch-1-frontier',
    name: 'The Hero',
    category: 'The People',
    unlockSignal: 'profile:init',
    spriteRef: { slot: assetSlots.charHero, imageUrl: heroUrl },
    loreLine: 'The claim-holder is a young woman; never call her the Prospector. (lore/characters.md, 2026-07-09)',
    factLines: heroFactLines,
  },
  {
    id: 'prospector',
    epochId: 'epoch-1-frontier',
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
  ...TOWN_ACTORS.filter((actor) => actor.id !== 'prospector' && townActorLedgerEntryById[actor.id]).map(townActorEntry),
  enemyEntry('claim_jumper', 'Claim Jumper', claimJumperUrl, assetSlots.charClaimJumper, claimJumperFactLines),
  enemyEntry('outlaw', 'Outlaw Runner', banditBaseUrl, assetSlots.charBanditBase, outlawFactLines),
  enemyEntry('wrecker', 'Wrecker', claimJumperUrl, assetSlots.charClaimJumper, wreckerFactLines),
  enemyEntry('baron', 'The Claim-Jumper Baron', baronUrl, assetSlots.charBaron, baronFactLines),
  e2EnemyEntry('rail_tough', 'Rail Tough', railToughUrl, assetSlots.charE2RailTough, 'Rail-yard muscle in a riveted coat.', 'Tactics: its armor turns aside part of every bolt.'),
  e2EnemyEntry('steam_wrecker', 'Steam Wrecker', steamWreckerUrl, assetSlots.charE2SteamWrecker, 'A walking sledge built to make kindling of town works.', 'Tactics: stop it before it reaches a building.'),
  e2EnemyEntry('coal_thief', 'Coal Thief', coalThiefUrl, assetSlots.charE2CoalThief, 'A quick hand with soot for a calling card.', 'Tactics: catch it before it escapes with the claim purse.'),
  { id: 'moth_swarm', epochId: 'epoch-3-voltage', name: 'Fever Moths', category: 'The Opponents', unlockSignal: 'enemy:sighted:moth_swarm', spriteRef: { slot: 'char.e3.moth_swarm.placeholder', imageUrl: titleEmblemUrl }, loreLine: 'The Fever reaches nature too: moths hunger for every light the town builds.', factLines: () => ['Dims a light source while attached.', 'Scatters when struck; destroy the swarm to restore the light.'] },
  ...buildableDefs.map((def) => {
    const sprite = buildableSpriteById[def.id];
    return buildableEntry(buildableLedgerEntryById[def.id], def.id, sprite.imageUrl, sprite.slot);
  }),
  {
    id: 'the_claim',
    epochId: 'epoch-1-frontier',
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
  {
    id: 'assay_office_records',
    epochId: 'epoch-1-frontier',
    name: 'The Assay Office — Records',
    category: 'The Claim',
    unlockSignal: 'run:completed:first',
    spriteRef: { slot: 'assay-office.records', imageUrl: claimOfficeUrl },
    loreLine: 'The Assay Office keeps public tallies after the first claim returns.',
    hiddenUntilDiscovered: true,
    factLines: () => ['the office opens with the first assay.'],
  },
  ...listContracts()
    .filter((contract) => contract.id !== DEFAULT_CONTRACT_ID)
    .map((contract) => contractEntry(contract.id)),
  ...listEpochs().map((epoch) => epochEntry(epoch.id)),
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
  const id = townActorLedgerEntryById[actor.id] as TownActorLedgerEntryId;
  return {
    id,
    epochId: 'epoch-1-frontier',
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
    epochId: 'epoch-1-frontier',
    name,
    category: 'The Opponents',
    unlockSignal: `enemy:sighted:${id}`,
    spriteRef: { slot, imageUrl },
    loreLine:
      id === 'baron'
        ? 'The Baron rides under an oxblood banner.'
        : id === 'wrecker'
          ? 'Wreckers go for your buildings; the rest take the gaps.'
        : 'Claim jumpers press the town without making it cruel.',
    portraitLocked: () => !isDiscoveryStored(enemyStatsDiscoveryByEntryId[id]),
    factLines: () =>
      isDiscoveryStored(enemyStatsDiscoveryByEntryId[id])
        ? measuredLines()
        : ['HP: Not yet measured', 'Contact: Not yet measured', 'Behavior: Not yet measured'],
  };
}

function e2EnemyEntry(id: EnemyLedgerEntryId, name: string, imageUrl: string, slot: string, fiction: string, tactics: string): LedgerEntry {
  return {
    id,
    epochId: 'epoch-2-steamworks',
    name,
    category: 'The Opponents',
    unlockSignal: `enemy:sighted:${id}`,
    spriteRef: { slot, imageUrl },
    loreLine: fiction,
    factLines: () => [fiction, tactics],
  };
}

function buildableEntry(id: LedgerEntryId, buildableId: BuildableId, imageUrl: string, slot: string): LedgerEntry {
  return {
    id,
    epochId: buildableId === 'boiler_house' ? 'epoch-2-steamworks' : 'epoch-1-frontier',
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
    epochId: 'epoch-1-frontier',
    name: contract.boardRow.name,
    category: 'The Claim',
    unlockSignal: `contract:seen:${contractId}`,
    spriteRef: { slot: `contract.${contractId}`, imageUrl: titleEmblemUrl },
    loreLine: '',
    factLines: () => {
      const live = loadContract(contractId);
      const unlock = contractUnlock(live);
      if (!unlock.unlocked) return [live.boardRow.ledgerBlurb, unlock.condition, CONTRACT_LOCKED_TERMS_LINE].filter(Boolean);
      return [
        live.boardRow.ledgerBlurb,
        live.briefing.goals[0] ?? '',
        live.briefing.rules[0] ?? '',
        `Spawn edges: ${live.tileParams.lanes.spawnEdges.join(', ')}`,
      ].filter(Boolean);
    },
  };
}

function contractUnlock(contract: ReturnType<typeof loadContract>): { unlocked: boolean; condition: string } {
  const unlock = contract.boardRow.unlock;
  if (unlock === 'default') return { unlocked: true, condition: '' };

  const scores = loadScores();
  if (unlock === 'wave10OnClaim') {
    return {
      unlocked: scores.some((score) => contractIdOf(score) === DEFAULT_CONTRACT_ID && score.waves >= 10),
      condition: 'Reach wave 10 on The Claim',
    };
  }
  if (unlock === 'firstSecuredClaim') {
    return { unlocked: scores.some((score) => score.secured === true), condition: 'Secure a claim first' };
  }
  if (unlock === 'science-complete') {
    return { unlocked: scienceMeter(loadResearchState(browserResearchStorage())).complete, condition: 'Complete Frontier science first' };
  }
  if (unlock === 'science-complete+2-secured') {
    const securedContracts = new Set(scores.filter((score) => score.secured === true).map((score) => contractIdOf(score)));
    return {
      unlocked: scienceMeter(loadResearchState(browserResearchStorage())).complete && securedContracts.size >= 2,
      condition: 'Complete Frontier science and secure two different claims',
    };
  }
  if (unlock === STEAMWORKS_EPOCH_ID) {
    return { unlocked: epochIsActive(STEAMWORKS_EPOCH_ID), condition: 'Awaits the Steamworks era' };
  }
  if (unlock.startsWith('science')) {
    const required = Number.parseInt(unlock.match(/\d+/)?.[0] ?? '0', 10);
    const storage = browserStorage();
    const science = storage ? loadMetaProgress(storage).tracks.science : 0;
    return { unlocked: science >= required, condition: `Bank ${required} science first` };
  }
  return { unlocked: false, condition: 'Progress farther first' };
}

function contractIdOf(score: ScoreRecord): string {
  return score.contractId?.trim() || DEFAULT_CONTRACT_ID;
}

function epochEntry(epochId: string): LedgerEntry {
  const id = epochLedgerEntryByIdForEpoch[epochId];
  if (!id) throw new Error(`Missing ledger entry id for epoch: ${epochId}`);
  const epoch = loadEpoch(epochId);
  return {
    id,
    epochId: epochId as LedgerEpochId,
    name: epochName(epoch.displayName),
    category: 'The Eras',
    unlockSignal: epochId === 'epoch-1-frontier' ? 'profile:init' : `epoch-activated:${epochId}`,
    hiddenUntilDiscovered: epochId !== 'epoch-1-frontier',
    spriteRef: { slot: `epoch.${epochId}`, imageUrl: titleEmblemUrl },
    loreLine: `${epoch.displayName} keeps its pages beside the older ones.`,
    factLines: () => epochFactLines(epochId),
  };
}

function epochFactLines(epochId: string): string[] {
  const epoch = loadEpoch(epochId);
  const contracts = epoch.contracts.map((contract) => contract.boardRow.name || contract.name);
  const opponents = epoch.contracts
    .flatMap((contract) => [
      ...(contract.twist.enemyRoster ?? []).map((enemy) => enemy.label),
      contract.twist.baron?.ledgerLabel ?? contract.twist.baron?.arrivalTitle ?? '',
    ])
    .filter(Boolean);
  const works = [
    ...epoch.resources.map((resource) => resource.name),
    titleizeRef(epoch.megaproject.surfaceRef),
    ...buildableDefs.map((def) => def.displayName),
  ].filter(Boolean);
  return [
    `${epoch.displayName}: ${epoch.contracts.length || 1} claim page${epoch.contracts.length === 1 ? '' : 's'} in this era`,
    contracts.length > 0 ? `Claims: ${contracts.join(', ')}` : '',
    works.length > 0 ? `Works: ${works.slice(0, 4).join(', ')}` : '',
    opponents.length > 0 ? `Opponents: ${opponents.slice(0, 4).join(', ')}` : '',
  ].filter(Boolean);
}

function epochName(displayName: string): string {
  if (displayName === 'Frontier') return 'The Age of the Frontier';
  return displayName.startsWith('The ') ? displayName : `The Age of ${displayName}`;
}

function titleizeRef(ref: string): string {
  return ref
    .split('.')
    .at(-1)!
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(' ');
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
