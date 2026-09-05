import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import { setWorldSpriteTint } from '../assets/generated';
import type { LightSource } from '../systems/LightField';
import * as Terrain from './Terrain';

export type ShadowsQuality = 'soft' | 'blob';
export type NightShiftPhase = 'full' | 'dusk' | 'dark' | 'dawn';

// Night Shift pool-light colours (render-side; §4.6). The hero and the Prospector carry a cooler
// light than the lanterns so your own reach stays tellable from theirs at a glance; #8fded3 read as
// a mint disc against the warm map, so it moves to a steel blue at matched luminance.
//
// The WARM one deliberately stays #ffd28a even though warming it is what the night-mode-truth
// review asked for. Under ACES, saturation added to a light this bright costs post-tonemap
// luminance, and this light sets how bright a relit lantern's build island reads. Measured at the
// sample points e1-night-shift.spec.ts:435 uses for that property (higher is better):
//   #ffd28a 0.1053   #ffd94d (luma-matched, +52% chroma) 0.1045   #ff9e3d 0.0957
// Amber here would dim the build island ~6% for very little gain: the ground's colour is set by the
// terrain emissive, not by this light (swapping it alone moved measured lit-ground warmth by 0.73
// of ~7). So the amber lives in the terrain emissive, and this stays bright.
const WARM_POOL_LIGHT = '#ffd28a';
const COOL_POOL_LIGHT = '#b3d4ec';

export type LightRigRampPalette = {
  background: THREE.Color;
  fog: THREE.Color;
  sun: THREE.Color;
  sunIntensity: number;
  fill: THREE.Color;
  ground: THREE.Color;
  fillIntensity: number;
  sunHeight: number;
  spriteTint: THREE.Color;
};
export type LightRigNightShiftState = {
  enabled: boolean;
  phase: NightShiftPhase;
  darkness: number;
  lampIntensityMult?: number;
  palette?: LightRigRampPalette;
  spriteTint?: string;
};

/**
 * PER-MAP DAYTIME ATMOSPHERE (brief U2).
 *
 * The five E1 maps ship one identical golden-hour rig, which is the cheapest identity the game is
 * throwing away: atmosphere tells you which map you are on before any landmark does. Night Shift
 * already proves the shape — an authored ramp flowing contract -> Game -> LightRig — but that path
 * is a NIGHT ramp keyed to waves. Daylight needs no keyframes, just a per-contract override.
 *
 * EVERY FIELD IS A MULTIPLIER OR AN ABSENCE, never a snapshot. `Balance.world.fogNear/fogFar` are
 * live tuning-panel values read each frame; a palette that stored 48.3 would silently disconnect
 * this map's fog slider. A map with no entry here takes the `?? today` branch at every use site, so
 * "all other maps keep byte-identical current values" is visible in the diff rather than asserted.
 */
export type LightRigDayPalette = {
  background: string;
  sun: string;
  /** Applied to the shared 2.35 golden-hour sun. */
  sunIntensityMult: number;
  sunHeight: number;
  fogNearMult: number;
  fogFarMult: number;
};

/**
 * HEAT YOU CAN SEE (brief U5).
 *
 * A still frame can be orange; only motion reads as HOT. Two effects, both per-contract and both
 * shed at the first sign of stress:
 *  - a shimmer band across the top of the frame, where the far ground is, distorting what is
 *    already drawn there;
 *  - one or two dust devils wandering the far field, additive and capped.
 *
 * SHED FIRST. `setStressFallback` is the earliest rung of the MQ-4 auto-tier ladder (it fires at
 * runtime verdict >= 1, before the dynamic-light cap at 2 and the LITE fallback at 3), so gating on
 * it registers the heat ahead of everything else the ladder sheds — no new watchdog needed.
 */
export type LightRigHeatProfile = {
  /** Screen fraction where the shimmer reaches full strength (1 = top of frame). */
  bandTop: number;
  /** Screen fraction where the shimmer starts, below which the frame is untouched. */
  bandBottom: number;
  /** Peak horizontal displacement, in device-independent pixels. */
  amplitudePx: number;
  devils: number;
};

const HEAT_PROFILES: ReadonlyMap<string, LightRigHeatProfile> = new Map([
  ['e1-dry-gulch', { bandTop: 0.98, bandBottom: 0.55, amplitudePx: 2.2, devils: 2 }],
]);

const DAY_PALETTES: ReadonlyMap<string, LightRigDayPalette> = new Map([
  // "Noon, dry, merciless": a hotter whiter sun raised toward overhead, and dry air that sees
  // further than the golden-hour haze does.
  ['e1-dry-gulch', {
    background: '#f3cd92',
    sun: '#ffe0a0',
    sunIntensityMult: 1.06,
    sunHeight: 27,
    fogNearMult: 1.15,
    fogFarMult: 1.15,
  }],
]);

export type LightRigDiagnostics = {
  sunPresent: boolean;
  shadowsQuality: ShadowsQuality;
  fogNear: number;
  fogFar: number;
  postEnabled: boolean;
  paperGrainOpacity: number;
  shadowMapSize: number;
  shadowMapTargetSize: number;
  blobShadows: number;
  /** True only on a heat contract, at FULL tier, with the auto-tier ladder unstressed. */
  heatShimmer: boolean;
  dustDevilQuads: number;
  palette: {
    background: string;
    fog: string;
    sun: string;
    sunIntensity: number;
    fill: string;
    fillIntensity: number;
  };
  nightShift: LightRigNightShiftState;
  nightPools: number;
  nightPoolCap: number;
  nightPoolSources: number;
  enemyLanterns: number;
  enemyLanternCones: number;
  prospectorLights: number;
  muzzleFlashes: number;
  muzzleFlashCount: number;
  billboardLights: number;
};

