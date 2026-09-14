#!/usr/bin/env node
// GLB CONTRACT GUARD — every production GLB keeps the contract its consumer reads.
//
// WHY (Astra F-ASTRA-8, docs/reviews/2026-09-05-astra-3d-review.md:137): "CI should validate
// transformed bounds, finite attributes, triangle/primitive counts, actual texture dimensions,
// permitted material modes, named anchors, required extras, and external-resource policy."
// Before this guard, the only validators were per-family Blender scripts
// (assets/pilots/map-rebuild-spike/verify_*.py) that need Blender, cover one family each, and
// are not in any battery. Nothing checked the shipped GLBs.
//
// This guard is NODE-ONLY: it parses each GLB's JSON chunk and decodes POSITION out of the BIN
// chunk. No Blender, no @gltf-transform, no three.js — so it runs inside test:node-guards.
//
// THE CONTRACT TABLE IS NOT DUPLICATED. src/world/Terrain3dClaimPilot.ts imports
// assets/pilots/map-rebuild-spike/*-contract.json with `?raw` and checks meshCount / triangles /
// materialCount / vertices / boundsMeters at load time (validTerrain at :512, validPanorama at
// :521). This guard reads THE SAME JSON FILES and reproduces those runtime metric definitions
// exactly — see metricsFromGltf() for the fidelity notes. One source, two readers.
//
// THE BASELINE IS PAID DOWN, NEVER REGENERATED. glb-contract-guard.baseline.json grandfathers the
// violations that existed when the guard landed. There is deliberately NO --write-baseline flag:
// an entry leaves that file only when a human deletes it because the asset was fixed. A guard that
// can regenerate its own baseline is a guard that reports whatever is true today.

import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, extname, join, matchesGlob, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const GUARD_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(GUARD_DIR, '..');
export const MANIFEST_PATH = resolve(GUARD_DIR, 'asset-diet.manifest.json');
export const BASELINE_PATH = resolve(GUARD_DIR, 'glb-contract-guard.baseline.json');
export const PILOTS_DIR = 'assets/pilots';

// Per-family policy.
//
// TEXTURE CAPS follow F-ASTRA-8's sizing ladder ("tiny props at 256²–512², buildings around 1024²,
// and 2048² terrain only where the gameplay view justifies it"). Assets over their cap are
// grandfathered in the baseline, not waived here.
//
// REQUIRED EXTRAS ARE MEASURED, NOT INVENTED. Each list is the set every asset in that family
// already carries (censused across all 412 production GLBs, 2026-09-05), so the rule starts at zero
// grandfathered entries and reddens the moment a re-export drops them — which is precisely the
// F-ASTRA-8 failure mode (`reexport-pilot.sh:26-28` omits `export_extras=True`). A blanket rule for
// a key only one asset carries would just bank 31 permanent baseline lines and guard nothing:
// `grid_segments` lives on the Claim terrain alone, so it is enforced through the TOPOLOGY check
// below (which every terrain must satisfy) rather than as a required key.
//
// props / town-buildings / town-era-variants / bosses / rail-element / finale carry NO extras at
// all today. Requiring any would be inventing a convention this task has no mandate to set; the
// census column reports the gap instead.
export const FAMILY_POLICY = {
  terrain: { textureCap: 2048, alphaModes: ['OPAQUE'], requireExtras: ['render_only', 'height_socket', 'tile_id'], gridTopology: true },
  panoramas: { textureCap: 2048, alphaModes: ['OPAQUE'], requireExtras: ['render_only', 'panorama', 'panorama_law'] },
  landmarks: { textureCap: 1024, alphaModes: ['OPAQUE', 'MASK', 'BLEND'], requireExtras: ['render_only', 'landmark', 'mount_id', 'map_pack', 'era'] },
  'town-buildings': { textureCap: 1024, alphaModes: ['OPAQUE', 'MASK', 'BLEND'] },
  'town-era-variants': { textureCap: 1024, alphaModes: ['OPAQUE', 'MASK', 'BLEND'] },
  props: { textureCap: 512, alphaModes: ['OPAQUE', 'MASK', 'BLEND'] },
  'rail-element': { textureCap: 512, alphaModes: ['OPAQUE', 'MASK', 'BLEND'] },
  bosses: { textureCap: 1024, alphaModes: ['OPAQUE', 'MASK', 'BLEND'] },
  finale: { textureCap: 1024, alphaModes: ['OPAQUE', 'MASK', 'BLEND'] },
};

