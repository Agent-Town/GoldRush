import * as THREE from 'three';
import { GeneratedSpriteBatch, bindWorldSpriteTint } from '../assets/generated';
import { assetSlots, type AssetSlotId } from '../assets/slots';
import { createRenderer, resizeRenderer, flushRenderedFrameCaptures } from '../core/Renderer';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import { activeContract, activeTileDescriptor, type ContractManifest } from '../meta/ContractFamilies';
import { CameraRig } from '../systems/CameraRig';
import { Vfx } from '../systems/Vfx';
import { DayNightCycle } from '../systems/DayNightCycle';
import type { LightSource } from '../systems/LightField';
import { GoldPickupPool } from '../entities/GoldPickup';
import type { AgentTapeReplaySnapshot } from '../replay/AgentTapeReplay';
import { TRUE_REEL_PLACEHOLDERS, workVisual } from '../ui/TrueReelRenderer';
import { LightRig, type LightRigNightShiftState } from './LightRig';
import { lightPhase } from '../ui/TrueReelTerrain';
import * as Terrain from './Terrain';
import { installTerrain3dClaimPilot } from './Terrain3dClaimPilot';

// This module is imported only AFTER stageReplayContract, just like BrowserAgentTapeWorker.
export const lanternHeightAt = Terrain.sampleHeight;
const contract = activeContract();
const riderUrl = new URL('../../assets/processed/char-prospector-sheet-hover8-r0c0.png', import.meta.url).href;
const enemySlots: Record<string, AssetSlotId> = {
  claim_jumper: assetSlots.charBanditBase, thief: assetSlots.charBanditThief, wrecker: assetSlots.charE2SteamWrecker,
  steam_wrecker: assetSlots.charE2SteamWrecker, rail_tough: assetSlots.charE2RailTough, coal_thief: assetSlots.charE2CoalThief,
  baron: assetSlots.charBaron, feral_toaster: assetSlots.charE6FeralToaster, lawn_shepherd: assetSlots.charE6LawnShepherd,
  glowjack: assetSlots.charE6Glowjack, rogue_automaton: assetSlots.charE7RogueAutomaton, data_rustler: assetSlots.charE7DataRustler,
  scrap_corsair: assetSlots.charE8ScrapCorsair, sun_glare_shambler: assetSlots.charE8SunGlareShambler,
  feral_terraformer: assetSlots.charE9FeralTerraformer, faithful_terraformer: assetSlots.charE9FeralTerraformer,
  claim_jump_prospect_drone: assetSlots.charE9ClaimJumpProspectDrone,
};
const workSlots: Record<string, AssetSlotId> = {
  sluice: assetSlots.bldPortraitSluice, sentry: assetSlots.bldSentryBeacon, sentry_beacon: assetSlots.bldSentryBeacon,
  palisade: assetSlots.bldPortraitPalisade, stockpile: assetSlots.bldPortraitStockpile, turret: assetSlots.bldPortraitTurret,
  lantern_post: assetSlots.bldSentryBeacon,
};
type Point = { key: string; family: string; kind: string; x: number; z: number; tint: number; slot?: AssetSlotId; url?: string; scale: number };

/** Read-only stage: no actors, input, RunManager, persistence, or simulation. */
export class LanternWorldStage {
  readonly canvas = document.createElement('canvas');
  readonly heightAt = lanternHeightAt;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(Balance.camera.fov, 1, .1, 600);
  readonly rig = new CameraRig(this.camera);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly lights: LightRig;
  private readonly ground: THREE.Mesh;
  private readonly stopPilot: () => void;
  private readonly target = new THREE.Vector3();
  private readonly panOffset = new THREE.Vector3();
  private readonly batches = new Map<string, { batch: GeneratedSpriteBatch; capacity: number }>();
  private readonly looseSprites = new Map<string, THREE.Sprite>();
  private readonly textures = new Map<string, THREE.Texture>();
  private readonly pickups = new GoldPickupPool();
  private readonly floats = new Vfx();
  private readonly position = new THREE.Vector3();
  private snapshot: AgentTapeReplaySnapshot | null = null;
  private lighting = replayLightingState(contract, 0, 0);
  private previous = new Map<string, Point>();
  private previousPickups = new Map<number, AgentTapeReplaySnapshot['pickups'][number]>();
  private points: Point[] = [];
  private elapsed = 0;
  private spanTicks = 1;
  private disposed = false;
  private frame = 0;
  private readonly frames: number[] = [];
  private readonly waters: THREE.Object3D[] = [];
  placeholders: string = TRUE_REEL_PLACEHOLDERS.join(' · ');