type MuzzleFlash = {
  light: THREE.SpotLight;
  target: THREE.Object3D;
  startedAt: number;
  endsAt: number;
};

/**
 * The Ledger low sun, exported so anything that has to agree with the key light —
 * a contact shadow's offset, an art board's camera — reads the same two numbers the
 * rig is built from instead of copying them.
 */
/**
 * THE REFERENCE RIG'S DIALS (F-ASTRA-9, 2026-09-05 — harness only, absent by default).
 *
 * Astra asked for terrain, landmark, building and sprite to be calibrated "together under one
 * reference rig". This IS the one rig — `Terrain3dClaimPilot`, the town pilots and
 * `LanternWorldStage` all construct this class — so the dials belong here rather than in a second
 * scene that would drift from it. Every value is a MULTIPLIER on the shipped constant, never a
 * snapshot, so a dial-less boot takes the untouched path and the diff cannot silently re-tune the
 * game (the DAY_PALETTES rule, one paragraph up).
 *
 *   ?exposure=<n>  scale the renderer's ACES exposure (Renderer.ts ships 1.05)
 *   ?sun=<n>       scale the 2.35 golden-hour key
 *   ?fill=<n>      scale the 1.12 hemisphere fill
 */
type LightRigDials = { exposure: number; sun: number; fill: number };

function readLightRigDials(): LightRigDials {
  if (typeof window === 'undefined') return { exposure: 1, sun: 1, fill: 1 };
  const params = new URLSearchParams(window.location.search);
  const read = (key: string): number => {
    const value = Number(params.get(key));
    return params.has(key) && Number.isFinite(value) && value >= 0 ? value : 1;
  };
  return { exposure: read('exposure'), sun: read('sun'), fill: read('fill') };
}

const LIGHT_RIG_DIALS = readLightRigDials();
/** One renderer must not be re-scaled by a second LightRig over the same canvas. */
const exposureDialled = new WeakSet<THREE.WebGLRenderer>();

export const LEDGER_SUN_POSITION = new THREE.Vector3(-28, 18, -22);
export const LEDGER_SUN_TARGET = new THREE.Vector3(4, 0, 8);

/** Unit XZ direction the key light travels, i.e. the way ground shadows lean. */
export function ledgerSunShadowDirection(): THREE.Vector2 {
  return new THREE.Vector2(
    LEDGER_SUN_TARGET.x - LEDGER_SUN_POSITION.x,
    LEDGER_SUN_TARGET.z - LEDGER_SUN_POSITION.z,
  ).normalize();
}

