import fs from 'node:fs';
import { execSync } from 'node:child_process';

const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

// Recover s77 line-1 from git to archive it.
const s77 = execSync('git show 7f2b369:STATUS.md', { encoding: 'utf8' }).split('\n')[0];

const newLine1 =
  'Last updated: 2026-07-06T11:34Z s78 handoff, lock CLEARED — ' +
  '**DRAINED + MERGED 030** (F-025-1 wade-sampler + disarm reticle-dim) to main as `e66d95b`: ' +
  'GATE-PASS (tsc clean; build ok; playwright 025 suite + 024 aim trio = 18 passed, both 030-owned tests green desktop+mobile; ' +
  'boot probe zero console/page errors 1280x800 + 390px). Game.ts hides/dims the blast reticle while wet-powder-disarmed (additive UI, no gameplay/CombatSystem change); 025 spec swapped to an in-page rAF wade sampler (s27 law). Evidence: `reviews/task-030-wade-sampler-reticle-dim.md` + `reviews/shots-task-030-*/`. ' +
  '**Also queued `031b` MAIN corrective** (`2905af8`) for finding **F-030-1** — a PRE-EXISTING boot crash 030 surfaced: `task-024 "difficulty preset falls back to default when profile storage is blocked"` fails on both projects because `MetaProgress.loadMetaProgress()` (MetaProgress.ts:37) calls `storage.getItem` UNGUARDED and `RunManager.browserStorage()` hands it a throwing (truthy) blocked-storage object → boot aborts, `__GR_TEST__` never installs. 031b guards the read/write; file-disjoint from ALL stranded lanes (none touch MetaProgress/RunManager, verified), 0 undrained done-moves so MAIN THROTTLE permits it. The alive+idle runner should pick it up next. ' +
  '**⭐ MAJOR STATE CHANGE — the s75–s77 lane deadlock premise is STALE:** the previously-uncommitted worktree output is NOW COMMITTED to branches (lane/m3 +1, lane/m4 +1, lane/polish +1, lane/m6-r3a-apply +2 ahead of main). The "worktree-access-denied → fires can never merge" reasoning was a RED HERRING for merging — a fire CAN read + merge committed branches from the MAIN repo without worktree `-C` access (verified this fire: `git diff main...lane/m3` reads, `git merge lane/m3` runs). **BUT the branches are badly STALE:** m3=95, m4=37, m6=37, polish=23 commits behind main. A safe dry-run `git merge --no-commit lane/m3` produced **4 real content conflicts** (Scoreboard.ts, main.ts, DeathOverlay.ts, theme.css — main independently moved all 4). I ABORTED it and kept main clean — a blind headless 3-way graft of OWNER-PRIORITY demo-profiles before Demo Day is too risky (silent mis-graft > a delay). ' +
  '**NEXT FIRES:** (A) drain 031b output when the runner produces it (main-slot gate: tsc+build+024 storage test green+025 no-regress+boot). (B) Do NOT blind-merge the stale lane branches — await Robin\'s lane-strategy call (see owes). (C) No lane refills — all 4 lanes ahead-of-main AND stale (LANE-SAFETY forbids reset --hard). ASSAYER: crafting pending EMPTY. No CODEX-WALL. tasks/running holds only the known-stale Jul-5 lane-c marker. ' +
  '**Robin owes (nag, non-blocking):** ✅ CLOSED — the 3 stranded worktrees are now committed to branches (thank you). **⭐⭐ NEW TOP ASK — decide the lane-branch strategy:** the committed lane branches are 23–95 commits stale with real conflicts; recommend **re-running each lane task on fresh main** (rebase the TASK, not the stale branch — 95 commits of divergence, incl. difficulty-presets/meta, almost certainly break their in-lane-green tests) OR an attended 3-way graft session, m3 (demo-profiles) first as OWNER-PRIORITY. Also still owed: m6 attempt-3/r3a verdict; turret-feel + water-feel playtests; Mac full-regression evidence; favicon 16px; attended `rm` sweep of the ~11 untracked scratch files. Canon always: brief §9 (frontier-tech not firearms; illustrated never gory; no Native American enemies; the agent is "the Prospector").';

lines[0] = newLine1;

// Insert s77 archive bullet just above the s76 archive bullet.
const idx = lines.findIndex((l) => l.startsWith('- **s76 handoff (line-1 archive):**'));
if (idx === -1) throw new Error('s76 archive anchor not found');
lines.splice(idx, 0, '- **s77 handoff (line-1 archive):** ' + s77);

fs.writeFileSync(p, lines.join('\n'));
console.log('handoff written; s77 archived at line', idx + 1);
