import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import type { GroundSampler, SeedCaravanDiagnostics } from './SeedCaravanSystem';

/**
 * A8-LEGIBILITY — THE SEED CARAVAN, MADE VISIBLE. Presentation ONLY.
 *
 * THE WHY, in the owner's own words after his 2026-08-20 playtest (verbatim): "I was not even
 * aware that there is a caravan to protect or when it moves where. This has to be better
 * explained. I saw a small grey box moving at one point in time, but I was not aware that this is
 * the mission."
 *
 * The grey box is LAWFUL — placeholder-first art (CLAUDE.md §4.3) says gameplay never waits on
 * art. What was missing is not a sprite, it is LEGIBILITY, and legibility is a UI concern that
 * ships now: a name over the thing, a guard bar under the name, a road drawn on the ground so
 * "when it moves where" has an answer you can read at a glance, and the county's voice on the
 * five beats that matter (rolls / attacked / halts / plants / arrives-or-is-lost).
 *
 * ZERO SIM REACH, AND THAT IS THE WHOLE CONTRACT OF THIS FILE. It is constructed only by the
 * browser, reads `SeedCaravanDiagnostics` (already rounded, already published), and writes nothing
 * back. `HeadlessContractSim` never sees it, so no event-log hash and no null floor can move
 * because of anything here. Every number below is a render dimension.
 *
 * TERRAIN IS INJECTED, NOT IMPORTED, for the same reason `SeedCaravanSystem` injects it
 * (`SeedCaravanSystem.ts:137`, F-A8-7): importing `../world/Terrain` at module scope drags a
 * `?raw` JSON import into every graph that reaches this file, and the last time that happened
 * `npx playwright test --list` collapsed to `Total: 0 tests in 0 files`. Nothing here is worth
 * re-opening that edge.
 */

/** One county-voice beat. The caller decides which HUD surface says it; this file decides WHEN. */
export type SeedCaravanBeat = {
  kind: 'depart' | 'attacked' | 'halt' | 'plant' | 'arrive' | 'lost';
  text: string;
  title: string;
  seconds: number;
  /** Where on the map the beat happened — used for the departure camera nudge. */
  at: { x: number; z: number };
};

/** What a PLAIN boot can see of the mission — the spec's whole acceptance surface. */
export type SeedCaravanPresentationDiagnostics = Readonly<{
  tagVisible: boolean;
  tagText: string;
  guardBarVisible: boolean;
  /** 0..1 of the caravan's CURRENT ceiling, so a planted run reads full again at its new max. */
  guardRatio: number;
  roadRuts: number;
  waypointRings: number;
  /** Beat keys already said this run, in the order they were said. */
  beatsSaid: readonly string[];
}>;

/** The county's title over every beat, so a player learns one banner means one thing. */
const VOICE_TITLE = 'THE SEED RUN';

/** Sits above the 1.3-high vault crate on the caravan body, clear of the guard bar below it. */
const TAG_HEIGHT = 3.4;
const TAG_SCALE = 0.88;
const BAR_HEIGHT = 2.45;
/**
 * The building bar's own dimensions (`BuildSystem.ts:285`), widened by half because this bar is
 * the objective's and reads from the same distance a player watches the road from.
 */
const BAR_WIDTH = 2.2;
const BAR_THICKNESS = 0.16;
const BAR_DEPTH = 0.3;

/** Worn wheel ruts, two tracks a gauge apart, re-laid on the exact route. */
const RUT_GAUGE = 1.05;
const RUT_WIDTH = 0.2;
const RUT_LENGTH = 1.5;
const RUT_SPACING = 3.2;
const ROAD_Y_LIFT = 0.035;

/** Ground rings: the three planting stakes, and the basin the road ends at. */
const GROUND_RING_INNER = 2.5;
const GROUND_RING_OUTER = 3.1;
const BASIN_RING_INNER = 3.4;
const BASIN_RING_OUTER = 4.2;

