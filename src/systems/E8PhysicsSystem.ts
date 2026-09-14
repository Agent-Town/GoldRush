import * as THREE from 'three';
import { Balance } from '../game/Balance';
import type { ContractManifest } from '../meta/ContractFamilies';
import type { ShooterHandle } from './CombatSystem';
import { E8AirWindow, positiveInteger } from './E8AirWindow';

type MovementProfile = 'normal' | 'floaty' | 'free-fall';
type PhysicsContract = ContractManifest & {
  tileParams: ContractManifest['tileParams'] & {
    gravity?: {
      feelG?: number;
      lobArcDistanceMultiplier?: number;
      movement?: MovementProfile;
      projectileBehavior?: string;
    };
    atmosphere?: { outsideDomes?: string };
  };
  twist: ContractManifest['twist'] & {
    zeroGravity?: { projectiles?: string };
  };
};

export type E8PhysicsDiagnostics = {
  active: boolean;
  contractId: string;
  source: 'default' | 'gravity' | 'zero-gravity';
  movement: MovementProfile;
  feelG: number;
  lobArcDistanceMultiplier: number;
  lobAirTimeMultiplier: number;
  knockbackScale: number;
  orbitalReturn: boolean;
  vacuum: boolean;
  fixedTimestepOnly: true;
  filteredMovement: { x: number; y: number };
  adaptedLobs: Array<{ resumeKey: string; range: number; airTime: number }>;
};

export class E8PhysicsSystem {
  private readonly filteredMovement = new Map<number, THREE.Vector2>();
  private readonly adaptedLobs = new Map<string, { range: number; airTime: number }>();
  /** Scratch for the A7 debris drag; see `filterMovement`. Never the stored momentum. */
  private readonly dragged = new THREE.Vector2();
  private readonly profile: Omit<E8PhysicsDiagnostics, 'filteredMovement' | 'adaptedLobs'>;

  constructor(contract: ContractManifest) {
    this.profile = profileFromContract(contract as PhysicsContract);
  }

  get diagnostics(): E8PhysicsDiagnostics {
    const movement = this.filteredMovement.get(0);
    return {
      ...this.profile,
      filteredMovement: {
        x: round3(movement?.x ?? 0),
        y: round3(movement?.y ?? 0),
      },
      adaptedLobs: [...this.adaptedLobs].map(([resumeKey, values]) => ({ resumeKey, ...values })),
    };
  }

  get lobArcDistanceMultiplier(): number {
    return this.profile.lobArcDistanceMultiplier;
  }

  /**
   * A7 (2026-08-20) added the optional `terrain` argument and NOTHING else on this path. Both
   * multipliers default to 1, which reproduces the pre-A7 arithmetic exactly — that default is
   * what keeps `e8-eclipse` and `e8-mare-claim` byte-identical, since neither passes the
   * argument. Low orbit passes `LowOrbitSystem`'s per-position answer: `controlScale` halves
   * THRUST RESPONSE off the handhold spine (a soft constraint — momentum carries, and there is
   * no wall), `speedScale` drags the resulting vector inside a debris band.
   */
  filterMovement(
    slot: number,
    input: THREE.Vector2,
    fixedDelta: number,
    velocity?: THREE.Vector3,
    terrain?: { controlScale: number; speedScale: number },
    movementSpeed: number = Balance.hero.speed,
  ): THREE.Vector2 {
    if (!this.profile.active || this.profile.movement === 'normal') return input;
    let filtered = this.filteredMovement.get(slot);
    if (!filtered) {
      filtered = new THREE.Vector2();
      this.filteredMovement.set(slot, filtered);
    }
    // Actor velocity is already part of run/reconnect snapshots, so live drift
    // has no hidden state that can diverge after a restore.
    // Normalize against the actor's upgraded speed; using base speed feeds the perk back into drift.
    if (velocity) filtered.set(velocity.x / movementSpeed, velocity.z / movementSpeed).clampLength(0, 1);
    const moving = input.lengthSq() > 0.0001;
    const freeFall = this.profile.movement === 'free-fall';
    const control = terrain ? terrain.controlScale : 1;
    const response = (moving
      ? freeFall ? Balance.e8Physics.freeFallThrustResponsePerSecond : Balance.e8Physics.floatyThrustResponsePerSecond
      : freeFall ? Balance.e8Physics.freeFallDriftResponsePerSecond : Balance.e8Physics.floatyDriftResponsePerSecond)
      * control;
    filtered.lerp(input, THREE.MathUtils.clamp(response * fixedDelta, 0, 1));
    if (filtered.lengthSq() > 1) filtered.normalize();
    const speed = terrain ? terrain.speedScale : 1;
    if (speed === 1) return filtered;
    // Scratch, never `filtered` itself: `filtered` IS the persistent per-slot momentum, and
    // scaling it in place would compound the drag every step into a standstill.
    return this.dragged.copy(filtered).multiplyScalar(speed);
  }

  scaleLobAirTime(seconds: number): number {
    return seconds * this.profile.lobAirTimeMultiplier;
  }

  scaleKnockback(distance: number): number {
    return distance * this.profile.knockbackScale;
  }

