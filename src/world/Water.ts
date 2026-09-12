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
  /** Open sea has no river crossing band and uses wind-aligned surface crests. */
  openSea?: boolean;
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
  /** World-X centres of every declared ford. Omitted preserves the shipped origin crossing. */
  fordCenters?: readonly number[];
  /**
   * The painted river floats over flat ground, so it ships with depth testing OFF.
   * A surface laid into a sculpted channel needs it ON or it paints straight over
   * the banks in front of it.
   */
  depthTest?: boolean;
  /**
   * Multiplies the shader's water palette. White keeps the shipped mint; a warm
   * sepia pulls the same water into a Frontier Ledger map's tone without touching
   * the shader. Foam and gold glints ride the same multiply, so they stay warm.
   */
  color?: string;
  /** Surface opacity. Lower lets a sculpted bed's own darkness ground the water. */
  opacity?: number;
  /** Light-independent chroma for water under the warm Ledger key light. */
  emissive?: string;
  emissiveIntensity?: number;
  /** Blend weight for the surface map. Narrow ribbons set this to zero: its six fixed
   * horizontal strokes become metre-wide bands when squeezed across a three-metre channel. */
  textureBlend?: number;
  /** Multiplies the sine-ripple contribution without changing flow speed. */
  rippleStrength?: number;
  /** Strength of the pale ford wash. */
  fordTint?: number;
  /** Metres of alpha ramp at the band's outer edge. */
  shoreFadeMeters?: number;
  /** Face-on ripple lift; defaults to on when a bed map is present. */
  surfaceLift?: boolean;
  /**
   * Optional baked bed-depth map (red channel, 0..1 == 0..deepMeters below the
   * surface). Present only for sculpted channels: the painted river floats over
   * flat ground and has no bed to read. When present the water stops guessing its
   * depth from the tile's declared band and reads the real carved channel, so the
   * sculpted meander shows as dark water and the margins go shallow and damp.
   */
  bedDepth?: { map: THREE.Texture; deepMeters: number; shoreMeters: number };
};

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
    color: config.color ?? '#ffffff',
    transparent: true,
    opacity: config.opacity ?? (config.ford ? 0.74 : 0.92),
    depthTest: config.depthTest ?? config.ford,
    depthWrite: false,
    roughness: config.ford ? 0.58 : 0.36,
    metalness: 0.01,
    emissive: config.emissive ?? '#000000',
    emissiveIntensity: config.emissiveIntensity ?? 1,
  });
  material.map = createWaterTexture(config.ford);
  configureWaterMap(material.map);
  material.userData.waterUniforms = uniforms;
  material.userData.waterGlints = config.anchors.length;
  // The band geometry is BAKED INTO THE SOURCE below as literals (visual/river/ford
  // half widths, the fade window, one line per glint anchor). Two materials that
  // share a cache key share a compiled program, so the key has to carry every
  // literal that can differ — otherwise a second water surface on the same map
  // silently renders with the first one's constants.
  material.customProgramCacheKey = () => [
    'living-water',
    config.openSea ? 'sea' : 'channel',
    config.ford ? 'ford' : 'river',
    config.visualHalfWidth.toFixed(3),
    config.riverHalfWidth.toFixed(3),
    config.fordHalfWidth.toFixed(3),
    (config.fordCenters ?? [0]).map((center) => center.toFixed(2)).join('|'),
    config.fadeStart.toFixed(3),
    config.lengthHalf.toFixed(3),
    config.anchors.map((anchor) => `${anchor.x.toFixed(2)},${anchor.z.toFixed(2)}`).join('_') || 'noglints',
    `texture${(config.textureBlend ?? 0.12).toFixed(3)}`,
    `ripple${(config.rippleStrength ?? 1).toFixed(2)}`,
    `ford${(config.fordTint ?? 0.72).toFixed(3)}`,
    `shorefade${(config.shoreFadeMeters ?? 0.95).toFixed(3)}`,
    (config.surfaceLift ?? config.bedDepth !== undefined) ? 'lift' : 'nolift',
    config.bedDepth ? `bed${config.bedDepth.deepMeters.toFixed(3)}_${config.bedDepth.shoreMeters.toFixed(3)}` : 'nobed',
  ].join('-');
  material.onBeforeCompile = (shader) => {
    shader.uniforms.waterTime = uniforms.time;
    if (config.bedDepth) {
      shader.uniforms.waterBedMap = { value: config.bedDepth.map };
      shader.uniforms.waterBedDeep = { value: config.bedDepth.deepMeters };
      shader.uniforms.waterBedShore = { value: config.bedDepth.shoreMeters };
    }
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
${config.bedDepth ? 'uniform sampler2D waterBedMap;\nuniform float waterBedDeep;\nuniform float waterBedShore;' : ''}
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
${config.openSea ? '  flowUv = vWaterWorld / 20.0 + vec2(waterTime * waterFlowSpeed * 0.08, waterTime * waterFlowSpeed * 0.03);' : ''}
  vec4 baseTexel = texture2D(map, flowUv);
  float riverAcross = mix((vWaterUv.y - 0.5) * ${(config.visualHalfWidth * 2).toFixed(3)}, vWaterWorld.y, waterFord);
  float visualEdgeDist = max(0.0, ${config.visualHalfWidth.toFixed(3)} - abs(riverAcross));
  float riverDist = max(0.0, ${config.riverHalfWidth.toFixed(3)} - abs(riverAcross));
  float fordBand = max(waterFord, ${config.openSea ? '0.0' : fordBandExpression(config.fordCenters ?? [0], config.fordHalfWidth)});
  float channelDepth = mix(waterWadeDepth * 0.5, waterRiverDepth, smoothstep(0.05, ${config.riverHalfWidth.toFixed(3)}, riverDist));
  float declaredDepth = mix(channelDepth, waterFordDepth, fordBand);
  float depth = smoothstep(max(0.001, waterWadeDepth), max(waterWadeDepth + 0.001, waterDeepDepth), declaredDepth);
  float bedShore = 1.0;
${config.bedDepth ? `  float bedMetres = texture2D(waterBedMap, vWaterUv).r * waterBedDeep;
  // The carved channel owns the depth read; the ford keeps the tile's DECLARED
  // depth so a crossing the sim calls water never renders as dry ground.
  depth = mix(clamp(bedMetres / waterBedDeep, 0.0, 1.0), depth, fordBand);
  bedShore = max(smoothstep(0.0, waterBedShore, bedMetres), fordBand);` : ''}
  float rippleFreq = mix(1.05, 2.45, lengthNoise);
  float rippleAmp = mix(0.06, 0.17, crossNoise) * ${(config.rippleStrength ?? 1).toFixed(2)};
  float ripple = ${config.openSea
    ? '(sin(vWaterWorld.x * 2.4 + vWaterWorld.y * 0.9 + sin(vWaterWorld.y * 0.32 - waterTime * 0.6) * 0.8 - waterTime * 2.0) * 0.72 + sin(vWaterWorld.x * 4.1 - vWaterWorld.y * 1.3 + phaseWarp - waterTime * 3.1) * 0.28)'
    : 'sin(vWaterWorld.x * rippleFreq + vWaterWorld.y * mix(-0.46, 0.72, crossNoise) + phaseWarp * 4.0 - waterTime * mix(2.1, 4.4, lengthNoise))'} * 0.5 + 0.5;
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
  waterColor = mix(waterColor, ford, fordBand * ${(config.fordTint ?? 0.72).toFixed(3)});
  waterColor += vec3(0.08, 0.10, 0.08) * fineRipple * waterQuality * (1.0 - fordBand) * 0.22 * ${(config.rippleStrength ?? 1).toFixed(2)};
  waterColor = mix(waterColor, vec3(0.92, 0.84, 0.62), bankFoam * 0.58);
  waterColor += vec3(1.0, 0.72, 0.20) * waterGoldGlints(vWaterWorld) * 0.42;
  waterColor = mix(waterColor, baseTexel.rgb, ${(config.textureBlend ?? 0.12).toFixed(3)});
${config.bedDepth ? `  // Sculpt-only. The declared band's foam line sits where the SIM says the bank is;
  // over a carved channel the real edge is wherever the bed comes up, so foam is
  // driven by measured depth.
  float shoreFoam = (1.0 - smoothstep(waterBedShore * 0.125, waterBedShore * 1.625, bedMetres)) * foamNoise * (0.45 + waterQuality * 0.55);
  waterColor = mix(waterColor, vec3(0.94, 0.88, 0.70), shoreFoam * 0.5 * (1.0 - fordBand));` : ''}
${(config.surfaceLift ?? config.bedDepth !== undefined) ? `  // Lift face-on ripples independently of the bed-depth path.
  waterColor += vec3(0.10, 0.11, 0.08) * pow(ripple, 2.0) * waterQuality * (1.0 - fordBand) * ${(config.rippleStrength ?? 1).toFixed(2)};` : ''}
  float alpha = mix(0.74, 0.94, depth);
  alpha = mix(alpha, 0.58, fordBand * ${(config.fordTint ?? 0.72).toFixed(3)});
  alpha = mix(alpha, 0.72, bankFoam * 0.4);
  alpha *= smoothstep(0.0, ${(config.shoreFadeMeters ?? 0.95).toFixed(3)}, visualEdgeDist);
  alpha *= mix(1.0 - smoothstep(${config.fadeStart.toFixed(3)}, ${config.lengthHalf.toFixed(3)}, abs(vWaterWorld.x)), 1.0, waterFord);
  float fordOverlayFade = smoothstep(0.0, 0.18, vWaterUv.x) * (1.0 - smoothstep(0.82, 1.0, vWaterUv.x));
  alpha *= mix(1.0, fordOverlayFade, waterFord);
  // A sculpted shoreline is a depth-buffer intersection, i.e. a razor edge. Fading
  // the last few centimetres of depth turns it into a damp margin instead, and the
  // foam that gathers there stays visible after the water itself has faded out.
  alpha *= bedShore;
${config.bedDepth ? '  alpha = max(alpha, shoreFoam * 0.5 * smoothstep(0.0, 0.05, bedMetres));' : ''}
  vec4 sampledDiffuseColor = vec4(waterColor, alpha);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  if (config.openSea) {
    let disposed = false;
    material.addEventListener('dispose', () => { disposed = true; });
    void loadGeneratedTexture(assetSlots.terrainOpenSea).then((source) => {
      if (!source || disposed) return;
      // Each water surface owns its sampler/disposal; the asset cache owns the source.
      const map = source.clone();
      configureWaterMap(map);
      map.needsUpdate = true;
      material.map?.dispose();
      material.map = map;
      material.needsUpdate = true;
    });
  } else if (!config.ford) void loadGeneratedTexture(assetSlots.terrainRiver);
  return material;
}

