import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import {
  greenWaypointEntryId,
  isGreenWaypointEntry,
  TILE_STATE_SCHEMA_VERSION,
  type TileStateStore,
} from '../game/TileStateStore';
import type { ContractManifest } from '../meta/ContractFamilies';

/**
 * A8 — THE SEED CARAVAN, and the permanent green it pays for.
 * (`specs/agent-play/door-completion-sheet.md:22`, RATIFIED 2026-08-20, owner verbatim:
 * "Group 1: approved (with any tweaks)".)
 *
 * THE DESIGN, as ratified: "a seed-vault caravan crosses south→north (escort survival like the
 * declared lesson); at each of the three grounds the player/agent may PLANT a vault (context
 * action) — planting permanently creates a green waypoint (no-spawn disc) for ALL future runs on
 * this map, but each planted vault weakens the caravan's remaining guard (spend now, shelter
 * forever). Objective: caravan reaches the basin."
 *
 * EVERYTHING BELOW IS READ FROM WHAT THE CONTRACT ALREADY DECLARES (reject-don't-stretch,
 * Mistake #14). The route is the five authored `buildZones` in authored order, taken at their
 * centres: south-caravan-yard → west/center/east-green-waypoint → north-basin-approach. That is
 * not an invention — `assets/contracts/epoch-9-redfields/mask-tables/e9-seed-run.json` publishes
 * exactly those five points as `caravanRoute`, and `scripts/e3-mask-tables.test.mjs:352` already
 * pins them. The three plant grounds are the three authored `stakeMarkers`, each matched to the
 * buildZone that contains it. No new contract field was authored for any of this; the only data
 * this slice adds to the contract is `harvestAnchors`, which the door needs.
 *
 * WHY IT IS A SYSTEM AND NOT AN `src/sim` SOCKET. The era-socket family (`AtomicSocket`,
 * `DeepwaterSocket`, `E9CanalSocket`) COMPOSES browser systems into the headless engine, and the
 * E9 pair are census probes that `HeadlessContractSim` never ticks. This consumer must be ticked
 * by the real headless run, because it gates the secure: an objective that only a census can see
 * is not an objective. So it takes the `twist.powerGrid` shape instead — one module both engines
 * construct and tick at the same point in their own order.
 *
 * DETERMINISM. Fixed-timestep integration plus a distance test against enemy positions. No RNG,
 * no wall clock, no profile read during the run. Rounded coordinates leave the class only through
 * `simulationSnapshot`.
 */

/** The caravan's whole guard, in hit points. Heavier than the ore cart (180) — it is a vault train. */
export const SEED_CARAVAN_MAX_HP = 240;

/**
 * THE RATIFIED PLANT COST — the sheet's own "each plant costs a meaningful slice", taken at the
 * ~25% the build brief named. Spent against the ORIGINAL maximum, so the third vault costs
 * exactly what the first did: three plants spend 75% of the guard and leave a quarter of it to
 * finish the crossing on. Planting alone can never destroy the caravan (the floor below is 1hp) —
 * "spend now, shelter forever" is a cost, not a suicide.
 */
export const SEED_CARAVAN_PLANT_COST_RATIO = 0.25;

/** Slow, as the design says: roughly a quarter of `Balance.hero.speed` (6.0). */
export const SEED_CARAVAN_SPEED = 1.6;

/**
 * THE PLANT WINDOW at each ground, and it is 40 seconds for a MEASURED reason rather than a
 * dramatic one. A headless rider is only handed a turn when something changes — a wave turns
 * over, a surprise fires, a draft opens — which on this map is roughly every 30 seconds. A
 * 15-second window (the first number tried) therefore fell BETWEEN two turns often enough that a
 * rider standing on the stake with the train beside it still missed the vault: measured
 * `planted=0` with the Prospector at (-34,-21) and the caravan reading
 * `paused/at=plant-west-waypoint` on the very next line. A window a player can see and an agent
 * cannot reach is not a choice, so the window is longer than the cadence.
 */
export const SEED_CARAVAN_DWELL_SECONDS = 40;

/** How close a body must be to a stake to plant its vault. Mirrors the megaproject fund reach. */
export const SEED_CARAVAN_PLANT_REACH = 3.2;

/** Contact damage only: an outlaw that ends up ON the caravan hurts it. Nothing targets it. */
export const SEED_CARAVAN_CONTACT_RADIUS = 3.6;
export const SEED_CARAVAN_CONTACT_DPS = 3;
/** A swarm cannot delete the train in a second; three bodies is the whole bite. */
export const SEED_CARAVAN_CONTACT_ATTACKER_CAP = 3;

