export type StorySpeakerId =
  | 'elder'
  | 'tavernkeeper'
  | 'clerk'
  | 'prospector'
  | 'newsie'
  | 'schoolteacher'
  | 'preacher'
  | 'newsie-e2'
  | 'elder-e2'
  | 'tavernkeeper-e2'
  | 'clerk-e2'
  | 'preacher-e2'
  | 'schoolteacher-e2'
  | 'boilerwright-e2'
  | 'pressman-e2'
  | 'typesetter-e2'
  | 'newsie-e3'
  | 'tavernkeeper-e3'
  | 'clerk-e3'
  | 'preacher-e3'
  | 'schoolteacher-e3'
  | 'newsie-e4'
  | 'tavernkeeper-e4'
  | 'clerk-e4'
  | 'schoolteacher-e4'
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
  | 'charter-keeper-e10'
  | 'newsie-e5'
  | 'newsie-e6'
  | 'newsie-e7'
  | 'newsie-e8'
  | 'newsie-e9'
  | 'newsie-e10'
  | 'tavernkeeper-e5'
  | 'tavernkeeper-e6'
  | 'tavernkeeper-e7'
  | 'tavernkeeper-e8'
  | 'tavernkeeper-e9'
  | 'tavernkeeper-e10'
  | 'clerk-e5'
  | 'clerk-e6'
  | 'clerk-e7'
  | 'clerk-e8'
  | 'clerk-e9'
  | 'clerk-e10'
  | 'schoolteacher-e5'
  | 'schoolteacher-e6'
  | 'schoolteacher-e7'
  | 'schoolteacher-e8'
  | 'schoolteacher-e9'
  | 'schoolteacher-e10'
  | 'preacher-e5'
  | 'preacher-e6'
  | 'preacher-e7'
  | 'preacher-e8'
  | 'preacher-e9'
  | 'preacher-e10'
  | 'salvage-king-e8';

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

// THE ERA-AGING CAST (portraits-era-aging-batch, 2026-09-06). Owner ruling, verbatim: "lets use the
// higgsfield credits, I think they expire soon. go hard." lore/STORYBOOK.md:80 THE LAWS OF TIME ages
// the townsfolk ~12-15 years per era, and until this batch the E2, E3 and E4 chapters spoke through
// the E1 faces unchanged. Eighteen plates were GENERATED on Higgsfield (GPT Image 2) with the shipped
// E1 portrait passed as an image REFERENCE, so each aged face is the same person one era on, and then
// processed by the identical row-60 recipe as the 31 registered below - `node scripts/extract-alpha.mjs
// --full-bleed --size 384`, alpha dropped - so all three batches are one tier: 384x384, 3-channel,
// opaque, 0 transparent and 0 magenta px. Provenance and per-plate QA:
// artifacts/portraits-era-aging/generation.jsonl and assets/LEDGER.md row 74.
// NAMES: a person's name does not change when they age, so Mei keeps the E1 newsie's exact display
// name in all three eras (the `newsie` entry below is the pattern) and the role nouns keep their E1
// spelling. THE CHEN PARENTS are new faces rather than returning ones, so they carry their trade
// where a 74x90 card can read it: lore/characters.md:54-55 names them CHEN WEI the pressman and CHEN
// LAN the typesetter, and the given name leads here exactly as it leads in "Mei Chen".
// WITHHELD, and stated rather than papered over (honesty guard, F-AGE-3): a nineteenth plate,
// assets/raw/tf-old-digger-e10.png, was generated as "an ancient man" - but THE OLD DIGGER IS A
// MACHINE in canon: the E9 boss, an ancient terraformer executing the Baron's century-old survey
// (lore/STORYBOOK.md:544, :560, :675, ruling #15 at :722; src/game/Game.ts:1169 emits it as a boss;
// src/game/TileStateStore.ts:12 flags it as kept machine #5). The plate is a good old prospector and
// reads clearly at 120px, but it is not that character, so it is NOT registered and NOT processed
// into assets/processed. The raw is kept. Owner call, LEDGER row 74.
const newsieE2PortraitUrl = new URL('../../assets/processed/townsfolk-newsie-e2.png', import.meta.url).href;
const elderE2PortraitUrl = new URL('../../assets/processed/townsfolk-elder-e2.png', import.meta.url).href;
const tavernkeeperE2PortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper-e2.png', import.meta.url).href;
const clerkE2PortraitUrl = new URL('../../assets/processed/townsfolk-clerk-e2.png', import.meta.url).href;
const preacherE2PortraitUrl = new URL('../../assets/processed/townsfolk-preacher-e2.png', import.meta.url).href;
const schoolteacherE2PortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher-e2.png', import.meta.url).href;
const boilerwrightE2PortraitUrl = new URL('../../assets/processed/townsfolk-boilerwright-e2.png', import.meta.url).href;
const pressmanE2PortraitUrl = new URL('../../assets/processed/townsfolk-pressman-e2.png', import.meta.url).href;
const typesetterE2PortraitUrl = new URL('../../assets/processed/townsfolk-typesetter-e2.png', import.meta.url).href;
const newsieE3PortraitUrl = new URL('../../assets/processed/townsfolk-newsie-e3.png', import.meta.url).href;
const tavernkeeperE3PortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper-e3.png', import.meta.url).href;
const clerkE3PortraitUrl = new URL('../../assets/processed/townsfolk-clerk-e3.png', import.meta.url).href;
const preacherE3PortraitUrl = new URL('../../assets/processed/townsfolk-preacher-e3.png', import.meta.url).href;
const schoolteacherE3PortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher-e3.png', import.meta.url).href;
const newsieE4PortraitUrl = new URL('../../assets/processed/townsfolk-newsie-e4.png', import.meta.url).href;
const tavernkeeperE4PortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper-e4.png', import.meta.url).href;
const clerkE4PortraitUrl = new URL('../../assets/processed/townsfolk-clerk-e4.png', import.meta.url).href;
const schoolteacherE4PortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher-e4.png', import.meta.url).href;

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

