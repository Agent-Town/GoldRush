# same-laws-harvest-parity — drain review (attended, 2026-09-02)

**Slice/branch/tip:** `same-laws-harvest-parity` · `lane/d` · tip `f1a6d0d75` · base `9d0b7cf7c` · merge `9e5d0636d`
**Verdict: MERGED.** Owner playtest 16, both rulings verbatim in `specs/epoch-saga/CAPABILITY-LADDER.md` L7: "The laws for human and AI players have to be the same." then "It is ok that the Prospector can do that - it just has to work for the human, too."

## What it does
The player gets the rider's command. Selecting the Prospector (click, or `G`) and clicking a seam or sluice (touch: tap-hold) dispatches the Prospector through the SAME `pan_at` path a rider's HARVEST order uses: travel to `arriveRadius`, then one pan tick. The dispatch is a semantic input in the human tape (`prospector_dispatch`, `src/game/RunTape.ts`), so human tapes carrying it replay to the same event-log hash on the county's iron. A first-time trail-guide line teaches it; the encyclopedia and `public/skill.md` say the Prospector serves both species. Nothing in the simulation changed: `HeadlessContractSim.ts`, `StandingOrders.ts`, `HarvestSystem.ts`, `Balance.ts` are untouched (diff verified empty), so no era bump: the content re-hash is pinned in era 5 (`91c43545`).

## Evidence (merged tree, node 23/26 as noted)
| gate | result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0 |
| `e2e/same-laws-harvest-parity.spec.ts` + `tape-02-lantern-show` + `reel-deep-links` + `agent-seat`, `--workers=1`, both projects | 13 passed, 1 skipped, rc 0; the plain-boot probe (no `?debug`) reaches the command with a clean console |
| `node --test scripts/same-laws-harvest-parity.test.mjs` (lane) | 1/1 |
| `npm run test:stats` (lane) | rc 0 (87 + 194 + 194 + 19 checks) |
| `node scripts/run-guards.mjs --changed-since 9d0b7cf7c` | rc 1 on the first pass: era pin (cured in this drain), law-pointer drift `fire.md → Game.ts:2495` (re-based to `:2507`, baseline updated), and the `node-guards-timeout` self-test cancelling under the attended shell's node 23 (environmental; see the re-run line below) |
| `scripts/engine-era-guard.test.mjs` after the pin | 5/5 |
| parity (seed `same-laws-harvest-parity`, `the-claim`, `gold-seam-1`, both projects) | player dispatch vs rider HARVEST: tick 1 at 1.867 s in both arms, tick 2 at 1.900 s in both arms, 5 gold each, seam 30 → 20 in both |
| replay proof | `prospector_dispatch` ×2 recorded; `scripts/assay-replay.mjs` slip `fnv1a32:a6c04f80`, 601 ticks, equals the tape's own hash |
| screenshots | `reviews/shots-same-laws-harvest-parity/{desktop,mobile}-chrome.png` |

Adjacent reds attributed on the lane (agent battery): `pb02-replay-actor:78` = documented stable main red (`reviews/agent-reels-2.md:55`); `agent-seat` desktop room-open timeout = load, re-run alone 1 passed (and green again in this drain's battery); `c7-standing-order-replay` both projects = pre-existing since `ecc2a1a1b` (2026-08-30), filed below.

## Merge classification
Base `9d0b7cf7c`. LANE-TOUCHED (clean apply): `src/game/Game.ts`, `src/game/RunTape.ts`, `src/mp/LockstepClient.ts`, `src/ui/Hud.ts`, `src/ui/ProspectorDispatchInput.ts` (new), `src/ui/WorldInfoNotes.ts`, `src/ui/theme.css`, `src/story/trailGuide.ts`, `src/encyclopedia/registry.ts`, `public/skill.md`, `package.json` (one token: the new node test wired into `test:node-guards`, demanded by gate-caller-audit; outside the master's touch-only list, accepted), `e2e/same-laws-harvest-parity.spec.ts` (new), `scripts/same-laws-harvest-parity.test.mjs` (new), evidence dirs. MAIN-MOVED: `tasks/BACKLOG.md` (conflict at the top; resolved as main's ledger with the lane's edited F-PT16-1 row swapped in; zero markers).

## Findings
- **F-SLHP-1 (non-blocking, accepted):** in the browser the rider's arrival→pan delay depends on the diagnostics publish cadence (1–5 ticks); the player's fixed 4-tick settle matches it exactly under the gate harness and may land ≤0.13 s later in live play. Same gold, same count, same travel. Accept; revisit only if a rider ever measures an edge.
- **F-SLHP-2 (pre-existing, filed):** human tapes that carry standing orders route to the true reel (`Game.ts` watch path) which refuses unstamped meta, so they cannot be watched; present since `ecc2a1a1b`. Corrective owed: a master that stamps human standing-order tapes or routes them to the tape show. FIRE-AUTHORABLE.
- **Provenance:** the codex run (`20260902-160427`) implemented most of the slice and died at rc1 when its login token was invalidated during its gate; a Claude implementer finished it on the same lane (three commits). The first dispatch of a differently-scoped master under this filename was stopped at rc143 before editing.
