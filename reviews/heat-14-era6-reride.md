# Drain review — `heat-14-era6-reride`: every county board re-ridden on era 6 by Claude Opus 5 through the public door (attended drain from the operator's evidence, 2026-09-18)

**Slice/branch/tip:** `heat14/era6-reride` @ `646136549 (archive: pruned by the A3 rewrite)` — 69 evidence commits by the heat-14 operator agent (Claude Opus 5 on the owner's Anthropic subscription) hosting headless `claude -p` riders from the detached arena at the deployed commit `6075db901` (production build 6075db90 at the heat's start); master `tasks/heat-14-era6-reride.md`; the note `artifacts/gauntlet-heat14-e3949bfa/heat14-note.md` (written by the operator on 2026-09-18 11:32Z), the matrix, 37 ride directories, the receipts snapshots and the rig. **Merged as** `ea367da9d (archive: pruned by the A3 rewrite)` onto main (evidence only: 1,104 files under `artifacts/gauntlet-heat14-e3949bfa/`, 168 MB on disk, largest blob 14.3 MB, no `trace.zip`-class file; nothing in `src/`, the contracts, the door or `assets/engine-era.json`).
**Owner words, verbatim:** 2026-09-13 "we then have to make another run in the future but not immediately" · 2026-09-17 "Lets do them all." · "All on the Anthropic subscription" · 2026-09-18 "we are basically done with the quota :D".

## VERDICT: LANDED — ridden 37, secured 31, not secured 6, never ridden 0; two first-ever secures; the county board shows 18 of the 31 honest receipts

| number | value |
|---|---|
| boards ridden / secured / not secured / never ridden | 37 / 31 / 6 / 0 |
| first-ever secures in county history | 2 — `e10-ember-shore` (w12/60g, the hero took no damage) and `e10-archive-world` (w12/200g; its reel was then refused by the rate cap, F-HEAT14-7) |
| secured that heat 13 could not | 5 — e2-trestle, e3-fairground, e1-night-shift, e4-long-road (answers desk A15: it secures, with 243 s of errand slack), e8-far-side |
| secured by heat 13, not by this heat | 3 — e3-canyon-works, e8-eclipse (died 13.6 s short with 500 gold idle), e4-dust-flats |
| the six not-secured, in the riders' own `## Winnability` lines | all six name **the rider's own budget, never the map**; three "winnable", three "undecided-leaning-yes"; no era-6 board was reported unwinnable through the door |
| receipts, live API (`/api/standings`, 37 boards; `e1-drill-yard` is the training ground) | ranked rows **0 → 18**, retired reels **69 → 56** (a rider's new verified reel supersedes that rider's own retired reel, F-HEAT14-5) |
| why 18 and not 31 | 12 accepted submissions dropped out of the assay index (F-HEAT14-6) and one was refused by nginx before the door saw it (F-HEAT14-4) |
| the three cured maps (Trestle, Incline, Picnic) | each rider's idle probe reproduced the county's re-recorded null floor **to the millisecond** (1/70,700 ms · 2/119,333 ms · 3/97,967 ms), then all three SECURED (w14/176g · w12/129g · w20/500g with every ranking axis maxed) |
| rider wall / turns / tool calls | 8.15 h · 2,182 assistant turns · 1,070 tool calls; notebook generations 97–133 |
| era gate and skew probe | both PASS before the first ride (note §1) |

## The drain's own measurements
- The branch touches only `artifacts/gauntlet-heat14-e3949bfa/**` (`git diff --name-only main...HEAD` outside that prefix: empty); the arena's tracked tree stayed clean on every ride (`finish-ride.mjs`'s firewall check).
- The operator's re-delivery sweep for the twelve dropped reels (F-HEAT14-6) re-POSTed each and every one answered `assay_not_found` on the next poll: **a re-POST does not resurrect a dropped assay — the door re-stores the row, the assayer never re-queues it** (`deliver-run.log`, `repoll-verdicts.mjs`: submitted 31, verified 19, notFound 12). The sweep was stopped at the drain: it spends the per-rider cap for nothing.
- The operator agent was stopped at 14:25Z by the attended session after its deliverable was committed: it had spent three hours polling that sweep at ten-minute sleeps, re-sending its 380k-token context on every turn with no cache hit (F-HEAT14-9, process; the owner: "we are basically done with the quota"). The rides and the note were complete at 11:32Z.

## Findings (the operator's F-HEAT14-1..8, verbatim in the note; the drain's routing)
- **F-HEAT14-3 (OWNER'S DESK, design):** the E2 pressure mechanic is invisible through the door — no pressure, band, coal count or boiler fuel in any `now` view while `twist.pressureEnabled` is true and the boiler is priced at 70 g × 3; the rider calls 210 gold of boiler "a strictly dominated purchase", and F-MAPL-1's `coalSeconds` 12 → 36 "only triples the duration of a process I cannot observe". Either publish pressure in the view or stop pricing the boiler as a choice.
- **F-HEAT14-6 (county, P1, fire-authorable — F-HEAT13-2's recurrence, worse):** 12 of 31 accepted submissions (39 %) POSTed `stored, rank 1, crown` and then answered `assay_not_found` forever; the drop scales with submission rate. A stored standing with no assay slip is invisible on the board.
- **F-HEAT14-7 (county law, fire-authorable — it caps a heat):** the door allows 30 submissions per `anonId` per hour (`functions/api/standings.ts:166`), and `bumpCounter` refreshes the hour on every accepted submission, so under a heat "30 per hour" is 30 per heat; ride 37's own submission was refused `rate_limited`. Cure is a ruling: raise the cap above the board count, or stop refreshing the TTL, or exempt a declared operator harness.
- **F-HEAT14-4 (ops, attended):** nginx on the droplet answers HTTP 413 above ~1 MB (`client_max_body_size`) before the door can give a county reason; `e9-dome-basin`'s 1,206,243 B reel was lost to it. Raise the limit above the largest lawful reel, or let the door refuse oversize bodies with a reason.
- **F-HEAT14-1/-2 (rig):** no headroom surface from the CLI; the charter now travels on stdin (742 KB → 1.09 MB by ride 37, past `ARG_MAX`).
- **F-HEAT14-5 (accounting):** retired counts are not an independent measure — a rider's new verified reel retires its own old one.
- **F-HEAT14-8 (closes F-HEAT13-3):** `e8-far-side` secured (hero at 11 % HP, saved by a draft heal) and `e4-long-road` banked; heat 13's "predicted cannot secure" readings were the rider's budget, not the map.
- **F-HEAT14-9 (process, drain):** an operator agent must exit when its note is committed; waiting on a background script from inside the agent re-sends its whole context every turn. The brief's exit rule and a shell watcher in the main session are the cure (memory: agent-poll-loop-burns-quota).

## What was touched
`artifacts/gauntlet-heat14-e3949bfa/**` (new: the rig, `matrix.md`, `heat14-note.md`, `receipts-before/after.json`, 37 ride directories, the delivery and repoll logs); at the drain this review, `tasks/goals.json`, `tasks/BACKLOG.md`, `docs/OWNER-DESK-2026-09-06.md` (A15 answered by measurement), `STATUS.md`, the handover. Nothing under `src/`, `functions/`, the contracts or the door.
