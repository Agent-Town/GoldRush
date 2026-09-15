import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  ANCHOR_PREFIXES,
  BASELINE_PATH,
  FAMILY_POLICY,
  audit,
  auditAsset,
  census,
  contractFor,
  formatCensus,
  inspect,
  metricsFromGltf,
  parseGlb,
  productionAssets,
  violationKey,
} from './glb-contract-guard.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// The corpus audit reads ~850 MB of GLB; run it ONCE and share it across the tests that need it.
let corpus;
const auditCorpus = () => (corpus ??= audit({ root: ROOT }));

/** Build a minimal GLB in memory so the unit tests never depend on a shipped binary. */
function makeGlb(json, bin = new Uint8Array(0)) {
  const encoder = new TextEncoder();
  let jsonBytes = encoder.encode(JSON.stringify(json));
  while (jsonBytes.length % 4) jsonBytes = Uint8Array.from([...jsonBytes, 0x20]);
  let binBytes = bin;
  while (binBytes.length % 4) binBytes = Uint8Array.from([...binBytes, 0]);
  const total = 12 + 8 + jsonBytes.length + (binBytes.length ? 8 + binBytes.length : 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);
  view.setUint32(12, jsonBytes.length, true);
  view.setUint32(16, 0x4e4f534a, true);
  out.set(jsonBytes, 20);
  if (binBytes.length) {
    const at = 20 + jsonBytes.length;
    view.setUint32(at, binBytes.length, true);
    view.setUint32(at + 4, 0x004e4942, true);
    out.set(binBytes, at + 8);
  }
  return Buffer.from(out);
}

/** A single-primitive triangle-soup asset with the given local positions. */
function soup(positions, { extras, material, node, images = [] } = {}) {
  const floats = Float32Array.from(positions.flat());
  const bin = new Uint8Array(floats.buffer.slice(0));
  const bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: bin.byteLength }];
  const json = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: 'Body', mesh: 0, extras, ...node }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: material === undefined ? undefined : 0 }] }],
    materials: material ? [material] : undefined,
    accessors: [{ bufferView: 0, componentType: 5126, count: positions.length, type: 'VEC3' }],
    bufferViews,
    buffers: [{ byteLength: bin.byteLength }],
    images: images.length ? images : undefined,
  };
  return makeGlb(json, bin);
}

test('parseGlb rejects a non-GLB and reads the JSON + BIN chunks of a real one', () => {
  assert.throws(() => parseGlb(Buffer.from('not a glb at all!!')), /not a GLB/);
  const { json, bin } = parseGlb(soup([[0, 0, 0], [1, 0, 0], [0, 1, 0]]));
  assert.equal(json.asset.version, '2.0');
  assert.equal(bin.byteLength, 36);
});

test('metrics reproduce the runtime definitions: triangles, welded vertices, world bounds', () => {
  // Four positions, two of them identical: three.js welds by stringified float32, so vertices = 3.
  const glb = parseGlb(soup([[0, 0, 0], [2, 0, 0], [0, 4, 0], [0, 0, 0]]));
  const metrics = metricsFromGltf(glb);
  assert.equal(metrics.meshes, 1, 'one primitive is one THREE.Mesh');
  assert.equal(metrics.triangles, 1, 'floor(4 / 3)');
  assert.equal(metrics.vertices, 3, 'the duplicated position welds');
  assert.deepEqual(metrics.bounds.min, [0, 0, 0]);
  assert.deepEqual(metrics.bounds.max, [2, 4, 0]);
});

test('bounds are TRANSFORMED bounds: a node translation moves them (F-ASTRA-8)', () => {
  const glb = parseGlb(soup([[0, 0, 0], [1, 0, 0], [0, 1, 0]], { node: { translation: [10, -5, 2] } }));
  const { bounds } = metricsFromGltf(glb);
  assert.deepEqual(bounds.min, [10, -5, 2]);
  assert.deepEqual(bounds.max, [11, -4, 2]);
});

test('a node rotation is applied to the bounds, not ignored', () => {
  // 90° about X (glTF quaternion xyzw) sends +Y to +Z.
  const rotation = [Math.SQRT1_2, 0, 0, Math.SQRT1_2];
  const glb = parseGlb(soup([[0, 0, 0], [0, 2, 0], [1, 0, 0]], { node: { rotation } }));
  const { bounds } = metricsFromGltf(glb);
  assert.ok(Math.abs(bounds.max[2] - 2) < 1e-6, `+Y should land on +Z, got ${bounds.max[2]}`);
  assert.ok(Math.abs(bounds.max[1]) < 1e-6, `nothing should remain at +Y, got ${bounds.max[1]}`);
});