/**
 * How close the CARAVAN must be to a stake for that ground's vault to come off it. The dwell is
 * the plant window — "it pauses at each of the three waypoint grounds" — so a rider who wants a
 * green has to be standing there when the train is, which is what makes the escort a route and
 * not a fire-and-forget. Generous enough that arriving one tick early still counts.
 */
export const SEED_CARAVAN_AT_GROUND_RADIUS = 2;

/**
 * `'green-waypoint:'.length`. A bare TP-02 entry slices to the empty string and is skipped, which
 * is what keeps the dry-gulch rehearsal out of this map's ground list.
 */
const GREEN_WAYPOINT_PREFIX_LENGTH = greenWaypointEntryId('').length;

export type SeedCaravanState = 'moving' | 'paused' | 'arrived' | 'lost';

export type SeedPlantGround = {
  /** The authored stake id, e.g. `plant-center-waypoint`. */
  id: string;
  /** The authored buildZone that contains the stake, e.g. `center-green-waypoint`. */
  zoneId: string;
  x: number;
  z: number;
};

export type SeedPlantResult =
  | { ok: true; groundId: string; costHp: number }
  | { ok: false; reason: string };

export type SeedCaravanDiagnostics = Readonly<{
  /** True when the active contract declares `twist.persistentPlanting`. */
  declared: boolean;
  state: SeedCaravanState;
  hp: number;
  maxHp: number;
  /** 0..1 along the whole authored route. */
  progress: number;
  /** The route leg the caravan is on, 0-based; equals the number of route points cleared. */
  leg: number;
  position: { x: number; z: number };
  dwellRemaining: number;
  /** THE OBJECTIVE LATCH the secure reads. Never un-latches. */
  arrived: boolean;
  /** Grounds planted THIS run (staged, not yet committed). */
  plantedThisRun: readonly string[];
  /** Grounds this profile already holds from earlier runs, read once at birth. */
  plantedBefore: readonly string[];
  /** How many plants were refused, and why-classes. Presentation-stripped evidence. */
  refusals: Readonly<{ outOfReach: number; alreadyHeld: number; closed: number; caravanAway: number }>;
  /** The ground the caravan is standing at right now, or null while it is on the road. */
  atGround: string | null;
  grounds: readonly SeedPlantGround[];
  route: readonly { x: number; z: number }[];
}>;

type CaravanEnemy = { isAlive: boolean; position: THREE.Vector3 };

/**
 * Render-side ground sampler, INJECTED rather than imported, and the reason is a real regression
 * this file caused once: importing `visualY` from `../world/Terrain` at module scope pulled
 * Terrain — and its `assets/layer-contracts/*.json?raw` import — into every graph that reaches
 * this class. `MechanicsManifest` reaches it (the manifest row is sourced from this consumer), and
 * `MechanicsManifest` is reached by specs, so `npx playwright test --list` collapsed to
 * `Total: 0 tests in 0 files` with `needs an import attribute of "type: json"` — the whole suite,
 * uncollectable, from one convenience import. Both collection guards caught it and a base-commit
 * control proved it was mine.
 *
 * A consumer both engines construct has no business owning a render dependency. The browser passes
 * `Terrain.visualY`; everything else gets flat ground and never loads Terrain at all.
 */
export type GroundSampler = (x: number, z: number) => number;

/**
 * THE HEX LAW'S COLOUR, INJECTED FOR THE SAME REASON THE GROUND SAMPLER IS. `E1_RIVERBANK_GREEN`
 * lives in `src/world/GreenWaypoint.ts`, which imports Terrain — so importing the constant here
 * would re-open exactly the module edge that made the whole Playwright suite uncollectable.
 * `Game.ts` passes the canonical constant, so the browser still has ONE authority for it. The
 * fallback below is never painted: headless constructs no scene and supplies no voice.
 */
export const SEED_CARAVAN_UNPAINTED_GREEN = '#848c6c';

type Point = { x: number; z: number };

export class SeedCaravanSystem {
  readonly group = new THREE.Group();

