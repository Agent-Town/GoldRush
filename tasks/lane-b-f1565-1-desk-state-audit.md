# Task f1565-1: build a desk-state auditor that answers whether a carried desk item is still open (LANE-B, commit prefix "chore:")

**FIRE-AUTHORED (attended review welcome)** — s1565, from F-1561-5 with a CORRECTED cause and a MEASURED blast radius.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `scripts/findings-state-guard.mjs` (the exported `scan()` — read it, do not infer it); `scripts/desk-carryforward-guard.mjs` (the consumer whose closure exit this serves); `scripts/desk-declaration-guard.mjs` (for the desk-header matching rule you must reuse).

**SEQUENCING LAW — verify the lane has the code this task extends.** Run both greps in `worktrees/lane-b`:

```
grep -Fc "export function scan(text, { closedVocabulary = 'narrow' } = {}) {" scripts/findings-state-guard.mjs
grep -Fc "const closed = scan(backlogText, { closedVocabulary: 'wide' });" scripts/desk-carryforward-guard.mjs
```

Both MUST print `1`. Both were proved `1` on main at authoring time (s1565) and both files are blob-identical between `main` and `lane/b`. If either prints `0`, the lane has drifted — **STOP and report "lane-b stale: <which key> missing"**. Do NOT improvise the dependency.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

---

## Why (F-1561-5, s1561 — and a correction to it measured s1565)

F-1561-5 (BACKLOG L17) says the desk guard's closure exit "cannot fire for 86 of 89 desk items", and offers two cures: make `scan()` key `🔺`-led rows, or give the desk guard a desk-marker-aware lookup. Its own gate says: **"READ `scan()` first; do not cure this from the inference above."** s1565 read it. Three corrections, each verified:

1. **The stated cause is inexact.** `scripts/findings-state-guard.mjs:64` skips a line unless it leads with `🟡` or `✅`, **or** is `struck`, **or** is a wide-vocabulary `- ✅` bullet. The inference named a `🔬` marker that does not appear in the file at all. Critically, `struck` is tested **independently of the leading marker** (`/^[^A-Za-z0-9]*~~/`), so a `🔺`-led row *is* keyed the moment it is struck.

2. **The closure exit is therefore NOT unreachable — it is reachable and has fired.** Verified on the live board: `tasks/BACKLOG.md:1347` is a `🔺`-led row, struck, reading `✅ CLOSED, see L251`, and `scan()` keys `F-1198-2` as **closed**. Same at `:1273` for `F-1179-3`. The "86 invisible" rows are invisible because they are *open desk items carrying no closure marker* — which is correct behaviour, not a defect.

3. **But the practical harm F-1561-5 points at is REAL, and larger than its headline.** Measured s1565 against `STATUS.md` line-1 as carried by s1564: of the 18 F-ID desk items, **16 are keyed by `scan()` in NEITHER direction** — not open, not closed. All 16 *are* present in BACKLOG (each has ≥1 row with the id inside the 90-char subject zone); they are unkeyable only because `🔺` leads them. So no fire can mechanically answer "is this desk item still open?", which is exactly why s1561, s1563 and s1564 each carried 22 items forward with an explicit "I did NOT re-verify each item's closure state" disclaimer. **The desk is unauditable in practice.**

4. **And the cure F-1561-5 proposes would RED THE BOARD ON NOISE.** s1565 simulated keying `🔺` as open over the live BACKLOG: declared-open rises 143 → 216 and **3 double-state conflicts appear**, where the baseline has 0. `findings-state-guard` exits non-zero on conflicts, so that cure lands `test:ledger-guards` red on every fire. Reading all three shows the conflicts are mostly **incidental citations inside the 90-char subject zone** — the precise hazard this file's own header warns about ("widening reaches prose citations and creates false state claims"):
   - `F-1541-2` — "closed" at `:82`/`:83`, but those rows' subjects are `F-1542-1` and `F-1542-2`, which merely *cite* it. **False.**
   - `F-1179-3` — closed at `:1273` (genuine, subject-led); "open" at `:1279`, whose subject is `F-1180-3`. **Half false.**
   - `F-1252-1` — closed at `:1227` (genuine) and open at `:1229` (genuine: the *scope* half is a live owner question); "open" at `:924` has subject `F-1261-2`. **Half false.**

