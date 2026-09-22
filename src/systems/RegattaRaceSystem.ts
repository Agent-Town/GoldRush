import type { ContractManifest } from '../meta/ContractFamilies';

type Point = Readonly<{ x: number; z: number }>;
type Gate = Point & Readonly<{ id: string; radius?: number }>;

/**
 * The motion block the racer rule reads — structurally `ClaimBoatSnapshot['motion']`, declared
 * here rather than imported so the race system keeps depending on nothing but the contract.
 */
export type RegattaRacerMotion = Readonly<{ x: number; z: number; aboard: string | null; steerable: boolean }>;

export type RegattaRaceDiagnostics = Readonly<{
  nextGate: Gate | null;
  gatesPassed: readonly Readonly<{ id: string; passedAt: number }>[];
  finished: boolean;
  finishedAt: number | null;
  /** Q2: the race was started and then abandoned by leaving the boat. Terminal for the run. */
  forfeited: boolean;
  forfeitedAt: number | null;
  fastWaterMultiplier: number;
}>;

const DEFAULT_GATE_RADIUS = 6;

/**
 * E5 REGATTA, SLICE 2 — **THE ONE RACER RULE** (`specs/agent-play/e5-regatta-steerable-boat.md`
 * law 3, "the race counts the boat"; owner 2026-09-20: "A14 - do it").
 *
 * Both engines derive their racer from THIS function and from the same field — the hull's live
 * `motion` — so there is one rule and not two implementations of it:
 * `DeepwaterSocket.advanceRace` headless, `Game.update` in the browser.
 *
 * It answers the boat's live point while a body is aboard a steerable hull, and **null otherwise**.
 * Null is not "no movement": it is "nothing is racing". Before this slice the browser raced every
 * visible actor plus the boat's MOORING and the headless engine raced the hero plus the mooring
 * (F-RB1-1), which meant a swimming hero passed gates no boat had reached and an idle run passed
 * the start beacon for free because the mooring stands on it. Both of those are dishonest wins,
 * and this function is where they end.
 */
export function regattaRacer(motion: RegattaRacerMotion | null | undefined): Point | null {
  return motion && motion.steerable && motion.aboard !== null ? { x: motion.x, z: motion.z } : null;
}

export class RegattaRaceSystem {
  private nextGateIndex = 0;
  private readonly passed: Array<{ id: string; passedAt: number }> = [];
  private finishedAt: number | null = null;
  private forfeitedAt: number | null = null;

  private constructor(
    private readonly gates: readonly Gate[],
    private readonly finish: Gate,
    private readonly fastWaterZone: NonNullable<ContractManifest['tileParams']['raceCourse']>['fastWaterZone'],
    /**
     * F-RB1-2 — THE SINGLE AUTHORED FAST-WATER NUMBER. Read from the contract's
     * `tileParams.deepwater.claimBoat.physics.fastWaterMultiplier`, which is the same field
     * `ClaimBoat.steer` applies to the hull. Slice 1 left two numbers on this map — 1.35 hardcoded
     * here for a body on foot and 1.5 authored for the hull — and one had to win. The contract's
     * wins: fast water is a property of the WATER, so the zone reads the same for whatever is in
     * it, and a second Deepwater course can author a different current without editing this file.
     */
    private readonly fastWaterMultiplier: number,
    private readonly secureWave: number,
  ) {}

  static create(contract: ContractManifest): RegattaRaceSystem | null {
    const course = contract.tileParams.raceCourse;
    if (!course) return null;
    const finish = contract.tileParams.stakeMarkers?.find(({ heroStart }) => heroStart);
    // `ContractDeepwaterFields.claimBoat` predates the steerable boat and publishes no `physics`
    // in its type; `DeepwaterClaimTile` reads the same authored block through `ClaimBoatConfig`'s
    // own optional field. This is that same narrowing, not a second schema.
    const physics = (contract.tileParams.deepwater?.claimBoat as { physics?: { fastWaterMultiplier?: number } } | undefined)?.physics;
    const fastWater = physics?.fastWaterMultiplier;
    if (
      !finish
      || course.beacons.length === 0
      || contract.twist.secureWave === undefined
      // A course whose racing body has no authored physics cannot be raced at all under law 3,
      // and a fast-water zone with no authored bonus would be the second number this slice
      // removed. Refuse the data rather than invent a default for it.
      || !Number.isFinite(fastWater)
      || (fastWater as number) <= 0
    ) {
      throw new Error('The Regatta race data is incomplete.');
    }
    return new RegattaRaceSystem(course.beacons, finish, course.fastWaterZone, fastWater as number, contract.twist.secureWave);
  }

  /**
   * SLICE 2 — one racer or none, never a list (law 3). `racer` is what `regattaRacer` answered
   * this step: the hull's live point with a body aboard, or null.
   *
   * Q2, ratified 2026-09-19 ("leaving the boat mid-race forfeits the race"): once the start beacon
   * is passed, a step with no racer FORFEITS the run's race. The course cannot then be resumed or
   * finished — re-boarding does not un-forfeit it — and because the secure rule reads
   * `finished !== true`, a forfeited run is a non-secure run by the rule that was already there.
   * A run that never passed the start beacon has not started, so it cannot forfeit: an idle run is
   * a non-starter, which is exactly the null floor this map has always had.
   */
  advance(at: number, wave: number, racer: Point | null): void {
    if (this.finishedAt !== null || this.forfeitedAt !== null || wave >= this.secureWave) return;
    if (racer === null) {
      if (this.passed.length > 0) this.forfeitedAt = at;
      return;
    }
    const gate = this.nextGateIndex < this.gates.length ? this.gates[this.nextGateIndex] : this.finish;
    const radius = Number.isFinite(gate.radius) && gate.radius! > 0 ? gate.radius! : DEFAULT_GATE_RADIUS;
    if (Math.hypot(racer.x - gate.x, racer.z - gate.z) > radius) return;
    if (this.nextGateIndex < this.gates.length) {
      this.passed.push({ id: gate.id, passedAt: at });
      this.nextGateIndex += 1;
    } else {
      this.passed.push({ id: gate.id, passedAt: at });
      this.finishedAt = at;
    }
  }

  movementMultiplierAt(x: number, z: number): number {
    const zone = this.fastWaterZone;
    return x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ
      ? this.fastWaterMultiplier
      : 1;
  }

  reset(): void {
    this.nextGateIndex = 0;
    this.passed.length = 0;
    this.finishedAt = null;
    this.forfeitedAt = null;
  }

  get diagnostics(): RegattaRaceDiagnostics {
    const gate = this.nextGateIndex < this.gates.length ? this.gates[this.nextGateIndex] : this.finish;
    const over = this.finishedAt !== null || this.forfeitedAt !== null;
    return {
      nextGate: over ? null : { ...gate },
      gatesPassed: this.passed.map((entry) => ({ ...entry })),
      finished: this.finishedAt !== null,
      finishedAt: this.finishedAt,
      forfeited: this.forfeitedAt !== null,
      forfeitedAt: this.forfeitedAt,
      fastWaterMultiplier: this.fastWaterMultiplier,
    };
  }
}
