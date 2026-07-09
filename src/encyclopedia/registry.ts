import { assetSlots } from '../assets/slots';
import { Balance } from '../game/Balance';
import { buildableBlurb, buildableTierEffectLine, getBuildableDef, type BuildableId } from '../game/buildables';
import { STEAMWORKS_THRESHOLD } from '../meta/ResearchTree';
import { loadContract, loadEpoch } from '../meta/ContractFamilies';

const heroUrl = new URL('../../assets/processed/char-hero-sheet-front-r0c0.png', import.meta.url).href;
const prospectorUrl = new URL('../../assets/processed/char-prospector-portrait.png', import.meta.url).href;
const claimJumperUrl = new URL('../../assets/processed/char-jumper-sheet-front-r0c0.png', import.meta.url).href;
const sentryBeaconUrl = new URL('../../assets/processed/bld-sentry-beacon.png', import.meta.url).href;
const sluiceUrl = new URL('../../assets/processed/bld-sluice-works.png', import.meta.url).href;
const stockpileUrl = new URL('../../assets/processed/bld-stockpile-yard.png', import.meta.url).href;
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
export type LedgerEntryId =
  | 'hero'
  | 'prospector'
  | 'claim_jumper'
  | 'building_sentry_beacon'
  | 'building_sluice'
  | 'building_stockpile'
  | 'the_claim'
  | 'era_frontier';

export type LedgerEntry = {
  id: LedgerEntryId;
  name: string;
  category: LedgerCategory;
  unlockSignal: string;
  factLines: () => string[];
  loreLine: string;
  spriteRef: {
    slot: string;
    imageUrl: string;
  };
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
    factLines: () => [
      `Max HP: ${Balance.hero.maxHp}`,
      `Move speed: ${formatNumber(Balance.hero.speed)}wu/s`,
      'Move: WASD, arrows, or touch stick',
      'Tools: Space/Enter confirm, B build, R rotate, Q swap rig',
    ],
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
  {
    id: 'claim_jumper',
    name: 'Claim Jumper',
    category: 'The Opponents',
    unlockSignal: 'enemy:first-kill:claim-jumper',
    spriteRef: { slot: assetSlots.charClaimJumper, imageUrl: claimJumperUrl },
    loreLine: 'The first antagonist line starts with outlaw pressure, warm but never grim. (lore/characters.md, 2026-07-09)',
    factLines: () => [
      `Base HP: ${formatNumber(Balance.enemy.hp)}`,
      `Speed: ${formatNumber(Balance.enemy.speed)}wu/s`,
      `Contact: ${formatNumber(Balance.enemy.contactDamage)} damage`,
      `Drops: ${Balance.xp.perKill} XP`,
    ],
  },
  buildableEntry('building_sentry_beacon', 'sentry_beacon', sentryBeaconUrl, assetSlots.bldSentryBeacon),
  buildableEntry('building_sluice', 'sluice', sluiceUrl, assetSlots.bldPortraitSluice),
  buildableEntry('building_stockpile', 'stockpile', stockpileUrl, assetSlots.bldPortraitStockpile),
  {
    id: 'the_claim',
    name: 'The Claim',
    category: 'The Claim',
    unlockSignal: 'town:entered',
    spriteRef: { slot: 'contract.the-claim', imageUrl: claimOfficeUrl },
    loreLine: 'The river stake is where the town begins. (lore/README.md places law; docs/GOLD_RUSH_BRIEF.md §2)',
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
    id: 'era_frontier',
    name: 'Epoch 1 Frontier',
    category: 'The Eras',
    unlockSignal: 'profile:init',
    spriteRef: { slot: 'epoch.frontier', imageUrl: titleEmblemUrl },
    loreLine: 'The future lives in the lore wiki, but players earn pages in order. (lore/README.md, 2026-07-09)',
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

export const buildableLedgerEntryById: Partial<Record<BuildableId, LedgerEntryId>> = {
  sentry_beacon: 'building_sentry_beacon',
  sluice: 'building_sluice',
  stockpile: 'building_stockpile',
};

function buildableEntry(id: LedgerEntryId, buildableId: BuildableId, imageUrl: string, slot: string): LedgerEntry {
  return {
    id,
    name: getBuildableDef(buildableId)?.displayName ?? buildableId,
    category: 'The Buildings',
    unlockSignal: `build:${buildableId}`,
    spriteRef: { slot, imageUrl },
    loreLine: 'Buildings are places and rituals, not backend tools. (lore/README.md institutions law; docs/GOLD_RUSH_BRIEF.md §9.4)',
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

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}