  constructor() {
    this.canvas.dataset.testid = 'lantern-world-canvas';
    this.canvas.dataset.contract = contract.id;
    this.canvas.dataset.tile = activeTileDescriptor().id;
    this.renderer = createRenderer(this.canvas);
    this.lights = new LightRig(this.scene, this.renderer, contract.id, this.camera);
    this.ground = Terrain.createBankPlaceholder();
    this.scene.add(this.ground, this.pickups.group, this.floats.group);
    if (Terrain.hasRiverWater()) {
      this.waters.push(Terrain.createRiverPlaceholder(), ...Terrain.fordRanges().map(Terrain.createFordPlaceholder));
      this.scene.add(...this.waters);
    }
    this.stopPilot = installTerrain3dClaimPilot({
      scene: this.scene, canvas: this.canvas, contractId: contract.id, tileId: activeTileDescriptor().id,
      paintedGround: this.ground,
    });
  }

  update(snapshot: AgentTapeReplaySnapshot | null): void {
    if (snapshot === this.snapshot) return;
    const old = this.snapshot;
    this.snapshot = snapshot;
    this.lighting = replayLightingState(contract, snapshot?.wave ?? 0, snapshot?.timeAlive ?? 0);
    this.previous = new Map(this.points.map((point) => [point.key, point]));
    this.points = snapshot ? snapshotPoints(snapshot) : [];
    const keys = new Set(this.points.map((point) => point.key));
    for (const [key, sprite] of this.looseSprites) if (!keys.has(key)) {
      this.scene.remove(sprite);
      sprite.material.dispose();
      this.looseSprites.delete(key);
    }
    this.spanTicks = Math.max(1, (snapshot?.tick ?? 0) - (old?.tick ?? 0));
    this.elapsed = 0;
    if (!snapshot || !old || snapshot.tick <= old.tick || this.spanTicks > 30) this.previous.clear();
    this.previousPickups = new Map((this.previous.size ? old?.pickups ?? [] : []).map((pickup) => [pickup.index, pickup]));
    if (snapshot) for (const pickup of snapshot.pickups) {
      if (old?.pickups.some((entry) => entry.index === pickup.index && entry.amount === pickup.amount)) continue;
      this.position.set(pickup.x, Terrain.visualY(pickup.x, pickup.z, .6), pickup.z);
      this.floats.floatText(this.position, `+${Math.round(pickup.amount)}`, '#ffe4a0');
    }
    this.placeholders = [...TRUE_REEL_PLACEHOLDERS, ...new Set(this.points.filter((p) => !p.slot && !p.url).map((p) => `${p.family} ${p.kind}`))].join(' · ');
  }

  pan(dx: number, dz: number): void {
    this.panOffset.x = THREE.MathUtils.clamp(this.panOffset.x + dx, -24, 24);
    this.panOffset.z = THREE.MathUtils.clamp(this.panOffset.z + dz, -24, 24);
  }

