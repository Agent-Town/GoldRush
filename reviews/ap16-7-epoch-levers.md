# AP-16-7 — epoch levers reach the agent door

**Task:** `tasks/lane-b-ap16-7-epoch-levers.md`
**Original candidate:** `e36b8a2d37a55fb5dfa2f4c1a715e128bcf98443` from base `d599cd3ea030a1e6d699f106115b1d3fdf54d775`
**Merge:** `031872e15fa06407be4c2170c458804a8dff2efb`

## Verdict

**MERGED.** `CAPTURE`, `BOAT_BUILD`, and `REANCHOR` now cross the standing-order boundary with validation, deterministic handlers, identity keys, and socket diagnostics. The E5/E6 admission-parity measurement remains intentionally separate in AP-16-8 under the owner's F-1698-1 ruling (b).

## Merge classification

The preserved candidate touched nine paths. Eight were re-landed exactly from `save/ap16-7-s1698-e36b8a2d`: the three tests, public door grammar, standing-order implementation, and three sim/socket implementations. Main had independently replaced `docs/bench/same-game-audit.md` after the candidate base; that generated report was omitted because the corrected contract moves its parity acceptance to AP-16-8. No undecided content entered main's working tree: gates ran in detached worktree `/tmp/gr-gate-s1703-ap16-7.U0PWA0/tree`, then the eight-path re-land merged in one act.

## Gate evidence

| Gate | Result |
|---|---:|
| `node scripts/drain-block-check.mjs --strict tasks/done/20260812-092833-lane-b-ap16-7-epoch-levers.md` | `CLEAR`, live leaf `queued` |
| `npx tsc --noEmit` | rc 0, 4.9 s |
| `npm run build` | rc 0, 17.2 s |
| `npm run test:node-guards`, pinned Node 26.4.0, alone | **458 tests / 453 pass / 0 fail / 5 skip**, rc 0, 536.8 s |
| AP-16-7 + E5/E6 census + water/death/build-menu + desktop/390px boot, `--workers=1` | **52/52**, rc 0, 259.1 s |
| plain boot screenshots | **2/2 inspected**, zero page/console errors |

The first full guard attempt used inherited Node 23.11.1 and hit only the battery's explicit file-timeout diagnostic. The same full command was rerun alone with the repo-pinned Node 26.4.0 and passed; the Node 23 result is an environment exception, not slice evidence.

Full transcript: `artifacts/ap16-7-gate-s1703.txt`.
Boot evidence: `reviews/shots-ap16-7/desktop-plain-boot.png`, `reviews/shots-ap16-7/mobile-plain-boot.png`.

## Findings and disposition

- F-1698-1 is executed as ruled: AP-16-7 ships the three levers and diagnostics without changing contract admission; AP-16-8 owns the fresh parity measurement.
- No new blocking finding was reproduced.
- Next slice: price and run `ap16-8-admission-reprobe` against this merge before the next gauntlet.

## Player surface

This changes the public agent-command boundary and headless contract behaviour, not rendered UI. GZ-01 is therefore filed as an agent-play change; the retained plain boots verify the surrounding desktop and 390px presentation stayed healthy.
