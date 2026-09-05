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
// ordinary, attributed beats (E2 examples at lines 368-397), not a second narrative system.
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
    // lore/STORYBOOK.md:147,174; Gazette mystery-law headline in the E2 shape at lines 376-397.
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
    // lore/STORYBOOK.md:147,177; tavern-tale shape mirrors e2-depot-wedding at lines 368-373.
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

// Chapter E4 follows the E2/E3 single-table shape above (see the E3 note at lines 409-410):
// the era's tavern tales and Gazette headlines are ordinary attributed beats in THIS table
// (tavern tale shape: e2-depot-wedding at lines 367-374 and e3-tavern-twins-defect at lines
// 485-494; Gazette headline shape: e2-iron-correction-rumor-one at lines 375-382 and
// e3-gazette-two-offers at lines 433-442), not a second narrative system. Mystery law holds:
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
    // shape is e2-iron-correction-rumor-two at lines 391-398. NOTE (F-SS05-1): the natural
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
// ordinary, attributed beats (E3 examples at lines 435-441 and 487-493), not a second narrative
// system. Every line is LEXICON-clean and cites its STORYBOOK source in the comment above it.
// SPEAKER GAP (reported, not invented): STORYBOOK Chapter E5 names a harbormaster (:267), a
// tide-teller (:266), a cannery-hand (:265), a shipwright and a pearl-diver (:267). None has a
// portrait in assets/processed, and src/story/speakers.ts:1 requires one per speaker id, so this
// table voices them through registered speakers exactly as ss-04 voiced the E3 twins through the
// tavernkeeper (beats.ts:425-432). No speaker was added.
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
    speaker: 'clerk',
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
    speaker: 'schoolteacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e5-deepwater-claim',
    lines: ["The tide-teller called the crest within a hand's width. Swell period, bird behavior, kelp set.", 'She reads the sea. Write the method down before anyone calls it a gift.'],
  },
  {
    // lore/STORYBOOK.md:255,293; Gazette mystery-law headline in the E3 shape at lines 435-441.
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
    // lore/STORYBOOK.md:296; tavern-tale shape mirrors e3-tavern-twins-defect at lines 487-493.
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
    // lore/STORYBOOK.md:297; the exit hook toward E6, in the shape of e3-refinery-horizon at lines 505-513.
    id: 'e5-deep-reactor-horizon',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    lines: ["Every hull took one line in the year's flattest calm, and what came up off the trench edge glows teal and patient.", "It comes ashore at the glow mesa's foot, above the new waterline, where the next era is already waiting."],
  },
];

// Chapter E6 follows the E2/E3 single-table shape above (E3 at lines 411-514): tavern tales and
// Gazette headlines are ordinary, attributed beats, not a second narrative system.
// Cast note (honesty guard): STORYBOOK lines 341-345 name five new E6 townsfolk (reactor steward,
// kitchen chemist, appliance wrangler, diner carhop, Combine defector). None has a processed
// portrait - assets/raw/tf-*-e6.png exist but assets/processed/ has no tf-*-e6 entry - so adding
// them to speakers.ts would render a broken portrait. They are voiced here by the registered
// speakers who would carry their news in town, and are named inside the lines.
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
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e6-glow-mesa',
    lines: ["The tide-teller's apprentice keeps the dome now. It has no door.", 'She says it has never needed one. The dome knows its steward.'],
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
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e6-glow-mesa',
    lines: ['Mint suit, corner table, every night with the catalog he wrote himself.', 'He annotates it page by page: what I should have written. Best enemy intel on the mesa.'],
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
    // lore/STORYBOOK.md:378,331; tavern-tale shape mirrors e3-tavern-twins-defect at lines 485-494.
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

// Chapter E7 follows the E2/E3 single-table shape above (E3 at lines 411-514, E5 at 683-828,
// E6 at 837-960): the era's tavern tales and Gazette headlines are ordinary attributed beats in
// THIS table, not a second narrative system (tavern-tale shape: e2-depot-wedding at lines
// 367-374, e3-tavern-twins-defect at 485-494, e5-tavern-locomotive-argument at 789-798;
// Gazette-headline shape: e2-iron-correction-rumor-one at 375-382, e3-gazette-two-offers at
// 433-442, e6-gazette-the-printing at 941-950). Mystery law holds: the Gazette prints what it
// can prove and never the meaning. Every beat cites its storybook line; artKey is set only
// where a plate exists on disk under assets/raw/.
// Cast note (honesty guard): STORYBOOK lines 421-425 name six E7 cast members (Chalk the first
// made citizen, the switchboard chief, the playbook librarian, the drone keeper, the tape
// courier kid, the Combine defector at the Exchange). None has a processed portrait -
// assets/raw/tf-*-e7.png exist but assets/processed/ has no tf-*-e7 entry, and speakers.ts:10-16
// resolves portraits from assets/processed/ - so a new speaker id would render broken art. They
// are voiced here by the registered speakers who carry their news in town, and are named inside
// the lines. Mei (the `newsie` speaker) IS registered and carries both Gazette beats, which is
// exactly owner ruling #11 (STORYBOOK:424,461): the chief runs the boards, the defector runs the
// Exchange, and Mei runs its news desk.
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
    speaker: 'clerk',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-relay-valley',
    lines: ['Chalk has a desk at the claim office now, a portrait on the ledger wall, and rung zero like anybody starting out.', "Named for what the Elder's chair was holding the morning she was gone. Its first filing was a set of rescue coordinates."],
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
    speaker: 'preacher',
    oncePerProfile: true,
    presentation: 'card',
    when: (signal) => signal.type === 'contract-unlocked' && signal.contractId === 'e7-relay-valley',
    lines: ['One made citizen to each answering jack, and only ever where somebody asked us first.', "The chief's rescue ledger grew a second column in her own hand: SENT. The tavern hung a little map with brass pins in it."],
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
    // lore/STORYBOOK.md:407,452; tavern-tale shape mirrors e3-tavern-twins-defect at lines 485-494.
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
    // lore/STORYBOOK.md:453,408; the exit hook toward E8, in the shape of e5-deep-reactor-horizon at lines 819-827.
    id: 'e7-starship-countdown',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    presentation: 'card',
    lines: ['The last frequency went quiet, so the chief patched it through the whole ring once and left that jack lit for good.', 'Then the Starship stood on the pad with our newest citizens aboard, and she counted the ground to the sky: five, four, three, two.'],
  },
];

export const STORY_RUNTIME_BEATS: readonly RuntimeStoryBeat[] = RELEASE_E1
  ? [...STORY_BEATS, ...LEDGER_STORY_BEATS]
  : [...STORY_BEATS, ...E2_STORY_BEATS, ...LEDGER_STORY_BEATS];
