import * as THREE from 'three';
import { FIXED_SIM_STEP_SECONDS } from '../core/Loop';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { EnemyPool } from '../entities/pools';
import { Balance } from '../game/Balance';
import type { Economy } from '../game/Economy';
import {
  TILE_STATE_SCHEMA_VERSION,
  type TileStateEntry,
  type TileStateStore,
} from '../game/TileStateStore';
import type { DecayHandle, DecayScheduler } from './DecaySystem';

export const APPLIANCE_PEN_ENTRY_ID = 'appliance-pen';

const MACHINE_VARIANTS = new Set(['feral_toaster', 'lawn_shepherd']);

export type WrangleState = 'winding-down' | 'exhausted';
export type PenRosterEntry = { variantId: string; count: number };
export type WrangleSuspendSnapshot = {
  incomeElapsed: number;
  incomeGranted: number;
  grantSerial: number;
  active: Array<{
    enemyId: number;
    variantId: string;
    state: WrangleState;
    remainingTicks: number;
    resets: number;
  }>;
};

type ActiveWrangle = {
  enemy: ClaimJumperEnemy;
  variantId: string;
  handle: DecayHandle;
  state: WrangleState;
  resets: number;
};

export class WrangleSystem {
  private readonly active = new Map<number, ActiveWrangle>();
  private readonly roster: PenRosterEntry[];
  private incomeElapsed = 0;
  private incomeGranted = 0;
  private grantSerial = 0;

  constructor(
    private readonly enabled: boolean,
    private readonly contractId: string,
    private readonly decay: DecayScheduler,
    private readonly enemies: EnemyPool,
    private readonly economy: Economy,
    private readonly tileState: TileStateStore,
    private readonly onExhausted: (position: THREE.Vector3) => void,
    private readonly onCaptured: (enemy: ClaimJumperEnemy, penTotal: number) => void,
  ) {
    this.roster = readRoster(tileState.readSnapshot(contractId).entries);
  }

  update(delta: number, at: number): void {
    if (!this.enabled) return;
    for (const entry of this.active.values()) {
      if (entry.enemy.isAlive) continue;
      this.decay.cancel(entry.handle);
      this.active.delete(entry.enemy.id);
    }
    for (const enemy of this.enemies.all) {
      if (enemy.isAlive && this.isMachine(enemy) && !this.active.has(enemy.id)) this.register(enemy);
    }

    const penTotal = this.penTotal();
    if (penTotal === 0) {
      this.incomeElapsed = 0;
      return;
    }
    this.incomeElapsed += delta;
    while (penTotal > 0 && this.incomeElapsed >= Balance.wrangle.penTickSeconds) {
      this.incomeElapsed -= Balance.wrangle.penTickSeconds;
      const amount = Math.min(Balance.wrangle.penGoldPerMachine * penTotal, this.economy.bankCap - this.economy.gold);
      if (amount <= 0) continue;
      const result = this.economy.apply({
        id: `appliance-pen:${Math.round(at * 1000)}:${this.grantSerial++}`,
        at,
        type: 'gold_granted',
        source: 'appliance_pen',
        amount,
      });
      if (result.ok) this.incomeGranted += amount;
    }
  }

  onDamage(enemy: ClaimJumperEnemy, amount: number, died = false): void {
    if (!this.enabled || amount <= 0 || !this.isMachine(enemy)) return;
    const current = this.active.get(enemy.id);
    if (current?.handle) this.decay.cancel(current.handle);
    if (died) {
      this.active.delete(enemy.id);
      return;
    }
    const next = this.register(enemy, (current?.resets ?? 0) + 1);
    if (next) enemy.setAnimationClip('walk');
  }

  powerDown(enemy: ClaimJumperEnemy): boolean {
    if (!this.enabled || !this.isMachine(enemy)) return false;
    const current = this.active.get(enemy.id);
    if (current?.handle) this.decay.cancel(current.handle);
    enemy.restoreBossHull(1);
    this.register(enemy, current?.resets ?? 0, 1, 'exhausted');
    this.onExhausted(enemy.position);
    return true;
  }

  isHarmless(enemy: ClaimJumperEnemy): boolean {
    return this.active.get(enemy.id)?.state === 'exhausted';
  }

  movementMultiplier(enemy: ClaimJumperEnemy): number {
    return this.isHarmless(enemy) ? Balance.wrangle.exhaustedSpeedMultiplier : 1;
  }

  tryCapture(position: THREE.Vector3): boolean {
    if (!this.enabled) return false;
    let closest: ActiveWrangle | null = null;
    let closestSq = Balance.wrangle.captureRadius * Balance.wrangle.captureRadius;
    for (const entry of this.active.values()) {
      if (!entry.enemy.isAlive || entry.state !== 'exhausted') continue;
      const dx = position.x - entry.enemy.position.x;
      const dz = position.z - entry.enemy.position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq > closestSq) continue;
      closest = entry;
      closestSq = distanceSq;
    }
    if (!closest) return false;

