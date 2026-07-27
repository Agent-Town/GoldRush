> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, content-probed s1132 2026-07-27).** Done-move `tasks/failed/drained-s140-town-t3.md` (a byte-identical copy of this master). Datum: the master's own proposed spec `e2e/town-t3-board.spec.ts` exists, and its `contract-board` testid is consumed by 20+ specs — e.g. `e2e/061-first-claim-onboarding.spec.ts:118` and `e2e/board-era-chapters.spec.ts:109` `contract-board-title` *"The Book"*; review `reviews/town-t3.md` with `reviews/shots-t3/`. See F-1132-1.

# Task town-T3: the tavern contract board — runs start in the world now (LANE-B, branch lane/m4, commit prefix "town:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; **specs/town-v1/README.md T3 + law §4 (the board = THE run launcher)**; the `?contract=` loader + contract manifests (dry-gulch/night-shift/twin-banks board-row metadata — the board RENDERS these); tavern-interior-backdrop.png (exists in assets/raw); the scoreboard per-contract results socket. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: town-T2 MERGED (file-probe the naming module on main; absent → STOP "T2 not landed").

## Scope (per spec T3)
1. Enter the tavern shell → interior view (backdrop art; processed if available, raw-scaled placeholder otherwise) → **the CONTRACT BOARD**: parchment cards from the contract manifests — name, ledger blurb, difficulty tag, unlock state (locked cards show their unlock condition in plain words: "Secure a claim first"), per-contract best result (scoreboard read).
2. Selecting an unlocked contract LAUNCHES the run with that contract's config — the same path `?contract=` uses, now player-facing. Default "The Claim" card always present/unlocked.
3. **Menu New Claim reroutes internally** through the board's default contract (no behavior change for the impatient path — byte-identical run config, regression-asserted).
4. Post-run return: victory/overrun returns THROUGH the town (spec ratification default 2 — skippable with one click straight to the board).
5. Unlock conditions evaluate from per-profile state (wave10OnClaim, first SECURED, science≥3, science-complete — read existing meta/scoreboard; NO new tracking).
6. Mobile: board scrolls, cards tap-safe at 390px.

## Firewall
Touch ONLY: tavern interior + board UI, run-launch wiring (config pass-through — the run itself untouched), post-run routing, e2e. NO changes to: contract manifests' shape, run sim, scoreboard writes, unlock-condition data (read-only), other town shells.

## Self-check
tsc/build; new `e2e/town-t3-board.spec.ts`: board renders all manifest contracts with correct lock states (seeded profiles: fresh / wave-10 / secured / science-complete) · locked shows condition · launching dry-gulch actually loads dry-gulch (contract diagnostics assert) · New Claim reroute byte-identical (seeded run hash comparison) · post-run returns to town, skippable; town-t1/t2 + e1-dry-gulch + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (the board with mixed lock states, 390px) into artifacts/town-t3/. Commit on lane/m4. End: READY-FOR-GATES + results.
