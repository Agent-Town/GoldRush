# Review — e2-pressure-economy (WP-E2 slice ②)

**Slice:** e2-pressure-economy · **Branch:** lane/m3 · **Lane tip:** ee05ace · **Merge commit:** a21821a · **Drained by:** s176 fire (2026-07-07)

## Verdict
**PASS — merged to main.** Clean merge (base 9c6b693; main touched zero src/contracts/e2e since base). tsc clean, build green, own spec 6/6 both projects, all adjacent suites green except one **pre-existing, unrelated desktop flake** (F-176-1, proven pre-merge — not caused by this slice).

## What it does
Introduces PRESSURE as E2's second economy resource, socket-only per the saga one-new-resource law. Economy gains a `pressure` track under the same single-writer discipline as gold (event-logged, actor-attributable) — zero in epoch-1, no earn/spend consumers (those arrive with E2 content). The epoch-2 Steamworks manifest declares the resource (name, icon slot, cap default, ledger-voice "the boilers breathe it") plus Claim Office gold↔pressure exchange rows, with the META-CURRENCY exchange slot commented but unimplemented per owner ruling. A HUD pressure chip renders beside gold **only** when the active epoch declares pressure (epoch-gated; dev-verifiable via debug epoch-2 override). Gold behavior is byte-identical (regression-asserted).

## Evidence
- **tsc:** `npx tsc --noEmit` clean (merged tree, re-confirmed post-restore).
- **build:** `npm run build` green, ✓ built in ~250ms (standing >900kB chunk warning only).
- **Playwright battery:** `playwright.s176.config.ts` (self-boot `vite preview` :5234), `--workers=1`, both projects (desktop-chrome 1280×800 + mobile-chrome Pixel5 390×844). **43 passed / 1 failed of 44 (3.5m):**

| Suite | Tests (×2 proj) | Result |
|---|---|---|
| e2-pressure-economy (own) | 3×2 = 6 | ✅ 6/6 — gold replay byte-identical; epoch-1 hides chip + gold unchanged; debug Steamworks override shows chip + exchange rows |
| sci-04-contract-registry | 3×2 = 6 | ✅ 6/6 |
| m1-01-claim-jumpers-death | 4×2 = 8 | ✅ 8/8 |
| m2-01-build-menu | 6×2 = 12 | ✅ 12/12 |
| task-027-victory-must-matter | 1×2 = 2 | ✅ 2/2 |
| task-025-bandits-dont-swim | 5×2 = 10 | ⚠️ 9/10 — desktop :145 red (F-176-1, pre-existing flake) |

- **Boot probe:** zero console/page errors across the passing suites (each asserts `errors.consoleErrors`/`pageErrors` empty). Epoch-1 plain boot hides the pressure chip (own-spec assertion) — no epoch-1 visible change.
- **Screenshots:** `artifacts/e2-pressure/` — clean epoch-1 HUD + steamworks pressure chip, desktop + mobile (committed with the merge).

## Merge classification
- **Base:** merge-base(main, lane/m3) = `9c6b693` (THE FIVE authoring). Lane = single commit `ee05ace`.
- **Main drift since base:** `git diff --name-only 9c6b693..main` → **zero** src/contracts/e2e files (only specs/BACKLOG/STATUS from c0b5ee2/9924b3c/lock commits). Therefore every lane file is LANE-TOUCHED-only or NEW → clean `--no-ff` merge, no 3-way judgment needed.
- **Per-file:** `src/game/{Economy,Game,RunSuspend}.ts`, `src/meta/ContractFamilies.ts`, `src/systems/UiBridge.ts`, `src/ui/{Hud.ts,theme.css}`, `src/vite-env.d.ts`, `assets/contracts/epoch-2-steamworks/manifest.json` — all M, clean apply. NEW: `e2e/e2-pressure-economy.spec.ts`, `artifacts/e2-pressure/*`.

## Findings
- **F-176-1 (non-blocking; pre-existing flake, corrective spawned):** `task-025-bandits-dont-swim.spec.ts:145` ("hero still wades but wet powder disables and then restores weapons") fails ~⅔ of runs on **desktop-chrome** (mobile passes). Root cause: an **announcement race** — the test reads the transient `__THREE_GAME_DIAGNOSTICS__.ui.announcement` single-most-recent field and asserts it `.toContain('Wet powder')`, but the L0 Prospector permission-chip announcement ("the Prospector: follows and observes. Chip by weapon; claim wins grow it.") frequently wins the field at read time. **The feature works** — the page snapshot shows "Wet powder." live in the Wave-status region. **Attribution (rigorous):** revert-run-reapply — reverted all 9 pressure-modified src/manifest files to pre-merge main (075a6dc), moved the pressure spec aside, rebuilt, ran 025:145 desktop `--repeat-each=3` → **2 failed / 1 passed**. The flake exists on pre-merge main, independent of this slice; it was introduced by an earlier evening merge (weapon-cycling-audit / Prospector-chip announcement). pressure-economy's only announcement-adjacent change is an economy-event `actor` tag, untouched of announcement timing. → Corrective task `tasks/queue/main/fix-task-025-wet-powder-announcement-race.md` authored this commit: assert against the Wave-status DOM (which shows "Wet powder.") rather than the transient diagnostics field.
