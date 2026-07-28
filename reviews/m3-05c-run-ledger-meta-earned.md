# m3-05c — Run Ledger `metaEarned` column

- **Slice:** `lane-a-m3-05c-run-ledger-meta-earned`
- **Branch / tip:** `lane/m3` @ `b70f4db1` (base `afd18fe1`)
- **Drained by:** s1190 fire, 2026-07-29
- **Verdict:** ✅ **ACCEPTED**

## What it does

Adds the last missing column to the Run Ledger: the four-track meta payout a secured run
banked. `RunManager` writes `metaEarned` into the history entry it already appends on run
end; `RunLedger` renders a `Meta earned` row (`Territory +1 / Science +1 / Hero +1 / Agent +1`)
between Gold and Duration, and omits the row entirely when the entry has no payout.

## The pre-declared REJECT condition — did not fire

s1189 authored this master around one trap and told the draining fire to gate on it first:
`normalizeEntry` (`src/ui/RunLedger.ts:85`) returns `null` on any validation failure and
`readRunHistory` filters nulls, so adding `metaEarned` to that **closed** gate would silently
delete every run the player had already banked, and **no existing test would fail**.

✓ **Unqualified pass, verified by reading the branch, not the report.** The early-return at
`:88` is **byte-unchanged** — `metaEarned` is not among its conditions. The new code computes
the field *after* the gate, and when the source is absent or unusable it produces an empty
object, hits `if (Object.keys(metaEarned).length) … else delete entry.metaEarned` (`:108`), and
**returns the entry**. A pre-slice entry carrying no `metaEarned` key survives normalization
and stays visible.

The type is `metaEarned?:` — optional on read, as the master required, forever.

Scope 4b was delivered honestly: `e2e/m3-05b-run-ledger.spec.ts:141` seeds a legacy entry with
**no `metaEarned` key at all** plus a death entry, and asserts both are *visible* with
`run-ledger-meta` at `toHaveCount(0)`. The unit test at `:74` proves the sanitizer:
`{territory: 2, science: 0, hero: -1, agent: 'bad', unknown: 99}` → `{territory: 2}`
(zero, negative, non-numeric and unknown keys all dropped).

## `lastPayout` staleness — checked, safe

`metaEarned` reads `this.lastPayout`, which persists across runs, so a stale read would
attribute a previous run's meta to this one. It cannot: `:257` calls `awardSecuredClaim()`
immediately before the `:260` append, and that function (`:422`) re-derives the payout unless
`paidRunId === runId`. On a non-secured run the `reason === 'secured'` guard means
`lastPayout` is never read at all.

## Naming — the pre-declared STOP correctly did not fire

The master pre-declared a naming STOP a **success** if `territory/science/hero/agent` were not
player-facing vocabulary (§9.4). They already are: the Claim Office overlay that opens this
very ledger renders the identical four labels through `trackLabel()` at
`src/game/RunManager.ts:385-393`. Shipping them is consistent with merged canon, not an
invention. ⚠️ See F-1190-1 for *how* it reused them.

## Evidence

| Gate | Result |
|---|---|
| `node scripts/drain-block-check.mjs` (§3.0, ran first) | ✅ CLEAR — `factory-m3-05c-run-ledger-meta-earned` |
| `npx tsc --noEmit` | exit 0, no output |
| `npm run build` | ✓ built in **1.43 s** |
| `e2e/m3-05b-run-ledger.spec.ts` desktop + 390 px mobile, `--workers=1` | **10 passed / 0 failed (20.4 s)** — was 6 before the slice |
| adjacent `e2e/meta-presence.spec.ts` (unmodified) | **16 passed / 0 failed (53.0 s)** |
| `test:node-guards` (before any gate, per s1187) | **61/61 pass, fail 0** |
| collection guards re-run on the **merged** tree | 4/4 — the new `MetaProgress` import into a UI module does not break node-only collection |
| console / page errors | zero (`assertNoErrors` in all four browser cases) |
| screenshot | `artifacts/m3-05b-run-ledger/desktop-chrome.png` + `mobile-chrome.png` |

**Mistake #10 — where does the PLAYER see this in a plain boot?** In the Claim Office → *Run
Ledger*, on any previously-secured run. Confirmed by eye in the desktop screenshot: the
`META EARNED` row renders in the same warm ledger styling as Gold and Duration.

## Merge classification

Base `afd18fe1`. `git diff --name-only afd18fe1 main` and the lane's file set are **disjoint** —
main moved none of the three real files, so every file is LANE-TOUCHED-ONLY and the merge is a
clean checkout with no 3-way graft. Four files: `src/ui/RunLedger.ts`, `src/game/RunManager.ts`,
`e2e/m3-05b-run-ledger.spec.ts`, and the runner's report under `tasks/runs/`. All inside
TOUCH-ONLY. Everything else in the two-dot diff was s1189's own commits appearing as phantom
`D`/`M` against the lane's stale base.

## Findings

### 🔻 F-1190-1 — the row reuses the vocabulary but not the function; a canon rename will diverge in silence
Non-blocking. The runner's report states the row "reuses Claim Office's existing `trackLabel`
vocabulary". It reuses the *words*, not the *function*: `trackLabel` (`RunManager.ts:591`) is
module-private and never exported, so `RunLedger.ts:145` re-derives the labels with
`track[0].toUpperCase() + track.slice(1)`. Output is byte-identical **today**, which is why every
gate is green. The exposure is a second naming authority for one player-facing vocabulary: if
`trackLabel` is ever edited — and F-1185-1 is an open naming item, with ADR-003 already reserving
"the Prospector" for the agent — the Claim Office would say the new word and the Run Ledger would
keep saying the old one. **No test would catch it**, because each spec asserts its own literal
string. Cure is one line: export `trackLabel` and import it. Not worth a slice of its own; fold
into the next task that touches either file.

### 🔻 F-1190-2 — you can bank meta, press your luck, die, and the ledger will say you earned nothing
Non-blocking, player-visible, and **the runner found this itself and escalated rather than
silently widening its contract** — the correct call, recorded here so it is not lost.
✓ Re-verified at the code: `secureRun` awards and banks the payout at `:293`, but a player who
then takes *Stay for the Rush* and dies ends the run with reason `'rush'` (`:92`, not `'death'`),
and the `reason === 'secured'` guard at `:269` omits `metaEarned`. So the meta was permanently
earned and applied, and the ledger row for that run is blank. The master explicitly bound `rush`
to no `metaEarned`, so the lane was right to obey its firewall; the mismatch is in the **master's
premise**, not the implementation. This is exactly the press-your-luck path the game encourages.
Recommend widening the guard to `reason !== 'death'` (or `securedRunId === runId`) in the next
ledger slice — one condition, and the sanitizer already tolerates it.

## Owner

Nothing blocking. F-1190-2 is a one-condition fix whenever the next slice opens this file;
F-1189-1 (no Run Ledger entry point on the death overlay) remains the open owner question
about this feature.