  render(delta: number, paused: boolean, speed: number): void {
    if (this.disposed || !this.canvas.isConnected || this.canvas.hidden) return;
    resizeRenderer(this.renderer, this.camera, Balance.render.maxDpr);
    const { minX, maxX, minZ, maxZ } = Terrain.bounds;
    this.target.set((minX + maxX) / 2, Terrain.sampleHeight(0, 0), (minZ + maxZ) / 2).add(this.panOffset);
    this.rig.frameBounds(Terrain.bounds, this.target);
    this.elapsed += delta * speed;
    const alpha = paused ? 1 : Math.min(1, this.elapsed / (this.spanTicks / 30));
    const groups = new Map<string, Point[]>();
    for (const point of this.points) {
      if (!point.slot) continue;
      const group = groups.get(point.slot) ?? [];
      group.push(point);
      groups.set(point.slot, group);
    }
    for (const [slot, points] of groups) {
      let pool = this.batches.get(slot);
      if (!pool || pool.capacity < points.length) {
        if (pool) { this.scene.remove(pool.batch.group); pool.batch.dispose(); }
        const capacity = 2 ** Math.ceil(Math.log2(Math.max(1, points.length)));
        const batch = new GeneratedSpriteBatch(slot as AssetSlotId, capacity, { name: `Lantern-${slot}`, y: 0, scale: [1, 1] });
        pool = { batch, capacity };
        this.batches.set(slot, pool);
        this.scene.add(batch.group);
      }
      points.forEach((point, index) => {
        this.at(point, alpha);
        pool!.batch.set(index, this.position, true);
        pool!.batch.setTintScalar(index, point.tint);
        pool!.batch.group.children[index]!.scale.set(point.scale, point.scale, 1);
      });
    }
    for (const [slot, pool] of this.batches) {
      for (let index = groups.get(slot)?.length ?? 0; index < pool.capacity; index += 1) pool.batch.hide(index);
    }
    for (const sprite of this.looseSprites.values()) sprite.visible = false;
    for (const point of this.points) {
      if (point.slot) continue;
      let sprite = this.looseSprites.get(point.key);
      if (!sprite) {
        const material = new THREE.SpriteMaterial({ transparent: true, alphaTest: .04, depthWrite: false });
        sprite = new THREE.Sprite(material);
        sprite.name = point.family === 'rider' ? 'ProspectorSprite' : `Lantern-${point.kind}`;
        sprite.renderOrder = RenderLayers.gameplay;
        bindWorldSpriteTint(sprite);
        if (point.url) {
          let texture = this.textures.get(point.url);
          if (!texture) {
            texture = new THREE.TextureLoader().load(point.url);
            texture.colorSpace = THREE.SRGBColorSpace;
            this.textures.set(point.url, texture);
          }
          material.map = texture;
        } else material.color.set('#a0522d');
        this.looseSprites.set(point.key, sprite);
        this.scene.add(sprite);
      }
      this.at(point, alpha);
      sprite.position.copy(this.position);
      sprite.scale.set(point.scale, point.scale, 1);
      sprite.material.opacity = point.tint;
      sprite.visible = true;
    }
    this.pickups.restoreSuspend((this.snapshot?.pickups ?? []).map((pickup) => {
      const previous = this.previousPickups.get(pickup.index) ?? pickup;
      const x = THREE.MathUtils.lerp(previous.x, pickup.x, alpha);
      const z = THREE.MathUtils.lerp(previous.z, pickup.z, alpha);
      return { slot: pickup.index, amount: pickup.amount, source: 'reclaimed', age: this.snapshot!.timeAlive, blockedCooldown: 0,
        position: { x, z, y: Terrain.visualY(x, z, .63) } };
    }));
    if (!paused) this.floats.update(delta * speed);
    const lighting = this.lighting;
    const sources: LightSource[] = [];
    if (lighting.darkness > 0 && this.snapshot) {
      if (this.snapshot.hero.alive) sources.push({ id: 'hero', kind: 'hero', ...this.snapshot.hero, radius: Balance.contracts.nightShift.heroLightRadius });
      for (const work of this.snapshot.works) {
        if (work.wrecked || work.hp <= 0) continue;
        // Power connectivity is not in the replay snapshot; do not invent powered lamps.
        if (work.id === 'lantern_post' && !contract.twist.powerGrid) sources.push({ id: `lantern:${work.index}`, kind: 'lantern', x: work.x, z: work.z, radius: Balance.contracts.nightShift.lanternPostLightRadius });
        if (work.id === 'sentry_beacon') sources.push({ id: `beacon:${work.index}`, kind: 'watch', x: work.x, z: work.z, radius: Balance.beacon.range * Balance.contracts.nightShift.beaconLightMult });
      }
    }
    this.lights.setNightShift(lighting, sources);
    this.lights.update(this.snapshot?.timeAlive ?? 0, this.target);
    this.canvas.dataset.lightPhase = lighting.phase;
    this.canvas.dataset.darkness = String(lighting.darkness);
    this.canvas.dataset.lightSources = String(sources.length);
    // The rig's wider replay framing must keep the contract inside the game's camera-distance fog.
    if (this.scene.fog instanceof THREE.Fog) {
      const distance = this.camera.position.distanceTo(this.target);
      this.scene.fog.near = Math.max(this.scene.fog.near, distance);
      this.scene.fog.far = Math.max(this.scene.fog.far, distance + Math.max(maxX - minX, maxZ - minZ));
    }
    this.renderer.info.reset();
    this.renderer.render(this.scene, this.camera);
    this.lights.renderPost(this.renderer);
    flushRenderedFrameCaptures(this.canvas);
    this.canvas.dataset.frame = String(++this.frame);
    this.canvas.dataset.entities = String(this.points.length);
    this.canvas.dataset.renderedSprites = String([...this.batches.values()].reduce((sum, pool) => sum + pool.batch.group.children.filter((child) => child.visible).length, 0) + [...this.looseSprites.values()].filter((sprite) => sprite.visible).length);
    this.canvas.dataset.pickupFloats = String(this.floats.activeFloatTexts);
    this.frames.push(delta * 1000);
    if (this.frames.length > 180) this.frames.shift();
    if (this.frame % 30 === 0) this.canvas.dataset.frameP95 = String([...this.frames].sort((a, b) => a - b)[Math.floor(this.frames.length * .95)] ?? 0);
  }

