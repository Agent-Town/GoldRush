# Review — 058 device tiers (the game runs sweetly on the weakest family device)

**Slice:** 058-device-tiers (MAIN slot) · **Branch:** main (main-slot output, no lane branch) · **Drained:** s254 fire, 2026-07-09
**Merge commits:** `8ba15b4` (diagnostics + webkit project + e2e + cache headers delta) + `7c52851` (real webkit perf-table evidence). **Tier CORE** (`PerformanceTier.ts`, boot-apply, Settings control) already on main — see F-058-1.

## Verdict: **PASS** (058's own gates all green; two adjacent reds are pre-existing, provably not 058 — F-058-2).

## What it does
Ships data-driven render quality tiers **FULL / BALANCED / LITE** (render-only; sim/determinism untouched). Auto-detects on boot from GPU renderer string + deviceMemory + iPad/iOS UA (`src/main.ts:68` `applyStoredPerformanceTier()`), with a per-profile **Settings → Performance** override (`StartMenu.ts:135`). This drain's delta adds: (1) the tier/vfx/perf surface to `__THREE_GAME_DIAGNOSTICS__` so the gate can read it, (2) a playwright **desktop-webkit** project (Safari engine = closest local iPad proxy) running a wave-20 stress probe, (3) `public/_headers` long-cache rules for hashed assets, (4) a WebGL-context type-cast fix. The son's "very laggy" iPad → auto-selects **LITE**.

## Evidence (all re-run this fire, native Mac, load ~2–3)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (252ms; 1.3MB main-chunk warning pre-existing) |
| 058 spec desktop-chrome | **5/5 pass** — override→Lite knobs applied (dpr≤maxDpr, shadows=blob, post off, floatTextPool/combat caps, enemyBarCap); iPad-UA auto→`tier:lite source:auto reason∋"iPad"`; FULL/LITE same-scene screenshots; cache-header report |
| 058 **webkit gate** (desktop-webkit) | **1/1 pass** — real perf table produced |
| Determinism (render-only) | **full.signature === lite.signature** (economy slice identical across tiers) — `artifacts/058/determinism-tier-report.json` |
| Boot probes | zero console + zero page errors, both tiers, FULL & LITE |
| Cache headers | `/assets/*` `max-age=31536000, immutable`; `*.html` no-cache; hashedAssetCount 566 |

**Webkit FULL vs LITE (wave-20 stress, the iPad proxy) — `artifacts/058/webkit-perf-table.json`:**
| | FULL | LITE | envelope |
|---|---|---|---|
| frame p95 | 25 ms | **22 ms** | ≤ 25 ms ✅ |
| triangles | 50 410 | 37 874 | — |
| scatter instances | 190 | 32 | — |
| postEnabled | true | false | — |
| dpr | 1 | 1 | — |
| console/page errors | [] / [] | [] / [] | — |

**Re-download after a small merge:** ~**1.31 MB** (`typicalSmallMergeBytes 1369983`) — the monolithic hashed main bundle `index-*.js`; all other `/assets/*` are content-hashed + immutable so unchanged files aren't re-fetched. Fine for the iPad on wifi. **iPad reality-check for the owner:** the son's iPad (Safari/iOS UA) auto-selects **LITE** on boot; at the Pages URL that holds ~40fps-equiv (p95 22ms) at wave-20; a manual **Settings → Performance → Lite/Balanced/Full** override persists per profile.

## Findings
- **F-058-1 (note, no untangle):** 058's tier CORE — `PerformanceTier.ts` (new), the `main.ts` boot-apply, and the `StartMenu.ts` Settings control — was committed to main **inside the e5 ART commit `91c4c3e`** by the lane-runner's broad `git add -A` (a fresh instance of **F-en02-1**), while 058 was still running in the main slot. The code is functionally intact + wired (verified: `applyStoredPerformanceTier()` at boot, override control in menu, all chrome+webkit tests pass); only the *attribution* is wrong. History rewrite is forbidden (§7.7), so this is a note, not a fix. **Root cause is the runner's `-A` — already on Robin's owes as F-en02-1; this is its most consequential instance yet (swept a whole in-flight feature's core).**
- **F-058-2 (real main red, NOT 058 — needs attended regression + corrective):** `feedback-fx.spec.ts:28` (opening announcement banner `hud-wave` empty, expected "Stake your claim.") and `xp-economy-audit.spec.ts:92` (seeded dense-kill XP off-by-one) are **RED on the current main tree**, consistently (failed isolated, workers=1, 2 retries, quiet machine). **Provably NOT caused by 058's delta:** the delta diff touches only the `__THREE_GAME_DIAGNOSTICS__` read-object (+import, +3 fields), the webkit project, `_headers`, and a type cast — **zero HUD/announcement/XP code**. Both failing paths (`StoryRuntime.ts`/`Hud.ts` announcement; XP economy) were last modified by the **story-loop drain `20753ac`** and **SAVE SLOTS `4c85d51`/`5f8b9da`**, not 058. Attribution via detached worktree was attempted (Mistake #12 method) but the headless approval hook blocked running playwright in the worktree; the logical+historical proof stands. → **Corrective task authored: `tasks/058b-adjacent-reds-fingerprint.md`** (attended/next-fire: bisect feedback-fx:28 + xp-economy:92 origin, fix or update-spec, full-regression). Non-blocking for 058 (out of firewall).
- **F-058-3 (gate-hardening, non-blocking):** the webkit test **auto-skips** unless the exact playwright webkit build (here `webkit-2311`) is installed — and Codex's original 058 run produced **no `webkit-perf-table.json`**, i.e. the headline iPad-proxy gate **silently skipped** in the authoring run (a Mistake-#10-class gate-that-isn't). This fire ran `npx playwright install webkit` and executed it for real. Recommend the drain protocol / runner ensure `playwright install webkit` before the webkit gate, and consider making the test **fail** (not skip) on a machine designated to run it.

## Merge classification
Main-slot output; no lane graft. Delta committed path-scoped (src/game/Game.ts, PerformanceTier.ts, vite-env.d.ts, playwright.config.ts, e2e/058-device-tiers.spec.ts, public/_headers, artifacts/058). **Commit-first-then-gate** (inverted order) was forced by a live concurrent writer: the art-slot runner was finalizing e6 and its broad `-A` would have swept the loose 058 src into the e6 art commit (exactly how F-058-1 happened at e5). Committing first (8ba15b4) protected the delta; gates then ran against the exact committed bytes; e6's `-A` landed harmlessly on top (`6799580`). No firewall violations: no sim, no gameplay values, no asset changes in the delta.
