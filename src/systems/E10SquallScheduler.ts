import type { ContractManifest } from '../meta/ContractFamilies';

/**
 * E10S-2 — THE STATIC SQUALL, AS A CLOCK AND NOTHING ELSE
 * (`specs/agent-play/e10-ember-shore-preserve.md` §3 "The squall", §4 slice E10S-2).
 *
 * The Ember Shore's turn is "you are not here to take, you are here to keep something alight",
 * and the squall is the antagonist that makes keeping it alight cost something. This file is the
 * SCHEDULER half of that turn and deliberately no more: a phase machine over the authored
 * cadence, advanced on the caller's fixed step, publishing which phase the map is in and when it
 * last changed. THE WARMTH, THE STOKE VERB, THE LOSS TERMINAL AND THE SECURE LATCH ARE E10S-3 AND
 * ARE NOT HERE. The full desaturation aura is the Quiet's finale tech (`E10StaticBossSystem`) and
 * is not here either — the spec says so in as many words (§4, E10S-2: "the full aura shader is
 * the Quiet's finale tech — NOT built here").
 *
 * WHICH PLUMBING IT TOOK, ANSWERED AS THE SPEC ASKED. §3 says: "If the A5 relay-rush
 * interference-front consumer has merged, reuse its band/phase plumbing with Static presentation;
 * if not, the storm-cycle scheduler is the fallback — implementer reads both and says which it
 * took." Both were read. **A5 HAS MERGED** (`src/systems/InterferenceFrontSystem.ts`, on main),
 * and this file takes A5's SHAPE — private ctor + `create()` off the CONTRACT, refuse-to-arm,
 * `update(seconds)` on the fixed step, presentation-stripped diagnostics, zero render imports —
 * because that shape is what makes two engines agree. It does NOT take A5's band GEOMETRY, and
 * that is a deliberate refusal rather than an omission: A5's front is a moving WALL with a
 * position, a mute and a deadline; the squall is a map-wide WEATHER PHASE with no position, no
 * mute and no deadline. Reusing `bandCenterX` here would have meant inventing a corridor the
 * contract does not declare (Mistake #14, reject-don't-stretch).
 *
 * WHAT IT TOOK FROM THE E5 STORM CYCLE. `WeatherSystem`/`StormWaveScheduler` are the proven
 * cadence tech and their arithmetic is copied in spirit: a cycle length, a phase read off the
 * offset within the cycle, `phaseProgress` in [0,1]. What is NOT copied is `WeatherSystem`'s
 * shape, because it folds its post-storm tail back into `clear` and so cannot NAME a recover
 * phase, which this slice's scope requires (calm -> telegraph -> squall -> recover). Rather than
 * widen a shipping E5 class — four contracts pin their event-log hashes against it — the cadence
 * is re-expressed here over four named phases.
 *
 * IT IMPORTS NO RENDER CODE, AND THAT IS A LAW HERE RATHER THAN A PREFERENCE (F-A8-7, transcribed
 * from `InterferenceFrontSystem.ts:17`): a module both engines construct dragged `three`/DOM
 * modules into the headless collection graph and made the WHOLE suite uncollectable. The only
 * import above is a TYPE. The browser's vignette and its mix duck are driven by
 * `E10SquallPresentation`, which reads the numbers this class publishes and is never read back.
 *
 * DETERMINISM IS THE DELIVERABLE. A scheduler is SIM STATE, so its transitions are event-logged
 * at fixed ticks: `transitions` below is that log, it rides the published view AND the run's
 * determinism hash in `HeadlessContractSim`, and both engines produce it from the same class on
 * the same 1/30s step. A run whose squall opened one tick later is a different run and the hash
 * says so.
 *
 * WHAT IT DELIBERATELY DOES NOT DRIVE, YET. `motePressureMultiplier` is PUBLISHED and NOT
 * APPLIED. The spec gives the squall doubled mote pressure (§3), but that is a consumer, and
 * E10S-2's scope is the clock: applying it here would change the map's outcome, which scope 3 of
 * `tasks/e10s-2-squall-scheduler.md` forbids in as many words ("The map's outcome and the idle
 * floor must be byte-identical to today"). The number is on the view so E10S-3 wires one already-
 * published constant instead of re-deriving it, and so a rider can read the coming pressure now.
 */

export type SquallPhase = 'calm' | 'telegraph' | 'squall' | 'recover';