export type SculptWaterConfig = WaterMaterialConfig & {
  /** World Y of the water surface — set from the baked sculpt bed, not from WATER_Y. */
  surfaceY: number;
  /** World Z of the band centre (the sim's declared river centre). */
  centerZ: number;
  /** Half length along X. The plane is a single quad; the shader owns the shoreline. */
  halfLength: number;
};

export type SculptWater = {
  mesh: THREE.Mesh;
  advance: (delta: number) => void;
  dispose: () => void;
  /** Deepest metre reading baked into the bed map — evidence for the review board. */
  deepestMeters: number;
};

const BED_MAP_WIDTH = 512;
const BED_MAP_HEIGHT = 64;

/**
 * Bake how deep the water stands over a sculpted bed, in the water plane's own UV
 * space. Red channel, 8-bit: 0 == dry, 255 == `deepMeters` or deeper. 8 bits over
 * half a metre is ~2mm, far finer than the eye reads at the gameplay camera, and
 * an unsigned byte texture is linearly filterable everywhere (a float one is not).
 */
function bakeBedDepth(
  heightAt: (x: number, z: number) => number,
  surfaceY: number,
  halfLength: number,
  centerZ: number,
  visualHalfWidth: number,
  deepMeters: number,
  openSea = false,
): { texture: THREE.DataTexture; deepest: number } {
  const mapHeight = openSea ? BED_MAP_WIDTH : BED_MAP_HEIGHT;
  const data = new Uint8Array(BED_MAP_WIDTH * mapHeight);
  let deepest = 0;
  for (let row = 0; row < mapHeight; row += 1) {
    // Plane geometry rotated -90 deg about X: world z decreases as uv.y grows.
    const z = centerZ - (((row + 0.5) / mapHeight) - 0.5) * visualHalfWidth * 2;
    for (let column = 0; column < BED_MAP_WIDTH; column += 1) {
      const x = (((column + 0.5) / BED_MAP_WIDTH) - 0.5) * halfLength * 2;
      const depth = Math.max(0, surfaceY - heightAt(x, z));
      if (depth > deepest) deepest = depth;
      data[row * BED_MAP_WIDTH + column] = Math.round(THREE.MathUtils.clamp(depth / deepMeters, 0, 1) * 255);
    }
  }
  const texture = new THREE.DataTexture(data, BED_MAP_WIDTH, mapHeight, THREE.RedFormat, THREE.UnsignedByteType);
  texture.name = 'SculptWaterBedDepth';
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return { texture, deepest };
}

