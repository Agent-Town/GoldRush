export type StorySpeakerId =
  | 'elder'
  | 'tavernkeeper'
  | 'clerk'
  | 'prospector'
  | 'newsie'
  | 'schoolteacher'
  | 'preacher'
  | 'reactor-steward-e6'
  | 'kitchen-chemist-e6'
  | 'appliance-wrangler-e6'
  | 'diner-carhop-e6'
  | 'combine-defector-e6'
  | 'depot-clerk-e6'
  | 'civic-agent-e7'
  | 'switchboard-chief-e7'
  | 'playbook-librarian-e7'
  | 'drone-keeper-e7'
  | 'tape-courier-e7'
  | 'combine-defector-e7'
  | 'launch-master-e8'
  | 'dome-gardener-e8'
  | 'suit-fitter-e8'
  | 'moon-born-child-e8'
  | 'canal-reeve-e9'
  | 'greenkeeper-e9'
  | 'ice-quarry-chief-e9'
  | 'weather-warden-e9'
  | 'moon-born-child-e9';

export type StorySpeaker = {
  id: StorySpeakerId;
  name: string;
  portraitUrl: string;
  objectPosition: string;
};

const elderPortraitUrl = new URL('../../assets/processed/townsfolk-elder.png', import.meta.url).href;
const tavernkeeperPortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper.png', import.meta.url).href;
const clerkPortraitUrl = new URL('../../assets/processed/townsfolk-assay-clerk.png', import.meta.url).href;
const prospectorPortraitUrl = new URL('../../assets/processed/char-prospector-portrait.png', import.meta.url).href;
const newsiePortraitUrl = new URL('../../assets/processed/char-newsie-mei-sheet-walk8-r2c0.png', import.meta.url).href;
const schoolteacherPortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher.png', import.meta.url).href;
const preacherPortraitUrl = new URL('../../assets/processed/townsfolk-preacher.png', import.meta.url).href;

// THE ERA CAST (E6-E9 plates), processed by portraits-e5-e10-batch from the row-60 portrait
// convention (assets/LEDGER.md rows 60-65). Each id carries the ERA OF ITS PLATE, because the
// convention makes every later portrait of the same person an image-EDIT of an earlier one
// (CLAUDE.md section 8): `combine-defector-e6` and `combine-defector-e7` are one man in two
// eras, `moon-born-child-e8` and `moon-born-child-e9` one child before and after growing. The
// suffix also stops a reader assuming an E10 plate exists where none does.
// TIER NOTE (measured, not inherited): these plates are FULL-BLEED parchment busts with NO
// chroma key - assets/raw/tf-reactor-steward-e6.png keys 0/147456 px at the pipeline's own
// #8a8a8a, while assets/raw/townsfolk-elder.png (the source of the seven above) is 46.22%
// key-coloured. They are processed full-bleed at 384x384 like `char-prospector-portrait.png`,
// which is the same tier and already one of the seven.
const reactorStewardE6PortraitUrl = new URL('../../assets/processed/townsfolk-reactor-steward-e6.png', import.meta.url).href;
const kitchenChemistE6PortraitUrl = new URL('../../assets/processed/townsfolk-kitchen-chemist-e6.png', import.meta.url).href;
const applianceWranglerE6PortraitUrl = new URL('../../assets/processed/townsfolk-appliance-wrangler-e6.png', import.meta.url).href;
const dinerCarhopE6PortraitUrl = new URL('../../assets/processed/townsfolk-diner-carhop-e6.png', import.meta.url).href;
const combineDefectorE6PortraitUrl = new URL('../../assets/processed/townsfolk-combine-defector-e6.png', import.meta.url).href;
const depotClerkE6PortraitUrl = new URL('../../assets/processed/townsfolk-depot-clerk-e6.png', import.meta.url).href;
const civicAgentE7PortraitUrl = new URL('../../assets/processed/townsfolk-civic-agent-e7.png', import.meta.url).href;
const switchboardChiefE7PortraitUrl = new URL('../../assets/processed/townsfolk-switchboard-chief-e7.png', import.meta.url).href;
const playbookLibrarianE7PortraitUrl = new URL('../../assets/processed/townsfolk-playbook-librarian-e7.png', import.meta.url).href;
const droneKeeperE7PortraitUrl = new URL('../../assets/processed/townsfolk-drone-keeper-e7.png', import.meta.url).href;
const tapeCourierE7PortraitUrl = new URL('../../assets/processed/townsfolk-tape-courier-e7.png', import.meta.url).href;
const combineDefectorE7PortraitUrl = new URL('../../assets/processed/townsfolk-combine-defector-e7.png', import.meta.url).href;
const launchMasterE8PortraitUrl = new URL('../../assets/processed/townsfolk-launch-master-e8.png', import.meta.url).href;
const domeGardenerE8PortraitUrl = new URL('../../assets/processed/townsfolk-dome-gardener-e8.png', import.meta.url).href;
const suitFitterE8PortraitUrl = new URL('../../assets/processed/townsfolk-suit-fitter-e8.png', import.meta.url).href;
const moonBornChildE8PortraitUrl = new URL('../../assets/processed/townsfolk-moon-born-child-e8.png', import.meta.url).href;
const canalReeveE9PortraitUrl = new URL('../../assets/processed/townsfolk-canal-reeve-e9.png', import.meta.url).href;
const greenkeeperE9PortraitUrl = new URL('../../assets/processed/townsfolk-greenkeeper-e9.png', import.meta.url).href;
const iceQuarryChiefE9PortraitUrl = new URL('../../assets/processed/townsfolk-ice-quarry-chief-e9.png', import.meta.url).href;
const weatherWardenE9PortraitUrl = new URL('../../assets/processed/townsfolk-weather-warden-e9.png', import.meta.url).href;
const moonBornChildE9PortraitUrl = new URL('../../assets/processed/townsfolk-moon-born-child-e9.png', import.meta.url).href;

