import type { ContractManifest } from '../meta/ContractFamilies';

/**
 * A7 — THE LOW-ORBIT CONSUMER (`specs/agent-play/door-completion-sheet.md:20`, RATIFIED
 * 2026-08-20). Three mechanics, all of them declared by `e8-low-orbit` and none of them
 * invented here:
 *
 *   1. ORBITAL RETURN. `tileParams.gravity.projectileBehavior` and `twist.zeroGravity.projectiles`
 *      both read `"orbital-return"`. Until this file, `E8PhysicsSystem` COMPUTED that flag at
 *      `:133` and nothing read it — grep-verified 2026-08-20, three sites, all of them the flag's
 *      own declaration, assignment and test. A missed lob now re-enters after
 *      `RETURN_SECONDS` continuing its original vector: one return, then gone.
 *   2. HANDHOLDS. `twist.zeroGravity.roads === "handholds"` plus the one authored
 *      `tileParams.handholdRoutes` spine. A SOFT constraint, exactly as ratified — on the spine
 *      or on a scaffold deck you have full thrust; off both, thrust response halves and momentum
 *      carries you. NEVER a wall: `controlScale` returns a multiplier, never a veto.
 *   3. DEBRIS FIELDS. The two authored `tileParams.debrisFields` bands. Inside one, movement
 *      slows and the suit takes a slow chip. A hazard, not a killbox.
 *
 * WHY IT LIVES IN `src/systems/` AND NOT IN A SOCKET, and why it is separate from
 * `E8PhysicsSystem`. `E8PhysicsSystem` answers "what does gravity feel like here" from the
 * `gravity` block alone, and BOTH the Eclipse and the Mare Claim read it. The three mechanics
 * above are low-orbit's own declared geography, so putting them in that class would widen a
 * profile two other contracts depend on. This consumer holds the geography; `E8PhysicsSystem`
 * keeps the feel and merely accepts a per-position multiplier it does not compute.
 *
 * THE GATE IS THE CONTRACT, NEVER THE EPOCH. `create()` reads the manifest it is handed, so a
 * contract that does not declare these keys gets `none()` — an inert consumer whose every
 * multiplier is 1 and whose every predicate is false. That is what keeps `e8-mare-claim` and
 * `e8-eclipse` byte-identical: they take the same code path they always took, because the
 * consumer they hold answers "no" to everything.
 */

/** The ratified default: "return T = 12s" (sheet A7 DEFAULTS). */
export const RETURN_SECONDS = 12;

/** The ratified default: "drift penalty 0.5x control" (sheet A7 DEFAULTS). */
export const DRIFT_CONTROL_SCALE = 0.5;

/**
 * The ratified band: "debris fields — slow+minor-damage hazard bands" with the build brief's
 * numbers, "movement slow (x0.8) + minor periodic damage (1 hp/s class)".
 */
export const DEBRIS_SPEED_SCALE = 0.8;
export const DEBRIS_DAMAGE_PER_SECOND = 1;

/**
 * AUTHORED, NOT RATIFIED — flagged as such because the sheet did not specify it. A route is a
 * POLYLINE of five points; "on the route" needs a width before it can be a region, and the sheet
 * gives none. 4wu of half-width makes the spine a lane a rider can actually hold (the hero's own
 * radius is 0.45wu) without making it so wide that the two decks and the spine cover the map and
 * the drift never fires. Every other number in this file is quoted from the ratification.
 */
export const HANDHOLD_HALF_WIDTH = 4;

type Rect = Readonly<{ minX: number; maxX: number; minZ: number; maxZ: number }>;
type Point = Readonly<{ x: number; z: number }>;
type Segment = Readonly<{ ax: number; az: number; bx: number; bz: number }>;

