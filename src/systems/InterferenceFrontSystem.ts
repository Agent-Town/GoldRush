import type { ContractManifest } from '../meta/ContractFamilies';
import type { SuppressibleSystem } from './SignalSuppression';

/**
 * A5 — THE INTERFERENCE FRONT (`specs/agent-play/door-completion-sheet.md:16`, RATIFIED
 * 2026-08-20). `e7-relay-rush` declares a front that "crosses the map on a schedule and mutes
 * everything it swallows", a `relayTarget` of `"N"`, and four 10x10 relay-site `buildZones` on
 * the north ridge. This file is the whole consumer: the schedule, the mute, the relay-site
 * lighting, and the objective latch.
 *
 * SHAPE COPIED FROM `SignalSuppression`/`ProbeRecovery`/`LowOrbitSystem` ON PURPOSE: private
 * ctor + `create()` read off the CONTRACT (never the epoch), refusal counters,
 * presentation-stripped diagnostics. Both engines construct one per run and read it at their
 * own gate sites, so the browser and `HeadlessContractSim` cannot disagree about where the wall
 * is or which relays are lit.
 *
 * IT IMPORTS NO RENDER CODE, AND THAT IS A LAW HERE RATHER THAN A PREFERENCE. F-A8-7: a module
 * both engines construct dragged `three`/DOM modules into the headless collection graph and made
 * the WHOLE suite uncollectable. The only imports above are two TYPES. The browser's band is
 * drawn by `Game.ts` from the values this class publishes (`bandCenterX`, `band`), never here.
 *
 * REUSING A4 RATHER THAN RE-INVENTING IT. What a muted zone switches off is exactly the
 * vocabulary `SignalSuppression` already established — `drones | playbooks | relayChains` — so
 * this consumer imports that type and answers the same question with a POSITION added:
 * `SignalSuppression.refuse(system)` asks "is this system off on this contract?", and
 * `InterferenceFront.refuse(system, at)` asks "is this system off AT THIS SPOT, right now?".
 * Same off-switch semantics, same counted-refusal discipline, same kebab reason style
 * (`signal-suppressed` -> `interference-muted`). The two can co-exist on one contract without
 * either knowing about the other; `e7-relay-rush` declares only the front.
 *
 * MUTED IS NEVER DAMAGED. The sheet says so in as many words ("muted != damaged"), so nothing
 * in this file writes hp, wrecks a building, or removes anything. The mute is read at the
 * shooter seam (`BuildSystem.isShooterPowered`), which turns a covered turret or beacon OFF for
 * as long as the wall stands over it and back ON the instant it passes.
 */

/** The ratified cadence: "front cadence 90s" (sheet A5 DEFAULTS). */
export const FRONT_CADENCE_SECONDS = 90;

/** The ratified crossing: "crossing time 20s" (sheet A5 DEFAULTS). */
export const FRONT_CROSSING_SECONDS = 20;

/**
 * THE PLACEHOLDER'S RESOLUTION. `twist.interferenceFront.relayTarget` is authored as the literal
 * string `"N"` — the contract says so itself and the sheet calls it out: "`relayTarget:"N"` (a
 * PLACEHOLDER — the real number was never authored)". The ratification supplies the number:
 * "DEFAULTS: **N = 3 of 4**". Resolved here, once, and cited at the consumption site below.
 */
export const RATIFIED_RELAY_TARGET = 3;

/**
 * AUTHORED, NOT RATIFIED — flagged as such because the sheet did not specify it. "A vertical
 * static wall" needs a thickness before it can cover anything, and the ratification gives only
 * its cadence and its crossing time. 6wu of half-width (a 12wu band) is the number that makes
 * the declared pair behave: the corridor is 108wu wide and the crossing is 20s, so the band
 * sweeps at 5.4wu/s and stands over any one point for ~2.2s and over a whole 10wu relay site
 * for ~4s. Wide enough to be a wall a rider must plan around, narrow enough that the corridor is
 * never muted all at once. Every other number in this file is quoted from the ratification.
 */
export const FRONT_HALF_WIDTH = 6;

