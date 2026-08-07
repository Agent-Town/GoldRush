# Task f1524-1: re-point the six stale county-board copy assertions (LANE-A, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — authored s1524 from the F-1523-7 finding row plus this fire's own runtime measurement.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` (the F-1523-7 row); `e2e/milk-county-board.spec.ts`; `src/encyclopedia/reader.ts` (the three `county-standings__empty` render sites named below).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**CITATION FRESHNESS CHECK (F-1424-3 / F-1425-2).** Before scope item 1, run these three greps in the lane. Each must return exactly **1**:
- `grep -c "No posses in the field book yet" src/encyclopedia/reader.ts`
- `grep -c "plain boot: a failing standings request adds no error of the application own" e2e/milk-county-board.spec.ts`
- `grep -c "THE .milk-county-board. REDS ARE STALE TEST EXPECTATIONS" tasks/BACKLOG.md`

Any of them returning 0 means **the lane is stale, not that the premise is wrong** — STOP and report which one, and do not edit anything.

## Why (F-1523-7, filed s1523; re-measured at runtime s1524)

s1521's `lane-fd3-boards-pass` merge (`9b7c530a`) deliberately rewrote the boards' empty states into the county's voice — exactly what its own gazette item advertised — and left its neighbour's six full-text `toHaveText` assertions behind. **The test went stale; the product is correct.** Two fires (s1522, s1523) labelled these reds "pre-existing" and each paid for a control run without asking what they were.

**Verified on main s1524 — the strings the spec expects exist nowhere in the application:**
`grep -rn "waits for its first name\|signed the county book\|signed the field book" src/ functions/` returns **zero hits**; the only hits in the repo are the spec's own six assertions plus prose in `tasks/`, `STATUS.md` and `marketing/`.

**Measured at runtime s1524** (external dev server on scratch port 5307, `--workers=1`, `--project=desktop-chrome`), `e2e/milk-county-board.spec.ts` ran **5 passed / 2 failed**. Both failures are the FIRST assertion of their test, with identical text:

```
Expected: "The county waits for its first name."
Received: "No standings yet — the door is open."
```

- `e2e/milk-county-board.spec.ts:295` ("plain boot: an offline county clerk leaves the posse board and field book quiet")
- `e2e/milk-county-board.spec.ts:317` ("plain boot: a failing standings request adds no error of the application own")

⚠️ **Because both tests die on their first assertion, the four LATER stale strings were never reached and are therefore NOT runtime-verified.** They are derived by reading the render sites, and deriving them again yourself is scope item 1 — do not trust the table below without checking it.

**The three render sites, read on main s1524:**
- `src/encyclopedia/reader.ts:691-693` — `renderCountyRows()`: empty + `party === 'solo'` → `No standings yet — the door is open.`; empty + any other party → `` `No ${PARTY_LABELS[party].toLowerCase()} standings yet — the door is open.` ``
- `src/encyclopedia/reader.ts:99-104` — `PARTY_LABELS` = `{ solo: 'Solo', '2': 'Posse of 2', '3': 'Posse of 3', '4': 'Posse of 4' }`, so `.toLowerCase()` yields `posse of 2` / `posse of 3`.
- `src/encyclopedia/reader.ts:504` — `renderPartyBook()` empty → `No posses in the field book yet — the door is open.`

## Scope

1. **Derive each of the six expected strings from the render sites above** (not from this master), and record in your report the derivation for each: which function, which branch, what it yields. Where your derivation disagrees with the table in item 2, **your derivation wins** — say so explicitly in the report and use it.

2. **Re-point exactly these six assertions** in `e2e/milk-county-board.spec.ts`. Change ONLY the expected-string literal on each line; touch nothing else on the line:

| line | context | expected string becomes |
|---|---|---|
| 295 | board, default party (solo) | `No standings yet — the door is open.` |
| 297 | board, after clicking `county-standings-party-3` | `No posse of 3 standings yet — the door is open.` |
| 301 | `field-book-board`, after `field-book-view-byParty` | `No posses in the field book yet — the door is open.` |
| 317 | board, default party (solo) | `No standings yet — the door is open.` |
| 319 | board, after clicking `county-standings-party-2` | `No posse of 2 standings yet — the door is open.` |
| 322 | `field-book-board`, after `field-book-view-byParty` | `No posses in the field book yet — the door is open.` |

The dash is an EM DASH (`—`, U+2014), copied from the source, not a hyphen.

3. **Keep `toHaveText` exactly as it is.** Do NOT relax any of the six to `toContainText`, a regex, or a substring match. F-1523-7's ruling is explicit: full-text strictness is what CAUGHT this real copy divergence, and loosening it would blind the assertions to the next rewrite. If you believe a given line cannot be made to pass without loosening, STOP and report that line rather than loosening it.

4. Re-run the spec to green and report the counts (see Self-check).

## Firewall

Touch ONLY: `e2e/milk-county-board.spec.ts`.

NO changes to:
- **`src/**` — most especially `src/encyclopedia/reader.ts`.** The product copy is correct, shipped, deliberate and player-visible; the TEST is what went stale. "Fixing" the application to match an old assertion would silently revert s1521's shipped FD-3 copy pass. If you find yourself editing a render site, you have the direction of this task backwards — STOP and report.
- `functions/**`, `scripts/**`, `playwright.config.ts`, any other `e2e/*.spec.ts`.
- Any assertion in `milk-county-board.spec.ts` other than the six named expected-string literals — in particular the API/unit tests at `:115`, `:163`, `:202`, `:242` (all four currently PASS) and the whole of `:331` ("plain boot: posse chips rank within size, the field book counts hands, and a row watches its run", currently PASSES).
- Sim semantics, ranking, storage, `tasks/**`, `specs/**`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` → 0 errors. `npm run build` green.
- `npx playwright test e2e/milk-county-board.spec.ts --project=desktop-chrome --workers=1` → **7/7 pass, rc=0**.
- Same on `--project=mobile-chrome` → **7/7 pass, rc=0**.
- **Derived expected pass count: 5 → 7 per project (the two named tests flip; the other five must NOT move).** Report the before/after counts for both projects. If any of the five currently-passing tests changes state in either direction, that is a finding — report it, do not paper over it.
- Zero console/page errors in the two plain-boot arms (both already assert this themselves: `:302` and `:326-:328`).
- `git diff --stat` must show **exactly one file changed**, `e2e/milk-county-board.spec.ts`, with **6 lines changed** (or say precisely why the count differs).
- No screenshots or perf table needed — this task renders nothing new.

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

End your report with **READY-FOR-GATES** plus: the six derived strings and how you derived each · the before/after pass counts for both projects · whether any of your derivations disagreed with the table in scope item 2 · confirmation that `src/` is untouched (`git diff --name-only` output).