test('non-finite positions are counted, not silently folded into the bounds', () => {
  const glb = parseGlb(soup([[0, 0, 0], [Number.NaN, 0, 0], [1, 1, 1]]));
  const metrics = metricsFromGltf(glb);
  assert.equal(metrics.nonFiniteAttributes, 1);
  assert.deepEqual(metrics.bounds.max, [1, 1, 1], 'the NaN vertex must not enter the bounds');
  const violations = auditAsset({ path: 'x.glb', family: 'props', record: inspect(glb) });
  assert.ok(violations.some((v) => v.rule === 'non-finite-attribute'), JSON.stringify(violations));
});

test('the grid probe accepts a complete lattice and rejects a punctured one', () => {
  const lattice = [];
  for (let z = 0; z < 4; z += 1) for (let x = 0; x < 4; x += 1) lattice.push([x, 0, z]);
  const ok = metricsFromGltf(parseGlb(soup(lattice))).grid;
  assert.equal(ok.applicable, true);
  assert.equal(ok.segments, 3);
  assert.equal(ok.ok, true, ok.reason);

  const punctured = lattice.slice();
  punctured[5] = punctured[4].slice(); // duplicate a cell, leaving another empty
  const bad = metricsFromGltf(parseGlb(soup(punctured))).grid;
  assert.equal(bad.ok, false);
  assert.match(bad.reason, /occupied twice/);
});

test('texture dimensions come from the real image header, and the family cap is enforced', () => {
  // A 1024x2048 PNG header is enough: the guard reads IHDR, it does not decode pixels.
  const png = new Uint8Array(24);
  png.set([0x89, 0x50, 0x4e, 0x47], 0);
  new DataView(png.buffer).setUint32(16, 1024, false);
  new DataView(png.buffer).setUint32(20, 2048, false);
  const floats = Float32Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  const bin = new Uint8Array(floats.byteLength + png.byteLength);
  bin.set(new Uint8Array(floats.buffer), 0);
  bin.set(png, floats.byteLength);
  const json = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    materials: [{ name: 'M', alphaMode: 'OPAQUE' }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: floats.byteLength }, { buffer: 0, byteOffset: floats.byteLength, byteLength: png.byteLength }],
    buffers: [{ byteLength: bin.byteLength }],
    images: [{ name: 'atlas', mimeType: 'image/png', bufferView: 1 }],
  };
  const record = inspect(parseGlb(makeGlb(json, bin)));
  assert.deepEqual({ width: record.textures[0].width, height: record.textures[0].height }, { width: 1024, height: 2048 });
  assert.equal(auditAsset({ path: 'p.glb', family: 'props', record }).filter((v) => v.rule === 'texture-over-cap').length, 1, 'props cap is 512');
  assert.equal(auditAsset({ path: 't.glb', family: 'terrain', record }).filter((v) => v.rule === 'texture-over-cap').length, 0, 'terrain cap is 2048');
});

test('external buffers and images are policy violations', () => {
  const json = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [] }],
    buffers: [{ uri: 'sidecar.bin', byteLength: 4 }],
    images: [{ uri: 'atlas.png' }],
  };
  const violations = auditAsset({ path: 'e.glb', family: 'props', record: inspect(parseGlb(makeGlb(json))) });
  assert.equal(violations.filter((v) => v.rule === 'external-resource').length, 2, JSON.stringify(violations));
});

test('an alpha mode outside the family policy is a violation; a permitted one is not', () => {
  const blend = soup([[0, 0, 0], [1, 0, 0], [0, 1, 0]], { material: { name: 'Glass', alphaMode: 'BLEND' } });
  assert.equal(auditAsset({ path: 'a.glb', family: 'terrain', record: inspect(parseGlb(blend)) }).filter((v) => v.rule === 'material-alpha-mode').length, 1, 'terrain is OPAQUE-only');
  assert.equal(auditAsset({ path: 'a.glb', family: 'props', record: inspect(parseGlb(blend)) }).filter((v) => v.rule === 'material-alpha-mode').length, 0, 'props may blend');
});