export class LightRig {
  private readonly group = new THREE.Group();
  private readonly sun = new THREE.DirectionalLight('#ffd28a', 2.35);
  private readonly fill = new THREE.HemisphereLight('#fff2cc', '#8b6c3f', 1.12);
  private readonly background = new THREE.Color('#f1c887');
  private readonly fog = new THREE.Fog('#ead2a3', Balance.world.fogNear, Balance.world.fogFar);
  private readonly dayBackground = new THREE.Color('#f1c887');
  private readonly duskBackground = new THREE.Color('#8a6b6c');
  private readonly darkBackground = new THREE.Color('#000000');
  private readonly dawnBackground = new THREE.Color('#ecc9bd');
  private readonly dayFog = new THREE.Color('#ead2a3');
  private readonly duskFog = new THREE.Color('#8b6c6c');
  private readonly darkFog = new THREE.Color('#000000');
  private readonly dawnFog = new THREE.Color('#f5d7b2');
  private readonly daySun = new THREE.Color('#ffd28a');
  private readonly dawnSun = new THREE.Color('#ffc9a4');
  // Silver-rose dawn: the fill goes cool BEFORE the sun warms back up, which is what makes first
  // light read as relief rather than as a second noon.
  private readonly dawnFill = new THREE.Color('#dfe3ee');
  private readonly darkSun = new THREE.Color('#40516f');
  private readonly dayFill = new THREE.Color('#fff2cc');
  private readonly darkFill = new THREE.Color('#28324a');
  private readonly dayGround = new THREE.Color('#8b6c3f');
  private readonly dawnGround = new THREE.Color('#a08a86');
  private readonly darkGround = new THREE.Color('#000000');
  private readonly blobShadows = new SpriteBlobShadows();
  private readonly post: LedgerPostPass;
  private readonly dustDevils: DustDevils | undefined;
  // ponytail: dynamic lights cap at 32; use clustered lighting if night encounters outgrow this render budget.
  private readonly nightPoolLights = Array.from({ length: 32 }, () => new THREE.PointLight());
  private readonly lanternBulbGeometry = new THREE.SphereGeometry(0.09, 8, 6);
  private readonly lanternBulbMaterial = new THREE.MeshBasicMaterial({ color: '#ffd28a' });
  private readonly lanternBulbs = new THREE.InstancedMesh(this.lanternBulbGeometry, this.lanternBulbMaterial, 32);
  private readonly lanternConeGeometry = new THREE.ConeGeometry(1, 1, 12, 1, true);
  private readonly lanternConeMaterial = new THREE.MeshBasicMaterial({
    color: '#ffd28a',
    transparent: true,
    opacity: Balance.contracts.nightShift.enemyLanternConeOpacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  private readonly lanternCones = new THREE.InstancedMesh(this.lanternConeGeometry, this.lanternConeMaterial, 32);
  private readonly lightMatrix = new THREE.Object3D();
  private readonly muzzleFlashes: MuzzleFlash[] = Array.from({ length: 6 }, () => {
    const light = new THREE.SpotLight('#fff0b0', 0, 7, Math.PI / 7, 0.7, 2);
    const target = new THREE.Object3D();
    light.target = target;
    return { light, target, startedAt: -1, endsAt: -1 };
  });
  private firedMuzzleFlashes = 0;
  private lastHeatAt = 0;
  private currentShadowMapSize = -1;
  private stressFallback = false;
  private nightPoolSources = 0;
  private nightLightLimit: number | null = null;
  private readonly renderSources: LightSource[] = [];
  private readonly selectedSources: LightSource[] = [];
  private nightShift: LightRigNightShiftState = { enabled: false, phase: 'full', darkness: 0 };

  private readonly dayPalette: LightRigDayPalette | undefined;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly renderer: THREE.WebGLRenderer,
    contractId?: string,
  ) {
    this.dayPalette = contractId === undefined ? undefined : DAY_PALETTES.get(contractId);
    const heat = contractId === undefined ? undefined : HEAT_PROFILES.get(contractId);
    // FULL tier only: the shimmer costs a framebuffer copy per frame, which is exactly the kind of
    // cost a machine already on the LITE path cannot absorb.
    const heatAllowed = heat && performanceTierDiagnostics().tier === 'full' ? heat : undefined;
    this.post = new LedgerPostPass(heatAllowed);
    this.dustDevils = heatAllowed && heatAllowed.devils > 0 ? new DustDevils(heatAllowed.devils) : undefined;
    if (LIGHT_RIG_DIALS.exposure !== 1 && !exposureDialled.has(renderer)) {
      exposureDialled.add(renderer);
      renderer.toneMappingExposure *= LIGHT_RIG_DIALS.exposure;
    }
    this.group.name = 'GoldenHourLightRig';
    this.sun.name = 'LedgerLowSun';
    this.sun.position.copy(LEDGER_SUN_POSITION);
    this.sun.target.position.copy(LEDGER_SUN_TARGET);
    this.sun.castShadow = true;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 76;
    this.sun.shadow.camera.left = -48;
    this.sun.shadow.camera.right = 48;
    this.sun.shadow.camera.top = 48;
    this.sun.shadow.camera.bottom = -48;
    this.sun.shadow.bias = -0.00022;
    this.sun.shadow.normalBias = 0.018;
    this.sun.shadow.radius = 2.5;
    this.group.add(this.fill, this.sun, this.sun.target);
    this.lanternBulbs.name = 'EnemyHandLanternBulbs';
    this.lanternBulbs.frustumCulled = false;
    this.lanternBulbs.count = 0;
    this.lanternCones.name = 'EnemyHandLanternCones';
    this.lanternCones.frustumCulled = false;
    this.lanternCones.count = 0;
    this.lanternCones.renderOrder = RenderLayers.gameplayFade;
    this.group.add(this.lanternBulbs, this.lanternCones);
    for (const light of this.nightPoolLights) {
      light.castShadow = false;
      light.decay = Balance.contracts.nightShift.nightLightDecay;
      light.visible = false;
      this.group.add(light);
    }
    for (const flash of this.muzzleFlashes) this.group.add(flash.light, flash.target);
    this.scene.add(this.group, this.blobShadows.group);
    if (this.dustDevils) this.scene.add(this.dustDevils.group);
  }

  update(at = 0, focus?: THREE.Vector3): void {
    const quality = effectiveShadowQuality(this.stressFallback);
    const darkness = this.nightShift.enabled ? THREE.MathUtils.clamp(this.nightShift.darkness, 0, 1) : 0;
    const baseFogNear = this.nightShift.enabled
      ? 34
      : Balance.world.fogNear * (this.dayPalette?.fogNearMult ?? 1);
    const baseFogFar = this.nightShift.enabled
      ? 72
      : Balance.world.fogFar * (this.dayPalette?.fogFarMult ?? 1);
    const fogNear = THREE.MathUtils.lerp(baseFogNear, 18, darkness);
    const fogFar = Math.max(fogNear + 8, THREE.MathUtils.lerp(baseFogFar, 42, darkness));
    this.applyNightShiftPalette(darkness);
    this.updateMuzzleFlashes(at);
    this.scene.background = this.background;
    this.scene.fog = this.fog;
    this.fog.near = fogNear;
    this.fog.far = fogFar;
    this.renderer.shadowMap.enabled = quality === 'soft';
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    const mapSize = shadowMapSize(quality);
    this.sun.castShadow = quality === 'soft';
    // perf-r2: a directional light of zero intensity contributes exactly zero radiance, so its
    // shadow term is multiplied away -- but three.js's shadow pass has no intensity guard
    // (WebGLShadowMap.js:158-170 checks only `shadow === undefined` and the autoUpdate/needsUpdate
    // pair), so a full depth pass over every caster keeps running through the whole dark phase.
    // `applyNightShiftPalette` above has already lerped `sun.intensity` to 0 at darkness 1.
    // Parking autoUpdate skips the pass while leaving `castShadow` alone, so no material's
    // shadow-count program key changes and nothing recompiles at the dusk boundary.
    this.sun.shadow.autoUpdate = this.sun.intensity > 1e-3;
    this.applyShadowMapSize(mapSize);
    this.sun.shadow.mapSize.set(mapSize, mapSize);
    this.blobShadows.update(this.scene);
    // The heat is the first thing the auto-tier ladder sheds, and it never runs at night.
    const heatOn = !this.stressFallback && !this.nightShift.enabled;
    this.post.setHeatEnabled(heatOn);
    this.post.advanceHeat(Math.min(0.1, Math.max(0, at - this.lastHeatAt)));
    this.lastHeatAt = at;
    this.dustDevils?.update(at, heatOn, focus);
    this.post.update();
  }

  renderPost(renderer: THREE.WebGLRenderer): void {
    this.post.render(renderer);
  }

  setStressFallback(active: boolean): void {
    this.stressFallback = active;
  }

  setNightLightLimit(limit: number | null): void {
    this.nightLightLimit = limit === null ? null : Math.max(0, Math.floor(limit));
  }

  setNightShift(state: LightRigNightShiftState, sources: readonly LightSource[] = []): void {
    this.nightShift.enabled = state.enabled;
    this.nightShift.phase = state.phase;
    this.nightShift.darkness = THREE.MathUtils.clamp(state.darkness, 0, 1);
    this.nightShift.lampIntensityMult = THREE.MathUtils.clamp(state.lampIntensityMult ?? 1, 0, 1);
    if (state.palette) this.nightShift.palette = state.palette;
    else delete this.nightShift.palette;
    this.syncNightPools(sources);
  }

  triggerMuzzleFlash(at: number, origin: THREE.Vector3, target: THREE.Vector3): void {
    const flash = this.muzzleFlashes.find((entry) => entry.endsAt <= at) ?? this.muzzleFlashes[0]!;
    flash.startedAt = at;
    flash.endsAt = at + Balance.contracts.nightShift.muzzleFlashSeconds;
    flash.light.position.set(origin.x, Terrain.visualY(origin.x, origin.z, 0.82), origin.z);
    flash.target.position.set(target.x, Terrain.visualY(target.x, target.z, 0.65), target.z);
    this.firedMuzzleFlashes += 1;
  }

  resetTransientLights(): void {
    this.firedMuzzleFlashes = 0;
    for (const flash of this.muzzleFlashes) {
      flash.startedAt = -1;
      flash.endsAt = -1;
      flash.light.intensity = 0;
    }
  }

  diagnostics(): LightRigDiagnostics {
    const quality = effectiveShadowQuality(this.stressFallback);
    const shadowTargetSize = this.sun.shadow.map?.width ?? 0;
    let nightPools = 0;
    let prospectorLights = 0;
    for (const light of this.nightPoolLights) {
      if (!light.visible) continue;
      nightPools += 1;
      prospectorLights += Number(light.userData.kind === 'prospector');
    }
    let muzzleFlashes = 0;
    for (const flash of this.muzzleFlashes) muzzleFlashes += Number(flash.light.intensity > 0);
    let billboardLights = 0;
    for (const object of this.group.children) {
      billboardLights += Number(object instanceof THREE.Mesh && object.geometry instanceof THREE.PlaneGeometry);
    }
    return {
      sunPresent: this.sun.visible && this.sun.intensity > 0,
      shadowsQuality: quality,
      fogNear: round2(this.fog.near),
      fogFar: round2(this.fog.far),
      postEnabled: this.post.enabled,
      paperGrainOpacity: round3(Balance.world.postPaperGrainOpacity),
      shadowMapSize: shadowMapSize(quality),
      shadowMapTargetSize: quality === 'soft' ? shadowTargetSize : 0,
      blobShadows: this.blobShadows.count,
      heatShimmer: this.post.heatActive,
      dustDevilQuads: this.dustDevils?.quadCount ?? 0,
      palette: {
        background: `#${this.background.getHexString()}`,
        fog: `#${this.fog.color.getHexString()}`,
        sun: `#${this.sun.color.getHexString()}`,
        sunIntensity: round2(this.sun.intensity),
        fill: `#${this.fill.color.getHexString()}`,
        fillIntensity: round2(this.fill.intensity),
      },
      nightShift: {
        enabled: this.nightShift.enabled,
        phase: this.nightShift.phase,
        darkness: this.nightShift.darkness,
        lampIntensityMult: this.nightShift.lampIntensityMult ?? 1,
        ...(this.nightShift.palette ? { spriteTint: `#${this.nightShift.palette.spriteTint.getHexString()}` } : {}),
      },
      nightPools,
      nightPoolCap: this.nightLightCap(),
      nightPoolSources: this.nightPoolSources,
      enemyLanterns: this.lanternBulbs.count,
      enemyLanternCones: this.lanternCones.count,
      prospectorLights,
      muzzleFlashes,
      muzzleFlashCount: this.firedMuzzleFlashes,
      billboardLights,
    };
  }

  dispose(): void {
    setWorldSpriteTint('#ffffff');
    this.scene.remove(this.group, this.blobShadows.group);
    this.sun.dispose();
    this.fill.dispose();
    this.lanternBulbGeometry.dispose();
    this.lanternBulbMaterial.dispose();
    this.lanternConeGeometry.dispose();
    this.lanternConeMaterial.dispose();
    for (const flash of this.muzzleFlashes) flash.light.dispose();
    this.blobShadows.dispose();
    this.post.dispose();
    if (this.dustDevils) {
      this.scene.remove(this.dustDevils.group);
      this.dustDevils.dispose();
    }
  }

  private applyShadowMapSize(mapSize: number): void {
    if (this.currentShadowMapSize === mapSize) return;
    this.sun.shadow.map?.dispose();
    this.sun.shadow.map = null;
    this.sun.shadow.mapPass?.dispose();
    this.sun.shadow.mapPass = null;
    this.currentShadowMapSize = mapSize;
    if (mapSize > 0) this.sun.shadow.needsUpdate = true;
  }

  private applyNightShiftPalette(darkness: number): void {
    this.applyPalette(darkness);
    if (LIGHT_RIG_DIALS.sun !== 1) this.sun.intensity *= LIGHT_RIG_DIALS.sun;
    if (LIGHT_RIG_DIALS.fill !== 1) this.fill.intensity *= LIGHT_RIG_DIALS.fill;
  }

  private applyPalette(darkness: number): void {
    if (!this.nightShift.enabled) {
      const day = this.dayPalette;
      this.background.copy(day ? dayPaletteColor(day.background) : this.dayBackground);
      this.fog.color.copy(this.dayFog);
      this.sun.color.copy(day ? dayPaletteColor(day.sun) : this.daySun);
      this.sun.intensity = 2.35 * (day?.sunIntensityMult ?? 1);
      this.fill.color.copy(this.dayFill);
      this.fill.groundColor.copy(this.dayGround);
      this.fill.intensity = 1.12;
      this.sun.position.y = day?.sunHeight ?? 18;
      setWorldSpriteTint('#ffffff');
      return;
    }

    const palette = this.nightShift.palette;
    if (palette) {
      this.background.copy(palette.background);
      this.fog.color.copy(palette.fog);
      this.sun.color.copy(palette.sun);
      this.sun.intensity = palette.sunIntensity;
      this.sun.position.y = palette.sunHeight;
      this.fill.color.copy(palette.fill);
      this.fill.groundColor.copy(palette.ground);
      this.fill.intensity = Math.max(
        palette.fillIntensity,
        Balance.contracts.nightShift.nightAmbientFloorIntensity * darkness,
      );
      setWorldSpriteTint(palette.spriteTint);
      return;
    }

    if (this.nightShift.phase === 'dawn') {
      this.background.copy(this.dawnBackground);
      this.fog.color.copy(this.dawnFog);
      this.sun.color.copy(this.dawnSun);
      this.sun.intensity = 2.05;
      this.fill.color.copy(this.dawnFill);
      this.fill.groundColor.copy(this.dawnGround);
      this.fill.intensity = 1.2;
      this.sun.position.y = 18;
      setWorldSpriteTint('#ffffff');
      return;
    }

    const targetBackground = this.nightShift.phase === 'dusk' ? this.duskBackground : this.darkBackground;
    const targetFog = this.nightShift.phase === 'dusk' ? this.duskFog : this.darkFog;
    this.background.copy(this.dayBackground).lerp(targetBackground, darkness);
    this.fog.color.copy(this.dayFog).lerp(targetFog, darkness);
    this.sun.color.copy(this.daySun).lerp(this.darkSun, darkness);
    this.sun.intensity = THREE.MathUtils.lerp(2.35, 0, darkness);
    this.fill.color.copy(this.dayFill).lerp(this.darkFill, darkness);
    this.fill.groundColor.copy(this.dayGround).lerp(this.darkGround, darkness);
    this.fill.intensity = THREE.MathUtils.lerp(1.12, 0, darkness);
    setWorldSpriteTint(this.fill.color);
  }

  private syncNightPools(sources: readonly LightSource[]): void {
    const darkness = this.nightShift.enabled ? this.nightShift.darkness : 0;
    this.nightPoolSources = sources.length;
    this.renderSources.length = 0;
    let hero: LightSource | undefined;
    for (const source of sources) {
      if (source.kind === 'watch') continue;
      this.renderSources.push(source);
      if (!hero && source.kind === 'hero') hero = source;
    }
    const lightCount = Math.min(this.renderSources.length, this.nightLightCap());
    let selectedSources = this.renderSources;
    if (hero && this.renderSources.length > lightCount) {
      this.selectedSources.length = 0;
      for (const source of this.renderSources) this.selectedSources.push(source);
      this.selectedSources.sort((a, b) => {
          return nightLightPriority(a) - nightLightPriority(b) ||
            ((a.x - hero.x) ** 2 + (a.z - hero.z) ** 2) - ((b.x - hero.x) ** 2 + (b.z - hero.z) ** 2);
        });
      selectedSources = this.selectedSources;
    }
    let lanternCount = 0;
    for (const source of this.renderSources) {
      if (source.kind !== 'enemy-lantern' || lanternCount >= this.lanternBulbs.instanceMatrix.count) continue;
      this.lightMatrix.position.set(source.x, Terrain.visualY(source.x, source.z, source.height ?? 0.82), source.z);
      this.lightMatrix.scale.setScalar(1);
      this.lightMatrix.updateMatrix();
      this.lanternBulbs.setMatrixAt(lanternCount, this.lightMatrix.matrix);
      const coneHeight = Balance.contracts.nightShift.enemyLanternConeHeight;
      this.lightMatrix.position.set(source.x, Terrain.visualY(source.x, source.z, coneHeight * 0.5), source.z);
      this.lightMatrix.scale.set(
        Balance.contracts.nightShift.enemyLanternConeRadius,
        coneHeight,
        Balance.contracts.nightShift.enemyLanternConeRadius,
      );
      this.lightMatrix.updateMatrix();
      this.lanternCones.setMatrixAt(lanternCount, this.lightMatrix.matrix);
      lanternCount += 1;
    }
    for (let index = 0; index < this.nightPoolLights.length; index += 1) {
      const light = this.nightPoolLights[index]!;
      const source = selectedSources[index];
      light.visible = darkness > 0 && index < lightCount && source !== undefined;
      if (!light.visible || !source) continue;
      light.userData.kind = source.kind;
      const warm = source.kind === 'lantern' || source.kind === 'powered-lamp' || source.kind === 'enemy-lantern';
      // The pools ARE this map's composition, so they carry its colour. #ffd28a read as pale tan
      // once ACES compressed it — the amber the night-mode-truth review asked for lives here, in the
      // dynamic pool lights, not only in the terrain shader's emissive core.
      light.color.set(warm ? WARM_POOL_LIGHT : COOL_POOL_LIGHT);
      const flicker = source.kind === 'lantern' ? this.nightShift.lampIntensityMult ?? 1 : 1;
      light.intensity = this.nightPoolIntensity(source.kind) * darkness * flicker;
      light.distance = source.radius;
      light.position.set(source.x, Terrain.visualY(source.x, source.z, source.height ?? 1.45), source.z);
    }
    this.lanternBulbs.count = darkness > 0 ? lanternCount : 0;
    this.lanternBulbs.instanceMatrix.needsUpdate = true;
    this.lanternConeMaterial.opacity = Balance.contracts.nightShift.enemyLanternConeOpacity * darkness;
    this.lanternCones.count = darkness > 0 ? lanternCount : 0;
    this.lanternCones.instanceMatrix.needsUpdate = true;
  }

  private nightLightCap(): number {
    return THREE.MathUtils.clamp(
      this.nightLightLimit ?? Math.floor(Balance.render.night.maxDynamicLights),
      0,
      this.nightPoolLights.length,
    );
  }

  private nightPoolIntensity(kind: LightSource['kind']): number {
    if (kind === 'lantern' || kind === 'powered-lamp') return Balance.contracts.nightShift.lanternRenderIntensity;
    if (kind === 'enemy-lantern') return Balance.contracts.nightShift.enemyLanternIntensity;
    if (kind === 'prospector') return Balance.contracts.nightShift.agentLightIntensity;
    return Balance.contracts.nightShift.heroRenderIntensity;
  }

  private updateMuzzleFlashes(at: number): void {
    for (const flash of this.muzzleFlashes) {
      const remaining = flash.endsAt - at;
      flash.light.intensity = remaining <= 0
        ? 0
        : Balance.contracts.nightShift.muzzleFlashIntensity * THREE.MathUtils.clamp(
            remaining / Math.max(0.001, flash.endsAt - flash.startedAt),
            0,
            1,
          );
    }
  }
}

function nightLightPriority(source: LightSource): number {
  return source.kind === 'hero' ? 0 : source.kind === 'prospector' ? 1 : 2;
}

type BlobShadowFamily = 'hero' | 'claimJumper' | 'beacon' | 'prospector';

type BlobShadowProfile = {
  family: BlobShadowFamily;
  scaleX: number;
  scaleZ: number;
  padRadius?: number;
};

class SpriteBlobShadows {
  readonly group = new THREE.Group();

