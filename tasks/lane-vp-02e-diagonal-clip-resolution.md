# Task lane-vp-02e: diagonal headings must render their own contract art — `SpriteAnimator` never consults the four diagonal blocks (lane-b, commit prefix "fix:")

**FIRE-AUTHORED s1135 (attended review welcome).** From **F-1135-1**, found while draining vp-02d this same fire (`reviews/vp-02d.md`, `tasks/BACKLOG.md` tail). It invents no scope: the contract already specifies the four diagonal blocks and the runtime already ignores them.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE — every modified/deleted/untracked file's content must already exist somewhere in git** (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1135 pre-measured the branch and you must still re-verify it: `lane/m4` is **1 ahead** at `132e14e2`, the vp-02d runner commit. **It was drained this fire at `07eed37b` — but NOT verbatim:** I rejected its rewrite of the `directions` table and merged that table at contract values instead. So the branch's copy of `e2e/vp-02b-rotation-resolver.spec.ts` is **superseded, not unmerged** — its blob is reachable in the lane's own commit, so the invariant holds and the reset loses nothing. **Reset to main; do not try to preserve the branch's version of that table — main's is the corrected one, and it is the one you must make green.**)*

## READ FIRST (paths, in this order)

1. `reviews/vp-02d.md` — F-1135-1 is this task's entire WHY. Read the root-cause paragraph and the contract table.
2. `assets/layer-contracts/characters.v2.json` → slot `char.hero`, `rotations.directions`. **This file is BINDING.** All eight directions have their own `frames.files`; `mirrors` is `{}`.
3. `src/assets/SpriteAnimator.ts:419-455` — `pickClip`. The defect is here.
4. `src/assets/OrientationResolver.ts` — `coarseOrientationForDirection` is the fallback that currently wins.
5. `e2e/vp-02b-rotation-resolver.spec.ts:24-33` (the `directions` table) and the test at `:113`.

## WHY (evidence, quoted)

`reviews/vp-02d.md`, F-1135-1, s1135, measured this fire: at heading `se` the runtime serves `char-hero-sheet-rotation2-f-r0c3.png` — an **east** frame — while diagnostics correctly report `direction: 'se'`. The contract gives `se` its own block (`char-hero-sheet-rotation-f-r0c2.png`, `…r0c3.png`). Same class for `ne`, `nw`, `sw`.

Root cause read at source: `SpriteAnimator.pickClip:428` tests `runtime.orientations.has(clipDirection)`. The diagonal misses that map; `:429` falls back to `runtime.rotationMirrors`, which the contract retired to `{}` at s37 (*"Robin call: no mirrors for the asymmetric hero"*); no clip is found; control drops to the coarse fallback at `:443-447`, which serves a pure-side clip. **The contract's explicit diagonal blocks are never consulted.**

It stayed invisible because the `-f-` staleness failed the test at row 1 (`s`), so no run reached row 2. Player-visible: walking NE/SE/NW/SW shows pure east/west art.

## SCOPE (numbered, each testable)

1. **MEASURE BEFORE YOU REPAIR.** Boot the game and record, for each of the eight headings, the `direction` and `frameKey` the runtime actually produces. Write that eight-row table into your report **before** changing any src. This is the authority for what follows — if it disagrees with the paragraph above, **your measurement wins and you say so.**

2. **Find why `runtime.orientations` lacks the diagonal keys.** Read the code that builds that map from the contract's `rotations.directions`. The eight blocks exist in JSON; determine whether the builder drops blocks that have no `idle` clip (the four diagonals are exactly the four blocks with `walk` only), or whether the key is being normalised. **Name the mechanism in your report.**

3. **Fix it at the builder or the lookup, so all eight contract directions resolve to their own `frames.files`.** Smallest change that makes the contract authoritative. **Do NOT** add per-direction special cases, and **do NOT** touch the coarse fallback's behaviour for slots that genuinely have no explicit block (other characters rely on it).

4. **Prove the fallback still works for a slot that needs it.** Pick one enemy slot whose contract has no 8-way `rotations` block, and assert it still animates. A fix that makes the hero right and an enemy blank is a failure.

5. **`e2e/vp-02b-rotation-resolver.spec.ts:113` must go green** on desktop and mobile with the table **exactly as merged** (contract values). **If you find yourself editing that table, STOP** — the table is the contract, and s1135 already verified it row by row against `characters.v2.json`.

6. Screenshot each of the four diagonal headings mid-walk into `reviews/shots-vp-02e/` (desktop). The hero must visibly face the diagonal.

## TOUCH-ONLY

- `src/assets/SpriteAnimator.ts`
- `src/assets/OrientationResolver.ts` (only if scope 2 proves the defect lives there)
- whichever module builds the runtime orientation map from the contract
- `reviews/shots-vp-02e/**` (new)
- your report

## NO — do not touch

- **`assets/layer-contracts/characters.v2.json`.** It is the authority. If you believe the contract is wrong, that is a **STOP + report**, not an edit.
- **the `directions` table in `e2e/vp-02b-rotation-resolver.spec.ts`** (see scope 5).
- `e2e/vp-02-sprite-animation.spec.ts` — lane-a owns it; serialization.
- any art/PNG under `assets/`.
- `Balance.ts`, gameplay tuning, anything not named in TOUCH-ONLY.

## SELF-CHECK (name the exact evidence)

- `npx tsc --noEmit` clean · `npm run build` green.
- `e2e/vp-02b-rotation-resolver.spec.ts` — **desktop-chrome AND mobile-chrome**, per-test list, no bare counts. `:113` green.
- The `:233` jumper test is a **known pre-existing red** (`spawnPack()` exposes `char.bandit_base`, not `char.claim_jumper`). Leave it red; do not "fix" it here. Confirm it fails the same way it does today.
- Adjacent: `e2e/vp-02-sprite-animation.spec.ts` — report its per-test before/after. Expect **improvement, not necessarily green** (lane-a's `-f-` repair lands separately).
- Zero console/page errors in every boot probe.
- Scope-4 fallback proof named explicitly.

**READY-FOR-GATES** — report: the scope-1 eight-row measurement, the scope-2 mechanism in one sentence, the diff, the per-test lists, and the four diagonal screenshots.
