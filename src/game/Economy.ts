import { Balance } from './Balance';

export type BuildSink = 'build_sentry_beacon' | `build_${string}`;

export type EconomyEventBase = {
  id: string;
  at: number;
};

export type EconomyEvent = EconomyEventBase &
  (
    | { type: 'gold_panned'; nodeId: string; amount: number }
    | { type: 'gold_granted'; source: 'upgrade_assay' | 'debug'; amount: number }
    | { type: 'gold_spent'; sink: BuildSink; amount: number }
    | { type: 'run_reset' }
  );

export type EconomyState = {
  gold: number;
};

export type EconomySummary = {
  panned: number;
  granted: number;
  spent: number;
  beaconsBuilt: number;
};

export type EconomyApplyResult = { ok: true; gold: number } | { ok: false; reason: 'OUT_OF_RESOURCES' };

export const initialEconomyState: EconomyState = {
  gold: 0,
};

export function reduce(state: EconomyState, event: EconomyEvent): EconomyState {
  switch (event.type) {
    case 'gold_panned':
      return { gold: state.gold + event.amount };
    case 'gold_granted':
      return { gold: state.gold + event.amount };
    case 'gold_spent':
      return { gold: state.gold - event.amount };
    case 'run_reset':
      return { gold: 0 };
  }
}

export function summarizeLog(log: readonly EconomyEvent[]): EconomySummary {
  const summary: EconomySummary = { panned: 0, granted: 0, spent: 0, beaconsBuilt: 0 };
  for (const event of log) {
    if (event.type === 'run_reset') {
      summary.panned = 0;
      summary.granted = 0;
      summary.spent = 0;
      summary.beaconsBuilt = 0;
      continue;
    }
    if (event.type === 'gold_panned') summary.panned += event.amount;
    if (event.type === 'gold_granted') summary.granted += event.amount;
    if (event.type === 'gold_spent') {
      summary.spent += event.amount;
      if (event.sink === 'build_sentry_beacon') summary.beaconsBuilt += 1;
    }
  }
  return summary;
}

export class Economy {
  private current: EconomyState = { ...initialEconomyState };
  private readonly events: EconomyEvent[] = [];

  constructor(private readonly logCapacity: number = Balance.economy.logCapacity) {}

  get gold(): number {
    return this.current.gold;
  }

  get state(): EconomyState {
    return { ...this.current };
  }

  get log(): readonly EconomyEvent[] {
    return this.events.slice();
  }

  apply(event: EconomyEvent): EconomyApplyResult {
    if (event.type === 'gold_spent' && event.amount > this.current.gold) {
      return { ok: false, reason: 'OUT_OF_RESOURCES' };
    }

    this.current = reduce(this.current, event);
    this.events.push(event);
    if (this.events.length > this.logCapacity) {
      this.events.splice(0, this.events.length - this.logCapacity);
    }
    return { ok: true, gold: this.current.gold };
  }
}
