# Task f1568-1: the desk auditor must key its items the way the desk writes them (LANE-C, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1568, from F-1567-3. I did not inherit the finding: I ran the tool against s1567's own live line-1 before taking my lock, reproduced the discrepancy, and then **proved the prescribed cure yields the declared count exactly** (numbers below, all measured this fire).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `scripts/desk-state-audit.mjs` — **the header comment (`:1-26`) and `desk()` together, because the bug is that the function contradicts the header**; `scripts/desk-carryforward-guard.mjs` — **`deskTail`, `deskItems` and the comment block above `deskItems`, which documents the two mis-keying bugs this factory already paid for**; `scripts/desk-state-audit.test.mjs` (the `STATUS()` fixture helper at `:12` and the existing nine tests); `tasks/BACKLOG.md` row **F-1567-3**; `scripts/fire.md` §4 (the law that obliges every fire to run this tool).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to `artifacts/**`, `reviews/shots-*` and any `.png` are NEVER "work" and NEVER a STOP** — discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH before any edit).** Each key is a single line, verified to print `1` on main at dispatch (s1568):

```
grep -Fc "  const items = [...new Set(tail.match(FINDING) || [])].map((id) => ({ id, type: 'finding' }));" scripts/desk-state-audit.mjs
grep -Fc "export function deskItems(tail) {" scripts/desk-carryforward-guard.mjs
```

Both MUST print `1`. If either prints `0`, **STOP and report "lane-c stale: <which key> missing"**. Do NOT read a `0` as "the file changed shape" and improvise — the first key proves the defective line you are here to replace is still exactly that line, the second proves the parser you are here to reuse still exists under that name.

---

## Why (F-1567-3, filed s1567, re-measured from scratch s1568)

`scripts/fire.md` §4 now orders **every fire** to run `desk-state-audit` before deciding what to carry on the OWNER'S DESK. The very first fire to run it as law got a count that disagreed with the board: **the tool keyed 25 items where the desk declared 22.**

✓ **RE-MEASURED s1568, against s1567's live handoff line-1, before this fire took its lock** (so the tool saw a real handoff and not a lock line): the tool keyed **26**, the desk declared **22**. The four extras are `F-1567-3`, `F-1566-3`, `F-1300-4`, `F-1567-1`. (s1567 saw 25 rather than 26 because its own handoff commit added the `F-1567-3` BACKLOG row *after* it ran the audit — the discrepancy is the same defect either way.)

🔑 **THE CAUSE, read in the code and not inferred.** In `desk()`, the desk's findings are taken by a **global regex sweep over the entire tail**:

```
const items = [...new Set(tail.match(FINDING) || [])].map((id) => ({ id, type: 'finding' }));
```

…while the **slugs**, three lines below, are keyed correctly — `tail.split('🔺').slice(1)`, then the first key inside a bounded `KEY_ZONE`. **One function, two different theories of what a desk item is.** Every F-ID mentioned anywhere in the desk's prose — including in a sentence explicitly saying it is *not* on the desk — is admitted as a desk item.

⚖️ **This contradicts the file's own header**, which promises the tool "keeps the first F-ID in each 90-character subject zone" and warns that "widening that shared vocabulary admits incidental citations". The header describes the cure; the code never got it.

🩹 **AND THE FIX IS ALREADY WRITTEN, IN A FILE THIS ONE IS THE SIBLING OF.** `scripts/desk-carryforward-guard.mjs` exports `deskTail()` and `deskItems()` — the same last-desk-word rule, the same 🔺 anchoring, the same bounded `KEY_ZONE`, with a comment block recording **two** mis-keying bugs already found and fixed there by ground-truth fixture, and a note that its counts were **validated against the fires' own declared headers** (7 for s1527, 8 for s1529–s1531, 9 for s1532). s1567 cross-checked that parser against the same line and it keyed exactly **22**.

✅ **THE CURE IS PROVEN, NOT PROPOSED — I RAN IT (s1568, read-only probe, nothing in the repo touched).** Feeding s1567's line-1 to `deskItems(deskTail(line1))`:

- current parser → **26 items**
- reused parser → **22 items** — equal to the header's own declared count
- ids dropped: exactly `F-1567-3`, `F-1566-3`, `F-1300-4`, `F-1567-1` — the four prose-only mentions
- ids lost that should have been kept: **none** (the reused set is a strict subset, and every one of the 18 findings + 4 slugs the desk actually lists survives)

**So this is a deletion, not a rewrite.** Do not write a third parser.

---

## Scope

1. **Make `desk()` in `scripts/desk-state-audit.mjs` ask `desk-carryforward-guard.mjs` for its items.** Import `deskTail` and `deskItems` and use them for **both** findings and slugs. Delete the local duplicate logic that this replaces. `desk()` keeps its exported signature and return shape — `{ kind: 'lock' | 'none' | 'desk', items: [{ id, type }] }` — and `type` is still `'finding'` for an F-ID-shaped key and `'slug'` otherwise, because `audit()` branches on it (`classifyFinding` vs `classifySlug`) and the tests assert it.

