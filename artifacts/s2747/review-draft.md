# Drain review — audio-integration-first-boot-spec-1

Slice: audio-integration-first-boot-spec-1. Branch: sol/wave-lane-b. Tip: 33d2508c8cebae0017d00c8f32388b9e605dd8d8. Pre-drain main: 28095686429674fd80cfbaa6ddf50c09d21060b9. Merge base: 488a95c4d713bf9d53f780ed53a87239904d56e4. Candidate: 6c6c9c268d59bbc4aeedac13b12b480ae8777b53.

Verdict: PENDING full Node guards and final identity verification.

## What changed

The persistence test now opens Settings through a seeded returning-player profile. Previously it cleared storage, reached the first-boot card and waited for a Settings entry that card does not offer. It still sets volume to 25 percent and mute on, checks storage, reloads, and checks both restored controls; it also boots a run and verifies SoundSystem reads the restored values. The task quoted the preceding test's title; the actual defective row was settings volume and mute persist across reload. No product controls or gameplay changed. A player sees the same first-boot music toggle and returning-player Settings route in a plain boot.

## Evidence

- Source evidence: integration 4 pass / 1 fail on each baseline project, then 5/5 on each corrected project; unchanged adjacency 32/32. Intermediate diagnostic failures remain retained.
- Detached fire gates: TypeScript rc 0; ordinary and E1 builds rc 0; measured E1 first-town payload 34,355,296 bytes under 52,000,000. Candidate evidence budget 13.9 MB under 40 MB.
- Warm-up 1/1. Own and adjacent suites 62/62 across desktop and mobile, with workers=1: audio-integration, 050-audio-mix-and-access, audio-music-toggle, m2-01-build-menu, task-025-bandits-dont-swim and m1-01-claim-jumpers-death.
- Eight plain surfaces, desktop 1280x800 and phone 390x844: first boot, town, returning menu and run. Zero console/page errors. Screenshots and JSON under artifacts/s2747/plain-boots/.
- The candidate policy call returned rc 2 because the checker refuses linked worktrees. Both live-board primary-root strict probes returned CLEAR. This is an instrument invocation correction, retained in candidate-static.txt and audio-drain-policy-recheck.txt, not an allowed failing product gate.
- Normal screenshot output directories were initially mistaken for failure artifacts while Playwright was running. The completed batch returned rc 0 and 62 passed with no failures; no browser attribution or retry was needed. A clean control arena was prepared but not run.

## Merge classification

| Paths | Classification | Resolution |
| --- | --- | --- |
| e2e/audio-integration.spec.ts | LANE-TOUCHED only | Main has not moved the spec since the merge base; clean merge. |
| artifacts/audio-integration-first-boot-spec-1/** | NEW | Source report and retained evidence accepted as additions. |

No lane blobs exceed 50 MB. No src, assets, sim or engine-covered change. No conflict resolution, source cure or assertion weakening.

## Findings

F-AUD-16's obsolete first-boot Settings route is corrected by this candidate; closure awaits the complete gate verdict. No new product finding is established by the completed checks.
