# Drain review — audio-integration-first-boot-spec-1

Slice: audio-integration-first-boot-spec-1. Branch: sol/wave-lane-b. Tip: 68ad3e06f04f4e0b7b865305fbfbee9e79d5e18a. Pre-drain main: 075e97b6c5b9b3a4dc95221dc1b10f94c45a0cc6. Merge base: 26eefc2421f06450860f8226a4638dc0f4b7305e. Candidate: bf65df7de6402fc0efa7ff63746cc65a1171cdcc.

Verdict: PASS — READY-FOR-GATES. Accepted for fast-forward; F-AUD-16 corrected.

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

F-AUD-16's obsolete first-boot Settings route is corrected and its own plus adjacent gates pass. No new product finding is established by the completed checks.

## Final acceptance

Literal diff-selected guards: **5/5, rc 0**, **2252.199 seconds** on Node v26.4.0. Full npm Node command: **rc 0, 2249 seconds**, including its chained tail. The wrapper retains successful command verdicts rather than passing per-test output, so a final per-test count is not claimed. During the run the fixture sweep reported **162 owners, zero survivors, no failed children**. Power budget p95 **0.336 ms**; task, citation and caller guards green. The initial fire ledger battery was **1263/1263 plus kit 83/83**, rc 0; a new closing ledger battery follows the landing.

Main's intervening changes were this fire's lock refresh and evidence only, merged cleanly into the candidate as e467b7a2d0af73b73d2515a45cdd043ac53c8168. Final measured engine **999203109481b7906b00e957ee739ca015b05a692201f039b4a3062a2f344bd4** equals the existing pin; store **5793a967da46e8f00c0ba16f92f17dc10d36558d**. No src/assets/functions diff and no new pin or deployment. The pre-existing origin backup block F-2742-1 still applies; its unchanged rejected push is not repeated.

Regenerated adjacent screenshots were copied into artifacts/s2747/adjacent-rerenders/ before their original tracked paths were restored. All source and fire evidence is retained. The prepared control arena was not run because the browser batch passed without any failures. One long drain only; its required full Node command exceeded the approximate fire time budget, and no subsequent drain was started.

Post-landing closure: main ad483104d passed the complete ledger command **1263/1263 plus kit 83/83, rc 0**, in **226.829 seconds**. Final board and all four named lanes are DRY by their respective probes. The source merge is accepted locally; origin backup remains subject to F-2742-1.
