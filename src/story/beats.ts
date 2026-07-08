import type { StorySignal } from './signals';
import type { StorySpeakerId } from './speakers';

export type StoryBeat = {
  id: string;
  trigger: StorySignal['type'];
  speaker: StorySpeakerId;
  lines: readonly string[] | ((signal: StorySignal) => readonly string[]);
  pointer?: string;
  oncePerProfile: boolean;
  when?: (signal: StorySignal) => boolean;
  seenKey?: (signal: StorySignal) => string;
};

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
    lines: ['First contract is on the board.', 'The Claim is where every ledger starts.'],
  },
  {
    id: 'first-loss',
    trigger: 'building-lost',
    speaker: 'clerk',
    oncePerProfile: true,
    lines: ['Timber breaks; ledgers do not.', 'Stand near a ruin with gold to mend it.'],
  },
  {
    id: 'first-victory',
    trigger: 'first-victory',
    speaker: 'elder',
    oncePerProfile: true,
    lines: ['A secured claim buys more than gold.', 'Take a science step before the next trail.'],
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
    id: 'ceiling-reached',
    trigger: 'science-complete',
    speaker: 'elder',
    oncePerProfile: true,
    lines: ['Frontier science is complete.', 'The Steamworks waits for a town to build it.'],
  },
  {
    id: 'stamp-site-found',
    trigger: 'stamp-site-found',
    speaker: 'elder',
    pointer: '[data-testid="stamp-site-fund"]',
    oncePerProfile: true,
    lines: ["The survey's done.", "The Steamworks wants a founder's gold."],
  },
  {
    id: 'board-unlock-generic',
    trigger: 'contract-unlocked',
    speaker: 'tavernkeeper',
    oncePerProfile: true,
    seenKey: (signal) => (signal.type === 'contract-unlocked' ? `board-unlock-generic:${signal.contractId}` : 'board-unlock-generic'),
    lines: (signal) => {
      if (signal.type !== 'contract-unlocked') return ['A new contract opened.', 'Check the board when you are ready.'];
      return [`${signal.contractName} is open.`, signal.ledgerBlurb];
    },
  },
];
