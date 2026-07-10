# Task sc-01-stream-runner: the Factory Channel's engine — headed QA runs with a ledger overlay (lane-a; commit prefix "feat:")
CODEX: model=gpt-5.5 effort=medium
FROM `specs/marketing/README.md` STAGE 2.8 SC-01 (owner re-push 2026-07-10: "what about the streaming and video generation/highlight setup?"). SC-02 (RTMP keys) stays on the owner desk; this slice makes the content EXIST without any platform.
You are Codex in worktrees/lane-a. Pre-flight per LANE-SAFETY. READ FIRST: Stage 2.8 verbatim (its LAWS: scheduled windows, honesty absolute — red tests stream too, no token talk), `scripts/capture-footage.mjs` + `marketing/shots.json` (the proven rig), the seeded-run debug params (`?debug&seed=`).
## Scope
1. **`scripts/stream-runner.mjs`**: plays a PLAYLIST of seeded scenarios (json: contract, seed, duration, scripted inputs or autopilot-simple) in a headed chromium at 1080p, recording each segment to `marketing/raw/stream/` (v1 = RECORDINGS, not live RTMP — the loop that SC-02 later pipes out).
2. **THE LEDGER OVERLAY**: a DOM overlay injected per segment — current task line (from the playlist entry), merge hash, a pass/fail ticker fed by the segment's own assertions (green PASS / red FAIL stays on screen — honesty law).
3. **A starter playlist**: wave-20 Claim run, Dry Gulch spring rush, Night Shift dawn survival, Hill Mine railcar fight (seeded, ~3-5 min each).
4. Gate: one full playlist run produces the recordings + a segment manifest (durations, verdicts); zero edits to game src (rig-side only).
Firewall: the runner script + playlist json + overlay injection + manifest ONLY. NO src/ changes, NO live streaming, NO posting.
End: READY-FOR-GATES + the manifest + one segment's first-frame screenshot.