  adaptShooter(handle: ShooterHandle): ShooterHandle {
    if (handle.kind === 'lob' && handle.aoe) {
      handle.range *= this.profile.lobArcDistanceMultiplier;
      handle.aoe.airTime = this.scaleLobAirTime(handle.aoe.airTime);
      this.adaptedLobs.set(handle.resumeKey, { range: handle.range, airTime: handle.aoe.airTime });
    }
    if (handle.damage === 0 && handle.onFire) {
      const onFire = handle.onFire;
      handle.onFire = (at) => {
        const grapple = Balance.e8Arsenal.magnetGrapple as { pullDistance: number };
        const base = grapple.pullDistance;
        grapple.pullDistance = this.scaleKnockback(base);
        try {
          onFire(at);
        } finally {
          grapple.pullDistance = base;
        }
      };
    }
    return handle;
  }

  reset(slot?: number): void {
    if (slot === undefined) this.filteredMovement.clear();
    else this.filteredMovement.delete(slot);
  }
}

function profileFromContract(contract: PhysicsContract): Omit<E8PhysicsDiagnostics, 'filteredMovement' | 'adaptedLobs'> {
  const gravity = contract.tileParams.gravity;
  const zeroGravity = gravity?.feelG === 0 || contract.twist.zeroGravity !== undefined;
  const active = gravity !== undefined || zeroGravity;
  const feelG = active ? THREE.MathUtils.clamp(finiteOr(gravity?.feelG, 1), 0, 1) : 1;
  const movement: MovementProfile = zeroGravity
    ? 'free-fall'
    : gravity?.movement === 'floaty'
      ? 'floaty'
      : 'normal';
  const contractLob = finiteOr(gravity?.lobArcDistanceMultiplier, 1);
  const lobArcDistanceMultiplier = zeroGravity
    ? Balance.e8Physics.zeroGravityLobArcDistanceMultiplier
    : Math.max(1, contractLob);
  const orbitalReturn = gravity?.projectileBehavior === 'orbital-return' || contract.twist.zeroGravity?.projectiles === 'orbital-return';

  return {
    active,
    contractId: contract.id,
    source: zeroGravity ? 'zero-gravity' : gravity ? 'gravity' : 'default',
    movement,
    feelG,
    lobArcDistanceMultiplier,
    lobAirTimeMultiplier: lobArcDistanceMultiplier,
    knockbackScale: 1 + (1 - feelG) * Balance.e8Physics.knockbackScalePerLostG,
    orbitalReturn,
    vacuum: contract.tileParams.atmosphere?.outsideDomes !== undefined,
    fixedTimestepOnly: true,
  };
}

function finiteOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// E8 — AIR AS THE WALL, the headless-safe consumer (`tasks/e8-mare-claim-physics.md`, 2026-09-03).
//
// WHAT IS DECLARED, AND BY WHOM. `e8-mare-claim` authors `tileParams.atmosphere` as
// `{ airIsWall: true, outsideDomes: 'suit-timer' }` (`assets/contracts/epoch-8-orbital/contracts.json`),
// three `dome-cluster-pad-*` build zones, and six `harvestAnchors` — the "six regolith harvest
// grounds across the mare flat" its own briefing promises. The bundle ratified the shape
// (`specs/epoch-saga/e8-orbital-bundle.md` §B): domes hold atmosphere, breaches drain it on visible
// dials, and outside the domes the suit timer rules exploration; its objectives name "pan (regolith
// He-3 runs on suit timers)". Until this consumer, `E8PhysicsSystem` reduced the whole declaration
// to the `vacuum` flag above and nothing read it (the 2026-09-02 era-mechanic audit: RESKIN).
//
// WHAT THIS DOES, HONESTLY BOUNDED. It is a MEASUREMENT of one body against authored rectangles on
// the fixed step, plus an objective latch — and, since 2026-09-07, a HARM the caller routes through
// `CombatSystem`. It still mints nothing.
//
// ⚠️ THE "IT DAMAGES NOTHING" CLAUSE THAT STOOD HERE FROM 2026-09-03 TO 2026-09-07 IS RETIRED, and
// the reason is worth keeping: it was never a design preference, it was a Same-Laws guard. The
// browser composed no atmosphere consumer, so a rule that hurt the body headless would have put the
// two engines on different boards for the same orders (`CAPABILITY-LADDER.md` L7). The owner's
// 2026-09-07 directive ("I want space experiences of humans to need them having air") makes the
// harm the point, so the guard is satisfied the other way round: `Game.ts` composes this consumer
// too, applies the same chip through the same resolver, and the two engines still agree about hp.
// What they still differ on is what counts toward the OBJECTIVE, which is the pre-existing bound
// the contracts' own `engineDependencies` rows have stated since the wall shipped.
//   · the suit: the HUMAN's, `twist.atmosphere.suitSeconds` of air (default `SUIT_AIR_SECONDS`),
//     draining one second per second outside a breathing dome, refilling at
//     `SUIT_REFILL_PER_SECOND` inside one, and charging `twist.atmosphere.harmPerSecond` of hp for
//     every whole second it spends empty;
//   · the domes: breached while an outlaw stands on the pad (the sheet's "sieger enemies"; debris
//     rain has no headless hazard on this map and is not modelled), draining over
//     `DOME_AIR_DRAIN_SECONDS`, sealing back over `DOME_AIR_REFILL_SECONDS` once the pad is clear;
//   · the regolith run: a pan tick landed on a ground while the suit still holds air WORKS that
//     ground; a breathless tick is counted and not credited. The claim cannot secure until the
//     contract's own count of the authored grounds has been worked on suit air
//     (`objectiveAllowsSecure`), a count published on the view beside the authored total — the
//     contract authors it as `twist.atmosphere.regolithRequired` and `REGOLITH_GROUNDS_FOR_SECURE`
//     is the default for a contract that authors nothing, with at most one ground credited per
//     `regolithWindowWaves` of run time. See THE PREVALENCE RULE below for the measurement that
//     chose both numbers.
//
// SCOPED BY ID AND BY DATA, in the `HollowCrossingSystem.create` shape: `e8-eclipse` carries a
// byte-identical atmosphere block and the same dome pads, and its row on the L1 ladder ("compose
// gravity/air first, then make the eclipse remove an air/energy route") is its own slice — lifting
// the id gate is that slice's one-line call, not this one's. Every other contract gets `none()`.
// ═══════════════════════════════════════════════════════════════════════════════════════════