export type LowOrbitDiagnostics = Readonly<{
  /** True when the active contract declares the zero-gravity twist at all. */
  declared: boolean;
  orbitalReturn: boolean;
  returnSeconds: number;
  scaffoldZones: number;
  debrisFields: number;
  handholdSegments: number;
  /** Presentation-stripped counters — evidence that the mechanic ran, not decoration. */
  returnsScheduled: number;
  returnsDetonated: number;
  driftSteps: number;
  debrisSteps: number;
  debrisDamageDealt: number;
}>;

export class LowOrbitSystem {
  private returnsScheduled = 0;
  private returnsDetonated = 0;
  private driftSteps = 0;
  private debrisSteps = 0;
  private debrisDamageDealt = 0;
  /**
   * Sub-hp debris chip, carried between fixed steps. 1hp/s over 1/30s steps is 0.0333hp a step;
   * banking it and spending whole points keeps the damage log integral and the hash discrete
   * instead of accumulating float dust thirty times a second.
   */
  private debrisCarry = 0;

  private constructor(
    private readonly declared: boolean,
    private readonly orbitalReturnDeclared: boolean,
    private readonly scaffolds: readonly Rect[],
    private readonly debris: readonly Rect[],
    private readonly handholds: readonly Segment[],
  ) {}

  /**
   * ONE read, performed identically by both engines. `projectileBehavior` and
   * `twist.zeroGravity.projectiles` are BOTH authored as `"orbital-return"` on this contract;
   * either alone is enough, which mirrors how `E8PhysicsSystem:133` already reads the same pair.
   */
  static create(contract: ContractManifest): LowOrbitSystem {
    const tile = contract.tileParams;
    const zeroGravity = contract.twist.zeroGravity;
    const scaffolds = rects(tile.orbitalScaffoldZones);
    const debris = rects(tile.debrisFields);
    const handholds = segments(tile.handholdRoutes);
    const declared = zeroGravity !== undefined || scaffolds.length > 0 || debris.length > 0 || handholds.length > 0;
    if (!declared) return LowOrbitSystem.none();
    const orbitalReturn = tile.gravity?.projectileBehavior === 'orbital-return'
      || zeroGravity?.projectiles === 'orbital-return';
    return new LowOrbitSystem(true, orbitalReturn === true, scaffolds, debris, handholds);
  }

  /** The undeclared case, reified so every caller holds a consumer rather than a null. */
  static none(): LowOrbitSystem {
    return new LowOrbitSystem(false, false, [], [], []);
  }

  get isDeclared(): boolean {
    return this.declared;
  }

  /** True only where the contract asked for returning projectiles. Gates the whole combat seam. */
  get returnsProjectiles(): boolean {
    return this.orbitalReturnDeclared;
  }

  get returnSeconds(): number {
    return RETURN_SECONDS;
  }

  /** True when the position sits on the handhold spine or on a scaffold deck. */
  onHandhold(x: number, z: number): boolean {
    if (!this.declared) return true;
    for (const zone of this.scaffolds) if (inside(zone, x, z)) return true;
    for (const segment of this.handholds) if (nearSegment(segment, x, z, HANDHOLD_HALF_WIDTH)) return true;
    return false;
  }

  inDebris(x: number, z: number): boolean {
    if (!this.declared) return false;
    for (const band of this.debris) if (inside(band, x, z)) return true;
    return false;
  }

  /**
   * The SOFT constraint. Off-route thrust responds at half rate and momentum carries — the
   * ratified lesson, "momentum is commitment". This returns a multiplier and never a veto, so
   * there is no wall anywhere in this file for a rider to be trapped against.
   */
  controlScale(x: number, z: number): number {
    if (!this.declared) return 1;
    if (this.onHandhold(x, z)) return 1;
    this.driftSteps += 1;
    return DRIFT_CONTROL_SCALE;
  }

  /** The debris band's drag. Applied to the movement vector, so it slows without steering. */
  speedScale(x: number, z: number): number {
    if (!this.declared || !this.inDebris(x, z)) return 1;
    return DEBRIS_SPEED_SCALE;
  }

