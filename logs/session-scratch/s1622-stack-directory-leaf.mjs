// s1622 (attended): register the stack-directory goal leaf next to its parent minds-and-rigs
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'tasks/goals.json';
const d = JSON.parse(readFileSync(p, 'utf8'));
let placed = false;
function walk(n) {
  if (placed) return;
  const ts = n.tasks || [];
  const i = ts.findIndex(t => t.id === 'minds-and-rigs');
  if (i >= 0) {
    if (ts.some(t => t.id === 'stack-directory')) { console.log('already registered'); placed = true; return; }
    ts.splice(i + 1, 0, {
      id: 'stack-directory',
      title: 'County-curated learn-more links on Minds + Rigs (owner 2026-08-10)',
      status: 'queued',
      taskFile: 'lane-stack-directory.md',
    });
    placed = true;
    console.log('leaf registered after minds-and-rigs');
    return;
  }
  for (const c of n.subgoals || []) walk(c);
}
for (const g of d.goals) walk(g);
if (!placed) { console.error('minds-and-rigs leaf not found'); process.exit(1); }
writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
