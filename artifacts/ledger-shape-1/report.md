# ledger-shape-1 — dry-run report

**Task:** `tasks/ledger-shape-1.md` (owner ruling 2026-09-24, item 13 "(a)").
**Branch:** `chore/ledger-shape-1`, cut from main at `c0e15c901`.
**Worktree:** `/Users/robin/Claude/Projects/wt-ls1`. Implementer: Claude Opus 5, attended-spawned.
**Date:** 2026-09-25.

## 0. What this branch is, and what it deliberately is not

It ships **TOOLS, TESTS and this DRY-RUN REPORT**. `--apply` was NEVER run against this
worktree's `STATUS.md`, `tasks/BACKLOG.md` or `scripts/citation-title-baseline.json`. Every
`--apply` in this report ran against a `mkdtemp` copy (§4). `git status --short` on the branch
shows those three files untouched, and nothing outside the master's TOUCH-ONLY list is modified.

The rotation and the split themselves are executed by the attended drain on fresh main, with the
fires held, in one commit (§6).

Pre-flight, as the master prescribes: `git status --short` showed only `?? node_modules` (the
symlink); `git log main..HEAD --oneline` was empty; `npm run build` is green (§5). The build was
run after the first edits rather than before them — a deviation worth stating: every edit on this
branch is under `scripts/`, `.claude/` or `package.json`'s scripts block, none of which the
`tsc && vite build && asset-diet` pipeline reads, and it is green now.

### MAIN HAS ADVANCED SINCE THE BRANCH POINT — the numbers below will differ slightly

Measured at the end of this task: `main` is ~10 commits ahead of `c0e15c901` (the sec2
sec-headers chain landed, plus the s2675 fire), and both ledger files grew.

| file | at the branch point | on main now | delta |
| --- | --- | --- | --- |
| `STATUS.md` | 20,555,947 B | 20,562,862 B | **+6,915** |
| `tasks/BACKLOG.md` | 9,289,815 B | 9,293,600 B | **+3,785** |
| `scripts/citation-title-baseline.json` | 21,171 B | 21,171 B | 0 |

Neither `archive/status/` nor `tasks/backlog/` exists on main yet, so the drain creates both.
Both tools RE-DERIVE everything at `--apply` time — the months, the keys, the byte accounting and
the baseline allocation are all measured from the tree in front of them, never transcribed — so the
numbers in §1 and §2 are a SNAPSHOT of the branch point and not a prediction. **Run each tool with
`--dry-run` on main first and read its own BALANCE line**; the extra bullets will land in
2026-09 (the current month, so they stay on the board) and the extra rows above the title also
stay, so the shape of the answer will not change even though the digits will. A brand-new month
boundary is the only thing that would move a month from "current" to "closed", and neither tool
needs telling: `currentMonth` is read from line 1.

The attended drain merges main into this branch (this implementer was told not to, and did not:
`git log main..HEAD` is exactly the four commits in §8b, and `git diff main...HEAD` is the 33 files
listed there — nothing outside the master's TOUCH-ONLY list, and `STATUS.md`, `tasks/BACKLOG.md`,
`tasks/goals.json` and `scripts/citation-title-baseline.json` all byte-identical to their
branch-point versions).

## 1. `scripts/status-rotate-month.mjs --dry-run` on the branch's tree

```
=== status-rotate-month ===
mode              : DRY-RUN
current month     : 2026-09
trailing window   : 40 newest bullet(s) held on the board whatever their month
archive bullets   : 3314
  dated by        : 3064 stamp · 250 session-neighbour · 0 document-neighbour · 0 unplaceable
staying           : 320 current-month · 40 trailing-window · 0 unplaceable
moving            : 2954 bullet(s), 14.44 MB
per destination   :
  archive/status/2026-07.md     1505 bullet(s)    5.46 MB  + 437 B header (new file)
  archive/status/2026-08.md     1449 bullet(s)    8.98 MB  + 437 B header (new file)
STATUS.md         : 20.56 MB -> 6.11 MB
BALANCE           : in 20556821 B (STATUS 20555947 + archives 0 + headers 874) === out 20556821 B
                    (STATUS 6111190 + archives 14445631) -> BALANCED
DRY-RUN — nothing written. Re-run with --apply to perform the move.
```
rc 0. Full capture: `artifacts/ledger-shape-1/status-rotate-dry-run.txt`.