➡️ **So the correct cure is neither of the two offered.** It is a **subject-first** reader, in a NEW tool, that leaves the shared `scan()` vocabulary untouched: a row states the state of the **first F-ID in its subject zone**; any other id in that zone is an incidental citation and carries no state. Checked by hand against all three conflicts above, that rule classifies every one correctly — rejecting both `F-1541-2` closures, keeping `F-1179-3` CLOSED, and reporting `F-1252-1` as genuinely both (code closed, scope open).

⚠️ **Do NOT modify `scripts/findings-state-guard.mjs`.** F-1261-1 established there is one implementation of "closed" and every consumer executes it rather than copying it. This task ADDS a caller, and reuses `scan()` as the first pass.

---

## Scope

1. **New `scripts/desk-state-audit.mjs`.** Flags: `--status <path>` (default `STATUS.md`), `--backlog <path>` (default `tasks/BACKLOG.md`), `--goals <path>` (default `tasks/goals.json`), `--json`, `--strict`. House header comment in the style of `findings-state-guard.mjs`: WHY / WHAT IT CHECKS — AND DOES NOT / USAGE.

2. **Desk segment extraction — reuse the existing rule, do not invent one.** Read `STATUS.md` line 1. Match the desk header exactly as `scripts/desk-declaration-guard.mjs` does (`OWNER DESK` / `OWNER'S DESK` / `OWNERS DESK`, straight or curly apostrophe; **the LAST occurrence on the line wins**). If line 1 begins with `ACTIVE`, print `SKIP — line-1 is a lock line, no desk to audit` and exit 0. If line 1 has no desk header, print `REFUSING — no desk header on line-1` and exit 2 (fail closed, matching the declaration guard's stance).

3. **Item extraction, both kinds.** From the desk segment only: (a) F-IDs matching `/\bF-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d+\b/` — this MUST match `F-1544-1`, `F-BAL-1`, `F-E2S-3` and `F-MILK-SS-3` alike; (b) backticked slug items (e.g. `` `rf-34-hero-y-restore-roundtrip` ``), which are goal-leaf keys, not findings.

4. **Classification of F-IDs — subject-first, via `scan()` plus a desk-aware fallback.** Import `scan` from `./findings-state-guard.mjs` (wide vocabulary) as the first pass. Then apply the subject-first rule: **a row only states the state of the FIRST F-ID appearing in its 90-char subject zone**; discard any state claim whose row subject is a different id. Verdicts, one per item: `CLOSED` (a subject-led closure row) · `OPEN` (a subject-led open row) · `BOTH` (genuinely both, e.g. `F-1252-1`) · `OPEN-DESK-ONLY` (recorded only by a `🔺`-led row invisible to the shared census) · `UNRECORDED` (no row names it as subject). Report the evidence line numbers for every verdict except `UNRECORDED`.

5. **Slug items resolve from `tasks/goals.json`, not BACKLOG.** Leaf `status:"merged"` → `CLOSED`; `status:"blocked"` → `OPEN` (and print its `blockClass`); no leaf → `UNRECORDED`.

6. **Output and exit codes.** Default: a per-item table plus counts, **exit 0 always** — advisory by design. Rationale to put in the header comment: a strict default reds the whole board rather than answering the question asked (the `drain-block-check` precedent). `--strict`: exit 1 **only** if some carried item classifies `CLOSED` (i.e. it should have been dropped from the desk). `--json` emits the same data as one JSON object.

7. **New `scripts/desk-state-audit.test.mjs` (`node --test`), fixture-driven, proving BOTH directions.** All fixtures are temp files written by the test — **never the live board**. Required cases, each failing before your implementation and passing after:
   - a desk item with a genuine subject-led `✅` closure row → `CLOSED`, and `--strict` exits 1;
   - **the false-positive guard**: a desk item named only *inside another row's* `✅` subject zone → NOT `CLOSED` (this is the `F-1541-2` shape; assert the verdict is not `CLOSED` and `--strict` exits 0);
   - a desk item with a `🔺` row only → `OPEN-DESK-ONLY`, never `UNRECORDED`;
   - a desk item with no BACKLOG row at all → `UNRECORDED`;
   - an id that is subject-led closed at one line and subject-led open at another → `BOTH` (the `F-1252-1` shape);
   - line-1 beginning `ACTIVE` → SKIP, exit 0;
   - a slug item resolved from a fixture `goals.json` in both `merged` and `blocked` states;
   - **non-mutation**: call `scan()` on a fixture before and after running the auditor and assert the census (`size`, closed count, open count) is byte-identical — proving this tool did not widen the shared vocabulary.

8. **Register the test, not a new npm script.** Append `scripts/desk-state-audit.test.mjs` to the existing `test:ledger-guards` `node --test` file list in `package.json`. **Do NOT add a new npm script** — an unrooted script reds `gate-caller-audit`; the auditor is invoked by fires as `node scripts/desk-state-audit.mjs`.

9. **Run it on the lane's own board and report what you see — with the caveat stated.** `node scripts/desk-state-audit.mjs > artifacts/f1565-1-desk-state-audit/lane-board.txt`. ⚠️ **`STATUS.md` and `tasks/BACKLOG.md` are ~23 commits stale in this lane** (blob hashes differ from main; the code files this task touches do not). So these numbers describe the lane's old board, **not main's** — say so in your report and do NOT assert them as main's state. Do not "fix" the staleness by editing either file; they are outside your firewall.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

---

## Firewall

**Touch ONLY:** `scripts/desk-state-audit.mjs` (new) · `scripts/desk-state-audit.test.mjs` (new) · `package.json` (ONE edit: append the new test file to the `test:ledger-guards` list) · `artifacts/f1565-1-desk-state-audit/**` (new).

**NO changes to:** `scripts/findings-state-guard.mjs` (F-1261-1 — one implementation of "closed"; you import it, you never edit it) · `scripts/desk-carryforward-guard.mjs` · `scripts/desk-birth-guard.mjs` · `scripts/desk-declaration-guard.mjs` (read its header rule, reuse it, do not refactor it) · `STATUS.md` · `tasks/BACKLOG.md` · `tasks/goals.json` · any other `package.json` script · `src/**` · `e2e/**` · `specs/**` · sim semantics · any existing test's assertions.

⚠️ **If you conclude an existing guard needs changing to make this work, STOP and report it** — do not fix it. Reporting an adjacent problem is correct; fixing one out of scope is a firewall violation.

---

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` rc=0 · `npm run build` green.
- `node --test scripts/desk-state-audit.test.mjs` — all cases green; report the pass count.
- `npm run test:ledger-guards` — **green, with your new leaf in it**; report the file count and test count before and after your change (it was 13 files / 97 tests at s1539; it must GROW, never shrink).
- **Prove the false-positive case by manufacturing it, not by a green** (the s1299/s1300 standard): temporarily invert your subject-first check, show the incidental-citation fixture then classifies `CLOSED`, revert, show it does not. Paste both outputs into your report.
- `artifacts/f1565-1-desk-state-audit/lane-board.txt` written, with the stale-ledger caveat stated in the report.
- **No playwright needed** — this diff touches no `src/**` or `e2e/**`. Do not run e2e suites; say in your report that you did not, so nobody inherits a false green. Per F-1460-1 the diff also touches none of `src/sim/`, `src/systems/`, `src/entities/`, so `test:node-guards` is not owed either.

**End: READY-FOR-GATES** + report: (a) the pass count and the before/after `test:ledger-guards` totals; (b) the manufactured-defect output, both directions; (c) the lane-board table with its stale-ledger caveat; (d) **the one judgement call this task cannot make for you** — whether `OPEN-DESK-ONLY` should eventually be folded into the shared `scan()` vocabulary, given the 3 conflicts measured in §Why. Report your opinion with reasons; do NOT implement it.
