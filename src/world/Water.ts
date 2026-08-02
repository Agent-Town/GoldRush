import * as THREE from 'three';
import { loadGeneratedTexture } from '../assets/generated';
import { palette } from '../assets/palette';
import { assetSlots } from '../assets/slots';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';

export type WaterDiagnostics = {
  material: 'LivingWaterShader';
  riverPresent: boolean;
  fordPresent: boolean;
  riverTime: number;
  fordTime: number;
  quality: number;
  mobile: boolean;
  foam: boolean;
  glints: number;
  fordStones: number;
  gravelBars: number;
  visualHalfWidth: number;
  springPonds: number;
  waterPhaseVariance: number;
  depth: {
    river: number;
    ford: number;
    wade: number;
    deep: number;
  };
};

type WaterUniforms = {
  time: THREE.IUniform<number>;
  quality: THREE.IUniform<number>;
  repeat: THREE.IUniform<number>;
  ford: THREE.IUniform<number>;
  flowSpeed: THREE.IUniform<number>;
  riverDepth: THREE.IUniform<number>;
  fordDepth: THREE.IUniform<number>;
  wadeDepth: THREE.IUniform<number>;
  deepDepth: THREE.IUniform<number>;
};

type WaterMaterialConfig = {
  ford: boolean;
  riverHalfWidth: number;
  visualHalfWidth: number;
  lengthHalf: number;
  fadeStart: number;
  fordHalfWidth: number;
  riverDepth: number;
  fordDepth: number;
  wadeDepth: number;
  deepDepth: number;
  anchors: Array<{ x: number; z: number }>;
};

/**
 * The shared water field: one glint, one hash, one value-noise, used by the river/ford surface and
 * by the spring pond. Extracted verbatim from the river shader so the two surfaces cannot drift
 * apart — a pond that ripples on different noise than the river reads as a different game's water.
 */
const WATER_FIELD_GLSL = `
float waterGlint(vec2 world, vec2 center, float phase) {
  vec2 delta = world - center;
  float sparkle = 1.0 - smoothstep(0.0, 1.8, dot(delta, delta));
  float pulse = smoothstep(0.72, 0.99, sin(phase + center.x * 0.37) * 0.5 + 0.5);
  float line = 1.0 - smoothstep(0.018, 0.09, abs(delta.y + sin(delta.x * 2.6 + phase) * 0.05));
  return sparkle * pulse * line;
}

float waterHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float waterNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = waterHash(i);
  float b = waterHash(i + vec2(1.0, 0.0));
  float c = waterHash(i + vec2(0.0, 1.0));
  float d = waterHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}`;

