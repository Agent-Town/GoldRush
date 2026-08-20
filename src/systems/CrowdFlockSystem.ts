import { Balance } from '../game/Balance';
import type { ContractManifest } from '../meta/ContractFamilies';
import type { DayNightSnapshot } from './DayNightCycle';

/**
 * THE CROWD FLOCKS — e3-fairground's escort ring, the last unconsumed field in Voltage.
 *
 * RATIFIED DESIGN (`specs/agent-play/door-completion-sheet.md` item A1, owner 2026-08-20:
 * "Group 1: approved (with any tweaks)"), transcribed rather than invented:
 *
 *   "three festival flocks cross the midway (south gate -> the wheel plaza and back), one
 *    crossing per night cycle; a flock takes fright if an enemy enters its escort radius (7)
 *    -- frightened flocks scatter home and the crossing fails. Objective: all three flocks
 *    complete a crossing AND the wheel is spinning at secureWave 12.
 *    DEFAULTS: flock speed = hero walk x 0.6; scatter resets next night."
 *
 * EVERY NUMBER BELOW IS DECLARED OR RATIFIED — nothing is authored here:
 *   count / escortRadius  <- `twist.fairground.crowdFlocks` (3 / 7)
 *   home                  <- the `heroStart` stake (`fair-gate`, 0/-30): the south gate
 *   plaza waypoints       <- the fairground's own attractions, `wheel` then `pavilions`
 *   speed                 <- `Balance.hero.speed * 0.6` = 3.6 u/s (the ratified default; the
 *                            hero's WALK is `Balance.hero.speed`, not the agent's `moveSpeed`)
 *   the night clock       <- `DayNightSnapshot.cycle` + `phase`, the cycle the contract
 *                            already declares (`twist.dayNightCycle`, period 24s)
 *
 * GATED ON THE FIELD, NOT THE BLOCK (F-1471-1's lesson, learned on the canyon-connect latch):
 * `create()` keys on `twist.fairground.crowdFlocks`, so a fairground that ever declares a wheel
 * without flocks gets NO system — and therefore no objective it can never satisfy.
 *
 * Planar, deterministic, RNG-free: the same ticks in produce the same crossings out, which is
 * what lets the headless engine and the browser agree about a secure.
 */

/**
 * Ratified default: "flock speed = hero walk x 0.6". Exported so `MechanicsManifest` can publish
 * the number the consumer actually uses rather than a second copy of it (AP-11: the manifest reads
 * the consumer, never the declaration).
 */
export const FLOCK_SPEED_MULT = 0.6;
/**
 * Lane spacing at the gate = one escort DIAMETER, so no two crowds' declared rings overlap and
 * one outlaw can never frighten two flocks at once. Derived from `escortRadius`, not authored.
 */
export const LANE_SPACING_RADII = 2;
/** A flock has "arrived" inside half a metre; one step at flock speed is ~0.1. */
const ARRIVE_EPSILON = 0.5;

export type CrowdFlockPhase = 'home' | 'outbound' | 'returning' | 'scattering';

export type CrowdFlockWaypoint = Readonly<{ id: string; x: number; z: number }>;

export type CrowdFlockState = Readonly<{
  id: string;
  x: number;
  z: number;
  phase: CrowdFlockPhase;
  destination: string;
  attempts: number;
  crossings: number;
  frights: number;
  crossed: boolean;
}>;

export type CrowdFlockDiagnostics = Readonly<{
  enabled: boolean;
  count: number;
  escortRadius: number;
  speed: number;
  home: Readonly<{ x: number; z: number }>;
  night: number;
  attempts: number;
  completions: number;
  frights: number;
  allCrossed: boolean;
  flocks: readonly CrowdFlockState[];
}>;

/** The only thing a flock needs to know about a threat: is it alive, and where. */
export type CrowdFlockThreat = { readonly isAlive: boolean; readonly position: { readonly x: number; readonly z: number } };

type Flock = {
  id: string;
  x: number;
  z: number;
  homeX: number;
  homeZ: number;
  plaza: CrowdFlockWaypoint;
  phase: CrowdFlockPhase;
  attempts: number;
  crossings: number;
  frights: number;
};

export class CrowdFlockSystem {
  private readonly flocks: Flock[];
  private night = -1;
  private attempts = 0;
  private completions = 0;
  private frights = 0;

  private constructor(
    readonly count: number,
    readonly escortRadius: number,
    readonly speed: number,
    private readonly home: Readonly<{ x: number; z: number }>,
    plaza: readonly CrowdFlockWaypoint[],
  ) {
    this.flocks = Array.from({ length: count }, (_, index) => this.birth(index, plaza));
  }

  /**
   * Mirrors the browser's own construction gate: a fairground WITH a declared `crowdFlocks`
   * field, and nothing else. Keys on the field (F-1471-1), never on `twist.fairground`.
   */
  static create(contract: ContractManifest): CrowdFlockSystem | null {
    const fairground = contract.twist.fairground;
    const declared = fairground?.crowdFlocks;
    if (!fairground || !declared || declared.count <= 0) return null;
    const stake = contract.tileParams.stakeMarkers?.find((marker) => marker.heroStart);
    if (!stake) return null;
    // The plaza's own attractions, sorted WEST to EAST so lane i walks to landmark i: the three
    // crowds fan out to three different draws instead of crossing each other's path on the way.
    const plaza: CrowdFlockWaypoint[] = [
      { id: fairground.wheel.nodeId, x: fairground.wheel.x, z: fairground.wheel.z },
      ...fairground.pavilions.map((pavilion) => ({ id: pavilion.id, x: pavilion.x, z: pavilion.z })),
    ].sort((left, right) => left.x - right.x || compare(left.id, right.id));
    return new CrowdFlockSystem(
      Math.floor(declared.count),
      declared.escortRadius,
      // Rounded at construction, not at the reader: this number reaches a determinism hash and an
      // agent-facing manifest, and `6 * 0.6` is 3.5999999999999996 in IEEE-754.
      Number((Balance.hero.speed * FLOCK_SPEED_MULT).toFixed(3)),
      { x: stake.x, z: stake.z },
      plaza,
    );
  }

