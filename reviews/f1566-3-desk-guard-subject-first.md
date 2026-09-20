# f1566-3 — the desk guard's closure exit goes subject-first

- **Slice:** `f1566-3-desk-guard-subject-first` (fire-authored s1566, drained s1567)
- **Branch / tip:** `lane/b` @ `d23140ac2` · base `95b83d4cc`
- **Merge:** `cc5b76945a7622863a2ee548afeadb9eeef21b01` (`--no-ff`, `ort`, **zero conflicts**)
- **Verdict:** ✅ **MERGE**

## What it does

`scripts/desk-carryforward-guard.mjs` refuses a handoff that drops an owner-desk item
without saying why. A drop is excused on two grounds: an explicit `DESK-DROPPED:` clause,
or BACKLOG recording the id closed. The second ground was implemented against
`findings-state-guard`'s wide `scan()`, **which attributes a row's state to every F-ID
inside that row's 90-character subject zone** — so an id merely *cited* by another
finding's closure row read as closed, and the guard built to stop silent desk drops
would have let that id leave the desk in silence. s1566 measured it: of 343 ids the wide
census calls closed, **21 (6.1%) have no subject-led closure row at all**.

This slice points the closure exit at the subject-first reader that shipped one fire
earlier (`scripts/desk-state-audit.mjs`, merged `1eb13cff1`): a row states the state of
the **first** F-ID in its subject zone only. `scan()` itself is **not touched** — F-1261-1
measured a re-implementation of "closed" disagreeing with the original on 4 of 14 rows,
and there remains one implementation of that word in this repo.

Shape of the change (4 files, +143/−5):

- `desk-state-audit.mjs` — `classifyFinding()`'s first half extracted to a shared
  `subjectState()`; new export `subjectLedClosure(backlogText, id)` returning the
  evidence line numbers of subject-led closure rows (empty = not closed by this standard).
  Pure extraction: `classifyFinding` now calls it and its verdicts are unchanged.
- `desk-carryforward-guard.mjs` — the census lookup `!closed.get(id)?.closed.length`
  becomes `!subjectLedClosure(backlogText, id).length`; the `wide` vocabulary and the
  `DESK-DROPPED:` exit are untouched; the header records the measured 21-of-343.
- `desk-carryforward-guard.test.mjs` — +5 tests in the file that already owns the
  guard's fixtures and CLI boundary. No new test file, **no `package.json` edit**,
  so no new un-rooted gate for `gate-caller-audit` to red on.

## Merge classification

Base `95b83d4cc`. Four paths. **Main moved on ZERO of them** since the base — the only
main-side commits in the window are `5e820a61b` (`STATUS.md`, `gate-caller-baseline.json`,
`tasks/BACKLOG.md`), `50687c890 (archive: pruned by the A3 rewrite)` and `7044e0f58` (telemetry + my lock). So all four files
are **LANE-TOUCHED / MAIN-UNMOVED**; no graft, no three-way resolution, nothing to
classify BOTH-MOVED.

**Firewall held.** `scripts/findings-state-guard.mjs` and `package.json` are both absent
from the diff — the two violations s1566's master named as task failures even under a
green suite. Verified from `git diff --name-only main...lane/b`, which lists exactly the
four files above.

**Custody (§3.0b).** Everything below was gated in a detached worktree `gate-s1567`
inside the repo root, never in main's working tree, until the verdict was MERGE. The
worktree was removed afterwards.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 4.8 s |
| `npm run build` | **rc=0**, 18.4 s (vite 1.03 s; asset-diet 1,158,214 / 1,500,000 B) |
| `npm run test:ledger-guards` | **rc=0**, 18.0 s — **129 tests / 129 pass / 0 fail** (s1566 baseline 124/124) |
| chained leaves | **12/12 PASS** (findings-state · blocker-panel · ruling-propagation · citations · desk-declaration · desk-birth · status-archive-audit · attended-owed-audit · main-lock-gate · janitor-request-rejection · lane-dispatch-safety · nul-audit) |
| Playwright | **not run, not owed** — the diff contains no `src/**` and no `e2e/**` |
| `test:node-guards` | **not run, not owed** — F-1460-1 keys on `src/sim/`, `src/systems/`, `src/entities/`; this diff touches none |

