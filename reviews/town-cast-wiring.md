# Review — town-cast-wiring (lane-c)

Slice: `town-cast-wiring` · branch `lane/c` · tip `be3898c18` · base `main`
Drained: s2249, 2026-08-23 · gated in detached worktree `worktrees/gate-s2249` (§3.0b)

## VERDICT: PASS — merged

## What it does

Wires the tavernkeeper and storekeeper **walk8** sheets — PROCESSED at s293 and never
integrated — into the town cast, and anchors the cast on its **feet** instead of its
sprite centre.

`TownScene.ts` imports the two `*.frames.json` bbox records and uses them to compute an
`anchoredFootY` per actor, so a walking figure's soles stay planted while the sheet's
generous top margin varies frame to frame. Two new diagnostics (`spriteY`, `footY`) make
that anchoring observable to a spec rather than to the eye.

It also corrects a genuine read-from-the-wrong-object bug in the diagnostics: `loop` and
`trailId` were read off the raw authored `actor`, while every other field on the same
object comes from `runtime`. Post-wiring those two disagree, so the diagnostics would have
reported a loop the runtime was not running.

## Evidence

All gates run on the **merged tree** in a detached worktree, `--workers=1` (§3.1),
against a scratch dev server on port 5234 (Mistake #12 attribution hygiene — port 5188 was
held by a concurrent session).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean**, no output |
| `npm run build` | **green**, built in 2.88s; asset-diet ceilings respected (Herald 1,158,214 B vs 1,500,000 B) |
| Own spec `e2e/town-cast-wiring.spec.ts` | **4/4 passed** (28.2s) — desktop-chrome + mobile-chrome |
| Adjacent: `cast-motion-wiring`, `run-cast-scale-up`, `town-inhabitant-zoom`, `contract-bundle-validation`, `town-fresh-boot-textures` | **12/12 passed** (2.4m), both projects, rc=0 |
| Plain-boot visibility (Mistake #10) | covered by the slice's own `plain town boot shows the tavernkeeper and storekeeper walking on anchored feet` — no `?debug` |
| Screenshots | `reviews/shots-town-cast/desktop-chrome.png`, `reviews/shots-town-cast/mobile-chrome.png` (in the slice's own commit) |

**Not run, and why:** `npm run test:node-guards` is **not owed** by the §3 path rule — the
diff touches `src/town/`, not `src/sim/`, `src/systems/` or `src/entities/`, so it carries
no cross-cutting sim pin. No perf table: the slice adds no per-frame work beyond a
one-time bbox read at fit time.

## Merge classification

Base `main` at `32c90bbad`. Seven paths, all inside the master's firewall.
`git merge-tree` proved the three-way clean before anything was touched.

| Path | Class | Resolution |
|---|---|---|
| `src/town/TownScene.ts` | LANE-ONLY | taken as-is |
| `e2e/town-cast-wiring.spec.ts` (new) | LANE-ONLY | taken as-is |
| `assets/layer-contracts/characters.v2.json` | LANE-ONLY | taken as-is |
| `reviews/shots-town-cast/*.png` (2 new) | LANE-ONLY | taken as-is |
| `assets/LEDGER.md` | **BOTH-MOVED** | auto-merged — main had gained the s2249 jumper-rotation3 row (row 31), the lane advanced the tavernkeeper/storekeeper rows. Disjoint rows, both sides kept. |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | auto-merged, disjoint rows |

⚠️ **Ordering note for the record:** this drain was blocked at the top of the fire by
`assets/LEDGER.md` being dirty in main's tree, and s2248 had deferred the L4 drain for the
same reason. That dirt was **not** attended hand-work — it was the ART slot's own output
(the jumper-rotation3 row), which has no git worktree and therefore always lands as
uncommitted dirt plus a done-move (§2A amendment 1). Draining the ART slot first cleared
it and unblocked this merge in the same fire.

## Findings

### F-2249-2 — the diagnostics `loop`/`trailId` bug was silent and is now fixed (NON-BLOCKING, fixed in the slice)

`loop: !!actor.loop` and `trailId: actor.loop?.trailId` read the authored definition while
every sibling field reads `runtime`. Before this slice the two agreed, so nothing observed
the difference; wiring the walk sheets makes them diverge. The runner fixed it in the same
commit as the wiring rather than reporting it — in scope, since the fields are part of the
diagnostics contract the slice's own spec asserts against. Recorded so the fix is not
mistaken for incidental churn.

No blocking findings.

## Follow-ups owed

1. The remaining town cast (beyond tavernkeeper + storekeeper) is still on portrait posts;
   the foot-anchoring path now exists for whoever wires the next pair.
