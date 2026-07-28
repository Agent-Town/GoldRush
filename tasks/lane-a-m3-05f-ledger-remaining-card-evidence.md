# Task lane-a-m3-05f-ledger-remaining-card-evidence: the last two rendered Run Ledger states get their pictures — use the `name` discriminator that m3-05e just shipped (LANE-A, commit prefix "m3:")

**FIRE-AUTHORED s1194 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST:
- `AGENTS.md`
- `e2e/m3-05b-run-ledger.spec.ts` — **all of it, but especially the `shot()` helper (`:364-366`), its two existing call sites (`:170` and `:204`), and the two tests this task photographs: `pre-slice and death entries stay visible without an empty meta row` (starts `:208`) and `a pre-history exported ledger still imports without a history key` (starts `:247`).**
- `reviews/m3-05e-ledger-rush-card-evidence.md` — the drain that shipped the `name` discriminator you are about to use, and whose closing line names this exact residual: *"`:207` and `:246` still have no image, NO-listed here on purpose, each needs its own `name`."*
- `reviews/m3-05b-run-ledger.md:26` and `reviews/m3-05c-run-ledger-meta-earned.md:65` — two shipped reviews that cite `desktop-chrome.png` / `mobile-chrome.png` **by name**. They are historical records. Your change must leave both citations pointing at an image that still shows **the secured card**.

CODEX: gpt-5.6-sol effort=low

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(Measured by the authoring fire at 2026-07-29T03:5xZ: `lane/m3` was **1 ahead at `1c7c7f75`**, and its six paths break down as **`e2e/m3-05b-run-ledger.spec.ts` and `tasks/runs/20260729-032452-*.md` byte-identical to `main`** — the actual content, shipped as `0f929bdf` — **plus four PNGs that differ from main by 31–407 bytes each.** Those four are nondeterministic re-shoots of the same cards, not undrained work (see the WHY below), so the reset is loss-free. The worktree was CLEAN. Re-derive it anyway; the board moves.)*

## Why (a recorded residual, with its mechanism already on main)

`shot()` now reads:

```ts
path.join(ARTIFACT_DIR, `${testInfo.project.name}${name ? `-${name}` : ``}.png`)
```

so a caller that passes a `name` gets its own file and collides with nobody. m3-05e used it to photograph the rush card. **Two rendered tests still have no image at all:**

| test | what it renders that nothing photographs |
|---|---|
| `:208` pre-slice and death entries | a **legacy secured** row (pre-slice entry, no meta) and a **death** row — the two states that must NOT draw an empty meta row |
| `:247` pre-history import | a profile imported from a **pre-history export** appearing in the profile list as "Old Timer" |

Both assert on exact text today, which is why they pass; neither leaves an artifact a reviewer can look at. This slice adds evidence, not coverage.

## ⚠️ READ THIS BEFORE YOU WRITE THE SELF-CHECK: THE BARE-NAMED PNGs WILL CHANGE, AND THAT IS CORRECT

The previous master (m3-05e) demanded that `desktop-chrome.png` and `mobile-chrome.png` end **byte-identical** to their committed blobs. **That criterion was wrong and it stopped an already-correct run** (finding F-1193-5). The reason: the `:170` call site re-shoots those exact paths on **every** full run of this spec, and the page carries a **randomised bark** — two boots drew *"North bank shadows want the gold!"* and *"South bank dust is moving!"*. So the bytes differ run-to-run **no matter how correct your work is**.

➡️ **Therefore: if `git status` shows the bare-named PNGs as modified after a full run, that is EXPECTED. Do not stop, and do not treat it as a defect.** The real question is **semantic**, and it is the one you must answer by eye: *does `desktop-chrome.png` still show the **"Claim secured"** card, and does `desktop-chrome-rush-card.png` still show **"Rush Claim / Rush ended"**?* If either now shows the wrong card, **that** is a STOP.

