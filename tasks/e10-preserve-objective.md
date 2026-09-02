# Task e10-preserve-objective: the Last Claim gets its preserve objective — secure by keeping the vent alight, fail the moment it falls (lane-a, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; `specs/e10-preserve-objective.md` (the slice: the Preserve, the flip, the data, the gate); `specs/epoch-saga/CAPABILITY-LADDER.md` §2 E10 and §4 S3; `assets/contracts/epoch-10-deepsky/contracts.json` (`e10-last-claim`: `twist` is `{}` today, verified 2026-09-02); `src/sim/HeadlessContractSim.ts` (how `twist` flags instantiate systems and how `secured` is decided; grep `secureWave`); the browser's secure decision (grep `secureWave` under `src/game/`); `src/agent/View.ts:151` (`buildView`: the objective must reach the rider as an ADDITIVE view field, per L3); `public/skill.md` (contract briefing text; guards).
SEQUENCING LAW: verify `git log --oneline main | grep -q 'winnability-receipts-and-kit-guard'` (the kit guard must exist so the Preserve contract is checked for winnability on landing); if absent, STOP and report "winnability-receipts-and-kit-guard not landed". Do NOT gate on `git log -N` with a small N.
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (CAPABILITY-LADDER §2: "E10 preserve, don't extract: following a flipped objective over a trained habit"; owner 2026-09-02 "I agree with your design calls")
The Last Claim is the saga's thesis and today it is an empty twist. The flip costs one work, one secure rule and one view field, and it gives the benchmark its most interesting question.

## Scope
1. **Data:** `e10-last-claim` gains `twist.preserve` (work id `warm_vent`, hp, tile anchor), `twist.secureWave`, and an enemy roster from the existing pool; its briefing tells the rider and the player the objective in one sentence (LEXICON-clean, no em-dashes).
2. **Both engines:** the Preserve is placed at contract start as a work the rider cannot build, rebuild, demolish or fund; the Static's siegers target it first; `secured` requires it alive at `secureWave`; its fall ends the ride with reason `preserve_fell`. Headless and browser decide identically (shared code or a shared fixture; prove with one seed in both).
3. **View:** additive fields (`now.preserve: { hp, maxHp, alive }`, `stablePrefix.objective: 'preserve'`), documented in skill.md's view table (view-schema law; bump the version if that guard has landed, else note it for the drain).
4. **Ranking basis:** DO NOT touch `functions/api/standings.ts` (desk Q2 pending); record gold as today.
5. **Tests:** node: the two headless rides of the spec's gate (extract-and-lose vs defend-and-secure) with their hashes; e2e: a plain boot of the Last Claim shows the Preserve and the objective line, desktop + 390px, zero console/page errors; screenshots to `reviews/shots-e10-preserve-objective/`.

## Firewall
Touch ONLY: `assets/contracts/epoch-10-deepsky/contracts.json` (this contract only), the secure-decision sites in `src/sim/HeadlessContractSim.ts` and the browser (named), `src/agent/View.ts` (additive fields only), `public/skill.md` (+ guards), the new tests, BACKLOG row. NO changes to: other contracts, ranking/worker, enemy AI beyond target priority, `assets/engine-era.json` (the drain pins), other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` + `npm run test:stats` green (counts); the two headless rides quoted with outcomes and hashes; the e2e green both projects; every E1 spec named in `e2e/task-025*.spec.ts` unmodified-green (the Claim must not change); zero console/page errors.
End: READY-FOR-GATES + the twist block, the secure-rule diff in both engines, the view fields, the ride outcomes.

## No-op / honesty guard
If the enemy pool has no sieger the Static can wear (name what exists), use the closest existing sieger and file the art as a finding; never block the objective on art (placeholder-first law).