// reexport-pilot.sh:15 recognises exactly these anchor-name prefixes; any node so named is a
// contract anchor, and losing it silently unhooks the VFX that mounts there.
export const ANCHOR_PREFIXES = ['steam_anchor_', 'arc_anchor_', 'exhaust_anchor_'];

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;
const COMPONENT = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const COMPONENT_SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const TYPE_COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
const MODE_TRIANGLES = 4;

export function parseGlb(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  if (buffer.byteLength < 12 || view.getUint32(0, true) !== GLB_MAGIC) throw new Error('not a GLB (bad magic)');
  const version = view.getUint32(4, true);
  if (version !== 2) throw new Error(`unsupported GLB version ${version}`);
  let offset = 12;
  let json;
  let bin;
  while (offset + 8 <= buffer.byteLength) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    const body = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === CHUNK_JSON) json = JSON.parse(new TextDecoder().decode(body));
    else if (type === CHUNK_BIN) bin = body;
    offset += 8 + length;
  }
  if (!json) throw new Error('GLB has no JSON chunk');
  return { json, bin, sha256: createHash('sha256').update(buffer).digest('hex') };
}

function accessorData(json, bin, index) {
  const accessor = json.accessors?.[index];
  if (!accessor) throw new Error(`missing accessor ${index}`);
  const components = TYPE_COMPONENTS[accessor.type];
  const Ctor = COMPONENT[accessor.componentType];
  if (!components || !Ctor) throw new Error(`unsupported accessor ${accessor.type}/${accessor.componentType}`);
  if (accessor.sparse) throw new Error('sparse accessors are not supported by this guard');
  const out = new Float64Array(accessor.count * components);
  if (accessor.bufferView === undefined) return { data: out, components, accessor };
  const bufferView = json.bufferViews[accessor.bufferView];
  if (json.buffers[bufferView.buffer]?.uri !== undefined) throw new Error('external buffer');
  if (!bin) throw new Error('GLB has no BIN chunk');
  const elementSize = COMPONENT_SIZE[accessor.componentType] * components;
  const stride = bufferView.byteStride || elementSize;
  const base = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  for (let i = 0; i < accessor.count; i += 1) {
    const at = base + i * stride;
    const slice = new Ctor(bin.buffer.slice(bin.byteOffset + at, bin.byteOffset + at + elementSize));
    for (let c = 0; c < components; c += 1) out[i * components + c] = slice[c];
  }
  return { data: out, components, accessor };
}

function trsMatrix(node) {
  if (node.matrix) return node.matrix.slice();
  const [tx, ty, tz] = node.translation ?? [0, 0, 0];
  const [qx, qy, qz, qw] = node.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale ?? [1, 1, 1];
  const x2 = qx + qx; const y2 = qy + qy; const z2 = qz + qz;
  const xx = qx * x2; const xy = qx * y2; const xz = qx * z2;
  const yy = qy * y2; const yz = qy * z2; const zz = qz * z2;
  const wx = qw * x2; const wy = qw * y2; const wz = qw * z2;
  // Column-major, as glTF stores it.
  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ];
}

function multiply(a, b) {
  const out = new Array(16).fill(0);
  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

function applyMatrix(m, x, y, z) {
  const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
  return [
    (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  ];
}

/** Every node→mesh instantiation in the default scene, with its world matrix. */
export function meshInstances(json) {
  const scene = json.scenes?.[json.scene ?? 0];
  const roots = scene?.nodes ?? [];
  const found = [];
  const walk = (index, parent) => {
    const node = json.nodes[index];
    if (!node) return;
    const world = multiply(parent, trsMatrix(node));
    if (node.mesh !== undefined) found.push({ node, world, mesh: json.meshes[node.mesh] });
    for (const child of node.children ?? []) walk(child, world);
  };
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  for (const root of roots) walk(root, identity);
  return found;
}

function imageSize(bytes) {
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16, false), height: view.getUint32(20, false) };
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: (bytes[offset + 5] << 8) | bytes[offset + 6], width: (bytes[offset + 7] << 8) | bytes[offset + 8] };
      }
      offset += 2 + length;
    }
    return undefined;
  }
  if (bytes.length >= 30 && String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP') {
    const fourCc = String.fromCharCode(...bytes.subarray(12, 16));
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (fourCc === 'VP8 ') return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
    if (fourCc === 'VP8L') {
      const bits = view.getUint32(21, true);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (fourCc === 'VP8X') {
      return { width: (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)) + 1, height: (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) + 1 };
    }
  }
  return undefined;
}

