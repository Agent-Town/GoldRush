# Heat 14 — the era-6 re-ride — matrix (updated after EVERY ride)

Operator: an attended-hosted Claude agent (Opus, the owner's Anthropic subscription), hosting from a
detached arena at the DEPLOYED build. Rig: Claude Opus 5 (`claude-opus-5`) via Claude Code CLI
**2.1.272** (`claude --version`), headless `claude -p`, one ride at a time under `nice -n 5`.
Charters are delivered on STDIN this heat (F-HEAT14-2): at 742,647 B the notebook charter is 71 % of
this host's 1,048,576 B ARG_MAX and grows ~9.6 KB per landed ride.

## Arena (era gate — PASS)

| fact | value |
|---|---|
| live build | `6075db90`, builtAt `2026-09-17T19:33:59Z` (`https://agenttown.app/goldrush/version.json`) |
| arena | `<scratchpad>/arena-heat14-e3949bfa`, `git worktree add --detach 6075db901`, `node_modules` symlinked to the primary checkout, branch `heat14/era6-reride` |
| arena era | era **6**, "the Re-surveyed Claims", `engineHash 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068` (pin #8, 2026-09-18) — identical to the era-6 pin on main |
| gate proof 1 (the refusal) | heat 13's VERIFIED probe reel (era 5, `09838c35…`), byte-identical, re-POSTed to the live door → **HTTP 400 `{"ok":false,"error":"reel_not_current","message":"This reel rode era 5; the county accepts era 6 'the Re-surveyed Claims'."}`** (`probe/refusal-post-response.json`) |
| gate proof 2 (the fresh probe) | the same orders replayed order-for-order in THIS arena → SECURED w10 / 300.000 s / 335 g, `eventLogHash fnv1a32:1c431865` → **`assay: verified`, `ranked: false`, `assayHash fnv1a32:b131e18e`**, papers `buildId 6075db901 · engineHash 540b49af… · era 6 · viewVersion 2` (`probe/verdict-slip.json`). The assayer replays the era-6 tree: the county's droplet is in sync with the deployed build. |
| receipts before | 2026-09-17T23:38:04Z — **37 boards, 0 ranked rows, 69 reels counted retired** (`receipts-before.json`; `e1-drill-yard` answers HTTP 400, it is the training ground, not a board) |
| headroom | the CLI exposes no headroom surface (no `usage` subcommand, no rate-limit state on disk) — F-HEAT14-1. One-turn `claude -p` probes answer, so the subscription is live; the heat rides in BLOCKS OF SIX and re-probes between blocks, per the master |

## Rides

| # | contract | seed | stake | gen | outcome | waves | gold | timeAlive | wall | tape · eventLogHash | door verdict | notebook |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | the-claim | `e1-the-claim-01` | era-retired | 97 | **SECURED** | 10 | 498 | 300s | 547s | `attempt-1-tape.json` · `agent-2466de51-44b082d2-fcb5-427c-b5f0-9e017f0da0ec`<br>fnv1a32:6d830a40 | verified `fnv1a32:79bb2437` rank 1 | gen 97<br>slip `agent-2466de51-44b082d2-fcb5-427c-b5f0-9e017f0da0ec` |
| 2 | e1-dry-gulch | `e1-dry-gulch-01` | era-retired | 98 | **SECURED** | 20 | 328 | 600s | 995s | `tune-1-tape.json` · `agent-2b595776-71adb622-8219-40b7-b796-82897068638d`<br>fnv1a32:afadc88b | verified `fnv1a32:314a9b3c` rank 1 | gen 98<br>slip `agent-2b595776-71adb622-8219-40b7-b796-82897068638d` |
| 3 | e1-twin-banks | `e1-twin-banks-01` | era-retired | 99 | **SECURED** | 20 | 556 | 600s | 1018s | `attempt-1-tape.json` · `agent-d6e1ff48-d8631b33-ce80-45f4-acca-556e0a08ec49`<br>fnv1a32:ad57ab7f | verified `fnv1a32:3be42a34` rank 1 | gen 99<br>slip `agent-d6e1ff48-d8631b33-ce80-45f4-acca-556e0a08ec49` |
| 4 | e2-incline | `e2-incline-01` | era-retired | 100 | **SECURED** | 12 | 129 | 496.333s | 823s | `attempt-1-tape.json` · `agent-85fac865-be6b28a1-d693-4350-8972-12072c0d563c`<br>fnv1a32:78fe88df | pending rank 1 | gen 100<br>slip `agent-85fac865-be6b28a1-d693-4350-8972-12072c0d563c` |
| 5 | e2-pressure-garden | `e2-pressure-garden-01` | era-retired | 101 | **SECURED** | 12 | 227 | 360s | 665s | `attempt-1-tape.json` · `agent-bf36999a-02306044-81bc-48ec-b18e-91717329c725`<br>fnv1a32:f9ddeb08 | verified `fnv1a32:395a7a37` rank 1 | gen 101<br>slip `agent-bf36999a-02306044-81bc-48ec-b18e-91717329c725` |
| 6 | e3-blackout-ridge | `e3-blackout-ridge-01` | era-retired | 102 | **SECURED** | 12 | 499 | 360s | 812s | `attempt-1-tape.json` · `agent-79072d86-46daf18f-8166-45d5-a26d-840977315698`<br>fnv1a32:f31073d7 | verified `fnv1a32:88d63803` rank 1 | gen 102<br>slip `agent-79072d86-46daf18f-8166-45d5-a26d-840977315698` |
| 7 | e3-canyon-works | `e3-canyon-works-01` | era-retired | 103 | **not secured** | 20 | 21 | 600.000s | 955s | `attempt-2-tape.json` · `agent-d19426a9-b98df1a5-9941-4535-ac6d-c715dfeffe4d`<br>fnv1a32:f8d2e209 | — | gen 103 |
| 8 | e3-moth-season | `e3-moth-season-01` | era-retired | 104 | **SECURED** | 12 | 455 | 360s | 810s | `attempt-1-tape.json` · `agent-523856a0-48753353-f9e6-4ce0-9f92-7752672ebbe3`<br>fnv1a32:954d11ca | verified `fnv1a32:ce9c8f35` rank 1 | gen 104<br>slip `agent-523856a0-48753353-f9e6-4ce0-9f92-7752672ebbe3` |
| 9 | e4-gusher-county | `e4-gusher-county-01` | era-retired | 105 | **SECURED** | 12 | 135 | 360s | 766s | `attempt-1-tape.json` · `agent-da3e9a93-08353f54-babb-4851-98d6-017e8437c9e3`<br>fnv1a32:a661a965 | pending rank 1 | gen 105<br>slip `agent-da3e9a93-08353f54-babb-4851-98d6-017e8437c9e3` |
| 10 | e7-dead-band | `e7-dead-band-01` | era-retired | 106 | **SECURED** | 20 | 5 | 600s | 600s | `tune-1-tape.json` · `agent-9d864d65-c0e1c87b-c1e1-494f-bf40-10f8459f528b`<br>fnv1a32:a8cebf16 | pending rank 1 | gen 106<br>slip `agent-9d864d65-c0e1c87b-c1e1-494f-bf40-10f8459f528b` |
| 11 | e7-echo-canyon | `e7-echo-canyon-01` | era-retired | 107 | **SECURED** | 20 | 200 | 600s | 562s | `attempt-1-tape.json` · `agent-7bdf3b6a-2f9a4011-42aa-4669-9cf5-195dbbd3ce78`<br>fnv1a32:54c9f02d | pending rank 1 | gen 107<br>slip `agent-7bdf3b6a-2f9a4011-42aa-4669-9cf5-195dbbd3ce78` |
| 12 | e7-relay-rush | `e7-relay-rush-01` | era-retired | 108 | **SECURED** | 20 | 200 | 600s | 650s | `attempt-1-tape.json` · `agent-2fecaaef-93a2af89-1d92-44fd-b945-826ad8de1644`<br>fnv1a32:26c0e86f | verified `fnv1a32:56e85b88` rank 1 | gen 108<br>slip `agent-2fecaaef-93a2af89-1d92-44fd-b945-826ad8de1644` |
| 13 | e7-relay-valley | `e7-relay-valley-01` | era-retired | 109 | **SECURED** | 20 | 200 | 600s | 706s | `attempt-1-tape.json` · `agent-52a91b93-caec711f-bf24-43b2-b022-f5fc9fb6a137`<br>fnv1a32:f11700a1 | verified `fnv1a32:ea3d1acc` rank 1 | gen 109<br>slip `agent-52a91b93-caec711f-bf24-43b2-b022-f5fc9fb6a137` |
| 14 | e8-eclipse | `e8-eclipse-01` | era-retired | 110 | **not secured** | 19 | 500 | 586.400s | 749s | `attempt-1-tape.json` · `agent-d5eaacbd-f0e5a21b-e187-42d3-ae8e-8e4ec83b10e4`<br>fnv1a32:ee785f32 | — | gen 110 |
| 15 | e8-mare-claim | `e8-mare-claim-01` | era-retired | 111 | **SECURED** | 20 | 260 | 600s | 594s | `attempt-1-tape.json` · `agent-c6bc2030-bbe3ee56-b54e-419f-b2e3-62e3752c2fde`<br>fnv1a32:5a377f4a | verified `fnv1a32:ddf3c5c6` rank 1 | gen 111<br>slip `agent-c6bc2030-bbe3ee56-b54e-419f-b2e3-62e3752c2fde` |
| 16 | e9-devils-alley | `e9-devils-alley-01` | era-retired | 112 | **SECURED** | 20 | 200 | 600s | 686s | `attempt-1-tape.json` · `agent-cb60d142-ffc9b20c-119b-4fd6-8514-a2038195a207`<br>fnv1a32:02ba8fff | pending rank 1 | gen 112<br>slip `agent-cb60d142-ffc9b20c-119b-4fd6-8514-a2038195a207` |
| 17 | e9-dome-basin | `e9-dome-basin-01` | era-retired | 113 | **SECURED** | 20 | 12 | 600s | 1271s | `attempt-1-tape.json` · `agent-933cae82-8bacfafd-82dc-4bed-bb0e-acd019849888`<br>fnv1a32:bba2de00 | ⚠ not submitted | gen 113 |
| 18 | e5-deepwater-claim | `e5-deepwater-claim-01` | era-retired | 114 | **SECURED** | 12 | 200 | 272s | 978s | `attempt-1-tape.json` · `agent-4f885975-8cf692f3-914a-4aea-ba43-603d68704528`<br>fnv1a32:9be76ab1 | verified `fnv1a32:217967af` rank 1 | gen 114<br>slip `agent-4f885975-8cf692f3-914a-4aea-ba43-603d68704528` |
| 19 | e5-flotilla | `e5-flotilla-01` | era-retired | 115 | **SECURED** | 12 | 200 | 272s | 524s | `attempt-1-tape.json` · `agent-a19570c5-0238d594-ea0d-4d23-99c7-895cee2cb6cc`<br>fnv1a32:0cca8f67 | **stored, no slip yet** — POST rank 1 (crown) | gen 115 |
| 20 | e5-regatta | `e5-regatta-01` | open-question | 116 | **SECURED** | 12 | 200 | 272s | 775s | `attempt-1-tape.json` · `agent-3137e409-af61f6c2-95cd-4fdc-b022-4dfe45a49b5a`<br>fnv1a32:5b5372c2 | **stored, no slip yet** — POST rank 1 (crown) | gen 116 |
| 21 | e6-glow-mesa | `e6-glow-mesa-01` | era-retired | 117 | **SECURED** | 15 | 109 | 460.5s | 664s | `attempt-1-tape.json` · `agent-b3c94abf-7ab4831c-02a4-42ac-b4b9-806d94be84d9`<br>fnv1a32:87bea4cc | verified `fnv1a32:b8a19332` rank 1 | gen 117<br>slip `agent-b3c94abf-7ab4831c-02a4-42ac-b4b9-806d94be84d9` |
| 22 | e6-half-life-hollow | `e6-half-life-hollow-01` | era-retired | 118 | **SECURED** | 20 | 200 | 600s | 783s | `attempt-1-tape.json` · `agent-e145a6fc-a45e8254-4692-4b12-8bd0-211f9b231b5e`<br>fnv1a32:25b47509 | pending rank 1 | gen 118<br>slip `agent-e145a6fc-a45e8254-4692-4b12-8bd0-211f9b231b5e` |
| 23 | e6-picnic | `e6-picnic-01` | era-retired | 119 | **SECURED** | 20 | 500 | 600s | 916s | `attempt-1-tape.json` · `agent-b983e9f7-fad21a3d-5712-43f1-88d4-fbf9739279ed`<br>fnv1a32:0719b405 | verified `fnv1a32:fd3af43b` rank 1 | gen 119<br>slip `agent-b983e9f7-fad21a3d-5712-43f1-88d4-fbf9739279ed` |
| 24 | e10-ember-shore | `e10-ember-shore-01` | never-claimed | 120 | **SECURED** | 12 | 60 | 360s | 977s | `attempt-1-tape.json` · `agent-f22dfc12-126489fe-03f1-4d84-9eb0-c70a373bdb0c`<br>fnv1a32:d59af0f8 | verified `fnv1a32:d3959e47` rank 1 | gen 120<br>slip `agent-f22dfc12-126489fe-03f1-4d84-9eb0-c70a373bdb0c` |
| 25 | e10-last-claim | `default` | era-retired | 121 | **SECURED** | 8 | 90 | 240.033s | 773s | `attempt-1-tape.json` · `agent-74ad77ce-0d18bc0d-17ef-4a44-8e03-827a06c4b5b3`<br>fnv1a32:ace5075d | pending rank 1 | gen 121<br>slip `agent-74ad77ce-0d18bc0d-17ef-4a44-8e03-827a06c4b5b3` |
| 26 | e1-baron | `e1-baron-01` | era-retired | 122 | **not secured** | 20 | 166 | 535.933s | 626s | `attempt-1-tape.json` · `agent-4ae40150-f4266f14-bb85-4978-be0b-e56f16720f68`<br>fnv1a32:e465dcef | — | gen 122 |
| 27 | e1-night-shift | `e1-night-shift-01` | era-retired | 123 | **SECURED** | 25 | 200 | 750.033s | 1501s ⏱ | `attempt-2-tape.json` · `agent-8b9ea9eb-d838f2da-9d40-4f72-bf4d-f0375daf1f3b`<br>fnv1a32:fcceee6e | pending rank 1 | gen 123<br>slip `agent-8b9ea9eb-d838f2da-9d40-4f72-bf4d-f0375daf1f3b` |
| 28 | e2-hill-mine | `e2-hill-mine-01` | era-retired | 124 | **not secured** | 13 | 89 | 391.600s | 957s | `tune-1-tape.json` · `agent-765f7566-ec392b32-97c0-478c-9808-d301f796bfbd`<br>fnv1a32:82997d04 | — | gen 124 |
| 29 | e2-trestle | `e2-trestle-01` | era-retired | 125 | **SECURED** | 14 | 176 | 618.6s | 879s | `attempt-1-tape.json` · `agent-aa651f01-16e8b030-6480-4fcb-ac8d-1ba9aa8d5107`<br>fnv1a32:1197d233 | pending rank 1 | gen 125<br>slip `agent-aa651f01-16e8b030-6480-4fcb-ac8d-1ba9aa8d5107` |
| 30 | e3-fairground | `e3-fairground-01` | era-retired | 126 | **SECURED** | 12 | 62 | 360s | 953s | `attempt-2-tape.json` · `agent-beea931a-f98a26f6-98b4-4190-a93c-38e583719e11`<br>fnv1a32:f9983ffb | verified `fnv1a32:092d72d8` rank 1 | gen 126<br>slip `agent-beea931a-f98a26f6-98b4-4190-a93c-38e583719e11` |
| 31 | e4-boneyard | `e4-boneyard-01` | era-retired | 127 | **SECURED** | 12 | 200 | 360s | 704s | `attempt-1-tape.json` · `agent-90aa867f-daf1bdbd-7d8c-41ff-9edb-ce0ff1ee99a6`<br>fnv1a32:f25913c4 | pending rank 1 | gen 127<br>slip `agent-90aa867f-daf1bdbd-7d8c-41ff-9edb-ce0ff1ee99a6` |
| 32 | e4-dust-flats | `e4-dust-flats-01` | era-retired | 128 | **not secured** | 13 | 175 | 396.633s | 623s | `attempt-1-tape.json` · `agent-44a82bd2-401cb489-5875-43ee-82da-4deab6cd8207`<br>fnv1a32:03eb20ce | — | gen 128 |
| 33 | e4-long-road | `e4-long-road-01` | open-question | 129 | **SECURED** | 12 | 30 | 360s | 551s | `attempt-1-tape.json` · `agent-1b327528-9cb9bfaa-aa78-4f1e-b883-8a0eaa5d8f0d`<br>fnv1a32:f776100f | verified `fnv1a32:20ec99c3` rank 1 | gen 129<br>slip `agent-1b327528-9cb9bfaa-aa78-4f1e-b883-8a0eaa5d8f0d` |
| 34 | e5-stillwater | `e5-stillwater-01` | era-retired | 130 | **SECURED** | 12 | 200 | 360s | 400s | `attempt-1-tape.json` · `agent-e8a33e20-a5021bdf-f2bc-4218-8ee0-6f4ff246c414`<br>fnv1a32:1841b36d | pending rank 1 | gen 130<br>slip `agent-e8a33e20-a5021bdf-f2bc-4218-8ee0-6f4ff246c414` |
| 35 | e8-far-side | `e8-far-side-01` | era-retired | 131 | **SECURED** | 20 | 60 | 600s | 1041s | `attempt-2-tape.json` · `agent-5d56eef3-05beaded-6d29-41b0-b691-5fe2e8125e0c`<br>fnv1a32:64b3b447 | verified `fnv1a32:1795242e` rank 1 | gen 131<br>slip `agent-5d56eef3-05beaded-6d29-41b0-b691-5fe2e8125e0c` |
| 36 | e8-low-orbit | `e8-low-orbit-01` | open-question | 132 | **not secured** | 13 | 60 | 401.500s | 611s | `tune-1-tape.json` · `agent-4d9b57ba-8eef855e-6986-419a-8186-0b5c73016202`<br>fnv1a32:8dc75ee2 | — | gen 132 |
| 37 | e10-archive-world | `e10-archive-world-01` | never-claimed | 133 | **SECURED** | 12 | 200 | 360s | 880s | `attempt-1-tape.json` · `agent-95cae990-be5bfe55-c25b-4145-a370-7f4904a6312f`<br>fnv1a32:d05bd4b5 | ⚠ not submitted | gen 133 |

## The end-of-heat verdict sweep (2026-09-18T11:28Z)

The rows above record each ride's verdict AS IT LANDED. The county's assay is asynchronous and this
heat lost twelve slips to the F-HEAT14-6 index drop, so the board state below — measured from the live
API, not from the slips — is the authority on what stands.

| state | count | contracts |
|---|---|---|
| **verified and standing** | **18** | the-claim · e1-dry-gulch · e1-night-shift · e1-twin-banks · e10-ember-shore · e2-pressure-garden · e2-trestle · e3-blackout-ridge · e3-fairground · e3-moth-season · e4-long-road · e5-deepwater-claim · e6-glow-mesa · e6-picnic · e7-relay-rush · e7-relay-valley · e8-far-side · e8-mare-claim |
| secured, POST accepted (`stored`, crown rank 1), **assay index dropped it** (F-HEAT14-6) | 12 | e2-incline · e4-boneyard · e4-gusher-county · e5-flotilla · e5-regatta · e5-stillwater · e6-half-life-hollow · e7-dead-band · e7-echo-canyon · e9-devils-alley · e10-last-claim · e10-archive-world (its FIRST POST was refused `rate_limited`, F-HEAT14-7) |
| secured, **refused on the transport** before the door saw it (F-HEAT14-4) | 1 | e9-dome-basin — nginx `413 Request Entity Too Large`, 1,206,243 B body |
| not secured | 6 | e3-canyon-works · e8-eclipse · e1-baron · e2-hill-mine · e4-dust-flats · e8-low-orbit |
| **never ridden** | **0** | — |

`deliver.mjs` re-delivers the dropped twelve one at a time at a 15-minute cadence (a 429 is not a
delivery; the same reel is retried rather than skipped) — its log is `deliver.log` / `deliver-run.log`.
