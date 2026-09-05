import { Balance } from '../game/Balance';
import type { ContractBuildZone, ContractManifest, ContractRectZone } from '../meta/ContractFamilies';
import {
  DOME_AIR_DRAIN_SECONDS,
  DOME_AIR_REFILL_SECONDS,
  DOME_ZONE_PREFIX,
  REGOLITH_GROUNDS_FOR_SECURE,
  SUIT_AIR_SECONDS,
  SUIT_REFILL_PER_SECOND,
  type E8AtmosphereDiagnostics,
} from './E8PhysicsSystem';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// E8 — AIR AS THE WALL ON THE MARE CLAIM'S THREE SIBLINGS (`tasks/e8-remaining-maps.md`, 2026-09-05).
//
// WHAT SHIPPED BEFORE THIS FILE, AND WHAT DID NOT. `e8-mare-claim-physics` (drain review
// `reviews/e8-mare-claim-physics.md`, 2026-09-04) composed `E8PhysicsSystem` into the headless
// door and wrote `E8AtmosphereSystem` beside it: a suit timer, a breach dial per dome pad, and a
// regolith latch that gates the secure. That consumer is ID-SCOPED to the Mare Claim on purpose
// (`AIR_WALL_CONTRACT_IDS`), and `tasks/e8-remaining-maps.md`'s firewall forbids changing its
// behaviour. So this file is the siblings' own consumer rather than a widened gate, and the Mare
// Claim's guard keeps asserting, verbatim and green, that `e8-eclipse`, `e8-low-orbit` and
// `e8-far-side` never arm `E8AtmosphereSystem` (`scripts/e8-mare-claim-physics.test.mjs`).
//
// MEASURED FIRST, 2026-09-05 (`artifacts/e8-remaining-maps/baseline.json`): all three siblings
// ALREADY publish `now.gravity` off the shipped profile (floaty 0.6g and 2.4x arcs on the Far Side
// and the Eclipse, free-fall and 4.8x on Low Orbit), because `HeadlessContractSim` constructs
// `E8PhysicsSystem` from the manifest for every contract. The 2026-09-02 audit rows that call the
// gravity half absent are STALE, exactly as the master says. None of the three published `now.air`.
// The gravity half was already composed; THE AIR HALF IS WHAT THIS FILE ADDS.
//
// WHAT IT DOES, HONESTLY BOUNDED. Like `E8AtmosphereSystem` before it, this is a MEASUREMENT of
// one body against authored rectangles on the fixed step, plus an objective latch. It damages
// nothing and mints nothing: the browser composes no atmosphere consumer at all, so a rule that
// hurt the body or paid it would put the two engines on different boards for the same orders (the
// Same Laws law, `specs/epoch-saga/CAPABILITY-LADDER.md` L7). What CAN differ without breaking
// that law is what counts toward the era's objective, and that is all this changes.
//
// EVERY NUMBER IS INHERITED, NEVER INVENTED (the master's "no new balance number"): the suit's
// capacity and refill, the shelter drain and reseal windows, and the count of grounds a claim must
// work all come from `E8PhysicsSystem`'s ratified exports. Every RECTANGLE is read off the
// contract; nothing here authors geometry. The only authored decisions are the three derivations
// named at their sites below (which zones are shelters, which are crossings, which dome keeps its
// reserve), each derived from data the contract already carries.
//
// THE THREE MAPS, EACH AGAINST ITS OWN AUDIT ROW (`docs/audits/2026-09-02-era-mechanic-audit.md`):
//   · `e8-far-side` ("route crossing movement through the gravity profile and make suit-air across
//     the vacuum zone part of the secure latch"). The gravity profile is already on the crossing:
//     the Prospector is the body a rider moves and the map is `suit-only` end to end. The new half
//     is the latch: the authored probe crater counts as CROSSED only if the suit still holds air
//     when the body stands in it. The lander's yard is the one breathable ground, so the crossing
//     is a round-trip air budget rather than a one-way trap.
//   · `e8-low-orbit` ("route headless movement through handhold/drift scaling and add the
//     atmosphere-wall/suit-air half; keep the proven returning-lob seam"). The drift scaling is
//     already routed: `HeadlessContractSim.e8PhysicsIntents` passes `LowOrbitSystem`'s per-position
//     `controlScale`/`speedScale` into `filterMovement`, and `LowOrbitSystem` is untouched here, so
//     the returning-lob seam keeps working exactly as it was proven. The new half is the air: the
//     three authored scaffold decks are the only pressurised ground in the yard, and crossing the
//     spine to reach every one of them on suit air is what opens the secure.
//   · `e8-eclipse` ("compose gravity/air first, then make the eclipse remove an air/energy route
//     the rider must transfer around"). Gravity was already composed; air arrives here with the
//     same dome dials and the same regolith latch the Mare Claim proved. Then the contract's own
//     `twist.eclipseEvent` takes the solar-fed domes OFFLINE mid-run and leaves one reserve, so a
//     rider refilling at a rim pad must transfer to the reserve, and one ground has to be worked on
//     air AFTER the shadow lands. That is the map's declared teaching intent, "reserves are love
//     letters to your future self", made into a gate.
//
// SCOPED BY ID AND BY DATA, in the `HollowCrossingSystem.create` shape. Every other contract,
// including the Mare Claim, gets `none()`: an inert consumer that is never declared, publishes
// nothing on the view, adds nothing to the hash, and answers true to the secure latch. That is
// what keeps the Mare Claim byte-identical under this diff.
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * The three siblings. The Mare Claim is deliberately ABSENT: its air is `E8AtmosphereSystem`'s and
 * stays there, one writer per surface. See F-E8RM-1 in `artifacts/e8-remaining-maps/report.md` for
 * the consolidation this split owes once the firewall on that file lifts.
 */