// THE LATER-ERA AGING CAST (portraits-era-aging-2-batch, 2026-09-07). Owner ruling, verbatim:
// "(A4) use them, please, they will expire soon." The first aging batch (row 74) carried the E1 cast
// through E4 and left E5-E10 still speaking through the unchanged E1 faces, an art gap it recorded
// rather than closed. These thirty plates close it: the five trades across all six later eras,
// GENERATED on Higgsfield (GPT Image 2) with each era's plate passed as the image REFERENCE for the
// next, so every face descends from its own previous portrait rather than from a prose description,
// then processed by the identical row-60 recipe as the 56 registered above (`node
// scripts/extract-alpha.mjs --full-bleed --size 384`, alpha dropped) - 384x384, 3-channel, opaque,
// 0 transparent and 0 magenta px. Provenance and per-plate QA:
// artifacts/portraits-era-aging-2/generation.jsonl and assets/LEDGER.md row 75.
// NAMES follow row 74's rule exactly: a person's name does not change when they age, so Mei keeps the
// E1 newsie's display name in all six eras, and the trades keep their E1 role nouns. The story card
// has always used the ROLE where the town cast uses a personal name (`clerk` is "Assay Clerk" here and
// "Ada Pike" at src/town/townsfolk.ts:141), and that convention is kept.
const newsieE5PortraitUrl = new URL('../../assets/processed/townsfolk-newsie-e5.png', import.meta.url).href;
const newsieE6PortraitUrl = new URL('../../assets/processed/townsfolk-newsie-e6.png', import.meta.url).href;
const newsieE7PortraitUrl = new URL('../../assets/processed/townsfolk-newsie-e7.png', import.meta.url).href;
const newsieE8PortraitUrl = new URL('../../assets/processed/townsfolk-newsie-e8.png', import.meta.url).href;
const newsieE9PortraitUrl = new URL('../../assets/processed/townsfolk-newsie-e9.png', import.meta.url).href;
const newsieE10PortraitUrl = new URL('../../assets/processed/townsfolk-newsie-e10.png', import.meta.url).href;
const tavernkeeperE5PortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper-e5.png', import.meta.url).href;
const tavernkeeperE6PortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper-e6.png', import.meta.url).href;
const tavernkeeperE7PortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper-e7.png', import.meta.url).href;
const tavernkeeperE8PortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper-e8.png', import.meta.url).href;
const tavernkeeperE9PortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper-e9.png', import.meta.url).href;
const tavernkeeperE10PortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper-e10.png', import.meta.url).href;
const clerkE5PortraitUrl = new URL('../../assets/processed/townsfolk-clerk-e5.png', import.meta.url).href;
const clerkE6PortraitUrl = new URL('../../assets/processed/townsfolk-clerk-e6.png', import.meta.url).href;
const clerkE7PortraitUrl = new URL('../../assets/processed/townsfolk-clerk-e7.png', import.meta.url).href;
const clerkE8PortraitUrl = new URL('../../assets/processed/townsfolk-clerk-e8.png', import.meta.url).href;
const clerkE9PortraitUrl = new URL('../../assets/processed/townsfolk-clerk-e9.png', import.meta.url).href;
const clerkE10PortraitUrl = new URL('../../assets/processed/townsfolk-clerk-e10.png', import.meta.url).href;
const schoolteacherE5PortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher-e5.png', import.meta.url).href;
const schoolteacherE6PortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher-e6.png', import.meta.url).href;
const schoolteacherE7PortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher-e7.png', import.meta.url).href;
const schoolteacherE8PortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher-e8.png', import.meta.url).href;
const schoolteacherE9PortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher-e9.png', import.meta.url).href;
const schoolteacherE10PortraitUrl = new URL('../../assets/processed/townsfolk-schoolteacher-e10.png', import.meta.url).href;
const preacherE5PortraitUrl = new URL('../../assets/processed/townsfolk-preacher-e5.png', import.meta.url).href;
const preacherE6PortraitUrl = new URL('../../assets/processed/townsfolk-preacher-e6.png', import.meta.url).href;
const preacherE7PortraitUrl = new URL('../../assets/processed/townsfolk-preacher-e7.png', import.meta.url).href;
const preacherE8PortraitUrl = new URL('../../assets/processed/townsfolk-preacher-e8.png', import.meta.url).href;
const preacherE9PortraitUrl = new URL('../../assets/processed/townsfolk-preacher-e9.png', import.meta.url).href;
const preacherE10PortraitUrl = new URL('../../assets/processed/townsfolk-preacher-e10.png', import.meta.url).href;

