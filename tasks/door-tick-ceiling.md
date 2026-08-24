# Task door-tick-ceiling: the validator stops refusing honest wins — per-contract duration, not a global 18,000 (lane-c, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; **artifacts/gauntlet-heat5-20260824/heat5-note.md §Door findings 1-3 (the measured defects: a Night Shift dawn secure is 22,501 ticks and EVERY honest winning reel is refused by the validator's 18,000-tick ceiling; an explicit-bank Twin Banks win ends at 18,001 and is refused while the silent default at exactly 18,000 passes; pretty-printed reels 413 before validation)**; functions/api/standings.ts (find the durationTicks ceiling and the body-size limit); assets/contracts/ (where a contract's own duration semantics live — night-shift secures at wave 25/DAWN, structurally past 300s); the night-shift winning tape at artifacts/gauntlet-heat5-20260824/e1-night-shift/ (the stranded honest win — your gate resubmits it).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template (ahead content on main = SAFE DUPE → `git checkout -B lane/c main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign edits). FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. `npm install --no-audit --no-fund`; build green.

## Why (heat-5's measured door findings; the owner's launch rides on riders' wins being accepted)
The submission validator caps `durationTicks` at a global 18,000 (300s × 60). Night Shift's own victory condition — survive to DAWN at wave 25 — takes 22,501 ticks at minimum, so the door structurally refuses every honest win on that map. The county must never refuse a win its own contract demands.

## Scope
1. **The ceiling derives from the contract**: each contract's max lawful duration comes from its own semantics (its secure wave × the wave schedule, overtime rules if any) plus an explicit safety margin — read how the sim itself bounds a run and mirror that law; a contract without special semantics keeps the current 18,000 behavior. The +1 boundary (18,001 explicit-bank) is covered by the same derivation — the margin must include the recording seam's final-tick entry (the c-era `durationTicks = max(elapsed, lastEntryTick+1)` law).
2. **The 413**: raise or document — measure the honest ceiling (the accepted Twin reel is 31,318 bytes semantic; pretty-printing tripled it): either a modestly higher body cap with the compact-JSON guidance added to skill.md's submission section (guards re-pinned in-commit), or reject early with a `reel_too_large` message naming the compact form. Prefer the guidance + a named error over a silently bigger cap.
3. **Both backends**: the change flows through the L1 seam; suites extended on both arms.
4. **The gate**: heat-5's stranded night-shift winning tape SUBMITS and reaches `verified` through the local flow (spawn the ledger service + worker locally, or prove via the validator unit + the replay instrument — state which); the twin-banks 18,001 case accepted; an absurd-duration reel still refused.
5. Tests: per-contract ceiling table pinned for the six E1 contracts + night-shift's 22,501 accepted + a beyond-margin refusal.

## Firewall
Touch ONLY: functions/api/standings.ts (the ceiling + size validation), public/skill.md IF guidance lands (+ its guards re-pinned same commit), the suites, BACKLOG row. NO sim changes, no worker changes, no ranking changes.

## Self-check (evidence, not vibes)
tsc + build green; test:stats + standings suites green both arms; the night-shift tape's acceptance proven; skillmd-guard green if touched. End: READY-FOR-GATES + report: the ceiling law as shipped (the per-contract table), the night-shift proof, the 413 disposition.

## No-op / honesty guard
If the ceiling turns out load-bearing for something undocumented (a DoS bound, a replay budget), STOP and name it — the cure must not open an abuse door; the per-contract derivation with margins IS the shape that keeps the bound while honoring the contract's own law.
