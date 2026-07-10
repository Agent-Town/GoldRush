import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import * as Terrain from './Terrain';

export type ShadowsQuality = 'soft' | 'blob';
export type NightShiftPhase = 'full' | 'dusk' | 'dark' | 'dawn';
export type LightRigNightShiftState = {
  enabled: boolean;
  phase: NightShiftPhase;
  darkness: number;
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
  nightShift: LightRigNightShiftState;
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
    this.scene.add(this.group, this.blobShadows.group);
    this.update();
  }

  update(): void {
    const quality = effectiveShadowQuality(this.stressFallback);
    const darkness = this.nightShift.enabled ? THREE.MathUtils.clamp(this.nightShift.darkness, 0, 1) : 0;
    const baseFogNear = this.nightShift.enabled ? 34 : Balance.world.fogNear;
    const baseFogFar = this.nightShift.enabled ? 72 : Balance.world.fogFar;
    const fogNear = THREE.MathUtils.lerp(baseFogNear, 18, darkness);
    const fogFar = Math.max(fogNear + 8, THREE.MathUtils.lerp(baseFogFar, 42, darkness));
    this.applyNightShiftPalette(darkness);
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

  setNightShift(state: LightRigNightShiftState): void {
    this.nightShift = {
      enabled: state.enabled,
      phase: state.phase,
      darkness: THREE.MathUtils.clamp(state.darkness, 0, 1),
    };
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
      nightShift: { ...this.nightShift },
    };
  }

  dispose(): void {
    this.scene.remove(this.group, this.blobShadows.group);
    this.sun.dispose();
    this.fill.dispose();
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
