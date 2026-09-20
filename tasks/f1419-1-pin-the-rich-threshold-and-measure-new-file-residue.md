# f1419-1 — pin the RICH threshold, and give a new file a residue count instead of a shrug

**FIRE-AUTHORED (attended review welcome)** — s1419, from **F-1419-1** and **F-1419-2**, both measured by the s1419 drain of `f1417-3` and recorded in `reviews/f1417-3.md` and `tasks/BACKLOG.md`.

**Role / workdir:** lane-a — `worktrees/lane-a` (branch `lane/m3`). NOT the repo root.

**Pre-flight (SAFE-DUPE, runner-auto-commit aware):** confirm the lane is clean vs main BEFORE any reset.
Run `node scripts/lane-usable.mjs lane-a`. It must print **USABLE**.
If it prints **HOLDS** or **BUSY** — **STOP and report the word it printed.** Do not reset, do not `--cure`, do not proceed.
> ⓘ At authoring time (s1419) lane-a measured `ahead=0 behind=0 paths=0 tracked-dirt=0` — cured by `--cure` this fire (tip archived to `archive/lane-m3-s1419-absorbed-ef5045f1` and **pushed to origin before the reset**), then reset onto main at `a590e132`. If that has changed, something landed after this master was written and it must be ruled on before you work.
> ⓘ The **F-1418-1** cure (`0b55cfa2`) is in your base: `isSlotBusy()` discounts a pidfile whose pid is one of your own ancestors and anchors the path via `--git-common-dir`, so the check no longer refuses on its own dispatch. **If you still get BUSY, a genuinely foreign runner holds the slot — STOP as written.**
> **FACTORY-CHURN EXCEPTION — these tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them, discard them, and PROCEED (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence (the **F-1266-1** exception, since s1266; screenshots are never byte-identity gated, so their bytes differ from main forever). So a **DIRTY** verdict caused *only* by these classes is **not** a STOP: discard them (`git checkout -- <paths>`) and proceed, listing what you discarded.
> ⓘ `scripts/lane-usable.mjs` already ignores exactly two of these by name (its `CHURN` constant: `logs/factory-usage.json`, `logs/usage-history.jsonl`) and will say so — *"N churn-only path(s) ignored"*. **The other logs files are NOT in that constant and will read as tracked dirt**, which is why this exception is written out rather than assumed. 🚫 **Do not "fix" that by widening `CHURN`** — it mirrors the runner's own exclusion pathspec (`lane-runner-v3.sh:121`) and widening it unilaterally desyncs them (see the NO list).
> ⓘ What still STOPs, unchanged and load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — i.e. anything a live drain or a concurrent task could actually own.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## READ-FIRST (paths, in this order)
1. `scripts/lane-residue.mjs` (whole file, 31 lines) — the pure function shipped by `f1417-3` at `c267809c`. **`const RICH = 8` is at `:21`** and the comment above the fallback states its own worst case. (Cite the CODE; the coordinate rots.)
2. `scripts/lane-residue.test.mjs` (whole file, 7 cases) — the guard you extend. Case 3 (`token-rich lane lines can be absorbed by a main superset line`) is the one that exercises the fallback from the *permitting* side; you are adding the *refusing* side.
3. `scripts/lane-usable.mjs:307` — `residueForHeld()`, the eight-line function whose single `try` is F-1419-2's whole mechanism. Also read `:305` (the `RC` map), `:282` (`inspect()`) and `:317` (`formatHeldResidue`) so you know what you must NOT touch.
4. `reviews/f1417-3.md` — sections **F-1419-1** and **F-1419-2**, which carry the measured fixtures and the exact before/after strings you must reproduce.
5. `tasks/BACKLOG.md` — rows **F-1419-1**, **F-1419-2** and the `f1417-3 SHIPPED` row directly above them.

## WHY (quoted evidence, dated)

**F-1419-1 (s1419, measured during the `f1417-3` drain).** `scripts/lane-residue.mjs` gates its token-level fallback behind `RICH = 8` distinct tokens. The code's own comment, carried across the extraction unchanged, names why:

> *"Guarded deliberately: the fallback only applies to token-RICH lines. A short code line (`return false;`) has so few distinct tokens that some unrelated main line will contain them all by chance, which would manufacture a false ABSORBED on exactly the case that matters most. Below the threshold, line-level stands."*

**Setting `RICH = 0` leaves all seven guard cases green.** The s1419 drain manufactured three defects against this file; two reddened the guard and this one did not. Measured hazard, verbatim from `reviews/f1417-3.md`:

```
diff     : '+  return false;'
mainText : 'function f() {\n  // return false is handled by the caller below\n  return true;\n}'

SHIPPED RICH=8 : NOT_ABSORBED  ["  return false;"]   ← correct: the lane holds it
DEFECT  RICH=0 : ABSORBED_TOKEN []                    ← FALSE ABSORBED
```

⚠️ **This is the destructive direction.** `scripts/fire.md` §2E's `--cure` path resets a lane judged absorbed; a false ABSORBED is how a lane holding content main has never seen gets `reset --hard`. That is Mistake #2, the Reset Massacre, reached by a different road.

**F-1419-2 (s1419, same drain).** `residueForHeld()` wraps both git reads in one `try`, and **both** failure modes collapse to `UNDECIDABLE`: (1) the path does not exist at the lane's **base** — a file the lane created; (2) the path does not exist in **main** — a LANE-ONLY new file. Both are exactly the case where the lane holds the most content main has never seen, and the report answers with the least information it can give. Observed live, on `f1417-3`'s own output:

```
HELD LANE-ONLY  scripts/lane-residue.mjs       (UNDECIDABLE)
HELD LANE-ONLY  scripts/lane-residue.test.mjs  (UNDECIDABLE)
```

plus a bare `fatal: path '…' exists on disk, but not in <base>` leaking to stderr. The correct answer for a file main has never held is *"all N added lines absent from main"* — the strongest statement the tool can make, and a catch is swallowing it.

⚠️ **Neither finding was introduced by `f1417-3`.** `RICH = 8` came across unchanged and the byte-identical sibling-parity control proves the extraction was behaviour-neutral. What that slice changed is that both are now **cheaply fixable**, because the method is a pure exported function instead of a closure nothing could reach — the F-1416-1 gift.

## SCOPE (numbered; each item testable)

1. **Pin `RICH` from the refusing side.** Add at least two cases to `scripts/lane-residue.test.mjs`:
   - a **token-poor** lane line whose tokens all appear in one unrelated main line → must be **`NOT_ABSORBED`**, and `missing` must contain exactly that line. Use the fixture from the WHY block verbatim; it is known to discriminate.
   - the **boundary**: a lane line with exactly `RICH` distinct qualifying tokens, all covered by one main line → `ABSORBED_TOKEN`; the same line one token shorter → `NOT_ABSORBED`.
   The point of these cases is that **changing `RICH` must red the guard.** Prove that in self-check 3.
   - 🚫 **Do NOT change the value of `RICH`, and do not make it configurable.** `8` is the shipped behaviour and this slice is pinning it, not tuning it. If you believe another value is better, that is a finding for your report, not an edit.
2. **Split the two git reads in `residueForHeld()` so a new file gets a count instead of a shrug.**
   - `git diff base:path branch:path` failing (**path absent at base** — the lane created it): fall back to a diff the function *can* take, e.g. against the empty tree / `git show branch:path` rendered as all-added lines, so `added` is populated.
   - `git show main:path` failing (**path absent in main**): this is *not* undecidable. Main holds nothing, so every added line is absent from main. Return `NOT_ABSORBED` with `missing === added`.
   - Reserve `UNDECIDABLE` for what it means: **the function was handed something it cannot read** (non-string input), which is the existing `residueFor()` contract at `scripts/lane-residue.mjs:1-4`. Do not widen that meaning.
   - Silence the `fatal:` stderr leak from the probing git calls (`stdio` on the failing call), so the report stays readable. **Do not** silence stderr globally for the script.
3. **Keep `BINARY` exactly as it is.** A binary path must still print the word and never a count. Add a case if one does not already cover the new path.
4. 🚫 **THE VERDICT LOGIC IS UNCHANGED — this is the same firewall `f1417-3` shipped under, and it is still the deliverable.** `inspect()`'s selection among `USABLE` / `AHEAD-BUT-ABSORBED` / `HOLDS` / `DIRTY` / `BUSY` (`:282`), the `RC` map (`:305`), and `cure()` must be **byte-identical**. A path whose residue you newly count as `NOT_ABSORBED` **still HOLDS, exactly as it did when it read UNDECIDABLE** — you are changing what the report says, never what the tool decides. Prove it with self-check 4.
5. **Report-don't-fix:** if you find any other case where a `catch` converts an answerable question into `UNDECIDABLE`, write it in your report. Do not widen this slice.

## TOUCH-ONLY
- `scripts/lane-residue.test.mjs` — new cases
- `scripts/lane-residue.mjs` — **only** if scope 2 needs a new entry point; the `RICH` value and the existing statuses stay as they are
- `scripts/lane-usable.mjs` — **`residueForHeld()` only**

## NO (firewall — violations are a STOP, report and halt)
- ❌ **The value `RICH = 8`.** Scope 1 pins it; it does not tune it.
- ❌ **`inspect()`'s verdict selection, the `RC` map, and `cure()`.** Read them; do not edit them. Scope 4 exists to protect exactly these.
- ❌ `classifyDirt()` / `dirt()` and the `CHURN` constant — F-1416-1's cure lives there, guarded by `scripts/lane-usable-dirt-parse.test.mjs`. **Do not widen `CHURN`** (it mirrors the runner's own exclusion pathspec; widening it unilaterally desyncs them and re-opens F-1212-4's evidence hole).
- ❌ `isSlotBusy()` and its ancestor chain — F-1418-1's cure, guarded by `scripts/lane-usable-busy-self.test.mjs`. **Do not "simplify" its fail-safe branches and do not re-admit pid 1**; one of those directions is destructive.
- ❌ `scripts/lane-absorbed-lines.mjs` — its CLI output is a **byte-identical parity reference** (`reviews/f1417-3.md`, self-check 2). If your scope-2 change would alter its output, that is a **STOP**: report it rather than accepting the drift.
- ❌ `scripts/lane-freeze-classify.mjs` — a third consumer of this class; out of scope by design.
- ❌ `scripts/lane-runner-v3.sh` — the runner is pid-live and its restart is owner-owed. Do not touch it.
- ❌ Any `src/**`, `e2e/**`, or contract JSON. This slice ships no game code.
- ❌ `tasks/goals.json` — the leaf flip is the DRAINING fire's paired act (F-1384-1). Leave it alone.
- ❌ Do not `git reset`, `--cure`, or otherwise mutate any lane branch while working. **`lane-b` in particular is under a standing do-not-reset order.** You are measuring the instrument, not using it on the fleet.

## SELF-CHECK (run these exact commands; paste real output)
1. `npx tsc --noEmit` → rc 0. `npm run build` → green, report the Vite time.
2. **Sibling-parity control, BEFORE and AFTER your change** — the same one that gated `f1417-3`:
   `node scripts/lane-absorbed-lines.mjs archive/lane-m3-s1417-superseded-e1bff1e8 assets/contracts/bench-seeds.json scripts/gr-sim.test.mjs src/sim/HeadlessContractSim.ts`
   **Paste both.** They must be **byte-identical**, rc 1 both. The known-good reference: `bench-seeds.json` ABSORBED 3 · `gr-sim.test.mjs` NOT ABSORBED **5/88** · `HeadlessContractSim.ts` ABSORBED (token-level) 1 line. Any byte of drift is a **STOP**.
3. ⭐ **RED PROVEN BY MANUFACTURING THE DEFECT (the s1299/s1300 standard).** In a **scratch copy outside the repo** (`scripts/fire.md` §3.0b — never in main's working tree), set `const RICH = 0` and run the guard. **It must now FAIL**, and it must fail on a case you added in scope 1. Paste the failing assertion verbatim. ⚠️ **If it stays green, scope 1 is not done** — that is precisely the state s1419 found and this slice exists to end. Restore the scratch copy and re-run green.
   ⓘ Do the same for scope 2: break your new missing-in-main branch (e.g. return `UNDECIDABLE` again) and show a case reddening. **A guard green on both the broken and the fixed tree certifies its aim, not the fix.**
4. **Prove the verdict did not move.** Run `node scripts/lane-usable.mjs --all` before and after; paste both. Every lane's verdict WORD and the exit code must be identical — at authoring time: **lane-a USABLE · lane-b HOLDS · lane-c USABLE · lane-d USABLE**, rc 0. Only the held-path detail lines may differ, and lane-b's two `LANE-ONLY` e2e specs are the ones expected to *change* from a count to a count (they already report counts) while any `UNDECIDABLE` line should become a real number.
   ⚠️ **Anchor your verdict extraction at line start (`/^  => /`).** s1419 nearly filed a false finding here: a naive `=> ` match hit `() => Math.round(…)` inside a printed *sample residue line* and reported the verdicts as differing when they were identical.
5. `node --test scripts/lane-residue.test.mjs` → all pass; paste the tally.
6. Full battery: `npm run test:node-guards`. Report **tests / pass / fail / skipped** as four separate numbers, and **say which shell you were in** — in a lane shell the 3 F-1408-2 cross-engine cases DO run, so you may legitimately see 0 skipped where a fire sees 3 (F-1417-1). Also report the **guard-roster file count** you counted; it was **45** at `c267809c`, and you are adding no new file unless you choose to, so state the number you found (F-1411-3).
7. No Playwright is required: this slice ships no rendering or player-facing surface. **State that explicitly rather than silently omitting it**, and confirm `src/` is untouched with `git diff --stat -- src` (must be empty).

## REPORT
End with **READY-FOR-GATES** and report:
- the before/after sibling-parity outputs (self-check 2) and the before/after `--all` verdicts (self-check 4);
- **both** manufactured REDs (self-check 3), verbatim — the `RICH` one is the headline;
- which shell you ran in, the four battery numbers, and the roster count;
- the new report line for a LANE-ONLY new file, showing the count that replaced `UNDECIDABLE`;
- any other `catch`-swallows-an-answer case you found (scope 5) — **reported, not fixed.**

If any firewall item blocks you, **STOP and report** — do not work around it. The correct move when the task and the tree disagree is to say so.
