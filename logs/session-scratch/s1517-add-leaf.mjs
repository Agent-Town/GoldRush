import fs from 'node:fs';

const path = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(path, 'utf8'));
const tasks = g.goals[4].subgoals[0].tasks;

if (tasks.some((t) => t.id === 'f1510-3-revision-metadata-esm')) {
  console.log('leaf already present — no-op');
  process.exit(0);
}

tasks.push({
  id: 'f1510-3-revision-metadata-esm',
  title:
    "F-1510-3 successor #2, after f9c0e498 merged as a negative result: land the SAME mechanism (capture the tested tree's revision in playwright.config.ts metadata; reducer COPIES it verbatim into logs/suite-red-inventory.md) with the one refuted conjunct cured — import.meta.dirname in place of __dirname. PROVED IN THE SUBJECT TREE s1517 before authoring (docs/bench/s1517-f1510-3-esm-dirname-proof.md), which is the F-1516-1 discipline applied to the very finding F-1516-1 created: measured in a detached worktree of THIS repo (same package.json \"type\":\"module\", Playwright 1.61.1, Node 26.4.0), never in /tmp. Four measurements: [1] typeof __dirname=undefined reproduced independently, and import.meta.dirname resolves; [2] the DISCRIMINATING run — from the repo root against the worktree's config — shows dirname=config-dir while cwd=repo-root, so the value is config-anchored rather than cwd-shaped, and process.cwd() is disqualified; [3] a REAL single-spec JSON-reporter run emitted {\"revision\":\"cb276b780de1628e003b9178435e622d253c798b\",\"dirty\":true,\"actualWorkers\":1}, settling the last conjunct with LIVE values instead of the fallback values f9c0e498 saw; [4] the line-50 constraint DEMONSTRATED rather than predicted — a top-of-file placement pushed workers: from :50 to :69 and produced 'FAIL — 3 pointer problem(s)' across scripts/fire.md, .claude/skills/drain/SKILL.md and tasks/goals.json[calibrate-suite-workers-v2], while the bottom-of-file arrangement (ESM imports and function declarations both hoist) held :50 with law-pointer-guard PASS and tsc rc=0. Constraint (a) re-measured on today's main: 142 porcelain vs 6 tracked (s1516 saw 128/8), so --untracked-files=no stays mandatory. Ships the MECHANISM only: the gate closes on the NEXT REAL REGENERATION, so the drain must mark this cured-pending-regeneration, NOT closed.",
  status: 'queued',
  taskFile: 'lane-f1510-3-revision-metadata-esm.md',
  lane: 'lane-b',
  attempts: 0,
  authoredBy: 's1517 (fire)',
  authorNotes:
    "Authored s1517 on a fully dry board (all six queues empty, no undrained done-move, no failed run, no CODEX-WALL), discharging s1516's NEXT (A): the F-1510-3 successor is a ~2-line swap and the cheapest real merge on the board. Premise RE-MEASURED, not inherited — and deliberately measured in the SUBJECT TREE, because the finding this task exists to cure (F-1516-1) is precisely that s1516 priced the predecessor with a probe in /tmp/s1516-pw-probe, a directory with no package.json, so Playwright transpiled the config to CommonJS where __dirname exists. That probe PASSED, and the pass is what did the damage. s1517 therefore built gate-s1517 as a detached worktree INSIDE the repo (§3.0b custody: undecided content never entered main's working tree; the worktree was removed at the end, node_modules symlink unlinked first) and re-ran the whole mechanism there. Two hazards turned up that the s1516 master did not anticipate and that would each have cost this run: the percent-encoded import.meta.url trap (this repo's path contains a SPACE, so 'Gold%20Rush' breaks a hand-rolled fileURLToPath substitute), and the fact that the OBVIOUS top-of-file placement reds law-pointer-guard on three surfaces a runner may not edit. Both are now written into the master as measured demonstrations rather than as warnings. One conjunct is flagged UNPROVED in the proof doc and pushed to the runner honestly: the end-to-end capture was taken with bare --porcelain, not --untracked-files=no; the master's self-check makes re-running it with the flag the runner's job, and says why.",
});

fs.writeFileSync(path, JSON.stringify(g, null, 2) + '\n');
console.log('leaf added; tasks now', tasks.length);