  private readonly body: THREE.Group;
  private readonly bodyMaterial: THREE.MeshStandardMaterial;
  private readonly position: THREE.Vector3;
  private readonly totalLength: number;
  private readonly plantedBefore: ReadonlySet<string>;
  private readonly plantedThisRun = new Set<string>();
  private readonly refusals = { outOfReach: 0, alreadyHeld: 0, closed: 0, caravanAway: 0 };
  private readonly initialMaxHp = SEED_CARAVAN_MAX_HP;

  private leg = 1;
  private travelled = 0;
  private hp = SEED_CARAVAN_MAX_HP;
  private maxHp = SEED_CARAVAN_MAX_HP;
  private dwellRemaining = 0;
  private state: SeedCaravanState = 'moving';
  private arrivedLatch = false;

  private constructor(
    private readonly contractId: string,
    private readonly route: readonly Point[],
    private readonly grounds: readonly SeedPlantGround[],
    private readonly tileState: TileStateStore,
    private readonly onVoice?: (position: THREE.Vector3, text: string, color: string) => void,
    private readonly groundY: GroundSampler = () => 0,
    private readonly green: string = SEED_CARAVAN_UNPAINTED_GREEN,
  ) {
    this.group.name = 'SeedCaravanSystem';
    this.position = new THREE.Vector3(route[0]!.x, 0, route[0]!.z);
    this.totalLength = route.slice(1).reduce(
      (sum, point, index) => sum + Math.hypot(point.x - route[index]!.x, point.z - route[index]!.z),
      0,
    );
    this.plantedBefore = new Set(
      this.tileState.readSnapshot(contractId).entries
        .filter((entry) => isGreenWaypointEntry(entry))
        .flatMap((entry) => {
          const suffix = entry.id.slice(GREEN_WAYPOINT_PREFIX_LENGTH);
          return suffix ? [suffix] : [];
        }),
    );
    this.bodyMaterial = new THREE.MeshStandardMaterial({ color: '#8b7d3c', roughness: 0.74, metalness: 0.18 });
    this.body = this.createBody();
    this.group.add(this.body);
    this.syncBody();
  }

  /**
   * Mirrors both engines with ONE read: the active contract's own twist plus its own zones.
   * Deliberately NOT epoch-gated and NOT id-gated — a contract that declares
   * `twist.persistentPlanting` and authors the route data is the whole test, so A10's Old Canal
   * cannot accidentally inherit a caravan and a future planting map needs no edit here.
   */
  static create(
    contract: ContractManifest,
    tileState: TileStateStore,
    onVoice?: (position: THREE.Vector3, text: string, color: string) => void,
    groundY?: GroundSampler,
    green?: string,
  ): SeedCaravanSystem | null {
    if (!contract.twist.persistentPlanting) return null;
    const zones = contract.tileParams.buildZones ?? [];
    const stakes = contract.tileParams.stakeMarkers ?? [];
    if (zones.length < 3 || stakes.length === 0) return null;

    const route = zones.map((zone) => ({
      x: (zone.minX + zone.maxX) / 2,
      z: (zone.minZ + zone.maxZ) / 2,
    }));
    const grounds = stakes.flatMap((stake) => {
      const zone = zones.find((candidate) =>
        stake.x >= candidate.minX && stake.x <= candidate.maxX
        && stake.z >= candidate.minZ && stake.z <= candidate.maxZ);
      return zone ? [{ id: stake.id, zoneId: zone.id, x: stake.x, z: stake.z }] : [];
    });
    // A caravan with no ground to plant on is not this mechanic; refuse rather than stretch.
    if (grounds.length === 0) return null;
    return new SeedCaravanSystem(contract.id, route, grounds, tileState, onVoice, groundY, green);
  }

  /**
   * The whole tick. Contact damage first (a caravan that dies this frame does not also move),
   * then the dwell clock, then travel. `enemies` is the live pool; nothing here writes to it.
   */
  update(delta: number, enemies: readonly CaravanEnemy[]): void {
    if (this.state === 'arrived' || this.state === 'lost') return;

    let biting = 0;
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      const dx = enemy.position.x - this.position.x;
      const dz = enemy.position.z - this.position.z;
      if (dx * dx + dz * dz > SEED_CARAVAN_CONTACT_RADIUS * SEED_CARAVAN_CONTACT_RADIUS) continue;
      biting += 1;
      if (biting >= SEED_CARAVAN_CONTACT_ATTACKER_CAP) break;
    }
    if (biting > 0) {
      this.hp = Math.max(0, this.hp - biting * SEED_CARAVAN_CONTACT_DPS * delta);
      if (this.hp <= 0) {
        this.state = 'lost';
        this.syncBody();
        this.onVoice?.(this.position, 'The seed train is lost', '#c76a4b');
        return;
      }
      this.syncBody();
    }

