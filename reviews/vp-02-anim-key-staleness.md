# vp-02-anim-key-staleness — drain review (s1136)

- **Slice**: `lane-vp-02-anim-key-staleness` (lane-a)
- **Branch / tip**: `lane/m3` @ `b9f1d184` — `runner(lane-a): lane-vp-02-anim-key-staleness.md`
- **Base**: `a3a73654` (merge-base with main)
- **§3.0 drain-block-check**: ✅ CLEAR — `[vp-02-anim-key-staleness] status="queued"` (run before forming any opinion, per F-1104-7)

## VERDICT: ACCEPT — merged

The `-f-` key repair is correct against the binding contract, it converts a real red to
green on both projects, and **no red in this suite is attributable to this merge**. The
runner hit the F-1135-1 defect head-on and **STOPPED rather than bending the test** —
independent confirmation of s1135's root cause from a different lane, on a different day's
premise.

## What it does

`assets/layer-contracts/characters.v2.json` swapped the hero to the s37/batch-005R2 female
sheet (`-f-` filenames). `e2e/vp-02-sprite-animation.spec.ts` was never updated and still
asserted pre-`-f-` names in three places. This slice repairs them, and only them:

- the 8-direction `rotationCases` table (`:29-36`) — all 8 rows to contract `-f-` names
- the fallback test's route-abort glob (`:352`) — `char-hero-sheet-rotation-r*` →
  `char-hero-sheet-rotation*-r*`, so `rotation2` cells are blocked too, and the billboard
  expectation `hero-homesteader.png` → `hero-homesteader-f.png`
- the east-pixels test's two capture keys (`:560`, `:565`) and their assertions

One file, +20/-14. **LANE-TOUCHED, clean** — `git log a3a73654..main -- e2e/vp-02-sprite-animation.spec.ts`
is empty, so main never moved this file since the base. No graft, no 3-way.

### The runner earned a note

