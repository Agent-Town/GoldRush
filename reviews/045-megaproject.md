# Review — 045 megaproject construction site (RETRO-GATE)

**Slice:** task 045 — the megaproject construction site (epoch transitions become buildable; generic engine, dev-manifest tested)
**Landed as:** `src/meta/Megaproject.ts` (+300), `src/game/Game.ts` (+279), `src/systems/BuildSystem.ts` (+55), `src/game/Economy.ts`, `src/game/ProfileStorage.ts`, `src/meta/ContractFamilies.ts`, `src/vite-env.d.ts`, `e2e/045-megaproject.spec.ts` (+180)
**Merge commit:** `7af56d6` (mislabeled `runner(art): art-batch-012-mkt-keyart.md` — see F-S130-1)
**Gated at main tip:** `ee43fcf` (re-verified after 2 attended mkt commits landed on top)
**Gate run:** s130 fire, 2026-07-07 ~10:00Z
**Verdict:** ✅ PASS — the accidentally-merged 045 code is SOUND. Retro-gate only (the merge itself was never gated at merge-time; this review supplies the missing evidence after the fact).

## What it does
Manifest-driven multi-run construction site — the generic engine every epoch transition (E2 Stamp Mill → E9 Generation Ark) will reuse. Once unlocked (science ≥ threshold from the SCI-04 registry), a site footprint appears at a manifest location (build-pad reservation), the player funds a stage via Economy (sole-writer), the stage builds over N waves while enemies target it (site HP; damage delays, never resets — warm law), and stage completion persists across runs. Epoch-1 gets only a hidden dev manifest behind `?megaproject=dev` (the e2e vehicle); NO player-facing epoch-1 megaproject — E2 content ships with Town v1 (correct per scope item 4).

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | CLEAN (at `7af56d6` and re-run at `ee43fcf`) |
| `npm run build` | GREEN (~516ms, at both tips) |
| `e2e/045-megaproject.spec.ts` | 2/2 PASS — desktop-chrome 10.9s + mobile-chrome 10.2s (reserves footprint · funds · delays under attack · completes · persists across reload) |
| m2-01-build-menu | 12/12 PASS (isolation, workers=1) |
| task-025-bandits-dont-swim | PASS both projects (isolation) |
| sci-01-research-loop | PASS both projects (isolation) |
| m1-01-claim-jumpers-death | PASS both projects (isolation) |
| sci-04-contract-registry (045 reads this registry) | PASS |

**Flake note (fingerprint):** a first combined run of 7 adjacent spec files at default concurrency produced 14 reds (draw-call/pool/wave-timing budgets in m2-01, m1-01, sci-01, task-025). Every one PASSED when re-run in isolation with `--workers=1`. Classification: **load-induced flake** (perf/timing/pathfinding budget tests degrade under parallel headless load), NOT a 045 regression. The 34-test isolation re-run was 34/34 green.

## Player-visibility (Mistake #10)
The 045 site is `?megaproject=dev`-gated **by design** — scope item 4 explicitly ships NO player-facing epoch-1 megaproject (the real E2 manifest arrives with Town v1). So there is correctly no plain-boot player surface for 045; the debug gate is intended, not a Debug-Gate Leftover.

## Merge classification
045 was NOT gated at merge-time. Its src output was swept onto main by the **art runner's `git add -A`** in commit `7af56d6` (labeled art-batch-012), together with: art-batch-011's E1 contract `manifest.json`, art-batch-012's `mkt-hero-*`/`mkt-og-banner` raws, ~40 attended artifact PNGs, `logs/dashboard.html`, and several `tasks/done` moves. This review retro-gates ONLY the 045 gameplay code (verified sound above). The swept-in art assets (011 manifest, 012 raws) are non-gameplay, build-safe, and still owe their proper art-drain (extract-alpha where applicable, in-game/contract wiring review, LEDGER completeness) — tracked in the handoff.

## Findings
- **F-S130-1 (process, HIGH — owner audit owed):** THIRD confirmed broad-`git add -A` contamination instance (after s106 `97aea02`, s128 `3c74960`). This one is the worst yet — it swept an **ungated main-slot gameplay task (045)** into an **art-labeled runner commit**, so 045 reached main with no gate, no review, and a misleading commit message. The runner `git add -A` habit persists and is now actively corrupting attribution + bypassing the gate wall. Needs the root-cause fix Robin owes (path-scope the runner's adds). Non-blocking for 045 itself (code verified sound), but escalating in severity.
- **F-S130-2 (non-blocking):** art-batch-011 manifest + art-batch-012 raws landed via the same broad-add and have NOT had their art-drain (wiring/QA/LEDGER-completeness). Display-safe (non-gameplay, build green). Owed to a clean-tree art fire.
