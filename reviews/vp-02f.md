# vp-02f — stale NE keys and warmed-swap texture settle

- **Slice:** `lane-vp-02f-stale-and-flaky-assertions`
- **Branch/base:** `lane/m4` @ `cc663f52`
- **Verdict:** **READY-FOR-GATES**
- **Scope:** test-only; no retained `src/**` change

## Repair

1. `e2e/vp-02b-rotation-resolver.spec.ts:292` now waits for NE's binding
   contract frames:
   - `char-hero-sheet-rotation-f-r1c2.png`
   - `char-hero-sheet-rotation-f-r1c3.png`

   Source: `assets/layer-contracts/characters.v2.json:27-29`,
   `char.hero.rotations.directions.ne.frames.files`. The runtime was not used
   to derive these names.

2. `e2e/vp-02-sprite-animation.spec.ts:388` now samples both texture and draw-call
   resting floors through the same 500 ms renderer-count settle. Geometry remains
   an exact snapshot comparison.

## Before/after per-test list

Command in both cases:

```sh
npx playwright test \
  e2e/vp-02b-rotation-resolver.spec.ts \
  e2e/vp-02-sprite-animation.spec.ts \
  --project=desktop-chrome --project=mobile-chrome \
  --workers=1 --reporter=line
```

D/M = desktop-chrome/mobile-chrome. These are per-test outcomes, not inferred
from the aggregate count.

### `vp-02-sprite-animation`