**Leave the re-shot bare-named PNGs out of your commit** (they are churn, and main's committed blobs are the ones two shipped reviews point at). Commit only the four new files.

## Scope

1. **Photograph the pre-slice/death ledger state.** Give the `:208` test the `testInfo` fixture (`async ({ page }, testInfo)` — `TestInfo` is already imported at `:3`) and add exactly one line, **after** the four `expect` assertions that end at `:243` and **before** `assertNoErrors(errors)`:

   ```ts
   await shot(page, testInfo, 'pre-slice-death');
   ```

2. **Photograph the pre-history import result.** In the `:247` test, `testInfo` is **already destructured** (it is used at `:250` for `outputPath`), so add no fixture. Add exactly one line **immediately after** the assertion that the "Old Timer" profile row is visible (`:274`) and **before** `await page.getByTestId('profile-back').click()`:

   ```ts
   await shot(page, testInfo, 'pre-history-import');
   ```

   *(Shoot there, not at the end of the test: the claim this test makes is that the pre-history export **imports**, and the profile list showing "Old Timer" is where that claim is visible. The town boot at the end is an error check, not the evidence.)*

3. **Commit the four new images** — `artifacts/m3-05b-run-ledger/{desktop,mobile}-chrome-pre-slice-death.png` and `{desktop,mobile}-chrome-pre-history-import.png`.

## TOUCH-ONLY

- `e2e/m3-05b-run-ledger.spec.ts` — **only** the `:208` test's fixture destructuring and the two added `shot(...)` calls. Nothing else in the file.
- The four new `artifacts/m3-05b-run-ledger/*-pre-slice-death.png` / `*-pre-history-import.png` files — **new files only.**
- `tasks/runs/<your run report>.md`

## NO — do not touch, for any reason

- **The `shot()` helper itself.** It already does what this task needs; m3-05e shipped it and a drain verified it. Changing it is a STOP.
- **The `:170` and `:204` call sites**, `ARTIFACT_DIR`, and the `:151` / `:180` tests.
- **The committed `desktop-chrome.png`, `mobile-chrome.png`, `desktop-chrome-rush-card.png`, `mobile-chrome-rush-card.png`.** Do not `git add` them, do not delete them, do not restore them by hand. If a run re-shoots them, leave them out of the commit and say so. *(Re-read the ⚠️ section: their bytes changing is not a defect; their **content** changing is.)*
- **Any `expect` in the file.** Add no assertions, weaken none, reorder none, skip none. **The test count must stay 14** (7 × 2) — a count that went UP means you added a test you were not asked for.
- **`src/` — anything at all.** This slice changes no product code. If you believe a `src/` edit is needed, that is a STOP.
- `src/ui/DeathOverlay.ts` — F-1189-1 is **owner-gated**.
- `STATUS.md`, `reviews/**`, `tasks/BACKLOG.md`, `tasks/goals.json` — fire-owned surfaces.

## Self-check before you report

- `npx tsc --noEmit` exit 0; `npm run build` exit 0.
- `npm run test:node-guards` → **61/61, exit 0.** *(If the npm script trips on its internal `&&`, run the `node --test scripts/*.test.mjs` half directly and say so. Note: a bare `node --test scripts/` is a **vacuous red** — "Cannot find module …/scripts" is a harness invocation error, not a failure.)*
- `npx playwright test e2e/m3-05b-run-ledger.spec.ts --list` → **exactly 14**, before and after. Paste both.
- `npx playwright test e2e/m3-05b-run-ledger.spec.ts` green on **both** projects, `--workers=1` — paste the counts and **confirm the number is UNCHANGED at 14/14**, not higher.
- **The evidence proof:**
  - `ls -1 artifacts/m3-05b-run-ledger/` → must be **exactly eight** files (the four that were there, plus your four).
  - `git status --short artifacts/m3-05b-run-ledger/` → paste it **verbatim, whatever it says.** The four new files must appear as untracked/added. If the bare-named PNGs also appear as `M`, that is expected churn — state that you left them uncommitted.
  - `git diff --cached --name-only` (or `git show --name-only` after committing) → must list **exactly** the spec file plus your four new PNGs, and **no other artifact**.
- **Four eye checks, one sentence each** — say what card/screen each image actually shows:
  - `desktop-chrome-pre-slice-death.png` → the ledger with a **"Legacy Claim"** row and a **"Last Stand"** row, **neither carrying a meta line**;
  - `desktop-chrome-pre-history-import.png` → the profile list containing **"Old Timer"**;
  - `desktop-chrome.png` → still the **"Claim secured"** card;
  - `desktop-chrome-rush-card.png` → still the **"Rush Claim" / "Rush ended"** card.
- Adjacent, both projects, unmodified-green — paste counts: `e2e/meta-presence*`, `e2e/run-suspend*`, `e2e/m3-05d-unpaid-rush-guard.spec.ts`. **`run-suspend.spec.ts:193` is a known load-sensitive flake (F-1180-2) — if it fails, say so explicitly rather than counting it as new.**
- **Paste `git diff --stat`.**

**Two pre-declared STOPs, both SUCCESSES if they fire:**
- If either bare-named PNG or either rush-card PNG ends up showing **the wrong card** (per the eye checks), **STOP and report which image shows what** — that means a `shot()` call is colliding and the discriminator is not doing its job.
- If `--list` returns anything other than 14, **STOP and report** — this slice must not change what is collected.

READY-FOR-GATES + report: the diff stat, the `--list` counts before/after, the both-project spec counts, the eight-file `ls`, the verbatim `git status` for the artifact dir, the committed-file list proving only the spec + four new PNGs landed, the four one-sentence eye checks, and the adjacent-suite table.
