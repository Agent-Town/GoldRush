# f1424-2-reject-visibly-in-the-janitor-queue

**Slice:** `lane-c-f1424-2-reject-visibly-in-the-janitor-queue.md` (FIRE-AUTHORED s1424)
**Branch / tip:** `lane/e2-arsenal` @ `a11d76cf`
**Merge-base:** `0894c23f`
**Merged to main:** `c84e6795f6c94e206f5aefa5afcc7c74cce97b20` (drained s1425)
**Gated in:** detached worktree `gate-s1425` at the lane tip (§3.0b — undecided content never entered main's working tree)

## Verdict

**MERGE.** Every scope item is present, the firewall held, and the two riders that
actually mattered — the manufactured RED and the law-pointer re-base — were
re-derived by this fire rather than read from the runner's report.

## What it does

`scripts/lane-runner-v3.sh`'s janitor queue dispatches on `case "$op" in`. Its
unknown-op fall-through printed `[janitor] unknown op … — ignored` and then fell
through to the shared `mv`, which files the request as
`janitor-<epoch>-<basename>` — **the byte-identical name a successful refresh gets
at the very same line.** Once in `tasks/done/`, a request that refreshed nothing
was indistinguishable from one that reset a lane, and `tasks/done/` is exactly what
a later fire reads to answer *"was this lane refreshed?"*. s1424 measured the blast
radius by parsing all 66 archived requests the way `:138` does: **7 of 66 (10.6%)**
had been consumed having done nothing.

The cure is visibility, not a wider parser (Mistake #14 — the two-line contract is
stated at `:134`, and teaching the parser to accept whatever shape an author invents
next would bless the mistake instead of teaching it). Rejections now land as
`janitor-REJECTED-<epoch>-<basename>` and the runner echoes the offending first line
plus the contract in one clause. Consuming is unchanged and still correct: a
malformed file never becomes well-formed by retrying.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green, 1.08 s |
| `test:node-guards` | **275 tests / 272 pass / 0 fail / 3 skipped** — the 3 are the known F-1408-2 fire-shell cross-engine skips, which self-document as "NOT coverage". Matches the s1424 baseline exactly. |
| `test:ledger-guards` | **42/42** on the `node --test` leg, plus findings-state · blocker-panel · ruling-propagation · citations · desk-declaration · status-archive-audit · attended-owed-audit · `main-lock-gate-guard.test.sh` · **the new `janitor-request-rejection.test.sh`** — all PASS |
| `bash -n scripts/lane-runner-v3.sh` | clean |
| Firewall: `git diff --stat main -- src e2e` | **EMPTY** |
| Landed content vs lane tip | `git diff --cached a11d76cf` **EMPTY** on all five paths |
| Playwright | **none run, and none required** — zero rendering surface, zero `src`/`e2e` bytes. Stated rather than omitted. |

### The RED was manufactured here, not inherited

A guard observed only green is not evidence about the red (the s1299/s1300 standard).
Reverting **only** `scripts/lane-runner-v3.sh` to main's version in the gate worktree
and re-running the new guard gives **rc 1**:

```
FAIL: YAML-ish request was filed as REJECTED
FAIL: single-line request was filed as REJECTED
FAIL: YAML-ish request has no success filename
FAIL: single-line request has no success filename
FAIL: YAML-ish rejection quotes the offending first line
FAIL: single-line rejection quotes the offending first line
FAIL: rejection output states the two-line contract
janitor request handling is WRONG — see failures above
```

⚠️ **Seven failures here; the runner's report pasted five.** The two extra are the
`has no success filename` assertions. The difference runs in the safe direction —
this fire's independent RED is *stricter* than the one claimed — but it is recorded
because a report that under-states its own red is the same shape as F-1424-4's
under-reporting green, filed one fire earlier.

### The guard is non-vacuous by construction

Worth naming, because it is better than the master asked for: the test **extracts the
real janitor block out of `lane-runner-v3.sh` with `awk`** and runs it against
throwaway fixture trees, rather than re-implementing the dispatch. Its own header
says why — *"A copy of the dispatch logic would stay green while the runner
regressed."* It also exits **2** (misuse, distinct from failure) if the extraction
does not find `case "$op" in` and `tasks/done/`, so a future refactor that moves the
block fails loudly instead of silently testing nothing.

Its `z-valid` case answers the one real correctness question the diff raises:
`archive_prefix` is set inside the `*)` arm and `unset` after the `mv`, so a
*successful* request processed after a rejected one **in the same cycle** must not
inherit the marker. The fixture queues `yaml.req`, `one-line.req` and `z-valid.req`
together and asserts both directions. It holds.

### Law pointers: verified by reading, not by trusting `--update`

CLAUDE.md §4.10b cites two coordinates inside this file, and the master warned that
this exact region has rotted them **three times, twice from precisely this kind of
edit**. The net insertion is +1 line, so `:168 → :169` and `:170 → :171`. Read from
the merged file:

- `:169` — `find "$ROOT/.git" -maxdepth 2 \( -name '*.stale*' -o -name 'tmp_obj_*' \) -type f -delete` ✓ the git-scratch sweep, deliberately left alone
- `:171` — `# It was: find "$ROOT/tasks/runs" -name '*.log' -mtime +3 -delete 2>/dev/null` ✓ the **commented DO-NOT-RESTORE epitaph, intact**

**No RETENTION LAW violation:** the prune remains present only as a comment.
The baseline diff **against main** is exactly those two coordinate updates, with both
fingerprints (`8c859fddc1a9`, `48544d0754ff`) unchanged.

## Merge classification

Base `0894c23f`. `git diff --stat 0894c23f main` over the five paths is **empty** —
main had not moved on any of them — so every path is **LANE-TOUCHED-only**, landed
byte-identical to `a11d76cf`. No 3-way, no conflict surface.

`CLAUDE.md` · `package.json` · `scripts/lane-runner-v3.sh` ·
`scripts/law-pointer-baseline.json` · `scripts/janitor-request-rejection.test.sh` (new).

Main's working tree carried the usual `logs/` + `artifacts/` churn throughout; none
of it was staged.

## Findings

**F-1425-1 (🟢 non-blocking, authoring gap — no corrective task owed).** The master's
TOUCH-ONLY list names `lane-runner-v3.sh`, the new guard, `package.json` and
`CLAUDE.md` — but **not `scripts/law-pointer-baseline.json`**, which scope 4
nevertheless requires the runner to write by ordering `law-pointer-guard.mjs
--update`. The runner did exactly what it was told; the firewall list simply did not
enumerate a file its own scope mandates. The edit is verified correct above, so
nothing is owed here beyond the note: **a TOUCH-ONLY list must include every file the
scope's prescribed commands write, or the drain's firewall check becomes ambiguous
precisely where it should be sharpest.**

**Recorded, not a finding — a trap this drain nearly fell into.** The run log's own
diff of `law-pointer-baseline.json` shows an *added* entry
(`e1-hold-the-claim-defeat-fork -> src/game/Game.ts:6664`) that appears nowhere in
the diff against main. It is an artefact of the log diffing against the lane's
**stale base** (`7fad37b7`), not against `main` — main had already absorbed that
entry. Read from the run log alone it looks exactly like `--update` silently
baselining away an unrelated pointer, i.e. the one thing the master forbade. It is
not. *Absorbed content and unabsorbed content read identically until you pick the
right base.*
