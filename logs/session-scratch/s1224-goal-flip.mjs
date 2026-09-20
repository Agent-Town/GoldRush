// s1224 — Goal Registration Law: flip the e2-rail-tough-only-bind leaf in the DRAIN commit.
import fs from 'node:fs';

const P = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(P, 'utf8'));
const MERGE = process.argv[2];
if (!MERGE || MERGE.length !== 40) throw new Error('need the 40-char merge hash');

let hit = null;
(function walk(n) {
  if (n && n.id === 'e2-rail-tough-only-bind') hit = n;
  for (const k of ['goals', 'subgoals', 'tasks', 'children'])
    if (Array.isArray(n?.[k])) n[k].forEach(walk);
})(g);
if (!hit) throw new Error('leaf not found');

hit.status = 'merged';
hit.mergeHash = MERGE;
hit.note_s1224 =
  'DRAINED s1224. Scope 1 PASSED on a measurement the runner made: 0v1 wrench-excluded delta -0.118521 against the F-1188-2 noise ceiling |0.095|, with the settled 2v3 pair reproduced as a positive control at -0.127001 and all nine declared mask sizes mirror-dominant on both. Bound sw/se/nw/ne on char.e2.rail_tough.walk4 only and emptied that slot aliases (the alias pass runs after explicit directions, so it would otherwise overwrite the bind); Steam Wrecker + Coal Thief byte-untouched per F-1193-3. Gates re-measured on the MERGED tree, not copied: tsc clean, build green, node-guards 78/78 (runner read 76/76 against its stale 74 baseline; main had become 76 after s1222, and both guards survived the package.json 3-way graft), --list 2468 tests in 345 files, own spec 2/2 both projects, plain-boot zero console/page errors desktop+390px. Zero src/ bytes. Seven adjacent reds all attributed by a control on pre-merge main (detached worktree, scratch port 5236, control validated over HTTP before use): 6 reproduce identically off-slice, the 7th goes 2/2 green in a quiet box. Review reviews/e2-rail-tough-only-bind.md. New: F-1224-3 (wire-e2-enemy-walk4 is an unrecorded baseline red), F-1224-4 (the runner never ran e2-enemies.spec.ts, the spec named for the subject).';

fs.writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('leaf flipped -> merged', MERGE);