/** The authored order of one cycle. Exported so a guard cannot re-type it and drift. */
export const SQUALL_PHASE_ORDER: readonly SquallPhase[] = ['calm', 'telegraph', 'squall', 'recover'];

/** RATIFIABLE BY SILENCE — spec §3, "calm 60s"; §6 correction point 3, "Squall cadence = 60/8/25s". */
export const SQUALL_CALM_SECONDS = 60;

/** RATIFIABLE BY SILENCE — spec §3, "telegraph 8s (wind rises, edges pale)". */
export const SQUALL_TELEGRAPH_SECONDS = 8;

/** RATIFIABLE BY SILENCE — spec §3, "**squall 25s** (vent decays, mote pressure doubles ...)". */
export const SQUALL_SQUALL_SECONDS = 25;

/**
 * AUTHORED, NOT RATIFIED — flagged as such because the spec did not specify it, in the same
 * manner `InterferenceFrontSystem.FRONT_HALF_WIDTH` is flagged. The spec names three durations
 * (60/8/25) and the E10S-2 scope names FOUR phases ("calm -> telegraph -> squall -> recover"), so
 * the recover tail is the one number nobody has said out loud.
 *
 * It is DERIVED rather than picked, which is the whole point: the telegraph is the 8s in which
 * the wind rises and the edges pale, and the recover is that same ramp run backwards — the edges
 * returning. Mirroring a ratified number invents no new magnitude at all, where any fresh number
 * (E5's own tail is 1.4x its storm, which would make this 35s and the cycle 128s) would be an
 * invention wearing a derivation's clothes.
 *
 * IT LIVES IN DATA TOO (`twist.emberShore.squall.recoverSeconds`), so the owner's correction is
 * one token in a contract rather than an edit here. This constant is only the fallback for a
 * contract that omits it. Cycle at the defaults: 60 + 8 + 25 + 8 = **101s**.
 */
export const SQUALL_RECOVER_SECONDS = SQUALL_TELEGRAPH_SECONDS;

/**
 * Spec §3: during the squall, "mote pressure doubles". PUBLISHED, NOT APPLIED — see the file
 * header. The wave consumer that reads it is E10S-3's, not this slice's.
 */
export const SQUALL_MOTE_MULTIPLIER = 2;

/** One phase change, at the tick it happened. This IS the event log the determinism claim rests on. */
export type SquallTransition = Readonly<{
  /** Null exactly once, for the run-start entry: a machine that starts in a phase says so. */
  from: SquallPhase | null;
  to: SquallPhase;
  /** Fixed-step index — `update()` calls since the run began. Both engines step 1/30s. */
  tick: number;
  /** Sim seconds accumulated when the change landed, rounded off float dust. */
  atSeconds: number;
  /** Which cycle the entered phase belongs to, 0-based. */
  cycle: number;
}>;

export type SquallDiagnostics = Readonly<{
  /** True only where the contract declares `twist.emberShore.squall` with usable durations. */
  declared: boolean;
  calmSeconds: number;
  telegraphSeconds: number;
  squallSeconds: number;
  recoverSeconds: number;
  cycleSeconds: number;
  phase: SquallPhase;
  /** Progress through the CURRENT phase in [0,1]. */
  phaseProgress: number;
  cycle: number;
  tick: number;
  elapsedSeconds: number;
  secondsToNextPhase: number;
  /** Zero while a squall is blowing — the honest answer to "how long until the next one". */
  secondsToNextSquall: number;
  /** Squalls ENTERED so far, 0 before the first. */
  squallsStarted: number;
  /** Squalls ridden to their end, i.e. survived as a full phase. E10S-3's latch will read this. */
  squallsCompleted: number;
  /** Published, NOT applied by this slice. See the file header. */
  motePressureMultiplier: number;
  /** True while the squall is blowing — the one boolean a presentation needs. */
  blowing: boolean;
  transitions: readonly SquallTransition[];
}>;

/**
 * Narrower than `ContractManifest` on purpose, so a guard can hand this a literal and both engines
 * hand it their own manifest. `twist.emberShore` carries no TypeScript shape today — it is a
 * runtime-whitelisted authored key (`ContractFamilies.ts:1596`) with no field in the `twist` type —
 * so the read below goes through `unknown` rather than a cast that would lie about the contract.
 */
export type SquallContract = Pick<ContractManifest, 'twist'>;

type SquallTimings = {
  calmSeconds: number;
  telegraphSeconds: number;
  squallSeconds: number;
  recoverSeconds: number;
};

