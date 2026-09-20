# ER-01 E5 Deepwater readiness census — drain review (s1461)

- **Slice:** `lane-er01-e5-census` (E5 Deepwater, on the E2/E3 template + the ERA-SOCKET LAW)
- **Branch / tip:** `lane/d` @ `d2111e8b` (runner bookkeeping) over `65d905d1` (the census itself)
- **Merged to main:** `e608adcd19d8589df37aa4063ad9b19b996805b0`, **plus a same-fire revert of four out-of-scope deletions** (see F-1461-5)
- **Gated in:** detached worktree `gate-s1461/` (§3.0b)
- **Drain-block check:** `? UNKNOWN` — no leaf; searched by leaf id, genuinely absent (F-1461-2). Registered in the bookkeeping commit. Not a block.

## VERDICT: MERGED (content), with the runner's cross-lane `tasks/` deletions REVERTED

## What it does

Censuses the four `epoch-5-deepwater` board contracts. **Verdict: 0 AGENT-READY · 4 DATA-GAP ·
1 BROKEN** (the BROKEN one is also DATA-GAP).

No contract can be admitted without inventing an E5 mechanic: the flagship's live boat, storm,
arsenal and Dredge-Queen consumers do not run headlessly, and the three variants declare their
defining consumers missing. Correctly rejected under AP-11 rather than admitted.

**The BROKEN row is a genuine content defect this census caught, and it is the wave's first:**
Regatta's briefing promises **six** beacon gates, but `raceCourse.beacons` and the terrain contract
both contain **five**. A briefing that over-promises its own course is exactly the sort of thing no
gameplay test asks about — the census found it by comparing the declared story against the
declared data.

Two further honesties worth recording, because both are the kind of thing a weaker run would have
fudged:

- Forced generic GR-SIM runs were used **only** to record the idle Trail baseline. Each hash
  reproduced on a second run, and the census **explicitly refuses to treat them as acceptance
  pins** because the support gate rejects these contracts. Reproducibility was not mistaken for
  admissibility.
- It names an asymmetry in its own data rather than smoothing it: Regatta, Stillwater and Flotilla
  declare their missing consumer; **the Deepwater Claim does not yet declare its missing headless
  dependencies.** That is a fifth finding hiding inside a four-row table, and it was surfaced.

Regatta and Flotilla deliberately remain unavailable (`harvestAnchors: []`), so active contract
selection falls back to the Claim rather than booting a false contract.

Files: `docs/bench/e5-readiness-census.md` (+38), `e2e/er01-e5-census.spec.ts` (+68).

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **green, 1.13s** |
| Own spec `er01-e5-census.spec.ts`, `--workers=1`, desktop + mobile | **8 passed (5.8s)** |
| `npm run test:node-guards` | **280 pass / 1 fail** |

The single fail is **F-1460-1's Baron driver pin**, identical to the digit and identical in count
to the three other trees gated this fire. The spec covers both-seed support rejection and zero
captured `console.error`/`console.warn`.

No screenshots: headless bench infrastructure, no player-visible surface.

## Merge classification

Merge base `99616be5` (verified with `git merge-base`, not assumed). `docs/bench/e5-readiness-census.md`
and `e2e/er01-e5-census.spec.ts` are **LANE-ONLY pure-add**. `tasks/BACKLOG.md` **BOTH-MOVED** —
conflict resolved to HEAD, dropping the lane's `READY-FOR-GATES on lane/d` line, which this merge
makes false (Mistake #5).

**Four `tasks/**` paths were classified as MUST-NOT-MERGE and reverted after the merge commit:**
`tasks/lane-er01-e3-census.md` (-3), `tasks/lane-er01-e4-census.md` (-41),
`tasks/lane-er01-e5-census.md` (-41), `tasks/lane-er01-e6-census.md` (-41).

## Findings

**F-1461-5 — 🟥 A LANE RUNNER'S BOOKKEEPING COMMIT DELETED FOUR TASK MASTERS AND ANOTHER LANE'S
QUEUE FILE.** `d2111e8b` (`runner(lane-d): lane-er01-e5-census.md`) contains **167 deletions and
nothing else**: the E3/E4/E5/E6 masters from `tasks/`, plus
`tasks/queue/lane-b/lane-er01-e6-census.md` — **a file belonging to a different lane's slot.**
Codex's own commit (`65d905d1`) is clean and inside its firewall; the damage is entirely in the
runner's wrapper commit.

**This was not a phantom of a stale base, and I checked rather than assumed.** The merge base is
`99616be5`, and that commit **contains all four masters** (`git cat-file -e` → YES), so these are
real deletions relative to a base that held the files, not the stale-base artefact they resemble.

Had they merged, main would have lost the **E6 master while the E6 drain is still pending** — the
next fire would have found a done-move with no master to cite, and the RETENTION LAW's "no factory
artifact is deleted from disk untracked" would have been violated by a drain, not by a hygiene
pass. Reverted with `git checkout e608adcd^1 -- <the four paths>`; all four verified present after.

The `tasks/queue/lane-b/lane-er01-e6-census.md` deletion was deliberately **not** reverted: lane-b
has already consumed and run E6, s1460 committed that consumption, and restoring the queue file
would hand the live runner a **re-dispatch** of work that is finished and waiting to drain. The
deletion is a no-op against main's current state and reverting it would have been the harmful act.

**Class, not instance:** every lane's runner wrapper commit is exposed to this, because it appears
to stage `tasks/` broadly rather than path-scoping to the one task it consumed — which is the
repo-wide `git add -A` prohibition (CLAUDE.md §4.2) living inside the runner. Any drain that
merges a lane branch at commit level can carry another lane's deletions onto main. **Recommended
(attended — it edits the live runner, and a runner edit is inert until restart anyway):**
path-scope the wrapper commit to the consumed task file. Until then, **every lane-branch drain
must read `git show --stat` on the runner commit before merging**, which is how this was caught.

No blocking findings for the slice itself — the census content is sound and the defect is in the
wrapper.