export function createLivingWaterMaterial(config: WaterMaterialConfig): THREE.MeshStandardMaterial {
  const uniforms: WaterUniforms = {
    time: { value: 0 },
    quality: { value: waterQuality() },
    repeat: { value: config.ford ? 1 : 8 },
    ford: { value: config.ford ? 1 : 0 },
    flowSpeed: { value: Balance.world.waterFlowSpeed },
    riverDepth: { value: config.riverDepth },
    fordDepth: { value: config.fordDepth },
    wadeDepth: { value: config.wadeDepth },
    deepDepth: { value: config.deepDepth },
  };
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: config.ford ? 0.74 : 0.92,
    depthTest: config.ford,
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
    shader.uniforms.waterRiverDepth = uniforms.riverDepth;
    shader.uniforms.waterFordDepth = uniforms.fordDepth;
    shader.uniforms.waterWadeDepth = uniforms.wadeDepth;
    shader.uniforms.waterDeepDepth = uniforms.deepDepth;
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
uniform float waterRiverDepth;
uniform float waterFordDepth;
uniform float waterWadeDepth;
uniform float waterDeepDepth;
varying vec2 vWaterUv;
varying vec2 vWaterWorld;
${WATER_FIELD_GLSL}

float waterGoldGlints(vec2 world) {
  if (waterQuality < 0.75) return 0.0;
  float glint = 0.0;
${glintShaderLines(config.anchors)}
  return glint;
}`)
      .replace('#include <map_fragment>', `
#ifdef USE_MAP
  float lengthNoise = waterNoise(vec2(vWaterWorld.x * 0.055, vWaterWorld.y * 0.16));
  float crossNoise = waterNoise(vec2(vWaterWorld.x * 0.18 + 13.0, vWaterWorld.y * 0.11 - 7.0));
  float phaseWarp = (waterNoise(vec2(vWaterWorld.x * 0.12 - waterTime * 0.18, vWaterWorld.y * 0.27)) - 0.5) * 0.58 * waterQuality;
  float localSpeed = waterFlowSpeed * mix(0.58, 1.44, lengthNoise);
  vec2 flowUv = vec2(vWaterUv.x * waterRepeat + waterTime * localSpeed + phaseWarp, vWaterUv.y);
  float slowWarp =
    sin(vWaterWorld.x * mix(0.23, 0.52, crossNoise) + vWaterWorld.y * 0.37 - waterTime * mix(0.9, 1.9, lengthNoise)) *
    mix(0.012, 0.038, crossNoise) *
    waterQuality;
  flowUv.y += slowWarp + (crossNoise - 0.5) * 0.045 * waterQuality;
  vec4 baseTexel = texture2D(map, flowUv);
  float riverAcross = mix((vWaterUv.y - 0.5) * ${(config.visualHalfWidth * 2).toFixed(3)}, vWaterWorld.y, waterFord);
  float visualEdgeDist = max(0.0, ${config.visualHalfWidth.toFixed(3)} - abs(riverAcross));
  float riverDist = max(0.0, ${config.riverHalfWidth.toFixed(3)} - abs(riverAcross));
  float fordBand = max(waterFord, 1.0 - smoothstep(${config.fordHalfWidth.toFixed(3)}, ${(config.fordHalfWidth + 0.9).toFixed(3)}, abs(vWaterWorld.x)));
  float channelDepth = mix(waterWadeDepth * 0.5, waterRiverDepth, smoothstep(0.05, ${config.riverHalfWidth.toFixed(3)}, riverDist));
  float declaredDepth = mix(channelDepth, waterFordDepth, fordBand);
  float depth = smoothstep(max(0.001, waterWadeDepth), max(waterWadeDepth + 0.001, waterDeepDepth), declaredDepth);
  float rippleFreq = mix(1.05, 2.45, lengthNoise);
  float rippleAmp = mix(0.06, 0.17, crossNoise);
  float ripple = sin(vWaterWorld.x * rippleFreq + vWaterWorld.y * mix(-0.46, 0.72, crossNoise) + phaseWarp * 4.0 - waterTime * mix(2.1, 4.4, lengthNoise)) * 0.5 + 0.5;
  float fineRipple = 0.0;
  if (waterQuality > 0.7) {
    fineRipple = sin(vWaterWorld.x * mix(3.7, 6.2, crossNoise) + vWaterWorld.y * mix(0.8, 2.4, lengthNoise) - waterTime * mix(3.8, 6.7, crossNoise) + phaseWarp * 2.0) * 0.5 + 0.5;
  }
  float foamNoise = smoothstep(0.26, 0.92, waterNoise(vec2(vWaterWorld.x * 0.42 - waterTime * 0.7, vWaterWorld.y * 1.25 + lengthNoise * 3.0)));
  float bankLine = abs(abs(riverAcross) - ${config.riverHalfWidth.toFixed(3)});
  float bankFoam = (1.0 - smoothstep(0.04, 0.72, bankLine)) * foamNoise * (0.35 + waterQuality * 0.65);
  vec3 shallow = vec3(0.35, 0.51, 0.45);
  vec3 mid = vec3(0.18, 0.40, 0.40);
  vec3 deep = vec3(0.06, 0.18, 0.17);
  vec3 ford = vec3(0.70, 0.69, 0.50);
  vec3 waterColor = mix(shallow, deep, depth);
  waterColor = mix(waterColor, mid, ripple * rippleAmp * waterQuality);
  waterColor = mix(waterColor, ford, fordBand * 0.72);
  waterColor += vec3(0.08, 0.10, 0.08) * fineRipple * waterQuality * (1.0 - fordBand) * 0.22;
  waterColor = mix(waterColor, vec3(0.92, 0.84, 0.62), bankFoam * 0.58);
  waterColor += vec3(1.0, 0.72, 0.20) * waterGoldGlints(vWaterWorld) * 0.42;
  waterColor = mix(waterColor, baseTexel.rgb, 0.12);
  float alpha = mix(0.74, 0.94, depth);
  alpha = mix(alpha, 0.58, fordBand * 0.72);
  alpha = mix(alpha, 0.72, bankFoam * 0.4);
  alpha *= smoothstep(0.0, 0.95, visualEdgeDist);
  alpha *= mix(1.0 - smoothstep(${config.fadeStart.toFixed(3)}, ${config.lengthHalf.toFixed(3)}, abs(vWaterWorld.x)), 1.0, waterFord);
  float fordOverlayFade = smoothstep(0.0, 0.18, vWaterUv.x) * (1.0 - smoothstep(0.82, 1.0, vWaterUv.x));
  alpha *= mix(1.0, fordOverlayFade, waterFord);
  vec4 sampledDiffuseColor = vec4(waterColor, alpha);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  if (!config.ford) void loadGeneratedTexture(assetSlots.terrainRiver);
  return material;
}

