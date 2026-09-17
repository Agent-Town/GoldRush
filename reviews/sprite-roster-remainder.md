# Drain review — `sprite-roster-remainder`: the rest of Astra's sprite roster — nine slots go from one facing to eight, the Baron / thief / rail-tough / coal-thief / steam-wrecker reconciliations land, 612 of Astra's cells wired (attended drain, 2026-09-17)

**Slice/branch/tip:** `feat/sprite-roster-remainder` @ `2204d4c7a` — four commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `f431b878c`; master `tasks/sprite-roster-remainder.md`; the implementer's report, boards and census: `artifacts/sprite-roster-remainder/report.md`. **Merged as** `dfb90fe68` onto the week's chain (after the boss-models merge `2a1de4eca`, on main `3d407c46d`; `git merge --no-ff`, one LEDGER union), era-6 pin #7 `72f1e2f4…` appended on the chained tree, landed by fast-forward at the hash the ledger row names.
**Owner words, verbatim:** 2026-09-15 "I care mostly about the quality of the animations and I had the impression that Astra really understood and nailed that." · 2026-09-17 "Lets do them all." · "All on the Anthropic subscription".

## VERDICT: LANDED — F-SPR-06 cured for all nine slots, F-SPR-07 cured where Astra had cut the cure, the rest named as "needs cells"

