# Glow Mesa — PARTIAL both: authored ending works, full bank journey unproved

| Project / strategy | Outcome | Wave | Sim seconds | HP | Purse | Repairs | Standing / total |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| desktop / default | hero death | 6 | 183.600 | 0 | 1 | 0 | 3/3 |
| phone / default | hero death | 6 | 187.467 | 0 | 37 | 0 | 3/3 |
| desktop / restore-ground | Homemaker powered down, Claim Secured | 8 | ~263.1 | 51 displayed | 10 displayed | 0 | not retained; 4 confirmed builds |
| phone / restore-ground | Homemaker powered down, Claim Secured | 9 | ~288.7 | 9 displayed | not retained / HUD occluded | 1 | not retained; 5 confirmed builds |

All four rides have zero console/page errors. Both paired commands exit 1: default fails secure; restoration passes secure and fails the bank assertion. Exactly two rides per project; the allowance is exhausted. Restoration followed working gathering/construction and a hero-survival failure before the boss, not a map refusal. Its two completions do not establish a general causal benefit or authorize changing the default strategy.

## Instrument limitation, not a map defect

Both pre-bank objective captures show Homemaker act 3, `poweredDown=true`, `chairPlaced=true`, `kept=true`, and DONE. Original secure images confirm the authored ending. The phone panel labels the contract moment “DEFEATED, wave 8” while its waves-held counter is 9; we report the actual observed secure counter, not an inferred kill timestamp.

The shared driver's bank predicate demands a fresh secured score with `waves >= secureWave` (12), even after an authored early boss terminal. It clicks the real bank button, rejects the early ending against that wave-12 filter, and skips Book/reload. The printed fresh-row excerpt contains only two other contracts, so it is not proof of the exact new Glow Mesa score. **Stored score, Book return and byte-identical reload remain unverified.** No bank/Book images are fabricated and no failed command is relabeled green.

Its `finally` then replaces `finalSnapshot` because `banks.ok` is false, after the bank action has reset the scene. Consequently restore rows' `simAtEnd=0`, HP=100, purse=0, repairs=0 and empty defenses are POST-BANK values, not terminal measurements. Raw rows are preserved. [Terminal audit](terminal-audit.json) records only recoverable pre-bank measurements; aggregate measurements use null for the invalid reset fields. Phone ledger buildings raised = 9; driver confirmed placements = 5; these are distinct counters, not a claimed standing count.

**Follow-up owner: QA/native-proof instrument.** Smallest corrective: a new-spec early-Homemaker acceptance path that observes the actual new score and completes Book/reload, and freezes the terminal counters before the bank action. The shared-driver allowance in this task is movement-only; no bank/assertion change was made. No third ride. **F-IDs: none**: the map demonstrably reaches its authored terminal; this finding is not a reproducible map fault or grounds for a balance change.

## Evidence

[Default desktop](default/row-desktop-chrome.json) · [Default phone](default/row-mobile-chrome.json) · [Restore desktop](restore-ground/row-desktop-chrome.json) · [Restore phone](restore-ground/row-mobile-chrome.json). [Desktop terminal](restore-ground/terminal-desktop-chrome.jpg) · [Phone terminal](restore-ground/terminal-mobile-chrome.jpg). Direct image inspection confirms both secure overlays and Homemaker defeated text. Pre-bank boss/repair snapshots are beside each row as `objective-<project>.json`.

One committed terminal image per project. First-attempt terminal images and full rows/logs are retained under `~/.goldrush/play-proofs/run-12/default/e6-glow-mesa/`; restoration raw evidence under `~/.goldrush/play-proofs/run-12/restore-ground/e6-glow-mesa/`. Commands: `python3 artifacts/sol/play-proofs/run-12/run-map.py e6-glow-mesa` then the same with `restore-ground`. Exact command JSON/direct exit files are in each strategy folder. Default and restore each run desktop then 390×844 phone, one worker, native keys/HUD, public plain seed, timescale 4.
