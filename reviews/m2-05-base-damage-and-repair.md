# Review — M2-05 base-damage-and-repair (tasks/009)

**Session:** s25 (scheduled fire, 2026-07-04T14:00Z lock). **Implementer:** Codex via relay (Robin's Mac). **Verdict: PASS — integrated.**

## Gates

- `npx tsc` clean; `npm run build` green (404ms, bundle 789KB).
- **New e2e `m2-05-base-damage-repair.spec.ts`: 7/7 green** (desktop-chrome, serial) covering acceptance (a)–(h): per-hit exact hp tracking, damaged-only HP bar, real breach via in-page rAF tracker (crossedThrough + reached), per-instance beacon shooter unregister (1→0), stockpile cap drop with banked 620 > cap 200 surviving (BLOCK-never-destroy), exact `repair_palisade` sink debit of 5 with replay == HUD, dwell interrupt = no debit, no-funds = blocked ring + float + no progress, nearest-building targeting with hero ignored, wave neutrality without buildables, `?nowreck`, and ×3 wreck/repair no-orphan (shooters, geometries, draw calls ≤ baseline+2).
- **FULL regression: 99/101 unique tests green across all 20 spec files** (per-file ≤45s batches, fresh webServer per run). The 2 non-green are A/B-proven env exceptions (below), both failing identically on clean HEAD.
- **Integrity note:** tasks/010's relay output began landing on the mount MID-GATE (Hero.ts 14:16Z, SpriteAnimator 14:21Z, vp-02 spec 14:24Z) and my A/B rsyncs pulled it into the test env — a masking channel (009's wrecker requests `grab` clips; 010 touches SpriteAnimator). **The entire suspect back half (m2-02 → visual, 16 files) was re-run on a guaranteed pure-009 tree** (010 files pinned to HEAD): all results above are from that pure-009 pass. The vp-02 innocence pair was also redone pure (pure-009 fail / pure-HEAD fail 2/2, identical). 010 itself is NOT gated here — its lane is settled and queued for the next fire.
- Canaries all green: m1-01 4/4, m1-03 5/5, m1-05 6/6, m2-01 6/6, m2-02 6/6, m2-04 7/7, m2-06 7/7, vp-02b 5/5, feedback-fx 3/3, visual-polish-assets 2/2, vp-03 2/2, visual 5/5, m1-02 3/3, m1-04 4/4, m1-06 8/8, m1-07 7/7, m1-08 6/6. m2-03 3/4, vp-02 3/4 (env exceptions).
- Zero console/page errors asserted in every test incl. 390px viewport.

## Env exceptions (A/B-proven innocent, ride the next healthy-VM sweep — s19 retirement pattern)

