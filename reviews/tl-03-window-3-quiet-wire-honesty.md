# tl-03-window-3-quiet-wire-honesty — "the wire is quiet" now means the wire IS quiet

**Slice:** `lane-a-tl-03-window-3-quiet-wire-honesty` (FIRE-AUTHORED s1043) · **Branch:** `lane/m3` ·
**Tip:** `428c01d5` · **Base:** `ab7cba01` (= merge-base) · **Drained:** s1043 fire (drain #2), 2026-07-25

## Verdict
**MERGE — GREEN, and this one is proved by the world rather than by its tests.** Closes **F-1043-2(a)** and
**F-1043-1**, both raised by this same fire's drain of the tooling one commit earlier. All three riders the
master attached are discharged by my own runs. No new findings.

**Authored, run, and drained inside a single fire** — the defect was found by a live probe at ~13:00Z, the
corrective was queued at 20:00:29 local, the runner picked it up in ~30 seconds and finished in ~3 minutes.

## What it does
The shipped Window 3 tool collapsed two states the rest of the spine keeps apart: a **healthy-but-empty**
endpoint and a **down** endpoint both printed `the wire is quiet.` This splits them, using the wording the
spine already ratified rather than inventing a third variant:

- `EMPTY_LINE = 'the office opens with the first assay.'` — **byte-identical** to shipped Window 2
  (`src/encyclopedia/liveStats.ts`) and Window 1 (s261). `render()` now reads
  `if (!validPayload(payload)) return QUIET_LINE; if (payload.empty) return EMPTY_LINE;` — so an *unusable*
  answer still earns the quiet line (scope 2's ordering, made explicit rather than incidental).
- **F-1043-1 closed with a typed error, not a comment:** a new `StatsEndpointReadError` is raised when the
  constant cannot be read, caught in its **own branch before the fetch**, and reported via a distinct
  operator diagnostic — `ticker-stats: could not read STATS_ENDPOINT from src/encyclopedia/liveStats.ts` —
  on **stderr**, while stdout stays paste-safe and the exit code stays **0**. A drafting fire is still never
  blocked (s1042 scope 3 survives); it just stops being lied to.
- Testability without loosening anything: `endpointImpl`, `stderr`, and `readSource` are now injectable, which
  is how the harness asserts the diagnostic **without touching the filesystem or the network**.

## Evidence (run by the drain on the merged tree)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green** (built in 1.08 s; asset-diet ran) |
| `node scripts/test-ticker-stats.mjs` | **PASS** — populated / empty / failures / **invalid shape** / **endpoint diagnostic** / poison control / shared URL / `--json` |
| **Mutation control** (defect re-introduced by me) | **RED as required**: `AssertionError: empty office is not a quiet wire`, `actual: 'the wire is quiet.'` vs `expected: 'the office opens with the first assay.'`, exit 1 |
| Guard restored | harness green; delta back to **+61/−11, 2 files**, byte-exact |
| `e2e/m1-01-claim-jumpers-death.spec.ts` | **8/8** desktop + mobile-chrome, 27.1 s, zero console |
| **LIVE before/after (the acceptance evidence)** | at `5227409f`: `the wire is quiet.` → on merged main: **`the office opens with the first assay.`** — same endpoint, same fire, ~30 min apart |

The live endpoint state that makes the before/after meaningful, measured this fire:
`GET https://gold-rush-3in.pages.dev/api/stats` → **HTTP 200**, `{"ok":true,"empty":true,…"allTime":0}`.

## Riders from the master — all three discharged by running, not reading
1. **"The report must paste the live before/after; a test-only diff that cannot show the flip has missed the
   point."** ✅ I ran **both versions** against the real endpoint myself (the shipped one via
   `git show 5227409f:scripts/ticker-stats.mjs`, earlier in this same fire): `the wire is quiet.` →
   `the office opens with the first assay.` **Real behaviour changed, not just an assertion.**
2. **"The scope-5d control must be shown RED, not asserted green."** ✅ I re-introduced the shipped defect
   (`if (payload.empty) return QUIET_LINE;`) and the harness failed with the case named in plain English —
   `empty office is not a quiet wire` — then restored to byte-exact green.
3. **"Confirm `liveStats.ts` was READ, not edited — `git show --stat` must be the two scripts only."**
   ✅ `git diff --stat ab7cba01 lane/m3` = exactly `scripts/ticker-stats.mjs` + `scripts/test-ticker-stats.mjs`
   (+61/−11). No `src/`, no `functions/`, no `site/`, no `package.json`. The firewall held completely.

## Classification / merge
| File | Status | Handling |
|---|---|---|
| `scripts/ticker-stats.mjs` | **LANE-TOUCHED** only | path-scoped checkout, byte-exact |
| `scripts/test-ticker-stats.mjs` | **LANE-TOUCHED** only | path-scoped checkout, byte-exact |

`git diff --stat ab7cba01 main -- <both files>` was **empty** before the merge ⇒ main had not moved on either
path since the lane's base, so **no MAIN-MOVED file and no 3-way graft**. Merged onto clean main.

## Findings
**None blocking, and none new worth an F-ID.** One observation recorded for the next reader rather than as a
defect: because `validPayload` is checked **before** `payload.empty`, a *malformed* empty payload (say an
older worker revision that omitted `frameP95Global`) would print the quiet line rather than the empty-office
line. That is the ordering the master ordered, and it is the safe direction — an unusable answer should not be
narrated as "no assays yet" — and it is not reachable from the current worker, whose empty payload carries the
full shape (verified: the live 200 response passes `validPayload` today, which is exactly why the before/after
flip is observable at all).

**F-1043-2(b) remains open and is NOT this slice's business:** the endpoint's tallies are zero all-time. That
is on the OWNER'S DESK with the measurement attached (one word: "check" or "expected"). The runner noted the
same limit honestly in its report — *"Zero tallies still cannot explain why no assays were recorded."*

## Ledger
BACKLOG lane-a header + goal leaf `tl-03-window-3-quiet-wire-honesty` → `merged` + hash, in the drain commit.
No gazette item and no deploy, by the filter laws: drafting tooling, zero player-visible change, zero `src/`.
**TL-03 stays COMPLETE — and its last honesty gap is now closed.**
