import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/goals.json';
const id = 'agent-verb-rung-enforcement';
const mergeHash = '1793a7ea55a2445e0f1938054d0571d8c75a47c3';
const notes =
  's1283 ACCEPT; reviews/agent-verb-rung-enforcement.md. F-1282-1 discharged: requiredLevel() is the FIRST of two gates in permissionDenial and it still returned 3 for HARVEST, so s1281’s correct ability-table edit was unreachable. Now BUILD=3, HARVEST=2 (StandingOrders.ts:346-348). Measured through the real entry point with s1282’s own probe: HARVEST @ L2 PERMISSION_DENIED -> ACCEPTED, BUILD @ L2 still denied (owner ruled BUILD=3), control REPAIR_UNDER @ L2 ACCEPTED. Guard extended to the verb table and proven falsifiable on 4 arms incl. a deletion/vacuity arm (all rc as expected). Gates: tsc 0, build green, node-guards 190/0 (+1 = this slice), own spec 4/4 both projects, panel suites 16/16, boot probe 14/14 desktop+390px zero console. 3 adjacent reds all attributed by a reverted-graft CONTROL arm: m2-07:349 is the documented known red (inventory:169-170, 22/26), and the two m4-06 reds each pass on the opposite arm = load flakes, not regressions. Still owed from the owner’s 07-30 sentence: place_building at 3, which is the adapter re-land’s scope.';

const raw = readFileSync(path, 'utf8');
const data = JSON.parse(raw);

let found = 0;
(function walk(node) {
  if (Array.isArray(node)) return node.forEach(walk);
  if (node && typeof node === 'object') {
    if (node.id === id) {
      node.status = 'shipped';
      node.mergeHash = mergeHash;
      node.drainNotes = notes;
      found += 1;
    }
    for (const k of Object.keys(node)) if (node[k] && typeof node[k] === 'object') walk(node[k]);
  }
})(data);

if (found !== 1) throw new Error(`expected exactly 1 leaf, found ${found}`);
writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('flipped', id, '-> shipped @', mergeHash.slice(0, 8));
