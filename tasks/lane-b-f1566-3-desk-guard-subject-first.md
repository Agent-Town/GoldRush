# Task f1566-3: close the desk guard's citation-shaped FAIL-OPEN (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1566, from a measurement taken this fire, on the tool merged this fire.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `scripts/desk-carryforward-guard.mjs` **in full, including its header** — it explains why its closure exit deliberately calls the shared `scan()` rather than re-implementing "closed" (F-1261-1), and that reasoning stays intact; `scripts/desk-state-audit.mjs` (merged s1566 `1eb13cff` — the subject-first reader you will reuse); `scripts/findings-state-guard.mjs` (the exported `scan()`, **read it, do not infer it, and do not edit it**); `reviews/f1565-1-desk-state-audit.md` (the predecessor's verdict and its two findings).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to `artifacts/**`, `reviews/shots-*` and any `.png` are NEVER "work" and NEVER a STOP** — discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH before any edit).** Each key is a single line, verified to print `1` on main AND in this lane at dispatch (s1566):

```
grep -Fc "export function audit(statusText, backlogText, goals = {}) {" scripts/desk-state-audit.mjs
grep -Fc "(id) => !acknowledged(line1, id) && !closed.get(id)?.closed.length," scripts/desk-carryforward-guard.mjs
```

Both MUST print `1`. If either prints `0`, **STOP and report "lane-b stale: <which key> missing"**. Do NOT read a `0` as "the file changed shape" and improvise — the first key proves the s1566 merge is present, the second proves the exact line you are here to change is still the exact line.

---

## Why (measured s1566, and it CORRECTS the direction F-1561-5 asserted)

`desk-carryforward-guard` exists because s1527 dropped ten owner-desk items in one handoff with no reason given (F-1533-1). A drop passes the guard on exactly two grounds: an explicit `DESK-DROPPED:` clause, **or** BACKLOG recording the id closed. The second is implemented at `scripts/desk-carryforward-guard.mjs:201–203`:

```js
const silent = dropped.filter(
  (id) => !acknowledged(line1, id) && !closed.get(id)?.closed.length,
);
```

`closed` is `scan(backlogText, { closedVocabulary: 'wide' })`. ⚠️ **`scan()` attributes a row's state to EVERY F-ID inside that row's 90-character subject zone, not only to the row's subject.** So an id that is merely *cited* by another finding's closure row is recorded as closed — and the desk guard will then let that id leave the desk in silence.

📊 **MEASURED s1566 on the live `tasks/BACKLOG.md`: the wide census calls 343 ids closed, and 21 of them (6.1%) have NO subject-led closure row at all** — their closure is attributed purely by citation:

```
F-1541-2 closed@85   but that row's subject is F-1542-1
F-1264-3 closed@959  but that row's subject is F-1264-1
F-1176-1 closed@1337 but that row's subject is F-1175-3
F-1200-2 closed@1356 but that row's subject is F-1200-3
… 21 total: F-1541-2 F-1264-3 F-1271-5 F-1252-3 F-1252-2 F-1176-1 F-1200-2 F-1201-2
  F-1152-3 F-1154-3 F-1150-4 F-1060-2 F-1079-6 F-1081-8 F-1130-4 F-1137-2 F-1222-3
  F-1449-1 F-1467-1 F-1464-1 F-1259-2
```

⚖️ **This is a FAIL-OPEN, and that matters because the law currently says the opposite.** F-1561-5 states this guard *"fails SAFE (over-strict), never open — which is why it is filed and not rushed."* That is true of the **`OPEN-DESK-ONLY`** half (an open `🔺` row the census cannot see makes the guard over-strict). It is **false of the closure exit**, which the same measurement shows can be satisfied by a citation. The guard built to stop silent drops can currently permit one.

✅ **Exposure TODAY is zero, and you should not treat that as reassurance.** Cross-checking the 21 against the 22 items s1565 carried: **no overlap**, and `desk-state-audit` reports `CLOSED=0` for the whole live desk. So this is **latent, not live** — which is exactly the moment to fix it, before the coincidence changes. Do not widen scope hunting for a live victim; there isn't one.

➡️ **THE CURE, and why it is small: the correct reader already shipped this fire.** `scripts/desk-state-audit.mjs` classifies subject-first — a row states the state only of the FIRST F-ID in its 90-char subject zone — and that rule was checked by hand against all three live double-state conflicts before it merged. This task makes the desk guard's closure exit ask **that** question instead of the raw census one. **It does NOT touch `scan()`** (F-1261-1: one implementation of "closed"), and it does NOT widen any vocabulary — s1565 measured that widening mints 3 conflicts against a baseline of 0 and reds `test:ledger-guards` on every fire.

---

## Scope

1. **Export the predicate from `scripts/desk-state-audit.mjs` — do not re-implement it in the guard.** The subject-first logic lives in `subjectRows()` + `classifyFinding()` there. Export one small function the guard can call, e.g. `subjectLedClosure(backlogText, id)` returning the evidence line numbers of **subject-led** closure rows for `id` (empty array = not closed by this standard). Build it from the SAME code path the auditor's verdicts use — if that means lifting a helper so both call it, do that; **two implementations of "subject-first" would repeat the exact mistake F-1261-1 names.** Keep the auditor's existing exports and CLI output byte-identical.

