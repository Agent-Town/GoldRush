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
  // F-SS06-2: the return knows WHICH map it returned from. Optional because the town can be opened
  // without a board contract (`TownScene` option `initialBoardContractId?`, src/town/TownScene.ts:432);
  // a beat that ties itself to one map must therefore compare, never assume.
  | { type: 'run-return-town'; result: 'secured' | 'overrun'; contractId?: string }
  | { type: 'contract-unlocked'; contractId: string; contractName: string; ledgerBlurb: string }
  | { type: 'rung-promotion'; level: number }
  | { type: 'rung-denied-toggle' }
  | { type: 'building-lost' }
  | { type: 'xp-collected' };

export type BossStorySignal =
  | { type: 'boss-arrival'; contractId: string; contractName: string; edge?: 'north' | 'south' | 'east' | 'west' }
  // F-SS09-3 / F-SS10-1 / F-SS11-1: `boss-arrival` says a boss is here and `boss-defeat` says it is
  // over; between them the storybook stages ACTS, and nothing carried them. `boss` names the machine
  // (`salvage-claw`, `old-digger`, `the-quiet`), `act` names the transition its own system observes.
  // Presentation only: no listener may drive the sim from it (see StoryRuntime, the sole consumer).
  | { type: 'boss-act'; contractId: string; boss: string; act: string }
  | { type: 'boss-defeat'; contractId: string; contractName: string };

/**
 * The lifecycle hook a component-boss system reports through. The systems know their own acts and
 * nothing else; the caller (Game) owns the contract identity, so a boss stays ignorant of the map
 * it stands on and no system has to hardcode a contract id to tell its story.
 */
export type BossStoryEmitter = Readonly<{
  arrival: () => void;
  act: (act: string) => void;
  defeat: () => void;
}>;

/** Builds a boss's emitter. `contract` is read at emit time: a run can change contract, the boss cannot. */
export function bossStoryEmitter(boss: string, contract: () => { id: string; name: string }): BossStoryEmitter {
  return {
    arrival: () => {
      const { id, name } = contract();
      emitStorySignal({ type: 'boss-arrival', contractId: id, contractName: name });
    },
    act: (act: string) => emitStorySignal({ type: 'boss-act', contractId: contract().id, boss, act }),
    defeat: () => {
      const { id, name } = contract();
      emitStorySignal({ type: 'boss-defeat', contractId: id, contractName: name });
    },
  };
}

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

export const STORY_RUNTIME_SIGNAL_REGISTRY = [...STORY_SIGNAL_REGISTRY, 'boss-arrival', 'boss-act', 'boss-defeat', 'ledger-page', 'epoch-activated'] as const;

type StorySignalListener = (signal: RuntimeStorySignal) => void;

const listeners = new Set<StorySignalListener>();

export function onStorySignal(listener: StorySignalListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitStorySignal(signal: RuntimeStorySignal): void {
  for (const listener of listeners) listener(signal);
}
