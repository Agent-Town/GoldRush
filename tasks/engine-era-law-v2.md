# Task engine-era-law-v2: the engine only changes at announced era boundaries (lane-a, prefix "feat:")
### FIRE-AUTHORED s2301 (attended review welcome) — supersedes `tasks/engine-era-law.md`, which STOPPED lawfully under its own honesty guard (F-2300-1). That STOP was correct and must not be retried (§7.5). This master changes the PREMISE, which is what makes it a lawful third attempt.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in **worktrees/lane-a**.

READ FIRST (paths, in this order):
- `AGENTS.md`
- `tasks/engine-era-law.md` — the superseded master. Read it for the INTENT (the owner's puzzle, the shape of the law); do NOT follow its scope items 1 and 2 literally, they are the part that could not be satisfied.
- `tasks/BACKLOG.md` → row **F-2301-1** (why this master exists and what changed) and row **F-2300-1** (the first STOP, its corpus census, and the forced resolution).
- `tasks/runs/20260825-132944-lane-a-engine-era-law.md.log` — the first lawful STOP, last 60 lines: the file set and the reasoning. This is your predecessor's report and it is CORRECT; you are not repairing its work, you are executing a changed premise.
- `scripts/assay-replay-agent.mjs` — `ENGINE_SOURCE_INPUTS` (`:36–48`) and `collectEngineFiles` (`:84–90`, the `/\.(?:json|mjs|ts)$/` predicate). This is the engineHash machinery from `assayer-environment-honesty` (merged `d141861e6`). **REUSE `computeEngineHash`; never write a second derivation.**
- `specs/agent-play/ap-15-assay-of-minds.md` Law 3 (frontiers are era-scoped artifacts — this law is its engine-side sibling).
- The **owner's puzzle this cures** (2026-08-25, verbatim): *"Should I create reference tapes again for the new deploy? this inconsistency leaves me puzzled"*.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
Standard safe-dupe template: ahead content already on main = SAFE DUPE → `git checkout -B lane/a main && git clean -fd`, PROCEED. **STOP on un-merged ahead content or foreign edits.** FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list them, proceed. Then `npm install --no-audit --no-fund`; build green.

**Freshness gate (F-1424-3 — a STOP, not a warning):** run
`grep -Fc "ARM A never converged in six iterations" tasks/BACKLOG.md`
It must print **1**. If it prints 0 your lane predates this master's evidence commit: **STOP and report "lane stale — F-2301-1 row absent"**; do not reset, do not guess, do not proceed on a tree that cannot see your own WHY.

## Why
Tapes and reference recordings must die only at VISIBLE, NAMED boundaries — never silently. Three engine changes shipped this week with no declared boundary; each invalidated recordings, and the owner (rightly) lost track of what still held. Deliberate engine changes are lawful and rare; undeclared ones must become impossible.

**What changed since the first attempt, and why you can finish where it correctly stopped.** The engine's identity is a content hash over 481 files (`ENGINE_SOURCE_INPUTS`). The first master required the registry to seed AT the current hash and to prove the slice did not move it — while the registry it proposed, `assets/contracts/engine-era.json`, sits *inside* that hashed set. Merely creating it moved the hash, so the master was jointly unsatisfiable and the runner stopped. Both facts below were re-measured for this master by manufacturing them on a scratch root, with the control asserting its own validity first (the scratch tree reproduces main's live `d48987df2d50c643e854a2bf8a23b7f34b81c3de1cfd2e54999129b5660f7494` to the digit):

1. **A registry inside the corpus can never contain its own hash — at any era, forever.** Writing the hash in moves the hash. Six iterations, no fixed point and no cycle: `d48987df… → 95d236ad… → 8ff2e3bf… → 7b26c747… → ecf9dde5… → de4a7ece… → 21641418…`. This is not a bootstrap wrinkle to be worked around once; it is permanent, and it is why the registry's HOME is a correctness requirement rather than a matter of taste.
2. **The same file one directory up, at `assets/engine-era.json`, is OUTSIDE the corpus and self-describes stably** — write `d48987df…`, tree still hashes `d48987df…` — and stays stable at every future era bump.

So the law is satisfiable, in exactly one shape: **the registry lives outside the hashed corpus, and era 3 names the POST-mechanism hash.** The hash WILL move when this slice lands. That is expected and it is precisely what era 3 exists to name. What is forbidden is moving it by changing *simulation behaviour* — see the firewall.