/**
 * Reproduce the runtime metric definitions from src/world/Terrain3dClaimPilot.ts:495-:509 exactly:
 *   meshes    — one per instantiated PRIMITIVE (GLTFLoader makes one THREE.Mesh per primitive)
 *   triangles — floor((index?.count ?? position.count) / 3), summed
 *   materials — distinct materials across those primitives
 *   vertices  — UNIQUE `${x},${y},${z}` position tuples in LOCAL space, summed per mesh
 *   bounds    — Box3 over world-space positions (setFromObject)
 */
export function metricsFromGltf({ json, bin }) {
  const instances = meshInstances(json);
  const materials = new Set();
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let meshes = 0;
  let triangles = 0;
  let vertices = 0;
  let nonFiniteAttributes = 0;
  let nonTriangleModes = 0;

  for (const { world, mesh } of instances) {
    for (const primitive of mesh.primitives ?? []) {
      meshes += 1;
      if ((primitive.mode ?? MODE_TRIANGLES) !== MODE_TRIANGLES) nonTriangleModes += 1;
      if (primitive.material !== undefined) materials.add(primitive.material);
      else materials.add('__default__');

      const positionIndex = primitive.attributes?.POSITION;
      if (positionIndex === undefined) continue;
      const { data, accessor } = accessorData(json, bin, positionIndex);
      const indexCount = primitive.indices !== undefined ? json.accessors[primitive.indices].count : accessor.count;
      triangles += Math.floor(indexCount / 3);

      const unique = new Set();
      for (let i = 0; i < accessor.count; i += 1) {
        const x = data[i * 3];
        const y = data[i * 3 + 1];
        const z = data[i * 3 + 2];
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) { nonFiniteAttributes += 1; continue; }
        // Math.fround: three.js reads these back through a Float32 BufferAttribute, so the string
        // it stringifies is the float32 value. Decoding to Float64 first would weld differently.
        unique.add(`${Math.fround(x)},${Math.fround(y)},${Math.fround(z)}`);
        const [wx, wy, wz] = applyMatrix(world, x, y, z);
        if (wx < min[0]) min[0] = wx; if (wx > max[0]) max[0] = wx;
        if (wy < min[1]) min[1] = wy; if (wy > max[1]) max[1] = wy;
        if (wz < min[2]) min[2] = wz; if (wz > max[2]) max[2] = wz;
      }
      vertices += unique.size;

      for (const [name, index] of Object.entries(primitive.attributes ?? {})) {
        if (name === 'POSITION') continue;
        const { data: values } = accessorData(json, bin, index);
        for (const value of values) if (!Number.isFinite(value)) { nonFiniteAttributes += 1; break; }
      }
    }
  }

  const metrics = {
    meshes,
    primitives: meshes,
    meshNodes: instances.length,
    triangles,
    materials: materials.size,
    vertices,
    bounds: { min, max },
    nonFiniteAttributes,
    nonTriangleModes,
  };
  metrics.grid = gridProbe({ json, bin }, instances, metrics.bounds);
  return metrics;
}

/**
 * Reproduce bakeHeightGrid's installation invariant (Terrain3dClaimPilot.ts:527-:548) EXACTLY:
 * segments = round(sqrt(position.count)) - 1, then every world-space vertex must land on its own
 * cell of the (segments+1)² lattice — no cell twice, no cell empty. F-ASTRA-10: "applying arbitrary
 * Blender decimation or replacing the mesh with a general LOD will fail installation." This is the
 * check that catches that before a player does, and it is why `grid_segments` need not be a
 * required extra: the topology itself is the contract.
 */
