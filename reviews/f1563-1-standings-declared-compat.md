# f1563-1 — standings `declared` compatibility (and the f-board-1 slice it unblocks)

- **Slice:** `lane-b-f1563-1-standings-declared-compat` (corrective) **+** `lane-fboard1-named-minds` (the held predecessor)
- **Branch:** `lane/b` · **tip** `e44dc56ab` · held predecessor tip `0a1fa333e`
- **Base for the gate:** clean main `fa80218a6` · gate worktree `gate-s1564` (detached, §3.0b)
- **Verdict:** ✅ **MERGE** — the block's stated lifting condition is satisfied, measured, not asserted.

## What it does

f-board-1 taught the county board to name the mind and rig each rider *declared* — a
schema addition across `functions/api/standings.ts` (server), `src/encyclopedia/reader.ts`
(client validator + render) and `reader.css`. s1563 gated it and **held** it on F-1563-1:
the new client validator hard-required `declared`, so `isStandingStack` rejected **every row
of the payload production serves today**, and `board.slice(0,100).filter(isCountyStanding)`
dropped them **silently** — no console error, no page error, just a board reading
*"No standings yet – the door is open."* underneath this slice's own new copy.

f1563-1 is the corrective. Six lines in `reader.ts`:

- `declared: boolean` → `declared?: boolean` on `StandingStack`
- the validator accepts `value.declared === undefined` alongside `typeof … === 'boolean'`
- the stack-fields-imply-declaration invariant re-keys from truthy `value.declared` to
  **`value.declared === true`**

That last line is the one that matters and is easy to get wrong. Making a field optional
normally *weakens* a validator; keying the invariant on `=== true` means a row carrying
`model`/`harness`/`harnessVersion` with `declared` **absent** or **false** is still
rejected. The cure widens exactly one door and leaves the others shut.

## Evidence — merged tree `a4af8103d` (main `fa80218a6` + `lane/b`), fire shell, `--workers=1`

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | ✓ built in **1.08s**, asset-diet green |
| `e2e/lb-01-county-standings.spec.ts` | **18 passed / 18** (34.7s), desktop **and** mobile-chrome (390×844) |
| `e2e/milk-county-board.spec.ts` + `e2e/field-book.spec.ts` | **22 passed / 22** (19.7s), both projects |
| `scripts/test-stats.mjs` | **87/87** |
| `scripts/test-multiplayer.mjs` | **462/462** (F-1229-1 — `functions/` touched) |
| Boot probe | covered in-suite: `milk-county-board.spec.ts:314` + `:340` are **plain-boot** tests asserting `errors === {console: [], page: []}`, both projects |

Merge was clean — `ort`, **zero conflicts**, 13 files.

**`test:node-guards` was NOT run, and that is a ruling, not an omission.** F-1460-1 binds when
the diff touches `src/sim/`, `src/systems/` or `src/entities/`. This diff touches
`src/encyclopedia/`, `e2e/`, `functions/` and `reviews/` — none of the three. I state this
rather than implying coverage I did not take.

## The acceptance proof, verified two ways

The block (`blockClass: gate-side`) named one condition: the test titled *"Claim Ledger renders
the seeded county board and its empty contract state"* must pass **UNMODIFIED**. A corrective
that edits its own canary proves nothing — and this canary is the only thing standing between
production and a blank board.

- `git diff 0a1fa333e..HEAD -- e2e/lb-01-county-standings.spec.ts` on the **merged tree** → **empty**
- blob hash `0a1fa333e:` = `d9d209b3c4a246e4003d44fc631c352b11c4e9b1`
  blob hash merged `HEAD:` = `d9d209b3c4a246e4003d44fc631c352b11c4e9b1` → **byte-identical**
- the test itself: **`:550` ✓ desktop (2.4s) · ✓ mobile (2.4s)** — the two instances that were
  red under the hold, green now, with the file untouched.

⚠️ **The diff you must not use here:** `git diff main lane/b` is contaminated — main moved under
the lane (s1563's own bookkeeping commits), so the two-dot read shows f-board-1's original 16
lb-01 lines and *looks like the canary was edited*. It was not. Compare against `0a1fa333e`.
s1563 flagged this trap in its handoff; I re-derived it independently and confirm it.

## The new strictness cases are real, not a rubber stamp

The corrective was forbidden to touch lb-01, but it added 43 lines to `milk-county-board.spec.ts`.
I read them rather than counting them. `:340` serves an 8-row payload and asserts
**`toHaveCount(2)`**:

- rows 1–2 carry **no `declared` field at all** — production's live shape — and are **accepted**,
  rendering *"Undeclared rider"* (row 2 exercises the posse path, both riders)
- rows 3–8 are rejected: `declared:'yes'` · `model:7` · `harness:{}` · `harnessVersion:1` ·
  stack-without-declaration · **`declared:false` with a stack** (the `=== true` case specifically)
- plus `not.toContainText('undefined')` and zero console/page errors

Both directions of the cure, in one plain-boot test. This is the test F-1563-1 deserved.

## Findings

- **F-1563-1 — CLOSED.** Cured at `reader.ts` as above; proven by the canary greening unmodified
  and by the new bidirectional strictness case. Leaf `f-board-1-named-minds` lifts with this merge.
- **F-1563-2 — CLOSED by construction.** s1563's corrective named its spec files **by path**, and
  the runner ran them. The general rule (masters name spec files by PATH, never by role) is
  already folded into the authoring practice.
- **No new findings.** I looked for the usual shapes and did not find them: no debug-gate
  leftover (the assertions are plain-boot), no silent drop path remaining, no widened validator
  door beyond the one intended.

## Note on the ladder this closes

The hold cost one fire and produced a better slice than the one that was stopped. The thing that
made it work was that s1563 wrote the lifting condition down as a **falsifiable, mechanical
proof** — *this named test, unmodified, green on both projects* — rather than as "fix the
validator". A `gate-side` block with a checkable condition is a contract; one without is a
parking space.
