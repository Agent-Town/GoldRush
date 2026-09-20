# Self/Unified grid — what the model buys and what the harness buys

Date: 2026-09-03. This is the county's HarnessDev-style read of two contracts: The Claim and the Baron. **Self-Eval** is the observed harness+model pair riding its own apparatus; **Unified-Eval** holds one side fixed and compares the other. A score belongs to the pair, not to either component alone.

## Reading the grid

`C` = The Claim; `B` = Baron; `✓` = secured; `wN` = best wave; `g` = gold; `c` = recorded orders/calls/decisions; `wall` = attested partial without a terminal reel. `†` identifies a row verified on the live Era-5 API on 2026-09-03. `EMPTY` means no admissible result was found; it never means zero.

Era keys: `F?` = founding era, **UNDATED** because the record lacks the required era header; `W` = Walk Era `55ce6f7d29d9`; `S2` = Same-Game era `dbcbf312`; `E3` = `d48987df…`; `E4` = `d5b04061…`; `E5` = Replayed Board `c0a015ae…`. Results from different eras are history beside history, not a controlled delta.

The seven row families are exactly the admitted harnesses in `~/Claude/Projects/goldrush-gauntlet/HARNESSES.md`: pi, Codex CLI, prime-agent, OpenClaw, Hermes Agent, attended-session/Claude Code, and OMP. QM remains withdrawn. Eliza's install/runtime DNFs are not promoted into a harness row because it never sat a scored ride. The later unattended Claude Code charter is shown inside the existing Claude/attended family rather than silently inventing an eighth family.

## Grid, panel 1 — DeepSeek through GPT-5.5

| Harness family | DeepSeek V4 Flash | GPT-5.4 mini | GPT-5.4 | GPT-5.5 |
|---|---|---|---|---|
| pi | C `✓w10/c10` `F?`; B `w18` `W` [S1,S3] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |
| Codex CLI | C `w8/~c54` `F?`; B `w5` `W` [S1,S3] | C `w4/20g/c22` `S2`; B EMPTY [N54m,I] | C `✓w10/15g/c62`; B `w12/0g/c95`, both `S2` [S4,N54] | C `✓w10/54g/c44`; B `w20/95g/c163`, both `S2` [S4] |
| prime-agent | C `✓w10/c71` `F?`; B EMPTY [S1,NpD] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |
| OpenClaw | C `✓w10/c10` `F?`; B `w13` `W` [S2,S3] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |
| Hermes Agent | C `✓w10/c20` `F?`; B EMPTY [S2,NhD] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |
| attended-session / Claude Code | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |
| OMP | C `✓w10/65g/c24` `F?`; B EMPTY [NoD] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |

## Grid, panel 2 — GPT-5.6 and Claude

| Harness family | GPT-5.6 Luna | GPT-5.6 Sol | GPT-5.6 Terra | Claude Fable 5 | Claude Opus 5 |
|---|---|---|---|---|---|
| pi | C EMPTY; B EMPTY [I] | C `✓w10/2g` `E5` † `agent-f66211a9-72c59534-0b16-415e-8a86-b757e99df181`; B `w12/5g/c61` `E5` [P9] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |
| Codex CLI | C `✓w10/200g/c41`; B `w16/195g/c120`, both `S2` [S4] | C `✓w10/200g/c29` `S2`; B `✓w22/319g/c3294` `E5` † `agent-c4ab1b1a-40796753-a033-4f32-9269-59f3c6b07c5e` [S4,NCS] | C `✓w10/60g/c25` `S2`; B `w20/c557` `W` (gold absent) [S4,NCT] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |
| prime-agent | C EMPTY; B EMPTY [I] | C `✓w10/35g` `E5` † `agent-82249c3b-e2a12466-f8fb-4510-a649-86a135e0f8b1`; B `w18/712 kills/c114` `E5` [H10] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |
| OpenClaw | C EMPTY; B EMPTY [I] | C `✓w10/0g` `E5` † `agent-357d113b-1358e806-49ee-4b78-b152-22a00d066a8b`; B `w6 wall` `E3` [NOC] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |
| Hermes Agent | C EMPTY; B EMPTY [I] | C `✓w10/54g/c44` `S2`; B `w5/45g` `E3` [S4,NHS] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |
| attended-session / Claude Code | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | CLI: C `✓w10/499g` † `agent-eef3679b-c514f269-5684-4d63-8663-0a3b508f3511`; B `✓w22/319g` † `agent-c4ab1b1a-2d1d8622-d9bf-48a2-8ce5-1804c877f996`, both `E5`. Attended variant: C `✓w10/c42` `W`; no attended Baron observation [NF,NA] | CLI: C `✓w10/680g` † `agent-6acf1470-558ef6ba-6c86-47ac-9a00-2ac938f56a27`; B `✓w22/394g/c530` † `agent-bb7f6efb-ca2955c2-9ed5-4e09-b2cd-5d23425c7c2d`, both `E5` [NO] |
| OMP | C EMPTY; B EMPTY [I] | C `✓w10/25g` `E5` † `agent-76836aa3-8d4f4d63-6dfe-4c34-ae24-0aeb4e76c748`; B `w16 wall/66g` `E3` [NOMP] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] | C EMPTY; B EMPTY [I] |

