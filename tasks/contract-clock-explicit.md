# Task contract-clock-explicit: every contract owns its tape clock (main slot, commit prefix "fix:")

FIRE-AUTHORED s2506 (attended review welcome)

You are Codex, implementer for Gold Rush, running natively on Robin's Mac at the repo root (main slot).
READ FIRST: `AGENTS.md`; the F-CLOCK-1 row at the top of `tasks/BACKLOG.md`; `src/playbook/PlaybookFormat.ts:21-75` (`MAX_PLAYBOOK_TICKS`, `EnvelopeContract`, and `runTapeEnvelopeForContract`); `src/meta/ContractFamilies.ts:720-745` (the authored twist schema); all ten `assets/contracts/epoch-*/contracts.json` bundles; and `scripts/test-standings.mjs:485-581` (`checkDoorEnvelopes`).

Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below - if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED - list briefly, proceed.
FACTORY-CHURN EXCEPTION - these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a STOP; list them and proceed (F-1407-1, s1407): (a) `logs/**` - the fire/runner accounting, rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` - regenerated evidence (the F-1266-1 exception).

## Why (owner 2026-09-04, verbatim: "are we sure that 10 minutes are enough for all maps?")

Current main has 42 registry contracts: 24 derive a tape clock from a positive `twist.secureWave`; the other 18 silently inherit the flat 18,000-tick authoring bound. Four derived clocks already exceed ten minutes. The current flat ceilings fit the retained heat-11 reels, but an implicit fallback is a guess no contract author must notice or defend.

## Scope

1. Add optional positive-integer `twist.clockTicks` to the authored contract schema and the envelope reader. A contract with a positive `secureWave` keeps the existing wave/cadence/boss derivation; a contract without one must declare `clockTicks`. The envelope is the maximum of the authored/derived clock and `MAX_PLAYBOOK_TICKS`, then receives the existing two-tick inclusive-endpoint slack exactly once. Unknown contract ids keep the current `18_002` fallback.
2. Give each of the 18 contracts without a positive `secureWave` an explicit `clockTicks: 18000`. This slice makes today's choice explicit without inventing new balance; no contract's accepted ceiling changes. Report the 18 ids and the before/after envelope table.
3. Extend `checkDoorEnvelopes` in `scripts/test-standings.mjs` into the permanent guard: all 42 registry contracts must have exactly one clock source (positive `secureWave` or positive integer `clockTicks`), with a pinned `24 derived / 18 explicit / 0 missing` census. Removing any explicit clock must make `npm run test:stats` fail. Keep the existing contract ceiling, byte and entry assertions.

## Firewall

Touch ONLY: `src/meta/ContractFamilies.ts`, `src/playbook/PlaybookFormat.ts`, the ten `assets/contracts/epoch-*/contracts.json` files as needed, `scripts/test-standings.mjs`, and the F-CLOCK-1 row in `tasks/BACKLOG.md`. NO changes to: sim semantics, objectives, secure waves, wave cadence, boss grace, `MAX_PLAYBOOK_TICKS`, standings/ranking, existing e2e assertions, `public/skill.md`, other tasks' fresh work, or `assets/engine-era.json` (report the new engine hash; the drain owns the pin).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean; `npm run build` green; `npm run test:stats` green with the 42/24/18/0 census and unchanged before/after envelope table; focused mutation proof shows deleting one `clockTicks` reds the guard. End: READY-FOR-GATES + the 18-id list, before/after envelope table, exact test counts, mutation-proof line, and engine hash.

## No-op / honesty guard

If current main already gives every registry contract an explicit or derived clock, STOP and report the shipping commit. If any current envelope changes, STOP and name the contract and arithmetic; do not smuggle a balance change into this schema slice.
