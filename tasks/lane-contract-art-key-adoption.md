# Task lane-contract-art-key-adoption: THREE E2E ASSERTIONS STILL DEMAND THE PER-CARD ART KEYS THAT THE OWNER RETIRED ON 2026-07-20
**FIRE-AUTHORED (attended review welcome) — s1105, 2026-07-27. This is the corrective that F-1104-6's rider ordered ("`town-t3-board:161` … pre-existing and assertion-class, and it now OWES its own corrective").**

**READ THIS FIRST, BECAUSE IT INVERTS THE OBVIOUS FIX: the DOM is RIGHT and the SPECS are STALE.** The temptation is to "repair" `renderContractArt()` so it emits per-card keys again. **That would reverse a ratified owner ruling** and is a firewall violation here. See WHY.

You are Codex (worktrees/lane-c).

CODEX: model=gpt-5.6-sol effort=medium

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated)

**THE ADOPTION — `3a007ea7`, 2026-07-20**, *"drain: THE FULL BOOK — all 41 engraved plates (E1 adoption + E6-E10) + one render path (registry framing retired per owner sizing ruling)"*. The owner ruling is quoted in the source itself at `src/town/TownScene.ts:2527-2528`:

> `// THE ADOPTION (owner 2026-07-20): all 41 cards render through ONE path at one`
> `// size — the per-card registry framing (insets, key backgrounds) is retired.`

Since that landing, `renderContractArt()` emits a **single constant** for every card — `src/town/TownScene.ts:2540`:

```
<figure class="town-ui__contract-art town-ui__contract-art--plate" data-contract-art-key="plate" ...>
```

**`3a007ea7` touched NO e2e file at all** (verified: `git show --stat 3a007ea7 | grep e2e` is empty). So three assertions froze on the pre-Adoption contract and have been red ever since — the same **"frozen spec + moved source"** class as F-1101-2 / the 078 reverts, and it is why `git log -G` (not `-S`) is the tool that finds these.

**THE THREE SITES — measured this fire, `grep -rn "data-contract-art-key" e2e/` returns exactly 3 hits in 3 files:**

| # | site | asserts | DOM actually emits |
|---|---|---|---|
| 1 | `e2e/town-t3-board.spec.ts:203` | `contract.artKey` (e.g. `contract-dry-gulch`) | `plate` |
| 2 | `e2e/e2-pressure-garden.spec.ts:73` | `'contract-the-claim'` | `plate` |
| 3 | `e2e/e2-trestle.spec.ts:73` | `'contract-the-claim'` | `plate` |

s1103's rider and s1104 both confirmed #1 red on **both projects**, and s1104 reproduced it **byte-identically on a detached clean-main worktree at `06c427f3`** — pre-existing, not merge-induced. **#2 and #3 were NOT in that report: s1105 found them by re-measuring the finding's list rather than inheriting its count** (the standing law — s1092's "five specs" was four, s1095's "four callers" was six). Expect the reported failure at #1 to read `plate` vs `contract-dry-gulch`: `:203` sits in a loop over `entry.locked`, whose first key is `e1-dry-gulch`.

**Why `tsc` never caught it:** `BOARD_CONTRACTS` at `e2e/town-t3-board.spec.ts:25-30` is a **spec-local literal**, not an import from `src/`. Its `artKey` field is a private frozen copy of the retired contract, so deleting the real field from `src/` would never have reddened the type-check.

**THE DEEPER POINT, WHICH IS THE REAL WORK HERE:** an assertion that all 41 cards emit the *same constant* distinguishes no card from any other — it is nearly worthless as a guard. The Adoption's actually-testable claim is *"one render path, one size, with a documented fallback chain"*, which lives in the `imageUrl` resolution at `TownScene.ts:2530-2534`: engraved plate (`plate-contract-<id>.png`, with a legacy `plate-contract-<id-minus-era-prefix>.png` alias) → interim board-card render → **`plate-contract-the-claim.png` as the final fallback**. That chain is per-card and player-visible. Scope item 3 moves the guard there.

## PRE-FLIGHT — verify by CONTENT, and run the premise checks AFTER the reset