export type SpringPondSurface = {
  group: THREE.Group;
  dispose: () => void;
};

type SpringPondConfig = {
  x: number;
  z: number;
  /** Water-line radius in metres — the visible pool, not the sim's spring radius. */
  radius: number;
  /** World height of the water plane itself — measured off the pool the atlas already paints. */
  surfaceY: number;
};

/**
 * How far past the water line the damp ground reads, as a multiple of the pool radius. Kept tight:
 * the margin has to stay inside the landmark's own stone ring, and wet stone at a waterline is
 * right where dark ground drawn over dry sand would be a smear.
 */
const POND_MARGIN_SCALE = 1.42;
const POND_SURFACE_LIFT = 0.02;

/**
 * ONE LIVE POOL IN A BONE-DRY MAP (brief U1).
 *
 * Render-only: a disc of moving water at a spring the sim already declares, plus the damp margin
 * that says the water reaches past its own edge, plus a few reed tufts. Nothing here is read by the
 * simulation — the spring's position, radius and zone stay exactly where `tileParams.waterSources`
 * put them, and this surface only draws what that declaration already means.
 *
 * It is NOT the river material. The river/ford shader measures everything in world-z bands and
 * fades on the ford's UV strip; on a disc those become a hard edge across the pool and an alpha
 * that depends on how far the pond happens to sit from z=0. Same water language (same noise, same
 * glint, same warm-shallow-to-cool-deep ramp), radial geometry.
 */
export function createSpringPondSurface(config: SpringPondConfig): SpringPondSurface {
  const group = new THREE.Group();
  group.name = 'SpringPondLive';
  group.userData.renderOnly = true;

  const time = { value: 0 };
  const quality = { value: waterQuality() };
  const outerRadius = config.radius * POND_MARGIN_SCALE;
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.74,
    depthWrite: false,
    depthTest: true,
    roughness: 0.5,
    metalness: 0.02,
  });
  material.map = createWaterTexture(true);
  configureWaterMap(material.map);
  material.userData.waterUniforms = { time, quality };
  material.customProgramCacheKey = () => 'living-water-spring-pond';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.pondTime = time;
    shader.uniforms.pondQuality = quality;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vPondLocal;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvPondLocal = position.xy;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float pondTime;
