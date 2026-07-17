import { listContracts, type ContractManifest } from '../../meta/ContractFamilies';
import { importContract, type Charter, type CharterClock } from '../CharterSchema';

type BuildZones = NonNullable<ContractManifest['tileParams']['buildZones']>;

export const LEVER_LANDS = [
  {
    id: 'the-claim',
    label: 'The Claim',
    blurb: 'A river, a ford, and room to make a home.',
    imageUrl: new URL('../../../assets/raw/plate-contract-the-claim.png', import.meta.url).href,
  },
  {
    id: 'e1-dry-gulch',
    label: 'The Dry Gulch',
    blurb: 'Warm mesas gathered around one spring.',
    imageUrl: new URL('../../../assets/raw/plate-contract-dry-gulch.png', import.meta.url).href,
  },
  {
    id: 'e1-night-shift',
    label: 'Night Shift',
    blurb: 'A quiet claim under lantern light.',
    imageUrl: new URL('../../../assets/raw/plate-contract-night-shift.png', import.meta.url).href,
  },
  {
    id: 'e1-twin-banks',
    label: 'Twin Banks',
    blurb: 'Two green banks with a river between.',
    imageUrl: new URL('../../../assets/raw/plate-contract-twin-banks.png', import.meta.url).href,
  },
  {
    id: 'e1-baron',
    label: "The Baron's Claim",
    blurb: 'A broad claim beneath a brass banner.',
    imageUrl: new URL('../../../assets/raw/plate-contract-baron.png', import.meta.url).href,
  },
] as const;

export const LEVER_STORIES = [
  {
    id: 'defend',
    label: 'Defend the Camp',
    blurb: 'Raise a snug camp and keep its stake safe.',
    goal: 'Build a snug camp and hold it together.',
    rules: ['Keep the stake safe.', 'Build before the next visitors arrive.', 'Stand together when the bell rings.'],
    buildZones: [
      { id: 'camp', bank: 'south', minX: -18, maxX: 18, minZ: -28, maxZ: -8 },
    ] satisfies BuildZones,
  },
  {
    id: 'explore-quiet',
    label: 'Explore Quietly',
    blurb: 'Make two little camps and learn the land between.',
    goal: 'Explore both sides and keep the little camps safe.',
    rules: ['Take one trail at a time.', 'Leave room around the water.', 'Bring every traveler home.'],
    buildZones: [
      { id: 'south-lookout', bank: 'south', minX: -28, maxX: -8, minZ: -26, maxZ: -8 },
      { id: 'north-lookout', bank: 'north', minX: 8, maxX: 28, minZ: 8, maxZ: 26 },
    ] satisfies BuildZones,
  },
  {
    id: 'big-build',
    label: 'Build Something Big',
    blurb: 'Open the whole claim for one grand settlement.',
    goal: 'Fill the claim with one grand settlement.',
    rules: ['Make room for a broad camp.', 'Build on every safe bank.', 'Keep the heart of the settlement standing.'],
    buildZones: [
      { id: 'south-works', bank: 'south', minX: -30, maxX: 30, minZ: -30, maxZ: -7 },
      { id: 'north-works', bank: 'north', minX: -30, maxX: 30, minZ: 7, maxZ: 30 },
    ] satisfies BuildZones,
  },
] as const;

export const LEVER_VISITORS = [
  {
    id: 'gentle',
    label: 'Gentle',
    blurb: 'A few visitors follow two familiar trails.',
    lanes: { spawnEdges: ['north', 'south'], territoryRingBiasWaves: 0, territoryRingLaneBias: 0 },
  },
  {
    id: 'classic',
    label: 'Classic',
    blurb: 'The usual bustle comes from every trail.',
    lanes: { spawnEdges: ['north', 'south', 'east', 'west'], territoryRingBiasWaves: 3, territoryRingLaneBias: 0.75 },
  },
  {
    id: 'busy',
    label: 'Busy',
    blurb: 'Every trail stays lively around the claim.',
    lanes: { spawnEdges: ['north', 'south', 'east', 'west'], territoryRingBiasWaves: 6, territoryRingLaneBias: 1 },
  },
] as const;

export type LeverLandId = (typeof LEVER_LANDS)[number]['id'];
export type LeverStoryId = (typeof LEVER_STORIES)[number]['id'];
export type LeverVisitorsId = (typeof LEVER_VISITORS)[number]['id'];

const landsById = new Map(listContracts('epoch-1-frontier').map((contract) => [contract.id, contract]));

export function createLeverCharter(
  landId: LeverLandId,
  storyId: LeverStoryId,
  visitorsId: LeverVisitorsId,
  options: { author: string; clock: CharterClock },
): Charter {
  const land = LEVER_LANDS.find((choice) => choice.id === landId)!;
  const story = LEVER_STORIES.find((choice) => choice.id === storyId)!;
  const visitors = LEVER_VISITORS.find((choice) => choice.id === visitorsId)!;
  const contract = structuredClone(landsById.get(landId)!);

  contract.name = `${land.label} — ${story.label}`;
  contract.boardRow.name = contract.name;
  contract.boardRow.ledgerBlurb = story.blurb;
  contract.briefing.goals[0] = story.goal;
  contract.briefing.rules = contract.briefing.rules.map((_, index) => story.rules[Math.min(index, story.rules.length - 1)]!);
  contract.tileParams.buildZones = structuredClone(story.buildZones);
  contract.tileParams.lanes = { ...visitors.lanes, spawnEdges: [...visitors.lanes.spawnEdges] };

  return importContract(contract, { author: options.author, clock: options.clock });
}
