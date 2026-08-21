import { Balance } from '../game/Balance';
import type { ContractManifest } from '../meta/ContractFamilies';

/**
 * A9 — THE WIND REPLANS (`specs/agent-play/door-completion-sheet.md:24`, RATIFIED 2026-08-20,
 * owner verbatim: "Group 1: approved (with any tweaks)").
 *
 * `e9-devils-alley` declares `twist.scheduledRelocation` — "dust devils cross on schedules and
 * relocate unanchored buildings instead of destroying them" — three `lanes.patrolRoutes` at
 * z = -26 / 0 / +26, three `*-anchor-bay` buildZones, two `*-anchor-yard` buildZones, and three
 * `stakeMarkers` named `anchor-west` / `anchor-center` / `anchor-east`. This file is the whole
 * consumer: the schedule, the column, the pickup, the carry and the drop.
 *
 * IT IMPORTS NO RENDER CODE, AND THAT IS A LAW HERE RATHER THAN A PREFERENCE (F-A8-7). A module
 * both engines construct dragged `world/Terrain`'s `?raw` JSON import into the collection graph
 * and made the WHOLE Playwright suite uncollectable. The imports above are one TYPE and the
 * balance table (`SeedCaravanSystem` already proves that edge is clean). The browser's column is
 * drawn by `DevilsAlleyPresentation` from the values this class publishes, never here.
 *
 * DETERMINISM. Fixed-timestep integration, an integer wave signal, and a distance test against
 * positions the engines already hold. No RNG, no wall clock, no profile read. Candidates are
 * ordered by `family` then `index` before anything is picked up, so the carry order — and hence
 * the drop fan — cannot depend on the order a targeting register happens to be in.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * THE ONE TWEAK, AND THE ARITHMETIC THAT FORCED IT (the ratification's "with any tweaks").
 *
 * The sheet's design says: "buildings inside the three anchor-bay buildZones are ANCHORED and
 * immune". Taken as a whole-rectangle immunity, THE MECHANIC CAN NEVER FIRE ON THIS TILE, and
 * that is arithmetic rather than opinion. Measured 2026-08-21 against the authored data:
 *
 *   - Buildings may stand ONLY inside a declared buildZone. `Terrain.isBuildable` (`:238-243`)
 *     answers `zones.length === 0 || zones.some(contains)`, and every buildable in
 *     `src/game/buildables.ts` is `placement: 'bank'` or `'river-adjacent'` — both of which
 *     require `buildable`. There is no legal placement outside the five zones.
 *   - The published sweep corridors (`mask-tables/e9-devils-alley.json`, pinned verbatim by
 *     `scripts/e3-mask-tables.test.mjs:364`) are z -34..-18, z -8..8 and z 18..34.
 *   - The two YARDS are z -54..-42 and z 42..54. Neither meets any corridor: the nearest gap is
 *     8 world units.
 *   - The three BAYS are the only buildable ground that any corridor touches — and under the
 *     literal reading they are exactly the ground that is immune.
 *
 * So the literal rule leaves ZERO relocatable buildings, forever, and a consumer that can never
 * fire is decoration. Widening the corridors to reach the yards does not rescue it either: the
 * south corridor would need a half-width of 28 (z -54..2) to cover the south yard, which would
 * swallow the centre bay whole.
 *
 * THE TWEAK IS THEREFORE THE SMALLEST ONE THAT KEEPS THE SENTENCE TRUE AND THE MECHANIC ALIVE:
 * an anchor bay is anchored BY ITS ANCHOR, and the anchor's hold is the circle inscribed in the
 * bay it stands in. It is not an invented number — it is `min(halfWidth, halfDepth)` of the
 * authored bay, which for all three of this tile's 20x16 bays is exactly 8, and each stake sits
 * dead centre of its own bay, so the hold is inscribed and the FOUR CORNERS of every bay are
 * what the wind is allowed to take. The bays remain the shelter the briefing promises ("with
 * protected bays set west, center, and east"); what the wind now tests is whether you packed
 * your guns around the anchor or out at the bay's edge, which is the contract's own stated
 * lesson: "anchor what matters and adapt when the wind replans the rest."
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 */

