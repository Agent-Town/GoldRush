# Task audio-music-toggle-1: one tap turns the music off, everywhere a player hears it (LANE-B, Astra, commit prefix "feat:")

CODEX: model=gpt-6-astra
LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: artifacts/050/desktop-chrome-mute-toast.png
EXPECTED-HOLDS: artifacts/050/desktop-chrome-pause-audio-settings.png
EXPECTED-HOLDS: artifacts/050/mobile-chrome-mute-toast.png
EXPECTED-HOLDS: artifacts/050/mobile-chrome-pause-audio-settings.png
EXPECTED-HOLDS: artifacts/056/desktop-build-menu-icons-blurb.png
EXPECTED-HOLDS: artifacts/056/desktop-build-menu-palisade.png
EXPECTED-HOLDS: artifacts/056/mobile-390-build-menu-icons-blurb.png
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/adjacent-tests.log
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/baseline-build-attempt-2.log
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/build.log
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/changed-lines.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/errors-desktop-chrome-first-boot-can-silence-music-before-a-profile-exists.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/errors-desktop-chrome-menu-and-town-share-one-music-preference-with-Settings.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/errors-desktop-chrome-music-off-is-stored-per-profile.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/errors-desktop-chrome-run-one-tap-stops-music-preserves-volume-resumes-live-and-survives-reload.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/errors-desktop-chrome-turning-off-during-a-music-fetch-prevents-its-late-start.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/errors-mobile-chrome-first-boot-can-silence-music-before-a-profile-exists.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/errors-mobile-chrome-menu-and-town-share-one-music-preference-with-Settings.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/errors-mobile-chrome-music-off-is-stored-per-profile.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/errors-mobile-chrome-run-one-tap-stops-music-preserves-volume-resumes-live-and-survives-reload.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/errors-mobile-chrome-turning-off-during-a-music-fetch-prevents-its-late-start.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/evidence-sizes.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/first-boot-desktop-chrome.jpg
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/first-boot-mobile-chrome.jpg
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/hud-desktop-chrome.jpg
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/hud-mobile-chrome.jpg
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/install-attempt-2.log
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/menu-desktop-chrome.jpg
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/menu-mobile-chrome.jpg
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/new-tests-initial.log
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/new-tests.log
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/pause-panel-desktop-chrome.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/pause-panel-mobile-chrome.json
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/profile-registry.patch
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/report.md
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/server.log
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/source.patch
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/town-desktop-chrome.jpg
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/town-mobile-chrome.jpg
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/tsc.log
EXPECTED-HOLDS: artifacts/audio-music-toggle-1/verification.json
EXPECTED-HOLDS: artifacts/first-town-audio-deferred/timeline-desktop-chrome-loopback.json
EXPECTED-HOLDS: artifacts/first-town-audio-deferred/timeline-mobile-chrome-loopback.json
EXPECTED-HOLDS: e2e/audio-music-toggle.spec.ts
EXPECTED-HOLDS: src/audio/AudioSettingsControl.ts
EXPECTED-HOLDS: src/audio/SoundSystem.ts
EXPECTED-HOLDS: src/audio/settings.ts
EXPECTED-HOLDS: src/game/ProfileStorage.ts
EXPECTED-HOLDS: src/news/greenhornGazette.ts
EXPECTED-HOLDS: src/town/TownScene.ts
EXPECTED-HOLDS: src/ui/Hud.ts
EXPECTED-HOLDS: src/ui/menu/StartMenu.ts
EXPECTED-HOLDS: src/ui/theme.css

