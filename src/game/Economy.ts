import { Balance } from './Balance';

export type BuildSink = 'build_sentry_beacon' | `build_${string}`;

export type EconomyEventBase = {
  id: string;
  at: number;
};

export type EconomyEvent = EconomyEventBase &
  (
    | { type: 'gold_panned'; nodeId: string; amount: number }
    | { type: 'gold_sluiced'; sluiceId: string; amount: number }
    | { type: 'gold_capped'; amount: 0 }
    | { type: 'gold_granted'; source: 'upgrade_assay' | 'debug'; amount: number }
    | { type: 'gold_spent'; sink: BuildSink; amount: number }
    | { type: 'run_reset' }
  );

export type EconomyState = {
  gold: number;
  bankCap: number;
};

export type EconomySummary = {
  panned: number;
  granted: number;
  spent: number;
  beaconsBuilt: number;
};

export type EconomyApplyResult =
  | { ok: true; gold: number }
  | { ok: false; reason: 'OUT_OF_RESOURCES' | 'BANK_CAP' };

export const initialEconomyState: EconomyState = {
  gold: 0,
  bankCap: Balance.economy.bankCap,
};

export function reduce(state: EconomyState, event: EconomyEvent): EconomyState {
  switch (event.type) {
    case 'gold_panned':
      return { ...state, gold: state.gold + event.amount };
    case 'gold_sluiced':
      return { ...state, gold: state.gold + event.amount };
    case 'gold_capped':
      return state;
    case 'gold_granted':
      return { ...state, gold: state.gold + event.amount };
    case 'gold_spent':
      return { ...state, gold: state.gold - event.amount };
    case 'run_reset':
      return { ...state, gold: 0 };
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
  private readonly capSources = new Map<string, number>();

  constructor(private readonly logCapacity: number = Balance.economy.logCapacity) {}

  get gold(): number {
    return this.current.gold;
  }

  get state(): EconomyState {
    return { gold: this.current.gold, bankCap: this.bankCap };
  }

  get bankCap(): number {
    let bonus = 0;
    for (const amount of this.capSources.values()) bonus += amount;
    return Balance.economy.bankCap + bonus;
  }

  get log(): readonly EconomyEvent[] {
    return this.events.slice();
  }

  apply(event: EconomyEvent): EconomyApplyResult {
    if (event.type === 'gold_spent' && event.amount > this.current.gold) {
      return { ok: false, reason: 'OUT_OF_RESOURCES' };
    }
    if (isBankedIncome(event) && !this.canReceiveIncome(event.amount)) {
      return { ok: false, reason: 'BANK_CAP' };
    }

    this.current = reduce(this.current, event);
    this.current.bankCap = this.bankCap;
    this.events.push(event);
    if (this.events.length > this.logCapacity) {
      this.events.splice(0, this.events.length - this.logCapacity);
    }
    return { ok: true, gold: this.current.gold };
  }

  canReceiveIncome(amount: number): boolean {
    return amount <= 0 || this.current.gold + amount <= this.bankCap;
  }

  addCapSource(id: string, amount: number): void {
    this.capSources.set(id, amount);
    this.current.bankCap = this.bankCap;
  }

  removeCapSource(id: string): void {
    this.capSources.delete(id);
    this.current.bankCap = this.bankCap;
  }
}

function isBankedIncome(event: EconomyEvent): event is Extract<EconomyEvent, { type: 'gold_panned' | 'gold_sluiced' }> {
  return event.type === 'gold_panned' || event.type === 'gold_sluiced';
}