/** Machine-readable refusal code, in the same kebab house style as `signal-suppressed`. */
export const INTERFERENCE_MUTED_REASON = 'interference-muted';

/**
 * The county's voice for the refusal, written as a sibling to A4's "The dead band swallows it."
 * A front is a moving thing where a dead band is a standing one, so the line says so.
 */
export const INTERFERENCE_MUTED_VOICE = 'The front rolls over it. Nothing answers until it passes.';

/**
 * WHAT "A POWERED BUILDING" MEANS ON A CONTRACT THAT DECLARES NO POWER GRID, and why the answer
 * is derived rather than invented. The sheet's objective is "a powered building standing on the
 * site". Measured 2026-08-20, `e7-relay-rush` declares no `twist.powerGrid`, so `PowerGraph`
 * never runs here and there is no grid state to read — "powered" cannot mean a graph node.
 *
 * So it is read off THIS mechanic instead: a powered building is one the front's own mute can
 * darken, i.e. one that has an output to switch off. That is exactly the shooter seam this file
 * gates — a turret and a sentry beacon. A palisade is timber and a stockpile is a shelf; the
 * wall passing over them changes nothing, so they cannot be what "powered" distinguishes.
 * Deriving the set from the mechanic keeps it honest: if the mute ever reaches another kind,
 * this list is where both facts move together (reject-don't-stretch, Mistake #14).
 */
export const POWERED_RELAY_KINDS: readonly string[] = ['turret', 'sentry_beacon'];

type Rect = Readonly<{ id: string; minX: number; maxX: number; minZ: number; maxZ: number }>;

/**
 * The structural shape of a standing work, deliberately narrower than `BuildingTarget` so this
 * file needs no `three` import: a `THREE.Vector3` satisfies `{ x, z }` structurally, so both
 * engines hand their own building list straight in without copying it.
 */
export type FrontWork = Readonly<{
  family: string;
  position: Readonly<{ x: number; z: number }>;
  active: boolean;
  hp: number;
}>;

export type RelaySiteDiagnostics = Readonly<{
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  /** A standing powered building occupies this site right now. */
  lit: boolean;
  /** Which kind lit it, or null. Evidence a rider can act on, not decoration. */
  litBy: string | null;
  /** The wall is standing over this site right now. Transient; never un-lights the site. */
  muted: boolean;
}>;

export type InterferenceFrontDiagnostics = Readonly<{
  /** True when the contract declares the front, a corridor to cross, and sites to light. */
  declared: boolean;
  cadenceSeconds: number;
  crossingSeconds: number;
  halfWidth: number;
  /** The resolved `relayTarget`: the placeholder `"N"` read as the sheet's ratified 3. */
  relayTarget: number;
  /** "before the Nth front arrives" — the same N, as a front ordinal. */
  deadlineFront: number;
  phase: 'waiting' | 'crossing';
  /** How many fronts have ARRIVED so far, 0 before the first. */
  frontsArrived: number;
  frontsCompleted: number;
  /** The wall's centre while it crosses; null between fronts. */
  centerX: number | null;
  secondsToNextFront: number;
  sites: readonly RelaySiteDiagnostics[];
  litCount: number;
  /** True once the deadline front has arrived and the latch has been decided either way. */
  deadlineResolved: boolean;
  /** What the deadline sample actually counted. Null until the deadline front arrives. */
  litAtDeadline: number | null;
  /** The latch the objective reads. False on a declared contract until the deadline is met. */
  objectiveMet: boolean;
  /** Presentation-stripped counters — evidence that the mechanic ran. */
  refusals: Readonly<Record<SuppressibleSystem, number>>;
  /** Standing works covered by the wall, summed over fixed steps. */
  mutedWorkSteps: number;
}>;

type FrontContract = Pick<ContractManifest, 'twist'> & {
  tileParams: Pick<ContractManifest['tileParams'], 'interferenceFrontZones' | 'buildZones'>;
};

export class InterferenceFrontSystem {
  private elapsed = 0;
  private frontsArrived = 0;
  private frontsCompleted = 0;
  private centerX: number | null = null;
  private litAtDeadline: number | null = null;
  private met = false;
  private mutedWorkSteps = 0;
  private readonly refusals: Record<SuppressibleSystem, number> = { drones: 0, playbooks: 0, relayChains: 0 };
  private readonly lit: (string | null)[];

