# Drain review — `town-cast-rulings-a13-a17` + `picnic-claim-standdown`: the Elder patrols, the town's patrol guard joins the battery, Pip and Juniper are on their cards, and the Picnic gives a newcomer its first minute (attended drain, 2026-09-18)

**Slice/branch/tip:** `feat/town-cast-rulings-and-picnic` @ `bbe4d602e` — two commits (`7d1827a6a` town, `bbe4d602e` picnic) by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `09c997489`; masters `tasks/town-cast-rulings-a13-a17.md` and `tasks/picnic-claim-standdown.md`; the implementer's reports: `artifacts/town-cast-rulings-a13-a17/report.md`, `artifacts/picnic-claim-standdown/report.md`. **Merged as** `4a6caaa63` onto main `92eed7ae0` (`git merge --no-ff`, zero conflicts), null floors re-recorded on the merged tree, era-6 pin appended LAST (`src` and the floors are in the corpus), landed by fast-forward at the hash the ledger row names.
**Owner words, verbatim:** 2026-09-14 "A13 - sounds good" · "A17 - not sure what placeholder names? They are Pip and Juniper as I know them?" · 2026-09-17 "Lets do them all." (A21 as recommendation (a)) · "All on the Anthropic subscription".

## VERDICT: LANDED — all four rulings, the town guard in the battery, the Picnic reaches wave 2

## 1. What landed
| ruling | what the implementer measured and changed |
|---|---|
| **A13 — the Elder patrols** | `trailId: schoolhouse-cast`, two points, the tavernkeeper's values (`seconds: 8`, pauses 3 s / 30 s): post (−6.50, 5.25) → approach (−6.60, 2.40) and back; both segments clear the monument footprint by 7.02 (footprint 0.68). Plain boot: she leaves her post by 1.59 u at 5.23 s (desktop) / 1.60 u at 5.24 s (390 px), on her own walk cell. |
| **F-SSL-1 — the newsie's loop and the monument** | no `src/` change was needed: Astra's retained source half (`033f69c61`, landed 2026-09-15) had already re-routed the loop to turn before the monument and nobody re-measured; segment 5 reads 1.159 (footprint 0.68). `scripts/town-patrol-monument.test.mjs` is now ROOTED in the battery's first stage (its gate-caller reason deleted, audit 45/45), and its census was widened through the newly exported `townActorPlazaPlacement` — it had been blind to three of the town's six patrols. |
| **A17 — Pip and Juniper** | five `name:` fields in `src/story/speakers.ts` (`youngster-a-e2/e4/e8`, `youngster-b-e2/e4`) take the town's names; ids unchanged; the convention comment rewritten with the ruling; `lore/characters.md`'s canon line extended with a LANDED clause. |
| **A21 — the Picnic stand-down** | the report's diff applied verbatim (`PICNIC_CLAIM_STANDDOWN_SECONDS = 20`, `lastClaimAt`, the `pressureTarget` gate, the `update` stamp, the `reset`). The smoke: **wave 2 in 60.3–61.7 s sim, 6/6 across three runs on both projects**, zero console/page errors (before: dead at 29.7 s / 37.9 s). `e6-picnic-opening.spec.ts` and `e6-roster.spec.ts` 12 passed UNMODIFIED — the card's "inside ten seconds" still measures true. Floors: only the Picnic's two rows moved (both still LOSE: 73.0 → 98.0 s and 47.3 → 98.5 s, waves 2/1 → 3/3); the other 81 rows byte-identical. |

## 2. Gate table
| gate | implementer (branch) | drain (merged tree) |
|---|---|---|
| tsc / `npm run build` | clean / rc=0 | rc=0 / rc=0 (drain, merged tree) |
| `town-patrol-monument` (rooted) / `gate-caller-audit` | 1/1 / 45/45 | 1/1 / 45/45 |
| `town-t5-townsfolk` (2 new tests) / inventory + citation guards | 14 passed / 51/51 | — |
| the Picnic smoke, 3 runs × 2 projects | 6/6, wave 2 at 60.3–61.7 s sim | reused — the branch\'s six runs are the measurement (the drain\'s battery covers the guards; the merged tree differs from the branch only by main\'s bookkeeping) |
| `e6-picnic-opening` + `e6-roster`, unmodified | 12 passed | — |
| null floors | re-recorded on the branch; `--check` 83/83 | re-recorded on the merged tree (the stamp is `git merge-base HEAD main`, F-PFW-3): re-recorded, 83 floors in 280 s; `--check` 83 of 83 match (286 s) |
| engine era | hash reported | pin #8 `540b49aff02f…`, measured AFTER the floors were re-recorded; `engine-era-guard` + `bench-seeds` 9/9 |
| full `test:node-guards`, Node 26 | not run (the drainer's) | 797 tests, 794 pass, 1 fail, 2 skipped (888 s): the one red is the fixture-owner sweep, whose only survivor is `scripts/modified-tracked-evidence-census-guard.test.mjs` — the fire guard that leaks eleven temp directories on main alone (hygiene item 7, F-HYG-7), the same red the phase-A chain carried; stages 2–7 run separately, rc=0 (`attended-battery-stages2-7.log`) |

## 3. Findings
- **F-TCRL-1 (tripwire, deliberately passed):** `e2e/elder-walk8-woman.spec.ts` asserted "the Elder has no patrol loop today" with the comment that granting her one "has to come past this line" — the owner's A13 is that word. Re-pointed: loop → true, the moving assertion moved to `town-t5-townsfolk`, the frame key a regex over her own sheets with the idle cell still asserted when she stands; `elder` dropped from the `['tavernkeeper','elder']` frame-key-stability pair in `cast-motion-wiring`. One word reverses.
- **F-TCRL-2 (pre-existing on main, corrective owed — hygiene item 8):** `e2e/cast-motion-wiring.spec.ts` is red on main by two assertions the implementer did not touch: `:64` expects the assay clerk at (7, 3.4) and gets (8.35, 6.8) — `ac87d1714` moved her post clear of the building through `portraitPost`, and the full-body wiring may have made the old offset unreachable (a possible regression, not laundered by a re-point); `:99` expects the preacher's walk cell and gets the 2026-09-15 idle clip (`char-preacher-idle-r0c0.png`, never re-pointed). The implementer's own edit to that file is proven green past its line. Neither was in the inventory; both are now.
- **F-TCRL-3:** the F-SSL-1 inventory row was retired by APPENDING a correction line (the file's own "additive only" law and the `F-CELL-2` precedent), not by deletion.
- **F-PCS-1 (script, hygiene item 4):** the null-floor `eraStamp` moves with the merge base; re-recorded on the merged tree at the drain.

## 4. What was touched
`src/town/TownScene.ts` (the Elder's loop; `townActorPlazaPlacement` exported), `src/story/speakers.ts`, `lore/characters.md`, `scripts/town-patrol-monument.test.mjs` (census widened), `package.json` (the guard rooted), `scripts/gate-caller-baseline.json` (one reason removed), `logs/suite-red-inventory.md` (F-SSL-1 correction line; F-TCRL-2 rows at the drain), `e2e/elder-walk8-woman.spec.ts` and `e2e/cast-motion-wiring.spec.ts` (F-TCRL-1 re-points), `e2e/town-t5-townsfolk.spec.ts` (two tests), `src/systems/PicnicHoldSystem.ts` (the stand-down), `assets/contracts/null-floors.json` (re-recorded), the two artifact dirs; at the drain `assets/engine-era.json` (one pin), this review, `tasks/goals.json`, `tasks/BACKLOG.md`.
