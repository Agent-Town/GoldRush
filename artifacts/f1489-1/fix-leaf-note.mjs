// s1491 — the halo-cure leaf's note asserts F-1489-1's premise as fact. That premise is now
// refuted, and a stale claim in the goal tree generates work for whoever reads it next.
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/goals.json';
const raw = readFileSync(p, 'utf8');
const stale = 'F-1489-1 (the known-red quiet-GREEN discriminator has decayed -- it now reds quiet on both trees)';
if (!raw.includes(stale)) throw new Error('stale note not found verbatim; inspect before editing');

const fixed =
  'F-1489-1 (CLOSED s1491: premise REFUTED -- the quiet-GREEN discriminator was never lost. ' +
  'F-1146-6 recipe verbatim on 720035960 gives 3/3 both projects, 18/20 quiet instances pass, ' +
  'and the battery arm reds 2/2, so the fingerprint is intact in both directions. No bisect was ' +
  'possible: the predicate is non-deterministic quiet and all-BAD contended. See ' +
  'artifacts/f1489-1/measurements.md)';

const out = raw.replace(stale, fixed);
if (out === raw) throw new Error('replacement was a no-op');
JSON.parse(out); // never write a goal tree that does not parse
writeFileSync(p, out);
console.log('leaf note corrected and re-parsed clean');
