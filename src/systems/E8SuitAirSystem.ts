import { Balance } from '../game/Balance';
import type { ContractBuildZone, ContractManifest, ContractRectZone } from '../meta/ContractFamilies';
import { E8AirWindow, positiveInteger } from './E8AirWindow';
import {
  DOME_AIR_DRAIN_SECONDS,
  DOME_AIR_REFILL_SECONDS,
  DOME_ZONE_PREFIX,
  E8HumanSuit,
  REGOLITH_GROUNDS_FOR_SECURE,
  SUIT_AIR_SECONDS,
  authoredHarmPerSecond,
  authoredPressurisedZoneIds,
  authoredSuitSeconds,
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
// WHAT IT DOES, HONESTLY BOUNDED. Like `E8AtmosphereSystem` beside it, this is a MEASUREMENT of one
// body against authored rectangles on the fixed step, plus an objective latch — and, since
// 2026-09-07, a HARM the caller routes through `CombatSystem`. It still mints nothing.
//
// THE BODY CHANGED, 2026-09-07 (owner directive, verbatim: "I want space experiences of humans to
// need them having air. It has to be logical. If that means we have to change something ok"). Until
// then this consumer measured the PROSPECTOR — a made agent, the town's brass firstborn — and
// published `suit.body: 'prospector'`. It now measures the HERO, the human body a rider steers with
// `MOVE_HERO`, because she is the one the storybook says breathes and the one who can die of not.
// See `E8HumanSuit` in `src/systems/E8PhysicsSystem.ts` for the canon citations and the measurement
// that forced it: on the securing tapes the human spent 0 of 600 s outside pressurised ground on
// the Far Side and Low Orbit, and 601 of 600 s outside it on the Mare Claim.
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
//     the returning-lob seam keeps working exactly as it was proven. The new half is the air.
//     ⚠️ THE GEOGRAPHY WAS WRONG UNTIL 2026-09-07 (F-EAWA-2, `reviews/e8-air-wall-all-maps.md`):
//     all three scaffold decks were BOTH the pressurised ground and the thing to be crossed, so a
//     breathless entry was unreachable by construction and the wall was a schedule rather than an
//     air budget. The contract now names its pressurised ground — `claw-carcass-yard`, the Claw's
//     carcass rebuilt as the town's first orbital yard, the one place on this map with a cabin —
//     and the two outboard decks are open scaffolding in vacuum, which is what scaffolding is.
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
  /**
   * HOW MANY CREDITED CROSSINGS THE LATCH NEEDS. Without authored numbers this keeps its original
   * meaning — the count of authored zones, every one of which must be stood in on air. With
   * `twist.atmosphere.crossingRequired` it is that number of CREDITS, of any authored zone, and
   * every zone must still have been stood in on air at least once (the conjunct is deliberate:
   * this rule can only ever be stricter than the one it replaces).
   */
  required: number;
  /** The ones the body has stood in WITH air, in contract order. Never window-gated. */
  reached: readonly string[];
  /** Credits banked toward the latch. Equals `reached.length` where no window is authored. */
  credited: number;
  /** Entries made with an empty suit. Counted, credited to nothing. */
  breathlessEntries: number;
  /**
   * THE WINDOW, published for the same reason the Mare Claim publishes its own: a rider that
   * cannot see which window it stands in is guessing at a 1/30 s sliver. Null `windowWaves` means
   * every entry made on air counts whenever it is made.
   */
  windowWaves: number | null;
  /** Which window the run clock stands in, zero-based; always 0 while no window is authored. */
  window: number;
  /** Crossings credited toward the latch inside THIS window. At most one while a window is authored. */
  creditedThisWindow: number;
  /** Entries made ON AIR that the window refused. Counted, credited to nothing, still `reached`. */
  windowHeldEntries: number;
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

/**
 * The four numbers a contract may author under `twist.atmosphere`, already read and defaulted.
 * Nulls mean "the contract authored nothing", which is the ratified pre-2026-09-06 behaviour.
 */
type AuthoredAir = Readonly<{
  regolithRequired: number | null;
  regolithWindowWaves: number | null;
  crossingRequired: number | null;
  crossingWindowWaves: number | null;
  /** `twist.atmosphere.suitSeconds`, already defaulted to `SUIT_AIR_SECONDS`. */
  suitSeconds: number;
  /** `twist.atmosphere.harmPerSecond`, or null where the contract authors no harm. */
  harmPerSecond: number | null;
  /** Seconds per wave on THIS contract — `Balance.waves.waveInterval` over its own cadence. */
  waveSeconds: number;
}>;

const NO_AUTHORED_AIR: AuthoredAir = {
  regolithRequired: null,
  regolithWindowWaves: null,
  crossingRequired: null,
  crossingWindowWaves: null,
  suitSeconds: SUIT_AIR_SECONDS,
  harmPerSecond: null,
  waveSeconds: Balance.waves.waveInterval,
};

export class E8SuitAirSystem {
  /**
   * THE HUMAN'S SUIT, since 2026-09-07. One definition, shared with the Mare Claim's consumer
   * (`E8HumanSuit` in `src/systems/E8PhysicsSystem.ts`) for the reason `E8AirWindow` exists: the
   * number the briefing prints and the number the engine enforces must be the same object.
   */
  private readonly suit: E8HumanSuit;
  private runsOnAir = 0;
  private runsOnAirAfterEclipse = 0;
  private breathlessPans = 0;
  private breathlessEntries = 0;
  private windowHeldPans = 0;
  private windowHeldEntries = 0;
  private creditedCrossings = 0;
  private eclipseArrivedAtWave: number | null = null;
  private readonly worked = new Set<number>();
  private readonly reached = new Set<string>();
  private readonly insideCrossing = new Set<string>();
  private readonly shelters: ShelterState[];
  /**
   * TWO CLOCKS, ONE LAW (`src/systems/E8AirWindow.ts`). The Eclipse rides the regolith one and the
   * two crossing maps ride the crossing one; no map declares both, because `create()` gives a map
   * crossings or grounds and never a gate on each. Both are built even so, because an object that
   * exists and is never asked is cheaper to read than a null that has to be checked at four sites.
   */
  private readonly regolithClock: E8AirWindow;
  private readonly crossingClock: E8AirWindow;

  private constructor(
    private readonly declared: boolean,
    private readonly wall: 'suit-timer' | 'suit-only' | null,
    shelters: readonly Rect[],
    /** Only a contract whose air IS a wall lets a sieger breach a shelter. */
    private readonly breachable: boolean,
    private readonly crossings: readonly Rect[],
    private readonly grounds: number,
    private readonly eclipse: EclipseConfig | null,
    /** `twist.atmosphere`, already read; `NO_AUTHORED_AIR` where the contract authors nothing. */
    private readonly authored: AuthoredAir = NO_AUTHORED_AIR,
  ) {
    this.suit = new E8HumanSuit(authored.suitSeconds, authored.harmPerSecond);
    this.shelters = shelters.map((zone) => ({ zone, air: 1, breached: false, breaches: 0, siegers: 0, offline: false }));
    this.regolithClock = new E8AirWindow(windowSeconds(authored.regolithWindowWaves, authored.waveSeconds));
    this.crossingClock = new E8AirWindow(windowSeconds(authored.crossingWindowWaves, authored.waveSeconds));
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
   *
   * AND ONE READ OF `twist.atmosphere`, added 2026-09-06 (owner ruling, verbatim: "yes, same air
   * for all space contracts - but I also never played the levels, so I dont know exactly"). The
   * four numbers are the CONTRACT's, exactly as `E8AtmosphereSystem` reads the Mare Claim's two:
   * the door refuses malformed shapes and this second belt answers with the ratified default for a
   * run booted from a tape whose manifest never passed the door.
   */
  static create(contract: ContractManifest): E8SuitAirSystem {
    const tile = contract.tileParams;
    const atmosphere = tile.atmosphere;
    if (!SUIT_AIR_CONTRACT_IDS.includes(contract.id) || atmosphere === undefined) return E8SuitAirSystem.none();
    const buildZones: readonly ContractBuildZone[] = tile.buildZones ?? [];
    const scaffolds: readonly ContractRectZone[] = tile.orbitalScaffoldZones ?? [];
    const craters: readonly ContractRectZone[] = tile.probeRecoveryZones ?? [];
    const startStake = tile.stakeMarkers?.find((marker) => marker.heroStart) ?? null;
    // THE PRESSURISED GROUND, NAMED BY THE CONTRACT (`twist.atmosphere.pressurisedZoneIds`, added
    // 2026-09-07). Where a contract names it, that list IS the answer, drawn from every rectangle
    // the map authors; where it names nothing, the three derivations below stand exactly as they
    // shipped. This is the one field the owner's "make the geography true" half needed: on Low
    // Orbit the three scaffold decks were BOTH the shelters and the crossings, so a crossing there
    // could never be breathless and the wall was a schedule rather than an air budget (F-EAWA-2).
    // Naming the station's own cabin — the carcass yard, the Claw rebuilt as the town's first
    // orbital yard — leaves the two outboard decks in vacuum, where scaffolding is.
    const pressurised = authoredPressurisedZoneIds(contract);
    const everyZone: readonly ContractRectZone[] = [...buildZones, ...scaffolds, ...craters];
    const shelters: readonly Rect[] = pressurised !== null
      ? dedupe(everyZone.filter(({ id }) => pressurised.includes(id)).map(rect))
      : atmosphere.outsideDomes === 'suit-timer'
        ? buildZones.filter(({ id }) => id.startsWith(DOME_ZONE_PREFIX)).map(rect)
        : scaffolds.length > 0
          ? scaffolds.map(rect)
          : buildZones.filter((zone) => startStake !== null && inside(rect(zone), startStake)).map(rect);
    // A CROSSING IS VACUUM, by definition and now by construction: any authored rectangle that also
    // holds air is struck off the crossing list rather than counted as one. Before this line the
    // Far Side's crater (never pressurised) was already a true crossing and Low Orbit's decks were
    // not, and nothing in the code said which was which.
    //
    // THE FILTER RIDES THE AUTHORED READ AND ONLY IT. A contract that names no pressurised ground
    // keeps the crossing list it always had, unfiltered — otherwise the fallback derivation on a
    // `suit-only` map (shelters = the scaffolds) would strike out every crossing it just derived
    // and silently move the map onto the regolith latch. The pre-2026-09-07 default is the
    // control this whole file is measured against, so it changes only where a contract asks.
    const shelterIds = new Set(pressurised === null ? [] : shelters.map(({ id }) => id));
    const crossings: readonly Rect[] = (craters.length > 0 ? craters : scaffolds)
      .map(rect)
      .filter(({ id }) => !shelterIds.has(id));
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
    const authoredAir = contract.twist.atmosphere;
    const authored: AuthoredAir = {
      regolithRequired: positiveInteger(authoredAir?.regolithRequired),
      regolithWindowWaves: positiveInteger(authoredAir?.regolithWindowWaves),
      crossingRequired: positiveInteger(authoredAir?.crossingRequired),
      crossingWindowWaves: positiveInteger(authoredAir?.crossingWindowWaves),
      suitSeconds: authoredSuitSeconds(contract),
      harmPerSecond: authoredHarmPerSecond(contract),
      waveSeconds: Balance.waves.waveInterval / Math.max(0.1, contract.twist.waveCadenceMult ?? 1),
    };
    return new E8SuitAirSystem(
      true,
      atmosphere.outsideDomes,
      shelters,
      atmosphere.airIsWall === true,
      crossings,
      tile.harvestAnchors?.length ?? 0,
      eclipse,
      authored,
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
   *     stood in WITH air, and — where the contract authors `crossingRequired` — once that many
   *     crossings have been CREDITED, at most one per authored window. The conjunct is on purpose:
   *     the authored rule can then only ever be stricter than the rule it replaces, so no ride
   *     that could not secure before can secure now;
   *   · the Eclipse secures once the regolith run is made on air AND, if the shadow has already
   *     landed, one more ground has been worked on air since it did.
   */
  get objectiveAllowsSecure(): boolean {
    if (!this.declared) return true;
    if (this.crossings.length > 0) {
      return this.reached.size >= this.crossings.length && this.creditedCrossings >= this.requiredCrossings;
    }
    if (this.worked.size < this.requiredGrounds) return false;
    return !this.eclipseArrived || this.runsOnAirAfterEclipse >= this.requiredAfterEclipse;
  }

  /**
   * The regolith gate: the contract's own number where it authors one, else the ratified default,
   * either way clamped to what this map actually authors. A crossing map gates on its zones and
   * carries no regolith gate at all, exactly as before.
   */
  private get requiredGrounds(): number {
    if (this.crossings.length > 0) return 0;
    return Math.min(this.authored.regolithRequired ?? REGOLITH_GROUNDS_FOR_SECURE, this.grounds);
  }

  /**
   * The crossing gate: the contract's own number of CREDITS where it authors one, else the count
   * of authored zones (the ratified pre-2026-09-06 meaning, kept verbatim so a contract that
   * authors nothing rides the wall it always rode).
   */
  private get requiredCrossings(): number {
    return this.authored.crossingRequired ?? this.crossings.length;
  }

  private get requiredAfterEclipse(): number {
    return this.eclipse === null ? 0 : Math.min(REGOLITH_GROUNDS_FOR_SECURE, this.grounds);
  }

  private get eclipseArrived(): boolean {
    return this.eclipseArrivedAtWave !== null;
  }

  get suitEmpty(): boolean {
    return this.declared && this.suit.empty;
  }

  /**
   * One fixed step, in `E8AtmosphereSystem.update`'s order and for the same reason: the shadow
   * first (it changes which shelters can breathe at all), then the shelters, then the HUMAN's suit
   * against the shelter SHE stands in, then the crossing she is or is not making on that air.
   *
   * `human` is the hero's position, and since 2026-09-07 it is the only body this consumer
   * measures. The Prospector used to be the argument here and used to be the body whose entries
   * counted as crossings; it is a made agent, it does not breathe, and a machine walking into a
   * crater was never "a space experience of a human" (the owner's directive, quoted in
   * `E8HumanSuit`). RETURNS the hp the caller owes `CombatSystem` this step.
   */
  update(delta: number, human: Point, siegers: readonly Sieger[], wave: number): number {
    if (!this.declared || delta <= 0) return 0;
    // The run clock first, so the dials, the suit, the crossing and both windows read one tick —
    // the order `E8AtmosphereSystem.update` fixed for the Mare Claim, for the same reason.
    this.regolithClock.advance(delta);
    this.crossingClock.advance(delta);
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
    const breathing = this.shelters.find((shelter) => shelter.air > 0 && inside(shelter.zone, human)) ?? null;
    const harm = this.suit.update(delta, breathing?.zone.id ?? null);
    this.noteCrossings(human);
    return harm;
  }

  /**
   * The crossing, measured off THE HUMAN BODY the rider steers with `MOVE_HERO`. An ENTRY is what counts, not a
   * step: a body parked in the crater with an empty suit is one refused crossing, not thirty a
   * second. Credit is not one-way in the other direction either, and deliberately so: a rider who
   * arrives breathless can walk back to the air and cross again, so a mistake costs a trip rather
   * than the run (`CAPABILITY-LADDER.md` L2, unwinnable-by-construction is a bug class).
   *
   * THE WINDOW SITS BETWEEN "on air" and "banked", and only there — the exact place
   * `E8AtmosphereSystem.notePan` puts it. A breathless entry is refused first, exactly as before.
   * An entry made on air is always RECORDED in `reached` (it is a record of where the body has
   * been, and the latch's zone conjunct reads it), and only the CREDIT is window-gated: an entry
   * in a window that has already credited one is counted as `windowHeldEntries` and banks nothing.
   * Re-entering the SAME zone in a later window credits again, which is what makes a four-credit
   * gate reachable on the Far Side, whose contract authors exactly one crossing rectangle.
   */
  private noteCrossings(human: Point): void {
    for (const zone of this.crossings) {
      const within = inside(zone, human);
      if (!within) {
        this.insideCrossing.delete(zone.id);
        continue;
      }
      if (this.insideCrossing.has(zone.id)) continue;
      this.insideCrossing.add(zone.id);
      if (this.suit.empty) {
        this.breathlessEntries += 1;
        continue;
      }
      this.reached.add(zone.id);
      if (this.crossingClock.claim()) this.creditedCrossings += 1;
      else this.windowHeldEntries += 1;
    }
  }

  /**
   * A pan tick landed on the ground `anchorIndex`. Credited toward the run only while the suit
   * holds air; otherwise counted as breathless and NOT credited. Returns whether it counted. The
   * rule and the wording are `E8AtmosphereSystem.notePan`'s, because it is the same rule — and
   * since 2026-09-06 so is the WINDOW: a fresh ground in a window that has already credited one is
   * held back, counted as `windowHeldPans`, and credited to nothing. Nothing about the pan's GOLD
   * changes; this class mints nothing and the caller has already paid the rider.
   *
   * `runsOnAirAfterEclipse` counts every pan made on air after the shadow landed, window or no
   * window, because the eclipse's own after-gate asks for WORK on the reserve rather than for a
   * fresh ground — the rule the Eclipse has carried since `tasks/e8-remaining-maps.md`, unmoved.
   */
  notePan(anchorIndex: number): boolean {
    if (!this.declared || !Number.isInteger(anchorIndex) || anchorIndex < 0) return false;
    if (this.suit.empty) {
      this.breathlessPans += 1;
      return false;
    }
    this.runsOnAir += 1;
    if (this.eclipseArrived) this.runsOnAirAfterEclipse += 1;
    if (this.worked.has(anchorIndex)) return true;
    if (!this.regolithClock.claim()) {
      this.windowHeldPans += 1;
      return false;
    }
    this.worked.add(anchorIndex);
    return true;
  }

  get diagnostics(): E8SuitAirDiagnostics {
    const zones = this.crossings.map(({ id }) => id);
    return {
      declared: this.declared,
      wall: this.wall,
      suit: this.suit.diagnostics,
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
        // The same four window fields the Mare Claim publishes, on the same shape, so `now.air`
        // reads identically across all four E8 maps. Null `windowWaves` on a map that authors no
        // window, which is every crossing map and every contract that authors nothing.
        windowWaves: this.authored.regolithWindowWaves,
        window: this.regolithClock.window,
        creditedThisWindow: this.regolithClock.creditedThisWindow,
        windowHeldPans: this.windowHeldPans,
      },
      ...(this.crossings.length > 0
        ? {
            crossing: {
              zones,
              required: this.requiredCrossings,
              reached: zones.filter((id) => this.reached.has(id)),
              credited: this.creditedCrossings,
              breathlessEntries: this.breathlessEntries,
              windowWaves: this.authored.crossingWindowWaves,
              window: this.crossingClock.window,
              creditedThisWindow: this.crossingClock.creditedThisWindow,
              windowHeldEntries: this.windowHeldEntries,
              complete: this.reached.size >= this.crossings.length && this.creditedCrossings >= this.requiredCrossings,
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

/**
 * One rectangle per id, first occurrence wins. Low Orbit authors `claw-carcass-yard` TWICE — once
 * as a build zone and once as a scaffold deck — so a contract that names it pressurised would
 * otherwise get two shelters with one id, two dial rows, and a `domes` list a rider cannot read.
 */
function dedupe(zones: readonly Rect[]): readonly Rect[] {
  const seen = new Set<string>();
  return zones.filter(({ id }) => (seen.has(id) ? false : (seen.add(id), true)));
}

function inside(zone: Rect, point: Point): boolean {
  return point.x >= zone.minX && point.x <= zone.maxX && point.z >= zone.minZ && point.z <= zone.maxZ;
}

/** One window in SECONDS, or null where the contract authors no window of that kind. */
function windowSeconds(waves: number | null, waveSeconds: number): number | null {
  return waves === null ? null : waves * waveSeconds;
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