export const SUIT_AIR_CONTRACT_IDS: readonly string[] = ['e8-far-side', 'e8-low-orbit', 'e8-eclipse'];

type Point = Readonly<{ x: number; z: number }>;
type Rect = Readonly<{ id: string; minX: number; maxX: number; minZ: number; maxZ: number }>;
type Sieger = Readonly<{ isAlive: boolean; position: Point }>;

/** The Far Side and Low Orbit gate on this; the Eclipse declares no crossing and omits the block. */
export type E8CrossingAirDiagnostics = Readonly<{
  /** Every authored zone the crossing counts, in contract order. */
  zones: readonly string[];
  required: number;
  /** The ones the body has stood in WITH air, in contract order. */
  reached: readonly string[];
  /** Entries made with an empty suit. Counted, credited to nothing. */
  breathlessEntries: number;
  complete: boolean;
}>;

/** The Eclipse alone. Absent from every other contract's view, so no other row grows a field. */
export type E8EclipseAirDiagnostics = Readonly<{
  arrived: boolean;
  /**
   * NULL UNTIL IT ARRIVES, and that is the contract speaking: `twist.eclipseEvent.firstRunWarning`
   * is authored `false`, so publishing a countdown would be the warning the map refuses to give.
   * After the shadow lands the wave is published, because by then it is history a rider can read.
   */
  arrivedAtWave: number | null;
  /** The shelters the shadow took off solar power, in contract order. */
  offline: readonly string[];
  /** The one shelter that keeps its reserve, so the map stays winnable (L2). */
  reserve: string | null;
  solar: 'online' | 'offline';
  /** Grounds worked ON SUIT AIR since the shadow landed, and how many the secure needs. */
  groundsWorkedAfter: number;
  requiredAfter: number;
}>;

/**
 * The Mare Claim's own diagnostics shape plus two optional, contract-scoped blocks. Identical
 * `wall`/`suit`/`domes`/`regolith` rows mean `View.readAir` reads ONE shape for all four E8 maps
 * and the rider view needs no version bump (`scripts/view-schema-guard.test.mjs` builds its
 * canonical view from `the-claim`, which declares no air at all, so contract-scoped fields are
 * unregistered by design: F-E8MC-1).
 */
export type E8SuitAirDiagnostics = E8AtmosphereDiagnostics & Readonly<{
  crossing?: E8CrossingAirDiagnostics;
  eclipse?: E8EclipseAirDiagnostics;
}>;

type ShelterState = {
  readonly zone: Rect;
  air: number;
  breached: boolean;
  breaches: number;
  siegers: number;
  offline: boolean;
};

