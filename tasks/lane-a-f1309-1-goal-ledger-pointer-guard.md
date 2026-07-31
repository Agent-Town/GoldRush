# lane-a — F-1309-1: teach the pointer guard to watch the goal ledger's LIVE gates

**FIRE-AUTHORED (attended review welcome) — s1309, 2026-08-01.**
**Role:** implementer. **Workdir:** `worktrees/lane-a` (branch `lane/m3`). One task, one branch, path-scoped commits.

## READ FIRST (paths, in this order)

1. `scripts/law-pointer-guard.mjs` — **the whole file, it is 207 lines.** Read its header docblock especially: it states what it checks, what it deliberately does NOT check, and the `ILLUSTRATIVE` grandfathering discipline ("excluded by NAME with a reason, never by pattern"). **You are extending this discipline, not replacing it.**
2. `scripts/law-pointer-guard.test.mjs` — the existing test, for the shape yours must match.
3. `scripts/drain-block-check.mjs` — specifically its `TERMINAL_CLOSED_STATUSES` constant. **You will reuse this definition by importing or re-deriving it from that file — do NOT retype a status list from memory or from this master.** (s1173's lesson: a guard matrix that paraphrases another guard's definitions measures a different thing than the guard does.)
4. `tasks/BACKLOG.md` — the **F-1309-1** row (the measurement this task exists to mechanise).
5. `tasks/goals.json` — the four `status: "blocked"` leaves. Read their `blockedReason` text.

## WHY (evidence, measured s1309 — do not re-litigate it)

`tasks/goals.json` `blockedReason` text is what `scripts/drain-block-check.mjs` **prints to a fire at §3.0, the first command of every drain.** It is a law surface in everything but name — and nothing watches its coordinates.

s1309 measured the whole population, not a sample. The 4 `blocked` leaves carry exactly **4** `file:line` pointers, and **all four pointed at the wrong line**:

| cited | actually at | what a reader lands on |
|---|---|---|
| `src/game/Game.ts:6352` (`endRun()`) | `:6600` | `this.territoryRingPresent = false;` |
| `tasks/BACKLOG.md:1063` (owner quote) | `:1709` | an unrelated QUEUED lane-c line |
| `playwright.config.ts:30` (`workers:`) | `:50` | prose about a different finding |
| `Game.ts:6669` (rf-34 divergent write) | unknown | `this.syncStockpileHoldings();` |

**The substance of all four claims survived re-measurement.** That is the `F-1276-2` shape exactly, and it is why this matters: the law is intact, the reader is misdirected, and *the honest inference from following a rotted pointer is that the mechanism was deleted* — a law violation that never happened.

The third row is the sharpest evidence that a hand-sweep cannot fix this class: **s1301 re-based that exact coordinate** (`:30`→`:50`) in `scripts/fire.md` and `.claude/skills/drain/SKILL.md`, and **did not know a third copy existed in the goal ledger.**

**The scope is set by a measurement, not by taste.** s1309 tried the obvious cure — adding `tasks/goals.json` to `SURFACES` — and reverted it byte-clean: it yields **497 NEW POINTER reds**, because the guard resolves bare basenames and the whole historical `note` corpus lands in the denominator. Worse, a blind `--update` would have **baselined all four rotten pointers as truth**, which is strictly worse than no guard.

➡️ **So the denominator is `blockedReason` on NON-TERMINAL leaves only: 4 pointers today.** Those are instructions a fire is told to act on. The ~493 `note`-field pointers on merged leaves are historical record — **they stay out, deliberately.**

## SCOPE (four slices; each ends in its own checkable checkpoint)

### 1. Add the ledger surface as a distinct source class

In `scripts/law-pointer-guard.mjs`, add a second collection path alongside the existing `SURFACES` text scan: for `tasks/goals.json`, walk the goal tree and extract pointers **only** from the `blockedReason` field of leaves whose `status` is **not** terminal.

