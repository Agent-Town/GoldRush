# Review — m4-05 Prospector agent close-out edge-matrix (lane-b → main, s93 drain)

**Verdict: PASS — merged to main.**

Slice: lane-b m4-05 close-out (REFRESHED in s92 `b34e9eb`). The original "suspend-resume run
snapshot" premise was a verified PHANTOM (no run snapshot in RunManager); refreshed to a
SCOPED edge-matrix hardening pass asserting the VERIFIED agent diagnostics surface
(`agent.stub.receiptCount`, `agent.embodiment`, `run.lastRunEndedReason`): death → no orphan
receipts, `resetRun()` clears the Prospector, live per-call permission, victory-pause safety.
The agent-vs-player run-summary STATS half was carved out to ladder item **M4-08** (owner-gated,
needs an `actor` tag on economy events — a design fork).

## Merge mechanics
- Lane branch `lane/m4` @ `525e663`, base `d4cbf60` (s92 lock — fresh, small stale window).
- **Test-only**: a single new file `e2e/m4-05-agent-closeout.spec.ts` (+329). Zero source
  changes → clean graft via `git checkout lane/m4 -- <spec>`. No 3-way needed.

## Evidence (native, scratch port 5233)
- `npx tsc --noEmit`: clean (spec compiles).
- **`e2e/m4-05-agent-closeout.spec.ts` + m4-01 (tool-surface) + m4-06 (embodiment): 24/24**
  desktop + mobile.

## Findings
- **F-1 (non-blocking, NOT introduced by this drain): `e2e/task-027-victory-must-matter.spec.ts`
  fails on main** (2 tests, line 63 `meta.tracks` toMatchObject). **VERIFIED pre-existing** —
  reproduced against the pre-drain main tip `4f6f1c3` with the s93 Game.ts reverted, so neither
  w1-04 nor m4-05 caused it. **Root cause:** the demo-profiles-v2 work moved `META_PROGRESS_KEY`
  ('gr.meta.v1') into `PROFILE_DATA_KEYS`, so meta now persists to the profile-scoped key
  `gr.profile.v2.robin.gr.meta.v1` (`profileDataKey()`), but task-027 line 62 still reads the
  **flat** `localStorage.getItem('gr.meta.v1')` → null → assertion fails. Persistence itself is
  healthy (the UI payout testids +1×4 pass, and the diagnostics assertion `run.meta.tracks` at
  line 64 passes). **Test-only stale-key regression**, same class as the s92 vp-02 fix.
  Corrected separately this fire (see follow-up commit).
