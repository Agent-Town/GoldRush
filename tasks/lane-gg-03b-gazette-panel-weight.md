CODEX: model=gpt-5.6-sol effort=medium
# lane-gg-03b-gazette-panel-weight — GG-03b: the engravings, at a weight the page can carry

**FIRE-AUTHORED (attended review welcome)** — s1208, 2026-07-29, from the s1208 drain rejection of GG-03.

ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

## READ FIRST (paths, in this order)
- `reviews/gg-03-gazette-panel-swap.md` — the rejection this task answers. **F-1208-1** (the measured red) and **F-1208-2** (the guard's blind spot) are your whole brief.
- `archive/lane-perf-gg03-06eeac68` — the rejected slice, pinned. **It is good work and you are re-landing it, not rewriting it.** `git show archive/lane-perf-gg03-06eeac68` for the 9-file, +29/−3 delta.
- `src/news/heraldReader.ts` (`renderFirstIssuePanel`, the `heraldEngravingUrls` glob above it — copy its established pattern), `src/news/heraldReader.css`, `scripts/asset-diet.mjs`, `e2e/gazette-art-wiring.spec.ts:74` + `:103`, `e2e/gazette-first-issue.spec.ts`.
- `specs/greenhorn-gazette/README.md` GG-03.

## WHY
s1208 gated GG-03 and blocked it. Verbatim from the review: control arm **0/8** failures, treatment **6/8**, with `gazette-art-wiring.spec.ts:103` red in **4/4 of its treatment cells and 0/4 of its control cells** at the canonical 2-worker config, interleaved. Measured mechanism: the dev server serves the plates **raw** — `200  3.64 MB  /assets/raw/gazette-panel-claim-goal.png` — so six panels ≈ **21.8 MB** load every time the Claim Herald renders its pinned first issue, which is exactly what `:103`'s plain boot does. It fits inside the 30 s timeout at one worker and does not at two.

The slice's own `asset-diet` ceiling passed at **3,350,448 B / 4,000,000 B** — because it measures `dist/`, where the diet has already cut the plates. **The guard is green on the arm that works and blind to the arm that broke.**

## SCOPE (numbered, each testable)

**1. MEASURE-FIRST STOP GATE — this may cancel the task.**
Before changing anything: apply the archived slice to your lane (`git checkout archive/lane-perf-gg03-06eeac68 -- src/news/heraldReader.ts src/news/heraldReader.css scripts/asset-diet.mjs e2e/gazette-first-issue.spec.ts`) and run `e2e/gazette-art-wiring.spec.ts` at the canonical config (both projects, 2 workers) **twice**, then revert the src pair to your base and run it **twice** more, interleaved. Record all four results with counts.
- Treatment red in ≥2 of its 4 `:103` cells AND control green in 4/4 → **PROCEED to scope 2.**
- Anything else (control also red, or treatment green) → **STOP and report `PREMISE-NOT-REPRODUCED` with the four counts.** The tree has moved and this cure would be aimed at nothing. Do not proceed on a hunch.

**2. Cut the plate weight at the source.**
The six `assets/raw/gazette-panel-*.png` are ~3.3–3.9 MB each at 1672×941. The page needs a panel thumbnail, not a print plate. Produce dev-and-prod-shared web derivatives (the decision on *how* is yours — a build-time transform, a committed derivative set, or routing the glob through the existing diet path — pick one and justify it in your report), targeting **≤400 KB per panel** and **≤2.5 MB for all six combined, as served by `npm run dev`**. Do not touch the raws themselves; they are the archival plates and other work depends on them.

**3. Widen the guard's denominator (F-1208-2).**
`scripts/asset-diet.mjs`'s panel ceiling must also measure **what the dev path serves**, not only `dist/`. A guard whose denominator is narrower than the defect is the thing that let this through. Whatever mechanism you choose in scope 2, the guard must fail if the served panel weight regresses past the ceiling.

**4. Prove the guard bites (mutation proof — load-bearing, do not skip).**
Temporarily point the wiring back at a full-size raw, show the scope-3 guard **fails**, restore, show it **passes**. Paste both outputs in your report. A guard you have only ever seen pass is not a guard.

**5. Re-run the scope-1 battery and show the red is gone.**
Same command, same worker count, **twice**. `gazette-art-wiring` 4/4 green both runs. Plus `e2e/gazette-first-issue.spec.ts` 4/4 (the engraving assertions from the archived slice must still hold — the images must still actually decode, `naturalWidth > 0`).

**6. Visual check — the plates must still read as engravings.**
390px + desktop screenshots of the open issue into `artifacts/gg-03b-gazette-panel-weight/`. If the compression has made the engravings muddy at 390px, say so plainly in your report rather than shipping it; that is an owner call, not yours.

## FIREWALL
**TOUCH-ONLY:** `src/news/heraldReader.ts` · `src/news/heraldReader.css` · `scripts/asset-diet.mjs` · `e2e/gazette-first-issue.spec.ts` · whatever asset-derivative file/dir your scope-2 choice requires · `artifacts/gg-03b-gazette-panel-weight/`.
**NO:** `assets/raw/gazette-*.png` (the archival plates — derive from them, never modify them) · `e2e/gazette-art-wiring.spec.ts` (**it is the instrument that caught this; changing it to pass is the one forbidden move**) · `playwright.config.ts` (re-timing every suite in the repo is not one slice's call — F-1204-3 precedent) · panel copy · the masthead vignette (`tasks/lane-gazette-art-swap.md` owns that, F-1208-3) · `src/town/**` · anything outside the Gazette.

## PRE-FLIGHT
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**Base premise check, AFTER the reset (not before):** `97c6a257` (GG-01) and `8dff01fb` (GG-02 plates) must both be ancestors of your base, and all six `assets/raw/gazette-panel-*.png` present. Missing either → STOP, report `LADDER-WAIT`. *(The 11:10 lane-a run of `lane-gazette-art-swap` stopped on exactly this check against a stale base — run it after the reset or it will lie to you.)*

## NO-OP GUARD
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. A scope-1 `PREMISE-NOT-REPRODUCED` stop is a *lawful* exit and must carry its four measured counts.

## SELF-CHECK before READY
- `npx tsc --noEmit` clean · `npm run build` green.
- `e2e/gazette-first-issue.spec.ts` **4/4** and `e2e/gazette-art-wiring.spec.ts` **4/4**, both projects, canonical workers, **each run twice**.
- Adjacent `e2e/gz-02-news-page.spec.ts` green. `e2e/gz-h1-newsie.spec.ts:114` is a **known red** (F-1185-1, `Pip Quick` vs `Chen Mei`, `logs/suite-red-inventory.md:148/149`) — report it, do not chase it, do not "fix" it.
- Zero console/page errors on a **plain** boot (`page.goto('/')` — no `?debug`, no `?tier=`; Mistake #10).
- Served panel weight measured and stated as a number, desktop + 390px screenshots in `artifacts/gg-03b-gazette-panel-weight/`.

READY-FOR-GATES + report: the four scope-1 counts, your scope-2 mechanism and why you chose it, the scope-4 mutation proof (both arms pasted), the served-weight number before and after, and an honest word on whether the engravings still read at 390px.