  private readonly geometry = new THREE.CircleGeometry(1, 28);
  private readonly heroMaterial = this.createMaterial(0.17);
  private readonly claimJumperMaterial = this.createMaterial(0.2);
  private readonly beaconMaterial = this.createMaterial(0.16);
  private readonly prospectorMaterial = this.createMaterial(0.16);
  private readonly heroMesh = new THREE.InstancedMesh(this.geometry, this.heroMaterial, 1);
  private readonly claimJumperMesh = new THREE.InstancedMesh(
    this.geometry,
    this.claimJumperMaterial,
    Balance.enemy.poolSize,
  );
  private readonly beaconMesh = new THREE.InstancedMesh(this.geometry, this.beaconMaterial, Balance.beacon.maxCount);
  private readonly prospectorMesh = new THREE.InstancedMesh(this.geometry, this.prospectorMaterial, 1);
  private readonly meshes: Record<BlobShadowFamily, THREE.InstancedMesh> = {
    hero: this.heroMesh,
    claimJumper: this.claimJumperMesh,
    beacon: this.beaconMesh,
    prospector: this.prospectorMesh,
  };
  private readonly counts: Record<BlobShadowFamily, number> = {
    hero: 0,
    claimJumper: 0,
    beacon: 0,
    prospector: 0,
  };
  private readonly worldPosition = new THREE.Vector3();
  private readonly matrixObject = new THREE.Object3D();
  private visibleCount = 0;

