import fs from 'node:fs';

const P = 'tasks/goals.json';
const raw = fs.readFileSync(P, 'utf8');
const tree = JSON.parse(raw);

// Locate the array that holds milk-saga-surgeon and append the twin-sockets sibling after it.
let host = null;
(function walk(node) {
  if (Array.isArray(node)) {
    if (node.some((n) => n && n.id === 'milk-saga-surgeon')) host = node;
    node.forEach(walk);
  } else if (node && typeof node === 'object') {
    Object.values(node).forEach(walk);
  }
})(tree);
if (!host) throw new Error('milk-saga-surgeon sibling array not found');
if (host.some((n) => n.id === 'milk-twin-sockets')) throw new Error('leaf already exists — refusing to duplicate');

const leaf = {
  id: 'milk-twin-sockets',
  title:
    'THE TWIN SOCKETS — the E5 Deepwater and E6 Atomic era sockets BUILT (src/sim/DeepwaterSocket.ts, src/sim/AtomicSocket.ts), both in the browser\'s own tick order. ZERO admissions, and the zero IS the finding: SUPPORTED_CONTRACTS deliberately unchanged on all eight contracts. Owner-launched milk shift, registered retroactively by the s1498 drain (Goal Registration Law, F-1495-2).',
  status: 'merged',
  mergeHash: '09ff7a198fb202194d9e2f42942f0d79bc95c01e',
  drainNotes:
    'THE HEADLINE RESULT IS A REFUSAL, AND IT IS THE RIGHT ONE: both sockets run, and running them moved each epoch\'s blocker OFF the consumer and ONTO the agent verb list (F-MTS-2, now on the owner\'s desk). e6-showroom secures at wave 20 deterministically and that is a FALSE GREEN — with wrangle live an exhausted machine is undamageable AND harmless AND still alive, so from wave 6 all 60 living enemies are exhausted, Balance.waves.aliveCap is 60, and WaveSystem refuses to spawn; the win is against an empty board for fourteen waves. Admitting it would have pinned a determinism hash on a deadlock. e5-deepwater-claim cannot be admitted at any wiring effort: DredgeQueenBossSystem builds sprites in INSTANCE FIELD INITIALIZERS (:77-80, helper :736) so it throws outside a browser before its own enabled flag is read, and it owns the contract\'s only exit. THE MERGE WAS THE COST, NOT THE CODE — 13 hunks / 6 files / ~280 conflicted lines, mapped by s1497 (artifacts/s1497-twin-sockets-conflict-map.txt) and RE-MEASURED at drain time per F-1497-1; main had moved only STATUS/artifacts since, so the map held exactly. THREE RESOLUTIONS WORTH NAMING. (1) F-ID COLLISION: milk/deepwater-surgery and milk/twin-sockets were authored in parallel against the same e5 census and BOTH minted F-ER01-E5-5 for different findings. Neither branch could see the other. The socket-shape stub keeps the number (it is cited by name from two banners and from reviews/milk-deepwater-surgery.md); the socket pass\'s finding is renumbered F-ER01-E5-7 in place, nothing dropped. (2) STALE PRE-CURE ASSERTS IN THE SPEC: er01-e5-census.spec.ts:113 asserted the Claim carries NO engineDependencies (toBeUndefined()) — true at the branch\'s base, FALSE after milk/deepwater-surgery landed the declaration. Both sides had rewritten the same test body (main 21 lines vs branch 63). Main\'s ADMISSION GATE 1 is strictly stronger — it pins the exact dep NAME for all four contracts where the branch pinned only status for three — so the branch\'s two lines were dropped as superseded, with the reasoning left at the call site. Keeping them would have redded. (3) STALE BROKEN COUNT: the branch\'s e5 rows read BROKEN 1 of 4 (the Regatta six-vs-five beacon prose); deepwater-surgery cured that at 45f54b88. Resolved to BROKEN 0 of 4, the branch\'s claim STRUCK IN PLACE rather than deleted, with a bridging banner naming why. E6 census rebuilt deliberately from both blobs rather than untangling git\'s interleaving: branch\'s socket-live findings are LIVE, saga-surgeon\'s declaration-cure banners and pre-socket originals RETAINED beneath each, and main-only F-MILK-SS-1/F-MILK-SS-2 preserved whole. GATES on the merged tree in detached gate-s1498 (§3.0b), --workers=1: tsc rc=0 · build green 994ms · er01-e5 + er01-e6 16/16 both projects · adjacent er01 e2/e3/e4/e7/e8/e9/e10 56/56 both projects · node-guards 341 tests / 338 pass / 0 fail / 3 skipped (F-1460-1 fired: diff touches src/sim + src/agent) · slice control gr-sim 10/10 pass 0 fail (review pinned 9/9; main added the F-1493-2 Baron drift pin since, so the count grew and nothing redded) · plain-boot 14/14 desktop+390px, zero console/page errors.',
};

const at = host.findIndex((n) => n.id === 'milk-saga-surgeon');
host.splice(at + 1, 0, leaf);
fs.writeFileSync(P, JSON.stringify(tree, null, 2) + '\n');
console.log('leaf registered; siblings now:', host.map((n) => n.id).join(', '));
