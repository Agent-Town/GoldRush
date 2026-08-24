# door-tick-ceiling — STOPPED at the firewall (fire s2279)

**Slice:** `door-tick-ceiling` · **branch:** `lane/c` · **lane state at drain:** `ahead=0 behind=8`, tracked-dirt 0, untracked 0 · **merge:** NONE — nothing shipped, and that is the correct outcome.

## Verdict

**STOPPED, NOT FAILED — and not a Silent No-Op.** The runner discovered that the defect it was sent to cure is enforced in a **second** place its firewall did not include, measured that the master's own acceptance gate was therefore unsatisfiable within scope, **reverted its provisional implementation rather than ship a partial fix that would pass a narrower gate**, and left the lane clean with the finding written down. That is a firewall working exactly as designed (CLAUDE.md §4.5: *"Codex reporting adjacent problems = good; fixing out of scope = violation"*). The zero diff has its WHY on the record, which is what Mistake #1 actually demands.

## What was found

The 18,000-tick ceiling has **two independent enforcement points**, and `door-tick-ceiling`'s TOUCH-ONLY named only the first:

1. `functions/api/standings.ts` — the submission validator's `durationTicks` cap. **In scope**, and the runner had it provisionally widened.
2. `src/playbook/PlaybookFormat.ts:11` — `export const MAX_PLAYBOOK_TICKS = 18_000`, the ten-minute playbook/replay bound, enforced in `validatePlaybook` at `:90`. **Explicitly out of scope** — the master's firewall reads `NO sim changes`.

`src/game/RunTape.ts:324` (`validateRunTape`) delegates to `validatePlaybook`, and `scripts/assay-replay-agent.mjs` calls `validateRunTape` before replay. So the master's stated gate — *"heat-5's stranded night-shift winning tape SUBMITS and reaches `verified`"* — could not be met however correctly the standings validator was widened.

## Evidence — re-measured this fire, not inherited (Mistake #4)

Every element of the runner's claim was independently reproduced before the STOP was accepted:

| claim | verification | result |
|---|---|---|
| `MAX_PLAYBOOK_TICKS = 18_000` exists at `PlaybookFormat.ts:11` | `grep -n` | ✓ confirmed, line 11 |
| it rejects oversized durations | `grep -n` | ✓ `:90`, `durationTicks > MAX_PLAYBOOK_TICKS` → reject |
| `RunTape.validateRunTape` delegates to it | `grep -n` | ✓ `:324` calls `validatePlaybook(value.inputLog)` |
| the stranded tape is 22,501 ticks | read the artifact | ✓ `"durationTicks": 22501` |
| the replay instrument refuses it | ran it | ✓ `assay replay failed: malformed tape` |

The lane really is clean — `lane-usable lane-c` reports `ahead=0`, tracked-dirt 0, untracked 0 — so the revert was complete and no partial cure is stranded anywhere.

## Findings

**F-2279-4 — the ceiling is a TWO-SITE law, and every future cure must treat it as one.** A per-contract duration ceiling that widens only `functions/api/standings.ts` produces a submission the county will *accept* and its own assayer will then *refuse* as a malformed tape — arguably worse than today's honest refusal, because the rejection moves from the door to the audit and the rider is told their winning reel is malformed. The two sites must move together or not at all.

⚠️ **Consequence for the owner's desk, stated plainly: F-2276-1 is NOT cured and the launch-week blocker stands.** The `door-tick-ceiling` corrective was dispatched attended at 19:57 as the (b) per-contract cure; it has not landed, and the reason is scope, not difficulty.

**The DoS bound is real and must survive the cure.** `MAX_PLAYBOOK_TICKS` is the browser playbook recorder's ten-minute bound, not decoration. The master already anticipated exactly this — *"If the ceiling turns out load-bearing for something undocumented (a DoS bound, a replay budget), STOP and name it — the cure must not open an abuse door; the per-contract derivation with margins IS the shape that keeps the bound while honoring the contract's own law"* — so the successor is a **lift of the same ruling to a second file**, not a new design question. No owner fork is created by this stop.

## Disposition

Re-authored this fire as `door-tick-ceiling-v2` with the firewall lifted to include the shared validator and its tests, per the standing "firewall STOP → re-author with lift" precedent. The runner's own session note is preserved at `~/Obsidian/Brain/Sessions/codex/2026-08-24-Gold-Rush-door-tick-ceiling-blocked-by-replay-cap.md`. Done-move marked `stopped-`, not `drained-`.
