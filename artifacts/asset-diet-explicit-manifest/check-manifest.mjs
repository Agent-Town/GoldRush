// Run: node artifacts/asset-diet-explicit-manifest/check-manifest.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const fixture = mkdtempSync(path.join(tmpdir(), 'gr-diet-manifest-'));
const original = JSON.parse(readFileSync(path.join(root, 'scripts/asset-diet.manifest.json')));
const source = 'assets/pilots/plaza-props-3d/covered_wagon.glb';
try {
  mkdirSync(path.join(fixture, 'scripts'));
  cpSync(path.join(root, 'scripts/asset-diet.mjs'), path.join(fixture, 'scripts/asset-diet.mjs'));
  for (const directory of ['node_modules', 'assets', 'src']) symlinkSync(path.join(root, directory), path.join(fixture, directory), 'dir');
  function run(name, manifest = original, model = source, expectedError) {
    rmSync(path.join(fixture, 'dist'), { recursive: true, force: true });
    mkdirSync(path.join(fixture, 'dist/assets'), { recursive: true });
    const output = path.join(fixture, 'dist/assets', name);
    cpSync(path.join(root, model), output);
    writeFileSync(path.join(fixture, 'scripts/asset-diet.manifest.json'), JSON.stringify(manifest));
    let log;
    try {
      log = execFileSync(process.execPath, ['scripts/asset-diet.mjs'], { cwd: fixture, encoding: 'utf8', timeout: 60_000, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      if (!expectedError) throw error;
      assert.match(error.stderr, expectedError);
      assert.deepEqual(readFileSync(output), readFileSync(path.join(root, model)), 'rejection must precede mutation');
      console.log(`PASS rejects ${name}: ${expectedError}`);
      return;
    }
    assert.equal(expectedError, undefined, `expected rejection: ${log}`);
    assert.deepEqual(readFileSync(output), readFileSync(path.join(root, model)), 'compress:false preserves bytes');
    assert.match(log, /skip: explicit fixture opt-out/);
    console.log(`PASS compress:false preserves ${name} and logs its reason`);
  }
  run('covered_wagon-unlisted-12345678-diet-12345678.glb', original, source, /cannot resolve a unique source/);
  run('hero-3d-12345678-diet-12345678.glb', original, 'assets/pilots/hero-3d/hero-3d.glb', /exactly one manifest entry.*found 0/);
  run('covered_wagon-12345678.glb', [...original, { family: 'overlap', patterns: [source], compress: true, reason: 'fixture' }], source, /exactly one manifest entry.*found 2/);
  const optedOut = original.map((entry) => entry.family === 'props' ? { ...entry, compress: false, reason: 'explicit fixture opt-out' } : entry);
  run('covered_wagon-12345678-diet-12345678.glb', optedOut);
  run('covered_wagon-12345678.glb', optedOut);
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
