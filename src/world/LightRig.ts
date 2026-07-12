import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import { setWorldSpriteTint } from '../assets/generated';
import * as Terrain from './Terrain';

export type ShadowsQuality = 'soft' | 'blob';
export type NightShiftPhase = 'full' | 'dusk' | 'dark' | 'dawn';
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
  palette?: LightRigRampPalette;
  spriteTint?: string;
};

export type NightPoolSource = {
  x: number;
  z: number;
  radius: number;
  height?: number;
  kind: 'hero' | 'lantern' | 'enemy-lantern' | 'prospector';
};

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
  enemyLanterns: number;
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

export class LightRig {
  private readonly group = new THREE.Group();
  private readonly sun = new THREE.DirectionalLight('#ffd28a', 2.35);
  private readonly fill = new THREE.HemisphereLight('#fff2cc', '#8b6c3f', 1.12);
  private readonly background = new THREE.Color('#f1c887');
  private readonly fog = new THREE.Fog('#ead2a3', Balance.world.fogNear, Balance.world.fogFar);
  private readonly dayBackground = new THREE.Color('#f1c887');
  private readonly duskBackground = new THREE.Color('#8a6b6c');
  private readonly darkBackground = new THREE.Color('#000000');
  private readonly dawnBackground = new THREE.Color('#f5cfa0');
  private readonly dayFog = new THREE.Color('#ead2a3');
  private readonly duskFog = new THREE.Color('#8b6c6c');
  private readonly darkFog = new THREE.Color('#000000');
  private readonly dawnFog = new THREE.Color('#f5d7b2');
  private readonly daySun = new THREE.Color('#ffd28a');
  private readonly dawnSun = new THREE.Color('#ffd6a2');
  private readonly darkSun = new THREE.Color('#40516f');
  private readonly dayFill = new THREE.Color('#fff2cc');
  private readonly darkFill = new THREE.Color('#28324a');
  private readonly dayGround = new THREE.Color('#8b6c3f');
  private readonly dawnGround = new THREE.Color('#a6815c');
  private readonly darkGround = new THREE.Color('#000000');
  private readonly blobShadows = new SpriteBlobShadows();
  private readonly post = new LedgerPostPass();
  // ponytail: dynamic lights cap at 32; use clustered lighting if night encounters outgrow this render budget.
  private readonly nightPoolLights = Array.from({ length: 32 }, () => new THREE.PointLight());
  private readonly lanternBulbGeometry = new THREE.SphereGeometry(0.09, 8, 6);
  private readonly lanternBulbMaterial = new THREE.MeshBasicMaterial({ color: '#ffd28a' });
  private readonly lanternBulbs = new THREE.InstancedMesh(this.lanternBulbGeometry, this.lanternBulbMaterial, 32);
  private readonly lightMatrix = new THREE.Object3D();
  private readonly muzzleFlashes: MuzzleFlash[] = Array.from({ length: 6 }, () => {
    const light = new THREE.SpotLight('#fff0b0', 0, 7, Math.PI / 7, 0.7, 2);
    const target = new THREE.Object3D();
    light.target = target;
    return { light, target, startedAt: -1, endsAt: -1 };
  });
  private firedMuzzleFlashes = 0;
  private currentShadowMapSize = -1;
  private stressFallback = false;
  private nightShift: LightRigNightShiftState = { enabled: false, phase: 'full', darkness: 0 };

  constructor(private readonly scene: THREE.Scene, private readonly renderer: THREE.WebGLRenderer) {
    this.group.name = 'GoldenHourLightRig';
    this.sun.name = 'LedgerLowSun';
    this.sun.position.set(-28, 18, -22);
    this.sun.target.position.set(4, 0, 8);
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
    this.group.add(this.lanternBulbs);
    for (const light of this.nightPoolLights) {
      light.castShadow = false;
      light.decay = 2;
      light.visible = false;
      this.group.add(light);
    }
    for (const flash of this.muzzleFlashes) this.group.add(flash.light, flash.target);
    this.scene.add(this.group, this.blobShadows.group);
  }

  update(at = 0): void {
    const quality = effectiveShadowQuality(this.stressFallback);
    const darkness = this.nightShift.enabled ? THREE.MathUtils.clamp(this.nightShift.darkness, 0, 1) : 0;
    const baseFogNear = this.nightShift.enabled ? 34 : Balance.world.fogNear;
    const baseFogFar = this.nightShift.enabled ? 72 : Balance.world.fogFar;
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
    this.applyShadowMapSize(mapSize);
    this.sun.shadow.mapSize.set(mapSize, mapSize);
    this.blobShadows.update(this.scene);
    this.post.update();
  }

