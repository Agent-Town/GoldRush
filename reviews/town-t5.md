# Review — town-T5 townsfolk (the roster, posts, and barks)

- **Slice:** town-v1 T5 (townsfolk arrive — names, posts, growth-gated roster, approach barks)
- **Branch / tip:** lane/m4 `7431ab4` ("town: add town square townsfolk")
- **Drained by:** s201 fire → main (path-scoped graft; `git checkout 7431ab4 -- <10 files>`, cherry-pick blocked headless)
- **Verdict:** ✅ MERGE — clean LANE-TOUCHED-only graft, gate green, firewall held, canon clean.

## What it does
Populates the town square with a data-driven cast that appears WITH the buildings the profile has earned. `src/town/townsfolk.ts` declares `TOWN_ACTORS` — tavernkeeper (tavern), storekeeper (store, growth-gated via `requiresBuilding`), the Elder (schoolhouse), preacher (chapel, gated), schoolteacher, assay clerk (office porch), two roaming youngsters, plus the Prospector idling by the claim office. `visibleTownActors(visibleBuildings)` filters the roster to earned buildings, so a bare town shows only its founding folk and a grown town fills in. `TownScene.ts` renders each with an idle-facing SpriteAnimator (breathe/sway), places them per `townLayout` + the concept plate, and drives the two youngsters on a small bounded square loop (scene-level wander, **zero sim entities**). Approach within `barkRadius` surfaces a character-voiced bark card (`townActorBark`, rotating 2–3 `e1Barks` per character, epoch-scoped, `{town}` interpolated from T2's name); the Prospector greets by town name. `town.css` styles the bark card above the 390px stick zone.

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (610ms) |
| `e2e/town-t5-townsfolk.spec.ts` | **10/10** desktop + mobile (bark data epoch-scoped/≤90ch · seeded-growth roster present/absent w/ no run-sim diagnostics · barks identify sampled speakers + Prospector greets by town name · youngsters stay on-loop · mobile bark card above stick zone + concept comparison) |
| Adjacent: town-t1/t2/t3/t4 + m1-01 + m2-01 | **48/48** single-worker (both projects) |
| Boot / console | zero run-sim diagnostics leaked (asserted by spec); town scene boots clean |
| Screenshots | `artifacts/town-t5/` — peopled-square + concept side-by-side, desktop + 390px |

**F-t5-load (non-blocking, NOT a defect):** an initial 8-worker run of the adjacent battery showed 12+ timeout/page-closed reds (town-t1 activePrompt null, town-t2 forceDeath timeout, m1-01 state stayed `playing`). Re-run **single-worker = 48/48 green**. Root cause = heavy-load flake: the gate shared the box with a LIVE lane vite server (:5188) and two live codex processes (lane-c polish-03, lane-d perf-03). Matches the standing load-flake law (`checkout-head-graft-attribution` memory). All reds were timeouts, none assertion-logic; town-T5's files touch no run-scene/naming/m1 code (firewall verified).

## Merge classification
- **Merge-base** main∩lane/m4 = `704b9f0` (s200 refill — the safe-dupe reset point).
- `git diff 704b9f0..main` for all 10 town files = **empty** → main never moved them since branch point → **LANE-TOUCHED-only, zero MAIN-MOVED, no 3-way needed.**
- `src/town/townsfolk.ts` + `e2e/town-t5-townsfolk.spec.ts` are **new files** (not on main).
- The large `main..lane/m4` name-diff (STATUS/BACKLOG/tasks/*) is pure stale-base divergence; the actual commit `7431ab4` = 10 files / +759 insertions.
- Applied via `git checkout 7431ab4 -- <10 files>`; staged tree byte-identical to the lane commit (`git diff --cached --stat` matches `git show --stat 7431ab4`).

## Firewall
Held. `generated.ts` (+8) / `slots.ts` (+8) = purely additive townsfolk asset-slot registrations; all 8 `assets/processed/townsfolk-*.png` sprites verified present. `TownScene.ts` imports only assets + town-local `townsfolk` — **no `game/` or `sim/` imports**. No run-scene changes, no sim entities, no SS-01/T2-T3-T4 logic edits.

## Canon (brief §9)
Clean. Barks are warm, illustrated-frontier voiced, town-name-aware ("{town} learns faster when the children ask why", "Chalk today, Steamworks tomorrow", "Gold in, proof out"). No firearms, no gore, no peoples-as-enemies. Prospector = "Claim Partner" idling at the claim office.

## Findings
None blocking. F-t5-load documented above (environmental, resolved by isolation).
