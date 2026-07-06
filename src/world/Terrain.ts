import * as THREE from 'three';
import terrainContractText from '../../assets/layer-contracts/m1-core.layer-contract.v1.json?raw';
import { applyGeneratedMap, loadGeneratedTexture } from '../assets/generated';
import { palette } from '../assets/palette';
import { assetSlots, tagPlaceholder, type PlaceholderFactory } from '../assets/slots';
import { Balance } from '../game/Balance';
import { normalizeSeed } from '../core/Rng';
import { createClaimProps } from './props';

export type TerrainZone = 'bank' | 'shallows' | 'river' | 'ford' | 'out';

export type Vec2 = {
  x: number;
  z: number;
};

export type TerrainSample = {
  walkable: boolean;
  speedMul: number;
  zone: TerrainZone;
};

export type TerrainBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export const CLAIM_SIZE = 64;
export const CLAIM_HALF = CLAIM_SIZE / 2;
export const RIVER_MIN_Z = -5;
export const RIVER_MAX_Z = 5;
export const FORD_MIN_X = -3;
export const FORD_MAX_X = 3;
export const SHALLOWS_WIDTH = 1.25;
export const WATER_Y = 0.025;

export const bounds: TerrainBounds = {
  minX: -CLAIM_HALF,
  maxX: CLAIM_HALF,
  minZ: -CLAIM_HALF,
  maxZ: CLAIM_HALF,
};

export const nodeAnchors: Vec2[] = [
  { x: -22, z: -6.8 },
  { x: -9, z: 6.7 },
  { x: -1.5, z: -6.4 },
  { x: 7.5, z: 6.5 },
  { x: 18, z: -7 },
  { x: 25, z: 6.9 },
];

export function sample(x: number, z: number): TerrainSample {
  if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) {
    return { walkable: false, speedMul: 0, zone: 'out' };
  }

  const inFord = x >= FORD_MIN_X && x <= FORD_MAX_X && z >= RIVER_MIN_Z && z <= RIVER_MAX_Z;
  if (inFord) return { walkable: true, speedMul: 0.85, zone: 'ford' };

  const inRiver = z >= RIVER_MIN_Z && z <= RIVER_MAX_Z;
  if (inRiver) return { walkable: true, speedMul: 0.55, zone: 'river' };

  const inShallows =
    (z > RIVER_MAX_Z && z <= RIVER_MAX_Z + SHALLOWS_WIDTH) ||
    (z < RIVER_MIN_Z && z >= RIVER_MIN_Z - SHALLOWS_WIDTH);
  if (inShallows) return { walkable: true, speedMul: 0.8, zone: 'shallows' };

  return { walkable: true, speedMul: 1, zone: 'bank' };
}

export function spawnEdges(): Vec2[] {
  return [
    { x: 0, z: bounds.minZ },
    { x: 0, z: bounds.maxZ },
    { x: bounds.maxX, z: 0 },
    { x: bounds.minX, z: 0 },
  ];
}

export function isBuildable(x: number, z: number): boolean {
  return sample(x, z).zone === 'bank';
}

export function riverGeometry(): { minX: number; maxX: number; minZ: number; maxZ: number } {
  return {
    minX: bounds.minX,
    maxX: bounds.maxX,
    minZ: RIVER_MIN_Z,
    maxZ: RIVER_MAX_Z,
  };
}

export function sampleHeight(x: number, z: number): number {
  const clampedX = THREE.MathUtils.clamp(x, bounds.minX, bounds.maxX);
  const clampedZ = THREE.MathUtils.clamp(z, bounds.minZ, bounds.maxZ);
  const absZ = Math.abs(clampedZ);
  const bankDistance = Math.max(0, absZ - RIVER_MAX_Z);
  const bankT = smoothstep(0, 15, bankDistance);
  const valley = THREE.MathUtils.lerp(-0.16, 0.36, bankT);
  const southRise = clampedZ < RIVER_MIN_Z ? smoothstep(0, CLAIM_HALF - Math.abs(RIVER_MIN_Z), Math.abs(clampedZ) - Math.abs(RIVER_MIN_Z)) * 0.14 : 0;
  const claimCalm =
    clampedZ > RIVER_MAX_Z + SHALLOWS_WIDTH && clampedZ < 23 && Math.abs(clampedX) < 24
      ? THREE.MathUtils.lerp(0.42, 1, smoothstep(0, 24, Math.abs(clampedX)))
      : 1;
  const riverNoiseMask = THREE.MathUtils.lerp(0.28, 1, smoothstep(RIVER_MAX_Z - 0.5, RIVER_MAX_Z + 4, absZ));
  const noise =
    (valueNoise(clampedX * 0.065, clampedZ * 0.065) - 0.5) * 0.32 +
    (valueNoise(clampedX * 0.17 + 41.7, clampedZ * 0.17 - 13.2) - 0.5) * 0.16 +
    (valueNoise(clampedX * 0.34 - 9.1, clampedZ * 0.34 + 27.4) - 0.5) * 0.06;
  return THREE.MathUtils.clamp((valley + southRise + noise * claimCalm * riverNoiseMask) * Balance.world.terrainRelief, -0.18, 0.62);
}