function gridProbe({ json, bin }, instances, bounds) {
  if (instances.length !== 1) return { applicable: false, reason: `${instances.length} mesh nodes` };
  const [{ world, mesh }] = instances;
  const primitives = mesh.primitives ?? [];
  if (primitives.length !== 1) return { applicable: false, reason: `${primitives.length} primitives` };
  const positionIndex = primitives[0].attributes?.POSITION;
  if (positionIndex === undefined) return { applicable: false, reason: 'no POSITION' };
  const { data, accessor } = accessorData(json, bin, positionIndex);
  const segments = Math.round(Math.sqrt(accessor.count)) - 1;
  if (segments < 1) return { applicable: false, reason: `sqrt(${accessor.count}) is not a grid` };
  const width = segments + 1;
  const stepX = (bounds.max[0] - bounds.min[0]) / segments;
  const stepZ = (bounds.max[2] - bounds.min[2]) / segments;
  if (!(stepX > 0) || !(stepZ > 0)) return { applicable: true, segments, ok: false, reason: 'degenerate footprint' };
  const seen = new Uint8Array(width * width);
  for (let i = 0; i < accessor.count; i += 1) {
    const [x, , z] = applyMatrix(world, data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
    const column = Math.round((x - bounds.min[0]) / stepX);
    const row = Math.round((z - bounds.min[2]) / stepZ);
    if (column < 0 || column > segments || row < 0 || row > segments) return { applicable: true, segments, ok: false, reason: `vertex ${i} outside the lattice` };
    const cell = row * width + column;
    if (seen[cell]) return { applicable: true, segments, ok: false, reason: `cell ${cell} occupied twice (vertex ${i})` };
    seen[cell] = 1;
  }
  const empty = seen.reduce((count, value) => count + (value ? 0 : 1), 0);
  return { applicable: true, segments, ok: empty === 0, reason: empty ? `${empty} empty cell(s)` : undefined };
}

/** Everything the guard asserts on, in one record per asset. */
export function inspect({ json, bin, sha256 }) {
  const metrics = metricsFromGltf({ json, bin });
  const textures = (json.images ?? []).map((image, index) => {
    if (image.uri !== undefined) return { index, name: image.name, external: image.uri, width: undefined, height: undefined };
    const bufferView = json.bufferViews[image.bufferView];
    const start = bufferView.byteOffset ?? 0;
    const bytes = bin.subarray(start, start + bufferView.byteLength);
    return { index, name: image.name, mimeType: image.mimeType, ...(imageSize(bytes) ?? { width: undefined, height: undefined }) };
  });
  const extras = {};
  for (const node of json.nodes ?? []) Object.assign(extras, node.extras ?? {});
  Object.assign(extras, json.scenes?.[json.scene ?? 0]?.extras ?? {});
  return {
    sha256,
    metrics,
    textures,
    extras,
    anchors: (json.nodes ?? []).filter((node) => node.mesh === undefined && ANCHOR_PREFIXES.some((prefix) => (node.name ?? '').startsWith(prefix))).map((node) => node.name).sort(),
    materials: (json.materials ?? []).map((material) => ({ name: material.name, alphaMode: material.alphaMode ?? 'OPAQUE', doubleSided: material.doubleSided === true })),
    animations: (json.animations ?? []).length,
    skins: (json.skins ?? []).length,
    externalBuffers: (json.buffers ?? []).filter((buffer) => buffer.uri !== undefined).length,
    externalImages: (json.images ?? []).filter((image) => image.uri !== undefined).length,
    extensionsRequired: json.extensionsRequired ?? [],
  };
}

async function filesUnder(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  }))).flat();
}

/**
 * The production GLB list, derived from the SAME manifest scripts/asset-diet.mjs compresses with
 * (scripts/asset-diet.manifest.json). If a GLB is not in a manifest family it does not ship, and
 * this guard does not judge it.
 */
