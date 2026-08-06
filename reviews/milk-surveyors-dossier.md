# Review — THE SURVEYOR'S DOSSIER (milk shift, 2026-08-06)

**Slice:** `milk/surveyors-dossier` (worktree `gr-milk-surveyors-dossier`), tip `0e9d85a1e` + this review
**Shift:** final-milk fleet, F-1368-1 — *"the last column is yours — verdict in one word, I file the rest"*
**Verdict:** **DELIVERED — and the deliverable found that the ask it was built to serve is 52% impossible.**

## What it does

Boots every wired campaign map in `docs/MAP-CAMPAIGN-LEDGER.md`, records what actually mounts, photographs each map at the shipped camera, and files the result as `docs/MAP-CAMPAIGN-LEDGER-DOSSIER.md` — a per-map table the owner can verdict from in one look. Two read-only scripts: `scripts/campaign-map-dossier.mjs` (probe) and `scripts/campaign-map-dossier-table.mjs` (renderer, derived verdicts over measured numbers). The `OWNER VERDICT` column is present and empty; it is his.

**The intended deliverable was 25 rows of "boots ✓, landmarks n/n, here is the picture."** Thirteen of the twenty-five could not produce that row, because the game refuses to open them. That refusal — not the screenshots — is the shift's actual finding.

## Evidence (native, this worktree, scratch vite on :5199)

| gate | result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **rc=0**, built in **1.33 s**; asset-diet 235 GLBs 592.0→92.7 MB (84%), 54 PNGs 187.0→24.8 MB (87%) |
| probe sweep | **29 boots** (25 campaign + 4 hosts), 1280×800, headless Chromium, **0 failures** |
| console errors | **0 across all 29** |
| page errors | **0 across all 29** |
| median boot | **18,476 ms** (range 13.8–22.5 s) |
| campaign door verdict | **12 opened · 13 refused · 0 broken** |
| screenshots | **30** in `reviews/shots-campaign-dossier/` (spawn + landmark station per opened map, 4 host sculpts) |
| relief sampled | 121 stations/map through `terrainVisualY`; range across openers **0.747 m – 7.386 m**, all above the 0.3 m house floor |
| raw artifact | `artifacts/campaign-dossier/probe.json` — every dataset attribute, relief sample, frame histogram, diagnostic string |

**Server provenance:** the probe refuses a base URL it cannot prove belongs to this worktree — `rehearsal/base-url.mjs` `resolveBase` matched the listener's cwd to `gr-milk-surveyors-dossier` before any boot. Port 5188 was deliberately not used (`strictPort`, shared with the lane fleet).

## Findings

### 🔺 F-MSD-1 — OWNER'S DESK. 13 of 25 campaign maps cannot be opened, and the ledger reads as though all 25 are ready.
`ContractFamilies.ts:1328` refuses any contract declaring `harvestAnchors: []` and opens The Claim instead, publishing `fallbackReason: 'unavailable-contract'`. Thirteen campaign contracts declare it.

**Confirmed three independent ways, because one would not have been enough:**
1. **Source** — the predicate at `ContractFamilies.ts:1328`, and the player-facing line it writes at `:1334`.
2. **Runtime** — all 13 returned `fallbackReason: 'unavailable-contract'` live, read from `__GR_CONTRACT_REGISTRY__.activeContractDiagnostics()` and cross-checked against `__GR_TEST__.activeContract().id` on every boot (the probe throws if the two disagree; they never did).
3. **The factory's own gate artifact** — `artifacts/map-census/table.md` shows **15 of 42 rows `PASS-exempt: contract unavailable` on every column**, while printing `Census-closed: MQ-1, MQ-3`.

**Why it survived:** every gate measures something adjacent. The ledger's `wired` column measures presence in the **renderer's** registry (`MAP-CAMPAIGN-LEDGER.md:5`); the door is a different gate. `map-census.spec.ts:279` exempts exactly these maps. `terrain3d-registry.spec.ts` proves their assets mount — into a **detached scene**, never through the door.

**Not new to the factory; new to the desk.** `docs/bench/e7-readiness-census.md` and `e5-readiness-census.md` each recorded the mechanism for their own era. No document totals it across the campaign, and no owner-facing document mentions harvest anchors at all. **The fact was known in two era-scoped reports and invisible in the one document the owner reads.**