export const SUIT_AIR_SECONDS = 60;
export const SUIT_REFILL_PER_SECOND = 4;
export const DOME_AIR_DRAIN_SECONDS = 45;
export const DOME_AIR_REFILL_SECONDS = 30;
export const DOME_ZONE_PREFIX = 'dome-cluster';
export const AIR_WALL_CONTRACT_IDS: readonly string[] = ['e8-mare-claim'];

/**
 * HOW OFTEN AN EMPTY SUIT CHARGES ITS HARM, in seconds of run clock. ONE second, and the number is
 * forced rather than chosen: `Hero.takeDamage` sets `Balance.hero.iframes` (0.5 s) on every applied
 * hit (`src/entities/Hero.ts:260`), so a source that charges more often than twice a second has
 * most of its charges REFUSED and reports a rate it does not deliver. A one-second cadence clears
 * that window twice over, which makes `harmPerSecond` mean what it says.
 *
 * The consequence is stated rather than hidden: suffocation rides `CombatSystem` exactly like every
 * other source, so a charge that lands inside an iframe another source opened is refused — the same
 * mercy an outlaw's second bolt gets. That is what "one damage resolver" costs, and it is cheaper
 * than a second resolver.
 */
export const SUIT_HARM_TICK_SECONDS = 1;

/**
 * THE HUMAN'S SUIT (owner directive 2026-09-07, verbatim: "I want space experiences of humans to
 * need them having air. It has to be logical. If that means we have to change something ok").
 *
 * WHOSE LUNG THIS IS, and the measurement that settled it. Until this file, the era's suit was
 * measured against `this.prospector.position` in both consumers and published as
 * `suit.body: 'prospector'` — and the Prospector is a MADE AGENT, the town's brass firstborn
 * (`lore/STORYBOOK.md:453` "a crew of made agents — machines first into the sky"; `:681` "E8-E9
 * crew elder"). The storybook nowhere says it breathes. What the E8 chapter says instead is that
 * the town's HUMANS do: the suit fitter is "the sewing tradition's fifth act: the town that sewed a
 * machine's cover now sews everyone's air" (`lore/STORYBOOK.md:481`), the arrival beat is a BREACH
 * DRILL, "they practice losing air the way they once practiced fire brigade" (`:518`), and the hero
 * — silver, human, the body a rider steers with `MOVE_HERO` — "pans the regolith with the same pan"
 * (`:473`). So the body that carries air here is the HERO, and the machine that never needed it has
 * stopped pretending to.
 *
 * MEASURED FIRST, on the four securing tapes (`artifacts/e8-air-logical/body-*.json`): the human
 * body spent 0 of 600 s outside pressurised ground on the Far Side, 0 of 600 s on Low Orbit,
 * 275 of 600 s on the Eclipse — and 601 of 600 s on the Mare Claim, where she stands at (0, 12),
 * six world units north of the centre dome, for the WHOLE securing ride. A rule about human air
 * that never once read the human is exactly the illogic the directive names.
 *
 * WHAT IT IS. One dial, per run, shared by both era consumers so the number in the briefing and the
 * number the engine enforces cannot drift (`E8AirWindow`'s own reason for existing). Outside
 * pressurised ground it drains one second per second; inside it refills at `SUIT_REFILL_PER_SECOND`
 * and nothing else refills it; at zero it charges `harmPerSecond` of hp once per
 * `SUIT_HARM_TICK_SECONDS`, and the CALLER routes that through `CombatSystem` — this class returns
 * hp and never applies it, because `CombatSystem` is the sole damage resolver (`CLAUDE.md` §4.4)
 * and the shape is `HollowCrossingSystem.update`'s, which has returned its radiation chip to its
 * caller since E6.
 *
 * A NULL `harmPerSecond` MEANS NO HARM AT ALL — the pre-2026-09-07 behaviour, and the default a
 * contract that authors nothing still gets.
 */
export class E8HumanSuit {
  private seconds: number;
  private ground: string | null = null;
  private drainedTotal = 0;
  private emptySeconds = 0;
  private harmDealt = 0;
  private harmTicks = 0;
  /** Seconds of empty suit not yet charged. Reset the moment the body reaches air. */
  private harmCarry = 0;

  /**
   * @param capacity seconds of air a full suit holds (`twist.atmosphere.suitSeconds`).
   * @param harmPerSecond hp per second of an empty suit, or null where the contract authors none.
   */
  constructor(readonly capacity: number, readonly harmPerSecond: number | null) {
    this.seconds = capacity;
  }

