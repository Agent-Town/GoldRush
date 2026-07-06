# Owner playtest — Robin, 2026-07-06 (~14:30–14:50 local, post W1-01+02 merge)

First substantial owner playtest since the W1 world pass began. Build: main @ ~6471f74 (living water in). Mode: `?debug`, desktop. One long run + two short bench-check runs.

## Run Ledger (screenshot, end screen "THE CLAIM WENT QUIET")
| Stat | Value |
|---|---|
| Time held | 17:44 |
| Claim jumpers turned back | 1931 |
| Waves survived | 35 |
| Gold panned | 235 |
| Spent | 1199 |
| Beacons built | 6 |
| Blast toggles | 322 |
| Blast charge time | 01:51 |
| Best Claims history | 35w/17:44 + two 1w bench-check runs — persistence (M3 scoreboard) WORKING |

Signals: blast charge is a heavily engaged mechanic (322 toggles). Spent (1199) ≫ panned (235) → kill/steal-back gold dominates the economy. Died ~wave 32–35 after "giving up the base".

## Findings (owner's words → triage)

**F1 — "I can make an order, but I don't really see or can select my order again… multi target enhancement for the Spark Rig… it was not there."**
- Order text on disk (pending/, 07:16Z): *"I want an upgrade/enhancement/invention that allows my spark rig to shoot at more than one enemy at once."*
- Triage, three parts: (a) BUG — bench builds history from `import.meta.glob` of approved/+rejected/ only (`CraftingQueue.ts:31,35`); pending/ is never rendered on later boots → posted orders vanish from the player's view. → **task 039**. (b) MISSING HALF — no production assayer: nothing consumes pending/ (033's round-trip used fixtures). Needs the orchestrator-side assay loop (generate within contract.v1 → validate → verdict to approved/rejected). → fire-protocol design item, then Robin's order becomes the first live verdict. (c) KNOWN SCOPE — item application unwired (033: "arrived — collection opens soon"); applying approved items to the sim is the slice after the assayer exists.

**F2 — "Around wave 32 I had to give up the base. I cannot upgrade in a way that holds the wave improvement."**
- Balance data: upgrade scaling loses to wave escalation ~w30+. Feeds **021** (xp-economy audit, queue-paused) + relates to 012 (overwhelm valves) and 013 (building incentive). Economy signal above (kill-gold dominance) belongs in the same audit.

**F3 — "I am missing my Robot buddy."**
- The Prospector (M4) has typed tools, receipts, permission ladder — and NO body. Nothing to see, in debug or normal play. → **task lane-b-m4-06-embody-the-prospector** (billboard companion, placeholder-first, driven by EXISTING receipts; art slot in next batch).

**F4 — "…and more content."**
- Breadth appetite noted: paused content/feel tasks (021/026/027), charm-pass (014), art batches (029 town set processing now, s64), M6 actors (awaiting Robin's 3a/3b verdict). No new task; roadmap pressure.

**F5 — "I never select the upgrades for the seams. Seems to be a waste of talents for me."**
- Seam upgrade family = dead picks in the offer pool. Feeds **021** + revisit of 020 (offer weighting): buff seam value, make its payoff legible, or cut the family.

## Owner answers (same day, 2026-07-06)
1. **W1 direction verdict: PASS with finding.** "It is ok, but not a WOW moment — the waves of the water are too regular to be real. But ok." → Ladder UNLOCKED (w1-03/04/06 queued to lane-c). New finding **F-w1-02-1** (water periodicity) folded as the mandatory first item of the w1-03 task; W1-03 light/shadows is the designated wow-maker and the integration test for the illustrated-characters hybrid.
2. **Ceremony appeared: "it is ok — it should explain a bit more."** Plus: "for new players there is no help either… can come later with a menu." → 027 victory-must-matter UNPAUSED to queue/main with this note; first-run onboarding already exists in backlog as lane-c-polish-04-first-run-hints (later polish wave, per owner's "can come later").
3. **Owner throughput directive:** "Can we pack the pipeline? I have 4 Resets and 75% of a full Codex subscription to burn… tons of agents in parallel." → All lanes loaded (see handover §4); 021 also unpaused on the strength of findings F2/F5; M6 attempt-3a queued to lane-d under the standing 3a recommendation.

## Not covered by this playtest (still owed)
Turret-feel (M2 gate), water-feel fallback preference (air-bar vs chill-drain), favicon eyeball, Mac full-regression evidence.