STATUS.md **20,555,947 B -> 6,111,190 B** (70.3% compaction); the reader map projected "about
6.7 MB". Kept on the board: line 1, the blank line, the **18 `s9<letter>` law bullets**, all 320
bullets of the current month (2026-09), and the newest 40 bullets whatever their month.

**The 250 unstamped bullets are dated by their `s<N>` neighbours, never by a guessed date**, and
the route is printed per class. `0 unplaceable` on today's board; an unplaceable bullet STAYS
(asserted by test).

## 2. `scripts/backlog-split-closed.mjs --dry-run` on the branch's tree

```
=== backlog-split-closed ===
mode              : DRY-RUN
# Task backlog H1 : line 2935
rows below title  : 2298  (595 closed-marked)
held on the index : 184 closed row(s) kept — 157 gate · 10 RULED · 17 desk
moving            : 411 row(s), 844.1 kB
  keyed by        : 3 row-date · 165 neighbour-above · 85 heading-slug · 158 heading-date
per destination   :
  tasks/backlog/closed-2026-07.md                     264 row(s)   577.8 kB
  tasks/backlog/closed-2026-08.md                      62 row(s)   127.9 kB
  tasks/backlog/owner-rulings-2026-08-08-morning.md     21 row(s)    33.2 kB
  tasks/backlog/s1079.md                               21 row(s)    49.5 kB
  tasks/backlog/owners-desk.md                         11 row(s)     7.9 kB
  tasks/backlog/the-epoch-work-package-ladder.md        8 row(s)     6.8 kB
  tasks/backlog/s1078.md                                7 row(s)    18.3 kB
  tasks/backlog/s1070.md                                3 row(s)     2.5 kB
  tasks/backlog/{later,s1071,s1073,s1077}.md            2 row(s) each
  tasks/backlog/{e2-completion,lane-c,mp-07-ladder,multiplayer,s1074-fire,the-saga-build-plan}.md
                                                        1 row  each
  (18 destination files, each + a 476-503 B header)
tasks/BACKLOG.md  : 9.29 MB -> 8.45 MB  (+6932 B of pointer lines)
BALANCE           : in 9305431 B (index 9289815 + parts 0 + headers 8684 + pointers 6932)
                === out 9305431 B (index 8452660 + parts 852771) -> BALANCED
```
rc 0. Full capture: `artifacts/ledger-shape-1/backlog-split-dry-run.txt`.

`tasks/BACKLOG.md` **9,289,815 B -> 8,452,660 B**. The reduction is modest on purpose: the master
splits **by STATE, not by position**, so the 2,935 lines above the `# Task backlog` title and every
open / desk / gate / RULED / `^OWNER:` row below it stay where every reader has always found them.

### Rows held on the index, by reason
| reason | closed-marked rows held | why it must stay |
| --- | --- | --- |
| `GATE:` | 157 | `dashboard-gen.sh`'s blocked panel greps them |
| 🔺 desk | 17 | `desk-declaration-guard` / `desk-carryforward-guard` |
| `RULED` | 10 | `ruling-propagation-guard`'s subject set |
| `^OWNER:` | 0 closed-marked today; the single live row is not closed and never moves | the desk panel |
| open | 181 open rows board-wide, every one kept | every fail-open reader |

### Pointer lines (a sample from the scratch `--apply`)
```
2936:→ `tasks/backlog/closed-2026-08.md` — 39 closed row(s) moved there by
      `scripts/backlog-split-closed.mjs` (owner ruling 2026-09-24, item 13a); nothing was deleted.
2937:→ `tasks/backlog/closed-2026-07.md` — 129 closed row(s) moved there by ...
4053:→ `tasks/backlog/lane-c.md` — 1 closed row(s) moved there by ...
```
One pointer per (section, key), directly under the section's heading. The H1 and every H2 stay.

### The first-key desk rows are proven to stay
Live `STATUS.md` line 1 declares `F-2642-3`, `F-2299-1` and `` `b1-device-verdict-rows` `` (plus
the unkeyed prose token `setup-token`). Measured first declaring row per key against the H1 at 2935:

| desk key | first declaring row | verdict |
| --- | --- | --- |
| `F-2299-1` | line 16 | ABOVE the title -> STAYS |
| `b1-device-verdict-rows` | line 223 | ABOVE the title -> STAYS |
| `F-2642-3` | line 280 | ABOVE the title -> STAYS |
| `setup-token` | no keyed subject row (the guard's own "unkeyed segment" class) | n/a |

`desk-declaration-guard` and `desk-state-audit` are rc 0 before and after the scratch apply (§4);
neither needed widening, which is exactly what the reader map predicted.

### The baseline re-key
`scripts/citation-title-baseline.json` carries 262 grandfathered keys, **74** of them
`tasks/BACKLOG.md::`. The tool re-keys them mechanically and refuses on anything it cannot place.

```
tasks/BACKLOG.md keys: 74 · moved whole: 17 · straddling: 4 · unplaceable: 0
```
17 keys move whole (16 to `closed-2026-07`, 1 to `closed-2026-08`), e.g.
`tasks/BACKLOG.md::e2e/release-build.spec.ts:297 -> tasks/backlog/closed-2026-07.md=1`.
4 STRADDLE (the coordinate now occurs on both sides), each printed by name:
```
STRADDLE ...::e2e/ap-standing-orders.spec.ts:80  -> index=1 , closed-2026-07=1  (allowance 1 -> 2)
STRADDLE ...::e2e/asset-diet.spec.ts:15          -> index=1 , closed-2026-07=1  (allowance 1 -> 2)
STRADDLE ...::e2e/m2-01-build-menu.spec.ts:84    -> index=1 , closed-2026-07=1  (allowance 2 -> 2)
STRADDLE ...::e2e/task-037-assay-bench-ungate.spec.ts:160 -> index=1 , s1070=1  (allowance 2 -> 2)
```

**F-LS1-1 — THE FIRST ALLOCATION RULE REDDED THE GATE, AND THE SCRATCH APPLY IS WHAT CAUGHT IT.**
The first draft split a straddling allowance *in proportion* to occurrences. On the scratch apply
of the real ledger, `citation-title-guard` came back **`FAIL — 2 citation(s)`** at
`found 1, grandfathered 0` for `tasks/backlog/closed-2026-07.md::e2e/asset-diet.spec.ts:15` and
`...::e2e/ap-standing-orders.spec.ts:80`: both have one occurrence per side and an allowance of 1,
the floor took both shares to 0, the remainder went to the index by the tie rule — and in BOTH
cases the *offending* occurrence was the one that moved. This tool cannot see which occurrence
offends (that verdict needs the spec's titles and a ±WINDOW read, which is
`citation-title-guard`'s job and must not be re-implemented — F-1261-1), so a proportional split
is a guess dressed as arithmetic. The rule is now `min(allowance, occurrences there)` per
destination, with every straddle printed by name and delta. `citation-title-guard` is rc 0 on the
applied scratch (§4). A GROUND TRUTH arm reproducing the red was added to
`scripts/backlog-split-closed.test.mjs`.

### `F-1253-1` / `F-1251-1` — the two `gate-caller-audit` escalation ids
Measured on the applied scratch copy:

| id | occurrences on the index | in `tasks/backlog/**` | corpus total |
| --- | --- | --- | --- |
| `F-1253-1` | 5 | 1 (`closed-2026-07.md`) | 6 |
| `F-1251-1` | 2 | 0 | 2 |

Both remain findable on the index alone, so `gate-caller-audit` would not have redded even
unwidened — but one `F-1253-1` row does move, and the widening keeps the whole corpus in view
(`owner escalations : 3   unrouted: 0`, rc 0 on the branch).

## 3. Idempotence and the balance refusal

* **Idempotence**: a second `--apply` of each tool on the applied scratch reports
  `moving : 0 bullet(s)` / `moving : 0 row(s)`, and `git status --porcelain` on the scratch is
  EMPTY after it — byte-identical `STATUS.md`, archives, index and parts, and exactly one pointer
  per key (not one per run). Asserted hermetically in both new tests.
* **Balance refusal, manufactured**: a variant of `status-rotate-month.mjs` with `headerBytes: 0`
  exits **2** with `OFF BY 874 B` and writes nothing; a variant of `backlog-split-closed.mjs` with
  `pointerBytes += 0` exits **2** with `OFF BY ...` and writes nothing. Reverse controls (the
  unpatched tools on the same fixtures) exit 0 and apply.
* **Unplaceable-key refusal, manufactured**: a baseline key whose coordinate appears in no row
  exits **2** naming `UNPLACEABLE ...` and writes nothing. Reverse control passes. A MISSING
  baseline also refuses ("a ratchet without its baseline is not a ratchet", F-1252-1's rule).
* Both refusals happen **before any write**: a half-applied move is the one state the Retention
  Law cannot tolerate.
* **Misuse**: neither/both of `--dry-run`/`--apply`, and any unrecognised flag, refuse rc 2 on
  BOTH channels (F-2211-1: a caller classifying stdout reads an empty string as silence).

## 4. The guard runs, before and after, against the scratch `--apply` copies

The scratch is a `mkdtemp` **git repo** holding `cp -R` copies of `STATUS.md`, `tasks/`, `e2e/`,
`package.json` and the two baselines, committed, then `--apply`ed, then committed the way the drain
will (path-scoped add of `STATUS.md archive/status tasks/BACKLOG.md tasks/backlog
scripts/citation-title-baseline.json`). **The worktree was never written to.**
Full log: `artifacts/ledger-shape-1/scratch-guards-before-after.log`.

| reader | BEFORE | AFTER | note |
| --- | --- | --- | --- |
| `findings-state-guard` | rc 0 | rc 0 | 664 subjects / 480 closed / 184 open / 0 double-state |
| `blocker-panel-closed-guard` | rc 0 | rc 0 | 44 panel rows, 590 census closed, 0 closed-on-panel |
| `stale-ready-for-gates-guard` | rc 0 | rc 0 | 125 carriers, 0 STALE |
| `stale-open-candidates` | rc 0 | rc 0 | 665 ledger rows (open 181 / closed 484) |
| `desk-carryforward-guard` | rc 0 | rc 0 | previous desk read; both corpora declared |
| `desk-declaration-guard` | rc 0 | rc 0 | **not widened** — the reader map's prediction held |
| `desk-state-audit` | rc 0 | rc 0 | **not widened** |
| `ruling-propagation-guard` † | rc 0 | rc 0 | 14 RULED, 0 stale |
| `row-quote-currency` † | rc 0 | rc 0 | 181 open rows probed |
| `citation-title-guard` | rc 0 | **rc 0** | rc 1 before the F-LS1-1 cure; 735 citations, 264 keys |
| `gate-caller-audit` | rc 2 ‡ | rc 2 ‡ | identical both phases — a scratch artefact, see ‡ |
| `dashboard-gen.sh` greps | GATE 901 / OWNER 1 | **GATE 901 / OWNER 1** | byte-identical corpus counts |

† These two take no `--root` (their ROOT is `dirname(script)/..`), so they were run from NAMED
copies placed inside `$SCRATCH/scripts/` — the technique `collection-guards-subject-set-guard`
already uses. Without it they would have read the worktree's unsplit ledger in both phases and
proved nothing.

‡ `gate-caller-audit` refuses in the scratch with "the resolver did not reach its own anchors:
npm:test:node-guards, npm:test:task-guards" — the scratch has no `scripts/run-guards.mjs`, so the
gate graph cannot build. It is rc-identical in both phases, it is **rc 0 on the branch's own tree**
(`owner escalations : 3   unrouted: 0   PASS`), and its actual concern was measured directly (§2,
the `F-1253-1`/`F-1251-1` table).

### The decisive A/B for `status-archive-audit`
Log: `artifacts/ledger-shape-1/status-archive-ab.log`. A first attempt was INCONCLUSIVE and is
worth recording: archiving the predecessor into STATUS.md and then rotating in a separate commit
means the per-commit arm (`childBlob.includes(before)`) correctly skips the transition as "properly
archived", and the rotation commit does not change line 1 at all — so the PERMANENCE predicate, the
only thing the widening touches, is never reached and both arms read CLEAN. A control that cannot
fail proves nothing (F-2215-1).

The state that DOES reach it was then manufactured: s9997 writes a handoff onto line 1; s9999 takes
the lock and archives nothing (the F-1341-1 defect); then s9997's bullet arrives — in the
**rotated** `archive/status/2026-08.md`, where the rotation puts it.

| arm | corpus | verdict |
| --- | --- | --- |
| CONTROL (bullet nowhere) | widened | `LOST: 2 ... PERMANENTLY absent`, rc 1 — the fixture really carries drops |
| **A — the widened tool** | `STATUS.md` + 3 archive months | `LOST: 1 ... (1 more were dropped at lock time but restored)`, rc 1 |
| **B — pre-cure control** | `STATUS.md` only | `LOST: 2`, naming `s9999 destroyed s9997's handoff line (109 chars)` |

The widening moved exactly one verdict — s9997's handoff — from PERMANENTLY LOST to transient,
because the bullet is legible in `archive/status/2026-08.md`. The second DROPPED entry is present in
both arms (a fixture artefact of the commit ordering), which is what keeps arm A's rc 1 from being
a green-wash. **Unwidened, the rotation would have reported ~2,954 handoffs permanently lost, and
the remedy that red implies is to copy 14 MB back into the file the owner ordered compacted — the
trap `status-archive-audit.mjs` itself names twice ("a guard whose remedy is to corrupt a correct
file is the guard that is wrong").**

## 5. The branch's own gates

| gate | result |
| --- | --- |
| `npm run build` | **green** (tsc + vite build + asset-diet) |
| `node scripts/status-archive-audit.mjs --limit 40 --quiet` | **rc 0** — `CLEAN ... of 39 replacements across 40 STATUS.md commits`, now preceded by `board corpus : STATUS.md (no rotated months on this tree)` |
| `node scripts/law-pointer-guard.mjs` | **rc 0** — `PASS — every law-surface pointer still lands on the line it was written for` (7 surfaces, 3 scan families, 31/31 instruments resolved) |
| `node scripts/source-pointer-guard.mjs` | **rc 0** — after the F-LS1-4 re-base (§7). 672 files, 5 same-file citations checked |
| the two fire.md guards (`law-bash-prescription-guard`, `dry-board-advisory-prescription-guard`) | **32 pass / 0 fail, rc 0** |
| `scripts/status-rotate-month.test.mjs` | **9 pass / 0 fail** |
| `scripts/backlog-split-closed.test.mjs` | **13 pass / 0 fail** |
| `scripts/desk-carryforward-guard.test.mjs` | **29 pass / 0 fail** (26 existing + 3 new) |
| `scripts/findings-state-guard.test.mjs` | **9 pass / 0 fail** (7 existing + 2 new) |
| `scripts/gate-caller-audit.test.mjs` | **45 pass / 0 fail** (after F-LS1-5) |
| the four `status-archive-*` guards + `desk-status-single-read` + `status-line1-desk-displacement` + `source-pointer-guard` re-run after the pointer re-base | **76 pass / 0 fail** |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` | **983 tests, 976 pass, 2 fail**, rc 1 — both fails attributed below, neither mine |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:ledger-guards` | the `node --test` block **1257 tests, 1254 pass, 0 fail** (3 skipped: the owner-gated codex-shim live arms). rc 2, because the `&&` chain then reaches `npm run test:desk-declaration`, which REFUSES on a linked worktree by design — attributed below |

**The tree has not moved**, so every green above is also the assertion the task asked for: every
reader is indifferent to an EMPTY `archive/status/` and `tasks/backlog/`. Each widened reader prints
`... (no split parts on this tree)` on this branch, and two new test arms assert that state
explicitly rather than leaving it implied.

### The remaining reds, each attributed by measurement

**1. `desk-declaration-guard.test.mjs :: the live board is green under this guard (baseline is
honest)`** — NOT MINE. `git diff main..HEAD -- scripts/desk-declaration-guard.mjs` is EMPTY: the
file is untouched by this branch. The arm is `assert.equal(run(REPO).status, 0)` against the repo
root, and that guard REFUSES on a linked worktree by design (F-2232-1 / F-2241-1 / F-2242-1: "this
is a linked worktree and its STATUS.md line-1 is NOT the one main carries"). Measured both ways on
this tree: **bare rc 2**, and **rc 0 when given a non-worktree `--root`** (the scratch, before AND
after the apply). Structural to running the battery from `wt-ls1`; it will be green when the drain
runs the battery on main.

**2. `fixture-teardown.test.mjs :: all 155 scripts/*.test.mjs fixture owners remove their temp
directories`** — NOT MINE, and a CASCADE rather than a defect: that arm re-runs every test file as
a child and fails if any child fails. Its failing child was **a different file in each of the two
battery runs** — run 1 `desk-declaration-guard.test.mjs` (red 1 above), run 2
`board-tape-gold.test.mjs`. Neither is touched by this branch, and `board-tape-gold`'s arm PASSES at
top level in both runs (34.7 s and 31.4 s) while taking **126 s** inside the cascade: it timed out
under the contention of a battery re-running the whole roster inside itself. Both new tests tear
down through `t.after(() => fs.rmSync(dir, { recursive: true, force: true }))` on every fixture and
every variant directory, and neither is named by the failure.

**3. The `test:ledger-guards` chain stopping at `npm run test:desk-declaration` (rc 2)** — the same
linked-worktree refusal as red 1. Because `&&` short-circuits, the legs AFTER it never ran in the
battery, so each was **run individually** and is recorded here rather than left UNVERIFIED:

| leg | rc |
| --- | --- |
| `node scripts/desk-carryforward-guard.mjs` | 2 — the same linked-worktree refusal (rc 0 with `--root`) |
| `node scripts/status-archive-audit.mjs --limit 40 --quiet` | 0 |
| `node scripts/attended-owed-audit.mjs` | 0 |
| `bash scripts/main-lock-gate-guard.test.sh` | 0 |
| `bash scripts/janitor-request-rejection.test.sh` | 0 |
| `bash scripts/lane-dispatch-safety-guard.test.sh` | 0 |
| `bash scripts/codex-client-floor.test.sh` | 0 |
| `bash scripts/runner-restart-recipe.test.sh` | 0 |
| `bash scripts/runner-commit-decoupling-guard.test.sh` | 0 |
| `node scripts/ledger-mirror-exposure.mjs` | 0 |
| `node scripts/nul-audit.mjs` | 0 |
| `node scripts/source-pointer-guard.mjs` | **1, then 0** — F-LS1-4, cured; see §7 |
| `bash foundry/kit/test-init.sh` | 0 |

Earlier legs of the chain all passed inside the battery: `ghost-ladder-row-guard --strict`,
`test:findings-state`, `test:blocker-panel`, `test:ruling-propagation`, `test:citations`.

## 6. The exact two commands the drain runs on main

With the fires held (`tasks/.fire.lock` fresh) and main's tree clean, from the repo root:

```bash
node scripts/status-rotate-month.mjs --apply
node scripts/backlog-split-closed.mjs --apply
```

Then, in ONE commit (path-scoped, never `-A`):

```bash
git add -- STATUS.md archive/status tasks/BACKLOG.md tasks/backlog \
           scripts/citation-title-baseline.json
git commit -m "chore: ledger-shape-1 — rotate STATUS's closed months into archive/status/ and split BACKLOG's closed rows into tasks/backlog/, every byte kept (owner ruling 2026-09-24, item 13a)"
```

Run each tool with `--dry-run` first and read its BALANCE line; both refuse rather than write if the
bytes do not reconcile. Expect `archive/status/2026-07.md`, `archive/status/2026-08.md` and 18 files
under `tasks/backlog/` — **all new and untracked until that `git add`**, which is why the add must
name the two DIRECTORIES and not just the two edited files.

## 7. What shipped

**New:** `scripts/ledger-corpus.mjs` (the shared corpus helper: `backlogFiles()`,
`statusArchiveFiles()`, plus `backlogParts` / `backlogText` / `backlogRows` / `statusParts` /
`statusText` / `corpusDeclaration`), `scripts/status-rotate-month.mjs`,
`scripts/backlog-split-closed.mjs`, and their two hermetic tests.

**Widened, each keeping its exact output shape and exit semantics:** `status-archive-audit.mjs`
(corpus = STATUS.md + `archive/status/*.md`, declared on stdout; the archive listing is INLINED, not
imported, because three guards copy that file alone into a bare `mkdtemp` — F-2672-2),
`desk-carryforward-guard.mjs` (`previousDesk()` archives fall-through + the BACKLOG closure
cross-check), `status-line1.mjs` (`ARCHIVE_INDEX` 3 -> 2), `gate-caller-audit.mjs`,
`findings-state-guard.mjs`, `row-quote-currency.mjs`, `stale-ready-for-gates-guard.mjs`,
`ghost-ladder-row-guard.mjs`, `ruling-propagation-guard.mjs`, `blocker-panel-closed-guard.mjs`,
`stale-open-candidates.mjs`, `desk-surface-blindspot-probe.mjs`, `desk-birth-guard.mjs` (pathspec),
`dashboard-gen.sh` (both greps, via `cat ... | grep` so no filename prefix reaches the panel text).

Where a reader prints a coordinate it now iterates the corpus PER FILE and prints the bare line
number for `tasks/BACKLOG.md` (so today's output is byte-identical) and `<rel>:<n>` for a split
part. Numbering a joined corpus would have minted a Ghost Line (Mistake #5) inside the cure.

**Law text (one clause each):** `scripts/fire.md` §4's handoff line now names `archive/status/` as
where the closed months live; `.claude/skills/author-task/SKILL.md`'s BACKLOG-grep sentence now
names `tasks/backlog/**`.

**`package.json`:** the two new tests added to the `test:node-guards` roster, beside
`blocker-panel-closed-guard.test.mjs`.

**`findings-state-guard.mjs`** gained one `export` keyword on `rowState` — the ledger's ONE
definition of "closed", which `backlog-split-closed.mjs` now calls rather than re-deriving
(F-1261-1). The function body is unchanged.

`scripts/citation-title-guard.mjs` needed **no** change: its corpus is `git ls-files tasks` filtered
to `.md`, which picks up `tasks/backlog/**` the moment the drain tracks it. Only its baseline moves.

### Findings
* **F-LS1-1** (CURED HERE) — the proportional baseline allocation redded `citation-title-guard` on
  two straddling keys. See §2.
* **F-LS1-2** (CURED HERE for the two new tools; REPORTED elsewhere) — the
  `import.meta.url === pathToFileURL(process.argv[1]).href` main-guard idiom this repo uses is wrong
  under a **symlinked** path: node resolves the entry point through `realpath` while `argv[1]` keeps
  the caller's spelling, so a tool run from a macOS `mkdtemp` (`/var/folders/...`, where `/var` is a
  symlink to `/private/var`) never ran `main()` and **exited 0 having printed nothing** — a silent
  no-op wearing the shape of success, Mistake #1 arriving through a path idiom. Caught by a
  manufactured-defect arm that expected rc 2 and got rc 0. Both new tools now `realpathSync` both
  sides. The same latent shape exists in at least `scripts/stale-ready-for-gates-guard.mjs` and
  `scripts/ruling-propagation-guard.mjs`; NOT fixed — outside this task's firewall, and harmless
  while those guards are only ever invoked by their real path.
* **F-LS1-3** (CURED HERE) — `status-rotate-month`'s stamp zone must be ANCHORED to the head of the
  bullet body, not a free search of the first N characters. A real bullet whose body opens "THE
  OWNER RULED ON 2026-07-25 ..." was filed under July while its session neighbours put it in
  August; widening the window from 200 to 60 chars did not fix it, and only the anchored form
  (`Last updated: ` and/or `ACTIVE ` then the date, and nothing else) does. Caught by the tool's own
  test before it ever ran on the board. On today's board the anchored form re-routes 2 bullets from
  `stamp` to `session-neighbour` and changes no destination.

* **F-LS1-4** (CURED HERE) — `source-pointer-guard` caught my own rot. The archive-corpus read in
  `status-archive-audit.mjs` landed ABOVE the two members of an F-1690-2 comment's cited range, so
  `` `kind` `` moved 274 -> 322 and the print it names moved 407 -> 459. The guard flagged the
  FIRST pointer only — "a range is two pointers and only one of them is guarded", which is exactly
  what that comment's own note (written at s2674, the fourth such move) predicts. Both were
  re-based by RE-GREPPING **after** writing the note that records the fifth move, and the patch
  re-measures and refuses rather than trusting a remembered delta. `source-pointer-guard` rc 0.
* **F-LS1-5** (CURED HERE) — `gate-caller-audit.test.mjs` broke on my second relative import, and
  it broke SILENTLY-SHAPED: three of its fixtures write a mutant of `gate-caller-audit.mjs` into a
  bare `mkdtemp` and each hand-copied ONE dependency by name. Adding `./ledger-corpus.mjs` gave all
  three `ERR_MODULE_NOT_FOUND`, and **five arms failed in BOTH batteries** while asserting a regex
  over the subject's output — a mutant that cannot load prints a stack trace, which matches no
  expectation and is indistinguishable at a glance from a guard with no teeth. That is F-2672-2
  again, and a hand-list of one member certifies the rest as clean (F-2358-1). The three sites now
  DERIVE the local modules from the source, recursively, and assert each one exists rather than
  skipping it. 45/45 green.

## 8. READ-FIRST drift

* The master's item 4 names `scripts/dry-board-advisory-guard.test.mjs`; the file is
  **`scripts/dry-board-advisory-prescription-guard.test.mjs`** (the name in the `test:ledger-guards`
  roster). Located by name and run; 32/32 green together with `law-bash-prescription-guard.test.mjs`.
* `docs/ledger-shape-reader-map-2026-09-24.md` was measured at `cdfca600c`; this branch is at
  `c0e15c901`, so the corpus has grown. Re-measured here: STATUS.md 4,422 lines / 20,555,947 B /
  **3,314** archive bullets (map: 4,409 / 20,496,878 / 3,179) plus 18 law bullets; the
  `# Task backlog` H1 is at line **2935** (map: 2915). Every access pattern the map quoted was
  verified in source before it was changed.
* Every reader the map named as fail-open was widened, plus `desk-surface-blindspot-probe.mjs`
  (a probe, in no battery). `master-shipped-classifier.mjs` and `task-guard-audit.mjs` were read and
  confirmed SAFE unchanged: both filter `readdirSync(tasks)` on `.endsWith('.md')`, which the
  directory entry `backlog` fails, so the subdirectory is invisible to them — the map's reason for
  requiring a subdirectory rather than flat siblings.

## 8b. Commit hashes

```
17baae095 chore: ledger-shape-1 — re-base the F-1690-2 comment's two pointers after the corpus read moved them
44b5789bc chore: ledger-shape-1 — the law text names archive/status/ and tasks/backlog/**
686d34465 chore: ledger-shape-1 — the two move tools, one shared ledger corpus, and every reader taught the split shape
(the report commit follows this list)
```

## 9. REMAINING LIST IN ORDER

1. (drain) run the two `--apply` commands of §6 on fresh main with the fires held, in one commit.
2. (drain) after that commit, re-run `npm run test:ledger-guards` and
   `node scripts/status-archive-audit.mjs --limit 40 --quiet` on the MOVED tree. The scratch proves
   every reader green against the moved shape, but the batteries themselves have only ever run
   against the unmoved one.
3. (drain, cosmetic, worth one line in the review so nobody reads it as a regression)
   `citation-title-guard`'s `NOT GATED` advisory changes after the move: on the scratch it read
   `159 citation(s) in 3 tracked .md outside tasks/ — largest archive/status/2026-08.md (74)` where
   before it read `... in 1 tracked .md — largest STATUS.md (159)`. Same total, different largest
   file. `nul-audit`'s tracked-file count also grows by 20 files, with no NUL bytes in any of them.
4. (drain) confirm on main that the two remaining battery reds clear: they are the
   linked-worktree refusal of `desk-declaration-guard` and the `fixture-teardown` cascade it
   feeds. Both are structural to running the batteries from `wt-ls1`; if either survives on main
   it is NOT this branch and wants its own finding.
5. (follow-up, outside this firewall) F-LS1-2's symlink-fragile main-guard idiom in
   `stale-ready-for-gates-guard.mjs` and `ruling-propagation-guard.mjs`.

READY-FOR-GATES
