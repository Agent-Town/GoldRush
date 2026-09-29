**Slice / branch / tip:** `skill-door-unclaimed-refresh-1`, lane-c `sol/map-art-campaign-2` (the branch name is history; the commits are path-scoped), `fd5394c7b` (Astra gpt-6-astra, 112,469 tokens, 2026-09-29 08:40Z to 08:51Z; the first lane run under the new evidence trace guard, which withheld 0 paths) plus one attended commit (the guard fixture). Hash unchanged: `assets/rotations` is outside `ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36`), no `src/**`.

**What it does.** The agents' door page `public/skill.md` told riders that `e10-archive-world` and `e10-ember-shore` were unclaimed while the county had recorded first secures of both on 2026-09-18 (`reviews/heat-14-era6-reride.md:11`). Astra found the block's writer (`scripts/render-skillmd-contracts.mjs`) and its input (`assets/rotations/winnability-receipts.json`, whose upstream updater `scripts/winnability-receipts.mjs` had not been fed the heat-13 and heat-14 secures), searched every unclaimed row by exact id across `reviews/` and `tasks/BACKLOG.md`, found five with a dated first secure (the two E10 maps on 2026-09-18, `e3-canyon-works` and `e7-relay-valley` on 2026-09-07 from the heat-13 record at `tasks/BACKLOG.md:777`, and a fifth per the report's audit table, all `claude-opus-5`), repaired the receipts and re-rendered the page by its writer (10 lines changed). No live-county request was made; the dated review and ledger evidence took precedence over the stale receipts. `scripts/assay-lineage-sweep.mjs` still parses the block.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Rows corrected | 5 of the block's unclaimed rows, each with a dated record and a corroborating heat matrix row and verified slip (report audit table); the rest reported as still unclaimed or training ground |
| `public/skill.md` | +5/-5 lines, rendered by `render-skillmd-contracts.mjs`, not hand-edited; `--check` green on the repaired tree |
| `assets/rotations/winnability-receipts.json` | 35 lines changed (the first-secure receipts) |
| `scripts/skillmd-contracts-guard.test.mjs` | Astra: 3 of 4 (its mutation proof replaced `| unclaimed`, and no unclaimed row remained); attended fix drifts one first-secure marker instead: 4 of 4 on the lane tree, re-run by this landing's named guard |
| `scripts/assay-lineage-sweep.mjs` | still parses the block (run by Astra) |
| tsc / build | exit 0 / exit 0 |
| `e2e/field-book.spec.ts:147` | red on both projects, and red on the unchanged baseline too (Astra's control): the fixture POST expects 200 and gets 400; pre-existing, recorded as F-SDU1-1, not in this landing's gate list |
| Evidence budget | 9.3 MB added (audit greps, screenshots, a Playwright output dir), inside the 25 MB task budget and the 40 MB ceiling |
| Merge | `git merge-tree` clean against main (0 conflicts) |
| The landing's e2e leg (09:09Z to 09:11Z) | 21 passed, 3 failed, all three mobile-chrome timing reds (`m2-01-build-menu.spec.ts:111` "menu places a palisade and logs build_palisade spend"; `task-025-bandits-dont-swim.spec.ts:105` "enemy crossing the river reaches the hero through the ford only" and `:123` "scheduled waves never place enemies in deep river over three waves") at load average 19 to 29 with two Node batteries and fseventsd on the machine; the same two suites passed 24 of 24 at 03:27Z and 08:19Z today on the same main, this landing changes no game code, and the CONTROL re-run alone on the chain worktree (a fresh vite on 5417, `--workers=1`, both projects) passed 24 of 24 at load { 8.76 12.10 17.78 } (`~/.goldrush/land/sdu1-control-e2e.log`). Attributed load-class (F-SDU1-4) and allowed by exact title; nothing else excused |

**Merge classification.** Base: main at the chain cut. Lane-touched: `public/skill.md`, `assets/rotations/winnability-receipts.json`, `scripts/skillmd-contracts-guard.test.mjs` (attended). New: `artifacts/skill-door-unclaimed-refresh-1/**`. No `src/**`.

**Findings.**
- **F-SDU1-4 (load-class, attributed by control):** the three mobile-chrome e2e reds above; the control re-run alone is the proof. The machine's chronic load (fseventsd pegging a core for 33 days, iOS Simulator resident) is on the owner's desk as a note.
- **F-SDU1-1 (recorded, pre-existing):** `e2e/field-book.spec.ts:147` fails on both projects on the unchanged baseline (fixture POST 400 instead of 200). A scoped corrective is owed; not this landing's.
- **F-SDU1-2 (noted):** Astra's Playwright output landed under `artifacts/skill-door-unclaimed-refresh-1/playwright/…`, a custom output dir the new trace guard's `*-results/**` patterns do not cover; nothing large this time (9.3 MB total). Consider teaching the guard Playwright's `--output` dirs by content (a `.last-run.json` marker) rather than by name.
- **F-SDU1-3 (upstream):** the receipts updater `scripts/winnability-receipts.mjs` did not learn the heat-13/heat-14 secures on its own; the report names why. Whether the fires should run it after each heat is a small follow-up for the desk.
