# Music toggle — implementation and gate evidence

Task: `lane-b--20260928-130649-audio-music-toggle-1.md`. Baseline `bbabf5617b0efca0b3bd0c5bf52d0797524f6909`, branch `sol/wave-lane-b`.

## Landing status

Permitted implementation is verified and ready for orchestrator review, but the task is **incomplete**. **Per-profile registration remains blocked by the task's literal firewall:** it permits `src/core/ProfileStorage.ts`, which does not exist; the actual registry is `src/game/ProfileStorage.ts`. A narrow permission question is pending. The exact intended edit is reviewable in `profile-registry.patch` (import and the two existing audio-key lists). Without it, music-off persists globally, not per profile; do not land as complete. The new profile test deliberately detects this gap.

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

- Preflight: no ahead commits; no uncommitted source edits. Only pre-existing `logs/guard-stats.jsonl`, left untouched. No evidence discarded.
- `npm install --no-audit --no-fund`: exit 0.
- Baseline `npm run build`: exit 0, including asset diet.
- Initial new-spec run: 4 passed / 2 failed, exit 1. Both failures were the test expecting the menu after profile creation; the existing product enters town. Corrected the new test's assertion to town.
- `npx tsc --noEmit`: exit 0 (`tsc.log`).
- `npm run build`: exit 0 (`build.log`), including asset diet. Existing Vite config/chunk-size and asset-diet warnings remain.
- New spec: **8 passed / 2 failed, exit 1** (`new-tests.log`). The only failures are `music off is stored per profile`, one per project, because the unapproved registry edit is not applied. All eight other tests pass, including both pending-download-race checks.
- Strict console/page errors across the ten new-test records: **0**.
- `git apply --check artifacts/audio-music-toggle-1/profile-registry.patch`: exit 0; this validates the proposed edit without applying it.
- Adjacent suites: **44 passed / 0 failed, exit 0** (22 per project; `adjacent-tests.log`). Existing e2e files were not edited. All console-watch suppression counts printed by the adjacent suite are zero.

Commands use a dedicated Vite dev server on port 5176, with `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5176`; neither gate nor rig ports are used. All Playwright commands use `--project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line`.

**`src/**` changed: engine-pinned landing.** Exact changes are in `source.patch` and machine-readable `changed-lines.json`. The source lines below identify all modified hunks (new-file coordinates):

- `src/audio/AudioSettingsControl.ts`: 1, 26–29, 43–44, 51, 59–60, 68, 75–97.
- `src/audio/SoundSystem.ts`: 3, 143, 351–352.
- `src/audio/settings.ts`: 3, 53–68.
- `src/news/greenhornGazette.ts`: 30.
- `src/town/TownScene.ts`: 101, 491, 716, 1166, 1228.
- `src/ui/Hud.ts`: 6, 162, 300, 360, 419.
- `src/ui/menu/StartMenu.ts`: 13, 58, 98, 111, 149, 173, 197.
- `src/ui/theme.css`: 2121–2165.


## Handoff

**READY-FOR-GATES — incomplete; do not land yet.** Await the narrow firewall correction authorizing `src/game/ProfileStorage.ts` in place of nonexistent `src/core/ProfileStorage.ts`. Then apply the prepared patch, rerun the new spec and type/build checks, and record the now-per-profile result. No bypass or substitute global-storage implementation should be accepted as completion.

Adjacent tests regenerated `artifacts/050/`, `artifacts/056/`, and both tracked `artifacts/first-town-audio-deferred/timeline-*-loopback.json` files. These and the pre-existing `logs/guard-stats.jsonl` are left unstaged under the task's factory-churn exception. Nothing outside the task paths is included in the commit. The dedicated port-5176 dev server was stopped after verification.