  /**
   * The debris band's chip, in WHOLE hp. Call once per fixed step for the hero only — the sheet
   * declares nothing for enemies, so nothing here touches them (reject-don't-stretch).
   */
  debrisDamage(x: number, z: number, seconds: number): number {
    if (!this.declared || !this.inDebris(x, z) || seconds <= 0) return 0;
    this.debrisSteps += 1;
    this.debrisCarry += DEBRIS_DAMAGE_PER_SECOND * seconds;
    if (this.debrisCarry < 1) return 0;
    const whole = Math.floor(this.debrisCarry);
    this.debrisCarry -= whole;
    this.debrisDamageDealt += whole;
    return whole;
  }

  noteReturnScheduled(): void {
    this.returnsScheduled += 1;
  }

  noteReturnDetonated(): void {
    this.returnsDetonated += 1;
  }

  /** Restores the counters to their run-start values; mirrors every other system's reset(). */
  reset(): void {
    this.returnsScheduled = 0;
    this.returnsDetonated = 0;
    this.driftSteps = 0;
    this.debrisSteps = 0;
    this.debrisDamageDealt = 0;
    this.debrisCarry = 0;
  }

  get diagnostics(): LowOrbitDiagnostics {
    return {
      declared: this.declared,
      orbitalReturn: this.orbitalReturnDeclared,
      returnSeconds: RETURN_SECONDS,
      scaffoldZones: this.scaffolds.length,
      debrisFields: this.debris.length,
      handholdSegments: this.handholds.length,
      returnsScheduled: this.returnsScheduled,
      returnsDetonated: this.returnsDetonated,
      driftSteps: this.driftSteps,
      debrisSteps: this.debrisSteps,
      debrisDamageDealt: this.debrisDamageDealt,
    };
  }
}

function rects(source: readonly Rect[] | undefined): readonly Rect[] {
  if (!Array.isArray(source)) return [];
  return source
    .filter((zone) => [zone?.minX, zone?.maxX, zone?.minZ, zone?.maxZ].every((value) => Number.isFinite(value)))
    .map((zone) => ({
      minX: Math.min(zone.minX, zone.maxX),
      maxX: Math.max(zone.minX, zone.maxX),
      minZ: Math.min(zone.minZ, zone.maxZ),
      maxZ: Math.max(zone.minZ, zone.maxZ),
    }));
}

function segments(source: ReadonlyArray<{ id: string; points: readonly Point[] }> | undefined): readonly Segment[] {
  if (!Array.isArray(source)) return [];
  const out: Segment[] = [];
  for (const route of source) {
    const points: readonly Point[] = Array.isArray(route?.points)
      ? route.points.filter((point: Point) => Number.isFinite(point?.x) && Number.isFinite(point?.z))
      : [];
    for (let index = 1; index < points.length; index += 1) {
      const a = points[index - 1];
      const b = points[index];
      if (!a || !b) continue;
      out.push({ ax: a.x, az: a.z, bx: b.x, bz: b.z });
    }
  }
  return out;
}

function inside(zone: Rect, x: number, z: number): boolean {
  return x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ;
}

/** Planar point-to-segment distance. The sim is planar (CLAUDE.md §4.6), so height never enters. */
function nearSegment(segment: Segment, x: number, z: number, halfWidth: number): boolean {
  const dx = segment.bx - segment.ax;
  const dz = segment.bz - segment.az;
  const lengthSq = dx * dx + dz * dz;
  const t = lengthSq > 0
    ? Math.max(0, Math.min(1, ((x - segment.ax) * dx + (z - segment.az) * dz) / lengthSq))
    : 0;
  const px = segment.ax + dx * t;
  const pz = segment.az + dz * t;
  const offX = x - px;
  const offZ = z - pz;
  return offX * offX + offZ * offZ <= halfWidth * halfWidth;
}
