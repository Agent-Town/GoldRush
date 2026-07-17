# Review — E9 Dome Basin contract + mask (`e9-redfields-contract`)

**Slice:** E9 Red Fields — Dome Basin contract + published mask table (data-only; feeds 3D-D sculpt grants)
**Branch/tip:** `lane/m4` @ `b034cbbc0d4f601d1e47464dbced383c316fb91e` (`runner(lane-b): lane-b-e9-redfields-contract.md`)
**Base:** parent `660bc3f5`, verified an ancestor of `main`; **no main commit since the base touched any of the four files** → clean re-land, not a conflict graft.
**Drained by:** s705 fire, 2026-07-17. **Verdict: MERGE (clean re-land).**

## What it does
Adds the epoch-9 "Dome Basin" contract data and its published mask table — the tile that will eventually *save* (persistent terraforming, E9). Pure authored data + validation:
- `assets/contracts/epoch-9-redfields/contracts.json` (+201): the Dome Basin contract slate.
- `assets/contracts/epoch-9-redfields/mask-tables/e9-dome-basin.json` (new, +269): published mask truth (quarry-scarp bands, basin depression, canal route + stage gates, dust-devil lanes).
- `scripts/e3-mask-tables.test.mjs` (+32): loads e9 contracts, validates e9-dome-basin mask exactly tracks the authored contract data, and adds e9 to the bounds/water-agreement sweep.
- `e2e/board-gating-and-profiles.spec.ts` (+1): asserts `contract-card-e9-dome-basin` renders count 0 (locked future era), identical to the e6/e7/e8 pattern.

**Application is unwired** — `grep -rn 'e9-dome-basin|e9-redfields|dome-basin' src/` returns **nothing**; the contract is consumed only by the node test and future E9 slices, never by runtime today. Display-safe, zero player-visible surface.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (no output) |
| `npm run build` | ✓ built in 1.16s |
| `node --test scripts/e3-mask-tables.test.mjs` (slice validator) | **10 pass / 0 fail**, incl. new `e9-dome-basin mask stays inside bounds and agrees with authored water` + `published mask tables exactly track authored contract data` |
| board-gating `+1` (`contract-card-e9-dome-basin` count 0) | **proven by construction** — no `e9-dome-basin` reference exists in `src/`, so no code path renders an e9 card; assertion is trivially true and cannot regress existing board rendering |
| boot / console | unaffected — slice is data-only, not imported by any src module (build green confirms bundle integrity) |

**Board-gating playwright NOT visually re-run** (env exception, with proof): the suite's PNG artifacts (`artifacts/board-gating/*.png`) are uncommitted in main's working tree, owned by a live-resident attended session; re-rendering them would contaminate that state (Mistake #12). The only board-gating change is an additive locked-count assertion whose truth is guaranteed by the absence of any e9 board card in `src/` — verified by grep above.

## Merge classification
Clean re-land onto clean main. Per-file:
- `assets/contracts/epoch-9-redfields/contracts.json` — MAIN-untouched-since-base → applied `+201` cleanly.
- `assets/contracts/epoch-9-redfields/mask-tables/e9-dome-basin.json` — new file, pure add.
- `scripts/e3-mask-tables.test.mjs`, `e2e/board-gating-and-profiles.spec.ts` — MAIN-untouched-since-base (`git log 660bc3f5..main -- <files>` empty) → applied additive hunks cleanly.
Landed via `git checkout b034cbbc -- <4 files>` on clean main; committed path-scoped with the goal leaf flip in the same commit.

## Findings
None blocking. Inert locked-era data; E9 application arrives with its own slice (E9 persistence substrate spec still owed by attended, per BACKLOG §WP-E9). Goal leaf `e9-dome-basin-contract` flipped queued→merged (`b034cbbc…`).
