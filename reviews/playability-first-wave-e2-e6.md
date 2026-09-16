# Drain review — `playability-first-wave-e2-e6`: the Trestle and the Incline survive wave 2 for a first-time player, the Drill Yard is census-exempt as practice; the Picnic held for an owner word (attended drain, 2026-09-16)

**Slice/branch/tip:** `feat/playability-first-wave-e2-e6` @ `814b0d9ff` — three commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `894c88287`; master `tasks/playability-first-wave-e2-e6.md`; the implementer's full report, probes and evidence: `artifacts/playability-first-wave-e2-e6/report.md`. **Merged as** `2d053781c` onto main `894c88287` (`git merge --no-ff`, zero conflicts), era-6 pin #4 `587360f8…` appended on the merged tree (`assets/contracts` is in `ENGINE_SOURCE_INPUTS`), landed by fast-forward at the hash the ledger row names.
**Owner words, verbatim:** 2026-09-15 "how do we go from epoch1 to all epochs? I think what Astra started is worth it" · 2026-09-16 "yeah, we have tokens left - lets work on these failing contracts".

## VERDICT: LANDED for the Trestle, the Incline and the Drill Yard; the Picnic goes to the OWNER'S DESK (A21)

## 1. What the implementer measured and changed (spot-checked at the drain by a fresh smoke run on the merged tree, §2)
| contract | killer, on a plain boot with no debug seam | cure, in the map's own data | smoke |
|---|---|---|---|
| e2-trestle | dead at 57.3 s, wave 2 due 85.7 s — the only E2 contract with NO `spawnGates`, so every lane spawns on the hero-centred ring (`WaveSystem.ts:588`, clamped at `:1023`): a Steam Wrecker at 0–0.6 u from t=20.9 takes the hero 100 → 46.8 HP before wave 1 lands, Rail Toughs at 0.1 u finish it at t=50.5 | five gates in the sibling convention (|46|): `rail_tough` at the rail's two mouths (0,±46), `steam_wrecker` one flank per approach (46,20)/(−46,−20), `coal_thief` north (0,46); nearest gate now 35.6 u | wave 2 at 86.3–87.1 s, 3/3 × 2 projects |
| e2-incline | dead at 71.9 s, wave 2 due 80.0 s — `rail_tough`'s south gate 12.65 u from the unassisted hero's end position, and the two wrecker gates 70–80 u away bank 14 wreckers behind the x=+12 ford and deliver them together from t=58 (84 → 0 HP at ~6 HP/s) | `lanes.spawnEdges` drops `south` (the card's own rule gives the lower line to the wave-12 railcar, which spawns from `rails[0].points[0]`, not a lane edge — the census still secures at wave ≥ 12); `coal_thief` gains its north gate (−12,46) | wave 2 at 80.8–81.7 s, 3/3 × 2 projects |
| e1-drill-yard | a census defect: the yard is practice (`ContractPracticeMode`) and schedules no waves | the smoke declares the exemption in its own words and asks the yard its own question over the same 60 sim-second window (yard live, no waves scheduled, every declared station and target present and whole, run still `playing`) | PASS 60.1–62.0 s, 3/3 × 2 projects |
| e6-picnic | **not a death**: `runState=dead` at 36.9 s with the hero at 100/100 HP — `PicnicHoldSystem` loses the run when all three sandwiches are claimed (14.5 s / 25.8 s / 37.0 s, each a Feral Toaster holding a 3-u disc for the 6-s clock) | **STOPPED, as the master orders**: the one data layout that reaches wave 2 makes the card's own rule ("first machines reach the meadow inside ten seconds") read 27.1 s and drops prover idle kills 25 → 0; two `src/` dials were measured and rejected (press-weight 0.25 → 0.125: 36.8 s; a 25 s grace: 37.9 s); the one `src/` cure that works, a 20 s stand-down between stake claims in `PicnicHoldSystem`, is quoted as an exact diff in the report and NOT landed | unchanged red, 37.5 s / 37.7 s (F-PLAY-E6-1 stays open; desk A21) |

**Null floors** re-recorded from measurement (`--check` clean, 83/83, 272 s on the merged tree): 4 of 83 pairs moved, all on the two cured maps, nothing secures — `e2-trestle-01` 68,767 → 70,700 ms (kills 23 → 13), `-02` 55,867 → 62,000 ms; `e2-incline-01` waves 1 → 2 (73,900 → 119,333 ms), `-02` waves 1 → 5 (65,933 → 206,133 ms, kills 15 → 96). **The Incline's idle floor softening is the price of the fourth lane and is stated, not hidden** (F-PFW-2); the public-verb prover still secures at wave ≥ 12.

## 2. Gate table (merged tree unless noted)
| gate | result |
|---|---|
| `npx tsc --noEmit` / `npm run build` | rc=0 / rc=0 (drain, merged tree) |
| the smoke for the four contracts, both projects, one worker (drain re-run) | **6 passed / 2 failed** on the merged tree, both projects: the Trestle, the Incline and the Drill Yard green; the two reds are the Picnic\x27s, held for the owner (A21) |
| `er01-e2-census` / `er01-e6-census` | 4/4 · 4/4 (implementer; no re-point was needed — neither census reads `spawnGates` or `lanes.spawnEdges`) |
| task-025 + m1-01 + m2-01, both projects | 34/34 (implementer) |
| adjacent map suites (`e2-trestle`, `e2-incline`, `e6-picnic-opening`, `e6-roster`) | 16/16 (implementer) |
| `render-skillmd-contracts.mjs` / `skillmd-guard` | rc=0, `public/skill.md` unchanged / 16/16 |
| null floors | `--check` 83/83 clean (272 s, drain) |
| engine era | pin #4 `587360f8913bad0809d13216422081101c5dc677bb6634009d7bb0470c9d205e`, guards 9/9 (drain) |
| full `test:node-guards`, Node 26 | 796 tests, 791 pass, 3 fail, 2 skipped (428 s), all seven stages ran: the desk guard\x27s by-design linked-worktree refusal and its fixture-sweep echo (re-checked on main after the fast-forward, §3b), and `e3-mask-tables` — the two E2 mask tables had not been re-published for the new gates (F-PFW-4, mirrored at the drain, guard 30/30) |

## 3. Findings
- **F-PFW-1 (owner's desk, A21):** the Picnic's first-minute loss is its own rule, not a death. Two measured cures exist: (a) a `src/` stand-down of 20 s between stake claims in `PicnicHoldSystem` (reaches wave 2; the unbuilt run still ends at 82 s; the card's words stay true), or (b) three far spawn gates in the map's data plus a re-voiced card rule 3 and a re-pointed `e6-picnic-opening.spec.ts:366`. Recommendation: (a).
- **F-PFW-2 (stated):** the Incline's no-orders floor rises from wave 1 to waves 2 and 5 on its two bench seeds with the south lane gone; a drainer should watch heat 14's Incline rides for a map that became too kind.
- **F-PFW-4 (cured at the drain):** `scripts/e3-mask-tables.test.mjs:256` asserts the published mask table mirrors the roster's spawn gates and the lanes exactly; the implementer authored the gates and edges in the contracts but did not re-publish `assets/contracts/epoch-2-steamworks/mask-tables/{e2-trestle,e2-incline}.json` (outside its firewall unless geometric). Mirrored at the drain from the contract data (Trestle 0 → 5 gates; Incline 4 → 5 gates, three lane edges), guard 30/30.
- **F-PFW-3 (script, fire-authorable):** `null-floor-anchors.mjs --check` will always report an `eraStamp` difference on main because the stamp is `git merge-base HEAD main`, which moves with every commit; pre-existing, not this branch's.

## 4. What was touched
`assets/contracts/epoch-2-steamworks/contracts.json` (`e2-trestle` `spawnGates`; `e2-incline` `lanes.spawnEdges`, `coal_thief` gate), `assets/contracts/null-floors.json` (re-recorded), `e2e/playability-smoke.spec.ts` (the practice exemption), `artifacts/playability-first-wave-e2-e6/**`; at the drain `assets/engine-era.json` (pin #4), this review, `tasks/goals.json`, `tasks/BACKLOG.md`, `docs/OWNER-DESK-2026-09-06.md` (A21). `src/**`, `Balance.ts` and the Picnic's data untouched.
