# Lane A / M3-02 — suspend-resume + run victory structure (worktree lane-a, branch lane/m3, prefix "m3:")

PRE-FLIGHT (runner era): verify the worktree is on lane/m3 rebased onto CURRENT main (m3-01 is fully merged — `git reset --hard main` is correct if the branch has no unmerged work). If the worktree is stale or unregistered, STOP and report; do not build against an old base.

READ: AGENTS.md · docs/decisions/ (ADR-002 install/merge law) · docs/VISION-HOOKS.md §Save (BINDING) · reviews/m3-01-run-scaffold.md (findings 2 and 3 are correctives on THIS slice) · your landed src/game/RunManager.ts + src/game/MetaProgress.ts.

## 1. Suspend/resume (VISION-HOOKS §Save item 1 is binding, verbatim)

- Single slot `gr.run.v1`: versioned envelope + tolerant migration (junk or version mismatch → discard slot, boot fresh; NEVER crash boot — MetaProgress precedent).
- Autosave triggers, exactly two: (a) **wave boundary** — snapshot the LULL state before wave N+1 spawns. Preferred mechanism: ONE additive `wave_started` emit in WaveSystem at the pre-spawn point + append-only EventBus union addition (m2-03 staying green UNMODIFIED is your no-drift proof); fallback if ordering fights you: poll `waveSystem.diagnostics.wave` from RunManager's update. (b) **quit/hide** — pagehide + visibilitychange(hidden). NO continuous autosave, NO manual save button (no scum surface).
- Snapshot contents: hero (pos/hp/xp/level/upgrade picks), live entities incl. carried gold, wave index + scheduler phase, buildings (type/pos/hp, ruins included), gold + Economy log TAIL — the log is capacity-capped (`Balance.economy.logCapacity`): store tail + derived counters, never assume full history.
- Restore goes through each system's OWN additive `snapshot()/restoreFrom()` methods — Economy restores only via Economy (sole-gold-writer law intact), CombatSystem untouched. Zero behavior change when no slot exists: pre-M3-02 sims byte-identical; existing suites passing UNMODIFIED is the proof.
- DELETE the slot on hero death (before DeathOverlay renders) and on banked run end. A fatal or finished run never resumes.
- Resume UX — DESIGN CALL (the old stub was stale; there IS no title screen): a boot-time choice overlay ONLY when a valid slot exists — "Continue claim (wave N)" / "Break new ground" (deletes slot, boots normally). No slot → boot exactly as today, byte-green boot probes. HUD-styled, ledger voice, keyboard + touch.
- Restores must not fire pickup floats, kill counters, or receipts — floats announce changes, not state re-entry.

## 2. Run victory (all knobs in NEW `Balance.run`)

- `Balance.run.secureWave` (default 20): reaching it = run WON. "Claim Secured" ceremony: banner + ledger summary (reuse RunManager's `summarizeRun`) + explicit CHOICE — **Bank the claim** (end run → `run_ended{reason:'secured'}`) vs **Stay for the Rush** (endless: scheduler keeps escalating; a later death banks normally → `run_ended{reason:'death', endless:true}`). Staying NEVER voids or reduces the outcome vs banking — prosperity framing, brief §9.2.
- SCOPE FENCE: NO meta earn/spend logic — RunManager has none today and M3-03 owns payout; records/leaderboard UI is M3-05. You extend `RunSummary` additively (`reason`, `wavesReached`, `endless`) and emit. Do not invent earn rules.
- `e2e/m3-01-run-scaffold.spec.ts` pins the summary shape with strict `toEqual` (~line 65): you MAY amend exactly those asserts for the additive fields (s23 law) — flag every amended assert in your results.

## 3. Correctives carried from m3-01 review

- Finding 2: ADD an in-page run-lifecycle e2e assert — a real (debug-forced) run end visibly mutates the `gr-meta-debug` readout in-page. Persistence-only coverage is no longer acceptable.
- Finding 3: the resetRun wrap is single-patcher — EXTEND your own patch, never add a second wrapper. If reset interception must become shared, promote to a real `run_reset` event emitted by RunManager only.

## e2e (new `e2e/m3-02-suspend-resume.spec.ts` + hermetic module tests per your m3-01 pattern)

1. Boundary autosave → reload → continue overlay shows wave N → resume → equality: gold, wave index, building count+hp, hero hp/xp/level, Economy log tail.
2. Death → slot deleted → no overlay on reload.
3. "Break new ground" deletes the slot.
4. Debug-forced low secureWave → ceremony renders → Stay for the Rush → wave N+1 actually spawns → forced death → `run_ended` reason/endless correct.
5. In-page lifecycle assert (finding-2 corrective above).
6. No-slot boot: no overlay, zero console/page errors, both viewports.
7. Hermetic: junk slot JSON → discarded, fresh boot, no throw.

## Acceptance

tsc/build clean · new suite green both projects · UNMODIFIED-green canaries: m3-01 (except sanctioned summary asserts), m1-05, m2-03 (scheduler drift), m2-05 + m2-05b (building hp), vp-02, visual.spec · boot probes desktop+390 zero errors with-slot AND without-slot · shots: continue overlay, ceremony, endless HUD.

Do not touch: CombatSystem damage paths · Economy write paths (additive snapshot/restore methods only) · Game.ts (ADR-002 §4 — list any wiring you NEED as one-liners in your results; prefer zero, `install(game)` already reaches you) · src/assets/OrientationResolver.ts + SpriteAnimator (tasks/024's scope) · assets/ · layer contracts · STATUS.md · specs/. Balance-constant tweaks acceptable-by-default (log them in results); Balance/economy STRUCTURE changes gate.

Finish: READY-FOR-GATES + files + results (incl. amended-assert list + requested merge wiring one-liners).
