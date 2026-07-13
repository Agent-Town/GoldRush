import type { RuntimeStorySignal } from './signals';
import type { StorySpeakerId } from './speakers';
import { hasStoryBeatSeen } from './seenState';
import { hasRocketCartCaptured } from '../game/Medals';

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

export const STORY_RUNTIME_BEATS: readonly RuntimeStoryBeat[] = [...STORY_BEATS, ...E2_STORY_BEATS, ...LEDGER_STORY_BEATS];
