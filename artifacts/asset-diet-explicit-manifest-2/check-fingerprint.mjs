// Builds three scratch outputs; never edits the lane manifest or dist.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build } from 'vite';

const root = process.cwd();
const evidence = path.join(root, 'artifacts/asset-diet-explicit-manifest-2');
const scratch = await mkdtemp(path.join(tmpdir(), 'goldrush-manifest-fingerprint-'));
await mkdir(path.join(scratch, 'scripts'));
for (const file of ['scripts/asset-diet.mjs', 'scripts/asset-diet.manifest.json', 'package-lock.json']) {
  await copyFile(path.join(root, file), path.join(scratch, file));
}
const manifestPath = path.join(scratch, 'scripts/asset-diet.manifest.json');
const original = await readFile(manifestPath);
const changed = original.toString().replace(/("family": "panoramas",[\s\S]*?"compress": )true/, '$1false');
assert.equal(changed.replace(/("family": "panoramas",[\s\S]*?"compress": )false/, '$1true'), original.toString());
assert.notEqual(changed, original.toString(), 'change only the panorama compress boolean');
const arms = [];
try {
  // The real config hashes cwd inputs; Vite still resolves the unchanged application from root.
  process.chdir(scratch);
  for (const [name, manifest] of [['original', original], ['flipped', changed], ['restored', original]]) {
    await writeFile(manifestPath, manifest);
    const hash = createHash('sha256');
    for (const file of ['scripts/asset-diet.mjs', 'scripts/asset-diet.manifest.json', 'package-lock.json']) hash.update(await readFile(file));
    const fingerprint = hash.digest('hex').slice(0, 8);
    const outDir = path.join(scratch, name);
    await build({ root, configFile: path.join(root, 'vite.config.ts'), build: { outDir, emptyOutDir: true } });
    const urls = (await readdir(path.join(outDir, 'assets'))).map((file) => `/assets/${file}`).sort();
    const glbs = urls.filter((url) => url.endsWith('.glb'));
    assert.ok(glbs.length > 0, 'real GLBs were emitted');
    const fingerprinted = glbs.filter((url) => /-diet-[a-f0-9]{8}\.glb$/.test(url));
    assert.ok(fingerprinted.every((url) => url.endsWith(`-diet-${fingerprint}.glb`)));
    arms.push({ name, fingerprint, urls, glbs, fingerprinted });
    console.log(`PROOF ${name}: ${fingerprint}, ${glbs.length} GLBs, ${fingerprinted.length} fingerprinted`);
  }
} finally {
  process.chdir(root);
}
const [before, flipped, restored] = arms;
assert.notEqual(before.fingerprint, flipped.fingerprint);
assert.equal(before.fingerprinted.length, flipped.fingerprinted.length);
assert.ok(before.fingerprinted.every((url) => !flipped.urls.includes(url)), 'all fingerprinted GLB URLs rotate');
assert.deepEqual(before.glbs, restored.glbs, 'restoring exact manifest bytes restores every emitted GLB URL');
const nonGlbUrlDifferences = before.urls.filter((url) => !restored.urls.includes(url));
assert.deepEqual(await readFile(path.join(root, 'scripts/asset-diet.manifest.json')), original, 'lane manifest is untouched');
const unfingerprinted = before.glbs.filter((url) => !before.fingerprinted.includes(url));
await writeFile(path.join(evidence, 'fingerprint-proof.json'), `${JSON.stringify({ scratch, changedFamily: 'panoramas', arms: arms.map(({ name, fingerprint, glbs }) => ({ name, fingerprint, glbs })), unfingerprinted, nonGlbUrlDifferences }, null, 2)}\n`);
console.log(`PASS flip/restore: ${before.fingerprint} -> ${flipped.fingerprint} -> ${restored.fingerprint}; ${unfingerprinted.length} worker GLBs have no diet suffix (recorded separately).`);