  /**
   * One fixed step. `dayNight` is the cycle sample the engine already keeps (both engines pass
   * their own field, so both read the same tick's phase); `threats` is every enemy in the pool —
   * only ENEMIES frighten a crowd, so the hero, the Prospector and the works are never passed.
   */
  update(delta: number, dayNight: DayNightSnapshot | null, threats: readonly CrowdFlockThreat[]): void {
    const step = Math.max(0, delta) * this.speed;
    if (dayNight && dayNight.phase === 'dark' && dayNight.cycle > this.night) {
      this.night = dayNight.cycle;
      for (const flock of this.flocks) {
        if (flock.phase !== 'home') continue;
        flock.phase = 'outbound';
        flock.attempts += 1;
        this.attempts += 1;
      }
    }
    for (const flock of this.flocks) {
      if (flock.phase === 'home') continue;
      if (flock.phase !== 'scattering' && this.frightened(flock, threats)) {
        flock.phase = 'scattering';
        flock.frights += 1;
        this.frights += 1;
      }
      const target = flock.phase === 'outbound' ? flock.plaza : { x: flock.homeX, z: flock.homeZ };
      if (advance(flock, target, step)) this.arrive(flock);
    }
  }

  get diagnostics(): CrowdFlockDiagnostics {
    return {
      enabled: true,
      count: this.count,
      escortRadius: this.escortRadius,
      speed: this.speed,
      home: this.home,
      night: this.night,
      attempts: this.attempts,
      completions: this.completions,
      frights: this.frights,
      allCrossed: this.allCrossed,
      flocks: this.flocks.map((flock) => ({
        id: flock.id,
        x: flock.x,
        z: flock.z,
        phase: flock.phase,
        destination: flock.plaza.id,
        attempts: flock.attempts,
        crossings: flock.crossings,
        frights: flock.frights,
        crossed: flock.crossings > 0,
      })),
    };
  }

  /**
   * Stable event-log slice: world positions are unrounded floats mid-walk, and a raw float in a
   * determinism hash is a coin-flip across engines. Rounds them the way `E9CanalSocket` rounds
   * its dust devil, and drops nothing else.
   */
  get simulationSnapshot(): unknown {
    const { flocks, ...rest } = this.diagnostics;
    return {
      ...rest,
      flocks: flocks.map(({ x, z, ...flock }) => ({ ...flock, x: round3(x), z: round3(z) })),
    };
  }

  /** THE OBJECTIVE half of the secure latch: every flock has completed at least one crossing. */
  get allCrossed(): boolean {
    return this.flocks.every((flock) => flock.crossings > 0);
  }

  /** A fresh run starts the fair over: nobody has crossed, and the first night launches again. */
  reset(): void {
    this.night = -1;
    this.attempts = 0;
    this.completions = 0;
    this.frights = 0;
    for (const flock of this.flocks) {
      flock.x = flock.homeX;
      flock.z = flock.homeZ;
      flock.phase = 'home';
      flock.attempts = 0;
      flock.crossings = 0;
      flock.frights = 0;
    }
  }

  private birth(index: number, plaza: readonly CrowdFlockWaypoint[]): Flock {
    const destination = plaza[index % plaza.length]!;
    // THE GATE LINE. Each crowd waits on the midway directly south of the attraction it came for
    // and walks straight to it, so the three lanes never cross and the two flank lanes stay clear
    // of the scrum at the stake. The gate's own z is the line; the landmark's x is the lane — both
    // DECLARED, so no lane coordinate is authored here. Only when a fairground declares more
    // flocks than landmarks does the fallback spacing below apply.
    const overflow = Math.floor(index / plaza.length);
    const lane = overflow * this.escortRadius * LANE_SPACING_RADII;
    const homeX = destination.x + lane;
    return {
      id: `flock-${index + 1}`,
      x: homeX,
      z: this.home.z,
      homeX,
      homeZ: this.home.z,
      plaza: destination,
      phase: 'home',
      attempts: 0,
      crossings: 0,
      frights: 0,
    };
  }

  private frightened(flock: Flock, threats: readonly CrowdFlockThreat[]): boolean {
    const radiusSq = this.escortRadius * this.escortRadius;
    for (const threat of threats) {
      if (!threat.isAlive) continue;
      const dx = threat.position.x - flock.x;
      const dz = threat.position.z - flock.z;
      if (dx * dx + dz * dz <= radiusSq) return true;
    }
    return false;
  }

  private arrive(flock: Flock): void {
    if (flock.phase === 'outbound') {
      flock.phase = 'returning';
      return;
    }
    // A frightened crowd reaching home gets no credit — that is what "the crossing fails" means.
    if (flock.phase === 'returning') {
      flock.crossings += 1;
      this.completions += 1;
    }
    flock.phase = 'home';
  }
}

function advance(flock: Flock, target: Readonly<{ x: number; z: number }>, step: number): boolean {
  const dx = target.x - flock.x;
  const dz = target.z - flock.z;
  const distance = Math.hypot(dx, dz);
  if (distance <= Math.max(step, ARRIVE_EPSILON)) {
    flock.x = target.x;
    flock.z = target.z;
    return true;
  }
  flock.x += (dx / distance) * step;
  flock.z += (dz / distance) * step;
  return false;
}

function round3(value: number): number {
  return Number(value.toFixed(3));
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