  constructor() {
    this.group.name = 'GeneratedSpriteBlobShadows';
    for (const mesh of Object.values(this.meshes)) {
      mesh.name = `${this.group.name}.${mesh.uuid}`;
      mesh.frustumCulled = false;
      mesh.renderOrder = RenderLayers.groundShadows;
      mesh.count = 0;
      this.group.add(mesh);
    }
  }

  update(scene: THREE.Scene): void {
    this.counts.hero = 0;
    this.counts.claimJumper = 0;
    this.counts.beacon = 0;
    this.counts.prospector = 0;

    scene.traverse((object) => {
      if (!(object instanceof THREE.Sprite) || !object.visible) return;
      const profile = spriteProfile(object);
      if (!profile) return;
      this.writeShadow(object, profile);
    });

    for (const family of Object.keys(this.meshes) as BlobShadowFamily[]) {
      const mesh = this.meshes[family];
      mesh.count = this.counts[family];
      mesh.instanceMatrix.needsUpdate = true;
    }
    this.visibleCount = this.counts.hero + this.counts.claimJumper + this.counts.beacon + this.counts.prospector;
  }

  dispose(): void {
    this.geometry.dispose();
    this.heroMaterial.dispose();
    this.claimJumperMaterial.dispose();
    this.beaconMaterial.dispose();
    this.prospectorMaterial.dispose();
  }

