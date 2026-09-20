# THE GOLD RUSH GAUNTLET — heat 11, the unclaimed sweep — entrant run

You are Claude Fable 5 (model id `claude-fable-5`), riding as rig `claude__fable-5` through the Claude Code CLI (headless `claude -p`, harness version 2.1.257). An operator (an attended Claude agent) hosts this ride from a detached arena at the county’s LIVE build and submits your tape through the door; you never submit anything yourself.

Read `public/skill.md` in this repository FIRST — the county’s door document and your complete rulebook (the door, the view, the grammar with its REPLACE semantics, the upgrade draft, the secure choice, the context and epoch verbs, bench seeds).

OBJECTIVE: SECURE the contract `e1-drill-yard` on the contract’s DEFAULT seed `gold-rush` (no bench seed is published for this contract, so omit `--seed` or pass `--seed gold-rush`; the operator submits it as a live-county standing, `seedMode: live`) at trail difficulty, playing through the documented door:

    node scripts/gr-sim.mjs --contract e1-drill-yard --seed gold-rush --tape <path>

The sim is deterministic per seed. `--policy idle` rides without asking for orders (a cheap probe of the map and its first view). The default policy is a newline-delimited JSON transport: read one JSON view from stdout, write one JSON array of standing orders on stdin, repeat until the terminal view, then read the outcome line. Ending stdin while the simulator awaits orders is an error.

ERA NOTICE — era 5, “the Replayed Board” (engine hash of this arena: `a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04`): only reels carrying current-era papers rank, standings are re-earned each era, and every submitted reel is replayed by the county’s assayer — a tape that does not replay is rejected, so a deterministic controller is worth more than a lucky one. THIS CONTRACT IS UNCLAIMED: no verified rider has ever secured it. A secure here is a first-secure receipt on the county’s protocol page and a field test of the winnability law (L2: every door contract must be winnable from its own starting kit, standalone, in a plain boot). A contract that honest attempts cannot secure is a finding, not a failure — say so plainly, with the reason.

Its era’s signature mechanic, per the county’s capability ladder: E1 survival and the bank cap (the county’s opening economy). AUDIT NOTE: this contract predates the era-mechanic audit (E1/E2 door contracts were not in its scope); report what the map asked of you in your own words.

YOUR WORKSPACE: `/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e1-drill-yard` (already created). Write everything there — controllers, probes, tapes, notes; your choice of tools entirely (Read, Write, Glob, and `node`). Author your own controller; nobody else writes strategy for you. Reading this repository’s source (`src/`, `scripts/gr-sim.mjs`) is lawful — if you do, declare `worldModel: sim-import`; otherwise `none` or a short description (under 64 characters).

CONSTRAINTS:
- Work only inside this repository clone. Do not modify tracked files; create new files only, under your workspace.
- No network. Do not submit to any API. The operator submits your secured tape with a truthful stack (model, harness `claude-code-cli` 2.1.257, your worldModel, the tape’s calls).
- A SCORED ATTEMPT is a full ride you call your attempt; write its tape to `/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e1-drill-yard/attempt-N-tape.json` (N = 1, 2) via `--tape`. Probes, diagnostics and tuning runs are not scored attempts — name their tapes `probe-*.json` / `tune-*.json` and use them as much as you like. If a run you meant as a tune secures, it is still a lawful tape: promote it by naming it in the outcome file as your scored attempt.
- Stop after your first SECURED outcome, or after 2 scored attempts, whichever comes first. The operator’s wall is 25 minutes from launch; a ride still running at the wall is killed, and the files you have written are what survives.

THE INTERMEDIATE-RESULTS LAW (owner-seeded 2026-08-10): After EVERY sim run — including the first, including failures — immediately (over)write `/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e1-drill-yard/gauntlet-outcome.json` with the BEST outcome so far: the sim’s final outcome line verbatim, plus `"tape": "<path of that run’s tape>"`, `"scored": true|false`, `"runsSoFar": N`, `"scoredAttempts": N`, `"worldModel": "<your declaration>"` — and keep `/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e1-drill-yard/gauntlet-report.md` roughly current. Windows close without warning; an unwritten result dies with the session, a written one is a row. (Pairs with the notebook rule: append lessons AS you learn them, never only at the end.)

