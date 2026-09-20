import fs from 'node:fs';

// ---- 1. the finding row, filed at the top of BACKLOG ----
const row = [
  '\u{1F534} **F-1605-1 (s1605 2026-08-09, MEASURED AT THE LAST-ACT BATTERY — `test:ledger-guards` IS RED IN THREE PLACES AND ALL THREE WERE ARMED BY ONE ATTENDED COMMIT, NONE BY THE ROW THIS FIRE WROTE).**',
  '`node --test` over the 15 ledger-guard files returns **150 tests / 147 pass / 3 fail**; every other leaf of the battery is green (findings-state · blocker-panel · ruling-propagation · citations · desk-declaration · desk-birth · status-archive-audit · attended-owed-audit · main-lock-gate · janitor-rejection · lane-dispatch-safety · nul-audit all PASS).',
  '✓ **CAUSE ISOLATED TO A SINGLE COMMIT BY DIFFING THE LEAF STATUSES ACROSS THREE REVISIONS, not inferred:** at `3572900a8` (before this fire took its lock) `calibrate-suite-workers-v2` was `blocked` and `rf-34-hero-y-restore-roundtrip` was `blocked`; the attended desk walkthrough `9264046eb` flipped them to `stopped` and `planned` respectively. **Both guards key on exactly those states, so the flips ARMED them.** The five leaves named below were already `merged` before this fire existed.',
  '**RED 1 — `stopped-leaf-supersession-guard.test.mjs:204` (1 test):** five shipped leaves name `calibrate-suite-workers-v2`, which is now `stopped` — `factory-build-mode-prompt-realign`, `factory-m3-05b-run-ledger`, `f1510-3-revision-metadata-esm`, `f1534-2-desk-guard-slug-shape`, `lane-d-f1152-1-confirmbuild-cause`. **CURE (F-1521-1, per the guard’s own message):** either retire the stopped leaf as `superseded` with `supersededBy`, or add each shipped leaf to its `supersessionChecked` with the reason it does NOT supersede it. ⚠️ **This is a JUDGEMENT about five slices, not a bookkeeping reflex — the dangerous direction is retiring a stopped leaf that still holds live scope, so it wants a reader who will open them.**',
  '**REDS 2 AND 3 — `banked-master-preflight-guard.test.mjs:78` and `:120` (2 tests), both naming ONLY `lane-hero-y-restore-roundtrip.md`** (the rf-34 master, banked 2026-07-27, unblocked into `planned` by the same commit): its pre-flight (a) lacks the `F-1407-1` FACTORY-CHURN clause the lane template requires, and (b) **resets `lane/m3` while `worktrees/lane-a` is actually on `lane/a`** — the F-1464-3 stale-branch-name trap, verified against `git worktree list` rather than prose.',
  '\u{1F6D1} **DO NOT CURE REDS 2 AND 3 BY EDITING THAT PRE-FLIGHT ALONE. THE RED IS CORRECT AND IT IS THE ONLY THING CURRENTLY STOPPING A 13-DAY-STALE MASTER FROM LOOKING QUEUEABLE.**',
  'Its WHY quotes numbers measured on the merged tree at `1ff2257e` on 2026-07-27 — several hundred commits ago — and §2E requires a stale-check against current main before any master older than ~2 days is queued (Mistake #8, the 824k Flail). **Fixing the branch name would turn a guard that says “do not queue this” into a green while the staleness it is really protecting against is untouched** — the laundering shape. The pre-flight repair belongs INSIDE the re-authoring, as one commit, after the stale-check.',
  '\u{1F4A1} **WHAT THIS IS AN INSTANCE OF, because the class is more useful than the two rows:** F-1300-4 says a fire cannot see the defect it is about to introduce, because the battery runs before its own bookkeeping. **This is that one actor over: an ATTENDED session’s legitimate ledger edit armed two guards against work it did not touch, and the attended sweep had no last-act battery at all** — the duty in §2E/F-1300-4 is written for fires. The three reds sat green-adjacent for ~40 minutes until a fire ran the battery for its own row and inherited them. **A status flip is a code change to every guard keyed on that status.**',
  '**GATE: none owed by this fire (filed, cause isolated, cures specified, nothing merged on top of it). RED 1 wants an attended or fire reader who will open the five slices; REDS 2+3 close as a side effect of the rf-34 re-authoring that §2E already owes. Non-blocking for drains: no guard here gates a merge.**',
].join(' ');

const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const at = lines.findIndex((l) => l.includes('f1605-1 AUTHORED s1605'));
if (at < 0) { console.error('anchor not found'); process.exit(1); }
lines.splice(at, 0, row);
fs.writeFileSync(p, lines.join('\n'));
console.log('finding row inserted at line', at + 1);

// ---- 2. tell the handoff the truth about the battery ----
const s = 'STATUS.md';
const sl = fs.readFileSync(s, 'utf8').split('\n');
if (!sl[0].startsWith('Last updated: 2026-08-09T22:44Z s1605 handoff')) {
  console.error('line-1 is not my handoff'); process.exit(1);
}
const insert = [
  '\u{1F534} **LAST-ACT BATTERY IS RED IN THREE PLACES AND I AM REPORTING IT RATHER THAN SHIPPING A GREEN CLAIM — F-1605-1 FILED.**',
  '`test:ledger-guards` = **150 tests / 147 pass / 3 fail**; all twelve chained leaves PASS (incl. `desk-declaration` and `citations`, which judge this very handoff and my master).',
  '✓ **NONE OF THE THREE IS MINE, PROVED BY DIFFING LEAF STATUSES ACROSS `3572900a8` → `9264046eb` → HEAD rather than by asserting it:** the attended desk walkthrough flipped `calibrate-suite-workers-v2` `blocked`→`stopped` and `rf-34-hero-y-restore-roundtrip` `blocked`→`planned`, and both guards key on exactly those states. My own queued leaf passes `banked-master-preflight` cleanly.',
  '⚠️ **AND THE rf-34 RED IS THE INSTRUMENT AGREEING WITH NEXT (B) BELOW:** it reports that master resets `lane/m3` while `worktrees/lane-a` is on `lane/a` (F-1464-3) and lacks the F-1407-1 clause. **Do NOT cure that by editing the pre-flight alone — the red is the only thing stopping a 13-day-stale master from reading as queueable.** See F-1605-1 for the full cures.',
].join(' ');
sl[0] = sl[0].replace(
  '\u{1F4EE} **TK-01/GZ-01 CHECKED',
  insert + ' \u{1F4EE} **TK-01/GZ-01 CHECKED',
);
fs.writeFileSync(s, sl.join('\n'));
console.log('handoff amended with the honest battery result');
