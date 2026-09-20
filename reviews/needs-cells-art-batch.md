# Drain review — `needs-cells-art-batch`: the roster's missing cells generated on the owner's Higgsfield credits, extracted, wired and boarded (attended drain, 2026-09-18)

**Slice/branch/tip:** `art/needs-cells-art-batch` @ `d5d4ca6b6 (archive: pruned by the A3 rewrite)` — eight commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `133f80804`; master `tasks/needs-cells-art-batch.md`; the implementer's report, credit ledger and boards: `artifacts/needs-cells-art-batch/`. **Merged as** `1b9dbc234` onto main `d853af7cc` (`git merge --no-ff`, zero conflicts), era-6 pin #10 appended (the character layer contract is in the corpus), landed by fast-forward at the hash the ledger row names.
**Owner words, verbatim:** 2026-09-15 "I care mostly about the quality of the animations…" · 2026-09-18 "yes! lets go for the cells" (money: the expiring Higgsfield credits, cap 600).

## VERDICT: LANDED — 44 new cells across ten stems plus the schoolteacher's row 2, for 70 of the 600 credits; one row parked after four takes

## 1. What landed (the implementer's measurements; the sheet law held on every row: the STYLE ANCHOR verbatim, flat #ff00ff, uniform cells, no mirrors, heights measured against the family's band)
| row | cells | takes (charged) | credits | heights within the band | verdict |
|---|---|---|---|---|---|
| Baron east | 8 @ 512 | 11 (7) | 14 | 75.4–76.6 % of cell vs the family's 74.0–77.2 (main's east read 79.7–82.0 % and was the darkest row) | LANDED |
| Claim Jumper north / west | 4 + 4 @ 256 | 2 + 2 | 8 | 62.5–67.2 % vs cardinals 60.9–66.4 | LANDED (the slot is runtime-dormant, F-NCB-3) |
| Steam Wrecker sw / ne / nw | 4 + 4 + 4 @ 512 | 2 + 3 + 2 | 14 | 43.4–50.4 % vs 44.5–48.8 | LANDED |
| Steam Wrecker se | — | 4 (4) | 8 | the lamp never stayed lit across all four cells on three premises | **PARKED**, the alias kept (F-NCB-2) |
| Coal Thief se / sw / ne / nw | 4 × 4 @ 512 | 2 + 3 + 3 + 2 | 20 | 47.9–53.9 % vs 47.3–53.9 | LANDED (ne under-turned, noted) |
| schoolteacher row 2 | 4 @ 512 (replaced in place) | 2 | 4 | 308 px, 60.2 % vs 58.8–61.3 (was 336–337 px with a ground remnant; the sidecar bboxes re-measured — `TownScene` anchors her foot on them) | LANDED |

**Credits: 70.15 of the 600 cap** (account 851.99 → 781.84, measured either side of every call): 34 charged Nano Banana Pro generations at 2 credits (68.00), one `z_image` probe at 0.15 that proved the plan wall was per-model and not a dead account, and one generation charged but never logged when a batch was killed mid-call (2.00, F-NCB-7); the four refused calls and the `gpt_image_2_5` probe cost nothing. **GPT Image 2 is refused on this account** (`job_minimum_basic_plan_required`, measured three times at 0 credits) — the batch ran on Nano Banana Pro at 2 credits a call (F-NCB-1, owner's desk: a Basic plan is money). 44 cells wired as real registrations (the aliased diagonals become real: the Coal Thief 4/4, the Steam Wrecker 3/4; the Baron's `e` resolves to `char-baron-east8-v1`).