export async function productionAssets(root = REPO_ROOT) {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const all = (await filesUnder(resolve(root, PILOTS_DIR))).filter((file) => extname(file) === '.glb');
  const assets = [];
  for (const file of all) {
    const path = relative(root, file).split('\\').join('/');
    const families = manifest.filter(({ patterns }) => patterns.some((pattern) => matchesGlob(path, pattern)));
    if (families.length > 1) throw new Error(`${path} matches ${families.length} manifest families: ${families.map((f) => f.family)}`);
    if (families.length === 1) assets.push({ path, family: families[0].family });
  }
  return assets.sort((a, b) => (a.path < b.path ? -1 : 1));
}

/** The sibling *-contract.json Terrain3dClaimPilot.ts reads, when the asset has one. */
export async function contractFor(assetPath, root = REPO_ROOT) {
  const landmark = assetPath.match(/^(.*\/landmarks\/([^/]+))\/([^/]+)\.glb$/);
  if (landmark) {
    const path = `${landmark[1]}/${landmark[2]}-landmark-pack-contract.json`;
    const pack = JSON.parse(await readFile(resolve(root, path), 'utf8'));
    const body = pack.assets[landmark[3]];
    if (!body) throw new Error(`${path}: missing body ${landmark[3]}`);
    const { min, max } = body.bounds;
    // Pack bounds are Blender XYZ: Blender Y points opposite game Z.
    return { path: `${path}#${landmark[3]}`, contract: {
      triangles: body.triangles, sha256: body.sha256,
      meshCount: body.meshCount ?? 1, materialCount: body.materialCount ?? 1,
      boundsMeters: { min: [min[0], -max[1], min[2]], max: [max[0], -min[1], max[2]] },
    } };
  }
  const base = assetPath.replace(/\.glb$/, '');
  for (const candidate of [`${base}-contract.json`, `${base.replace(/-terrain$/, '')}-terrain-contract.json`]) {
    try {
      return { path: candidate, contract: JSON.parse(await readFile(resolve(root, candidate), 'utf8')) };
    } catch { /* no sibling contract: not every family publishes one */ }
  }
  return undefined;
}

// Mirrors Terrain3dClaimPilot.ts:302 exactly. A tighter number here would red an asset the game
// happily installs; a looser one would pass an asset the game rejects.
const BOUNDS_EPSILON = 0.03;