### The RED was verified here, not inherited

A passing guard never executes its violation path, so its green is not evidence about the
red (the s1299/s1300 standard). The runner reported manufacturing the defect; I reproduced
it independently on the merged tree by restoring **only** the old predicate and its import:

```
PROBE (old fail-open predicate) rc=1
✖ citation-only closure cannot silently excuse a dropped desk item
ℹ tests 15 · pass 14 · fail 1
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
--- restored byte-identical: true
```

Exactly one test fails, and it is the new one. With the cure in place: **15/15**. The
guard file was restored byte-identical before any further gate ran.

### The cure proved against the LIVE ledger, not only the fixture

The fixture uses `F-1541-2`, whose only BACKLOG mention is a citation inside
`- ✅ **F-1542-1 CLOSED — supersedes F-1541-2.**`. Against the real
`tasks/BACKLOG.md` (3,914,542 bytes):

```
subjectLedClosure(backlog, 'F-1541-2') -> []      // no longer read as closed
subjectLedClosure(backlog, 'F-1542-1') -> [91]    // the row's real subject still is
```

### Live-board before / after (the master made this the acceptance condition)

s1566 required the live-board verdict on both sides, because *"a PASS→FAIL flip is a real
silent drop surfacing, to be REPORTED, not tuned away."* The lane could only ever print
`SKIP` (its line-1 is a lock line), and main's line-1 is my own ACTIVE lock — so I ran the
guard against **s1566's real handoff board** (`git show c885970f8:STATUS.md`) with **main's**
current BACKLOG, under each predicate in turn:

```
BEFORE (raw wide census)  rc=0 — previous desk (s1565): 22 items · this desk: 22 · dropped: 0 · PASS
AFTER  (subject-first)    rc=0 — previous desk (s1565): 22 items · this desk: 22 · dropped: 0 · PASS
```

**No flip, and the reason is the honest one:** zero items were dropped, so the closure exit
was never reached on this board. That is consistent with — and does not independently
confirm — s1566's finding that exposure is currently zero (none of the 21 citation-only ids
is on the desk). The cure is landed while latent, which is the right moment.

## Findings

**F-1567-1 (non-blocking, no corrective owed) — the slug-keyed half of the desk still has
no closure exit at all, and it fails SAFE.** `subjectLedClosure` returns `[]` for
`rf-34-hero-y-restore-roundtrip`, exactly as `scan().get()` did before it, because neither
reader keys backticked slugs. Four of the current 22 desk items are slug-keyed
(`rf-34-…`, `e3-fairground-socket`, `bt-04-homestead-automation`,
`f1328-1-drill-yard-census-debt`), so a fire dropping one of them can only be excused by an
explicit `DESK-DROPPED:` clause — never by BACKLOG. **This is unchanged behaviour and it
errs toward refusing**, so it is recorded rather than cured; it is worth knowing before
someone reads a slug drop's refusal as a bug in this slice.

**Non-blocking note — cost.** `subjectLedClosure()` re-parses the whole BACKLOG per call
(`subjectRows()` + `scan()`), and the guard calls it once per dropped id. Measured **4.5 ms
per call** on the live 3.9 MB ledger, so even s1527's ten-item drop would cost ~45 ms. Not
worth memoising; recorded so nobody re-measures it.

## Ledger

- `tasks/BACKLOG.md` — **F-1566-3 CLOSED**, original text preserved beneath the closure
  (retention law).
- `tasks/goals.json` — leaf `f1566-3-desk-guard-subject-first` → `merged` @ `cc5b76945a…`.
- done-move renamed `drained-3d4651f91-20260808-183918-lane-b-f1566-3-desk-guard-subject-first.md`.
- **GZ-01 not owed:** this slice ships no player-visible change — it is factory
  bookkeeping machinery. Manufacturing a news item for it would be dishonest.
- **DEPLOY not owed:** no gameplay-affecting code merged.
