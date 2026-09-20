# Task f1626-1: red the board when a 📋 ladder row advertises an already-SHIPPED master (LANE-B, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1626, from F-1625-1 recorded in the s1625 handoff, whose cure was deliberately deferred one fire because rooting a new guard edits `package.json` and `scripts/gate-caller-baseline.json` — the exact two files lane-b held dirty for `f1624-1`. That slice merged this fire at `3f330d8bb67c68ab834a09c822ad7adcefa25e47`, so gate topology now has exactly one owner: you.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.

READ FIRST: `AGENTS.md`; `reviews/f1624-1-orphan-test-rooting.md` (the slice you are building on top of — in particular why a new `*.test.mjs` under `test:ledger-guards` now needs a baseline entry); `scripts/master-shipped-classifier.mjs` **in full** — especially `classifyRoot`'s return shape, which is the instrument you must build on rather than re-deriving; `scripts/master-shipped-classifier.test.mjs` (12 tests, the house voice for testing that classifier); `scripts/desk-carryforward-guard.mjs` and `scripts/desk-carryforward-guard.test.mjs` as the SHAPE to copy for a ledger-guard and its test; `scripts/gate-caller-baseline.json` — read the two `desk-carryforward-guard*` entries before writing yours.

SEQUENCING — prove f1624-1 is on main by FILE PROBE, never by grepping commit messages (Mistake #16; the trap is live here because both the authoring commit and the merge carry the same phrase). All three must print `1`:
- `grep -c "src/encyclopedia/stackDirectory.test.mjs" package.json`
- `grep -c "stopped-leaf-supersession-guard.test.mjs" scripts/gate-caller-baseline.json`
- `grep -c "kind: 'test file'" scripts/gate-caller-audit.mjs`

Any `0` → **STOP and report "f1624-1 not landed / lane stale"** rather than guessing. (All three were verified to return exactly 1 on main at authoring time, each on a single line — F-1425-2: a key that spans a line break matches nowhere, including in the file it was copied from.)

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to `artifacts/**`, `reviews/shots-*`, and any `.png` are NEVER "work" and NEVER a STOP — discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1625-1, s1625 2026-08-10, measured while hunting a refill for an idle lane)

A fire looking for work for idle lane-c read `tasks/BACKLOG.md`'s ladder, picked `f-mp503-1`, and **it had merged two days earlier**. Measured across the ladder: **of 10 rows whose LEADING marker is 📋 and which name a task file, 7 had already MERGED; exactly 2 were genuinely open — and both were already running in lanes a and b at that moment.** The ladder held **zero** available work while appearing to hold nine.

That is Mistake #8's on-ramp (*The 824k Flail*: Codex re-derived an already-merged diff into an 824,000-token crash), and the board is the thing that walks a fire onto it.

**Two reasons no existing instrument catches it, both worth understanding before you write code:**

1. **`drain-block-check` returns ✅ CLEAR for a merged master, correctly.** Its question is *is this ALLOWED?*, never *is this ALREADY DONE?* Do not extend it; a second question in that tool would blunt the first.
2. **The text cannot be skimmed for it.** The house writes gates as `GATE: <condition>`, so a LIVE row reads `GATE: merged with test:mp green…` and a CLOSED row reads `GATE: CLOSED — ✅ SHIPPED`. **Both contain the word "merged".** A text-skimmer reads open rows as closed; a marker-skimmer reads closed rows as open.

⚠️ **The finding's own first count was WRONG — 14 of 19 — and that error is the specification.** The extractor matched 📋 *anywhere* in the line, sweeping in three historical ✍️/🚀 authoring-event rows and one WATCH finding that merely **cites** a master path. Anchoring on the **leading** marker and then reading each hit cut it to 7 of 9. **Your guard must tell a master row from a finding row that cites one.** A guard that cannot is worse than none: it will red on findings forever and be excused into uselessness within a week (the `cross-engine` label's fate, F-1460-1).

## Scope