  get count(): number {
    return this.visibleCount;
  }

  private writeShadow(sprite: THREE.Sprite, profile: BlobShadowProfile): void {
    const mesh = this.meshes[profile.family];
    const index = this.counts[profile.family];
    if (index >= mesh.instanceMatrix.count) return;

    sprite.getWorldPosition(this.worldPosition);
    this.matrixObject.position.set(
      this.worldPosition.x,
      Terrain.visualY(this.worldPosition.x, this.worldPosition.z, 0, profile.padRadius ?? 0) + 0.018,
      this.worldPosition.z,
    );
    this.matrixObject.rotation.set(-Math.PI / 2, 0, -0.38);
    this.matrixObject.scale.set(profile.scaleX, profile.scaleZ, 1);
    this.matrixObject.updateMatrix();
    mesh.setMatrixAt(index, this.matrixObject.matrix);
    this.counts[profile.family] += 1;
  }

  private createMaterial(opacity: number): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color: '#2e1b0e',
      transparent: true,
      opacity,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
  }
}

class LedgerPostPass {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly geometry = new THREE.PlaneGeometry(2, 2);
  private readonly heat: HeatShimmerBand | undefined;
  private readonly material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      warmth: { value: Balance.world.postWarmth },
      vignette: { value: Balance.world.postVignette },
      grainOpacity: { value: Balance.world.postPaperGrainOpacity },
    },
    vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`,
    fragmentShader: `