export class E10SquallScheduler {
  private elapsed = 0;
  private ticks = 0;
  private phase: SquallPhase = 'calm';
  private cycle = 0;
  private squallsStarted = 0;
  private squallsCompleted = 0;
  private readonly log: SquallTransition[] = [];

  private constructor(
    private readonly declared: boolean,
    private readonly timings: SquallTimings,
    private readonly moteMultiplier: number,
  ) {
    if (declared) this.log.push({ from: null, to: 'calm', tick: 0, atSeconds: 0, cycle: 0 });
  }

  /**
   * ONE read, performed identically by both engines, of the CONTRACT and never the epoch.
   *
   * ARMED ONLY WHERE THE CADENCE IS WHOLE, which is A5's refuse-to-arm rule applied to a clock
   * instead of a deadline. A squall block with a zero or missing duration is a cycle of length
   * zero — a phase machine that would divide by it, or spin through four phases on one tick — so
   * it does NOT arm and every reader holds an inert scheduler that answers "calm, forever".
   * F-1471-1 is the standing casualty of arming a half-declared mechanic; this is the same
   * discipline one slice earlier, before there is a latch to pin.
   */
  static create(contract: SquallContract): E10SquallScheduler {
    const squall = squallBlock(contract);
    if (!squall) return E10SquallScheduler.none();
    const timings: SquallTimings = {
      calmSeconds: duration(squall.calmSeconds, SQUALL_CALM_SECONDS),
      telegraphSeconds: duration(squall.telegraphSeconds, SQUALL_TELEGRAPH_SECONDS),
      squallSeconds: duration(squall.squallSeconds, SQUALL_SQUALL_SECONDS),
      recoverSeconds: duration(squall.recoverSeconds, SQUALL_RECOVER_SECONDS),
    };
    const multiplier = record(squall.motePressure)?.squallMultiplier;
    return new E10SquallScheduler(
      true,
      timings,
      typeof multiplier === 'number' && Number.isFinite(multiplier) && multiplier > 0
        ? multiplier
        : SQUALL_MOTE_MULTIPLIER,
    );
  }

  /** The undeclared case, reified so every caller holds a scheduler rather than a null. */
  static none(): E10SquallScheduler {
    return new E10SquallScheduler(false, {
      calmSeconds: SQUALL_CALM_SECONDS,
      telegraphSeconds: SQUALL_TELEGRAPH_SECONDS,
      squallSeconds: SQUALL_SQUALL_SECONDS,
      recoverSeconds: SQUALL_RECOVER_SECONDS,
    }, SQUALL_MOTE_MULTIPLIER);
  }

  get isDeclared(): boolean {
    return this.declared;
  }

  get currentPhase(): SquallPhase {
    return this.phase;
  }

  /** The one boolean a presentation needs, so no caller re-derives it from the phase string. */
  get blowing(): boolean {
    return this.declared && this.phase === 'squall';
  }

  get cycleSeconds(): number {
    return this.timings.calmSeconds
      + this.timings.telegraphSeconds
      + this.timings.squallSeconds
      + this.timings.recoverSeconds;
  }

  /**
   * THE PHASE MACHINE, advanced on the caller's fixed step so the two engines produce the same
   * phase at the same instant. `HeadlessContractSim` calls it with `STEP_SECONDS` and `Game` with
   * `simDelta`, both 1/30s in an ordinary run, and both accumulate by the same repeated addition
   * in the same order — so the transition TICKS below are comparable across engines rather than
   * merely close.
   *
   * The tick is counted BEFORE the phase is read, so a transition logged at tick N means "at the
   * end of step N the map was in phase X" — the same convention `advanceOneTick` uses elsewhere.
   */
  update(seconds: number): void {
    if (!this.declared || !(seconds > 0)) return;
    this.ticks += 1;
    this.elapsed += seconds;
    const cycleSeconds = this.cycleSeconds;
    const cycle = Math.floor(this.elapsed / cycleSeconds);
    const phase = this.phaseAt(this.elapsed - cycle * cycleSeconds);
    if (phase === this.phase && cycle === this.cycle) return;
    // A cycle rollover with no phase change cannot happen (the cycle begins in `calm` and ends in
    // `recover`), but the guard above tests both so a retuned cadence can never log a silent one.
    if (phase !== this.phase) {
      if (phase === 'squall') this.squallsStarted += 1;
      if (this.phase === 'squall') this.squallsCompleted += 1;
      this.log.push({ from: this.phase, to: phase, tick: this.ticks, atSeconds: round(this.elapsed), cycle });
    }
    this.phase = phase;
    this.cycle = cycle;
  }