2. **Delete what becomes dead, and nothing else.** After (1) the module-level `FINDING` (global), `SLUG`, `DESK_WORD` and `KEY_ZONE` constants are unreferenced — remove them. ⚠️ **`FINDING_ONE` and `SUBJECT_CHARS` are still live** (`subjectRows`, `fallbackState`) — leave them. Run a grep for each name before deleting it; do not delete by assumption.

3. **Preserve the lock-line and no-desk exits exactly.** `isLockLine` is also exported by the carryforward guard; you may reuse it or keep the existing `line1.startsWith('ACTIVE')` test, but **state in your report which you chose and why**, and confirm the `SKIP` path and the `REFUSING — no desk header` path both still behave (there are existing tests for the first; F-1566-1 depends on it).

4. **Add tests to `scripts/desk-state-audit.test.mjs` that MANUFACTURE the defect.** A passing guard never executes its violation path, so a green tells you nothing about the red. At minimum:
   - a fixture whose desk tail carries an F-ID **in prose, outside any 🔺 segment**, asserting it is **not** among `desk().items` — this is the exact shape that produced the 26-vs-22;
   - a fixture with an F-ID cited **inside** a 🔺 segment but **past `KEY_ZONE`**, asserting the segment is keyed by its own leading id and not the late one;
   - an agreement test: for a realistic multi-item desk line, `desk(status).items.map(i => i.id)` **equals** `deskItems(deskTail(line1))` — one source of truth, asserted rather than hoped.

5. **Prove the RED on your own tree before you claim the GREEN.** With your new tests in place, restore **only** the old extraction line, run the suite, and record: how many tests fail, which ones, and the exact assertion text. Then restore the cure and record the green. **Report both numbers.** A cure whose test passes in both states has tested nothing.

6. **Measure the live board, and let it check itself.** Run the auditor against the **archived s1567 handoff line** — it is in `STATUS.md` as the `- **s1567 handoff (line-1 archive):** …` bullet; strip that prefix into a temp file outside the repo and pass `--status <that file>` (your own repo's line 1 is an `ACTIVE` lock for this whole run and will correctly `SKIP` — F-1566-1). **Expected: 22 items.** That line's own header says `— 22 awaiting a word`, so the assertion is self-checking: **report the parsed count and the declared count side by side.** ⚠️ If they disagree, that is a **finding to report, not a number to tune** — do not adjust `KEY_ZONE` or the regexes to make them match.

## Firewall

**TOUCH-ONLY:** `scripts/desk-state-audit.mjs` · `scripts/desk-state-audit.test.mjs` · `reviews/f1568-1-desk-audit-keying.md` (your report) · `artifacts/f1568-1-*` (any captured output).

**NO — these are task failures even if every suite is green:**
- **`scripts/desk-carryforward-guard.mjs` is READ-ONLY.** You are reusing it, not improving it. If you believe it is wrong, that is a finding in your report.
- **`scripts/findings-state-guard.mjs`, `package.json`, `tasks/**`, `STATUS.md`, `tasks/goals.json`** — untouched. The npm scripts already run this test file; nothing needs wiring.
- **Do not widen `scan()`'s vocabulary** (F-1261-1: s1565 measured that widening mints 3 conflicts against a baseline of 0 and reds `test:ledger-guards` every fire).
- **Do not change any verdict logic** — `classifyFinding`, `classifySlug`, `subjectState`, `subjectLedClosure` and the `--strict` exit rule are out of scope. This task changes **which items are audited**, never **how an item is judged**.
- **Do not edit `STATUS.md`** to make the count come out right.

## Self-check (run all; paste real numbers, not adjectives)

- `npx tsc --noEmit` → rc 0
- `npm run build` → green (record vite time + asset-diet bytes)
- `node --test scripts/desk-state-audit.test.mjs` → all pass; **record the file's test count before and after your additions**
- `npm run test:ledger-guards` → **record files / tests / pass / fail, and the chained-leaf count**; it must be green, and the test total must be **higher** than the 129 s1567 recorded (you are adding tests, so a flat number means they did not run)
- the RED proof of scope 5 → rc and failing-test names with the old line restored
- the live-board measurement of scope 6 → parsed count vs declared count
- No Playwright and no `test:node-guards` are owed: this slice touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/` or `src/entities/`. **Say so explicitly rather than claiming a green you did not take.**

**READY-FOR-GATES** + report: which of the two lock-line options you chose and why (scope 3) · the before/after test counts · the RED proof verbatim · the parsed-vs-declared live count · every constant you deleted with the grep that proved it dead · anything in `desk-carryforward-guard.mjs` you would change but did not.
