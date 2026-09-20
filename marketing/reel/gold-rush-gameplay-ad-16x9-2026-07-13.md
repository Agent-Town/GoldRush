# Gold Rush — Real Gameplay Advertisement

Status: **DRAFT — owner review required; not published**

## Deliverable

- Film: `gold-rush-gameplay-ad-16x9-2026-07-13.mp4`
- Purpose: landscape gameplay advertisement for X and review playback
- Runtime: `50.000 s` / `1,250` frames
- Picture: H.264, `1280x720`, `25 fps`, `yuv420p`, web-fast-start
- Sound: AAC stereo, `44.1 kHz`, `192 kb/s`

## Editorial construction

1. `00:00.00–00:04.00` — official crest and title over the illustrated valley; the card states `ILLUSTRATED TITLE CARD | REAL GAMEPLAY FOLLOWS`.
2. `00:04.00–00:10.36` — current Twin Banks gameplay: **OUTLAST THE RUSH**.
3. `00:10.36–00:15.92` — current seeded Dry Gulch defense: **EVERY CLAIM CHANGES THE FIGHT**.
4. `00:15.92–00:21.48` — current sluice and stockpile gameplay: **MAKE THE RIVER WORK**.
5. `00:21.48–00:27.84` — current river traversal, panning, and XP: **PAN. MOVE. ADAPT.**
6. `00:27.84–00:34.20` — current Prospector trust ladder and permissions: **SET THE LIMITS**.
7. `00:34.20–00:38.16` — real Research Ledger UI: **CHOOSE THE NEXT STEP**.
8. `00:38.16–00:43.92` — quick real-gameplay montage: **NO GUNS. JUST FRONTIER TECH.**
9. `00:43.92–00:50.00` — official crest, `@Agent_Town`, honest build-in-public line, `WORK IN PROGRESS`, and terminal black. The closing card carries no editorial/production label.

Rye carries the advertising headlines; Wellfleet carries explanations. Gameplay captions stay secondary to the frame and every gameplay section remains explicitly labeled `REAL GAMEPLAY | WIP BUILD`.

## Honesty boundary

- The gameplay is real, current engine footage. The scenarios are scripted/seeded capture setups, not an organic progression run.
- The current captured footage shows the female Hero and excludes the retired male-Hero marketing raws.
- Test setup may grant resources, suppress contact damage, or stage enemies/buildings to reach the visible beat. Crops remove the diagnostic resource HUD; the edit makes no progression-speed or difficulty claim.
- The opening and closing use existing illustrated project art. They are title cards, not represented as gameplay.
- The edit does **not** claim the game is publicly released, provide a play link, promise a date, claim ten eras are currently playable, call the Steamworks live, or present seeded QA as unscripted play.
- Publication remains owner-gated.

## Source lock

| Role | Source | SHA-256 |
|---|---|---|
| Current Twin Banks gameplay | `artifacts/stream-capture/capture-duty-gameplay.mp4` | `31ba5a5a2a065192c3a49bbbda73bf29df8d5f2f688dab9c2de382b3fc80c1d6` |
| Current Dry Gulch gameplay | `marketing/raw/gameplay-ad-2026-07-13/dry-gulch-spring-rush-2026-07-13-ad.webm` | `0b46e86d09bc486aca9648cd5287b5dfe14364262e9a975660909c8c30ff7350` |
| Current sluice gameplay | `marketing/raw/gameplay-ad-2026-07-13/sluice-line-economy-16x9-2026-07-13.webm` | `fca60c0ceacfe5e4c38adfa03f440d9973b13f0276ea7dc0dff5387c5fd52115` |
| Current Prospector gameplay | `marketing/raw/gameplay-ad-2026-07-13/prospector-at-work-16x9-2026-07-13.webm` | `9ad836be35555fbf8e4dcaf5befde07f7d7e3b70decf7d772c4ae362099785d2` |
| Research Ledger UI | `marketing/raw/science-chart-open-16x9-2026-07-07.webm` | `aea1f91e777c802166ddddb008846be9878c0ee0aed684a920b76352e4f4f9a9` |
| Opening illustration | `assets/raw/kit-valley-master.png` | `1309c2f95c7c0f54f47df47dbc11161b57219aa35c6aa828f1e9684632ef9eb5` |
| Closing illustration | `assets/raw/kit-town-canon.png` | `157f0eba978ca85bf10b054ba45f631c06748cebad8d3cc7330a6ef748c3c680` |
| Brand emblem | `assets/processed-full/ui-title-emblem.png` | `511bb49e9a8d9a950c4c2aea7625afa9cd380e2b09623491b84a30b3c300881c` |
| Main score | `assets/audio/raw/title-theme.mp3` | `e18231d418648a8ab978a59e66d86f60ef5194ffba979a9a15397545a23e72f8` |

The mix uses the title theme plus the game's own `tier-up`, `turret-fire`, `spark-bolt-fire`, `build-place`, `gold-chime`, `pan-swish`, `agent-works`, `ledger-open`, and `research-pick` effects. Source clips are silent; no unrelated existing audio enters the film.

## Acceptance evidence

- Full-file FFmpeg decode: clean; no video or audio decode errors.
- Stream count: one H.264 video stream and one AAC audio stream.
- Measured programme loudness: `-14.1 LUFS-I`; true peak: `-2.5 dBFS`; LRA: `5.2 LU`.
- Terminal frame is full black.
- Output SHA-256: `aac2bee91b90640283e11b68f80222225cae24b73bbb2dbf95637a8436198f62`.
- Independent visual gate: **ACCEPT** at `0.91` confidence; no blockers. Illustrated cards, WIP gameplay disclosure, logo/name, proof panels, and copy/native-UI separation passed at feed scale.
- Corrected closing-card gate: **ACCEPT** at `0.90` confidence; no blockers. The exact `@Agent_Town` handle and underscore remain readable at feed scale, the emblem/title are title-safe, `WORK IN PROGRESS` is subordinate, and no editorial label remains.
- Non-blocking visual risks: the Hero's gender reads weakly at small playback because of sprite scale; `hand-engraved world` is intentionally atmospheric rather than a literal production-process claim.
- Publication remains owner-gated under the marketing outbox law.
