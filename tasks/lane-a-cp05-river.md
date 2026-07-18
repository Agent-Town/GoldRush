# Task lane-a-cp05-river: CP-05 — THE RIVER, authored in the Press (LANE-A, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · specs/charter-press/README.md ENTIRE (CP-05 slice + laws; CP-01..04 are ALL MERGED — schema round-trip, validator gate, the loop, the child-height lever) · src/charter/** (the shipped engine: envelope, compiler, PressPanel, LeverTemplates) · e2e/cp01-charter-roundtrip.spec.ts + cp03-press-loop.spec.ts + cp04-lever.spec.ts (the gate grammar) · lore/STORYBOOK.md E10 §THE RIVER (what the charter must BE: E1's claim at dawn — the first map, re-inked) · assets/contracts/epoch-1-*/ (the E1 contracts THE RIVER re-authors from).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (spec CP-05, unblocked 2026-07-18 by CP-04's merge: "author E1's-claim-at-dawn AS a charter, in the Press, and make it the post-credits payload. The ending, dogfooded. If the Press can print THE RIVER, T10 is not a cutscene — it is a demonstration.")
## Scope
1. AUTHOR THE RIVER as a real charter artifact (assets/charters/the-river.json or the engine's canonical shelf location): E1's claim at dawn expressed in the charter schema — derived from the E1 contract family, styled per the book (dawn light note in the envelope's palette/provenance; provenance names the Press itself as author).
2. THE PRESS PRINTS IT: THE RIVER importable + re-stampable in the Press (the CP-01 round-trip gate must hold on it: import → stamp → byte-equivalent contract) and PLAYABLE via the CP-03 loop (stamp → boot → a real run on the re-inked claim).
3. STAGE (do NOT wire) the post-credits seam: export the charter + a single named hook (e.g. getPostCreditsCharter()) the E10 push will call — the unveiling itself belongs to the E10 story push (spec law 6, fiction spoilage; Q2/Q4 owner timing).
4. Spec e2e/cp05-river.spec.ts (both projects): THE RIVER passes the round-trip byte-equivalence gate · stamps and BOOTS clean (zero console) · the hook returns it · the shipped contracts' bytes untouched (assert a hash pin on one E1 contract).
## Firewall: TOUCH-ONLY src/charter/**, the charter asset location, your spec. NO contract-loader WRITE paths, NO editing shipped contract bytes, NO credits/UI unveiling, NO sim changes.
## Self-check: tsc+build · cp01+cp03+cp04+cp05 ALL green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + where THE RIVER lives + the round-trip evidence line.