## 1. What landed (the implementer's measurements on Astra's animator boards; spot-checked at the drain: the halo guard, the era guards, the boards eyes-on)
| slot | facings before → after | change |
|---|---|---|
| `char.e6.feral_toaster`, `e6.lawn_shepherd`, `e6.glowjack`, `e7.rogue_automaton`, `e7.data_rustler`, `e8.scrap_corsair`, `e8.sun_glare_shambler`, `e9.feral_terraformer`, `e9.claim_jump_prospect_drone` | **1/8 → 8/8** | F-SPR-06: the per-direction sheets registered in `assets/layer-contracts/characters.v2.json` and the runtime tables |
| `char.baron` | 8/8 → 8/8 | `ne` + `w` → Astra's clean plates (ground wedge 739 → 380 dark px per cell; NW was already clean at 373) |
| `char.bandit_thief` | 8/8 | `se` → a real toward-camera SE (main's SE was its SW) |
| `char.e2.rail_tough` / `coal_thief` / `steam_wrecker` | 8/8, 4/8, 4/8 | `n` → true back views (main's row 3 was a ¾ walk / the machine front-on) |
| `char.claim_jumper`, `prospector_agent`, `hero` | 4/8, 4/8, 8/8 | unchanged (below) |

**612 cells / 60 families / 37,290,065 B** taken from `sol/code-review-20260908` path by path. **F-SRR-1 — the master's premise was wrong:** the E6–E9 per-direction sheets did NOT land at stage 1 (only the nine flat 8-cell loops did); all 576 per-direction cells sat on Astra's branch referenced by nothing, and without them F-SPR-06 has no cure — the implementer took them and isolated them in one commit (`3928b6862`); the drain keeps it: it is exactly the work the owner asked for. None of the 576 reaches the E1 bundle (`releaseE1CharacterImports()` filters `^char\.e[2-9]\.`); 24 new cells do (Baron NE/W, thief SE) and 16 superseded ones leave it — **first town 48,968,840 B, +0 B against main**.

**Held, each with the reason:** `char-baron-walk4-diagonal-v2` (the Baron's `walk8` is enabled and complete, so `selectWalkSheet()` never reaches `walk4` — 3.7 MB nothing renders, and its 4-frame cells would downgrade the 8-frame diagonals); `char-thief-se-f0..f7` (superseded drafts; Astra's own contract references only `-finish-v2`); the Claim Jumper's cardinal size variance (46.9 %–63.5 % of cell across four headings) is a generation difference (LEDGER row 31: four separate takes grafted under one scale), not a framing artefact — re-extraction cannot fix it. **Needs cells (a future art batch, owner's word):** Baron `e` (80.66 % of cell, the darkest; the measured remainder of F-SPR-07), Claim Jumper `n` (and `w`), Steam Wrecker and Coal Thief `sw/se/nw/ne` (today aliases onto the side rows). Nothing was mirrored, rescaled or generated. Astra's `groundContactY` / `frameBlendMs` keys were deliberately not taken (main carries neither; a per-direction value would anchor one heading unlike its siblings) — their own slice if wanted.

## 2. Gate table
| gate | implementer (branch) | drain (chained tree) |
|---|---|---|
| tsc / `npm run build` / `GR_RELEASE=e1` build + payload | clean / rc=0 / rc=0, 48,968,840 B | rc=0 / rc=0 / rc=0, first town 48,968,840 B of 52,000,000 (drain, chained tree) |
| `scripts/halo-reextraction-check.mjs` | PASS 395 / 0 / 680 / **2,059** scanned (re-pinned from 1,401 naming both terms: 612 cells mine, 46 not — F-SRR-3) | PASS 395/0/680/2059 |
| `character-direction-assets` + `hero-clip-groups` | rc=0 | — |
| Astra's four probes (`review-enemy-sprites`, `review-sprite-idle`, `review-prospector-sprites`, `review-town-walk`) | rc=0, every registered heading its own facing | boards eyes-on at the drain |
| plain boot (town, e6/e7/e8/e9 arenas), desktop + 390 px | zero console/page/request errors | — |
| e2e, both projects | 60 passed / 6 failed — the six are `e7/e8/e9-roster` "plain boot" on `e7Arsenal.enabled` / `e8Arsenal.available` / `e9Arsenal.eraActive`, red on main `f431b878c` with the branch's files moved out (F-SRR-4) | reused |
| engine era | hash reported | pin #7, guards 9/9 |
| full `test:node-guards`, Node 26 (one battery for the chained boss + roster tree) | not run (the drainer's) | 796 tests, 793 pass, 1 fail, 2 skipped (883 s) on the chained boss + roster tree: the one red is the fixture-owner sweep, whose only survivor is `scripts/modified-tracked-evidence-census-guard.test.mjs` (eleven `mtec-*` temp directories) — a fire's guard landed on main today (`ba1cac4e0`, s2603) that passes 16/16 and leaks its directories on MAIN ALONE (measured: `TMPDIR` scratch, 11 survivors), so the sweep is red on main independently of this land (hygiene item 7, F-HYG-7); stages 2–7 run separately on the same tree, rc=0 (`attended-battery-stages2-7-chain.log`). The boss-only battery before the roster merge read 791/2, its second red `secure-choice-refusal.test.mjs` green alone (contention beside the roster agent\'s probes) |

## 3. Findings
- **F-SRR-1 (premise, resolved):** stage 1 landed the nine flat loops, not the per-direction sheets; the 576 cells came with this land. The 2026-09-12 review's F-SPRDR-4b count ("20 families") was the staged replacements, not the per-direction sheets.
- **F-SRR-2 (held art, owner's word later):** the Claim Jumper's four cardinal cells are four takes at one scale; only new cells fix it. On the "needs cells" list with the Baron's east row and the two E2 machines' diagonals.
- **F-SRR-3 (pre-existing on main, cured here):** the halo guard's denominator read 1,401 while main held 1,447 PNGs — the animation-runtime land of 2026-09-15 added 53 art files (46 PNGs, F-SAR-1) without moving the pin; the guard was red on main since and the battery does not run it. Re-pinned with both terms written in.
- **F-SRR-4 (pre-existing on main, fire-authorable):** `e7-roster`, `e8-roster`, `e9-roster` "plain boot" assert `e7Arsenal.enabled` / `e8Arsenal.available` / `e9Arsenal.eraActive` and are red on main by two controls; not sprite-related — recorded in `logs/suite-red-inventory.md` for attribution to the land that moved those systems (the era-6 map campaign or the runtime).

## 4. What was touched
`assets/processed/**` (612 cells from the branch; 16 superseded removed), `assets/layer-contracts/characters.v2.json`, `src/assets/{slots,generated}.ts` and `character-runtime-frames.json` (registrations), `scripts/halo-reextraction-check.mjs` (declarations, the 2,059 re-pin), `assets/LEDGER.md`, `artifacts/sprite-roster-remainder/**`; at the drain `assets/engine-era.json` (pin #7), this review, `logs/suite-red-inventory.md` (F-SRR-4), `tasks/goals.json`, `tasks/BACKLOG.md`.
