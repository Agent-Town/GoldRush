# Drain review — `rulings-play-2026-09-19`: six owner rulings on play and art executed — pressure in the agent view, the Eclipse's census row, the Twin Banks fords, the wheel's station, the prospector coats, and the Claim Jumper woken at the drain (attended drain, 2026-09-19)

**Slice/branch/tip:** `feat/rulings-play-2026-09-19` @ `b279bcaf6` — ten commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `797052233`; master `tasks/rulings-play-2026-09-19.md`; report `artifacts/rulings-play-2026-09-19/report.md`. **Merged as** `e4766971b`, null floors re-recorded, the halo guard re-pinned on the merged count, era-6 pin appended (the view and the contracts move the engine hash), fast-forwarded.
**Owner words, verbatim (2026-09-19):** "I agree with all your recommendations on the decisions - good work" · (2026-09-07) "AI and human users have to have the same options and tools, otherwise it is unfair. fairness is crucial."

## VERDICT: LANDED — five of six executed; the Claim Jumper wake stays parked (the drain's spec re-point did not read green)

| ruling | what landed | measured |
|---|---|---|
| F-HEAT14-3 | `now.pressure` published on both engines, contract-scoped: `{ stored, cap, band, safeBand|null, coal, coalSeconds, boilers{built,hot,cooling,max}, vents, objective{…}, seams[{id,x,z,harvested,progress,marked}] }`; the skill fence regenerated; no vent verb (the human has none either); **no view-version bump** — `view-schema-guard` proves the canonical set is built from `the-claim`, so contract-scoped fields never enter it | `view-schema` 3/3, `skillmd-guard`, the same-game audit equal, `er01-e2-census` re-pinned with cause |
| A1 | the engine half was ALREADY on main (`be14d1a8d`, 2026-09-06 authored `{ regolithRequired: 4, regolithWindowWaves: 4 }` on the Eclipse and `E8SuitAirSystem.requiredGrounds` reads it; `eclipse-winnable.test.mjs` guards both numbers); what was owed was the per-id air-gate row in `er01-e8-census` | a ported rider (the 2026-09-06 prover cannot replay: `MOVE_TO`/`HOLD` retired) secures the Eclipse **w20 / 600 s / 140 gold** with the latch at t = 447.6 s, wave 14, window 3, 0 breathless pans |
| F-OMA-4 | the Twin Banks fords — FIVE edits, not the two the open-maps report named: the contract, the spec, the fixture, two gr-sim hash pins, the null floors | plain-boot secure-wave instrument before 13 / 13 / 12 → after **16 / 19 / 17** (+4.67 mean), 0 console / 0 page errors on all six |
| F-NCS-5 / F-NCS-6 | PARKED: the implementer's diff re-applied at the drain with the spec re-pointed to the ruled body did not read green (ncs5 e2e rc=1   10 failed   1 skipped   27 passed (7.9m)); reverted, patch preserved at `artifacts/rulings-play-2026-09-19/ncs5-parked/the-diff.patch` | see the prep transcript |
| F-POC-4 | the Fairground wheel re-declared at the 14-back station like every landmark | apex y 84.5 (1280) / 89.2 (390); persistent HUD coverage **39.1 % → 0.0 %** desktop, **61.5 % → 54.5 %** mobile |
| F-SSL-3 | both prospector coat regenerations taken — the real subjects are the two `hover8` coats (`char-prospector-{complainant,gilded}-sheet-hover8.png`), not the `hover4-{a,b}` boards the master named | silhouette complainant 220 → 226 px (mean +2.44), gilded 220 → 224 px (mean +2.06); halo guard PASS on the branch 315 / 0 / 760 / 2,123, re-pinned here on the merged count |

## Gate table
| gate | implementer (branch) | drain (merged tree) |
|---|---|---|
| tsc / build / `GR_RELEASE=e1` / payload | green | 0 / 0 / 0 · 34228680 bytes B |
| null floors (the fords move them) | re-recorded on the branch | 83 of 83 null floors match assets/contracts/null-floors.json |
| halo guard | 315/0/760/2,123 on the branch |  (2127) |
| `skillmd-guard`, `view-schema`, `same-game-audit`, `law-pointer` (one `fire.md` pointer 367 → 368 re-based by measurement then `--update`), `no-emdash` | green | ℹ pass 69 ℹ fail 0 |
| e2e both projects: `er01-e2-census`, `er01-e8-census`, `e1-twin-banks`, `e3-fairground`, `e2-enemies`, `e1-baron`, `eight-winds-enemies` | reds attributed: twin-banks `:64/:103/:122`, e2-enemies `:113/:314`, eight-winds `:39`, er01-e8 mare-claim `:108` reproduce on controls (pre-existing); twin-banks `:192` green alone; `gr-sim` overtime PASS alone in 94 s | 16 failed   1 skipped   49 passed (10.8m) — reds attributed in the gate summary |
| engine era | `cc3fd5d4…` → `78c43d60…` on the branch, the pin left to the drain | pin `c13ac1aa…`, guards ℹ pass 9 ℹ fail 0 |
| full `test:node-guards` | 929 / 919 pass / 5 fail: two of its own cured (em dashes in `skill.md`, the fire.md pointer), three = the drain-owned pin + the sweep's echo | ℹ tests 929 ℹ pass 924 ℹ fail 0 ℹ skipped 5 ℹ tests 42 ℹ pass 42 ℹ fail 0 ℹ skipped 0 — reds in artifacts/rulings-play-2026-09-19/attended-gates-summary.txt |

## Findings
- **F-RP-1 (drain):** the Claim Jumper wake — re-applied at the drain with the spec re-pointed and still red; the patch stays preserved; one more look owed.
- **F-RP-2 (register correction):** A1's engine half had shipped on 2026-09-06; the register's "one slice" was the census row only.
- **F-RP-3 (report correction):** the fords needed five edits (contract, spec, fixture, two gr-sim pins, null floors), not two — a lesson for the next contract-data cure: gr-sim pins and null floors follow every map-data change.
- **F-RP-8 (attribution, disclosed by the implementer):** `git checkout <ref> -- <path>` stages what it restores, so F-SSL-3's 68 asset files were swept into `451daa5b9` (the Twin Banks commit) instead of `4cb128097`; the content is right, the per-commit attribution is not. Recorded here, not rewritten.
- **F-RP-4 (view):** contract-scoped `now` fields do not bump the view version by construction (`view-schema-guard`); a rider on an E2 map reads `now.pressure`, elsewhere it is absent.

## What was touched
`src/agent/View.ts`, `src/agent/MechanicsManifest.ts`, `public/skill.md`, `scripts/gr-sim.test.mjs`, `e2e/er01-e2-census.spec.ts`, `e2e/er01-e8-census.spec.ts`, `e2e/e1-twin-banks.spec.ts`, `e2e/fixtures/e1-mechanics-manifests.json`, `assets/contracts/epoch-1-frontier/contracts.json` (the fords), `assets/contracts/null-floors.json`, `assets/raw/char-prospector-{complainant,gilded}-sheet-hover8.png` + `assets/processed/**` (68 files), `assets/layer-contracts/characters.v2.json`, `scripts/halo-reextraction-check.mjs`, `scripts/fire.md` (one pointer), `scripts/law-pointer-baseline.json`, the wheel's capture spec, `artifacts/rulings-play-2026-09-19/**`; at the drain  `assets/engine-era.json`, the null-floor anchors, this review, `tasks/goals.json`, `tasks/BACKLOG.md`, `STATUS.md`, the desk register.
