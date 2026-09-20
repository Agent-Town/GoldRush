# mp-06-party-overview — THE RIDERS' ROSTER (party overview + rider glance)

- **Slice:** `lane-mp-06-party-overview` (master `tasks/lane-mp-06-party-overview.md`)
- **Branch / tip:** `lane/a` @ `61e9bc8f`
- **Base:** `faf97925` (main at merge time; lane cut from ee777a1c, fast-forward-clean)
- **Drained by:** attended, 2026-08-04 ~17:30 (owner-priority: "I want to try it")

## Verdict
**MERGE.** Own spec green on the merged tree; the one adjacent red is control-proven pre-existing on clean main with an already-ledgered fingerprint.

## What it does
Owner directive verbatim in the master. During a co-op run (2+ riders) a compact roster strip renders: one card per rider — name (existing chip source), live HP bar — plus the party's gold shown ONCE, because the implementer read the economy truth rather than guessing: **co-op gold is one shared `Economy.gold` pot** (mp-r3's reality; shared-credit ruling). Self is listed first and visually distinct. Clicking a card eases the LOCAL camera to that rider and follows; own movement, Escape, second click, or touching the touch-stick returns it. Zero new network traffic (lockstep already replicates all rider state), zero sim bytes, camera per-player local (MP-03 law). Solo runs render nothing. No species/agent markers (owner ruling: "the user already knows whom they share their code with").

## Evidence
| Gate | Result |
|---|---|
| tsc --noEmit (merged gate tree) | clean |
| `mp-06-party-overview.spec.ts` (merged tree, workers=1) | **4/4 green desktop** (lane run: 4/4 both projects) |
| `mp-02-lockstep.spec.ts` (merged tree, workers=1) | 11 passed · 1 failed `:638` · 1 downstream skipped |
| `:638` solo on merged tree | red (deterministic) |
| `:638` solo on **clean main** (detached worktree `gr-mp06-base` @ faf97925) | **red, identical** — `TimeoutError: page.waitForFunction 15000ms` |
| Zero console/page errors | asserted inside both suites' passing tests |
| Screenshots | `reviews/shots-mp-06/desktop-chrome-roster-mid-glance.png` + `mobile-chrome-roster-mid-glance.png` (from the lane's gated run) |

## Merge classification
Fast-forward-clean 3-way; sole conflict `tasks/BACKLOG.md` (append-only ledger) — union-resolved keeping both sides, verified marker-free. All 8 code files PURE LANE-TOUCHED (`src/ui/PartyOverview.ts` new +130, `Game.ts` hook, camera controllers additive, own e2e).

## Findings
- **F-MP06-1 (non-blocking, pre-existing, ALREADY LEDGERED):** `mp-02:638` (town Ride Together join, 4 riders) times out at a 15s `waitForFunction` on clean main — the same fingerprint the s-series fire filed as "real, deterministic, isolated; cannot exclude that 15s is simply short on this machine; NOT fire-fixable blind; next actor: attended with eyes on the relay handshake." The earlier "mp-02 fully green at low load" ledger line OVERSTATED: `:638` sat behind the `:417` zip-thrash failure in that run's order and never executed. Corrected here. Production-relay health probed separately at drain time (see BACKLOG same commit).
- **F-MP06-2 (debt, named):** roster shows the shared pot only; per-rider contribution would need new sim accounting — deliberately NOT invented (master's own firewall). If the owner wants per-rider earnings on the cards, that's a sim-side slice with its own determinism gate.
