import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(readFileSync(p, 'utf8'));
const MERGE = process.argv[2];
if (!MERGE) throw new Error('usage: goal-edit.mjs <mergeHash>');

let leaf = null;
let sibling = null;
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) return n.forEach(walk);
  if (n.id === 'newsie-drift-shell-divergence-rate') leaf = n;
  if (n.id === 'gazette-welcome-drift-observation-frame-v2') sibling = n;
  for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v);
})(g);

if (!leaf) throw new Error('leaf not found');
if (!sibling) throw new Error('sibling not found');

leaf.status = 'merged';
leaf.mergeHash = MERGE;
leaf.drainNotes_s1267 = [
  'MERGED s1267 — attempt 2 RAN IN FULL and the deliverable exists: install + build + four concurrent runs + two serial controls + the environment triple, all six self-check items satisfied.',
  'LANE SHELL: 0 drift reds / 24 concurrent instances, 0 / 12 serial; node v23.11.1, os.cpus().length 16, renderer SwiftShader. Scope-4 row named explicitly: 0-2/24 => the shells genuinely differ.',
  'Merge content is SIX regenerated artifacts/gazette-welcome PNGs and nothing else -- true lane-touched set from git diff 7f3b13ac..lane/m4; the 16-file two-dot diff vs main was stale-base phantom deletions (main advanced 3 commits during the run). Firewall verified clean: no src/, e2e/, playwright.config.ts or package.json on the lane, and --diff-filter=A empty.',
  'THE DRAIN ALSO MEASURED THE FIRE SIDE IN THE SAME HOUR AND RAN THE CONTROL FIVE FIRES HAD SKIPPED: fire shell / repo root 22/24 red, fire shell / LANE DIRECTORY 21/24 red. F-1264-3 stands at n=24 on both sides; F-1265-2 (lane-green half is n=1) is discharged.',
  'Gates: npx tsc --noEmit clean; npm run build green (1.32s). Adjacent suites not run, with reason stated in the review: the merge content is six PNG evidence artifacts with no import graph, and the slice own spec was executed 14 times across both shells this hour.',
  'Findings: F-1267-1 (the "working directory eliminated" claim was unevidenced; now measured and true), F-1267-2 (e2e/gazette-welcome.spec.ts:42 approachNewsie is a SECOND latency-sensitive assertion, 2/24 in the fire arm, reported and untouched), F-1267-3 (logs/runs-archive is gitignored by .gitignore:7 *.log -- 246 of 247 files, 635 MB untracked; OWNER CALL, recommendation gzip-and-track).',
  'STILL OPEN and re-opened by this drain: process scheduling policy. s1265 closed a CPU/QoS cap with capacity.mjs, which measured node worker-thread arithmetic inside one already-running process (5.04x) and therefore could not see a policy that binds on spawned child processes. The fire shell runs 6 workers SLOWER than 1 (78-108s vs ~49s) while the lane runs them 3.5x FASTER (14-15s vs 49-64s). Next experiment with its exact command: logs/session-scratch/s1267/RESULTS.md section 4.',
  'Evidence: reviews/newsie-drift-shell-divergence-rate.md, logs/session-scratch/s1267/RESULTS.md, run 20260730-194426.',
].join(' ');

sibling.correction_s1267 = [
  'CORRECTION TO stoppedNote_s1264 (F-1267-1): that note states "Tree, spec, worker count, and working directory are all ELIMINATED as the variable", and the downstream master quotes it forward as "the identical command, in the identical worktree".',
  'THE WORKING-DIRECTORY HALF OF THAT CLAIM WAS NEVER MEASURED. logs/session-scratch/s1264/ contains only RESULTS.md and handoff-line1.txt, with zero occurrences of lane-b, cwd or worktree, and s1265/RESULTS.md states outright "I did not measure the lane shell".',
  'Every fire-side reading was taken in the repo ROOT and every lane-side reading in worktrees/lane-b, so SHELL and DIRECTORY moved together for five fires.',
  's1267 crossed them: the fire shell, run inside worktrees/lane-b, goes 21 drift reds / 24 (vs 22/24 in the repo root and 0/24 for the lane shell in the same directory).',
  'So the claim is TRUE and is now evidence rather than assertion. Nothing downstream needs revising -- but the note should not have read as measured.',
].join(' ');

writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('leaf status=' + leaf.status + ' mergeHash=' + leaf.mergeHash);
console.log('sibling correction added');