test('required extras are reported as ONE violation per asset, listing every missing key', () => {
  const record = inspect(parseGlb(soup([[0, 0, 0], [1, 0, 0], [0, 1, 0]], { extras: { render_only: true } })));
  const missing = auditAsset({ path: 't.glb', family: 'terrain', record }).filter((v) => v.rule === 'missing-extra');
  assert.equal(missing.length, 1);
  assert.equal(missing[0].detail, 'extras.height_socket extras.tile_id');
});

test('the baseline key carries the detail, so a NEW violation on a baselined asset still reds', () => {
  const one = { path: 'a.glb', rule: 'missing-extra', detail: 'extras.x' };
  const two = { path: 'a.glb', rule: 'missing-extra', detail: 'extras.x extras.y' };
  assert.notEqual(violationKey(one), violationKey(two));
});

test('water metadata is required by the asset\'s own contract, never by blanket family rule', () => {
  const record = inspect(parseGlb(soup([[0, 0, 0], [1, 0, 0], [0, 1, 0]], { extras: { render_only: true, height_socket: 'Terrain.visualY', tile_id: 't' } })));
  const dry = auditAsset({ path: 't.glb', family: 'terrain', record, contract: { path: 'c.json', contract: {} } });
  assert.equal(dry.filter((v) => v.detail?.includes('water_mask')).length, 0, 'no waterTruth, no demand');

  const wet = auditAsset({ path: 't.glb', family: 'terrain', record, contract: { path: 'c.json', contract: { waterTruth: { river: {} } } } });
  assert.equal(wet.filter((v) => v.detail?.includes('water_mask')).length, 1);
  assert.equal(wet.filter((v) => v.detail?.includes('ford_mask')).length, 0, 'a waterTruth without a ford asks for no ford_mask');

  const ford = auditAsset({ path: 't.glb', family: 'terrain', record, contract: { path: 'c.json', contract: { waterTruth: { ford: { minX: -3 } } } } });
  assert.equal(ford.filter((v) => v.detail?.includes('ford_mask')).length, 1);
});

test('contract counts and bounds are compared against the sibling JSON the runtime reads', () => {
  const record = inspect(parseGlb(soup([[0, 0, 0], [2, 0, 0], [0, 0, 4]])));
  // boundsMeters is [X, gameZ, visualY]; the GLB is Y-up. Mirrors Terrain3dClaimPilot.ts:513.
  const good = { meshCount: 1, primitiveCount: 1, materialCount: 1, vertices: 3, triangles: 1, boundsMeters: { min: [0, 0, 0], max: [2, 4, 0] } };
  assert.deepEqual(auditAsset({ path: 't.glb', family: 'landmarks', record, contract: { path: 'c.json', contract: good } }).filter((v) => v.rule.startsWith('contract-')), []);

  const wrong = { ...good, vertices: 9, boundsMeters: { min: [0, 0, 0], max: [2, 9, 0] } };
  const bad = auditAsset({ path: 't.glb', family: 'landmarks', record, contract: { path: 'c.json', contract: wrong } });
  assert.ok(bad.some((v) => v.rule === 'contract-count' && v.detail.startsWith('vertices')), JSON.stringify(bad));
  assert.ok(bad.some((v) => v.rule === 'contract-bounds'), JSON.stringify(bad));
});

test('THE CORPUS: every production GLB is clean or explicitly grandfathered', async () => {
  const result = await auditCorpus();
  assert.ok(result.rows.length >= 400, `expected the full production corpus, got ${result.rows.length}`);
  assert.deepEqual(result.live.map((v) => `${v.rule} ${v.path} — ${v.detail}`), [], 'NEW GLB contract violations');
  assert.deepEqual(result.stale, [], 'baseline entries whose violation is gone — delete these lines');
  console.log(`\n${formatCensus(result.rows)}\n${result.rows.length} production GLBs · ${result.violations.length} violations · ${result.grandfathered} grandfathered · ${result.live.length} live`);
}, { timeout: 120_000 });

