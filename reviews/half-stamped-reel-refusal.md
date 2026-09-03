# half-stamped-reel-refusal — drain review (s2476)

**Slice:** `half-stamped-reel-refusal` (F-2471-1)
**Branch:** `lane/c` · **lane tip:** `12f8dd851698bd35c2f156938cb2bf1cc68ef701`
**Gated as:** `40a724b13` (detached worktree `gate-s2476`, trial merge of `21d12e1d5` + `12f8dd851`)
**Merged to main:** `01506cbde0fe2a384a96c73b46af34b783910785`
**Merged tree:** `66c4ce86bdd2937e8ac569eb8b7a639a8584c905` — **byte-identical to the gated tree**, so what shipped is the commit that was gated, not a fresh resolution.

## VERDICT: MERGED — the cure is proven by a control run, not by a green

## What it does

The watch path used to choose its replay engine *first* and compute the era refusal *second*, and
only on one of the two branches. `startTrueRunTapeReplay` asked `engineEraIncludes`; the legacy tape
show never asked at all. So a tape carrying **half** a stamp — `meta.era` without `meta.engineHash`,
or the reverse — and carrying no agent orders fell through to the legacy path and **played**, in
direct contradiction of the honesty law that says a reel the current era cannot vouch for is refused.

After this slice the era question is decided **before** the path is chosen. Any tape carrying *any*
era stamp (`meta.era` **or** `meta.engineHash`) is judged by the same `engineEraIncludes` rule the
true reel uses, and a half-stamped or foreign-era tape is refused wherever it would otherwise have
landed. Fully unstamped tapes keep the tape show, and the reason is stated in a comment at the site
("Fully unstamped tapes predate engine eras, so the legacy show remains their compatibility path").

The mechanism worth noting for future readers: `parseReel` deliberately **normalises** a half-stamped
public meta down to `{ buildId }`, because the public tape contract must not advertise half a stamp.
That normalisation is what erased the evidence the router needed. The slice keeps the public contract
exactly as it was and carries the validated stamp aside in a `WeakMap` (`readReplayEraMeta`), so the
router can see "this arrived half-stamped" without the wire format changing. The refusal copy still
reads `unstamped build <buildId>` for a half-stamp, which preserves the displayed wording.

## Evidence

All runs in the detached gate worktree `gate-s2476`, `--workers=1` (§3.1), run alone (F-2462-1).

| Gate | Tree | Result |
|---|---|---|
| `npx tsc --noEmit` | merged | **clean**, no output |
| `npm run build` | merged | **green**, built in 2.05s; asset-diet within ceilings (herald 1,158,214 B / 1,500,000 B) |
| 5 suites, `desktop-chrome` | merged | **15/15 passed** (3.4m) |
| 5 suites, `mobile-chrome` run 1 | merged | 14/15 — `agent-reels.spec.ts:145` red |
| `agent-reels.spec.ts:145` isolated | merged | **passed** (13.8s), ratio 1.0637x |
| **5 suites, `mobile-chrome` CONTROL** | **main, no merge** | 14/15 — **`agent-reels.spec.ts:301` RED**, `:145` **green** |
| 5 suites, `mobile-chrome` run 2 | merged | **15/15 passed** (3.5m) |
| `_s2080-f1742-1-boot-probe.spec.ts` | merged | **6/6 passed** both projects (26.0s), zero console/page errors, desktop + 390px |

Suites gated: `agent-reels.spec.ts`, `reel-deep-links.spec.ts`, `tape-02-lantern-show.spec.ts`,
`c7-standing-order-replay.spec.ts`, `true-reel-harness.spec.ts`.

Determinism corroboration, unchanged across every run and both projects:
`[eh2] claimed=fnv1a32:a45ba9ac node=fnv1a32:a45ba9ac browser=fnv1a32:a45ba9ac`.
Runner-reported engine hash: `a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04`.

