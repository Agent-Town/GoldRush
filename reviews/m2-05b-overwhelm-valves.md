# Review — tasks/012 M2-05b overwhelm valves (s28 gate)

**Verdict: PASS — integrated.** Output landed on the mount 2026-07-04 ~23:06–23:12Z (Robin relay), settled, gated on a healthy VM (load ~0.1), committed s28.

## Scope check

12 modified files + new `e2e/m2-05b-overwhelm-valves.spec.ts` + `reviews/shots-m2-05b/`. All within tasks/012 scope with three notes, none blocking:

- `src/vite-env.d.ts` (+3) not in the scope list but is additive diagnostics typings (`lastPulseAt`, `announcementDurationSeconds/Edge`) REQUIRED by the mandated acceptance probes — sibling-of-diagnostics, accepted.
- Task said `src/ui/styles.css`; repo file is `theme.css` — correct real-file adaptation, additive only.
- Task's do-not-touch lists BuildSystem, but its files-in-scope explicitly carves out `maxHpFor` wave-awareness (goal 5) — the diff does exactly and only that (per-instance `hpMax` store; the self-contradiction is the task file's, resolved in the goal's favor).

## Per-goal

1. **Thief cap** — `Balance.steal.maxConcurrent 2 / maxConcurrentPerWaves 6 / maxConcurrentCap 4`; spawn-time clamp via appended `liveThiefCount` provider (default `() => 0`), no scheduler changes. e2e forces pressure (share 1, cap 2) → rAF max-tracker max ≤ 2. m2-04 canary 7/7 untouched — cap never bites its windows, as tasked.
2. **Wrecker telegraph** — `wreckerCopy` announce at telegraph time when `isWreckerPulse` (predicate mirrors the spawn-path thiefCount/wreckerCount math exactly). Ledger voice, EDGE_PLACES naming ("north bank" / "west ridge") per §9.4. e2e: pulse-1 never, pulse-2 always. *Minor, cosmetic, recorded:* the predicate reads `liveThiefCount()` at telegraph (~2s before spawn) so an edge-case thief death/spawn inside the window can make the banner over/under-promise wreckers. Banner-only; accepted.
3. **Lull floor** — `lullFloor12: 8` default == `lullSeconds` → schedules byte-identical everywhere by default (the valve is the knob existing, per task). `lullSecondsFor(wave)` clamps ≥12 only. Knob-driven neutrality assert: wave-1 spacing == lullSeconds (0.5) to 4 decimals while floor12=2 → floor provably inert pre-12; wave-12 spacing ≥ floor. m2-03 canary 4/4 (incl. lull-window and timer tests).
4. **Theft ping + edge glyph** — `onThiefGrabbed` on BOTH grab paths (stockpile + loose pickup; task said "the m2-04 grab path", which covers both — design call recorded, veto at m2-07 if pickup-grab pings feel noisy). Banner accent + compass glyph (`data-testid=hud-edge`, rust circle, `:empty`-hidden), `announce()` extended additively (edge, durationSeconds default 4 == old hardcoded 4000ms). `?noping` added to the flag family; `?nosteal` suppresses upstream. AudioSystem `playPing()` is the sanctioned one-liner. Auto-hide knob `steal.pingSeconds 3`. e2e covers glyph correctness, auto-hide, both suppress flags.
5. **Palisade hp wave-scaling** — `wreck.hpWaveScale.palisade {perWave 4, startWave 6, capMult 2}`; `maxHpForPlacement` at placement time only, instances keep spawn-time maxHp (per-instance `hpMax` store; resetRun zeroes it). Bonus in-intent: `createTargetStore` static module-load `hpMax` read (the task's GOTCHA) is gone — targets sync live. DebugTools gained recursive folder binding so the nested knob section appears in the GUI.
6. **Repair cost** — `repairCostFrac 0.5 → 0.3`; m2-05 e2e knob-derivation fix applied to all four hardcoded amounts (only sanctioned change in that file). m2-05 7/7.
7. **Wrecker share** — `0.34 → 0.25` (directive: bandit pressure high). Knob.
8. **Wave-12 probe (mandated)** — 6-segment line at harness wave 12, wave-scaled maxHp asserted (> base), survives two harness wreckers' pulse-equivalent unwrecked, repair of one segment strictly < placement at current count, exact sink event asserted. Evidence shot shows all six segments standing under assault.

## Gates

- tsc clean, vite build clean (794 kB, 464 ms).
- New spec 5/5 green (desktop-chrome; ping test includes 390px viewport + zero console/page errors per test).
- Canaries: m2-03 4/4 · m2-04 7/7 · m2-05 7/7 · m1-03 5/5.
- **FULL regression, all 22 spec files** (sim semantics changed: wave knobs + placement hp): m1-01 8/8 (desktop+mobile) · m1-02 3/3 · m1-04 4/4 · m1-06 8/8 · m1-07 7/7 · m1-08 6/6 · m2-01 6/6 · m2-02 6/6 · m2-06 7/7 · feedback-fx 3/3 (incl. banner-fade, the canary for the Hud duration-timer change) · ui-upgrade-icons desktop+mobile · visual 5/5 · visual-polish-assets 2/2 · vp-02 9/9 · vp-02b 5/5 · vp-03 draw-calls ✓.
- **Exceptions (2, neither blocks):**
  1. `m1-05` "resetRun … renderer memory stable": fails 22→24 textures, **A/B-PROVEN ENV** — identical failure and numbers on pure HEAD (fingerprint-verified vite: served Balance.ts had no `lullFloor12`). s10 warm-pool-depth family, deterministic this VM-hour on BOTH trees. m1-05's other 5 green. Retire with a real pass on a future sweep (s19 pattern). Rest of m1-05: 5/5.
  2. `vp-03` "same seed renders deterministic bank ground": **NOT RUN** — exceeds the sandbox 45s bash wall this VM-hour (4 attempts incl. detached-run pattern; log never completed). Terrain-only, zero 012 adjacency (012 touches no terrain/render path). Run on the next faster VM window.
  - m1-03 "wave banner cadence" flaked once in-batch (31.4s timeout), then passed 3× consecutively (solo 22.5s, solo, in-batch 20.1s) — timing adjacency, not a defect.
- Visual review (shots regenerated by the gate run, copied to `reviews/shots-m2-05b/`): wrecker banner ✓ ledger voice ✓; ping glyph N + banner ✓; wave-12 six segments standing, wreckers illustrated not gory ✓ §9.2; 390px stacking/touch controls clear ✓ (mobile polish carry-forward unchanged).

## Design calls recorded for m2-07 veto list

- Pickup-grabs ping too (not just stockpile grabs).
- Wrecker telegraph REPLACES the wave copy on wrecker pulses (same announce surface, last-write-wins) rather than stacking a second banner.
- Defaults shipped ACTIVE for hp wave-scaling (perWave 4 from wave 6, cap 2×), share 0.25, repairCostFrac 0.3 — all Robin-tunable knobs; pre-valve sims byte-identical only where the task demanded (lull, cap-generosity, telegraph-free non-wrecker pulses).
