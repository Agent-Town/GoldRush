# Heat 12 — the mechanic-changed sweep — matrix (updated after EVERY ride)

Operator: an attended Claude agent (Claude Opus 5, session `session_01Rpu6VBzeT24Kk8jHuRHkpQ`), hosting from a detached arena. Rig: Claude Opus 5 (`claude-opus-5`) via Claude Code CLI **2.1.257** (`claude --version`), headless `claude -p`, one ride at a time under `nice -n 5` (other implementers share this host tonight).

## Arena (era gate)

| fact | value |
|---|---|
| live build (`https://agenttown.app/goldrush/version.json`) | `038cc280`, builtAt `2026-09-05T14:14:13Z` |
| arena | `/tmp/heat12-038cc280` = `git worktree add --detach` at `038cc2809f317fa61fec25fa5765ff37c48b8803`; `npm ci --no-audit --no-fund` (57 packages); branch `heat12/opus-sweep` cut from it |
| arena `computeEngineHash` | `86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b` |
| era gate | **PASS** — that hash is the CURRENT era-5 pin in main's `assets/engine-era.json` (top-level `engineHash` and the last of 40 pins; pinned 2026-09-05, "src re-hash: landmark-lighting-calibration drain"). ⚠ It is NOT in the ARENA's copy of that file: the pin was appended by the bookkeeping commit `a5f9f7ab9` one commit AFTER the deploy it describes ("era-5 pin 86e53f37; deployed at 038cc280"). The gate was therefore not trusted from the file — it was **proved against the live door** by the skew probe below, which came back `assayEra: true`. |
| door smoke | `gr-sim --contract e3-canyon-works --seed e3-canyon-works-01 --policy idle` → `w3 / 98.267 s / 0 g / fnv1a32:ac7eaf69` (the idle floor; matches heat 11's "the hero died at wave 3") |
| node | v23.11.1 for rides (the county's assayer replays on 26.4.0 server-side; the probe below verified under it) |
| viewVersion | **2** (heat 11 rode viewVersion 1) |

## Skew probe (before any long ride) — never ranked

| field | value |
|---|---|
| source | heat 11's verified probe tape (itself the verified debut the-claim tape `agent-6acf1470-99b30d3a…`, Opus, w10/680g) replayed order-for-order through this arena (`probe/probe-driver.mjs`, heat-9-r2's driver verbatim) |
| probe outcome | secured w10 / 300.000 s / 680 gold / 299 kills / 65 calls, `eventLogHash fnv1a32:a93d1bbc` — **identical to heat 11 and to the debut ride**: behaviour is unchanged across the whole pin lineage, including this week's thirteen mechanic changes and the lighting/sampler work |
| probe tape | `agent-6acf1470-bf7b0f42-da27-453c-a5c7-6dae2f758019`, papers `038cc2809 · 86e53f37… · era 5 · viewVersion 2` |
| door verdict | `assay: verified`, `assayHash fnv1a32:cc026656` — **identical to heat 11's probe assay hash** — `assayEra: true`, `ranked: false`, `rank: null` (`harness: operator-probe`, which `public/skill.md:52` defines as "verified but never ranked") |
| envelope | `durationTicks 9001`, last entry `t 9000` — a tape that the pre-F-HEAT11-1 door would have refused, admitted here. The cure is live. |

## Rides

| # | contract | seed | stake | gen | outcome | waves | gold | time | wall | tape / eventLogHash | door verdict slip | notebook |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | e3-canyon-works | `e3-canyon-works-01` | never-claimed | 37 | **not secured** | 3 | 120 | 106.500s | 1007s | `attempt-1-tape.json` · `agent-9284f916-48c7172d-7762-4e69-a80a-b6ed50c2c1cd`<br>fnv1a32:8e30df40 | — | gen 37 |
| 2 | e7-relay-valley | `e7-relay-valley-01` | never-claimed | 38 | **not secured** | 15 | 40 | 460.333s | 919s | `tune-3-tape.json` · `agent-211bb7c1-655ec773-5a6b-4afd-8665-5871fa07cff4`<br>fnv1a32:f9866fc8 | — | gen 38 |
| 3 | e8-mare-claim | `e8-mare-claim-01` | never-claimed | 39 | **SECURED** | 20 | 60 | 600s | 918s | `attempt-1-tape.json` · `agent-4036192d-b1ebab0e-a2e1-42ba-b7dd-c2edf9f3d797`<br>fnv1a32:e06bda53 | verified `fnv1a32:f84d1d2b` rank 1 | gen 39<br>slip `agent-4036192d-b1ebab0e-a2e1-42ba-b7dd-c2edf9f3d797` |
| 4 | e9-dome-basin | `e9-dome-basin-01` | never-claimed | 40 | **not secured** | 16 | 80 | 499.200s | 1322s | `tune-3-tape.json` · `agent-8fb761f3-6515dfc7-e4d0-4c2e-a91e-eb18b8ba22d5`<br>fnv1a32:2b4a09b5 | — | gen 40 |
| 5 | e1-drill-yard | `default` | never-claimed | 41 | **not secured (WALL)** | 2 | 180 | 60.033s | 600s ⏱ | `attempt-1-tape.json` · `agent-c91b6e59-2514e50c-1b43-4f42-abae-6be06ccbb88d`<br>fnv1a32:ff497859 | — | gen 41 |
| 6 | e3-moth-season | `e3-moth-season-01` | mechanic-changed | 42 | **SECURED** | 12 | 200 | 360s | 737s | `attempt-1-tape.json` · `agent-7739d978-82ca7118-bd78-4b36-ae7c-9051ac88d5e7`<br>fnv1a32:b98efd5e | verified `fnv1a32:ed3974ff` rank 2 | gen 42<br>slip `agent-7739d978-82ca7118-bd78-4b36-ae7c-9051ac88d5e7` |
| 7 | e7-relay-rush | `e7-relay-rush-01` | mechanic-changed | 43 | **SECURED** | 20 | 200 | 600s | 1081s ⏱ | `attempt-1-tape.json` · `agent-e8c4f218-4307b4e1-08a4-457f-92ae-70f84329c564`<br>fnv1a32:ed5dc794 | **stored, never assayed** (F-HEAT12-4: the rig already holds a better row and a board keeps one standing per owner, so no assay slip is ever issued) | gen 43 |
| 8 | e7-echo-canyon | `e7-echo-canyon-01` | mechanic-changed | 44 | **SECURED** | 20 | 200 | 600s | 1082s ⏱ | `tune-1-tape.json` · `agent-d47dfbaa-7f9bcd5a-824a-42be-a3c1-fc18fd4ca4af`<br>fnv1a32:19817b46 | verified `fnv1a32:8007b47d` | gen 44<br>slip `agent-d47dfbaa-7f9bcd5a-824a-42be-a3c1-fc18fd4ca4af` |
| 9 | e7-dead-band | `e7-dead-band-01` | mechanic-changed | 45 | **SECURED** | 20 | 200 | 600s | 609s | `attempt-1-tape.json` · `agent-c4c98518-9e45c5db-09d9-4386-b7bb-d2cd624ba982`<br>fnv1a32:297c535f | verified `fnv1a32:e181301c` | gen 45<br>slip `agent-c4c98518-9e45c5db-09d9-4386-b7bb-d2cd624ba982` |
| 10 | e5-stillwater | `e5-stillwater-01` | mechanic-changed | 46 | **SECURED** | 12 | 200 | 360s | 876s | `attempt-1-tape.json` · `agent-82a5f5e0-59609077-337d-490f-90ca-7b9abc2ccf79`<br>fnv1a32:3e887b17 | verified `fnv1a32:338d5c80` rank 1 | gen 46<br>slip `agent-82a5f5e0-59609077-337d-490f-90ca-7b9abc2ccf79` |
| 11 | e8-far-side | `e8-far-side-01` | mechanic-changed | 47 | **SECURED** | 20 | 200 | 600s | 732s | `attempt-1-tape.json` · `agent-03784526-96166760-5341-4b3e-bd9f-7338d954441f`<br>fnv1a32:f540c405 | verified `fnv1a32:a9448c78` | gen 47<br>slip `agent-03784526-96166760-5341-4b3e-bd9f-7338d954441f` |
| 12 | e8-low-orbit | `e8-low-orbit-01` | mechanic-changed | 48 | **SECURED** | 20 | 200 | 600s | 508s | `attempt-1-tape.json` · `agent-6d2f797a-909e53e2-3dd6-4aa9-8160-2be17e6a78f7`<br>fnv1a32:8629a98e | verified `fnv1a32:c69324de` | gen 48<br>slip `agent-6d2f797a-909e53e2-3dd6-4aa9-8160-2be17e6a78f7` |
| 13 | e8-eclipse | `e8-eclipse-01` | mechanic-changed | 49 | **not secured** | 19 | 190 | 585.200s | 719s | `attempt-1-tape.json` · `agent-65c5a680-9ccd6077-0a9f-4a8c-b36e-f459397b7149`<br>fnv1a32:a0a58077 | — | gen 49 |
| 14 | e4-long-road | `e4-long-road-01` | mechanic-changed | 50 | **not secured** | 5 | 35 | 157.600s | 551s | `tune-2-tape.json` · `agent-47a8043f-91631d7e-f091-4c5e-a1ce-97dbebf22a1a`<br>fnv1a32:e024dea1 | — | gen 50 |
| 15 | e4-dust-flats | `e4-dust-flats-01` | mechanic-changed | 51 | **SECURED** | 14 | 55 | 426.133s | 1081s ⏱ | `attempt-2-tape.json` · `agent-a2abb3af-a22234cd-28a3-4b2c-b9c6-2f2baa797847`<br>fnv1a32:aa5cf98e | **stored, no slip yet** — POST rank 1 (crown) | gen 51 |
| 16 | e4-boneyard | `e4-boneyard-01` | mechanic-changed | 52 | **SECURED** | 12 | 200 | 360s | 655s | `attempt-1-tape.json` · `agent-3af455e5-52d1fd7c-5ddf-475e-84f1-1081e5f2caf0`<br>fnv1a32:76da210d | verified `fnv1a32:49e829d4` | gen 52<br>slip `agent-3af455e5-52d1fd7c-5ddf-475e-84f1-1081e5f2caf0` |
| 17 | e4-gusher-county | `e4-gusher-county-01` | mechanic-changed | 53 | **SECURED** | 12 | 5 | 360s | 740s | `attempt-1-tape.json` · `agent-30665e9d-03c08c59-94c6-4b86-b1fd-16259206a52d`<br>fnv1a32:b61647e9 | verified `fnv1a32:abfd532f` | gen 53<br>slip `agent-30665e9d-03c08c59-94c6-4b86-b1fd-16259206a52d` |
| 18 | the-claim | `e1-the-claim-01` | stale-receipt | 54 | **SECURED** | 10 | 76 | 300s | 386s | `attempt-1-tape.json` · `agent-2d257d8b-91bfcbf4-53e5-4c23-b5ae-d195fe447e9d`<br>fnv1a32:23da1694 | verified `fnv1a32:0e4ff630` | gen 54<br>slip `agent-2d257d8b-91bfcbf4-53e5-4c23-b5ae-d195fe447e9d` |
| 19 | e1-baron | `e1-baron-01` | stale-receipt | 55 | **not secured** | 20 | 200 | 536.200s | 512s | `tune-1.json` · `agent-454a4585-356542d5-cc71-4209-9bd9-279bf6858e42`<br>fnv1a32:41f0518d | — | gen 55 |
| 20 | e1-night-shift | `e1-night-shift-01` | stale-receipt | 56 | **not secured** | 20 | 32 | 615.400s | 504s | `attempt-1-tape.json` · `agent-f255bbbc-022dd78b-1973-4fd6-b333-e77f3a434bb2`<br>fnv1a32:94ab6114 | — | gen 56 |
| 21 | e2-hill-mine | `e2-hill-mine-01` | stale-receipt | 57 | **not secured** | 15 | 48 | 470.567s | 568s | `attempt-1-tape.json` · `agent-79d13893-f57ad81f-41e7-452e-94ba-087d1bbffabb`<br>fnv1a32:d00d8e69 | — | gen 57 |
| 22 | e9-dome-basin | `e9-dome-basin-01` | second-attempt | 58 | **not secured** | 14 | 96 | 439.567s | 686s | `tune-1-tape.json` · `agent-8e51d98b-58f6f224-e330-4e62-b071-e3d3d8d93ac2`<br>fnv1a32:17e14213 | — | gen 58 |
| 23 | e7-relay-valley | `e7-relay-valley-01` | second-attempt | 59 | **not secured** | 10 | 70 | 307.867s | 554s | `attempt-1-tape.json` · `agent-807d85f3-a7f9ed28-db67-492a-9bd0-df4c2c0b3454`<br>fnv1a32:56777ed0 | — | gen 59 |
| 24 | e3-canyon-works | `e3-canyon-works-01` | second-attempt | 60 | **not secured** | 20 | 200 | 600.000s | 606s | `attempt-1-tape.json` · `agent-d5f94574-bea24874-619b-41e4-93a3-54f3718ab9eb`<br>fnv1a32:d5528e07 | — | gen 60 |

## Ride-count reconciliation

24 rows above = **21 first attempts** (the master's ride order: the five never-claimed, the twelve
mechanic-changed, then the four board contracts whose receipt predated 2026-09-03) + **3 second
attempts** on the never-claimed maps that did not secure, each with a changed plan named by the rig
itself. Never a third on any contract.

One further ride is NOT in this table and is not a rig result: `e3-moth-season` generation 42 was
killed 90 s in by an operator-side halt (the harness stopped the background task the queue was
running under, and macOS has no `setsid`, so the queue and its rider shared the killed process
group). Booked **DNF-transport**, preserved verbatim under `rides/e3-moth-season.DNF-operator-halt/`
and `artifacts/heat12/opus/e3-moth-season.DNF-operator-halt/` per the retention law, and re-ridden
from the same queue entry with a fresh generation-42 charter — that re-ride is row 6.

`e7-relay-valley` row 2 is the one charter of the heat that did not carry its immediate predecessor's
notebook entry (it was launched moments before generation 37 was appended). The notebook/matrix
append was then moved *into* the ride driver so it cannot recur.

## Reading the verdict column

- `verified <hash>` — the county assayed the reel and it replayed. This is a receipt.
- `stored, no slip yet — POST rank N` — the door accepted it and ranked it provisionally; the assay
  had not returned when the row was written. Re-poll with `repoll-verdicts.mjs`.
- `stored, never assayed (F-HEAT12-4)` — the door accepted it and then dropped its assay locator. A
  re-POST of the identical bytes re-queues it; both such reels are owed one.
- `—` — the ride did not secure, or the rig declined to put a tape forward.

The `waves`/`gold` columns are the **tape's** numbers, i.e. what the rider measured. The county's
board publishes different gold, rewritten from its own replay (F-HEAT12-5): mare-claim 60 → 1180,
moth-season 200 → 530, echo-canyon 200 → 870. Neither number is wrong; they measure different things.