  /**
   * One fixed step against the id of the pressurised ground the body stands in, or null in vacuum.
   * Returns the hp the caller owes `CombatSystem` this step — 0 on every step but the charging one.
   */
  update(delta: number, breathing: string | null): number {
    this.ground = breathing;
    if (breathing !== null) {
      this.seconds = Math.min(this.capacity, this.seconds + delta * SUIT_REFILL_PER_SECOND);
      // A partial second of suffocation that ends at an airlock costs nothing: the charge is a
      // WHOLE second held, not a debt carried. Nothing can be gained by stepping in and out,
      // because the suit takes `capacity` seconds to empty before a charge can begin at all.
      this.harmCarry = 0;
      return 0;
    }
    const drained = Math.min(this.seconds, delta);
    this.seconds -= drained;
    this.drainedTotal += drained;
    if (this.seconds > 0) return 0;
    this.emptySeconds += delta;
    if (this.harmPerSecond === null) return 0;
    this.harmCarry += delta;
    let harm = 0;
    while (this.harmCarry >= SUIT_HARM_TICK_SECONDS) {
      this.harmCarry -= SUIT_HARM_TICK_SECONDS;
      harm += this.harmPerSecond * SUIT_HARM_TICK_SECONDS;
      this.harmTicks += 1;
    }
    this.harmDealt += harm;
    return harm;
  }

  captureSuspend() {
    return {
      capacity: this.capacity, harmPerSecond: this.harmPerSecond,
      seconds: this.seconds, ground: this.ground, drainedTotal: this.drainedTotal,
      emptySeconds: this.emptySeconds, harmDealt: this.harmDealt,
      harmTicks: this.harmTicks, harmCarry: this.harmCarry,
    };
  }

  restoreSuspend(value: unknown): boolean {
    if (value === null || typeof value !== 'object') return false;
    const state = value as ReturnType<E8HumanSuit['captureSuspend']>;
    if (state.capacity !== this.capacity || state.harmPerSecond !== this.harmPerSecond
      || ![state.seconds, state.drainedTotal, state.emptySeconds, state.harmDealt, state.harmCarry]
        .every((number) => Number.isFinite(number) && number >= 0)
      || state.seconds > this.capacity || state.harmCarry >= SUIT_HARM_TICK_SECONDS
      || !Number.isSafeInteger(state.harmTicks) || state.harmTicks < 0
      || !(state.ground === null || (typeof state.ground === 'string' && state.ground.length <= 200))) return false;
    this.seconds = state.seconds;
    this.ground = state.ground;
    this.drainedTotal = state.drainedTotal;
    this.emptySeconds = state.emptySeconds;
    this.harmDealt = state.harmDealt;
    this.harmTicks = state.harmTicks;
    this.harmCarry = state.harmCarry;
    return true;
  }

  get empty(): boolean {
    return this.seconds <= 0;
  }

  get diagnostics(): E8HumanSuitDiagnostics {
    return {
      body: 'hero',
      seconds: round3(this.seconds),
      capacity: this.capacity,
      refillPerSecond: SUIT_REFILL_PER_SECOND,
      harmPerSecond: this.harmPerSecond,
      inDome: this.ground,
      empty: this.empty,
      drainedTotal: round3(this.drainedTotal),
      emptySeconds: round3(this.emptySeconds),
      harmDealt: round3(this.harmDealt),
      harmTicks: this.harmTicks,
    };
  }
}

/**
 * The suit row on the view, one shape for all four E8 maps. `body` is the literal `'hero'` since
 * 2026-09-07: the human is the only body on these maps that needs air, and there is no second dial
 * to confuse it with.
 */
export type E8HumanSuitDiagnostics = Readonly<{
  body: 'hero';
  seconds: number;
  capacity: number;
  refillPerSecond: number;
  /** hp per second of an empty suit; null where the contract authors no harm. */
  harmPerSecond: number | null;
  /** The pressurised rectangle the human breathes in, or null in vacuum. */
  inDome: string | null;
  empty: boolean;
  drainedTotal: number;
  emptySeconds: number;
  /** hp this suit has charged through `CombatSystem` across the run. */
  harmDealt: number;
  /** How many whole seconds of empty suit have been charged. */
  harmTicks: number;
}>;

/**
 * THE PRESSURISED GROUND, named by the contract rather than derived from a prefix
 * (`twist.atmosphere.pressurisedZoneIds`). Returns the authored ids where the contract names them,
 * and null where it names none — in which case each consumer keeps the derivation it shipped with,
 * which is what makes this field additive rather than a migration.
 */
export function authoredPressurisedZoneIds(contract: ContractManifest): readonly string[] | null {
  const ids = contract.twist.atmosphere?.pressurisedZoneIds;
  if (!Array.isArray(ids) || ids.length === 0) return null;
  return ids.every((id) => typeof id === 'string' && id.length > 0) ? ids : null;
}

/** The suit's capacity for this contract: its own authored seconds, else the ratified default. */
export function authoredSuitSeconds(contract: ContractManifest): number {
  return positiveInteger(contract.twist.atmosphere?.suitSeconds) ?? SUIT_AIR_SECONDS;
}

