# E6 Homemaker — adopted fidelity pass with regression exceptions

The production model now follows the plate's rounded body, flared apron, curved vacuum, toast rack and recessed eye. The final chair has four grounded legs, cleared back/body geometry and a shuttered core. Fresh arrival moves from the pylon/terrace overlap to clear ground at (8, 4); saved legacy coordinates remain untouched.

The scoped runtime change corrects component-relative centering and render interpolation, grounds the current damage shape on cached support points, and places the shared health bar above model hulls. Damage ownership, unbuild/refund behavior, the three original component morphs, non-hostile chair and kept-state persistence remain covered by the unchanged encounter test. Fresh placement changes approach coordinates; this is why broad regression remains required.

## Verified adopted bytes

- GLB: `ff2fe72dcc72bb9415de5afefacdf2794f0b81d02a16a051b3527ae53dbf5400` (see exact authoritative hash in the layer contract), 11,960 triangles, three meshes/morphs, one 1024 atlas. Saved-Blend export is byte-identical.
- Main optimized asset: `85379230e24492721ae22dc3fb738541210db56b1013cd63e5b26a2865528567`, 497,148 bytes; actual bundled browser downloads match it.
- Native atlas and builder use the production path. The isolated bank differs only in embedded image name; all BIN bytes and other GLB JSON match. The neutral damage metric remains labeled with that bank's hash.
- Runtime and Game source match the previously reviewed candidate exactly. Adoption manifest banks prior bytes and records final hashes; no additional runtime edits were introduced during adoption.

## Main-worktree evidence

Evidence root: `artifacts/boss-fidelity/e6-homemaker/production-adoption/`.

| Check | Result |
| --- | --- |
| npm run build; saved-Blend verifier | Exit 0; semantic and byte identity verified |
| Unchanged E6 encounter, production preview, desktop/mobile | 2/2 passed; test-owned historical shots restored |
| Actual whole production bundle, public debug hooks | 10 states, both component death orders, no source routing; 0 console/page errors |
| Optimized asset with adopted development runtime | 10 states; actual mesh/hull/bar alignment and terrain checks passed |
| Movement and serialized RunSuspend | 3 phases at alpha 0/.5/1; no render-induced encounter mutation; restored boss/actors match |
| Loader, fault injection, delayed morph state and reset | 9 cases; lite makes no model request; seven unique GPU resources disposed |
| Fresh kept-chair persistence | 6 captured states passed |
| Existing component-secure, kit and GLB node guards | 63/63 passed |

`runtime-checks.json`, `build-verification.json`, `focused-results.json` and the individual reports carry exact assertions and inputs. Fault-injection probes intentionally route bad/delayed model responses; the bundle probe has no routing or prototype substitution. Main desktop intact and mobile final frames were visually inspected and retain the isolated review's limits.

## Remaining limits

This is closer to the plate, not a 1:1 conversion. Rough material response, simplified tool articulation and eye depth remain; the final chair reads less immediately from the high gameplay camera. Legacy (0, -8) kept objects can retain their prior pylon overlap. Surrounding broken HUD portraits, introduction graphic and debug/claim overlays remain separately recorded; no whole-UI green claim. The loose circular prop beside the vacuum belongs to the existing world gold seam, verified by scene ownership.

The full regression terminated on 2026-09-09 at 01:05:35Z: 2,811 expected passes, 332 failures and 205 skipped/unrun entries (181 skipped, 24 did not run), with no global errors. Restoration completed at 01:06:19Z: 1,420 historical outputs restored, 42 new outputs banked, all 8,495 frozen source/asset hashes unchanged. Compared with latest E5, 29 previously passing tests failed, seven cases became skipped/unrun, eight prior failures passed, and 303 failures persisted. Two persistent failures changed their first error location. These are test-identity comparisons, not proof of identical causes.

`full-regression/raw-terminal-comparison.json` records the exact comparison. `confirmation-selection.json` selects 95 cases, including the two pause windows and explicit disk/artifact errors; one-worker desktop confirmation is running, followed by mobile and isolated multiplayer cases. E5's earlier exceptions remain the comparison boundary. Do not call E6 release-green or begin E7 production edits until confirmation and source-control reconciliation are complete. No commits or publication.

## Full-run infrastructure interruption

The volume filled during the full run, producing ENOSPC and truncated/missing artifacts. The coordinator/workers were paused at 2026-09-08T20:58:28.584148Z and resumed at 21:09:00.527177Z as the same process. All 8,495 frozen input hashes were unchanged before resumption. A conservative 30-test window is queued for confirmation after the terminal result; additional affected terminal cases must be included. The new desktop E6 arsenal failure predates this pause and remains separately pending.

Storage recovery preserved 1,031 earlier E3/E4 trace ZIP files byte-for-byte in 86 verified tar.zst batches, reducing 65,253,609,356 bytes to 20,502,957,288 bytes. A native restore and ZIP CRC check also passed. Historical trace links may require restoring their original path using `artifacts/boss-fidelity/disk-recovery/README.md`; manifests retain every original SHA-256. Current E6 traces, all source/models/screenshots and result JSON remain in place. This incident is not a clean-suite result.

A second preventive pause ran from 2026-09-08T21:38:10.196112Z to 22:55:45.708292Z when free disk fell below 10 GiB. Completed E5 traces were also archived with exact-byte verification. Combined E3/E4/E5 totals: 1,399 ZIPs, 117 batches, 96,754,267,400 original bytes retained in 30,345,792,409 archive bytes. All 8,495 frozen inputs still matched before resuming the same process; free space was 43,654,578,176 bytes. Both conservative pause windows now select 60 tests for confirmation. This long pause is an infrastructure interruption, not simulation-performance evidence.

## Confirmation reconciliation — 2026-09-09

All 95 selected identities executed exactly once in their intended project and every group restored its historical outputs with no source/asset hash changes. Desktop: 61 passed, 13 failed. Mobile: 11 passed, 2 failed. Eight separately executed multiplayer cases: 7 passed, 1 failed. Total: 79 passed, 16 failed, none skipped. The E6 arsenal case passed. Evidence: `full-regression/confirmation-summary.json` and each group’s `selection-verification.json`.

The 16 remaining failures are being checked with only `Game.ts` and `HomemakerBossSystem.ts` restored to banked pre-E6 bytes. Assets and tests remain current; this is a narrow source comparison, not a pre-E6 checkout. The control runner banks and restores adopted source in `finally`, then verifies the full frozen hash set. Source control and actual-source rechecks remain pending; the broad suite is not green.

## Final scoped handoff — 2026-09-09T01:40:15.754323+00:00

The 16 narrow source controls completed: 13 failed and 3 passed. Adopted source was restored and all 8,495 frozen hashes matched. Rechecking those three on adopted source produced one pass (desktop pointer glow) and two failures (desktop E9 caravan planting, mobile Dry Gulch diagnostics). Both differential failures remain unresolved exceptions; this evidence does not prove they are caused by the E6 changes or unrelated to them. No unrelated gameplay or existing tests were edited.

Latest actual-source aggregate: {'expected': 2839, 'skipped': 198, 'unexpected': 311}. Raw full-run results, infrastructure pauses, confirmation results and control results are retained separately in `full-regression/final-reconciliation.json` and linked evidence. The broad suite is not green. Scoped E6 visual/runtime evidence above remains passed. This handoff releases the test freeze with exceptions and permits sequential E7 visual work; it does not claim E1–E10 completion.
