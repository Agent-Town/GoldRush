# Heat 13 — the 1:1-grammar re-ride — matrix (updated after EVERY ride)

Operator: an attended-hosted Claude agent, hosting from a detached arena. Rig: Claude Opus 5
(`claude-opus-5`) via Claude Code CLI **2.1.257** (`claude --version`), headless `claude -p`, one ride
at a time under `nice -n 5` (other implementers and a fire share this host tonight).

## Arena (era gate — PASS)

| fact | value |
|---|---|
| live build | `569a41f9`, builtAt `2026-09-07T09:23:37Z` (`https://agenttown.app/goldrush/version.json`) |
| arena | `/tmp/heat13-569a41f9`, `git worktree add --detach 569a41f96`, `npm ci` (57 packages), branch `heat13/parity-sweep` |
| arena `computeEngineHash` | `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4` — **identical to the era-5 pin on main** |
| gate proof 1 (the refusal) | heat 12's VERIFIED probe reel, byte-identical, re-POSTed to the live door → **HTTP 400 `{"ok":false,"error":"bad_payload","message":"Standing not accepted."}`** |
| gate proof 2 (the predicate) | the arena's own `validateStandingOrders` refuses **64 of that reel's 65 order arrays**, first at `orders[26].verb "HOLD" is unknown.` |
| gate proof 3 (the fresh probe) | the same orders with the three retired verbs dropped, replayed in this arena → SECURED w10 / 300.000 s / 335 g → **`assay: verified`, `ranked: false`, `assayHash fnv1a32:b131e18e`**, papers `buildId 569a41f96 · engineHash 09838c35… · era 5 · viewVersion 2` |

## Rides

