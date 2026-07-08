import { assetSlots, type AssetSlotId } from '../assets/slots';
import type { RotationDirection } from '../assets/OrientationResolver';
import type { TownBuilding, TownBuildingId } from './townLayout';

export type TownActorId =
  | 'tavernkeeper'
  | 'storekeeper'
  | 'elder'
  | 'preacher'
  | 'schoolteacher'
  | 'assay_clerk'
  | 'youngster_a'
  | 'youngster_b'
  | 'prospector';

export type TownActorDefinition = {
  id: TownActorId;
  name: string;
  post: string;
  assetSlot: AssetSlotId;
  portraitUrl: string;
  anchor: TownBuildingId;
  requiresBuilding?: TownBuildingId;
  position: { x: number; z: number };
  facing: RotationDirection;
  scale: number;
  barkRadius: number;
  e1Barks: readonly string[];
  loop?: {
    points: readonly { x: number; z: number }[];
    seconds: number;
    phase: number;
  };
};

const tavernkeeperPortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper.png', import.meta.url).href;
const storekeeperPortraitUrl = new URL('../../assets/processed/townsfolk-storekeeper.png', import.meta.url).href;
const elderPortraitUrl = new URL('../../assets/processed/townsfolk-elder.png', import.meta.url).href;
const preacherPortraitUrl = new URL('../../assets/processed/townsfolk-preacher.png', import.meta.url).href;
const schoolteacherPortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher.png', import.meta.url).href;
const assayClerkPortraitUrl = new URL('../../assets/processed/townsfolk-assay-clerk.png', import.meta.url).href;
const youngsterAPortraitUrl = new URL('../../assets/processed/townsfolk-youngster-a.png', import.meta.url).href;
const youngsterBPortraitUrl = new URL('../../assets/processed/townsfolk-youngster-b.png', import.meta.url).href;
const prospectorPortraitUrl = new URL('../../assets/processed/char-prospector-portrait.png', import.meta.url).href;

