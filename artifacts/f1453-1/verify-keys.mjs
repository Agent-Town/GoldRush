// F-1425-2: every citation key in the f1453-1 master must match EXACTLY ONCE in the tree under test.
// Run with `node artifacts/f1453-1/verify-keys.mjs` from the root of the tree you are checking
// (main first, then the refreshed lane). rc0 = all keys =1; rc1 = at least one key is not 1.
//
// Keys live in this file rather than in a shell command on purpose: two of them contain single
// quotes, and proving them through `node -e '...'` silently ate the quotes and reported 0 —
// which reads exactly like a stale lane. Prove the key, not the shell.
import { readFileSync } from 'node:fs';

const KEYS = [
  ['src/entities/Enemy.ts', 'let cachedCrossingData: {'],
  ['src/entities/Enemy.ts', '  if (cachedCrossingData) return cachedCrossingData;'],
  ['src/entities/Enemy.ts', "    const targetSlideX = this.blockerSlideDirection('x', moveTarget);"],
  ['src/entities/Enemy.ts', "    const targetSlideZ = this.blockerSlideDirection('z', moveTarget);"],
  ['src/entities/Enemy.ts', '    speed: Terrain.sample(fords[0]?.centerX ?? 0, (Terrain.RIVER_MIN_Z + Terrain.RIVER_MAX_Z) / 2).speedMul,'],
  ['src/entities/Enemy.ts', '  const crossings = fords.length > 0 ? fords : crossingData().crossings;'],
  ['src/world/Terrain.ts', '  if (!ACTIVE_CONTRACT.tileParams.ford) return [];'],
];

let fail = 0;
for (const [file, key] of KEYS) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const n = lines.filter((l) => l === key).length;
  if (n !== 1) fail = 1;
  console.log(`${n}  ${file}  ${JSON.stringify(key.slice(0, 70))}`);
}
console.log(fail ? 'KEY MISMATCH — the lane is stale or the seam moved; STOP' : 'ALL KEYS =1');
process.exit(fail);
