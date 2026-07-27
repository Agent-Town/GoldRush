# board-chapter-seed-scope — F-1112-1's cure

**Slice:** `lane-board-chapter-seed-scope` (fire-authored by s1112 from F-1112-1)
**Branch/tip:** `lane/e2-arsenal` @ `10e1a24c` (runner(lane-c), 2026-07-27T08:41:58+07)
**Base:** `4a3ee80b`
**Drained by:** s1113 fire, 2026-07-27
**§3.0 drain-block-check:** ✅ CLEAR — `[board-chapter-seed-scope] status="authored"`

## Verdict

**MERGED — a clean, fully-reproduced cure. Control and treatment measured under identical conditions.**

## What it does

Four e2e fixtures seeded the active epoch at the **unscoped** `ACTIVE_EPOCH_KEY`. Because that key is a
member of `PROFILE_DATA_KEYS`, `installProfileStorageScope()` redirects profile-data reads to the
*profile-scoped* name — so `activeEpochId()` never saw the raw seed, returned Frontier, and only the
Frontier tab rendered. The tab each fixture then clicked **did not exist**.

The fix is four one-line edits, `ACTIVE_EPOCH_KEY` → `profileDataKey('robin', ACTIVE_EPOCH_KEY)`.
No import added (`profileDataKey` was already in use on the adjacent `town`/`scores` lines).

## Evidence

### Merge classification

| | |
|---|---|
| merge-base | `4a3ee80b` |
| LANE-TOUCHED | **4 files, all `e2e/`**, 4 insertions / 4 deletions |
| Overlap with main's moves | **NONE** |
| Debris | **ZERO** |
| Landed bytes | **byte-identical to `10e1a24c`** |

### Static gates

`npx tsc --noEmit` **clean** · `npm run build` **green, 1.70s**. (`tsconfig` includes `e2e` — verified.)

### The battery — both arms at `--workers=1` on a settled box

| Arm | Result |
|---|---|
| **clean main (CONTROL)** | **0 / 4** — all four fail **at the chapter-tab click** |
| **with seed-scope** | **3 / 4 green**; `cw-02-escort` red at `:134`, **past** the tab click |
| `board-era-chapters` guard | **3 / 3** — intact |

The control's failure text is the mechanism itself, verbatim:
`waiting for getByTestId('contract-chapter-tab-epoch-2-steamworks')` at `goToContractPage`.
After the fix that tab exists and the click lands.

`cw-02-escort`'s remaining red is `expect(sabotage.rim?.hp).toBe(maxHp - 1)` — 40 vs 39 — a **gameplay
assertion far downstream of navigation**. Per the drain instruction s1112 wrote, *"a move from
red-at-the-tab-click to red-at-a-later-line is a success."* That is exactly what this is.
This reproduces the runner's own report precisely (desktop 3/4, guard 3/3, cw-02 red at `:134`).

## Findings

### F-1113-4 — worker contention faked FIVE reds in this very drain, including the guard. Both arms must share a worker count.

My first treatment run used the **default 4 workers** at `loadavg 18.65` and read **0/4 plus
`board-era-chapters:125` RED** — i.e. it showed the cure doing nothing *and* appeared to break a guard
the slice never touched. Re-running `e2-incline` alone with `--workers=1` passed it in **9.5 s**
(vs a 1.2 min timeout in the batch). At `--workers=1` on a quiet box everything resolved to the true
picture above.

⚠️ **The trap is subtler than "load makes tests red":** I had *already* run a control, at 4 workers, that
also read 0/4 — so the two arms happened to agree and the contaminated treatment run looked
*confirmatory*. It was luck, not method. **I re-ran the control at `--workers=1` before merging**, which
is the only reason the 0/4 → 3/4 delta is trustworthy.

➡️ **Rule: a control is only a control if it shares the treatment's worker count AND box conditions.
When you change how you run the treatment, the old control is void — re-run it.**
(This extends s1103/s1107's contention findings from "measure the mitigation" to "re-measure the control".)

### F-1113-5 — s1112's migration hypothesis was WRONG, and the runner said so honestly. The question is still open.

s1112 hypothesised that `migrateProfileDataKeys()` only migrates when the scoped key is null, and
labelled it a hypothesis. The runner probed storage directly and reported: **after reload the raw epoch
was still raw and no scoped key had been created** — so migration is not doing the hypothesised thing.
It classified this "something else", changed **no `src/**`**, and stayed inside its firewall exactly as ordered.

**This is non-blocking for the merge** (the fixtures are correct either way — they now seed the key the
product actually reads). But whether product-side migration *should* have rescued a raw key is a real,
unanswered product question. Not fire-authorable: it touches `src/**` storage-migration semantics and
could change live player-profile behaviour. **→ OWNER'S DESK.**

## Merge

Path-scoped `git add` of exactly the 4 `e2e/` files. Test-only ⇒ **no gazette item, no deploy.**