// THE SALVAGE KING, E8's antagonist: the Baron's GRANDSON, "the family business, literalized into
// repossession" (lore/STORYBOOK.md:488, the boss at :504 and :674, ruling #13 at :720). He is a new
// face, not an aged one, so his plate carries no reference and none is wanted.
// A NAMING SLIP IS RECORDED HERE RATHER THAN PAPERED OVER: the raw was minted as
// assets/raw/tf-salvage-king-e5.png and the generation log calls him `salvage-king-e5`, but nothing
// in canon puts him in E5 - he descends on the Mare Claim in E8. The id, the processed file and this
// entry all say e8; the RAW keeps its minted name because assets/raw is never rewritten. A reader
// looking for tf-salvage-king-e8.png will not find it; the E5 file is the one.
const salvageKingE8PortraitUrl = new URL('../../assets/processed/townsfolk-salvage-king-e8.png', import.meta.url).href;

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
// EXTENDED AGAIN 2026-09-06 to the eighteen era-aging plates, re-measured under the same definition:
// they sit at 185.9-197.1, so the registered set's band widens by 1.1 px at the low end (pressman-e2
// and tavernkeeper-e4 both 185.9) and not at all at the high end. The widest deviation from centre is
// unchanged at 6.1 px of 384 - about 1.2 px in the rendered 74 px card - so 50% still centres all 49.
// EXTENDED AGAIN 2026-09-07 to the thirty-one later-era plates, re-measured under the same definition
// rather than assumed: they sit at 184.3-197.7, so the registered band's low end moves out by 1.6 px
// (tavernkeeper-e7 at 184.3) and its high end does not move (newsie-e6 at 197.7 against
// weather-warden-e9's shipped 198.5). That makes tavernkeeper-e7 the widest deviation from centre in
// the whole registered set at 7.7 px of 384, up from 6.1 - about 1.5 px in the rendered 74 px card,
// which is still inside the 8 px window the cover crop gives a square source. 50% centres all 80.
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

  // E2, the Steamworks (lore/STORYBOOK.md:88-93 THE PEOPLE; plates assets/raw/tf-*-e2.png,
  // assets/LEDGER.md row 74). Six returning E1 faces about twelve years on, plus three faces the
  // chapter names for the first time. THE ELDER IS ALIVE HERE and only here: lore/characters.md:33
  // has her pass in EARLY E2, so `elder-e2` is the "frailer, brighter-eyed" plate that ARC names,
  // it carries the two E2 ceremony beats that fire at the era's opening, and there is deliberately
  // no `elder-e3` or `elder-e4` for a later beat to reach for.
  'newsie-e2': {
    id: 'newsie-e2',
    name: 'Mei Chen',
    portraitUrl: newsieE2PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'elder-e2': {
    id: 'elder-e2',
    name: 'Elder',
    portraitUrl: elderE2PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'tavernkeeper-e2': {
    id: 'tavernkeeper-e2',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperE2PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'clerk-e2': {
    id: 'clerk-e2',
    name: 'Assay Clerk',
    portraitUrl: clerkE2PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'preacher-e2': {
    id: 'preacher-e2',
    name: 'Preacher',
    portraitUrl: preacherE2PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'schoolteacher-e2': {
    id: 'schoolteacher-e2',
    name: 'Schoolteacher',
    portraitUrl: schoolteacherE2PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  // The first wedding's half of the pairing (lore/STORYBOOK.md:91), a role noun like the rest of
  // the era cast. No E2 beat names her, so she is registered and waiting for a line.
  'boilerwright-e2': {
    id: 'boilerwright-e2',
    name: 'Boilerwright',
    portraitUrl: boilerwrightE2PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  // THE CHEN PARENTS (lore/characters.md:53-55; lore/STORYBOOK.md:93 "Wei presses, Lan sets type,
  // Mei still sells on the plaza"). The rail spur's first freight is the press, so E2 is the era the
  // family business becomes a printing house and the two of them get faces.
  'pressman-e2': {
    id: 'pressman-e2',
    name: 'Wei, the Pressman',
    portraitUrl: pressmanE2PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'typesetter-e2': {
    id: 'typesetter-e2',
    name: 'Lan, the Typesetter',
    portraitUrl: typesetterE2PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },

  // E3, the Voltage Age (lore/STORYBOOK.md:139-178; plates assets/raw/tf-*-e3.png, LEDGER row 74).
  // Same five faces again, about twenty-five years past E1.
  'newsie-e3': {
    id: 'newsie-e3',
    name: 'Mei Chen',
    portraitUrl: newsieE3PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'tavernkeeper-e3': {
    id: 'tavernkeeper-e3',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperE3PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'clerk-e3': {
    id: 'clerk-e3',
    name: 'Assay Clerk',
    portraitUrl: clerkE3PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'preacher-e3': {
    id: 'preacher-e3',
    name: 'Preacher',
    portraitUrl: preacherE3PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'schoolteacher-e3': {
    id: 'schoolteacher-e3',
    name: 'Schoolteacher',
    portraitUrl: schoolteacherE3PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },

  // E4, the Motor Age (lore/STORYBOOK.md:191-235; plates assets/raw/tf-*-e4.png, LEDGER row 74).
  // Four faces, about thirty-nine years past E1 - the era the storybook calls the hero's mid-life.
  'newsie-e4': {
    id: 'newsie-e4',
    name: 'Mei Chen',
    portraitUrl: newsieE4PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'tavernkeeper-e4': {
    id: 'tavernkeeper-e4',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperE4PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'clerk-e4': {
    id: 'clerk-e4',
    name: 'Assay Clerk',
    portraitUrl: clerkE4PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'schoolteacher-e4': {
    id: 'schoolteacher-e4',
    name: 'Schoolteacher',
    portraitUrl: schoolteacherE4PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
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

  // E5-E10, the later eras (portraits-era-aging-2-batch, assets/LEDGER.md row 75). The same five
  // trades the town has had since E1, one era at a time, so the chapters stop speaking through E1
  // faces. lore/STORYBOOK.md:80 THE LAWS OF TIME ages them 12-15 years per era and THE CLOCK LAW says
  // that time is TOLD, not reconciled: the faces are read that way, and no age is arithmetic here.
  'newsie-e5': {
    id: 'newsie-e5',
    name: 'Mei Chen',
    portraitUrl: newsieE5PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'newsie-e6': {
    id: 'newsie-e6',
    name: 'Mei Chen',
    portraitUrl: newsieE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'newsie-e7': {
    id: 'newsie-e7',
    name: 'Mei Chen',
    portraitUrl: newsieE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'newsie-e8': {
    id: 'newsie-e8',
    name: 'Mei Chen',
    portraitUrl: newsieE8PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'newsie-e9': {
    id: 'newsie-e9',
    name: 'Mei Chen',
    portraitUrl: newsieE9PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'newsie-e10': {
    id: 'newsie-e10',
    name: 'Mei Chen',
    portraitUrl: newsieE10PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'tavernkeeper-e5': {
    id: 'tavernkeeper-e5',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperE5PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'tavernkeeper-e6': {
    id: 'tavernkeeper-e6',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'tavernkeeper-e7': {
    id: 'tavernkeeper-e7',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'tavernkeeper-e8': {
    id: 'tavernkeeper-e8',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperE8PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'tavernkeeper-e9': {
    id: 'tavernkeeper-e9',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperE9PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'tavernkeeper-e10': {
    id: 'tavernkeeper-e10',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperE10PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'clerk-e5': {
    id: 'clerk-e5',
    name: 'Assay Clerk',
    portraitUrl: clerkE5PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'clerk-e6': {
    id: 'clerk-e6',
    name: 'Assay Clerk',
    portraitUrl: clerkE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'clerk-e7': {
    id: 'clerk-e7',
    name: 'Assay Clerk',
    portraitUrl: clerkE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'clerk-e8': {
    id: 'clerk-e8',
    name: 'Assay Clerk',
    portraitUrl: clerkE8PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'clerk-e9': {
    id: 'clerk-e9',
    name: 'Assay Clerk',
    portraitUrl: clerkE9PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'clerk-e10': {
    id: 'clerk-e10',
    name: 'Assay Clerk',
    portraitUrl: clerkE10PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'schoolteacher-e5': {
    id: 'schoolteacher-e5',
    name: 'Schoolteacher',
    portraitUrl: schoolteacherE5PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'schoolteacher-e6': {
    id: 'schoolteacher-e6',
    name: 'Schoolteacher',
    portraitUrl: schoolteacherE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'schoolteacher-e7': {
    id: 'schoolteacher-e7',
    name: 'Schoolteacher',
    portraitUrl: schoolteacherE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'schoolteacher-e8': {
    id: 'schoolteacher-e8',
    name: 'Schoolteacher',
    portraitUrl: schoolteacherE8PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'schoolteacher-e9': {
    id: 'schoolteacher-e9',
    name: 'Schoolteacher',
    portraitUrl: schoolteacherE9PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'schoolteacher-e10': {
    id: 'schoolteacher-e10',
    name: 'Schoolteacher',
    portraitUrl: schoolteacherE10PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'preacher-e5': {
    id: 'preacher-e5',
    name: 'Preacher',
    portraitUrl: preacherE5PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'preacher-e6': {
    id: 'preacher-e6',
    name: 'Preacher',
    portraitUrl: preacherE6PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'preacher-e7': {
    id: 'preacher-e7',
    name: 'Preacher',
    portraitUrl: preacherE7PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'preacher-e8': {
    id: 'preacher-e8',
    name: 'Preacher',
    portraitUrl: preacherE8PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'preacher-e9': {
    id: 'preacher-e9',
    name: 'Preacher',
    portraitUrl: preacherE9PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
  'preacher-e10': {
    id: 'preacher-e10',
    name: 'Preacher',
    portraitUrl: preacherE10PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },

  // The Baron's grandson. He keeps the article, as "The Baron", "The Eldest Heir" and "The Quack"
  // above do, because the title is the name canon uses for him (lore/STORYBOOK.md:488).
  'salvage-king-e8': {
    id: 'salvage-king-e8',
    name: 'The Salvage King',
    portraitUrl: salvageKingE8PortraitUrl,
    objectPosition: ERA_CAST_OBJECT_POSITION,
  },
};