export function auditAsset({ path, family, record, contract }) {
  const policy = FAMILY_POLICY[family];
  const violations = [];
  const add = (rule, detail) => violations.push({ path, family, rule, detail });
  const { metrics } = record;

  if (!policy) add('unknown-family', `no policy for family ${family}`);
  if (record.extensionsRequired.length) add('extensions-required', record.extensionsRequired.join(','));
  if (record.externalBuffers) add('external-resource', `${record.externalBuffers} external buffer(s)`);
  if (record.externalImages) add('external-resource', `${record.externalImages} external image(s)`);
  if (metrics.nonFiniteAttributes) add('non-finite-attribute', `${metrics.nonFiniteAttributes} attribute(s) hold NaN/Infinity`);
  if (metrics.nonTriangleModes) add('non-triangle-primitive', `${metrics.nonTriangleModes} primitive(s) are not mode 4`);
  if (metrics.meshes === 0) add('empty-asset', 'no instantiated primitives');

  for (const key of ['min', 'max']) {
    for (const value of metrics.bounds[key]) if (!Number.isFinite(value)) add('non-finite-bounds', `bounds.${key} holds ${value}`);
  }

  for (const texture of record.textures) {
    if (texture.width === undefined) { add('undecodable-texture', `image ${texture.index} (${texture.mimeType ?? texture.external})`); continue; }
    const cap = policy?.textureCap;
    if (cap && (texture.width > cap || texture.height > cap)) add('texture-over-cap', `image ${texture.index} ${texture.width}x${texture.height} > ${cap}`);
  }

  for (const material of record.materials) {
    if (policy && !policy.alphaModes.includes(material.alphaMode)) add('material-alpha-mode', `${material.name}: ${material.alphaMode} not in [${policy.alphaModes}]`);
  }

  // ONE violation per asset, listing every missing key. Both halves matter: a per-key violation
  // would bank 125 baseline lines for the 25 pre-convention landmark packs, and a per-asset key
  // that ignored the detail would silently grandfather the NEXT key to go missing on that asset.
  const missingExtras = (policy?.requireExtras ?? []).filter((key) => record.extras[key] === undefined);
  if (missingExtras.length) add('missing-extra', missingExtras.map((key) => `extras.${key}`).join(' '));

  if (policy?.gridTopology) {
    const { grid } = metrics;
    if (!grid?.applicable) add('grid-topology', `not a single-primitive grid (${grid?.reason})`);
    else if (!grid.ok) add('grid-topology', `${grid.segments}² lattice rejected: ${grid.reason}`);
    else if (record.extras.grid_segments !== undefined && record.extras.grid_segments !== grid.segments) {
      add('grid-segments-mismatch', `extras.grid_segments ${record.extras.grid_segments} != measured ${grid.segments}`);
    }
  }

  // Anchors are only required where a contract names them; nothing else knows what to expect.
  for (const anchor of contract?.contract?.anchors ?? []) {
    if (!record.anchors.includes(anchor)) add('missing-anchor', anchor);
  }

  if (contract) {
    const c = contract.contract;
    if (c.sha256 && record.sha256 !== c.sha256) add('contract-hash', `sha256 ${record.sha256} != ${c.sha256} (${contract.path})`);
    // Water metadata is required by the asset's OWN declared truth, not by family. dry-gulch's
    // waterTruth is a spring pond with no crossing, so demanding a ford_mask there would be noise.
    if (c.waterTruth) {
      if (record.extras.water_mask === undefined) add('missing-extra', `extras.water_mask (contract declares waterTruth, ${contract.path})`);
      if ((c.waterTruth.ford || c.waterTruth.fordPans) && record.extras.ford_mask === undefined) {
        add('missing-extra', `extras.ford_mask (contract declares waterTruth.ford, ${contract.path})`);
      }
    }
    const compare = (label, actual, expected) => {
      if (expected !== undefined && actual !== expected) add('contract-count', `${label}: ${actual} != ${expected} (${contract.path})`);
    };
    compare('meshCount', metrics.meshes, c.meshCount);
    compare('primitiveCount', metrics.primitives, c.primitiveCount);
    compare('materialCount', metrics.materials, c.materialCount);
    compare('vertices', metrics.vertices, c.vertices);
    compare('triangles', metrics.triangles, c.triangles);
    if (c.texture?.width) {
      for (const texture of record.textures) {
        if (texture.width !== undefined && (texture.width !== c.texture.width || texture.height !== c.texture.height)) {
          add('contract-texture', `image ${texture.index} ${texture.width}x${texture.height} != ${c.texture.width}x${c.texture.height} (${contract.path})`);
        }
      }
    }
    if (c.boundsMeters) {
      // The contract stores [X, gameZ, visualY]; the GLB is Y-up, so contract index 1 is world Z
      // and index 2 is world Y — the same swap validTerrain does at Terrain3dClaimPilot.ts:513.
      const expected = { min: [c.boundsMeters.min[0], c.boundsMeters.min[2], c.boundsMeters.min[1]], max: [c.boundsMeters.max[0], c.boundsMeters.max[2], c.boundsMeters.max[1]] };
      for (const key of ['min', 'max']) {
        for (let axis = 0; axis < 3; axis += 1) {
          const delta = Math.abs(metrics.bounds[key][axis] - expected[key][axis]);
          if (!(delta <= BOUNDS_EPSILON)) add('contract-bounds', `${key}[${'xyz'[axis]}] ${metrics.bounds[key][axis].toFixed(6)} vs ${expected[key][axis]} (Δ${delta.toFixed(6)}, ${contract.path})`);
        }
      }
    }
  }

  return violations;
}

/**
 * The baseline key. It carries the DETAIL, not just path+rule, so a grandfathered entry can only
 * ever excuse the exact violation it was written for: a second texture going over cap on an
 * already-baselined asset, or a sixth extra going missing, is a new key and a red board.
 */
export function violationKey({ path, rule, detail }) {
  return `${path}::${rule}::${detail}`;
}