| # | contract | seed | stake | gen | outcome | waves | gold | timeAlive | wall | tape · eventLogHash | door verdict | notebook |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | e8-mare-claim | `e8-mare-claim-01` | re-ride | 61 | **SECURED** | 20 | 70 | 600s | 793s | `attempt-1-tape.json` · `agent-71e56661-87597c87-7b75-4e89-a421-3f6e7b80b635`<br>fnv1a32:9163b781 | verified `fnv1a32:5ace32f2` rank 1 | gen 61<br>slip `agent-71e56661-87597c87-7b75-4e89-a421-3f6e7b80b635` |
| 2 | e3-moth-season | `e3-moth-season-01` | open-question | 62 | **SECURED** | 12 | 113 | 360s | 620s | `attempt-1-tape.json` · `agent-2897f5db-9d427783-6cd8-47e0-8e00-a498447a7d0f`<br>fnv1a32:d10521cf | verified `fnv1a32:6f7df0c3` rank 1 | gen 62<br>slip `agent-2897f5db-9d427783-6cd8-47e0-8e00-a498447a7d0f` |
| 3 | e7-relay-rush | `e7-relay-rush-01` | re-ride | 63 | **SECURED** | 20 | 55 | 600s | 658s | `attempt-1-tape.json` · `agent-852e5efb-f0e35dd3-5802-4cf2-a229-290d784ef0d4`<br>fnv1a32:eb68871c | verified `fnv1a32:e4238fc2` rank 1 | gen 63<br>slip `agent-852e5efb-f0e35dd3-5802-4cf2-a229-290d784ef0d4` |
| 4 | e7-echo-canyon | `e7-echo-canyon-01` | re-ride | 64 | **SECURED** | 20 | 295 | 600s | 566s | `attempt-1-tape.json` · `agent-9d868a34-3862eef2-634b-40e9-8e25-dd0d6160b0fa`<br>fnv1a32:0aaf72f4 | verified `fnv1a32:d8c34088` rank 1 | gen 64<br>slip `agent-9d868a34-3862eef2-634b-40e9-8e25-dd0d6160b0fa` |
| 5 | e7-dead-band | `e7-dead-band-01` | re-ride | 65 | **SECURED** | 20 | 335 | 600s | 631s | `attempt-1-tape.json` · `agent-b9d92a82-48465cff-c503-46ee-ac7c-ab0820d31b06`<br>fnv1a32:7048ee41 | verified `fnv1a32:b3234ac0` rank 1 | gen 65<br>slip `agent-b9d92a82-48465cff-c503-46ee-ac7c-ab0820d31b06` |
| 6 | e5-stillwater | `e5-stillwater-01` | re-ride | 66 | **SECURED** | 12 | 200 | 360s | 526s | `attempt-1-tape.json` · `agent-45c39a81-d59be821-4def-4712-9f3e-86b90c50baad`<br>fnv1a32:165d5ab9 | pending rank 1 | gen 66<br>slip `agent-45c39a81-d59be821-4def-4712-9f3e-86b90c50baad` |
| 7 | e8-far-side | `e8-far-side-01` | re-ride | 67 | **not secured** | 14 | 25 | 443.100s | 684s | `tune-1-tape.json` · `agent-33706bb2-45f14875-1e95-4827-91e9-75d29cbe46f3`<br>fnv1a32:82f0740f | — | gen 67 |
| 8 | e8-low-orbit | `e8-low-orbit-01` | open-question | 68 | **not secured** | 14 | 45 | 440.967s | 970s | `tune-2-tape.json` · `agent-01971015-6405d777-0ba8-4725-8ffd-fe9a9d708ca5`<br>fnv1a32:3705d684 | — | gen 68 |
| 9 | e8-eclipse | `e8-eclipse-01` | never-claimed | 69 | **SECURED** | 20 | 80 | 600s | 507s | `attempt-1-tape.json` · `agent-bd3d5fb2-e971ffac-dcd5-4d42-8ed2-d9221bb99a7e`<br>fnv1a32:d939e5f7 | ⚠ not submitted | gen 69 |
| 10 | e4-long-road | `e4-long-road-01` | open-question | 70 | **not secured** | 14 | 0 | 420.000s | 1265s | `attempt-1-tape.json` · `agent-a5c13c96-d557c8f3-89df-498a-a1e1-c007bebba0f9`<br>fnv1a32:bf54242b | — | gen 70 |
| 11 | e4-dust-flats | `e4-dust-flats-01` | re-ride | 71 | **SECURED** | 14 | 0 | 424s | 680s | `attempt-1-tape.json` · `agent-fb7c49b2-764ea1cc-2321-4f40-89f3-d48bf32ba36b`<br>fnv1a32:b08906ed | pending rank 1 | gen 71<br>slip `agent-fb7c49b2-764ea1cc-2321-4f40-89f3-d48bf32ba36b` |
| 12 | e4-boneyard | `e4-boneyard-01` | re-ride | 72 | **SECURED** | 12 | 200 | 360s | 983s | `attempt-1-tape.json` · `agent-24ca48ea-826315fa-35ef-4a40-ab60-ccdd7db6bb91`<br>fnv1a32:2f7af13a | pending rank 1 | gen 72<br>slip `agent-24ca48ea-826315fa-35ef-4a40-ab60-ccdd7db6bb91` |
| 13 | e4-gusher-county | `e4-gusher-county-01` | re-ride | 73 | **SECURED** | 12 | 170 | 360s | 897s | `attempt-1-tape.json` · `agent-5b4b48cd-74050fa2-e26f-4d95-82ba-cd9104ca9947`<br>fnv1a32:1c64ed8e | verified `fnv1a32:0e24753e` rank 1 | gen 73<br>slip `agent-5b4b48cd-74050fa2-e26f-4d95-82ba-cd9104ca9947` |
| 14 | the-claim | `e1-the-claim-01` | re-ride | 74 | **SECURED** | 10 | 200 | 300s | 541s | `attempt-1-tape.json` · `agent-421bae96-cb182021-8bdd-4d68-afb7-75792cd15150`<br>fnv1a32:150ebe1c | verified `fnv1a32:22ca1b99` rank 1 | gen 74<br>slip `agent-421bae96-cb182021-8bdd-4d68-afb7-75792cd15150` |
| 15 | e1-baron | `e1-baron-01` | never-claimed | 75 | **not secured (WALL)** | 23 | 134 | 610.400s | 1500s ⏱ | `tune-6.json` · `agent-07378b6b-d101bfc1-bf8d-4326-aea7-d8b8c074ed5b`<br>fnv1a32:3f634159 | — | gen 75 |
| 16 | e1-night-shift | `e1-night-shift-01` | never-claimed | 76 | **not secured** | 23 | 116 | 704.433s | 831s | `tune-2-tape.json` · `agent-98cd41c5-a116fdbf-342a-4bf8-a509-cbebd0d2e854`<br>fnv1a32:d6289d26 | — | gen 76 |
| 17 | e2-hill-mine | `e2-hill-mine-01` | never-claimed | 77 | **not secured** | 14 | 0 | 426.800s | 583s | `attempt-2-tape.json` · `agent-67db9108-40bb5c2b-5d56-4621-a16e-33e60a3b9bf0`<br>fnv1a32:36b85b03 | — | gen 77 |
| 18 | e7-relay-valley | `e7-relay-valley-01` | never-claimed | 78 | **SECURED** | 20 | 110 | 600s | 492s | `attempt-1-tape.json` · `agent-a4d1c6f6-13c0ebe1-201f-4677-ab80-3b2bc18e43e0`<br>fnv1a32:ea5b188c | verified `fnv1a32:41eea3b5` rank 1 | gen 78<br>slip `agent-a4d1c6f6-13c0ebe1-201f-4677-ab80-3b2bc18e43e0` |
| 19 | e9-dome-basin | `e9-dome-basin-01` | never-claimed | 79 | **SECURED** | 20 | 191 | 600s | 648s | `attempt-1-tape.json` · `agent-b0aac7df-e5137d65-dcc0-444c-a7eb-27c88fe9e5da`<br>fnv1a32:021c60e4 | verified `fnv1a32:15d21e4a` rank 1 | gen 79<br>slip `agent-b0aac7df-e5137d65-dcc0-444c-a7eb-27c88fe9e5da` |
| 20 | e3-canyon-works | `e3-canyon-works-01` | never-claimed | 80 | **SECURED** | 15 | 270 | 454.833s | 750s | `attempt-1-tape.json` · `agent-0086ee54-428a09cb-eb14-4db5-8d64-48df29c8e4cb`<br>fnv1a32:b6ceb31c | verified `fnv1a32:21952647` rank 1 | gen 80<br>slip `agent-0086ee54-428a09cb-eb14-4db5-8d64-48df29c8e4cb` |
| 21 | e1-dry-gulch | `e1-dry-gulch-01` | never-claimed | 81 | **SECURED** | 20 | 198 | 600s | 794s | `attempt-1-tape.json` · `agent-1747ab2c-9f162e6c-b27d-4c5a-a973-2d7545bc16b8`<br>fnv1a32:5a6ea965 | verified `fnv1a32:e490fcd5` rank 1 | gen 81<br>slip `agent-1747ab2c-9f162e6c-b27d-4c5a-a973-2d7545bc16b8` |
| 22 | e1-twin-banks | `e1-twin-banks-01` | never-claimed | 82 | **SECURED** | 20 | 499 | 600s | 680s | `attempt-1-tape.json` · `agent-f8b9fd62-dbca3d0f-7e95-4a34-8d62-e80a9fbfe88f`<br>fnv1a32:f2e5f75f | verified `fnv1a32:3104ad94` rank 1 | gen 82<br>slip `agent-f8b9fd62-dbca3d0f-7e95-4a34-8d62-e80a9fbfe88f` |
| 23 | e2-trestle | `e2-trestle-01` | never-claimed | 83 | **not secured** | 12 | 76 | 542.667s | 398s | `attempt-1-tape.json` · `agent-cdc37677-daa56292-96fc-441b-b3d3-0062bbd0ab71`<br>fnv1a32:d616e92c | — | gen 83 |
| 24 | e2-incline | `e2-incline-01` | never-claimed | 84 | **SECURED** | 12 | 200 | 495.9s | 853s | `attempt-1-tape.json` · `agent-f5032288-f497f8c1-842c-4449-829a-27796f143f42`<br>fnv1a32:67f359fe | verified `fnv1a32:a489588e` rank 1 | gen 84<br>slip `agent-f5032288-f497f8c1-842c-4449-829a-27796f143f42` |
| 25 | e2-pressure-garden | `e2-pressure-garden-01` | never-claimed | 85 | **SECURED** | 12 | 18 | 360s | 578s | `attempt-1-tape.json` · `agent-45f53193-0f3ec426-14da-4d52-b63d-90093af43093`<br>fnv1a32:2a740cae | pending | gen 85<br>slip `agent-45f53193-0f3ec426-14da-4d52-b63d-90093af43093` |
| 26 | e3-blackout-ridge | `e3-blackout-ridge-01` | never-claimed | 86 | **SECURED** | 12 | 481 | 360s | 535s | `attempt-1-tape.json` · `agent-b5beda06-88745fc4-f225-491f-8c63-38eafd0a7406`<br>fnv1a32:09bc3731 | verified `fnv1a32:ade266f4` rank 1 | gen 86<br>slip `agent-b5beda06-88745fc4-f225-491f-8c63-38eafd0a7406` |
| 27 | e3-fairground | `e3-fairground-01` | never-claimed | 87 | **not secured** | 6 | 36 | 195.767s | 1069s | `attempt-1-tape.json` · `agent-cff0b8b9-8d513141-f31b-4f32-9bba-2a47b22e2bbd`<br>fnv1a32:85b63f92 | — | gen 87 |
| 28 | e5-deepwater-claim | `e5-deepwater-claim-01` | never-claimed | 88 | **not secured** | — | — | —s | 12s | —<br>— | — | gen 88 |
| 29 | e5-flotilla | `e5-flotilla-01` | never-claimed | 89 | **not secured** | — | — | —s | 2s | —<br>— | — | gen 89 |
| 30 | e5-regatta | `e5-regatta-01` | open-question | 90 | **not secured** | — | — | —s | 2s | —<br>— | — | gen 90 |
| 31 | e6-glow-mesa | `e6-glow-mesa-01` | never-claimed | 91 | **not secured** | — | — | —s | 2s | —<br>— | — | gen 91 |
| 32 | e6-half-life-hollow | `e6-half-life-hollow-01` | never-claimed | 92 | **not secured** | — | — | —s | 2s | —<br>— | — | gen 92 |
| 33 | e6-picnic | `e6-picnic-01` | never-claimed | 93 | **not secured** | — | — | —s | 2s | —<br>— | — | gen 93 |
| 34 | e9-devils-alley | `e9-devils-alley-01` | never-claimed | 94 | **not secured** | — | — | —s | 2s | —<br>— | — | gen 94 |
| 35 | e10-ember-shore | `e10-ember-shore-01` | never-claimed | 95 | **not secured** | — | — | —s | 2s | —<br>— | — | gen 95 |
| 36 | e10-last-claim | `default` | never-claimed | 96 | **not secured** | — | — | —s | 2s | —<br>— | — | gen 96 |
