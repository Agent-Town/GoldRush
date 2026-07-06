# Review — SCI-04 contract-family registry (the epoch socket)

**Slice:** lane-a SCI-04 (branch `lane/m3`, tip `1a32a79`) → merged to main
**Fire:** s91 (2026-07-06T17:xxZ)
**Verdict:** PASS — merged.

## What it does
Builds the epoch **socket**: a versioned bundle folder shape (`assets/contracts/<epoch-id>/manifest.json`) + registry loaders (`listEpochs()` / `loadEpoch(id)`) in the EXISTING `src/meta/ContractFamilies.ts`. Routes SCI-02's direct `families.json` read through `loadEpoch('epoch-1-frontier')` (behaviour-preserving substitution). Adds a content-less `epoch-2-steamworks/` locked stub manifest to prove the socket loads a second epoch with ZERO engine change. Pure plumbing — no new cards/stats/offers.

## Evidence (native, full runs on the merged tree)
- `npx tsc --noEmit`: clean.
- `npm run build`: green (pre-existing chunk-size warning only).
- e2e **38 passed** desktop+mobile (`--workers=2`, 2.5m), zero console/page errors:
  - `sci-04-contract-registry.spec.ts` — lists Frontier + locked Steamworks in order; Frontier routing preserves gated Arsenal offers; locked Steamworks stub loads without changing fresh offers.
  - Regression byte-identical: `sci-02-families-mastery` (proves epoch-1 routing unchanged), `sci-01-research-loop`, `m1-06-level-up-choices` (offer pool), `m1-01-claim-jumpers-death`, `m2-01-build-menu`.

## Merge classification
Base `702e623`. Of the 8 lane files, only `src/vite-env.d.ts` also moved on main since base (known additive-collision file) — git auto-merged it cleanly (both hunks additive: `GrContractEpochMeta/Bundle` types + `__GR_CONTRACT_REGISTRY__` debug hook). All other files LANE-TOUCHED only → clean apply. Firewall respected: touches only `assets/contracts/**`, `src/meta/ContractFamilies.ts`, `src/meta/ResearchTree.ts` (reads Steamworks threshold from manifest), `src/game/Upgrades.ts` (routes through loadEpoch), `src/vite-env.d.ts`, `e2e/`, `specs/science-dimension/README.md`. No epoch-1 content change; epoch-2 stub is data-only/locked/empty.

## Findings
None blocking. Socket proof confirmed: adding epoch-2 required data + registry only, zero engine-code edits.
