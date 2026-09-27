# The Dead Band — HELD, both projects

| Project | Death wave | Sim seconds | HP | Gold | Repairs | Standing |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| desktop-chrome | 18 | 550.000 | 0 | 0 | 0 | 8/8 |
| mobile-chrome | 18 | 547.467 | 0 | 0 | 0 | 8/8 |

The suppression consumer is active in both terminal snapshots: `dronesSuppressed=true`, `relayChainsSuppressed=true`, nodes/links empty. The own secure latch is `objective=refusal`, `objectiveMet=false`, `uses=0`. This is intended contract behavior, not an unintended refusal. The default native driver never clicks the Tape Reel Record control, so it cannot discharge that latch (`src/systems/E7PlaybookLatch.ts`, refusal branch; `Game.ts`, `playbookObjectiveAllowsSecure`). Active suppression alone does not prove the player's refusal interaction.

The Prospector also dies before wave 20 with every work intact. No restore-ground ride: the objective is unexercised, so this is not survival alone on a working objective route. No F-PP9 map-defect ID. Follow-up owner QA/native objective driver: attempt ordinary Record, assert the county refusal/latch, then assess hero survival. No balance change follows from these two deaths.

Both rides have zero console/page errors. Paired command exits 1 at unchanged secure assertion; no secure/bank/Book/reload. Phone terminal directly inspected: wave 18, eight builds/no losses/no repairs, zero HP.

Reproduce: `python3 artifacts/sol/play-proofs/run-13/run-map.py e7-dead-band`. One default ride/project, desktop then 390×844 phone, one worker, real Book entry, no debug/seed pin, timescale 4. `default/` retains compact rows, pre-bank objective snapshots, terminal JPEGs, exact argv/env, direct exit and trimmed failure log. Raw paths are in each row. Shared driver unchanged.
