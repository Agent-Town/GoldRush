# f1310-1 — ban BACKLOG line coordinates from non-terminal `blockedReason`

- **Slice:** `tasks/lane-a-f1310-1-backlog-coordinate-ban.md` (FIRE-AUTHORED s1310)
- **Branch / tip:** `lane/m3` @ `8c8a27970407500202b45950e08677e84f1354b8`
- **Base (merge-base with main):** `7e014847d184f3681d9992fcec606697916b8b41`
- **Drained by:** s1311
- **Verdict:** ✅ **MERGE.** The acceptance bar was the *manufactured red*, not a green — and it was met on the **live tree**, including the load-bearing assertion that `--update` cannot bury it.

## What it does

`scripts/law-pointer-guard.mjs` gained a **shape ban**. Any `BACKLOG:<n>` / `tasks/BACKLOG.md:<n>`
coordinate appearing in the `blockedReason` of a **non-terminal** goal leaf is an unconditional RED.
The message tells the author to cite by content instead. Terminal (historical) leaves are untouched,
so the ledger's history keeps its old coordinates without generating noise.

Two details make it a *ban* rather than another drift guard:

1. **`--update` refuses.** The banned shape is detected *before* the re-base branch and exits 1
   there too. A drift guard can always be silenced by re-basing; this one cannot, which is the
   whole point — s1310 measured that BACKLOG grows **at the top** (2206 → 2240 lines across the
   last 25 commits touching it, because findings are *prepended*), so any deep coordinate rots on
   every fire that files a finding. A guard that redded every fire would train `--update` into a
   rubber stamp.
2. **It rejects without resolving.** The coordinate is stripped from the reason before the normal
   `POINTER` pass, so it is never double-reported as an unresolvable pointer. This does **not**
   reopen the guard's documented KNOWN GAP (shorthand like `v3:137` needs a guess about which file
   is meant): `BACKLOG` names exactly one file, and the rule rejects the shape without resolving it.

**Population is ZERO** after s1310's two content-anchor cures, so the guard is green on arrival.
Its entire value is the red it manufactures when someone re-introduces the shape.

## Merge classification

| File | Class | Note |
|---|---|---|
| `scripts/law-pointer-guard.mjs` | **LANE-TOUCHED only** | main never moved it since base |
| `scripts/law-pointer-guard.test.mjs` | **LANE-TOUCHED only** | main never moved it since base |

Main moved since the merge-base **only** in `STATUS.md` (s1311's own lock commit `204f4e86`), which
the lane does not touch. **Zero MAIN-MOVED overlap, zero conflicts.** Grafted with
`git checkout lane/m3 -- <the two files>`; `git diff lane/m3 -- <the two files>` was **empty**,
proving the merged tree is **byte-identical to the lane tip** for the slice's whole surface.

The two-dot `main..lane/m3` diff showed a third file (`STATUS.md`, `3 +--`). That is **main's own
movement**, not lane content: `git show --stat 8c8a2797` lists only the two script files. Recorded
because reading the two-dot stat alone would have suggested the lane was editing the lock line.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, built in 1.70s |
| `node --test scripts/law-pointer-guard.test.mjs` | **11/11 pass**, 0 fail |
| `test:node-guards` (`node --test` arm, 36 files) | **199/199 pass**, 0 fail, rc=0 |
| `node scripts/test-ticker-stats.mjs` | rc=0 |
| `test:findings-state` | rc=0 — **193 / 149 / 44 declared open, 0 double-state** |
| `test:blocker-panel` | rc=0 — 205 census closed, 0 closed-on-panel |
| `test:ruling-propagation` | rc=0 — 3 RULED, 20 leaves refuse, 0 stale |
| Live guard report | **PASS** — 7 surfaces / 19 pointers / 16 checked / 2 illustrative / 1 known-rotten (**unchanged** by this merge, as predicted) |
| §3.0 `drain-block-check --strict` | **✅ CLEAR**, matched by name |
| Playwright | **Not run — correctly.** Staged surface is two `scripts/*.mjs` files; zero `src/`, zero `e2e/` bytes. Consumers derived by grep, not inherited: only `test:node-guards` and `test:ledger-guards`, both run above. |

**Guard-count arithmetic reconciles:** s1310's merged tree measured 198/198; this slice adds exactly
one test; 199/199 observed. A green whose count you cannot explain is not clean.

### THE BAR — the manufactured red, on the live tree

A passing guard never executes its violation path, so its green says nothing about its red
(the s1299/s1300 standard). Probe: appended `see tasks/BACKLOG.md:2128.` to the **live**
`blockedReason` of `vp-02e-jumper-8way-activation` (a real `status:"blocked"` leaf).

```
BEFORE sha256: 1f76c074425d8d24d96ab35d63b1b15122b6806abcc93c5266a386acb0bab0ab
--- CHECK MODE rc=1
FAIL — 1 pointer problem(s):
  BACKLOG COORDINATE  tasks/goals.json[vp-02e-jumper-8way-activation] — "tasks/BACKLOG.md:2128".
  Cite BACKLOG by CONTENT (a grep target); write historical line numbers as prose.
--- UPDATE MODE rc=1
law-pointer-guard: baseline NOT re-based — 1 BACKLOG coordinate problem(s)
--- RECHECK AFTER --update rc=1   <-- the load-bearing assertion: --update CANNOT bury it
RESTORED sha256: 1f76c074425d8d24d96ab35d63b1b15122b6806abcc93c5266a386acb0bab0ab
BYTE-IDENTICAL: true
```

**Negative control:** the same leaf's *real* text — s1310's cure, which says
`in tasks/BACKLOG.md — CITED BY CONTENT, NOT BY LINE: grep for the sentence GATE: owner pick…` —
does **not** trip the ban. A filename without a line number is exactly the shape the rule wants.
`drain-block-check --all` still reports **4 BLOCKED**, all four gates substantively intact.

## Runner conduct

The runner reached **READY-FOR-GATES** and honoured its firewall: final status contained only the
two allowed script files, and it verified `tasks/goals.json` and `law-pointer-baseline.json` were
unchanged after its own live probe — which is exactly what s1310's §I(1) told this fire to check
before trusting the report. Verified independently here: neither file appeared in `git status`.

## Findings

**None blocking.**

- **F-1311-1 (NON-BLOCKING, observation, no corrective owed).** The ban is deliberately narrow to
  `BACKLOG`. Line coordinates into *other* append-at-top ledgers in a live `blockedReason` remain
  unbanned. Today that set is empty, so widening now would be inventing scope against a population
  of zero; recorded so the next fire that adds such a ledger knows the rule exists and is narrow
  **by construction, not by oversight**.
