export type StorySignal =
  | { type: 'first-boot' }
  | { type: 'town-named'; townName: string }
  | { type: 'town-growth-seen'; buildingId: 'general_store' | 'chapel'; buildingName: string }
  | { type: 'board-first-open' }
  | { type: 'wave-complete'; wave: number }
  | { type: 'first-victory' }
  | { type: 'science-threshold'; threshold: number }
  | { type: 'science-complete'; postscriptOnly?: boolean; afterStory?: () => void }
  | { type: 'stamp-site-found' }
  | { type: 'run-return-town'; result: 'secured' | 'overrun' }
  | { type: 'contract-unlocked'; contractId: string; contractName: string; ledgerBlurb: string }
  | { type: 'rung-promotion'; level: number }
  | { type: 'rung-denied-toggle' }
  | { type: 'building-lost' }
  | { type: 'xp-collected' };

export type BossStorySignal =
  | { type: 'boss-arrival'; contractId: string; contractName: string; edge?: 'north' | 'south' | 'east' | 'west' }
  | { type: 'boss-defeat'; contractId: string; contractName: string };

export type LedgerStorySignal = { type: 'ledger-page'; entryId: string; entryName: string };

export type EpochStorySignal = { type: 'epoch-activated'; epochId: string; displayName: string; postscriptOnly?: boolean };

export type RuntimeStorySignal = StorySignal | BossStorySignal | LedgerStorySignal | EpochStorySignal;

export const STORY_SIGNAL_REGISTRY = [
  'first-boot',
  'town-named',
  'town-growth-seen',
  'board-first-open',
  'wave-complete',
  'first-victory',
  'science-threshold',
  'science-complete',
  'stamp-site-found',
  'run-return-town',
  'contract-unlocked',
  'rung-promotion',
  'rung-denied-toggle',
  'building-lost',
  'xp-collected',
] as const;

export const STORY_RUNTIME_SIGNAL_REGISTRY = [...STORY_SIGNAL_REGISTRY, 'boss-arrival', 'boss-defeat', 'ledger-page', 'epoch-activated'] as const;

type StorySignalListener = (signal: RuntimeStorySignal) => void;

const listeners = new Set<StorySignalListener>();

export function onStorySignal(listener: StorySignalListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitStorySignal(signal: RuntimeStorySignal): void {
  for (const listener of listeners) listener(signal);
}
