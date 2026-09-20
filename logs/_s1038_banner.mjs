import fs from 'fs';
const p = '/Users/robin/Claude/Projects/Gold Rush/tasks/failed/rc1-20260725-164910-lane-a-perf-05-startup-attribution.md';
const body = fs.readFileSync(p, 'utf8');
if (body.startsWith('> # DO NOT RE-QUEUE')) { console.log('banner already present'); process.exit(0); }
const banner = [
  '> # DO NOT RE-QUEUE THIS MASTER — s1038',
  '>',
  '> **The rc1 was an upstream capacity kill, NOT a task failure, and the work is ALREADY DONE.**',
  '> The run finished both playwright projects (desktop artifact 16:53:50, mobile 16:57:14) and died',
  '> during its closing narration on "Selected model is at capacity" — see the LIVE log under',
  '> tasks/runs/ (644KB), not the mid-run snapshot in logs/runs-archive/ (410KB, frozen 16:50,',
  '> ends mid-exec with no error at all).',
  '>',
  '> Because rc was non-zero the runner skipped its commit, so the output sat uncommitted in the',
  '> lane-a worktree. **s1038 salvaged it onto lane/m3: d1743150 (raw) + cec50777 (review fixes).**',
  '>',
  '> Re-queueing runs the pre-flight "git checkout -B lane/m3 main" + "git clean -fd", which would',
  '> **DESTROY that salvage** — the Reset Massacre exactly (CLAUDE.md section 5, Mistake #2).',
  '>',
  '> **What is actually left:** re-run the spec on both projects with no codex exec running,',
  '> then path-scoped merge. See reviews/perf-05-startup-attribution.md "To close" and BACKLOG F-1038.',
  '',
  '',
].join('\n');
fs.writeFileSync(p, banner + body);
console.log('banner written');
