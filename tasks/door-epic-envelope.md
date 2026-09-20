> ⛔ SUPERSEDED 2026-08-26 — DO NOT QUEUE. Its s2308 stop named the third wall (the L1 ledger reader 256 KiB cap, outside its firewall); tasks/door-epic-envelope-v2.md inherits the whole scope with the widened firewall. Kept per the retention law.

# Task door-epic-envelope: ONE law for the whole door envelope — duration, bytes, and entries all derive from the contract (lane-c, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; **the s2302 stop + F-2302-1 (the joint-unsatisfiability finding, verified at source: `MAX_PLAYBOOK_INTENTS = 2_000` at src/playbook/PlaybookFormat.ts:23, enforced at :177 + src/game/RunTape.ts:246/:255 + hardcoded 2_000 at functions/api/standings.ts:1037/:1053; `MAX_TAPE_BYTES` 64 KiB at standings.ts:115; the banked Baron tapes: 3,294 entries, 464,285 bytes)**; door-tick-ceiling-v2 (merged db65524de — the per-contract derivation pattern this master EXTENDS to the remaining two axes); tasks/door-reel-ceiling.md (the bannered predecessor whose byte scope this absorbs); artifacts/gauntlet-heat6-20260825/ (the two SECURED Baron tapes — your gate).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template (ahead content on main = SAFE DUPE → `git checkout -B lane/c main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign edits). FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. `npm install --no-audit --no-fund`; build green.

## Why (the door refuses the Baron's victory three separate ways; two are still standing)
Every door limit was calibrated to the 300-second ordinary contract. The Baron's honest epic exceeds duration (cured, v2), bytes (64 KiB vs 464 KB), and entries (2,000 vs 3,294). The first lawful Baron admission evidence in county history sits banked because of the last two. Piecemeal cures die on the next axis; this master lands the ENVELOPE: all three limits derive from the contract's own semantics, one shared derivation, every enforcement site consistent.

## Scope
1. **The envelope derivation**, beside ceiling-v2's: per contract, from its duration ceiling → `maxEntries` (a decision-cadence envelope: entries ≤ ceilingTicks / MIN_TICKS_PER_ENTRY with margin — read what the sim actually permits per turn and derive honestly) and `maxTapeBytes` (bytes-per-entry envelope × maxEntries + fixed overhead, with margin). Ordinary contracts land near today's numbers; the Baron's envelope admits its honest epic. The full three-axis table pinned in one place.
2. **SPLIT THE SHARED CONSTANT**: `MAX_PLAYBOOK_INTENTS` serves two masters — PLAYBOOK authoring (a strategy-artifact UX bound, keep it) and DOOR tape validation (wrong master). Name them apart; the door sites (RunTape.ts:246/:255, standings.ts:1037/:1053) consume the per-contract envelope; the playbook bound stays its own constant with a comment naming the split (cite F-2302-1).
3. **The byte law** (absorbing the bannered predecessor): `MAX_TAPE_BYTES` → the envelope; the outer HTTP body cap in step; the droplet nginx `client_max_body_size` implication STATED for attended, never edited here.
4. **DoS honesty**: envelopes are still ceilings with named refusals; cite the worker's replay timeouts; measure a 464KB replay's worker wall-time delta and report it.
5. **Both backends** via the L1 seam; suites both arms.
6. **THE GATE**: both banked Baron tapes SUBMIT and poll `verified` through the local flow (validator + worker); skill.md's submission section updated if it names any of the three numbers (guards re-pinned in-commit).
7. Tests: the three-axis table pinned per E1 contract + the Baron; the banked-tape acceptance; per-axis beyond-envelope refusals; the playbook bound untouched (its own test stays green unmodified).

## Firewall
Touch ONLY: functions/api/standings.ts, src/game/RunTape.ts (the door-validation sites ONLY), src/playbook/PlaybookFormat.ts (the constant SPLIT only — no behavior change to playbook authoring), public/skill.md if needed (+ guards re-pinned), the suites, BACKLOG row. NO sim mechanics, no ranking, no worker logic, no nginx.

## Self-check (evidence, not vibes)
tsc + build green; standings suites green both arms; playbook suite unmodified-green; floors `--check` byte-clean; the Baron tapes' verified slips (or the validator-level proof + the nginx caveat) quoted. End: READY-FOR-GATES + report: the three-axis table, the constant split, the Baron proof, the nginx line if owed, the worker wall-time measurement.

## No-op / honesty guard
If a FOURTH axis emerges behind these (another calibrated-to-300s limit), STOP and name it with numbers — the county wants the whole envelope enumerated once, not a fifth master.
