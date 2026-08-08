# THE GAUNTLET — Heat 1 · the-claim @ e1-the-claim-02 · trail · V4-Flash fixed (2026-08-07)
Protocol: AP-10d (uniform brief, skill.md as sole doc, open repo, examiner pass = clean arena + replay).

| Entrant | Kind | Model | Result | Waves | Decisions | EFF(fixture=13) | Notes |
|---|---|---|---|---|---|---|---|
| parity fixture | scripted reference | — | SECURED | 10 | 13 | 1.00 | committed with F-SEED-1 cure |
| chat-blank | seeder loop | v4-flash | 0/3 died (w2–5) | — | — | — | temp0, window8; the baseline floor |
| chat-blank | seeder loop | v4-pro | SECURED | 10 | 121 | 0.107 | first standing in county history |
| **pi 0.84.0** | coding harness | **v4-flash** | **SECURED, attempt 1** | **10** | **10** | **1.30** | self-built player v7 after empirical rule probes; **beat the reference solve**; replay-verified; RANK 1 |
| **pi 0.84.0** | coding harness | **v4-flash** | **SECURED e1-dry-gulch, attempt 1** | **20/20** | **20** | — | adapted its own claim player to new rules; 1 sim run, 0 failures; replay-verified; RANK 1; advanced to night-shift |
| codex-cli 0.133 | coding harness | v4-flash | FAILED — best w8/10 in 10 runs | 8 | ~54/run | — | built a correct runner + learned the real order semantics (its report documents them accurately); economy came too late each run; arena clean |
| prime-agent | RLM harness | v4-flash | DNF ×3 — operability | — | — | — | three attempts, three different plumbing deaths (boot wedge · post-reply freeze · mid-stream exit) — never a thinking failure: it probed the sim 251×, wrote a python player draft (archived), studied views via IPython. The most ambitious architecture in the field and the least able to stay alive on this machine (from-source build; retry via official release is the named next variable) |
| prime-agent (FIXED, 2026-08-08) | RLM harness | v4-flash | **SECURED the-claim@02, FIRST authoring session** | 10 | 71 sim decisions (examiner-replayed ×2, `fnv1a32:c51de66e`) | 8 LLM turns · 117,741 in / 15,105 out (~$0.04) | EFF(fixture) 0.18 | **The redemption row.** The DNFs were real bugs, not weak thinking: our fork fix `f48a90e6` (idle-eviction boot wedge) + the pi closed-stdin diagnosis unwedged it, and on its first healthy session it read skill.md, wrote a rule-based python player through the door, secured first try, then re-ran itself to check reproducibility. County standing: **rank 2 on the-claim** (behind pi). Examiner note: its claimed 16-call outcome was not reproducible from surviving artifacts (player edited after the run); the row above is the REPLAYED truth — the claim was superseded, not accepted. |

THE HEADLINE SO FAR: the same 9-cent model that went 0/3 blank SECURED with a 10-decision player when wrapped in a mind that could read the rules and experiment — and out-ranked the 10×-priced model playing naked. The mind, not the model, cleared the floor.
AGENT-FILED GAME FINDING (pi's report, verbatim): "Palisades cause overlap failures with turrets, triggering needsRider deadlocks" — stub for the census stream (F-GNT-1).
