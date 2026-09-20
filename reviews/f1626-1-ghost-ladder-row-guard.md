# Review — f1626-1 ghost-ladder-row-guard

**Slice:** `f1626-1-ghost-ladder-row-guard` — a lead-📋 BACKLOG row naming an already-SHIPPED master must red
**Branch:** `lane/b` · **tip** `f94055da3`
**Base:** `ff965278c` (main at gate time) · **Merge:** `44ee9ddc8aee648126bee72b85934137e742e3a4`
**Drained:** s1628, 2026-08-10 · gated in detached worktree `gate-s1628` per §3.0b

## VERDICT: MERGED — green on every gate, and its teeth proved by manufacturing the defect.

## What it does

Cures the Mistake #8 / "ghost row" shape the memory index records as *"a ladder row marked OPEN is
usually already merged — 7 of 10"*. A BACKLOG ladder row that still leads with 📋 while its master
has shipped is an invitation to re-queue merged work — the 824k-flail shape.

- `scripts/ghost-ladder-row-guard.mjs` (51 lines) — parses lead-📋 ladder rows out of
  `tasks/BACKLOG.md`, resolves each named master through the existing `classifyRoot()` shipped-ness
  classifier, and reports every row whose master classifies SHIPPED.
- `scripts/ghost-ladder-row-guard.test.mjs` — four fixtures covering both directions.
- `package.json` — wires guard + test into `test:ledger-guards`, the guard **with `--strict`**.
- `scripts/gate-caller-baseline.json` — two grandfather entries with stated reasons.
- `tasks/BACKLOG.md` — retires the two live ghosts the guard found.

The two real ghosts retired: row 7 `board-layout-full-picture` (shipped `2d6bd407`) and row 8
`map-beauty-dry-gulch` (shipped `577222c6`).

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green, 2.20 s** |
| Own test `ghost-ladder-row-guard.test.mjs` | **4/4 pass** |
| `test:ledger-guards` (the battery it joins) | **rc=0, 19.0 s** |
| `gate-caller-audit.test.mjs` | **26/26 pass** |
| `gate-caller-audit.mjs` **binary** (reads the changed baseline) | **rc=0** — 121 subjects, 21 orphans, 21 grandfathered, both new entries accepted |
| Guard over the live merged BACKLOG | **0 ghosts** |
| Merge | **clean ort**, exact 5-file firewall, nothing lost from main |
| `main..lane/b` after merge | **empty** (fully absorbed) |

### Teeth proved by manufacturing the defect, not by the green

A passing guard never executes its violation path, so its green says nothing about its red (the
s1299/s1300 standard). Re-flipped row 7 back to `📋` by **file edit** (not a shell-quoted probe):

```
=== DEFECT INSTALLED, --strict ===            rc=1
GHOST line 1757 tasks/board-layout-full-picture.md — review:reviews/...[board-layout-full-picture]
1 ghost ladder row(s).

restored byte-identical: true
=== CONTROL after restore, --strict ===       rc=0
0 ghost ladder row(s).
```

**⚠️ A caution for anyone probing this guard by hand, because I got it wrong first.** My initial
manufactured-defect run invoked the guard **bare** and read `rc=0` while it was *printing the ghost*
— and briefly wrote that down as a defect ("detects but does not fail"). It is not. The exit code is
gated on the flag at `ghost-ladder-row-guard.mjs:48`
(`if (process.argv.includes('--strict') && ghosts.length) process.exitCode = 1`), i.e. the guard is
**advisory by default** on the `drain-block-check` UNKNOWN precedent, and `test:ledger-guards` calls
it **with `--strict`**. Reading the exit code of an invocation that does not match the wiring answers
a different question than the one asked — the F-1425-2 / unrecognised-flag class, one axis over.
**Probe a guard the way its battery calls it, or you will indict the wrong subject.** Recorded here
rather than filed as a finding because the slice is correct and only my probe was wrong.

## Merge classification

Base `ff965278c`. Auto-merged clean by `ort`; no conflict resolution was required.

| File | Class | Note |
|---|---|---|
| `scripts/ghost-ladder-row-guard.mjs` | LANE-ONLY (new) | taken |
| `scripts/ghost-ladder-row-guard.test.mjs` | LANE-ONLY (new) | taken |
| `scripts/gate-caller-baseline.json` | LANE-ONLY | 2 entries appended |
| `package.json` | **BOTH-MOVED** | auto-merged; verified token-by-token — main's `test:ledger-guards` had 21 leaves, merged has 23, **added exactly the two new files, lost nothing** |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | auto-merged; the lane edits rows 7–8 at lines 1757–1758, this fire's ap16 edit is at line 1, disjoint regions |

**Merge window: zero.** Main was fast-forwarded to the gated commit itself (the gate worktree's
merge commit had main's tip as first parent), so nothing was ever staged in main's index — F-1589-5
satisfied by construction.

## Findings

**None blocking.** One non-blocking note recorded inline above (probe-the-guard-as-wired), which is
a lesson for readers rather than a defect in the slice.

The slice also carries s1626's own F-1626-1 cosmetic note forward correctly: the gate-caller-audit
orphan listing pads the name column to a fixed width, so long names run into their reason. Visible
again in this drain's binary output. Unchanged, still cosmetic, still worth one line in a later
slice that touches that file.
