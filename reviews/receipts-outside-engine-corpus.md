# receipts-outside-engine-corpus — s2502 drain

**Slice:** `tasks/receipts-outside-engine-corpus.md`
**Branch/tip:** main-slot runner output, gated as detached `gate-s2502` @ `16f82ae0a`
**Base:** `be2d03f810da65d8ad16b6f66198918d899ce00a`
**Merged:** `65b07c671beadcf5d22fb76eef88141cea6b80de`

## Verdict

**MERGED.** The operational receipts ledger is outside the replay engine corpus, every executable reader and writer follows the new path, and the resulting engine identity is recorded as a same-era pin.

## What it does

The unchanged receipt artifact moves from `assets/contracts/` to `assets/rotations/`, beside the existing non-engine rotation registry. Regenerating first-secure receipts can therefore update county bookkeeping without changing tape identity. The public skill contract list continues to render from the same receipt data.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green; 2,220 modules; asset-diet green |
| receipt + engine-era focused guards | **9/9**, 0 fail |
| corpus mutation proof | temporary `assets/contracts/_s2502-test/winnability-receipts.json` made the guard RED by exact path; removal restored **4/4** |
| receipt regeneration identity | before = after = `e6f25014d9a6729bd93192d3f9fa14bb8735263b1c147a09fa3dfd22292382b9` |
| generated skill.md fence | byte-identical; sha256 `9e8fdf8ec5394bc9e79eb654e77c917e29574781a3685bd4b700ee9c471e7cfd`; 5,525 bytes |
| changed-surface full gate | **4/5** groups green; sole red is F-2499-2's pre-existing `gauntlet-heat11-unclaimed-sweep` prose merge hash, reproduced byte-identically on main |
| independent `codex review --base be2d03f81` | no findings; it independently re-ran tsc/build and the 9 focused guards green |
| browser/console gate | N/A: no `src/`, `site/`, `public/`, or `functions/` output changed; the generated public fence is byte-identical |

## Merge classification

The main-slot runner wrote its output directly into main's working tree, so no branch merge or conflict resolution occurred. The detached gate and the committed main result were compared by blob hash across every changed path and matched exactly.

| File | Class | Resolution |
|---|---|---|
| `assets/contracts/winnability-receipts.json` → `assets/rotations/winnability-receipts.json` | RUNNER-TOUCHED | 100% rename; blob `48f49fb501942c7bf4ad802a0b354ba2cc5500b3` |
| `scripts/winnability-receipts.mjs` | RUNNER-TOUCHED | default writer repointed |
| `scripts/render-skillmd-contracts.mjs` | RUNNER-TOUCHED | renderer repointed |
| `scripts/skillmd-contracts-guard.test.mjs` | RUNNER-TOUCHED | reader repointed; derived corpus guard added |
| `artifacts/gauntlet-heat11-20260903/build-submission.mjs` | DRAIN-CORRECTIVE | retained executable reader repointed |
| `artifacts/gauntlet-heat11-20260903/receipts-delta.mjs` | DRAIN-CORRECTIVE | retained executable reader repointed |
| `assets/engine-era.json` | DRAIN-CORRECTIVE | top-level identity updated and same-era pin appended |

## Findings

### F-RCPT-2 — CLOSED IN THIS DRAIN

The runner correctly stopped after finding two retained Heat 11 operator scripts outside its TOUCH-ONLY list still reading the deleted path. Both were reproducibly broken (`ENOENT`) and both now read the new ledger. A repository-wide executable-source search names exactly the intended five consumers plus the guard's filename matcher; the remaining old-path mention in `src/systems/E8PhysicsSystem.ts` is prose, and the task explicitly forbids sim edits.

The independent Codex review reported no additional findings. Its offline fixture regeneration did not match the live standings artifact because the fixture is an older dataset; that is expected input drift and does not affect the corpus/path invariant.
