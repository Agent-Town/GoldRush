# Task homemaker-kept-state-init-order: the Homemaker's kept-state restore must not run before the wave system exists (LANE-A, commit prefix "fix:")

You are the implementer for Gold Rush (Claude Opus 5 in wave 2; Codex is out of quota), running natively on Robin's Mac in `worktrees/lane-a` (branch `lane/a`).
READ FIRST: AGENTS.md; `reviews/asset-diet-explicit-manifest.md` F-ADM-1 (AD2-B1, reproduced by two independent runners on main); `src/game/Game.ts:1093-1097` (the Homemaker is constructed in a FIELD INITIALIZER with `suppressBossSpawn: () => this.waveSystem.suppressBaronForRun()`); `src/systems/HomemakerBossSystem.ts:194` (`if (this.enabled) this.restorePersistentKept()` in the constructor), `:481` (`restorePersistentKept`), `:490` (calls `suppressBossSpawn()` → `this.waveSystem` is not yet constructed when the initializer runs → throws on a reload with kept state); `e2e/e6-boss-homemaker.spec.ts:126` ("unbuilds, tidies, makes one chair, and remains kept without ever hurting the player" — times out at `:227` because of this).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (Owner, 2026-09-05: "Ok, lets switch implementation to Opus 5 I guess?" after "lets have it fix these findings. This is important stuff."; F-ADM-1)
A player who reloads a run where the Homemaker was kept crashes the boot: the restore runs inside a field initializer, before `waveSystem` exists. Player-facing on E6; the spec has been red for it.

## Scope
1. Defer the kept-state restore until every system the callback touches exists: either construct the Homemaker after `waveSystem` (respecting the other initializer orders — list what depends on what), or make `restorePersistentKept()` an explicit post-construction call from `Game` once systems are wired; the callback must never reach an undefined system. No behaviour change beyond the ordering.
2. A node guard or the e2e proves the reload path: kept state persisted → reload → no page error → the Homemaker is still kept; `e6-boss-homemaker.spec.ts` green both projects unmodified (if its wait at `:227` masks the crash, say so; do not alter it).
3. Sim determinism: the E6 null floor and a played tape replay byte-identical (hash before = after); state the engine hash (a `src/` change rotates it — append the same-era pin per F-1441-3 with the cause).

## Firewall
Touch ONLY: `src/game/Game.ts` (the Homemaker construction/restore ordering only), `src/systems/HomemakerBossSystem.ts` (the restore call only), `assets/engine-era.json` (one pin), `artifacts/homemaker-kept-state-init-order/**`, `tasks/BACKLOG.md` (your row). NO changes to: the Homemaker's behaviour, `WaveSystem.ts`, other bosses, e2e assertions.

## No-op / honesty guard
If you find yourself about to exit without changes, WRITE WHY into your report first. If a scope item is impossible inside the firewall, do the others, COMMIT them, and report the coupling as file:line — do not widen the firewall yourself.

## Self-check (evidence, not vibes)
tsc + build green; `e6-boss-homemaker` + `e6-roster` green desktop + 390px on your own port, zero console/page errors; the reload proof; the hash table; the pin.
End: READY-FOR-GATES + the reload proof and the hash table.
