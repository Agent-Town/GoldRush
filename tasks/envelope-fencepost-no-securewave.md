# Task envelope-fencepost-no-securewave: the tape envelope's inclusive-endpoint slack applies to EVERY contract, not only those with a secureWave (main slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac at the repo root (main slot).
READ FIRST: AGENTS.md; `artifacts/gauntlet-heat11-20260903/envelope-finding.md` and `heat11-note.md` (F-HEAT11-1, measured on eight reels: three refused `reel_duration_exceeded` at `durationTicks 18001` with the last order on tick 18000, five verified at 18000 with the last order earlier); `src/playbook/PlaybookFormat.ts:63` (the `+2` inclusive-endpoint slack is computed only inside `if (twist?.secureWave)`; a contract without a secureWave gets a flat 18000-tick envelope); `tasks/door-dawn-fencepost.md` + its review (the earlier fencepost cure and its law: the recorder counts the initial state plus every step, so a full ride lands one past a ceiling derived in steps; the derivation, never per-contract patching); `functions/api/standings.ts` refusal `reel_duration_exceeded`.
Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED — list briefly, proceed.
FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a STOP; list them and proceed (F-1407-1, s1407): (a) `logs/**` — the fire/runner accounting, rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence (the F-1266-1 exception).

## Why (F-HEAT11-1, heat 11 operator 2026-09-04: three contracts are WON but unclaimed because the door refuses a lawful full ride by one tick)
`e6-picnic`, `e6-half-life-hollow` and `e7-relay-rush` were secured with the banking order on tick 18000 and refused at 18001; `e7-relay-valley` and `e7-dead-band` were secured by rigs that computed 18001 themselves and declined to submit. The dawn fencepost was cured for contracts with a secureWave; the derivation still forgets the ones without.

## Scope
1. The inclusive-endpoint slack in `runTapeEnvelopeForContract` applies to every contract's ceiling regardless of `twist.secureWave`; the derivation comment states the law once. No per-contract numbers.
2. Tests: (a) a synthetic tape at exactly the new ceiling for a no-secureWave contract ACCEPTS and one past it REFUSES with `reel_duration_exceeded`; (b) the three refused heat-11 reels (paths in `envelope-finding.md`) build into submissions and ACCEPT locally + assay-verify (quote the slips); (c) existing envelope suites stay green.
3. skill.md: if it names tick ceilings, correct and re-pin guards.

## Firewall
Touch ONLY: `src/playbook/PlaybookFormat.ts` (the derivation), the envelope tests, `public/skill.md` (+ guards) if needed, BACKLOG row. NO changes to: the sim, ranking, the worker, `assets/engine-era.json` (report the hash; the drain pins).

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` + `npm run test:stats` green (counts); the three slips quoted; zero console/page errors.
End: READY-FOR-GATES + the derivation diff, the slips, the engine hash.

## No-op / honesty guard
If the slack already applies to no-secureWave contracts on current main (premise wrong), STOP and name the real refusal cause with file:line.
