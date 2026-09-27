# The Showroom — HELD, both projects

The default movement approach stalls inside a furnished display house. The desktop row marks seams (-18,18) and (18,18) unreachable, then repeats unsuccessful funding calls with 10 gold. Its one turret was actually placed at (-37,-9), rather than the requested southern home site (0,-45). The terminal screenshot shows the house, Prospector, exhausted machines outside and WRANGLE prompts. The measured desktop terminal has 39 exhausted active machines and zero captures toward quota six.

`src/game/Game.ts` routes the normal confirm action to `wrangle.tryCapture` outside build mode. `e2e/native-proofs/driver.ts` uses confirm to place buildings but never invokes the capture action during funding waits. Its generic direct-line movement marks the two active seams unreachable, then waits for gold with no remaining reachable seam. These are missing house-aware movement and capture behavior in this driver, not proof of a broken map objective. Prior native Showroom routes in the status record are historical, not reused as this run's acceptance.

No restoration retry is warranted: this attempt is alive beyond the required wave with the capture objective untouched. A later QA/native-driver corrective should leave the house via its doorway, approach exhausted machines and confirm captures outside build mode, then prove the six-capture counter and full bank/Book/reload. No production or balance fix is justified by this hold.

## Final measurements

| Project | Wave | Sim seconds | HP | Gold | Repairs | Standing | Captures | Exhausted machines |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| desktop-chrome | 79 | 2372.800 | 175 | 10 | 0 | 1/1 | 0/6 | 39 |
| mobile-chrome | 78 | 2367.067 | 175 | 10 | 0 | 1/1 | 0/6 | 38 |

Both hit the existing 600-wall-second play budget alive. One ride per project, no restore-ground attempt; paired command exits 1 on the unchanged secure assertion. Zero console/page errors. No secure, bank, Book or reload claimed. No F-PP9 map-defect ID; follow-up owner QA/native driver.

`python3 artifacts/sol/play-proofs/run-13/run-map.py e6-showroom` runs desktop then 390×844 phone with one worker, plain Book launch, public seed and timescale 4. Exact argv/env, direct exit, compact rows, frozen objective counters and terminal JPEGs are in `default/`. Full logs and samples are external via each row's rawEvidence path. Desktop terminal screenshot inspected directly. All shared-driver behavior remains unchanged.
