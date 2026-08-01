# THE 27-MAP CAMPAIGN — owner test ledger (greenlit 2026-07-17, verbatim: "I want to greenlight all of these 27 maps. Lets build them as quickly as possible - I will have to test them all!")

Pipeline per map: CONTRACT → MASK → SCULPT (3D-D) → WIRE → **OWNER TEST** (the last column is yours — verdict in one word, I file the rest).

> ⚠️ **RE-MEASURED 2026-08-02 (s1368 fire, F-1368-1). The four build columns below had not been touched since 2026-07-18 and were understating the campaign on every one of them.** They are now derived from main, not from memory: `contract` = `assets/pilots/map-rebuild-spike/<slug>-terrain-contract.json` exists · `sculpt` = its own `<slug>-terrain.glb` exists, or the reuse mount it was deliberately given · `wired` = the map key is present in the `Terrain3dClaimPilot.ts` registry · `landmarks` = a populated pack under `landmarks/<slug>/`.
> **8 of 27 rows in the old `wired` column were false, all in the same direction** — five read `BLOCKED` (The Picnic, Echo Canyon, The Dead Band, Relay Rush, Low Orbit) and three read `—` (The Trestle, Blackout Ridge, The Fairground); **all eight are wired.** The old `sculpt` column read `—` for all 27 while 32 terrain sculpts sat on main.
> ➡️ **THE BUILD SIDE OF THIS CAMPAIGN IS DONE. All 25 sculptable maps are wired, all 36 landmark packs are populated (196 `.glb`, zero empty), and the two excluded rows are excluded by this file's own footnote, not by a gap.** The only column with work left in it is **yours** — and it is the last one. **Nothing is blocked on the factory; 25 maps are waiting on a one-word verdict each.**
> *Corroboration, independently re-derived rather than inherited: `tasks/BACKLOG.md` recorded the build side complete at `1630682c` ("27 maps / 145 mount records") on 2026-07-18 — the same day this table stopped being updated.*

| era | map | contract | sculpt | wired | landmarks | OWNER VERDICT |
|---|---|---|---|---|---|---|
| E2 | The Trestle | ✓ | ✓ | ✓ | ✓ | — |
| E2 | The Pressure Garden | ✓ | ✓ | ✓ | ✓ | — |
| E2 | The Incline | ✓ | ✓ | ✓ | ✓ | — |
| E3 | Blackout Ridge | ✓ | ✓ | ✓ | ✓ | — |
| E3 | The Fairground | ✓ | ✓ | ✓ | ✓ | — |
| E3 | Moth Season | ✓ | ✓ | ✓ | ✓ | — |
| E4 | The Long Road | ✓ | ✓ | ✓ | ✓ | — |
| E4 | Gusher County | ✓ | ✓ | ✓ | ✓ | — |
| E4 | The Boneyard | ✓ | ✓ | ✓ | ✓ | — |
| E5 | The Flotilla | — | reuse: deepwater-claim | ✓ | reuse | — |
| E5 | Stillwater | — | reuse: deepwater-claim | ✓ | reuse | — |
| E5 | The Regatta | ✓ | ✓ | ✓ | ✓ | — |
| E6 | The Showroom | ✓ | ✓ | ✓ | ✓ | — |
| E6 | Half-Life Hollow | ✓ | ✓ | ✓ | ✓ | — |
| E6 | The Picnic | ✓ | reuse: glow-mesa | ✓ | ✓ | — |
| E7 | Echo Canyon | ✓ | ✓ | ✓ | ✓ | — |
| E7 | The Dead Band | ✓ | reuse: relay-valley | ✓ | ✓ | — |
| E7 | Relay Rush | ✓ | reuse: relay-valley | ✓ | ✓ | — |
| E8 | The Far Side | ✓ | reuse: mare-claim | ✓ | ✓ | — |
| E8 | Low Orbit | ✓ | ✓ | ✓ | ✓ | — |
| E8 | The Eclipse | ✓ | reuse: mare-claim | ✓ | ✓ | — |
| E9 | The Seed Run | ✓ | ✓ | ✓ | ✓ | — |
| E9 | Devil's Alley | ✓ | ✓ | ✓ | ✓ | — |
| E9 | The Old Canal | ✓ | ✓ | ✓ | ✓ | — |
| E10 | The Archive World | ✓ | ✓ | ✓ | ✓ | — |
| E10 | The Last Claim | n/a | n/a — Ark-deck class | n/a | n/a | n/a |
| E10 | The River | n/a | n/a — Charter Press CP-05 | n/a | n/a | n/a |

**THE SEVEN REUSE MOUNTS ARE DELIBERATE, NOT PLACEHOLDERS, AND EACH IS DOCUMENTED AT ITS CALL SITE** in `src/world/Terrain3dClaimPilot.ts` (`e0052c6e` "art: close final five reuse mounts"): *"Deepwater Claim aliases: these campaign variants intentionally reuse its terrain and panorama"* (Flotilla, Stillwater) · *"Glow Mesa alias: The Picnic keeps the caprock sculpt and changes campaign rules only"* · *"Relay Valley aliases: both signal variants reuse its terrain and panorama"* (Dead Band, Relay Rush) · *"Mare Claim aliases: Far Side and Eclipse change campaign rules without changing the sculpt."* These five maps still carry their **own** `-terrain-contract.json` on disk, unimported — that is the record of a contract written before the reuse ruling, not an unfinished wire. **Do not "fix" a reuse mount into a fresh sculpt without an owner ruling; the reuse IS the ruling.**

E2–E4 names extracted from the storybook chapters and their contracts+masks landed 2026-07-18 (campaign/e2-e4-extras). SPECIAL CASES flagged at contract time: The Long Road (moving-claim consumer — Hauler-only basing, convoy advance, rest-stop anchorage), Gusher County (wild-derrick eruption/cap-to-claim/blowout-wave consumer), The Boneyard (salvage-race consumer + sleeper wake trigger), Low Orbit (zero-G engine slice), Echo Canyon (broadcast-mirror ↔ playbook slices), The Eclipse (event cycle), Seed Run/Old Canal (persistence consumers — substrate SHIPPED), The Last Claim (Ark-deck class — rides the Ark-dressing arc, not a terrain sculpt), The River (E1-claim variant — likely NO new sculpt; the Charter Press authors it at CP-05).
