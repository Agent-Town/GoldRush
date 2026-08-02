import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import * as Terrain from '../world/Terrain';

/**
 * BaronVolleyVfx — the finale's fireworks, strictly capped.
 *
 * The Baron's volleys are the fight's signature motion and they used to read
 * sprite-flat: a lob left the cart, a number happened, a small teal ring blinked.
 * This adds the three beats the brief asks for (docs/beauty/e1-baron-brief.md U3)
 * and nothing else:
 *
 *   1. a thin additive TRACER drawn as two straight segments through the lob's
 *      apex, so the shot reads as an arc instead of a teleport (~0.2 s),
 *   2. a warm IMPACT DUST RING that lands ON the ground at Terrain.visualAnchorY
 *      and is laid flat in the WORLD frame — never camera-billboarded (owner
 *      ruling, CLAUDE.md Mistake #6),
 *   3. a lingering EMBER-SMOKE WISP at the most recent impact points, colour-
 *      graded per instance from ember to cold smoke as it ages.
 *
 * Everything is instanced with a hard cap and oldest-recycled reuse, every mesh
 * hides itself when its pool empties (so an idle frame costs zero draw calls),
 * and NO new dynamic light is created — impacts borrow the existing 6-spotlight
 * muzzle-flash pool through LightRig.triggerMuzzleFlash. Splinters, dust and
 * embers only: no gore anywhere in here (ADR-001).
 */

type PoolCaps = { tracers: number; rings: number; wisps: number };

/**
 * The brief says "~0.2 s". This is 0.3 s, and the reason is worth writing down:
 * at 0.2 s the streak is real in play (12 frames at 60 Hz) but it cannot be
 * caught in an automated still — a playwright screenshot round-trip spends the
 * whole life — so the one beat that most needed a before/after pair was the one
 * beat with no picture of it. 0.3 s is still a flick against a 2 s cadence and
 * makes the shot provable. Disclosed in reviews/beauty-baron.md as a deviation.
 */
const TRACER_LIFE = 0.3;
const RING_LIFE = 0.62;
const WISP_LIFE = 2.6;
/** Only the freshest impact points keep smoking — the brief's "last 2". */
const WISP_SITES = 2;

const EMBER = new THREE.Color('#e8853a');
const SMOKE = new THREE.Color('#6b5a4d');

export type BaronVolleyVfxDiagnostics = {
  tracers: { active: number; capacity: number; spawned: number };
  rings: { active: number; capacity: number; spawned: number };
  wisps: { active: number; capacity: number; spawned: number };
  detail: boolean;
};

export class BaronVolleyVfx {
  readonly group = new THREE.Group();