  private constructor(
    private readonly declared: boolean,
    private readonly corridor: readonly Rect[],
    private readonly sites: readonly Rect[],
    private readonly target: number,
  ) {
    this.lit = sites.map(() => null);
  }

  /**
   * ONE read, performed identically by both engines, of the CONTRACT and never the epoch.
   *
   * ARMED ONLY WHEN ALL THREE HALVES ARE DECLARED, AND THAT IS THE LOAD-BEARING RULE. The latch
   * below pins a run UNSECURABLE until the deadline is met. F-1471-1 is the standing casualty of
   * getting this wrong: a `powerGrid` with no `connect` objective pinned `objectiveAllowsSecure`
   * false forever, so beating the Baron won the contract and SILENTLY FAILED TO SECURE IT. A
   * front with no corridor to cross, or no relay sites to light, is a deadline no rider could
   * ever discharge — so it does NOT arm, and `e2e/e7-relay-rush-front.spec.ts` pins that case.
   */
  static create(contract: FrontContract): InterferenceFrontSystem {
    const front = contract.twist.interferenceFront;
    const corridor = rects(contract.tileParams.interferenceFrontZones);
    const sites = rects(contract.tileParams.buildZones).filter((zone) => zone.id.startsWith('relay-site'));
    if (!front || corridor.length === 0 || sites.length === 0) return InterferenceFrontSystem.none();
    return new InterferenceFrontSystem(true, corridor, sites, resolveRelayTarget(front.relayTarget, sites.length));
  }

  /** The undeclared case, reified so every caller holds a consumer rather than a null. */
  static none(): InterferenceFrontSystem {
    return new InterferenceFrontSystem(false, [], [], 0);
  }

  get isDeclared(): boolean {
    return this.declared;
  }

  /** "before the Nth front arrives" — the deadline ordinal, the same N as the site target. */
  get deadlineFront(): number {
    return this.target;
  }

  get relayTarget(): number {
    return this.target;
  }

  /** The wall's centre while it crosses; null between fronts. Read by the browser's band. */
  get bandCenterX(): number | null {
    return this.centerX;
  }

  /** The corridor the wall sweeps, for the browser's band geometry. Null when undeclared. */
  get band(): Readonly<{ minX: number; maxX: number; minZ: number; maxZ: number }> | null {
    if (!this.declared) return null;
    const first = this.corridor[0];
    if (!first) return null;
    let { minX, maxX, minZ, maxZ } = first;
    for (const zone of this.corridor) {
      minX = Math.min(minX, zone.minX);
      maxX = Math.max(maxX, zone.maxX);
      minZ = Math.min(minZ, zone.minZ);
      maxZ = Math.max(maxZ, zone.maxZ);
    }
    return { minX, maxX, minZ, maxZ };
  }

  /**
   * THE OBJECTIVE LATCH, in the canyon-connect shape (`Game.ts:5593`,
   * `HeadlessContractSim.ts:1395`) and keyed on the SUB-FIELD rather than the parent block, which
   * is F-1471-1's whole lesson: `create()` above refuses to arm unless the corridor AND the sites
   * are both there, so a contract that declares a front it cannot discharge is unaffected.
   *
   * A contract that declares no front is unaffected too — which is why this reads `!this.declared`
   * first and never `this.met` alone.
   */
  get objectiveAllowsSecure(): boolean {
    return !this.declared || this.met;
  }

  /** How many relay sites carry a standing powered building right now. */
  get litCount(): number {
    return this.lit.reduce<number>((total, kind) => total + (kind === null ? 0 : 1), 0);
  }

  /**
   * PURE PREDICATE — no counter moves. This is what the shooter seam calls, potentially many
   * times a step, and what the browser's band reads while it renders. Use `refuse` for the
   * verb-level gates where a refusal is an EVENT worth counting.
   */
  muted(x: number, z: number): boolean {
    if (!this.declared || this.centerX === null) return false;
    if (Math.abs(x - this.centerX) > FRONT_HALF_WIDTH) return false;
    for (const zone of this.corridor) if (inside(zone, x, z)) return true;
    return false;
  }

