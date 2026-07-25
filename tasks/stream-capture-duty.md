# stream-capture-duty — the channel feeds itself (standing duty, TK-01 pattern)

> ## ⛔ DO NOT QUEUE — BLOCKED PENDING OWNER RULING (s1034, 2026-07-25). F-1034-1.
> **Scopes 1 and 4 of this master were superseded by two owner rulings made TWO DAYS after it was
> written.** Queueing it as-is sends a runner to produce banned content and to write a file it no
> longer owns. Verified at file:line, not inherited:
> - **HEADLESS BAN** — `tasks/stream-rotation-curator.md:15`, owner 2026-07-14: *"HEADLESS CAPTURES
>   ARE BANNED from the pools (owner: 'gameplay is very slow' — headless browsers throttle the frame
>   loop): only real-speed footage enters (owner OBS recordings, or future headed captures on a
>   virtual display)."* Also `docs/marketing/BRAND-BOOK.md:26`. **Scope 1 is a headless capture**
>   (`scripts/stream-capture.mjs:38,117` = `chromium.launch({ headless: true })`).
> - **PLAYLIST LAW / one writer** — `tasks/stream-rotation-curator.md:16`, owner 2026-07-14: *"The
>   curator only ever edits the manifest."* **Scope 4 orders this duty to edit it too**
>   (`scripts/stream-capture.mjs:180-183` mutates + writes `loop-manifest.json`), while
>   `scripts/stream-curate.mjs:194` **fully regenerates** that file from its pools. Two writers on
>   one surface — CLAUDE.md §4.4. This already happened: the Jul-12 run's entries were erased by the
>   Jul-14 regenerate.
> - **Its output is unreachable anyway.** The curator's only pool for this directory accepts
>   `/^ceremony-[^.]+\.(mp4|webm)$/` (`scripts/stream-curate.mjs:43`), so the gameplay mp4 and both
>   slideshows are discarded at intake — `node scripts/stream-curate.mjs --check` prints
>   `IGNORED artifacts/stream-capture/capture-duty-gameplay.mp4 (not an approved ceremony-recording)`.
>   **Re-running scope 1-2 today changes nothing that any consumer can see.**
>
> **What survives:** scope 3 (ceremony recordings) — `ceremony-e3-voltage.mp4` is in the live loop
> today. Scope 5's honesty gate is still right. A NARROWED re-queue (ceremony-only, no manifest
> write) is lawful; **the gameplay feed needs Robin's ruling first** — see OWNER'S DESK / F-1034-1.
>
> **s1033's prescribed two-edit refresh (pre-flight + "run the existing script and refresh the
> manifest") must NOT be applied** — the second edit is precisely the superseded instruction. The
> missing pre-flight (F-1027-1 brick class) is still real and still owed by any future re-queue.

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