/**
 * A render-only living-water surface laid into a SCULPTED channel.
 *
 * The painted river is a ribbon that floats over flat ground with depth testing
 * off; a sculpted map already carries the channel in its terrain mesh, so the
 * water here is one flat quad at the channel's water line with depth testing ON.
 * The banks then occlude it themselves and the shoreline is wherever the sculpt
 * rises through the surface — no shoreline geometry, no second draw call.
 *
 * Rendering only: nothing here is read by the simulation.
 */
export function createSculptWater(config: SculptWaterConfig & {
  heightAt: (x: number, z: number) => number;
  deepMeters: number;
  shoreMeters: number;
  /** False for a flat pan that must use the declared band geometry for depth. */
  bed?: boolean;
}): SculptWater {
  const bed = config.bed === false ? undefined : bakeBedDepth(
    config.heightAt,
    config.surfaceY,
    config.halfLength,
    config.centerZ,
    config.visualHalfWidth,
    config.deepMeters,
    config.openSea,
  );
  const material = createLivingWaterMaterial({
    ...config,
    bedDepth: bed ? { map: bed.texture, deepMeters: config.deepMeters, shoreMeters: config.shoreMeters } : undefined,
  });
  const geometry = new THREE.PlaneGeometry(config.halfLength * 2, config.visualHalfWidth * 2, 1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'SculptLivingWater';
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, config.surfaceY, config.centerZ);
  mesh.renderOrder = RenderLayers.groundDecals;
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.frustumCulled = false;
  mesh.userData.renderOnly = true;
  mesh.userData.visualHalfWidth = config.visualHalfWidth;
  return {
    mesh,
    deepestMeters: bed?.deepest ?? 0,
    advance: (delta: number) => updateWaterMaterial(mesh, delta),
    dispose: () => {
      geometry.dispose();
      bed?.texture.dispose();
      material.map?.dispose();
      material.dispose();
    },
  };
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

/** Fold every declared crossing into one non-additive shader band. */
function fordBandExpression(centers: readonly number[], halfWidth: number): string {
  const near = halfWidth.toFixed(3);
  const far = (halfWidth + 0.9).toFixed(3);
  const terms = (centers.length ? centers : [0]).map((center) => {
    const across = center === 0 ? 'abs(vWaterWorld.x)' : `abs(vWaterWorld.x - ${center.toFixed(3)})`;
    return `1.0 - smoothstep(${near}, ${far}, ${across})`;
  });
  return terms.length === 1 ? terms[0]! : terms.map((term) => `(${term})`).reduce((left, right) => `max(${left}, ${right})`);
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


export type SpringPondSurface = {
  group: THREE.Group;
  waterRadius: number;
  dispose: () => void;
};


type SpringPondConfig = {
  x: number;
  z: number;
  /** Water-line radius in metres — identical to the sim's spring radius. */
  radius: number;
  /** World height of the water plane; the sculpt owns the bank and reed roots. */
  surfaceY: number;
  heightAt: (x: number, z: number) => number;
};


const POND_SURFACE_LIFT = 0.02;


/**
 * ONE LIVE POOL IN A BONE-DRY MAP (brief U1).
 *
 * Render-only: a disc of moving water at a spring the sim already declares, and a few reed tufts; the sculpted terrain owns its bank. Nothing here is read by the
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
  float pondDepth = 1.0 - smoothstep(0.88, 1.0, pondR);
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
  // Keep depth readable while softening only the water silhouette.
  float pondAlpha = mix(0.88, 0.985, pondDepth) * (1.0 - smoothstep(0.96, 1.0, pondR));
  vec4 sampledDiffuseColor = vec4(pondColor, pondAlpha);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };

  const water = new THREE.Mesh(new THREE.CircleGeometry(config.radius, 56), material);
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
    waterRadius: config.radius,
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
    new THREE.MeshStandardMaterial({ color: '#8d8250', roughness: 1, metalness: 0, side: THREE.DoubleSide }),
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
      0,
      config.z + Math.sin(angle) * config.radius * distance,
    );
    anchor.position.y = config.heightAt(anchor.position.x, anchor.position.z);
    anchor.rotation.set(0, angle, 0);
    anchor.scale.setScalar(scale);
    anchor.updateMatrix();
    mesh.setMatrixAt(index, anchor.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}


function reedTuftGeometry(): THREE.BufferGeometry {
  const positions: number[] = [], indices: number[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = i * 2.4, c = Math.cos(angle), s = Math.sin(angle);
    const height = 0.68 + (i % 3) * 0.12, width = 0.05;
    const x = c * 0.065, z = s * 0.065, lean = 0.15 + (i % 2) * 0.08;
    const base = positions.length / 3;
    positions.push(x-width*c,0,z-width*s,x+width*c,0,z+width*s,
      x+lean*c-width*0.6*c,height*0.65,z+lean*s-width*0.6*s,
      x+lean*c+width*0.6*c,height*0.65,z+lean*s+width*0.6*s,
      x+lean*1.8*c,height,z+lean*1.8*s);
    indices.push(base,base+1,base+2,base+2,base+1,base+3,base+2,base+3,base+4);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}


export type WaterRibbonConfig = {
  /** Centreline in world X/Z, read from the sculpt contract's own mask polyline. */
  points: ReadonlyArray<{ x: number; z: number }>;
  halfWidth: number;
  /** Metres the sheet over-reaches its mask band so the sculpt, not the mesh, cuts the waterline. */
  edgeBleed: number;
  surfaceY: number;
  /** Declared depth fed to the shader's wade..deep colour ramp. Render-only. */
  depth: number;
  glints: ReadonlyArray<{ x: number; z: number }>;
  /** Metres yielded to a shared confluence surface at either endpoint. */
  headInset?: number;
  tailInset?: number;
  headFade: number;
  tailFade: number;
  /** The sculpt's sampled bed, matching the depth treatment used by the Claim river. */
  bed?: {
    heightAt: (x: number, z: number) => number;
    deepMeters: number;
    shoreMeters: number;
  };
  name: string;
};


export type WaterFordConfig = {
  pans: ReadonlyArray<{ minX: number; maxX: number; minZ: number; maxZ: number }>;
  halfDepth: number;
  surfaceY: number;
  depth: number;
  name: string;
};


export type WaterConfluenceConfig = {
  paths: ReadonlyArray<ReadonlyArray<{ x: number; z: number; halfWidth: number; alpha: number }>>;
  surfaceY: number;
  depth: number;
  name: string;
};


const RIBBON_EDGE_FADE_METRES = 0.18;


const CONFLUENCE_EDGE_FADE_METRES = 0.45;


const RIBBON_FOAM_INSET_METRES = 0.16;


const RIBBON_TINT = { r: 0.74, g: 1.0, b: 1.18 };


const RIBBON_SEGMENT_METRES = 0.45;


const RIBBON_BED_MAP_WIDTH = 256;


const RIBBON_BED_MAP_HEIGHT = 16;


/**
 * A render-only living-water strip that follows a sculpted channel's own centreline.
 *
 * The mesh is a mitre-joined band of the SAME half-width the sculpt was cut from, laid at
 * the mask's water plane, so it can never cover ground the mask calls dry. Nothing here is
 * simulation: band classification, fords and crossings stay engine truth.
 */
export function createWaterRibbon(config: WaterRibbonConfig): THREE.Mesh {
  const samples = ribbonSamples(config);
  const geometry = ribbonGeometry(config, samples);
  const bedMap = config.bed ? bakeRibbonBedDepth(samples, config, config.bed) : undefined;
  const shaderUnitsPerMetre = 0.95 / RIBBON_EDGE_FADE_METRES;
  const material = createLivingWaterMaterial({
    ford: false,
    // Foam rides the mask's own bank line; the fade rides the bled mesh edge.
    riverHalfWidth: (config.halfWidth - RIBBON_FOAM_INSET_METRES) * shaderUnitsPerMetre,
    visualHalfWidth: (config.halfWidth + config.edgeBleed) * shaderUnitsPerMetre,
    // The ends are shaped by vertex alpha (each channel meets the tile differently), so the
    // shader's symmetric |x| length fade is pushed off the tile instead of fighting it.
    lengthHalf: 512,
    fadeStart: 511,
    // A braid's fords are pans at |x|=16, not a band at x=0: the shared ford tint stays off.
    fordHalfWidth: -1,
    riverDepth: config.depth,
    fordDepth: config.depth,
    wadeDepth: Balance.terrainSim.wadeDepth,
    deepDepth: Balance.terrainSim.deepDepth,
    anchors: [...config.glints],
    opacity: 1,
    textureBlend: 0,
    rippleStrength: 0.34,
    bedDepth: bedMap && config.bed ? {
      map: bedMap,
      deepMeters: config.bed.deepMeters,
      shoreMeters: config.bed.shoreMeters,
    } : undefined,
  });
  // Ribbons ride ON a sculpt: the dry plait between the channels has to occlude the far one.
  // That same depth test is the water's safety law — a ribbon may over-reach its mask band and
  // the sculpt clips it at the exact contour where the bed crosses the water plane, so the
  // waterline is the sculpt's own and water can never be painted onto ground the mask calls dry.
  material.depthTest = true;
  material.depthWrite = false;
  material.vertexColors = true;
  material.color.setRGB(RIBBON_TINT.r, RIBBON_TINT.g, RIBBON_TINT.b, THREE.LinearSRGBColorSpace);
  material.roughness = 0.5;
  // The shared river tiles its flow map 8x along a 64 m band; a 58 m braid channel needs the
  // same ~2.5 m tile or the current smears into one flat sheet. Uniform, not shader source.
  const uniforms = material.userData.waterUniforms as { repeat: THREE.IUniform<number> };
  uniforms.repeat.value = Math.max(4, Math.round(samples[samples.length - 1]!.distance / 2.5));
  if (bedMap) material.addEventListener('dispose', () => bedMap.dispose());
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = config.name;
  mesh.userData.renderOnly = true;
  mesh.userData.visualHalfWidth = config.halfWidth;
  mesh.renderOrder = RenderLayers.groundDecals;
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.frustumCulled = false;
  return mesh;
}


/** One shared surface where the two braid branches rejoin and leave the tile. */
export function createWaterConfluence(config: WaterConfluenceConfig): THREE.Mesh {
  const geometry = confluenceGeometry(config);
  const maxWidth = Math.max(...config.paths.flatMap((path) => path.map((point) => point.halfWidth)));
  const shaderUnitsPerMetre = 0.95 / CONFLUENCE_EDGE_FADE_METRES;
  const material = createLivingWaterMaterial({
    ford: false,
    riverHalfWidth: (maxWidth - RIBBON_FOAM_INSET_METRES) * shaderUnitsPerMetre,
    visualHalfWidth: maxWidth * shaderUnitsPerMetre,
    lengthHalf: 512,
    fadeStart: 511,
    fordHalfWidth: -1,
    riverDepth: config.depth,
    fordDepth: config.depth,
    wadeDepth: Balance.terrainSim.wadeDepth,
    deepDepth: Balance.terrainSim.deepDepth,
    anchors: [],
    depthTest: false,
    opacity: 1,
    textureBlend: 0,
    rippleStrength: 0.26,
  });
  material.vertexColors = true;
  material.depthWrite = false;
  material.color.setRGB(RIBBON_TINT.r, RIBBON_TINT.g, RIBBON_TINT.b, THREE.LinearSRGBColorSpace);
  material.roughness = 0.46;
  const uniforms = material.userData.waterUniforms as { repeat: THREE.IUniform<number> };
  uniforms.repeat.value = Math.max(4, Math.round(Math.max(...config.paths.map(centrelineLength)) / 2.5));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = config.name;
  mesh.userData.renderOnly = true;
  mesh.renderOrder = RenderLayers.groundDecals;
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.frustumCulled = false;
  return mesh;
}


/**
 * The shallow sheet over a mask's ford rects — the crossing a player reads before stepping.
 *
 * One mesh for every pan on the tile, carrying the shipped ford water config, so a braid's
 * crossings read wet-but-passable instead of brown gravel with a stripe of river through them.
 * Depth-tested like the channel ribbons: the sculpt cuts the waterline, not this geometry.
 */
export function createFordSheet(config: WaterFordConfig): THREE.Mesh {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (const pan of config.pans) {
    const base = positions.length / 3;
    for (const [x, z] of [[pan.minX, pan.minZ], [pan.maxX, pan.minZ], [pan.minX, pan.maxZ], [pan.maxX, pan.maxZ]] as const) {
      positions.push(x, config.surfaceY, z);
      uvs.push((x - pan.minX) / Math.max(0.001, pan.maxX - pan.minX), (z - pan.minZ) / Math.max(0.001, pan.maxZ - pan.minZ));
    }
    indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  // The ford branch of the shared shader already does what a pan needs: it reads across in WORLD
  // z (so visualHalfWidth is the pan's own half-depth) and fades the sheet at both ends of its uv
  // span, which is how the shipped centre ford stops dead against dry gravel.
  const material = createLivingWaterMaterial({
    ford: true,
    riverHalfWidth: config.halfDepth * 0.72,
    visualHalfWidth: config.halfDepth,
    lengthHalf: 512,
    fadeStart: 511,
    fordHalfWidth: config.halfDepth,
    riverDepth: config.depth,
    fordDepth: config.depth,
    wadeDepth: Balance.terrainSim.wadeDepth,
    deepDepth: Balance.terrainSim.deepDepth,
    anchors: [],
  });
  material.color.setRGB(RIBBON_TINT.r, RIBBON_TINT.g, RIBBON_TINT.b, THREE.LinearSRGBColorSpace);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = config.name;
  mesh.userData.renderOnly = true;
  mesh.renderOrder = RenderLayers.groundDecals;
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.frustumCulled = false;
  return mesh;
}


type RibbonSample = { x: number; z: number; nx: number; nz: number; distance: number };


function ribbonSamples(config: WaterRibbonConfig): RibbonSample[] {
  const controls = config.points.map((point) => ({ ...point }));
  const divisions = Math.max(2, Math.ceil(centrelineLength(controls) / RIBBON_SEGMENT_METRES));
  const points = controls.length === 2
    ? Array.from({ length: divisions + 1 }, (_, index) => ({
        x: lerp(controls[0]!.x, controls[1]!.x, index / divisions),
        z: lerp(controls[0]!.z, controls[1]!.z, index / divisions),
      }))
    : new THREE.CatmullRomCurve3(
        controls.map((point) => new THREE.Vector3(point.x, 0, point.z)),
        false,
        'centripetal',
      ).getSpacedPoints(divisions).map((point) => ({ x: point.x, z: point.z }));
  let distance = 0;
  const samples = points.map((point, index) => {
    if (index > 0) distance += Math.hypot(point.x - points[index - 1]!.x, point.z - points[index - 1]!.z);
    const before = points[Math.max(0, index - 1)]!;
    const after = points[Math.min(points.length - 1, index + 1)]!;
    const length = Math.hypot(after.x - before.x, after.z - before.z) || 1;
    return { x: point.x, z: point.z, nx: -(after.z - before.z) / length, nz: (after.x - before.x) / length, distance };
  });
  const end = samples[samples.length - 1]!.distance - (config.tailInset ?? 0);
  const trimmed = samples.filter((sample) => sample.distance >= (config.headInset ?? 0) && sample.distance <= end);
  const start = trimmed[0]?.distance ?? 0;
  return trimmed.map((sample) => ({ ...sample, distance: sample.distance - start }));
}


function ribbonGeometry(config: WaterRibbonConfig, samples: readonly RibbonSample[]): THREE.BufferGeometry {
  const total = samples[samples.length - 1]!.distance || 1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  for (const sample of samples) {
    const alpha = Math.min(
      config.headFade > 0 ? smoothstep(0, config.headFade, sample.distance) : 1,
      config.tailFade > 0 ? smoothstep(0, config.tailFade, total - sample.distance) : 1,
    );
    for (const side of [1, -1]) {
      const reach = (config.halfWidth + config.edgeBleed) * side;
      positions.push(sample.x + sample.nx * reach, config.surfaceY, sample.z + sample.nz * reach);
      uvs.push(sample.distance / total, side > 0 ? 0 : 1);
      colors.push(1, 1, 1, alpha);
    }
  }
  // Wound so the face normal is +Y: each row is [+offset, -offset] and the material is single-sided.
  for (let row = 0; row < samples.length - 1; row += 1) {
    const a = row * 2;
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}


function confluenceGeometry(config: WaterConfluenceConfig): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  for (const path of config.paths) {
    const base = positions.length / 3;
    const distances = path.map((point, index) => index === 0 ? 0 : Math.hypot(point.x - path[index - 1]!.x, point.z - path[index - 1]!.z));
    for (let index = 1; index < distances.length; index += 1) distances[index] += distances[index - 1]!;
    const total = distances[distances.length - 1] || 1;
    for (let index = 0; index < path.length; index += 1) {
      const point = path[index]!;
      const before = path[Math.max(0, index - 1)]!;
      const after = path[Math.min(path.length - 1, index + 1)]!;
      const length = Math.hypot(after.x - before.x, after.z - before.z) || 1;
      const nx = -(after.z - before.z) / length;
      const nz = (after.x - before.x) / length;
      for (const side of [1, -1]) {
        positions.push(point.x + nx * point.halfWidth * side, config.surfaceY, point.z + nz * point.halfWidth * side);
        uvs.push(distances[index]! / total, side > 0 ? 0 : 1);
        colors.push(1, 1, 1, point.alpha);
      }
    }
    for (let row = 0; row < path.length - 1; row += 1) {
      const a = base + row * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}


function bakeRibbonBedDepth(
  samples: readonly RibbonSample[],
  config: WaterRibbonConfig,
  bed: NonNullable<WaterRibbonConfig['bed']>,
): THREE.DataTexture {
  const data = new Uint8Array(RIBBON_BED_MAP_WIDTH * RIBBON_BED_MAP_HEIGHT);
  const reach = config.halfWidth + config.edgeBleed;
  for (let column = 0; column < RIBBON_BED_MAP_WIDTH; column += 1) {
    const sampleIndex = ((column + 0.5) / RIBBON_BED_MAP_WIDTH) * (samples.length - 1);
    const before = samples[Math.floor(sampleIndex)]!;
    const after = samples[Math.min(samples.length - 1, Math.ceil(sampleIndex))]!;
    const mix = sampleIndex - Math.floor(sampleIndex);
    const x = lerp(before.x, after.x, mix);
    const z = lerp(before.z, after.z, mix);
    const nx = lerp(before.nx, after.nx, mix);
    const nz = lerp(before.nz, after.nz, mix);
    const normalLength = Math.hypot(nx, nz) || 1;
    for (let row = 0; row < RIBBON_BED_MAP_HEIGHT; row += 1) {
      const side = 1 - ((row + 0.5) / RIBBON_BED_MAP_HEIGHT) * 2;
      const depth = Math.max(0, config.surfaceY - bed.heightAt(x + (nx / normalLength) * reach * side, z + (nz / normalLength) * reach * side));
      data[row * RIBBON_BED_MAP_WIDTH + column] = Math.round(THREE.MathUtils.clamp(depth / bed.deepMeters, 0, 1) * 255);
    }
  }
  const texture = new THREE.DataTexture(data, RIBBON_BED_MAP_WIDTH, RIBBON_BED_MAP_HEIGHT, THREE.RedFormat, THREE.UnsignedByteType);
  texture.name = `${config.name}.BedDepth`;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}


function centrelineLength(points: ReadonlyArray<{ x: number; z: number }>): number {
  return points.reduce((total, point, index) => (index === 0 ? 0 : total + Math.hypot(point.x - points[index - 1]!.x, point.z - points[index - 1]!.z)), 0);
}


function lerp(from: number, to: number, mix: number): number {
  return from + (to - from) * mix;
}


function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
