# ER-01 E3 Voltage readiness census — drain review (s1461)

- **Slice:** `lane-er01-e3-census` (E3 Voltage, on the E2 template + the ERA-SOCKET LAW)
- **Origin commit:** `d0f52744` — **a reflog orphan when this fire found it** (see F-1461-1)
- **Rescued to:** `archive/lane-b-s1461-orphan-er01-e3-d0f52744`
- **Merged to main:** `0c4168a2d2d43214cf443fcd3252afc3aa27a905`
- **Gated in:** detached worktree `gate-s1461/` at merge `6ce41876` (§3.0b)
- **Drain-block check:** `? UNKNOWN` — no leaf; searched by leaf id, genuinely absent. Registered in the bookkeeping commit. Not a block.

## VERDICT: MERGED (as a re-land of rescued work)

## What it does

Censuses the four E3 Voltage board contracts against `HeadlessContractSim` and **rejects all four**
under the ERA-SOCKET LAW: their defining consumers — power, night/light, moth, Crawler, fairground
— do not exist in the headless sim, so admitting them would be a stretch of the contract
vocabulary rather than a measurement of it.

**Census verdict: 0 AGENT-READY · 4 DATA-GAP · 0 BROKEN.** Each contract gets two pinned
diagnostic seeds; the focused spec exercises all eight default boots plus the
declared-but-unrepresented sources. Four attended fix-master stubs are written into
`docs/bench/e3-readiness-census.md`, with **no sim/balance/content cure folded into this leaf** —
the correct firewall.

This is the ERA-SOCKET LAW behaving as designed one epoch on from the slice that named it: E2's
pressure gap was cured by *building the socket* (`24c6600f`, drained earlier this fire), and E3's
five gaps are *named as DATA-GAP rows pointing at their missing sockets* rather than papered over.
Generator proposes, contract disposes.

Files: `docs/bench/e3-readiness-census.md` (+38), `e2e/er01-e3-census.spec.ts` (+58),
`assets/contracts/bench-seeds.json` (+16). 112 insertions, **pure-additive, zero deletions**.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **green, 1.55s** |
| Own spec `er01-e3-census.spec.ts`, `--workers=1`, desktop + mobile | **8 passed (5.9s)** |
| `npm run test:node-guards` (adjacent: this slice writes `bench-seeds.json`, which `scripts/gr-sim.test.mjs` consumes) | **280 pass / 1 fail** |

The single fail is **F-1460-1's Baron driver pin** — `the Baron driver runs the declared fight and
keeps medal writes off headless` — with values identical to the digit to both s1460's clean-main
measurement and this fire's earlier drain: received `kills: 861` / `fnv1a32:36004eab` against
pinned `869` / `b9566c6d`. **The count is the load-bearing number here:** this slice appends 16
seeds to the file `gr-sim.test.mjs` reads, so the question was not "is the Baron red known" but
"did these seeds add a failure". 280/1 answers it — they did not.

No screenshots: headless bench infrastructure, no player-visible surface.

## Merge classification

Base `3445d479`. Per-file: `docs/bench/e3-readiness-census.md`, `e2e/er01-e3-census.spec.ts`,
`assets/contracts/bench-seeds.json` all **LANE-ONLY pure-add** (main has never held these paths, or
holds them only as append-only union surfaces); `tasks/BACKLOG.md` **BOTH-MOVED**.

The one conflict was the ledger, resolved to HEAD for the same reason as the pressure-socket drain:
the lane's `READY-FOR-GATES on lane/b` line is made **false** by this merge, and landing it would
leave a half-retired entry (Mistake #5). The merged verdict is written directly instead.

`bench-seeds.json` is an **append-only union surface** per the PARALLEL-CENSUS DRAIN NOTE — E3's
queue copy predates that note, so this drain read it from `tasks/BACKLOG.md` as the note instructs.
All epochs' members kept; E2's seeds untouched.

## Findings

**F-1461-1 (filed in `reviews/e2-pressure-socket.md`, evidenced here) — this slice IS the
casualty.** `lane/b` committed it at `d0f52744` (20:47:02) and was `reset --hard` to `origin/main`
about **30 seconds later** when the runner dispatched the E6 census into the same slot. The
done-move `20260805-203235-lane-er01-e3-census.md` sat un-prefixed — a completed-run claim — while
112 lines of gated-quality work existed on **no branch and not on main**, recoverable only from
`lane/b@{2}` in the reflog. Nothing in `git status`, `git log`, or the done-move directory would
have shown this; it was found only because a routine `lane-usable` sweep reported `lane-b ahead=0`
while an un-prefixed done-move claimed output, and the two could not both be true.

**The class is open and it is structural, not careless.** The attended batch queued E6 *behind* E3
on the same lane ("#2 behind E3, same-lane serial") and no drain ran between them. Same-lane
serial dispatch has no drain barrier: the second task's pre-flight reset is the first task's
execution. Any same-lane pair queued this way repeats it exactly, and the loss is silent — the
done-move still reads like success. E4 (lane-c) and E5 (lane-d) were never at risk because they
landed on their own lanes; **E6 was at risk for the whole window between its own commit and this
fire's triage.**

Recommended (attended, not fire-authorable — it changes dispatch policy): either the runner's lane
pre-flight refuses to reset over a commit whose done-move is still un-prefixed, or same-lane
serial queueing is disallowed for slots without an interleaved drain. This is the mechanism the
LANE-SAFETY LAW assumes exists and does not.

No blocking findings.