type EclipseConfig = Readonly<{ atWave: number; reserveId: string }>;

export class E8SuitAirSystem {
  private suitSeconds: number;
  private inShelter: string | null = null;
  private drainedTotal = 0;
  private emptySeconds = 0;
  private runsOnAir = 0;
  private runsOnAirAfterEclipse = 0;
  private breathlessPans = 0;
  private breathlessEntries = 0;
  private eclipseArrivedAtWave: number | null = null;
  private readonly worked = new Set<number>();
  private readonly reached = new Set<string>();
  private readonly insideCrossing = new Set<string>();
  private readonly shelters: ShelterState[];

  private constructor(
    private readonly declared: boolean,
    private readonly wall: 'suit-timer' | 'suit-only' | null,
    shelters: readonly Rect[],
    /** Only a contract whose air IS a wall lets a sieger breach a shelter. */
    private readonly breachable: boolean,
    private readonly crossings: readonly Rect[],
    private readonly grounds: number,
    private readonly eclipse: EclipseConfig | null,
  ) {
    this.suitSeconds = SUIT_AIR_SECONDS;
    this.shelters = shelters.map((zone) => ({ zone, air: 1, breached: false, breaches: 0, siegers: 0, offline: false }));
  }

  /**
   * One read of the CONTRACT, never the epoch, and never of geometry this file invents. The three
   * derivations are named here so a reader can check each against the contract JSON:
   *
   *   1. SHELTERS. `suit-timer` maps take the `dome-cluster` build pads, by the same prefix the
   *      Mare Claim's consumer uses (`DOME_ZONE_PREFIX`). `suit-only` maps take their authored
   *      `orbitalScaffoldZones` when they have any (Low Orbit's three pressurised decks), and
   *      otherwise the build zone that CONTAINS THE RUN'S OWN START STAKE (the Far Side's
   *      `far-side-landing-yard`, which holds `far-side-landing-stake` with `heroStart: true`).
   *      A lander is where the air is; nothing else on that map is a structure.
   *   2. CROSSINGS. The authored `probeRecoveryZones` where the contract declares them (the Far
   *      Side's listening-probe crater), else the authored `orbitalScaffoldZones` (Low Orbit's
   *      decks, which are both the shelters and the thing the spine connects). None where neither
   *      is declared, which is the Eclipse: it rides the regolith latch instead.
   *   3. THE RESERVE. The shelter nearest the map origin, ties broken by contract order. On the
   *      Eclipse's three pads that is `dome-cluster-pad-center`, and the rule is stated rather than
   *      the id, so a re-authored pad list cannot silently leave the map with no reserve at all.
   */
  static create(contract: ContractManifest): E8SuitAirSystem {
    const tile = contract.tileParams;
    const atmosphere = tile.atmosphere;
    if (!SUIT_AIR_CONTRACT_IDS.includes(contract.id) || atmosphere === undefined) return E8SuitAirSystem.none();
    const buildZones: readonly ContractBuildZone[] = tile.buildZones ?? [];
    const scaffolds: readonly ContractRectZone[] = tile.orbitalScaffoldZones ?? [];
    const craters: readonly ContractRectZone[] = tile.probeRecoveryZones ?? [];
    const startStake = tile.stakeMarkers?.find((marker) => marker.heroStart) ?? null;
    const shelters: readonly Rect[] = atmosphere.outsideDomes === 'suit-timer'
      ? buildZones.filter(({ id }) => id.startsWith(DOME_ZONE_PREFIX)).map(rect)
      : scaffolds.length > 0
        ? scaffolds.map(rect)
        : buildZones.filter((zone) => startStake !== null && inside(rect(zone), startStake)).map(rect);
    const crossings: readonly Rect[] = craters.length > 0 ? craters.map(rect) : scaffolds.map(rect);
    if (shelters.length === 0) return E8SuitAirSystem.none();
    const eclipseEvent = contract.twist.eclipseEvent;
    const secureWave = contract.twist.secureWave ?? Balance.run.secureWave;
    const reserve = nearestToOrigin(shelters);
    const eclipse: EclipseConfig | null = eclipseEvent !== undefined && reserve !== null
      // MID-RUN, read off the run's own declared boundary rather than a number this file picks:
      // half of the wave the contract secures at. Nothing new to tune, and a re-authored
      // `twist.secureWave` moves the shadow with it.
      ? { atWave: Math.max(1, Math.ceil(secureWave / 2)), reserveId: reserve.id }
      : null;
    return new E8SuitAirSystem(
      true,
      atmosphere.outsideDomes,
      shelters,
      atmosphere.airIsWall === true,
      crossings,
      tile.harvestAnchors?.length ?? 0,
      eclipse,
    );
  }

