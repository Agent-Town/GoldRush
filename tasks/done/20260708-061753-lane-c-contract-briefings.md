# Task contract-briefings: every contract introduces itself — goals, rules, and a pause-screen reminder (LANE-C, branch lane/polish, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; the contract manifests (boardRow + twist data — the briefing renders FROM these; a new `briefing` block extends them); SS-01's card styling (reuse the parchment/ledger visual family — but this is NOT a beat: it shows EVERY run start); the pause overlay (meta panel pattern — the briefing panel joins it); specs/e1-contracts (each contract's rules in spec words). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after ss-02 (this lane's queue).

## Owner order (2026-07-08: "there has to be more of an initial introduction to each contract when it starts — what are the goals, what are the rules? … Maybe even repeat it on the pause screen.")
The Baron fight proved it: the owner played his own game's boss contract without being told its rules. Every contract briefs the player at the door, and the pause screen keeps the briefing one key away.

## Scope
1. **Manifest `briefing` block per contract** (data): {goals: 1–2 lines ("Secure the claim at wave 20 — then stay for the rush" / "Survive to DAWN at wave 25" / "The Baron rides at wave 20. End him."), rules: ≤3 plain-words lines (the twist: "Sluices work only beside the spring." / "Dark from wave 10 — light is your sight." / "His outfit rides hot: waves come 15% faster."), geographyLine (from tile-identity's blurbs)}. Legibility law on every line. All SIX contracts (the default Claim gets the gentle standard briefing: "Pan. Build. Hold the claim.").
2. **The run-start briefing card**: on contract launch (board OR ?contract= OR default), a parchment briefing card — contract name, geography line, GOALS, RULES — shown before the grace period ends (game runs behind it; ≤8s auto-dismiss or click; NOT once-per-profile — every run, it's the contract's handshake). Distinct from beat cards (top-center, contract-styled).
3. **Pause-screen panel**: the pause overlay gains "THE CONTRACT" section — same data, compact (name + goals + rules), always present mid-run.
4. **Board detail**: the board card's detail view shows the same briefing (one source of truth — the manifest block).
5. Mobile: readable at 390px both surfaces.

## Firewall
Touch ONLY: manifest briefing data, the briefing card UI, the pause panel section, board detail reuse, e2e, artifacts. NO changes to: contract mechanics/unlocks, SS-01 beats, the wave scheduler (the card never delays the sim), sim.

## Self-check
tsc/build; new `e2e/contract-briefings.spec.ts`: every contract launch shows its card with correct goals/rules (all 6 asserted by content) · auto-dismiss + click-dismiss · pause panel carries the same data mid-run · default-claim briefing on plain boot (no ?debug — the player-visibility law) · 390px both surfaces; board + contract suites + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (briefing card ×2 contracts, pause panel, 390px) into artifacts/contract-briefings/. Commit on lane/polish. End: READY-FOR-GATES + results.