/**
 * THE COLUMN'S REACH, REUSED AND NOT INVENTED. `Balance.e9Canal.dustDevil.radius` is the reach
 * the Red Fields dust devil already has in the browser (`E9CanalSystem.updateDustDevil`), and
 * the sheet's own note is that "the dust-devil entity already exists with a live position". A
 * second radius for a second devil would be two truths about one creature.
 */
export const DEVIL_COLUMN_RADIUS = Balance.e9Canal.dustDevil.radius;

/**
 * ONE CROSSING, IN SECONDS — the only number here the ratification did not supply, flagged as
 * AUTHORED. The sheet gives the cadence ("one sweep per wave") and nothing else. 20s is A5's
 * `FRONT_CROSSING_SECONDS`, the house precedent for a scheduled crosser, and it lands the devil
 * at 104wu / 20s = 5.2 wu/s against a hero walk of 6.0 (`Balance.hero.speed`) — deliberately
 * SLOWER than a body can move, so the alley is a thing you adapt to and never a thing you
 * cannot escape.
 */
export const DEVIL_SWEEP_SECONDS = 20;

/** Spacing of the drop fan, in world units. Two works never land inside one another. */
const DROP_FAN_SPACING = 2;

/** Machine-readable refusal codes, in the same kebab house style as `signal-suppressed`. */
export const RELOCATION_ANCHORED_REASON = 'anchor-holds';
export const RELOCATION_IMMOVABLE_REASON = 'cannot-be-lifted';

/** The county's voice when the wind sets a work down somewhere new. Played for laughs, as ratified. */
export const RELOCATION_VOICE = 'The wind has other plans for that one';

type Point = Readonly<{ x: number; z: number }>;
type Rect = Readonly<{ id: string; minX: number; maxX: number; minZ: number; maxZ: number }>;

/** An authored sweep, reduced to what the column needs: an id and a polyline. */
export type DevilRoute = Readonly<{ id: string; points: readonly Point[] }>;

/** One anchor stake and the hold it exerts — the radius inscribed in the bay it stands in. */
export type DevilAnchor = Readonly<{ id: string; zoneId: string; x: number; z: number; holdRadius: number }>;

/**
 * The structural shape of a standing work, deliberately narrower than `BuildingTarget` so this
 * file needs no `three` import: a `THREE.Vector3` satisfies `{ x, z }` structurally, so both
 * engines hand their own building register straight in without copying it.
 */
export type RelocatableWork = Readonly<{
  family: string;
  index: number;
  position: Point;
  active: boolean;
  hp: number;
}>;

/**
 * THE ONE SEAM INTO THE BUILD SYSTEM. `BuildSystem` is the sole writer of a building's position
 * (Convention 4, one writer per surface), so this consumer never touches a pool, a target or a
 * blocker — it asks. `lifted` carries the suspend state with the move: a work in the air is
 * OFFLINE (no fire, no target) and undamaged, which is exactly "relocate instead of destroy".
 * Returns false when the slot refuses, and every refusal is counted below rather than swallowed.
 */
export type RelocationMover = (
  family: string,
  index: number,
  to: Point,
  lifted: boolean,
) => boolean;

export type RelocationRecord = Readonly<{
  family: string;
  index: number;
  routeId: string;
  wave: number;
  from: Point;
  to: Point;
}>;

