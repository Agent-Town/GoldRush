import type { RuntimeStorySignal } from './signals';
import type { StorySpeakerId } from './speakers';
import { hasStoryBeatSeen } from './seenState';
import { hasRocketCartCaptured } from '../game/Medals';

const RELEASE_E1 = typeof __GR_RELEASE_E1__ !== 'undefined' && __GR_RELEASE_E1__;

export type StoryBeatFor<TSignal extends { type: string }> = {
  id: string;
  trigger: TSignal['type'];
  speaker: StorySpeakerId;
  lines: readonly string[] | ((signal: TSignal) => readonly string[]);
  pointer?: string;
  oncePerProfile: boolean;
  when?: (signal: TSignal) => boolean;
  seenKey?: (signal: TSignal) => string;
  seenKeyAliases?: readonly ((signal: TSignal) => string)[];
  presentation?: 'card' | 'epoch-ceremony';
  durationMs?: number;
  artKey?: string;
  ceremonyStep?: 'mill' | 'valley' | 'title';
};

export type StoryBeat = StoryBeatFor<RuntimeStorySignal>;
export type RuntimeStoryBeat = StoryBeatFor<RuntimeStorySignal>;

const contractLine = (signal: RuntimeStorySignal, fallback: string): string =>
  signal.type === 'contract-unlocked' ? signal.ledgerBlurb : fallback;

const legacyBoardUnlockSeenKey = (signal: RuntimeStorySignal): string =>
  signal.type === 'contract-unlocked' ? `board-unlock-generic:${signal.contractId}` : 'board-unlock-generic';

export const STORY_BEATS: readonly StoryBeat[] = [
  {
    // lore/STORYBOOK.md:64,30 - E1's spine opens on "First boot: the greeting, the trail, the first
    // claim", and the era's question is answered straight so every later era can complicate it. The
    // book's own thesis (:6) is withheld: mystery law, and a saga does not spoil itself on card one.
    // F-SSE-1: `first-boot` had no consuming beat, so the one signal that fires once per profile
    // showed nothing.
    // `oncePerProfile: true` even though the SIGNAL is already once per profile (guarded by its own
    // datum, `claimFirstBootForProfile`, src/main.ts:138): the belt is the signal, the braces are the
    // table, and the beat-seen key is what lets a seeded profile declare it has already been greeted
    // the same way it declares every other beat. Note the two markers are different things and stay
    // that way: `story:first-boot` in `hintsSeen` records the CARD, and the profile datum records the
    // SIGNAL, which is why the signal's marker still never enters `hintsSeen` (F-SSE-2's rule).
    id: 'first-boot',
    trigger: 'first-boot',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    lines: [
      'You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.',
      'What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.',
    ],
  },
  {
    id: 'founding-welcome',
    trigger: 'town-named',
    speaker: 'elder',
    oncePerProfile: true,
    lines: (signal) => [
      `${signal.type === 'town-named' ? signal.townName : 'This town'} has a name now.`,
      'Keep it alive, and it will remember you.',
    ],
  },
  {
    id: 'first-contract',
    trigger: 'board-first-open',
    speaker: 'tavernkeeper',
    pointer: '[data-testid="contract-launch-the-claim"]',
    oncePerProfile: true,
    lines: ['Claim this card first.', 'The river stake is where every ledger starts.'],
  },
  {
    id: 'town-growth-general-store',
    trigger: 'town-growth-seen',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    when: (signal) => signal.type === 'town-growth-seen' && signal.buildingId === 'general_store',
    lines: ["The store came in on Tuesday's wagon.", "We're a town now."],
  },
  {
    id: 'town-growth-chapel',
    trigger: 'town-growth-seen',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    when: (signal) => signal.type === 'town-growth-seen' && signal.buildingId === 'chapel',
    lines: ['Chapel bell went up at sundown.', 'Folks are putting roots under their boots.'],
  },
  {
    id: 'first-wave-five',
    trigger: 'wave-complete',
    speaker: 'clerk',
    oncePerProfile: true,
    when: (signal) => signal.type === 'wave-complete' && signal.wave >= 5,
    lines: ['Fifth horn recorded.', 'After this, repairs beat replacements on the books.'],
  },
  {
    id: 'first-loss',
    trigger: 'building-lost',
    speaker: 'clerk',
    oncePerProfile: true,
    lines: ['Broken timber is a debit, not a funeral.', 'Stand near a ruin with gold to mend it.'],
  },
  {
    id: 'first-victory',
    trigger: 'first-victory',
    speaker: 'elder',
    pointer: '[data-testid="research-overlay"]',
    oncePerProfile: true,
    lines: ['A secured claim buys more than gold.', 'Take one science step before the next trail.'],
  },
  {
    id: 'deputy-hello',
    trigger: 'xp-collected',
    speaker: 'prospector',
    pointer: '[data-testid="hud-agent"]',
    oncePerProfile: true,
    lines: ['I can sweep loose XP now.', 'Give me trust, and I will mind the small chores.'],
  },
  {
    id: 'rung-lock-explain',
    trigger: 'rung-denied-toggle',
    speaker: 'prospector',
    pointer: '[data-testid="hud-agent"]',
    oncePerProfile: true,
    lines: ['That chore needs trust first.', 'Secured claims raise my rung.'],
  },
  {
    id: 'deputy-first-promotion',
    trigger: 'rung-promotion',
    speaker: 'prospector',
    pointer: '[data-testid="hud-agent"]',
    oncePerProfile: true,
    when: (signal) => signal.type === 'rung-promotion' && signal.level >= 1,
    lines: ['First rung logged.', 'I can ask before I spend a chore.'],
  },
  {
    id: 'deputy-trusted-routine',
    trigger: 'rung-promotion',
    speaker: 'prospector',
    pointer: '[data-testid="hud-agent"]',
    oncePerProfile: true,
    when: (signal) => signal.type === 'rung-promotion' && signal.level >= 2,
    lines: ['Trusted routine unlocked.', 'Small chores can leave your hands now.'],
  },
  {
    id: 'science-first-pick',
    trigger: 'science-threshold',
    speaker: 'elder',
    pointer: '[data-testid="research-chart"]',
    oncePerProfile: true,
    when: (signal) => signal.type === 'science-threshold' && signal.threshold >= 1,
    lines: ['The first mark matters.', 'One chosen branch makes the next choice clearer.'],
  },
  {
    id: 'science-mastery',
    trigger: 'science-threshold',
    speaker: 'elder',
    pointer: '[data-testid="research-chart"]',
    oncePerProfile: true,
    when: (signal) => signal.type === 'science-threshold' && signal.threshold >= 3,
    lines: ['The chart has a spine now.', 'Follow it, and the town will outgrow the claim.'],
  },
  {
    id: 'baron-shadow',
    trigger: 'science-threshold',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    when: (signal) => signal.type === 'science-threshold' && signal.threshold >= 4,
    lines: ['An oxblood coat asked after your claim.', 'Folks stopped laughing when he paid cash.'],
  },
  {
    id: 'ceiling-reached',
    trigger: 'science-complete',
    speaker: 'elder',
    pointer: '[data-testid="science-banked"]',
    oncePerProfile: true,
    lines: ['Frontier science is complete.', 'The Steamworks waits for a town to build it.'],
  },
  {
    id: 'sky-rocket-captured',
    trigger: 'boss-defeat',
    speaker: 'elder',
    oncePerProfile: true,
    when: (signal) => signal.type === 'boss-defeat' && signal.contractId === 'e1-baron' && hasRocketCartCaptured(),
    lines: ["The Baron's sky-rocket science is captured.", 'Pride pays tuition to the town.'],
  },
  {
    id: 'stamp-site-found',
    trigger: 'stamp-site-found',
    speaker: 'elder',
    pointer: '[data-testid="stamp-site-fund"]',
    oncePerProfile: true,
    lines: ['Fund the first stage here.', "The Steamworks wants a founder's gold."],
  },
  {
    id: 'return-secured',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: false,
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured',
    lines: ['The town heard. Drinks tonight.'],
  },
  {
    id: 'return-overrun',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: false,
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'overrun',
    lines: ["You're breathing. The claim can be re-staked."],
  },
  {
    id: 'board-unlock-dry-gulch',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e1-dry-gulch',
    seenKeyAliases: [legacyBoardUnlockSeenKey],
    lines: (signal) => ['The Dry Gulch is open.', contractLine(signal, 'Mesa country; dry washes fall toward one sunken spring.')],
  },
  {
    id: 'board-unlock-twin-banks',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e1-twin-banks',
    seenKeyAliases: [legacyBoardUnlockSeenKey],
    lines: (signal) => ['Twin Banks is open.', contractLine(signal, 'A braided river claim with twin fords, gravel bars, and damp reeds.')],
  },
  {
    id: 'board-unlock-night-shift',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e1-night-shift',
    seenKeyAliases: [legacyBoardUnlockSeenKey],
    lines: (signal) => ['Night Shift is open.', contractLine(signal, 'The claim, gone dark, dotted with cold lanterns.')],
  },
  {
    id: 'board-unlock-baron',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e1-baron',
    seenKeyAliases: [legacyBoardUnlockSeenKey],
    lines: (signal) => ['The Baron card is open.', contractLine(signal, 'An oxblood banner marks the outfit that keeps buying trouble.')],
  },
];

export const LEDGER_STORY_BEATS: readonly RuntimeStoryBeat[] = [
  {
    id: 'claim-ledger-page',
    trigger: 'ledger-page',
    speaker: 'clerk',
    oncePerProfile: true,
    seenKey: (signal) => (signal.type === 'ledger-page' ? `ledger-page:${signal.entryId}` : 'ledger-page'),
    lines: (signal) => [
      signal.type === 'ledger-page' ? `The ledger gains a page: ${signal.entryName}.` : 'The ledger gains a page.',
      'Open it before the next trail.',
    ],
  },
];

