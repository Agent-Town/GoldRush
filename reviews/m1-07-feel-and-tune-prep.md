# Review: m1-07 feel-and-tune prep + Robin directives (session 5, 2026-07-03)

**Verdict: PASS** — commit `c2a46b9`. Codex session G `019f2845-9049-7970-ae36-5dcf45f38611` (12 chunks, 1 batched correction round, 1 supervisor fix). The 07 GATE itself is answered: Robin's wave-10 playtest verdict was POSITIVE (docs/playtests/2026-07-03-robin-wave10.md); M1 exit now needs only his confirm of the applied defaults.

## What shipped

1. **lil-gui Balance seam (spec §seam)** — every live-safe `Balance` leaf bound under `?debug`: folders Hero / Spark Rig / Enemy / Waves / Gold Seams / Beacons / XP / Charm + existing tuning/Camera. Pool sizes, spatialHash*, debugPack*, derived values skipped (documented); `separationRadius` onChange recomputes `Sq`. `gui.close()` default (overlap minor). `Copy JSON` button logs Balance for tuning write-back. `window.__GR_GUI__` + `__GR_TEST__.setBalance(path,value)` (dot-path, normalizes `rig.`→`sparkRig.`).
2. **Robin directives D1–D5 (binding)** — D1 cards: effect line derived from `deltas` (no hardcoded drift) + inline-SVG glyph per id, slot-named `data-slot="ui.upgrade.<id>"` for the art pipeline. D2 Balance defaults: camera lag .15 / lookAhead 1.35 / offset (0,26.2,18.3) / downLook 3.35 / exposure 0.75; maxDpr stays 2. D3 XP mote/bar contrast raised for exposure 0.75. D4 CTA "Try Again" (testid `stake-again` kept; one whitelisted old-spec assert updated). D5 `Scoreboard.ts`: localStorage `gr.scores.v1`, top-5 by waves→time, defensive try/catch, survives resetRun, current-run highlight, `__GR_TEST__.clearScores()`.
3. **Charm** — hit-pause ≤60 ms on kills w/ 250 ms cooldown, via the ONE sim clock (`GameState.setPaused`, guarded vs levelup/death states); camera impulse ≤0.15 m, 0.2 s decay, zero-alloc; `?nopause` harness param (family: nowaves/nokill/nospawn/nolevel); coin-tick blip (880→1320 Hz) per pan tick + HUD gold pop; banner flavor 4/edge, no immediate repeat, frontier-tech voice (no firearm words — checked); death flavor line kept with "Claim Jumpers turned back" ledger phrasing.
4. **Tonal pass** — `palette.wood` `#2e1b0e`→`#6b4a2f` (props read warm at gameplay zoom, screenshot-verified); XP mote emissive up.

## Evidence

- **45/45 e2e green** (9 files: visual 5, feedback-fx 3, m1-01 4, m1-02 3, m1-03 5, m1-04 4, m1-05 6, m1-06 8, m1-07-charm 7 NEW), `tsc` clean, build green. Hermetic per-run servers (see environment findings). Old suites ran WITH hit-pause enabled — no semantic breakage.
- Screenshots in `reviews/shots-m1-07/`: gameplay desktop + mobile 390px, upgrade cards (glyphs + effect lines, gui closed), death overlay (flavor + Best Claims + Try Again), stress=120 with full gui open (Robin's values live). Stress: 96 alive @ pool cap, frameMs avg ~48 ms SwiftShader (fps floor OK; draw-call ≤200 gate asserted by m1-01 stress e2e).
- Playable checkpoint: full loop incl. level picks, death, Try Again, scoreboard persists across runs.

## Findings fixed in-session

- Codex test-design: banner test used `timescale=40` (sim clamp saturates — wave 2 never arrives); rewritten via `setBalance('waves.waveInterval', 6)` + `resetRun`. Death tests were swarm-timing coin flips; now deterministic via `setBalance('enemy.contactDamage', 999)`.
- Supervisor fix: `upgradeEffect` dropped the `%` suffix on mult-based lines ("+30 spark damage" → "+30% spark damage").
- m1-06 "maxed upgrades" now needs `test.setTimeout(45_000)`: m1-07's richer card DOM ~doubles trace-snapshot cost of its 30-press loop (trace-off 16 s, trace-on >30 s). Not nondeterminism — pure budget.

## Carried minors (new)

- Card 2 description text can collide with pip row at longer effect strings — CSS polish with batch-002 icon integration.
- DebugTools gui ranges are heuristic (0–3×default) — fine for tuning, revisit if Robin wants wider bands.
- `state().balance` echo only exposes `rig.fireRate` (what the e2e needs) — extend when more knobs need assertion.

## Environment findings (CRITICAL for future sessions — also in STATUS)

- **headless_shell-1228 SIGSEGVs on the 2026-07-03 sandbox image** → `channel: 'chromium'` in playwright.config (full binary + libXdamage). Full chrome fetches `/favicon.ico` (shell didn't) → inline `data:,` favicon added to index.html.
- **Bash calls run in separate PID namespaces**: background vite servers from previous calls become invisible (no ps/fuser) yet keep serving — with STALE in-memory module caches; multiple listeners can coexist and connections round-robin between vintages. Consequence: cross-call `pw.reuse.config.ts` (port 5189) is UNSAFE — it silently ran part of a regression against pre-m1-07 code this session. **Rule: hermetic runs only** — base `playwright.config.ts` (own webServer per run, `reuseExistingServer:false`) for tests; for probes/screenshots start vite + client in the SAME bash call on a VIRGIN port and freshness-check a new-API symbol before trusting output.