const TAG_TEXT = 'Seed Caravan';
const TAG_FONT_PX = 52;
const TAG_CANVAS_HEIGHT = 96;
const TAG_PADDING_PX = 28;
const ROAD_COLOR = '#b8935c';
const BAR_BACK_COLOR = '#2e1b0e';
const BAR_FULL_COLOR = '#c9b06a';
const BAR_AMBER_COLOR = '#d0902f';
const BAR_DANGER_COLOR = '#c14a2c';

export class SeedCaravanPresentation {
  readonly group = new THREE.Group();

  private readonly road = new THREE.Group();
  private readonly marker = new THREE.Group();
  private readonly tagMaterial: THREE.SpriteMaterial;
  private readonly tagTexture: THREE.CanvasTexture;
  private readonly tag: THREE.Sprite;
  /**
   * WORLD UI DRAWS THROUGH THE WORLD — `depthTest: false, toneMapped: false, fog: false`, exactly
   * the boss health bar's own materials (`entities/pools.ts:363-365`) and the boss nameplate's
   * sprite (`HomemakerBossSystem.ts:719`). Measured, not copied on faith: the first cut of this
   * file used depth-tested materials and the tag and bar VANISHED behind the claim stake at the
   * one moment they matter most — the train standing nine wu from the claim — which would have
   * shipped the owner's complaint back to him in a new costume (Mistake #10).
   */
  private readonly barBackMaterial = new THREE.MeshBasicMaterial({
    color: BAR_BACK_COLOR, depthTest: false, toneMapped: false, fog: false,
  });
  private readonly barFillMaterial = new THREE.MeshBasicMaterial({
    color: BAR_FULL_COLOR, depthTest: false, toneMapped: false, fog: false,
  });
  private readonly barBack: THREE.Mesh;
  private readonly barFill: THREE.Mesh;
  private readonly roadMaterial = new THREE.MeshBasicMaterial({
    color: ROAD_COLOR,
    transparent: true,
    opacity: 0.30,
    depthWrite: false,
  });
  private readonly ringMaterial: THREE.MeshBasicMaterial;
  private readonly geometries: THREE.BufferGeometry[] = [];

  private readonly route: readonly { x: number; z: number }[];
  private readonly grounds: readonly { id: string; x: number; z: number }[];
  /** Beats that happened while a briefing card covered the banner, replayed in order once it lifts. */
  private readonly pending: SeedCaravanBeat[] = [];
  private readonly announced = new Set<string>();
  private lastHp: number;
  private lastMaxHp: number;
  private guardRatio = 1;