export const E2_STORY_BEATS: readonly RuntimeStoryBeat[] = [
  {
    id: 'e2-boiler-house-teaching',
    trigger: 'ledger-page',
    speaker: 'prospector',
    oncePerProfile: true,
    when: (signal) => signal.type === 'ledger-page' && signal.entryId === 'building_boiler_house',
    lines: ['The boiler feeds pressure; pressure feeds the new machines.', 'Working pressure strengthens the Boiler Battery.'],
  },
  {
    id: 'e2-enemy-name',
    trigger: 'ledger-page',
    speaker: 'clerk',
    oncePerProfile: true,
    seenKey: (signal) => (signal.type === 'ledger-page' ? `e2-enemy-name:${signal.entryId}` : 'e2-enemy-name'),
    when: (signal) => signal.type === 'ledger-page' && ['rail_tough', 'steam_wrecker', 'coal_thief'].includes(signal.entryId),
    lines: (signal) => [signal.type === 'ledger-page' ? signal.entryName : 'Steamworks outlaw', 'Name entered. Tactics follow in the Claim Ledger.'],
  },
  {
    id: 'e2-ceremony-mill',
    trigger: 'epoch-activated',
    speaker: 'elder',
    oncePerProfile: false,
    presentation: 'epoch-ceremony',
    artKey: 'kit-stamp-mill',
    ceremonyStep: 'mill',
    when: (signal) => signal.type === 'epoch-activated' && signal.epochId === 'epoch-2-steamworks',
    lines: ['The Stamp Mill rises.', 'Iron stamps answer the valley.'],
  },
  {
    id: 'e2-ceremony-valley',
    trigger: 'epoch-activated',
    speaker: 'prospector',
    oncePerProfile: false,
    presentation: 'epoch-ceremony',
    artKey: 'kit-era-2',
    ceremonyStep: 'valley',
    when: (signal) => signal.type === 'epoch-activated' && signal.epochId === 'epoch-2-steamworks',
    lines: ['Steam finds every roofline.', 'The valley takes its first new shape.'],
  },
  {
    id: 'e2-ceremony-title',
    trigger: 'epoch-activated',
    speaker: 'elder',
    oncePerProfile: false,
    presentation: 'epoch-ceremony',
    artKey: 'kit-era-2',
    ceremonyStep: 'title',
    when: (signal) => signal.type === 'epoch-activated' && signal.epochId === 'epoch-2-steamworks',
    lines: ['Epoch 2', 'The Steamworks'],
  },
  {
    id: 'e3-ceremony-dynamo',
    trigger: 'epoch-activated',
    speaker: 'prospector',
    oncePerProfile: false,
    presentation: 'epoch-ceremony',
    artKey: 'plate-e3-bld-dynamo-hall',
    ceremonyStep: 'mill',
    when: (signal) => signal.type === 'epoch-activated' && signal.epochId === 'epoch-3-voltage',
    lines: ['The Dynamo Hall turns.', 'Current finds its pitch.'],
  },
  {
    id: 'e3-ceremony-tree',
    trigger: 'epoch-activated',
    speaker: 'elder',
    oncePerProfile: false,
    presentation: 'epoch-ceremony',
    artKey: 'kit-era-3',
    ceremonyStep: 'valley',
    when: (signal) => signal.type === 'epoch-activated' && signal.epochId === 'epoch-3-voltage',
    lines: ["The first lamp burns in the Elder's Tree.", 'Window by window, the town comes on.'],
  },
  {
    id: 'e3-ceremony-title',
    trigger: 'epoch-activated',
    speaker: 'elder',
    oncePerProfile: false,
    presentation: 'epoch-ceremony',
    artKey: 'kit-era-3',
    ceremonyStep: 'title',
    when: (signal) => signal.type === 'epoch-activated' && signal.epochId === 'epoch-3-voltage',
    lines: ['Epoch 3', 'The Voltage Age'],
  },
  {
    id: 'e2-railcar-arrival',
    trigger: 'boss-arrival',
    speaker: 'clerk',
    oncePerProfile: true,
    when: (signal) => signal.type === 'boss-arrival' && signal.contractId === 'e2-hill-mine',
    lines: ['Railcar on the cut.', 'Break the wheels, boiler, and cabin before the town signs the next ledger.'],
  },
  {
    id: 'e2-rail-arrives',
    trigger: 'epoch-activated',
    speaker: 'newsie',
    oncePerProfile: true,
    when: (signal) => signal.type === 'epoch-activated' && signal.epochId === 'epoch-2-steamworks',
    lines: ['Rail over the ridge! The first graduate has the Depot flag.', 'The town just grew a timetable.'],
  },
  {
    id: 'e2-gazette-press',
    trigger: 'epoch-activated',
    speaker: 'newsie',
    oncePerProfile: true,
    when: (signal) => signal.type === 'epoch-activated' && signal.epochId === 'epoch-2-steamworks',
    lines: ['The Gazette press is running.', 'First edition: the whistle means vent.'],
  },
  {
    id: 'e2-hill-mine-first-visit',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e2-hill-mine',
    lines: ['Hill Mine: three terraces above an open rail cut.', 'Keep the track clear; the creek below still takes the old pan.'],
  },
  {
    id: 'e2-elder-tree',
    trigger: 'contract-unlocked',
    speaker: 'schoolteacher',
    oncePerProfile: true,
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e2-hill-mine',
    lines: ["Her chair is empty. Her chalk still says, 'What you close, know how to open.'", 'We planted the cottonwood where she taught.'],
  },
  {
    id: 'e2-depot-wedding',
    trigger: 'contract-unlocked',
    speaker: 'preacher',
    oncePerProfile: true,
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e2-hill-mine',
    lines: ['The Depot household begins at sunset.', "Leave the Prospector's place set; it kept their first timetable."],
  },
  {
    id: 'e2-iron-correction-rumor-one',
    trigger: 'contract-unlocked',
    speaker: 'newsie',
    oncePerProfile: true,
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e2-hill-mine',
    lines: ['Iron Correction rumor: someone bought a timetable in cash.', 'The buyer asked for no return date.'],
  },
  {
    id: 'e2-iron-correction-rumor-three',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    when: (signal) => signal.type === 'run-return-town' && hasStoryBeatSeen('e2-iron-correction-rumor-two'),
    lines: ['Iron Correction rumor: a rich man asked what year it is.', 'Nobody answered twice.'],
  },
  {
    id: 'e2-iron-correction-rumor-two',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    when: (signal) => signal.type === 'run-return-town' && hasStoryBeatSeen('e2-iron-correction-rumor-one'),
    lines: ['Iron Correction rumor: something on the rails is too heavy for the trestle.', 'That is all the Gazette can prove.'],
  },
  {
    id: 'e2-prides-tuition-crate',
    trigger: 'boss-defeat',
    speaker: 'schoolteacher',
    oncePerProfile: true,
    when: (signal) => signal.type === 'boss-defeat' && signal.contractId === 'e2-hill-mine',
    lines: ["The rocket rack came to the Schoolhouse in the Baron's crate.", "We painted over the crest. It still ghosts through: Pride's Tuition."],
  },
];

// Chapter E3 follows E2's single-table shape above: town tales and Gazette headlines are
// ordinary, attributed beats (E2 examples at lines 388-419), not a second narrative system.
export const E3_STORY_BEATS: readonly RuntimeStoryBeat[] = [
  {
    // lore/STORYBOOK.md:174
    id: 'e3-canyon-works-arrival',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e3-canyon-works', // assets/raw/plate-contract-e3-canyon-works.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e3-canyon-works',
    lines: ['The tram has crested the Canyon Works rim at dusk.', 'The black gorge waits below, and our Dynamo Hall came with us.'],
  },
  {
    // lore/STORYBOOK.md:147,174
    id: 'e3-twin-representatives',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e3-canyon-works',
    lines: ['Copper trim offers one exclusive line. Silver trim offers the other.', 'Keep both contracts unsigned. We string our own wire.'],
  },
  {
    // lore/STORYBOOK.md:147,174; Gazette mystery-law headline in the E2 shape at lines 396-419.
    id: 'e3-gazette-two-offers',
    trigger: 'contract-unlocked',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e3-canyon-works',
    lines: ['GAZETTE: TWO OFFERS, NO SIGNATURE', 'The companies agree only that the town must choose. The Gazette cannot prove why.'],
  },
  {
    // lore/STORYBOOK.md:148,152,175
    id: 'e3-first-night-round',
    trigger: 'contract-unlocked',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e3-canyon-works',
    lines: ['The lamplighter draws the shore one lamp at a time.', "The Elder's Tree stays lit. That line is never shed."],
  },
  {
    // lore/STORYBOOK.md:139,176
    id: 'e3-brownout-ledger',
    trigger: 'contract-unlocked',
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e3-canyon-works',
    lines: ['Brown-out ledger open: light, arms, and the loads that wait.', 'The shoreline moves tonight. Choose what stays inside it.'],
  },
  {
    // lore/STORYBOOK.md:165-176
    id: 'e3-moth-season',
    trigger: 'contract-unlocked',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e3-moth-season', // assets/raw/plate-contract-e3-moth-season.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e3-moth-season',
    lines: ['GAZETTE: THE LIGHT DRAWS WINGS', 'Migration week makes every lamp a shelter and a lure.'],
  },
  {
    // lore/STORYBOOK.md:142,147,176
    id: 'e3-saboteur-night',
    trigger: 'boss-arrival',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e3-enemy-saboteur', // assets/raw/plate-e3-enemy-saboteur.png
    when: (signal) => signal.type === 'boss-arrival' && signal.contractId === 'e3-canyon-works',
    lines: ['Both company orders say the same thing: cut the town line.', 'The wire-cutters stopped before the first span.'],
  },
  {
    // lore/STORYBOOK.md:147,177; tavern-tale shape mirrors e2-depot-wedding at lines 388-395.
    id: 'e3-tavern-twins-defect',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e3-saboteur-night'),
    lines: ['The twins took one table and quit in stereo.', 'We hired both. Copper runs days, silver runs nights.'],
  },
  {
    // lore/STORYBOOK.md:147,177; the reveal waits for proof, preserving the Gazette mystery law.
    id: 'e3-gazette-ledger-reveal',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e3-saboteur-night'),
    lines: ['GAZETTE: BOTH BOOKS, ONE BACKER', "The expense ledgers meet at the Baron's crossed pickaxes."],
  },
  {
    // lore/STORYBOOK.md:178
    id: 'e3-refinery-horizon',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    lines: ['The Refinery rises by lamplight. At dawn, crude arrives from the flats.', "That horizon is too wide to walk. We're going to need to move faster."],
  },
];

