import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('only AssetLoading constructs GLTFLoader so every caller gets Meshopt decoding', () => {
  const root = new URL('../src/', import.meta.url);
  const offenders = readdirSync(root, { recursive: true })
    .filter((file) => /\.[cm]?[jt]sx?$/.test(file) && file !== 'assets/AssetLoading.ts')
    .flatMap((file) => [...readFileSync(new URL(file, root), 'utf8').matchAll(/\bnew\s+GLTFLoader\s*\(/g)]
      .map(() => fileURLToPath(new URL(file, root))));
  assert.deepEqual(offenders, [], 'Use createGltfLoader or trackedGltfLoader from AssetLoading.ts');
});
