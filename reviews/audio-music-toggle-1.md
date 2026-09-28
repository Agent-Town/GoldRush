# Drain review: `audio-music-toggle-1`, one tap turns the music off on every surface a player hears it, the setting per profile, the loop fetch skipped when off

**Branch** `sol/wave-lane-b` at `425f29fe2` · **merge** `cdf30c09e` · engine hash #73 `cd76fd08` · drained attended 2026-09-28 12:38Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `amt1`).

**Verdict: LANDED.**

**Slice / branch / tip:** `audio-music-toggle-1`, lane-b `sol/wave-lane-b`, seven commits (attempt 1 `a029c8f8e`, attempt 2 `bdd70d410`, the attended screenshot-conflict resolution `a65a958fd`, attempt 3 `97a6a6493`, plus the runner commits), Astra gpt-6-astra, 348,776 tokens in all, 2026-09-28 06:06Z to 10:20Z. Attended pinned landing under `land-held.sh`: the s2736 fire gated the candidate green (builds, 74 + 2 browser, four short guards) but the s2737 fire could not finish the full Node battery inside the diff-selected wrapper's 900 s cap (a healthy run takes about 2,567 s) and authored the wrapper corrective F-2737-1 instead; the attended toolkit runs the battery with its own allowance.

**What it does.** From the Opus 5.5 audio review's first-ranked recommendation (`reviews/audio-review-1.md`, owner 2026-09-28: "users asked about how to disable the music quickly as it is repetitive"). A fourth per-profile audio key, music off, stored and read like the three existing keys and registered in `src/game/ProfileStorage.ts`; `SoundSystem` treats it like mute for music loops only: no fetch while off, live resume when on, SFX untouched, the Music Volume level preserved. One-tap toggles: beside pause in the run HUD (44 px on phones), on the town bar, on the start menu and on the first-boot card, so a first visit can silence the title theme before a profile exists; a Music checkbox beside the Music Volume slider keeps the panels consistent; one Gazette clause mentions it. No new keyboard key: M stays mute-all pending the owner's word (F-AUD-12). No gameplay or sim change.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Interactions to silence the music: a run | 3 plus a scroll → 1 tap (desktop and phone) |
| Town, start menu | 2 → 1 |
| First boot | no control → 1 |
| The pause panel's Music Volume slider | needs a scroll to reach on both devices (the review's UNCERTAIN, now MEASURED at 1280x800 and 390x844) |
| New spec `e2e/audio-music-toggle.spec.ts` | 10 of 10 on both projects (one-tap stop, live resume, SFX while off, slider preserved, reload persistence, no fetch while off, Settings sync, first boot, per-profile storage) |
| Adjacent audio suites (050, 051, mu-02, music-survives-pause, first-town-audio-deferred, m2-01) | 44 of 44 on both projects |
| tsc / build / console and page errors | green; ten strict error records empty |
| Evidence budget | 7.7 MB added across both attempts, inside the 25 MB task budget and the 40 MB ceiling |
| s2736 fire gate on the candidate `c2ac179b1` | builds, 74 + 2 browser, four short guards green; the full Node battery cut by the wrapper cap (F-2737-1) |
| tsc / release build / payload / halo / null floors / release suite / the eight specs / ledger battery / pin | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. New: `e2e/audio-music-toggle.spec.ts`, `artifacts/audio-music-toggle-1/**`. Lane-touched: `src/audio/settings.ts`, `src/audio/SoundSystem.ts`, `src/audio/AudioSettingsControl.ts`, `src/ui/Hud.ts`, `src/ui/theme.css`, `src/town/TownScene.ts`, `src/ui/menu/StartMenu.ts`, `src/game/ProfileStorage.ts`, `src/news/greenhornGazette.ts`, plus regenerated screenshots under `artifacts/050/`, `artifacts/056/` and `artifacts/first-town-audio-deferred/`. `src/**` changed: `hash: pin`, the pin measured last. Conflicts: none expected; the toolkit records any.

**Attempt 3 and the phone HUD census.** The first pinned landing of this branch passed the release build, payload, halo, null floors, release suite and e2e gates and stopped on `scripts/phone-hud-entry-census.test.mjs`: coverage unchanged everywhere, but the toggle had pushed the six original maps' weapon panel down 12 px at 390 px, and the census pins those boxes against the run-10 baseline (the owner's phone HUD reduction, F-F2-39). Not re-baselined. Attempt 3 moves the 44 px control into the weapon panel's existing footprint (CSS only); the census re-run in the lane shows identical panel boxes and coverage in all 20 map/width rows against the committed baseline, the census guard is green unmodified, the toggle spec stays 10/10 and the adjacent suites 44/44. The regenerated run-10 `after` evidence is committed; `before.json` and the run-8 baselines are unchanged.

**Findings.**
- **F-AUD-8, F-AUD-9, F-AUD-10 closed by this landing** (quick disable, first boot, the silent download).
- **F-AMT1-1 (resolved by placement, not by re-baselining):** the census caught a 12 px shift of six maps' weapon panel; attempt 3 places the toggle without moving any box.
- **F-ATT-11 (attended, recorded):** the first attempt stopped at a firewall path that did not exist (`src/core/` for `src/game/ProfileStorage.ts`); the second attempt built on the first with a `BUILD-ON-PREDECESSOR` declaration.
- **F-2737-1 (the fire's, open):** the diff-selected guard wrapper caps the full Node battery at 900 s against a 2,567 s healthy run; corrective `run-guards-node-watchdog-1` (Astra, lane-d).
- **Owner's desk:** F-AUD-12 (the key) unchanged by this landing.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| strict release build (the assertion) | `(strict, the assertion): rc=0 [release-build] E1-only: 1128 files, 97732079 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` |
| first-town payload | `34353480 bytes` |
| halo | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` |
| null floors | `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (294.3s).` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the release suite under its own config | `(own config): rc=0   30 passed (2.2m)` |
| e2e both projects, --workers=1 | `rc=0   64 passed (3.9m)  12:20Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 4 ℹ pass 3 ℹ fail 1 ℹ skipped 0 ℹ tests 5 ℹ pass 4 ℹ fail 1 ℹ skipped 0 ℹ tests 1040 ℹ pass 1033 ℹ fail 2 ℹ skipped 5  12:38Z` |
| engine hash | `merged: cd76fd088099119c9233e6ac50b2319fa07611ae1955082110b5043f2c7458f9 (pinned 2f11c1a5b75338d48d7ce7823646ff4d5ff1bd0d55ab13a865cf5d0917e5a92c)` |
