import fs from 'node:fs';
const P = 'tasks/goals.json';
const j = JSON.parse(fs.readFileSync(P, 'utf8'));
const mergeHash = process.argv[2];
let hit = 0;
const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk);
  if (n && typeof n === 'object') {
    if (n.id === 'perf-05-startup-attribution') {
      hit++;
      n.status = 'shipped';
      n.mergeHash = mergeHash;
      n.note = 's1039 DRAINED: merged cec50777 -> main, 5 files path-scoped, zero src/ bytes. '
        + 'The s1038 hold was lifted by a paired alternating A/B, not by waiting for an idle machine: '
        + "main's own spec was swapped into the same worktree and run alternately against the same server, "
        + 'and MAIN proved ~300ms SLOWER than the lane (mean 3670 vs 3368 over 5 desktop pairs) while failing '
        + ':231 on 4/5 runs. s1038\'s gate condition was a false dichotomy (green=>merge, red-on-idle=>regression) '
        + 'that never asked whether unmodified main fails too; it does. Merged-tree gate GREEN both projects '
        + '(desktop tti 2621, mobile 1714, beforeFirstFrame [], prefetch 5/5, zero console/page/asset errors); '
        + 'tsc clean, build green. F-1034-3 perf-05 half CLOSED; F-1038-1 CONFIRMED. '
        + 'F-1039-1 opened: :231 is a pre-existing load-sensitive red on main - do NOT widen the threshold.';
    }
    Object.values(n).forEach(walk);
  }
};
walk(j);
fs.writeFileSync(P, JSON.stringify(j, null, 2) + '\n');
console.log('leaves updated:', hit);
