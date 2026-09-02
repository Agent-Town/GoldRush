# gauntlet-heat10-r2 — the level field, recovered from an orphan

**Slice:** `gauntlet-heat10-r2` · **branch:** `save/gauntlet-heat10-r2-s2444-orphan-7f34071c0` (minted this fire; the work was on NO ref when found) · **tip:** `7f34071c0` · **merge:** `d8499c652` · **drained:** s2444, 2026-09-02

## VERDICT: MERGED — and it was recovered, not merely drained.

The runner's own output was correct, complete and READY-FOR-GATES. What nearly cost us this slice
happened *after* it committed, and had nothing to do with its quality.

## What it does

The owner's authorized heat-10 re-ride — *"heat 10 lets go. Lets level the playing field."* Heat 9
measured how fast a stateless model could answer one view at a time; heat 10 moves that latency
outside the simulation, so each rig pays one authoring call and its controller then runs a full ride
at simulator speed. The slice banks the complete four-map matrices for both rigs (PI `0.73.1`,
Prime Agent `prime-agent 0.8.0`), every authored controller verbatim, every iteration transcript,
and the one secured submission with its papers.

The headline finding is that **controller parity removed the per-order latency tax but did not make
the riders equal strategists.** Prime Agent re-earned The Claim at verified rank 6 and pushed its
Baron line to wave 18 (712 kills, 114 calls, 476.6 simulated seconds in ~19 wall-clock seconds — where
heat 9 exhausted a 20-minute wall at 71–78 per-turn orders). Five non-Claim bests improved across the
pair. Neither rider felled the Baron.

It also exposed a *new* failure class rather than hiding one: PI's Claim controller reached the secure
boundary and then sent `SECURE_CHOICE` alongside other orders, violating the door's single-order
secure-window rule — forever. That ride was interrupted as hung and its 24.4 MB transcript retained
unrepaired. PI lost its prior Claim row to that bug.

## Evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **rc=0**, 4.9 s |
| `npm run build` (merged tree) | **rc=0**, 19.2 s; asset-diet green (84% terrain cut, 87% plate cut) |
| Run surface touched | **NONE** — 94/94 files under `artifacts/gauntlet-heat10-r2-20260902/` |
| Merge classification | **0 overlap**, **0 of 94 already present on main** — purely additive |
| Arena law (§2H) | `npm ci --no-audit --no-fund` only; lockfile SHA-256 unchanged at `1a1fa48e…ee863` |
| Engine identity | `computeEngineHash` = `25040ad5…2ca2ca`, matching the Era-5 registry declaration and pin (`recorded: true`) |
| Submission | rank 5 early probe assayed `verified` `fnv1a32:8886f412`; Prime's Claim tape `fnv1a32:fcf5753a`, WATCH papers build `c13b4c24d` / Era 5 — exact |
| Secrets | none in evidence (runner self-check; spot-confirmed on the note) |

Adjacent suites were **not** run and are **not owed**: the slice adds no source, no spec, no e2e, no
config. There is no code path a battery could reach. `tsc` + `build` are here as tree-soundness
confirms, not as slice gates.

## Merge classification

Base `f2d8665e1` (`gauntlet-heat10-level-field`). Main had moved **65 paths** since that base; the lane
touched **94**; the intersection is **empty**. Every lane path was absent from `main`, so there was no
three-way resolution to perform and no MAIN-MOVED file to preserve. Merged `--no-ff`, committed as one
act per F-1589-5 (never leave a merge staged on main).

## Findings

### F-2444-1 — A RESET MASSACRE (Mistake #2) TOOK THIS SLICE 12 MINUTES AFTER IT COMMITTED, AND EVERY BOARD PROBE READ HEALTHY AFTERWARDS. **BLOCKING — recovered, cause open.**

The lane/b reflog is unambiguous:

```
fe2d0c30d lane/b@{2026-09-02 08:21:23}: commit: runner(lane-b): reel-deep-links.md
b3ea80198 lane/b@{2026-09-02 07:52:14}: branch: Reset to main      <-- the massacre
7f34071c0 lane/b@{2026-09-02 07:40:35}: commit: runner(lane-b): gauntlet-heat10-r2.md
```

`7f34071c0` committed at 07:40:35. At 07:52:14 — **11 minutes 39 seconds later** — lane/b was reset to
main by the refill pre-flight that dispatched `reel-deep-links`, destroying its reachability. When s2444
looked, `git for-each-ref --contains 7f34071c0` returned **nothing**: it was a reflog orphan, exactly the
shape LANE-SAFETY LAW names as how w1-03 and polish-02 were lost and w1-04 survived only by luck.

**This is the failure the law was written to prevent, and the law's own instruments were all green.**
`lane-usable lane-b` reads `ahead=1 … HOLDS` — *correct*, and about `reel-deep-links`. `dry-board-probe`
reads 3 real drains — *correct*, because the **done-move** for `gauntlet-heat10-r2` survived in
`tasks/done/` and `drain-block-check` cleared it. Nothing anywhere reported that the commit those two
instruments were implicitly talking about had ceased to exist. **A done-move is a claim; a commit is the
fact — and here the claim outlived the fact by 40 minutes.**

Severity stated honestly and deliberately not inflated: **realised loss is ZERO.** The object was still
in the reflog, recovery cost one `git branch`, and the content merged clean. But the direction is the
worst available — 34,137 lines of owner-authorized evidence, unreproducible without re-riding both rigs,
sitting on no ref while `git gc` was free to collect it at any moment.

**Recovered:** `save/gauntlet-heat10-r2-s2444-orphan-7f34071c0` was minted **before** any other act of
this fire, then merged. The save ref is retained per the RETENTION LAW and the salvage lifecycle; a
following fire should rename it `archive/…` now that its re-land has merged.

**What is NOT yet answered, and is the corrective:** *why did the pre-flight reset a lane that was
1 commit ahead of main?* LANE-SAFETY LAW forbids exactly this, and `lane-usable` exists to enforce it.
Either the refilling actor did not ask, or it asked and the answer was overridden. That is a question
about the dispatch path, not about this slice, so it does not block this merge — but it is live, it is
armed right now for every lane, and it is filed as **F-2444-2** for a corrective.

### F-2444-2 — THE HANDOFF'S OWN LANE MAP WAS ALREADY STALE, AND FOLLOWING IT WOULD HAVE HIDDEN THE LOSS. **NON-BLOCKING, filed for the next fire.**

s2443's handoff named the pile as *"`gauntlet-heat10-r2` on lane/b (`7f34071c0`)"*. By the time s2444
read it, lane/b's tip was `fe2d0c30d` and `7f34071c0` was on no ref at all. **A fire that had trusted
the branch name and run `git log main..lane/b` would have found one commit, drained `reel-deep-links`,
and reported the pile as handled — with the heat-10 evidence silently gone.**

The stale line was not carelessness: s2443 wrote it correctly and flagged its own perishability
(*"re-run `dry-board-probe` yourself rather than trusting this count"*), and the runner moved the lane
afterwards. This is F-2373-1's lesson on a new axis — that finding covers a *count* going stale across a
fire's own work; here a **branch→content binding** went stale across the *next* fire's work. The
reusable half: **a handoff may name a commit or a branch, and only the commit is durable. When you
inherit `<name> on <branch> (<hash>)`, verify the hash is still reachable from the branch before you
believe either half** — it is one `merge-base --is-ancestor`, and it is the only probe on this board
that could have caught this.

## Ledger

- `tasks/goals.json` leaf `gauntlet-heat10-r2` → `status: "merged"`, `mergeHash: d8499c652…` (following commit; a commit cannot contain its own hash — F-1384-1).
- `tasks/BACKLOG.md` — completion row + F-2444-1/F-2444-2.
- Done-move renamed `drained-s2444-…`.
- GZ-01: filed — an era-5 verified rank-6 Claim row is player-visible county news.
