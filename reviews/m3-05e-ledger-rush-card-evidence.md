# Review — m3-05e-ledger-rush-card-evidence

**Slice:** `lane-a-m3-05e-ledger-rush-card-evidence` (FIRE-AUTHORED s1193)
**Branch/tip:** `lane/m3` @ `1c7c7f75` ("runner(lane-a): lane-a-m3-05e-ledger-rush-card-evidence.md")
**Drained:** s1193 fire, 2026-07-29
**Verdict:** ✅ **ACCEPTED.** F-1192-2 is closed for real: the rush card now has its own image and the secured card still has its own. The runner hit a **pre-declared STOP and obeyed it exactly** (`status: stopped-success` — did not restore, did not continue, reported the blobs before/after). **The STOP fired on a flaw in MY acceptance criterion, not on a defect in the work** — see F-1193-5, which is a finding against the master this same fire authored.

## What it does

`shot()` gains an optional third argument. Final expression:

```ts
`${testInfo.project.name}${name ? `-${name}` : ''}.png`
```

Omitting `name` reproduces today's path byte-for-byte, so the artifact filenames cited by two shipped reviews (`reviews/m3-05b-run-ledger.md:26`, `reviews/m3-05c-run-ledger-meta-earned.md:65`) stay true; passing one appends `-${name}`, matching the house convention already used by `e2e/050-audio-mix-and-access.spec.ts:41`, `045-megaproject.spec.ts:51`, `044-start-screen.spec.ts:37`, `058-device-tiers.spec.ts:73`. The rush-card test gains `await shot(page, testInfo, 'rush-card')`.

**The gap this closes was NOT closeable by the one-liner the finding recommended.** `reviews/m3-05d.md` proposed *"One `await shot(page, testInfo)` closes it"*; s1193 applied that verbatim before authoring and measured **2/2 green, exit 0, still exactly 2 files, and `desktop-chrome.png` replaced by the rush card** (blob `9d99efd5…` → `4d4cc5b5…`). The gap would have **moved**, not closed, and two shipped reviews' evidence would have been silently falsified — with no battery able to see it.

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | **exit 0** |
| `npm run build` | **exit 0**, 1.20 s |
| `node --test scripts/*.test.mjs` (node guards) | **61/61**, exit 0 — run **before** gating |
| `--list` before / after | **14 / 14** — unchanged, as required (evidence, not coverage) |
| slice spec `m3-05b-run-ledger.spec.ts`, both projects, `--workers=1` | **14/14 passed** (27.8 s), exit 0 |
| adjacent: `meta-presence` + `run-suspend` + `m3-05d-unpaid-rush-guard`, both projects | **26/26 passed** (3.5 m), exit 0 — incl. the load-sensitive `run-suspend:193` (F-1180-2) which did **not** flake |
| artifact directory after a full run | **exactly 4 files** — the anti-collision proof |

**The visual acceptance the runner lawfully stopped before reaching, done at drain time:**

| file | shows |
|---|---|
| `artifacts/m3-05b-run-ledger/desktop-chrome.png` | **"Dry Gulch / Claim secured"** — the secured card, **preserved** |
| `artifacts/m3-05b-run-ledger/desktop-chrome-rush-card.png` | **"Rush Claim / Rush ended"**, `Territory +2 / Science +3 / Hero +4 / Agent +5` — the card this slice exists for |

Two distinct cards, two distinct files. That is the whole slice, and it is proven by eye rather than by filename.

## Merge classification

Base `main` @ `e5df23bd`. Path-scoped checkout of 4 paths from `lane/m3`; **no conflicts** (main moved only in `logs/`, `tasks/`, `reviews/` this fire, disjoint from the lane's `e2e/` + `artifacts/` set).

- **LANE-TOUCHED, taken:** `e2e/m3-05b-run-ledger.spec.ts`, `artifacts/m3-05b-run-ledger/{desktop,mobile}-chrome-rush-card.png`, `tasks/runs/20260729-032452-…md`.
- **DELIBERATELY NOT TAKEN:** `artifacts/m3-05b-run-ledger/{desktop,mobile}-chrome.png`. The lane rewrote them (`646638→646818`, `894591→894998` bytes) because `:170` still shoots them every run, and the delta is **nondeterministic content, not a different card** — the two boots drew different randomised barks ("North bank shadows want the gold!" vs "South bank dust is moving!"). Main's committed blobs (`9d99efd5…`, `626d3739…`) are kept, so the images the two shipped reviews point at are stable. ✓ verified after merge: both still hash to main's blobs.

## Findings

- **F-1193-5 (against the master THIS FIRE authored — the acceptance criterion was an untested second hypothesis).** The master's NO list demanded the bare-named PNGs "end the run **byte-identical** to their committed blobs" and pre-declared a STOP if either showed as `M`. **That criterion is unsatisfiable by a correct implementation**, because the `:170` call re-shoots those exact paths on every run and the page contains a randomised bark, so the bytes differ run-to-run regardless of whether the fix works. The runner therefore hit a lawful STOP on a **correct and complete** implementation — it had already shipped the signature change, the call, and both new PNGs, and its report says so. **Cost: one stopped run, zero rework.** The right criterion is **semantic, not byte-wise**: *the bare-named file must still show the **secured** card* — which is what this drain actually checked, by eye. Lesson, and it is the same one this fire opened with: **a finding's recommendation is an untested hypothesis, and so is the acceptance criterion you write to replace it.** I caught s1192's recommendation by measuring it and then shipped the identical class of error one step downstream.
- **F-1193-6 (praise, worth recording as precedent).** The runner's STOP is a model of the behaviour §7.5 and the mistake catalogue ask for: it did **not** `git checkout` the "offending" files to force a green, did **not** run the remaining suites to bury the stop in noise, and published **both blob hashes before and after** so the drain could adjudicate in one read. A weaker run would have restored the two PNGs and reported a clean pass — and the flawed criterion would have survived undetected into the next master that copied it.
- ⓘ **F-1192-2 residual, now explicitly scoped:** the other two rendered tests (`:207` pre-slice/death entries, `:246` pre-history import) still have no image. They were NO-listed here on purpose; each needs its own `name`. Cheap follow-up for any task that next owns the file.

## Bookkeeping

- Goal leaf `factory-m3-05e-ledger-rush-card-evidence` → `merged` with the full 40-char hash, in the drain commit (Goal Registration Law).
- Done-move renamed `shipped-<hash>-…`.
- **GZ-01 not owed:** no player-visible change — this slice adds test evidence only, no `src/` byte moved.
