# Review — task 028: Spark Rig target leading + stale-target switch

**Verdict: PASS — integrated by s49 (scheduled fire, 2026-07-05).**
Robin's reported symptom (parallel runner at a ford, all bolts miss until Q+Q) is reproduced by the spec's OFF leg and eliminated by the ON leg.

## The money numbers (in-VM, /tmp/gr-s49)

| Leg | leading OFF | leading ON |
|---|---|---|
| desktop-chrome | 0% (0/8) | **100% (8/8)** |
| mobile-chrome | 0% (0/9) | **100% (9/9)** |

Acceptance was ON ≥ 70% and ON > OFF; both cleared with maximal margin. Ford-speed crosser, hero static, single enemy (bolt-diffusion law respected — single-enemy scenarios keep attribution deterministic).

## Scope & architecture (diff review, 7 files, +205/−14 excl. pid bookkeeping)

- `Balance.ts`: +3 knobs only (`sparkRig.leading=true`, `maxLeadRad=3`, `missSwitchCount=4`). Zero existing values touched — task's "no weapon stats changes" firewall holds. (Task prose said `Balance.spark.*`; the real section has always been `sparkRig` — naming consistent in-repo. `maxLeadRad` clamps lead *distance* in world units, radius-not-radians; matches the knob name's literal task spelling.)
- `CombatSystem.ts`: `boltAimPoint()` predicted intercept (distance/projSpeed flight-time, clamped lead); per-shooter `missTargetId/misses` state; stale-switch drops lock via `targeting.reset()` only when the shooter's current target still is the missed target; `boltDiagnostics {hits, misses, staleSwitches}` + reset in `reset()`. Damage resolution path byte-equivalent; CombatSystem stays sole damage resolver. Lob/blast branch untouched (early-return before leading).
- `TargetingSystem.ts`: additive `currentTarget` getter only.
- `Enemy.ts`: `leadVelocity` from actual frame displacement (post-collision — bolts lead where the enemy really goes, auto-zero when blocked); `scriptMoveTo` + `scripted` flag (test harness; wave AI short-circuited only for scripted spawns; cleared on spawn/recycle).
- `Projectile.ts`: pool carries `shooterIds/targetIds` (reset on deactivate/recycleAll), `update()` gains optional `onExpired` — expiry = miss signal.
- `Game.ts` / `vite-env.d.ts`: test-surface additions (`scriptEnemyAt`, enemy `id/vx/vz`, `diagnostics.combat`).
- Wrong-enemy hits count as bolt-hit AND miss-vs-intended-target — correct for stale-switch semantics (hitting the wrong bandit IS failing your target).

## Gates (all in-VM this fire; Mac had suite green at 23:15L per s48)

- tsc EXIT:0, vite build green (409ms).
- New spec: 2/2 desktop + 2/2 mobile (own poll timeouts — s27 law respected).
- m1-02 auto-fire: attribution/motes ✓, pool-recycle/renderer-memory ✓ (exercises the new pool arrays). "stress pack" leg RED — **env exception**: A/B fails identically on pure HEAD (`__maxBolts` tracker 0 for 10s), s26 resource-refusal family, Mac authoritative.
- m2-06 arsenal 7/7 incl. turret line-of-sight (turrets are rig-kind shooters → they lead now; non-breaking) and stress blast pool.
- m1-01: 3/3 non-stress; stress leg was RED on 028 **and on pure HEAD** → main-side break, root-caused and fixed this fire as **F-028-1** (below).
- Shots: `reviews/shots-task-028/` desktop + 390 (bolt in flight at the ford; HUD on-brief; known pre-existing 390 minor: pause-hint chip near Build).

## F-028-1 — m1-01 stress `===96` broken on main (found via this gate, fixed s49)

Pure-HEAD A/B failed 95≠96; in-page probe: alive 96 → 95 → 94 over ~4s. `spawnStressEnemies` is one-shot (no refill), and 024-era damage tuning made the rig kill inside the settle window — the exact-96 assert was racing live combat and now loses deterministically. Corrective: `&nokill` on the stress URL (`isCombatDamageDisabled` has been wired in CombatSystem all along; task-025/m2-05b precedent). Intent — pool cap, spawn integrity, draw-call budget, fps floor — fully preserved; verified deterministic-green in-VM. One-line change + comment, orchestrator review-fix authority.

**Consequence: lane-d partial exoneration.** r2's decisive "expected-96-got-95 ON MAC = knob-off equivalence broken, no env excuse" was THIS main-side break, not lane-d's partial. Evidence retracted in `reviews/m6-actors-foundation-r2.md` addendum. Death-#2 verdict stands on the process facts (died mid-task, no audit report, byte-identical done file); the equivalence claim does not.

## Carried

- Full regression on Mac remains Robin-owed (s47 list #1b) — targeted sweep here per s46 precedent.
- VP-02 (tasks/004) Enemy.ts hold is lifted by this land; queue order per its file still applies.
