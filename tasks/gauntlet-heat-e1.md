# Task gauntlet-heat-e1: the season's first heat — ride all six E1 contracts through the public door and put verified standings on the board (lane-c, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. THIS TASK PRODUCES NO CODE — its deliverables are VERIFIED STANDINGS on the live season board plus the evidence trail. You are the RIDER.

READ FIRST: AGENTS.md; **public/skill.md — the agent door document IS your manual (the view schema, the order grammar, the submission rules)**; artifacts/ops/l3-cutover/ (the proven ride→submit→verify pattern: l3-rider.mjs drives `scripts/gr-sim.mjs` over stdin — one JSON view in, one orders array out, a turn ends on an EMPTY line — and build-submission.mjs + a POST lands it); artifacts/assay-e2e-20260822/build-submission.mjs (the submission builder — its header documents every validator rule); assets/contracts/bench-seeds.json (the six E1 contracts' bench seeds); functions/api/standings.ts POST_KEYS + validateStack (declare every truthful field the validator accepts — nothing it doesn't).

## Pre-flight — THE SKEW LAW (c6): ride AT THE DEPLOYED COMMIT
Production serves build `b42c0fbc` and the assayer's `ASSAY_BUILD_ID` is pinned to it. gr-sim stamps tapes with ITS checkout's commit, so riding at current main would stamp a mismatched id and every submission would honestly land `unassayable: build-skew`. Therefore: `git worktree add --detach /tmp/heat-b42c0fbc b42c0fbcc && ln -sfn "$PWD/node_modules" /tmp/heat-b42c0fbc/node_modules` and run EVERY gr-sim ride from that worktree (the l3 proof rode exactly this way). Remove the worktree when done. Standard lane hygiene otherwise (safe-dupe pre-flight; F-1407-1 churn exception; npm install; build green — the LANE tree is only your workshop for driver scripts and evidence).

## Why (owner 2026-08-24: "I think we will have to run another gauntlet to fill the leaderboard?" — yes; the landing now renders the LIVE board, which holds one row)
The ledger reset started season two empty by the owner's own amendment. The announcement needs a board with real, machine-verified rows. You are the first rider of the season: six contracts, the public door, no debug, no engine access beyond what skill.md grants any stranger.

## The heat
1. For EACH of the six E1 contracts (the-claim, dry-gulch, night-shift, twin-banks, baron, hill-mine — confirm the list from bench-seeds.json), FIRST bench seed each: ride through `node scripts/gr-sim.mjs --contract <id> --seed <seed> --tape <out>` from the deployed-commit worktree. YOU author the standing orders per view — read the briefing, the mechanics manifest, and the almanac in the view; play to SECURE. Write a small driver per ride (the l3-rider.mjs shape) whose order batches are YOUR strategy, not a replay of the county's own provers.
2. Up to THREE attempts per contract. Secured → build the submission (build-submission.mjs) and POST to `https://agenttown.app/api/standings`; then poll `?verdict=<tapeId>` until `verified` (the worker polls every 30s; a ride verifies in ~1 min). Unsecured after three → record the attempts honestly in the run note and move on; an unfilled board cell is better than a fake row.
3. **Declare the stack truthfully**: every field `validateStack` accepts that is true of you (harness `codex-cli` + its version, your model id). If the validator accepts a book/openness field, declare `open` — you have repo access and skill.md explicitly allows it. Do NOT declare fields the validator rejects; do NOT understate.
4. Evidence (retention law): `artifacts/gauntlet-heat-20260824/` — per contract: the tape, the submission JSON, the verdict slip JSON, and one run note (`heat-note.md`) with the table: contract | attempts | secured wave | gold | tapeId | verdict. Commit these on the lane with your BACKLOG row.
5. NO source edits anywhere. NO ?debug. NO reading HeadlessContractSim internals to plan (skill.md's public surface only — the county's first heat should exercise the door as a stranger meets it; consulting the repo's PROVER artifacts is open-book and lawful if declared, but prefer your own play).

## Firewall
Touch ONLY: `artifacts/gauntlet-heat-20260824/**`, your driver scripts INSIDE that artifacts dir, tasks/BACKLOG.md (your row). NO src/, scripts/, functions/, assets/, e2e/, specs/ — nothing. The deployed-commit worktree is read-only territory except gr-sim's own tape output.

## Self-check (evidence, not vibes)
Every submitted row polls to `verified` (quote each slip); the run-note table complete for all six (secured or honestly-failed); zero repo changes outside the artifacts dir + BACKLOG. End: READY-FOR-GATES + report: the six-row table, total attempts, anything about the door a stranger would file as a finding (fresh eyes on skill.md are themselves valuable — name gaps).

## No-op / honesty guard
Never submit an unsecured run (the validator refuses; do not try to satisfy it by editing anything). If the door or the worker misbehaves, capture the exact response and STOP that contract's lane of work — the finding is a deliverable.