varying vec2 vUv;
uniform float warmth;
uniform float vignette;
uniform float grainOpacity;

float grain(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
}

void main() {
  vec2 fromCenter = vUv - vec2(0.5);
  float edge = smoothstep(0.28, 0.74, length(fromCenter) * 1.42);
  float paper = grain(floor(gl_FragCoord.xy * 0.75));
  vec3 warmInk = mix(vec3(1.0, 0.82, 0.50), vec3(0.22, 0.13, 0.07), edge);
  float alpha = clamp((1.0 - edge) * warmth + edge * vignette + abs(paper) * grainOpacity, 0.0, 0.24);
  gl_FragColor = vec4(warmInk + paper * grainOpacity * 1.5, alpha);
}`,
  });
  private readonly quad = new THREE.Mesh(this.geometry, this.material);

  constructor(profile?: LightRigHeatProfile) {
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
    this.heat = profile ? new HeatShimmerBand(profile) : undefined;
  }

  get heatActive(): boolean {
    return this.heat?.active ?? false;
  }

  setHeatEnabled(enabled: boolean): void {
    this.heat?.setEnabled(enabled);
  }

  advanceHeat(delta: number): void {
    this.heat?.advance(delta);
  }

  get enabled(): boolean {
    return Balance.world.postEnabled && (Balance.world.postWarmth > 0 || Balance.world.postVignette > 0 || Balance.world.postPaperGrainOpacity > 0);
  }

  update(): void {
    this.material.uniforms.warmth.value = Balance.world.postWarmth;
    this.material.uniforms.vignette.value = Balance.world.postVignette;
    this.material.uniforms.grainOpacity.value = Balance.world.postPaperGrainOpacity;
  }

  render(renderer: THREE.WebGLRenderer): void {
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    // Shimmer first: it distorts the frame that is already there, so it has to run before the
    // paper-grain overlay is painted on top of it (grain that wobbles would read as a wet lens).
    this.heat?.render(renderer);
    if (this.enabled) renderer.render(this.scene, this.camera);
    renderer.autoClear = autoClear;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.heat?.dispose();
  }
}

/**
 * The shimmer band. It re-reads the frame the game just drew (`copyFramebufferToTexture`) and
 * redraws the top of it through a horizontal wobble — no render-target rewiring, no change to how
 * the scene is drawn, and when it is off there is not one extra GL call.
 */
class HeatShimmerBand {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly geometry = new THREE.PlaneGeometry(2, 2);
  private readonly frame = new THREE.FramebufferTexture(2, 2);
  private readonly size = new THREE.Vector2();
  private readonly material: THREE.ShaderMaterial;
  private readonly quad: THREE.Mesh;
  private enabled = false;
  private width = 0;
  private height = 0;

  constructor(private readonly profile: LightRigHeatProfile) {
    this.frame.minFilter = THREE.LinearFilter;
    this.frame.magFilter = THREE.LinearFilter;
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        frame: { value: this.frame },
        heatTime: { value: 0 },
        amplitude: { value: 0 },
        bandTop: { value: profile.bandTop },
        bandBottom: { value: profile.bandBottom },
      },
      vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`,
      fragmentShader: `
varying vec2 vUv;
uniform sampler2D frame;
uniform float heatTime;
uniform float amplitude;
uniform float bandTop;
uniform float bandBottom;

void main() {
  float band = smoothstep(bandBottom, bandTop, vUv.y);
  if (band <= 0.002) discard;
  // Two rates, so the air rolls instead of vibrating at one frequency.
  float wobble =
    sin(vUv.y * 178.0 + heatTime * 3.1) * 0.62 +
    sin(vUv.y * 63.0 + vUv.x * 8.0 - heatTime * 2.05) * 0.38;
  vec2 shifted = vec2(clamp(vUv.x + wobble * amplitude * band, 0.0, 1.0), vUv.y);
  gl_FragColor = vec4(texture2D(frame, shifted).rgb, band);
}`,
    });
    this.quad = new THREE.Mesh(this.geometry, this.material);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
  }

  get active(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  advance(delta: number): void {
    if (!this.enabled) return;
    this.material.uniforms.heatTime!.value += delta;
  }

  render(renderer: THREE.WebGLRenderer): void {
    if (!this.enabled) return;
    renderer.getDrawingBufferSize(this.size);
    if (this.size.x < 4 || this.size.y < 4) return;
    if (this.size.x !== this.width || this.size.y !== this.height) {
      this.width = this.size.x;
      this.height = this.size.y;
      // A FramebufferTexture cannot be resized in place; drop the GPU copy and let three re-upload.
      this.frame.dispose();
      this.frame.image = { width: this.width, height: this.height };
      this.material.uniforms.amplitude!.value = this.profile.amplitudePx / this.width;
    }
    renderer.copyFramebufferToTexture(this.frame);
    renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.frame.dispose();
  }
}

