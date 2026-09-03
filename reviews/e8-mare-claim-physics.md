# e8-mare-claim-physics — drain review (attended, 2026-09-04)

**Slice/branch/tip:** `e8-mare-claim-physics` · `lane/d` · tip `7be55f66e` · base `e1e66d397` · merge `a121c7f14`
**Verdict: MERGED.** Claude implementer (Opus, attended-dispatched after the Fable endpoint overloaded); twelve commits; READY-FOR-GATES with every red attributed.

## What it does
The Mare Claim stops being the Claim in silver. `HeadlessContractSim` composes `E8PhysicsSystem` when the contract declares gravity/atmosphere, mirroring the browser's composition, so a rider's lob arcs scale with the moon's gravity and suit air outside the domes reaches movement and combat. The contract's SECURE now latches on the era mechanic: one regolith ground worked on suit air (published as `now.air.regolith.required = 1`, measured so the secure is reachable from the starting kit; the briefing's six would be unwinnable by construction). Riders see `now.gravity` and `now.air` (additive; documented in skill.md). The honesty guard was answered by reading: `E8PhysicsSystem` touches only vector math, never render state, so no port and no browser change.

## Evidence
| gate | result |
|---|---|
| both-engine hash (`e8-mare-claim-01`, idle) | node `fnv1a32:1a62757f` = chromium module worker `fnv1a32:1a62757f` (w2, 81233 ms, 32 kills) |
| control (`e1-the-claim-01`) | `fnv1a32:e9c32234` both engines, equals the pinned null floor |
| mutation (composition removed) | `fnv1a32:ee2f7c14` = the audit's RESKIN hash and the null floor |
| other E8 maps, both seeds | six hashes byte-identical to `null-floors.json` (untouched, measured) |
| latch A/B (same seed, same orders) | closed: nothing offered at w20, died w27 (`7f2c4650`); open: offered and banked, `secured:true` w20 (`fea8b6d1`) |
| `npx tsc --noEmit` / `npm run build` (merged tree) | see the drain transcript in BACKLOG's SHIPPED row |
| `scripts/e8-mare-claim-physics.test.mjs` | 5/5 on the lane; re-run on the merged tree |
| parity e2e desktop + 390px | 2/2 |
| adjacent E8 e2e (6 specs, both projects) | 40/40 unmodified |
| skill.md + contracts + view-schema guards | 21/21 |
| known red | `agent-view.spec.ts:512` (inventory KNOWN-RED; missing `viewVersion`/`coalSeams`, both from ancestors, not this diff) |

## Merge classification
Base `e1e66d397`. LANE-TOUCHED: `src/sim/HeadlessContractSim.ts` (+119), `src/systems/E8PhysicsSystem.ts` (+229), `src/agent/View.ts` (+84), `public/skill.md`, `scripts/e8-mare-claim-physics.test.mjs` (new), `e2e/e8-mare-claim-physics-parity.spec.ts` (new), evidence. MAIN-MOVED: `package.json` (auto-merged: one battery entry beside main's own), `tasks/BACKLOG.md` (union: the lane's one row prepended; zero markers).

## Findings (the implementer's F-E8MC-1..5, disposition attended)
- **F-E8MC-1 no view-version bump (accepted, documented):** `viewVersion` lives in the era registry the master firewalled, and `view-schema-guard` deep-equals the registry against the canonical Claim view, so contract-scoped fields (`now.preserve` precedent) are unregistered by design; skill.md states the rule. FOLLOW-UP for the view-schema law: contract-scoped extensions need their own registry shape (fire-authorable).
- **F-E8MC-2 the pin:** appended in this drain.
- **F-E8MC-3 cross-runtime hazard (CORRECTIVE OWED):** `src/meta/ContractFamilies.ts:2382` reads `globalThis.location?.search` and `:2416` `window.location.search`; a worker that sets only `window` (what `BrowserAgentTapeWorker.ts:15` does) falls back to the DEFAULT contract: the implementer's worker replay built the Claim's terrain (bounds ±32 vs ±64) for a Mare Claim tape. Whether the county's own browser reel is exposed for non-Claim contracts must be verified with an e2e on the Hill Mine reel before it is called safe. Master: `tasks/reel-contract-routing-hazard.md`.
- **F-E8MC-4 two stale `null-floors.json` rows** for mare-claim (guard is shape-only; nothing reds; refresh with the next floors regeneration).
- **F-E8MC-5** `engineDependencies` stays `missing` for the browser (no atmosphere consumer composed there yet): correct and stated.
- **The scripted floor secure (L2):** not shown: the map's null floor is wave 2 and the secure boundary wave 20; the latch is proven reachable from the starting kit and the secure proven bankable by a harness ride. `e8-mare-claim` remains `unclaimed` until a rider secures it; heat 11 will try.
