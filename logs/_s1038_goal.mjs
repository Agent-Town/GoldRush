import fs from 'fs';
const p = '/Users/robin/Claude/Projects/Gold Rush/tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));
let hit = 0;
const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk);
  if (!n || typeof n !== 'object') return;
  if (n.id === 'perf-05-startup-attribution') {
    hit++;
    n.status = 'held-gate-incomplete';
    n.attempts = 1;
    n.branch = 'lane/m3';
    n.tip = 'cec50777';
    n.review = 'reviews/perf-05-startup-attribution.md';
    n.note = 's1038: the run FINISHED both projects then died on an upstream "Selected model is at capacity" (rc1), so the runner never committed — output salvaged from the worktree (d1743150) before any refill could reset --hard over it. Deliverable PROVEN: beforeFirstFrame [] and all 5 prefetch rows on 4/4 runs; two-halved needle control proven exhaustively (all 3 favicons stop matching, every genuine icon-/bld-/ui- asset still matches). Defect 2 reading 3 REFUTED — the prefetch always fired, the 250-entry buffer ate it (F-1038-4); bootBytes 3.57MB -> 7.92MB same build. HELD not merged: only :231 ttiMs<3000 is red (3118/3014/3961) under lane-c CPU contention, an assertion this test-only change cannot causally affect (F-1038-1). GATE: re-run both projects with pgrep -f "codex exec" empty; green => path-scoped merge.';
  }
  Object.values(n).forEach(walk);
};
walk(g);
if (hit !== 1) throw new Error('expected exactly 1 leaf, found ' + hit);
fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('goals.json leaf updated, hits =', hit);