**Screenshots:** `reviews/shots-half-stamped-reel-refusal/desktop-chrome-half-stamped-refusal.png`
(985,902 B), `reviews/shots-half-stamped-reel-refusal/mobile-chrome-half-stamped-refusal.png`
(1,540,021 B). These are the runner's own, which `lane-runner-v3` **withheld** from its commit as
"baseline ownership collision(s)" — they existed only untracked in `worktrees/lane-c` and would have
died with the disk (Mistake #11 / RETENTION LAW). Landed here path-scoped.

### The control run is the finding, and it points both ways

The mobile battery went red once, and the honest reading was not available from the merged tree alone.
`red-inventory-lookup e2e/agent-reels.spec.ts` reported `CLEAN-IN-INVENTORY` but flagged its own
snapshot **23 days stale** against a 7-day threshold, with 208 commits touching `e2e/` or `src/` since,
and said in as many words: *take a control run before concluding your merge caused it*. That is what
was done, and it repaid the ~4 minutes twice over:

1. **It named the cure.** On main without the merge, the red is `agent-reels.spec.ts:301` — *"plain
   town board WATCH gives a half-stamped reel its honest unstamped-era refusal"*, the exact test
   F-2471-1 records as pre-existing-red and this slice was written to fix. Merged, it is green on
   **both** projects. A green on the merged tree alone would only have shown the test passing; the
   differential shows it passing *because of this merge*.
2. **It exonerated the flake.** `agent-reels.spec.ts:145` (a p95 frame-budget ratio test) **passed on
   the control**. It cannot be this slice's doing: it failed once merged, passed in isolation at
   ratio 1.0637x, and passed on the merged re-run — 2 of 3 merged runs green, and green on main.
   Fingerprint matches **F-2320-1** (open on the desk): the mobile e2e gate reds ~1 run in 2 at a
   rotating test. Not a new red, and not a re-pin (F-1441-3) — nothing was adjusted to make it pass.

## Merge classification

Base `21d12e1d5` (main at lock time). Main did **not** move during the gate.

| File | Class | Resolution |
|---|---|---|
| `src/game/Game.ts` | LANE-TOUCHED | +9/-4, no conflict — main never moved this hunk |
| `src/ui/LanternShow.ts` | LANE-TOUCHED | +9/-2, no conflict — main never moved this hunk |

`git merge` reported *"Merge made by the 'ort' strategy"* with zero conflicts, and the merge diff
against `HEAD^1` is exactly the lane's own 2 files / +18 / -6 — i.e. nothing was pulled in or dropped.
`main..lane/c` is now empty. `lane-usable` read `HOLDS` before the merge (16 lane-only added lines
across the 2 files) and the content is now absorbed.

## Findings

**F-2476-1 — the runner withheld its only screenshots, and a "withheld" line is not an error line.**
Non-blocking; **discharged in this drain.** `lane-runner-v3` printed
`withheld baseline-dirty path: reviews/shots-half-stamped-reel-refusal/*.png` and
`withheld 2 baseline ownership collision(s)` at the very tail of its run log, *after* its own
`READY-FOR-GATES` block. The withhold is correct behaviour — the runner must not commit evidence whose
baseline another task owns — but the consequence is that a slice which reports evidence in its own
report has, on disk, **no evidence in any commit**: the two PNGs lived only in the untracked lane
worktree. Nothing was lost here because the drain went looking. What earns it a finding is the
direction: a drain that trusts the runner's `Evidence:` line and never opens the lane worktree files a
review citing screenshots that are one `git clean -fd` from gone. **Read the run-log tail past the
report block; a withheld path is an owed `git add`, not a diagnostic.**

**F-2476-2 — `test:node-guards` was NOT run, deliberately, and this states why so the next reader need
not re-derive it.** Non-blocking. §3's cross-cutting rule keys that battery on a diff touching
`src/sim/`, `src/systems/` or `src/entities/`. This diff touches `src/game/Game.ts` and
`src/ui/LanternShow.ts` — neither directory, and the change is watch-path *routing* plus a UI
accessor, moving no behaviour the sim replays. The rule is keyed on paths precisely so this is not a
judgement call, so it was followed as written rather than widened on a hunch. Corroborating evidence
that sim behaviour did not move: `true-reel-harness` replays the assayer fixture to
`claimed == node == browser == fnv1a32:a45ba9ac`, unchanged on both projects and on the control.

## Ledger

Goal leaf `half-stamped-reel-refusal` → `status="merged"`, `mergeHash=01506cbde0fe2a384a96c73b46af34b783910785`.
Done-move renamed `drained-s2476-…`. BACKLOG row F-2471-1 closed. GZ-01 item filed.