### 🟡 F-MSD-2 — five reuse maps ship 25 bespoke landmarks the game can never mount; the ledger counts them as present.
Picnic, Dead Band, Relay Rush, Far Side, Eclipse each ship a 5-`.glb` pack, each referenced by that map's own `-terrain-contract.json` — which the registry never loads, because the reuse ruling hands these maps the **host's** contract. Proven live on The Eclipse, the only one the door opens: it mounts Mare Claim's five bodies while its own `eclipse-shadow-dial`, `launch-shadow-gate` and two `solar-witness` bodies sit unused. `MAP-CAMPAIGN-LEDGER.md:5` derives `landmarks` from *"a populated pack under `landmarks/<slug>/`"* — file presence, not mounts. **Owner-gated:** the standing prohibition at `:40` forbids re-sculpting a reuse mount and is silent on dressing.

### 🟢 F-MSD-3 — liveness check, not a new finding: the E5 drowned town still renders nothing.
`e5-deepwater-claim` and `e5-stillwater` both report `landmarks 0/4, skipped 4`, all four `asset unavailable`. Already filed at `BACKLOG:1712` with the same root cause named (*"pilot's `landmarks/**` glob can't resolve deepwater's out-of-root mount paths"*), *"Needs its own corrective"*; I found no such corrective on the board. **Checked before filing precisely so this shift would not re-file a known finding under a new id.** Left untouched — `BACKLOG:3033` shows a DEEPWATER SURGERY milk shift owns that neighbourhood.

## Instrument defects caught in my own probe, before any number reached the dossier

1. **`activeContractDiagnostics` is not on `__GR_TEST__`** — it lives on `__GR_CONTRACT_REGISTRY__`. The first run threw loudly on all three smoke maps. Had I written `?.activeContractDiagnostics?.()`, it would have returned `undefined` silently and **every map would have been recorded as opening.** The probe now throws when the surface is absent rather than defaulting.
2. **The first spawn screenshot did not contain the map.** On The Trestle all six landmarks sit outside the spawn camera, so shot one was a patch of dirt. Looking at the PNG caught what the numbers (`landmarks 6/6`) could not. A second station at the first landmark mount was added.
3. **The refusal nearly produced 13 mislabelled photographs.** The pilot installs `activeContract.id` (`Game.ts:1741`), so a shot taken after a fallback is The Claim wearing another map's name. The probe returns before the screenshot on any refusal, and reuse maps link the **host** sculpt, labelled as the host.
4. **The derived verdict over-claimed, and only opening the PNGs caught it.** The renderer originally emitted `✅ SHIP-SHAPE — plays and looks finished` for the three maps where every measured signal was clean. Then I looked at them: Blackout Ridge carries a large grey disc and a floating plane around its rig, and The Showroom shows an abrupt streaked horizon seam. **The rules measure presence and counts — mounts, triangles, relief, luma, error streams — and not one of them can see whether a map looks right.** The label is now `✅ OPENS CLEAN — plays; every measured signal good`, and the dossier carries a HUMAN-EYE PASS section, explicitly marked opinion, naming what the rules passed. *A generated verdict only ever checks the boxes it was given; mine were never given appearance.*

## Merge classification

Additive only — 2 new `scripts/*.mjs`, 1 new `docs/*.md`, 1 new `reviews/shots-*` directory, 1 new `artifacts/*` directory, this review. **No file that existed before this shift was modified**, so there is no conflict surface. Nothing touches `src/`, `e2e/`, any map, any contract, the pilot, or the ledger's verdict column. `scripts/*.mjs` sits outside `tsconfig.json`'s `include`, so it cannot affect tsc; both gates were run anyway and are green.

**Firewall honoured, including where it cost something:** the dossier's headline argues that `docs/MAP-CAMPAIGN-LEDGER.md` needs an `opens?` column. That file is not in this shift's TOUCH-ONLY list, so I did not add one — the recommendation is recorded in the dossier instead, named as a follow-up this shift lacked authority to do.

## Honest limits

- **Not run:** `e2e/terrain3d-registry.spec.ts`. Its `:219-220` assertions (`landmarks === 4`, `skipped === 0`) should be red on `e5-deepwater-claim` given F-MSD-3. Stated in the dossier as an **inference**, not a measurement.
- **Not proven:** that no route exists to open the 13. I checked board launch, staged launch, saga flagship and replay — all reach the same test at `ContractFamilies.ts:1328` — and the editor route substitutes a document rather than lifting the gate. A route I did not think of would falsify F-MSD-1, and the dossier says so.
- **Screenshots carry the `?debug` HUD**, because `?debug` is what installs the diagnostics API. They are evidence of what mounts, not beauty renders.
- **The 13 refused maps have no photographs of their own terrain.** Deliberate, per defect 3 above; 5 of them link a host sculpt.
