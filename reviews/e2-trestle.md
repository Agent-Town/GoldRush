# Review — e2-drip-01-trestle (The Trestle: E2's second contract)

- **Slice:** e2-drip-01-trestle (lane-c #2)
- **Branch/tip:** lane/e2-arsenal `136a05bb` (runner commit), base `dd3b888c`
- **Drained by:** s474 fire, 2026-07-14
- **Verdict:** MERGE — path-scoped, deliverables only.

## What it does
Adds E2's second playable contract, **The Trestle**, so the owner can "play the other levels of E2" (owner directive 2026-07-13, quoted in the master). Previously E2 shipped ONE contract (e2-hill-mine). The Trestle:
- Appears on the town contract board (page dot `contract-page-dot-e2-trestle`, card, launch button) reached by PLAIN in-town navigation — walk to the tavern, open the board. No `?debug` (Mistake #10 satisfied; the boot/board path is exercised by `e2e/e2-trestle.spec.ts`).
- Unlocks via `secured:e2-hill-mine` (a new `contractUnlock` gate in `TownScene.ts`): the card is locked with "Secure The Hill Mine first" until a profile holds a secured hill-mine score, then Launch enables.
- Carries a `mode` query-param on launch (new `data-contract-mode` wiring in `TownScene.ts` → `history.replaceState`).
- Is a new additive `e2-trestle` entry in `assets/contracts/epoch-2-steamworks/contracts.json` (trestle-gorge biome, river+ford, two boiler approach sites, rails + mine-spur, elevation table). Board art reuses the shipped `contract-the-claim` plate — no new art dependency.
- Runs the SHIPPED rail follower, ore-cart escort, E2 enemy trio, and component railcar boss. **No new mechanic or art surface.**

## Evidence (re-run this fire, scratch port 5199, BOTH projects)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (735ms; TownScene 74.16 kB) |
| `e2e/e2-trestle.spec.ts` | PASS desktop + mobile |
| `e2e/e2-hill-mine.spec.ts` (adjacent, unmodified) | 14 passed / 2 skipped both projects (combined battery) |
| `e2e/_s106-prospector-boot-probe.spec.ts` | 2 passed, zero console/page errors desktop + 390px |

## Merge classification
Lane cut from stale base `dd3b888c` (pre-s473). Main is UNCHANGED on all three code paths since that base (`git diff dd3b888c main -- src/town/TownScene.ts assets/contracts/.../contracts.json e2e/e2-trestle.spec.ts` = empty) → clean full-file checkout equals the lane's intended change exactly.
- **MERGED (deliverables):** `src/town/TownScene.ts` (LANE-TOUCHED, additive contractUnlock + contract-mode), `e2e/e2-trestle.spec.ts` (NEW), `assets/contracts/epoch-2-steamworks/contracts.json` (additive `e2-trestle` entry, base+207), `artifacts/e2-trestle/*` (evidence).
- **EXCLUDED (stale lane reverts — NOT merged):** the lane commit also swept `STATUS.md` (s471-era) and `tasks/e2-drip-01-trestle.md` + `tasks/ledger-era-chapters.md` — the latter two REVERT s473's effort-flag fix (`ba02ea48`, CODEX directive moved to its own col-0 line). Kept main's versions; these are not deliverables.

## Findings
- **F-1 (non-blocking, honest scope):** the two boiler approach sites are authored/visible as claim-post anchors, but the pressure resource + `boiler_house` availability remain hard-coded to `e2-hill-mine` in `Game.ts`. Making pressure gameplay LIVE on The Trestle needs an engine-generalization slice; this master explicitly forbade engine/mechanic changes. The contract is fully playable without it (rail/escort/enemies/boss). Reported by the runner, corroborated. No corrective spawned — awaits the owner-gated engine slice, noted for the e2-drip ladder.
