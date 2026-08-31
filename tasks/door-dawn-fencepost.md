# Task door-dawn-fencepost: a ride that ends AT the ceiling is lawful — the envelope's inclusive-endpoint off-by-one (lane-d, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.

READ FIRST: AGENTS.md; **the banked fixture that found the bug: `artifacts/claude-debut-20260901/claude-fable-nightshift/attempt2.tape.json`** — a GENUINE gr-sim dawn secure (e1-night-shift, secured w25, timeAlive 750.033 s, era-5 papers) whose `inputLog.durationTicks` is **22,502**, refused `bad_payload` by the live door whose Night Shift envelope ceiling is **22,501**; `src/playbook/PlaybookFormat.ts` (`runTapeEnvelopeForContract` — the per-contract `maxTicks` derivation; the four-axis table pinned Night Shift at 22,501); `scripts/gr-sim.mjs` (how `durationTicks` is minted: the recorded log covers the initial state PLUS every fixed step, so a ride of N steps records N+1 tick slots — verify this reading at source and cite it); the envelope enforcement sites (`src/game/RunTape.ts` door sites, `functions/api/standings.ts`).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe (ahead content on main = SAFE DUPE → `git checkout -B lane/d main && git clean -fd`, PROCEED; STOP on unmerged ahead content or foreign edits). **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1)** and **FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — always expected, never a STOP; list and proceed.** Still-STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. Then `npm install --no-audit --no-fund`; `npm run build` green.

## Why (the first true dawn tape since the envelope shipped, and the door turned it away)
Claude Fable 5 survived Night Shift to dawn (2026-09-01, era 5, verified-eligible in every other respect) and the door answered `bad_payload`: the tape's 22,502 recorded ticks exceed the envelope's 22,501. The ceiling was derived as the contract's duration in STEPS; the tape writer records the initial state too. A survival contract's honest full ride lands exactly one past the ceiling BY CONSTRUCTION — every future dawn secure from every rig hits this wall. The county's own simulator and its own door disagree by one fencepost.

## Scope
1. **Verify the fencepost at source, then cure it at the DERIVATION, not per-contract patching**: read how gr-sim (and the browser RunTape recorder — check whether human tapes share the +1) counts `durationTicks`, and make `runTapeEnvelopeForContract`'s `maxTicks` admit the recorder's true full-ride count (ceilingSteps + 1, or count in the same basis — your call, justified in the report). Every contract's row in the four-axis table moves consistently; the derivation comment states the inclusive-endpoint law so it cannot regress.
2. **Consistency**: `maxEntries`/`maxTapeBytes` derivations that multiplied from ticks — re-check whether the +1 ripples (it should not materially; show the numbers).
3. **Tests**: (a) THE GATE — the banked Fable dawn tape builds into a submission and is ACCEPTED + locally assay-verifies end-to-end (validator + worker); quote the slip; (b) a synthetic tape at exactly the new ceiling ACCEPTS, one past it REFUSES with the duration reason (never `bad_payload` generic — if the current refusal is generic, name the exact reason it should give and give it); (c) the existing envelope suites stay green with the moved numbers.
4. **skill.md**: if it names tick ceilings, correct + re-pin guards.

## Firewall
Touch ONLY: `src/playbook/PlaybookFormat.ts` (the derivation), `functions/api/standings.ts` / `src/game/RunTape.ts` ONLY if the duration check or its refusal reason lives there, `public/skill.md` (+ guards), the suites, BACKLOG row. NO sim mechanics (the recorder's counting is TRUTH — the door moves to it, never the reverse), no ranking, no worker logic, no era registry (report if the engine hash rotates; the drain re-pins).

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` + `npm run test:stats` green both arms (counts stated); the three test arms above green; zero console/page errors. Report: the recorder-counting citation, the derivation diff, the moved four-axis table, the Fable slip quoted.
End: READY-FOR-GATES + the above.

## No-op / honesty guard
If the recorder does NOT add one (my premise wrong) and the tape's 22,502 has a different source, STOP and name the true mechanism with file:line — the cure must match the disease, not the symptom.
