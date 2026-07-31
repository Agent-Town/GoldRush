import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const MIGRATED_SPECS = [
  'agent-view',
  'asset-diet',
  'board-gating-and-profiles',
  'board-upcoming-surveys',
  'cw-02-escort',
  'e2-incline',
  'e2-pressure-garden',
  'e2-rail-tough-diagonal',
  'e2-trestle',
  'e3-canyon-works',
  'e3-tram',
  'e4-vehicles-fuel',
  'hero-ages',
  'release-build',
  'release-frontier',
  'tour-era-seed',
].map((name) => `e2e/${name}.spec.ts`);

test('console error watching stays in one literal-prefix source', async () => {
  for (const file of MIGRATED_SPECS) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(
      source,
      /\b(?:function\s+watchErrors\s*\(|(?:const|let|var)\s+watchErrors\s*=)/,
      `${file} re-introduced a local watchErrors definition`,
    );
  }

  const source = await readFile(new URL('../e2e/support/console-watch.ts', import.meta.url), 'utf8');
  assert.ok(
    source.includes(`text.startsWith("THREE.GLTFLoader: Couldn't load texture blob:")`),
    'e2e/support/console-watch.ts lost the literal GLTFLoader texture-blob prefix predicate',
  );
});