/** The harm an empty suit charges on this contract, or null where it authors none. */
export function authoredHarmPerSecond(contract: ContractManifest): number | null {
  return positiveInteger(contract.twist.atmosphere?.harmPerSecond);
}
/**
 * HOW MANY of the authored regolith grounds the claim must have WORKED ON SUIT AIR before it may
 * secure. One — "the smallest that the contract's briefing already promises"
 * (`tasks/e8-mare-claim-physics.md` §2), and it is deliberately not six.
 *
 * MEASURED, not guessed (`artifacts/e8-mare-claim-physics/mare-claim.log`, 2026-09-04):
 *   · a floor ride works ground 1 at t=5.3s — one ground is reachable from the starting kit;
 *   · a HARNESS ride (immortal hero) worked 5 of 6 in 819 seconds and 27 waves and never saw the
 *     sixth, because only two seams are active at a time and a depleted one respawns on a RANDOM
 *     open anchor 20s later (`src/systems/HarvestSystem.ts:205,343`, `Balance.goldSeam.respawnSeconds`);
 *   · no rider has EVER secured this contract — `assets/contracts/winnability-receipts.json` reads
 *     `{"contractId":"e8-mare-claim","status":"unclaimed"}`.
 * A six-ground gate would therefore have made a never-yet-won map turn on a coin-flip queue of
 * respawns, which is the L2 bug class by name ("Unwinnable-by-construction is a bug class, never a
 * difficulty setting", `specs/epoch-saga/CAPABILITY-LADDER.md:38`). The count is published on the
 * view as `now.air.regolith.required` beside `grounds`, so raising it later is one line here and a
 * documented number there — the ladder's next E8 row, once the map authors a dependable air loop.
 *
 * THAT ROW LANDED, 2026-09-06 (`tasks/mare-claim-air-prevalent.md`), and this constant kept its
 * value: the count is now AUTHORED PER CONTRACT (`twist.atmosphere.regolithRequired`) and this is
 * the default a contract that authors nothing still gets. `E8SuitAirSystem` reads it unchanged for
 * the Mare Claim's three siblings, whose numbers this slice measured and did not touch.
 */
export const REGOLITH_GROUNDS_FOR_SECURE = 1;

/**
 * THE PREVALENCE RULE (owner ruling 2026-09-06, verbatim: "no, this has to be more prevalent,
 * otherwise it makes no sense"), and why it is TWO numbers rather than one.
 *
 * MEASURED FIRST on heat 12's own securing tape, replayed tick for tick
 * (`artifacts/mare-claim-air-prevalent/measure-e8-mare-claim.json`, the replay reproduces
 * `fnv1a32:f84d1d2b`): the rider worked ground #1 at t = 6.0 s, the latch closed there, and the
 * suit then sat EMPTY for 488.8 of 600 seconds while 197 breathless pans cost nothing. The wall
 * cost one order. But raising `required` alone does not fix that, and the same tape says why: the
 * rider worked #1 at 6 s, #4 at 17 s and #2 at 42 s — THREE grounds inside the suit's first
 * 60-second charge, without once going back for air. A four-ground gate on its own would have been
 * bought in the opening sortie plus one more, and the last nine minutes would still ask nothing.
 *
 * So the second number is a WINDOW: at most one ground is credited toward the latch per
 * `regolithWindowWaves` of run time. Four grounds at one per four waves cannot be bought before
 * the fourth window opens, which on this map's 30-second cadence is t = 360 s of a 600-second run,
 * and the rider must leave a dome with air in four of the five windows. That is the era's thesis
 * ("air becomes the wall", `specs/epoch-saga/e8-orbital-bundle.md` §B) made into a shape a rider
 * plans a whole ride around, rather than one it pays off and forgets.
 *
 * THE WINDOW IS MEASURED ON THIS CONSUMER'S OWN RUN CLOCK, not on the wave counter, and that is a
 * deliberate honesty rather than an approximation: `update` is the only thing this class is
 * handed, and it is handed a fixed delta and nothing else — no wave — so the boundary is
 * `windowWaves x the contract's own wave interval` in seconds, accumulated a tick at a time. On
 * the Mare Claim that is 4 x 30 = 120 s. Measured against the same tape, the wave counter turns
 * within one tick of each 30-second multiple (wave 1 at 30.0 s, wave 10 at 300.0 s), so the two
 * clocks agree everywhere except a single 1/30 s sliver at each boundary. The window INDEX is
 * published on the view (`now.air.regolith.window`) precisely so a rider never has to guess which
 * side of that sliver it is on.
 */
export const REGOLITH_WINDOW_WAVES_DEFAULT: number | null = null;

type Point = Readonly<{ x: number; z: number }>;
type Rect = Readonly<{ id: string; minX: number; maxX: number; minZ: number; maxZ: number }>;
type Sieger = Readonly<{ isAlive: boolean; position: Point }>;