export type ScheduledRelocationDiagnostics = Readonly<{
  /** True when the contract declares the twist AND authors routes to sweep. */
  declared: boolean;
  columnRadius: number;
  sweepSeconds: number;
  routes: readonly Readonly<{ id: string; from: Point; to: Point }>[];
  anchors: readonly DevilAnchor[];
  phase: 'waiting' | 'sweeping';
  /** The route being swept right now, or null between sweeps. */
  routeId: string | null;
  /** The route the NEXT wave will sweep — a rider can plan a build against it. */
  nextRouteId: string | null;
  /** 0..1 along the active route; 0 while waiting. */
  progress: number;
  /** The column's centre while it sweeps; null between sweeps. */
  devil: Point | null;
  wave: number;
  sweepsStarted: number;
  sweepsCompleted: number;
  /** Works in the air right now, in carry order. */
  carried: readonly Readonly<{ family: string; index: number }>[];
  /** Completed relocations this run. The count IS the evidence the mechanic ran. */
  relocations: number;
  /** The most recent completed relocation, or null. */
  lastRelocation: RelocationRecord | null;
  /** Per-building anchored state, so a rider can see what the wind can take before it takes it. */
  works: readonly Readonly<{ family: string; index: number; anchored: boolean; carried: boolean }>[];
  /** Presentation-stripped counters — evidence, not decoration. */
  refusals: Readonly<{ anchored: number; immovable: number; alreadyAtDrop: number }>;
}>;

type RelocationContract = Pick<ContractManifest, 'twist'> & {
  tileParams: Pick<ContractManifest['tileParams'], 'buildZones' | 'stakeMarkers' | 'lanes'>;
};

export class ScheduledRelocationSystem {
  private elapsed = 0;
  private wave = 0;
  private sweepsStarted = 0;
  private sweepsCompleted = 0;
  private sweeping = false;
  private routeIndex = 0;
  private devil: Point | null = null;
  private relocations = 0;
  private lastRelocation: RelocationRecord | null = null;
  private readonly carried: { family: string; index: number; from: Point }[] = [];
  private readonly refusals = { anchored: 0, immovable: 0, alreadyAtDrop: 0 };
  private works: readonly Readonly<{ family: string; index: number; anchored: boolean; carried: boolean }>[] = [];

  private constructor(
    private readonly declared: boolean,
    private readonly routes: readonly DevilRoute[],
    private readonly anchors: readonly DevilAnchor[],
    private readonly onVoice?: (at: Point, text: string) => void,
  ) {}

  /**
   * ONE read, performed identically by both engines, of the CONTRACT and never the epoch.
   *
   * ARMED ONLY WHEN THE TWIST AND ITS ROUTES ARE BOTH PRESENT. A contract that declares the
   * relocation with no patrol route has no path for a devil to sweep, so it arms NOTHING and
   * says nothing — the same reject-don't-stretch call `InterferenceFrontSystem.create` makes.
   *
   * Deliberately NOT id-gated: `twist.scheduledRelocation` plus authored routes IS the whole
   * test, so the Red Fields siblings each get an inert consumer from the same call and a future
   * relocation map needs no edit here.
   */
  static create(
    contract: RelocationContract,
    onVoice?: (at: Point, text: string) => void,
  ): ScheduledRelocationSystem {
    if (!contract.twist.scheduledRelocation) return ScheduledRelocationSystem.none();
    const routes = (contract.tileParams.lanes?.patrolRoutes ?? [])
      .filter((route) => typeof route?.id === 'string' && Array.isArray(route.points) && route.points.length >= 2)
      .map((route) => ({ id: route.id, points: route.points.map((point) => ({ x: point.x, z: point.z })) }));
    if (routes.length === 0) return ScheduledRelocationSystem.none();
    return new ScheduledRelocationSystem(true, routes, anchorsOf(contract), onVoice);
  }

  /** The undeclared case, reified so every caller holds a consumer rather than a null. */
  static none(): ScheduledRelocationSystem {
    return new ScheduledRelocationSystem(false, [], []);
  }

  get isDeclared(): boolean {
    return this.declared;
  }

  /** The three authored anchors and the hold each exerts. Read by the manifest and the browser. */
  get anchorHolds(): readonly DevilAnchor[] {
    return this.anchors;
  }

  get routeIds(): readonly string[] {
    return this.routes.map((route) => route.id);
  }

  /** The column's centre while it sweeps; null between sweeps. Read by the browser's presentation. */
  get columnPosition(): Point | null {
    return this.devil;
  }

  /** Completed relocations this run — the count a census or a rider reads as "it ran". */
  get relocationCount(): number {
    return this.relocations;
  }