ATTEMPT 3 (2026-09-28T10:04Z): attempt 2 completed the feature (spec 10/10, adjacent 44/44) and its attended pinned landing passed the release build, payload, halo, null floors, the release suite (30/30), the e2e gate (64/64) and the ledger battery, then stopped on ONE guard: `scripts/phone-hud-entry-census.test.mjs` ("current census pins persistent union, entry coverage and unchanged desktop boxes"). The attended session re-ran the census on the merged tree (a vite server on 127.0.0.1:5312, then `node scripts/phone-hud-entry-census.mjs after`): the persistent HUD coverage union is UNCHANGED on every census map at both widths (the coverage law holds), no panel was added or removed, but on the six original maps at 390 px the toggle pushed the weapon panel (and on some maps the suit-air or archive panel) DOWN by 12 px (`hud-weapon` box y 92 → 104, same width and height), and the census pins those six maps' panel boxes against the run-10 `before.json` baseline ("original six-map layout moved"). That pin is the owner's phone HUD reduction (F-F2-39, 2026-09-24) guarding against creep; it is not to be edited or re-baselined. THIS ATTEMPT BUILDS ON ATTEMPTS 1 AND 2 (the lane's held commits are your own base; do NOT reset the lane). Do exactly this: (1) place the run-HUD toggle at 390 px so that NO existing panel box changes on any census map: for example in the pause control's own row beside it (the `.hud-pause` element's row, right-aligned) or inside the weapon panel's existing footprint, never as a new row above or below a panel; desktop may keep its placement if its boxes are unchanged; (2) verify with the census: start `npx vite --port 5312 --strictPort --host 127.0.0.1` in the lane, run `node scripts/phone-hud-entry-census.mjs after` under the attended drain lock protocol, stop your server by its PID, and run `node --test scripts/phone-hud-entry-census.test.mjs` until it is GREEN WITHOUT editing that test or its baselines (`before.json`, run-8 files); commit the regenerated `artifacts/sol/map-art-campaign-2/run-10/phone-hud/**` with your CSS change (the census evidence is part of the feature); (3) rerun `e2e/audio-music-toggle.spec.ts` (10/10) and the adjacent list on both projects; (4) update the report with the census result (union unchanged, boxes unchanged) and commit path-scoped with `feat:`. The pre-flight's SAFE-DUPE clause does not apply to your own commits (the declared holds above).

ATTEMPT 2 (2026-09-28T07:15Z): attempt 1 (`a029c8f8e` + the runner commit `88542b748`, 141,712 tokens, 06:06Z to 06:20Z) did everything except the per-profile registration, because this master's firewall named a file that does not exist (`src/core/ProfileStorage.ts`; the registry is `src/game/ProfileStorage.ts`), and Codex rightly stopped at the wall with the patch prepared and validated (`artifacts/audio-music-toggle-1/profile-registry.patch`, `git apply --check` exit 0). THIS ATTEMPT BUILDS ON ATTEMPT 1: the lane's two ahead commits are your own base; do NOT reset the lane, do NOT re-implement. Do exactly this: apply the prepared patch to `src/game/ProfileStorage.ts` (or re-derive it if it no longer applies), rerun `e2e/audio-music-toggle.spec.ts` on both projects until 10/10 (the two `music off is stored per profile` tests), rerun tsc, build and the adjacent list, update the report and `changed-lines.json`, commit path-scoped with the `feat:` prefix, and end READY-FOR-GATES. The pre-flight's SAFE-DUPE clause does not apply to your own attempt-1 commits (they are the declared holds above); everything else in the pre-flight still holds.

You are Codex (gpt-6-astra), implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `sol/wave-lane-b`). You do not touch STATUS.md, reviews, tasks or other lanes.
READ FIRST: AGENTS.md; `reviews/audio-review-1.md` (the Opus 5.5 review this task implements: sections 3(d), 3(e), 4 F-AUD-8/9/10, 5 rank 1); `src/audio/settings.ts` (the three profile keys and defaults at lines 63, 71, 79), `src/audio/SoundSystem.ts` (loops stop only for mute or master volume zero, lines 143-146; music gain at 165 and 557-569), `src/audio/AudioSettingsControl.ts` (the Volume, Music Volume and Mute controls, lines 15-31, 50-55), `src/ui/Hud.ts` (the pause control at 299-301 and 395-398; the pause panel's audio block at 742-767), `src/ui/theme.css` (the phone pause control at 2068-2082 and 1777-1781), `src/town/TownScene.ts` (town Settings at 1165-1170), `src/ui/menu/StartMenu.ts` (the title theme at 86; the first-boot card at 127-148, which has no route to Settings), `src/core/InputController.ts` (the key map, 3-28: M at 24 is mute-all and stays so), `src/game/Game.ts` (mute at 3017 and 9273-9276), `src/news/greenhornGazette.ts` (the only hint that mute exists, lines 30 and 36-40), `e2e/050-audio-mix-and-access.spec.ts` (pins M as mute-all, "pause overlay volume and mute persist and sync with Settings", lines 90-103; do not change it).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL; the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B sol/wave-lane-b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work; resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence (`artifacts/**`, `reviews/shots-*`, any `.png`) are NEVER work and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` must be clean, with the FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*` and any `.png` are always expected, never a STOP; what still STOPs is modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner, verbatim, 2026-09-28: "users asked about how to disable the music quickly as it is repetitive"; review `reviews/audio-review-1.md`, MEASURED and INFERRED)
Silencing just the music takes three interactions on every device (pause, drag Music Volume to zero, resume), the slider is the second control in the eleventh block of the pause panel, phones get no shortcut or hint, and a first-time player has no route to Settings while the title theme already plays (review table (d); F-AUD-8, F-AUD-9). At Music Volume zero the loop still downloads and plays silently because loops stop only for mute or master zero (`src/audio/SoundSystem.ts:143-146`; F-AUD-10). The review's first-ranked recommendation, "what users asked for and can land on its own": a one-tap music toggle in the run HUD, the town bar and the start menu including first boot, with its own profile key so the slider level survives, and music-off skipping the fetch. The KEY is the owner's question (Q1): M stays mute-all, no new key in this task.

## Scope
1. **The setting.** A fourth per-profile key `gr.audio.music-off.v1` (boolean, default off, stored and read exactly like the three in `src/audio/settings.ts:63-79` and enumerated wherever those keys are listed, e.g. `ProfileStorage.ts` if it names them). `SoundSystem` treats music-off like mute FOR MUSIC LOOPS ONLY: no fetch, no play, an already-playing loop stops (with the same path as mute today), SFX unaffected; toggling music back on resumes the loop live in the current scene. The Music Volume slider value is untouched by the toggle.
2. **The controls, one tap each.** (a) Run HUD: a toggle beside the pause control, `data-testid="music-toggle"`, `aria-pressed`, label "Music on" / "Music off", at least 44 px on phones (the pause control's own phone rules in `theme.css` are the model), visible without opening the pause panel. (b) Town: the same toggle on the town bar beside the existing Settings entry. (c) Start menu: the same toggle on the menu AND on the first-boot card (`StartMenu.ts:127-148`) so a first visit can silence the title theme in one tap. (d) `AudioSettingsControl`: a "Music" checkbox beside the Music Volume slider bound to the same key, so the pause panel and both Settings panels stay consistent. All four surfaces reflect the key live (a change in one shows in the others on the next render).
3. **The hint.** The Greenhorn Gazette's keyboard copy (`greenhornGazette.ts:36-40`) mentions the music toggle in one clause; no other copy changes.
4. **The measurement the review asked for.** A new spec `e2e/audio-music-toggle.spec.ts`, both projects: (i) plain boot into a run, one tap on `music-toggle` stops the music loop (assert through the existing read-only audio diagnostics or the setting key plus the loop state) and a reload keeps it off; (ii) the town and menu toggles work and share the state; (iii) the first-boot card shows the toggle before any profile exists; (iv) the review's request: pause at 390x844 and at 1280x800 and record the bounding box of `pause-music-volume` against the visible pause panel to `artifacts/audio-music-toggle-1/pause-panel-<project>.json` (does reaching the slider need a scroll? report, do not assert). Adjacent unchanged-green both projects: `e2e/050-audio-mix-and-access.spec.ts`, `e2e/051-audio-governor.spec.ts`, `e2e/mu-02-music.spec.ts`, `e2e/music-survives-pause.spec.ts`, `e2e/first-town-audio-deferred.spec.ts`, `e2e/m2-01-build-menu.spec.ts`.
5. **Report** `artifacts/audio-music-toggle-1/report.md`: the interaction count before/after per surface and device (from the review's table (d) to the new state), screenshots of the toggle in the HUD (390 px and desktop), town and first-boot card (JPEG q80 or PNG under 400 KB), the pause-panel measurement, and a one-line note that `src/**` changed (engine-pinned landing).

Stop rule: when the subscription refuses (rate limit, quota, a disconnect) or the session ends, commit the finished items, write the report with what remains, and end READY-FOR-GATES. If you find yourself about to exit without changes, WRITE WHY into your report first: a silent no-op wastes a queue slot and a gate.

## Firewall
Touch ONLY: `artifacts/sol/map-art-campaign-2/run-10/phone-hud/**` (the regenerated census evidence, attempt 3), `src/audio/settings.ts`, `src/audio/SoundSystem.ts`, `src/audio/AudioSettingsControl.ts`, `src/ui/Hud.ts`, `src/ui/theme.css` (the toggle's rules only), `src/town/TownScene.ts` (the bar control only), `src/ui/menu/StartMenu.ts` (the menu and first-boot toggle only), `src/game/Game.ts` (wiring the HUD toggle to the setting only), `src/game/ProfileStorage.ts` (the per-profile key registry: register the new key exactly like the three audio keys it already lists; the attempt-1 master wrote a wrong path here, F-ATT-11), `src/news/greenhornGazette.ts` (one clause), `e2e/audio-music-toggle.spec.ts` (new), `artifacts/audio-music-toggle-1/**`.
NO changes to: `src/core/InputController.ts` (no new key, M unchanged: owner question Q1), `src/audio/manifest.ts` and any asset under `assets/audio/` (the harshness task's), gameplay or sim, existing e2e assertions (especially `e2e/050-audio-mix-and-access.spec.ts:90-103` ("pause overlay volume and mute persist and sync with Settings")), `scripts/**`, `tasks/**`, `specs/**`, `reviews/*.md`, `CLAUDE.md`, `STATUS.md`, `tasks/BACKLOG.md`, `logs/**`, the other lanes' work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` and `npm run build` green. The new spec green on `desktop-chrome` and `mobile-chrome` (`--workers=1`, exit codes from the command). The adjacent list above unchanged-green on both projects. Zero console and page errors in every boot. Screenshots at the exact paths. Say in the report which `src/**` lines changed (the landing is engine-pinned).
End: READY-FOR-GATES + the interaction counts before/after per surface and device + the pause-panel scroll answer + adjacent counts + evidence byte count + commit hashes.
