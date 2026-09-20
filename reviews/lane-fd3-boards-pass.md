# lane-fd3-boards-pass — FD-3 boards improvement pass

**Slice:** FD-3 (AP-14 THE FRONT DESK) — boards improvement pass + the local/global answer's display half
**Branch:** `lane/b`  **Tip:** `b4994c6a2`  **Base:** `bd6c228da` (2026-08-07T11:34:08+07:00)
**Merged:** `s1521` fire, merge commit recorded in the drain commit below
**Drained by:** s1521 (fire)

## Verdict

**MERGE — with two findings carried, neither blocking.**

The runner ended its own report with **"Not `READY-FOR-GATES`"**. That self-declaration is about an
unmet *acceptance criterion*, not about correctness, and the distinction is the whole verdict here:
FD-3 asks for a live "when" column on the county board, the stored row already carries the value,
the UI renders and tests it — but today's public `boardRow()` in `functions/api/standings.ts` does
not project it, and **this master explicitly forbade API changes**. So the runner did the lawful
thing (Mistake #14: reject-don't-stretch; the firewall STOP is a success, not a failure) and left
the gap as **F-FD3-1**.

The merged code degrades gracefully rather than breaking: `submittedAt` is an **optional** field,
validated (`row.submittedAt === undefined || (Number.isInteger(...) && >= 0)`), and renders an
em-dash with `aria-label="Submission time unavailable"` when absent. Nothing throws, nothing logs.
The remaining work is a one-file additive projection, ladder-ed below as a corrective.

## What it does

The county standings board now reads as a board rather than a dump: each row shows **rank · name ·
combined result · when**. Underneath it, a separate **"YOUR CLAIMS"** strip renders only the active
profile's own scores, read from the existing local score ledger — which is the display half of the
local/global answer AP-14 asked for, with no new board species and no new storage. Empty states
speak in the door's language ("No claims in your ledger yet — ride one and make your mark") instead
of rendering blank. Sparse Field Books omit contract columns that are wholly empty, and expose a
swipe cue at 390px. Ranking, API and storage code are untouched.

## Evidence

All arms run in the fire shell with `--workers=1` (§3.1), against a **vite dev server on scratch
port 5231/5234** (Mistake #12 — lane-a's runner was live throughout). Transcripts:
`artifacts/fd3-gate-s1521.txt` (merged tree) and `artifacts/fd3-control-s1521.txt` (control).

| Arm | Result | Notes |
|---|---|---|
| `npx tsc --noEmit` | **rc=0** | |
| `npm run build` | **rc=0** | |
| `run-guards --changed-since bd6c228da` | 3/5 | `test:node-guards` PASS (361 s), `test:citations` PASS, `test:gate-callers` PASS; two reds analysed below |
| own specs — desktop-chrome | **8 passed / 3 failed** | lb-01 + field-book, 53.9 s |
| own specs — mobile-chrome | **8 passed / 3 failed** | lb-01 + field-book, 59.3 s |
| **CONTROL: pre-merge main, desktop** | **5 passed / 3 failed** | same three titles, same error |
| adjacent — mobile-chrome | **16 passed / 0 failed** | task-025 + m1-01 + m2-01, 1.8 m |
| adjacent — desktop-chrome | 14 passed / 2 failed | 3.5 m; both timeouts |
| m2-01 isolated — desktop-chrome | **7 passed / 0 failed** | 58.2 s, rc=0 |

### Every red attributed, none to this slice

**1. The three own-spec failures are PRE-EXISTING, proved by control — not argued.**
All five console errors across both projects are one string: `"Failed to load resource: the server
responded with a status of 429 ()"`. HTTP 429 is rate limiting, and the slice touches no
`functions/` code at all. A detached worktree at pre-merge main (`02b55c4a0 (archive: pruned by the A3 rewrite)`), its own dev server on
5231, same hour, same machine, ran the **pre-merge** spec against **pre-merge** source and failed
**the same three tests with the same 429**:

- `secure submits the county row with pinned origin, hashes, and profile name`
- `secure skips county submission for a pinned seed outside the frozen set`
- `offline standings failure stays silent through the secure ceremony`

Control 5 passed / 3 failed (8 tests) vs merged 8 passed / 3 failed (11 tests). **The merge adds
three tests and all three pass; the failure count does not move.** A 150 s wait did not clear the
429, so it is a standing local-rate-limit condition, not a transient window — filed as **F-1521-2**.

**2. `test:power-budget` (p95 0.582 ms vs cap 0.500 ms) is a load artifact.** The merge touches
nothing under `src/sim/`, `src/systems/` or `src/entities/`. Five consecutive re-runs on the merged
tree: **p95 0.434 / 0.402 / 0.371 / 0.470 / 0.397 ms — 5/5 PASS**. The single red was measured in the
same battery in which `test:node-guards` consumed 361 s (against a ~55 s baseline) while lane-a ran a
live timing measurement. Load ceiling, not a line (F-1269-1 shape).

**3. `test:task-guards` red is INHERITED, not caused.** It names one invisible master,
`tasks/lane-fd1-front-desk-card.md`. `git log --diff-filter=A` puts that file in **`bd6c228da`** —
the attended commit that is this merge's own base, already on main before the drain. Recorded as
**F-1521-3** rather than fixed here (it is FD-1's bookkeeping, not FD-3's).

**4. The two adjacent desktop timeouts are load artifacts.** `m2-01-build-menu.spec.ts:178` and
`:220`, both `Test timeout of 30000ms exceeded` in `page.evaluate`. The *same three specs* passed
**16/16 on mobile-chrome** on the same tree, and re-running `m2-01` alone on desktop gave **7/7,
rc=0**. Note the red inventory lists m2-01 as KNOWN-RED for a *different* test (`:136`,
mobile-only) — so this was **not** treated as a fingerprint match and was measured instead.

## Merge classification

Base `bd6c228da`; lane **1 ahead, 8 behind**; merged with `git merge --no-ff`.

| File | Lane | Main | Class |
|---|---|---|---|
| `e2e/field-book.spec.ts` | 1 | 0 | LANE-TOUCHED (clean apply) |
| `e2e/lb-01-county-standings.spec.ts` | 1 | 0 | LANE-TOUCHED (clean apply) |
| `src/encyclopedia/reader.ts` | 1 | 0 | LANE-TOUCHED (clean apply) |
| `src/encyclopedia/reader.css` | 1 | 0 | LANE-TOUCHED (clean apply) |
| `reviews/shots-fd3/*.png` (8 files) | 1 | 0 | NEW (free) |
| `tasks/BACKLOG.md` | 1 | 2 | **BOTH-MOVED — 3-way** |

Only `tasks/BACKLOG.md` needed judgement. Both sides are pure appends in different regions: the lane
appended its F-FD3-1 row at the file's tail, while main had gained s1520's F-1520-1 row and this
fire's F-1521-1 row ~160 lines earlier. Git's 3-way resolved it without conflict; **verified after
the merge that both survive** (`grep -c` returned 1 for `F-1521-1 (s1521)` and 1 for `F-FD3-1`).

## Findings

**F-FD3-1 (runner-authored, carried) — the "when" column has no data until an additive API
projection is authorized.** Stored rows contain `submittedAt`; `functions/api/standings.ts`
`boardRow()` omits it from the public projection; FD-3's master forbade API edits, so the runner
recorded the gap instead of stretching its firewall. Real rows therefore render an em-dash today.
**Not blocking the merge** — the UI is complete and degrades cleanly. **Corrective authored this
fire:** `tasks/lane-b-fd3-1-submitted-at-projection.md`, firewall lifted by exactly one file (the
`e1-seam-yield-single-source-lift` precedent). Alternative, if the owner prefers: amend FD-3's
live-when criterion instead.

**F-1521-2 (new) — three `lb-01-county-standings` tests go red on HTTP 429 under repeated local
runs, and the spec is NOT in the red inventory.** `red-inventory-lookup` returns
`NOT-IN-INVENTORY`, so the next drain that touches this spec will re-derive this whole control run
from scratch, exactly as this one had to. The tests hit the standings submission endpoint without a
rate-limit-aware harness. **Owed:** either add the rows to `logs/suite-red-inventory.md` with the
429 fingerprint, or give the three tests a rate-limit-tolerant fixture. Fire-authorable.

**F-1521-3 (new) — Goal Registration Law gap on both FD masters.**
`drain-block-check.mjs --strict` returned **UNKNOWN (rc=2)** for this slice: no goal leaf matched
`lane-fd3-boards-pass.md`. Per fire.md §3.0 that is a bookkeeping finding, not a clearance — so the
leaf `fd3-boards-pass` is **registered at drain time** in the drain commit (the s1439 precedent).
Its sibling `tasks/lane-fd1-front-desk-card.md` is still unregistered and is what reddens
`test:task-guards`; it is live queued work in lane-a, so it wants a **leaf**, not a DO-NOT-QUEUE
header. Left for the FD-1 drain, named here so it is not re-derived.