  /** Restores the run-start state; mirrors every other system's reset(). */
  reset(): void {
    this.elapsed = 0;
    this.ticks = 0;
    this.phase = 'calm';
    this.cycle = 0;
    this.squallsStarted = 0;
    this.squallsCompleted = 0;
    this.log.length = 0;
    if (this.declared) this.log.push({ from: null, to: 'calm', tick: 0, atSeconds: 0, cycle: 0 });
  }

  get diagnostics(): SquallDiagnostics {
    const cycleSeconds = this.cycleSeconds;
    const within = this.elapsed - this.cycle * cycleSeconds;
    const { start, length } = this.phaseWindow(this.phase);
    return {
      declared: this.declared,
      calmSeconds: this.timings.calmSeconds,
      telegraphSeconds: this.timings.telegraphSeconds,
      squallSeconds: this.timings.squallSeconds,
      recoverSeconds: this.timings.recoverSeconds,
      cycleSeconds,
      phase: this.phase,
      phaseProgress: this.declared ? clamp01((within - start) / length) : 0,
      cycle: this.cycle,
      tick: this.ticks,
      elapsedSeconds: round(this.elapsed),
      secondsToNextPhase: this.declared ? round(Math.max(0, start + length - within)) : 0,
      secondsToNextSquall: this.declared ? round(this.untilSquall(within)) : 0,
      squallsStarted: this.squallsStarted,
      squallsCompleted: this.squallsCompleted,
      motePressureMultiplier: this.moteMultiplier,
      blowing: this.blowing,
      transitions: [...this.log],
    };
  }

  /** Where in the cycle each phase begins and how long it lasts — the one table every read uses. */
  private phaseWindow(phase: SquallPhase): { start: number; length: number } {
    const { calmSeconds, telegraphSeconds, squallSeconds, recoverSeconds } = this.timings;
    switch (phase) {
      case 'calm': return { start: 0, length: calmSeconds };
      case 'telegraph': return { start: calmSeconds, length: telegraphSeconds };
      case 'squall': return { start: calmSeconds + telegraphSeconds, length: squallSeconds };
      default: return { start: calmSeconds + telegraphSeconds + squallSeconds, length: recoverSeconds };
    }
  }

  private phaseAt(within: number): SquallPhase {
    const { calmSeconds, telegraphSeconds, squallSeconds } = this.timings;
    if (within < calmSeconds) return 'calm';
    if (within < calmSeconds + telegraphSeconds) return 'telegraph';
    if (within < calmSeconds + telegraphSeconds + squallSeconds) return 'squall';
    return 'recover';
  }

  /** Zero while it blows, otherwise the wait to the next squall's first tick. */
  private untilSquall(within: number): number {
    if (this.phase === 'squall') return 0;
    const opensAt = this.timings.calmSeconds + this.timings.telegraphSeconds;
    return within < opensAt ? opensAt - within : this.cycleSeconds - within + opensAt;
  }
}

/**
 * THE AUTHORED BLOCK, read through `unknown` rather than a cast. `twist.emberShore` is declared
 * in `AUTHORED_TWIST_KEYS` and `DECLARED_INERT_PATHS` but has no field in the `twist` TYPE, so
 * `contract.twist.emberShore` does not type-check and inventing an interface here would claim a
 * contract shape the validator does not enforce. This reads what is there and refuses what is not.
 */
function squallBlock(contract: SquallContract): Record<string, unknown> | null {
  const twist = contract.twist as unknown as Record<string, unknown>;
  const weather = record(twist.emberShore) ?? record(twist.archiveWorld);
  const squall = weather ? record(weather.squall) : null;
  if (!squall) return null;
  // Refuse-to-arm: a cadence with a non-positive duration is not a cycle. An OMITTED duration is
  // different and is allowed — it falls back to the ratified default above — because the spec's
  // numbers are the contract's meaning whether or not the JSON repeats them.
  for (const key of ['calmSeconds', 'telegraphSeconds', 'squallSeconds', 'recoverSeconds']) {
    const value = squall[key];
    if (value !== undefined && !(typeof value === 'number' && Number.isFinite(value) && value > 0)) return null;
  }
  return squall;
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function duration(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Keeps the view's numbers discrete instead of carrying float dust into a determinism hash. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
