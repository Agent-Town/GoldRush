export type StorySpeakerId =
  | 'elder'
  | 'tavernkeeper'
  | 'clerk'
  | 'prospector'
  | 'newsie'
  | 'schoolteacher'
  | 'preacher'
  | 'tide-teller-e5'
  | 'cannery-hand-e5'
  | 'harbormaster-e5'
  | 'shipwright-e5'
  | 'pearl-diver-e5'
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
  | 'he3-assayer-e8'
  | 'canal-reeve-e9'
  | 'greenkeeper-e9'
  | 'ice-quarry-chief-e9'
  | 'weather-warden-e9'
  | 'moon-born-child-e9'
  | 'eldest-heir-e10'
  | 'baron-e10'
  | 'quack-e10'
  | 'charter-keeper-e10';

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
// THE E5 / E8 / E10 CAST (portraits-e5-e10-generated-batch, 2026-09-06), the half of the era cast
// the processing batch above could not serve because its plates did not exist yet. Owner ruling
// 2026-09-06, verbatim: "if there are still higgsfield credits, use them". The ten plates were
// GENERATED (Higgsfield GPT Image 2, the row-60 style anchor verbatim, retakes until the ground
// warmth landed in the band) and then processed by the identical row-60 recipe as the 21 above -
// `node scripts/extract-alpha.mjs --full-bleed --size 384`, alpha dropped - so the two batches are
// one tier: 384x384, 3-channel, opaque, 0 transparent and 0 magenta px.
// Provenance and per-plate QA: artifacts/portraits-e5-e10-generated/generation.log and
// assets/LEDGER.md row 73.
const tideTellerE5PortraitUrl = new URL('../../assets/processed/townsfolk-tide-teller-e5.png', import.meta.url).href;
const canneryHandE5PortraitUrl = new URL('../../assets/processed/townsfolk-cannery-hand-e5.png', import.meta.url).href;
const harbormasterE5PortraitUrl = new URL('../../assets/processed/townsfolk-harbormaster-e5.png', import.meta.url).href;
const shipwrightE5PortraitUrl = new URL('../../assets/processed/townsfolk-shipwright-e5.png', import.meta.url).href;
const pearlDiverE5PortraitUrl = new URL('../../assets/processed/townsfolk-pearl-diver-e5.png', import.meta.url).href;
const he3AssayerE8PortraitUrl = new URL('../../assets/processed/townsfolk-he3-assayer-e8.png', import.meta.url).href;
const eldestHeirE10PortraitUrl = new URL('../../assets/processed/townsfolk-eldest-heir-e10.png', import.meta.url).href;
const baronE10PortraitUrl = new URL('../../assets/processed/townsfolk-baron-e10.png', import.meta.url).href;
const quackE10PortraitUrl = new URL('../../assets/processed/townsfolk-quack-e10.png', import.meta.url).href;
const charterKeeperE10PortraitUrl = new URL('../../assets/processed/townsfolk-charter-keeper-e10.png', import.meta.url).href;

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
// EXTENDED 2026-09-06 to the ten generated plates, re-measured rather than assumed. The statistic
// is the luminance-weighted ink centroid (weight = 255 - Rec.709 luma, summed over all 147,456 px);
// under that definition the 21 processed plates above measure 187.0-198.5 and the ten new ones
// measure 188.2-198.1, i.e. the new batch sits inside the band the registered set already occupies
// (widest deviation: quack-e10 at 198.1, 6.1 px of 384 off centre, about 1.2 px in the 74 px card,
// against weather-warden-e9's 198.5 which has shipped at this value since the batch above).
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

  // E5, the deepwater claim (lore/STORYBOOK.md:265-267 THE PEOPLE; plates assets/raw/tf-*-e5.png,
  // assets/LEDGER.md row 73). Role nouns, hyphenated exactly as the storybook hyphenates them.
  'tide-teller-e5': {
    id: 'tide-teller-e5',
    name: 'Tide-Teller',
    portraitUrl: tideTellerE5PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  // The E2 newcomer kid, grown (lore/STORYBOOK.md:265): the plate keeps the paper boat as the
  // face-chain to that portrait, so the id is the E5 role and the character is the E2 one.
  'cannery-hand-e5': {
    id: 'cannery-hand-e5',
    name: 'Cannery-Hand',
    portraitUrl: canneryHandE5PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'harbormaster-e5': {
    id: 'harbormaster-e5',
    name: 'Harbormaster',
    portraitUrl: harbormasterE5PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'shipwright-e5': {
    id: 'shipwright-e5',
    name: 'Shipwright',
    portraitUrl: shipwrightE5PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'pearl-diver-e5': {
    id: 'pearl-diver-e5',
    name: 'Pearl-Diver',
    portraitUrl: pearlDiverE5PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
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
  // assets/LEDGER.md rows 63 and 73). CORRECTED 2026-09-06: the He-3 assayer's plate was generated
  // in the batch of row 73, so the era's fifth townsfolk is registered here and the note that said
  // she had none is retired. Five of five.
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
  // The assay lineage one era from its Press destiny (lore/STORYBOOK.md:486). "He-3" is the
  // storybook's own spelling of the isotope and stays hyphenated.
  'he3-assayer-e8': {
    id: 'he3-assayer-e8',
    name: 'He-3 Assayer',
    portraitUrl: he3AssayerE8PortraitUrl,
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

  // E10, the deep sky (lore/STORYBOOK.md:584-586, 618, 621; plates assets/raw/tf-*-e10.png,
  // assets/LEDGER.md row 73). Three of these four keep the article, because the article is the
  // canon name: the rival has never been anything but "the Baron" in this repo's own UI
  // (src/agent/View.ts:617 already ships that string), the heir is a role and not a person, and
  // the Quack is UNNAMED BY DESIGN - "no one remembers what he called himself; only what he sold"
  // (lore/characters.md:29, endpoint ruling #18, 2026-07-18). Giving him a name here would break
  // the oldest promise the character has.
  'eldest-heir-e10': {
    id: 'eldest-heir-e10',
    name: 'The Eldest Heir',
    portraitUrl: eldestHeirE10PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'baron-e10': {
    id: 'baron-e10',
    name: 'The Baron',
    portraitUrl: baronE10PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'quack-e10': {
    id: 'quack-e10',
    name: 'The Quack',
    portraitUrl: quackE10PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'charter-keeper-e10': {
    id: 'charter-keeper-e10',
    name: 'Charter-Keeper',
    portraitUrl: charterKeeperE10PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
};
