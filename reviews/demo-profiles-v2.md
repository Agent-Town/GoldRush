# Review — demo-profiles-v2 (lane-a / lane/m3, OWNER-PRIORITY Demo Day)

**Verdict: GATE-PASS — merged to main by s82 fire (2026-07-06T13:xxZ).**

Re-land of Demo Day per-kid player profiles on fresh main (predecessor `save/demo-profiles-v1`
was stranded 20h-stale with 4 conflicts; owner ruled re-run over hand-merge). Single clean
lane commit `aee6015` "m3: reland demo day profiles", 1 ahead of its base, merged onto current
main (11 commits ahead: 039, art-sweep, etc.).

## What landed (firewall-clean)
- `src/game/ProfileManager.ts` (NEW) — create/select per-kid profiles.
- `src/game/ProfileStorage.ts` (NEW) — per-profile keyed storage wrapping meta (migration-safe;
  goes through the 031b-guarded path).
- `src/game/Scoreboard.ts` — per-profile Best Claims (sibling rivalry).
- `src/main.ts` — profile wiring at boot.
- `src/ui/DeathOverlay.ts` — profile-aware overlay (respects 027 victory payout).
- `src/ui/theme.css` — profile UI (additive).
- `src/vite-env.d.ts` — profile test hooks (additive; auto-merged with main's block, no conflict).
- `e2e/m3-06-demo-profiles.spec.ts` (NEW) — 8 tests.

Merge: clean 3-way auto-merge (`vite-env.d.ts` the only shared file, additive both sides).
No conflicts. Firewall respected (no sim/Economy/agent/crafting touch; meta wrapped per-profile).

## Evidence
- `npx tsc --noEmit` — clean (merged tree).
- `npm run build` — clean (only pre-existing chunk-size warning).
- `e2e/m3-06-demo-profiles.spec.ts` — **8/8 both projects**: profile isolation + meta/slot
  suspension + Best Claims; legacy single-profile migration into "Robin" with difficulty/hints
  defaults; difficulty-preset key follows active profile; running profile keeps storage when
  another tab switches active profile.
- `e2e/task-024-blast-aim-presets.spec.ts` — **10/10 both projects (isolated)**, incl. `:88`
  difficulty-presets persist by profile key AND `:130` storage-blocked fallback (031b) — proving
  the new per-profile difficulty binding is compatible with 024's contract (the s51 divergent-key
  risk did NOT materialize).
- `m1-01` 8/8, `m2-01` 12/12, `task-025`, `lane-c-activations` — green (from the 039 gate this
  same fire, and the batch below).

## ENV EXCEPTION (proven, load-dependent — not a regression)
In a 3-spec parallel batch (`m1-01` + `m2-01` + `task-024`, 2 workers), `task-024:88` FAILED on
both projects. Re-run in isolation it PASSES deterministically: `:88` alone → pass; full
`task-024` spec → **10/10 both projects**. `:88` is a slow (~11–13s) preset-persistence test;
run concurrently with `m1-01`'s stress=120 test it times out under host load. This is the same
load-dependent flakiness documented at s80 (fps-floor env exception). Load-independent
correctness — difficulty presets apply + persist by profile key, storage-blocked fallback — HOLDS.
Not caused by demo-profiles-v2.

## Follow-on (per BACKLOG lane-a ladder)
Queue SCI-01 research loop next (its GATE = "after demo-profiles-v2 MERGES"). Deferred to keep
this fire's drain scope tight; noted in handoff.
