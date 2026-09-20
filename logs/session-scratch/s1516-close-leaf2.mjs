// s1516 drain-2 bookkeeping: f1510-3-inventory-revision-metadata leaf -> merged (negative result).
import fs from 'node:fs';

const P = 'tasks/goals.json';
const MERGE = 'f9c0e498ecd280ec18d24a2906c84319172b1284';
if (!/^[0-9a-f]{40}$/.test(MERGE)) { console.error('hash is not 40 hex'); process.exit(2); }

const g = JSON.parse(fs.readFileSync(P, 'utf8'));
function find(n, id) {
  if (Array.isArray(n)) { for (const x of n) { const r = find(x, id); if (r) return r; } return null; }
  if (n && typeof n === 'object') {
    if (n.id === id) return n;
    for (const k of ['subgoals', 'tasks', 'goals']) if (n[k]) { const r = find(n[k], id); if (r) return r; }
  }
  return null;
}
const leaf = find(g.goals, 'f1510-3-inventory-revision-metadata');
if (!leaf) { console.error('leaf not found'); process.exit(2); }
console.log('before:', leaf.status, leaf.attempts);

leaf.status = 'merged';
leaf.mergeHash = MERGE;
leaf.attempts = 1;
leaf.drainNotes =
  "DRAINED s1516 (f9c0e498) as a NEGATIVE RESULT — the licensed condition fired on the exact hazard the master named, and F-1510-3 is NOT cured. Docs-only, 1 file / +101 lines, no guard arms and no config change left behind. The runner manufactured the reducer REDs FIRST (3 fixture arms, tests 10 / pass 7 / fail 3 against the pre-change reducer), implemented temporarily to turn them green, then ran a REAL Playwright JSON-reporter run which emitted {\"revision\":\"unrecorded\",\"dirty\":\"unrecorded\",\"actualWorkers\":1} and exposed the swallowed cause: ReferenceError: __dirname is not defined. It refused to ship guards around output it had proved false (the 8134ec30 precedent). Constraints held: workers line stayed at :50, law-pointer-guard PASS (26/23/2/1), reducer never called git, inventory snapshots untouched, tsc rc=0. F-1516-1 FILED AGAINST THIS FIRE'S OWN PRICING: the /tmp probe that 'proved' __dirname had no package.json, so its TS config transpiled to CJS where __dirname exists, while this repo is \"type\":\"module\" (package.json:5) and loads the config as ESM — a control matching on flags but not on COMPOSITION. What SURVIVES is the threading channel itself, now confirmed independently in a second tree: user-declared metadata keys ride into the report verbatim alongside Playwright's injected actualWorkers. What is REFUTED is only the directory source. The successor is therefore SMALLER than this task: swap __dirname for import.meta.dirname (available on the pinned 26.4.0) or fileURLToPath(import.meta.url) and re-run the JSON-reporter proof the runner has already built. Review: reviews/f1510-3-inventory-revision-metadata.md.";

fs.writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('after :', leaf.status, leaf.mergeHash);
