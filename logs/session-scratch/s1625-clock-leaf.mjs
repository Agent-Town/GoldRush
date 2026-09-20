// attended 2026-08-10: register the upgrade-clock goal leaf beside ap16-audit
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'tasks/goals.json';
const d = JSON.parse(readFileSync(p, 'utf8'));
let placed = false;
function walk(n) {
  if (placed) return;
  const ts = n.tasks || [];
  const i = ts.findIndex(t => t.id === 'ap16-audit');
  if (i >= 0) {
    if (ts.some(t => t.id === 'upgrade-clock')) { console.log('already registered'); placed = true; return; }
    ts.splice(i + 1, 0, {
      id: 'upgrade-clock',
      title: 'The draft gets a clock — 30/20/10s pick timer by difficulty (owner ruling 2026-08-10)',
      status: 'queued',
      taskFile: 'lane-d-upgrade-clock.md',
    });
    placed = true;
    console.log('upgrade-clock leaf registered');
    return;
  }
  for (const c of n.subgoals || []) walk(c);
}
for (const g of d.goals) walk(g);
if (!placed) { console.error('anchor leaf not found'); process.exit(1); }
writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