uniform float pondQuality;
varying vec2 vPondLocal;
${WATER_FIELD_GLSL}`)
      .replace('#include <map_fragment>', `
#ifdef USE_MAP
  float pondDist = length(vPondLocal);
  float pondR = pondDist / ${config.radius.toFixed(3)};
  // Deep across most of the pool and thinning only at the very lip: a spring is a hole with water
  // in it, not a saucer, and a soft radial ramp is what made the baked version read as a decal.
  float pondDepth = 1.0 - smoothstep(0.58, 1.0, pondR);
  // Wind chop: two noise fields drifting across each other. This carries the motion; the ring
  // wavelets below only punctuate it, because concentric rings alone read as a target.
  float pondChop = waterNoise(vPondLocal * 1.15 + vec2(pondTime * 0.09, -pondTime * 0.05));
  float pondChopB = waterNoise(vPondLocal * 2.2 - vec2(pondTime * 0.13, pondTime * 0.08));
  float pondSurface = (pondChop * 0.62 + pondChopB * 0.38 - 0.5);
  // The spring eye is well off-centre and the ring phase is warped by the chop.
  float pondEye = length(vPondLocal - vec2(${(config.radius * 0.34).toFixed(3)}, ${(config.radius * -0.29).toFixed(3)}));
  float pondRings = sin(pondEye * 4.6 - pondTime * 1.35 + pondSurface * 5.0) * 0.5 + 0.5;
  float pondFine = 0.0;
  if (pondQuality > 0.7) {
    pondFine = sin(pondEye * 11.5 - pondTime * 2.6 + pondChopB * 4.2) * 0.5 + 0.5;
  }
  vec4 pondTexel = texture2D(map, vPondLocal * 0.22 + vec2(pondTime * 0.010, pondChop * 0.05));
  // Green-black at depth, olive where the water thins over pale sand. Never the pool-cyan the
  // atlas bakes — a desert spring is dark, and the darkness is what makes the glints read.
  vec3 pondShallow = vec3(0.40, 0.47, 0.27);
  vec3 pondDeepColor = vec3(0.040, 0.150, 0.125);
  vec3 pondColor = mix(pondShallow, pondDeepColor, pondDepth);
  // The lit shallow ring. A pool photographs as a dark eye inside a bright collar, and that collar
  // is what makes it read as WATER at run-camera distance rather than as a hole in the ground.
  float pondCollar = smoothstep(0.72, 0.94, pondR) * (1.0 - smoothstep(0.94, 1.0, pondR));
  pondColor = mix(pondColor, vec3(0.62, 0.68, 0.40), pondCollar * 0.55);
  pondColor += vec3(0.11, 0.16, 0.10) * pondSurface * (0.5 + pondQuality * 0.5);
  pondColor += vec3(0.07, 0.10, 0.06) * pondRings * 0.16;
  pondColor += vec3(0.06, 0.08, 0.05) * pondFine * pondQuality * 0.20;
  // The one thing a still atlas can never do: sun moving on water.
  // Small and many, not one big streak: waterGlint draws a short specular line, so at this scale
  // each is a ~30 cm flash and the pool twinkles instead of looking scratched.
  vec2 pondGlintUv = vPondLocal * 4.2;
  float pondGlint =
    waterGlint(pondGlintUv, vec2(1.2, -0.7), pondTime * 1.15) +
    waterGlint(pondGlintUv, vec2(-1.9, 1.4), pondTime * 1.15 + 1.7) +
    waterGlint(pondGlintUv, vec2(0.4, 2.6), pondTime * 1.15 + 3.1) +
    waterGlint(pondGlintUv, vec2(-2.6, -1.9), pondTime * 1.15 + 4.4) +
    waterGlint(pondGlintUv, vec2(2.4, 1.9), pondTime * 1.15 + 5.6) +
    waterGlint(pondGlintUv, vec2(-0.3, -2.9), pondTime * 1.15 + 2.4);
  pondColor += vec3(1.0, 0.94, 0.72) * pondGlint * pondQuality * 1.5;
  pondColor = mix(pondColor, pondTexel.rgb * 0.6, 0.10);
  // Wet sand: past the water line the disc stops being water and starts being damp ground.
  float pondWet = smoothstep(1.0, 0.92, pondR);
  vec3 pondDamp = vec3(0.19, 0.115, 0.065);
  pondColor = mix(pondDamp, pondColor, pondWet);
  // Nearly opaque on purpose. The landmark bakes a bright cyan pool bed into a single-material
  // body that cannot be hidden separately, so anything translucent here just tints that cyan.
  float pondAlpha = mix(0.88, 0.985, pondDepth);
  // The margin also has a job the brief did not have to name: the landmark's baked cap keeps
  // drawing bright cyan out to r 2.80, past any sane water line, and it shows in the gaps between
  // the stones. So the damp band holds near-full alpha all the way past the cap before it fades —
  // it covers that ring and reads as wet sand at the same time.
  float pondMarginAlpha = 0.90 * (1.0 - smoothstep(${(outerRadius * 0.86).toFixed(3)}, ${outerRadius.toFixed(3)}, pondDist));
  pondAlpha = mix(pondMarginAlpha, pondAlpha, pondWet);
  vec4 sampledDiffuseColor = vec4(pondColor, pondAlpha);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };

  const water = new THREE.Mesh(new THREE.CircleGeometry(outerRadius, 56), material);
  water.name = 'SpringPondLiveSurface';
  water.rotation.x = -Math.PI / 2;
  water.position.set(config.x, config.surfaceY + POND_SURFACE_LIFT, config.z);
  water.renderOrder = RenderLayers.groundDecals;
  water.receiveShadow = false;
  water.castShadow = false;
  water.frustumCulled = false;
  group.add(water);

  // The 3D pilot has no per-frame pump and giving it one would mean editing Game.ts, which this
  // surface has no business touching. Three already calls onBeforeRender once per mesh per render;
  // the frame guard keeps a second camera pass (or a future one) from double-advancing the clock.
  const clock = new THREE.Clock();
  let lastFrame = -1;
  water.onBeforeRender = (renderer) => {
    if (renderer.info.render.frame === lastFrame) return;
    lastFrame = renderer.info.render.frame;
    // Clamped: a backgrounded tab returns seconds, and a pond that teleports forward on refocus
    // looks like a glitch rather than water.
    time.value += Math.min(clock.getDelta(), 0.1);
    quality.value = waterQuality();
  };

  const reeds = createPondReedTufts(config);
  group.add(reeds);

  return {
    group,
    dispose: () => {
      material.map?.dispose();
      material.dispose();
      water.geometry.dispose();
      (reeds.material as THREE.Material).dispose();
      reeds.geometry.dispose();
    },
  };
}

