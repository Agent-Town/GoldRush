# Review — door-epic-envelope-v3 (the direct door admits a lawful epic run)

**Slice:** `door-epic-envelope-v3` · **branch:** `lane/c` · **lane tip:** `30454d02c`
**Gated commit:** `b255b2920` (detached worktree `gate-s2326`, §3.0b custody)
**Merge:** `314b4533cb15d9e129598f6a4bab0f718598aea1` (main, `--no-ff`)
**Drained by:** s2327, completing the drain s2326 left merged-but-ungated when it died mid-battery.

## Verdict

**MERGED.** All gates the master names are green, and the Baron gate — the master's named
acceptance condition — passed by the direct door with both banked tapes verifying and ranking.

## What it does

Re-lands the archived `door-epic-envelope-v2` envelope work (`archive/door-epic-envelope-v2-s2310-stopped-5645c5b9`,
the s2310 runner's preserved six files) onto current main, and corrects the outer lawful-request
allowance that the v2 stop left one measurement short.

The slice replaces four independently-hardcoded ceilings with one derivation chain: a per-contract
run-tape envelope (duration ticks / tape bytes / entries) feeds a reader cap, and `MAX_JSON_BYTES`
is derived from the widest contract envelope plus a 44 KiB metadata allowance rather than being a
bare literal. Both previously-hardcoded `2_000` sites in `functions/api/standings.ts` now read
`envelope.maxEntries` — the four-site problem F-2302-1 named. Oversize requests answer
`413 reel_too_large` rather than `400 bad_json`, so a too-large reel is now distinguishable from
malformed input.

`src/playbook/PlaybookFormat.ts` carries the constant split only; `MAX_PLAYBOOK_INTENTS` is intact.

## Evidence

Transcript: `artifacts/door-epic-envelope-v3-gate-s2326.txt` (append-only, two batteries — s2326's
build leg and s2327's completion of the remaining named legs). Both ran against `gate-s2326`, the
detached worktree holding the merge, never against main's tree.

| Gate | Result | Numbers |
|---|---|---|
| `npm run build` (tsc + vite + asset-diet) | rc=0, 17.3 s | s2326 battery |
| `npm run test:stats` | rc=0, 16.5 s | stats 87 · standings **KV 173 / SQLite 173** · ledger HTTP 19 |
| `npm run test:accounts` | rc=0, 5.4 s | **KV 43 / SQLite 43** |
| Playbook suite | 8/10, both failures fingerprint-matched | F-2320-1; focused desktop/mobile rerun 2/2 |
| `git diff --check` | clean | runner-side |

**Both storage arms were exercised on both suites.** The master called this out by name — *"a
KV-only green is exactly the false green that hid the fourth axis"* — so the SQLite/L1 columns
above are the load-bearing half of this table, not decoration.

**THE GATE (the master's named acceptance condition) — both banked Baron tapes by the DIRECT door:**

| Run | Submission | Slip | Claimed == replayed hash | Worker wall |
|---|---|---|---|---|
| `agent-c4ab1b1a-a31090a7-5bb3-4175-bb47-08b9b632a9c8` | `200`, rank 1 | `200` `verified`, ranked | `fnv1a32:2422a5fb` | 112,264 ms |
| `agent-c4ab1b1a-73a114fc-8565-4027-ae7c-e9c694f46f19` | `200`, rank 2 | `200` `verified`, ranked | `fnv1a32:2422a5fb` | 164,815 ms |

Both hashes match the value s2310 recorded server-side (`fnv1a32:2422a5fb`), so the ×2 proof that
was banked behind the storage wall now verifies through a lawful door.

**Four-axis table** (the pinned derivation, quoted from the runner's report):

| Contract | Duration ticks | Tape bytes | Entries | Reader cap |
|---|---:|---:|---:|---:|
| Claim | 18,000 | 592,384 | 3,600 | 802,080 |
| Drill Yard | 18,000 | 592,384 | 3,600 | 802,080 |
| Dry Gulch | 18,001 | 592,544 | 3,601 | 802,080 |
| Night Shift | 22,501 | 736,544 | 4,501 | 802,080 |
| Twin Forks (`e1-twin-banks`) | 18,001 | 592,544 | 3,601 | 802,080 |
| Baron | 20,349 | 667,584 | 4,070 | 802,080 |

Reader-cap derivation: largest lawful tape (E2 Trestle, 757,024 B) + 44 KiB metadata = 802,080 B.
Injected-handlers branch (i) retained — the ledger independently loads `MAX_JSON_BYTES`, so injected
routes use the same derived cap rather than a second copy of the number.

**Allowance measurement (scope item 2 — the measurement is pinned in a test, not the bare number):**
maximum escaped metadata 43,407 B · projected maximum lawful request 800,431 B · cap margin 1,649 B ·
real near-envelope handler request 799,953 B accepted · exact cap accepted · cap + 1 → `413 reel_too_large`.
The v2-era 765,451 B measurement clears comfortably. Independent review during the run found an
escaped-surrogate boundary case; it was fixed and regression-tested through the real handler.

nginx: unchanged and **stated, never edited** — its 1 MiB default exceeds both the 800,431 B maximum
lawful request and the 802,080 B application cap.
`public/skill.md`: unchanged, correctly — it names no ceiling this slice moved (scope item 4 verdict).

## Merge classification

Base `497d09c66`; lane tip `30454d02c`; three lane commits, six files.

All six are **LANE-TOUCHED only**. Main moved during the lane's life by `CLAUDE.md`, `STATUS.md` and
`tasks/**` commits — **zero overlap** with the slice's path set, so there were no conflicts and no
three-way graft was required. Verified rather than asserted: `git diff --stat b255b2920 HEAD` over
all six paths is **empty**, i.e. the merged tree on main is byte-identical to the commit that was
gated. The gated commit is what shipped, not a fresh resolution.

`git merge --no-ff` committed in one act — the merge was never left staged on main (F-1589-5).

## Firewall

**HELD.** The six touched files are exactly the master's TOUCH-ONLY list. `src/game/Game.ts` is
**untouched**, which is the firewall clause that matters most here: the browser `keepalive` fifth
wall is an owner-parked design fork (**F-2310-1**), and implementing either side of it in this slice
would have settled an open owner question. No sim mechanics, no ranking, no worker logic, no
`ops/droplet/**`.

Per scope item 5, stated in one line: **the player submit path still carries the ~64 KiB browser
`keepalive` ceiling** (F-2310-1, owner-parked). This slice's gate goes by the direct HTTP door,
where that ceiling does not exist.

## Findings

**F-2327-1 — non-blocking, recorded for the ledger.** The playbook suite's two reds are F-2320-1's
documented mobile teardown race (`THREE.GLTFLoader: Couldn't load texture blob:` emitted at unload,
victim test rotates). That finding is an **open owner fork** on gate semantics — accept the
signature / make `assetLoadingState` honest / leave it — and it remains open. It did not block this
merge because the signature is documented and the focused rerun was 2/2, but every drain touching a
GLB-loading spec pays this cost until the owner rules.

**No corrective task is spawned by this slice.** The one follow-up the master names is a
**gauntlet act, not a code task**: PUBLIC resubmission of the ×2 Baron rows belongs to the next
deploy's commit, not here.

## GZ-01 verdict

**No gazette item filed, deliberately.** GZ-01 keys on a **player-visible** change, and this slice's
own acceptance evidence establishes the opposite: the player submit path is byte-unchanged
(`src/game/Game.ts` untouched) and still carries the browser keepalive ceiling. What moved is the
server-side door used by agent submissions. The player-visible half of this thread is exactly what
the owner has parked in F-2310-1; when that fork is ruled and lands, that merge is the news.