    if (this.dwellRemaining > 0) {
      this.dwellRemaining = Math.max(0, this.dwellRemaining - delta);
      this.state = this.dwellRemaining > 0 ? 'paused' : 'moving';
      return;
    }

    this.state = 'moving';
    let remaining = delta * SEED_CARAVAN_SPEED;
    while (remaining > 0 && this.leg < this.route.length) {
      const next = this.route[this.leg]!;
      const distance = Math.hypot(next.x - this.position.x, next.z - this.position.z);
      if (distance <= remaining + 1e-6) {
        this.travelled += distance;
        remaining -= distance;
        this.position.set(next.x, this.position.y, next.z);
        this.leg += 1;
        if (this.leg >= this.route.length) {
          this.state = 'arrived';
          this.arrivedLatch = true;
          this.onVoice?.(this.position, 'The seed train reaches the basin', this.green);
          break;
        }
        // Every intermediate route point that carries a stake is a plant window.
        if (this.groundAt(next)) {
          this.dwellRemaining = SEED_CARAVAN_DWELL_SECONDS;
          this.state = 'paused';
          this.onVoice?.(this.position, 'The seed train halts — plant or move on', this.green);
          break;
        }
      } else {
        const step = remaining / distance;
        this.position.x += (next.x - this.position.x) * step;
        this.position.z += (next.z - this.position.z) * step;
        this.travelled += remaining;
        remaining = 0;
      }
    }
    this.syncBody();
  }

  /**
   * THE PLANT — a context action at the stake, one per ground, for the whole life of the profile.
   *
   * PERSISTENCE LAW (TP-02's, unchanged): the write is STAGED here and lands at the run-end
   * commit; it takes effect at the NEXT tile birth through `applyAtBirth`. Nothing about this
   * run's no-spawn zones changes, ever. Planting is what COSTS: the guard drops by the ratified
   * slice immediately, which is the whole trade.
   */
  tryPlant(from: THREE.Vector3): SeedPlantResult {
    if (this.state === 'lost' || this.state === 'arrived') {
      this.refusals.closed += 1;
      return { ok: false, reason: 'CLOSED: the seed train is no longer on the road.' };
    }
    const ground = this.nearestGroundWithinReach(from);
    if (!ground) {
      this.refusals.outOfReach += 1;
      return { ok: false, reason: `OUT_OF_REACH: no planting stake within ${SEED_CARAVAN_PLANT_REACH}m.` };
    }
    if (this.atGround?.id !== ground.id) {
      this.refusals.caravanAway += 1;
      return { ok: false, reason: `CARAVAN_AWAY: the seed train is not standing at ${ground.id}.` };
    }
    if (this.plantedThisRun.has(ground.id) || this.plantedBefore.has(ground.id)) {
      this.refusals.alreadyHeld += 1;
      this.onVoice?.(new THREE.Vector3(ground.x, 0, ground.z), 'The green already holds here', this.green);
      return { ok: false, reason: `ALREADY_HELD: ${ground.id} already carries a vault.` };
    }

    this.tileState.stageWrite(this.contractId, {
      kind: 'sim',
      id: greenWaypointEntryId(ground.id),
      payload: { x: ground.x, z: ground.z, r: Balance.persistence.greenWaypointRadius },
      schemaVersion: TILE_STATE_SCHEMA_VERSION,
    });
    this.plantedThisRun.add(ground.id);

    const cost = Math.round(this.initialMaxHp * SEED_CARAVAN_PLANT_COST_RATIO);
    this.maxHp = Math.max(1, this.maxHp - cost);
    this.hp = Math.max(1, Math.min(this.hp - cost, this.maxHp));
    this.syncBody();
    this.onVoice?.(new THREE.Vector3(ground.x, 0, ground.z), 'The green takes root — it will hold', this.green);
    return { ok: true, groundId: ground.id, costHp: cost };
  }

  /** The ground the caravan is standing at, or null. Pure. */
  get atGround(): SeedPlantGround | null {
    if (this.state === 'lost' || this.state === 'arrived') return null;
    return this.grounds.find((ground) =>
      Math.hypot(ground.x - this.position.x, ground.z - this.position.z) <= SEED_CARAVAN_AT_GROUND_RADIUS) ?? null;
  }

  /** The nearest plantable stake in reach, or null. Pure — no counter moves. */
  nearestGroundWithinReach(from: THREE.Vector3): SeedPlantGround | null {
    let best: SeedPlantGround | null = null;
    let bestDistance = SEED_CARAVAN_PLANT_REACH;
    for (const ground of this.grounds) {
      const distance = Math.hypot(from.x - ground.x, from.z - ground.z);
      if (distance <= bestDistance) {
        best = ground;
        bestDistance = distance;
      }
    }
    return best;
  }

  /** THE OBJECTIVE LATCH: true once the caravan has reached the basin alive. Never un-latches. */
  get objectiveComplete(): boolean {
    return this.arrivedLatch;
  }

  get objectiveLost(): boolean {
    return this.state === 'lost';
  }

  get diagnostics(): SeedCaravanDiagnostics {
    return {
      declared: true,
      state: this.state,
      hp: round3(this.hp),
      maxHp: this.maxHp,
      progress: this.totalLength > 0 ? round3(Math.min(1, this.travelled / this.totalLength)) : 0,
      leg: this.leg,
      position: { x: round3(this.position.x), z: round3(this.position.z) },
      dwellRemaining: round3(this.dwellRemaining),
      arrived: this.arrivedLatch,
      plantedThisRun: [...this.plantedThisRun],
      plantedBefore: [...this.plantedBefore],
      refusals: { ...this.refusals },
      atGround: this.atGround?.id ?? null,
      grounds: this.grounds,
      route: this.route,
    };
  }

  /** Stable event-log slice: the static declarations and the render mount stay out. */
  get simulationSnapshot(): unknown {
    const { grounds: _grounds, route: _route, declared: _declared, ...simulation } = this.diagnostics;
    return simulation;
  }

  /**
   * A run reset re-reads NOTHING from storage: `plantedBefore` was read at birth and the loader
   * contract forbids a mid-life re-read. Staged writes survive the reset on purpose — they belong
   * to the profile's commit at run end, not to this run's scoreboard, and keeping them is also
   * what keeps a ground refused for the rest of the session.
   *
   * THE GUARD, HOWEVER, COMES BACK WHOLE, and that is the ratified trade rather than an oversight:
   * "spend now, shelter forever" is paid ONCE. A vault taken on the last run must not still be
   * costing the caravan on this one, or the map would grow monotonically harder for having been
   * invested in — the opposite of the lesson (`door-completion-sheet.md:22`).
   */
  reset(): void {
    this.leg = 1;
    this.travelled = 0;
    this.maxHp = this.initialMaxHp;
    this.hp = this.maxHp;
    this.dwellRemaining = 0;
    this.state = 'moving';
    this.arrivedLatch = false;
    this.position.set(this.route[0]!.x, this.position.y, this.route[0]!.z);
    this.syncBody();
  }

  resampleTerrain(): void {
    this.body.position.y = this.groundY(this.position.x, this.position.z);
  }

  dispose(): void {
    this.bodyMaterial.dispose();
    this.body.traverse((part) => {
      if (part instanceof THREE.Mesh) part.geometry.dispose();
    });
  }

  private groundAt(point: Point): SeedPlantGround | null {
    return this.grounds.find((ground) =>
      Math.abs(ground.x - point.x) < 1e-6 && Math.abs(ground.z - point.z) < 1e-6) ?? null;
  }

  private createBody(): THREE.Group {
    const body = new THREE.Group();
    body.name = 'SeedCaravan';
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 1.5), this.bodyMaterial);
    hull.position.y = 0.55;
    const vault = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.7, 1.1),
      new THREE.MeshStandardMaterial({ color: this.green, roughness: 0.9 }),
    );
    vault.position.y = 1.3;
    body.add(hull, vault);
    body.traverse((part) => { part.renderOrder = RenderLayers.gameplay; });
    return body;
  }

  private syncBody(): void {
    this.body.position.set(this.position.x, this.groundY(this.position.x, this.position.z), this.position.z);
    this.body.visible = this.state !== 'lost';
    // Damage reads on the hull, so a player can see the guard spending without a bar.
    const health = this.maxHp > 0 ? Math.max(0, Math.min(1, this.hp / this.maxHp)) : 0;
    this.bodyMaterial.color.setStyle('#8b7d3c').lerp(new THREE.Color('#5a3a2c'), 1 - health);
  }
}

function round3(value: number): number {
  return Number(value.toFixed(3));
}