/**
 * Three darker reed clumps on the wet margin. Desaturated on purpose: desert law says cacti and dry
 * brush, and a bright green fringe would turn the one spring into an oasis the map does not have.
 */
function createPondReedTufts(config: SpringPondConfig): THREE.InstancedMesh {
  const blades = [
    { angle: 0.62, distance: 1.00, scale: 1.0 },
    { angle: 0.86, distance: 1.06, scale: 0.74 },
    { angle: 2.48, distance: 1.03, scale: 0.92 },
    { angle: 2.72, distance: 0.97, scale: 0.68 },
    { angle: 4.30, distance: 0.99, scale: 0.96 },
    { angle: 4.06, distance: 1.05, scale: 0.72 },
  ];
  const mesh = new THREE.InstancedMesh(
    reedTuftGeometry(),
    new THREE.MeshStandardMaterial({ color: '#43512f', roughness: 1, metalness: 0, side: THREE.DoubleSide }),
    blades.length,
  );
  mesh.name = 'SpringPondLiveReeds';
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  const anchor = new THREE.Object3D();
  blades.forEach(({ angle, distance, scale }, index) => {
    anchor.position.set(
      config.x + Math.cos(angle) * config.radius * distance,
      config.surfaceY + POND_SURFACE_LIFT,
      config.z + Math.sin(angle) * config.radius * distance,
    );
    anchor.rotation.set(0, angle, 0);
    anchor.scale.setScalar(scale);
    anchor.updateMatrix();
    mesh.setMatrixAt(index, anchor.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function reedTuftGeometry(): THREE.BufferGeometry {
  const width = 0.16;
  const height = 0.82;
  const positions = [
    -width, 0, 0, width, 0, 0, -width * 0.6, height, 0, width * 0.5, height * 0.78, 0,
    0, 0, -width, 0, 0, width, 0, height * 0.9, -width * 0.5, 0, height * 0.66, width * 0.6,
  ];
  const indices = [0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createFordStones(waterY: number, offsetX = 0): THREE.InstancedMesh {
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
  mesh.renderOrder = RenderLayers.gameplay;
  mesh.receiveShadow = true;
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  for (let index = 0; index < stones.length; index += 1) {
    const [x, z, sx, sz, yaw] = stones[index];
    position.set(x + offsetX, waterY + 0.045, z);
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
  uniforms.wadeDepth.value = Balance.terrainSim.wadeDepth;
  uniforms.deepDepth.value = Balance.terrainSim.deepDepth;
}

export function waterDiagnostics(
  river: THREE.Mesh,
  fords: readonly THREE.Mesh[],
  fordStones: readonly THREE.InstancedMesh[],
  gravelBars: readonly THREE.Mesh[] = [],
): WaterDiagnostics {
  const riverUniforms = waterUniforms(river);
  const ford = fords[0];
  const fordUniforms = ford ? waterUniforms(ford) : undefined;
  const visualHalfWidth = typeof river.userData.visualHalfWidth === 'number' ? river.userData.visualHalfWidth : 0;
  return {
    material: 'LivingWaterShader',
    riverPresent: true,
    fordPresent: fords.length > 0,
    riverTime: round3(riverUniforms?.time.value ?? 0),
    fordTime: round3(fordUniforms?.time.value ?? 0),
    quality: round3(riverUniforms?.quality.value ?? waterQuality()),
    mobile: isMobileWater(),
    foam: true,
    glints: (river.material as THREE.Material).userData.waterGlints ?? 0,
    fordStones: fordStones.reduce((sum, mesh) => sum + mesh.count, 0),
    gravelBars: gravelBars.length,
    visualHalfWidth: round3(visualHalfWidth),
    springPonds: 0,
    waterPhaseVariance: round3(waterPhaseVariance()),
    depth: {
      river: round3(riverUniforms?.riverDepth.value ?? 0),
      ford: round3(fordUniforms?.fordDepth.value ?? riverUniforms?.fordDepth.value ?? 0),
      wade: round3(riverUniforms?.wadeDepth.value ?? Balance.terrainSim.wadeDepth),
      deep: round3(riverUniforms?.deepDepth.value ?? Balance.terrainSim.deepDepth),
    },
  };
}

export function dryWaterDiagnostics(springPonds: number): WaterDiagnostics {
  return {
    material: 'LivingWaterShader',
    riverPresent: false,
    fordPresent: false,
    riverTime: 0,
    fordTime: 0,
    quality: round3(waterQuality()),
    mobile: isMobileWater(),
    foam: false,
    glints: 0,
    fordStones: 0,
    gravelBars: 0,
    visualHalfWidth: 0,
    springPonds,
    waterPhaseVariance: 0,
    depth: {
      river: 0,
      ford: 0,
      wade: round3(Balance.terrainSim.wadeDepth),
      deep: round3(Balance.terrainSim.deepDepth),
    },
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

function waterPhaseVariance(): number {
  return waterQuality() * 0.43;
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