It added a **positive control** to the fallback test unprompted: the route-abort handler now
counts aborts and asserts `abortedRotationCells > 0`, printing `[fallback] abortedRotationCells=20`
on both projects. That closes the "a probe that executes nothing reports ZERO" hole in a test
whose entire purpose is to exercise a fallback *after* blocking the primary path. It also
refused the workaround: `BLOCKED-ON-RUNTIME-CONTRACT-DISAGREEMENT` rather than an edit that
would have made the suite green and the game still wrong.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.27s** |
| `e2e/vp-02-sprite-animation.spec.ts` desktop-chrome + mobile-chrome, `--workers=1` | **13 passed / 9 failed** (was 12/10) |
| Console/page errors | asserted empty by `collectErrors` in every passing boot |
| Port | scratch **5233** (`GR_CAPTURE_EXTERNAL_SERVER=1`), lane-b was live on vp-02e — 5188 deliberately not touched (Mistake #12) |
| Screenshots | **none — this merge renders nothing.** Test-only diff; the suite's own screenshot test is a pre-existing red (below). Stated, not skipped. |

### Per-test table (gated on the list, never on a green count — s1135 standing order)

D/M = desktop-chrome / mobile-chrome. "Before" is the runner's measurement at the lane base.

| Test | Before D/M | After D/M | Reading |
|---|---|---|---|
| `:303` clip advances / holds in hit-pause | Pass/Pass | Pass/Pass | unchanged |
| `:350` missing cells → billboard fallback | **Fail/Fail** | **Pass/Pass** | ✅ **the repair's win** |
| `:388` warmed swaps, no renderer growth | Pass/Pass | Pass/**Fail** | ⚠️ **FLAKY — F-1136-1** |
| `:453` rotation contract, all 8 headings | Fail/Fail | Fail/Fail | F-1135-1, unchanged |
| `:512` walk frameKey alternates per heading | Fail/Fail | Fail/Fail | F-1135-1, unchanged |
| `:547` east explicit rotation2 pixels | Fail/Fail | Fail/Fail | **cause changed — F-1136-2** |
| `:592` damped sweep visits every orientation | Pass/Pass | Pass/Pass | unchanged |
| `:612` 180° reversal | Pass/Pass | Pass/Pass | unchanged |
| `:632` boundary wiggle does not oscillate | Pass/Pass | Pass/Pass | unchanged |
| `:651` crossfade adds no draw call at rest | Pass/Pass | Pass/Pass | unchanged |
| `:705` captures VP-02 screenshots | Fail/Fail | Fail/Fail | pre-existing `char.claim_jumper` |

Net **+2 / −1**: fallback goes green on both projects, and the only new red is proven flaky.
**Nothing regressed.**

### `:453` / `:512` are F-1135-1, verbatim

```
Expected value: "char-hero-sheet-rotation-f-r0c2.png"      <- contract se
Received set:   Set {"char-hero-sheet-rotation2-f-r0c2.png",
                     "char-hero-sheet-rotation2-f-r0c3.png"} <- contract e
```

Note **where** it fails: at `se`, which is **row 2**. Row 1 (`s`) now passes. That is exactly
the shape s1135 predicted — "repaired keys advance the suite past the staleness and into the
diagonal defect." The screen came down and the bug was standing behind it.

### ✓ VERIFIED at the contract: vp-02e's scope-2 hypothesis is correct

s1135 authored vp-02e scope 2 on a suspicion ("the four diagonals are exactly the four blocks
with `walk` and no `idle` — suspect the builder drops them"). Reading
`characters.v2.json → slots[0].rotations.directions` directly confirms it:

| Direction | `clips` | Own `frames.files` |
|---|---|---|
| `s`, `n`, `w`, `e` | `walk` **+ `idle`** | yes |
| `se`, `ne`, `nw`, `sw` | **`walk` only** | yes |

The discriminator is exact: **the four blocks missing an `idle` clip are the four broken
directions.** vp-02e's runner should treat this as a confirmed lead, not a guess — but still
measure before repairing, per its scope 1.

## Findings

### F-1136-1 — `:388` warmed-swap texture count is FLAKY, not a regression (non-blocking)

`expect(after?.textures).toBe(baseline?.textures)` → **Expected 26, Received 27** on
mobile-chrome. **Proven flaky by direct alternation**: re-ran the single test twice on the
*unchanged* tree with the identical command — **attempt 1 passed, attempt 2 failed**. A
one-texture race, nondeterministic on a fixed commit.

It cannot be caused by this merge: the diff touches the `rotationCases` table (consumed only
by `:453`/`:512`), the fallback test body, and the east test body. `:388` is not touched and
reads none of them.

The test's own comment already concedes headless transient sensitivity for *draw calls*
("s27 evidence: instantaneous 20 vs steady 19") and uses a tolerance there — but `textures`
is asserted exactly, with no settle. A live `codex exec` (lane-b/vp-02e) was loading the
machine during the full battery, which is a plausible aggravator but not the cause, since the
alternation reproduced under the same load. **Owed: a settle/poll on the texture count like
the one draw calls already have.** Not blocking; recorded for the next fire, no corrective
task authored (one authored master per fire is spent — see below).

### F-1136-2 — `:547` east/west test: the repair changed its cause, and the new cause is a real signal (non-blocking)

Before the repair, `:547` asserted `char-hero-sheet-rotation-r1c0.png` — a filename that
**cannot exist** post-`-f-`. Guaranteed null, guaranteed red, and it told us nothing.
After the repair it asserts `char-hero-sheet-rotation-f-r1c0.png` — the **correct contract
name** — and `west` is *still* null.

So this red has been upgraded from bookkeeping noise to a live question, and it is **not**
F-1135-1: `w` is a pure side with its own explicit block
(`walk: rotation-f-r1c0/c1`, `idle: rotation2-f-r1c3`), so the diagonal fallback path does not
apply to it.

**? INFERRED (not verified — handed on deliberately):** the likely interaction is vp-02d
(`07eed37b`), which merged ~15 min before this run and made the west idle cell **live** for
the first time. The contract's own note said that cell was *"wired but RUNTIME-DORMANT ...
needs a resolver rider (src change, separate task) before it is real"* — vp-02d was that
rider. `canvasCaptureAtHeroFrame(page, 'w', <walk cell>)` may now be catching the hero on
`rotation2-f-r1c3` (west idle) instead of the walk pair. **This is a hypothesis, not a
diagnosis.** It needs a probe that prints what the runtime actually serves at held-west, in
the shape s1135 used for `se`.

Not blocking this merge — `:547` was red before and is red after. But it is the second
instance this week of the same lesson, so it goes in the ledger rather than a fire's memory.

## Merge classification

- Base `a3a73654`; one file, `e2e/vp-02-sprite-animation.spec.ts`.
- **LANE-TOUCHED only.** `git log a3a73654..main` for that path: **empty**. No MAIN-MOVED
  files, no conflicts, no graft.
- The three-dot diff is the whole change (+20/−14). The two-dot diff against main shows large
  deletions — those are main's *newer* commits absent from the stale lane base, the classic
  false-ahead shape, and were correctly ignored.
- **Not batched with vp-02d** (s1135's ruling, upheld): disjoint-pair requires that neither
  slice's spec exercise the other's files, and vp-02d changed `OrientationResolver.ts`, which
  this suite exercises.
- **No firewall violation**: the task's serialization rule reserved
  `e2e/vp-02-sprite-animation.spec.ts` to lane-a and forbade it to vp-02e. Verified the lane
  touched nothing else, and verified vp-02e's TOUCH-ONLY excludes this file — so the live
  lane-b run cannot collide with this merge.
