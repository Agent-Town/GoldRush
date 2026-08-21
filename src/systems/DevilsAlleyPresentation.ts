import * as THREE from 'three';
import { Balance } from '../game/Balance';
import { RenderLayers } from '../core/RenderLayers';
import type { ScheduledRelocationDiagnostics } from './ScheduledRelocationSystem';

/**
 * A9 — THE DEVIL, MADE VISIBLE. Presentation ONLY.
 *
 * THE ENTITY IS REUSED, NOT REBUILT (the sheet: "the dust-devil entity already exists with a live
 * position (E9CanalSystem, dome-basin)"). Every dimension and colour below is read from
 * `Balance.e9Canal.dustDevil` — the SAME authored block the Dome Basin column is built from
 * (`E9CanalSystem.createDustDevil`) — so the two devils are one creature with one look, and a
 * later art pass on that block moves both at once. What is NOT reused is the class: importing
 * `E9CanalSystem` here would drag the canal, its mask table and its weather clock onto a map that
 * declares none of them, which is the opposite of reuse.
 *
 * NO NEW ART. A cone and three rings, exactly as the existing devil is drawn today.
 *
 * ZERO SIM REACH, and that is this file's whole contract. It is constructed only by the browser,
 * reads `ScheduledRelocationDiagnostics` (already rounded, already published), and writes nothing
 * back — so no event-log hash and no null floor can move because of anything here. The LIFTED
 * BUILDINGS need no code at all: the consumer moves their real positions every fixed step, so the
 * pools already carry them along beside the column, which is the "may simply lerp" the brief
 * allowed and cheaper than a second animation path.
 *
 * TERRAIN IS INJECTED, NOT IMPORTED (F-A8-7), for the same reason `SeedCaravanPresentation`
 * injects it: a module-scope `../world/Terrain` import drags a `?raw` JSON import into every
 * graph that reaches this file.
 */
export type GroundSampler = (x: number, z: number) => number;

export type DevilsAlleyPresentationDiagnostics = Readonly<{
  /** True while the column is drawn — a plain-boot spec can assert the player SEES the sweep. */
  columnVisible: boolean;
  /** Where the column stands, or null between sweeps. */
  columnAt: { x: number; z: number } | null;
  /** The anchor rings drawn on the ground, one per authored anchor. Always visible. */
  anchorRings: number;
  routeId: string | null;
}>;

export class DevilsAlleyPresentation {
  readonly group = new THREE.Group();

  private readonly column = new THREE.Group();
  private readonly rings = new THREE.Group();
  private readonly material: THREE.MeshBasicMaterial;
  private readonly ringMaterial: THREE.MeshBasicMaterial;
  private readonly geometries: THREE.BufferGeometry[] = [];
  private columnAt: { x: number; z: number } | null = null;
  private routeId: string | null = null;

  constructor(
    diagnostics: ScheduledRelocationDiagnostics,
    private readonly groundY: GroundSampler = () => 0,
  ) {
    this.group.name = 'DevilsAlleyPresentation';
    const devil = Balance.e9Canal.dustDevil;
    this.material = new THREE.MeshBasicMaterial({
      color: devil.color,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const cone = new THREE.ConeGeometry(devil.columnRadius, devil.columnHeight, 12, 1, true);
    this.geometries.push(cone);
    const shaft = new THREE.Mesh(cone, this.material);
    shaft.position.y = devil.columnHeight * 0.5;
    this.column.add(shaft);
    for (let index = 0; index < 3; index += 1) {
      const torus = new THREE.TorusGeometry(devil.columnRadius * (0.55 + index * 0.18), 0.055, 5, 24);
      this.geometries.push(torus);
      const ring = new THREE.Mesh(torus, this.material);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.65 + index * 1.25;
      this.column.add(ring);
    }
    this.column.name = 'DevilsAlleySweepColumn';
    this.column.visible = false;
    this.group.add(this.column);

    // THE ANCHOR HOLDS, DRAWN ON THE GROUND. This is the legibility half and the reason A8's
    // playtest finding exists ("I was not even aware that there is a caravan"): a rider cannot
    // choose safe ground it cannot see. One flat ring per authored anchor, at the exact hold
    // radius the consumer tests, so where the ring is, the wind is refused.
    this.ringMaterial = new THREE.MeshBasicMaterial({
      color: devil.telegraphColor,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    for (const anchor of diagnostics.anchors) {
      const geometry = new THREE.RingGeometry(Math.max(0.1, anchor.holdRadius - 0.35), anchor.holdRadius, 48);
      this.geometries.push(geometry);
      const ring = new THREE.Mesh(geometry, this.ringMaterial);
      ring.name = `DevilsAlleyAnchorHold-${anchor.id}`;
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(anchor.x, this.groundY(anchor.x, anchor.z) + 0.03, anchor.z);
      ring.renderOrder = RenderLayers.groundDecals;
      ring.userData.anchor = { x: anchor.x, z: anchor.z };
      this.rings.add(ring);
    }
    this.rings.name = 'DevilsAlleyAnchorHolds';
    this.group.add(this.rings);
    this.update(diagnostics);
  }

  update(diagnostics: ScheduledRelocationDiagnostics): void {
    const at = diagnostics.devil;
    this.columnAt = at ? { x: at.x, z: at.z } : null;
    this.routeId = diagnostics.routeId;
    this.column.visible = at !== null;
    if (at) this.column.position.set(at.x, this.groundY(at.x, at.z) + 0.02, at.z);
  }

  resampleTerrain(): void {
    for (const ring of this.rings.children) {
      const anchor = ring.userData.anchor as { x: number; z: number } | undefined;
      if (anchor) ring.position.y = this.groundY(anchor.x, anchor.z) + 0.03;
    }
    const at = this.columnAt;
    if (at) this.column.position.y = this.groundY(at.x, at.z) + 0.02;
  }

  reset(diagnostics: ScheduledRelocationDiagnostics): void {
    this.update(diagnostics);
  }

  get diagnostics(): DevilsAlleyPresentationDiagnostics {
    return {
      columnVisible: this.column.visible,
      columnAt: this.columnAt ? { ...this.columnAt } : null,
      anchorRings: this.rings.children.length,
      routeId: this.routeId,
    };
  }

  dispose(): void {
    for (const geometry of this.geometries) geometry.dispose();
    this.geometries.length = 0;
    this.material.dispose();
    this.ringMaterial.dispose();
    this.group.clear();
  }
}