  /**
   * PURE PREDICATE — no counter moves. True when a point stands inside some anchor's hold, i.e.
   * inside the circle inscribed in that anchor's bay. This is what the shooter-free half of the
   * mechanic is: an anchored work is simply never a candidate.
   */
  anchored(x: number, z: number): boolean {
    for (const anchor of this.anchors) {
      const dx = x - anchor.x;
      const dz = z - anchor.z;
      if (dx * dx + dz * dz <= anchor.holdRadius * anchor.holdRadius) return true;
    }
    return false;
  }

  /**
   * THE SCHEDULE, advanced on the caller's fixed step so both engines put the same column in the
   * same place at the same instant.
   *
   * "One sweep per wave, alternating routes" (sheet A9 DEFAULTS): every time the wave counter
   * turns over, the next authored route sweeps, in authored order, wrapping. A wave that turns
   * over while a sweep is still running COMPLETES that sweep first (settling everything it
   * carries at its own end point) and then starts the new one — never two columns at once.
   *
   * ORDER INSIDE ONE STEP is deliberate: settle-or-start first, then advance the clock, then
   * pick up, then carry. A work picked up on the step the column reaches it therefore rides from
   * that step onward, and a work that was already at the drop point is never picked up at all.
   */
  update(seconds: number, wave: number, works: readonly RelocatableWork[], move: RelocationMover): void {
    if (!this.declared) return;
    const nextWave = Math.max(0, Math.floor(wave));
    if (nextWave > this.wave) {
      if (this.sweeping) this.settle(move);
      this.wave = nextWave;
      this.startSweep();
    } else {
      this.wave = Math.max(this.wave, nextWave);
    }
    if (!(seconds > 0)) {
      this.readWorks(works);
      return;
    }
    if (this.sweeping) {
      this.elapsed += seconds;
      if (this.elapsed >= DEVIL_SWEEP_SECONDS) {
        this.devil = endOf(this.routes[this.routeIndex]!);
        this.carry(move);
        this.settle(move);
      } else {
        this.devil = sampleRoute(this.routes[this.routeIndex]!, this.elapsed / DEVIL_SWEEP_SECONDS);
        this.pickUp(works, move);
        this.carry(move);
      }
    }
    this.readWorks(works);
  }

  /** Restores the run-start state; mirrors every other system's reset(). */
  reset(): void {
    this.elapsed = 0;
    this.wave = 0;
    this.sweepsStarted = 0;
    this.sweepsCompleted = 0;
    this.sweeping = false;
    this.routeIndex = 0;
    this.devil = null;
    this.relocations = 0;
    this.lastRelocation = null;
    this.carried.length = 0;
    this.refusals.anchored = 0;
    this.refusals.immovable = 0;
    this.refusals.alreadyAtDrop = 0;
    this.works = [];
  }

  get diagnostics(): ScheduledRelocationDiagnostics {
    const active = this.sweeping ? this.routes[this.routeIndex] : undefined;
    /**
     * THE ROUTE THE NEXT WAVE WILL SWEEP, and it is `sweepsStarted` rather than `routeIndex + 1`
     * for a reason a rider would otherwise be lied to about: between sweeps `routeIndex` still
     * names the route that JUST ran, so reading it there would advertise the corridor the wind
     * has already left as the one it is coming to next. `startSweep` picks `sweepsStarted % n`,
     * so this is the same expression the schedule itself uses, in both phases.
     */
    const next = this.routes.length > 0 ? this.routes[this.sweepsStarted % this.routes.length] : undefined;
    return {
      declared: this.declared,
      columnRadius: DEVIL_COLUMN_RADIUS,
      sweepSeconds: DEVIL_SWEEP_SECONDS,
      routes: this.routes.map((route) => ({ id: route.id, from: route.points[0]!, to: endOf(route) })),
      anchors: this.anchors,
      phase: this.sweeping ? 'sweeping' : 'waiting',
      routeId: active?.id ?? null,
      nextRouteId: next?.id ?? null,
      progress: this.sweeping ? round(Math.min(1, this.elapsed / DEVIL_SWEEP_SECONDS)) : 0,
      devil: this.devil ? { x: round(this.devil.x), z: round(this.devil.z) } : null,
      wave: this.wave,
      sweepsStarted: this.sweepsStarted,
      sweepsCompleted: this.sweepsCompleted,
      carried: this.carried.map(({ family, index }) => ({ family, index })),
      relocations: this.relocations,
      lastRelocation: this.lastRelocation,
      works: this.works,
      refusals: { ...this.refusals },
    };
  }

