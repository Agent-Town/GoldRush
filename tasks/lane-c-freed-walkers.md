# Task lane-c-freed-walkers: freed walkers — the turn-back made visible (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; lore/story-arc.md (THE CURE-ARMS RULING 2026-07-13 + THE SCALE ASYMMETRY 2026-07-16); lore/third-printing-brief.md §2; src/systems/CombatSystem.ts (killEnemy, ~line 785); src/systems/CombatVfx.ts and src/systems/Vfx.ts (the pooling/VFX house patterns — follow them); src/entities/Enemy.ts (how an enemy's visual is built); src/game/PerformanceTier.ts (tier-cap pattern).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: grep `dustPuff` in src/systems/CombatSystem.ts on your base — killEnemy must still read `vfx.dustPuff + enemies.recycle` (verified on main 2026-07-16 at lines ~795-811). If a FreedWalker/turn-back system already exists (grep `FreedWalker` across src/), STOP and report SHIPPED — do not re-derive.

## Why (owner directive, 2026-07-16, verbatim)
"What happens to the people that are interrupted in the contracts? In the game they just *poof* disappear. But what does that mean? After what I read here, they should then run out of the screen or seek refuge in town?"
Canon (ratified): the weapons BREAK THE FEVER'S GRIP, they never kill — "turned back, not slain" (cure-arms ruling, owner 2026-07-13); "The afflicted, turned back firmly, recover at a distance from the object of their wanting. Some walk home." (lore/world-dispatches.md, E1 ledger #2). VERIFIED premise: `CombatSystem.killEnemy` (src/systems/CombatSystem.ts:785-811) plays `vfx.dustPuff` and instantly `enemies.recycle(enemy)` — the poof; while DeathOverlay.ts:144 already reads "Claim Jumpers Turned Back". The pixels contradict the ratified fiction hundreds of times per run. This slice makes the pixels comply. (The rare "seek refuge in town" beat is a SEPARATE owner-gated follow-up — NOT in this scope.)

## Scope
1. **FreedWalkerVfx (new, render-only, pooled)**: on `enemy_killed` of a non-boss, non-elite enemy, spawn a NON-COLLIDING render ghost at the death position wearing that enemy's visual. The sim path is untouched: `enemies.recycle` happens at the exact same tick as today; XP motes, gold drops, targeting, collision, wave logic, audio (`playKill`) all byte-identical in behavior.
2. **Human choreography (the warmth IS the spec — do not skip the beat)**: existing dust puff at the hit (= the grip breaking) → the ghost stands STILL one beat (0.4–0.6s — the person surfaces, briefly themselves) → turns AWAY from the claim center and RUNS toward the nearest map edge at ≥1.5× that enemy's walk speed, fading over the final ~20% of its life. Hard cap ≤4s total ghost lifetime.
3. **Machine-class choreography** (machines break, people quit — warm law): machine-type variants do NOT run — brief seize/shudder → power-down slump in place → fade, ≤2.5s. Classify human-vs-machine from the enemy variant registry (default: humanoid sprites run, machine/vehicle rigs slump); include the full variantId→behavior table in your report.
4. **Perf budget**: pool the ghosts; concurrency cap 10 (desktop tier) / 6 (mobile tier, via the PerformanceTier pattern); deaths beyond the cap keep today's exact behavior (dust puff only, no ghost). No new steady-state per-frame allocations.
5. **Diagnostics**: expose `freedWalkers: { spawned, active, capSkips }` on the existing `window.__THREE_GAME_DIAGNOSTICS__` surface, plus a `?debug`-only search override `fwcap=<n>` (0 disables ghosts) for the sim-purity probe.
6. **New spec `e2e/freed-walkers.spec.ts`** (GATE-AUTHORSHIP — assert exactly these, desktop AND mobile projects):
   a. Plain boot (no `?debug`), fixed-seed run until ≥1 enemy death: `freedWalkers.spawned ≥ 1` and `active` returns to 0 within 5s of the last death (ghosts leave; nothing lingers).
   b. SIM-PURITY A/B: two same-seed `?debug` runs, one with `fwcap=0`, one default — identical wave count, kill count, and gold in diagnostics at the same probe timestamp (proves render-only; the ghost system cannot touch the sim).
   c. Zero console/page errors in both.

## Firewall
Touch ONLY: new `src/systems/FreedWalkerVfx.ts` (or equivalently-named system file), a ≤10-line hook at the `killEnemy` site in `src/systems/CombatSystem.ts` (spawn call + diagnostics), PerformanceTier wiring for the cap, `e2e/freed-walkers.spec.ts`, diagnostics typing (`src/vite-env.d.ts`) if needed.
NO changes to: sim semantics of any kind (death tick, XP, gold, damage, targeting, waves, determinism), `src/entities/Enemy.ts` behavior/stats, boss/elite death paths (railcar, crawler, land-yacht, baron keep their bespoke choreography — ghosts must NOT spawn for them), existing e2e assertions, audio, HUD/DeathOverlay copy, town scene.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. `e2e/freed-walkers.spec.ts` green desktop+mobile. Adjacent suites unmodified-green both projects: the crawler boss spec, the land-yacht boss spec, task-025 baseline. Heavy-wave perf probe: fullbase bench (`?bench=fullbase`) frame p95 before/after — regression >15% FAILS; report both numbers. Zero console/page errors in every probe. Screenshots to reviews/shots-freed-walkers/: desktop-run-out.png (ghost mid-run), mobile-run-out.png (390px), machine-slump.png.
No-op guard: if you exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.
End: READY-FOR-GATES + report: the variantId classification table, cap behavior under heavy waves (capSkips observed), p95 before/after, and the sim-purity A/B numbers.
