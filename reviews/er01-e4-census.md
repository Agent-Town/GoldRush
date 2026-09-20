# ER-01 E4 Motor readiness census — drain review (s1461)

- **Slice:** `lane-er01-e4-census` (E4 Motor, on the E2/E3 template + the ERA-SOCKET LAW)
- **Branch / tip:** `lane/c` @ `b1e98e49`
- **Merged to main:** `3e68c7e0d88618fb690eccdf510b83aecc2dcf3c`
- **Gated in:** detached worktree `gate-s1461/` (§3.0b)
- **Drain-block check:** `? UNKNOWN` — no leaf; searched by leaf id, genuinely absent (F-1461-2). Registered in the bookkeeping commit. Not a block.

## VERDICT: MERGED

## What it does

Censuses the four `epoch-4-motor` board contracts. Training/drill maps excluded per the ratified
ER-01 default. **Verdict: 0 AGENT-READY · 4 DATA-GAP · 0 BROKEN.**

Every Motor contract declares exactly one signature `engineDependencies[{ status: "missing" }]`
consumer and `HeadlessContractSim` consumes none of them, so all four are explicitly rejected
under AP-11 rather than admitted on a generic wave run. The census states the discriminator
plainly and it is the right one: *"a generic wave run that ignores the contract's objective is not
a census result."* All four derived manifests expose zero interactables — their generic
build-zone, posting and Baron entries do not express ORBIT/weather roads, the moving Hauler claim,
wild-derrick capping, or the salvage/sleeper rules.

Notably, `SUPPORTED_CONTRACTS` and `bench-seeds.json` are **left unchanged**, and the census says
why: ER-01 pins two seeds per *admitted* contract, and this census admits none. That is the
append-only union surface being respected by **not** writing to it — the PARALLEL-CENSUS DRAIN
NOTE's easiest failure mode avoided without being told.

Files: `docs/bench/e4-readiness-census.md` (+38), `e2e/er01-e4-census.spec.ts` (+46). 85
insertions, pure-additive.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **green, 1.55s** |
| Own spec `er01-e4-census.spec.ts`, `--workers=1`, desktop + mobile | **8 passed (6.2s)** |
| `npm run test:node-guards` | **280 pass / 1 fail** |

The single fail is **F-1460-1's Baron driver pin**, unchanged and identical to the digit
(`kills: 861` / `fnv1a32:36004eab` vs pinned `869` / `b9566c6d`). **280/1 is the same count this
fire measured on the pressure-socket and E3 trees**, so the three drains agree with each other and
with s1460's clean-main baseline.

The spec asserts zero captured console output in both Playwright projects (the F-1458-1 narrow
filter pattern, inherited correctly from the E2 template).

No screenshots: headless bench infrastructure, no player-visible surface.

## Merge classification

Base `91962d70`. `docs/bench/e4-readiness-census.md` and `e2e/er01-e4-census.spec.ts` are
**LANE-ONLY pure-add** (main never held either path — `create mode 100644` both).
`tasks/BACKLOG.md` **BOTH-MOVED, auto-merged cleanly.**

⚠️ **That clean auto-merge is the one thing worth flagging.** Unlike the pressure-socket and E3
drains — where the ledger conflicted and I resolved it by dropping the lane's claim — E4's
`READY-FOR-GATES on lane/c` line landed on main **automatically**, because it happened not to
collide. The merge makes that line false, so it is a half-retired entry the moment it lands
(Mistake #5). **Retired in the bookkeeping commit**, replaced by the shipped verdict. Recorded
here because the conflict is what made the same hazard visible twice and invisible once: *a clean
merge is not evidence that the ledger is honest.*

## Findings

**F-1461-4 — 🟡 A CLEANLY AUTO-MERGED LEDGER CLAIM IS AS STALE AS A CONFLICTED ONE, AND NOTHING
FLAGS IT.** Three census/socket drains this fire each carried a lane-side
`✅ READY-FOR-GATES on lane/<x>` line. Two conflicted and forced a decision; E4's merged silently
and would have sat on main asserting that finished, merged work is still awaiting gates. The
existing defences do not cover this: `git merge` reports success, the guard battery has no opinion
on the *truth* of a ledger row, and the reviewer only looks because the previous two conflicts
trained them to. Cheap mitigation for the next drainer: after any lane merge, grep the merged
`tasks/BACKLOG.md` for `READY-FOR-GATES on lane/` and retire every row naming the branch you just
merged — conflict or no conflict. Non-blocking.

No blocking findings.