  /** The undeclared case, reified so every caller holds a consumer rather than a null. */
  static none(): E8SuitAirSystem {
    return new E8SuitAirSystem(false, null, [], false, [], 0, null);
  }

  get isDeclared(): boolean {
    return this.declared;
  }

  /**
   * THE LATCH, in the canyon-connect shape every other era consumer uses. True on every contract
   * that declares no suit air, so no admitted contract's terminal moves.
   *
   *   · a crossing map (Far Side, Low Orbit) secures once every authored crossing zone has been
   *     stood in WITH air;
   *   · the Eclipse secures once the regolith run is made on air AND, if the shadow has already
   *     landed, one more ground has been worked on air since it did.
   */
  get objectiveAllowsSecure(): boolean {
    if (!this.declared) return true;
    if (this.crossings.length > 0) return this.reached.size >= this.crossings.length;
    if (this.worked.size < this.requiredGrounds) return false;
    return !this.eclipseArrived || this.runsOnAirAfterEclipse >= this.requiredAfterEclipse;
  }

  /** The Mare Claim's own gate number, clamped to what this map actually authors. */
  private get requiredGrounds(): number {
    return this.crossings.length > 0 ? 0 : Math.min(REGOLITH_GROUNDS_FOR_SECURE, this.grounds);
  }

  private get requiredAfterEclipse(): number {
    return this.eclipse === null ? 0 : Math.min(REGOLITH_GROUNDS_FOR_SECURE, this.grounds);
  }

  private get eclipseArrived(): boolean {
    return this.eclipseArrivedAtWave !== null;
  }

  get suitEmpty(): boolean {
    return this.declared && this.suitSeconds <= 0;
  }

  /**
   * One fixed step, in `E8AtmosphereSystem.update`'s order and for the same reason: the shadow
   * first (it changes which shelters can breathe at all), then the shelters, then the suit against
   * the shelter it stands in, then the crossing the body is or is not making on that air.
   */
  update(delta: number, body: Point, siegers: readonly Sieger[], wave: number): void {
    if (!this.declared || delta <= 0) return;
    if (this.eclipse !== null && !this.eclipseArrived && wave >= this.eclipse.atWave) {
      this.eclipseArrivedAtWave = wave;
      for (const shelter of this.shelters) shelter.offline = shelter.zone.id !== this.eclipse.reserveId;
    }
    for (const shelter of this.shelters) {
      let count = 0;
      if (this.breachable) {
        for (const sieger of siegers) if (sieger.isAlive && inside(shelter.zone, sieger.position)) count += 1;
      }
      const breached = count > 0;
      if (breached && !shelter.breached) shelter.breaches += 1;
      shelter.breached = breached;
      shelter.siegers = count;
      // An OFFLINE shelter has lost its solar life support: it drains like a breached one and can
      // never reseal, which is the route the eclipse removes.
      shelter.air = breached || shelter.offline
        ? Math.max(0, shelter.air - delta / DOME_AIR_DRAIN_SECONDS)
        : Math.min(1, shelter.air + delta / DOME_AIR_REFILL_SECONDS);
    }
    const breathing = this.shelters.find((shelter) => shelter.air > 0 && inside(shelter.zone, body)) ?? null;
    this.inShelter = breathing?.zone.id ?? null;
    if (breathing) {
      this.suitSeconds = Math.min(SUIT_AIR_SECONDS, this.suitSeconds + delta * SUIT_REFILL_PER_SECOND);
    } else {
      const drained = Math.min(this.suitSeconds, delta);
      this.suitSeconds -= drained;
      this.drainedTotal += drained;
      if (this.suitSeconds <= 0) this.emptySeconds += delta;
    }
    this.noteCrossings(body);
  }