  /** Stable event-log slice: the static declarations and the render-facing route table stay out. */
  get simulationSnapshot(): unknown {
    const {
      declared: _declared,
      columnRadius: _columnRadius,
      sweepSeconds: _sweepSeconds,
      routes: _routes,
      anchors: _anchors,
      ...simulation
    } = this.diagnostics;
    return simulation;
  }

  private startSweep(): void {
    if (this.routes.length === 0) return;
    this.routeIndex = this.sweepsStarted % this.routes.length;
    this.sweepsStarted += 1;
    this.elapsed = 0;
    this.sweeping = true;
    this.devil = this.routes[this.routeIndex]!.points[0]!;
  }

  /**
   * PICKUP. A work is taken when it is standing, unanchored, not already in the air, and inside
   * the column's reach — and NOT when it is already sitting at this route's drop point, which is
   * what keeps a pile at the end of the alley from being lifted and set down in the same spot
   * once per wave forever.
   *
   * Candidates are sorted by family then index BEFORE anything is lifted, so the carry order is
   * a function of the board and never of the register's insertion order.
   */
  private pickUp(works: readonly RelocatableWork[], move: RelocationMover): void {
    const devil = this.devil;
    if (!devil) return;
    const drop = endOf(this.routes[this.routeIndex]!);
    const candidates = works
      .filter((work) => work.active && work.hp > 0 && !this.isCarried(work))
      .filter((work) => within(work.position, devil, DEVIL_COLUMN_RADIUS))
      .sort((a, b) => (a.family === b.family ? a.index - b.index : a.family < b.family ? -1 : 1));
    for (const work of candidates) {
      if (this.anchored(work.position.x, work.position.z)) {
        this.refusals.anchored += 1;
        continue;
      }
      if (within(work.position, drop, DEVIL_COLUMN_RADIUS)) {
        this.refusals.alreadyAtDrop += 1;
        continue;
      }
      const from = { x: work.position.x, z: work.position.z };
      if (!move(work.family, work.index, from, true)) {
        this.refusals.immovable += 1;
        continue;
      }
      this.carried.push({ family: work.family, index: work.index, from });
      this.onVoice?.(from, RELOCATION_VOICE);
    }
  }

  /** Everything in the air rides the column, fanned so a pair never occupies one point. */
  private carry(move: RelocationMover): void {
    const devil = this.devil;
    if (!devil) return;
    this.carried.forEach((entry, order) => {
      move(entry.family, entry.index, fan(devil, order, this.carried.length), true);
    });
  }

  /**
   * THE DROP — at the sweep's end point, alive, as ratified ("relocation never damages"). The
   * work comes back online in the same call that sets it down, so nothing is left suspended by a
   * sweep that ended.
   */
  private settle(move: RelocationMover): void {
    const route = this.routes[this.routeIndex];
    const drop = route ? endOf(route) : null;
    if (drop) {
      this.carried.forEach((entry, order) => {
        const to = fan(drop, order, this.carried.length);
        // COUNT ONLY WHAT ACTUALLY LANDED. A work that was wrecked while airborne makes the mover
        // refuse, and a relocation nobody can point at on the board must not appear in the count
        // a census reads as "the mechanic ran".
        if (!move(entry.family, entry.index, to, false)) {
          this.refusals.immovable += 1;
          return;
        }
        this.relocations += 1;
        this.lastRelocation = {
          family: entry.family,
          index: entry.index,
          routeId: route!.id,
          wave: this.wave,
          from: { x: round(entry.from.x), z: round(entry.from.z) },
          to: { x: round(to.x), z: round(to.z) },
        };
      });
    }
    this.carried.length = 0;
    this.sweeping = false;
    this.sweepsCompleted += 1;
    this.elapsed = 0;
    this.devil = null;
  }