1. **`scripts/ghost-ladder-row-guard.mjs`** — for every `tasks/BACKLOG.md` line whose **leading** marker (first non-list-punctuation glyph) is 📋 **and** which names a `tasks/<name>.md` path, resolve that master through **`classifyRoot` from `scripts/master-shipped-classifier.mjs`** (import it — do NOT re-derive shipped-ness with a fresh grep; that instrument already handles `lane-` stem stripping, review evidence, `drained-<hash>-` traces and goal leaves, and it is itself gated by 12 tests). A row whose master classifies **SHIPPED** is a GHOST. Print each ghost with its line number, the master path, and the classifier's own evidence (the merge hash where it has one) so a reader can check the verdict without re-running anything.
2. **Exit policy: advisory by default, `--strict` reds.** Follow the `drain-block-check` UNKNOWN precedent and say so in the header: the corpus is large and legacy rows are a known backlog, so a strict default would red the whole board instead of answering the question asked. `test:ledger-guards` calls it **`--strict`**; establish the strict baseline in scope 3.
3. **Retire whatever ghosts remain, in the same commit as the guard.** s1626 retired 2 more rows (f1624-1's ladder row and the F-1624-1 finding). Run your guard, retire every ghost it finds the house way — **flip the leading marker to ✅, append a retirement clause naming the merge hash, NEVER delete the row** (Retention Law) — until `--strict` is rc=0. **If a ghost's shipped-ness is not obvious from the classifier's evidence, STOP and report it rather than retiring it on a guess** — a wrongly retired row hides real work, which is the opposite failure and the worse one.
4. **`scripts/ghost-ladder-row-guard.test.mjs`**, fixture-driven over a temp tree, in the `desk-carryforward-guard.test.mjs` shape. It must assert **both directions and, above all, the DISCRIMINATOR**: (a) a lead-📋 row naming a SHIPPED master is reported at `--strict` rc=1; (b) a lead-📋 row naming a genuinely open master is not; (c) **a FINDING row that merely CITES a `tasks/*.md` path is not reported, even when that master is shipped**; (d) **a row whose 📋 appears mid-line is not reported** — that is the 14-vs-7 error, and it must be a fixture, not a comment.
5. **Wire it into `test:ledger-guards`, NOT `test:node-guards`** — and this is not a preference, it is F-1300-4. The subject is a ledger row that a fire retires **in its own drain-bookkeeping commit**; §3 runs the pre-merge battery on the merged tree, which by construction *precedes* that commit, so a pre-merge placement would red on the drainer's own in-flight retirement. Add the guard's `--strict` call and its test file to `test:ledger-guards`.
6. **⚠️ Both new files need `scripts/gate-caller-baseline.json` entries, and this is the trap f1624-1 just set.** As of `3f330d8bb67c68ab834a09c822ad7adcefa25e47`, `gate-caller-audit` treats **every tracked `*.test.mjs`** as a subject, and `test:ledger-guards` is deliberately unrooted — so your new guard (guardish name) *and* its test file will both surface as **NEW orphans at rc=1**, failing `test:node-guards`, unless each is grandfathered with the inherited F-1300-4 reason. This is VERIFIED, not predicted: the audit's own merged-tree output lists all 7 existing ledger-guards-only test files plus 5 guard scripts as `known` orphans for exactly this reason. Copy the voice of the `desk-carryforward-guard.mjs` / `desk-carryforward-guard.test.mjs` pair, and **name the file that reaches them** so a future reader can check.

## Firewall

Touch ONLY: `scripts/ghost-ladder-row-guard.mjs` (new), `scripts/ghost-ladder-row-guard.test.mjs` (new), `scripts/gate-caller-baseline.json` (two entries added), `package.json` (`test:ledger-guards` ONLY — nothing reordered, no other script changed), and `tasks/BACKLOG.md` (marker flips + appended retirement clauses ONLY).

NO changes to: `src/**` · `e2e/**` · `scripts/master-shipped-classifier.mjs` (you are a CONSUMER of it — if it is wrong, that is a finding, not an edit) · `scripts/drain-block-check.mjs` · `scripts/gate-caller-audit.mjs` · `test:node-guards`' contents · `tasks/goals.json` · any BACKLOG row's substance (you retire rows, you never rewrite what they said) · other tasks' fresh work.

⚠️ **Never DELETE a ladder row** — the Retention Law is explicit and this task's whole subject is rows that were allowed to rot. Retire in place.

⚠️ **If your guard reports a ghost whose master you cannot confirm shipped, STOP and report it.** Retiring a live row to reach green is the exact inverse defect, and it silently removes real work from the board.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` + `npm run build` green. `node scripts/ghost-ladder-row-guard.mjs` (advisory) and `--strict` — paste both, before AND after your scope-3 retirements, so the delta is legible. `npm run test:ledger-guards` green **including your new leaf**. `node scripts/gate-caller-audit.mjs` **PASS** — this is the one that catches a missing baseline entry, so run it AFTER `git add`ing your new files (the subject set is TRACKED files, so an un-added file makes that PASS vacuous — F-1533-1/F-1566-2/F-1576-1, three recorded instances of exactly this). `npm run test:node-guards` green **run ALONE** — it is ~3–7 minutes and overlapping it with a second battery contaminates both; if its output ends `CONTENDED — N concurrent batteries`, your run is void, say so and re-run rather than reporting the reds (s1626 lost a 447 s battery to precisely this and had to prove the reds environmental with a main-side control).

**Prove the teeth by MANUFACTURING the defect, not by a green** (the s1299/s1300 standard — a passing guard never executes its violation path, so its green is not evidence about its red). After scope 3 leaves `--strict` at rc=0: re-flip ONE retired row's leading marker back to 📋, confirm `--strict` exits 1 naming that row, restore it, and confirm rc=0 again. Paste both directions.

No screenshots — this slice renders nothing.

End: READY-FOR-GATES + report: (a) the ghost list before your retirements, with line numbers and merge hashes; (b) how many rows you retired and how many ghosts, if any, you STOPPED on instead; (c) the four discriminator fixtures and what each proves; (d) the manufactured-defect transcript, both directions; (e) confirmation that `gate-caller-audit` PASSes with your two new baseline entries, and whether you ran it before or after `git add`.