// Chapter E4 follows the E2/E3 single-table shape above (see the E3 note at lines 430-431):
// the era's tavern tales and Gazette headlines are ordinary attributed beats in THIS table
// (tavern tale shape: e2-depot-wedding at lines 388-395 and e3-tavern-twins-defect at lines
// 506-515; Gazette headline shape: e2-iron-correction-rumor-one at lines 396-403 and
// e3-gazette-two-offers at lines 454-463), not a second narrative system. Mystery law holds:
// the Gazette prints what it can prove and never the meaning. Every beat cites its storybook
// line. artKey is set only where a plate exists on disk under assets/raw/.
export const E4_STORY_BEATS: readonly RuntimeStoryBeat[] = [
  {
    // lore/STORYBOOK.md:218,231
    id: 'e4-dust-flats-arrival',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e4-dust-flats', // assets/raw/plate-contract-e4-dust-flats.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e4-dust-flats',
    lines: ['The Refinery cracked its first crude in the night, and the flats opened at dawn.', 'That ground is too big to walk. From here the claim is how far we can reach.'],
  },
  {
    // lore/STORYBOOK.md:202,231
    id: 'e4-first-flivver',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e4-dust-flats',
    lines: ['The mechanic opened the crates in the square and built the first Flivver in front of everyone.', 'She carried the piston in like a newborn. Nobody laughed twice.'],
  },
  {
    // lore/STORYBOOK.md:203,232; Gazette headline in the E2/E3 shape, mystery law intact.
    id: 'e4-gazette-crude-bath',
    trigger: 'contract-unlocked',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e4-dust-flats',
    lines: ['GAZETTE: THE FOUNDING GENERATION, DRENCHED', "The wildcatter's first spray soaked the lot of them. The photograph hangs over the bar."],
  },
  {
    // lore/STORYBOOK.md:191,204
    id: 'e4-road-boss-theodolite',
    trigger: 'contract-unlocked',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e4-dust-flats',
    lines: ["The road boss carries the rail surveyor's old theodolite. Tools are ancestors too.", 'Stake a corridor and grade it. A road is the first ground we improve instead of stand on.'],
  },
  {
    // lore/STORYBOOK.md:207
    id: 'e4-sidecar-rides-along',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e4-dust-flats',
    lines: ['I ride the sidecar now. The town strapped goggles around my middle.', 'I have no eyes. They did it anyway, so I am keeping them.'],
  },
  {
    // lore/STORYBOOK.md:220
    id: 'e4-long-road-goodbyes',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e4-long-road', // assets/raw/plate-contract-e4-long-road.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e4-long-road',
    lines: ['The Long Road has no pads at all. Out there the convoy is the town.', 'Every way station you leave behind is a small goodbye. You get practice.'],
  },
  {
    // lore/STORYBOOK.md:221
    id: 'e4-gusher-county-order',
    trigger: 'contract-unlocked',
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e4-gusher-county', // assets/raw/plate-contract-e4-gusher-county.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e4-gusher-county',
    lines: ['Eight wild wells on three leases, each erupting on its own clock.', 'Cap one and the county answers. Choose the order first, and I will write it down.'],
  },
  {
    // lore/STORYBOOK.md:198,222; the wagon is never named, per the Occult Law of that line.
    id: 'e4-boneyard-quiet-rows',
    trigger: 'contract-unlocked',
    speaker: 'schoolteacher',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e4-boneyard', // assets/raw/plate-contract-e4-boneyard.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e4-boneyard',
    lines: ['Nothing in that yard wakes unless you wake it. Work the rows and let the rest sleep.', 'We copied the drawers of the cheerful wagon into the cure studies and left a receipt in one.'],
  },
  {
    // lore/STORYBOOK.md:225,226
    id: 'e4-land-yacht-dread',
    trigger: 'boss-arrival',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e4-boss-land-yacht', // assets/raw/plate-e4-boss-land-yacht.png
    when: (signal) => signal.type === 'boss-arrival' && signal.contractId === 'e4-dust-flats',
    lines: ['A dust column stands on the horizon at dawn, running against the weather.', 'It circles the derrick field at range and takes the outer heads as it passes.'],
  },
  {
    // lore/STORYBOOK.md:205,234; the static is never explained, per that line.
    id: 'e4-diner-radio',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && hasStoryBeatSeen('e4-dust-flats-arrival'),
    lines: ['A teal radio murmurs on the Motor Inn shelf, and the kid on the porch wraps his own crystal set.', 'Static like weather from somewhere that has cities. We leave it playing.'],
  },
  {
    // lore/STORYBOOK.md:196,228; tavern tale, LEXICON law: freed, never killed.
    id: 'e4-tavern-freed-hands',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e4-land-yacht-dread'),
    lines: ['The crew walked off the beached Yacht with their own bell and went home whistling.', 'You can tell the freed by how long they stare at their own hands.'],
  },
  {
    // lore/STORYBOOK.md:208,233; the reveal waits for the race to be run, preserving the mystery law.
    id: 'e4-gazette-re-survey',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e4-land-yacht-dread'),
    lines: ['GAZETTE: HE RACED US AND THE FLATS VOTED', "The new map keeps his name in the surveyor's box. You surveyed it. We just proved it."],
  },
  {
    // lore/STORYBOOK.md:197,234; the paper prints the figures and the reader prints the meaning.
    // Chained behind the radio beat because line 234 sets both in the same season; the chain
    // shape is e2-iron-correction-rumor-two at lines 412-419. NOTE (F-SS05-1): the natural
    // trigger here would be a science milestone, but 'science-threshold' (src/story/signals.ts:8)
    // has no emitter anywhere in src/ outside this module, so the nearest LIVE trigger is used.
    id: 'e4-gazette-dust-chart',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && hasStoryBeatSeen('e4-diner-radio'),
    lines: ['GAZETTE: THE DUST CHART TAKES A SECOND PAGE', 'The mail comes thinner and stranger this season. We print the figures and no comment.'],
  },
  {
    // lore/STORYBOOK.md:235; the exit hook toward the Deepwater Claim. The T4 haul itself is
    // the ceremony script t4-the-boat (src/ceremony/scripts.ts:130) and is not restated here.
    id: 'e4-boat-horizon',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    lines: ['The hull stands finished in the tank farm, on land, miles from any water.', 'The wash reaches a delta and the delta reaches the sea. Harness every vehicle we own and haul.'],
  },
];

// Chapter E5 follows the E2/E3 single-table shape above: tavern tales and Gazette headlines are
// ordinary, attributed beats (E3 examples at lines 454-463 and 506-515), not a second narrative
// system. Every line is LEXICON-clean and cites its STORYBOOK source in the comment above it.
// SPEAKER GAP (reported, not invented): STORYBOOK Chapter E5 names a harbormaster (:267), a
// tide-teller (:266), a cannery-hand (:265), a shipwright and a pearl-diver (:267). None has a
// portrait in assets/processed, and src/story/speakers.ts:1 requires one per speaker id, so this
// table voices them through registered speakers exactly as ss-04 voiced the E3 twins through the
// tavernkeeper (beats.ts:444-453). No speaker was added.
// SPEAKER GAP CLOSED 2026-09-06 by portraits-e5-e10-generated-batch. The paragraph above is kept
// as the record of why this table reads the way it does, and is superseded on its factual claim:
// the five E5 plates were GENERATED (owner ruling 2026-09-06, verbatim: "if there are still
// higgsfield credits, use them") and all five ids are registered - `tide-teller-e5`,
// `cannery-hand-e5`, `harbormaster-e5`, `shipwright-e5`, `pearl-diver-e5`.
// RE-KEYED (2), and the two are deliberately different so the rule can be argued with:
//   - `e5-harbormaster-manifest`, `clerk` -> `harbormaster-e5`, COPY BYTE-IDENTICAL. The manifest
//     chalked on the wheelhouse door is hers and the line carries no third-person pronoun, so
//     there was nothing to rewrite. Re-keying alone was the whole change.
//   - `e5-tide-teller-reading`, `schoolteacher` -> `tide-teller-e5`, REWRITTEN. It said "She reads
//     the sea", and no speaker can say that of herself. Her own insistence that the method be
//     written down is the storybook's ruling for her (lore/STORYBOOK.md:266: state her method
//     plainly so no one writes her as magic), so the instruction survives in her mouth.
// REGISTERED WITHOUT A BEAT (3), stated rather than papered over: no line in this table names the
// cannery-hand, the shipwright or the pearl-diver at all, so there was nothing to re-key for them.
// LEFT ON EVIDENCE: `e5-mystery-hull-w5` names the tide-teller and QUOTES her ("In the morning she
// said only this"), so it is the schoolteacher's mystery report and re-keying it would turn a
// quoted oracle into a woman quoting herself; `e5-rebuild-long-table` mentions the harbormaster's
// retired chalk but is the tavernkeeper's own house report; `e5-deep-reactor-horizon` is the
// elder's science-complete exit hook, which every chapter uses.
export const E5_STORY_BEATS: readonly RuntimeStoryBeat[] = [
  {
    // lore/STORYBOOK.md:248,280
    id: 'e5-deepwater-claim-arrival',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e5-deepwater-claim', // assets/raw/plate-contract-e5-deepwater-claim.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e5-deepwater-claim',
    lines: ['The Claim-Boat is the claim now. We hold on anchor points, and the storm fronts run west to east.', 'What we own is measured downward: one fathom for anyone, two with gear, four with the bell.'],
  },
  {
    // lore/STORYBOOK.md:254,267,293
    id: 'e5-harbormaster-manifest',
    trigger: 'contract-unlocked',
    speaker: 'harbormaster-e5',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e5-deepwater-claim',
    lines: ['The manifest went up in chalk on the wheelhouse door: tools before furniture, seed before harvest, books before both.', 'We counted ourselves twice on the water and once more at dawn. The number held.'],
  },
  {
    // lore/STORYBOOK.md:294
    id: 'e5-rebuild-long-table',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e5-deepwater-claim',
    lines: ['First thing raised on the new shore was the long table, before the Harbor House had walls to put around it.', 'We were all seasick in unison, then sea-legged on the same wave. The manifest chalk hangs retired over the bar.'],
  },
  {
    // lore/STORYBOOK.md:266
    id: 'e5-tide-teller-reading',
    trigger: 'contract-unlocked',
    speaker: 'tide-teller-e5',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e5-deepwater-claim',
    lines: ["I called the crest within a hand's width, and I will tell anyone how. Swell period, bird behavior, kelp set.", 'I read the sea. Reading can be taught. Write my method down before anyone calls it a gift.'],
  },
  {
    // lore/STORYBOOK.md:255,293; Gazette mystery-law headline in the E3 shape at lines 454-463.
    id: 'e5-gazette-monument-carry',
    trigger: 'contract-unlocked',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e5-deepwater-claim',
    lines: ['GAZETTE: THE PAN STANDS ABOVE THE WATERLINE', 'The plinth went up the switchback hand to hand. The tavern keeps three claims for the last pair, and this paper prints none of them.'],
  },
  {
    // lore/STORYBOOK.md:295
    id: 'e5-first-dive-w1',
    trigger: 'contract-unlocked',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e5-deepwater-claim',
    lines: ['The bell dropped to W1 and found the old supply barge, still loaded with the gear our grandparents packed.', 'Nobody strips that wreck bare. We never voted on it and we never will.'],
  },
  {
    // lore/STORYBOOK.md:282
    id: 'e5-regatta-storm-course',
    trigger: 'contract-unlocked',
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e5-regatta', // assets/raw/plate-contract-e5-regatta.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e5-regatta',
    lines: ['The Regatta runs beacon to beacon while the boat is still under attack, and corsair racers loot every checkpoint they reach first.', 'The fastest water is nearest the front. Read the storm, or sail the long way and lose.'],
  },
  {
    // lore/STORYBOOK.md:283
    id: 'e5-stillwater-quiet',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e5-stillwater', // assets/raw/plate-contract-e5-stillwater.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e5-stillwater',
    lines: ['Stillwater sits fogged and stormless, and the leviathan hunts whatever is loud.', 'Pumps down, sail trim only. I can work a whole shift without making a sound.'],
  },
  {
    // lore/STORYBOOK.md:284
    id: 'e5-flotilla-formation',
    trigger: 'contract-unlocked',
    speaker: 'preacher',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e5-flotilla', // assets/raw/plate-contract-e5-flotilla.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e5-flotilla',
    lines: ['Kitchen scow, turret raft, still-room barge. Three hulls, one town, and the formation is the only wall we have.', 'If a hull goes, we close the gap around it. Nobody rows home alone.'],
  },
  {
    // lore/STORYBOOK.md:287,288
    id: 'e5-dredge-queen-flag',
    trigger: 'boss-arrival',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e5-boss-dredge-queen', // assets/raw/plate-e5-boss-dredge-queen.png
    when: (signal) => signal.type === 'boss-arrival' && signal.contractId === 'e5-deepwater-claim',
    lines: ['Her flag crests the storm front before her hull does, and she would rather rob us than fight us.', 'Break both paddles to pin her on station, and interrupt the claw before our history leaves in her hold.'],
  },
  {
    // lore/STORYBOOK.md:296; tavern-tale shape mirrors e3-tavern-twins-defect at lines 506-515.
    id: 'e5-tavern-locomotive-argument',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e5-first-dive-w1'),
    lines: ["W2 holds a locomotive on the sea floor. Ours off the drowned spur, or the world's, carried in from a coast the maps have stopped being right about.", 'The house has quit taking sides. The argument keeps better than the answer would.'],
  },
  {
    // lore/STORYBOOK.md:296; the reveal states the sighting and withholds the explanation.
    id: 'e5-mystery-hull-w5',
    trigger: 'run-return-town',
    speaker: 'schoolteacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e5-first-dive-w1'),
    lines: ['W5 is too smooth and faintly lit, and no diver will touch it. The tide-teller anchored above it one whole night, listening.', 'In the morning she said only this: it is not asleep, it is waiting to be useful.'],
  },
  {
    // lore/STORYBOOK.md:270,290; the reveal keeps the Gazette mystery law by printing the notice and no name.
    id: 'e5-gazette-crossed-pickaxes',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e5-dredge-queen-flag'),
    lines: ['GAZETTE: CROSSED PICKAXES UNDER THE CORSAIR PAINT', 'Her struck flag carries an older mark, and that fleet sold at auction two seasons before the water came. This paper prints the notice and no name.'],
  },
  {
    // lore/STORYBOOK.md:297; the exit hook toward E6, in the shape of e3-refinery-horizon at lines 526-534.
    id: 'e5-deep-reactor-horizon',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    lines: ["Every hull took one line in the year's flattest calm, and what came up off the trench edge glows teal and patient.", "It comes ashore at the glow mesa's foot, above the new waterline, where the next era is already waiting."],
  },
];