    const rosterEntry = this.roster.find((entry) => entry.variantId === closest!.variantId);
    if (rosterEntry) rosterEntry.count += 1;
    else this.roster.push({ variantId: closest.variantId, count: 1 });
    this.roster.sort((left, right) => left.variantId.localeCompare(right.variantId));
    this.persistRoster();
    this.active.delete(closest.enemy.id);
    this.onCaptured(closest.enemy, this.penTotal());
    this.enemies.recycle(closest.enemy);
    return true;
  }

  reset(): void {
    for (const entry of this.active.values()) if (entry.handle) this.decay.cancel(entry.handle);
    this.active.clear();
    this.incomeElapsed = 0;
    this.incomeGranted = 0;
    this.grantSerial = 0;
  }

  stateOf(enemy: ClaimJumperEnemy): WrangleState | null {
    return this.active.get(enemy.id)?.state ?? null;
  }

  captureSuspend(): WrangleSuspendSnapshot {
    return {
      incomeElapsed: this.incomeElapsed,
      incomeGranted: this.incomeGranted,
      grantSerial: this.grantSerial,
      active: this.diagnostics().active.map((entry) => ({ ...entry })),
    };
  }

  restoreSuspend(snapshot: WrangleSuspendSnapshot | null): boolean {
    this.reset();
    if (!snapshot || !this.enabled) return true;
    const valid = snapshot.active.every((saved) => {
      const enemy = this.enemies.all[saved.enemyId];
      return enemy?.isAlive && enemy.variantId === saved.variantId && this.isMachine(enemy);
    });
    if (!valid) return false;
    this.incomeElapsed = snapshot.incomeElapsed;
    this.incomeGranted = snapshot.incomeGranted;
    this.grantSerial = snapshot.grantSerial;
    for (const saved of snapshot.active) {
      const enemy = this.enemies.all[saved.enemyId]!;
      this.register(enemy, saved.resets, saved.remainingTicks, saved.state);
    }
    return true;
  }

  diagnostics() {
    return {
      enabled: this.enabled,
      windDownSeconds: Balance.wrangle.windDownSeconds,
      windDownTicks: windDownTicks(),
      captureRadius: Balance.wrangle.captureRadius,
      exhaustedSpeedMultiplier: Balance.wrangle.exhaustedSpeedMultiplier,
      active: [...this.active.values()]
        .map((entry) => ({
          enemyId: entry.enemy.id,
          variantId: entry.variantId,
          state: entry.state,
          remainingTicks: this.decay.remaining(entry.handle) ?? 0,
          resets: entry.resets,
        }))
        .sort((left, right) => left.enemyId - right.enemyId),
      pen: {
        roster: this.roster.map((entry) => ({ ...entry })),
        total: this.penTotal(),
        tickSeconds: Balance.wrangle.penTickSeconds,
        goldPerMachine: Balance.wrangle.penGoldPerMachine,
        incomeGranted: this.incomeGranted,
      },
    } as const;
  }

  private isMachine(enemy: ClaimJumperEnemy): boolean {
    return enemy.variantId !== null && MACHINE_VARIANTS.has(enemy.variantId);
  }

  private register(
    enemy: ClaimJumperEnemy,
    resets = 0,
    durationTicks = windDownTicks(),
    state: WrangleState = 'winding-down',
  ): ActiveWrangle | null {
    const variantId = enemy.variantId;
    if (!variantId || !MACHINE_VARIANTS.has(variantId)) return null;
    const entry: ActiveWrangle = {
      enemy,
      variantId,
      handle: 0,
      state,
      resets,
    };
    if (state === 'winding-down') {
      entry.handle = this.decay.register({
        id: `wrangle:${enemy.id}:${variantId}`,
        durationTicks: Math.max(1, durationTicks),
        onExpire: () => {
          if (this.active.get(enemy.id) !== entry || !enemy.isAlive) return;
          entry.state = 'exhausted';
          enemy.setAnimationClip('idle');
          this.onExhausted(enemy.position);
        },
      });
    } else {
      enemy.setAnimationClip('idle');
    }
    this.active.set(enemy.id, entry);
    return entry;
  }

  private penTotal(): number {
    return this.roster.reduce((total, entry) => total + entry.count, 0);
  }

  private persistRoster(): void {
    this.tileState.stageWrite(this.contractId, {
      kind: 'sim',
      id: APPLIANCE_PEN_ENTRY_ID,
      payload: { roster: this.roster },
      schemaVersion: TILE_STATE_SCHEMA_VERSION,
    });
    // A capture is a named ceremony: the freed machine must survive an immediate reload.
    this.tileState.commitAtRunEnd();
  }
}

function windDownTicks(): number {
  return Math.round(Balance.wrangle.windDownSeconds / FIXED_SIM_STEP_SECONDS);
}

function readRoster(entries: readonly TileStateEntry[]): PenRosterEntry[] {
  const payload = entries.find((entry) => entry.kind === 'sim' && entry.id === APPLIANCE_PEN_ENTRY_ID)?.payload;
  if (!isRecord(payload) || !Array.isArray(payload.roster)) return [];
  const roster: PenRosterEntry[] = [];
  for (const entry of payload.roster) {
    if (!isRecord(entry) || typeof entry.variantId !== 'string' || entry.variantId.length === 0 || entry.variantId.length > 64) continue;
    if (!Number.isSafeInteger(entry.count) || (entry.count as number) <= 0) continue;
    const existing = roster.find((candidate) => candidate.variantId === entry.variantId);
    if (existing) existing.count += entry.count as number;
    else roster.push({ variantId: entry.variantId, count: entry.count as number });
  }
  return roster.sort((left, right) => left.variantId.localeCompare(right.variantId));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
