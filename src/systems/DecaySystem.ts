import type { EventBus } from '../core/EventBus';

export type DecayHandle = number;

export type DecayRegistration = Readonly<{
  id: string;
  durationTicks: number;
  paused?: boolean;
  zone?: string;
  onExpire?: () => void;
}>;

export type DecayEvent =
  | Readonly<{
      type: 'decay_registered';
      action: 'registered' | 'paused' | 'resumed';
      tick: number;
      handle: DecayHandle;
      id: string;
      durationTicks: number;
      remainingTicks: number;
      paused: boolean;
      zone: string | null;
      auraFactor: number;
    }>
  | Readonly<{
      type: 'decay_registered';
      action: 'aura_modified';
      tick: number;
      zone: string;
      auraFactor: number;
    }>
  | Readonly<{
      type: 'decay_expired';
      tick: number;
      handle: DecayHandle;
      id: string;
      reason: 'expired' | 'cancelled';
    }>;

type DecayEntry = {
  handle: DecayHandle;
  id: string;
  durationTicks: number;
  remainingTicks: number;
  paused: boolean;
  zone: string | null;
  onExpire?: () => void;
};

export class DecayScheduler {
  private readonly entries = new Map<DecayHandle, DecayEntry>();
  private readonly auraModifiers = new Map<string, number>();
  private readonly log: DecayEvent[] = [];
  private nextHandle = 1;
  private currentTick = 0;

  constructor(private readonly events: EventBus) {}

  get eventLog(): readonly DecayEvent[] {
    return this.log;
  }

  register(registration: DecayRegistration): DecayHandle {
    const id = registration.id.trim();
    if (!id) throw new Error('Decay id must not be empty.');
    if (!Number.isInteger(registration.durationTicks) || registration.durationTicks <= 0) {
      throw new Error('Decay durationTicks must be a positive integer.');
    }
    const zone = registration.zone?.trim() || null;
    const entry: DecayEntry = {
      handle: this.nextHandle++,
      id,
      durationTicks: registration.durationTicks,
      remainingTicks: registration.durationTicks,
      paused: registration.paused === true,
      zone,
      onExpire: registration.onExpire,
    };
    this.entries.set(entry.handle, entry);
    this.emitState(entry, 'registered');
    return entry.handle;
  }

  cancel(handle: DecayHandle): boolean {
    const entry = this.entries.get(handle);
    if (!entry) return false;
    this.entries.delete(handle);
    this.emit({ type: 'decay_expired', tick: this.currentTick, handle, id: entry.id, reason: 'cancelled' });
    return true;
  }

  remaining(handle: DecayHandle): number | null {
    return this.entries.get(handle)?.remainingTicks ?? null;
  }

  fraction(handle: DecayHandle): number | null {
    const entry = this.entries.get(handle);
    return entry ? entry.remainingTicks / entry.durationTicks : null;
  }

  setPaused(handle: DecayHandle, paused: boolean): boolean {
    const entry = this.entries.get(handle);
    if (!entry) return false;
    if (entry.paused !== paused) {
      entry.paused = paused;
      this.emitState(entry, paused ? 'paused' : 'resumed');
    }
    return true;
  }

  setAuraModifier(zone: string, factor: number): void {
    const normalizedZone = zone.trim();
    if (!normalizedZone) throw new Error('Decay aura zone must not be empty.');
    if (!Number.isFinite(factor) || factor <= 0) throw new Error('Decay aura factor must be positive.');
    this.auraModifiers.set(normalizedZone, factor);
    this.emit({
      type: 'decay_registered',
      action: 'aura_modified',
      tick: this.currentTick,
      zone: normalizedZone,
      auraFactor: factor,
    });
  }

  tick(): void {
    this.currentTick += 1;
    if (this.entries.size === 0) return;
    for (const entry of [...this.entries.values()]) {
      if (entry.paused || !this.entries.has(entry.handle)) continue;
      entry.remainingTicks = Math.max(0, entry.remainingTicks - this.auraFactor(entry));
      if (entry.remainingTicks > 1e-9) continue;
      this.entries.delete(entry.handle);
      this.emit({
        type: 'decay_expired',
        tick: this.currentTick,
        handle: entry.handle,
        id: entry.id,
        reason: 'expired',
      });
      entry.onExpire?.();
    }
  }

  reset(tick = 0): void {
    this.entries.clear();
    this.auraModifiers.clear();
    this.log.length = 0;
    this.nextHandle = 1;
    this.currentTick = tick;
  }

  diagnostics() {
    return { active: this.entries.size, events: this.log } as const;
  }

  private auraFactor(entry: DecayEntry): number {
    return entry.zone ? (this.auraModifiers.get(entry.zone) ?? 1) : 1;
  }

  private emitState(entry: DecayEntry, action: 'registered' | 'paused' | 'resumed'): void {
    this.emit({
      type: 'decay_registered',
      action,
      tick: this.currentTick,
      handle: entry.handle,
      id: entry.id,
      durationTicks: entry.durationTicks,
      remainingTicks: entry.remainingTicks,
      paused: entry.paused,
      zone: entry.zone,
      auraFactor: this.auraFactor(entry),
    });
  }

  private emit(event: DecayEvent): void {
    this.log.push(event);
    this.events.emit(event);
  }
}