  constructor(
    diagnostics: SeedCaravanDiagnostics,
    private readonly groundY: GroundSampler,
    green: string,
    /** True while the contract-briefing card is up; beats wait rather than flashing behind it. */
    private readonly bannerBlocked: () => boolean = () => false,
  ) {
    this.group.name = 'SeedCaravanPresentation';
    this.route = diagnostics.route;
    this.grounds = diagnostics.grounds.map(({ id, x, z }) => ({ id, x, z }));
    this.lastHp = diagnostics.hp;
    this.lastMaxHp = diagnostics.maxHp;
    this.ringMaterial = new THREE.MeshBasicMaterial({
      color: green,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.road.name = 'SeedCaravanRoad';
    this.marker.name = 'SeedCaravanWaypoints';

    const tagCanvas = drawTag(TAG_TEXT);
    this.tagTexture = new THREE.CanvasTexture(tagCanvas);
    this.tagTexture.colorSpace = THREE.SRGBColorSpace;
    this.tagTexture.minFilter = THREE.LinearFilter;
    this.tagTexture.magFilter = THREE.LinearFilter;
    this.tagMaterial = new THREE.SpriteMaterial({
      map: this.tagTexture, transparent: true, depthWrite: false, depthTest: false, fog: false,
    });
    this.tag = new THREE.Sprite(this.tagMaterial);
    this.tag.name = 'SeedCaravanNameTag';
    this.tag.renderOrder = RenderLayers.worldUi;
    this.tag.scale.set(TAG_SCALE * (tagCanvas.width / tagCanvas.height), TAG_SCALE, 1);

    /**
     * THE BAR IS A BOX IN THE WORLD, NOT A BILLBOARD — Mistake #6, the Billboard Mistake, whose
     * ruling is the owner's own: "they should orient at their object". `BuildSystem.hpBarYaw`
     * returns 0 for everything but a palisade, so a fixed world yaw with a TOP-MOUNTED fill is
     * the house convention, and this bar keeps it.
     */
    this.barBack = new THREE.Mesh(this.geometry(new THREE.BoxGeometry(1, 1, 1)), this.barBackMaterial);
    this.barBack.name = 'SeedCaravanGuardBarBack';
    this.barFill = new THREE.Mesh(this.geometry(new THREE.BoxGeometry(1, 1, 1)), this.barFillMaterial);
    this.barFill.name = 'SeedCaravanGuardBarFill';
    for (const part of [this.barBack, this.barFill]) part.renderOrder = RenderLayers.worldUi;

    this.group.add(this.road, this.marker, this.tag, this.barBack, this.barFill);
    this.rebuildGround();
    this.syncBody(diagnostics);
  }

  /**
   * One frame of presentation. Returns the county-voice beats to say THIS frame — the caller owns
   * the HUD surface, so nothing here reaches into the announcement pipeline itself.
   *
   * Idempotent per state: it is called from the fixed-step loop, so every beat latches on the
   * TRANSITION rather than the condition, and a step that changes nothing returns nothing.
   */
  update(diagnostics: SeedCaravanDiagnostics): readonly SeedCaravanBeat[] {
    this.syncBody(diagnostics);
    const beats: SeedCaravanBeat[] = [];
    const at = { x: diagnostics.position.x, z: diagnostics.position.z };

    // DEPARTURE, held until the train has actually left the yard, so the beat and the movement a
    // player sees are the same event rather than a banner over a still box.
    if (diagnostics.progress > 0 && diagnostics.state !== 'lost') {
      this.queue(beats, 'depart', {
        kind: 'depart',
        text: 'The seed caravan rolls; see it to the basin.',
        title: VOICE_TITLE,
        seconds: 6,
        at,
      });
    }

    // FIRST BLOOD. `hp` is the only channel the diagnostics carry for it — the consumer publishes
    // no damage event — so the drop itself is the trigger, once, for the whole run.
    const plantSpend = diagnostics.maxHp < this.lastMaxHp;
    if (diagnostics.hp < this.lastHp && diagnostics.state !== 'lost' && !plantSpend) {
      this.queue(beats, 'attacked', {
        kind: 'attacked',
        text: 'The seed caravan is under attack. Clear its road.',
        title: VOICE_TITLE,
        seconds: 5,
        at,
      });
    }
    this.lastHp = diagnostics.hp;
    this.lastMaxHp = diagnostics.maxHp;

    // EACH HALT is a plant window the player has forty seconds to reach; saying so is the whole
    // difference between a mechanic and a grey box that stopped.
    if (diagnostics.state === 'paused' && diagnostics.atGround) {
      this.queue(beats, `halt:${diagnostics.atGround}`, {
        kind: 'halt',
        text: `The caravan halts at the ${groundWord(diagnostics.atGround)} ground. Plant a vault here, or wave it on.`,
        title: VOICE_TITLE,
        seconds: 5,
        at,
      });
    }

    for (const groundId of diagnostics.plantedThisRun) {
      const ground = this.grounds.find((entry) => entry.id === groundId);
      this.queue(beats, `plant:${groundId}`, {
        kind: 'plant',
        text: `The ${groundWord(groundId)} vault takes root. It shelters this ground for good, and the guard is lighter for it.`,
        title: VOICE_TITLE,
        seconds: 5,
        at: ground ? { x: ground.x, z: ground.z } : at,
      });
    }

    if (diagnostics.arrived) {
      this.queue(beats, 'arrive', {
        kind: 'arrive',
        text: 'The seed caravan reaches the basin; the crossing is made.',
        title: VOICE_TITLE,
        seconds: 6,
        at,
      });
    }

    if (diagnostics.state === 'lost') {
      this.queue(beats, 'lost', {
        kind: 'lost',
        text: 'The seed caravan is lost. There is no crossing to secure now.',
        title: VOICE_TITLE,
        seconds: 6,
        at,
      });
    }

    return this.flush(beats);
  }

  /** The road is laid on the terrain, so it moves when the terrain does. */
  resampleTerrain(): void {
    this.rebuildGround();
  }

  /** A fresh run re-arms every beat: the same crossing must read the same way the second time. */
  reset(diagnostics: SeedCaravanDiagnostics): void {
    this.announced.clear();
    this.pending.length = 0;
    this.lastHp = diagnostics.hp;
    this.lastMaxHp = diagnostics.maxHp;
    this.syncBody(diagnostics);
  }

  get diagnostics(): SeedCaravanPresentationDiagnostics {
    return {
      tagVisible: this.tag.visible,
      tagText: TAG_TEXT,
      guardBarVisible: this.barBack.visible,
      guardRatio: Number(this.guardRatio.toFixed(3)),
      roadRuts: this.road.children.length,
      waypointRings: this.marker.children.length,
      beatsSaid: [...this.announced],
    };
  }

  dispose(): void {
    this.tagTexture.dispose();
    this.tagMaterial.dispose();
    this.barBackMaterial.dispose();
    this.barFillMaterial.dispose();
    this.roadMaterial.dispose();
    this.ringMaterial.dispose();
    for (const geometry of this.geometries) geometry.dispose();
    this.geometries.length = 0;
  }

  private queue(beats: SeedCaravanBeat[], key: string, beat: SeedCaravanBeat): void {
    if (this.announced.has(key)) return;
    this.announced.add(key);
    beats.push(beat);
  }

  /**
   * A briefing card sits over the banner for eight seconds. A beat fired underneath it is a beat
   * the player never reads, so beats wait there instead of being spent (Mistake #10's sibling: a
   * thing shipped where nobody can see it did not ship).
   *
   * Only ONE beat can ever be waiting in practice — the card lifts at eight seconds and the first
   * halt is twenty-one seconds of sim away — but if more ever pile up they all come out, in order,
   * so the run's record of what was said stays complete even though the banner shows the last.
   */
  private flush(beats: SeedCaravanBeat[]): readonly SeedCaravanBeat[] {
    if (beats.length === 0 && this.pending.length === 0) return beats;
    this.pending.push(...beats);
    if (this.bannerBlocked()) return [];
    const ready = [...this.pending];
    this.pending.length = 0;
    return ready;
  }

  private syncBody(diagnostics: SeedCaravanDiagnostics): void {
    const { x, z } = diagnostics.position;
    const alive = diagnostics.state !== 'lost';
    const y = this.groundY(x, z);
    this.tag.visible = alive;
    this.tag.position.set(x, y + TAG_HEIGHT, z);

    const ratio = diagnostics.maxHp > 0 ? clamp01(diagnostics.hp / diagnostics.maxHp) : 0;
    this.guardRatio = ratio;
    this.barBack.visible = alive;
    this.barFill.visible = alive;
    this.barBack.position.set(x, y + BAR_HEIGHT, z);
    this.barBack.scale.set(BAR_WIDTH, BAR_THICKNESS, BAR_DEPTH);

    // Top-mounted, left-anchored fill — the same shape `BuildSystem.syncHpBar` draws, so a player
    // reads one bar language across works and objectives.
    const fillWidth = Math.max(0.08, BAR_WIDTH * ratio);
    this.barFill.scale.set(fillWidth, BAR_THICKNESS * 0.4, BAR_DEPTH * 0.72);
    this.barFill.position.set(
      x - BAR_WIDTH * (1 - ratio) * 0.5,
      y + BAR_HEIGHT + BAR_THICKNESS * 0.5 + BAR_THICKNESS * 0.2 + 0.004,
      z,
    );
    this.barFillMaterial.color.set(
      ratio < 0.33 ? BAR_DANGER_COLOR : ratio < 0.66 ? BAR_AMBER_COLOR : BAR_FULL_COLOR,
    );
  }

  /**
   * THE ROAD ITSELF — the answer to "when it moves where". Two dashed wheel ruts along the exact
   * five authored route points, a ring on each planting stake, and a wider ring on the basin the
   * road ends at. Read from the diagnostics, so it can never disagree with the route the caravan
   * actually walks.
   */
  private rebuildGround(): void {
    this.clearChildren(this.road);
    this.clearChildren(this.marker);

    for (let index = 1; index < this.route.length; index += 1) {
      const from = this.route[index - 1]!;
      const to = this.route[index]!;
      const length = Math.hypot(to.x - from.x, to.z - from.z);
      if (length <= 0) continue;
      const yaw = Math.atan2(to.x - from.x, to.z - from.z);
      const across = { x: Math.cos(yaw), z: -Math.sin(yaw) };
      const steps = Math.max(1, Math.floor(length / RUT_SPACING));
      for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        const cx = from.x + (to.x - from.x) * t;
        const cz = from.z + (to.z - from.z) * t;
        for (const side of [-1, 1]) {
          const px = cx + across.x * RUT_GAUGE * 0.5 * side;
          const pz = cz + across.z * RUT_GAUGE * 0.5 * side;
          // Keep the same route stations and diagnostic count. Tapered, unequal
          // impressions read as worn wheel tracks instead of painted road dashes.
          const rutGeometry = new THREE.PlaneGeometry(RUT_WIDTH, RUT_LENGTH, 1, 4);
          const vertices = rutGeometry.getAttribute('position');
          const wear = (index * 7 + step * 3 + (side + 1)) % 5;
          for (let vertex = 0; vertex < vertices.count; vertex += 1) {
            const along = vertices.getY(vertex) / RUT_LENGTH;
            const taper = 0.16 + 0.84 * (1 - Math.abs(along) * 2);
            vertices.setX(vertex, vertices.getX(vertex) * taper * (0.72 + wear * 0.07));
            vertices.setY(vertex, vertices.getY(vertex) * (0.66 + wear * 0.075));
          }
          const rut = new THREE.Mesh(this.geometry(rutGeometry), this.roadMaterial);
          rut.rotation.set(-Math.PI / 2, 0, -yaw);
          rut.position.set(px, this.groundY(px, pz) + ROAD_Y_LIFT, pz);
          rut.renderOrder = RenderLayers.groundDecals;
          this.road.add(rut);
        }
      }
    }

    for (const ground of this.grounds) {
      this.marker.add(this.ring(ground.x, ground.z, GROUND_RING_INNER, GROUND_RING_OUTER));
    }
    const basin = this.route[this.route.length - 1];
    if (basin) this.marker.add(this.ring(basin.x, basin.z, BASIN_RING_INNER, BASIN_RING_OUTER));
  }

  private ring(x: number, z: number, inner: number, outer: number): THREE.Mesh {
    const ring = new THREE.Mesh(this.geometry(new THREE.RingGeometry(inner, outer, 44)), this.ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, this.groundY(x, z) + ROAD_Y_LIFT + 0.005, z);
    ring.renderOrder = RenderLayers.groundDecals;
    return ring;
  }

  private geometry<T extends THREE.BufferGeometry>(geometry: T): T {
    this.geometries.push(geometry);
    return geometry;
  }

  private clearChildren(parent: THREE.Group): void {
    for (const child of [...parent.children]) {
      parent.remove(child);
      if (child instanceof THREE.Mesh) {
        const index = this.geometries.indexOf(child.geometry);
        if (index >= 0) this.geometries.splice(index, 1);
        child.geometry.dispose();
      }
    }
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** `plant-center-waypoint` -> `center`. Falls back to the raw id rather than inventing a name. */
function groundWord(groundId: string): string {
  const match = /^plant-(.+)-waypoint$/.exec(groundId);
  return match ? match[1]! : groundId;
}

function drawTag(text: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create seed caravan name tag canvas');
  context.font = `700 ${TAG_FONT_PX}px Georgia, serif`;
  canvas.width = Math.ceil(context.measureText(text).width + TAG_PADDING_PX * 2);
  canvas.height = TAG_CANVAS_HEIGHT;
  context.font = `700 ${TAG_FONT_PX}px Georgia, serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.strokeStyle = '#2e1b0e';
  context.lineWidth = 10;
  context.strokeText(text, canvas.width / 2, canvas.height / 2);
  context.fillStyle = '#f2e2be';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  return canvas;
}
