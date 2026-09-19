export type ClaimBoatAnchor = Readonly<{ id: string; x: number; z: number }>;
export const CLAIM_BOAT_DECK_BOUNDS = Object.freeze({ minX: -4.4, maxX: 4.4, minZ: -14.25, maxZ: 14.25 });

/**
 * E5 REGATTA, SLICE 1 — THE BOAT IS THE RACING BODY (`specs/agent-play/e5-regatta-steerable-boat.md`,
 * ratified by the owner 2026-09-20: "A14 - do it").
 *
 * Three constants of GEOMETRY live here beside the deck rectangle, and deliberately NOT in
 * `Balance`: the deck is already here, and a hull footprint and a gangplank are the same kind of
 * fact. The boat's PHYSICS (top speed, acceleration, turn rate, drag, the fast-water bonus) are a
 * different kind of fact and live in the CONTRACT (`tileParams.deepwater.claimBoat.physics`), so a
 * second Deepwater map can author a different boat without moving a balance number for every map.
 */
/**
 * The hull's turning footprint: the deck's longest half-extent. A boat clamped by this radius
 * floats entirely inside its water at EVERY heading, which makes the clamp heading-independent and
 * therefore replayable — a heading-dependent clamp would put a float comparison on the hash.
 */
export const CLAIM_BOAT_HULL_RADIUS = Math.max(
  Math.abs(CLAIM_BOAT_DECK_BOUNDS.minX),
  Math.abs(CLAIM_BOAT_DECK_BOUNDS.maxX),
  Math.abs(CLAIM_BOAT_DECK_BOUNDS.minZ),
  Math.abs(CLAIM_BOAT_DECK_BOUNDS.maxZ),
);
/** The gangplank: how far off the rail a body may step, and how far off it may step aboard. */
export const CLAIM_BOAT_GANGPLANK_REACH = 2;

export type BoatRiderPosition = { x: number; z: number };
export type ClaimBoatPad = Readonly<{ id: string; x: number; z: number }>;
export type ClaimBoatPlacement = Readonly<{
  buildingId: string;
  padId: string;
  x: number;
  z: number;
}>;

/** Authored under `tileParams.deepwater.claimBoat.physics`; absent everywhere the boat only moors. */
export type ClaimBoatPhysics = Readonly<{
  topSpeed: number;
  acceleration: number;
  turnRateRadPerSec: number;
  drag: number;
  fastWaterMultiplier: number;
}>;

/** The rectangle the HULL CENTRE may occupy — the navigable water, already inset by the hull radius. */
export type ClaimBoatWater = Readonly<{ minX: number; maxX: number; minZ: number; maxZ: number }>;

export type ClaimBoatConfig = Readonly<{
  id: string;
  initialAnchorId: string;
  anchors: readonly ClaimBoatAnchor[];
  pads: readonly ClaimBoatPad[];
  physics?: ClaimBoatPhysics;
}>;

/** Additive: the motion state a steerable boat carries. Moored boats publish it at their anchor. */
export type ClaimBoatMotion = Readonly<{
  x: number;
  z: number;
  heading: number;
  speed: number;
  aboard: string | null;
  steerable: boolean;
}>;

export type ClaimBoatSnapshot = Readonly<{
  id: string;
  anchor: ClaimBoatAnchor;
  motion: ClaimBoatMotion;
  pads: readonly (ClaimBoatPad & { occupied: boolean })[];
  buildings: readonly ClaimBoatPlacement[];
}>;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
/** Deterministic wrap into (-pi, pi]; no `Math.random`, no clock, no branch on tiny floats. */
const wrapAngle = (radians: number): number => Math.atan2(Math.sin(radians), Math.cos(radians));

export class ClaimBoat {
  private anchor: ClaimBoatAnchor;
  private readonly buildings = new Map<string, string>();
  /** The live hull position. Equal to the anchor until something steers it, and after every reanchor. */
  private hullX: number;
  private hullZ: number;
  private headingRadians = 0;
  private speedAlongHeading = 0;
  private aboardId: string | null = null;
  /**
   * Boarding is a CROSSING, not a position test: `null` until the first step that looks, then the
   * previous step's answer. The Regatta's `heroStart` stake IS the start-line anchor, so a hero
   * boots standing on the deck; treating "inside" as "aboard" would put every idle run aboard a
   * boat nobody boarded and move the null floors. A hero boards by walking ON.
   */
  private heroOnDeck: boolean | null = null;