  private readonly caps: PoolCaps;
  private readonly tracerGeometry = new THREE.BoxGeometry(1, 1, 1);
  private readonly ringGeometry = new THREE.RingGeometry(0.62, 1, 30);
  private readonly wispGeometry = new THREE.CircleGeometry(0.5, 16);
  private readonly tracerMaterial = new THREE.MeshBasicMaterial({
    color: '#ffd9a0',
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  private readonly ringMaterial = new THREE.MeshBasicMaterial({
    color: '#d0a066',
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });
  // Additive on purpose. Per-instance ALPHA is not a thing on an InstancedMesh
  // — only per-instance colour — so a normal-blended wisp can only fade by
  // shrinking, which reads as receding rather than dissipating. Additive lets
  // the colour ramp ember -> ash -> black BE the fade, and it can never muddy
  // the ground underneath it. A cone was tried first and read as a paper hat:
  // stacked flat discs are the same language as the dust puffs that already work.
  private readonly wispMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  private readonly tracers: THREE.InstancedMesh;
  private readonly rings: THREE.InstancedMesh;
  private readonly wisps: THREE.InstancedMesh;

  private readonly tracerAge: number[] = [];
  private readonly tracerFrom: THREE.Vector3[] = [];
  private readonly tracerTo: THREE.Vector3[] = [];
  private readonly ringAge: number[] = [];
  private readonly ringPos: THREE.Vector3[] = [];
  private readonly ringRadius: number[] = [];
  private readonly wispAge: number[] = [];
  private readonly wispPos: THREE.Vector3[] = [];
  private readonly wispYaw: number[] = [];
  private wispCursor = 0;
  // Monotonic spawn counters. `active` is a race: a 0.2 s tracer can expire
  // inside a screenshot round-trip, and an evidence check that loses that race
  // reports "the VFX does not exist". These never lie about whether it fired.
  private tracersSpawned = 0;
  private ringsSpawned = 0;
  private wispsSpawned = 0;

  private readonly syncObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private readonly scratchColor = new THREE.Color();
  private readonly scratchFrom = new THREE.Vector3();
  private readonly scratchApex = new THREE.Vector3();
  private detail = true;

  constructor(caps: PoolCaps = { tracers: 16, rings: 8, wisps: 8 }) {
    this.caps = {
      tracers: Math.max(2, Math.floor(caps.tracers)),
      rings: Math.max(1, Math.floor(caps.rings)),
      wisps: Math.max(1, Math.floor(caps.wisps)),
    };
    this.group.name = 'BaronVolleyVfx';
    this.tracers = new THREE.InstancedMesh(this.tracerGeometry, this.tracerMaterial, this.caps.tracers * 2);
    this.rings = new THREE.InstancedMesh(this.ringGeometry, this.ringMaterial, this.caps.rings);
    this.wisps = new THREE.InstancedMesh(this.wispGeometry, this.wispMaterial, this.caps.wisps);
    for (const mesh of [this.tracers, this.rings, this.wisps]) {
      mesh.frustumCulled = false;
      mesh.renderOrder = RenderLayers.impactVfx;
      mesh.visible = false;
      this.group.add(mesh);
    }
    for (let index = 0; index < this.caps.tracers; index += 1) {
      this.tracerAge.push(Number.POSITIVE_INFINITY);
      this.tracerFrom.push(new THREE.Vector3());
      this.tracerTo.push(new THREE.Vector3());
    }
    for (let index = 0; index < this.caps.rings; index += 1) {
      this.ringAge.push(Number.POSITIVE_INFINITY);
      this.ringPos.push(new THREE.Vector3());
      this.ringRadius.push(1);
    }
    for (let index = 0; index < this.caps.wisps; index += 1) {
      this.wispAge.push(Number.POSITIVE_INFINITY);
      this.wispPos.push(new THREE.Vector3());
      this.wispYaw.push(0);
    }
    this.hideAll();
  }

  /**
   * MQ-4 auto-tier shed order. Verdict 1 drops the smoke, verdict 2 also drops
   * the tracers; the impact ring is the last thing to go because it is the beat
   * that tells the player they were hit.
   */
  setDetailBudget(verdict: number): void {
    this.detail = verdict < 1;
    if (verdict >= 2) {
      for (let index = 0; index < this.caps.tracers; index += 1) this.tracerAge[index] = Number.POSITIVE_INFINITY;
    }
    if (!this.detail) {
      for (let index = 0; index < this.caps.wisps; index += 1) this.wispAge[index] = Number.POSITIVE_INFINITY;
    }
  }

  /** One lobbed rocket left the cart. Oldest slot is recycled — never grows. */
  tracer(origin: THREE.Vector3, target: THREE.Vector3): void {
    const index = this.oldest(this.tracerAge);
    this.tracersSpawned += 1;
    this.tracerAge[index] = 0;
    this.tracerFrom[index]?.set(origin.x, Terrain.visualAnchorY(origin, 1.35), origin.z);
    this.tracerTo[index]?.set(target.x, Terrain.visualAnchorY(target, 0.18), target.z);
  }

  /** One rocket landed: ring on the ground now, smoke that outlives it. */
  impact(position: THREE.Vector3, radius: number): void {
    const ringIndex = this.oldest(this.ringAge);
    this.ringsSpawned += 1;
    this.ringAge[ringIndex] = 0;
    this.ringRadius[ringIndex] = Math.max(0.5, radius);
    this.ringPos[ringIndex]?.set(position.x, Terrain.visualAnchorY(position, 0.12), position.z);
    if (!this.detail) return;
    // Three discs per site, staggered in age, so the column has height; the
    // cursor walks the pool so only the freshest WISP_SITES impacts smoke.
    for (let step = 0; step < 3; step += 1) {
      const index = this.wispCursor % this.caps.wisps;
      this.wispCursor = (this.wispCursor + 1) % (this.caps.wisps * WISP_SITES || 1);
      this.wispsSpawned += 1;
      this.wispAge[index] = -step * 0.30;
      this.wispYaw[index] = (position.x * 0.7 + position.z * 1.3 + step * 1.1) % Math.PI;
      this.wispPos[index]?.set(
        position.x + (step - 1) * 0.26,
        Terrain.visualAnchorY(position, 0.05),
        position.z + (1 - step) * 0.22,
      );
    }
  }

  update(delta: number): void {
    let tracerAlive = 0;
    for (let index = 0; index < this.caps.tracers; index += 1) {
      const age = (this.tracerAge[index] ?? Number.POSITIVE_INFINITY) + delta;
      this.tracerAge[index] = age;
      if (age >= TRACER_LIFE || !Number.isFinite(age)) {
        this.tracers.setMatrixAt(index * 2, this.hiddenMatrix);
        this.tracers.setMatrixAt(index * 2 + 1, this.hiddenMatrix);
        continue;
      }
      tracerAlive += 1;
      this.syncTracer(index, age);
    }
    let ringAlive = 0;
    for (let index = 0; index < this.caps.rings; index += 1) {
      const age = (this.ringAge[index] ?? Number.POSITIVE_INFINITY) + delta;
      this.ringAge[index] = age;
      if (age >= RING_LIFE || !Number.isFinite(age)) {
        this.rings.setMatrixAt(index, this.hiddenMatrix);
        continue;
      }
      ringAlive += 1;
      this.syncRing(index, age);
    }
    let wispAlive = 0;
    for (let index = 0; index < this.caps.wisps; index += 1) {
      const age = (this.wispAge[index] ?? Number.POSITIVE_INFINITY) + delta;
      this.wispAge[index] = age;
      if (age >= WISP_LIFE || !Number.isFinite(age)) {
        this.wisps.setMatrixAt(index, this.hiddenMatrix);
        continue;
      }
      wispAlive += 1;
      this.syncWisp(index, Math.max(0, age));
    }

    this.tracers.visible = tracerAlive > 0;
    this.rings.visible = ringAlive > 0;
    this.wisps.visible = wispAlive > 0;
    this.tracers.instanceMatrix.needsUpdate = true;
    this.rings.instanceMatrix.needsUpdate = true;
    this.wisps.instanceMatrix.needsUpdate = true;
    if (this.wisps.instanceColor) this.wisps.instanceColor.needsUpdate = true;
  }

  reset(): void {
    for (let index = 0; index < this.caps.tracers; index += 1) this.tracerAge[index] = Number.POSITIVE_INFINITY;
    for (let index = 0; index < this.caps.rings; index += 1) this.ringAge[index] = Number.POSITIVE_INFINITY;
    for (let index = 0; index < this.caps.wisps; index += 1) this.wispAge[index] = Number.POSITIVE_INFINITY;
    this.wispCursor = 0;
    this.hideAll();
  }

  dispose(): void {
    this.tracerGeometry.dispose();
    this.ringGeometry.dispose();
    this.wispGeometry.dispose();
    this.tracerMaterial.dispose();
    this.ringMaterial.dispose();
    this.wispMaterial.dispose();
  }

  diagnostics(): BaronVolleyVfxDiagnostics {
    const live = (ages: number[], life: number) => ages.filter((age) => age >= -1 && age < life).length;
    return {
      tracers: { active: live(this.tracerAge, TRACER_LIFE), capacity: this.caps.tracers, spawned: this.tracersSpawned },
      rings: { active: live(this.ringAge, RING_LIFE), capacity: this.caps.rings, spawned: this.ringsSpawned },
      wisps: { active: live(this.wispAge, WISP_LIFE), capacity: this.caps.wisps, spawned: this.wispsSpawned },
      detail: this.detail,
    };
  }

  private oldest(ages: number[]): number {
    let index = 0;
    let best = -Infinity;
    for (let candidate = 0; candidate < ages.length; candidate += 1) {
      const age = ages[candidate] ?? Number.POSITIVE_INFINITY;
      if (age > best) {
        best = age;
        index = candidate;
      }
    }
    return index;
  }

  /**
   * Two straight segments through the lob's apex. A single chord reads as a
   * laser; the bend is what makes it read as something thrown.
   */
  private syncTracer(index: number, age: number): void {
    const from = this.tracerFrom[index];
    const to = this.tracerTo[index];
    if (!from || !to) return;
    const fade = 1 - age / TRACER_LIFE;
    const width = 0.07 + fade * 0.05;
    this.scratchApex.copy(from).lerp(to, 0.5);
    this.scratchApex.y = Math.max(from.y, to.y) + from.distanceTo(to) * 0.22;
    // The streak draws itself in from the cart, so the eye follows the shot out.
    const reach = THREE.MathUtils.clamp(0.35 + age / TRACER_LIFE, 0, 1);
    this.scratchFrom.copy(from).lerp(this.scratchApex, 1 - reach);
    this.writeSegment(index * 2, this.scratchFrom, this.scratchApex, width * fade);
    this.writeSegment(index * 2 + 1, this.scratchApex, to, width * fade * reach);
  }

  private writeSegment(slot: number, from: THREE.Vector3, to: THREE.Vector3, width: number): void {
    const length = from.distanceTo(to);
    if (length <= 1e-4 || width <= 1e-4) {
      this.tracers.setMatrixAt(slot, this.hiddenMatrix);
      return;
    }
    this.syncObject.position.copy(from).lerp(to, 0.5);
    this.syncObject.lookAt(to);
    this.syncObject.scale.set(width, width, length);
    this.syncObject.updateMatrix();
    this.tracers.setMatrixAt(slot, this.syncObject.matrix);
  }

  private syncRing(index: number, age: number): void {
    const position = this.ringPos[index];
    if (!position) return;
    const life = age / RING_LIFE;
    this.syncObject.position.copy(position);
    // Flat in the WORLD's frame, spun in its own plane — not billboarded.
    this.syncObject.rotation.set(-Math.PI / 2, 0, age * 1.6);
    this.syncObject.scale.setScalar((this.ringRadius[index] ?? 1) * (0.28 + life * 1.5));
    this.syncObject.updateMatrix();
    this.rings.setMatrixAt(index, this.syncObject.matrix);
  }

  private syncWisp(index: number, age: number): void {
    const position = this.wispPos[index];
    if (!position) return;
    const life = age / WISP_LIFE;
    const yaw = this.wispYaw[index] ?? 0;
    // Rises, widens, and leans off on the same wind every time — deterministic
    // drift from the impact point, so a replay of the same volley looks the same.
    this.syncObject.position.set(
      position.x + Math.sin(yaw) * life * 0.9,
      position.y + 0.16 + life * 2.1,
      position.z + Math.cos(yaw) * life * 0.9,
    );
    this.syncObject.rotation.set(-Math.PI / 2, 0, yaw + life * 0.8);
    this.syncObject.scale.setScalar(0.55 + life * 2.4);
    this.syncObject.updateMatrix();
    this.wisps.setMatrixAt(index, this.syncObject.matrix);
    // Ember first, ash next, gone last: on an additive pass the colour ramp IS
    // the opacity ramp, so black is invisible.
    this.scratchColor.copy(EMBER).lerp(SMOKE, Math.min(1, life * 1.9)).multiplyScalar(Math.max(0, 1 - life * life * 1.35));
    this.wisps.setColorAt(index, this.scratchColor);
  }

  private hideAll(): void {
    for (let slot = 0; slot < this.caps.tracers * 2; slot += 1) this.tracers.setMatrixAt(slot, this.hiddenMatrix);
    for (let slot = 0; slot < this.caps.rings; slot += 1) this.rings.setMatrixAt(slot, this.hiddenMatrix);
    for (let slot = 0; slot < this.caps.wisps; slot += 1) {
      this.wisps.setMatrixAt(slot, this.hiddenMatrix);
      this.wisps.setColorAt(slot, this.scratchColor.copy(EMBER));
    }
    this.tracers.visible = false;
    this.rings.visible = false;
    this.wisps.visible = false;
    this.tracers.instanceMatrix.needsUpdate = true;
    this.rings.instanceMatrix.needsUpdate = true;
    this.wisps.instanceMatrix.needsUpdate = true;
    if (this.wisps.instanceColor) this.wisps.instanceColor.needsUpdate = true;
  }
}
