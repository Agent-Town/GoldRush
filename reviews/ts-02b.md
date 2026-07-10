# Review — ts-02b (facade mounting) + TS-03 (town prop ring)

**Slice:** ts-02b-facade-mounting + ts-03-prop-ring · **Branch:** `lane/polish` · **Tip:** `cfac0c89` (over `67bc92ef`)
**Drained by:** s323 fire · 2026-07-11

## Verdict
**LANDED — but via an attended comingle, not a clean fire commit** (F-ts02b-1 below). Content is on main byte-identical to the lane; gates green. No re-land needed.

## What it does
- **ts-02b:** the built town mounts 2.5D facade keys on the six town surfaces; all six remain walkable. Framing holds at 390px.
- **TS-03 (prop ring):** arrival props ring the plaza — a dry Pan Monument and a Pony Express plot among them; a night lantern ring; the whole set stays inside the draw-call budget.

## Evidence (gates run by s323 with the lane content applied)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in ~500ms |
| `e2e/town-ts-02b-facades.spec.ts` desktop+mobile | 4/4 pass (mount + walkability + 390px) |
| `e2e/town-ts-03-prop-ring.spec.ts` desktop+mobile | 2/2 pass (props + dry monument + Pony plot + draw-call budget) |
| Adjacent town regression (t1-square, t3-board, ts-01-plaza-ground) serial | green |
| **town-t6-surfaces** "plain menu thins to town, profile, settings" | **RED — pre-existing, fingerprint-matched:** fails identically (desktop+mobile) on clean main with the town files reverted (baseline captured this fire). NOT a ts-02b regression. |
| Flakiness note | town-t1-square + ts-01-plaza-ground FAILED once under 4-worker parallelism, then PASSED in isolation and under `--workers=1`. The town specs each boot the full game; run them serial. Not regressions. |
| Screenshots | `artifacts/ts-02b-facades/*` (4) + `artifacts/ts-03-prop-ring/*` (4, incl. draw-count-in-filename day shots) |

## Merge classification
- Content on main tip == `lane/polish` tip, verified byte-identical: `git diff HEAD:<f> lane/polish:<f>` empty for TownScene.ts (+489), townLayout.ts (+43), both e2e specs, and all 8 artifacts (`git diff --stat main lane/polish -- artifacts/ts-02b-facades artifacts/ts-03-prop-ring` empty).
- Mutually disjoint from gz-02 + en-03.

## Findings
**F-ts02b-1 (process — HIGH, the [[no-nocommit-merge-while-runner-live]] hazard realized):** s323 had the ts-02b files STAGED in the index (path-scoped `git checkout lane/polish -- …`) while running the gate battery. During that window an **attended orchestrator broad-add commit landed on main — `93632a94` "audio: MU-02 wave 1 …"** — which swept the staged ts-02b files into itself, comingling the town code + specs + artifacts with three `marketing/raw/audio/*.m4a` files under an audio-only message. The ts-02b content is correct and gated, but it carries no ts-02b commit message and shipped inside an unrelated commit. **Root cause:** two writers on main's tree at once (attended live-writing during a fire) + a fire leaving files staged across a multi-minute gate run. **Lesson (fold into fire law):** when attended is actively committing main, stage-and-commit ATOMICALLY per drain — never leave a lane graft staged across the gate battery; gate on a throwaway/worktree copy or `git stash` the graft between gate and commit. This review + the ledger are the durable record since the commit message can't be rewritten (attended-owned, force-push denied).