  private at(point: Point, alpha: number): void {
    const previous = this.previous.get(point.key) ?? point;
    const x = THREE.MathUtils.lerp(previous.x, point.x, alpha);
    const z = THREE.MathUtils.lerp(previous.z, point.z, alpha);
    this.position.set(x, Terrain.visualY(x, z, point.scale * .45), z);
  }

  dispose(): void {
    this.disposed = true;
    this.stopPilot();
    this.lights.dispose();
    this.pickups.dispose();
    this.floats.dispose();
    for (const { batch } of this.batches.values()) batch.dispose();
    for (const sprite of this.looseSprites.values()) sprite.material.dispose();
    for (const texture of this.textures.values()) texture.dispose();
    for (const object of [this.ground, ...this.waters]) object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.geometry.dispose();
      for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
        if (material instanceof THREE.MeshStandardMaterial) material.map?.dispose();
        material.dispose();
      }
    });
    this.renderer.dispose();
    this.canvas.remove();
  }
}

function snapshotPoints(snapshot: AgentTapeReplaySnapshot): Point[] {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return [
    { key: 'hero', family: 'hero', kind: 'hero', ...snapshot.hero, slot: assetSlots.charHero, scale: 2.775, tint: snapshot.hero.alive ? 1 : .4 },
    ...(snapshot.rider ? [{ key: 'rider', family: 'rider', kind: 'rider', ...snapshot.rider, url: riderUrl, scale: 2.5, tint: 1 }] : []),
    ...snapshot.enemies.map((enemy) => ({ key: `enemy:${enemy.id}`, family: 'enemy', kind: enemy.kind, x: enemy.x, z: enemy.z, slot: enemySlots[normalize(enemy.kind)] ?? (normalize(enemy.kind).includes('baron') ? assetSlots.charBaron : undefined), scale: 2.6, tint: enemy.alive ? 1 : .38 })),
    ...snapshot.works.map((work) => ({ key: `work:${work.id}:${work.index}`, family: 'work', kind: work.id, x: work.x, z: work.z, slot: workSlots[normalize(work.id)], url: workVisual(work.id), scale: 3.4, tint: work.wrecked ? .55 : 1 })),
    ...snapshot.seams.map((seam) => ({ key: `seam:${seam.id}`, family: 'seam', kind: seam.id, x: seam.x, z: seam.z, slot: assetSlots.nodeGoldSeam, scale: 2.4, tint: seam.remaining > 0 ? 1 : .4 })),
  ];
}


