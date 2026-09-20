// s1662 (F-1662-1): the three F-E2S-3 railcars leave the door, so their idle
// null-floor rows must leave the pinned artifact — scripts/null-floor-anchors.test.mjs
// asserts floors === benchSeeds INTERSECT supportedContractIds().
// SPLICE, never re-serialize: JSON.parse+stringify would rewrite all ~700 lines.
// Usage: node <this> <path-to-null-floors.json>
import { readFileSync, writeFileSync } from 'node:fs';

const target = process.argv[2];
if (!target) throw new Error('usage: node s1662-nullfloor-splice.mjs <null-floors.json>');

const KEYS = ['e2-hill-mine', 'e2-trestle', 'e2-incline'];
const lines = readFileSync(target, 'utf8').split('\n');
const drop = new Set();

for (const key of KEYS) {
  const start = lines.findIndex((l) => l === `    "${key}": {`);
  if (start === -1) throw new Error(`no contract block for ${key} at 4-space indent`);
  let end = -1;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i] === '    },' || lines[i] === '    }') { end = i; break; }
  }
  if (end === -1) throw new Error(`unterminated block for ${key}`);
  for (let i = start; i <= end; i += 1) {
    if (drop.has(i)) throw new Error(`overlapping spans at ${i}`);
    drop.add(i);
  }
  console.log(`${key}: lines ${start + 1}-${end + 1} (${end - start + 1})`);
}

const out = lines.filter((_, i) => !drop.has(i));
// Guard the tail case: if a dropped block was last, the new last entry keeps a
// trailing comma and the JSON breaks. Parse-verify before writing.
const text = out.join('\n');
const parsed = JSON.parse(text);
for (const key of KEYS) {
  if (key in parsed.floors) throw new Error(`${key} survived the splice`);
}
console.log(`floors now ${Object.keys(parsed.floors).length} contracts; ${lines.length} -> ${out.length} lines`);
writeFileSync(target, text);