| Test | Before D/M | After D/M | Reading |
|---|---|---|---|
| `:303` test clip advances and holds during hit-pause | Pass/Pass | Pass/Pass | unchanged |
| `:350` missing cells fall back to billboard | Pass/Pass | Pass/Pass | unchanged; abort control = 20 both projects |
| `:388` warmed swaps do not grow renderer memory/draw calls | Pass/Pass | Pass/Pass | repaired assertion green |
| `:453` rotation contract fires both stride cells | Pass/Pass | Pass/Pass | unchanged |
| `:512` held heading alternates walk frameKey | Pass/Pass | Pass/Pass | unchanged |
| `:547` east uses explicit rotation2 pixels | **Fail/Fail** | Pass/**Fail** | out-of-scope west-capture instability; see below |
| `:592` damped sweep visits all orientations | Pass/Pass | Pass/Pass | unchanged |
| `:612` reversal crosses intermediates | Pass/Pass | Pass/Pass | unchanged |
| `:632` boundary wiggle does not oscillate | Pass/Pass | Pass/Pass | unchanged |
| `:651` crossfade adds no resting draw call | Pass/Pass | Pass/Pass | unchanged |
| `:705` capture review shots | **Fail/Fail** | **Fail/Fail** | unchanged absent `char.claim_jumper` |

### `vp-02b-rotation-resolver`

| Test | Before D/M | After D/M | Reading |
|---|---|---|---|
| `:113` locomotion resolves all 8 directions | Pass/Pass | Pass/Pass | unchanged |
| `:129` hysteresis holds at boundary | Pass/Pass | Pass/Pass | unchanged |
| `:150` idle resolver side/hemisphere map | Pass/Pass | Pass/Pass | unchanged |
| `:165` pure-side idle and diagonal snap | Pass/Pass | Pass/Pass | unchanged |
| `:191` explicit east/west idle cells | Pass/Pass | Pass/Pass | unchanged |
| `:233` action clips and jumper diagnostics | **Fail/Fail** | **Fail/Fail** | unchanged absent `char.claim_jumper` |
| `:292` rotation scale-pulse review shots | **Fail/Fail** | **Pass/Pass** | repaired NE keys |

Raw aggregate: **28 passed / 8 failed before**; **31 passed / 5 failed after**.
The repair accounts for the two `:292` transitions. The additional desktop
`:547` transition is an out-of-scope alternation on an untouched assertion.

### Measurement disagreement with the task's prior WHY

The before run found `:547` red on **desktop and mobile**, both with
`west === null`; the prior evidence said desktop green/mobile red. The after
run returned to desktop green/mobile red. Current measurement therefore wins:
the desktop arm can alternate too. No diagnosis or assertion loosening was
attempted; F-1137-2 remains a separate probe task.

## Texture-settle stability and can-still-fail proof

Healthy-subject outcomes for `:388`, all `--workers=1`:

| Run | Desktop | Mobile |
|---|---|---|
| full before | Pass | Pass |
| focused repaired pair | Pass | Pass |
| repetition 1 | Pass | Pass |
| repetition 2 | Pass | Pass |
| repetition 3 | Pass | Pass |
| full after | Pass | Pass |

The required three post-repair repetitions per project were therefore
**desktop Pass/Pass/Pass; mobile Pass/Pass/Pass**.

For the non-vacuity proof, the subject was temporarily mutated at
`SpriteAnimator.createTestClip`: adding `testClipVersion` to the atlas cache key
forced every clip swap to retain a fresh texture. The repaired desktop assertion
went **RED**:

```text
Expected: 33
Received: 37
at expect(afterTextures).toBe(baselineTextures)
```

The subject mutation was reverted with `apply_patch`; immediately before the
repetition battery, `git diff --exit-code -- src/assets/SpriteAnimator.ts`
returned zero, and the reverted subject then passed all six repetitions.
No `src/**` change remains.

## Known-red fingerprints and boot errors

- `vp-02b:233` remains red on both projects at the unchanged wait for
  `spriteAnimations['char.claim_jumper']?.loaded === true`.
- `vp-02-sprite-animation:705` remains red on both projects at the same
  `char.claim_jumper` wait.
- `vp-02-sprite-animation:547` remains red on mobile with `west === null`;
  desktop alternated red-before/green-after as recorded above.
- Repaired `:292` and `:388` complete their existing
  `consoleErrors === []` / `pageErrors === []` assertions on both projects.
  No console/page error appeared in any boot; the retained reds are the named
  waits/assertion, not browser error buckets.

## Final gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green**, Vite built in 1.43 s; asset-diet completed |
| repaired pair, desktop + mobile | **4/4 passed** |
| `:388 --repeat-each=3`, desktop + mobile | **6/6 passed** |
| full two-suite after battery | **31 passed / 5 known failures** |
| `git diff --check` | **clean** |
| retained `src/**` diff | **none** |

## Scope discipline

I did not edit the direction table, the character contract, `:233`, `:547`,
`:705`, art, or balance. The only out-of-scope edit was the required temporary
subject mutation for the can-still-fail proof; it was reverted before every
final gate. Generated screenshot churn was also restored/removed.


---

# DRAIN ADDENDUM — s1138 fire, 2026-07-27

- **Slice/branch/tip:** `lane-vp-02f-stale-and-flaky-assertions` · `lane/m4` @ `7b35e6d3` (base `cc663f52`)
- **Verdict:** **ACCEPT (merge).** Both repairs verified on the merged tree, not inherited from the runner.
- **§3.0 `drain-block-check`:** **CLEAR**, run before I formed an opinion.

## Merge classification

Base `cc663f52`; three-dot LANE-TOUCHED = **3 files** (the two specs + this review).
`git log cc663f52..main -- <both specs> reviews/vp-02f.md` is **empty** — main never moved
them, so **LANE-TOUCHED clean, no graft**. The only main movement since the base is this
fire's own three bookkeeping commits (`STATUS.md`, `tasks/`), which touch no `src/` or
`e2e/`. Files taken with `git checkout lane/m4 -- …`; `git diff lane/m4 -- <paths>` after
the checkout is **empty**, i.e. taken **verbatim**.

## Scope-2 verified at the contract, which is the one that mattered

The master forbade re-deriving `:292`'s NE keys from observed runtime (the vp-02d failure
mode that promoted a live bug into a spec). The landed keys are
`char-hero-sheet-rotation-f-r1c2.png` / `…r1c3.png`. ✓ **Traced to
`assets/layer-contracts/characters.v2.json:28`** — `char.hero.rotations.directions.ne.frames.files`
— which holds exactly those two filenames in that order. **The runner read the contract; it
did not copy the runtime.**

The `:388` repair also did what was asked structurally: it **generalised the existing
`steadyCalls()`** into `steadyRendererCount(page, key)` and applied it to `textures`, rather
than inventing a second settle mechanism.

## Evidence (re-measured on the merged tree, scratch port 5241, `--workers=1`)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.30s** |
| `:292` (F-1137-1 target) | **PASS desktop + mobile** |
| `:388` (F-1136-1 target), full battery, quiet box | **PASS desktop + mobile** |
| `:388` isolated, `--repeat-each=3` | **6/6 PASS** (3 desktop, 3 mobile) |
| full two-suite battery, quiet box | **32 passed / 4 failed** |
| console/page errors | none — `consoleErrors`/`pageErrors` assertions pass in every green test |

The 4 remaining reds are **`:233` ×2 and `:707` ×2** (was `:705`; +2 line shift from the
helper edit) — both the `char.claim_jumper` absent-slot waits the master named as known
reds and told the runner to leave alone. Fingerprint matches: `page.waitForFunction` timeout
on the same wait, both projects.

## F-1138-6 — my FIRST battery failed `:388` on both projects, and the cause was my own box, not the repair

Worth recording because it nearly produced a wrong rejection of a correct fix. My first
full battery ran **while the lane-a runner was still live**, and returned **`:388` RED on
both projects — `Expected: 80, Received: 81`**, an off-by-one texture: *the exact signature
of the F-1136-1 flake this task exists to cure.* The tempting read was "the settle does not
work".

**Separated by A/B on the same invocation rather than argued:** same command, same commit,
the only variable being load.

| `:388`, full battery, `--workers=1` | desktop | mobile |
|---|---|---|
| lane-a runner live | **RED** (80 vs 81) | **RED** |
| quiet box | **GREEN** | **GREEN** |
| isolated `--repeat-each=3` | GREEN ×3 | GREEN ×3 |

Note the in-suite baseline is **80 textures** against **33** isolated, so a suite-context
explanation was live and had to be excluded, not assumed away — the quiet-box *full-suite*
re-run is what excluded it. ➡️ **The repair is sound.** It settles a transient; it cannot
settle a machine that is starved of CPU, and no assertion of this shape could. *A gate
battery run beside a live runner measures the runner too.*

## F-1138-7 — F-1137-2 did NOT reproduce here, so "reproducible" is now doubtful (open, unchanged, do not act on this)

`:547` → now **`:549`** after the +2 shift. s1137 recorded it as *"Reproducible, cure-caused,
mobile-only"* and the vp-02f runner reported it *"remains red on mobile"* with desktop
alternating. **On my merged tree it passed on BOTH projects in BOTH full batteries — 2/2,
contended and quiet.** That does not clear it and I am not claiming a diagnosis: it makes
the finding look **intermittent** rather than deterministic, which is a different open
question from the one s1137 wrote down. ⚠️ **This strengthens the master's decision to
EXCLUDE `:547` from repair.** An intermittent red is exactly the kind someone "fixes" by
loosening the assertion; the probe F-1137-2 asks for is still the right next step, and it
now needs enough runs to establish a rate rather than a single reproduction.
