import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/goals.json';
const raw = readFileSync(p, 'utf8');
const g = JSON.parse(raw);

let target = null;
const walk = (n) => {
  (n.subgoals || []).forEach(walk);
  (n.tasks || []).forEach((t) => {
    if (t.id === '066-walk8-hero-expectation-realign') target = t;
  });
};
(g.goals || []).forEach(walk);

if (!target) {
  console.error('predecessor leaf not found');
  process.exit(1);
}
if (target.note_s1302) {
  console.error('already corrected');
  process.exit(1);
}

// Append a correction WITHOUT touching the original note (Retention Law; precedent: note_s1189).
target.note_s1302 =
  'CORRECTION s1302, by measurement (F-1302-1). The note above calls the residual :234 "the owner-gated F-1166-1 jumper sheet-family fork". That label is WRONG and it is the reason this sat untouched for 19 days: :234 asserts the SHEET NAME of char.bandit_base - the slot the runtime actually mounts since 82543f27 (2026-07-12) - while F-1166-1 is a fork about 8-way rotation and grab/flee clips for a spec file that does not exist. BOTH arms of that fork leave char-bandit-base-sheet-* untouched, so :234 is fork-independent and always was fire-repairable. The note is otherwise accurate and its arithmetic is confirmed: strideUnits*visualScale = 2.05*1.5 = 3.075 is exactly the product I re-derived from pools.ts:236 this fire. Also confirmed: :235-238 had still never executed. Correcting only the :234 string reds three of them (fps 7.60 vs 8.55, 14.0488 vs 17.1, stride 2.8421 vs hero 3.0750), so the residual was four assertions rather than one. Successor leaf: 066-jumper-cadence-realign. An owner-gate label is load-bearing - it stops every fire that reads it - so a mis-applied one costs more than a mis-scoped task.';

const out = JSON.stringify(g, null, 2) + '\n';
JSON.parse(out);
writeFileSync(p, out);
console.log('note_s1302 appended');
