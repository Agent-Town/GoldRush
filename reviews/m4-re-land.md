# Review — m4-re-land (lane-b / lane/m4)

**Verdict: GATE-PASS — merged to main by s82 fire (2026-07-06T13:xxZ).**

Re-land of the M4 Prospector embodiment + agent voice on fresh main (single lane commit
`557782f` "m4: re-land prospector body and voice", 1 ahead of merge-base `40549e7`, 13 behind).
Predecessor salvage-ref `save/m4-embodiment-voice-v1`.

## What landed
- `src/agent/Embodiment.ts` (NEW, 237) — Prospector body/movement toward agent targets.
- `src/agent/Voice.ts` (NEW, 60) — floating ledger-voice lines.
- `src/agent/AgentStub.ts` (+84) — receipt→embodiment wiring; `__GR_AGENT__` debug hook.
- `src/game/Game.ts` (+89/−2) — installs embodiment/voice; the 2 deletions are lane/m4's own
  in-place edits (import-line expansion + agentStub install refactor), NOT dropped main/vista
  code (verified: main's only Game.ts commits since merge-base are the vista work, preserved by
  the 3-way).
- `src/ui/Hud.ts` (+21), `src/systems/UiBridge.ts` (+9), `src/styles.css` (+46, auto-merged with
  039's styles hunk), `src/assets/slots.ts` (+1), `src/game/Balance.ts` (+12 additive),
  `assets/layer-contracts/characters.v2.json` (+8).
- `e2e/m4-06-embodiment.spec.ts` (NEW, 199) — 8 tests; lane evidence screenshots in
  `artifacts/m4-re-land/`.

## Merge resolution
Auto-merge clean on Game.ts, styles.css, Balance.ts. ONE conflict: `src/vite-env.d.ts` — lane-a
(just merged this fire) added `__GR_PROFILE__` and lane/m4 adds `__GR_AGENT__` to the same
`Window` interface region. Pure additive union — resolved by KEEPING BOTH optional-property
declarations (no semantic overlap; the `GrAgentStub` type import auto-merged in cleanly). No
other conflicts; no markers remain.

## Evidence
- `npx tsc --noEmit` — clean (merged, resolved tree).
- `npm run build` — clean (only pre-existing chunk-size warning).
- `e2e/m4-06-embodiment.spec.ts` — **8/8 both projects**: plain boot renders Prospector near the
  claim (no debug gate); debug receipt moves it toward a panning target + floats ledger voice;
  permission-denied receipts do NOT move it; Prospector has no collider for scripted enemy movement.
- Regression: `e2e/m3-06-demo-profiles` **8/8** (lane-a intact after lane-b), `m1-01` 8/8,
  `m2-01` 12/12 (single-worker, no flake) — both projects.
- Zero console/page errors desktop 1280×800 + mobile 390×844 (spec error buckets).

## Notes
- Copy/permission honesty preserved: permission-denied receipts are inert (permission ladder holds).
- Firewall respected: agent/embodiment/voice + HUD + additive Balance/styles/contract; no sim or
  economy semantics changed.