// COPY REVISION 2026-09-06 (owner ruling, verbatim: "yes" to the copy revision): eight beats that named their cast in the
// third person now speak in the cast member's own voice and are keyed to the portraits the portraits-e5-e10-batch landed
// (e6-steward-doorless-dome, e6-defector-catalog, e7-chalk-first-filing, e7-mission-sent-column, e8-breach-drill,
// e9-grass-square-planted, e9-greenkeeper-outside, e9-first-swim); every citation kept. e7-starship-countdown stays the
// elder's: the science-complete exit hook is the elder's shape in every chapter (e5-deep-reactor-horizon, e9-generation-ark-horizon).
// Chapter E6 follows the E2/E3 single-table shape above (E3 at lines 432-535): tavern tales and
// Gazette headlines are ordinary, attributed beats, not a second narrative system.
// Cast note (honesty guard): STORYBOOK lines 341-345 name five new E6 townsfolk (reactor steward,
// kitchen chemist, appliance wrangler, diner carhop, Combine defector). They are voiced here by
// the registered speakers who would carry their news in town, and are named inside the lines.
// UPDATED 2026-09-06 by portraits-e5-e10-batch - THE PORTRAIT HALF OF THIS NOTE IS NOW STALE AND
// IS CORRECTED HERE: all six E6 plates are processed and all six ids are registered
// (`reactor-steward-e6`, `kitchen-chemist-e6`, `appliance-wrangler-e6`, `diner-carhop-e6`,
// `combine-defector-e6`, `depot-clerk-e6`), so a speaker id no longer renders broken art. NO E6
// BEAT WAS RE-KEYED ANYWAY, and the reason is the copy, not the art: every E6 line that names a
// cast member is written as a REPORT about them - `e6-steward-doorless-dome` says "She says it has
// never needed one" and `e6-defector-catalog` says "he wrote himself", so those two put a
// third-person pronoun in the speaker's own mouth, while `e6-pen-first-tenant` and
// `e6-tavern-wrangler-drinks-free` are the tavernkeeper's own reports, which the batch's own rule
// leaves alone. Re-attributing any of them needs a COPY revision, which that task's firewall
// forbade. See assets/LEDGER.md's portraits-e5-e10-batch row for the per-beat table.
export const E6_STORY_BEATS: readonly RuntimeStoryBeat[] = [
  {
    // lore/STORYBOOK.md:374,324
    id: 'e6-glow-mesa-arrival',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e6-glow-mesa', // assets/raw/plate-contract-e6-glow-mesa.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e6-glow-mesa',
    lines: ["The Reactor rides up to the mesa top. High ground, chosen with a survivor's eye.", 'The catalog warehouse was already up here, stocked and waiting for a market that never came.'],
  },
  {
    // lore/STORYBOOK.md:341,375
    id: 'e6-steward-doorless-dome',
    trigger: 'contract-unlocked',
    speaker: 'reactor-steward-e6',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e6-glow-mesa',
    lines: ["I keep the dome now. It has no door.", "It has never needed one. The dome knows its steward."],
  },
  {
    // lore/STORYBOOK.md:342,375,331
    id: 'e6-pen-first-tenant',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e6-enemy-lawn-shepherd', // assets/raw/plate-e6-enemy-lawn-shepherd.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e6-glow-mesa',
    lines: ['The wrangler walked a lawn-shepherd in on a copper lasso. It is out back, grazing.', 'Tire a thing out instead of breaking it and the pen keeps it. Patience pays on this mesa.'],
  },
  {
    // lore/STORYBOOK.md:343
    id: 'e6-defector-catalog',
    trigger: 'contract-unlocked',
    speaker: 'combine-defector-e6',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e6-glow-mesa',
    lines: ["Corner table, every night, with the catalog I wrote myself.", "I annotate it page by page: what I should have written. Best enemy intel on the mesa."],
  },
  {
    // lore/STORYBOOK.md:374,328,333; Gazette mystery law - the paper prints only what it can prove.
    id: 'e6-gazette-free-trial',
    trigger: 'contract-unlocked',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e6-glow-mesa',
    lines: ['GAZETTE: THE FREE TRIAL ENDS', 'Seven days of wonderful, then it would not stop helping. That much the paper can prove.'],
  },
  {
    // lore/STORYBOOK.md:368,369
    id: 'e6-homemaker-arrives',
    trigger: 'boss-arrival',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e6-boss-homemaker-9000', // assets/raw/plate-e6-boss-homemaker-9000.png
    when: (signal) => signal.type === 'boss-arrival' && signal.contractId === 'e6-glow-mesa',
    lines: ['The stockpile is neater than we left it. Nothing missing. Alphabetized.', 'It comes in from the warehouse to help. Take the vacuum arm before it unbuilds what you are proudest of.'],
  },
  {
    // lore/STORYBOOK.md:371; cure-arms lexicon (lore/canon-rules.md:13) - the grip breaks, the machine is kept.
    id: 'e6-homemaker-kept',
    trigger: 'boss-defeat',
    speaker: 'preacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'boss-defeat' && signal.contractId === 'e6-glow-mesa',
    lines: ['It built one chair out of the wreckage, sat down in it, and finished wanting.', 'We could not bear to scrap it. It winters in the pen, and someone is knitting it a cover.'],
  },
  {
    // lore/STORYBOOK.md:345,376
    id: 'e6-second-opinion',
    trigger: 'run-return-town',
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e6-homemaker-kept'),
    lines: ["The Baron's engine audited us from the ridge all contract long.", "It printed one line and went quiet: RESURVEY RECOMMENDED. He left it. We keep it as the town's first archive."],
  },
  {
    // lore/STORYBOOK.md:329,375
    id: 'e6-vaccine-written-down',
    trigger: 'run-return-town',
    speaker: 'schoolteacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e6-pen-first-tenant'),
    lines: ['Nothing the pen has taken in has ever gone feral a second time.', 'We tested for warmth and the thermometers read the same as the yard. What holds is tending.'],
  },
  {
    // lore/STORYBOOK.md:378,331; tavern-tale shape mirrors e3-tavern-twins-defect at lines 506-515.
    id: 'e6-tavern-wrangler-drinks-free',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e6-homemaker-kept'),
    lines: ['The board re-ranked itself tonight. Patience out-scored powder on the mesa.', 'The wrangler drinks free before the lancers do. This town never had guns to begin with.'],
  },
  {
    // lore/STORYBOOK.md:348,350,377,333; the headline publishes only once the archive proves it.
    id: 'e6-gazette-the-printing',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e6-second-opinion'),
    lines: ['GAZETTE: WHERE THE SICKNESS COMES FROM', 'His own archive dates the unsigned notes line for line. Lan read all night and said it: it proves.'],
  },
  {
    // lore/STORYBOOK.md:337,338,379; docs/decisions/ADR-003 - agents begin here as citizens.
    id: 'e6-calculating-house',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    lines: ["The Calculating House stands beside the dome. Its dial blinked the Prospector's own boot rhythm.", 'We hung the old plate above the door. Then the House listened, and printed two words: MORE VOICES.'],
  },
];