  constructor(readonly config: ClaimBoatConfig, readonly water: ClaimBoatWater | null = null) {
    const anchorIds = new Set(config.anchors.map((anchor) => anchor.id));
    const padIds = new Set(config.pads.map((pad) => pad.id));
    if (
      config.id.length === 0
      || config.anchors.length === 0
      || config.pads.length === 0
      || anchorIds.size !== config.anchors.length
      || padIds.size !== config.pads.length
    ) throw new Error('Invalid Claim-Boat config.');
    const initial = config.anchors.find((anchor) => anchor.id === config.initialAnchorId);
    if (!initial) throw new Error('Missing initial Claim-Boat anchor.');
    this.anchor = initial;
    this.hullX = initial.x;
    this.hullZ = initial.z;
  }

  /** True only where the contract authored physics AND the tile handed over navigable water. */
  get steerable(): boolean {
    return this.config.physics !== undefined && this.water !== null;
  }

  get aboard(): string | null {
    return this.aboardId;
  }

  get position(): BoatRiderPosition {
    return { x: this.hullX, z: this.hullZ };
  }

  get heading(): number {
    return this.headingRadians;
  }

  get speed(): number {
    return this.speedAlongHeading;
  }

  placeBuilding(padId: string, buildingId: string): boolean {
    if (!buildingId || this.buildings.has(padId) || !this.config.pads.some((pad) => pad.id === padId)) return false;
    this.buildings.set(padId, buildingId);
    return true;
  }

  /** The deck rectangle AT THE LIVE HULL POSITION (identical to the anchor for a moored boat). */
  contains(x: number, z: number): boolean {
    const b = CLAIM_BOAT_DECK_BOUNDS;
    return x >= this.hullX + b.minX && x <= this.hullX + b.maxX
      && z >= this.hullZ + b.minZ && z <= this.hullZ + b.maxZ;
  }

  /** 0 inside the deck, otherwise the shortest distance from the point to the rail. */
  distanceToDeck(x: number, z: number): number {
    const b = CLAIM_BOAT_DECK_BOUNDS;
    const dx = Math.max(this.hullX + b.minX - x, 0, x - (this.hullX + b.maxX));
    const dz = Math.max(this.hullZ + b.minZ - z, 0, z - (this.hullZ + b.maxZ));
    return Math.hypot(dx, dz);
  }

  withinGangplank(x: number, z: number): boolean {
    return this.distanceToDeck(x, z) <= CLAIM_BOAT_GANGPLANK_REACH + 1e-9;
  }

  /** Water the HULL may float in. Everything is navigable for a boat that only moors. */
  navigable(x: number, z: number): boolean {
    const w = this.water;
    return !w || (x >= w.minX && x <= w.maxX && z >= w.minZ && z <= w.maxZ);
  }

  /**
   * Spec law 2 — embark is a POSITION. Call once per fixed step with the hero's live position,
   * BEFORE reading `aboard`. Inert on a boat with no authored physics, so no other Deepwater map
   * changes by a byte.
   */
  board(x: number, z: number, id = 'hero'): void {
    if (!this.steerable) return;
    const onDeck = this.contains(x, z);
    if (this.aboardId === null && this.heroOnDeck === false && onDeck) this.aboardId = id;
    this.heroOnDeck = onDeck;
  }

  /**
   * Spec law 2 — disembark is a POSITION too: a point the BODY can stand on that the HULL cannot
   * float in, off the deck and within a plank of the rail. On a course that is all open water the
   * rim beyond the hull's clamp is that ground, which is also exactly the ground the boat would
   * run aground on. One predicate, both species: a rider's `MOVE_HERO` point and the point a
   * human's key direction reaches over the rail are tested the same way.
   */
  stepAshore(point: BoatRiderPosition, walkable: (x: number, z: number) => boolean): boolean {
    return this.steerable
      && this.aboardId !== null
      && !this.contains(point.x, point.z)
      && !this.navigable(point.x, point.z)
      && this.withinGangplank(point.x, point.z)
      && walkable(point.x, point.z);
  }

