# launch-video-capture-2: implementer report
**Branch** `feat/launch-video-capture-2`, `/Users/robin/Claude/Projects/wt-lvc2`, cut from main at `a50ec8281`. Opus 5.5, max effort, 2026-09-26. (Committed by the attended session from the implementer's final message, verbatim in substance: a hook refused the implementer's own write of this file twice. The full as-shot tables live in `docs/marketing/launch-video/treatment.md`, section "Phase 2: capture list, as shot".)

**Verdict READY-FOR-GATES.** All ten capture-list items are filmed, with the owner's three answers applied (no Baron defeat: the cut is at his arrival; printed text slips only; county boards unnamed on camera).

## Checks
- **Capture list vs disk:** `scripts/launch-video/verify-capture-list.mjs` GREEN. The treatment lists 168 kept files (23 clips, 4455.7 s of footage) and 22 cut files, both matching the disk; every clip's duration agrees within 0.5 s.
- **Build:** `npm run build` (tsc, vite build, asset-diet) exits 0 in 26.7 s. Engine hash unchanged at `7bfbed8b…246551`. Nothing changed under `src`, `assets`, `site`, `e2e`, `functions` or `package.json`.
- **Batches:** 10 (3 probes, 1 rehearsal, 6 capture batches), every one inside the drain lock on port 5322; each vite server stopped by its own PID.
- **Network and errors:** no request to the live county reached the network in any take; no console or page errors, except the two Field Book takes, which each log one blocked-request line per county request the capture aborted.
- **Contact sheet:** `artifacts/launch-video-capture-2/contact-sheet.jpg`, 570,877 bytes.

## Kept (all in `~/.goldrush/launch-video/`; "real" means real play at 1x on the plain seed, capture profile "Wren")
| Item | Take(s) | Length | Status |
| --- | --- | --- | --- |
| Menu (B3) | 1280x800 t1, 390x844 t1 | 20.3 s, 20.2 s | real |
| Claim (B2, B4, B5, B9) | desktop t1, t2 | 311.9 s, 312.5 s | real, Prospector sent in both |
| Claim, vertical | t1, t2, t3 | 312.4 s, 312.0 s, 312.5 s | real, Prospector sent only in t3 |
| Night Shift (B1, B6, B7) | desktop t1, t2; vertical t1 | 374.6 s, 382.2 s, 372.1 s | real, lantern relit on camera in all three |
| Dry Gulch, Twin Banks entry walks (B6) | both sizes | 28.6 to 29.3 s | real |
| Baron (B6, B8) | `B6-B8-e1-baron-1280x800-t3` | 539.6 s | STAGED unlock |
| Baron alternates | t1, t2 | 467.8 s, 507.3 s | STAGED |
| Herald No. 5 (B8) | t1 | 15.8 s | STAGED |
| Lantern Show, Field Book front desk, Ride Together card (B10) | t1 each | 43.5 s, 8.4 s, 8.9 s | real |
| Field Book board (names hidden), Ride Together invitation | t1 each | 8.9 s, 9.0 s | STAGED |
Plus 145 stills.

- **Baron t3:** all three taunts (waves 5, 12, 18); the arrival marked as the cut point at 524.5 s (the boss spawns at wave 20); his banner at about 529.5 s; his standard and men cross the ford from about 533 s; Wren alive at the end of the 15 s handle (6 hp). Frame gap p95 17.3 ms.
- **Baron t1 and t2:** t1 fell at wave 17, t2 at wave 19 (t2 also has all three taunts). t3 used the build order from the rider tape that reached wave 20 (`artifacts/gauntlet-heat5-20260824/e1-baron/attempt-3-tape.json`).
- **Night Shift:** all three takes end when Wren falls at wave 12, after the runbook's 2:30 to 5:30 window.
- **Baron unlock:** a copy of Wren's ledger with one secured Twin Banks score added; her saved ledger untouched.

## Cut
The rehearsal (the menu 20.75 s, the Claim 312.2 s, the Lantern Show 43.7 s, plus 19 stills) is in `cut/` with reasons in `cut/reasons.json`.

## Adapted from the runbook
- Every map was launched from the town board, because a bare `?contract=` link boots the Claim (F-LVC2-4).
- One Wren ledger was carried between sessions.
- The Prospector order is G, G, then a click, because the open charter swallows a click behind it (F-LVC2-5).
- On the vertical, the pilot stands 5 m south of the seam before ordering.
- Baron t3 used the build order from the rider tape that reached wave 20.

## Remaining gaps
Still plates or edit work: no pan close-up, no low-angle vista, no lantern procession. The fonts are not in the repo. The Pan Theme runs 59.98 s against a 94 s film. FREED floats over only the first four walkers. The dev server's "Open every claim" button shows in board frames (F-LVC2-6). The Lantern Show's control bar prints the page's local address (F-LVC2-7). The vertical needs a 1.38x upscale to 1080x1920. No frame clearly shows the Baron himself before t3 ends.

## Phase 3 needs from the owner
- **F-LVC2-1, STAGED frames in a public cut:** recommend yes for the Baron and the Herald, disclosed; no for the fixture board; the invitation only if disclosed.
- **F-LVC2-2, a capture script played the takes:** recommend counting them as real footage, disclosed in the edit notes.
- **F-LVC2-3, the end card's second line:** recommend keeping it.

## Process notes
- Before the implementer's context was compacted it ran `pgrep -lf` once, read-only; the rules forbid the pattern form and it reported the breach itself.
- Only its own PIDs were stopped, by number (probe captures 28745 and 39707, the queued lock waiter 2375).
- Probe and rehearsal output was moved from the scratchpad into the output folder; nothing was deleted.
- Batch 5 ran while other work pushed the 5-minute load to about 62; its Baron t2 take received 93.7 frames a second, the lowest of any take.

## Commits
`056d6180a` `85a6661bd` `08b0f0e91` `6e713d898` `170df4f4b` `1eed29b5c` `593b8d76e` `4f441e34b` `9b29b110c` `d710a0559` `136b1c38e` `d1b080d73` `ab0e3cb6b` (13, tip `ab0e3cb6b`).
