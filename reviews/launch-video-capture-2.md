# Drain review: `launch-video-capture-2`, the launch film's live captures are shot, all ten items, with the owner's answers applied (Opus 5.5 implementer at max effort; F-VIBE-Q)

**Branch** `feat/launch-video-capture-2` at `12846ac1a` · **merge** `98e87f91a` · engine hash unchanged (`7bfbed8b`, no pin) · drained attended 2026-09-26 22:30Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `lvc2`).

**Verdict: LANDED.**

## What it does
Phase 1 of the launch film wrote the treatment and stopped at three questions; the owner answered them on 2026-09-26 (no Baron ride, so the film cuts at his arrival; printed text slips; county boards unnamed). Phase 2 executes the treatment's capture runbook and its ten-item list with those answers applied: headed Chromium (the brand book bans headless), 1280x800 at DPR 1.5 for 1920x1200 masters at 60 fps and 390x844 for the 9:16 cut, the capture profile "Wren", telemetry opted out, no `debug` and no `seed`, every batch inside the drain lock on port 5322 with its vite stopped by pid, and no request to the live county reaching the network in any take. Kept: 23 clips (4,455.7 s) and 145 stills in `~/.goldrush/launch-video/` (outside the repository), 22 cut files with reasons; the treatment's new "Phase 2: capture list, as shot" section lists them all and a verify script proves the list matches the disk. The Baron's arrival is on film from a real 1x ride to wave 20 on the plain seed (the unlock STAGED on a copy of the capture profile's ledger, disclosed). Nothing large enters the repo; the capture scripts live under `scripts/launch-video/` and run in no battery; the engine hash is unchanged.

## Evidence (the implementer's runs on `ab0e3cb6b`, base `a50ec8281`; the drain's own gates are appended below)
| Check | Result |
| --- | --- |
| capture list vs disk | `scripts/launch-video/verify-capture-list.mjs` green: 168 kept files (23 clips, 4455.7 s) and 22 cut files match the disk; every clip's duration within 0.5 s |
| build | `npm run build` rc 0 (26.7 s); engine hash unchanged `7bfbed8b…`; nothing under src, assets, site, e2e, functions, package.json |
| batches | 10 (3 probes, 1 rehearsal, 6 captures), all under the drain lock on 5322, every vite stopped by pid |
| network and errors | zero live-county requests in any take; zero console/page errors except the two Field Book takes, which log their aborted county requests |
| the Baron (t3) | real 1x ride to wave 20: taunts at waves 5, 12, 18; cut point at 524.5 s; banner 529.5 s; his men at the ford 533 s; frame gap p95 17.3 ms; t1 fell at 17, t2 at 19 |
| Night Shift | three takes, a lantern relit on camera in each; all end when Wren falls at wave 12 |
| contact sheet | 570,877 B |

## Merge classification
Base `a50ec8281`; the branch touches `docs/marketing/launch-video/treatment.md`, new files under `scripts/launch-video/`, `artifacts/launch-video-capture-2/` (the report and the contact sheet); main moved on none of them. LANE-TOUCHED only; hash unchanged.

## Findings
- **F-LVC2-1, F-LVC2-2, F-LVC2-3 (OWNER'S DESK, by the cure):** STAGED frames in the public cut; the scripted pilot; the end card's second line.
- **F-LVC2-4 to F-LVC2-7 (game, DEFERRED):** the bare `?contract=` boot, the charter swallowing clicks, the dev-only button in board frames, the Lantern Show's local address.
- Remaining gaps as the treatment lists them (plates, fonts, the Pan Theme's length, the vertical's upscale, no clear frame of the Baron himself).
- Process: the implementer reported one read-only `pgrep -lf` before its compaction (the pattern form is forbidden); nothing was harmed. The report file was refused by a hook and committed by the attended session from the final message (`12846ac1a`).

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=0   24 passed (1.9m)  22:11Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1037 ℹ pass 1032 ℹ fail 0 ℹ skipped 5 ℹ tests 87 ℹ pass 87 ℹ fail 0 ℹ skipped 0  22:30Z` |
| engine hash | `merged: 7bfbed8b0c6ecfff4ec3aa9457f74866bcc49c119a242631f2ac9b783a246551 (pinned 7bfbed8b0c6ecfff4ec3aa9457f74866bcc49c119a242631f2ac9b783a246551)` |
