# Review: first-town-payload-gate — the deploy's first-town gate judges payload, not host speed (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-07 late morning)

**Slice/branch/tip:** `first-town-payload-gate` · `feat/first-town-payload-gate` · commit `e2a6736ff` on base `7c52a3696` · merged to main: see the ledger row (first-parent merge; the only collision the ledger).
**Verdict:** MERGED. Owner desk answer A7 ("ok, good"), the recommendation accepted: the host-speed byte gate becomes a payload-shaped gate. `scripts/first-town-payload.mjs` computes the first town from the BUILD: a declaration file `assets/first-town-payload.json` names the families the town needs (hero, plates, models, audio, code, document; the ten town-actor sheets marked `demandPaged`), read by the advance stream too so the gate and the runtime cannot disagree, mapped to `dist/assets` and summed by family; deterministic (three runs byte-identical on the lane and on the merged tree, sha `8b127264…`). The RELEASE VERDICT block takes pass/fail from the payload against the unchanged 25,000,000 B budget (GATED TOTAL 15,575,273 B on the lane's build, 62 % of budget, 9.4 MB headroom; 15,575,362 B on the merged tree) and keeps the browser probe as a TRIPWIRE under a 30,000,000 B ceiling with its number printed and its nature named ("host speed not payload"); `--allow-over-budget` waives both; `e2e/asset-diet.spec.ts`'s `TOWN_TRANSFER_CEILING_BYTES` moved with it and the guard asserts the two ceilings are one number (F-FTP-5). Measured facts that hold on every host, replacing the swing as the case against the old instrument: `vite preview` serves JS/CSS without `content-length`, so 25 of the window's 236 responses read ZERO bytes (`index.js` at 1,138,813 B among them, 2,300,691 B or 14 % of the old number invisible always, F-FTP-2); and 2,853,225 B inside the recorded window is work the town already refused (the next map's GLBs and the era loop, inside only through the ~500 ms CDP skirt). The 2.05× swing did NOT reproduce on this quiet host (six readings of one build, 0.00 % spread); reported as measured.

## Evidence
| Gate | Where | Result |
|---|---|---|
| Payload | worktree | the table by group; three runs byte-identical; the direct-invocation check compares real paths (F-FTP-4, found and cured in flight: `/var` vs `/private/var` had made the script print nothing and exit 0) |
| Verdict | worktree | `bash scripts/deploy.sh --dry-run` prints the new block |
| Guards | worktree | `deploy-budget` 27/27 (rewritten to the new semantics; the script and its four cross-check sources must exist); `first-town-request-families` + `sprite-cell-url-inlining` + `hero-clip-groups` 14/14; `test-deploy-contract.sh` PASS; `no-emdash`, `citation-title`, `findings-state` |
| tsc / build | worktree | clean / green (`GR_RELEASE=e1`) |
| e2e | worktree, preview 5294, both projects | `asset-diet` on the release build 17 / 1 (the screenshot-tolerance census test, the standing fingerprint) |
| Engine era | worktree hash `1926c803…` | identical on the merged tree; pinned by the drain |
| Attended on the merged tree | see the drain commit and the ledger row | tsc clean; era-5 pin `1926c803` 5/5; release build green; five guard files 63/63; the deploy contract PASS; the payload script three runs byte-identical (GATED TOTAL 15,575,362); `deploy.sh --dry-run` prints the new block (payload GATE PASS 15,575,273 / 25,000,000; probe TRIPWIRE PASS 16,101,489 / 30,000,000 both projects) |

## Merge classification
Base `7c52a3696` (main had not moved). `scripts/deploy.sh`, `scripts/deploy-budget.test.mjs`, `e2e/asset-diet.spec.ts`, `src/assets/AdvanceStream.ts`: LANE-TOUCHED. `assets/first-town-payload.json`, `scripts/first-town-payload.mjs`, `artifacts/first-town-payload-gate/*` (13 files, 412 KB): NEW. `tasks/BACKLOG.md`: unioned.

## Findings
- **F-FTP-1 (OWNER'S DESK, minted A11):** the ten town-actor sheets weigh 16,111,577 B in `dist/` (272 cells, all reachable as an actor turns), yet one cell of each is inside the cue window and the busiest reached 9 of 32 after a 12.7 s settle; the declaration marks that group `demandPaged` and the gate does not judge it. Flipping that boolean gates 31,686,850 B against 25,000,000 (127 %): every deploy would need the waiver until ~6.7 MB comes out. Options: keep as shipped (recommended), gate the upper bound and raise the budget, or gate it and cut with the cast as the lever and the hero clip split as the recipe.
- **F-FTP-2:** the old instrument omitted the entry chunk entirely.
- **F-FTP-3 (fire-authorable):** `scripts/test-deploy-contract.sh:7` copies `deploy.sh` alone into a throwaway tree, so `deploy.sh` keeps an absent-script fallback to the old probe gate; one `cp` line would let the contract exercise the real leg and delete the fallback.
- **F-FTP-4 (cured):** the real-path check.
- **F-FTP-5 (cured):** one ceiling, asserted equal across the spec and the deploy.
- Environment: `nul-audit.mjs` exits 1 in a sparse worktree (11,112 unreadable subjects), pre-existing.
