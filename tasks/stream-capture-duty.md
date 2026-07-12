# stream-capture-duty — the channel feeds itself (standing duty, TK-01 pattern)
ROLE: capture pipeline. WORKDIR: lane-d (worktrees/lane-d). RECURRING: re-queue on every era gate + weekly refresh (fires refill per BACKLOG line).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner 2026-07-12: "how do we make filling of the pipeline automatic?") — the loop-manifest gains three AUTOMATIC feeds; the owner's role is veto-only (delete a manifest line, it leaves the loop next fire cycle).
## READ-FIRST: tasks/stream-loop-pipeline.md + assets/stream/loop-manifest.json (the class-delegation fence — ONLY finished game footage/era art/ceremonies/own-music; no unreviewed art, no readable text beyond the wordmark) · e2e/fix-dry-gulch-frozen-waves.spec.ts (proven headless seeded-run driving) · playwright video recording (recordVideo context option) · docs/marketing/RELEASE-AND-EPOCH-PLAN.md capture specs.
## SCOPE
1. scripts/stream-capture.mjs — headless playwright: boots a seeded run on a SHIPPED contract (rotating roster: the Claim, Dry Gulch, Night Shift, Twin Banks, Hill Mine), timescale-normal, autoplay defenses via the debug seams, records 60-90s of the best window (waves 3-8), 1080p mp4 (h264 via ffmpeg from webm). Deterministic seeds per date → fresh-but-real footage. Zero UI overlays beyond the game.
2. Feed 2: art-drain slideshows — on invocation, regenerate kit-era + plate slideshow mp4s from the CURRENT processed art (5s/still, ffmpeg), replacing prior versions in the manifest (same ids).
3. Feed 3: ceremony recordings — when a T-ceremony e2e exists (072 grammar), a capture variant records the full ceremony play-through once per era and manifests it.
4. Every run of this duty: update loop-manifest.json in the SAME commit (class-delegation cited per entry), run stream-sync dry-check.
5. Honest gate: captured footage must show zero console errors during recording and no debug UI in frame (assert + eyeball frame samples in artifacts).
## TOUCH-ONLY: scripts/stream-capture.mjs, assets/stream/loop-manifest.json, artifacts/stream-capture/, ~/GoldRushStream staging via stream-sync only. NO src/, no OBS, no publishing beyond the delegated folder.
## SELF-CHECK: node --check; one full capture produced + ffprobe'd; manifest valid JSON; frame samples attached.
END: READY-FOR-GATES + one sample capture's frame strip.
