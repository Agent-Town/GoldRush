# Task e6-picnic-thirty-second-death: an unbuilt player on the Picnic dies in half a minute — find out whether the map or the player is wrong (SCRATCH WORKTREE, commit prefix "fix:")

You are the implementer for Gold Rush (Claude Opus 5, the overnight wave of 2026-09-05), running natively on Robin's Mac in a scratch worktree the attended session prepares (branch `fix/e6-picnic-hold`).
READ FIRST: AGENTS.md; `artifacts/playability-smoke/report.md` (F-SMOKE-2: `e6-picnic` reaches `runState=dead` at 27.2–37.9 sim-seconds in 4/4 cells with the player only moving, 0 waves survived, 5 jumpers turned back, no error); the contract row (`assets/contracts/epoch-6-*/contracts.json`: `e6-picnic` — `secureWave: null`, `twist.clockTicks: 18000`, `twist.picnicHold: true`, roster `feral_toaster` + `lawn_shepherd`, no `secureWave`); `src/systems/WaveSystem.ts:838` (the smoke's suspicion for the picnic-hold pressure); the E6 bundle `specs/epoch-saga/e6-atomic-bundle.md` (what the Picnic is meant to be — a hold under pressure, with what grace period?); `lore/STORYBOOK.md:317-396`; `assets/rotations/winnability-receipts.json` (the Picnic's receipt: which rider secured it, at what wave, with what opening); `reviews/gauntlet-heat11-unclaimed-sweep.md` or the heat-11 matrix rows for `e6-picnic`.
Pre-flight: the scratch worktree is on a fresh branch from current main; verify `git status --short` is clean and `git branch --show-current` is `fix/e6-picnic-hold`, else STOP.

## Why (Owner, 2026-09-05 night: "how do we get them all playable for me to test? … push hard while I sleep"; the 42-contract smoke of 2026-09-05)
The owner tests the Picnic by hand tomorrow. If a human who has not built anything by second 30 is dead, that is either the design (a hold map that demands an opening — then the briefing must SAY so and the first thirty seconds must be survivable for a player who reads it) or a spawn gate that fires too early (a bug). The Picnic has a verified AI receipt, so it is winnable with the right opening; the question is the human path (L4, L7: the same laws for human and machine).

## Scope
1. **Measure the opening:** with the headless sim (`scripts/gr-sim.mjs`) and the browser, record when the first enemy spawns, when the first damage lands, and what a minimal human opening (one or two builds in the first 10 s) does to the death time; compare with the receipt's opening.
2. **Decide with the spec:** if the bundle promises a grace period, restore it at the pressure source (`WaveSystem.ts:838` or the picnic-hold twist consumer — name the site) as a contract-data or one-site engine fix; if the design is "build or die", change nothing in the pressure and instead make the briefing state the hold and its first threat explicitly (briefing copy is contract data) and add the opening the receipt used as a plain-boot e2e proof.
3. **Prove:** an e2e (plain boot, no `?debug`) where a human-style opening survives past 60 s and reaches wave 2, desktop + 390px, zero console/page errors; the null floor and the receipt's tape replay byte-identical if the sim is untouched (hash table), or re-pinned with the reason if the grace period changed the sim (then every other contract byte-identical).

## Firewall
Touch ONLY: the `e6-picnic` row in its contracts.json (briefing/grace fields), ONE pressure site in `src/systems/WaveSystem.ts` or the twist consumer if the spec demands a grace period (name it), the new spec `e2e/e6-picnic-opening.spec.ts`, its null-floor/mask pins if the sim changed, `artifacts/e6-picnic/**`, `tasks/BACKLOG.md` (your row). NO changes to: other contracts, other systems, `specs/**`.

## No-op / honesty guard
If you find yourself about to exit without changes, WRITE WHY into your report first. If a scope item is impossible inside the firewall, do the others, COMMIT them, and report the coupling as file:line. Commit what you have even if you stop early.

## Self-check (evidence, not vibes)
tsc + build green; the spec green both projects; the opening measurements table; the hash table; the spec citation for the decision.
End: READY-FOR-GATES + the decision (grace restored vs briefing), the measurements, the hash table, the engine hash if `src/` changed.
