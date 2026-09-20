import fs from 'node:fs';
const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));

let target = null;
(function walk(nodes) {
  for (const n of nodes || []) {
    if (n.id === 'factory-truth') target = n;
    walk(n.subgoals);
  }
})(g.goals);
if (!target) throw new Error('factory-truth subgoal not found');

const id = 'f1508-1-e1-contracts-stale-broadcast';
if ((target.tasks || []).some((t) => t.id === id)) throw new Error('leaf already present');

target.tasks.push({
  id,
  title:
    "F-1508-1: e2e/072-era-activation.spec.ts:23 hardcodes E1_CONTRACTS as five ids; the epoch-1 manifest has listed six since 2026-08-01 (f86b28b34 added e1-drill-yard), so :226 reds with Expected -0 / Received +1 on desktop-chrome. NOT a regression: the red inventory's snapshot is dated 2026-07-29 and listContracts() has not changed since 2026-07-07, so CLEAN-IN-INVENTORY means green nine days ago. Derive the list from the epoch-1 manifest (the f1504-1 precedent, merged 042fcdd4a) and prove by manufactured defect that the toEqual still catches later-epoch leakage.",
  taskFile: 'lane-f1508-1-e1-contracts-stale-broadcast.md',
  lane: 'lane-a',
  status: 'queued',
  attempts: 0,
  authoredBy: 's1508 fire',
});

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('leaf added under factory-truth; tasks now', target.tasks.length);