2. **`desk-carryforward-guard`'s closure exit consults it.** Replace `!closed.get(id)?.closed.length` with the subject-first predicate. Keep the `wide` vocabulary (the header explains why `narrow` is wrong here: 56 ids are closed only by a bullet-led row). Keep the `DESK-DROPPED:` exit exactly as it is — that path is the fire's own claim and is unaffected.

3. **Update the guard's header comment honestly.** The block at `:61–:69` explains the closure exit's design. Add the correction: the exit uses `scan()` as before, but attribution is now subject-first, and say why in one or two sentences with the measured figure (21 of 343). Do not delete the existing reasoning — it is still correct about *which* implementation of "closed" is used.

4. **Prove BOTH directions, and prove the RED by manufacturing it.** Extend `scripts/desk-carryforward-guard.test.mjs` (or add `scripts/desk-guard-subject-first.test.mjs` — say which and why), fixture-driven, **never the live board**:
   - **THE RED (the whole point):** previous desk carries `F-AAAA-1`; this desk drops it; BACKLOG's only mention is `F-AAAA-1` sitting inside the subject zone of `- ✅ **F-BBBB-2 CLOSED — supersedes F-AAAA-1.**`. **Before your change this passes** (the drop is silently permitted); **after it, the guard reports the drop and exits 1.** Assert the exit code and that the id is named in the failure output.
   - **NO REGRESSION:** the same drop, but BACKLOG carries a genuine subject-led `- ✅ **F-AAAA-1 CLOSED …**` row → still passes, exit 0.
   - **THE OTHER EXIT IS UNTOUCHED:** a dropped item with no closure anywhere but an explicit `DESK-DROPPED: F-AAAA-1 — …` clause on line-1 → passes, exit 0.
   - **REFUSAL PRESERVED:** no previous handoff desk, or a previous desk with zero items → still exit 2 (the anti-vacuous stance at `:73–:77`; do not weaken it).
   - **MID-FIRE SKIP PRESERVED:** an `ACTIVE` line-1 → SKIP, exit 0.

5. **Assert the live board does not change verdict.** Narrowing a closure exit makes the guard STRICTER, so it could red the board. Run `node scripts/desk-carryforward-guard.mjs --report` on the lane's board **before and after** your change and put both outputs in your report. ⚠️ **The lane's `STATUS.md` / `tasks/BACKLOG.md` are stale relative to main — say so and do NOT assert them as main's state** (the s1565 lesson; blob hashes differ). If the verdict changes from PASS to FAIL, **STOP and report the ids** rather than adjusting the predicate to make a red go away — a real silent drop surfacing is a FINDING, not a bug in your change.

6. **Register the test.** If you added a new file, append it to the existing `test:ledger-guards` `node --test` list in `package.json`. **Do NOT add a new npm script** — an unrooted script reds `gate-caller-audit`.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first.

---

## Firewall

**Touch ONLY:** `scripts/desk-carryforward-guard.mjs` · `scripts/desk-state-audit.mjs` (export/refactor for reuse ONLY — no behaviour change to its CLI or verdicts) · `scripts/desk-carryforward-guard.test.mjs` and/or one new `scripts/*.test.mjs` · `package.json` (ONE edit: the `test:ledger-guards` file list) · `artifacts/f1566-3-desk-guard-subject-first/**` (new).

**NO changes to:** `scripts/findings-state-guard.mjs` (F-1261-1 — one implementation of "closed"; you import it, you never edit it) · `scripts/desk-declaration-guard.mjs` · `scripts/desk-birth-guard.mjs` · `STATUS.md` · `tasks/BACKLOG.md` · `tasks/goals.json` · `scripts/fire.md` · `CLAUDE.md` · any other `package.json` script · `src/**` · `e2e/**` · `specs/**` · any existing test's assertions.

## Self-check before READY-FOR-GATES

- `npx tsc --noEmit` rc 0 · `npm run build` green.
- `node --test` on your test file: all pass, and **the manufactured red proved by temporarily reverting your predicate** (a passing guard never executes its violation path — record the failing run's output, then restore).
- The full `test:ledger-guards` set: report the file count, test count, pass/fail, **and every chained leaf**. Compare against the pre-change numbers (s1566 baseline on main: **15 files / 124 tests / 124 pass / 0 fail, plus 12/12 chained leaves**).
- No Playwright owed (this slice touches no `src/**` or `e2e/**`); no `test:node-guards` owed (touches none of `src/sim/`, `src/systems/`, `src/entities/`).
- Write `artifacts/f1566-3-desk-guard-subject-first/report.md`: what you changed, the before/after `--report` outputs with the staleness caveat, the manufactured-red evidence, and the exact test counts.

**READY-FOR-GATES** — report: the manufactured red's output before and after, the live-board verdict both sides of the change, the `test:ledger-guards` counts, and any id that newly surfaces as a silent drop (that is a finding for the drain, not something for you to fix).
