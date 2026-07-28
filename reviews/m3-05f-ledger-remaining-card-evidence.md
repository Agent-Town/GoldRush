# Review — m3-05f: the last two rendered Run Ledger states get their pictures

- **Slice:** `lane-a-m3-05f-ledger-remaining-card-evidence` (FIRE-AUTHORED s1194)
- **Branch / tip:** `lane/m3` @ `fce4e7d4` (Codex's own commit `b39edde1`; `fce4e7d4` is the runner's auto-commit)
- **Base:** `0bd46e55`
- **Drained by:** s1195 fire, 2026-07-29
- **Verdict:** ✅ **ACCEPTED** — merged as a 6-path graft, the 4 churn PNGs deliberately excluded.

## What it does

Two tests in `e2e/m3-05b-run-ledger.spec.ts` rendered real UI and asserted on exact text, but left no
picture anyone could look at. This slice photographs both, using the optional `name` discriminator that
`m3-05e` shipped one hour earlier (`shot(page, testInfo, name)` → `<project>-<name>.png`, so a named
call cannot collide with the bare-named artifacts two shipped reviews cite).

The diff is exactly what the master ordered and nothing else: one fixture destructure
(`async ({ page }, testInfo)` on the `:208` test) and two `shot(...)` lines, each placed at the line the
master named. **Zero `src/` bytes. No assertion added, weakened, reordered or skipped.**

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0, **1.64 s**, asset-diet green |
| `node --test scripts/*.test.mjs` | **61 / 61, fail 0** (run *before* gating, per the standing order) |
| `--list` before **and** after | **14 / 14 — UNCHANGED** (pre-declared STOP did not fire) |
| Slice, both projects, `--workers=1` | **14 passed (30.0 s)** |
| Adjacent (`meta-presence` + `run-suspend` + `m3-05d-unpaid-rush-guard`) | 25 / 26 — see F-1195-2 |
| `meta-presence.spec.ts` mobile, isolated | **8 / 8 (30.4 s)**, including the failing `:207` |
| Artifact dir | **exactly 8 files** |
| `desktop-chrome.png` blob, post-merge | **`9d99efd5…` — unchanged** |

### The four eye checks — re-verified by the drain, not inherited

The master made the acceptance criterion **semantic** rather than byte-identical (the direct lesson of
F-1193-5). So the drain answered it the only way it can be answered: by opening the images.

1. `desktop-chrome-pre-slice-death.png` → the Run Ledger showing **"Legacy Claim" / OUTCOME "Claim secured" / WAVES 12**
   beside **"Last Stand" / OUTCOME "Overrun" / WAVES 7**. **Neither card carries a meta line.** ✓ Exactly the
   state the test exists to defend.
2. `desktop-chrome-pre-history-import.png` → the **Profiles** panel with **"Old Timer"** present, selected,
   banner *"Old Timer joined the ledger."*, footer *"Done — Old Timer selected"*. ✓
3. `desktop-chrome.png` → still the **"Claim Secured"** card (blob `9d99efd5`, byte-identical to the blob
   `reviews/m3-05b-run-ledger.md:26` and `m3-05c-…:65` point at). ✓
4. `desktop-chrome-rush-card.png` → still blob `2a101d75`, the **"Rush Claim / Rush ended"** card. ✓

A pleasing internal consistency check fell out of the gate run: after re-running the spec, **only the two
images containing the randomised bark went dirty** (`pre-slice-death`, and the two bare-name cards) while
`pre-history-import` — the Profiles screen, which carries no bark — came back **byte-identical**. That is
the F-1193-5 mechanism reproducing itself exactly where theory says it should, and nowhere else.

## Merge classification

Base `0bd46e55`; `git diff --name-only 0bd46e55 main` = **`STATUS.md` alone** ⇒ **collisions NONE**, no
3-way graft needed. Of the lane's 10 changed paths:

| Path | Class | Action |
|---|---|---|
| `e2e/m3-05b-run-ledger.spec.ts` | LANE-TOUCHED | merged |
| 4 × `*-pre-slice-death.png` / `*-pre-history-import.png` | LANE-TOUCHED (new) | merged |
| `tasks/runs/20260729-040855-*.md` | LANE-TOUCHED (new) | merged |
| 4 × bare-name / rush-card PNGs | **churn** | **EXCLUDED — see F-1195-1** |
| `STATUS.md` | MAIN-MOVED-ONLY | not copied |

## Findings

### 🔻 F-1195-1 (MEDIUM, process) — the runner's auto-commit re-committed the exact churn the task deliberately left out

The master is unambiguous: *"Leave the re-shot bare-named PNGs out of your commit … Commit only the four
new files."* **Codex obeyed perfectly** — `b39edde1` contains exactly 5 paths, and the run report states
*"The four existing files are expected nondeterministic re-shoot churn and remain uncommitted."*

Then the runner's own auto-commit `fce4e7d4` staged them anyway, sweeping all four back in.

This is a live, general mechanism, not a one-off: **a lane task cannot express "leave this file
uncommitted", because the runner's post-run auto-commit stages the whole worktree.** Any instruction of
that shape is silently reversed. Here it was benign — the drain simply excluded the four paths, and main's
cited blobs are provably intact — but the failure mode is Mistake #3-shaped: churn attributed to a task
that explicitly disclaimed it. Adjacent to F-1193-2 (broad ART-slot commits) and worth one shared cure:
either a runner-side ignore list, or the standing convention that **drains classify per-file rather than
trusting the lane tip**.

*No corrective task authored — the drain-side cure already worked, and the durable fix is a runner change,
which is owner-adjacent. Recorded so the next master that writes "leave X uncommitted" knows it is a
request to the drain, not to the runner.*

### 🔻 F-1195-2 (LOW→MEDIUM, red map) — the F-1180-2 load casualty ROTATES; the red map names only one line

The combined 3-suite adjacent run (4.2 m) produced exactly one failure — but **not the documented one**.

- The runner's combined run lost **`run-suspend.spec.ts:193`** (the known F-1180-2 flake), which then passed 1/1 isolated.
- This drain's combined run lost **`meta-presence.spec.ts:207`** — `run-suspend` passed clean — and `:207` then passed **8/8** isolated.

Two runs of the same battery, two *different* casualties, each green alone. **A real defect does not move
between suites; a load ceiling does.** So F-1180-2's framing as *"`e2e/run-suspend.spec.ts:193` is the
load-sensitive flake"* is under-specified: the load-sensitive unit is the **3-suite combined battery**, and
`:193` is merely where it was first seen. s1194 correctly flagged that `run-suspend` is missing from
`logs/suite-red-inventory.md`; this sharpens what the entry should say — **name the class, not the line**,
or the next fire that loses `meta-presence:207` will read it as a new red and mis-attribute it to whatever
slice is in flight. That is exactly the mis-attribution F-1180-2 exists to prevent.

**Ruled out for this slice by construction, not just by the isolated green:** the merged diff carries
**zero `src/` bytes**, and the only `e2e` file it touches is a *different* spec. There is no mechanism by
which it can reach `meta-presence`.

## Mistake #10 — where does the player see this?

**Nowhere, and that is correct.** This slice ships test evidence only: no `src/` change, no new assertion,
collection unchanged at 14. What it changes is what a *reviewer* can see — two rendered states that
previously existed only as string assertions now have pictures, and both were checked by eye above.
