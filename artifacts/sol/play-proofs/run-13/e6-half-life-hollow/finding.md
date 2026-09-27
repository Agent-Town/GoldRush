# Half-Life Hollow — HELD, both projects

The authored crossing completes in all four rides (central-causeway route). Every ride then dies at wave 4 before the required wave 20, with two defenses still standing. Default desktop/phone radiation damage is 36/37; restore-ground is 37/39. Gathering excursions cross the glow bridges after objective completion. This is a measured route/survival limit, not evidence of an impossible map. No F-PP9 defect ID. Follow-up owner: QA/native movement strategy; prefer the safe central route for later resource trips before any balance proposal.

| Strategy | Project | Wave | Sim s | HP | Gold | Repairs | Standing |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| default | desktop-chrome | 4 | 129.333 | 0 | 25 | 0 | 2/2 |
| default | mobile-chrome | 4 | 131.867 | 0 | 25 | 0 | 2/2 |
| restore-ground | desktop-chrome | 4 | 127.867 | 0 | 25 | 0 | 2/2 |
| restore-ground | mobile-chrome | 4 | 133.733 | 0 | 30 | 0 | 2/2 |

Both paired commands exit 1 at the unchanged secure assertion. Zero console/page errors in all four rides. No secure, completed bank, Book return or reload is claimed. Each strategy's compact row links its external complete row; objective JSON freezes terminal state before any bank/reset. Final terminal images are under `restore-ground/`; first-attempt images remain external. Phone terminal image inspected directly: wave 4, 30 gold, two builds and zero repairs.

Reproduce the measured commands: `python3 artifacts/sol/play-proofs/run-13/run-map.py e6-half-life-hollow` then `... e6-half-life-hollow restore-ground`. Each uses desktop then 390×844 phone, one worker, public plain seed, real Book launch and timescale 4. Exact argv/env and direct exit codes are in each strategy directory. Two rides/project exhausted; no more rides authorized for this map. Shared driver unchanged.
