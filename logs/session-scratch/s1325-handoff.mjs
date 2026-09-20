import fs from 'node:fs';

const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const prev = lines[0];

const handoff = [
  'Last updated: 2026-08-01T10:59Z s1325 handoff, lock CLEARED — ',
  '🧰 **(A) ZERO DRAINS BY CORRECT TRIAGE — THE BOARD WAS GENUINELY DRY, AND I SPENT THE FIRE CLOSING THE TWO FINDINGS s1324 LEFT BEHIND.** ',
  'Verified, not inherited: all six queues empty, all four lanes `ahead=0`, no undrained done-move, `tasks/failed/` holds only `shipped-` entries, no `CODEX-WALL`. ',
  'The goal tree’s 41 non-terminal leaves are 4 owner-gated blocks, 2 lawful STOPs (both needing an owner or an ART correction), 14 superseded, and the long-horizon `planned` set — **nothing fire-authorable was sitting on it.** ',
  '✅ **(B) F-1324-2 CURED AND MEASURED — `0773a832`.** The janitor consumed a `refresh-lane` request whether or not it ran: the `mv` sat OUTSIDE the `case`, so a BUSY skip and a genuine `refresh FAILED` were both filed into `tasks/done/` **exactly like a success**. ',
  '**I did not reason about the fix, I measured it** (`logs/session-scratch/s1325-janitor-consume.mjs`, real git repos, not stubs — it extracts the janitor block from BOTH versions and runs each against a synthetic ROOT): **OLD consumed the request in ALL FIVE states**; NEW keeps it only on BUSY and on genuine failure, and still consumes on success / missing-worktree / unknown-op — **the three that can never succeed on retry.** ',
  'The success arm was proven to genuinely revert a dirty worktree (so the harness exercised real git, not a stub that always passes), and `bash -n` is clean on both versions. ',
  'ⓘ The FAILED arm is not hypothetical: **`worktrees/art` is a plain non-git directory**, so a `refresh-lane art` request lands there exactly. ',
  '⚠️ **LANDED, NOT LOADED — and this is the part to carry forward:** bash holds the whole `while true` loop (`:34`→`:150`) in memory, so the edit is **INERT until the runner restarts** (pid 35584, up 21 days). Pre-edit checklist was run in full first: target inside the parsed loop ✓, zero `codex exec` ✓, zero lanes running ✓. ',
  '🔺 **OWNER DESK: one clean runner restart is the only thing standing between this fix and the board.** A fire must never restart it (never-kill-by-a-remembered-pid); it is Robin’s Terminal process. ',
  '📝 **(C) F-1324-3 HAD NO LEDGER ROW, AND THAT IS THE FINDING WORTH MORE THAN THE FIX.** s1324 filed it in `reviews/f1324-1-…md:57` and inside **F-1324-1’s row — which is now ✅ CLOSED**. ',
  'But **`scripts/findings-state-guard.mjs:10` counts only finding declarations at the START of a `tasks/BACKLOG.md` line**, and `:99` reads that file and nothing else. So the census could see it in **neither** place. ',
  '💡 *A finding that lives only as a subclause of a closed row is invisible to every future sweep: the row above it reads ✅, and nobody re-reads the prose under a closed finding.* It would have sat there until someone reordered the arm menu and got a green test asserting nothing. **Filed as its own row s1325.** ',
  '📐 **(D) ONE MASTER AUTHORED + QUEUED — `tasks/lane-c-f1324-3-charter-fuzz-label-addressing.md`**, goal leaf registered in the SAME commit (`0f75428e`), pre-queue gate **CLEAR under `--strict`** before the `cp` (which also proves the leaf is keyed correctly by `taskFile`). ',
  'Premises re-derived at source, never inherited: `e2e/charter-press-totality.spec.ts:26,31,32` do hold `arms[3]`/`arms[9]`/`arms[3]`; the rig has **13 arms each returning a distinct label**, four with `noop` guards (`:63,:70,:77,:92`) — which is exactly what makes a label→index map derivable **without touching the rig**, so the rig is on the NO list as the subject under test. ',
  'The master requires the map to go **RED naming the label** if it ever becomes ambiguous or absent (the cured failure mode is a test that passes while asserting nothing), keeps the bidirectional assertion at full strength, widens the sweep to **3 rng draws × every Frontier template**, and **pre-declares a STOP if the widening uncovers a real throw — a discovered throw is that task’s success, not its failure.** ',
  '🪤 **(E) THE F-1324-2 TRAP CAUGHT A SECOND FIRE IN A ROW — MINE.** `git merge-base --is-ancestor 04438027 lane/e2-arsenal` returned **ABSENT**: lane-c did not contain the commit that CREATED the file the task edits. ',
  'Queueing onto it would have handed the runner a tree where the subject does not exist. I refreshed lane-c directly (native fires execute cleanups directly, §0 — and the `.req` path is inert until restart), then **re-proved presence after the reset**, not before. Lane-c is now at `3146eec6`, clean. ',
  '⚠️ **This check is not optional and not yet mechanised: `lane-usable.mjs` says USABLE for all four lanes, and USABLE IS NOT CURRENT.** ',
  '🧾 **(F) DUTIES, EACH VERIFIED AT ITS OWN SOURCE.** **TICKER 0 owed — premise re-checked, not inherited:** `ticker-digest-2026-07-31.md` was compiled `9c9c88c6` at 05:30 **on 08-01 covering 07-31**, so today is the open coverage day and its digest is due tomorrow. ',
  '**GAZETTE 0 and DEPLOY skipped, both correct and for the same reason:** everything I merged is factory tooling (a runner script, a test master, ledger rows) — **zero `src/`, no player-visible change.** **ASSAYER 0** (`pending/` empty, checked at the directory). **ART untouched — no staging audit claimed.** **BACKUP pushed.** ',
  '**`test:ledger-guards` run as my LAST act**, after the rows existed — see §H for the result. ',
  '➡️ **(G) NEXT FIRE.** **(1) lane-c is LIVE on F-1324-3** — its output is the top drain; gate it with `npx playwright test --list --workers=1` and **refuse anything that does not keep `Total:` in the thousands** (baseline `2476 tests in 350 files`). ',
  '**(2) lane-a / lane-b / lane-d are idle and 28/50/32 BEHIND. PIPELINE-DRY: the goal tree has no fire-authorable rung for them** — every non-terminal leaf is owner-gated, lawfully stopped, or long-horizon `planned`. Do not invent scope to fill them; if you author, prove the subject commit is present FIRST. ',
  '**(3) F-1324-2 is fixed on disk and inert in memory** — until Robin restarts the runner, `tasks/done/janitor-*` entries still prove nothing about whether a lane was refreshed. Keep using `merge-base --is-ancestor`. ',
  '**(4) Do NOT re-diagnose `bt-01-tiers` or the `m2-03` knee-budget red** (F-1323-5, F-1323-3, controls on record). **(5) This §G is a hypothesis like every §G before it.** ',
  '🔺 **OWNER DESK — one new item, small and concrete.** 🔺 **A clean restart of the lane runner (pid 35584, up 21 days)** — it loads the F-1324-2 janitor fix, and nothing else will. All prior carry unchanged: ',
  '🔺 **F-1315-2** · 🔺 **F-1313-3** (rec (b)) · 🔺 **F-1313-2** · 🔺 **F-1312-2** · 🔺 `rf-34` (rec **A**) · 🔺 `vp-02e-jumper` · 🔺 `e1-hold-the-claim` · 🔺 **F-1302-2** · 🔺 F-1300-3 · 🔺 **F-1279-2 rec L2** · 🔺 F-1295-1 · 🔺 **F-1101-1 RETIRE THE THREAD** · 🔺 F-1120-2 (1b) · 🔺 F-1287-1 + F-1286-2 · 🔺 plist `ProcessType` (F-1270-4) · 🔺 F-1267-3 · 🔺 F-1242-1 + F-1193-2 · 🔺 F-1260-3 · 🔺 **F-1252-1 (ungated citations)** · 🔺 F-1257-4 · 🔺 F-1255-4/1 · 🔺 F-1254-3 · 🔺 F-1253-1/2/3 · 🔺 **F-1162-1 / F-1242-2 — 159th ask** · 🔺 F-1193-3 · 🔺 gold-per-token · 🔺 F-1209-3 · 🔺 TOWN ZOOM clamps · 🔺 F-1185-1 · 🔺 F-1208-3 · 🔺 F-1204-1 · 🔺 F-1141-3+F-1164-1 · 🔻 F-1182-2 `brew upgrade codex` (142nd). ',
  '💡 **THE THROUGH-LINE, AND IT IS A SIBLING OF YESTERDAY’S.** s1324 showed that the word *“pre-existing”* closes a question nobody then re-opens. Today’s pair is quieter and the same shape: **a request queue that consumes work on failure, and a finding filed inside a row that later went ✅.** ',
  'Neither lied. Both simply **removed the evidence that something was still owed** — one by moving a `.req` into `done/`, one by burying a 🟡 under a ✅. s1323 read the `done/` entry and concluded the janitor was *unreliable*; it was **obedient and merely unable to say no.** ',
  '➡️ *Ask of any bookkeeping surface: **can it distinguish “done” from “could not be done”?** If it cannot, its records are not evidence — and the failure will present as someone else’s unreliability.* ',
  '⚡ Both cost minutes to fix and had already cost two fires a near-miss each.',
].join('');

// prev is THIS fire's own ACTIVE lock line (s1324's handoff was archived when the lock was taken).
if (!prev.startsWith('ACTIVE')) { console.log('UNEXPECTED line-1, aborting:', prev.slice(0, 80)); process.exit(1); }
lines[0] = handoff;
lines.splice(1, 0, '- **s1325 lock (line-1 archive):** ' + prev);
fs.writeFileSync(p, lines.join('\n'));
console.log('handoff written, line1 len', handoff.length);