export function samplePaddedHeight(x: number, z: number, radius = 0): number {
  if (radius <= 0.01) return sampleHeight(x, z);
  const r = Math.max(0.25, radius * 0.65);
  return (
    sampleHeight(x, z) * 2 +
    sampleHeight(x - r, z) +
    sampleHeight(x + r, z) +
    sampleHeight(x, z - r) +
    sampleHeight(x, z + r)
  ) / 6;
}

export function visualY(x: number, z: number, base = 0, padRadius = 0): number {
  return samplePaddedHeight(x, z, padRadius) + base;
}

export function heightDiagnostics(): {
  min: number;
  max: number;
  segments: number;
  waterY: number;
  probes: Record<string, number>;
} {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let z = bounds.minZ; z <= bounds.maxZ; z += 8) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 8) {
      const height = sampleHeight(x, z);
      min = Math.min(min, height);
      max = Math.max(max, height);
    }
  }
  return {
    min,
    max,
    segments: terrainSegments(),
    waterY: WATER_Y,
    probes: {
      heroStart: sampleHeight(0, 12),
      river: sampleHeight(-12, 0),
      ford: sampleHeight(0, 0),
      nearBank: sampleHeight(12, RIVER_MAX_Z + SHALLOWS_WIDTH),
      farBank: sampleHeight(12, -18),
    },
  };
}

export type TerrainView = {
  group: THREE.Group;
  update: (delta: number) => void;
};

type LayerContract = {
  slots?: Array<{
    file?: string;
    slot?: string;
    variants?: string[];
  }>;
};

type TerrainShaderUniforms = {
  repeat: THREE.IUniform<number>;
  variantCount: THREE.IUniform<number>;
  atlasRows: THREE.IUniform<number>;
  featureMix: THREE.IUniform<number>;
  seed: THREE.IUniform<number>;
};

const BANK_TILE_REPEATS = 4;
const BANK_VARIANT_FILES = terrainBankVariantFiles();
// Lazy glob (NOT eager): eager would compile to static imports of every
// processed png, making each one a boot-time module dependency in dev — a
// single failed/blocked asset request would then kill the whole app instead
// of falling back to placeholders (gate finding, s11: visual-polish-assets
// fallback test). Lazy keeps asset fetches out of the module graph.
const processedTextureUrls = import.meta.glob<string>('../../assets/processed/*.png', {
  query: '?url',
  import: 'default',
});
const processedTextureUrlsByFile = new Map(
  Object.entries(processedTextureUrls).map(([path, urlLoader]) => [path.split('/').pop() ?? path, urlLoader]),
);
const textureLoader = new THREE.TextureLoader();

const bankMaterial = new THREE.MeshStandardMaterial({
  color: palette.sand,
  roughness: 0.86,
  metalness: 0.01,
});

const riverMaterial = new THREE.MeshStandardMaterial({
  color: '#4f7f86',
  transparent: true,
  opacity: 0.88,
  roughness: 0.42,
  metalness: 0.02,
});

const fordMaterial = new THREE.MeshStandardMaterial({
  color: '#7fa3a4',
  transparent: true,
  opacity: 0.72,
  roughness: 0.5,
  metalness: 0.01,
});

export const createBankPlaceholder: PlaceholderFactory<THREE.Mesh> = Object.assign(
  () => {
    const mesh = new THREE.Mesh(createBankGeometry(), createBankMaterial());
    mesh.name = 'TerrainReliefMesh';
    mesh.userData.terrainRelief = true;
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return tagPlaceholder(mesh, assetSlots.terrainBank);
  },
  { slotId: assetSlots.terrainBank },
);

export const createRiverPlaceholder: PlaceholderFactory<THREE.Mesh> = Object.assign(
  () => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CLAIM_SIZE, RIVER_MAX_Z - RIVER_MIN_Z, 1, 1), riverMaterial.clone());
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = WATER_Y;
    mesh.receiveShadow = true;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.map = createRiverTexture(false);
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(8, 1);
    applyGeneratedMap(material, assetSlots.terrainRiver, (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, 1);
    });
    return tagPlaceholder(mesh, assetSlots.terrainRiver);
  },
  { slotId: assetSlots.terrainRiver },
);

