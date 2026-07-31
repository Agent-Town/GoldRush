# lane-a — F-1310-1: ban line coordinates into BACKLOG from the ledger's live owner gates

**FIRE-AUTHORED (attended review welcome) — s1310, 2026-08-01.**
**Role:** implementer. **Workdir:** `worktrees/lane-a` (branch `lane/m3`). One task, one branch, path-scoped commits.

## READ FIRST (paths, in this order)

1. `scripts/law-pointer-guard.mjs` — **the whole file.** It already walks `tasks/goals.json` and collects
   `file:line` pointers from `blockedReason` on non-terminal leaves (shipped s1310, `a180b468`). You are adding
   **one more rule to a walk that already exists** — not a new script, not a new npm entry.
   Read its header docblock: the `ILLUSTRATIVE` / `KNOWN_ROTTEN` discipline is *excluded by NAME with a reason,
   never by pattern*. Read the **KNOWN GAP** paragraph too — it explains why extensionless shorthand is not
   resolved, and why that reasoning does **not** apply here (see WHY below).
2. `scripts/law-pointer-guard.test.mjs` — the shape your test must match, especially the `--root` fixture helper.
3. `reviews/f1309-1-goal-ledger-pointer-guard.md` — findings **F-1310-1** and **F-1310-2**, the measurement.
4. `tasks/goals.json` — the four `status: "blocked"` leaves. Read `e1-hold-the-claim-defeat-fork` and
   `vp-02e-jumper-8way-activation`: both now cite BACKLOG **by content**, and both record their own history
   with line numbers **spelled as prose**. That is the convention you are mechanising.

## WHY (evidence, measured s1310 — do not re-litigate it)

`blockedReason` on a non-terminal leaf is what `scripts/drain-block-check.mjs` prints to a fire at **§3.0, the
first command of every drain**. A rotted coordinate there does not merely mislead — *the honest inference from
following it is that the mechanism was **deleted***, i.e. a fire concludes an owner gate's basis has been
removed when it has not.

**Both** BACKLOG line-coordinates that existed in that text were rotted. That is 2 of 2, the population:

| leaf | cited | actually | drift |
|---|---|---|---|
| `e1-hold-the-claim-defeat-fork` | `tasks/BACKLOG.md:1709` | blank line; quote 2 lines below | +2, **inside its own cure commit** |
| `vp-02e-jumper-8way-activation` | `BACKLOG:1557` | a worktree table row about `map-fix-early` | **571 lines** |

⚠️ **The first one is the sharp case and it is why a shape ban beats a drift guard here.** s1309 read the file,
found the quote, and wrote the coordinate correctly — then **in the same commit prepended a 2-line finding row
at BACKLOG line ~21**, pushing the quote down before the commit landed. Measured across the last 25 commits
touching the file: **2206 → 2240 lines, growth at the TOP.** Findings are *prepended*, so **every deep BACKLOG
coordinate rots on every fire that files one.** A drift guard would therefore red nearly every fire on a
coordinate that is about to rot again — training `--update` into the rubber stamp the guard exists to prevent.

➡️ **So the rule is a SHAPE BAN, not a fingerprint: in a non-terminal `blockedReason`, a line coordinate into
BACKLOG is wrong by construction.** Cite by content (grep target); write historical line numbers as prose.

**Why this does NOT reopen the guard's documented KNOWN GAP.** That gap exists because resolving `v3:137`
requires *guessing which file `v3` means*, and a guard that guesses is worse than one with a stated blind spot.
Here there is **nothing to guess**: `BACKLOG` names exactly one file in this repo, and the rule does not resolve
the pointer at all — it **rejects the shape**. No resolution, no guess.

**Current population is ZERO** (measured s1310 after both cures). This task ships a guard that is **green on
arrival**, so its entire value rests on the manufactured red in scope 3.

## SCOPE (three slices; each ends in its own checkable checkpoint)

### 1. The rule

In `scripts/law-pointer-guard.mjs`, inside the **existing** `tasks/goals.json` walk, add a check on the
`blockedReason` of every **non-terminal** leaf: if the text matches a BACKLOG line-coordinate shape — both
spellings, `tasks/BACKLOG.md:<n>` and bare `BACKLOG:<n>` (also `BACKLOG.md:<n>`) — that is a **problem**, not a
pointer to resolve.

- Reuse the leaf-walk and the terminal-status derivation **already in the file**. Do not add a second walk and
  do not retype a status list.
- The message must name the **leaf id** and the offending text, and must state the cure in one line, e.g.
  `BACKLOG COORDINATE  tasks/goals.json[<leaf>] — "BACKLOG:1557". Cite BACKLOG by CONTENT (a grep target); write historical line numbers as prose. Coordinates into this file rot on every fire that files a finding.`
- ⚠️ **`--update` MUST NOT be able to silence it.** This is a shape ban with no fingerprint, so it must be
  reported from the problem path and never enter the baseline. **Prove this in scope 3.**
- Do not add it to `ILLUSTRATIVE` or `KNOWN_ROTTEN` handling; those grandfather *resolvable* pointers.