export const TOWN_ACTORS: readonly TownActorDefinition[] = [
  {
    id: 'tavernkeeper',
    name: 'Marta Vale',
    post: 'Tavernkeeper',
    assetSlot: assetSlots.charTownTavernkeeper,
    portraitUrl: tavernkeeperPortraitUrl,
    anchor: 'tavern',
    position: { x: -5.4, z: -6.75 },
    facing: 's',
    scale: 1.45,
    barkRadius: 3.2,
    e1Barks: ['Board is warm. Pick a trail when {town} is ready.', "Coffee's on; contracts wait by the hearth.", 'Every trail starts with a name on the board.'],
  },
  {
    id: 'storekeeper',
    name: 'Inez Bell',
    post: 'Storekeeper',
    assetSlot: assetSlots.charTownStorekeeper,
    portraitUrl: storekeeperPortraitUrl,
    anchor: 'general_store',
    requiresBuilding: 'general_store',
    position: { x: 1.55, z: -8.8 },
    facing: 's',
    scale: 1.4,
    barkRadius: 3,
    e1Barks: ["Tuesday's wagon brought nails, beans, and better luck.", 'If {town} can count it, I can stock it.', 'The shelf is small; the want is not.'],
  },
  {
    id: 'elder',
    name: 'Elder Rowan',
    post: 'Schoolhouse Elder',
    assetSlot: assetSlots.charTownElder,
    portraitUrl: elderPortraitUrl,
    anchor: 'schoolhouse',
    position: { x: -6.65, z: 7.35 },
    facing: 's',
    scale: 1.46,
    barkRadius: 5.4,
    e1Barks: ['{town} learns faster when the children ask why.', 'Science is patience written clearly.', 'Bring questions; leave with a plan.'],
  },
  {
    id: 'preacher',
    name: 'Elias Reed',
    post: 'Preacher',
    assetSlot: assetSlots.charTownPreacher,
    portraitUrl: preacherPortraitUrl,
    anchor: 'chapel',
    requiresBuilding: 'chapel',
    position: { x: -1.55, z: 11.35 },
    facing: 's',
    scale: 1.42,
    barkRadius: 3,
    e1Barks: ['The bell is for courage, not judgment.', 'Some days a town needs quiet more than gold.', '{town} has roots now. Tend them.'],
  },
  {
    id: 'schoolteacher',
    name: 'Nora Slate',
    post: 'Schoolteacher',
    assetSlot: assetSlots.charTownSchoolteacher,
    portraitUrl: schoolteacherPortraitUrl,
    anchor: 'schoolhouse',
    position: { x: -10.2, z: 6.85 },
    facing: 'se',
    scale: 1.36,
    barkRadius: 2.8,
    e1Barks: ['Chalk today, Steamworks tomorrow.', 'The little ones count waves faster than I do.', 'A good question is a lantern.'],
  },
  {
    id: 'assay_clerk',
    name: 'Ada Pike',
    post: 'Assay Clerk',
    assetSlot: assetSlots.charTownAssayClerk,
    portraitUrl: assayClerkPortraitUrl,
    anchor: 'assay_office',
    position: { x: 5.55, z: 9.3 },
    facing: 's',
    scale: 1.36,
    barkRadius: 3.05,
    e1Barks: ['Ore talks. My scale makes it honest.', 'Bring the odd bits here before they become trouble.', 'Gold in, proof out. That is the office bargain.'],
  },
  {
    id: 'youngster_a',
    name: 'Pip',
    post: 'Youngster',
    assetSlot: assetSlots.charTownYoungsterA,
    portraitUrl: youngsterAPortraitUrl,
    anchor: 'schoolhouse',
    position: { x: -2.8, z: -1.5 },
    facing: 's',
    scale: 1.15,
    barkRadius: 2.45,
    e1Barks: ['Race you from the trough to the office!', 'I found a shiny rock. It is probably science.', 'The Prospector hummed at me. I hummed back.'],
    loop: {
      points: [
        { x: -2.8, z: -1.5 },
        { x: -0.4, z: 1.9 },
        { x: 2.7, z: 0.7 },
        { x: 0.9, z: -2.5 },
      ],
      seconds: 11,
      phase: 0,
    },
  },
  {
    id: 'youngster_b',
    name: 'Juniper',
    post: 'Youngster',
    assetSlot: assetSlots.charTownYoungsterB,
    portraitUrl: youngsterBPortraitUrl,
    anchor: 'schoolhouse',
    position: { x: 2.2, z: 1.25 },
    facing: 'sw',
    scale: 1.14,
    barkRadius: 2.45,
    e1Barks: ['We drew the store before it was real.', 'If the Baron comes here, he has to do sums first.', 'I can see the whole square from the rail.'],
    loop: {
      points: [
        { x: 2.2, z: 1.25 },
        { x: -0.9, z: 2.55 },
        { x: -3.2, z: -0.8 },
        { x: 1.2, z: -2.15 },
      ],
      seconds: 13,
      phase: 0.34,
    },
  },
  {
    id: 'prospector',
    name: 'The Prospector',
    post: 'Claim Partner',
    assetSlot: assetSlots.charProspectorAgent,
    portraitUrl: prospectorPortraitUrl,
    anchor: 'claim_office',
    position: { x: 8.45, z: -4.55 },
    facing: 's',
    scale: 1.5,
    barkRadius: 5.1,
    e1Barks: ['I am watching {town} from the office steps.', '{town} is logged. I will keep near the claim books.', 'Call from the board; I will follow to the claim.'],
  },
] as const;

export function visibleTownActors(buildings: readonly TownBuilding[]): readonly TownActorDefinition[] {
  const visibleBuildings = new Set<TownBuildingId>(buildings.map((building) => building.id));
  return TOWN_ACTORS.filter((actor) => !actor.requiresBuilding || visibleBuildings.has(actor.requiresBuilding));
}

export function townActorBark(actor: TownActorDefinition, townName: string | null, visitCount: number): string {
  const town = townName?.trim() || 'this town';
  return actor.e1Barks[visitCount % actor.e1Barks.length]!.replaceAll('{town}', town);
}
