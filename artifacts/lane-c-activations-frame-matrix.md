# Assay-office frame matrix — contract-derived repair

Base: `c041e49a978dfcd535387ec8b3d067ab9dd5b3cc` (`main` at lane reset)

## Before

Command:

```sh
npx playwright test e2e/lane-c-activations-assay-office.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=list
```

Result: rc `1`, 4 passed / 2 failed (28.4s).

| Project | Test | Result | First failure |
|---|---|---:|---|
| desktop-chrome | claim jumpers walk through the 8-way rotation matrix | FAIL | `:99` — Expected value: `"char-bandit-base-sheet-walk8-r0c3.png"`; Received array: `["char-jumper-sheet-rotation-r0c0.png", "char-jumper-sheet-rotation-r0c1.png"]` |
| desktop-chrome | build menu shows the six processed building portraits | PASS | — |
| desktop-chrome | Assay Office is river-adjacent only and opens the bench on confirm | PASS | — |
| mobile-chrome | claim jumpers walk through the 8-way rotation matrix | FAIL | `:99` — Expected value: `"char-bandit-base-sheet-walk8-r0c3.png"`; Received array: `["char-jumper-sheet-rotation-r0c0.png", "char-jumper-sheet-rotation-r0c1.png"]` |
| mobile-chrome | build menu shows the six processed building portraits | PASS | — |
| mobile-chrome | Assay Office is river-adjacent only and opens the bench on confirm | PASS | — |

This is the F-1146-4 shape: the observed frame was already a `char.bandit_base` walk8 frame, while the expected matrix still named the old jumper rotation sheet. The observed `c3` value was recorded only as reproduction evidence; it did not author the replacement.

## Contract derivation

The spec reads `assets/layer-contracts/characters.v2.json`, selects `char.bandit_base.walk8`, removes `.png` from `grid.file` for the frame stem, resolves each direction through `aliases`, finds that result in `grid.rowDirections`, and enumerates `grid.cols` frame keys. `mirrored` is false whenever the resolved direction has its own row.

Contract row frame sets:

- `R0` (`s`): `char-bandit-base-sheet-walk8-r0c0.png`, `char-bandit-base-sheet-walk8-r0c1.png`, `char-bandit-base-sheet-walk8-r0c2.png`, `char-bandit-base-sheet-walk8-r0c3.png`, `char-bandit-base-sheet-walk8-r0c4.png`, `char-bandit-base-sheet-walk8-r0c5.png`, `char-bandit-base-sheet-walk8-r0c6.png`, `char-bandit-base-sheet-walk8-r0c7.png`
- `R1` (`w`): `char-bandit-base-sheet-walk8-r1c0.png`, `char-bandit-base-sheet-walk8-r1c1.png`, `char-bandit-base-sheet-walk8-r1c2.png`, `char-bandit-base-sheet-walk8-r1c3.png`, `char-bandit-base-sheet-walk8-r1c4.png`, `char-bandit-base-sheet-walk8-r1c5.png`, `char-bandit-base-sheet-walk8-r1c6.png`, `char-bandit-base-sheet-walk8-r1c7.png`
- `R2` (`e`): `char-bandit-base-sheet-walk8-r2c0.png`, `char-bandit-base-sheet-walk8-r2c1.png`, `char-bandit-base-sheet-walk8-r2c2.png`, `char-bandit-base-sheet-walk8-r2c3.png`, `char-bandit-base-sheet-walk8-r2c4.png`, `char-bandit-base-sheet-walk8-r2c5.png`, `char-bandit-base-sheet-walk8-r2c6.png`, `char-bandit-base-sheet-walk8-r2c7.png`
- `R3` (`n`): `char-bandit-base-sheet-walk8-r3c0.png`, `char-bandit-base-sheet-walk8-r3c1.png`, `char-bandit-base-sheet-walk8-r3c2.png`, `char-bandit-base-sheet-walk8-r3c3.png`, `char-bandit-base-sheet-walk8-r3c4.png`, `char-bandit-base-sheet-walk8-r3c5.png`, `char-bandit-base-sheet-walk8-r3c6.png`, `char-bandit-base-sheet-walk8-r3c7.png`

| Direction | Alias resolution | Row | Frame keys | Mirrored |
|---|---|---:|---|---:|
| `s` | `s` | 0 | `R0` | false |
| `se` | `se → e` | 2 | `R2` | false |
| `e` | `e` | 2 | `R2` | false |
| `ne` | `ne → e` | 2 | `R2` | false |
| `n` | `n` | 3 | `R3` | false |
| `nw` | `nw → w` | 1 | `R1` | false |
| `w` | `w` | 1 | `R1` | false |
| `sw` | `sw → w` | 1 | `R1` | false |

The spawn-position values are unchanged. The test loop, `char.bandit_base` wait, frame assertion, mirror assertion, and console/page-error assertions remain in place.

## After

Result: rc `0`, 6 passed (23.9s), 3/3 in each project.

```text
✓  1 [desktop-chrome] › e2e/lane-c-activations-assay-office.spec.ts:98:1 › claim jumpers walk through the 8-way rotation matrix (4.5s)
✓  2 [desktop-chrome] › e2e/lane-c-activations-assay-office.spec.ts:125:1 › build menu shows the six processed building portraits (3.9s)
✓  3 [desktop-chrome] › e2e/lane-c-activations-assay-office.spec.ts:144:1 › Assay Office is river-adjacent only and opens the bench on confirm (3.7s)
✓  4 [mobile-chrome] › e2e/lane-c-activations-assay-office.spec.ts:98:1 › claim jumpers walk through the 8-way rotation matrix (3.7s)
✓  5 [mobile-chrome] › e2e/lane-c-activations-assay-office.spec.ts:125:1 › build menu shows the six processed building portraits (3.3s)
✓  6 [mobile-chrome] › e2e/lane-c-activations-assay-office.spec.ts:144:1 › Assay Office is river-adjacent only and opens the bench on confirm (3.2s)

6 passed (23.9s)
```

| Project | Matrix | Portraits | Assay Office |
|---|---:|---:|---:|
| desktop-chrome | PASS | PASS | PASS |
| mobile-chrome | PASS | PASS | PASS |

## Self-check

| Command | Result |
|---|---|
| `npx tsc --noEmit` | rc `0`; no diagnostics |
| `npm run build` | rc `0`; Vite transformed 2,001 modules and built in 1.08s; asset diet completed |
| target command above | rc `0`; 6/6 total, 3/3 desktop and 3/3 mobile |
| `npx playwright test e2e/visual-polish-assets.spec.ts e2e/vp-02b-rotation-resolver.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=list` | rc `0`; 18/18 total (1.5m): `visual-polish-assets` 2/2 and `vp-02b-rotation-resolver` 7/7 in each project |
| `git status --short` | only `e2e/lane-c-activations-assay-office.spec.ts` and this report; zero `src/` diff |

The matrix test still asserts empty console and page-error buckets at lines 121–122. The other two tests keep the same assertions at lines 140–141 and 165–166.

## Scope-5 findings

None. Every observed runtime frame belonged to the contract-derived row for its requested direction, and every observed `mirrored` value matched the contract-derived `false`.
