import * as THREE from 'three';
import { loadGeneratedTexture } from '../assets/generated';
import { palette } from '../assets/palette';
import { assetSlots } from '../assets/slots';
import { Balance } from '../game/Balance';

export type WaterDiagnostics = {
  material: 'LivingWaterShader';
  riverTime: number;
  fordTime: number;
  quality: number;
  mobile: boolean;
  foam: boolean;
  glints: number;
  fordStones: number;
};

type WaterUniforms = {
  time: THREE.IUniform<number>;
  quality: THREE.IUniform<number>;
  repeat: THREE.IUniform<number>;
  ford: THREE.IUniform<number>;
  flowSpeed: THREE.IUniform<number>;
};

type WaterMaterialConfig = {
  ford: boolean;
  riverHalfWidth: number;
  visualHalfWidth: number;
  fordHalfWidth: number;
  anchors: Array<{ x: number; z: number }>;
};

export function createLivingWaterMaterial(config: WaterMaterialConfig): THREE.MeshStandardMaterial {
  const uniforms: WaterUniforms = {
    time: { value: 0 },
    quality: { value: waterQuality() },
    repeat: { value: config.ford ? 1 : 8 },
    ford: { value: config.ford ? 1 : 0 },
    flowSpeed: { value: Balance.world.waterFlowSpeed },
  };
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: config.ford ? 0.74 : 0.92,
    depthWrite: false,
    roughness: config.ford ? 0.58 : 0.36,
    metalness: 0.01,
  });
  material.map = createWaterTexture(config.ford);
  configureWaterMap(material.map);
  material.userData.waterUniforms = uniforms;
  material.userData.waterGlints = config.anchors.length;
  material.customProgramCacheKey = () => `living-water-${config.ford ? 'ford' : 'river'}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.waterTime = uniforms.time;
    shader.uniforms.waterQuality = uniforms.quality;
    shader.uniforms.waterRepeat = uniforms.repeat;
    shader.uniforms.waterFord = uniforms.ford;
    shader.uniforms.waterFlowSpeed = uniforms.flowSpeed;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vWaterUv;\nvarying vec2 vWaterWorld;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvWaterUv = uv;\nvWaterWorld = (modelMatrix * vec4(position, 1.0)).xz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float waterTime;
uniform float waterQuality;
uniform float waterRepeat;
uniform float waterFord;
uniform float waterFlowSpeed;
varying vec2 vWaterUv;
varying vec2 vWaterWorld;

float waterGlint(vec2 world, vec2 center, float phase) {
  vec2 delta = world - center;
  float sparkle = 1.0 - smoothstep(0.0, 1.8, dot(delta, delta));
  float pulse = smoothstep(0.72, 0.99, sin(phase + center.x * 0.37) * 0.5 + 0.5);
  float line = 1.0 - smoothstep(0.018, 0.09, abs(delta.y + sin(delta.x * 2.6 + phase) * 0.05));
  return sparkle * pulse * line;
}

float waterGoldGlints(vec2 world) {
  if (waterQuality < 0.75) return 0.0;
  float glint = 0.0;
${glintShaderLines(config.anchors)}
  return glint;
}`)
      .replace('#include <map_fragment>', `
#ifdef USE_MAP
  vec2 flowUv = vec2(vWaterUv.x * waterRepeat + waterTime * waterFlowSpeed, vWaterUv.y);
  float slowWarp = sin(vWaterWorld.x * 0.38 - waterTime * 1.45) * 0.018 * waterQuality;
  flowUv.y += slowWarp;
  vec4 baseTexel = texture2D(map, flowUv);
  float visualEdgeDist = max(0.0, ${config.visualHalfWidth.toFixed(3)} - abs(vWaterWorld.y));
  float riverDist = max(0.0, ${config.riverHalfWidth.toFixed(3)} - abs(vWaterWorld.y));
  float depth = smoothstep(0.05, ${config.riverHalfWidth.toFixed(3)}, riverDist);
  float fordBand = max(waterFord, 1.0 - smoothstep(${config.fordHalfWidth.toFixed(3)}, ${(config.fordHalfWidth + 0.9).toFixed(3)}, abs(vWaterWorld.x)));
  float ripple = sin(vWaterWorld.x * 1.7 + sin(vWaterWorld.y * 1.15) * 0.9 - waterTime * 3.1) * 0.5 + 0.5;
  float fineRipple = 0.0;
  if (waterQuality > 0.7) {
    fineRipple = sin(vWaterWorld.x * 4.8 + vWaterWorld.y * 1.6 - waterTime * 5.2) * 0.5 + 0.5;
  }
  float foamNoise = smoothstep(0.32, 0.94, sin(vWaterWorld.x * 1.05 - waterTime * 2.2 + sin(vWaterWorld.y * 2.1)) * 0.5 + 0.5);
  float bankLine = abs(abs(vWaterWorld.y) - ${config.riverHalfWidth.toFixed(3)});
  float bankFoam = (1.0 - smoothstep(0.04, 0.72, bankLine)) * foamNoise * (0.35 + waterQuality * 0.65);
  vec3 shallow = vec3(0.35, 0.51, 0.45);
  vec3 mid = vec3(0.18, 0.40, 0.40);
  vec3 deep = vec3(0.06, 0.18, 0.17);
  vec3 ford = vec3(0.70, 0.69, 0.50);
  vec3 waterColor = mix(shallow, deep, depth);
  waterColor = mix(waterColor, mid, ripple * 0.11 * waterQuality);
  waterColor = mix(waterColor, ford, fordBand * 0.72);
  waterColor += vec3(0.08, 0.10, 0.08) * fineRipple * waterQuality * (1.0 - fordBand) * 0.22;
  waterColor = mix(waterColor, vec3(0.92, 0.84, 0.62), bankFoam * 0.58);
  waterColor += vec3(1.0, 0.72, 0.20) * waterGoldGlints(vWaterWorld) * 0.42;
  waterColor = mix(waterColor, baseTexel.rgb, 0.12);
  float alpha = mix(0.74, 0.94, depth);
  alpha = mix(alpha, 0.58, fordBand * 0.72);
  alpha = mix(alpha, 0.72, bankFoam * 0.4);
  alpha *= smoothstep(0.0, 0.95, visualEdgeDist);
  float fordOverlayFade = smoothstep(0.0, 0.18, vWaterUv.x) * (1.0 - smoothstep(0.82, 1.0, vWaterUv.x));
  alpha *= mix(1.0, fordOverlayFade, waterFord);
  vec4 sampledDiffuseColor = vec4(waterColor, alpha);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  if (!config.ford) void loadGeneratedTexture(assetSlots.terrainRiver);
  return material;
}

export function createFordStones(waterY: number): THREE.InstancedMesh {
  const stoneGeometry = new THREE.CylinderGeometry(0.55, 0.68, 0.08, 9);
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: palette.sandDeep,
    roughness: 0.9,
    metalness: 0.01,
  });
  const stones = [
    [-0.35, -4.25, 0.85, 0.56, 0.1],
    [0.35, -2.9, 0.7, 0.5, -0.2],
    [-0.18, -1.45, 0.78, 0.52, 0.45],
    [0.32, -0.05, 0.74, 0.5, -0.35],
    [-0.28, 1.42, 0.82, 0.55, 0.2],
    [0.34, 2.88, 0.72, 0.5, -0.1],
    [-0.12, 4.2, 0.86, 0.58, 0.35],
  ] as const;
  const mesh = new THREE.InstancedMesh(stoneGeometry, stoneMaterial, stones.length);
  mesh.name = 'FordSteppingStones';
  mesh.renderOrder = 2;
  mesh.receiveShadow = true;
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  for (let index = 0; index < stones.length; index += 1) {
    const [x, z, sx, sz, yaw] = stones[index];
    position.set(x, waterY + 0.045, z);
    rotation.setFromEuler(new THREE.Euler(0, yaw, 0));
    scale.set(sx, 1, sz);
    matrix.compose(position, rotation, scale);
    mesh.setMatrixAt(index, matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function updateWaterMaterial(mesh: THREE.Mesh, delta: number): void {
  const uniforms = waterUniforms(mesh);
  if (!uniforms) return;
  uniforms.time.value += delta;
  uniforms.quality.value = waterQuality();
  uniforms.flowSpeed.value = Balance.world.waterFlowSpeed;
}

export function waterDiagnostics(river: THREE.Mesh, ford: THREE.Mesh, fordStones: THREE.InstancedMesh): WaterDiagnostics {
  const riverUniforms = waterUniforms(river);
  const fordUniforms = waterUniforms(ford);
  return {
    material: 'LivingWaterShader',
    riverTime: round3(riverUniforms?.time.value ?? 0),
    fordTime: round3(fordUniforms?.time.value ?? 0),
    quality: round3(riverUniforms?.quality.value ?? waterQuality()),
    mobile: isMobileWater(),
    foam: true,
    glints: (river.material as THREE.Material).userData.waterGlints ?? 0,
    fordStones: fordStones.count,
  };
}

function waterUniforms(mesh: THREE.Mesh): WaterUniforms | undefined {
  return (mesh.material as THREE.Material).userData.waterUniforms as WaterUniforms | undefined;
}

function waterQuality(): number {
  const value = isMobileWater() ? Balance.world.waterMobileQuality : Balance.world.waterQuality;
  return THREE.MathUtils.clamp(value, 0, 1);
}

function isMobileWater(): boolean {
  return typeof window !== 'undefined' && window.innerWidth <= 430;
}

function glintShaderLines(anchors: Array<{ x: number; z: number }>): string {
  return anchors
    .map((anchor, index) => {
      const phase = (index * 1.731).toFixed(3);
      return `  glint += waterGlint(world, vec2(${anchor.x.toFixed(3)}, ${anchor.z.toFixed(3)}), waterTime * 1.65 + ${phase});`;
    })
    .join('\n');
}

function configureWaterMap(texture: THREE.Texture): void {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
}

function createWaterTexture(shallow: boolean): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create river texture context.');

  context.fillStyle = shallow ? '#9da889' : '#416f6e';
  context.fillRect(0, 0, size, size);
  context.strokeStyle = shallow ? 'rgba(245, 230, 200, 0.25)' : 'rgba(245, 230, 200, 0.16)';
  context.lineWidth = 1;
  for (let y = 12; y < size; y += 22) {
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= size; x += 20) {
      context.lineTo(x, y + Math.sin(x * 0.07 + y) * 4);
    }
    context.stroke();
  }
  context.strokeStyle = 'rgba(46, 27, 14, 0.08)';
  for (let x = -size; x < size * 2; x += 34) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + size * 0.35, size);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
