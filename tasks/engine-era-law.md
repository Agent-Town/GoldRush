# Task engine-era-law: the engine only changes at announced era boundaries (lane-a, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; **the owner's puzzle this cures (2026-08-25, verbatim: "Should I create reference tapes again for the new deploy? this inconsistency leaves me puzzled")**; the engineHash machinery from assayer-environment-honesty (merged 0a117cf9a — the content-derived identity over the sim-relevant source set; read its definition and REUSE it, never a second derivation); specs/agent-play/ap-15-assay-of-minds.md Law 3 (frontiers are era-scoped artifacts — this law is its engine-side sibling); the F-HEAT6-SKEW row (the drift class the deploy leg already cured — this master cures the SILENT-CHANGE class).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template (ahead content on main = SAFE DUPE → `git checkout -B lane/a main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign edits). FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. `npm install --no-audit --no-fund`; build green.

## Why
Tapes and reference recordings must only die at VISIBLE, NAMED boundaries — never silently. Three engine changes shipped this week without any declared boundary; each one invalidated recordings, and the owner (rightly) lost track of what still held. Deliberate engine changes are lawful and rare; undeclared ones must become impossible.

## Scope
1. **The era registry**: a small tracked file (e.g. `assets/contracts/engine-era.json`): `{era: <int>, name: <county-voice name>, engineHash: <the current hash>, declaredAt, note}`. Seed it as era 3 (era 1 = pre-hypot history, era 2 = the brief post-cure window — name them honestly in a `history` array) with the CURRENT engine hash.
2. **The guard**: a node-guard test (wired into the battery the drain diff picks — read scripts/run-guards.mjs) that computes the live engineHash and REDS if it differs from the registry's — with a message telling the author exactly what the law requires: bump `era`, name it, note what changed, same commit. An engine change WITH a registry bump is green; without, red. (This makes the declaration structurally unforgettable — the F-1279-1 lesson: rulings need mechanisms, not memories.)
3. **The visibility**: the tape recorders (gr-sim + the browser seam) stamp `meta.era` alongside engineHash (additive); the worker's skew verdict names ERAS, not raw hashes ("engine era 3 'the Honest Hypot', tape from era 2") — read the c6/engineHash comparison sites and enrich the reason strings; the GZ-01 gazette duty note: an era bump IS player-visible news by definition (one line added to the fire.md GZ-01 filter examples — smallest possible edit, cite this master).
4. **The almanac hook**: docs note in the gauntlet repo is ATTENDED's (out of your firewall) — instead, your report lists the exact era-registry line the almanac should mirror, so attended lands it.
5. Tests: the guard's both directions (manufactured engine change without bump = red, with bump = green — scratch-worktree pattern); recorder stamps present; a skew reason renders eras.

## Firewall
Touch ONLY: the new registry file, the new guard + battery wiring, scripts/gr-sim.mjs + the browser recorder seam (the one-field stamp), scripts/assay-worker.mjs (reason enrichment only), fire.md (the one GZ-01 example line), tests, BACKLOG row. NO sim-content changes (this master must NOT itself move the engine hash — prove it), no verdict semantics, no era bump (the registry seeds AT the current hash).

## Self-check (evidence, not vibes)
tsc + build green; the new guard green on the untouched tree and proven red under a manufactured engine edit in a scratch worktree; floors `--check` byte-clean (you touched no sim content — prove it); worker suites green. End: READY-FOR-GATES + report: the seeded registry verbatim, the guard's two-direction proof, the almanac mirror line.

## No-op / honesty guard
If the engineHash source-set turns out to include files this master must touch (a circularity), STOP and report the set — never quietly exclude a file from identity to make the guard pass.
