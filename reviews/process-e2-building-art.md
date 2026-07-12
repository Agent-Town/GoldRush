# Review — process-e2-building-art

- **Slice/branch/tip:** `process-e2-building-art` · `lane/e2-arsenal` (lane-c worktree) · tip **e62bd4a3** (`runner(lane-c): process-e2-building-art.md`, parent 87c9c569)
- **Drained by:** s440 fire, 2026-07-12 (LOCAL +07)
- **Verdict:** ✅ MERGE — gates green, no gameplay invented, canon-clean.

## What it does
Processes the E2 (Steamworks) building-art raws into the live build-menu + research UI. Registers processed 384×384 portraits for the Boiler House (replaces the missing build-menu portrait; world pool still `BoilerHousePlaceholder` — world-placeholder retirement NOT claimed), Rail Depot (`bld.rail_depot`) and Machine Shop (`bld.machine_shop`) as build-menu slots with **no live consumer invented** (registry only). Wires the extracted E2 icon sheet (8 cells: Boiler Lance, Pressure Mortar, Iron Wall, Boiler Battery, pressure gauge/card, rail card) into the E2 research chart, and registers the 7-cell rail-elements slots while keeping `RailPath` explicitly `procedural-placeholder` (texture retirement deferred to a permitted renderer-wiring slice). Touches: `src/game/buildables.ts`, `src/meta/ContractFamilies.ts`, `src/ui/BuildButton.ts`, `src/ui/ResearchChart.ts`, `assets/contracts/epoch-2-steamworks/manifest.json`, `assets/layer-contracts/e2-steamworks.v1.json`, `assets/LEDGER.md`, `e2e/process-e2-building-art.spec.ts`.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (no output) |
| `npm run build` | green — built in 583ms |
| Own spec `process-e2-building-art.spec.ts` | **2/2** desktop-chrome + mobile-chrome, zero console/page errors |
| Adjacent (single-worker): `m2-01-build-menu`, `research-chart`, `e2-arsenal`, `sci-04-contract-registry` + `_s106-prospector-boot-probe` | **38/38** passed (desktop+mobile), incl. plain-boot probe zero-errors + prospector visible |
| Screenshots | `artifacts/process-e2-building-art/{desktop,mobile}-chrome-{buildings,icon-row}.png` |

Buildings readable at 384px; no visible letters, firearms, or gore; magenta keys clean in extracted icon/rail cells (runner self-QA + review confirmed via screenshots).

## Merge classification
Merge base = **87c9c569** (on main). Main's only extra commit over base = **a89680e5** (`runner(art): art-kit-era-1.md`), which touched **only** `logs/.blocked-seen` + `logs/dashboard.html` (health churn). All slice src/assets/e2e/artifacts files changed on the LANE side only → merged clean. The two `logs/` churn files (both-sides-modified) resolved with `-X ours` (kept main's; they regenerate). No src/assets conflicts. Merge retires the branch (`main..lane/e2-arsenal` now empty).

## Findings
- **F-1 (non-blocking, documented):** Adjacent battery has a pre-existing red at `e2-hill-mine.spec.ts:311` (water-route `ratio = Infinity`) — disjoint from this slice's touched files (hill-mine water routing), flagged by the runner report as pre-existing; not caused here. Left for its own corrective.
- **F-2 (non-blocking, bookkeeping):** Sibling lane-c task `wire-e2-enemy-walk4` done-moved (`tasks/done/20260712-222634-wire-e2-enemy-walk4.md`) with **no lane commit** — probable Silent No-Op (Mistake #1); queue done-move committed as s440 bookkeeping. Verify/re-queue owed by next fire or attended.
- **F-3 (non-blocking, by design):** World-placeholder retirement (Boiler House world pool) and `RailPath` texture retirement are explicitly NOT claimed — both need permitted renderer-wiring slices. No gameplay invented (§9.2 generator-proposes-contract-disposes honored).
