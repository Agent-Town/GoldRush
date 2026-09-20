# Review: elder-walk8-regeneration — the Elder walks through town as the woman she is (scratch worktree, Claude Opus 5 implementer with the Higgsfield CLI, attended drain 2026-09-07)

**Slice/branch/tip:** `elder-walk8-regeneration` · `art/elder-walk8-regeneration` · eight commits `d51b88cb4 (archive: pruned by the A3 rewrite)`..`d576c17db` on base `de208bbfe` · merged to main as `6eb8a8093`, made and gated in the slice's own worktree detached at main and landed with `git merge --ff-only`.
**Verdict:** MERGED. The one shipping bearded asset (`char-elder-sheet-walk8`, the town walk sheet) is regenerated as the woman through a copy of the shipped production script: the turnaround (GPT Image 2, take 1), four start stills, twelve Seedance 2.0 takes (three per direction), four selected by eye with the reasons in the RUN-NOTE, decoded at fps 2, assembled 2240×1360 on opaque `#ff00ff` (0 non-opaque px, no mirrors, no frame reuse), extracted under the identical stem (32 cells at 512 + frames.json; figure heights 296–328 against the 298–321 band, five cells outside by at most 7 px on a ~310 px figure, inside the master's 10 px threshold). `src/town/TownScene.ts` gains eight lines: the frames import and `elder: elderWalkFrames` in `townCastWalkFrames`, which drops her billboard 0.337 world units out of the air onto her feet (F-A8-5 closed; LEDGER row 48's PENDING-INTEGRATION closed). Credits: 255.00 measured from account status (248.50 useful; one still double-charged on a retry that had already been accepted, F-EW8-2). Every old raw kept; the man's raw untouched; the man's sheet extraction replaced in place (git keeps it).

## Evidence
| Gate | Where | Result |
|---|---|---|
| Production | worktree | balance 3,176.49 → 2,921.49; turnaround 6.50, stills 32.50 (incl. 6.50 wasted), videos 216.00; job ids in `assets/motion-pilot/production-elder-woman/RUN-NOTE.md` and `logs/` |
| Selection | worktree | down t3, left t1, right t1, up t3, each read at full width; right t3 the honest reject (best drift, figure cropped in 3 of 8) |
| Heights | worktree | r0 316–328, r1 302–307, r2 305–311, r3 296–313 (true pixel, `bbox[3]−bbox[1]+1`; the shipped sheet reads 299–322 the same way, F-EW8-5) |
| Wiring | worktree | `fitSpriteToTexture` `anchoredFootY` null → set; spriteY 0.908 → 0.571; nothing else in `src/town/**` |
| Guards (implementer) | worktree | tsc rc 0 · build rc 0 · halo PASS 811 cured / 232 held / 32 regenerated-and-cured / 1395 scanned (a `REGENERATED_SHEETS` set keeps the deepEqual biting) · `first-town-request-families` 4/4 · `deploy-budget` 27/27 |
| e2e (implementer) | port 5312, both projects | `elder-walk8-woman.spec.ts` 4/4, stable over four runs, plain boot, zero console/page errors; `town-cast-wiring` + `town-t5-townsfolk` 13/14 (F-EW8-4 pre-existing) |
| **Attended, merged tree `6eb8a8093`** | tsc / release build | rc 0 / rc 0 (0 TS errors; `dist/` 120 MB as the E1 release) |
| | first-town payload (release build) | **33,850,521 B gated, 0 demand-paged, against 35,000,000** (the cast sheets are gated since A11; the new sheet's family 1,995,863 → 4,083,354 B, +2.09 MB: the heaviest cast sheet now; headroom 1.15 MB, F-EW8-7) |
| | engine era | merged-tree hash `6857177d…` pinned (`TownScene.ts` is the only src move) |
| | named guards | halo PASS (811/232/32/1395) · `no-emdash-guard` 1/1 · `no-emdash-scan-space-guard` 8/8 · `citation-title-guard` 18/18 · `deploy-budget` 27/27 · `first-town-request-families` 4/4 · `law-pointer-guard` 22/22 |
| | e2e, port 5312, both projects, one worker | `elder-walk8-woman` + `town-cast-wiring` + `town-t5-townsfolk`: **18 passed**, 1.1 min, zero console/page errors |
| | full `test:node-guards` | run on main after the fast-forward (the sparse worktree cannot run the registry and corpus rows); result in the deploy row |

Screenshots: `reviews/shots-elder-walk8-regeneration/` (both viewports). Evidence: `assets/motion-pilot/production-elder-woman/` (script copy, RUN-NOTE, contact sheets, 96 decoded frames, 12 videos, stills, every job log), `artifacts/elder-walk8-regeneration/` (the staging sheet).

## Merge classification
Base `de208bbfe`; main moved by A11 (deploy.sh, its guard, the payload declaration), the rulings, the youngster raws and fire commits: none touches this slice. 233 files: 32 cells + frames.json REPLACED, `src/town/TownScene.ts`, `scripts/halo-reextraction-check.mjs`, `assets/LEDGER.md` (row 78, row 48 closed): LANE-TOUCHED; the production directory, six raws, the spec, two screenshots: NEW; `tasks/BACKLOG.md`: MAIN-MOVED, unioned (two lane rows). Largest new blob 8.4 MB (a still); nothing near the 50 MB line.

## Findings
- **F-EW8-1 (fires' queue):** `assets/processed-full/townsfolk-elder.png` is still the bearded man (the reference-tier copy; no game consumer; excluded from this run's references).
- **F-EW8-2 (recipe, banked in memory):** a Higgsfield `generate create --wait` that returns "request failed (no response received)" has already charged; the retry double-spent 6.50. Recovery is `generate list` and adopt, never retry. The batch scripts that retry on that error carry the same defect.
- **F-EW8-3 (OWNER'S DESK A13):** the Elder has no patrol loop (`TownScene.ts:5097` grants one to the tavernkeeper and the storekeeper only), so 31 of her 32 new cells are unreachable and the player sees `r0c0` standing. Giving her a loop is a deliberate change; the spec asserts today's state.
- **F-EW8-4 (pre-existing flake):** `e2e/town-cast-wiring.spec.ts:41` polls 20 s for a tavernkeeper who walks 8 s of a 41 s cycle; 1 in 6 red on this tree and at the base.
- **F-EW8-5 (recorded):** the documented 298–321 band omits the +1; the shipped sheet's true heights are 299–322.
- **F-EW8-6 (fires' queue):** `scripts/anim-pass-table.mjs:119` crashes on main (twelve `*.cut.json` sidecars carry no `cells` key since `6847ca65b`); in no battery; not caused here.
- **F-EW8-7 (recorded):** the gated first town reads 33.85 of 35 MB after this sheet; the next cast sheet regeneration at this fidelity would cross the budget, so the sheet encoder (2× the old sheet's bytes for the same grid) is the lever before the budget is touched again.