// objectPosition for the era cast is '50% 42%' across the board, and that is MEASURED rather
// than copied. The card crops with object-fit: cover into a 74x90 box (58x76 mobile), so a
// SQUARE source is scaled by height and cropped horizontally: only the X term can move a
// square portrait, and it moves it inside a 16px window. Every one of these 21 subjects has
// its ink centroid within 187-197 of 384 - at most 5px, under 1.3%, off centre, i.e. about one
// pixel in the rendered card - so 50% centres all of them and the existing seven's own 50-52%
// band is met. The Y term is inert for square sources and is set to the sibling value.
const ERA_CAST_OBJECT_POSITION = '50% 42%';

export const STORY_SPEAKERS: Record<StorySpeakerId, StorySpeaker> = {
  elder: {
    id: 'elder',
    name: 'Elder',
    portraitUrl: elderPortraitUrl,
    objectPosition: '50% 44%',
  },
  tavernkeeper: {
    id: 'tavernkeeper',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperPortraitUrl,
    objectPosition: '52% 42%',
  },
  clerk: {
    id: 'clerk',
    name: 'Assay Clerk',
    portraitUrl: clerkPortraitUrl,
    objectPosition: '50% 43%',
  },
  prospector: {
    id: 'prospector',
    name: 'Prospector',
    portraitUrl: prospectorPortraitUrl,
    objectPosition: '50% 44%',
  },
  newsie: {
    id: 'newsie',
    name: 'Mei Chen',
    portraitUrl: newsiePortraitUrl,
    objectPosition: '50% 38%',
  },
  schoolteacher: {
    id: 'schoolteacher',
    name: 'Schoolteacher',
    portraitUrl: schoolteacherPortraitUrl,
    objectPosition: '50% 42%',
  },
  preacher: {
    id: 'preacher',
    name: 'Preacher',
    portraitUrl: preacherPortraitUrl,
    objectPosition: '50% 42%',
  },

  // E6, the glow mesa (lore/STORYBOOK.md:341-345 THE PEOPLE; plates assets/raw/tf-*-e6.png,
  // assets/LEDGER.md row 61). Role names, the convention the seven above already use.
  'reactor-steward-e6': {
    id: 'reactor-steward-e6',
    name: 'Reactor Steward',
    portraitUrl: reactorStewardE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'kitchen-chemist-e6': {
    id: 'kitchen-chemist-e6',
    name: 'Kitchen Chemist',
    portraitUrl: kitchenChemistE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'appliance-wrangler-e6': {
    id: 'appliance-wrangler-e6',
    name: 'Appliance Wrangler',
    portraitUrl: applianceWranglerE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'diner-carhop-e6': {
    id: 'diner-carhop-e6',
    name: 'Diner Carhop',
    portraitUrl: dinerCarhopE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'combine-defector-e6': {
    id: 'combine-defector-e6',
    name: 'Combine Defector',
    portraitUrl: combineDefectorE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  // The clerk line's fifth uniform (lore/characters.md:37): the same face as `clerk`, aged, per
  // the identity-preserving edit recorded in assets/LEDGER.md row 61.
  'depot-clerk-e6': {
    id: 'depot-clerk-e6',
    name: 'Depot Clerk',
    portraitUrl: depotClerkE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },

  // E7, the relay valley (lore/STORYBOOK.md:421-425 THE PEOPLE; plates assets/raw/tf-*-e7.png,
  // assets/LEDGER.md rows 62 and 64).
  // CHALK is the only member of the era cast with a canon PERSONAL name (lore/characters.md:14,
  // owner ruling #13, 2026-07-18); her plate is `tf-civic-agent-e7.png` per LEDGER row 64, so
  // the id follows the plate and the name follows the ruling.
  'civic-agent-e7': {
    id: 'civic-agent-e7',
    name: 'Chalk',
    portraitUrl: civicAgentE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'switchboard-chief-e7': {
    id: 'switchboard-chief-e7',
    name: 'Switchboard Chief',
    portraitUrl: switchboardChiefE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'playbook-librarian-e7': {
    id: 'playbook-librarian-e7',
    name: 'Playbook Librarian',
    portraitUrl: playbookLibrarianE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'drone-keeper-e7': {
    id: 'drone-keeper-e7',
    name: 'Drone Keeper',
    portraitUrl: droneKeeperE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'tape-courier-e7': {
    id: 'tape-courier-e7',
    name: 'Tape Courier',
    portraitUrl: tapeCourierE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'combine-defector-e7': {
    id: 'combine-defector-e7',
    name: 'Combine Defector',
    portraitUrl: combineDefectorE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },

  // E8, the mare claim (lore/STORYBOOK.md:485-486 THE PEOPLE; plates assets/raw/tf-*-e8.png,
  // assets/LEDGER.md row 63). The He-3 assayer is named in the storybook and has NO plate, so
  // no id is registered for her.
  'launch-master-e8': {
    id: 'launch-master-e8',
    name: 'Launch Master',
    portraitUrl: launchMasterE8PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'dome-gardener-e8': {
    id: 'dome-gardener-e8',
    name: 'Dome Gardener',
    portraitUrl: domeGardenerE8PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'suit-fitter-e8': {
    id: 'suit-fitter-e8',
    name: 'Suit Fitter',
    portraitUrl: suitFitterE8PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'moon-born-child-e8': {
    id: 'moon-born-child-e8',
    name: 'Moon-Born Child',
    portraitUrl: moonBornChildE8PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },

  // E9, the dome basin (lore/STORYBOOK.md:540-542 THE PEOPLE; plates assets/raw/tf-*-e9.png,
  // assets/LEDGER.md row 65).
  'canal-reeve-e9': {
    id: 'canal-reeve-e9',
    name: 'Canal Reeve',
    portraitUrl: canalReeveE9PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'greenkeeper-e9': {
    id: 'greenkeeper-e9',
    name: 'Greenkeeper',
    portraitUrl: greenkeeperE9PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'ice-quarry-chief-e9': {
    id: 'ice-quarry-chief-e9',
    name: 'Ice Quarry Chief',
    portraitUrl: iceQuarryChiefE9PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'weather-warden-e9': {
    id: 'weather-warden-e9',
    name: 'Weather Warden',
    portraitUrl: weatherWardenE9PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'moon-born-child-e9': {
    id: 'moon-born-child-e9',
    name: 'Moon-Born Child',
    portraitUrl: moonBornChildE9PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
};
