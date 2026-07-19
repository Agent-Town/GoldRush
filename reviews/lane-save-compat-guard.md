# Review — lane-save-compat-guard (THE SAVE-COMPAT LAW gets teeth)

**Slice:** lane-save-compat-guard · **Branch:** lane/m3 · **Tip:** a6f8431c (`runner(lane-a): lane-save-compat-guard.md`)
**Drained by:** s750 fire · **Verdict:** ✅ MERGE — surgical additive graft onto clean main.

## What it does
Freezes a real-path ledger-pack fixture as the eternal ancestor and adds an e2e guard so no future format change can silently break loading an old save. Enforces owner law (2026-07-19, verbatim): *"we have to update the server later and MUST keep players progress."* Production change is a 2-line documentation comment only; the enforcement lives in the test + fixture.

## Delta (exactly 3 files; commit a6f8431c vs parent 475f8597)
| File | Change |
|------|--------|
| `e2e/fixtures/ledger-pack-v2026-07-19.json` | NEW — frozen ledger pack (v2 gzip-base64 envelopes, `$goldRushGzipDataV1`), the eternal ancestor. |
| `e2e/save-compat.spec.ts` | NEW — 1 test × 2 projects: seeds a Local Keeper profile, `expandCloudProfileTransfer`+`unpackProfile` every pack, reconciles active epoch, asserts imported results/names match `expected`, then reloads → Continue → boots a run (`the-claim`, `vein-hunter`) with zero console/page errors. |
| `src/game/ProfileTransfer.ts` | +2 lines — SAVE-COMPAT LAW header comment (storage keys append/migrate-only; imports never destroy; new fixtures ADD, never replace ancestors). |

## Merge classification
- **Stale-base lane:** lane/m3 forked at merge-base 475f8597 (crossing-armed, already SHIPPED as different hash) + 1 commit (a6f8431c). Two-dot `git diff main lane/m3` is huge (stale-base noise); the true delta is the single commit = 3 files.
- All 3 files LANE-TOUCHED / MAIN-UNMOVED: main lacks the 2 new e2e files; `git diff 475f8597 main -- src/game/ProfileTransfer.ts` = EMPTY (byte-identical) → `git checkout lane/m3 -- <3 files>` reproduces the exact grafted result with no 3-way needed. No conflicts.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (no output) |
| `npm run build` | ✓ built in 934ms |
| `e2e/save-compat.spec.ts` desktop + mobile | **2 passed (3.7s)** — includes full boot probe + zero-console assertions |
| Adjacent suites | none affected — production behavior unchanged (comment-only); the spec is a new safety net, not a behavior change |

## Findings
None blocking. This is a pure test/safety-net addition; the guard is display-safe (import-path only, never mutates live storage in normal play).

## Not player-visible
No in-game visible change → no gazette item per the filter law (safety guarantee, not a visible change).
