# s2519 — Restore lane-b's offsite evidence backup

F-2518-3 is resolved by a parentless save ref, `save/prefetch-bounded-warming-s2519`. GitHub had rejected lane-b's 195,659,243-byte trace. The save preserves all 74 changed files (452,919,838 bytes) from `b7ba55fb01808f2e11360255c715201d8d2e757c` relative to `49402d6bfabde67ad7cf898d3ec34a012b5f0ed7`. Four traces use ordered parts no larger than 40 MiB; the other files retain their paths. The manifest records every original path, mode, Git blob ID, SHA-256 and byte count.

The save ref is an evidence backup, not a merge candidate. Lane-b's original history and working tree are unchanged. Its later drain must still review and gate the code, then omit the oversized original trace from the main commit while citing this reconstructible backup. No gameplay change was merged or published in this fire.

## Verification

Origin holds `e406a8d5c3a097f32ee040ba17fca1f0898bc8d8`, and the delta base is reachable from origin/main. A fresh bare repository fetched that save ref and verified all 74 files / 452,919,838 bytes against all three checks; four files were reconstructed from parts. The independent restore took 66.1 seconds. See [remote restore](lane-b-remote-restore.json), [manifest](lane-b-backup-manifest.json), [snapshot assertions](lane-b-backup.json) and [push result](lane-b-push.txt).

The successful snapshot asserted identical main and lane status before and after creating the objects, and an unchanged lane tip. The first attempt stopped before updating any ref because concurrent audit writes changed main's status listing; the retry began after those writes ended. A scan of 82 source text/trace members found no matches for the high-confidence token patterns checked; this is a limited scan, not a general secrets guarantee.

## Board and standing duties

Main's `deploy-budget-production-probe` is still owned by the live runner. Its final reviewed A/B run reports one desktop pass and one mobile failure: saveData transfers 236,338 bytes more than normal, with both below 25 MB. This is runner evidence, not an independently reproduced verdict by this fire; it remains for the drain to judge against the master. Four completed lanes wait: manifest on a, prefetch on b, Lantern on c, atlas on d. No lane was reset, refilled, or merged. The board is not dry: the done probe classified four real drains, zero unknowns. The authoring probe reports 12 planned leaves, all priced, with no unpriced authoring work.

The art audit read six areas and 1,024 files: AT RISK 0, LOCAL-ONLY 0. Ledger mirrors cover all 13 days from August 24 through September 5; 13/13 readable, 124 inspected fields, zero account-class rows. Six unrecognised fields are the already-recorded anonymous refusal identifiers/profile labels. Today's mirror and yesterday's ticker exist; week 37's rotation is already minted. The gazette sweep has zero candidates (18 standalone and 14 batched headlines this week). No player-visible news was added.

The working-tree sweep visited 104 registered trees: 100 answered through git, four required the shared-object fallback. It hashed exactly 23,502 subjects and found 23,459 already reachable from origin, 43 AT RISK and zero LOCAL-ONLY. All 43 belong to main: 35 live corrective artifacts (left with the runner) and eight files produced by this fire (included in this handoff). No external working tree needed salvage. These are snapshot counts, not a claim that live output stopped changing. The main corrective already has a 177,232,908-byte failed-run trace; its eventual drain must check the final evidence for the hosting limit before adding it. See [retention results](retention.json).

The inherited desk has 53 items: CLOSED 0, OPEN 2, OPEN-DESK-ONLY 51, BOTH 0, UNRECORDED 0. It is carried verbatim. The s2518 handoff was archived verbatim once in the lock commit `26a11e948`.

`npm run test:ledger-guards` passed on node v26.4.0: 1,050/1,050 Node tests, zero skipped/cancelled, all chained checks and 83 foundry checks; 252.6 seconds. Desk declaration, birth and carryforward evaluated the actual cleared-lock handoff (53 segments, zero dropped) rather than skipping an active lock. See [full gate log](ledger-guards.log) and [result](ledger-guards-result.json). No runtime acceptance is claimed.

## Next fire

Drain the main corrective once its run finishes and its gates pass, then the waiting lanes in priority order. Do not refill an occupied lane. The original lane-b branch remains locally intact; its complete delta is now recoverable from the separate save ref. No owner decision was added.