export type E8AtmosphereDiagnostics = Readonly<{
  declared: boolean;
  wall: 'suit-timer' | 'suit-only' | null;
  /** THE HUMAN'S dial since 2026-09-07; see `E8HumanSuit` for whose lung it is and why. */
  suit: E8HumanSuitDiagnostics;
  domes: ReadonlyArray<Readonly<{ id: string; air: number; breached: boolean; breaches: number; siegers: number }>>;
  regolith: Readonly<{
    grounds: number;
    required: number;
    worked: readonly number[];
    runsOnAir: number;
    breathlessPans: number;
    complete: boolean;
    /**
     * THE WINDOW, optional in the TYPE and always present on the VIEW. Optional here because
     * `E8SuitAirSystem` shares this shape for the Mare Claim's three siblings and this slice's
     * firewall forbids touching that file; `View.readAir` fills the four fields for all four E8
     * maps (`windowWaves: null` where no window is authored), so a rider still reads ONE air shape
     * across the era. Null `windowWaves` means every credited ground counts whenever it is worked.
     */
    windowWaves?: number | null;
    /** Which window the run clock stands in, zero-based; always 0 while no window is authored. */
    window?: number;
    /** Grounds credited toward the latch inside THIS window. At most one while a window is authored. */
    creditedThisWindow?: number;
    /** Pans made on suit air, on a fresh ground, that the window refused. Counted, credited to nothing. */
    windowHeldPans?: number;
  }>;
}>;

type DomeState = { readonly zone: Rect; air: number; breached: boolean; breaches: number; siegers: number };

export type E8AirActor = Readonly<{ id: number; position: Point }>;

export class E8AtmosphereSystem {
  /**
   * THE HUMAN'S SUIT, since 2026-09-07 (`E8HumanSuit`, and the owner directive quoted there). It
   * replaced the four fields that used to live here — `suitSeconds`, `inDome`, `drainedTotal`,
   * `emptySeconds` — measured against the PROSPECTOR. The dial's shape on the view is unchanged
   * apart from `body`, `harmPerSecond`, `harmDealt` and `harmTicks`; the BODY behind it is the hero.
   */
  private readonly suit: E8HumanSuit;
  private readonly extraSuits = new Map<number, E8HumanSuit>();
  private readonly damageByActor = new Map<number, number>();
  private runsOnAir = 0;
  private breathlessPans = 0;
  private windowHeldPans = 0;
  /**
   * THE WINDOW, since `tasks/e8-air-wall-all-maps.md`: the seven lines that used to live here as
   * `elapsedSeconds` / `windowIndex` / `creditedThisWindow` / `syncWindow` moved verbatim into
   * `src/systems/E8AirWindow.ts` so `E8SuitAirSystem` enforces THE SAME LAW on the era's other
   * three maps rather than a copy of it. Behaviour is unchanged, and the Mare Claim's own idle
   * floor (`fnv1a32:32f62335`) is what proves it.
   */
  private readonly clock: E8AirWindow;
  private readonly worked = new Set<number>();
  private readonly domes: DomeState[];

  private constructor(
    private readonly declared: boolean,
    private readonly wall: 'suit-timer' | 'suit-only' | null,
    domes: readonly Rect[],
    private readonly grounds: number,
    /** `twist.atmosphere.regolithRequired`, or null for the ratified default. */
    private readonly authoredRequired: number | null = null,
    /** `twist.atmosphere.regolithWindowWaves`, or null for no window at all. */
    private readonly windowWaves: number | null = null,
    /** Seconds per wave on THIS contract — `Balance.waves.waveInterval` over its own cadence. */
    private readonly waveSeconds: number = Balance.waves.waveInterval,
    /** `twist.atmosphere.suitSeconds`, already defaulted to `SUIT_AIR_SECONDS`. */
    suitSeconds: number = SUIT_AIR_SECONDS,
    /** `twist.atmosphere.harmPerSecond`, or null where the contract authors no harm. */
    harmPerSecond: number | null = null,
    private readonly pressureShape: 'rect' | 'ellipse' = 'rect',
  ) {
    this.suit = new E8HumanSuit(suitSeconds, harmPerSecond);
    this.domes = domes.map((zone) => ({ zone, air: 1, breached: false, breaches: 0, siegers: 0 }));
    this.clock = new E8AirWindow(this.windowSeconds);
  }

  /** One read of the CONTRACT, never the epoch — the same rule every era consumer follows. */
  static create(contract: ContractManifest): E8AtmosphereSystem {
    const atmosphere = contract.tileParams.atmosphere;
    // THE PRESSURISED GROUND. The contract names it where it cares to
    // (`twist.atmosphere.pressurisedZoneIds`); where it names nothing, the derivation this file
    // shipped with stands — the `dome-cluster` build pads, by prefix. Naming the rule rather than
    // the ids is what lets a re-authored pad list stay honest (`E8SuitAirSystem.create`'s note).
    const pressurised = authoredPressurisedZoneIds(contract);
    const domes = (contract.tileParams.buildZones ?? []).filter(({ id }) => (
      pressurised === null ? id.startsWith(DOME_ZONE_PREFIX) : pressurised.includes(id)
    ));
    const grounds = contract.tileParams.harvestAnchors?.length ?? 0;
    if (
      !AIR_WALL_CONTRACT_IDS.includes(contract.id)
      || atmosphere?.airIsWall !== true
      || atmosphere.outsideDomes !== 'suit-timer'
      || domes.length === 0
      || grounds === 0
    ) return E8AtmosphereSystem.none();
    // THE AUTHORED READ. The door already refuses malformed shapes
    // (`validateContractTwistAtmosphere`); this second belt exists because a run can be booted from
    // a tape or a room whose manifest never passed the door, and the honest answer there is the
    // RATIFIED DEFAULT rather than a crash or a made-up number.
    const authored = contract.twist.atmosphere;
    const required = positiveInteger(authored?.regolithRequired);
    const windowWaves = positiveInteger(authored?.regolithWindowWaves) ?? REGOLITH_WINDOW_WAVES_DEFAULT;
    const waveSeconds = Balance.waves.waveInterval / Math.max(0.1, contract.twist.waveCadenceMult ?? 1);
    return new E8AtmosphereSystem(
      true,
      atmosphere.outsideDomes,
      domes,
      grounds,
      required,
      windowWaves,
      waveSeconds,
      authoredSuitSeconds(contract),
      authoredHarmPerSecond(contract),
      authored?.pressurisedZoneShape ?? 'rect',
    );
  }