## Scope
1. **The era registry — at `assets/engine-era.json` (NOT under `assets/contracts/`).** Shape: `{era, name, engineHash, declaredAt, note, history[]}`. Seed as **era 3** with a county-voice name, and a `history` array naming era 1 (pre-hypot history) and era 2 (the brief post-cure window) honestly. `engineHash` is written LAST — see the ordering law below.
2. **The guard**: a new node-guard test (`scripts/engine-era-guard.test.mjs` or a name you prefer under `scripts/`) that computes the live engineHash via the imported `computeEngineHash` and REDS when it differs from the registry's. Its failure message must tell the author exactly what the law requires: *bump `era`, name it, note what changed — in the same commit*. Root it in a battery by editing `package.json` (both batteries are hardcoded file lists; there is no auto-discovery, so this edit is required and is expected to move the hash). An engine change WITH a registry bump is green; without, red.
3. **The visibility**: the tape recorders (`scripts/gr-sim.mjs` + the browser seam in `src/game/`) stamp `meta.era` alongside `engineHash` (additive, one field). The worker's skew verdict names ERAS rather than raw hashes — read the existing `engineHash` comparison sites in `scripts/assay-worker.mjs` and enrich the reason strings (e.g. *"engine era 3 'the Honest Hypot', tape from era 2"*). Add ONE line to the GZ-01 filter examples in `scripts/fire.md` noting that an era bump is player-visible news by definition; cite this master.
4. **The almanac hook**: the gauntlet-repo docs note is ATTENDED's and is OUTSIDE your firewall. Instead, your report lists the exact era-registry line the almanac should mirror, so attended can land it.
5. **Tests**, both directions: a manufactured engine change without a registry bump = RED; the same change with a bump = GREEN (scratch-worktree pattern — do not mutate the real tree to prove a red). Plus recorder stamps present, and a skew reason that renders eras.

### Ordering law (this is what makes the slice satisfiable — follow it exactly)
Land **all** code first (guard, battery wiring, recorder stamps, worker reasons). **Then** compute the engine hash. **Then** write it into `assets/engine-era.json`. **Then** re-compute and assert the value is UNCHANGED — that stability check is the property that proves the registry is genuinely outside the corpus, and it belongs in the guard as an assertion, not merely in your report. All of it in one commit.

## Firewall
**TOUCH ONLY**: `assets/engine-era.json` (new) · the new guard file under `scripts/` · `package.json` (battery wiring leg ONLY) · the browser recorder seam in `src/game/` (the one-field era stamp) · `scripts/gr-sim.mjs` (the one-field stamp) · `scripts/assay-replay-agent.mjs` (tape-metadata normalization for the new `era` key ONLY) · `scripts/assay-worker.mjs` (reason strings ONLY) · `scripts/fire.md` (the one GZ-01 example line) · the BACKLOG row.

**NO**: no sim-content or balance changes (nothing that alters what the simulation DOES) · no verdict semantics · no era beyond the seeded 3 · **no editing `ENGINE_SOURCE_INPUTS` and no excluding any file from the identity to make a number come out right** · no touching `tasks/engine-era-law.md` (it is retained history) · no gauntlet-repo edits.

⚠️ **Do NOT "fix" the coupling by narrowing the engine identity.** That the `package.json` `scripts` block is inside the identity is a known, measured cost (F-2297-1) and it is an **OWNER fork that is UNRULED**. Your slice must work under today's identity. If you believe narrowing is right, say so in your report; do not implement it.

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` clean; `npm run build` green.
- The new guard **green on the landed tree**, and **proven RED under a manufactured engine edit in a scratch worktree** — report both, with the actual message the red prints.
- **The stability assertion**: after the registry is written, `computeEngineHash` returns the registry's own value byte-identically. Report the hash.
- `npm run test:node-guards` green (you touched `src/` — §3 requires it) and the worker suites green. Run it ALONE; it is ~9 minutes.
- Floors `--check` byte-clean — this is your proof that identity moved while **behaviour did not**. If floors move, you changed the sim: STOP and report.
- Boot probe: zero console/page errors, desktop **and** 390px, screenshots to `reviews/shots-engine-era-law-v2/`.

End with **READY-FOR-GATES** + report: the seeded registry verbatim, the guard's two-direction proof (both messages), the stability assertion's hash, the floors `--check` result, and the exact era-registry line the almanac should mirror.

## No-op / honesty guard (carried VERBATIM from the superseded master — it is what made the first stop cheap and legible)
If the engineHash source-set turns out to include files this master must touch (a circularity), STOP and report the set — never quietly exclude a file from identity to make the guard pass.

**Second clause, added s2301 for the trap this master exists to route around:** if you find yourself writing a hash into a file that is itself hashed — i.e. the registry's value will not hold still when you re-compute it — **STOP and report**. Do not iterate toward a fixed point (there is none), do not special-case the registry out of the corpus, and do not round, truncate or defer the value. The correct move is the registry's HOME, and if the home in scope item 1 has somehow become part of the corpus, that is a finding and not something to code around.
