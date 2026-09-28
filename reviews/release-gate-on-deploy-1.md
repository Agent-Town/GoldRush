# Drain review: `release-gate-on-deploy-1`, the E1 bundle stops carrying the E4 hauler and the release assertion runs on every production deploy (Opus implementer; the outside review of 2026-09-24: BUILD-1, F-SEF2-2, F-SEF2-3)

**Branch** `fix/release-gate-on-deploy-1` at `322d338e6` (six path-scoped commits) · **merge** `459c21394` · same-era pin #58 `6a337525` · drained attended 2026-09-24 08:12Z in a detached chain worktree with the scratch store at `5793a96`.

**Verdict: LANDED.**

### What it does
The motor hauler's body left the E1 bundle: the static `new URL(…motor-hauler.glb…)` in `src/entities/Vehicle.ts` became a lazy `?url` glob that the release plugin already narrows (the implementer measured first that a `__GR_RELEASE_E1__` ternary does NOT keep the asset out, because Vite emits assets in its transform hook before dead branches fold); the full build still loads the hauler on the Long Road (the three plain-boot hauler rows green on both projects). `scripts/deploy.sh` now runs `scripts/assert-release-build.mjs` after the build with the same abort shape, so a later-era leak stops a production deploy instead of shipping. The release suite's two first-player reds were a stale approach point: Dry Gulch gained authored `harvestAnchors` in `7c2744e5a` (2026-09-12) and the third seam moved from x −1.5 to x −5.5, 3.0 m from where the test parked the hero against a 1.6 m channel range; the test now walks to the seam where it is. The F-PERFC-1 ledger rows cite the deploy line the build call sits on. Where the player sees it: nowhere new by design; the E1 download shrinks by the hauler body, and the door that keeps later eras out is finally on the path production walks.

### The drain's own cure
**F-RGD-1.** With the hauler gone, `assert-release-build.mjs` stopped at its next line: the Claim Jumper's EAST walk plate `char-jumper-e4-codex-v1-r*c*` ("e4" = east, four cells, the owner's naming of 2026-09-19) matched the era token. The drain excuses compass-token sprite plates by their exact shape (`<stem>-<n|e|s|w|ne|nw|se|sw><4|8>-codex-v<n>[-r<row>c<col>]`) and nothing else; `npm run build:release` is green on the merged tree, so the deploy this landing makes is the first to pass the assertion live.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34341349 bytes` |
| strict release build (the assertion) | `rc=0 [release-build] E1-only: 1126 files, 97650548 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` · hauler files in the E1 dist: 0 (want 0) |
| engine hash | `6a33752598ba8c5a…`; same-era pin #58 `6a337525`, era guards in the chain `ℹ pass 9 ℹ fail 0 ` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (308.0s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards (skill.md, same-game audit, view schema, gate callers, citations, no-emdash, deploy budget, deploy mirror, claimed specs) | `ℹ pass 136 ℹ fail 0 ` |
| the release suite under its own harness (both projects) | `rc=0   30 passed (2.2m) ` |
| e2e both projects, `--workers=1` (the Long Road, m2-01, task-025, the agent view) | `rc=1   2 failed   42 passed (3.6m)  08:04Z`; the one known row is `e4-roads-and-convoys.spec.ts:69` (F-OMA-5, the malformed pre-ADR-005 tape, red on main) |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 958 ℹ pass 950 ℹ fail 3 ℹ skipped 5  08:12Z` (the registry rows are the pre-pin hash class; the fixture sweep is the load class) |

### Merge classification
Code: `src/entities/Vehicle.ts` (the lazy glob and the placeholder chassis), `scripts/deploy.sh` (the assertion after the build), `e2e/release-build.spec.ts` (the approach point), `scripts/assert-release-build.mjs` (the drain's F-RGD-1 cure), `tasks/BACKLOG.md` (the F-PERFC-1 citations), `artifacts/release-gate-on-deploy-1/**` (the implementer's report, the control transcript and a self-contained release-suite harness config it used to measure a tree whose strict build was red). No contract, sim rule, collision, floor or store change.

### Findings
- **F-RGD-1 (cured here):** the compass-token false positive above; the assertion's era pattern needed the plate shape excused, not loosened.
- **F-RGD-2 (closed the same day, attended: a presence row in `scripts/deploy-budget.test.mjs`):** nothing pins `scripts/assert-release-build.mjs` as present the way `deploy-budget.test.mjs` pins the payload script; deleting it would silently un-assert the deploy. One guard row.
- **F-RGD-3 (closed the same day, attended: the citation re-based to the test title):** `reviews/sol-phone-hud-entry.md` cites the release spec's channeling poll at a line that moved with this landing; the F-HUD-3 note there is root-caused as a stale coordinate.
- **F-SEF2-3 (closed):** the harvest reds were the test, not the build.