/** Snapshot-derived atmosphere; the terrain pilot retains its minimal callback-free Host. */
function replayLightingState(manifest: ContractManifest, wave: number, time: number): LightRigNightShiftState {
  const { lightRamp: ramp, dayNightCycle: config } = manifest.twist;
  if (!ramp && !config) return { enabled: false, phase: 'full', darkness: 0 };
  const light = lightPhase(manifest, wave);
  let phase: LightRigNightShiftState['phase'] = light.key.startsWith('dawn') ? 'dawn' : light.key.startsWith('dark') ? 'dark' : light.darkness > 0 ? 'dusk' : 'full';
  let darkness = light.darkness;
  let position = wave;
  let loop = false;
  if (config?.waveSchedule) {
    const schedule = config.waveSchedule;
    darkness = THREE.MathUtils.clamp((wave - schedule.duskWave) / Math.max(1, schedule.darkWave - schedule.duskWave), 0, 1) * config.nightDepth;
    phase = wave < schedule.duskWave ? 'full' : wave < schedule.darkWave ? 'dusk' : 'dark';
  } else if (config) {
    const cycle = new DayNightCycle(config).sample(time);
    phase = cycle.phase; darkness = cycle.darkness; loop = true;
    const first = ramp?.keyframes?.[0]?.wave ?? 0;
    const span = (ramp?.keyframes?.at(-1)?.wave ?? first) - first;
    position = first + span * (phase === 'full' ? 0 : phase === 'dusk' ? cycle.phaseProgress : phase === 'dark' ? 1 : 1 + cycle.phaseProgress);
  }
  const state: LightRigNightShiftState = { enabled: true, phase, darkness };
  const frames = ramp?.keyframes;
  if (!frames?.length || (!config && ramp && wave >= ramp.dawnWave)) return state;
  const first = frames[0]!;
  const last = frames.at(-1)!;
  const nextIndex = Math.max(1, frames.findIndex((frame) => frame.wave >= Math.min(position, last.wave)));
  const previous = loop && position > last.wave ? last : frames[nextIndex - 1] ?? first;
  const next = loop && position > last.wave ? first : frames[nextIndex] ?? last;
  const fraction = loop && position > last.wave
    ? (position - last.wave) / Math.max(.001, last.wave - first.wave)
    : (position - previous.wave) / Math.max(.001, next.wave - previous.wave);
  const t = THREE.MathUtils.clamp(fraction, 0, 1);
  const color = (key: 'background' | 'fog' | 'sun' | 'fill' | 'ground' | 'spriteTint') => new THREE.Color(previous[key]).lerp(new THREE.Color(next[key]), t);
  const scalar = (key: 'sunIntensity' | 'fillIntensity' | 'sunHeight') => THREE.MathUtils.lerp(previous[key], next[key], t);
  state.palette = { background: color('background'), fog: color('fog'), sun: color('sun'), fill: color('fill'), ground: color('ground'), spriteTint: color('spriteTint'), sunIntensity: scalar('sunIntensity'), fillIntensity: scalar('fillIntensity'), sunHeight: scalar('sunHeight') };
  return state;
}
