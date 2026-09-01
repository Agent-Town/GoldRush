# Task probe-rows-unranked: the county's own smoke tests do not outrank riders (lane-c, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.

READ FIRST: AGENTS.md; `functions/api/standings.ts` (`isRankedRow` ~`:812`, `boardRow`, `rankedRows`, the store path); the live evidence: the era-5 Claim board carries `#3 Heat 8 Era Probe` and `#4 Heat 9 R2 Era Probe` — both `harness: operator-probe`, the heats' mandatory skew probes — ranked ABOVE OMP, PI, OpenClaw and Prime, real riders (query it yourself: `curl 'https://agenttown.app/api/standings?epoch=epoch-1-frontier&contract=the-claim'`).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe (ahead content on main = SAFE DUPE → `git checkout -B lane/c main && git clean -fd`, PROCEED; STOP on unmerged ahead content or foreign edits). **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1)** and **FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — always expected, never a STOP; list and proceed.** Still-STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. Then `npm ci`; `npm run build` green.

## Why (pre-release: a public board must show riders, not the county's pipeline checks)
Every heat submits a deterministic probe to prove production + assayer parity before riders ride. Those probes are honest (`harness: operator-probe`, declared) and must keep verifying end-to-end — but they are not standings. Today they rank, pushing real riders down the public board.

## Scope
1. **The probe law, read-side and non-destructive**: rows whose declared `stack.harness === 'operator-probe'` are NEVER ranked (excluded from the ranked board and rank minting, like retired rows) but stay stored and keep their assay verdicts — the probe's value is the verdict, not the rank. The board response gains `probeCount` beside `retiredCount`/`rejectedCount`.
2. **Coherence**: the WATCH projection still serves a probe reel by id (they are honest replayable rides); the verdict endpoint still answers for them. Nothing else about probes changes.
3. **Tests**: both storage arms — a probe row verifies, stays in storage, never ranks, `probeCount` counts it; the existing Claim board fixture shape (real riders below probes) re-ranks correctly (OMP/PI/OpenClaw/Prime move up).
4. **skill.md**: one sentence in the submission section: rows declaring `harness: operator-probe` are verified but never ranked; re-pin guards.

## Firewall
Touch ONLY: `functions/api/standings.ts` (ranked/read path + `probeCount`), its suites, `public/skill.md` (+ guards), BACKLOG row. NO write-path changes, NO UI, NO worker.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:stats` green both arms (counts); zero console errors on a plain boot. Report: the diff, the re-ranked Claim board as measured against the live-shaped fixture.
End: READY-FOR-GATES + the above.

## No-op / honesty guard
If you exit without changes, WRITE WHY first. Never delete or rewrite a stored probe row — retention law.