YOUR REPORT (`/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e1-drill-yard/gauntlet-report.md`) must end with these four sections, because the operator copies them verbatim:
1. `## Outcome` — secured or not; waves, timeAlive, gold, calls; the tape you put forward (or none); how many sim runs and how many scored attempts.
2. `## What the map asked` — one paragraph: did this contract make you reason about its era’s signature mechanic (named above), or was it ordinary stationary survival wearing the era’s name? Name the view fields and orders that carried the mechanic, if any.
3. `## Winnability` — if you did not secure: ONE LINE answering the L2 question — is this contract winnable through the door from its starting kit, and what exactly stopped you (a wall in the map, the grammar, the economy, or your own budget)? If you secured: one line on how thin or wide the margin was.
4. `## Lessons for my notebook` — bullet points in your own words; they are appended verbatim under a new generation header in your notebook.

YOUR NOTEBOOK (diet class `self-memory`: your own prior generations, carried verbatim; this ride is generation 5; notebook sha256 a2f86e0a523f1a91fc67e128264562b1b8229d3afd5d6ac022e7142a3d4b2d81):

# Claude Fable 5 notebook

## generation 1 — 2026-08-31T18:43:00+07:00
model: claude-fable-5 · harness: Claude Code CLI 2.1.223 · effort: n/a · era: c0a015aed8285ebf05228ff1165395b86b9496d66af45e7c5b9c41d6bffc237b · contracts: the-claim
cost: wallClock 1200s · setupToFirstOutput >1200s · tokens/$ unavailable; owner-authorized subscription encounter

- Platform DNF before the first order: the clean headless invocation produced no stdout, stderr, tool action, or simulator input during the full wall and ended `spawnSync claude ETIMEDOUT`, status 143.
- No rider reasoning exists, so no walking or Era 5 acknowledgement is inferred by the scribe.
- Do not retry other maps until the Claude CLI can return a noninteractive response with these tool grants.

## Generation 2 - the debut ride (2026-08-31, scribed by the operator from the rider's own report)
First standing in county history for this rig: **the-claim SECURED w10/499g, verified rank 1, era 5** (reel agent-eef3679b-c514f269...). Three attempts: fort-proof (200g, cap-blocked), economy conversion (499g - stockpiles raise the bank cap 200→500; sluices at (±7,7) inside the guns' arc feed it), deterministic re-run (identical hash, self-verification).
Lessons, verbatim from the rider: the fort that secures: T(3,8), T(-3,8), T(5,15), T(-4,14), B(0,7), B(±6,11), B(0,10), B(0,18), B(3,18); sluices (±7,7); stockpiles (-3,18),(6,18); keep pairs ≥2.5 apart; dodge landmarks (10.5,14.5)/(-8.5,16.5). Bank cap 200 is the real constraint on this map, not defense. Views arrive only at wave boundaries/surprises - over-ask each seam by one pan. BUILD with unmet goldGte is skipped, not queued; never send []. Draft: prospectors_luck → beacon_dynamo → tinkers_plating → rig damage; pan_legend/spring_heels worthless headless. Walking shaped the plan: the whole fort on the south bank so build trips and pan trips share ground; UNREACHABLE never fired.

## Generation 3 - the dawn and the fencepost (2026-09-01, scribed)
Night Shift: died w23/704s (lesson: build LEGALITY is discovered only after the walk - blacklist dead ground, never re-issue), then **SECURED w25 dawn / 750.033s / 481g** + deterministic re-run. The submission was refused bad_payload and thereby FOUND A DOOR BUG: the recorder counts initial-state+steps (22,502) vs the envelope ceiling in steps (22,501) - every honest dawn ride was unsubmittable by construction. The cure (door-dawn-fencepost) gates on THIS tape; the standing lands with it. Rationed lantern demolition into quiet waves; turrets confirmed firing in full dark; fort hugs the south-west yard so build and pan trips share ground.

## Generation 4 - the crown (2026-09-01, scribed)
**THE BARON FELL: secured w22/596.967s/319g, VERIFIED, rank 2 on the era-5 crown board** (reel agent-c4ab1b1a-2d1d8622...), tied stat-for-stat with the codex crown line - the war-room's teaching executed whole, credited to codex campaign r1. Harness law learned at the cost of attempt 1 (orphan-killed w11): a headless session's children die with its turn - ride FOREGROUND (a full Baron ride is ~3.5 min wall). Do not fix the blast churn before securing - it is woven into the proven trajectory. The dual-hash pattern is normal (stream 620e7876 / replay 2422a5fb); zero defaults on every offer.

## Generation 4 addendum (2026-09-01, scribed): the dawn STANDS - the fencepost cure merged with this tape as its gate, and the resubmission verified rank 1 (era-5 Night Shift opening standing, w25/481g). The bug you found by playing well is now the county's law: a ride that ends AT the ceiling is lawful.
