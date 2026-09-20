import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/goals.json';
const g = JSON.parse(readFileSync(P, 'utf8'));

const ID = 'f1511-2-blocker-slide-geometry-gate';
const HASH = '27782fdab2ea244ca2a27f8e9215db7baf14f154';

function walk(node, fn) {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, fn));
  if (node && typeof node === 'object') {
    fn(node);
    for (const v of Object.values(node)) walk(v, fn);
  }
}

let found = 0;
walk(g, (n) => {
  if (n.id === ID) {
    found += 1;
    console.log('BEFORE:', n.status, n.mergeHash);
    n.status = 'merged';
    n.mergeHash = HASH;
    n.closureReason =
      'MERGED s1513 at 27782fda. F-1511-2 CURED: the ACTIVE_TILE_ID e1-twin-banks fence is dropped from '
      + 'both slideX/slideZ ternaries in ClaimJumperEnemy.resolveBlocker(), so head-on padded-span geometry '
      + 'drives the slide on every tile while blockerSlideDirection() still governs outside the span (wedge '
      + 'routing intact). landmark-collision:68 PASSED desktop+mobile — it was 2 FAILED, reproduced twice, at '
      + 's1512s baseline; never-trap:88 (F-BW-10 wedge invariant) PASSED both. Gates on the merged tree: tsc '
      + 'rc=0, build rc=0, landmark-collision+never-trap 18/18 both projects --workers=1, adjacent '
      + 'fort-landmark-collision 2/2, zero console/page errors. The runners CONDITIONAL GREEN required a '
      + 'supported-Node test:node-guards rerun: discharged at Node 26.4.0 with rc=0, 346 tests / 343 pass / '
      + '0 fail / 3 skipped — the lanes 2 reds were purely the F-1507-1 Node-23 timeout-semantics split. '
      + 'F-1460-1 check explicit: the E2 Baron pinned outcomes PASSED, no sim pin moved and none re-pinned. '
      + 'Review: reviews/f1511-2-blocker-slide-geometry-gate.md (supervisor section appended).';
    console.log('AFTER :', n.status, n.mergeHash);
  }
});

if (found !== 1) throw new Error(`expected exactly 1 leaf, found ${found}`);
writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('40-hex:', /^[0-9a-f]{40}$/.test(HASH));
