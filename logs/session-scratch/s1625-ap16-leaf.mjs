// attended 2026-08-10: register the ap16-audit goal leaf beside stack-directory
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'tasks/goals.json';
const d = JSON.parse(readFileSync(p, 'utf8'));
let placed = false;
function walk(n) {
  if (placed) return;
  const ts = n.tasks || [];
  const i = ts.findIndex(t => t.id === 'stack-directory');
  if (i >= 0) {
    if (ts.some(t => t.id === 'ap16-audit')) { console.log('already registered'); placed = true; return; }
    ts.splice(i + 1, 0, {
      id: 'ap16-audit',
      title: 'AP-16-0 same-game parity audit (owner law 2026-08-10)',
      status: 'queued',
      taskFile: 'lane-a-ap16-audit.md',
    });
    placed = true;
    console.log('ap16-audit leaf registered');
    return;
  }
  for (const c of n.subgoals || []) walk(c);
}
for (const g of d.goals) walk(g);
if (!placed) { console.error('anchor leaf not found'); process.exit(1); }
writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
