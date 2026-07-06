import { Balance } from './Balance';
import type { BuildableId } from './buildables';

export type BuildSink = 'build_sentry_beacon' | `build_${string}` | `repair_${BuildableId}` | `upgrade_${BuildableId}`;

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
    | { type: 'gold_granted'; source: 'demolish'; amount: number; buildCost?: number }
    | { type: 'gold_stolen'; amount: number }
    | { type: 'gold_reclaimed'; amount: number }
    | { type: 'gold_spent'; sink: BuildSink; amount: number }
    | { type: 'run_reset' }
  );

export type EconomyState = {
  gold: number;
  bankCap: number;
};

export type EconomySummary = {
  panned: number;
  sluiced: number;
  granted: number;
  stolen: number;
  reclaimed: number;
  spent: number;
  baseValue: number;
  buildingsBuilt: number;
  beaconsBuilt: number;
  repairSpent: number;
  repairs: number;
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
    case 'gold_stolen':
      return { ...state, gold: state.gold - event.amount };
    case 'gold_reclaimed':
      return { ...state, gold: state.gold + event.amount };
    case 'gold_spent':
      return { ...state, gold: state.gold - event.amount };
    case 'run_reset':
      return { ...state, gold: 0 };
  }
}

export function summarizeLog(log: readonly EconomyEvent[]): EconomySummary {
  const summary: EconomySummary = {
    panned: 0,
    sluiced: 0,
    granted: 0,
    stolen: 0,
    reclaimed: 0,
    spent: 0,
    baseValue: 0,
    buildingsBuilt: 0,
    beaconsBuilt: 0,
    repairSpent: 0,
    repairs: 0,
  };
  let standingBaseValue = 0;
  for (const event of log) {
    if (event.type === 'run_reset') {
      summary.panned = 0;
      summary.sluiced = 0;
      summary.granted = 0;
      summary.stolen = 0;
      summary.reclaimed = 0;
      summary.spent = 0;
      summary.baseValue = 0;
      summary.buildingsBuilt = 0;
      summary.beaconsBuilt = 0;
      summary.repairSpent = 0;
      summary.repairs = 0;
      standingBaseValue = 0;
      continue;
    }
    if (event.type === 'gold_panned') summary.panned += event.amount;
    if (event.type === 'gold_sluiced') summary.sluiced += event.amount;
    if (event.type === 'gold_granted') summary.granted += event.amount;
    if (event.type === 'gold_stolen') summary.stolen += event.amount;
    if (event.type === 'gold_reclaimed') summary.reclaimed += event.amount;
    if (event.type === 'gold_spent') {
      summary.spent += event.amount;
      if (event.sink.startsWith('build_')) {
        standingBaseValue += event.amount;
        summary.baseValue = Math.max(summary.baseValue, standingBaseValue);
        summary.buildingsBuilt += 1;
      }
      if (event.sink.startsWith('upgrade_')) {
        standingBaseValue += event.amount;
        summary.baseValue = Math.max(summary.baseValue, standingBaseValue);
      }
      if (event.sink === 'build_sentry_beacon') summary.beaconsBuilt += 1;
      if (event.sink.startsWith('repair_')) {
        summary.repairSpent += event.amount;
        summary.repairs += 1;
      }
    }
    if (event.type === 'gold_granted' && event.source === 'demolish') {
      standingBaseValue = Math.max(0, standingBaseValue - (cleanPositiveNumber(event.buildCost) ?? event.amount));
    }
  }
  return summary;
}

function cleanPositiveNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
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
    if (event.type === 'gold_stolen' && event.amount > this.current.gold) {
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

function isBankedIncome(
  event: EconomyEvent,
): event is Extract<EconomyEvent, { type: 'gold_panned' | 'gold_sluiced' | 'gold_reclaimed' }> {
  return event.type === 'gold_panned' || event.type === 'gold_sluiced' || event.type === 'gold_reclaimed';
}
