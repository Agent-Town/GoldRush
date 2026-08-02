# f1417-3 — surface the line-level residue inside the lane verdict

**FIRE-AUTHORED (attended review welcome)** — s1417, from F-1417-3 (`tasks/BACKLOG.md`, filed s1417) plus the freeze it measured and cured by hand this fire.

**Role / workdir:** lane-a — `worktrees/lane-a` (branch `lane/m3`). NOT the repo root.

**Pre-flight (SAFE-DUPE, runner-auto-commit aware):** confirm the lane is clean vs main BEFORE any reset.
Run `node scripts/lane-usable.mjs lane-a`. It must print **USABLE**.
If it prints **HOLDS** or **BUSY** — **STOP and report the word it printed.** Do not reset, do not `--cure`, do not proceed.
> 🔁 **ATTEMPT 2 — CHANGED PREMISE, NOT AN IDENTICAL RETRY (fire law §7.5). Attempt 1 (`20260803-050158`, 30,378 tokens, ZERO edits) STOPped right here, on `BUSY`, and it was RIGHT to per the words it was given — but the word was false (F-1418-1, cured s1418).** `lane-runner-v3.sh:131` writes `tasks/running/lane-a.pid` **in order to dispatch you**, and the old `busy` check was `existsSync()` **relative to cwd**. This master was the only one ever to say *"from the repo root"* — the one clarification that lets the check see that file — so it refused on **its own reflection**. The other 8 masters with this pre-flight survive only because `tasks/running/` is untracked and therefore absent from every lane worktree: a correct answer with no mechanism behind it. `isSlotBusy()` (`scripts/lane-usable.mjs:271`) now discounts a pidfile whose pid is one of **your own ancestors**, and anchors the path to the main repo root, so the answer is the same from either cwd. **If you still get BUSY, a genuinely foreign runner holds the slot — STOP as written.** ⓘ The cure changed `inspect()`'s `busy` INPUT; scope 4's firewall over verdict *selection* and the `RC` map is unchanged and still binding.
> ⓘ At authoring time (s1417) lane-a measured `ahead=0 behind=0 paths=0 tracked-dirt=0` — fully current with main, not merely usable. If that has changed, something landed after this master was written and it must be ruled on before you work.
> **FACTORY-CHURN EXCEPTION — these tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them, discard them, and PROCEED (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence (the **F-1266-1** exception the lane template has carried since s1266; screenshots are never byte-identity gated, so their bytes differ from main forever). So a **DIRTY** verdict caused *only* by these classes is **not** a STOP: discard them (`git checkout -- <paths>`) and proceed, listing what you discarded.
> ⓘ Note `scripts/lane-usable.mjs` already ignores exactly two of these by name (its `CHURN` constant: `logs/factory-usage.json`, `logs/usage-history.jsonl`) and will say so — *"N churn-only path(s) ignored"*. **The other logs files are NOT in that constant and will read as tracked dirt**, which is why this exception is written out rather than assumed. 🚫 **Do not "fix" that by widening `CHURN`** — it mirrors the runner's own exclusion pathspec (`lane-runner-v3.sh:121`) and widening it unilaterally desyncs them (see the NO list).
> ⓘ What still STOPs, unchanged and load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — i.e. anything a live drain or a concurrent task could actually own.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## READ-FIRST (paths, in this order)
1. `scripts/lane-usable.mjs:144` — `classify()`, which produces the `held[]` array and its `LANE-ONLY` / `BOTH-MOVED` kinds. This is the function whose OUTPUT you enrich. (**Coordinate re-based s1418 from `:131-151` by READING the file** — the F-1418-1 cure inserted ~90 lines above it. Cite the CODE; the coordinate rots.)
2. `scripts/lane-usable.mjs:281` (`inspect()`), `:304` (the `RC` map), `:306` (`report()`) — where the verdict is decided and printed. **The verdict logic is what you must NOT change.** (Re-based s1418 from `:203-270`, same reason.)
3. `scripts/lane-absorbed-lines.mjs` (whole file, 100 lines) — the line-level method that already exists as a separate CLI. Its `tokens()` helper and its UNDECIDABLE / BINARY handling are the parts that must survive the extraction unchanged.
4. `tasks/BACKLOG.md` — row **F-1417-3** (this slice's WHY, with the measured numbers), and row **F-1416-1** (why `lane-usable.mjs` is load-bearing for the whole fleet, and why a "cosmetic" bug in it was not cosmetic).
5. `scripts/fire.md` §2E — the paragraph beginning *"AND ASK IT WITH THE INSTRUMENT, NOT A FILE-LEVEL EYEBALL"*, which already names this class in law.

## WHY (quoted evidence, dated)

`scripts/fire.md` §2E, already law, verbatim: *"s1271 froze three lanes for days on the coarse file-level read and **two of them were never at risk**, while the third held 140 lines main had never seen — a conservative verdict at the wrong resolution is not safety, it is a different way of being wrong."*

F-1417-3 (s1417) measured the same class again. `lane-a` and `lane-c` sat frozen across multiple fires under standing *"do not reset"* orders, both reading **HOLDS**. Asked at line level, the entire residue was **8 lines**, and every one was a superseded older form — pre-cure twin-banks pins (`kills: 189`, `fnv1a32:5f57f7be`), positional `HeadlessContractSim(...)` constructor calls main had replaced with the object form, and the pre-cure `eliteKind === 'baron'` predicate that `1a4831df` fixed.

⚠️ **The honest lesson, and the reason this slice is deliberately narrow: `lane-absorbed-lines.mjs` reported `NOT ABSORBED` for BOTH lanes, and it was RIGHT to.** Those lines genuinely are absent from main. The judgement that they were *superseded rather than unseen* required reading main's copy and recognising each line's replacement — **that is a judgement call, and this slice must not pretend to automate it.**

**So the defect is not the verdict. The defect is that the verdict costs a second, manual, per-path tool invocation to interpret** — and a fire under budget pressure reads `HOLDS` plus a bare file list, sees no measure of how big the question is, and defers. Two lanes stayed frozen for exactly that reason.

**This slice makes the residue visible at the point of decision. It changes no verdict.**

## SCOPE (numbered; each item testable)

1. **Extract the line-level residue method into ONE shared, exported, pure function.**
   Create `scripts/lane-residue.mjs` exporting something like `residueFor({ diff, mainText })` → `{ status, added, missing }` where `status` is one of `ABSORBED` / `ABSORBED_TOKEN` / `NOT_ABSORBED` / `BINARY` / `UNDECIDABLE`.
   - It takes **TEXT, never a branch or a path** — the F-1416-1 lesson: that parser survived 117 sessions undetected precisely because nothing could reach it without a repo. Keep git I/O in the callers.
   - Move `tokens()` and the token-level superset fallback across **unchanged in behaviour**.
2. **Rewire `scripts/lane-absorbed-lines.mjs` to consume it**, deleting its now-duplicated inline logic. Its CLI output text and exit codes must be **byte-identical** to today's — verify by running it against `archive/lane-m3-s1417-superseded-e1bff1e8` before and after (see self-check 2). *(This is the "cured defect survives in the sibling script" hazard: two copies of this method is the thing to avoid, not a thing to add.)*
3. **Wire it into `scripts/lane-usable.mjs`'s REPORT ONLY.** For each `held[]` entry, compute and print the residue inline, e.g.:
   `HELD BOTH-MOVED  scripts/gr-sim.test.mjs  (5 of 88 added lines absent from main)`
   and beneath it print up to **3** sample missing lines, truncated to ~100 chars, so the reader sees *what kind* of thing is held.
   - `BINARY` / `UNDECIDABLE` paths print that word; they must never print a count.
4. 🚫 **THE VERDICT LOGIC IS UNCHANGED, AND THIS IS THE DELIVERABLE, NOT THE PRINTING.**
   `inspect()`'s choice among `USABLE` / `AHEAD-BUT-ABSORBED` / `HOLDS` / `DIRTY` / `BUSY`, and the `RC` map at `:216`, must be **untouched**. A path with zero residue still HOLDS. **Do not add an auto-downgrade, do not make `--cure` accept a HOLDS lane, do not "improve" this into a decision.** A fire rules; the tool measures.
   Pin this with an explicit test (self-check 4) — a test that asserts the verdict did *not* move is the one that makes this slice safe to land.
5. **New guard file `scripts/lane-residue.test.mjs`**, rooted in `test:node-guards` in `package.json` (insert **alphabetically**; the roster is **43** files as of `cf005d59` — count it yourself and report the number you found, per F-1411-3). Cases at minimum:
   - all added lines present in main → `ABSORBED`
   - one added line absent → `NOT_ABSORBED`, and `missing` contains exactly that line
   - whole-line differences whose tokens all appear in one main line → `ABSORBED_TOKEN`
   - a `Binary files` diff → `BINARY`, never a count
   - blank/whitespace-only added lines are ignored (today's behaviour — preserve it)
6. **Report-don't-fix:** if you find any *other* divergence between the two scripts' methods, write it in your report. Do not widen this slice to fix it.

## TOUCH-ONLY
- `scripts/lane-residue.mjs` (new)
- `scripts/lane-residue.test.mjs` (new)
- `scripts/lane-absorbed-lines.mjs`
- `scripts/lane-usable.mjs` — **report path only**
- `package.json` — the one alphabetical `test:node-guards` entry

## NO (firewall — violations are a STOP, report and halt)
- ❌ **`inspect()`'s verdict selection, the `RC` map, and `cure()` in `lane-usable.mjs`.** Read them; do not edit them. Scope 4 exists to protect exactly these.
- ❌ `classifyDirt()` / `dirt()` and the `CHURN` constant — F-1416-1's cure lives there and is guarded by `scripts/lane-usable-dirt-parse.test.mjs`. **Do not widen `CHURN`** (it mirrors the runner's own exclusion pathspec; widening it unilaterally desyncs them and re-opens F-1212-4's evidence hole).
- ❌ `scripts/lane-freeze-classify.mjs` — a third consumer of this class; out of scope by design.
- ❌ `scripts/lane-runner-v3.sh` — the runner is pid-live and its restart is owner-owed. Do not touch it.
- ❌ Any `src/**`, `e2e/**`, or contract JSON. This slice ships no game code.
- ❌ `tasks/goals.json` — the leaf flip is the DRAINING fire's paired act (F-1384-1). Leave it alone.
- ❌ Do not `git reset`, `--cure`, or otherwise mutate any lane branch while working. You are measuring the instrument, not using it on the fleet.

## SELF-CHECK (run these exact commands; paste real output)
1. `npx tsc --noEmit` → rc 0. `npm run build` → green, report the Vite time.
2. **Sibling-parity control, BEFORE and AFTER scope 2.** Run
   `node scripts/lane-absorbed-lines.mjs archive/lane-m3-s1417-superseded-e1bff1e8 assets/contracts/bench-seeds.json scripts/gr-sim.test.mjs src/sim/HeadlessContractSim.ts`
   on the pre-change tree and again after. **Paste both.** They must match, and the s1417 result is the known-good reference: `bench-seeds.json` ABSORBED · `gr-sim.test.mjs` NOT ABSORBED **5/88** · `HeadlessContractSim.ts` ABSORBED (token-level) 1 line.
3. **Prove the move is behaviour-neutral, do not assert it.** Scope 1 is a pure extraction; case 2 above IS that proof. If the two outputs differ in any byte, that is a **STOP** — report the diff and halt.
4. **Prove the verdict did not move.** Run `node scripts/lane-usable.mjs --all` before and after; paste both. Every lane's verdict WORD and exit code must be identical — at authoring time: **lane-a USABLE · lane-b HOLDS · lane-c USABLE · lane-d USABLE**. Only the held-path detail lines may differ. Add the assertion to `lane-residue.test.mjs` or a sibling if you can express it without a repo; if you cannot, say so plainly rather than faking it.
5. ⭐ **RED PROVEN BY MANUFACTURING THE DEFECT (the s1299/s1300 standard).** For at least one case in scope 5, break the implementation deliberately in a **scratch copy outside the repo** (fire.md §3.0b — never in main's working tree), run the guard, and paste the failing assertion. **A guard that is green on both the broken and the fixed tree certifies its own aim, not the fix.** If the red does not reproduce, that is a **STOP**: the instrument is broken, not the code.
6. `node scripts/lane-residue.test.mjs` → all pass; paste the tally.
7. Full battery: `npm run test:node-guards`. Report **tests / pass / fail / skipped** as four separate numbers. ⓘ In a lane shell the 3 F-1408-2 cross-engine cases DO run, so you may legitimately see 0 skipped where a fire sees 3 — **say which shell you were in** (F-1417-1).
8. No Playwright is required: this slice ships no rendering or player-facing surface. **State that explicitly rather than silently omitting it**, and confirm `src/` is untouched with `git diff --stat -- src` (must be empty).

## REPORT
End with **READY-FOR-GATES** and report:
- the guard-roster number you counted (scope 5), and whether it matched the 43 stated here;
- the before/after sibling-parity outputs (self-check 2) and the before/after `--all` verdicts (self-check 4);
- the manufactured RED (self-check 5), verbatim;
- which shell you ran in, and the four battery numbers;
- any second divergence you found between the scripts (scope 6) — **reported, not fixed.**

If any firewall item blocks you, **STOP and report** — do not work around it. Two fires have already died by trying to satisfy a probe that had been retired; the correct move when the task and the tree disagree is to say so.