export const createFordPlaceholder: PlaceholderFactory<THREE.Mesh> = Object.assign(
  () => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(FORD_MAX_X - FORD_MIN_X, RIVER_MAX_Z - RIVER_MIN_Z, 1, 1), fordMaterial.clone());
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = WATER_Y + 0.015;
    mesh.receiveShadow = true;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.map = createRiverTexture(true);
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(1, 1);
    return tagPlaceholder(mesh, assetSlots.terrainFord);
  },
  { slotId: assetSlots.terrainFord },
);

export function createTerrainView(): TerrainView {
  const group = new THREE.Group();
  const bank = createBankPlaceholder();
  const river = createRiverPlaceholder();
  const ford = createFordPlaceholder();
  const props = createClaimProps();
  for (const prop of props.children) prop.position.y = visualY(prop.position.x, prop.position.z, 0, 0.7);
  group.add(bank, river, ford, props);

  return {
    group,
    update: (delta: number) => {
      syncBankMaterial(bank);
      scrollMap(river, delta * 0.025);
      scrollMap(ford, delta * 0.012);
    },
  };
}

function scrollMap(mesh: THREE.Mesh, amount: number): void {
  const map = (mesh.material as THREE.MeshStandardMaterial).map;
  if (map) map.offset.x = (map.offset.x + amount) % 1;
}