test('landmark pack records bind the actual bytes, triangles and Blender-coordinate bounds', async () => {
  const path = 'assets/pilots/map-rebuild-spike/landmarks/the-claim/active_headframe.glb';
  const contract = await contractFor(path, ROOT);
  const record = inspect(parseGlb(await readFile(resolve(ROOT, path))));
  assert.ok(contract.path.endsWith('#active_headframe'));
  assert.deepEqual(auditAsset({ path, family: 'landmarks', record, contract }).filter(v => v.rule.startsWith('contract-')), []);
  const changed = { ...record, sha256: 'changed', metrics: { ...record.metrics, triangles: record.metrics.triangles + 1 } };
  const violations = auditAsset({ path, family: 'landmarks', record: changed, contract });
  assert.ok(violations.some(v => v.rule === 'contract-hash'));
  assert.ok(violations.some(v => v.rule === 'contract-count'));
});

test('the census totals every family in the manifest and every family has a policy', async () => {
  const assets = await productionAssets(ROOT);
  const families = new Set(assets.map(({ family }) => family));
  for (const family of families) assert.ok(FAMILY_POLICY[family], `no policy for manifest family ${family}`);
  for (const family of Object.keys(FAMILY_POLICY)) assert.ok(families.has(family), `policy for a family no asset matches: ${family}`);
});

test('the terrain family and the hero carry an export sidecar, and every sidecar is well-formed', async () => {
  const spike = resolve(ROOT, 'assets/pilots/map-rebuild-spike');
  const terrains = (await readdir(spike)).filter((name) => name.endsWith('-terrain.glb'));
  assert.ok(terrains.length >= 30, `expected the terrain family, got ${terrains.length}`);
  const paths = [...terrains.map((name) => resolve(spike, name.replace(/\.glb$/, '.export.json'))), resolve(ROOT, 'assets/pilots/hero-3d/hero-3d.export.json')];
  for (const path of paths) {
    const sidecar = JSON.parse(await readFile(path, 'utf8'));
    assert.ok(['static', 'rigged', 'terrain'].includes(sidecar.profile), `${path}: bad profile ${sidecar.profile}`);
    assert.equal(typeof sidecar.extras, 'boolean', `${path}: extras`);
    assert.equal(typeof sidecar.animations, 'boolean', `${path}: animations`);
    assert.equal(typeof sidecar.applyTransforms, 'boolean', `${path}: applyTransforms`);
    assert.ok(sidecar.selection === 'all' || sidecar.selection === 'meshes+anchors' || Array.isArray(sidecar.selection), `${path}: selection`);
    assert.ok(typeof sidecar.why === 'string' && sidecar.why.length > 40, `${path}: a sidecar states WHY its profile differs`);
  }
  const hero = JSON.parse(await readFile(resolve(ROOT, 'assets/pilots/hero-3d/hero-3d.export.json'), 'utf8'));
  assert.equal(hero.profile, 'rigged');
  assert.equal(hero.animations, true, 'F-ASTRA-8: the hero keeps its walk cycle');
  assert.equal(hero.applyTransforms, false, 'applying the armature modifier would freeze the pose');
  const terrain = JSON.parse(await readFile(resolve(spike, 'the-claim-terrain.export.json'), 'utf8'));
  assert.equal(terrain.extras, true, 'F-ASTRA-8: the terrain keeps height_socket / grid_segments / water metadata');
});

test('reexport-pilot.sh reads the sidecar and leaves the no-sidecar path on the old recipe', async () => {
  const source = await readFile(resolve(ROOT, 'scripts/reexport-pilot.sh'), 'utf8');
  assert.match(source, /\$\{BLEND%\.blend\}\.export\.json/, 'the sidecar path is derived from the .blend');
  for (const field of ['extras', 'animations', 'applyTransforms', 'selection', 'profile']) {
    assert.ok(source.includes(`'${field}'`) || source.includes(`"${field}"`) || source.includes(`sidecar.get('${field}'`), `sidecar field not read: ${field}`);
  }
  // The unconditional defaults must still be the pre-sidecar recipe, byte-for-byte.
  assert.match(source, /export_apply=True, export_cameras=False, export_lights=False/);
  assert.match(source, /export_animations=False, export_materials='EXPORT'/);
  assert.ok(!/^\s*options\['export_extras'\] = True\s*$/m.test(source), 'extras must never be forced on without a sidecar');
  for (const prefix of ANCHOR_PREFIXES) assert.ok(source.includes(prefix), `anchor prefix out of sync with the guard: ${prefix}`);
});