**Checkpoint:** `node scripts/law-pointer-guard.mjs` still exits **0** on the live tree (population is zero),
and `--report` headline counts are **unchanged** from `7 surfaces / 19 pointers / 16 checked / 2 illustrative /
1 known-rotten`.

### 2. Say so in the header

Extend the docblock's "WHAT IT CHECKS — AND WHAT IT DOES NOT" list with the new rule and one sentence of its
reason (coordinates into an append-at-top ledger are unmaintainable by construction). Keep it to a few lines,
in the file's existing voice.

⚠️ **Do not renumber, re-base, or reflow the coordinates already cited elsewhere in that docblock.** Inserting
lines in a law surface rots pointers *into* it — that is this guard's own subject, and `law-pointer-guard`
watches `scripts/fire.md` and `.claude/skills/**`, which cite lines in other files, not in this one. If your
edit reds the guard, **report it rather than working around it.**

**Checkpoint:** `node scripts/law-pointer-guard.mjs` exits **0**; `npm run test:node-guards` rc **0**.

### 3. Prove it fails — MANUFACTURE the defect, and prove `--update` cannot bury it

⚠️ **A passing guard never executes its violation path, so its green is not evidence about its red.** The
population is zero today, so this slice is the *only* evidence this task produces.

Extend `scripts/law-pointer-guard.test.mjs`, against a `--root` fixture:

1. a `goals.json` whose **non-terminal** leaf's `blockedReason` cites `tasks/BACKLOG.md:42` → assert **rc 1**
   and that stdout names the leaf id;
2. **run `--update` on that same fixture, then re-run the check → assert it is STILL rc 1.** This is the
   load-bearing assertion of the whole task: a baseline must not be able to certify the shape as acceptable;
3. the bare spelling `BACKLOG:42` in a non-terminal leaf → **rc 1** (this spelling is invisible to the
   existing `POINTER` regex, which is exactly why it was missed for 571 lines);
4. the same text on a **terminal** leaf (e.g. `status: "merged"`) → **rc 0**. Historical record stays out; the
   rule binds only the text a fire is told to act on.

Also record, in your report, one **live-tree** mutation: hand-insert `tasks/BACKLOG.md:1` into a real
non-terminal `blockedReason`, show the guard goes **rc 1 naming that leaf**, revert it, and show `git diff` is
**empty**. ⚠️ You may mutate `tasks/goals.json` **only** as this transient probe, and you must revert it —
see the firewall.

**Checkpoint:** all four fixture assertions pass; both live-tree transcripts pasted (the red, and the reverted
empty diff).

## FIREWALL

**TOUCH-ONLY:**
- `scripts/law-pointer-guard.mjs`
- `scripts/law-pointer-guard.test.mjs`

**NO — out of scope, report if you see a problem, do not fix it:**
- `tasks/goals.json` — **do not land any edit to the ledger.** The scope-3 live probe is transient and must be
  reverted in the same step; if `git status` shows it modified at the end of your run, that is a **failure**,
  not a deliverable. Re-pointing a live owner gate is a fire's act, not a runner's.
- `scripts/law-pointer-baseline.json` — **this task must not change the baseline at all.** The population is
  zero, so a baseline diff means you resolved the shape instead of rejecting it.
- Widening the `POINTER` regex to capture extensionless shorthand generally (`v3:137`). Explicitly rejected —
  see WHY. This rule is narrow to BACKLOG **because that filename is unambiguous**.
- Adding `note`-field or terminal-leaf text to the denominator (~493 + 3 measured; historical record).
- `scripts/drain-block-check.mjs`, `scripts/fire.md`, `CLAUDE.md`, `.claude/skills/**`, any `e2e/`, any `src/`.
- Any other guard in `test:node-guards`; and **add no new npm script** (`gate-caller-audit` roots gates, and a
  new unrooted script reds it — you are extending a guard that is already rooted).

## SELF-CHECK (name the exact commands and paste real numbers)

1. `npx tsc --noEmit` → clean.
2. `npm run build` → rc 0.
3. `node --test scripts/law-pointer-guard.test.mjs` → all pass, incl. the four new assertions.
4. `npm run test:node-guards` → **rc 0**. (Baseline to beat: **198/198** on the tree you branch from.)
5. `node scripts/law-pointer-guard.mjs --report` → paste headline counts **before and after**; they must be
   **identical** (`7 / 19 / 16 / 2 / 1`). A changed count means you added a pointer instead of a rule.
6. `git status --porcelain` at the end → **`tasks/goals.json` and `scripts/law-pointer-baseline.json` must NOT
   appear.** Paste it.
7. `node scripts/drain-block-check.mjs --all` → still **4 BLOCKED**. Negative control: a guard changed, not a gate.

**No playwright, and say so rather than skipping it silently:** this task touches one node guard and its test.
Zero `src/`, zero `e2e/`, no runtime surface to drive.

**READY-FOR-GATES + report:** before/after `--report` headlines · the four fixture transcripts (especially the
**`--update` cannot bury it** one) · the live-tree red and its reverted empty diff · the final `git status` ·
anything you found that this rule would have caught and did not.
