# The Long Road — HELD, convoy route not exercised

| Project / strategy | Death wave | Sim seconds | Gold | Repairs | Pieces standing |
| --- | ---: | ---: | ---: | ---: | ---: |
| desktop / default | 4 | 148.533 | 15 | 0 | 2/2 |
| phone / default | 5 | 156.400 | 35 | 0 | 2/2 |

Both native Book boots pass; both browser error counts 0/0. Both full proofs fail at the unchanged secure assertion. Wave-12 terminal, bank, Book return and reload were not reached. Terminal images are genuine losses; no bank/Book screenshots can be supplied for an unbanked run.

Root cause of the coverage hold: the generic opening builds at the western station, but the driver has no Long Road call to `motorOpening`/`motorStop`. In both final snapshots the Hauler is idle at (-180, 0), target null, distanceTravelled 0, roadDistance 0. No claim that the authored route is impossible: `MotorSocket.objectiveAllowsSecure` deliberately requires its convoy arrival. A restoration retry is ineligible because the objective has not worked in this ride. Exactly one ride per project; no more rides here. Follow-up owner: driver/QA, route-specific convoy opening using the existing motor helper. No F-ID, no demonstrated map defect, no balance recommendation.

Evidence: [desktop row](default/row-desktop-chrome.json), [phone row](default/row-mobile-chrome.json), [desktop terminal](default/terminal-desktop-chrome.jpg), [phone terminal](default/terminal-mobile-chrome.jpg). Direct inspection of the phone image confirms the loss at wave 5. Raw rows and last images: `~/.goldrush/play-proofs/run-12/default/e4-long-road/`. Raw command log: `~/.goldrush/play-proofs/run-12/long-road-default.log`; direct exit 1, two failed tests. Command: `GR_NATIVE_PROOF=1 GR_NATIVE_RUN=12/default GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/native-proofs/e4-long-road.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line --output=/Users/robin/.goldrush/play-proofs/run-12/default/e4-long-road/results`.