export async function audit({ root = REPO_ROOT, assets, baseline } = {}) {
  const list = assets ?? await productionAssets(root);
  const loadedBaseline = baseline ?? JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
  const grandfathered = new Set(loadedBaseline.grandfathered ?? []);
  const rows = [];
  const violations = [];
  const errors = [];

  for (const { path, family } of list) {
    let record;
    try {
      record = inspect(parseGlb(await readFile(resolve(root, path))));
    } catch (error) {
      errors.push({ path, family, rule: 'unparseable', detail: error.message });
      continue;
    }
    const contract = await contractFor(path, root);
    rows.push({ path, family, record, contract: contract?.path });
    violations.push(...auditAsset({ path, family, record, contract }));
  }

  const all = [...errors, ...violations];
  const live = all.filter((violation) => !grandfathered.has(violationKey(violation)));
  const stale = [...grandfathered].filter((key) => !all.some((violation) => violationKey(violation) === key));
  return { rows, violations: all, live, stale, grandfathered: grandfathered.size };
}

export function census(rows) {
  const families = new Map();
  for (const { family, record } of rows) {
    const entry = families.get(family) ?? { family, assets: 0, triangles: 0, vertices: 0, materials: 0, textures: 0, maxTexture: 0, doubleSided: 0, animations: 0, skins: 0, withExtras: 0, anchors: 0 };
    entry.assets += 1;
    entry.triangles += record.metrics.triangles;
    entry.vertices += record.metrics.vertices;
    entry.materials += record.metrics.materials;
    entry.textures += record.textures.length;
    entry.maxTexture = Math.max(entry.maxTexture, ...record.textures.map((texture) => texture.width ?? 0));
    entry.doubleSided += record.materials.filter((material) => material.doubleSided).length;
    entry.animations += record.animations;
    entry.skins += record.skins;
    entry.withExtras += Object.keys(record.extras).length ? 1 : 0;
    entry.anchors += record.anchors.length;
    families.set(family, entry);
  }
  return [...families.values()].sort((a, b) => (a.family < b.family ? -1 : 1));
}

export function formatCensus(rows) {
  const table = census(rows);
  const header = ['family', 'assets', 'triangles', 'vertices', 'materials', 'textures', 'max tex', 'cap', '2-sided', 'anims', 'skins', 'extras', 'anchors'];
  const body = table.map((entry) => [
    entry.family, entry.assets, entry.triangles.toLocaleString('en-US'), entry.vertices.toLocaleString('en-US'), entry.materials,
    entry.textures, `${entry.maxTexture}²`, `${FAMILY_POLICY[entry.family]?.textureCap ?? '?'}²`, entry.doubleSided, entry.animations, entry.skins, entry.withExtras, entry.anchors,
  ].map(String));
  const totals = ['TOTAL', String(rows.length), table.reduce((sum, e) => sum + e.triangles, 0).toLocaleString('en-US'), table.reduce((sum, e) => sum + e.vertices, 0).toLocaleString('en-US'),
    String(table.reduce((sum, e) => sum + e.materials, 0)), String(table.reduce((sum, e) => sum + e.textures, 0)), '', '',
    String(table.reduce((sum, e) => sum + e.doubleSided, 0)), String(table.reduce((sum, e) => sum + e.animations, 0)), String(table.reduce((sum, e) => sum + e.skins, 0)),
    String(table.reduce((sum, e) => sum + e.withExtras, 0)), String(table.reduce((sum, e) => sum + e.anchors, 0))];
  const widths = header.map((_, column) => Math.max(header[column].length, ...body.map((row) => row[column].length), totals[column].length));
  const line = (cells) => `| ${cells.map((cell, column) => cell.padEnd(widths[column])).join(' | ')} |`;
  return [line(header), `|${widths.map((width) => '-'.repeat(width + 2)).join('|')}|`, ...body.map(line), line(totals)].join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const result = await audit();
  console.log(formatCensus(result.rows));
  console.log(`\n${result.rows.length} production GLBs · ${result.violations.length} violations · ${result.grandfathered} grandfathered · ${result.live.length} live`);
  for (const violation of result.live) console.error(`LIVE ${violation.rule} ${violation.path} — ${violation.detail}`);
  for (const key of result.stale) console.error(`STALE BASELINE ENTRY (asset was fixed — delete this line from the baseline): ${key}`);
  process.exit(result.live.length || result.stale.length ? 1 : 0);
}