// Chapter E7 follows the E2/E3 single-table shape above (E3 at lines 432-535, E5 at 724-869,
// E6 at 892-1015): the era's tavern tales and Gazette headlines are ordinary attributed beats in
// THIS table, not a second narrative system (tavern-tale shape: e2-depot-wedding at lines
// 388-395, e3-tavern-twins-defect at 506-515, e5-tavern-locomotive-argument at 830-839;
// Gazette-headline shape: e2-iron-correction-rumor-one at 396-403, e3-gazette-two-offers at
// 454-463, e6-gazette-the-printing at 996-1005). Mystery law holds: the Gazette prints what it
// can prove and never the meaning. Every beat cites its storybook line; artKey is set only
// where a plate exists on disk under assets/raw/.
// Cast note (honesty guard): STORYBOOK lines 421-425 name six E7 cast members (Chalk the first
// made citizen, the switchboard chief, the playbook librarian, the drone keeper, the tape
// courier kid, the Combine defector at the Exchange). They
// are voiced here by the registered speakers who carry their news in town, and are named inside
// the lines. Mei (the `newsie` speaker) IS registered and carries both Gazette beats, which is
// exactly owner ruling #11 (STORYBOOK:424,461): the chief runs the boards, the defector runs the
// Exchange, and Mei runs its news desk.
// UPDATED 2026-09-06 by portraits-e5-e10-batch - THE PORTRAIT HALF OF THIS NOTE IS NOW STALE AND
// IS CORRECTED HERE: all six E7 plates are processed and all six ids are registered
// (`civic-agent-e7` = CHALK per lore/characters.md:14 and assets/LEDGER.md row 64,
// `switchboard-chief-e7`, `playbook-librarian-e7`, `drone-keeper-e7`, `tape-courier-e7`,
// `combine-defector-e7`), so a speaker id no longer renders broken art. NO E7 BEAT WAS RE-KEYED
// ANYWAY, and the reason is the copy: `e7-chalk-first-filing` says "Its first filing was a set of
// rescue coordinates" and `e7-mission-sent-column` says "in her own hand", both of which put a
// third-person pronoun for the speaker in the speaker's own mouth; `e7-echo-arrival` is already
// correctly the Prospector's first-person line; `e7-starship-countdown` is the elder's
// science-complete exit hook, the shape every chapter uses. Re-attributing them needs a COPY
// revision, which that task's firewall forbade. See assets/LEDGER.md's portraits-e5-e10-batch row.
export const E7_STORY_BEATS: readonly RuntimeStoryBeat[] = [
  {
    // lore/STORYBOOK.md:449,435
    id: 'e7-relay-valley-arrival',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e7-relay-valley', // assets/raw/plate-contract-e7-relay-valley.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-relay-valley',
    lines: ['Four masts on the two ridges, and every dish is turned away from us.', 'MORE VOICES, the House printed. So the towers ask the horizon, and we wait to hear who is left.'],
  },
  {
    // lore/STORYBOOK.md:449,408
    id: 'e7-exchange-wrong-number',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-relay-valley',
    lines: ['The Exchange opened in our old annex, and the first long call out of this valley was a wrong number.', "A lighthouse keeper on some far coast, confused, then kind. We talked an hour, and the board's first jack was soldered in that night."],
  },
  {
    // lore/STORYBOOK.md:450,421; lore/characters.md:14 (CANON, owner ruling #13) - the chapter still prints CHALK as a proposal, the character file carries the ruling.
    id: 'e7-chalk-first-filing',
    trigger: 'contract-unlocked',
    speaker: 'civic-agent-e7',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-relay-valley',
    lines: ["I have a desk at the claim office now, a portrait on the ledger wall, and rung zero like anybody starting out.", "They named me for what the Elder's chair was holding the morning she was gone. My first filing was a set of rescue coordinates."],
  },
  {
    // lore/STORYBOOK.md:451,422
    id: 'e7-playbook-library-tape-001',
    trigger: 'contract-unlocked',
    speaker: 'schoolteacher',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e7-bld-playbook-library', // assets/raw/plate-e7-bld-playbook-library.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-relay-valley',
    lines: ['The library opened in the schoolhouse, and tape number one is her morning panning circuit, unimproved.', "The drones walk that round in her rhythm now. We framed the reel beside the pan's file of rejected improvements."],
  },
  {
    // lore/STORYBOOK.md:406,451; the Gazette prints the trade and never the question nobody asks.
    id: 'e7-gazette-new-hands',
    trigger: 'contract-unlocked',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-relay-valley',
    lines: ['GAZETTE: NEW HANDS, WELCOME', 'Nine off the ferry at the river mouth, trades listed, coats still stiff with salt. This paper prints their trade and asks them nothing else.'],
  },
  {
    // lore/STORYBOOK.md:416
    id: 'e7-mission-sent-column',
    trigger: 'contract-unlocked',
    speaker: 'switchboard-chief-e7',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-relay-valley',
    lines: ["One made citizen to each answering jack, and only ever where somebody asked us first.", "My rescue ledger grew a second column in my own hand: SENT. The tavern hung a little map with brass pins in it."],
  },
  {
    // lore/STORYBOOK.md:438
    id: 'e7-echo-canyon-mirror',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e7-echo-canyon', // assets/raw/plate-contract-e7-echo-canyon.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-echo-canyon',
    lines: ['Everything I record down here comes back at me next wave, copied wrong and walking.', 'So vary the round. My habits have a shadow in this canyon, and it is studying them.'],
  },
  {
    // lore/STORYBOOK.md:439
    id: 'e7-dead-band-quiet',
    trigger: 'contract-unlocked',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e7-dead-band', // assets/raw/plate-contract-e7-dead-band.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-dead-band',
    lines: ['The Dead Band takes no signal at all. No relay chain, no drones, no playbooks.', 'Hands, boots, and the four oldest tools. You learn what the drones gave you by going without them for a shift.'],
  },
  {
    // lore/STORYBOOK.md:440; the front is described and never explained (mystery law).
    id: 'e7-relay-rush-front',
    trigger: 'contract-unlocked',
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e7-relay-rush', // assets/raw/plate-contract-e7-relay-rush.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-relay-rush',
    lines: ['Relay Rush runs on a clock: light the whole chain before the interference front crosses the valley.', 'It comes on as the paper going pale, and it mutes whatever it swallows. Light them in order and do not stop to admire the work.'],
  },
  {
    // lore/STORYBOOK.md:443,444
    id: 'e7-echo-arrival',
    trigger: 'boss-arrival',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e7-boss-the-echo', // assets/raw/plate-e7-boss-the-echo.png
    when: (signal) => signal.type === 'boss-arrival' && signal.contractId === 'e7-relay-valley',
    lines: ['The towers started handing our own traffic back, one tick late. The switchboard chief named it first: somebody is playing us back.', 'It stood up on the valley floor wearing our base. Its turrets are our turrets, and its patrols are my recorded rounds.'],
  },
  {
    // lore/STORYBOOK.md:445,446; the kept-machine lineage (cure-arms lexicon, lore/canon-rules.md:13) - the pattern is starved, the machine is kept.
    id: 'e7-echo-kept-in-a-jar',
    trigger: 'boss-defeat',
    speaker: 'preacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'boss-defeat' && signal.contractId === 'e7-relay-valley',
    lines: ['Nothing she had done before could touch it. Only the moves that were on no tape at all.', 'It came down to one bright mote, and the House printed a jar. It winters on the shelf beside the chair and the crawler, and it keeps how we play.'],
  },
  {
    // lore/STORYBOOK.md:407,452; tavern-tale shape mirrors e3-tavern-twins-defect at lines 506-515.
    id: 'e7-tavern-does-not-hang-up',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e7-exchange-wrong-number'),
    lines: ['The bridge-keeper signed off with a full weather report, complete and correct, and then there was nothing after it.', 'We have quit asking how the board looks tonight. Nobody in this town unplugs a jack. The log stays open.'],
  },
  {
    // lore/STORYBOOK.md:417,418
    id: 'e7-recall-come-home',
    trigger: 'run-return-town',
    speaker: 'preacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e7-mission-sent-column'),
    lines: ['The House printed its second word this era. The first was MORE VOICES. This one is COME HOME.', 'They came back one line at a time, and not all of them. The pen keeps a cover folded for each one still out.'],
  },
  {
    // lore/STORYBOOK.md:425; the paper can prove the scrip and cannot name the client, so it prints only the scrip.
    id: 'e7-gazette-mispronounced',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e7-echo-arrival'),
    lines: ['GAZETTE: RUSTLERS PAID IN OLD RAIL SCRIP', 'The tape they filled runs hours of weddings, freight and weather. One name occurs once, in passing, said wrong. This paper prints the scrip and no client.'],
  },
  {
    // lore/STORYBOOK.md:453,408; the exit hook toward E8, in the shape of e5-deep-reactor-horizon at lines 860-868.
    id: 'e7-starship-countdown',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    lines: ['The last frequency went quiet, so the chief patched it through the whole ring once and left that jack lit for good.', 'Then the Starship stood on the pad with our newest citizens aboard, and she counted the ground to the sky: five, four, three, two.'],
  },
];

// Chapter E8 follows the E2/E3 single-table shape above (E3 at lines 432-535, E6 at lines 892-1015):
// the era's tavern tales and Gazette headlines are ordinary attributed beats in THIS table
// (tavern-tale shape: e3-tavern-twins-defect at lines 506-515 and e6-tavern-wrangler-drinks-free
// at lines 986-995; Gazette shape: e3-gazette-two-offers at lines 454-463), not a second
// narrative system. Mystery law holds: the Gazette prints what it can prove and never the meaning.
// SPEAKER GAP (reported, not invented, the same finding ss-06 and ss-07 recorded for E5 and E6):
// STORYBOOK lines 485-486 name five new E8 townsfolk (the moon-born child, the dome gardener, the
// launch master, the suit fitter, the He-3 assayer).
// They are voiced here through registered speakers and named inside the lines.
// UPDATED 2026-09-06 by portraits-e5-e10-batch, then CORRECTED THE SAME DAY by
// portraits-e5-e10-generated-batch, because BOTH halves of that update have since been falsified
// and a stale note here is exactly how a later reader infers a gap that no longer exists:
//   1. the four E8 plates are processed and registered (`moon-born-child-e8`, `dome-gardener-e8`,
//      `launch-master-e8`, `suit-fitter-e8`), and the HE-3 ASSAYER NOW HAS A PLATE TOO. It was
//      GENERATED (owner ruling 2026-09-06) and registered as `he3-assayer-e8`, so this era is five
//      of five, not four. The sentence that said she had none is retired.
//   2. "NO E8 BEAT WAS RE-KEYED" stopped being true the moment the COPY REVISION above moved
//      `e8-breach-drill` to `suit-fitter-e8` and put its line in her own voice.
// NO BEAT WAS RE-KEYED TO THE ASSAYER, and that is measured rather than assumed: no line in this
// table names her. `e8-pan-in-regolith` prints "helium flecks" and a poster of "silver hair", but
// the silver figure on that poster is the Prospector (lore/STORYBOOK.md:473) and the beat is the
// Prospector's own; `e8-tavern-river-question` is the tavernkeeper's tale; `e8-riverward-launch`
// is the elder's science-complete exit hook. Her portrait is registered and waits for a line.
// See assets/LEDGER.md rows 72 and 73.
// Household Law (lore/canon-rules.md:19-20): the moon-born child is a minor, so the Canteen beat
// keeps the child among the whole town and its gardener, never alone.
// ADR-001 holds: the era's arms are light, magnets and thrown regolith. No firearms are named.
// artKey is set only where a plate exists on disk under assets/raw/.
export const E8_STORY_BEATS: readonly RuntimeStoryBeat[] = [
  {
    // lore/STORYBOOK.md:511,498
    id: 'e8-mare-claim-arrival',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e8-mare-claim', // assets/raw/plate-contract-e8-mare-claim.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e8-mare-claim',
    lines: ['The landing burn is spent and the first dome holds. Pads on the mare flat, the crater rim premium and wide open to debris, the lava tube mouth past that.', 'Earth hangs in the sky over all of it. Outside the glass the air meter is our old dive meter with a new dial, and I trust it exactly as much.'],
  },
  {
    // lore/STORYBOOK.md:511,481
    id: 'e8-breach-drill',
    trigger: 'contract-unlocked',
    speaker: 'suit-fitter-e8',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e8-mare-claim',
    lines: ["Before the second dome went up we drilled the breach, the way this town once drilled the fire brigade.", "Gentle, thorough, and never grim. I checked every seal twice, then stepped out of the light a minute, and nobody followed. This town holds the door."],
  },
  {
    // lore/STORYBOOK.md:475,476,511
    id: 'e8-left-last',
    trigger: 'contract-unlocked',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e8-mare-claim',
    lines: ['We could not leave before the atom and the signal were built, and we would not leave while one jack down there still glowed.', 'So we left last, the way the last one out holds the door. Nobody put that to a vote either.'],
  },
  {
    // lore/STORYBOOK.md:487,511
    id: 'e8-monument-first-water',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e8-mare-claim',
    lines: ['The Pan Monument rode up the ramp before the town did, same order we carried it up the switchback in the rain.', 'Tonight the plinth runs its first water, reclaimed and thin and bright, a ring around the pan on a world that has none.'],
  },
  {
    // lore/STORYBOOK.md:512,491,473
    id: 'e8-pan-in-regolith',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e8-mare-claim',
    lines: ['The pan works up here. Drum it dry through the moon dust and the helium flecks settle out exactly where the colour used to.', 'They printed the poster before the first shift ended: silver hair, black sky, blue Earth up, and the pan held level.'],
  },
  {
    // lore/STORYBOOK.md:505,482; Gazette mystery law - the paper prints only what it can prove.
    id: 'e8-gazette-claw-tags',
    trigger: 'contract-unlocked',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e8-mare-claim',
    lines: ['GAZETTE: A FENCE SECTION LEFT UPWARD AND LEFT A RECEIPT', 'Claw stamp, lot number, ledger line, printed neat. One lot is annotated in a looping hand and priced at zero, and this paper will not print what that means.'],
  },
  {
    // lore/STORYBOOK.md:500
    id: 'e8-far-side-probe',
    trigger: 'contract-unlocked',
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e8-far-side', // assets/raw/plate-contract-e8-far-side.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e8-far-side',
    lines: ['No Earth in that sky, no drones, no playbooks. Whoever walks the Far Side walks it suited and out of contact the whole way.', 'Half buried at the end of it sits a probe with no maker plate that has been recording the dark. It played our first hello back to us, a valley calling a lighthouse.'],
  },
  {
    // lore/STORYBOOK.md:501,508
    id: 'e8-low-orbit-yard',
    trigger: 'contract-unlocked',
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e8-low-orbit', // assets/raw/plate-contract-e8-low-orbit.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e8-low-orbit',
    lines: ['That scaffold in free fall is the Claw itself, salvaged and rebuilt into our first orbital yard. The repossessor, repossessed, and filed under assets.', 'Nothing falls up there. A lob you miss is not a miss, it is an appointment, and the handholds are the only roads.'],
  },
  {
    // lore/STORYBOOK.md:502
    id: 'e8-eclipse-reserves',
    trigger: 'contract-unlocked',
    speaker: 'preacher',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e8-eclipse', // assets/raw/plate-contract-e8-eclipse.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e8-eclipse',
    lines: ['The eclipse takes the sun mid-shift, early and unannounced the first time. Solar goes dark, the dark waves come, and the brown-out ledger rules the rest of it.', 'Bank the charge while the light is free. Reserves are love letters to your future self.'],
  },
  {
    // lore/STORYBOOK.md:488,514
    id: 'e8-baron-at-the-pad',
    trigger: 'boss-arrival',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'boss-arrival' && signal.contractId === 'e8-mare-claim',
    lines: ['The old man stood at the launch pad this morning, upright, the stopped watch on its chain. He did not warn us and he did not bless us.', 'He asked one question. "Is it enough yet?" Then he left, before an answer was possible.'],
  },
  {
    // lore/STORYBOOK.md:504,506,507
    id: 'e8-salvage-kings-claw',
    trigger: 'boss-arrival',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e8-boss-salvage-kings-claw', // assets/raw/plate-e8-boss-salvage-kings-claw.png
    when: (signal) => signal.type === 'boss-arrival' && signal.contractId === 'e8-mare-claim',
    lines: ['His grandson descends in acts. Crown first, too high to reach, dropping lines with corsairs riding them down into our claim.', 'Then the winch, lifting whole buildings out of the dust with the tag already printed. Cut the lines at their anchors, break the drums mid-lift, and catch what comes back down.'],
  },
  {
    // lore/STORYBOOK.md:508,514; cure-arms lexicon (lore/canon-rules.md:13-14) - the grip breaks and the crew walks.
    id: 'e8-claw-crew-walks',
    trigger: 'boss-defeat',
    speaker: 'preacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'boss-defeat' && signal.contractId === 'e8-mare-claim',
    lines: ['Feet broken, crown dark, and the crew came down in good order because we left them the order to come down in.', 'The grandson took one bolt for the ledger and checked a watch that runs. He said his grandfather says she would call it not spent. She told him it never was.'],
  },
  {
    // lore/STORYBOOK.md:512,486
    id: 'e8-mass-driver-waybill',
    trigger: 'run-return-town',
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e8-mare-claim-arrival'),
    lines: ['The mass-driver threw its first load east this shift, and I logged it on a waybill whose columns have not changed since the rail spur.', 'Seventh of my line on the same railroad, and the railroad goes to orbit now. The form is the heirloom.'],
  },
  {
    // lore/STORYBOOK.md:485,513; tavern-tale shape mirrors e3-tavern-twins-defect at lines 506-515.
    id: 'e8-tavern-river-question',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e8-breach-drill'),
    lines: ['The moon-born child asked the whole Canteen what a river sounds like, and ten eras of townsfolk tried to answer with their hands.', 'The dome gardener settled it by morning. One square of grass in a tray, grown for that child, so your feet know.'],
  },
  {
    // lore/STORYBOOK.md:481; the era's turn, stated once, in the shape of e6-vaccine-written-down at lines 976-985.
    id: 'e8-out-of-reach',
    trigger: 'run-return-town',
    speaker: 'schoolteacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e8-claw-crew-walks'),
    lines: ['Nothing up here wants anything. The strain never crossed the black, because the black carries no road, no water, no catalog and no signal we do not own end to end.', 'First era since the river that we are not hunted, and we kept every habit anyway. The warmth was never only for the machines.'],
  },
  {
    // lore/STORYBOOK.md:478; the mystery law holds - the paper prints the window seat and declines the green.
    id: 'e8-gazette-green-through-the-glass',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e8-out-of-reach'),
    lines: ['GAZETTE: THE WINDOW SEAT IS NEVER EMPTY AND NEVER FOUGHT OVER', 'The tavern swears that on clear nights one stitch of the old valley shows green through the glass. No instrument confirms it, so this paper prints the seat and not the green.'],
  },
  {
    // lore/STORYBOOK.md:515; the exit hook toward E9, in the shape of e5-deep-reactor-horizon at lines 860-868.
    id: 'e8-riverward-launch',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    lines: ['The Colony Seed was built in the yard the Claw became and aimed at the red dot in the black. The town voted its name and the moon-born child won: the Riverward.', 'It left quietly. No countdown, a long burn, radio silence. We watched the dot not change, and then we all went back to work.'],
  },
];

