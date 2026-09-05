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

export const STORY_RUNTIME_BEATS: readonly RuntimeStoryBeat[] = RELEASE_E1
  ? [...STORY_BEATS, ...LEDGER_STORY_BEATS]
  : [...STORY_BEATS, ...E2_STORY_BEATS, ...LEDGER_STORY_BEATS];
