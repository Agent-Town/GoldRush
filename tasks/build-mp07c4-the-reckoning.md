# Task build-mp07c4-the-reckoning: MP-07c-4 standings/tape recording for agent-ridden co-op (lane-b, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; **`specs/multiplayer/mp-07c-agent-rides-the-browsers-world.md`** — the RATIFIED spec; implement its **MP-07c-4 "THE RECKONING"** slice (its "ANSWERS (owner, 2026-08-09)" section unblocks it — read those rulings and honor them verbatim). Also: `specs/agent-play/README.md` (AP-06 honesty / stack-declaration law), `functions/api/_multiplayer.ts` (the room + its standing path), `src/mp/LockstepClient.ts` / `src/mp/AgentRiderBody.ts` / `src/mp/RideTogether.ts` (the merged 07c-1/2/3 plumbing this builds on), and how a single-player standing declares its stack today (for parity).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already on main (verify git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main, or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to `artifacts/**`/`reviews/shots-*`/`.png` are NEVER work and NEVER a STOP — discard and PROCEED. Then `npm install --no-audit --no-fund`; `npm run build` green. Cleanliness line with the FACTORY-CHURN EXCEPTION (F-1407-1): `git -C worktrees/lane-b status --short` clean except (a) `logs/**`; (b) `artifacts/**`/`reviews/shots-*`/`.png` — list and proceed; what STOPs: modified tracked `src/**`,`scripts/**`,`e2e/**`,`tasks/**`,`specs/**`,`reviews/*.md`.

## Why
MP-07c ("agent rides the browser world") is 75% shipped — 07c-1 (order channel + embodied `AgentRiderBody`), 07c-2 (view wire), 07c-3 (the Invitation panel seats an agent) are ALL merged. Only 07c-4 THE RECKONING remains, and the owner unblocked it 2026-08-09 (the leaf's "owner-gated on F-1553-2" label is STALE — the spec's ANSWERS section makes it fire-authorable). Owner wants to ride a claim with an AI agent; this makes a mixed human+AI run RECORD honestly.

## Scope (implement the spec's MP-07c-4 slice — do NOT invent beyond it)
1. **Stack declaration on the room's standing (AP-06 honesty):** when a co-op run has agent rider(s), the standing row it produces carries the DECLARED STACK (which model×harness agent(s) rode), exactly as AP-06 requires a single-player agent standing to declare its stack. Mirror the existing single-player declaration path — do not invent a new schema.
2. **Scout-mode retirement path** in MP-07a's strict/benchmark lane, per the spec's slice text + the owner's 2026-08-09 answers.
3. Honor the owner's ANSWERS verbatim (e.g. mixed-team standings "Counts like any secure"): a mixed ride's secure counts like any secure, carrying the declared stack.

## Firewall
Touch ONLY: the MP standing/recording path (`functions/api/_multiplayer.ts` + whatever room-standing module it calls), the tape/almanac recording for a mixed run, and the AP-06 declaration wiring — plus the MP e2e/`test:mp` specs to ADD coverage.
NO changes to: the merged 07c-1/2/3 lockstep/gameplay/rider plumbing (build ON it, don't reshape); benchmark (agents-only) room behavior (must be UNAFFECTED — assert it); single-player standings; any non-MP standings; gameplay balance; existing e2e assertions.

## Self-check
tsc + `npm run build` green. `npm run test:mp` green (report the check count). A NEW test proves: a mixed (host + seated agent) ride's standing row carries the declared stack; an agents-only benchmark room's standing is byte-unchanged from before this slice. `npm run test:node-guards` green. Adjacent MP + AP-06 specs green desktop+mobile. Zero console/page errors on a plain boot.
End: READY-FOR-GATES + report: the mixed-ride standing declaration proven, the benchmark-room-unaffected proof, and `test:mp` count.

## No-op / honesty guard
If the recording path already declares the stack for mixed rides (a predecessor did it), WRITE WHY and stop. Do NOT touch the gameplay plumbing to force a test green — the RECKONING is recording only.
