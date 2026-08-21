import * as THREE from 'three';
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
/** Rubble: the dry-gate brown `Balance.e9Canal.stage.dryColor` uses, one shade down. */
const DERELICT_COLOR = '#6b4a37';
const DERELICT_OPACITY = 0.42;
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
    color: DERELICT_COLOR, transparent: true, opacity: DERELICT_OPACITY, roughness: 0.94,
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
      band.derelict.position.y = y + 0.02;
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
    return {
      id: segment.id,
      centre,
      water: slab(this.waterMaterial, WATER_DEPTH, `CanalWetBand-${segment.id}`),
      derelict: slab(this.derelictMaterial, 0.04, `CanalDerelictBand-${segment.id}`),
      filled: slab(this.filledMaterial, 0.06, `CanalFilledBand-${segment.id}`),
      post,
      postMaterial,
      stake: { x: segment.x, z: segment.z },
    };
  }
}