const dayPaletteColors = new Map<string, THREE.Color>();

/** Colours are authored as strings and consumed every frame; parse each exactly once. */
function dayPaletteColor(value: string): THREE.Color {
  let color = dayPaletteColors.get(value);
  if (!color) {
    color = new THREE.Color(value);
    dayPaletteColors.set(value, color);
  }
  return color;
}

/**
 * Wandering dust devils: one instanced mesh, one additive material, one draw call for all of them.
 *
 * BILLBOARDING WITHOUT A CAMERA. `CameraRig` only ever translates by a fixed offset and calls
 * lookAt; it never yaws or rolls, so the view direction's heading is constant for the whole run and
 * a quad pitched to match the camera's fixed tilt faces it from anywhere on the map. That is why
 * these can be instances rather than N Sprites with N draw calls.
 *
 * They keep their distance on purpose: a dust devil that walks through the player is a collider the
 * sim does not have, so each one fades out as the hero closes and re-seeds its path far away.
 */
class DustDevils {
  readonly group = new THREE.Group();

  private static readonly QUADS_PER_DEVIL = 11;
  private readonly geometry = new THREE.PlaneGeometry(1, 1);
  private readonly material = new THREE.MeshBasicMaterial({
    color: '#e7c48f',
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  private readonly mesh: THREE.InstancedMesh;
  private readonly anchor = new THREE.Object3D();
  /** Matches the run camera's fixed pitch: atan2(26.2, 21.65) from the horizontal. */
  private readonly cameraPitch = Math.atan2(Balance.camera.offset.y, Balance.camera.offset.z + Balance.camera.downScreenLookOffset);

  constructor(private readonly devils: number) {
    this.group.name = 'DryGulchDustDevils';
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, Math.max(1, devils * DustDevils.QUADS_PER_DEVIL));
    this.mesh.name = 'DryGulchDustDevilQuads';
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
    this.mesh.renderOrder = RenderLayers.gameplayFade;
    this.mesh.count = 0;
    this.group.add(this.mesh);
  }

  get quadCount(): number {
    return this.mesh.count;
  }

  update(at: number, enabled: boolean, focus?: THREE.Vector3): void {
    if (!enabled) {
      this.mesh.count = 0;
      return;
    }
    let written = 0;
    for (let devil = 0; devil < this.devils; devil += 1) {
      // A slow lissajous walk over the far field; different rates per devil so they never pair up.
      const phase = at * (0.045 + devil * 0.012) + devil * 2.4;
      const x = Math.sin(phase) * 24 + Math.sin(phase * 2.3 + 1.1) * 4;
      const z = Math.cos(phase * 0.83 + devil) * 24 + Math.cos(phase * 1.7) * 5;
      const nearness = focus ? 1 - THREE.MathUtils.clamp((Math.hypot(x - focus.x, z - focus.z) - 12) / 8, 0, 1) : 0;
      const presence = (1 - nearness) * THREE.MathUtils.clamp(Math.sin(phase * 0.7) * 0.5 + 0.75, 0, 1);
      if (presence <= 0.02) continue;
      const ground = Terrain.visualY(x, z, 0);
      for (let step = 0; step < DustDevils.QUADS_PER_DEVIL; step += 1) {
        const up = step / DustDevils.QUADS_PER_DEVIL;
        const twist = at * 2.1 + step * 1.15 + devil * 3.3;
        const radius = 0.35 + up * 1.9;
        this.anchor.position.set(
          x + Math.cos(twist) * radius * 0.34,
          ground + 0.15 + up * 5.4,
          z + Math.sin(twist) * radius * 0.34,
        );
        this.anchor.rotation.set(this.cameraPitch - Math.PI / 2, 0, twist * 0.12);
        const spread = (0.9 + up * 2.3) * presence;
        this.anchor.scale.set(spread, spread * 1.25, 1);
        this.anchor.updateMatrix();
        this.mesh.setMatrixAt(written, this.anchor.matrix);
        written += 1;
      }
    }
    this.mesh.count = written;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

function effectiveShadowQuality(forceBlob = false): ShadowsQuality {
  return forceBlob || isMobileTier() || String(Balance.world.shadowsQuality) === 'blob' ? 'blob' : 'soft';
}

function isMobileTier(): boolean {
  return typeof window !== 'undefined' && window.innerWidth <= 430;
}

function shadowMapSize(quality: ShadowsQuality): number {
  if (quality === 'blob') return 0;
  return THREE.MathUtils.clamp(Math.floor(Balance.world.shadowMapSize), 512, 2048);
}

function spriteProfile(sprite: THREE.Sprite): BlobShadowProfile | null {
  if (sprite.name === 'GeneratedHeroHomesteader') {
    return { family: 'hero', scaleX: 0.62, scaleZ: 0.38 };
  }
  if (sprite.name === 'ProspectorSprite') {
    return { family: 'prospector', scaleX: 0.48, scaleZ: 0.3 };
  }

  const parentName = sprite.parent?.name ?? '';
  if (parentName === 'GeneratedClaimJumperSprites' || parentName === 'GeneratedClaimJumperThiefSprites') {
    return { family: 'claimJumper', scaleX: 0.48, scaleZ: 0.31 };
  }

  if (parentName === 'GeneratedSentryBeaconSprites') {
    return { family: 'beacon', scaleX: 0.58, scaleZ: 0.36, padRadius: Balance.beacon.overlapRadius };
  }

  return null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