  static none(): E8AtmosphereSystem {
    return new E8AtmosphereSystem(false, null, [], 0);
  }

  private suitForActor(actorId: number): E8HumanSuit {
    if (actorId === 0) return this.suit;
    let suit = this.extraSuits.get(actorId);
    if (!suit) { suit = new E8HumanSuit(this.suit.capacity, this.suit.harmPerSecond); this.extraSuits.set(actorId, suit); }
    return suit;
  }

  suitDiagnostics(actorId = 0): E8HumanSuitDiagnostics {
    return (actorId === 0 ? this.suit : this.extraSuits.get(actorId) ?? this.suit).diagnostics;
  }

  captureSuspend() {
    return {
      declared: this.declared, pressureShape: this.pressureShape, suit: this.suit.captureSuspend(),
      extraSuits: [...this.extraSuits].sort(([a], [b]) => a - b).map(([id, suit]) => ({ id, state: suit.captureSuspend() })), clock: this.clock.captureSuspend(),
      worked: [...this.worked], runsOnAir: this.runsOnAir, breathlessPans: this.breathlessPans,
      windowHeldPans: this.windowHeldPans,
      domes: this.domes.map(({ zone, ...state }) => ({ id: zone.id, ...state })),
    };
  }

  restoreSuspend(value: unknown): boolean {
    if (value === null || typeof value !== 'object') return false;
    const state = value as ReturnType<E8AtmosphereSystem['captureSuspend']>;
    const extraSuits = state.extraSuits ?? [];
    if (state.declared !== this.declared
      || (state.pressureShape === undefined ? 'rect' : state.pressureShape) !== this.pressureShape
      || !Array.isArray(extraSuits) || extraSuits.length > 64
      || new Set(extraSuits.map((entry) => entry?.id)).size !== extraSuits.length
      || !extraSuits.every((entry) => entry && Number.isSafeInteger(entry.id) && entry.id > 0
        && new E8HumanSuit(this.suit.capacity, this.suit.harmPerSecond).restoreSuspend(entry.state))
      || ![state.runsOnAir, state.breathlessPans, state.windowHeldPans].every((n) => Number.isSafeInteger(n) && n >= 0)
      || !Array.isArray(state.worked) || state.worked.length > this.grounds
      || new Set(state.worked).size !== state.worked.length
      || !state.worked.every((n) => Number.isInteger(n) && n >= 0 && n < this.grounds)
      || !Array.isArray(state.domes) || state.domes.length !== this.domes.length
      || !state.domes.every((d, i) => d && d.id === this.domes[i].zone.id
        && Number.isFinite(d.air) && d.air >= 0 && d.air <= 1 && typeof d.breached === 'boolean'
        && Number.isSafeInteger(d.breaches) && d.breaches >= 0 && Number.isSafeInteger(d.siegers) && d.siegers >= 0)
      || !new E8HumanSuit(this.suit.capacity, this.suit.harmPerSecond).restoreSuspend(state.suit)
      || !new E8AirWindow(this.windowSeconds).restoreSuspend(state.clock)) return false;
    this.suit.restoreSuspend(state.suit);
    this.extraSuits.clear();
    for (const entry of extraSuits) this.suitForActor(entry.id).restoreSuspend(entry.state);
    this.clock.restoreSuspend(state.clock);
    this.worked.clear();
    for (const ground of state.worked) this.worked.add(ground);
    this.runsOnAir = state.runsOnAir;
    this.breathlessPans = state.breathlessPans;
    this.windowHeldPans = state.windowHeldPans;
    state.domes.forEach((d, i) => {
      const dome = this.domes[i];
      dome.air = d.air; dome.breached = d.breached; dome.breaches = d.breaches; dome.siegers = d.siegers;
    });
    return true;
  }

  get isDeclared(): boolean {
    return this.declared;
  }

  /** The latch: true on every contract that declares no air wall, so no admitted terminal moves. */
  get objectiveAllowsSecure(): boolean {
    return !this.declared || this.worked.size >= this.required;
  }

  /** The gate's own number, clamped to what the map actually authors. */
  private get required(): number {
    return Math.min(this.authoredRequired ?? REGOLITH_GROUNDS_FOR_SECURE, this.grounds);
  }

  /** Seconds one window lasts, or null where the contract authors no window. */
  private get windowSeconds(): number | null {
    return this.windowWaves === null ? null : this.windowWaves * this.waveSeconds;
  }

