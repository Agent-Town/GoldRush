# Review — door-player-epic-submit (the player can post an epic)

**Slice:** `door-player-epic-submit` · **branch:** `lane/d` · **lane tip:** `330f03ee2`
**Gated commit:** `d824ecb1bdb7d407074d453b0515891333d6e7bd` (detached worktree `gate-s2326`, §3.0b custody)
**Merge:** `8da75e626d6700bff634d1f75bba321b6ded4999` (main, `--no-ff`)
**Drained by:** s2327.

## Verdict

**MERGED.** Both sides of the conditional are proven on both browser projects, which is the
one thing this slice had to demonstrate.

## What it does

Executes owner ruling **F-2310-1 option (a)** — verbatim, *"yes, large runs have to be submittable
as well for sure"*.

The county-standings submit call previously passed `keepalive: true` unconditionally. Chromium caps
shared in-flight keepalive bodies at 64 KiB, enforced **client-side before a byte leaves the tab**,
so a Baron-class reel was refused with `TypeError: Failed to fetch` and never reached the county at
all. This slice extracts the call into `postCountyStanding(body)`, measures the body honestly with
`new TextEncoder().encode(body).length`, and spreads `keepalive: true` only below
`KEEPALIVE_SAFE_BYTES = 60_000`.

The threshold is **margin-bearing rather than exact**, and the constant carries its own basis in a
comment at the site: s2310 measured 60,000 B accepted and 65,536 B refused, so 60,000 leaves room
for the *shared* nature of the quota — other in-flight keepalive requests draw on the same budget,
so the true ceiling for any single request is not a constant.

Small bodies keep `keepalive`, so the unload-survival guarantee it exists to provide is preserved
exactly where it is load-bearing. The `catch` around the submit is untouched — county standings stay
optional and still never block the secure ceremony.

## Evidence

Transcript: `artifacts/door-player-epic-submit-gate-s2327.txt`. All legs ran against `gate-s2326`,
the detached worktree holding the merge, never against main's tree.

| Gate | Result | Detail |
|---|---|---|
| `npm run build` (tsc + vite + asset-diet) | rc=0, 2.27 s | |
| `e2e/door-epic-submit.spec.ts` `desktop-chrome` | rc=0 | 1 passed (2.1 s) |
| `e2e/door-epic-submit.spec.ts` `mobile-chrome` | rc=0 | 1 passed (1.8 s) |

**Both sides of the conditional, recorded identically on both projects:**

| Body | `keepalive` | `bodyBytes` |
|---|---|---:|
| small | `true` | 139 |
| epic (Baron-class) | `undefined` | 463,580 |

These reproduce the runner's own reported tuples exactly.

**Why route observation is the proof.** The spec records fetch options via an init-script wrapper and
then observes the request reaching a route handler. That is not incidental: a keepalive-refused
request *never reaches a route handler at all*, so arrival is precisely what demonstrates the body
was transmitted. The test cannot pass by accident of the flag being set.

⚠️ **One leg was re-run, and the first red was MINE, not the slice's.** The initial battery passed
`--project=desktop` / `--project=mobile`; the configured names are `desktop-chrome` / `mobile-chrome`
/ `desktop-webkit`, so playwright exited 1 with *"Project(s) not found"* in 0.7 s and 0.5 s having run
**zero tests**. Both attempts are in the append-only transcript. Recorded because a 0.7-second rc=1
next to a real spec red looks alike at a glance, and the discriminator was the message, not the code.
`desktop-webkit` was not run — the master names the two chromium projects.

## Merge classification

Base `25b79f27d` (merge-base); lane tip `330f03ee2`; one lane commit, three paths.

- `src/game/Game.ts` — **LANE-TOUCHED only.**
- `e2e/door-epic-submit.spec.ts` — **new file, LANE-ONLY.**
- `tasks/BACKLOG.md` — **BOTH-MOVED → conflicted.**

**The conflict and its resolution, stated precisely because a union can silently lose content.**
Lane and main each **appended** a clause to the same F-2310-1 row, both recording the same owner
ruling in different words; the merge-base row was 7,602 chars, main's 7,936, the lane's 7,849.
Isolating each side against the base showed **neither side removed anything** — both were pure
insertions. Resolved as a **union**: main's row (which carries the fuller "PIPELINE-DRY fully lifted
/ thread status" wording) plus the lane's distinctive clause naming the two-project browser proof.
The resolver asserted every clause of both sides survives and that the union is shorter than
neither, refusing rather than guessing. Resolution was performed in the gate worktree, gated there,
then copied byte-for-byte into main's merge.

**`git diff --stat <gated> HEAD` is EMPTY** — main's tree is byte-identical to the tree that was
gated, so the gated commit is what shipped.

## Firewall

**HELD.** Three paths, exactly the master's scope: the `Game.ts` submit site, the new spec, and the
BACKLOG row. No sim mechanics, no ranking, no worker logic, no server-side envelope code — that half
landed separately this fire as `door-epic-envelope-v3` (`314b4533`), with **zero file overlap**
between the two slices, as the authoring row promised.

ⓘ The slice adds `submitCountyStandingForTest` to `window.__GR_TEST__`. This sits **inside the
existing test-only guard** that already constructs `__GR_TEST__`, so it is not reachable in a plain
player boot; it exists so the spec can drive a Baron-sized body without winning a Baron run.

## Findings

**None blocking.** No corrective task spawned.

## GZ-01

**Item filed** — and the contrast with its sibling is the reason. `door-epic-envelope-v3` was
deliberately *not* filed, because its own evidence showed the player path byte-unchanged. This slice
is the other half: it changes what the **player** can do at the county door, which is player-visible
by the filter's plain reading.

## The thread, now closed on both sides

Server side (`door-epic-envelope-v3`, `314b4533`) + player side (this slice, `8da75e62`) means the
five-axis door story is complete: duration, bytes, entries, reader cap — all four county constants
derived — and the fifth, the browser's own keepalive quota, now handled at the call site.

**Still owed, and it is a gauntlet act rather than a code task:** PUBLIC resubmission of the ×2 Baron
rows at the next deploy's commit.