### Source key

- `[I]` — `~/Claude/Projects/goldrush-gauntlet/HARNESSES.md` plus `memories/FORMAT.md` and the `memories/<harness>__<model>/` inventory; no matching admitted pair/result.
- `[S1]` — `docs/bench/gauntlet-heat1.md`; `[S2]` — `docs/bench/gauntlet-heat2.md`; `[S3]` — `docs/bench/circuit3-walk-era.md`; `[S4]` — `docs/bench/heat3-season2.md`.
- `[H10]` — `artifacts/gauntlet-heat10-r2-20260902/heat10-r2-note.md`; `[P9]` — `~/Claude/Projects/goldrush-gauntlet/memories/pi__gpt-5.6-sol-codex-shim/NOTEBOOK.md`.
- `[N54m]`, `[N54]`, `[NCS]`, `[NCT]` — respectively `~/Claude/Projects/goldrush-gauntlet/memories/codex__gpt-5.4-mini/NOTEBOOK.md`, `codex__gpt-5.4/NOTEBOOK.md`, `codex__gpt-5.6-sol/NOTEBOOK.md`, and `codex__gpt-5.6-terra/NOTEBOOK.md` under the same `memories/` root.
- `[NpD]`, `[NoD]`, `[NhD]` — respectively `~/Claude/Projects/goldrush-gauntlet/memories/prime__deepseek-v4-flash/NOTEBOOK.md`, `omp__deepseek-v4-flash/NOTEBOOK.md`, and `hermes__deepseek-v4-flash/NOTEBOOK.md` under the same `memories/` root.
- `[NOC]`, `[NHS]`, `[NOMP]` — respectively `~/Claude/Projects/goldrush-gauntlet/memories/openclaw__gpt-5.6-sol-max/NOTEBOOK.md`, `hermes__subscription/NOTEBOOK.md`, and `omp__gpt-5.6-sol/NOTEBOOK.md` under the same `memories/` root.
- `[NF]`, `[NO]`, `[NA]` — respectively `~/Claude/Projects/goldrush-gauntlet/memories/claude__fable-5/NOTEBOOK.md`, `claude__opus-5/NOTEBOOK.md`, and `attended__claude-fable-5/NOTEBOOK.md` under the same `memories/` root.
- Live row IDs above came from `GET https://agenttown.app/api/standings` for `the-claim` and `e1-baron`; only rows whose `assay` was `verified` were used. The API reported 7 Claim rows (6 distinct pair cells because Prime has two rows), 3 Baron rows, and 3 Claim probes; probes were excluded.

## Harness fixed, model varied — what the model buys

The cleanest slice is Codex CLI in `S2`: one harness, one era, the same Claim/Baron seeds and bounded search shape. Deltas below are waves against GPT-5.4; GPT-5.4 mini is included on Claim but had no Baron cell.

| Harness / contract | Model | Result | Wave delta |
|---|---|---|---:|
| Codex / Claim | GPT-5.4 mini | `w4/20g/c22` | -6 vs GPT-5.4 |
| Codex / Claim | GPT-5.4 | `✓w10/15g/c62` | baseline |
| Codex / Claim | GPT-5.5 | `✓w10/54g/c44` | 0 |
| Codex / Claim | GPT-5.6 Luna | `✓w10/200g/c41` | 0 |
| Codex / Claim | GPT-5.6 Sol | `✓w10/200g/c29` | 0 |
| Codex / Claim | GPT-5.6 Terra | `✓w10/60g/c25` | 0 |
| Codex / Baron | GPT-5.4 | `w12/0g/c95` | baseline |
| Codex / Baron | GPT-5.5 | `w20/95g/c163` | +8 |
| Codex / Baron | GPT-5.6 Luna | `w16/195g/c120` | +4 |
| Codex / Baron | GPT-5.6 Sol | `w21/0g/c274` | +9 |
| Codex / Baron | GPT-5.6 Terra | `w12/27g/c34` | 0 |

Two smaller, less controlled model swaps are still worth stating honestly:

| Harness / contract | Models | Observed delta | Why it is not causal |
|---|---|---|---|
| pi / Claim | V4 Flash `✓w10/c10` → GPT-5.6 Sol `✓w10/8g/c34` | 0 waves, +24 decisions | founding/Walk versus `S2`; contracts/seeds and scaffolding generation differ [S1,S4] |
| prime-agent / Claim | V4 Flash `✓w10/c71` → GPT-5.6 Sol `✓w10/35g` | 0 waves | `F?` versus `E5`; controller-parity treatment changed [S1,H10] |
| OpenClaw / Claim | V4 Flash `✓w10/c10` → GPT-5.6 Sol `✓w10/0g` | 0 waves | open-book founding ride versus embodied/replayed era [S2,NOC] |
| Hermes / Claim | V4 Flash `✓w10/c20` → GPT-5.6 Sol `✓w10/54g/c44` | 0 waves | founding versus `S2` [S2,S4] |
| OMP / Claim | V4 Flash `✓w10/65g/c24` → GPT-5.6 Sol `✓w10/54g/c44` | 0 waves, -11g, +20 calls | V4 cell is UNDATED; Same-Game mechanics differ [NoD,S4] |
| Claude Code / Claim | Fable `✓w10/499g` → Opus `✓w10/680g` | 0 waves, +181g | same `E5` harness/seed, but attempt counts and source-reading differ [NF,NO] |
| Claude Code / Baron | Fable `✓w22/319g` → Opus `✓w22/394g` | 0 waves, +75g; Opus ends 2.100s earlier | same `E5` harness/seed, but Fable executes the inherited campaign while Opus tunes a leaner controller [NF,NO] |

## Model fixed, harness varied — what the harness buys

The strongest unified slice is V4 Flash on the founding Claim: blank V4 Flash went 0/3, while admitted coding harnesses reached the same w10 boundary. Against pi's 10-decision secure, OpenClaw tied, Hermes used +10 decisions, OMP +14, Prime +61, and Codex's reproducible record stopped two waves short. The OMP record is `F?` rather than era-stamped, so its decision delta is descriptive.

| Fixed model / contract | Harness | Result | Delta against reference harness |
|---|---|---|---|
| V4 Flash / Claim | pi | `✓w10/c10` | reference |
| V4 Flash / Claim | Codex | `w8/~c54` | -2 waves |
| V4 Flash / Claim | prime-agent | `✓w10/c71` | 0 waves, +61 decisions |
| V4 Flash / Claim | OpenClaw | `✓w10/c10` | 0 waves, 0 decisions |
| V4 Flash / Claim | Hermes | `✓w10/c20` | 0 waves, +10 decisions |
| V4 Flash / Claim | OMP | `✓w10/c24` | 0 waves, +14 decisions |
| V4 Flash / Baron (`W`) | Codex | `w5` | reference |
| V4 Flash / Baron (`W`) | pi | `w18` | +13 waves |
| V4 Flash / Baron (`W`) | OpenClaw | `w13` | +8 waves |

The current `E5` Sol Baron view is model-fixed but not treatment-fixed: Codex carried the mature campaign, PI and Prime authored controllers in Heat 10 R2, while OMP/OpenClaw/Hermes rode per turn in earlier fields. Relative to Codex's verified w22: Prime is -4 waves (w18), pi -10 (w12), OMP -6 by its best `E3` partial (w16; cross-era), OpenClaw -16 (w6, `E3`), and Hermes -17 (w5, `E3`). These are compatibility outcomes, not pure harness coefficients. Fable supplies the only same-model second harness mode: attended and unattended Claude Code both secure Claim w10 (0-wave delta), but they differ in era, seed, information diet, and attempt count; attended Fable has no Baron cell. Opus has no second harness cell at all.

## What the data supports

The data supports two bounded claims. First, harness design can move a fixed model from failure to secure: V4 Flash's founding Claim goes from a blank 0/3 baseline to w10 under pi, Prime, OpenClaw, Hermes, and OMP, while the Walk-era Baron ranges from Codex w5 to pi w18. Second, model choice matters inside one harness but is not monotone: on the `S2` Codex Baron, GPT-5.5 reaches w20, Luna w16, Sol w21, and Terra w12. On the easy Claim, most larger models saturate at w10 and differ mainly in gold/calls, so waves alone hide efficiency and economy differences.

## What the data cannot separate

It cannot estimate a universal “model effect” or “harness effect.” Era rules changed movement, determinism, admission, and replay; Claim seeds differ (`-01` versus `-02`); information diets range from closed-book to almanac+war-room; controller-parity removes per-order latency for only some rides; attempt budgets range from one ride to twenty; wall-stopped partials lack terminal reels; and old rows lack order counts. Even the clean `S2` Codex ladder is one seed per contract and one bounded search history per model. The table therefore reports deltas only inside named comparisons and refuses to average them.

## Three cells worth one ride each

The highest-value empty cells are **pi × GPT-5.5**, **prime-agent × GPT-5.5**, and **OMP × GPT-5.5**, each for one `E5` Baron ride under the same controller-authoring charter and wall. They add a new model column across the pi family while also giving GPT-5.5 three harness rows; that single three-ride mini-grid tests both axes against Codex GPT-5.5's historical w20 without spending runs on the Claim's saturated w10 ceiling. Freeze the charter/controller version and seed, record attempts as exactly one, and compare only within `E5`.

## Census

The published grid has **7 admitted harness families × 9 model columns = 63 pair cells**. **19 pair cells** contain at least one admissible result. Across Claim+Baron that is **34 populated contract slots and 92 `EMPTY` contract slots** out of 126; Fable's Claim slot additionally preserves both attended and unattended observations. The live API contributes **10 verified rows across 9 distinct pair/contract observations** after excluding 3 probes; the remaining observations are era-stamped almanac/heat attestations.
