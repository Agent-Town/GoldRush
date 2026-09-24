# evidence-offload-1 — the tools, the tests, the index format and the DRY-RUN PLAN

**Task:** `tasks/evidence-offload-1.md` (owner ruling 2026-09-24, item 14, option (a), verbatim:
"Evidence goes to the existing archive repository with an index and small previews in the tree, plus
a size budget per landing").
**Worktree:** `/Users/robin/Claude/Projects/wt-eo1` · **Branch:** `chore/evidence-offload-1` ·
**Base:** `39acd87471960d7489f87dbc58f55b7e35757c69` · **Implementer:** Claude Opus 5, attended
scratch worktree, 2026-09-25.

**NOTHING UNDER `artifacts/**` MOVED ON THIS BRANCH** except this report directory. `--apply` was
exercised only against a fixture repository with a bare fake archive remote in a `mktemp -d`
directory, and the tool REFUSES a worktree pointing at the real `archive` remote unless
`--drain-authorized` is passed. No remote was fetched, pushed or cloned. No deploy. The attended
drain executes the first offload on fresh main with the fires held and does every push.

## Pre-flight (as the master wrote it)

| Check | Result |
| --- | --- |
| `git status --short` modified tracked files outside `logs/**`, `artifacts/**`, `reviews/shots-*`, `*.png` | none (only `?? node_modules`, the symlink) |
| `git log main..HEAD --oneline` | empty |
| `npm run build` before any edit | rc 0 |

## Scope, item by item, with the measurement

### 1. The must-stay set is code, not memory — `scripts/evidence-readers.mjs`

Scans `scripts/**/*.mjs`, `e2e/**/*.ts`, `src/**`, `vite.config.ts`, `package.json` and
`.claude/skills/*/SKILL.md` for `artifacts/…` literals and classifies each by the call that surrounds
it (13 read forms, 9 write forms). Code is parsed with `typescript`, not scanned with a regex — see
F-EO1-2. Exports `mustStay(path)` and `mustStayPredicate(derivation)`.

Measured on the branch tip (full output: `artifacts/evidence-offload-1/readers.txt`):

```
literals     : 547 artifacts/ literal(s) in the scan space
               360 read · 99 write · 88 unclassified outside a test
               333 unclassified INSIDE a test, kept must-stay (F-2212-1 polarity)
unresolved   : 197 literal(s) match nothing tracked (fixture paths; they pin nothing)
patterns     : 322 must-stay pattern(s)
tracked      : 26345 file(s) under artifacts/
MUST STAY    : 5959 file(s) 1040.9 MB  ·  MOVABLE 20386 file(s) 7616.2 MB
in §A4 but NOT derived : none
```

The pins the master names, all VERIFIED by `scripts/evidence-readers.test.mjs` (17/17):

| Probe | Verdict |
| --- | --- |
| every one of §A4's 28 Class 1 subtrees | MUST-STAY |
| `artifacts/sol/map-art-campaign-2/run-6/the-claim/capture-config.json` | MUST-STAY (by PATTERN; the file does not exist on the tree, F-EO1-1) |
| `artifacts/sol/map-art-campaign-2/run-8/phone-hud/{before,after}.json` | MUST-STAY |
| `artifacts/sol/map-art-campaign-2/report.md`, and every `artifacts/**/report.md` (318 of them) | MUST-STAY |
| `artifacts/sol/map-art-campaign-2` as a subtree | movable (959 `run-3` files, 0 must-stay among them) |
| `artifacts/ARCHIVE-INDEX.json` | MUST-STAY by declaration (`ALWAYS_KEEP`) |

### 2. `scripts/evidence-offload.mjs`

`--plan` lists movable subtrees largest first with bytes, file counts, keep lists and the reviews
citing them. `--apply <subtree>…` copies each into a worktree of the private `archive` remote on
branch `evidence` under `evidence/<path>/`, commits there in slices no larger than 1.5 GB with no blob
over 95 MB, **verifies every path and byte size inside the archive commit**, then writes
`artifacts/ARCHIVE-INDEX.json`, one 320 px `PREVIEW.png` per moved subtree and a one-line
`ARCHIVED.md`, and removes the moved files from git AND disk in the SAME commit. It never pushes,
never fetches when given a prepared worktree, and never touches any `report.md`.

Refusals, each exercised: a `mustStay()` subtree · a dirty archive worktree · the real `archive`
remote without `--drain-authorized` (and the remote URL is never printed) · a missing
`--archive-worktree` · a modified tracked file under the subtree · a directory whose every file must
stay · a blob ceiling that would leave nothing to move.

The archive remote is resolved by the same lookup `scripts/fire-memory-mirror.mjs` already uses
(`GR_ARCHIVE_REMOTE`, else `git remote get-url archive`); the URL is never printed or logged.

### 3. The audits learn ARCHIVED

`review-evidence-audit.mjs` gains an `ARCHIVED` bucket resolved against the index, ordered
**tracked-file → ARCHIVED → tracked-directory → on-disk → absent** so a KEPT file inside an archived
subtree still reads `TRACKED` while the subtree itself reads `ARCHIVED`. `--strict` still reds only on
`ON-DISK-UNTRACKED`. `modified-tracked-evidence-census.mjs` gains `SAFE (archive <commit12>)` and
prints how many SAFE rows are SAFE-by-archive. Both DECLARE the index on every run in BOTH states, and
both are indifferent to its absence, malformation or emptiness.

`node scripts/review-evidence-audit.mjs --all`, before and after (before = `git show
HEAD:scripts/review-evidence-audit.mjs` run against the same tree):

```
BEFORE  paths=1205 citations=2129 TRACKED=912 ON-DISK-UNTRACKED=0 ABSENT=656 SKIPPED=561
AFTER   paths=1205 citations=2129 TRACKED=912 ON-DISK-UNTRACKED=0 ABSENT=656 SKIPPED=561 ARCHIVED=0
```

IDENTICAL, as the master requires: no index exists yet, so nothing can resolve as ARCHIVED.
`modified-tracked-evidence-census.mjs` on the same tree: 46 worktrees, 73 subjects, AT RISK 66 /
70.1 MB, SAFE 7 / 9.0 MB, `of which ARCHIVE 0 file(s) — none offloaded`, rc 0.

### 4. The budget

`scripts/evidence-budget.mjs <base> <tip>` sums the tracked bytes a landing ADDS under `artifacts/`
and `reviews/shots-*` (new blobs plus the growth of modified ones) and exits 1 over a ceiling —
40 MB by default, from `scripts/evidence-budget-baseline.json`, overridable with `--limit`. A deletion
is reported and NEVER credited: a drain cannot delete a gigabyte of someone else's evidence to make
room for its own screenshots. `--total` judges the whole tracked `artifacts/` tree against the ceiling
the drain banks after the first offload; while that ceiling is `null` it reports and exits 0, because
a budget nobody has set must not refuse a drain.

`scripts/evidence-budget-baseline.json` carries `perLandingLimitBytes`, `prefixes` and a
`totalArtifacts` block whose `setBy` names the drain and the exact banking recipe, plus a
`measuredBefore` record (8,657,137,147 B / 26,345 files at `39acd8747`) so the first offload's cut is
checkable rather than claimed. `scripts/evidence-budget.test.mjs` (14/14) pins the file's shape,
REPORTS the current total, and exercises the comparator on fixtures in BOTH directions so the unbanked
live state cannot hide a comparator that never reds.

`.claude/skills/drain/SKILL.md` §3 gained exactly one line:

```
node scripts/evidence-budget.mjs <base hash> HEAD                     # owner 14a size budget: 40 MB of new artifacts/ + reviews/shots-* per landing, and the tree under its banked ceiling
```

### 5. Tests, on the `test:node-guards` roster

`scripts/evidence-readers.test.mjs` (17) · `scripts/evidence-offload.test.mjs` (16) ·
`scripts/evidence-archive-buckets.test.mjs` (10) · `scripts/evidence-budget.test.mjs` (14), 57 in all.
Added to `package.json` `test:node-guards` inside the `run-node-guards.mjs` list (the main battery,
which carries the watchdog), not the npm-append tail.

The audits' new buckets are tested in a NEW file rather than inside `review-evidence-audit.test.mjs`
and `modified-tracked-evidence-census-guard.test.mjs`: those two carry their own baselines and lineage
and are not on this task's TOUCH-ONLY list, so the firewall stays narrow.

## The plan for the tree (`--plan`, full output in `artifacts/evidence-offload-1/plan.txt`)

```
tracked under artifacts/ : 26345 file(s) 8657.1 MB across 707 subtree(s)
MUST STAY                : 5959 file(s) 1040.9 MB
MOVABLE                  : 20386 file(s) 7616.2 MB across 493 subtree(s)
oversize left in place   : 0 blob(s) over 95.0 MB
```

Measured at `44a71093e`, one commit before this report existed. Re-measured at the report commit the
figures read 26,350 / 8,657.2 MB tracked, must-stay 5,960 / 1,041.0 MB, movable 20,390 / 7,616.3 MB
across 494 subtrees: this report directory itself is +5 files, its own `report.md` joining the
must-stay set by the same law that keeps every other one, and its four evidence files joining the
movable tail. Recorded rather than rounded away, because a plan that cannot account for its own
report is a plan nobody should trust with 7.6 GB.

| movable | files | keep | citations / reviews | subtree |
| ---: | ---: | ---: | --- | --- |
| 5878.2 MB | 10323 | 19 | 41 in 8 | `artifacts/sol/map-art-campaign-2` |
| 344.7 MB | 327 | 0 | 0 in 0 | `artifacts/map-art-inventory-20260908` |
| 173.9 MB | 1105 | 0 | 5 in 2 | `artifacts/gauntlet-heat14-e3949bfa` |
| 157.6 MB | 105 | 1 | 3 in 1 | `artifacts/needs-cells-art-batch` |
| 104.3 MB | 873 | 0 | 3 in 3 | `artifacts/gauntlet-heat13-569a41f9` |
| 97.0 MB | 570 | 0 | 20 in 7 | `artifacts/boss-fidelity` |
| 75.6 MB | 439 | 0 | 0 in 0 | `artifacts/heat13` |
| 65.9 MB | 142 | 1 | 2 in 1 | `artifacts/post-open-maps-correctives` |
| 40.4 MB | 145 | 0 | 193 in 13 | `artifacts/map-rebuild-spike` |
| 40.2 MB | 82 | 1 | 0 in 0 | `artifacts/asset-diet-explicit-manifest-2` |
| 35.3 MB | 72 | 0 | 2 in 1 | `artifacts/needs-cells-codex-strips` |
| 34.5 MB | 31 | 0 | 1 in 1 | `artifacts/boss-art-fidelity-2026-09-08` |
| 29.2 MB | 123 | 0 | 2 in 1 | `artifacts/relay-valley-winnable` |
| 27.4 MB | 103 | 1 | 2 in 1 | `artifacts/sprite-roster-remainder` |
| 26.3 MB | 61 | 1 | 2 in 1 | `artifacts/open-maps-art-blackout-fairground` |
| … | … | … | … | 453 more subtrees: 205.8 MB / 3890 files (the long tail) |

Two subtrees the master's expected first batch names are **NOT** candidates — `artifacts/perf-survey`
and `artifacts/landmark-lighting-calibration`, 214.3 MB together. See F-EO1-3.
`artifacts/gauntlet-heat11-20260903` (131.8 MB) and `artifacts/gauntlet-heat12-20260905` (56.0 MB) are
§A4 Class 1 and correctly stay.

## What the scan found that the reader map did not

§A4's Class 1 list is 28 subtrees; the derivation produces 322 patterns over 308 additional subtrees.
The bulk are **Class 2 write targets**, which §A4 lists by SCRIPT NAME rather than by `artifacts/` path
(`e2e/beauty-town.rig.ts` → `artifacts/beauty-town`, 66 files; `e2e/entry-params.spec.ts` →
`artifacts/ux-entry-robustness-1`, 58 files; and so on) plus 333 literals in tests whose surrounding
call this scan cannot classify and therefore KEEPS. The net effect is must-stay 1,040.9 MB against
§A4's "about 480 MB", and movable 7,616.2 MB against §3's "about 7.6 GB" — the map's movable figure is
confirmed to three significant figures.

The largest single items §A4's Class 1 list does not name: `artifacts/perf-survey` (826 files),
`artifacts/playability-smoke` (177), `artifacts/landmark-lighting-calibration` (112),
`artifacts/lantern-true-world-2` (75), `artifacts/beauty-town` (66),
`artifacts/prefetch-bounded-warming` (65), `artifacts/sol/open-findings` (61),
`artifacts/sol/wave-lane-b` (58).

Two premises re-verified before the tools were written, both by reading the code: `ENGINE_SOURCE_INPUTS`
in `scripts/assay-replay-agent.mjs` carries no `artifacts/` path (the closest is
`assets/pilots/map-rebuild-spike`, which is NOT `artifacts/map-rebuild-spike`; and there are no
symlinks anywhere under `artifacts/`), so the offload cannot move the engine hash, needs no re-assay
and no era pin; and `scripts/deploy.sh`'s only live `artifacts/` reference is
`artifacts/asset-diet/town-transfer-$project.json`, whose subtree is must-stay.

## The fixture `--apply` proof

Full transcript: `artifacts/evidence-offload-1/fixture-apply-transcript.txt` (a repo, a bare
`git init --bare` remote and a prepared archive worktree, all inside one `mktemp -d`; source PNG by
`sharp`). Key measured lines, run at `--max-blob 1000000 --slice-bytes 500000` so both ceilings fire:

```
artifacts/movable: 4 movable file(s) 1.2 MB · 1 kept · 1 oversize left in place · 3 slice(s)
  slice 1/3  1b52382e4bce  1 file(s) 0.4 MB  VERIFIED in the archive commit
  slice 2/3  e0293c861855  2 file(s) 0.4 MB  VERIFIED in the archive commit
  slice 3/3  1d7b63edfd61  1 file(s) 0.4 MB  VERIFIED in the archive commit
  pointer artifacts/movable/ARCHIVED.md · preview artifacts/movable/PREVIEW.png from artifacts/movable/board.png
repo commit 818e533c1fd4… — files gone from git AND disk, index and pointers in the same commit
```

| Property | Evidence |
| --- | --- |
| plan | 7 tracked / 5.2 MB, MUST STAY 2, MOVABLE 5 across 1 subtree, 3 citations in 1 review |
| index written | 1 subtree entry (3 archive commits, 4 files, 1,215,327 B, kept `report.md`, oversize `huge.bin`) plus 4 per-file entries each with `archiveCommit`, `sha256`, `bytes`, `movedDate` |
| preview made | `PREVIEW.png` 320x200, 524 B, from `board.png` (1280x800) |
| gone from git | `git ls-files artifacts/movable` = `ARCHIVED.md`, `PREVIEW.png`, `huge.bin`, `report.md` |
| gone from disk | the same four files and no others; working tree clean |
| in the archive | `evidence/artifacts/movable/{a.txt,b.txt,board.png,nested/c.txt}` on `refs/heads/evidence`, 3 commits |
| one commit | `818e533c` — 3 deletions plus index plus pointer plus preview, `chore:` prefix |
| refusal 1 | must-stay subtree: rc 1, `REFUSING — artifacts/keep-tree is MUST-STAY` |
| refusal 2 | dirty archive worktree: rc 1, `REFUSING — the archive worktree is dirty (1 path(s))` |
| slice limit | 3 commits under a 500,000 B ceiling; the test also proves 4 or more under a tighter one |
| blob limit | `huge.bin` (4,000,001 B) left tracked and on disk, listed in `oversizeLeftInPlace`, absent from `index.files` |
| audit after | `paths=1 citations=3 TRACKED=0 ON-DISK-UNTRACKED=0 ABSENT=0 SKIPPED=0 ARCHIVED=3`, `--strict` rc 0 |
| audit with the index removed | `TRACKED=1 ABSENT=2 ARCHIVED=0` — exactly the blindness §A5 predicted, which is why the index is declared on every run |

## THE DRAIN COMMAND LIST, IN ORDER

Run by the attended session on FRESH main, holding the STATUS line-1 lock. `$ARCH` is a throwaway
directory. Nothing here is for a fire (the master's gate-side hold).

```bash
# 0. HOLD THE FIRES. tasks/.fire.lock is fire-runner.sh's single-instance mkdir lock (scripts/
#    fire-runner.sh, the "single instance" block): while it exists and is under 50 minutes old,
#    every tick exits silently before any model call.
cd "/Users/robin/Claude/Projects/Gold Rush"
mkdir -p tasks/.fire.lock && touch tasks/.fire.lock     # re-touch before every long step below
head -1 STATUS.md                                       # confirm YOU hold the lock (CLAUDE.md §1)
git status --short | grep -v '^??'                      # must be empty apart from logs/**

# 1. MERGE AND GATE THE BRANCH in a detached worktree, then fast-forward main (/drain §2, §3).
#    tsc, build, the full battery and the four new tests run THERE; only then does main move.

# 2. PREPARE THE ARCHIVE WORKTREE. The one networked read of the whole operation.
ARCH=$(mktemp -d /tmp/gr-archive-evidence.XXXXXX)
git init -q "$ARCH"
git -C "$ARCH" remote add origin "$(git remote get-url archive)"   # never echo this URL
git -C "$ARCH" config user.name  'Gold Rush factory'
git -C "$ARCH" config user.email factory@agenttown.app
git -C "$ARCH" fetch -q origin evidence && git -C "$ARCH" checkout -q -B evidence FETCH_HEAD \
  || git -C "$ARCH" checkout -q --orphan evidence
git -C "$ARCH" status --porcelain                                 # must be empty; the tool refuses otherwise

# 3. THE PLAN on the merged tree. Read it before moving anything.
node scripts/evidence-offload.mjs --plan --limit 60 | tee artifacts/evidence-offload-1/plan-drain.txt

# 4. APPLY IN SLICES, SMALLEST FIRST, PUSHING AFTER EACH CALL. Each push must stay under 2 GB
#    (GitHub's limit), so the campaign goes one run-N at a time and the 1.5 GB slice ceiling keeps
#    every single commit inside it. Re-touch tasks/.fire.lock between calls.
for S in artifacts/map-art-inventory-20260908 artifacts/gauntlet-heat14-e3949bfa \
         artifacts/needs-cells-art-batch artifacts/gauntlet-heat13-569a41f9 \
         artifacts/boss-fidelity artifacts/heat13 artifacts/post-open-maps-correctives \
         artifacts/map-rebuild-spike artifacts/asset-diet-explicit-manifest-2; do
  node scripts/evidence-offload.mjs --apply "$S" --archive-worktree "$ARCH" --drain-authorized
  git -C "$ARCH" push origin evidence:evidence
  touch tasks/.fire.lock
done
# then the campaign, ONE run at a time (5878.2 MB total; never in one call):
for S in $(git ls-files -- 'artifacts/sol/map-art-campaign-2/run-*' | cut -d/ -f1-4 | sort -u); do
  node scripts/evidence-offload.mjs --apply "$S" --archive-worktree "$ARCH" --drain-authorized
  git -C "$ARCH" push origin evidence:evidence
  touch tasks/.fire.lock
done
# finally the campaign's remaining loose files (its 19 keeps stay by themselves):
node scripts/evidence-offload.mjs --apply artifacts/sol/map-art-campaign-2 \
  --archive-worktree "$ARCH" --drain-authorized
git -C "$ARCH" push origin evidence:evidence

# 5. THE AUDITS, on the offloaded tree. ARCHIVED must absorb what ABSENT used to hold, and
#    ON-DISK-UNTRACKED must stay 0 — that is the whole point of one-commit removal.
node scripts/review-evidence-audit.mjs --all --strict      # rc 0; ARCHIVED > 0, ABSENT 656 or lower
node scripts/modified-tracked-evidence-census.mjs          # "of which ARCHIVE" now non-zero
node scripts/evidence-readers.mjs --map-diff               # "in §A4 but NOT derived : none" still

# 6. BANK THE BUDGET CEILING (the baseline's own setBy carries this recipe).
node scripts/evidence-budget.mjs --total                   # read the new total
#    edit scripts/evidence-budget-baseline.json: ceilingBytes = total + 25% headroom,
#    bankedBytes/bankedFiles = the measurement, commit = the offload commit, measuredAt = today
node scripts/evidence-budget.mjs --total                   # must now PASS against the ceiling
GR_GUARD_NO_ARTIFACT=1 node --test scripts/evidence-budget.test.mjs

# 7. COMMIT, PUSH, BOOKKEEP.
GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards            # full battery on main after the ff
git add -- scripts/evidence-budget-baseline.json reviews/<slice>.md tasks/goals.json tasks/BACKLOG.md
git commit -m 'chore: bank the evidence ceiling after the first offload'
git push origin main                                       # BACKUP LAW
npm run test:ledger-guards                                 # last act of a ledger-writing drain

# 8. RELEASE THE FIRES.
rmdir tasks/.fire.lock
```

No deploy step: `deploy.sh`'s `MIRROR_FILTERS` carries no `artifacts/` include and
`ENGINE_SOURCE_INPUTS` no `artifacts/` path, so nothing about the runtime, the engine hash or the era
pin changes. Verified by reading both, not inherited.

## Gate evidence on the branch

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0 |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` (final, on the branch tip) | **1018 tests · 1012 pass · 1 fail · 5 skipped · 0 cancelled**, the single fail attributed below |
| `node scripts/law-pointer-guard.mjs` | rc 0 — surfaces 7, 0 rotten pointers, instruments 32 resolved / 0 dead (was 31 / 0) |
| `GR_GUARD_NO_ARTIFACT=1 node --test scripts/skillmd-guard.test.mjs` | 19/19 |
| `node scripts/gate-caller-audit.mjs` | PASS, unrouted 0 |
| the four new tests | 57/57 (17 + 16 + 10 + 14) |
| `review-evidence-audit.test.mjs` + its scan-space and crash-exit guards | 20/20 |
| `modified-tracked-evidence-census-guard.test.mjs` | 22/22 |
| `law-pointer-guard.test.mjs` + `gate-caller-audit.test.mjs` + `citation-title-guard.test.mjs` | 85/85 |

The one battery red is `fixture-teardown.test.mjs`, and it is NOT this branch's: that guard runs every
test file as its own child under an ISOLATED `TMPDIR` and counts survivors PER FILE, so its own output
is the attribution. It names `scripts/status-line1-desk-displacement-guard.test.mjs` (10 survivors,
created fresh in this run's scratch) as the ONLY offender and reports `0 []` for all four new test
files. That file is untouched by this branch. F-EO1-5.

An earlier full run of the same battery (before the last two commits) read 1013 / 1006 / 2 with the
extra red in `node-guards-contention.test.mjs`; its log declared `CONTENDED — 2 concurrent batteries`
on line 1, the second battery was not this session's, and the guard alone on the same tree is 1/1
rc 0. The final run shows no contention at all. F-EO1-6.

## Findings

**F-EO1-1 — the reader map's "exactly three files" under the campaign is 19.** §A4 names
`run-6/<map>/capture-config.json` as one file; `scripts/phone-hud-entry-census.mjs` reads it through a
template, and the glob resolves to **16** real files. With the two `run-8/phone-hud` fixtures and
`report.md` the campaign's keep list is 19 paths, not 3. Also: `run-6/the-claim/capture-config.json`,
the example §A4 names, **does not exist on the tree** (the 16 maps are `e10-archive-world`,
`e10-ember-shore`, `e10-last-claim`, `e10-river`, `e4-boneyard`, `e6-glow-mesa`, `e6-half-life-hollow`,
`e6-picnic`, `e7-dead-band`, `e7-relay-rush`, `e8-far-side`, `e8-low-orbit`, `e9-devils-alley`,
`e9-dome-basin`, `e9-old-canal`, `e9-seed-run`). The predicate keeps the GLOB rather than its
expansion, so the master's pin holds and a map captured tomorrow is covered. Non-blocking; §A4's line
is a compression, not an error.

**F-EO1-2 — a regex tokeniser silently loses readers in this repo's own sources.** The first draft
scanned `.mjs` with a quote-matching regex and lost exactly four of §A4's Class 1 subtrees
(`e5-regatta-boat-03`, `gauntlet-heat5b-20260825`, `claude-debut-20260831`, `ledger-backups`), because
an apostrophe inside a prose comment ("a fire's own duty") opens a string that runs to the next
apostrophe and swallows every literal between them. This repo's comments are unusually long and
prose-heavy, so the failure is systematic, not incidental. Cured by parsing with `typescript` (the
`no-emdash-guard` precedent). A second silent defect in the same layer: the truncation regex could not
cross a newline, so a multi-line embedded-source literal minted a must-stay pattern named
`fs.writeFileSync('artifacts`. Both have hermetic regression arms.

**F-EO1-3 — 214.3 MB of the master's expected first batch is MUST-STAY under the derivation, and that
is an OWNER/DRAIN judgement, not a defect.** `artifacts/perf-survey` (141.5 MB, 826 files) is pinned by
`scripts/perf-survey/memory.mjs:54`, `page.screenshot({path: new
URL('../../artifacts/perf-survey/town-memory.png', import.meta.url).pathname})`;
`artifacts/landmark-lighting-calibration` (72.8 MB, 112 files) by `e2e/landmark-brightness.spec.ts:134`,
`const CALIBRATION_DIR = path.resolve('artifacts/landmark-lighting-calibration')`. Both are WRITE
targets — §A4 Class 2, which the map lists by script name rather than by `artifacts/` path — so the
directories must stay CREATABLE, but their existing CONTENTS are old evidence and could lawfully move.
The derivation keeps them because a false must-stay costs disk and a false movable costs a red gate on
somebody else's drain (F-2212-1). RECOMMENDATION for the drain or the owner: after the first offload
lands and the instruments are proven, move these two by naming their content subdirectories explicitly
(both scripts create their output directory with `recursive: true`, so nothing breaks), or leave the
214.3 MB and record the decision. Not done here: the master's scope is the tools, and widening
`mustStay` to distinguish "creatable" from "contents kept" is a design change.

**F-EO1-4 — a scan that reads its own source is a control that asserts itself.** The moment the
toolchain was committed, `scripts/evidence-readers.mjs` and the four test files entered their own scan
space: 23 patterns came from their fixture paths and from `MAP_CLASS1_SUBTREES` (the hand transcription
of §A4 kept as a CONTROL), must-stay went 5,959 to 16,893 files, and the 5.9 GB campaign became
must-stay because its path is the `CAMPAIGN` constant in its own test. The §A4 case would then have
passed on a scan that had stopped working entirely — F-2487-1's shape. Cured by `SELF_EXCLUDED`, six
files by name with a reason each, never a pattern (real readers DO live in `*.test.mjs`). Its teeth are
the existing case "the campaign is FILE-EXACT". Recorded because the same trap waits for any future
instrument that transcribes a control into the corpus it measures.

**F-EO1-5 — `scripts/status-line1-desk-displacement-guard.test.mjs` leaks every temp directory it
makes, and it is the sole red in `fixture-teardown.test.mjs`.** Line 81 calls
`mkdtempSync(join(tmpdir(), 's2673-desk-'))` and the file contains no `rmSync` and no `t.after`; **130**
stale `s2673-desk-*` directories were on disk at measurement time, and the guard's isolated child run
produced 10 more. OUTSIDE this task's firewall, so REPORTED and not fixed. Corrective, one line:
register the directory with `t.after(() => rmSync(dir, { recursive: true, force: true }))`, then sweep
the stale ones.

**F-EO1-6 — `node-guards-contention.test.mjs` reds under a concurrent battery, which is what it is
for.** An earlier battery log declared `CONTENDED — 2 concurrent batteries` on its FIRST line; the
second battery was not this session's. Control: the guard alone on the same tree, 1/1, rc 0. The final
battery run shows no contention and the guard passes inside it.

**F-EO1-7 — the index stamps `movedDate` in UTC.** `new Date().toISOString().slice(0,10)`, so the
fixture transcript reads `2026-09-24` while the session date is 2026-09-25. Not a defect; recorded so
nobody reads an `ARCHIVE-INDEX.json` date as a local one.

**F-EO1-8 — the blob ceiling will not fire on the first offload.** The largest tracked blob under
`artifacts/` is 40.0 MB (`sol/map-art-campaign-2/run-10/phone-hud/e2e-hud.json`), then 26.8 MB; zero
blobs exceed 95 MB. The arm is therefore exercised only by the fixture, deliberately, and the plan
prints `oversize left in place: 0` so the absence is visible rather than assumed.

**F-EO1-9 — the scan space omits `scripts/*.sh` and `ops/`, and it costs nothing today.** Audited all
four `artifacts/…` mentions in those families: `artifacts/asset-diet` and
`artifacts/asset-diet/town-transfer-$project.json` (`scripts/deploy.sh:189`, a live write target whose
subtree is must-stay anyway), `artifacts/first-town-payload-gate/` (`deploy.sh:238`, inside a COMMENT)
and `artifacts/s2671/repro-self-denominator.txt` (`ops/ledger-series-anchor.json`, prose, 0 tracked
files). No live shell reader would be severed. Widening the scan space to `*.sh` is a one-line change a
later task can make if a shell reader ever appears; leaving it narrow keeps the declared space exactly
what was measured.

## REMAINING LIST IN ORDER

1. **The drain executes "THE DRAIN COMMAND LIST"** above on fresh main with the fires held. That is the
   whole of the remaining work for this task; nothing on the branch is half-done.
2. **Bank the ceiling** in `scripts/evidence-budget-baseline.json` (step 6). Until then
   `evidence-budget --total` is advisory by design.
3. **F-EO1-3's 214.3 MB** (`perf-survey`, `landmark-lighting-calibration`): a drain or owner decision,
   after the instruments are proven on the first batch.
4. **F-EO1-5** (`status-line1-desk-displacement-guard.test.mjs` temp-dir leak): a one-line corrective
   outside this firewall, plus a sweep of the 130 stale directories.

READY-FOR-GATES

**Totals:** movable **7,616.2 MB / 20,386 files** across 493 subtrees; must-stay **1,040.9 MB / 5,959
files**; tracked evidence today **8,657.1 MB / 26,345 files** across 707 subtrees; 0 blobs over 95 MB.
**Beyond the reader map:** 308 additional must-stay subtrees (Class 2 write targets §A4 lists by script
name, plus 333 unclassifiable-in-a-test literals kept by the fail-safe polarity); the campaign's keep
list is 19 files rather than 3 and §A4's named example no longer exists (F-EO1-1); four §A4 subtrees are
invisible to any regex tokeniser of this repo's sources (F-EO1-2); two subtrees the master expected to
move are write targets and stay (F-EO1-3). **Drain command list:** the eight steps above — hold, gate,
prepare, plan, apply-and-push in slices, audits, bank, push, release.

**Commits:**

| Hash | What |
| --- | --- |
| `11d3feb9c59234beb74521921dfcb0aeb780a808` | the toolchain: `evidence-readers.mjs`, `evidence-offload.mjs`, `evidence-budget.mjs` plus its baseline, four test files, the `ARCHIVED` bucket and the `SAFE (archive …)` verdict, the `/drain` SKILL.md line, the `test:node-guards` roster |
| `c92868eef41572fddb12bdea35b4063103d9779f` | the reader scan excludes this feature's own files; `artifacts/ARCHIVE-INDEX.json` keeps itself |
| `44a71093e4cc1e71378f141ad1a26b793e855c45` | `--apply` takes any non-must-stay directory, so the drain can push between slices |
| the next commit | `artifacts/evidence-offload-1/**`: this report, `plan.txt`, `readers.txt`, `fixture-apply-transcript.txt`, `budget-total.txt` |
