import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RenderLayers } from '../core/RenderLayers';
import type { CanalChoiceDiagnostics, CanalSegment } from './CanalChoiceSystem';

/**
 * A10-LEGIBILITY — THE OLD CANAL, MADE VISIBLE. Presentation ONLY.
 *
 * THE RATIFIED LINE IT SERVES, verbatim: "The final flow renders from the combined persisted
 * choices." This file is that rendering, and nothing else: three bands over the three authored
 * canal segments, each one dry rubble, running water, or filled ground according to the verdict
 * the profile holds, plus a post at each stake so a player crossing the map can see WHICH grounds
 * still want a decision without opening a panel.
 *
 * IT WAS BUILT ALONGSIDE THE MECHANIC RATHER THAN AFTER IT, deliberately, because the Seed Run
 * one map over shipped its mechanic invisible and the owner's playtest said so in as many words
 * ("I was not even aware that there is a caravan to protect", 2026-08-20). A choice a player
 * cannot see is not a choice.
 *
 * ZERO SIM REACH, the same contract `SeedCaravanPresentation` holds: constructed only by the
 * browser, reads already-rounded published diagnostics, writes nothing back. `HeadlessContractSim`
 * never sees it, so no event-log hash and no null floor can move because of anything here.
 *
 * TERRAIN IS INJECTED, NOT IMPORTED (F-A8-7). Importing `../world/Terrain` at module scope drags
 * a `?raw` JSON import into every graph that reaches this file, and the last time that happened
 * `npx playwright test --list` collapsed to `Total: 0 tests in 0 files`.
 */

export type CanalGroundSampler = (x: number, z: number) => number;

/** What a PLAIN boot can see of the canal — this presentation's whole acceptance surface. */
export type CanalFlowDiagnostics = Readonly<{
  /** Bands currently painted as running water, in authored order. This IS the final flow. */
  wetBands: readonly string[];
  /** Bands painted as filled, buildable ground. */
  filledBands: readonly string[];
  /** Bands still painted as the derelict cut. */
  derelictBands: readonly string[];
  /** One post per segment; the colour key a player learns in one glance. */
  posts: readonly { id: string; state: 'undecided' | 'redig' | 'demolish' }[];
}>;

/** Water: the epoch's own canal colour, so a re-dug band matches Dome Basin's wet channel. */
const WATER_COLOR = '#3f7f86';
const WATER_OPACITY = 0.62;
const WATER_DEPTH = 0.16;
/** Dry mineral masonry separates the undecided cut from water and backfill. */
const DERELICT_COLOR = '#927e64';
/** Filled ground: warm spoil, clearly NOT water and clearly not the untouched cut. */
const FILLED_COLOR = '#a9895c';
const FILLED_OPACITY = 0.34;
const POST_HEIGHT = 2.2;
const POST_RADIUS = 0.14;

type Band = {
  id: string;
  centre: { x: number; z: number };
  water: THREE.Mesh;
  derelict: THREE.Mesh;
  derelictHeights: Float32Array;
  filled: THREE.Mesh;
  post: THREE.Mesh;
  postMaterial: THREE.MeshStandardMaterial;
  stake: { x: number; z: number };
};

export class CanalFlowPresentation {
  readonly group = new THREE.Group();

  private readonly bands: Band[];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly waterMaterial = new THREE.MeshStandardMaterial({
    color: WATER_COLOR, transparent: true, opacity: WATER_OPACITY, roughness: 0.26, metalness: 0.03,
  });
  private readonly derelictMaterial = new THREE.MeshStandardMaterial({
    color: DERELICT_COLOR, vertexColors: true, roughness: 0.94,
  });
  private readonly filledMaterial = new THREE.MeshStandardMaterial({
    color: FILLED_COLOR, transparent: true, opacity: FILLED_OPACITY, roughness: 0.9,
  });
  private state: CanalChoiceDiagnostics['choices'] = [];

  constructor(
    diagnostics: CanalChoiceDiagnostics,
    private readonly groundY: CanalGroundSampler = () => 0,
  ) {
    this.group.name = 'CanalFlowPresentation';
    this.bands = diagnostics.segments.map((segment) => this.createBand(segment));
    for (const band of this.bands) this.group.add(band.water, band.derelict, band.filled, band.post);
    this.sync(diagnostics);
  }

