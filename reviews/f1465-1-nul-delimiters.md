# f1465-1 — NUL delimiters encoded as `\u0000` escapes

**Slice:** `f1465-1-nul-delimiters` (F-1465-1's cure)
**Branch / tip:** `lane/a` @ `37ce774c` ("nulfix: encode composite key delimiters as escapes")
**Base:** `fd224847` · **Merged to main:** `206d6cffb4726405157b77f592ea7594365ad456` (s1466, `--no-ff`)
**Gated in:** detached worktree `gate-s1466` (§3.0b custody — undecided content never entered main's tree)

## Verdict

**MERGED.** The cure is correct, the runtime is provably unmoved, and the slice's own instrument is
green on the merged tree. One finding filed against the *finding it cures* — see F-1466-1 — which
corrects its scope claim but does not touch the merge.

## What it does

`src/game/Game.ts` built two composite map keys in `drawCallCensus()` by joining fields with a **raw
0x00 byte** typed directly into the template literal (`:5709` ×2, `:5748` ×1); a fourth lived in
`logs/session-scratch/s1224-citation-drift-audit.mjs:96`. The slice replaces each with the source
escape `\u0000`. The parsed string is unchanged — only the bytes on disk change. It also roots
`scripts/nul-audit.mjs` (shipped by s1465) at the end of `test:node-guards`, discharging the
gate-caller grandfathering s1465 recorded in `scripts/gate-caller-baseline.json`.

## Merge classification

Base `fd224847` was main's tip when the lane branched. Between base and merge, main moved **only
`STATUS.md`** (s1466's own lock commit `0f8ed69f`). The lane's four paths are therefore all
**LANE-TOUCHED**, none MAIN-MOVED, and the sets are disjoint — `ort` merged with no conflicts and no
3-way graft was needed.

| Path | Class | Note |
|---|---|---|
| `src/game/Game.ts` | LANE-TOUCHED | 2 lines, both cure sites |
| `logs/session-scratch/s1224-citation-drift-audit.mjs` | LANE-TOUCHED | 1 site (binary-diffed: file had a NUL) |
| `package.json` | LANE-TOUCHED | `nul-audit` appended to `test:node-guards` |
| `tasks/BACKLOG.md` | LANE-TOUCHED | goal-leaf receipt line |
| `STATUS.md` | MAIN-MOVED | s1466 lock only; lane never touched it |

## Evidence

All figures measured on the **merged tree** in `gate-s1466`, fire shell, `--workers=1` (§3.1).

| Gate | Result |
|---|---|
| `drain-block-check.mjs --strict` | ✅ CLEAR — leaf `f1465-1-nul-delimiters`, `status="queued"` |
| `npx tsc --noEmit` | ✅ clean, no output |
| `npm run build` | ✅ green, built in 1.31s |
| `test:node-guards` (via node — bash gate refuses the npm form) | ✅ **rc=0**, 3 skipped, 141.96s; `nul-audit: CLEAN` visibly runs as the **final leaf** |
| `e2e/perf-r2-census.rig.ts`, `desktop-chrome` + `mobile-chrome` (390×844), `--timeout=240000` | ✅ **2 passed**, 67.8s wall |
| Console / page errors | ✅ zero — the rig asserts both across all 5 E1 contracts |
| `nul-audit.mjs` on main post-merge | ✅ CLEAN — `Game.ts` 3 raw NULs → **0** |

### The slice's own spec, and why it first read red

`drawCallCensus()` has exactly two consumers in the tree (`e2e/perf-r2-census.rig.ts`,
`src/vite-env.d.ts`), so the rig **is** this slice's spec. It is a `.rig.ts`, deliberately held out of
the shared battery by `testIgnore` (F-1440-2, "no machine's wall-clock can become someone else's
red"), and is collected only under `GR_CAPTURE_RUN=1`.

At the config's default 30s timeout it went **2 failed** — both projects, timeout exceeded. That is
**not** the slice's:

> **CONTROL RUN.** Same rig, same shell, same 30s default, with `src/game/Game.ts` alone reverted to
> main's pre-cure version and everything else left at the merged state: **2 failed, identically.**
> The variable was isolated to one file; the red did not move with it.

The rig boots 5 contracts × 2 configurations and drives 3×60 render frames each. The fire shell's
per-job CPU ceiling (F-1269-1) blows a 30s per-test budget on that workload — which is precisely why
F-1440-2 removed this rig from the shared gate. Given a fair budget it passes **2/2 in 67.8s**.

### Runtime equivalence — the load-bearing claim, measured not asserted

The cure is only safe if the produced string is unchanged. Both versions of each key expression were
extracted from `git show main:` and `git show lane/a:` and evaluated against identical inputs:

| Key site | OLD (main) | NEW (lane/a) | |
|---|---|---|---|
| `${kind}⋄${label}⋄${materialName}` | `6100620063` | `6100620063` | IDENTICAL |
| `${row.material}⋄${row.renderOrder}` | `610062` | `610062` | IDENTICAL |

*(Probe: `logs/session-scratch/s1466-runtime-equiv.mjs`. It over-matches a third, unrelated
`const key =` — the county-anon-id expression — which the diff never touches and which throws on
evaluation for lack of scope. That is an instrument limitation, recorded rather than hidden; the two
sites the diff actually changes are both proven above.)*

### Functional proof the grouping still works

The composite keys *are* the census's grouping mechanism, so a broken delimiter would collapse or
explode the rows. Merged-tree artifact `artifacts/perf-e1-r2/draws-latest-desktop-chrome.json`:
**30 distinct `byObject` rows** with coherent label/material/kind triples (`Mesh`/`MeshStandardMaterial`/`mesh` 13 calls,
`EnemyPool`/`MeshBasicMaterial`/`instanced` 13 calls, …), plus populated `byKind` and
`mergeCandidates`. Renderer census 139 calls / 161,046 triangles on `e1-night-shift`, inside the
rig's 200-call budget.

## Findings

### F-1466-1 — F-1465-1's scope claim is wrong: the blindness is Claude Code's `grep` shadow, not `grep`

**Non-blocking for this merge; the cure is right either way. Corrective = a doc fix, filed below.**

s1465 recorded, in STATUS line-1 and in the master:

> "⚠️ **NOT a locale effect and NOT fires-only:** `LC_ALL=en_US.UTF-8` is equally blind, so **Codex
> and the lane shell are affected identically** — this is not another fire-shell instrument quirk."

**Measured false.** The blindness is not a property of `grep` on this box:

| Instrument | Same pre-cure `Game.ts` | Result |
|---|---|---|
| `grep -c import` **through the Bash tool's zsh** | 3 raw NULs | *(no output, exit 1)* — blind |
| `/usr/bin/grep -c import` **invoked directly, no shell** | 3 raw NULs | **134** — reads it fine |

There is exactly **one** grep binary on the box (`/usr/bin/grep`, "BSD grep, GNU compatible"
2.6.0-FreeBSD), and it is **not blind**. `type grep` in the fire shell resolves to *a shell function
from the Claude Code shell snapshot*:

```
# snapshot-zsh-…sh:4706   "Shadow find/grep with embedded bfs/ugrep"
:4721  function grep {
:4730    ARGV0=ugrep "$_cc_bin" -G --ignore-files --hidden -I --exclude-dir=.git … "$@"
```

**`-I` is the mechanism: "ignore binary files".** Claude Code shadows `grep` with an embedded
**ugrep** and hard-codes `-I`, so any file containing a raw NUL is skipped whole — no output, exit 1,
no diagnostic. `-a` overrides it, which is why s1465's `grep -ac` returned 134.

**Consequences of the mis-scoping, which is why this is worth a finding rather than a footnote:**

1. **Codex and the lane shell were never affected.** They do not source the Claude Code snapshot;
   their `grep` is `/usr/bin/grep`, measured above at 134. Any future session reasoning that "Codex's
   greps of `Game.ts` were unreliable" would be chasing a defect that never existed there.
2. **The blast radius is different from the one recorded** — it is *every Claude Code shell*
   (fires **and** attended sessions), for *any* tracked file containing a NUL, in *any* repo. That is
   broader in one direction and narrower in the other than "Codex and the lane shell too".
3. s1465's locale test was sound; the **inference** drawn from it did not follow. Ruling out locale
   does not rule in "universal". This is the standing "verify the INFERENCE, not just the instrument"
   shape.

**The standing lesson survives intact and is if anything strengthened:** *a negative grep is not a
negative result until the file is proven grep-readable* — and in a Claude Code shell that is the
default-and-silent behaviour, not an edge case. `scripts/nul-audit.mjs` remains the right guard, and
rooting it in `test:node-guards` (this slice) is the right cure.

**Corrective:** doc-only. STATUS/BACKLOG scope sentence corrected by s1466 in the handoff commit; no
code change owed, no task queued. Recorded here so the claim is not inherited a third time.

## Housekeeping discharged

- `scripts/gate-caller-baseline.json` — s1465 grandfathered `nul-audit.mjs` as a caller-less gate with
  an explicit retirement condition ("retire the line when the slice drains"). The slice has drained
  and the caller is live in `test:node-guards`; **the baseline line is now owed for removal** — done
  in the s1466 bookkeeping commit.
- Deploy: **correctly skipped.** `drawCallCensus()` is test-only ("reachable solely through the test
  API"); nothing gameplay-affecting merged.
- GZ-01: **no item — a ruling, not an omission.** Nothing player-visible changed.
