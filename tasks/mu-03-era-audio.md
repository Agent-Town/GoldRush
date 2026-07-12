# mu-03-era-audio — the Steamworks sings: era-aware music + steam SFX (lane-a; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-12.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **RESET AUTHORIZATION (attended, 2026-07-12):** every lane-a (`lane/m3`) ahead commit through tip `a37d1d36` (fix-music-loop) is CONTENT-ON-MAIN via attended cherry-pick (`f803f968`). Ancestry will look ahead while every diff is a SAFE DUPE: `git checkout -B lane/m3 main && git clean -fd` and PROCEED — do NOT re-STOP on aheadness.

## WHY: specs/epoch-saga/BUILD-PLAN.md E2 item ⑧ "E2 music loop + steam SFX (S)" — the LAST unbuilt E2 slice. The sonilo takes ALREADY EXIST: `marketing/raw/audio/era-e2-steamworks-take1.m4a` and `era-e3-voltage-take1.m4a` (generation done; this is wiring only). Owner is live in E2 with T2 pressed — he currently hears the E1 loop everywhere.

## READ-FIRST: tasks/done/20260711-101223-mu-02-wiring.md (the shipped wiring pattern — encode/lazy-load/autoplay-law) · src/audio/manifest.ts (era-e1-frontier-loop + title-theme entries) · src/audio/SoundSystem.ts (music group routing, musicGain, voice cap) · the mu-02 landed commit for how era-e1 got encoded into assets/audio + lazy chunks · src/meta/ContractFamilies.ts (how a contract knows its epoch/era) · assets/audio/LEDGER.md.

## SCOPE (each independently checkable):
1. Encode `era-e2-steamworks-take1.m4a` and `era-e3-voltage-take1.m4a` exactly as mu-02 encoded era-e1 (same codec/loudness treatment, lazy chunks — boot-critical bytes UNCHANGED, assert vs the perf baseline mu-02 recorded). Register `era-e2-steamworks-loop` + `era-e3-voltage-loop` in src/audio/manifest.ts (group 'music', loop true, volume matched to era-e1's 0.42).
2. Era-aware in-run loop selection: the in-run music picks its loop by the launched contract's epoch (E1 contracts → era-e1, E2 → era-e2, E3/dynamo-era contracts → era-e3; unknown/older → era-e1 fallback). Title/town keeps title-theme. NO change to the autoplay-gesture law, ducking, volume slider, or mute paths.
3. Steam SFX layer (E2 only): short hiss/clank/whistle accents on the E2 pressure verbs (boiler placed, vent/over-pressure, pressurize) following the EXISTING SFX pattern in manifest.ts + SoundSystem (respect the voice cap + governed groups; music never resets — the a37d1d36 loop-reset fix must survive, do not touch its code path).
4. e2e `e2e/mu-03-era-audio.spec.ts`: an E2 contract boot reports the era-e2 loop voice active (diagnostics probe as mu-02's spec did), an E1 contract reports era-e1, title-theme still gates on first gesture, music volume slider + mute still hold, zero console/page errors, desktop + mobile-390. Boot-bytes budget assertion (no new boot-critical audio).

## Firewall
Touch ONLY: assets/audio/ (new encoded files + LEDGER line), src/audio/manifest.ts, the minimal era-selection wiring in src/audio/ + the single call-site that starts the in-run loop, the steam-SFX trigger call-sites in the E2 pressure verb paths (calls only — no sim logic changes), e2e/mu-03-era-audio.spec.ts. NO sim/balance/economy changes, NO touching the shot/music-reset fix logic, NO other tracks, NO autoplay-law changes, NO marketing/raw edits (source m4a stays where it is).

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green · e2e/mu-03-era-audio.spec.ts green desktop+mobile-390 · the mu-02 spec (music entry/menu/slider) UNMODIFIED-green · zero console/page errors · report boot-bytes delta (must be ~0) + which chunk carries each loop.
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.
END: READY-FOR-GATES + report encoded sizes, chunk names, and the era→loop mapping table.
