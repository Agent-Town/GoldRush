# Art run — THE LAST TWO CROOKED WINDS: standalone-row fourth premise

**Date:** 2026-08-10 · **Arm:** native Codex `image_gen` only · **Task:** `f1608-1-eight-winds-two-row-composite` · **Result:** **LAWFUL STOP — Coal Thief `sw` failed the fourth premise; Steam Wrecker was not generated; no shipped sheet changed**

## Pre-flight

The ART-slot gate passed before generation: `git status --porcelain assets/raw/` was empty, the owner ruling `Spend one more batch` appeared twice in `tasks/BACKLOG.md`, and the current bytes matched the task pins.

| sheet | pre SHA-256 | dimensions | post SHA-256 |
|---|---|---:|---|
| `char-coalthief-sheet-walkdiag4-a.png` | `c6ffee23de715a69756d754e314ca9777a9b7b8e3ddfdd94e5627a9a6ab1b034` | 1252×1252 | `c6ffee23de715a69756d754e314ca9777a9b7b8e3ddfdd94e5627a9a6ab1b034` |
| `char-steamwrecker-sheet-walkdiag4-a.png` | `465d92984c5dc498d756311e81a036941fd6f155420b3aebc71dacc1bcf0782b` | 1252×1252 | `465d92984c5dc498d756311e81a036941fd6f155420b3aebc71dacc1bcf0782b` |

The prompt builder ran in an isolated scratch directory so its fixed output path could not dirty the tracked prompt files:

```text
node scripts/anim-pass-prompt.mjs coal-thief sw --frames 4 --cols 4
node scripts/anim-pass-prompt.mjs steam-wrecker se --frames 4 --cols 4
```

Both emitted `4x1`. Before any generation, the Steam Wrecker prompt was verified to contain both `there is exactly ONE, never two` and `RIGHT-HAND side`. No prompt text or cast data was hand-edited.

## Fourth-premise result and stop

One native generation was made, conditioned on `char-coalthief-sheet-walk4-a.png`, and retained at:

`worktrees/art/assets/raw/char-coalthief-row-sw-single.png`

SHA-256: `ef29683eff99414cf82eea32f96692e1608570093f662bfeedf0bc5921bf6a0b` · 1,882,887 bytes.

| acceptance item | measured result | verdict |
|---|---|---|
| Container | 1983×793; four figures in one horizontal row, but `1983 % 4 = 3` | **FAIL** exact equal-cell geometry |
| Heading | all four figures travel screen-left in a front/side three-quarter read | `sw` travel present |
| Coal sack side | screen side per frame: **R, R, R, R** | **FAIL**; required **L, L, L, L**, partly hidden behind torso |
| Raw key | detected median `#f906f9`; only 70/1,572,519 pixels are exact `#ff00ff`; border RGB spread `16,34,13` | **FAIL** exact-key purity |
| Text / watermark | Tesseract stdout empty; full-size visual read found none | pass |
| Canon | no firearm, gun-like silhouette, gore, extra character, or scenery | pass |

This reproduces the prior failure mechanism despite changing the container: the sack remains on screen-right. The task says a failed fourth premise is a successful negative result and orders a STOP rather than a fifth premise. Therefore:

- no retry or edit was made;
- the authorized Steam Wrecker generation was not spent after the stop;
- neither generated row was grafted;
- both shipped sheets remain unchanged.

## Dry graft metrology

The required Coal Thief graft was run with `--dry` only:

```text
node scripts/anim-pass-graft.mjs --sheet char-coalthief-sheet-walkdiag4-a \
  --grid 4x4 --row 0 --src worktrees/art/assets/raw/char-coalthief-row-sw-single.png \
  --src-grid 4x1 --match-row 1 --dry
```

| row | match row | reference height / foot / centre | source median | scale | projected heights | height delta | ground-line delta |
|---|---:|---|---:|---:|---|---:|---:|
| Coal Thief row 0 `sw` | 1 | 255 px / 266 px / 150.5 px | 526 px | 0.4848 | 252, 256, 250, 255 px | 0 px median | 0 px |

A temporary out-of-tree candidate graft reported 24 clipped source scanlines, but it was measurement-only and was not copied over the shipped sheet.

## Untouched-row proof

Every row remains byte-identical to `HEAD`; the required preserve rows are therefore **6/6 identical**, and all rows across the two in-scope sheets are **8/8 identical**.

| sheet | row 0 | row 1 | row 2 | row 3 |
|---|---|---|---|---|
| Coal Thief | `9646062e836cc143f43807d6fdb99dec4bfe91cd46df04b5aff318ed24b5f3de` | `392205e176242119fb4638ad07f9fc3cfa79be8d7c9d9b8c33ab671e9a261b95` | `c481dcfc3d1a7002e8fbce404ddff3294bb16c76613d3ec7efe160a20d287417` | `42f26c91dd77c7debfe6d426f5001382aad342103c9d66444c89c791f3e0db5e` |
| Steam Wrecker | `543c7c96912f3f25c1ef091aa328705e71e5ee469a0840a1d813b3320498d0ae` | `f3c13149f18a6cd92b30726beae9204a915b57f96017b78e29e562663277eeea` | `4c476bc01e52f1241b7a3e289cecd3c311274019d9019e81a20055591f6ead01` | `f0a304958756b76d0a94d1cf96d83d701f7dcf55df8974dae25b372f1d1552b2` |

## Measured sheet state

Because no candidate was accepted, this is the unchanged shipped state, emitted by the existing Eight Winds instruments.

| sibling sheet | base | dims / grid decl·art | cells @scale | base height band | composed heights | drift | components / crossing a cut | key bg% / halo% | dup flagged→real |
|---|---|---|---|---|---|---|---|---|---|
| `char-coalthief-sheet-walkdiag4-a` | `char-coalthief-sheet-walk4-a` | 1252x1252 / 4x4·4x4 | 16/16 @1 | 244-274 (med 258) | 216-265 (med 256) | **-0.8%** | 25 / **0** | 74.34 / 0.364 | 0→0 |
| `char-steamwrecker-sheet-walkdiag4-a` | `char-steamwrecker-sheet-walk4-a` | 1252x1252 / 4x4·4x4 | 16/16 @1 | 237-249 (med 242) | 227-252 (med 243) | **+0.4%** | 33 / **0** | 72.40 / 0.659 | 0→0 |

The generic dupecheck has no current hash-flagged pair for Coal Thief, so its `0→0` is not a heading verdict. The dedicated row-order instrument remains applicable because the sheet hash is unchanged: rows 0/1 are direct `0.863` vs mirrored `0.671`, delta `+0.192`, so the shipped row 0 remains the duplicate heading. Acceptance did not flip.

The current Steam Wrecker row-1 defect was remeasured with `logs/s1189-tank-cluster-probe.mjs`: cyan clusters per frame are **2, 2, 2, 2**. Row 2 reproduced its positive control at **1, 1, 1, 1**. No candidate exists to compare because the failure stop occurred first.

## Gates

- `npx tsc --noEmit`: rc 0
- `npm run build`: rc 0; Vite built in 1.41 s; asset-diet green
- `git diff --check`: clean
- task-owned tracked diff: this run file plus one appended LEDGER row; no sheet, prompt, cast, source, e2e, spec, or processed-asset bytes changed

## Final verdict

**LAWFUL NEGATIVE RESULT; READY-FOR-GATES.** The standalone-row container did not cure Coal Thief's body-side error. No fifth premise was spent, no shipped pixel was changed, and Steam Wrecker remains unattempted under this stopped batch. A further generation premise requires a new owner ruling.
