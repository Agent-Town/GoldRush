import { ConeGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import type { RegattaRaceDiagnostics } from '../systems/RegattaRaceSystem';
import { disposeObject3D } from '../utils/dispose';

/**
 * E5 REGATTA, SLICE 2 — THE BUOYS (`specs/agent-play/e5-regatta-steerable-boat.md` law 3, "the
 * beacons stay where they are and are read as buoys the boat passes"; Q3, ratified 2026-09-19:
 * the buoys stay at the five authored beacons).
 *
 * RENDER-ONLY AND PLACEHOLDER-FIRST. No raw art, no GLB, no loader: five procedural can-buoys in
 * the E5 palette, built once from three shared geometries and three shared materials. The gate
 * test is untouched by this file — it is still a point-in-radius on the hull's position in
 * `RegattaRaceSystem.advance` — so nothing here can move a determinism hash. What the buoys add is
 * the thing a human at the keys could not see before: WHICH MARK IS NEXT. A racer who cannot tell
 * the mark they must round from the four they need not is being asked to read the diagnostics
 * panel instead of the water.
 *
 * `canvas.dataset.regattaBuoys` is the render-side readout a PLAIN BOOT can assert on (no `?debug`,
 * no `__GR_TEST__`), exactly as `dataset.claimBoat` is for the hull.
 */

type Beacon = Readonly<{ id: string; x: number; z: number }>;
type BuoyState = 'passed' | 'next' | 'ahead';

/**
 * The E5 palette, placeholder-first: the Dredge-Queen's weathered sea-teal for a mark already
 * rounded, the era's brass for the mark that is live, and the era's rust for the marks still to
 * come. Warm and illustrated, never signage-bright (`docs/GOLD_RUSH_BRIEF.md` §4).
 */
const BUOY_COLORS: Readonly<Record<BuoyState, string>> = Object.freeze({
  passed: '#4f6f6c',
  next: '#e3a63a',
  ahead: '#a85e32',
});

/** Half-submerged at the waterline (y = 0), which is where `ClaimBoatView` floats the hull. */
const FLOAT_Y = 0.3;
const MAST_Y = 1.35;
const TOPMARK_Y = 2.25;

export class RegattaBuoysView {
  readonly group = new Group();
  private disposed = false;
  private readonly floatGeometry = new CylinderGeometry(0.52, 0.78, 1.15, 8);
  private readonly mastGeometry = new CylinderGeometry(0.07, 0.07, 1.5, 5);
  private readonly topmarkGeometry = new ConeGeometry(0.36, 0.72, 8);
  private readonly materials: Readonly<Record<BuoyState, MeshStandardMaterial>> = Object.freeze({
    passed: new MeshStandardMaterial({ color: BUOY_COLORS.passed, roughness: 0.85, metalness: 0.05 }),
    next: new MeshStandardMaterial({ color: BUOY_COLORS.next, roughness: 0.55, metalness: 0.2, emissive: '#5a3c05' }),
    ahead: new MeshStandardMaterial({ color: BUOY_COLORS.ahead, roughness: 0.8, metalness: 0.05 }),
  });
  private readonly mastMaterial = new MeshStandardMaterial({ color: '#6f5436', roughness: 0.9, metalness: 0.05 });
  private readonly buoys: Array<{ id: string; float: Mesh; topmark: Mesh; state: BuoyState | null }>;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    beacons: readonly Beacon[],
    private readonly race: () => RegattaRaceDiagnostics | undefined,
  ) {
    this.group.name = 'RegattaBuoysView';
    this.buoys = beacons.map((beacon) => {
      const buoy = new Group();
      buoy.name = `buoy:${beacon.id}`;
      buoy.position.set(beacon.x, 0, beacon.z);
      const float = new Mesh(this.floatGeometry, this.materials.ahead);
      float.position.y = FLOAT_Y;
      const mast = new Mesh(this.mastGeometry, this.mastMaterial);
      mast.position.y = MAST_Y;
      const topmark = new Mesh(this.topmarkGeometry, this.materials.ahead);
      topmark.position.y = TOPMARK_Y;
      buoy.add(float, mast, topmark);
      this.group.add(buoy);
      return { id: beacon.id, float, topmark, state: null };
    });
    this.update();
  }

  /**
   * Cheap by construction: the state of five buoys is recomputed per call, but a mesh's material is
   * only reassigned when its state actually CHANGES — which happens at most five times in a race.
   * Nothing here allocates per frame.
   */
  update(): void {
    if (this.disposed) return;
    const race = this.race();
    const passed = new Set((race?.gatesPassed ?? []).map(({ id }) => id));
    const nextId = race?.nextGate?.id ?? null;
    let readout = '';
    for (const buoy of this.buoys) {
      const state: BuoyState = passed.has(buoy.id) ? 'passed' : buoy.id === nextId ? 'next' : 'ahead';
      if (state !== buoy.state) {
        buoy.float.material = this.materials[state];
        buoy.topmark.material = this.materials[state];
        buoy.state = state;
      }
      readout += `${readout ? ',' : ''}${buoy.id}:${state}`;
    }
    // The race's own terminal words, so a plain boot can read "why is no buoy next" off the canvas.
    this.canvas.dataset.regattaBuoys = `${readout}|${race?.finished ? 'finished' : race?.forfeited ? 'forfeited' : 'racing'}`;
  }

  dispose(): void {
    this.disposed = true;
    disposeObject3D(this.group);
    this.group.clear();
    this.group.removeFromParent();
    this.floatGeometry.dispose();
    this.mastGeometry.dispose();
    this.topmarkGeometry.dispose();
    for (const material of Object.values(this.materials)) material.dispose();
    this.mastMaterial.dispose();
    delete this.canvas.dataset.regattaBuoys;
  }
}