function createBankMaterial(): THREE.MeshStandardMaterial {
  const material = bankMaterial.clone();
  const uniforms: TerrainShaderUniforms = {
    repeat: { value: BANK_TILE_REPEATS },
    variantCount: { value: 1 },
    atlasRows: { value: 1 },
    featureMix: { value: Balance.terrain.featureMix },
    seed: { value: terrainSeed() },
  };
  material.map = createBankTexture();
  configureBankAtlas(material.map);
  material.userData.terrainUniforms = uniforms;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.terrainRepeat = uniforms.repeat;
    shader.uniforms.terrainVariantCount = uniforms.variantCount;
    shader.uniforms.terrainAtlasRows = uniforms.atlasRows;
    shader.uniforms.terrainFeatureMix = uniforms.featureMix;
    shader.uniforms.terrainSeed = uniforms.seed;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vTerrainUv;\nvarying vec2 vTerrainWorld;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvTerrainUv = uv;\nvTerrainWorld = (modelMatrix * vec4(position, 1.0)).xz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float terrainRepeat;
uniform float terrainVariantCount;
uniform float terrainAtlasRows;
uniform float terrainFeatureMix;
uniform float terrainSeed;
varying vec2 vTerrainUv;
varying vec2 vTerrainWorld;

float terrainHash(vec2 p) {
  p += terrainSeed * vec2(37.2, 19.7);
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float terrainValueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = terrainHash(i);
  float b = terrainHash(i + vec2(1.0, 0.0));
  float c = terrainHash(i + vec2(0.0, 1.0));
  float d = terrainHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 terrainOrientUv(vec2 tileUv, vec2 cell) {
  if (terrainHash(cell + vec2(11.0, 3.0)) < 0.5) tileUv.x = 1.0 - tileUv.x;
  float rotation = floor(terrainHash(cell + vec2(5.0, 17.0)) * 4.0);
  if (rotation < 0.5) return tileUv;
  if (rotation < 1.5) return vec2(tileUv.y, 1.0 - tileUv.x);
  if (rotation < 2.5) return vec2(1.0 - tileUv.x, 1.0 - tileUv.y);
  return vec2(1.0 - tileUv.y, tileUv.x);
}

float terrainVariant(vec2 cell, vec2 salt) {
  float variantCount = max(1.0, terrainVariantCount);
  return min(floor(terrainHash(cell + salt) * variantCount), variantCount - 1.0);
}`)
      .replace('#include <map_pars_fragment>', `#include <map_pars_fragment>
vec4 terrainAtlasSample(vec2 tileUv, float variant) {
  float atlasRow = max(1.0, terrainAtlasRows) - 1.0 - variant;
  vec2 atlasUv = vec2(tileUv.x, (clamp(tileUv.y, 0.001, 0.999) + atlasRow) / max(1.0, terrainAtlasRows));
  return texture2D(map, atlasUv);
}`)
      .replace('#include <map_fragment>', `
#ifdef USE_MAP
  vec2 repeatedUv = vTerrainUv * terrainRepeat;
  vec2 terrainCell = floor(repeatedUv);
  vec2 jitter = vec2(
    terrainHash(terrainCell + vec2(71.0, 19.0)),
    terrainHash(terrainCell + vec2(13.0, 83.0))
  ) - 0.5;
  vec2 tileUv = terrainOrientUv(fract(repeatedUv + jitter * 0.18), terrainCell);
  vec4 packedSand = terrainAtlasSample(tileUv, terrainVariant(terrainCell, vec2(23.0, 29.0)));
  vec4 dryDirt = terrainAtlasSample(terrainOrientUv(fract(repeatedUv * 0.73 + jitter * 0.11), terrainCell + vec2(3.0, 7.0)), terrainVariant(terrainCell, vec2(43.0, 61.0)));
  vec4 scrub = terrainAtlasSample(terrainOrientUv(fract(repeatedUv * 1.21 - jitter * 0.13), terrainCell + vec2(11.0, 5.0)), terrainVariant(terrainCell, vec2(89.0, 31.0)));
  float dirtBlend = smoothstep(0.22, 0.78, terrainValueNoise(vTerrainWorld * 0.075 + terrainSeed * 17.0));
  float shoreDistance = max(0.0, abs(vTerrainWorld.y) - 5.0);
  float shoreBand = 1.0 - smoothstep(1.1, 8.0, shoreDistance);
  float scrubBlend = shoreBand * smoothstep(0.42, 0.88, terrainValueNoise(vTerrainWorld * 0.22 + terrainSeed * 31.0));
  vec4 sampledDiffuseColor = mix(packedSand, dryDirt, dirtBlend * 0.48);
  sampledDiffuseColor = mix(sampledDiffuseColor, scrub, scrubBlend * 0.24);
  sampledDiffuseColor.rgb = mix(vec3(1.0), sampledDiffuseColor.rgb, clamp(terrainFeatureMix, 0.0, 1.0));
  float macro = terrainValueNoise(vTerrainUv * 2.15 + terrainSeed * 11.0) * 2.0 - 1.0;
  vec3 macroTint = vec3(
    1.0 + macro * 0.052 + max(macro, 0.0) * 0.008,
    1.0 + macro * 0.038,
    1.0 + macro * 0.026 - max(macro, 0.0) * 0.010
  );
  sampledDiffuseColor.rgb *= macroTint * mix(vec3(1.0), vec3(0.92, 1.0, 0.86), scrubBlend * 0.18);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  void loadBankVariantAtlas().then((atlas) => {
    if (!atlas) return;
    // Do NOT resize the live map's backing canvas: three.js allocates immutable
    // texture storage at first upload, so a grown canvas dies in texSubImage2D
    // (GL_INVALID_VALUE, s12 probe) and the GPU silently keeps the old content.
    // Swap in a fresh CanvasTexture sized to the atlas instead.
    const atlasTexture = new THREE.CanvasTexture(atlas.canvas);
    configureBankAtlas(atlasTexture);
    const previous = material.map;
    material.map = atlasTexture;
    material.needsUpdate = true;
    if (previous && previous !== atlasTexture) previous.dispose();
    uniforms.variantCount.value = atlas.variantCount;
    uniforms.atlasRows.value = atlas.rows;
  });
  return material;
}

function createBankGeometry(): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(CLAIM_SIZE, CLAIM_SIZE, terrainSegments(), terrainSegments());
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = -positions.getY(index);
    positions.setZ(index, sampleHeight(x, z));
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function terrainSegments(): number {
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 430;
  const value = mobile ? Balance.world.terrainMobileSegments : Balance.world.terrainSegments;
  return Math.max(24, Math.min(96, Math.floor(value)));
}

function syncBankMaterial(mesh: THREE.Mesh): void {
  const uniforms = (mesh.material as THREE.MeshStandardMaterial).userData.terrainUniforms as TerrainShaderUniforms | undefined;
  if (uniforms) uniforms.featureMix.value = Balance.terrain.featureMix;
}

async function loadBankVariantAtlas(): Promise<{ canvas: HTMLCanvasElement; variantCount: number; rows: number } | null> {
  const textures: THREE.Texture[] = [];
  for (const file of BANK_VARIANT_FILES) {
    const texture = await loadBankVariantTexture(file);
    if (texture) textures.push(texture);
  }
  if (textures.length === 0) return null;
  return createBankAtlas(textures);
}

function loadBankVariantTexture(file: string): Promise<THREE.Texture | null> {
  if (file === 'terrain-bank-tile.png') return loadGeneratedTexture(assetSlots.terrainBank);
  const urlLoader = processedTextureUrlsByFile.get(file);
  if (!urlLoader) return Promise.resolve(null);
  return urlLoader().then(
    (url) =>
      new Promise<THREE.Texture | null>((resolve) => {
        textureLoader.load(
          url,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 4;
            resolve(texture);
          },
          undefined,
          () => resolve(null),
        );
      }),
    () => null,
  );
}

