// s1466 drain evidence: prove the nul-delimiter cure does NOT move the runtime string.
// Reads the OLD (main) and NEW (merged) versions of Game.ts, extracts the two composite-key
// template literals from each, evaluates both, and compares the produced bytes in hex.
import { execFileSync } from 'node:child_process';

const repo = '/Users/robin/Claude/Projects/Gold Rush';
const show = (ref) =>
  execFileSync('git', ['show', `${ref}:src/game/Game.ts`], { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const oldSrc = show('main');
const newSrc = show('lane/a');

// Pull the literal text of the two key expressions out of each version.
const grab = (src, label) => {
  const hits = [...src.matchAll(/const key = (`[^`\n]*`);/g)].map((m) => m[1]);
  console.log(`${label}: found ${hits.length} key expressions`);
  return hits;
};

const oldKeys = grab(oldSrc, 'OLD (main)      ');
const newKeys = grab(newSrc, 'NEW (lane/a)    ');

if (oldKeys.length !== newKeys.length || oldKeys.length === 0) {
  console.error('MISMATCHED EXPRESSION COUNT — refusing to claim equivalence');
  process.exit(2);
}

// Evaluate each with identical stand-in values, then compare produced bytes.
const kind = 'a', label = 'b', materialName = 'c';
const row = { material: 'a', renderOrder: 'b' };
let allSame = true;
for (let i = 0; i < oldKeys.length; i++) {
  const evalKey = (lit) => {
    const fn = new Function('kind', 'label', 'materialName', 'row', `return ${lit};`);
    return fn(kind, label, materialName, row);
  };
  const a = evalKey(oldKeys[i]);
  const b = evalKey(newKeys[i]);
  const hexA = Buffer.from(a, 'utf8').toString('hex');
  const hexB = Buffer.from(b, 'utf8').toString('hex');
  const same = hexA === hexB;
  allSame &&= same;
  console.log(`key[${i}] OLD=${hexA}  NEW=${hexB}  ${same ? 'IDENTICAL' : 'DIFFERENT'}`);
}
console.log(allSame ? 'VERDICT: runtime values byte-identical' : 'VERDICT: RUNTIME MOVED');
process.exit(allSame ? 0 : 1);