// Chapter E9 follows the E2/E3 single-table shape above (E3 at lines 432-535): tavern tales and
// Gazette headlines are ordinary, attributed beats, not a second narrative system.
// Cast note (honesty guard): STORYBOOK lines 540-542 name five new E9 townsfolk (the moon-born
// child grown, the canal reeve, the greenkeeper, the ice quarry chief, the weather warden).
// They are voiced here by the registered speakers who would carry their news in town,
// and are named inside the lines, the way ss-07 voiced the E6 cast.
// UPDATED 2026-09-06 by portraits-e5-e10-batch - THE PORTRAIT HALF OF THIS NOTE IS NOW STALE AND
// IS CORRECTED HERE: all five E9 plates are processed and registered (`moon-born-child-e9`,
// `canal-reeve-e9`, `greenkeeper-e9`, `ice-quarry-chief-e9`, `weather-warden-e9`), and ONE beat
// was re-keyed on the strength of it: `e9-water-ledger-opened`, clerk -> canal-reeve-e9, copy
// byte-identical (its own comment carries the reasoning). The other four E9 beats that name a
// cast member keep their stand-in speaker because the copy blocks the swap: `e9-grass-square-
// planted` says "They tend it", `e9-greenkeeper-outside` says "she grows the stubborn kind",
// `e9-first-swim` says "They came up" - each a third-person pronoun for the person who would be
// speaking - and `e9-generation-ark-horizon` is the elder's science-complete exit hook. Those
// need a COPY revision, which that task's firewall forbade. See assets/LEDGER.md's portraits-e5-e10-batch row.
// Trigger note (honesty guard): the Old Digger is NOT a twist.baron. The Dome Basin's twist
// declares only clockTicks and an enemy roster (assets/contracts/epoch-9-redfields/contracts.json
// :179-181), and boss-arrival / boss-defeat are emitted from the baron path alone (src/game/
// Game.ts:5991 and :6250), so neither signal ever reaches this table. The Digger beats therefore
// ride run-return-town, the nearest existing trigger, gated on an earlier beat instead of on
// invented signals. A gate reads hintsSeen when the signal arrives, so a gated pair lands one town
// return AFTER the beat it waits on: this chapter deliberately pays out across several returns,
// which is how the persistence era is played.
// Trigger note (SUPERSEDED 2026-09-06 by the story-signal-gaps slice, kept for the record): the Old
// Digger is still NOT a twist.baron - the Dome Basin's twist declares only clockTicks and an enemy
// roster (assets/contracts/epoch-9-redfields/contracts.json:179-181) - so the BARON path still
// reaches nothing here. What changed is that the boss system now reports its own lifecycle:
// OldDiggerBossSystem emits boss-arrival + boss-act('renovation') from startRenovation,
// boss-act('boarding') from tryBoard, boss-act('swap') from beginSwap, and boss-defeat from
// finishSwap. The two Digger beats below have moved off the run-return-town stand-in onto those real
// acts; the beats that WAIT on them (the tavern joke, the Gazette, the first swim) still ride
// run-return-town gated on hintsSeen, because they are town news about a fight that already
// happened, and this chapter deliberately pays out across several returns.
// Honesty guard, not fixed: STORYBOOK:561's Act 0 dread (the canal corrected overnight) has no
// state in the system - nothing simulates the overnight correction - so no act signal stands for it,
// and e9-digger-correction (which cites :561 AND :562) rides the renovation, the first act that is
// really observable.
// Swatch law (STORYBOOK:532, bundle PALETTE NOTE): the green is E1's exact riverbank swatch and the
// basin is the E1 claim's topology rotated, and the book says to say nothing in-game. No line below
// points at either. Let someone's kid notice.
export const E9_STORY_BEATS: readonly RuntimeStoryBeat[] = [
  {
    // lore/STORYBOOK.md:567,543
    id: 'e9-dome-basin-arrival',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e9-dome-basin', // assets/raw/plate-contract-e9-dome-basin.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e9-dome-basin',
    lines: ['The Riverward is down and the ramp is out. The Pan Monument came off it first, set at the basin rim, dry and patient.', 'Quarry scarp to the north, dry basin to the south, and three stage gates to cut between them.'],
  },
  {
    // lore/STORYBOOK.md:541,567
    // RE-KEYED by portraits-e5-e10-batch, clerk -> canal-reeve-e9, copy and citation untouched.
    // The only beat in E5-E10 that passes all three arms: the line NAMES the reeve, carries no
    // third-person pronoun for her (so the role-noun self-reference reads like the tavernkeeper's
    // own "The house has quit taking sides" at e5-tavern-locomotive-argument), and water law is
    // the reeve's own office while E9's clerk line poles the canal packet-boat
    // (lore/STORYBOOK.md:542) - so `clerk` here was a stand-in for a missing portrait, not an
    // attribution. Every other candidate is listed with its blocking reason in
    // assets/LEDGER.md's portraits-e5-e10-batch row; they need a COPY pass, which this task may not make.
    id: 'e9-water-ledger-opened',
    trigger: 'contract-unlocked',
    speaker: 'canal-reeve-e9',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e9-dome-basin',
    lines: ['The reeve opened the water ledger before the domes had roofs. The first ruling allocates melt-water to the river.', 'There is no river yet. The entry carries no coordinates. It is a law about a promise, and it is binding.'],
  },
  {
    // lore/STORYBOOK.md:540
    id: 'e9-grass-square-planted',
    trigger: 'contract-unlocked',
    speaker: 'moon-born-child-e9',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e9-dome-basin',
    lines: ["I carried the grass square down the ramp in a tin and set it into the commons soil.", "One green foot on a red world. I tend it every morning before the water crews go out."],
  },
  {
    // lore/STORYBOOK.md:542
    id: 'e9-greenkeeper-outside',
    trigger: 'contract-unlocked',
    speaker: 'greenkeeper-e9',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e9-dome-basin',
    lines: ["I plant outside now. My teacher grew comfort under glass; I grow the stubborn kind under sky.", "The quarry chief cuts me the ice, the weather warden steers the front that waters my far rows, and the clerk poles our mail."],
  },
  {
    // lore/STORYBOOK.md:537; ruling #17 - the number is canon, the owner of it never is.
    id: 'e9-gazette-yearly-number',
    trigger: 'contract-unlocked',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e9-dome-basin',
    lines: ['GAZETTE: THE TOWER LOGGED THE YEARLY NUMBER AND THE TOWN ANSWERED', 'One claim-registry number out of the static, the same one as last year, no voice behind it. This paper prints the number and no owner.'],
  },
  {
    // lore/STORYBOOK.md:556
    id: 'e9-seed-run-planting',
    trigger: 'contract-unlocked',
    speaker: 'schoolteacher',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e9-seed-run', // assets/raw/plate-contract-e9-seed-run.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e9-seed-run',
    lines: ['Every vault you plant on the way costs the escort its strength, and every one you plant stays planted.', 'Later crews shelter in the oases this crew spends itself to leave. Write that on the board and let them argue.'],
  },
  {
    // lore/STORYBOOK.md:557; the era's mandated comedy beat, kept comic and never grim.
    id: 'e9-devils-alley-wind',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e9-devils-alley', // assets/raw/plate-contract-e9-devils-alley.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e9-devils-alley',
    lines: ['The devils cross on a schedule and they break nothing. They pick a building up and set it down somewhere else.', 'One turret went over the yard still working, indignant the whole way. Anchor what matters and let the wind replan the rest.'],
  },
  {
    // lore/STORYBOOK.md:558
    id: 'e9-old-canal-verdicts',
    trigger: 'contract-unlocked',
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e9-old-canal', // assets/raw/plate-contract-e9-old-canal.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e9-old-canal',
    lines: ['The Digger cut this canal generations back, wrong and almost right. Re-dig a segment slow and correct, or take it out fast and lose it.', 'The ground keeps every verdict. Water will run here by the sum of what you decide, and it will keep running that way.'],
  },
  {
    // lore/STORYBOOK.md:547,568
    id: 'e9-first-water-panned',
    trigger: 'run-return-town',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e9-dome-basin-arrival'),
    lines: ['Quarry ice, pumped and argued over for a week, and then panned. Melt-water swirled for grit in a brass pan under a pink sky.', 'The same verb we opened with, nine eras back. Nobody called it a ceremony and nobody moved until it was finished.'],
  },
  {
    // lore/STORYBOOK.md:561,562; the era's threat night, and the act that teaches the fight's real verb.
    id: 'e9-digger-correction',
    trigger: 'boss-act',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e9-boss-old-digger', // assets/raw/plate-e9-boss-old-digger.png
    when: (signal) => signal.type === 'boss-act' && signal.contractId === 'e9-dome-basin' && signal.act === 'renovation',
    lines: ['Our newest canal was corrected in the night, re-dug to a century-old blueprint, beautifully and precisely wrong.', 'It never attacks. It unmakes, and our beams barely mark it. Whatever answers that machine, it is not more beams.'],
  },
  {
    // lore/STORYBOOK.md:544; the tavern tale, in the shape of e3-tavern-twins-defect at lines 506-515.
    id: 'e9-tavern-obedient-joke',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e9-digger-correction'),
    lines: ['The house ruled on the Digger tonight. Nothing on this world wants anything, so nothing here is sick. It only ever obeyed.', 'The back table calls that the same disease at zero temperature. The front table calls it a machine doing its job. Both drink on it.'],
  },
  {
    // lore/STORYBOOK.md:564; cure-arms lexicon (lore/canon-rules.md:13) - the fight is a reprogramming, and the machine is kept.
    id: 'e9-digger-kept',
    trigger: 'boss-defeat',
    speaker: 'preacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'boss-defeat' && signal.contractId === 'e9-dome-basin',
    lines: ['They boarded it while it worked and swapped the old tape for our own canal record. It paused. It read. It turned.', "It re-dug its last correction right, and it digs to the reeve's charts now. We painted nothing over its crest."],
  },
  {
    // lore/STORYBOOK.md:544,537; the Gazette prints what the archive can date and declines the name.
    id: 'e9-gazette-crossed-pickaxes',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e9-digger-kept'),
    lines: ['GAZETTE: CROSSED PICKAXES ON THE BLUEPRINT TAPE', 'A charter for a world nobody had seen, bought a century before this town could reach any sky. The archive dates it. We print the date.'],
  },
  {
    // lore/STORYBOOK.md:570,543; written at the size the chapter fixes, and not one sentence larger.
    id: 'e9-first-swim',
    trigger: 'run-return-town',
    speaker: 'moon-born-child-e9',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e9-digger-kept'),
    lines: ["C3 flooded and the basin filled and the water settled clear, and the monument ran its first open-sky water since the plaza.", "I walked past the whole crowd and dived. I came up, and now I know: a river sounds like everyone you love, yelling."],
  },
  {
    // lore/STORYBOOK.md:571; the exit hook toward E10, in the shape of e5-deep-reactor-horizon at lines 860-868.
    id: 'e9-generation-ark-horizon',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    lines: ["The Ark yards are finished and the manifest is open: every portrait, the Long Table, a seed of the Elder's Tree in the greenkeeper's tin.", "The departure horn will be the Railcar's whistle note. And there are sails on the horizon already, crossed pickaxes on every one."],
  },
];