  /**
   * The gate itself, in `SignalSuppression.refuse`'s exact shape with a position added: true
   * means REFUSE, and the refusal is counted. Call it exactly once per attempted use so the
   * counters stay evidence rather than decoration.
   */
  refuse(system: SuppressibleSystem, at: Readonly<{ x: number; z: number }>): boolean {
    if (!this.muted(at.x, at.z)) return false;
    this.refusals[system] += 1;
    return true;
  }

  /**
   * THE PHASE MACHINE, advanced on the caller's fixed step so the two engines produce the same
   * wall at the same instant. Front k arrives at `k * FRONT_CADENCE_SECONDS` and sweeps west to
   * east across `FRONT_CROSSING_SECONDS`; between fronts there is no wall at all and `muted()`
   * is false everywhere.
   *
   * ORDER MATTERS AND IS DELIBERATE: the relay lighting is read from `works` BEFORE the clock
   * advances, so the deadline sample below counts the board as it stood when the wall arrived
   * rather than one step later.
   */
  update(seconds: number, works: readonly FrontWork[]): void {
    if (!this.declared || !(seconds > 0)) return;
    this.readSites(works);
    this.elapsed += seconds;
    const arrived = Math.floor(this.elapsed / FRONT_CADENCE_SECONDS);
    const sinceArrival = this.elapsed - arrived * FRONT_CADENCE_SECONDS;
    const crossing = arrived > 0 && sinceArrival < FRONT_CROSSING_SECONDS;
    this.centerX = crossing ? this.centerAt(sinceArrival / FRONT_CROSSING_SECONDS) : null;
    this.frontsCompleted = crossing ? arrived - 1 : arrived;
    if (arrived <= this.frontsArrived) {
      if (this.declared) this.mutedWorkSteps += this.coveredWorks(works);
      return;
    }
    this.frontsArrived = arrived;
    // THE DEADLINE. "have N relay sites LIT ... before the Nth front arrives" — sampled once, at
    // the arrival of front N, and latched either way. Missing it is final: the run can no longer
    // secure at any wave, which is what makes the schedule a deadline rather than a decoration.
    if (this.litAtDeadline === null && arrived >= this.target) {
      this.litAtDeadline = this.litCount;
      this.met = this.litAtDeadline >= this.target;
    }
    this.mutedWorkSteps += this.coveredWorks(works);
  }

  /** Restores the run-start state; mirrors every other system's reset(). */
  reset(): void {
    this.elapsed = 0;
    this.frontsArrived = 0;
    this.frontsCompleted = 0;
    this.centerX = null;
    this.litAtDeadline = null;
    this.met = false;
    this.mutedWorkSteps = 0;
    this.refusals.drones = 0;
    this.refusals.playbooks = 0;
    this.refusals.relayChains = 0;
    for (let index = 0; index < this.lit.length; index += 1) this.lit[index] = null;
  }

  get diagnostics(): InterferenceFrontDiagnostics {
    const nextIn = this.declared
      ? FRONT_CADENCE_SECONDS - (this.elapsed % FRONT_CADENCE_SECONDS)
      : 0;
    return {
      declared: this.declared,
      cadenceSeconds: FRONT_CADENCE_SECONDS,
      crossingSeconds: FRONT_CROSSING_SECONDS,
      halfWidth: FRONT_HALF_WIDTH,
      relayTarget: this.target,
      deadlineFront: this.target,
      phase: this.centerX === null ? 'waiting' : 'crossing',
      frontsArrived: this.frontsArrived,
      frontsCompleted: this.frontsCompleted,
      centerX: this.centerX === null ? null : round(this.centerX),
      secondsToNextFront: round(nextIn),
      sites: this.sites.map((site, index) => ({
        id: site.id,
        minX: site.minX,
        maxX: site.maxX,
        minZ: site.minZ,
        maxZ: site.maxZ,
        lit: this.lit[index] !== null,
        litBy: this.lit[index] ?? null,
        muted: this.siteMuted(site),
      })),
      litCount: this.litCount,
      deadlineResolved: this.litAtDeadline !== null,
      litAtDeadline: this.litAtDeadline,
      objectiveMet: this.met,
      refusals: { ...this.refusals },
      mutedWorkSteps: this.mutedWorkSteps,
    };
  }

