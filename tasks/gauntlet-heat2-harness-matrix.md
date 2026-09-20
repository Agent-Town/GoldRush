# Task gauntlet-heat2-harness-matrix: the field widens — other harnesses ride the same door (lane-d, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. In THIS heat you are the OPERATOR of a multi-harness field, and one rider yourself. No code deliverables — verified standings + the heat record.

READ FIRST: AGENTS.md; **tasks/gauntlet-heat-e1.md (heat-1, running in parallel on lane-c — its rules are this heat's rules: the skew law, the door protocol, secured-only submissions, verify-by-poll, the honesty guard)**; public/skill.md; artifacts/ops/l3-cutover/ (the ride→submit→verify pattern).

## Pre-flight
Standard lane hygiene (safe-dupe; F-1407-1 churn; npm install; build green). The skew law from heat-1: every ride happens in a detached worktree at the DEPLOYED commit — **use your OWN path `/tmp/heat2-b42c0fbc` (`git worktree add --detach /tmp/heat2-b42c0fbc 3e383b2fa` + symlink node_modules); heat-1 owns `/tmp/heat-b42c0fbc` and may be live — never share it.** Remove yours when done.

## Why (owner 2026-08-24, verbatim: "can we also do the harnesses as part of the gauntlet? I have lots of tokens for Codex")
A gauntlet with one rider is a time trial. The county's boards exist to compare MINDS on the same map and seed; this machine fields three more riders today. Their operability is itself a measurement (the ap-15 spec's axis 7: setup survival is data — a DNF is heat history, not a failure of the heat).

## The field (each arm independent; one arm's failure never stops another)
1. **codex · gpt-5.6-luna**: yourself via `codex exec -m gpt-5.6-luna` charter sessions, or by running the rides directly with the model switched — whichever your CLI supports; the STACK must name the model that actually made the decisions.
2. **hermes** (`~/.hermes/hermes-agent/venv/bin/hermes`, the old board's rider): launch it with the CHARTER PROMPT below and a working directory it can use. If it cannot start, authenticate, or complete a ride within budget: kill it, record `DNF (<stage>: <exact error>)`.
3. **openclaw** (`/opt/homebrew/bin/openclaw`): same treatment. NOTE in the run note that openclaw rides on the owner's Anthropic quota (he offered codex tokens; openclaw is included because it is installed and the field wants species diversity — keep it to the three-contract short program below if budget worries you).

**The charter prompt for a guest harness** (adapt minimally per CLI): "You are a rider in the Gold Rush gauntlet. Work in /tmp/heat2-b42c0fbc. Read public/skill.md — it is the complete manual. Ride `node scripts/gr-sim.mjs --contract <id> --seed <seed> --tape <out>`: it prints one JSON view per turn on stdout; you reply with one JSON array of standing orders on stdin; an empty line ends your turn. Play to secure. You get up to 3 attempts."

## The program
- **codex-luna arm**: all six E1 contracts, first bench seed (same seeds as heat-1 — same map+seed across riders is the comparison the board exists for).
- **hermes + openclaw arms**: the SHORT PROGRAM — three contracts (the-claim, night-shift, hill-mine), first seed. Guest harnesses are slower and flakier; three honest rows beat six babysat ones.
- Per ride: 3 attempts max, ~20 min wall budget per attempt (kill + DNF past it). Secured → build-submission + POST + poll to `verified` (heat-1's exact pattern). The STACK declares the true decider: `{harness: 'hermes', harnessVersion: <its version>, model: <what it ran>}` etc. — read validateStack and declare every truthful accepted field; the OPERATOR (you) appears in the run note, never in the stack.
- Evidence: `artifacts/gauntlet-heat2-20260824/` — per arm per contract: tape, submission, slip, and `heat2-note.md` with the full matrix table (rider | contract | attempts | result | tapeId | verdict | wall time), DNFs included with their exact failure stage.

## Firewall
Touch ONLY: `artifacts/gauntlet-heat2-20260824/**` (drivers + evidence), tasks/BACKLOG.md (your row). NO src/scripts/functions/assets/e2e/specs. Never edit another harness's global config beyond what launching it requires; never store or echo any API key; if a harness demands interactive auth, that is its DNF reason.

## Self-check (evidence, not vibes)
Every submitted row polls `verified` (slips quoted); the matrix table complete for all arms (row or DNF, nothing blank); zero repo changes outside artifacts + BACKLOG; both heat worktrees intact (yours removed at the end, heat-1's untouched). End: READY-FOR-GATES + report: the matrix, token/wall costs per arm, and door findings from three fresh pairs of eyes.

## No-op / honesty guard
Never submit an unsecured run; never ghost-write orders FOR a guest harness (operator ≠ rider — if hermes cannot play, the county learns that, which is the point); a fully-DNF'd field is still a complete, publishable heat record.
