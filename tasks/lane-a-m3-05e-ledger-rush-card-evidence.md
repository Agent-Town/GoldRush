# Task lane-a-m3-05e-ledger-rush-card-evidence: THE SLICE'S OWN CARD HAS NO PICTURE — give `shot()` a name so the rush card can be photographed WITHOUT overwriting the secured one (LANE-A, commit prefix "m3:")

**FIRE-AUTHORED s1193 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST:
- `AGENTS.md`
- `e2e/m3-05b-run-ledger.spec.ts` — **all of it, but especially `ARTIFACT_DIR` (`:10`), the `shot()` helper (`:363-366`), its single call site (`:170`, inside the test that starts at `:151`), and the rush-card test at `:180`.**
- `reviews/m3-05d.md` — the drain that raised **F-1192-2**, the finding this task closes.
- `reviews/m3-05b-run-ledger.md:26` and `reviews/m3-05c-run-ledger-meta-earned.md:65` — **two shipped reviews that cite the artifact filenames by name. They are historical records. Your change must leave both citations true.**
- Convention reference — four sibling specs that already solve this exact problem: `e2e/050-audio-mix-and-access.spec.ts:41`, `e2e/045-megaproject.spec.ts:51`, `e2e/044-start-screen.spec.ts:37`, `e2e/058-device-tiers.spec.ts:73`.

CODEX: gpt-5.6-sol effort=low

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(Measured by the authoring fire at 2026-07-29T03:2xZ: `lane/m3` was **1 ahead at `439429c2`** ("runner(lane-a): lane-a-m3-05d-run-ledger-earned-truth.md"), and **every one of the 5 files in that commit hashes byte-identical to its `main` counterpart** — a FALSE-AHEAD SAFE DUPE, its content having landed as `5027c211`. Re-derive it anyway; the board moves.)*

## Why (F-1192-2, raised by s1192's own drain — and its recommended cure was MEASURED WRONG by s1193 before this master was written)

`shot()` (`:363-366`) writes:

```ts
path.join(ARTIFACT_DIR, `${testInfo.project.name}.png`)
```

That path depends on **the project name and nothing else**. It is called **once**, at `:170`, so the committed evidence — `artifacts/m3-05b-run-ledger/desktop-chrome.png` and `mobile-chrome.png` — shows the **secured** card. The **rush** card at `:180`, which is the card the m3-05c/m3-05d slices exist for, has exact-text coverage but **no image**.

## ⚠️ THE TRAP: THE ONE-LINE FIX IS GREEN, AND IT DESTROYS EVIDENCE

`reviews/m3-05d.md` proposes: *"One `await shot(page, testInfo)` closes it."* **It does not.** s1193 applied that recommendation verbatim and measured the result:

| probe | result |
|---|---|
| `--project=desktop-chrome -g "Claim Office…\|a rush ledger card renders" --workers=1` | **2 passed, exit 0** |
| files in `artifacts/m3-05b-run-ledger/` afterwards | **still exactly 2** — no new artifact appeared |
| `desktop-chrome.png` blob | `9d99efd5…` → **`4d4cc5b5…`** (646638 → 647556 bytes) |
| what the image then showed | the **"Rush Claim / Rush ended"** card — i.e. the `:180` card, written over the `:151` one |

Because both tests run under the same project (**no project gating in this file — `--list` reports 14 tests, 7 × 2 projects, none skipped**), both calls resolve to the *same* path and the later test wins. The gap is not closed, it is **moved** — and the secured card's committed evidence, cited by two shipped reviews, is silently replaced. **A green battery cannot see this: the run is 2/2 and exit 0.**

## Scope

1. **Give `shot()` a discriminator, with the current behaviour as the default.** Change its signature to take an optional third argument, `name?: string`, and build the filename as:
   - `name` omitted → **`${testInfo.project.name}.png` — byte-for-byte the path it writes today**;
   - `name` given → `${testInfo.project.name}-${name}.png`, matching the four sibling specs listed above.

   **The default branch is load-bearing and is not a style choice:** `reviews/m3-05b-run-ledger.md:26` and `reviews/m3-05c-run-ledger-meta-earned.md:65` cite `desktop-chrome.png` / `mobile-chrome.png` by name. Renaming them would falsify two shipped reviews, and reviews are records — they are superseded, never rewritten. **Do not touch the `:170` call site.**