  /** Where a key direction reaches over the rail: the deck exit along `intent`, plus one plank. */
  gangplankPoint(intent: { x: number; y: number }): BoatRiderPosition | null {
    const length = Math.hypot(intent.x, intent.y);
    if (length === 0) return null;
    const ux = intent.x / length;
    const uz = intent.y / length;
    const b = CLAIM_BOAT_DECK_BOUNDS;
    const tx = ux > 0 ? b.maxX / ux : ux < 0 ? b.minX / ux : Number.POSITIVE_INFINITY;
    const tz = uz > 0 ? b.maxZ / uz : uz < 0 ? b.minZ / uz : Number.POSITIVE_INFINITY;
    const reach = Math.min(tx, tz) + CLAIM_BOAT_GANGPLANK_REACH;
    return { x: this.hullX + ux * reach, z: this.hullZ + uz * reach };
  }

  disembark(): void {
    this.aboardId = null;
    this.speedAlongHeading = 0;
    this.heroOnDeck = false;
  }

  /**
   * The fixed-step helm. `intent` is the SAME unit `Intents.move` a human's keys produce and
   * `heroMoveIntent` derives from a rider's `MOVE_HERO` — one body, one intent (ADR-005).
   * Deterministic by construction: no `Math.random`, no clock read, no wall time; every number
   * comes from the contract, the step and the current state.
   */
  steer(intent: { x: number; y: number } | null, dt: number, fastWater: boolean): void {
    const physics = this.config.physics;
    if (!physics || !this.steerable) return;
    const driving = intent !== null && (intent.x !== 0 || intent.y !== 0);
    if (driving) {
      const desired = Math.atan2(intent.y, intent.x);
      const turn = physics.turnRateRadPerSec * dt;
      const delta = wrapAngle(desired - this.headingRadians);
      this.headingRadians = wrapAngle(this.headingRadians + clamp(delta, -turn, turn));
    }
    const top = physics.topSpeed * (fastWater ? physics.fastWaterMultiplier : 1);
    const target = driving ? top : 0;
    this.speedAlongHeading = this.speedAlongHeading < target
      ? Math.min(target, this.speedAlongHeading + physics.acceleration * dt)
      : Math.max(target, this.speedAlongHeading - physics.drag * dt);
    const w = this.water;
    const x = this.hullX + Math.cos(this.headingRadians) * this.speedAlongHeading * dt;
    const z = this.hullZ + Math.sin(this.headingRadians) * this.speedAlongHeading * dt;
    this.hullX = w ? clamp(x, w.minX, w.maxX) : x;
    this.hullZ = w ? clamp(z, w.minZ, w.maxZ) : z;
  }

  /**
   * Still a TELEPORT (the storm and corsair rules are untouched): the hull, its riders and its deck
   * buildings jump from wherever the hull IS to the named anchor, and the boat arrives moored —
   * speed zero, heading kept.
   */
  reanchor(anchorId: string, riders: readonly BoatRiderPosition[] = []): boolean {
    const next = this.config.anchors.find((anchor) => anchor.id === anchorId);
    if (!next || next.id === this.anchor.id) return false;
    const deltaX = next.x - this.hullX;
    const deltaZ = next.z - this.hullZ;
    for (const rider of riders) {
      if (!this.contains(rider.x, rider.z)) continue;
      rider.x += deltaX;
      rider.z += deltaZ;
    }
    this.anchor = next;
    this.hullX = next.x;
    this.hullZ = next.z;
    this.speedAlongHeading = 0;
    return true;
  }

  snapshot(): ClaimBoatSnapshot {
    return {
      id: this.config.id,
      anchor: this.anchor,
      motion: {
        x: this.hullX,
        z: this.hullZ,
        heading: this.headingRadians,
        speed: this.speedAlongHeading,
        aboard: this.aboardId,
        steerable: this.steerable,
      },
      pads: this.config.pads.map((pad) => ({ ...pad, occupied: this.buildings.has(pad.id) })),
      buildings: this.config.pads.flatMap((pad) => {
        const buildingId = this.buildings.get(pad.id);
        return buildingId ? [{ buildingId, padId: pad.id, x: this.hullX + pad.x, z: this.hullZ + pad.z }] : [];
      }),
    };
  }
}
