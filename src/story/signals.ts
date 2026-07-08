export type StorySignal =
  | { type: 'first-boot' }
  | { type: 'town-named'; townName: string }
  | { type: 'board-first-open' }
  | { type: 'wave-complete'; wave: number }
  | { type: 'first-victory' }
  | { type: 'science-threshold'; threshold: number }
  | { type: 'science-complete' }
  | { type: 'stamp-site-found' }
  | { type: 'contract-unlocked'; contractId: string; contractName: string; ledgerBlurb: string }
  | { type: 'rung-promotion'; level: number }
  | { type: 'rung-denied-toggle' }
  | { type: 'building-lost' }
  | { type: 'xp-collected' };

export const STORY_SIGNAL_REGISTRY = [
  'first-boot',
  'town-named',
  'board-first-open',
  'wave-complete',
  'first-victory',
  'science-threshold',
  'science-complete',
  'stamp-site-found',
  'contract-unlocked',
  'rung-promotion',
  'rung-denied-toggle',
  'building-lost',
  'xp-collected',
] as const;

type StorySignalListener = (signal: StorySignal) => void;

const listeners = new Set<StorySignalListener>();

export function onStorySignal(listener: StorySignalListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitStorySignal(signal: StorySignal): void {
  for (const listener of listeners) listener(signal);
}