## 2. Gate table
| gate | implementer (branch) | drain (merged tree) |
|---|---|---|
| tsc / `npm run build` / `GR_RELEASE=e1` build | 0 / 0 / 0 | 0 / 0 / 0 on Node 26 (merged tree, `$S/nc-tsc.log`, `nc-build-release.log`, `nc-build.log`) |
| first-town payload | 34,641,290 B (+132,222 B) | 34,641,290 B (identical to the implementer's number) |
| `scripts/halo-reextraction-check.mjs` | PASS 379 / 0 / 696 / 2,103 | PASS 379/0/696/2103 |
| `character-direction-assets` / `hero-clip-groups` | 2/2 / 7/7 | — |
| `review-enemy-sprites`, `review-sprite-idle` | rc=0 (`review-town-walk` rc=1 on a pre-existing `isPlazaPatrolActor` ReferenceError in its own eval'd slice, F-NCB-5) | — |
| e2e, both projects (`e1-baron`, `e2-enemies`, `e2-hill-mine`, `eight-winds-enemies` + the town boot) | 47 pass / 14 fail / 3 skip — all 14 reproduced on the base tree `133f80804` or with the new Baron east registration removed (contract control); `e2-hill-mine.spec.ts:75/184/250` are F-OMA-5's rows, recorded at the open-maps drain after this implementer's base | , |
| plain boots (town, e1-baron, e2-hill-mine) at 1280 and 390 | 0 console / 0 page / 0 failed requests | — |
| engine era | hash reported | pin #10 `5a00e9a0…`, guards 9/9 |
| full `test:node-guards`, Node 26 | not run (the drainer's) | 920 tests: 914 pass / 1 fail / 5 skipped in 16.8 min (`artifacts/needs-cells-art-batch/attended-battery-node26.log`) — the one red is F-NCB-9, a native SIGBUS in vite's rolldown binding that reproduces on a control worktree at plain main |

## 3. Findings
- **F-NCB-1 (owner's desk, money):** GPT Image 2 needs a Higgsfield Basic plan; Nano Banana Pro did the batch at 2 credits a call and the rows measure in band. Buy the plan only if a later batch needs the stronger model.
- **F-NCB-2 (parked):** the Steam Wrecker's south-east — its lamp would not stay lit in four takes; LEDGER row 67 parked the same row in July. The family's own never-wired `walkdiag4-a` row 1 measures uniform on the lamp and is a free candidate; overturning July's park is a drain call for a quieter day.
- **F-NCB-3 (wiring, not art):** `char.claim_jumper` is runtime-dormant (`pools.ts:1138`; no live body resolves the slot) — the new north/west cells ship and measure but nothing draws them until the slot is wired; its sheet-b diagonals also sit 139–150 px, outside this batch.
- **F-NCB-4 (honest residual):** `thief-ne` reads closer to straight north than a full 45° and its sack sits where `n` puts it; landed because the alternative is the aliased cardinal it replaces.
- **F-NCB-5 (pre-existing):** `review-town-walk.mjs` fails on a `ReferenceError` inside its own eval'd `TownScene` slice; no `src` line changed here.
- **F-NCB-6 = F-OMA-5:** the three Hill Mine reds the implementer found outside the inventory were recorded as F-OMA-5 at the open-maps drain (inventory rows added there); no new row.
- **F-NCB-9 (environmental, fire-authorable):** the one battery red, `scripts/rider-parity-retirement.test.mjs`, is a native crash, not an assertion: `EXC_BAD_ACCESS / SIGBUS` inside `rolldown-binding.darwin-arm64.node` (`napi_create_function` ← `ThreadSafeFunction::AsyncCb`) after the guard closes its second in-process vite server, rc 138. Nondeterministic (an identical re-run on the same tree passed, rc 0, and another passed inside the battery transcript), and it reproduces on a control worktree at plain main `5a3eb052c` (rc 138); crash report `~/Library/Logs/DiagnosticReports/node-2026-09-18-095412.ips`. Nothing this batch touched is read by the guard (`src/agent`, `src/sim`, `artifacts/rider-parity-grammar` unchanged). Cure for a fire: close the vite server after the assertions have been collected, or run the two doors through one server.
- **F-NCB-7 (process):** one killed batch call still charged 2 credits — never kill a Higgsfield batch mid-call; let the call return.
- **F-NCB-8 (process):** the "restore tracked churn" rule (`git checkout --` under `artifacts/**`) once reverted the implementer's own halo-guard edit; caught by re-running the gate on the committed tree. Narrow the rule to the churn paths.

## 4. What was touched
`assets/raw/*-needs-cells-2026-09-18.png` (the raw strips), `assets/processed/**` (44 new cells; the schoolteacher's four replaced with re-measured sidecars), `assets/layer-contracts/characters.v2.json`, `src/assets/{slots,generated}.ts` + `character-runtime-frames.json` (registrations), `scripts/halo-reextraction-check.mjs` (declarations, 2,103 re-pin), `assets/LEDGER.md` (the batch row with request ids and credits), `artifacts/needs-cells-art-batch/**`; at the drain `assets/engine-era.json` (pin #10), this review, `tasks/goals.json`, `tasks/BACKLOG.md`, `docs/OWNER-DESK-2026-09-06.md` (A4 spend recorded).
