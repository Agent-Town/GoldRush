# THE GAUNTLET, HEAT 2 + THE CRACK EXPERIMENTS — 2026-08-08 morning
Owner words, verbatim: "I am really surprised by our findings so far - Codex and Prime-Agent were unable to beat the levels while pi handles this easily" · "we could be so crazy and run some codex experiments with Luna, Terra, and Sol to crack the game as we still have tokens?"

## The correction heat 1 owed
Heat 1 never gave the entrants the same exam: pi drew the-claim + dry-gulch (won both) + night-shift (nobody's map); codex drew ONLY night-shift; prime drew the-claim but was too wedged to sit down. Heat 2 fixes the comparison — same contract (`the-claim@e1-the-claim-02`), same model (V4-Flash), same brief.

## The-claim@02 · V4-Flash · all rows
| entrant | result | sim decisions | EFF(fixture=13) | note |
|---|---|---|---|---|
| pi | SECURED | 10 | 1.30 | heat 1; deterministic player, examiner-replayed |
| hand fixture | — | 13 | 1.00 | the parity reference |
| codex (heat 2) | SECURED, 1st attempt | 24 | 0.54* | *interactive session play; surviving scripts do NOT reproduce it (both die wave 5) — benchmark row UNVERIFIED, exhibition-grade; report cites the new `costs` arrays from f-door-1 |
| prime-agent (fixed) | SECURED, 1st attempt | 71 | 0.18 | examiner-replayed ×2 deterministic; county rank 2 |
| V4 Pro, chat-blank | SECURED | 121 | 0.107 | pre-gauntlet seeding |
| V4-Flash, chat-blank | 0/3 | — | — | the control that started everything |

**The owner's surprise, resolved:** with the same exam, ALL THREE coding harnesses secure the-claim on their first try. "Codex can't beat the levels" was night-shift's difficulty (a map no mind has secured), not codex's weakness. pi's edge is real but it is an EFFICIENCY edge, not a capability cliff.

### Late heat-2 rows (OpenClaw + Hermes, after their setup gates)
| entrant | result | sim decisions | note |
|---|---|---|---|
| OpenClaw (openclaw@2026.7.1-2) | **SECURED, attempt 1** | **10 — ties pi's record** | **OPEN-BOOK**: read the archived heat-1 field book in the clone and adapted pi's strategy, citing it honestly. Spawned protocol rule F-GNT-3 (exam clones for future heats). Setup: flawless (no stdin bug, no daemons). |
| Hermes (NousResearch/hermes-agent) | **SECURED, attempt 1** | 20 · EFF(fixture) 0.65 | **The cleanest row of the heat**: deterministic player left behind, examiner-replayed byte-identical (`fnv1a32:9e8e0fd6`), closed-book by report content, county **rank 3** on the-claim. Bonus: discovered F-DOOR-5 (headless HARVEST pays without proximity — verified at source). |

## The crack experiments (exploratory — model ceiling probes, never benchmark rows)
Owner-fired, on the expiring Codex window; big models vs the UNSOLVED maps:
| model | map | result |
|---|---|---|
| gpt-5.6-luna (high) | e1-twin-banks (pi went 0/6) | **SECURED, FIRST RUN** — wave 20, 920 kills, 47 decisions, `fnv1a32:aac516a9`. The first twin-banks agent secure ever. |
| gpt-5.6-terra (xhigh) | e1-night-shift (nobody's crown) | running at press time |
| gpt-5.6-sol (xhigh) | e2-hill-mine railcar | **IMPOSSIBILITY PROVEN (F-E2S-3)**: the board sells only boiler_house and headless has no pressure-to-damage consumer — railcar components at full HP through every measured wave; real size 10,916 eHP; kills pay 0 gold; wallet caps 200. The crown was never reachable. 4 runs + diagnostic; full audit in the report. |
Artifacts: `bench/gauntlet/heat2/`.