  /**
   * The crossing, measured off the body the rider actually moves. An ENTRY is what counts, not a
   * step: a body parked in the crater with an empty suit is one refused crossing, not thirty a
   * second. Credit is not one-way in the other direction either, and deliberately so: a rider who
   * arrives breathless can walk back to the air and cross again, so a mistake costs a trip rather
   * than the run (`CAPABILITY-LADDER.md` L2, unwinnable-by-construction is a bug class).
   */
  private noteCrossings(body: Point): void {
    for (const zone of this.crossings) {
      const within = inside(zone, body);
      if (!within) {
        this.insideCrossing.delete(zone.id);
        continue;
      }
      if (this.insideCrossing.has(zone.id)) continue;
      this.insideCrossing.add(zone.id);
      if (this.suitSeconds > 0) this.reached.add(zone.id);
      else this.breathlessEntries += 1;
    }
  }

  /**
   * A pan tick landed on the ground `anchorIndex`. Credited toward the run only while the suit
   * holds air; otherwise counted as breathless and NOT credited. Returns whether it counted. The
   * rule and the wording are `E8AtmosphereSystem.notePan`'s, because it is the same rule.
   */
  notePan(anchorIndex: number): boolean {
    if (!this.declared || !Number.isInteger(anchorIndex) || anchorIndex < 0) return false;
    if (this.suitSeconds <= 0) {
      this.breathlessPans += 1;
      return false;
    }
    this.runsOnAir += 1;
    if (this.eclipseArrived) this.runsOnAirAfterEclipse += 1;
    this.worked.add(anchorIndex);
    return true;
  }

  get diagnostics(): E8SuitAirDiagnostics {
    const zones = this.crossings.map(({ id }) => id);
    return {
      declared: this.declared,
      wall: this.wall,
      suit: {
        body: 'prospector',
        seconds: round3(this.suitSeconds),
        capacity: SUIT_AIR_SECONDS,
        refillPerSecond: SUIT_REFILL_PER_SECOND,
        inDome: this.inShelter,
        empty: this.suitEmpty,
        drainedTotal: round3(this.drainedTotal),
        emptySeconds: round3(this.emptySeconds),
      },
      domes: this.shelters.map((shelter) => ({
        id: shelter.zone.id,
        air: round3(shelter.air),
        breached: shelter.breached,
        breaches: shelter.breaches,
        siegers: shelter.siegers,
      })),
      regolith: {
        grounds: this.grounds,
        required: this.requiredGrounds,
        worked: [...this.worked].sort((left, right) => left - right),
        runsOnAir: this.runsOnAir,
        breathlessPans: this.breathlessPans,
        complete: this.objectiveAllowsSecure && this.declared,
      },
      ...(this.crossings.length > 0
        ? {
            crossing: {
              zones,
              required: this.crossings.length,
              reached: zones.filter((id) => this.reached.has(id)),
              breathlessEntries: this.breathlessEntries,
              complete: this.reached.size >= this.crossings.length,
            },
          }
        : {}),
      ...(this.eclipse !== null
        ? {
            eclipse: {
              arrived: this.eclipseArrived,
              arrivedAtWave: this.eclipseArrivedAtWave,
              offline: this.shelters.filter((shelter) => shelter.offline).map((shelter) => shelter.zone.id),
              reserve: this.eclipse.reserveId,
              solar: this.eclipseArrived ? 'offline' : 'online',
              groundsWorkedAfter: this.runsOnAirAfterEclipse,
              requiredAfter: this.requiredAfterEclipse,
            },
          }
        : {}),
    };
  }
}

function rect(zone: Rect): Rect {
  return { id: zone.id, minX: zone.minX, maxX: zone.maxX, minZ: zone.minZ, maxZ: zone.maxZ };
}

function inside(zone: Rect, point: Point): boolean {
  return point.x >= zone.minX && point.x <= zone.maxX && point.z >= zone.minZ && point.z <= zone.maxZ;
}

function nearestToOrigin(zones: readonly Rect[]): Rect | null {
  let best: Rect | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const zone of zones) {
    const x = (zone.minX + zone.maxX) / 2;
    const z = (zone.minZ + zone.maxZ) / 2;
    const distance = Math.hypot(x, z);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = zone;
    }
  }
  return best;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
