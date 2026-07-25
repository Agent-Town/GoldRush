# tl-03-window-3-ticker-stats — the Ticker/Gazette quotes the ONE endpoint

**Slice:** `lane-a-tl-03-window-3-ticker-stats` (FIRE-AUTHORED s1042) · **Branch:** `lane/m3` ·
**Tip:** `46146b0b` · **Base:** `d79e8941` (= merge-base; both files are NEW on main)
**Drained:** s1043 fire, 2026-07-25 · **Merge:** path-scoped, no 3-way (see Classification)

## Verdict
**MERGE — GREEN.** Both files are additive new tooling; zero game `src/`, zero `functions/`, zero `site/`,
zero approval-flow. The two riders s1042 attached to this drain are **discharged by my own runs, not by the
runner's report** (§Riders). Two findings, both non-blocking: **F-1043-1** (a broken endpoint-constant read
degrades to the quiet-wire line rather than complaining) and **F-1043-2** (the live endpoint answers
`200 {ok:true, empty:true}` with `allTime: 0` — the wire is *fine*, the county's book is *empty*, and the
tool cannot currently say the difference; the deeper question of why weeks of family play recorded zero runs
is on the owner's desk).

## What it does
Closes the last open window of the owner-ordered Assay Office spine (`specs/accounts/README.md:29,32`;
owner 2026-07-09: *"see it being alive immediately"*). Windows 1 and 2 are player-facing surfaces that read
`GET /api/stats`; Window 3's consumer is a **fire drafting a ticker digest**, so the faithful implementation
is a **quoting tool**, not a render surface:

- `scripts/ticker-stats.mjs` (+157) — fetches the aggregate endpoint and prints ready-to-paste
  ledger-voice lines, each ≤140 chars, every number traceable to a payload field. `--json` passes the raw
  payload through; `--url` overrides the endpoint for harnesses. Honours *"no surface computes its own
  truth"*: it **renders** fields and derives nothing — no ratios, no trends, no "up from yesterday".
- `scripts/test-ticker-stats.mjs` (+86) — fixture-driven, **zero network**, mirroring `scripts/test-stats.mjs`:
  populated → exact expected lines; `empty` → quiet line; unreachable/500/garbage-JSON → quiet line, no
  throw; **poisoned fixture → the deny-list guard must throw** (both on the rendered path and the `--json`
  path); plus an assertion that the default URL really is read from the shipped owner.

**Scope 2 was answered without touching a shipped surface** — and this is the neat part of the
implementation: rather than re-typing the URL or refactoring `liveStats.ts` to export it, `statsEndpoint()`
reads `src/encyclopedia/liveStats.ts` and regexes out `const STATS_ENDPOINT = '…'`. One source of truth,
zero shipped-client change. The pre-existing Window-1/Window-2 duplication (`site/assay-office.js:1` hard-codes
the same string separately) was **reported, not fixed**, exactly as the master ordered.

## Evidence (real numbers, run by the drain on the merged tree)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green** — asset-diet ran (235 GLBs 598→93 MB, 53 PNGs 183→24 MB) |
| `node scripts/test-ticker-stats.mjs` | **PASS** — populated, empty, 3 failure modes, poison control, shared URL, `--json` |
| **Mutation control** (guard neutered by me) | **RED as required**: `AssertionError: Missing expected rejection: poisoned contract copy trips the deny-list guard`, exit 1 |
| Guard restored | harness green again; `git diff --stat HEAD` back to **+243 / 2 files**, byte-exact |
| `e2e/m1-01-claim-jumpers-death.spec.ts` | **8/8** desktop-chrome + mobile-chrome, 28.3 s, zero console |
| Live `node scripts/ticker-stats.mjs` | `the wire is quiet.` (see **F-1043-2** — the wire is not actually quiet) |
| `node scripts/ticker-stats.mjs --help` | carries the scope-6 **STATS LINE** note |
| 140-char cap headroom (measured) | longest line = **96 chars** at count=42; **132 chars** at count=99,999,999 → cap cannot bite below 10-digit tallies |

No screenshots owed — no rendering surface (per the master).

## Riders from s1042's handoff — both discharged by running, not reading
1. **"Prove scope 5d's poisoned-fixture guard actually THROWS — a green harness with a dead guard is the
   F-1026-1 class."** ✅ **Discharged by my own mutation run.** I added `if (lines) return;` to the top of
   `guard()`, ran the harness: it failed with `Missing expected rejection … poisoned contract copy trips the
   deny-list guard` (exit 1), then restored the file from the index and re-greened it. The guard is load-bearing.
   *(The runner claimed the same result; the point of the rider is that a claim is not evidence.)*
2. **"Scope 2's shared-endpoint finding should be REPORTED, not silently fixed across shipped surfaces."**
   ✅ **Held.** `git show --stat 46146b0b` = exactly two files, both new, +243/−0. No `src/`, no `site/`,
   no `functions/` byte moved. The duplication is reported in the runner's notes and carried forward here.

## Classification / merge
| File | Status | Handling |
|---|---|---|
| `scripts/ticker-stats.mjs` | **LANE-TOUCHED**, new file (absent on main) | path-scoped checkout, byte-exact |
| `scripts/test-ticker-stats.mjs` | **LANE-TOUCHED**, new file (absent on main) | path-scoped checkout, byte-exact |

Base `d79e8941` is the merge-base and main had never held either path ⇒ **no MAIN-MOVED file, no 3-way graft,
no conflict surface.** Merged onto clean main (`c2044591`), `git add` path-scoped to `scripts/` only.
`package.json` was deliberately **not** touched: the repo's convention has no `test:` entry for
`scripts/test-stats.mjs` either, and the master said to add one only if the convention already existed.

## Findings
**F-1043-1 (non-blocking, one-line fix, corrective owed) — a broken endpoint read degrades silently.**
`statsEndpoint()` throws a plain `Error('STATS_ENDPOINT not found')` when the regex misses (constant renamed,
file moved, quoting style changed). That throw is caught by `draftTickerStats`'s catch, which re-throws only
`UnsafeTickerCopyError` and otherwise returns the quiet-wire line — so a **broken tool** and a **down endpoint**
are indistinguishable to the drafting fire, which is precisely the confusion Window 3 exists to prevent.
*Mitigation already in the slice:* `scripts/test-ticker-stats.mjs` asserts
`assert.match(await statsEndpoint(), /^https:\/\/.+\/api\/stats$/)`, so a rename turns the **harness** red —
the failure is caught in CI-shaped runs, just not at drafting time. Recommended fix: let the endpoint-read
failure propagate (or print a distinct "the endpoint could not be read" line) instead of masquerading as a
quiet wire. Fails safe either way — it never invents a number, which is the higher law.

**F-1043-2 (non-blocking for this merge; a real question for the owner) — "the wire is quiet" is currently a
misreading of a healthy endpoint, and the county's book is empty.** I probed the live endpoint directly:
`GET https://gold-rush-3in.pages.dev/api/stats` → **HTTP 200**, `application/json`,
`{"ok":true,"empty":true,"message":"the office opens with the first assay","stats":{"runs":{"today":0,"sevenDays":0,"allTime":0},…}}`.
Two things follow, and they are separate:
- **(a) A vocabulary divergence this slice inherited from its own master.** Scope 3 explicitly ordered the
  graceful-empty state to print the quiet-wire line, so the runner obeyed — but the shipped Window 2
  (`src/encyclopedia/liveStats.ts`) distinguishes them: `empty === true` → *"the office opens with the first
  assay."*, unreachable/non-200 → *"the wire is quiet."*. The three-window law says all three windows render
  the one endpoint; Window 3 currently collapses two states the other two windows keep apart, and reports the
  alarming one. **This is a master defect, not a runner defect** — worth a one-line corrective so a drafting
  fire is never told the wire is down when it is up.
- **(b) The tallies are zero.** The binding fix (F-tl01-1, `41d8e1ae`/`47c5fb20`) did land, and the endpoint
  serves the correct shape — but `allTime: 0` means either nothing has been played against the deployed
  build since the fix, or run-end beacons are not being persisted/counted. I did **not** chase this: it
  crosses into `functions/` + deploy state and would be inventing scope. Flagged to the owner's desk with the
  measurement attached, because "see it being alive immediately" is the owner order this whole spine serves,
  and right now every window on it honestly renders zero.

**Non-findings, retired by measurement (recorded so nobody re-opens them):**
- *"The 140-char cap shares the throw path with the deny-list guard, so a merely-long line kills the tool."*
  True in structure, **irrelevant in practice**: measured, the longest emitted line is the 6-bucket
  `Run lengths` line at **96 chars** with the fixture's counts, and **132 chars** even at 99,999,999 per
  bucket (each extra digit adds 6 chars). It cannot trip below **1,000,000,000 runs per bucket**. Not worth
  a corrective; worth the number, so the next reader doesn't re-derive it.

## Ledger
BACKLOG lane-a header + the s1042 sweep entry updated to SHIPPED in the drain commit; goal leaf
`tl-03-window-3` → `merged` + merge hash in the same commit. **No gazette item and no deploy**, by the filter
laws: the merge is drafting tooling with zero player-visible change and zero `src/`.
**TL-03 is now COMPLETE — all three windows of the owner-ordered spine are shipped.**