2. **Photograph the rush card.** Give the `:180` test the `testInfo` fixture (`async ({ page }, testInfo)` — `TestInfo` is already imported at `:3`) and add exactly one line, **after** the two `expect` assertions at `:202-203` and **before** `assertNoErrors(errors)`:

   ```ts
   await shot(page, testInfo, 'rush-card');
   ```

3. **Commit the two new images** — `artifacts/m3-05b-run-ledger/desktop-chrome-rush-card.png` and `mobile-chrome-rush-card.png`.

## TOUCH-ONLY

- `e2e/m3-05b-run-ledger.spec.ts` — **only** the `shot()` signature/filename expression, the `:180` test's fixture destructuring, and the one added `shot(...)` call.
- `artifacts/m3-05b-run-ledger/desktop-chrome-rush-card.png`, `artifacts/m3-05b-run-ledger/mobile-chrome-rush-card.png` — **new files only.**
- `tasks/runs/<your run report>.md`

## NO — do not touch, for any reason

- **`artifacts/m3-05b-run-ledger/desktop-chrome.png` and `mobile-chrome.png`.** They must end the run **byte-identical to their committed blobs**. If your final `git status` shows either as `M`, you have reproduced the exact defect this task exists to prevent — **STOP and report it**, do not `git checkout` it and carry on.
- **Any `expect` in the file.** Add no assertions, weaken none, reorder none, skip none. **The test count must stay 14** (7 × 2) — this slice adds evidence, not coverage, and a count that went UP means you added a test you were not asked for.
- **The `:170` call site**, `ARTIFACT_DIR`, and the `:151` test.
- **Shots for the other two uncovered rendered tests** (`:207` pre-slice/death entries, `:246` pre-history import). They are a known follow-up and each needs its own `name`; batching them here would make the diff unreviewable and is out of scope.
- **`src/` — anything at all.** This slice changes no product code. If you believe a `src/` edit is needed, that is a STOP.
- `src/ui/DeathOverlay.ts` — F-1189-1 is **owner-gated**.
- `STATUS.md`, `reviews/**`, `tasks/BACKLOG.md`, `tasks/goals.json` — fire-owned surfaces.

## Self-check before you report

- `npx tsc --noEmit` exit 0; `npm run build` exit 0.
- `npm run test:node-guards` → **61/61, exit 0.** (If the npm script trips on its internal `&&`, run its halves directly and say so.)
- `npx playwright test e2e/m3-05b-run-ledger.spec.ts --list` → **exactly 14**, before and after. Paste both.
- `npx playwright test e2e/m3-05b-run-ledger.spec.ts` green on **both** projects, `--workers=1` — paste the counts and **confirm the number is UNCHANGED at 14/14**, not higher.
- **The anti-collision proof, which is the whole point of the slice.** After that full both-project run, paste:
  - `ls -1 artifacts/m3-05b-run-ledger/` → must be **exactly four** files;
  - `git status --short artifacts/m3-05b-run-ledger/` → the two bare-named PNGs must be **absent from the output** (unmodified) and the only entries must be the two new `-rush-card` files.
- Confirm by eye that `desktop-chrome-rush-card.png` shows the **"Rush Claim" / "Rush ended"** card and `desktop-chrome.png` still shows the **"Claim secured"** one — and say so in one sentence each.
- Adjacent, both projects, unmodified-green — paste counts: `e2e/meta-presence*`, `e2e/run-suspend*`, `e2e/m3-05d-unpaid-rush-guard.spec.ts`. **`run-suspend.spec.ts:193` is a known load-sensitive flake (F-1180-2) — if it fails, say so explicitly rather than counting it as new.**
- **Paste `git diff --stat`** and the **final text of the `shot()` filename expression**.

**Two pre-declared STOPs, both SUCCESSES if they fire:**
- If a full both-project run leaves either bare-named PNG modified, **STOP and report the blob before/after** rather than restoring it — that means the default branch of scope 1 is not actually default, and the owner needs to see it.
- If `--list` returns anything other than 14, **STOP and report** — this slice must not change what is collected.

READY-FOR-GATES + report: the diff stat, the final filename expression, the `--list` counts before/after, the both-project spec counts, the four-file `ls` plus the `git status` proving the two committed PNGs are untouched, the one-sentence eye check on each of the two desktop images, and the adjacent-suite table.