function createBankAtlas(textures: THREE.Texture[]): { canvas: HTMLCanvasElement; variantCount: number; rows: number } {
  const firstImage = textures[0]?.image as CanvasImageSource | undefined;
  const tileSize = Math.max(1, imageWidth(firstImage), imageHeight(firstImage));
  const rows = nextPowerOfTwo(textures.length);
  const canvas = document.createElement('canvas');
  canvas.width = tileSize;
  canvas.height = tileSize * rows;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create bank atlas context.');

  for (let row = 0; row < rows; row += 1) {
    const image = (textures[Math.min(row, textures.length - 1)]?.image ?? firstImage) as CanvasImageSource | undefined;
    if (image) context.drawImage(image, 0, row * tileSize, tileSize, tileSize);
  }

  return { canvas, variantCount: textures.length, rows };
}

function configureBankAtlas(texture: THREE.Texture): void {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
}

function terrainBankVariantFiles(): string[] {
  try {
    const contract = JSON.parse(terrainContractText) as LayerContract;
    const slot = contract.slots?.find((entry) => entry.slot === assetSlots.terrainBank);
    const files = slot?.variants ?? (slot?.file ? [slot.file] : []);
    return [...new Set(files.filter((file): file is string => typeof file === 'string' && file.length > 0))];
  } catch {
    return ['terrain-bank-tile.png'];
  }
}

function terrainSeed(): number {
  if (typeof window === 'undefined') return 0;
  return normalizeSeed(new URLSearchParams(window.location.search).get('seed')) / 4294967296;
}

function valueNoise(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = smooth01(x - ix);
  const fz = smooth01(z - iz);
  const a = terrainHash(ix, iz);
  const b = terrainHash(ix + 1, iz);
  const c = terrainHash(ix, iz + 1);
  const d = terrainHash(ix + 1, iz + 1);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, fx), THREE.MathUtils.lerp(c, d, fx), fz);
}

function terrainHash(x: number, z: number): number {
  const seed = terrainSeed() * 997.31;
  return fract(Math.sin(x * 127.1 + z * 311.7 + seed) * 43758.5453123);
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  return smooth01(THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1));
}

function smooth01(value: number): number {
  return value * value * (3 - 2 * value);
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function imageWidth(image: CanvasImageSource | undefined): number {
  if (!image) return 512;
  if ('videoWidth' in image) return image.videoWidth;
  if ('displayWidth' in image) return image.displayWidth;
  if ('width' in image) return typeof image.width === 'number' ? image.width : image.width.baseVal.value;
  return 512;
}

function imageHeight(image: CanvasImageSource | undefined): number {
  if (!image) return 512;
  if ('videoHeight' in image) return image.videoHeight;
  if ('displayHeight' in image) return image.displayHeight;
  if ('height' in image) return typeof image.height === 'number' ? image.height : image.height.baseVal.value;
  return 512;
}

function nextPowerOfTwo(value: number): number {
  let power = 1;
  while (power < value) power *= 2;
  return power;
}

function createBankTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create bank texture context.');

  context.fillStyle = palette.sand;
  context.fillRect(0, 0, size, size);
  context.fillStyle = 'rgba(196, 136, 58, 0.12)';
  for (let i = 0; i < 900; i += 1) {
    const x = (i * 71) % size;
    const y = (i * 149) % size;
    context.fillRect(x, y, 1, 1);
  }
  context.strokeStyle = 'rgba(46, 27, 14, 0.13)';
  context.lineWidth = 1;
  for (let y = -size; y < size * 2; y += 18) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(size, y + size * 0.35);
    context.stroke();
  }
  context.fillStyle = 'rgba(91, 122, 83, 0.16)';
  for (let i = 0; i < 32; i += 1) {
    const x = (i * 113) % size;
    const y = (i * 197) % size;
    context.beginPath();
    context.ellipse(x, y, 5, 1.6, (i % 6) * 0.45, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createRiverTexture(shallow: boolean): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create river texture context.');

  context.fillStyle = shallow ? '#7fa3a4' : '#4f7f86';
  context.fillRect(0, 0, size, size);
  context.strokeStyle = shallow ? 'rgba(245, 230, 200, 0.18)' : 'rgba(245, 230, 200, 0.13)';
  context.lineWidth = 1;
  for (let y = 12; y < size; y += 24) {
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= size; x += 24) {
      context.lineTo(x, y + Math.sin(x * 0.06 + y) * 5);
    }
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