  renderPost(renderer: THREE.WebGLRenderer): void {
    this.post.render(renderer);
  }

  setStressFallback(active: boolean): void {
    this.stressFallback = active;
  }

  setNightShift(state: LightRigNightShiftState, sources: readonly NightPoolSource[] = []): void {
    this.nightShift = {
      enabled: state.enabled,
      phase: state.phase,
      darkness: THREE.MathUtils.clamp(state.darkness, 0, 1),
      ...(state.palette ? { palette: state.palette } : {}),
    };
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
        ...(this.nightShift.palette ? { spriteTint: `#${this.nightShift.palette.spriteTint.getHexString()}` } : {}),
      },
      nightPools: this.nightPoolLights.filter((light) => light.visible).length,
      enemyLanterns: this.lanternBulbs.count,
      prospectorLights: this.nightPoolLights.filter((light) => light.visible && light.userData.kind === 'prospector').length,
      muzzleFlashes: this.muzzleFlashes.filter((flash) => flash.light.intensity > 0).length,
      muzzleFlashCount: this.firedMuzzleFlashes,
      billboardLights: this.group.children.filter(
        (object) => object instanceof THREE.Mesh && object.geometry instanceof THREE.PlaneGeometry,
      ).length,
    };
  }

  dispose(): void {
    setWorldSpriteTint('#ffffff');
    this.scene.remove(this.group, this.blobShadows.group);
    this.sun.dispose();
    this.fill.dispose();
    this.lanternBulbGeometry.dispose();
    this.lanternBulbMaterial.dispose();
    for (const flash of this.muzzleFlashes) flash.light.dispose();
    this.blobShadows.dispose();
    this.post.dispose();
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
    if (!this.nightShift.enabled) {
      this.background.copy(this.dayBackground);
      this.fog.color.copy(this.dayFog);
      this.sun.color.copy(this.daySun);
      this.sun.intensity = 2.35;
      this.fill.color.copy(this.dayFill);
      this.fill.groundColor.copy(this.dayGround);
      this.fill.intensity = 1.12;
      this.sun.position.y = 18;
      setWorldSpriteTint('#ffffff');
      return;
    }

    if (this.nightShift.phase === 'dawn') {
      this.background.copy(this.dawnBackground);
      this.fog.color.copy(this.dawnFog);
      this.sun.color.copy(this.dawnSun);
      this.sun.intensity = 2.05;
      this.fill.color.copy(this.dayFill);
      this.fill.groundColor.copy(this.dawnGround);
      this.fill.intensity = 1.2;
      this.sun.position.y = 18;
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
      this.fill.intensity = palette.fillIntensity;
      setWorldSpriteTint(palette.spriteTint);
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

  private syncNightPools(sources: readonly NightPoolSource[]): void {
    const darkness = this.nightShift.enabled ? this.nightShift.darkness : 0;
    let lanternCount = 0;
    for (let index = 0; index < this.nightPoolLights.length; index += 1) {
      const light = this.nightPoolLights[index]!;
      const source = sources[index];
      light.visible = darkness > 0 && source !== undefined;
      if (!light.visible || !source) continue;
      light.userData.kind = source.kind;
      const warm = source.kind === 'lantern' || source.kind === 'enemy-lantern';
      light.color.set(warm ? '#ffd28a' : '#8fded3');
      light.intensity = this.nightPoolIntensity(source.kind) * darkness;
      light.distance = source.radius;
      light.position.set(source.x, Terrain.visualY(source.x, source.z, source.height ?? 1.45), source.z);
      if (source.kind !== 'enemy-lantern') continue;
      this.lightMatrix.position.copy(light.position);
      this.lightMatrix.scale.setScalar(1);
      this.lightMatrix.updateMatrix();
      this.lanternBulbs.setMatrixAt(lanternCount, this.lightMatrix.matrix);
      lanternCount += 1;
    }
    this.lanternBulbs.count = darkness > 0 ? lanternCount : 0;
    this.lanternBulbs.instanceMatrix.needsUpdate = true;
  }

  private nightPoolIntensity(kind: NightPoolSource['kind']): number {
    if (kind === 'lantern') return Balance.contracts.nightShift.lanternRenderIntensity;
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

  constructor() {
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
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
    if (!this.enabled) return;
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.render(this.scene, this.camera);
    renderer.autoClear = autoClear;
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
