# Music toggle — implementation and gate evidence

Task: `lane-b--20260928-141559-audio-music-toggle-1.md`. Baseline `bbabf5617b0efca0b3bd0c5bf52d0797524f6909`, branch `sol/wave-lane-b`.

## Landing status

Attempt 2 applies the previously prepared patch to the now-authorized `src/game/ProfileStorage.ts`. The music-off key is registered in both the profile data set and the late migration list, exactly like the other audio preferences. The new browser suite now passes **10/10**, including both profile-isolation cases. Attempt-1 commits `a029c8f8e` and `88542b748` were retained without reset or reimplementation. This attempt changes only the registry source and task evidence.

The other controls use the existing audio preference subscription and stop/resume path. Music Volume is untouched by the toggle, M remains mute-all, and ambience/SFX remain audible. A post-download guard rejects a music loop switched off while its buffer was loading. HUD owns its own shared UI binding, so no Game wiring change is needed.

## Interaction counts

Before counts are from the audio review table 3(d), read in the main working tree (`reviews/audio-review-1.md` is absent from this lane checkout). After counts are browser-verified on both projects.

| Surface | Desktop before → after | Phone 390 px before → after |
|---|---|---|
| Running claim, music only | 3 (+ scroll) → 1 | 3 (+ scroll) → 1 |
| Town bar | 2 → 1 | 2 → 1 |
| Returning-player menu | 2 → 1 | 2 → 1 |
| First-boot card | no direct control → 1 | no direct control → 1 |

## Pause slider measurement

Measured at scrollTop 0 before Playwright interacts with or auto-scrolls the slider. The extra Music checkbox is below Music Volume, so it does not move the slider downward.

| Project | Viewport | Panel visible vertical bounds | Slider vertical bounds | Scroll needed? |
|---|---|---|---|---|
| desktop-chrome | 1280×800 | 82–750 | 769.67–785.67 | Yes |
| mobile-chrome | 390×844 | 126–762 | 796.13–812.13 | Yes |

Raw geometry: `pause-panel-desktop-chrome.json`, `pause-panel-mobile-chrome.json`.

## Evidence

JPEG quality 80, inspected visually: `hud-desktop-chrome.jpg`, `hud-mobile-chrome.jpg`, `town-desktop-chrome.jpg`, `town-mobile-chrome.jpg`, `first-boot-desktop-chrome.jpg`, `first-boot-mobile-chrome.jpg`, plus returning-player `menu-*.jpg`.

Strict console and page-error records: `errors-*.json`, no suppression filter. Tests cover one-tap stop, live resume, SFX while music is off, slider preservation, reload persistence, no fetch while off, Settings synchronization, first boot, per-profile storage, and a pending-download race.

## Verification

- Attempt-2 preflight: the two declared predecessor commits were ahead; no uncommitted source edits. Pre-existing `logs/guard-stats.jsonl` left untouched. No evidence discarded. The required npm install changed package-lock.json; that install-only churn was restored before the source edit.
- `npm install --no-audit --no-fund`: exit 0.
- Baseline `npm run build`: exit 0, including asset diet.
- Attempt-1 initial new-spec run: 4 passed / 2 failed, exit 1. Both failures were the test expecting the menu after profile creation; the existing product enters town. Corrected the new test's assertion to town.
- `npx tsc --noEmit`: exit 0 (`tsc.log`).
- `npm run build`: exit 0 (`build.log`), including asset diet. Existing Vite config/chunk-size and asset-diet warnings remain.
- Attempt-1 new spec: 8 passed / 2 failed because the registry was outside the old firewall. Attempt-2 new spec: **10 passed / 0 failed, exit 0** (`new-tests.log`), 5 per project, including profile isolation and pending-download races. The inherited run test uses `?debug&nowaves&nolevel`; menu, town, and first boot use `/`. A no-debug run entry is not separately exercised by this spec.
- Strict console/page errors across the ten new-test records: **0**.
- `git apply --check artifacts/audio-music-toggle-1/profile-registry.patch`: exit 0; the patch was then applied successfully in attempt 2.
- Attempt-2 adjacent suites: **44 passed / 0 failed, exit 0** (22 per project; `adjacent-tests.log`). Existing e2e files were not edited. All console-watch suppression counts printed by the adjacent suite are zero.

Commands use a dedicated Vite dev server on port 5176, with `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5176`; neither gate nor rig ports are used. All Playwright commands use `--project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line`.

**`src/**` changed: engine-pinned landing.** Exact changes are in `source.patch` and machine-readable `changed-lines.json`. The source lines below identify all modified hunks (new-file coordinates):

- `src/audio/AudioSettingsControl.ts`: 1, 26–29, 43–44, 51, 59–60, 68, 75–97.
- `src/audio/SoundSystem.ts`: 3, 143, 351–352.
- `src/audio/settings.ts`: 3, 53–68.
- `src/game/ProfileStorage.ts`: 5, 61, 80 (the only source changes added in attempt 2).
- `src/news/greenhornGazette.ts`: 30.
- `src/town/TownScene.ts`: 101, 491, 716, 1166, 1228.
- `src/ui/Hud.ts`: 6, 162, 300, 360, 419.
- `src/ui/menu/StartMenu.ts`: 13, 58, 98, 111, 149, 173, 197.
- `src/ui/theme.css`: 2121–2165.


## Handoff

**READY-FOR-GATES** following the attempt-2 checks recorded above. The actual profile registry is authorized and patched; no permission is pending. The orchestrator owns integration. Evidence sizes are recorded in `evidence-sizes.json` (sum excludes the inventory itself).

Adjacent tests regenerated `artifacts/050/`, `artifacts/056/`, and both tracked `artifacts/first-town-audio-deferred/timeline-*-loopback.json` files. These and the pre-existing `logs/guard-stats.jsonl` are left unstaged under the task's factory-churn exception. Nothing outside the task paths is included in the commit. The dedicated port-5176 dev server was stopped after verification.
