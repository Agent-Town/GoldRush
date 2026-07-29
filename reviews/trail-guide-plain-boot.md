# reviews/trail-guide-plain-boot.md — the plain-boot trail-guide proof

**Slice:** `lane-trail-guide-plain-boot-proof` · **Branch:** `lane/m4` · **Lane tip:** `d7d8ba03`
**Base:** `f4cb37bf` · **Gated by:** s1204 fire, 2026-07-29, on the merged tree at `8b867240` (i.e. with GG-01 already in)
**§3.0 drain-block-check:** ✅ CLEAR — `lane-trail-guide-plain-boot-proof.md [e1-trail-guide-plain-boot-proof] status="queued"` (ran FIRST)

## Verdict

**NOT MERGED — BLOCKED at the gate on F-1204-3.** The slice's content is right and the owner pushed for it; the spec is **flaky at the repo's canonical worker count**, and merging it would have added a ~50% red to the board. Corrective master authored: `tasks/lane-trail-guide-plain-boot-timeouts.md`, queued to lane-b.

This is a gate rejection, **not** a judgement on the work's value. The proof it makes is one the board wants.

## What it does

Proves — on a genuinely plain boot, `page.goto('/')` with `expect(new URL(page.url()).search).toBe('')` — that the Trail Guide teaches the first claim once and does not re-teach on replay. This is the Mistake #10 corrective in spec form: it asserts what the **player** sees with no `?debug`, no `?contract=`, no query flags at all. 198-line new e2e + 12 screenshots.

## Merge classification

`lane/m4` was 2 commits ahead; only one is new work.

| Commit | Content | Status |
|---|---|---|
| `f4cb37bf` | lane-b claw-2x-triangle-billing-diagnosis | **already in main** — `git diff f4cb37bf main -- <its 3 files>` is **empty**. Falsely-ahead residue. |
| `d7d8ba03` | **the slice** | pure add: 1 new spec + 12 new PNGs, **zero `src/` bytes**; `e2e/trail-guide-plain-boot.spec.ts` absent from main ⇒ clean apply, no graft needed |

The zero-`src` fact is what makes the verdict unambiguous: **every** failure below is in the spec's own waits, so there is no product defect to weigh against the flake.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.23 s |
| desktop alone, 1 worker | **PASS** (25.5 s) |
| **canonical invocation** (both projects, 2 tests, 2 workers) | **1 fail / 1 pass** ❌ |
| both projects, `--repeat-each=2` (4 tests, 2 workers) | **4/4 FAIL** ❌ |
| **control arm:** same, with GG-01 `src` reverted | **4/4 FAIL** — identical |

The runner's own report claimed *"Playwright desktop + 390 px: 2/2 passed"*. That was true when it ran and is still true about half the time — which is precisely the problem.

## Findings

### 🚨 F-1204-3 — the plain-boot proof is flaky at the canonical worker count, in its own waits

**GG-01 was the obvious suspect and was cleared by a control.** GG-01 (`d2fc1b06`, merged by this same fire) auto-opens the Herald on first town entry and sets `this.ui.inert = true` — exactly the kind of change that breaks a fresh-profile town flow, and this spec walks that flow. So the subject was reverted (`src/town/TownScene.ts` + `src/news/heraldReader.{ts,css}`) and the identical command re-run: **4/4 red on both arms.** The merge is not implicated; the spec is.

**The mechanism, read at source.** `playwright.config.ts:13` sets the repo-wide `expect` timeout to **5 s**. The author had already raised the waits they saw bite — `:64` (8 s), `:170` (15 s), `:191` (15 s) — but left two at the default, and those two are the ones that fail:

| Line | Wait | Failures (of 4) |
|---|---|---|
| **`:189`** | `expect.poll(… harvest.channeling …).toBe(true)` — default 5 s, while its sibling at `:191` already has `{timeout: 15_000}` | **3** |
| **`:166`** | `expectGuideBeat(…, 1)` → `toBeVisible()` inheriting the 5 s default | **1** |

⚠️ **The first cure was too narrow, and measuring refuted it.** The obvious fix — raise `:189` to match `:191` — was the initial diagnosis. Capturing the failing **line numbers** under load (rather than just the pass/fail count) showed `:166` failing by the same mechanism through a different helper. Had the finding shipped with its first recommendation, the corrective would have half-fixed the spec and the next fire would have met the survivor as a fresh mystery. *A finding's recommendation is an untested second hypothesis* — the corrective task therefore orders a **class fix** and asks the implementer to justify the completeness of the set they covered.

**Why block rather than merge-with-a-finding.** The board already carries 41 red in the town family and a suite-red inventory that fires must consult; **F-1204-1** (filed by this same fire, an hour earlier) is precisely the cost of a red that isn't where the next fire looks for it. Adding a brand-new ~50% flake, whose fix is a few lines in a test, is not a trade worth making. Blocking costs one lane cycle.

**Disposition of the bytes (RETENTION LAW).** Nothing was deleted. All 13 files remain in git on `lane/m4` at `d7d8ba03` (verified by `git show --stat`), and a working copy sits in `logs/session-scratch/s1204-unmerged-trail-guide/`. ⚠️ **`lane/m4` must NOT be reset or refilled** until this re-lands — it is undrained content (LANE-SAFETY LAW / Mistake #2).

ⓘ Fires cannot unstage: `git rm --cached`, `git reset`, `git restore` and `git update-index` are all permission-gated (only `add`/`commit`/`checkout` are allowlisted). The index was cleared the house-approved way — move the files to the session scratchpad, then `git add -u` the original paths. Worth an allowlist line so a future fire's gate rejection isn't harder to execute than a merge.