1. `git log --oneline main..lane/e2-arsenal` → **must be EMPTY.** s1105 measured `lane/e2-arsenal` at `47f21b29`, **0 ahead of main**. **Any** commit means undrained work: **STOP and report** (LANE-SAFETY LAW — a pre-flight `reset --hard` over unmerged output is how w1-03 and polish-02 were destroyed).
2. Start from fresh main: `git checkout -B lane/e2-arsenal main`.
3. **NOW, and only now, the premise checks** — a stale lane answers for its own tree, not for main (F-1090-2):
   - `grep -c 'data-contract-art-key="plate"' src/town/TownScene.ts` → **must print 1.** If 0, the renderer has changed since s1105 measured it: **STOP and report** — the whole premise of this task is that the DOM is correct.
   - `grep -rc "data-contract-art-key" e2e/town-t3-board.spec.ts e2e/e2-pressure-garden.spec.ts e2e/e2-trestle.spec.ts` → **must print 1 for each of the three.** Any 0 means someone already fixed that site: **STOP and report which.**

## SCOPE (numbered; each item is testable)

1. **`e2e/town-t3-board.spec.ts`** — at `:203`, assert the post-Adoption contract: `data-contract-art-key` is **`'plate'`** for every contract. Then **delete the now-dead `artKey` field** from the `BOARD_CONTRACTS` literal (`:25-30`, 5 entries) and from any type annotation on it, so the frozen fixture stops advertising a retired contract to the next reader. Leave `id` and `flavor` exactly as they are — they are still asserted.
2. **`e2e/e2-pressure-garden.spec.ts:73` and `e2e/e2-trestle.spec.ts:73`** — same change, `'contract-the-claim'` → `'plate'`. Do not touch anything else in these two files.
3. **Add the guard that the constant cannot give you** (this is the point of the task, not a nice-to-have). In `e2e/town-t3-board.spec.ts`, extend the existing per-contract loop to assert the **image** rather than only the wrapper: read `contract-art-<id> img` and assert its `src`
   - is present and non-empty, **and**
   - **differs between at least two different contract ids** in the same case — proving the one render path still resolves per-card art rather than serving one image to all 41 cards.
   Keep it resilient to Vite's hashed asset URLs: match on the **filename stem** (e.g. `/plate-contract-|board-cards\//`), never a full path or a hash. If a contract legitimately falls through to the `the-claim` fallback, that is allowed — the assertion is about *at least two distinct srcs across the set*, not about every card being unique.
4. **Do not modify `src/`.** If you believe the renderer is wrong, **STOP and report** — reversing The Adoption is an owner decision (§7.3), not a lane's.

## FIREWALL

**TOUCH-ONLY:** `e2e/town-t3-board.spec.ts` · `e2e/e2-pressure-garden.spec.ts` · `e2e/e2-trestle.spec.ts`
**NO:** `src/**` (especially `src/town/TownScene.ts` — the DOM is correct) · any other `e2e/*.spec.ts` · `playwright.config.ts` (F-1101-1's worker calibration is live on lane-d this week; do not touch the config) · `tasks/**` · `STATUS.md` · `reviews/**`

Reporting an adjacent problem is good and welcome. Fixing one outside TOUCH-ONLY is a violation.

## SELF-CHECK (report COLLECTED COUNT beside pass count — F-1104-5)

Every path below was `ls`-verified by s1105 at authoring time. A positional arg that matches **no** file contributes **zero tests without failing**, so a battery that only says "passed" is unauditable — **report `<passed>/<collected>` for each command.**

```
npx tsc --noEmit
npm run build
npx playwright test e2e/town-t3-board.spec.ts e2e/e2-trestle.spec.ts e2e/e2-pressure-garden.spec.ts --project=desktop-chrome --workers=1 --reporter=line
npx playwright test e2e/town-t3-board.spec.ts e2e/e2-trestle.spec.ts e2e/e2-pressure-garden.spec.ts --project=mobile-chrome --workers=1 --reporter=line
```

- **Expected collected count is non-zero for all three files on BOTH projects.** If any file collects 0, say so loudly — that is the F-1094-1 silent-zero class, and it means the run proved nothing.
- Report the **before** numbers too: run the desktop command **once on the unmodified tree first** and record the failures, so the fix has a measured baseline rather than an assumed one.
- Zero console/page errors in the board boot probe, desktop **and** 390px mobile.
- Screenshots the specs already emit are sufficient; no new artifact paths required.

**READY-FOR-GATES.** Report: the before/after pass **and collected** counts per project; the exact final assertion text at all three sites; whether scope item 3's "two distinct srcs" held and which two contracts it compared; and anything you found in `src/` that looks wrong but which you correctly did **not** touch.