  private isCarried(work: RelocatableWork): boolean {
    return this.carried.some((entry) => entry.family === work.family && entry.index === work.index);
  }

  /** The per-building anchored/carried table THE VIEW publishes, rebuilt from the live register. */
  private readWorks(works: readonly RelocatableWork[]): void {
    this.works = works
      .filter((work) => work.hp > 0)
      .map((work) => ({
        family: work.family,
        index: work.index,
        anchored: this.anchored(work.position.x, work.position.z),
        carried: this.isCarried(work),
      }))
      .sort((a, b) => (a.family === b.family ? a.index - b.index : a.family < b.family ? -1 : 1));
  }
}

/**
 * THE ANCHORS, DERIVED FROM AUTHORED DATA AND NOTHING ELSE: every stake that stands inside a
 * buildZone whose id ends in `-anchor-bay` becomes that bay's anchor, and its hold is the radius
 * inscribed in the bay — `min(halfWidth, halfDepth)`. On `e9-devils-alley` that is 8 for all
 * three of the 20x16 bays, and each stake sits dead centre, so the hold is exactly inscribed.
 * A bay with no stake exerts no hold; a stake outside every bay anchors nothing.
 */
function anchorsOf(contract: RelocationContract): readonly DevilAnchor[] {
  const bays = (contract.tileParams.buildZones ?? []).filter((zone) => zone.id.endsWith('-anchor-bay'));
  const stakes = contract.tileParams.stakeMarkers ?? [];
  return stakes.flatMap((stake) => {
    const bay = bays.find((zone) => contains(zone, stake.x, stake.z));
    if (!bay) return [];
    const holdRadius = Math.min(Math.abs(bay.maxX - bay.minX) / 2, Math.abs(bay.maxZ - bay.minZ) / 2);
    return holdRadius > 0
      ? [{ id: stake.id, zoneId: bay.id, x: stake.x, z: stake.z, holdRadius }]
      : [];
  });
}

function contains(zone: Rect, x: number, z: number): boolean {
  return x >= Math.min(zone.minX, zone.maxX) && x <= Math.max(zone.minX, zone.maxX)
    && z >= Math.min(zone.minZ, zone.maxZ) && z <= Math.max(zone.minZ, zone.maxZ);
}

function within(a: Point, b: Point, radius: number): boolean {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz <= radius * radius;
}

/** A deterministic offset so carried works never share one point. Centred on the column. */
function fan(at: Point, order: number, total: number): Point {
  const offset = (order - (total - 1) / 2) * DROP_FAN_SPACING;
  return { x: at.x, z: at.z + offset };
}

function endOf(route: DevilRoute): Point {
  return route.points[route.points.length - 1]!;
}

/** Constant-speed sample along the authored polyline, 0..1 of its total length. */
function sampleRoute(route: DevilRoute, progress: number): Point {
  const points = route.points;
  const spans = points.slice(1).map((point, index) => Math.hypot(point.x - points[index]!.x, point.z - points[index]!.z));
  const total = spans.reduce((sum, span) => sum + span, 0);
  if (total <= 0) return points[0]!;
  let remaining = Math.max(0, Math.min(1, progress)) * total;
  for (let index = 0; index < spans.length; index += 1) {
    const span = spans[index]!;
    if (remaining > span && index < spans.length - 1) {
      remaining -= span;
      continue;
    }
    const start = points[index]!;
    const end = points[index + 1]!;
    const t = span > 0 ? Math.min(1, remaining / span) : 0;
    return { x: start.x + (end.x - start.x) * t, z: start.z + (end.z - start.z) * t };
  }
  return points[points.length - 1]!;
}

/** Keeps the view's numbers discrete instead of carrying float dust into a determinism hash. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
