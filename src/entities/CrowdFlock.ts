import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import type { CrowdFlockDiagnostics, CrowdFlockState } from '../systems/CrowdFlockSystem';
import { visualY } from '../world/Terrain';

/**
 * THE CROWD FLOCKS, seen — the render half of `CrowdFlockSystem`.
 *
 * Rendering only (CLAUDE.md §4.6): this class reads the system's planar snapshot and never
 * writes to it, and its only vertical number is `visualY`, exactly like `FerrisWheel`. Nothing
 * here is consulted by the sim, so a headless run needs none of it.
 *
 * WHERE THE PLAYER SEES IT, IN A PLAIN BOOT (Mistake #10): three lantern-lit crowds standing at
 * the fair gate from the first frame, each inside a visible escort ring the size of the declared
 * radius. When night falls they walk the midway; when something scares them the ring and the
 * lanterns go rust-red and the crowd turns for home. No `?debug` anywhere.
 */

const FIGURES_PER_FLOCK = 5;
/** The crowd stands in a ring this wide; comfortably inside the 7-unit escort radius. */
const CLUSTER_RADIUS = 1.5;

export class CrowdFlock {
  readonly group = new THREE.Group();
  private readonly crowds: THREE.Group[] = [];
  private readonly rings: THREE.Mesh[] = [];
  private readonly bodies: THREE.Mesh[][] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.MeshStandardMaterial[] = [];
  private readonly calm = new THREE.MeshStandardMaterial({ color: '#e8c477', emissive: '#8a5a1c', emissiveIntensity: 0.55, roughness: 0.62, metalness: 0.06 });
  private readonly afraid = new THREE.MeshStandardMaterial({ color: '#b5573a', emissive: '#5e2016', emissiveIntensity: 0.7, roughness: 0.74, metalness: 0.05 });
  private readonly ringCalm = new THREE.MeshBasicMaterial({ color: '#f0d089', transparent: true, opacity: 0.24, depthWrite: false });
  private readonly ringAfraid = new THREE.MeshBasicMaterial({ color: '#d0603c', transparent: true, opacity: 0.34, depthWrite: false });
  private phase = 0;

  constructor(diagnostics: CrowdFlockDiagnostics) {
    this.group.name = 'CrowdFlocks';
    this.materials.push(this.calm, this.afraid);
    const body = new THREE.CapsuleGeometry(0.22, 0.5, 4, 8);
    const hat = new THREE.ConeGeometry(0.34, 0.24, 8);
    const ring = new THREE.RingGeometry(diagnostics.escortRadius - 0.22, diagnostics.escortRadius, 40);
    this.geometries.push(body, hat, ring);

    for (const flock of diagnostics.flocks) {
      const crowd = new THREE.Group();
      crowd.name = `CrowdFlock:${flock.id}`;
      const escortRing = new THREE.Mesh(ring, this.ringCalm);
      escortRing.rotation.x = -Math.PI / 2;
      escortRing.position.y = 0.04;
      crowd.add(escortRing);
      this.rings.push(escortRing);
      const figures: THREE.Mesh[] = [];
      for (let index = 0; index < FIGURES_PER_FLOCK; index += 1) {
        const angle = (index / FIGURES_PER_FLOCK) * Math.PI * 2;
        const person = new THREE.Group();
        person.position.set(Math.cos(angle) * CLUSTER_RADIUS, 0, Math.sin(angle) * CLUSTER_RADIUS);
        const torso = new THREE.Mesh(body, this.calm);
        torso.position.y = 0.47;
        const brim = new THREE.Mesh(hat, this.calm);
        brim.position.y = 0.86;
        person.add(torso, brim);
        crowd.add(person);
        figures.push(torso, brim);
      }
      this.bodies.push(figures);
      this.crowds.push(crowd);
      this.group.add(crowd);
    }
    this.group.traverse((part) => { part.renderOrder = RenderLayers.gameplay; });
    this.sync(diagnostics);
  }

  /** Places every crowd where the simulation says it is, and dresses it in its mood. */
  sync(diagnostics: CrowdFlockDiagnostics): void {
    for (const [index, flock] of diagnostics.flocks.entries()) {
      const crowd = this.crowds[index];
      if (!crowd) continue;
      crowd.position.set(flock.x, visualY(flock.x, flock.z, 0.02), flock.z);
      const afraid = flock.phase === 'scattering';
      const ring = this.rings[index];
      if (ring) ring.material = afraid ? this.ringAfraid : this.ringCalm;
      for (const mesh of this.bodies[index] ?? []) mesh.material = afraid ? this.afraid : this.calm;
      crowd.rotation.y = headingOf(flock);
    }
  }

  /** A walking crowd bobs; a resting one stands still. Presentation only. */
  update(delta: number, diagnostics: CrowdFlockDiagnostics): void {
    this.phase += Math.max(0, delta);
    for (const [index, flock] of diagnostics.flocks.entries()) {
      const crowd = this.crowds[index];
      if (!crowd) continue;
      const walking = flock.phase !== 'home';
      for (const [figure, child] of crowd.children.entries()) {
        if (child === this.rings[index]) continue;
        child.position.y = walking ? Math.abs(Math.sin(this.phase * 5 + figure)) * 0.09 : 0;
      }
    }
    this.sync(diagnostics);
  }

  dispose(): void {
    this.group.clear();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of [...this.materials, this.ringCalm, this.ringAfraid]) material.dispose();
  }
}

function headingOf(flock: CrowdFlockState): number {
  return flock.phase === 'outbound' ? 0 : flock.phase === 'home' ? 0 : Math.PI;
}