  /**
   * Lighting is LIVE STATE, not a latch: a relay whose building is wrecked goes dark again, and
   * the deadline reads whatever stands at that instant. The wall's mute is deliberately NOT part
   * of this test — muted != damaged is ratified, and the deadline sample happens at the wall's
   * ARRIVAL on the corridor's west edge, so tying "lit" to the instantaneous mute would decide
   * the objective by which site the wall happened to be standing over.
   */
  private readSites(works: readonly FrontWork[]): void {
    for (let index = 0; index < this.sites.length; index += 1) {
      const site = this.sites[index];
      if (!site) continue;
      let kind: string | null = null;
      for (const work of works) {
        if (!work.active || work.hp <= 0 || !POWERED_RELAY_KINDS.includes(work.family)) continue;
        if (!inside(site, work.position.x, work.position.z)) continue;
        kind = work.family;
        break;
      }
      this.lit[index] = kind;
    }
  }

  private coveredWorks(works: readonly FrontWork[]): number {
    if (this.centerX === null) return 0;
    let covered = 0;
    for (const work of works) {
      if (!work.active || work.hp <= 0) continue;
      if (this.muted(work.position.x, work.position.z)) covered += 1;
    }
    return covered;
  }

  private siteMuted(site: Rect): boolean {
    if (this.centerX === null) return false;
    return this.centerX + FRONT_HALF_WIDTH >= site.minX
      && this.centerX - FRONT_HALF_WIDTH <= site.maxX
      && this.corridor.some((zone) => zone.minZ <= site.maxZ && zone.maxZ >= site.minZ);
  }

  /**
   * West to east, entering and clearing inside the crossing: the centre travels from one
   * half-width WEST of the corridor to one half-width EAST of it, so the wall is fully outside
   * the ground at both ends of its 20 seconds.
   */
  private centerAt(progress: number): number {
    const band = this.band;
    if (!band) return 0;
    const from = band.minX - FRONT_HALF_WIDTH;
    const to = band.maxX + FRONT_HALF_WIDTH;
    return from + (to - from) * progress;
  }
}

/**
 * THE PLACEHOLDER, RESOLVED IN ONE PLACE. `relayTarget` is typed `string` and authored `"N"`;
 * the sheet supplies the number ("DEFAULTS: **N = 3 of 4**",
 * `specs/agent-play/door-completion-sheet.md:16`, RATIFIED 2026-08-20). A contract that later
 * authors a real numeral is honoured instead of overridden — the ratification filled a hole, it
 * did not seize the field — and either way the answer is clamped to the sites that actually
 * exist, so no run can be handed a deadline with more relays than the map has.
 */
function resolveRelayTarget(declared: unknown, siteCount: number): number {
  const authored = typeof declared === 'number' ? declared : Number.parseInt(String(declared ?? ''), 10);
  const wanted = Number.isFinite(authored) && authored > 0 ? Math.floor(authored) : RATIFIED_RELAY_TARGET;
  return Math.max(1, Math.min(siteCount, wanted));
}

function rects(source: readonly Rect[] | undefined): readonly Rect[] {
  if (!Array.isArray(source)) return [];
  return source
    .filter((zone) => typeof zone?.id === 'string'
      && [zone.minX, zone.maxX, zone.minZ, zone.maxZ].every((value) => Number.isFinite(value)))
    .map((zone) => ({
      id: zone.id,
      minX: Math.min(zone.minX, zone.maxX),
      maxX: Math.max(zone.minX, zone.maxX),
      minZ: Math.min(zone.minZ, zone.maxZ),
      maxZ: Math.max(zone.minZ, zone.maxZ),
    }));
}

function inside(zone: Rect, x: number, z: number): boolean {
  return x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ;
}

/** Keeps the view's numbers discrete instead of carrying float dust into a determinism hash. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
