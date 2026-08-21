# Gate-worktree salvage — s2148

**Slice:** fire-side ops corrective (no lane, no drain). **Tree:** main at `7622369f3`.
**Verdict:** SALVAGED 2 files · DISCARDED 16 as churn/already-preserved · 4 gate worktrees removed.

## What this does

s2147 read the seven abandoned gate worktrees, removed 3 that held nothing, and left 4 that "hold evidence",
naming `gate-s2091`'s content as the untracked one. This fire re-measured that set **by blob hash** rather than
by `git status` letter, and the classification inverts.

## F-2148-1 — a ` M` status letter hides bytes that are in NO object database

`git status` reports a tracked-name file as ` M`. The **name** is in git; the **bytes** need not be.
Reading the letter says "tracked, therefore safe" — and that is false for every one of the 13 ` M` files here.

Measured with `git hash-object` on the disk file, then `git cat-file -e` against the shared object database:

| worktree | files | bytes in object DB | at risk |
|---|---|---|---|
| gate-s1689 | 2 (` M`) | 0 of 2 | **2** |
| gate-s2091 | 5 (`??`) | 4 of 5 | **1** |
| gate-s2126 | 3 (` M`) | 0 of 3 | **3** |
| gate-s2133 | 8 (` M`) | 0 of 8 | **8** |

**14 of 18 files were in no object database, not 5.** The worktree s2147 flagged as the risky one
(`gate-s2091`) was in fact the **safest**: 4 of its 5 untracked files are byte-identical to blobs already
committed at `2dae21ed5` (the s2091 drain itself), so `??` there meant "already preserved under another
commit", while ` M` in the other three meant "dies with the disk".

This is F-1054-1's shape recurring at a different site. That finding fixed `art-staging-audit.mjs` to classify
by blob hash after it read 36.54 MB as `0 files` because the **names** matched main. The law added
"if you find a third such gap, fix the class, not the instance" — but the class here is not a script. It is a
fire reading status letters with its eyes during triage, which is the F-1582-1 moment no battery observes.
**No mechanism is proposed:** a guard over gate worktrees would fire on every live gate run and be excused
into uselessness within a week (the `cross-engine` label's fate, F-1460-1).

## F-2148-2 — main records the accounts worker as FAILING when it passes

`artifacts/accounts-worker/test-accounts.json` on main:

```
status=failed  checks=0  generatedAt=2026-08-08T01:08:11.679Z
error: wrangler exited early: Address already in use (127.0.0.1:9231)
```

That is an **environment** failure — a port collision, not a defect. `gate-s1689` holds a re-run of the same
probe from 2026-08-19T22:13:30Z: `status=passed`, **43 named checks** (dev-code issue, CORS rejection,
token width, revoke semantics, save push/pull, version ordering, profile index). Those bytes were in no
object database and had sat on the disk for 3 days.

**Salvaged in place**, per the precedent set by the last commit to touch this very path — `c08a80f8e` (s1558):
*"commit inherited artifact re-run churn rather than discard it … this is newer evidence, not the sub-pixel
noise the discard precedent was written for; retention law prefers keeping bytes git has never seen."*
The file is self-dating (`generatedAt`), so an in-place supersession stays legible.

## Dispositions — all 18 files

**SALVAGED (2)**

| file | from | disposition |
|---|---|---|
| `artifacts/accounts-worker/test-accounts.json` | gate-s1689 | in place — pass/43 supersedes environment-fail/0 (F-2148-2) |
| `reviews/shots-b3-half-life-hollow-crossing/_s2091-hollow-shot.spec.ts` | gate-s2091 | **not** into `e2e/` — see below |

The spec is drain evidence for b3-half-life-hollow-crossing and existed nowhere else (blob `c58f4dd63a9a`,
1676 B). `playwright.config.ts:46` sets `testDir: './e2e'` and `:47` ignores only `**/*.rig.ts`, so committing
it to `e2e/` would have silently enlarged the live suite and moved the board's test count. It is preserved
beside the screenshots it generates instead, where it is readable, citable and collected by nothing.

**ALREADY PRESERVED (4)** — gate-s2091's four PNGs; disk blobs identical to `main:reviews/shots-b3-half-life-hollow-crossing/*`, committed at `2dae21ed5`. No action.

**DISCARDED AS CHURN (12)** — recorded here so the record survives the bytes:

| file | worktree | disk blob | why churn |
|---|---|---|---|
| `artifacts/multiplayer-relay/test-multiplayer.json` | s1689 | `0b7a2c69de07` | `passed`/462 checks both sides; only `generatedAt` differs (08-08 → 08-19) |
| `artifacts/agent-seat/boot-probe.json` | s2126 | `67def379f4be` | 12-line diff, one field: a regenerated random `code` |
| `artifacts/agent-seat/seat-390px.png`, `seat-desktop.png` | s2126 | `f911d509b74a`, `09923d655e02` | screenshot re-runs |
| `reviews/shots-f1742-1/*` (6 PNGs) | s2133 | `bc03e4ad1688`, `a5f2a8cb62be`, `0c4409d6bd93`, `e19f88ad0863`, `a999ce8bd285`, `c421badf251b` | re-runs of committed, review-cited gate evidence |
| `reviews/shots-prospector-presence/*` (2 PNGs) | s2133 | `06d9c00ee542`, `c04f9bec69dc` | as above |

**Why the PNGs were not salvaged, stated plainly because it is a judgement and not a measurement.**
Their committed counterparts are the shots those slices were **gated on**, and the review files cite them.
Overwriting them in place with a later re-run from a different tree state would leave each review pointing at
images it was never gated against — corrupting a correct file to satisfy a retention reflex. Committing them
to a second path instead would mint ~12 MB of near-duplicate blobs under this fire's name, which is the
attribution problem F-2146-1 spent a finding protecting. The information content over the committed
originals is nil. The asymmetry with the accounts JSON is deliberate: that file is a self-dating *status*
artifact whose result changed; these are *frozen citations* whose result did not.

## Evidence

| check | result |
|---|---|
| classification method | `git hash-object` per disk file → `git cat-file -e` in shared object DB |
| measured against | **main**, not each worktree's stale detached HEAD (gate-s1689 sat at `af3de1466`) |
| accounts salvage verified | `status=passed checks=43 generatedAt=2026-08-19T22:13:30.073Z` after copy |
| spec salvage verified | 1676 B at `reviews/shots-b3-half-life-hollow-crossing/` |
| s2091 PNG identity | disk blob `b8c72b1c9884` = `main:…/desktop-chrome-crossing.png`, held by `2dae21ed5` |
| worktree removal | after the salvage commit, never before |

Disk reclaimed: 4 worktrees × ~13 GB ≈ 52 GB. Per s2147's measurement the bulk is an ordinary full
checkout (`assets` 5.9 G + `artifacts` 5.0 G + `reviews` 1.4 G), not accumulated waste — the unique content
was the kilobytes above.

## Findings

- **F-2148-1** — ` M` hides bytes in no object database; classify gate-worktree content by blob hash, never by status letter. Non-blocking, no owner word owed.
- **F-2148-2** — main misrecorded the accounts worker as failing since 2026-08-08 on a port collision; corrected from a 08-19 re-run. Non-blocking, no owner word owed.
