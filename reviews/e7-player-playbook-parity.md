# Review: e7-player-playbook-parity — the human's playbook hand reaches the same latch (lane-b, codex runner, attended drain 2026-09-05)

**Slice/branch/tip:** `e7-player-playbook-parity` · `lane/b` · runner commit `15dc51b89` over base `57045ef65` · merge `1b1effae7` (no-ff; four hand-resolved union hunks).
**Verdict:** MERGED. F-E7PB-1 (L7 gap) closed: the browser player's playbook loop and the machine's `PLAYBOOK_USE` verb reach one latch.

## What it does
`src/systems/E7PlaybookLatch.ts` is the single four-rule secure decision (record on first use, repeat on a known name, consent rungs A4/A5, `BroadcastMirror.noteUse`) that `Game.ts` and `HeadlessContractSim.ts` both call; the browser binds the human's playbook hand to it. A human use is a semantic input: `RunTape.recordPlaybookUse` writes `inputLog.playbookUses[]` (`{kind:'playbook_use', atTick, playbook}`), validated on load (`validatePlaybookUses`: contract/seed/difficulty must match the tape), and the replay driver re-fires each use at its tick (`notePlayerPlaybookUse`), so a human Signal-map tape replays to the same hash on the county's iron. The runner's evidence: build/stats green, E7 guard 6/6, browser parity 8/8 desktop + 390px, the four E7 hashes unchanged.

## Evidence (merged tree `1b1effae7` + era pin `1ecca477`)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` / `npm run build` | rc 0 / rc 0 |
| `scripts/e7-playbook-rows.test.mjs` | 6/6 |
| `e2e/e7-playbook-rows.spec.ts` + `reel-deep-links` + `e4-vehicles-fuel` (drain port 5273, workers=1) | 14/14 desktop + 390px |
| E4 plain-boot motor-tape specs (the other side of the union) | see the drain commit message |
| `scripts/engine-era-guard.test.mjs` after the pin | 5/5 |
| `run-guards.mjs --changed-since 57045ef65` | see the drain commit message |

## Merge classification (base `57045ef65`)
| File | Class | Resolution |
|---|---|---|
| `src/systems/E7PlaybookLatch.ts` | NEW | clean |
| `src/sim/HeadlessContractSim.ts`, `e2e/e7-playbook-rows.spec.ts`, `scripts/e7-playbook-rows.test.mjs` | MAIN-MOVED / LANE-TOUCHED | git auto-merged (disjoint hunks) |
| `src/game/Game.ts` | MAIN-MOVED (E4 motor-tape actions, `5823eaad6`; E5 split `97e9c47f9`) | UNION at every anchor: `motorActionIndex` + `playedPlaybookUses` fields and zero-inits; the replay driver runs the motor-action loop then the playbook-use loop off one `tick` |
| `src/game/RunTape.ts` | MAIN-MOVED (E4 `motorActions` tape stream, `5823eaad6`) | UNION: both types, both fields, both recorders, both validators; the load guard carries `motorActions === null || !playbookUses`; `inputLog` spreads the conditional `motorActions` and always `playbookUses` |
| `tasks/BACKLOG.md` | MAIN-MOVED | union (lane row + main rows) |

## Findings
- **F-E7PP-1 (non-blocking, evidence):** the union puts two independent tape streams (`motorActions`, `playbookUses`) side by side in `RunTape`; each validates alone and tsc + the E4 and E7 specs pass together, but no single tape carries BOTH streams yet — heat 12 human rides on E4 and E7 maps will produce the first such tapes; nothing blocks.
- **F-E7PP-2 (non-blocking):** the runner's `codex review --uncommitted` was again blocked by the outdated CLI (0.149.1); this attended review stands in. A fresh CLI (0.153.4) now lives at `~/.codex-astra/node_modules/.bin/codex` for reviews; the factory's own binary is untouched.