  /** Idempotent: called every frame the canal exists, does work only when a verdict changes. */
  sync(diagnostics: CanalChoiceDiagnostics): void {
    this.state = diagnostics.choices;
    for (const band of this.bands) {
      const choice = diagnostics.choices.find((entry) => entry.id === band.id)?.choice ?? 'undecided';
      band.water.visible = choice === 'redig';
      band.filled.visible = choice === 'demolish';
      band.derelict.visible = choice === 'undecided';
      band.postMaterial.color.set(choice === 'redig' ? WATER_COLOR : choice === 'demolish' ? FILLED_COLOR : DERELICT_COLOR);
      // An undecided post glows: it is the only thing on this map still asking the player for
      // something, and the objective cannot be discharged without walking to it.
      band.postMaterial.emissive.set(choice === 'undecided' ? '#d9a441' : '#000000');
      band.postMaterial.emissiveIntensity = choice === 'undecided' ? 0.22 : 0;
    }
  }

  resampleTerrain(): void {
    for (const band of this.bands) {
      const y = this.groundY(band.centre.x, band.centre.z);
      band.water.position.y = y + WATER_DEPTH * 0.5;
      // Keep the low broken masonry seated on the mounted terrain. Stored local
      // heights make repeated resampling idempotent, including after a GLB swap.
      band.derelict.position.y = y;
      const positions = band.derelict.geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i += 1) {
        positions.setY(i, band.derelictHeights[i]! + this.groundY(
          band.centre.x + positions.getX(i), band.centre.z + positions.getZ(i),
        ) - y);
      }
      positions.needsUpdate = true;
      band.derelict.geometry.computeVertexNormals();
      band.derelict.geometry.computeBoundingSphere();
      band.filled.position.y = y + 0.03;
      band.post.position.y = this.groundY(band.stake.x, band.stake.z) + POST_HEIGHT * 0.5;
    }
  }

  get diagnostics(): CanalFlowDiagnostics {
    const of = (choice: 'undecided' | 'redig' | 'demolish') =>
      this.state.filter((entry) => entry.choice === choice).map(({ id }) => id);
    return {
      wetBands: of('redig'),
      filledBands: of('demolish'),
      derelictBands: of('undecided'),
      posts: this.state.map(({ id, choice }) => ({ id, state: choice })),
    };
  }

  dispose(): void {
    this.waterMaterial.dispose();
    this.derelictMaterial.dispose();
    this.filledMaterial.dispose();
    for (const band of this.bands) band.postMaterial.dispose();
    for (const geometry of this.geometries) geometry.dispose();
    this.group.clear();
  }

  private createBand(segment: CanalSegment): Band {
    const width = segment.maxX - segment.minX;
    const depth = segment.maxZ - segment.minZ;
    const centre = { x: (segment.minX + segment.maxX) / 2, z: (segment.minZ + segment.maxZ) / 2 };
    const slab = (material: THREE.Material, height: number, name: string): THREE.Mesh => {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      this.geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = name;
      mesh.position.set(centre.x, 0, centre.z);
      mesh.renderOrder = RenderLayers.gameplay;
      return mesh;
    };
    const postGeometry = new THREE.CylinderGeometry(POST_RADIUS, POST_RADIUS, POST_HEIGHT, 8);
    this.geometries.push(postGeometry);
    const postMaterial = new THREE.MeshStandardMaterial({ color: DERELICT_COLOR, roughness: 0.7, metalness: 0.16 });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.name = `CanalDecisionPost-${segment.id}`;
    post.position.set(segment.x, 0, segment.z);
    post.renderOrder = RenderLayers.gameplay;
    const derelict = this.createRuinedCut(width, depth, centre, segment.id);
    const derelictHeights = Float32Array.from(
      { length: derelict.geometry.getAttribute('position').count },
      (_, i) => derelict.geometry.getAttribute('position').getY(i),
    );
    return {
      id: segment.id,
      centre,
      water: slab(this.waterMaterial, WATER_DEPTH, `CanalWetBand-${segment.id}`),
      derelict,
      derelictHeights,
      filled: slab(this.filledMaterial, 0.06, `CanalFilledBand-${segment.id}`),
      post,
      postMaterial,
      stake: { x: segment.x, z: segment.z },
    };
  }

  /** Broken, ankle-to-knee-high retaining courses replace the undecided slab.
   * The authored band remains crossable; openings and low rubble imply no new wall collision. */
  private createRuinedCut(width: number, depth: number, centre: { x: number; z: number }, id: string): THREE.Mesh {
    const pieces: THREE.BufferGeometry[] = [];
    const block = (x: number, z: number, w: number, d: number, h: number, turn: number, shade: number) => {
      const columns = Math.ceil(w / 1.15), rows = Math.ceil(d / 1.15);
      for (let col = 0; col < columns; col += 1) for (let row = 0; row < rows; row += 1) {
        const brickHeight = h * (0.86 + ((col + row) % 3) * 0.07);
        // Two low courses and clipped stone corners add visible masonry depth
        // inside the same crossable rubble envelope. No canal band or height moves.
        const courses = h > 0.3 ? 2 : 1;
        const gap = 0.022;
        const courseHeight = (brickHeight - gap * (courses - 1)) / courses;
        const halfWidth = (w / columns - 0.035) * 0.5;
        const halfDepth = (d / rows - 0.035) * 0.5;
        const chip = Math.min(0.06, halfWidth * 0.18, halfDepth * 0.18);
        const outline = new THREE.Shape();
        outline.moveTo(-halfWidth + chip, -halfDepth);
        outline.lineTo(halfWidth - chip, -halfDepth);
        outline.lineTo(halfWidth, -halfDepth + chip);
        outline.lineTo(halfWidth, halfDepth - chip);
        outline.lineTo(halfWidth - chip, halfDepth);
        outline.lineTo(-halfWidth + chip, halfDepth);
        outline.lineTo(-halfWidth, halfDepth - chip);
        outline.lineTo(-halfWidth, -halfDepth + chip);
        outline.closePath();
        for (let course = 0; course < courses; course += 1) {
          const geometry = new THREE.ExtrudeGeometry(outline, { depth: courseHeight, bevelEnabled: false, steps: 1, curveSegments: 1 });
          geometry.rotateX(-Math.PI / 2);
          geometry.translate((col + 0.5) * w / columns - w * 0.5, course * (courseHeight + gap) + 0.015, (row + 0.5) * d / rows - d * 0.5);
          geometry.rotateY(turn);
          geometry.translate(x, 0, z);
          const normals = geometry.getAttribute('normal');
          const colors = new Float32Array(geometry.getAttribute('position').count * 3);
          const value = shade * (0.90 + ((col + row + course) % 3) * 0.05);
          for (let i = 0; i < normals.count; i += 1) {
            const face = normals.getY(i) > 0.5 ? 1.16 : normals.getY(i) < -0.5 ? 0.64 : 0.82;
            colors.set([value * face, value * face, value * face], i * 3);
          }
          geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          pieces.push(geometry);
        }
      }
    };
    for (const side of [-1, 1]) {
      for (let i = 0; i < 7; i += 1) {
        if (i === 2 || i === 5) continue;
        const z = (i - 3) * depth / 7;
        block(side * width * 0.42, z, 0.65, depth / 7 * 0.88, 0.32 + (i % 3) * 0.07, side * 0.035 * (i % 2), 0.84 + (i % 3) * 0.07);
        block(side * (width * 0.42 - 0.7), z + 0.7, 0.55, 0.7, 0.16 + (i % 2) * 0.08, i * 0.63, 0.82);
      }
      for (const end of [-1, 1]) {
        block(side * width * 0.34, end * depth * 0.44, width * 0.14, 0.64, 0.38, side * end * 0.06, 0.95);
        block(side * width * 0.22, end * depth * 0.42, 0.72, 0.60, 0.20, side * 0.5, 0.88);
      }
    }
    const geometry = mergeGeometries(pieces)!;
    for (const piece of pieces) piece.dispose();
    this.geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, this.derelictMaterial);
    mesh.name = `CanalDerelictBand-${id}`;
    mesh.position.set(centre.x, 0, centre.z);
    mesh.renderOrder = RenderLayers.gameplay;
    return mesh;
  }

}