- Reuse `drain-block-check.mjs`'s `TERMINAL_CLOSED_STATUSES` as the terminal definition (READ-FIRST item 3). If it is not currently exported, exporting it is **in scope** — but do not change its contents or any of its behaviour.
- Walk the tree by concatenating **both** `subgoals` and `tasks` on every node. ⚠️ Six nodes carry BOTH; a walker that takes one or the other silently drops 95 of 501 leaves. (s1309 made exactly this mistake and caught it only because the leaf count disagreed with the prior fire's.)
- Pointer ids must be distinguishable in `--report` output, e.g. `tasks/goals.json[<leaf-id>] -> Game.ts:6600`, so a red names the leaf a reader must go fix.

**Checkpoint:** `node scripts/law-pointer-guard.mjs --report` lists the ledger pointers with their resolved targets, and the pre-existing 6 surfaces / 14 pointers are **unchanged** in the same output.

### 2. Grandfather the ONE deliberately-rotten pointer, by name and with its reason

`rf-34-hero-y-restore-roundtrip`'s `Game.ts:6669` is **knowingly** rotten and its `blockedReason` says so in the text. It was not re-based because re-deriving a "first divergent write" needs the diagnosis re-run, not a lookup.

Add it to a `KNOWN_ROTTEN` map — same discipline as `ILLUSTRATIVE`: **keyed by name, carrying its reason as a string, never widened by pattern.** The `--report` output must show it in its own state (not silently as `ok`), so nobody mistakes the exclusion for a clean bill.

**Checkpoint:** the guard is green, and `--report` shows that pointer as excluded-with-reason rather than as `ok`.

### 3. Baseline the survivors — BY EYE, and say so

Run `--update` **only after** you have opened each of the three re-based pointers and confirmed the line supports the claim made about it. Paste each line into your report.

⚠️ **Do not baseline anything you did not look at.** The entire value of this guard is that adding a coordinate is the moment someone verifies it once; `--update` used as a way to make a red go away converts the guard into a rubber stamp — and that is precisely how the four rotten pointers would have been certified as truth.

**Checkpoint:** `node scripts/law-pointer-guard.mjs` exits **0** with the ledger pointers included in its headline count.

### 4. Prove it fails — MANUFACTURE the defect, do not trust the green

⚠️ **A passing guard never executes its violation path, so its green is not evidence about its red** (the s1299/s1301 standard, and the reason this factory has guards that actually fire).

Extend `scripts/law-pointer-guard.test.mjs` with a case that, against a fixture tree (use the existing `--root` flag — that is what it is for):
1. writes a `goals.json` whose non-terminal leaf's `blockedReason` cites a line, baselines it, asserts **rc 0**;
2. inserts a line **above** the cited line in the target file;
3. asserts the guard now exits **rc 1** and that its output **names that leaf id**.

Also record, in your report, one live mutation on the real tree: rot one of the three re-based coordinates by hand, show the guard goes **rc=1 naming the leaf**, revert it, and show `git diff` is **empty**.

**Checkpoint:** both transcripts pasted — the red and the reverted green.

## FIREWALL

**TOUCH-ONLY:**
- `scripts/law-pointer-guard.mjs`
- `scripts/law-pointer-guard.test.mjs`
- `scripts/law-pointer-baseline.json` (via `--update` only)
- `scripts/drain-block-check.mjs` — **export-only**: adding `export` to `TERMINAL_CLOSED_STATUSES` is permitted; changing its value or any behaviour is NOT.

**NO — out of scope, report if you see a problem, do not fix it:**
- `tasks/goals.json` — **do not edit the ledger.** If you find a fifth rotted pointer, or believe a re-based one is still wrong, **write it in your report**; a runner re-basing a live owner gate's text is not this task.
- Adding `note`-field or merged-leaf pointers to the denominator. Measured at ~493; explicitly excluded.
- Adding `tasks/goals.json` wholesale to `SURFACES`. Measured at 497 reds; that is the cure that does not work.
- `scripts/fire.md`, `CLAUDE.md`, `.claude/skills/**`, any `e2e/`, any `src/`.
- Any other guard in `test:node-guards`.

## SELF-CHECK (name the exact commands and paste real numbers)

1. `npx tsc --noEmit` → clean.
2. `npm run build` → rc 0.
3. `node --test scripts/law-pointer-guard.test.mjs` → all pass, including the new manufactured-red case.
4. `npm run test:node-guards` → **rc 0**. ⚠️ This guard is already rooted there, and a **new npm script would need rooting** — you are adding no new script, so `gate-caller-audit` should be unaffected; if it reds, report it rather than working around it.
5. `node scripts/law-pointer-guard.mjs --report` → paste the headline counts (surfaces, pointers, checked, illustrative, known-rotten) **before and after** your change.
6. `node scripts/drain-block-check.mjs --all` → still **BLOCKED on all four** owner gates. This is the negative control proving you changed a guard and not a gate.
7. `node --test scripts/goal-tracker.test.mjs` → 2/2, leaf census still **501 / 4 blocked**.

**No playwright, and say so rather than skipping it silently:** this task touches a node guard and its test. Zero `src/`, zero `e2e/`, no runtime surface to drive.

**READY-FOR-GATES + report:** the before/after `--report` headlines · the three by-eye verified lines from slice 3 · both transcripts from slice 4 (fixture red + live mutation red, and the reverted empty diff) · any fifth rotted pointer you found and did **not** fix.
