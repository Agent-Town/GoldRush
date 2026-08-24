# Task gauntlet-heat4-streaming-field: the four riders return — pi, omp, hermes, openclaw on the streaming shim (lane-b, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. OPERATOR again, no rider.

SEQUENCING LAW (hard gate): heat-3c's streaming shim must be MERGED to main (verify: `server/codex-shim/serve.mjs` on main answers a `stream:true` request with SSE — run the shim and test it as your first act). Not there → STOP "streaming shim not landed".
READ FIRST: AGENTS.md; tasks/gauntlet-heat3b-full-field.md + its run verdict (the field's install state: Prime Agent 0.8.0, OMP 18.0.4, Hermes 0.20.0, OpenClaw 2026.7.1-2 all INSTALLED and shim-reachable; elizaOS 1.7.2 install/runtime-broken); tasks/gauntlet-heat2-harness-matrix.md (charter prompt, DNF law, skew law); **artifacts/gauntlet-heat2-20260824/ — the retained `bad_payload` response on codex-luna's dry-gulch submission: DIAGNOSE IT FIRST (compare that submission JSON field-by-field against heat-1's ACCEPTED ones in artifacts/gauntlet-heat-20260824/; the delta is the defect — in the heat's builder usage or in a validator edge — and your report names it before any new submissions ride).**

Pre-flight: standard safe-dupe + F-1407-1; npm install; build green. Skew law: worktree at the LIVE deploy (read version.json at run time), own path `/tmp/heat4-<build>`; early probe submission before the field rides (an `unassayable: build-skew` verdict = STOP, attended re-pins).

## Why (the standing owner directive; heat-3b proved the field reaches the shim and named the single wall heat-3c removes)
Four installed riders, one protocol fix between them and the board. This heat is the payoff ride.

## The field and program
1. **Diagnose the heat-2 `bad_payload`** (see READ FIRST) — fix the HEAT-SIDE cause in your submission tooling if it lives there; if the cause is validator-side, report it as a finding and route around honestly.
2. Riders: **pi (Prime Agent)** · **omp** · **hermes** · **openclaw**, each via the charter prompt, each with its OpenAI base pointed at the streaming shim (per-run env/config only; restore anything touched — heat-3b's OpenClaw approvals-file migration lesson: snapshot before, restore after, say so). **eliza**: ONE bounded retry of install/runtime (newer release or the documented alias-export bug fixed upstream); still broken → DNF, move on.
3. Short program each (the-claim, night-shift, hill-mine; first seeds), 3 attempts, ~20 min wall per attempt. Secured → submit → poll `verified`. Stacks truthful (harness + version + the model the shim served). DNFs staged.
4. Evidence: `artifacts/gauntlet-heat4-<date>/` — tapes, submissions, slips, `heat4-note.md` matrix + shim behavior under real streaming load (latency, aborts, orphans) as heat-3c findings if any.

## Firewall
Touch ONLY: `artifacts/gauntlet-heat4-*/**`, tasks/BACKLOG.md (your row), your submission-tooling fix if item 1's cause is heat-side (inside the artifacts dir — the builders live there). NO src/scripts/functions/assets/e2e/specs; no shim patches mid-heat (findings, not fixes); guest configs restored.

## Self-check (evidence, not vibes)
Every submitted row polls `verified` (slips quoted); the matrix complete; the bad_payload diagnosis named with evidence; configs restored; worktree removed. End: READY-FOR-GATES + report: the matrix, the diagnosis, per-arm costs, door findings.

## No-op / honesty guard
Operator ≠ rider. Never submit unsecured. A field that DNFs again on a NEW wall is a publishable heat — name the wall precisely; that is what heats are for.