test('the baseline is paid down by hand: no regenerate path exists in the guard', async () => {
  const source = await readFile(resolve(ROOT, 'scripts/glb-contract-guard.mjs'), 'utf8');
  // Judge the CODE, not the prose: the header comment names the flag it refuses to implement.
  const code = source.split('\n').filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*') && !line.trim().startsWith('/*')).join('\n');
  assert.ok(!code.includes('write-baseline'), 'a --write-baseline flag would make the baseline meaningless');
  assert.ok(!/writeFile|appendFile|writeFileSync|createWriteStream/.test(code), 'the guard never writes; it only reports');
  const baseline = JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
  assert.ok(Array.isArray(baseline.grandfathered));
  assert.equal(new Set(baseline.grandfathered).size, baseline.grandfathered.length, 'duplicate baseline entries');
  assert.match(baseline.law, /NEVER BY REGENERATING/);
});

test('contractFor resolves the same sibling JSON Terrain3dClaimPilot.ts imports', async () => {
  const found = await contractFor('assets/pilots/map-rebuild-spike/the-claim-terrain.glb', ROOT);
  assert.equal(found.path, 'assets/pilots/map-rebuild-spike/the-claim-terrain-contract.json');
  assert.equal(found.contract.vertices, 16641);
  const runtime = await readFile(resolve(ROOT, 'src/world/Terrain3dClaimPilot.ts'), 'utf8');
  assert.ok(runtime.includes('the-claim-terrain-contract.json'), 'the runtime must still read the file this guard reads');
  assert.equal(await contractFor('assets/pilots/plaza-props-3d/covered_wagon.glb', ROOT), undefined, 'families without contracts are not invented');
});

test('census rows sum to the asset count', async () => {
  const { rows } = await auditCorpus();
  assert.equal(census(rows).reduce((sum, entry) => sum + entry.assets, 0), rows.length);
}, { timeout: 120_000 });

test('the shared landmark source ledger covers every shipped pack and current source declaration', async () => {
  const base = 'assets/pilots/map-rebuild-spike/landmarks';
  const ledger = JSON.parse(await readFile(resolve(ROOT, base, 'landmark-source-ledger.json'), 'utf8'));
  const assets = (await productionAssets(ROOT)).filter(({ family }) => family === 'landmarks');
  const packs = [...new Set(assets.map(({ path }) => path.split('/').at(-2)))].sort();
  assert.deepEqual(Object.keys(ledger.packs).sort(), packs, 'packs from other builders must remain in the shared ledger');
  for (const pack of packs) {
    const contract = JSON.parse(await readFile(resolve(ROOT, base, pack, `${pack}-landmark-pack-contract.json`), 'utf8'));
    const expected = Object.fromEntries(Object.entries(contract.assets).map(([id, record]) => [id, {
      sourceTier: record.sourceTier, sources: record.sources, asset: record.asset,
    }]));
    assert.deepEqual(ledger.packs[pack], expected, `${pack}: source declaration drift`);
  }
});


test('landmark contracts honor declared material counts and retain legacy defaults', async () => {
  // F-TCR-3 (attended 2026-09-15): `join`, not `resolve` — scripts/fixture-teardown.test.mjs extracts the literal prefix
  // with a regex that reads only `mkdtemp(join(tmpdir(), '…'))`, so `resolve` made the sweep red on main for every
  // tree since the map campaign landed this test (883a3521e), hidden in linked worktrees by the desk guard's refusal
  // sorting first. Same directory, same prefix, now visible to the sweep.
  const root = await mkdtemp(join(tmpdir(), 'landmark-material-contract-'));
  const dir = 'assets/pilots/map-rebuild-spike/landmarks/dome';
  const body = { triangles: 12, bounds: { min: [-1, -2, 0], max: [1, 2, 3] } };
  try {
    await mkdir(resolve(root, dir), { recursive: true });
    const path = resolve(root, dir, 'dome-landmark-pack-contract.json');
    for (const declared of [false, true]) {
      await writeFile(path, JSON.stringify({ assets: { shell: { ...body, ...(declared ? { meshCount: 1, materialCount: 2 } : {}) } } }));
      const result = await contractFor(`${dir}/shell.glb`, root);
      assert.equal(result.contract.meshCount, 1);
      assert.equal(result.contract.materialCount, declared ? 2 : 1);
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});
