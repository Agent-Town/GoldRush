# Task bt-04b-automation-two-params: the two forks that ARE parameters — repair threshold + idle definition (lane-a, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; **the F-2261-1 row in tasks/BACKLOG.md (CITED BY CONTENT: grep the finding id — it is this master's charter: your predecessor STOPPED because the v1 master applied the owner's parameters ruling to forks that are not parameters; the drain re-derived all three claims and prescribed THIS width)**; the F-1313-2 row (the four forks' original text); src/agent/AgentConsent.ts:30 (`AgentConsentFutureState` — the persistence type F-2261-1 measured as the law) + src/game/RunSuspend.ts:710-713 (`captureAgent` — its capture site); the automation panel component + the repair loop (the v1 master `tasks/bt-04-homestead-automation.md` maps them); specs/building-tiers/README.md (Law 4 — the balance constraint that keeps fork 3 OUT).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): changes confined to `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` are NEVER a STOP — list and proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (owner ruling 2026-08-23 "Defaults now, tune later", applied at the width F-2261-1 measured it actually covers)
Forks (1) and (2) of F-1313-2 are genuine parameters and get implementer defaults per the ruling. Forks (3) (autonomous gold engine — a BALANCE ruling per BT's own Law 4) and (4) (side-effect consent semantics — the open F-1313-3 owner question) are NOT parameters and are OUT OF SCOPE ENTIRELY: do not build, default, stub, or mention them in UI. The v1 master died on exactly that boundary; this one draws it in ink.

## Scope
1. **Fork (1) — auto-repair-under X%**: the loop repairs only when a work's hp fraction is below the threshold. Default **60** (the door's own prover uses `REPAIR_UNDER pct:60` — cite it at the constant). Balance carries the constant; the automation panel gains the numeric control beside its existing repair checkbox, in the panel's own idiom.
2. **Fork (2) — the idle definition**: the constant that decides when the automation acts (per F-1313-2's own fork text — read it and honor its framing). Default justified from the loop's measured cadence, one-line comment at the declaration.
3. **Persistence, lawfully this time**: extend `AgentConsentFutureState` (AgentConsent.ts:30) with the two numeric fields and carry them through `captureAgent` (RunSuspend.ts:710-713) — the exact seam F-2261-1 named. Absent fields default (old saves stay valid — additive, never breaking).
4. Tests: both thresholds' boundary behavior; a suspend/restore roundtrip proving the tunables persist; the panel edit reflected in the loop within one sim tick.
5. Floors/pins unmoved (`node scripts/null-floor-anchors.mjs --check` clean); if automation constants leak into headless outcomes, STOP and report the coupling.

## Firewall
Touch ONLY: the automation panel component, the repair/automation loop, Balance (TWO constants), src/agent/AgentConsent.ts (the type, additive fields only), src/game/RunSuspend.ts (captureAgent, the two fields only), the new tests, BACKLOG row. NO changes to: anything serving forks (3)/(4) — no gold-engine automation, no side-effect consent logic, no ToolSurface.ts; sim determinism surfaces; existing e2e assertions.

## Self-check (evidence, not vibes)
tsc + `npm run build` green; new tests green both projects; run-suspend suite unmodified-green (you touched its capture — prove no regression); panel visible + operable in a plain no-debug boot (screenshots desktop + 390px to `reviews/shots-bt04b/`); floors `--check` clean. End: READY-FOR-GATES + report: the two defaults with justifications, the persistence roundtrip proof, the explicit confirmation that forks (3)/(4) appear NOWHERE.

## No-op / honesty guard
If either fork turns out to be already ruled or shipped somewhere newer (grep first), follow that and cite it. If the persistence seam demands more than the two additive fields, STOP and report — never widen beyond the named files.