  /**
   * One fixed step. Domes first (a sieger on the pad breaches it; a clear pad seals), then the
   * HUMAN's suit against the dome SHE stands in. Order matters and is fixed: the suit reads the
   * dials this step already moved, in both runtimes of this engine.
   *
   * `human` is the hero's position, and it is the only body this consumer measures since
   * 2026-09-07 (`E8HumanSuit`). The Prospector used to be the argument here; it is a made agent
   * and does not breathe, so nothing is measured against it any more.
   *
   * RETURNS THE HP THE CALLER OWES `CombatSystem` this step, in whole `harmPerSecond` charges —
   * `HollowCrossingSystem.update`'s shape, and for its reason: one damage resolver, and a
   * measurement class that returns harm rather than applying it can be read without reading combat.
   */
  update(delta: number, human: Point, siegers: readonly Sieger[]): number {
    return this.updateActors(delta, [{ id: 0, position: human }], siegers).get(0) ?? 0;
  }

  updateActors(delta: number, humans: readonly E8AirActor[], siegers: readonly Sieger[]): ReadonlyMap<number, number> {
    this.damageByActor.clear();
    if (!this.declared || delta <= 0) return this.damageByActor;
    // The run clock first, so the dials, the suit and the window all read one tick.
    this.clock.advance(delta);
    for (const dome of this.domes) {
      let count = 0;
      for (const sieger of siegers) if (sieger.isAlive && pressureZoneContains(dome.zone, sieger.position, this.pressureShape)) count += 1;
      const breached = count > 0;
      if (breached && !dome.breached) dome.breaches += 1;
      dome.breached = breached;
      dome.siegers = count;
      dome.air = breached
        ? Math.max(0, dome.air - delta / DOME_AIR_DRAIN_SECONDS)
        : Math.min(1, dome.air + delta / DOME_AIR_REFILL_SECONDS);
    }
    for (const human of [...humans].sort((a, b) => a.id - b.id)) {
      const breathing = this.domes.find((dome) => dome.air > 0 && pressureZoneContains(dome.zone, human.position, this.pressureShape)) ?? null;
      this.damageByActor.set(human.id, this.suitForActor(human.id).update(delta, breathing?.zone.id ?? null));
    }
    return this.damageByActor;
  }

  /**
   * A pan tick landed on the ground `anchorIndex`. Credited toward the regolith run only while THE
   * HUMAN's suit holds air; otherwise counted as breathless and NOT credited. Returns whether it
   * counted.
   *
   * WHOSE AIR GATES THE CLAIM, since 2026-09-07: hers. The pan is still the Prospector's work — the
   * agent walks the seam and the caller has already paid the rider — but a claim is not made by a
   * machine working over a suffocating surveyor, so a ground worked while her dial reads zero banks
   * nothing. That is the same sentence the briefing prints, now about the body that can die of it.
   */
  notePan(anchorIndex: number, actorId = 0): boolean {
    if (!this.declared || !Number.isInteger(anchorIndex) || anchorIndex < 0) return false;
    if (this.suitForActor(actorId).empty) {
      this.breathlessPans += 1;
      return false;
    }
    this.runsOnAir += 1;
    // THE WINDOW sits between "on air" and "banked", and only there: a breathless pan is refused
    // exactly as before, a pan on a ground already banked still counts as work on air exactly as
    // before, and only a FRESH ground in a window that has already credited one is held back —
    // counted as `windowHeldPans`, credited to nothing. Nothing about the pan's GOLD changes: this
    // class mints nothing and the caller has already paid the rider (`HeadlessContractSim`'s
    // harvest path), which is what keeps both runtimes of this engine on one board.
    if (this.worked.has(anchorIndex)) return true;
    if (!this.clock.claim()) {
      this.windowHeldPans += 1;
      return false;
    }
    this.worked.add(anchorIndex);
    return true;
  }

  get suitEmpty(): boolean {
    return this.declared && this.suit.empty;
  }

  get diagnostics(): E8AtmosphereDiagnostics {
    return {
      declared: this.declared,
      wall: this.wall,
      suit: this.suit.diagnostics,
      domes: this.domes.map((dome) => ({
        id: dome.zone.id,
        air: round3(dome.air),
        breached: dome.breached,
        breaches: dome.breaches,
        siegers: dome.siegers,
      })),
      regolith: {
        grounds: this.grounds,
        required: this.required,
        worked: [...this.worked].sort((left, right) => left - right),
        runsOnAir: this.runsOnAir,
        breathlessPans: this.breathlessPans,
        complete: this.objectiveAllowsSecure && this.declared,
        windowWaves: this.windowWaves,
        window: this.clock.window,
        creditedThisWindow: this.clock.creditedThisWindow,
        windowHeldPans: this.windowHeldPans,
      },
    };
  }
}

/** Pressure footprint within an authored zone; placement and crossing masks remain rectangular. */
export function pressureZoneContains(zone: Rect, point: Point, shape: 'rect' | 'ellipse' = 'rect'): boolean {
  if (shape === 'ellipse') {
    const radiusX = (zone.maxX - zone.minX) / 2, radiusZ = (zone.maxZ - zone.minZ) / 2;
    if (radiusX <= 0 || radiusZ <= 0) return false;
    const x = (point.x - (zone.minX + radiusX)) / radiusX;
    const z = (point.z - (zone.minZ + radiusZ)) / radiusZ;
    return x * x + z * z <= 1;
  }
  return point.x >= zone.minX && point.x <= zone.maxX && point.z >= zone.minZ && point.z <= zone.maxZ;
}