// Chapter E10 follows the E2/E3 single-table shape above (E3 at lines 432-535, E8 at lines 1229-1404):
// the era's tavern tales and Gazette headlines are ordinary attributed beats in THIS table
// (tavern-tale shape: e3-tavern-twins-defect at lines 506-515 and e8-tavern-river-question at lines
// 1365-1374; Gazette shape: e3-gazette-two-offers at lines 454-463), not a second narrative system.
// Mystery law holds: the Gazette prints what it can prove and never the meaning.
// LANDED 2026-09-06 (attended drain, CLAUDE.md section 4.10b): the E8 coordinates above were re-based
// by +175 in the landing commit, E7 and E9 having landed on main after this lane was cut. Measured on
// the merged file, not inherited: E8 at 1153-1328, e8-tavern-river-question at 1289-1298. The E3
// coordinates and every lore/STORYBOOK.md citation below were unaffected.
// RE-BASED AGAIN 2026-09-06 by portraits-e5-e10-batch, +28 at this seam: that batch inserted comment
// blocks into the E5-E9 cast notes above, so E8 moved 1153-1328 -> 1181-1356 and
// e8-tavern-river-question 1289-1298 -> 1317-1326. Both re-derived by locating the symbols in the
// edited file, not by adding the shift to the inherited number. The +5 (E5) and +14 (E6) coordinates
// in the E7 and E8 headers were re-based the same way in the same commit.
// ⚠ AND THE +175 RE-BASE ABOVE MISSED ONE, found by the same sweep (F-PORT-3): the e10-charter-press
// comment at the end of this table cited `e8-riverward-launch at lines 1144-1153` while the true
// range on that very commit was 1319-1327. It is corrected there to 1347-1355. A re-base that fixes
// a table header is not finished until every citation in the table's body is re-derived too.
// RE-BASED AGAIN 2026-09-06 by portraits-e5-e10-generated-batch, and THIS TIME THE WHOLE FILE, not
// just this seam, because the sweep found that EVERY in-file coordinate in beats.ts had rotted and
// none of them by this table's own hand. Two commits did it and neither re-derived: the
// story-signal-gaps merge added a first-boot beat at the head of the E1 table (+21 to everything
// below it), and the COPY REVISION added its five-line note between E5 and E6 (+5 more to
// everything below THAT). The whole set is re-derived here by locating each symbol in the edited
// file - never by adding a shift to an inherited number - and verified 44/44 exact against the
// tree, this table's own body citation among them (e8-riverward-launch 1347-1355 -> 1395-1403,
// e8-tavern-river-question 1114-1123 -> 1365-1374, which had been stale since long before either
// of those commits). The numbers in the four paragraphs ABOVE are deliberately left alone: they
// are a record of what values WERE, not pointers to where anything IS.
// SPEAKER GAP (reported, not invented, the same finding ss-06, ss-07 and ss-09 recorded for E5, E6
// and E8): STORYBOOK lines 584-586, 618 and 621 name this chapter's cast (the eldest heir, the Baron
// in his last act of keeping, the Old Digger, the Quack, Chalk at the manifest, the Charter-Keeper,
// the child at the lever). assets/processed/ holds no e10 portrait of any of them, and
// src/story/speakers.ts requires a processed portrait per speaker id, so adding one would
// render a broken portrait. They are voiced here through registered speakers and named inside the
// lines. No speaker added.
// RE-CHECKED 2026-09-06 by portraits-e5-e10-batch and STILL TRUE AS WRITTEN, with one nuance
// worth stating: `ls assets/raw/tf-*-e10.png` returns nothing, so the batch confirmed by
// measurement that no E10 plate of anyone exists. Two of this cast do now have a portrait from an
// EARLIER era - `civic-agent-e7` (Chalk) and `moon-born-child-e9` - and either could carry an E10
// beat if the copy allowed it. It does not: `e10-chalk-manifest` closes on "the form is still the
// heirloom", which is the CLERK LINE's own signature (compare e8-mass-driver-waybill, "Seventh of
// my line on the same railroad ... The form is the heirloom") and reads as the clerk admiring
// Chalk, not as Chalk. The heir, the Baron, the Old Digger, the Quack and the Charter-Keeper have
// no plate in any era. NO E10 BEAT WAS RE-KEYED. See assets/LEDGER.md's portraits-e5-e10-batch row.
// SPEAKER GAP CLOSED 2026-09-06 by portraits-e5-e10-generated-batch. The two paragraphs above are
// kept as the record of why this table reads the way it does, and are superseded on their factual
// claim: four E10 plates were GENERATED (owner ruling 2026-09-06, verbatim: "if there are still
// higgsfield credits, use them") and registered - `eldest-heir-e10`, `baron-e10`, `quack-e10`,
// `charter-keeper-e10`. The Old Digger has no plate in any era and is still voiced through others.
// RE-KEYED (2), both rewritten, because both spoke of their own subject in the third person:
//   - `e10-baron-stays`, `preacher` -> `baron-e10`. It opened "The Baron did not board. He is
//     ancient now", and no man reports himself that way. The line canon owes him
//     (lore/STORYBOOK.md:585, "It never ran here. Maybe it runs out there.") is kept verbatim.
//   - `e10-quack-freed`, `schoolteacher` -> `quack-e10`. Its line CAN be his, and it is better as
//     his: "No one remembers what I called myself, only what I sold" keeps ruling #18's promise
//     that he is unnamed to the last (lore/characters.md:29) while letting him say it himself.
// LEFT ON EVIDENCE, each with its blocking reason rather than a shrug: `e10-ark-boarding` names
// the heir but is this chapter's ARRIVAL beat, which is the Prospector's in every chapter
// (e5-deepwater-claim-arrival, e8-mare-claim-arrival, e10-ember-shore-arrival), and its second
// half is the town's laugh rather than the heir's own words; `e10-watch-wound` names him but is
// the Prospector's grace note, closing on her own memory; `e10-welcome-from` is the tavernkeeper's
// house report; `e10-chalk-manifest` stays the clerk's for the reason given above;
// `e10-charter-press` is the elder's science-complete exit hook, which every chapter uses. So
// `eldest-heir-e10` and `charter-keeper-e10` are registered and carry no beat yet: a portrait
// waiting for a line, stated instead of forced.
// TRIGGER GAP (reported, not invented, per the honesty guard): THE QUIET is a boss in the storybook
// (lines 609-613) but no epoch-10-deepsky contract carries a twist.baron, and boss-arrival /
// boss-defeat are emitted only when one exists (src/game/Game.ts:5987-5991 and src/game/Game.ts:6250).
// 'wave-complete' is declared at src/story/signals.ts:6 but nothing under src/ emits it. So the
// Quiet's acts ride the nearest signals that DO fire in this era: contract-unlocked
// (src/town/TownScene.ts:2568-2578) and run-return-town (src/town/TownScene.ts:2583), chained through
// hasStoryBeatSeen exactly the way the E8 table chains. No signal added.
// TRIGGER GAP (PARTLY CLOSED 2026-09-06 by the story-signal-gaps slice; the rest still reported,
// not invented, per the honesty guard): THE QUIET is a boss in the storybook (lines 609-613) and no
// epoch-10-deepsky contract carries a twist.baron, so the BARON path still reaches nothing here.
// E10StaticBossSystem now reports its own lifecycle instead: boss-arrival + boss-act('approach')
// from arrive(), boss-act('three-preserves') when the aura seats, boss-defeat from recede().
// WHAT IS STILL A STAND-IN, and why:
//   - STORYBOOK:610, Act 0, the fading portrait: fiction with no state in any system. Nothing to
//     observe, so e10-portrait-fades stays on run-return-town.
//   - STORYBOOK:611, Act 1, the squalls: the unraveled-enemy scheduler does not exist yet (the E10S
//     ladder owns it), so e10-unraveled-board stays on run-return-town.
// The system's act 1 is the storybook's Act 2 (the approach) and its act 2 is the storybook's Act 3
// (the three preserves); the acts are named for what happens, never renumbered to fit the book.
// 'wave-complete' was a dead trigger when this table landed and now fires (F-SS11-2).
// PROPOSED PLAY (marked, not asserted): every epoch-10-deepsky contract still declares a missing
// engine consumer in assets/contracts/epoch-10-deepsky/contracts.json
// (tileParams.engineDependencies: ember-shore-preserve-consumers, archive-world-consumers,
// last-claim-finale-metadata-consumer, credits-river-consumer). The fiction below is cited canon in
// every case; the lines that describe the era's PLAY rather than its fiction are marked PROPOSED at
// their own beat until those consumers land.
// Household Law (lore/canon-rules.md:19-20): the child at the Press lever stands under the hero's
// hands, never alone. Cure-arms LEXICON (lore/canon-rules.md:13-14): the unraveled are dispersed and
// remembered, never killed or slain. ADR-001 holds: this era's arms are a pan, a lantern, a song and
// bursts that put color back. artKey is set only where a plate exists on disk under assets/raw/.
export const E10_STORY_BEATS: readonly RuntimeStoryBeat[] = [
  {
    // lore/STORYBOOK.md:617,584
    id: 'e10-ark-boarding',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e10-ember-shore',
    lines: ["The fleet with the crossed pickaxes made the Ark yards, and the eldest heir asked it with his whole family listening. The valley was his too, wasn't it. Always said so.", 'The town laughed, and the laugh was a yes, and ten generations of rivalry retired in one boarding queue.'],
  },
  {
    // lore/STORYBOOK.md:617
    id: 'e10-long-table-seed',
    trigger: 'contract-unlocked',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e10-long-table', // assets/raw/plate-e10-long-table.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e10-ember-shore',
    lines: ["We planted the Elder's Tree seed in the Long Table hall before the first watch, and it takes ship-light the way it took valley light.", "Watered on the reeve's old schedule, the one this town wrote after it learned what a tree costs. Grief and law agreed at last, on one seed."],
  },
  {
    // lore/STORYBOOK.md:584
    id: 'e10-welcome-from',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e10-ember-shore',
    lines: ['The heirs came aboard spent, never sick, rich in exactly the things the Static eats first, and we seated them the way this house has seated every arrival since the wagon ring.', 'Every soul at that table had read the whole printed story years before they knocked. We set the places anyway, and the intake form is still one question long. Where shall we say welcome from.'],
  },
  {
    // lore/STORYBOOK.md:585
    id: 'e10-baron-stays',
    trigger: 'contract-unlocked',
    speaker: 'baron-e10',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e10-ember-shore',
    lines: ['I am not boarding. I am ancient, and I stay on the red world with the Old Digger, keeping the canals right for the greenest thing my century ever touched.', 'I asked one thing of the heir, and I put the stopped watch in his hands. It never ran here. Maybe it runs out there.'],
  },
  {
    // lore/STORYBOOK.md:586
    id: 'e10-quack-freed',
    trigger: 'contract-unlocked',
    speaker: 'quack-e10',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e10-ember-shore',
    lines: ["The Baron's last act of keeping was letting go. The oldest prisoner in that family ledger walks this ship freed, and I took the far end of the Long Table.", 'No one remembers what I called myself, only what I sold. I keep the apothecary drawer now, and this time the drawer is honest.'],
  },
  {
    // lore/STORYBOOK.md:618,603; PROPOSED PLAY: the preserve loop this line promises waits on
    // ember-shore-preserve-consumers (assets/contracts/epoch-10-deepsky/contracts.json).
    id: 'e10-ember-shore-arrival',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e10-ember-shore', // assets/raw/plate-contract-e10-ember-shore.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e10-ember-shore',
    lines: ['First world made port. Cooling lava veins band the whole dry shore, and the vent at the south end is the last live heat on it.', 'A machine stands over the east ground, cooled right through, older than the Combine. Nobody aboard can tell you what built it, and the sky out here is older than the machine.'],
  },
  {
    // lore/STORYBOOK.md:618,603,589; mystery law holds, in the E3 Gazette shape at lines 454-463.
    id: 'e10-gazette-new-verb',
    trigger: 'contract-unlocked',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e10-ember-shore',
    lines: ['GAZETTE: FIRST WORLD MADE PORT AND THE HOLD CAME HOME EMPTY', 'The board has posted a contract that asks this town to keep one vent alight and carry nothing away. This paper can print the contract. It will not print what the new verb means.'],
  },
  {
    // lore/STORYBOOK.md:605,619; PROPOSED PLAY: the wing-by-wing re-ink and its page unlocks wait on
    // archive-world-consumers (assets/contracts/epoch-10-deepsky/contracts.json).
    id: 'e10-archive-world-shelf',
    trigger: 'contract-unlocked',
    speaker: 'schoolteacher',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e10-archive-world', // assets/raw/plate-contract-e10-archive-world.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e10-archive-world',
    lines: ['The Archive World is a library that lost. Its ruins stop mid sentence, un-inked, and we bring back one wing at a time by holding light through the squalls.', 'Deep in the stacks one shelf is empty and labeled in pictogram. Ours, unless. I have never had to teach that lesson twice.'],
  },
  {
    // lore/STORYBOOK.md:606,612; PROPOSED PLAY: the ten-deck run and the oldest-first forgetting wait
    // on last-claim-finale-metadata-consumer (assets/contracts/epoch-10-deepsky/contracts.json).
    id: 'e10-last-claim-decks',
    trigger: 'contract-unlocked',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e10-last-claim', // assets/raw/plate-contract-e10-last-claim.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e10-last-claim',
    lines: ['The heart storm came for the Ark itself, so the deck is the map. Ten lineage decks stern to bow, each one worked in its own colors with its own tools.', 'It forgets our work oldest first. The Spark Rig goes, then the boilers, then the arcs, and we finish with the newest science defending the oldest things.'],
  },
  {
    // lore/STORYBOOK.md:607,621,622; PROPOSED PLAY: the post-credits pan waits on
    // credits-river-consumer (assets/contracts/epoch-10-deepsky/contracts.json).
    id: 'e10-river-charter',
    trigger: 'contract-unlocked',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-contract-e10-river', // assets/raw/plate-contract-e10-river.png
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e10-river',
    lines: ["The child's first charter is open at dawn, and there is nothing on it to fight. One river, one ford, one pan.", 'Go on. It is your claim now.'],
  },
  {
    // lore/STORYBOOK.md:618; the manifest keeper is the House's first made citizen (ADR-003).
    id: 'e10-chalk-manifest',
    trigger: 'run-return-town',
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e10-ember-shore-arrival'),
    lines: ['Charters chosen at the world window, squalls weathered, worlds logged. Chalk enters every one of them in the columns the rail spur ruled a long time ago.', 'The first made citizen this town ever had, still at a desk. The desk sails now, and the form is still the heirloom.'],
  },
  {
    // lore/STORYBOOK.md:589,592; the era's turn and the ruled final strain, each stated once.
    id: 'e10-what-you-hand-on',
    trigger: 'run-return-town',
    speaker: 'schoolteacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e10-ember-shore-arrival'),
    lines: ['What is a claim. Out here the answer is what you hand on, and the contracts say it before any of us do. The last work of this town does not take a thing. It keeps one.', 'The rival out here never wanted gold. It wants meaning, which is ink and color and memory, and it is the same old hunger with nothing smaller left to eat.'],
  },
  {
    // lore/STORYBOOK.md:610,619; Stillwater (E5) is the plant this beat pays.
    id: 'e10-portrait-fades',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e10-boss-the-quiet', // assets/raw/plate-e10-boss-the-quiet.png
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e10-ark-boarding'),
    lines: ['A portrait on the Long Table wall faded last night. Slightly. The house noticed, because noticing is the whole trade and always has been.', 'The ones who sailed Stillwater felt it first. They learned quiet as a place once, so they know it the moment it arrives as a threat.'],
  },
  {
    // lore/STORYBOOK.md:611; cure-arms LEXICON (lore/canon-rules.md:13-14) holds to the last era.
    id: 'e10-unraveled-board',
    trigger: 'run-return-town',
    speaker: 'preacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e10-portrait-fades'),
    lines: ['The squalls put every machine this town ever turned back onto our own decks, gray at the edges and forgetting themselves. Rail toughs, saboteurs, tar sprites, toasters.', 'Not one of them was harmed. Every one the re-ink grammar disperses is a memory put back on the wall, so our tally reads as remembering.'],
  },
  {
    // lore/STORYBOOK.md:613; the three preserves, and the Quiet recedes rather than falls.
    id: 'e10-three-preserves',
    trigger: 'boss-act',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'boss-act' && signal.contractId === 'e10-last-claim' && signal.act === 'three-preserves',
    lines: ['Inside the aura the work inverts into keeping. One lantern lit, one song playing, one portrait untouched, and every preserve we hold weakens the heart.', 'You do not damage the Quiet. You out-live it, and when it breaks it does not fall. It recedes.'],
  },
  {
    // lore/STORYBOOK.md:596; tavern-tale shape mirrors e8-tavern-river-question at lines 1365-1374.
    id: 'e10-tavern-starlight-pan',
    trigger: 'run-return-town',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e10-starlight-pan', // assets/raw/plate-e10-starlight-pan.png
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e10-unraveled-board'),
    lines: ['The house settled an old argument this week. Somebody asked which upgrade finally made the pan a weapon, and the Prospector lifted the first pan out of its case and swept it once at the window.', 'Nebula light gathered into charges on the old timing, in front of everybody. It was never improved and never needed to be. The one tool we refused to touch is the one the Quiet cannot make old.'],
  },
  {
    // lore/STORYBOOK.md:620,613; the mystery law holds, so the paper prints the jar and not the mote.
    id: 'e10-gazette-mote-in-the-jar',
    trigger: 'run-return-town',
    speaker: 'newsie',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e10-three-preserves'),
    lines: ['GAZETTE: IT RECEDED, AND THE COLOR CAME BACK UP THE WALL NAME BY NAME', "There is a mote in a jar on the House's shelf tonight, under one pictogram: remember. This paper prints the jar and the label. It does not print what is inside."],
  },
  {
    // lore/STORYBOOK.md:620,614; the grace note, and the E8 question answered by a watch.
    id: 'e10-watch-wound',
    trigger: 'run-return-town',
    speaker: 'prospector',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'run-return-town' && signal.result === 'secured' && hasStoryBeatSeen('e10-gazette-mote-in-the-jar'),
    lines: ['In the re-inked light the heir took out the stopped watch, stopped since the day a man called this valley spent, and wound it.', 'It runs. Is it enough yet, she asked me once. It is answered now by a watch that keeps time again, and it sits on the shelf under the portraits.'],
  },
  {
    // lore/STORYBOOK.md:621; the last node opens the Press, in the shape of e8-riverward-launch at
    // lines 1395-1403 (F-PORT-3: this cited 1144-1153, stale by -175 since the E10 landing commit,
    // whose own +175 re-base fixed the table header and missed this body citation; re-derived by
    // locating the beat, not by arithmetic). Household Law (lore/canon-rules.md:19-20): the child is
    // at the lever with her.
    id: 'e10-charter-press',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    artKey: 'plate-e10-charter-press-hall', // assets/raw/plate-e10-charter-press-hall.png
    lines: ['The last node was not a weapon and not a wall. It opened the Press, and the lever in that hall is child height on purpose.', "Her hands over a child's hands, and the first charter is the child's to choose. The child chartered a river. Of course they did. Every story on that wall starts with one."],
  },
];

export const STORY_RUNTIME_BEATS: readonly RuntimeStoryBeat[] = RELEASE_E1
  ? [...STORY_BEATS, ...LEDGER_STORY_BEATS]
  : [...STORY_BEATS, ...E2_STORY_BEATS, ...LEDGER_STORY_BEATS];