1. **m2-03 "next-wave timer"**: wave reaches 2 in-window (s16's exact recorded signature). Clean HEAD fails 2/2 identically. VM this hour is at its slowest observed (~6fps class).
2. **vp-02 "warmed test clip swaps"**: renderer memory 11 vs 10 (s10 ±1 warm-depth family). Clean HEAD fails 2/2 identically. No 05 code path can upload GPU objects in this test (wreck visuals stay `visible=false` without damage).

## Scope review (watches from tasks/009)

- **CombatSystem: bolt/contact paths byte-identical** ✓ — diff is purely additive (resolver registration, `damageBuilding`, events) plus one type-only import.
- **WaveSystem: spawn-time flagging only** ✓ — wreckers drawn from the non-thief remainder (thief flag wins), cadence `pulse % pulseEvery`, minWave + share with min-1; no scheduler/curve diffs.
- **Economy: BuildSink widening + additive summary only** ✓ (`repair_${BuildableId}`, repairSpent/repairs incl. run_reset).
- **Sluice.ts (+5, DO-NOT-TOUCH list): judged in-intent collateral** — income ticks inside SluicePool, so the sanctioned "read-only wrecked-gate where sluice income ticks" landed as an additive `enabled(index)` predicate defaulting to `() => true` (pre-05 behavior byte-identical); also stops the water visual on wrecked sluices. Accepted; internals/cadence untouched.
- Unlisted-but-expected collateral, all additive: EventBus (2 event types), DebugParams (`?nowreck`), pools.ts (wrecker context + third poncho tint), vite-env.d.ts (test surface). Accepted (s18 intent-vs-scope precedent).
- BuildSystem (+545): per-(family,index) hp/wreck/repair/shooter stores; `resolveBuildingDamage` is the sole hp mutation point, registered into CombatSystem; harness `wreck()` routes through it at remaining-hp ✓. Pooled visuals: ONE InstancedMesh (capacity×2 slots: hp bar + rubble, zero-scale hidden) + ONE repair ring with drawRange progress → draw calls Δ ≤ +2 ✓ (no-orphan e2e asserts it). Blockers getter filters wrecked palisades → real breach feeding the untouched steering algorithm ✓.
- Behavior note: `hasBuiltStockpile()` now requires an ACTIVE stockpile → thieves stop spawning while your only stockpile is a ruin. Judged correct 05 semantics (function off = not a robbable base signal). m2-04 canary green.
- Canon: wrecking crew = Claim Jumpers with bandana tint + crowbar placeholder (§9.3 ✓), dust puffs not gore (§9.2 ✓), no new factions, naming clean (§9.4 ✓). No secrets client-side.

## Gate corrections (supervisor, <20 lines each, documented in-file)

1. **m2-05 damage test**: hp+hits sampled atomically in one evaluate (separate round-trips straddle a swing at ×8 — s23 atomic-sample family).
2. **m2-05 damage test**: evidence-shot composition — hero teleports to (0,6) after the hit poll so wall + wrecker + HP bar are in frame (camera follows hero; the action was ~14 units outside the frustum).
3. **m2-02 canary (modernized, A/B first)**: log+gold+HUD sampled in ONE evaluate; replay equality asserts unchanged. Clean HEAD failed 3/3 before the fix → pre-existing race, slice innocent.
4. **m2-06 canary (modernized, A/B first)**: stress-pool rAF tracker gets an explicit samples>2 poll before asserting (one poll round-trip spans ~2 frames at ~6fps). Clean HEAD failed 2/2 → env.
5. **m1-08 canary (amended, s23 amend-don't-weaken)**: `summarizeLog` strict `toEqual` now includes the 009-firewall-sanctioned additive summary fields at 0 (`repairSpent`, `repairs`). Strict deep-equality retained. This was the only REAL slice-caused canary break, and it is the sanctioned-surface-change family, not a defect.

## Evidence

`reviews/shots-m2-05/`: wrecker-mid-swing.png + damaged-hp-bar.png (wall, black-reading HP bar, wrecker at the wall face), ruin-breach.png (three ruins, enemy through the former wall line, HUD 525/200 banked>cap), repair-ring-mid-dwell.png (repair verb end-to-end: "-5" sienna float + restored palisade; at ×8 the 1.2s dwell is sub-frame so the ring shows as a completion sliver — captured honestly rather than staged), 390px.png. NOTE: Codex's Mac-run shots were overwritten by its mobile-chrome project pass (same filenames, both projects run under the base config) — the committed set is from the sandbox desktop-chrome gate runs. Harness improvement candidate: suffix shot filenames per project.

## Findings (non-blocking, carried)

1. **Repair ring reads faint at gameplay zoom** — pale gold (#ffe4a0) thin ring on parchment sand. Polish candidate (07 charm or tasks/012's awareness pass).
2. **HP bars + rubble read near-black** at exposure — joins the existing dark-wood tonal carry-forward (visual-polish list).
3. In-radius non-nearest ruin keeps frozen (not reset) repair progress while a closer ruin is dwelt — geometrically hard to trigger (radius 1.4), cosmetic; spec letter says reset-on-leave which does hold for out-of-radius.
4. TargetingSystem building registry filters `active && hp>0` instead of unregister-on-wreck — equivalent semantics, bounded by per-(family,index) stable target objects. Letter-vs-behavior deviation accepted.
5. `hasAnyBuildable` counts ruins → wreckers can spawn into an all-ruins base and behave as normal jumpers (spec-consistent fallback). Watch at m2-07 tune.
6. Wrecker banner telegraph (spec "MAY") did NOT ship → now REQUIRED via Addendum-3 valves, carried in tasks/012.
7. Post-repair re-blocking has no direct e2e assert (breach test proves the wrecked direction; repair restores via the same filter). Covered by code review; candidate assert if 012 touches the area.

## Addendum-3 valves (Robin directive, rode this gate as its trigger)

All four outstanding → **tasks/012-m2-05b-overwhelm-valves.md written this session**: thief concurrency cap knob, distinct wrecker telegraph banner, lull floor retune at wave 12+, theft alarm ping + edge-direction indicator. Recommended chain: 010 → 012 → 011 (011 shares HUD surface with 012; valves before cosmetics).
