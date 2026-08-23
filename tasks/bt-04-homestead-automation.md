# Task bt-04-homestead-automation: the homestead runs itself when told to — four ruled tunables (lane-a, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; the `bt-04-homestead-automation` leaf in tasks/goals.json (its history carries the F-1313-2 record: FOUR owner design forks, none answered by the specs — read the full four from the F-1313-2 row in tasks/BACKLOG.md, CITED BY CONTENT: grep the finding id); the automation panel + repair loop code it names (the panel has checkboxes today; the loop repairs at ANY damage); specs/building-tiers/ (the BT ladder this extends).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it; `e10s-1c` may be queued/running ahead of you on this lane — lawful queue depth, and ITS predecessor commit `61358eb55` ahead on lane/a is DELIBERATE: if it is still ahead when you start, STOP and report "e10s-1c not yet drained" rather than resetting), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — expected, list, proceed. Then `npm install --no-audit --no-fund`; `npm run build` green.

## Why (owner ruling 2026-08-23, verbatim: "Defaults now, tune later (Recommended)" — adopting the attended recommendation on the F-1313-2 forks)
The automation program was greenlit 2026-08-09 but its four design parameters were never ruled. The owner has now ruled the PATTERN: implementer defaults, documented, exposed as tunables in the panel, balanced during his testing — the same law as his "we can balance later during testing" rulings.

## Scope
1. Read the four F-1313-2 forks from the BACKLOG row and give each a DEFAULT + a PANEL TUNABLE: (1) auto-repair-under X% — default 60 (the door's own prover uses REPAIR_UNDER pct:60; cite it); (2) the idle definition — default a measured constant you justify from the loop's own cadence; (3)+(4) per the row's own text, same treatment. Every default carries a one-line justification comment at its declaration.
2. The panel: the checkboxes gain their numeric tunables (smallest honest UI — a stepper/slider per the panel's existing idiom; no redesign).
3. The loop honors the tunables; behavior with defaults = today's behavior WHERE today's behavior was ruled fine, else the default the fork's own text implies (state which in the report).
4. Tests: each tunable's boundary (repair triggers below X, not above; idle enters/exits at the definition), plus one e2e proving the panel edits persist per the panel's existing persistence law.
5. Floors/pins unmoved (`node scripts/null-floor-anchors.mjs --check` clean — automation must not alter headless outcomes; if it structurally would, STOP and report the coupling).

## Firewall
Touch ONLY: the automation panel component, the repair/automation loop, Balance (the four constants), the new tests, BACKLOG row. NO changes to: sim determinism surfaces, contracts data, enemy/combat balance, existing e2e assertions.

## Self-check (evidence, not vibes)
tsc + `npm run build` green; new tests green both projects; the panel visible + operable in a plain no-debug boot (screenshot desktop + 390px to `reviews/shots-bt04/`); adjacent panel/build suites unmodified-green; floors `--check` clean. End: READY-FOR-GATES + report: the four defaults with justifications, the per-fork mapping to the F-1313-2 text, test counts.

## No-op / honesty guard
If any of the four forks turns out to already be ruled somewhere newer than F-1313-2 (grep before choosing), follow the ruling and cite it instead of the default. Never bury a parameter as a hardcode.
