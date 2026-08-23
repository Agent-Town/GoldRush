# ap15-frontier-registry — the county keeps frontiers

**Slice:** `ap15-frontier-registry` (AP-15 "The Assay of Minds", ships-first items 2–4)
**Branch:** `lane/d` · **tip** `2a102749f` · **base** `e49c36ba3`
**Merged:** `d87b9097001dab29dabb79fff8f18820d5c70ee1` (main, `--no-ff`)
**Drained:** s2251, 2026-08-24 — *takeover drain*: s2250 built the gate worktrees and died mid-attribution.

## VERDICT: MERGED — the adjacent red is main's, proven by control, not this slice's.

## What it does

The county now keeps a record book. `assets/contracts/frontier-registry.json` pins the leanest
verified mark per contract+seed, era-stamped, in the null-floors shape; `scripts/frontier-registry.mjs`
re-derives it from the boards and carries a `--check` mode. The Field Book renders axes 1–3
(Outcome · Economy · Cost — the owner's names, ruling 3) per row from data the standings seam already
carries, and absents honestly where a row is unverified. When the regen detects a new frontier it emits
one retained ledger event, which `editionLadder` consumes as exactly one Herald item ("A NEW FRONTIER
IS ENTERED"). The old mark stays in the book under its own era stamp — nothing is erased, which is
ruling 1 implemented rather than paraphrased.

**Ranking order is untouched.** That is AP-15 Law 1 (the assay is information, never ordering) and it
is the thing most worth checking in a slice like this; the diff adds no verdict or rank path.

**The honesty guard fired, and that is the headline of the run.** The master anticipated a thin book
and forbade inventing rows. The registry seeds **one** verified row, from the legacy Cloudflare KV
backend — the L3 cutover started SQLite empty — and the Homesteader's Crown is recorded **ABSENT**
because no overtime evidence exists yet. The runner said which backend it seeded from and why. A
one-row record book is the truthful state of the county today.

## Evidence — merged tree, detached worktree `gate-s2250`, `--workers=1` (§3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc=0 |
| `npm run build` | green, **1.54s** |
| `e2e/field-book.spec.ts` + `e2e/gazette-living.spec.ts` (own specs) | **34/34** desktop + mobile |
| `scripts/frontier-registry.test.mjs` (new) | **3/3** — determinism, exactly-one dethronement, `--check` clean |
| Adjacent `milk-county-board` + `lb-01-county-standings` | **12 failed / 30 passed** — see attribution |
| `test:node-guards` | **not run, not owed** — the diff touches none of `src/sim/`, `src/systems/`, `src/entities/` (F-1460-1's key) |

### The attribution — the reason this drain took two fires

s2250 locked, found the county-board suites red on the merged tree, started a clean-main control, and
died (`FIRE END rc=0` 23:47:12) two minutes after its own stamp commit. Its lock line survived it and
read `ACTIVE` with a commit recent *by construction* — the §1.1 corpse case exactly.

The control was completed here. Both arms are identical worktrees, same node, same `--workers=1`,
run back-to-back in the same shell; the **only** variable is the merge:

| Arm | Tree | Result |
|---|---|---|
| Merged | `gate-s2250` = merge(`e49c36ba3`, `2a102749f`) | 12 failed / 30 passed (7.0m) |
| **Control** | `gate-s2250-ctl` = `e49c36ba3` (clean main) | **12 failed / 30 passed (6.9m)** |

The failing set is **identical test-for-test, both projects** — the same 3 `lb-01` tests (`:247`, `:630`,
`:730`) and the same 3 `milk-county-board` tests (`:374`, `:400`, `:442`), each on desktop and mobile.
A slice that broke something in those suites would move the list; it does not move by one test.
**The red is main's and predates this branch.**

`red-inventory-lookup` records `milk-county-board` CLEAN as of its 2026-08-11 snapshot and warns the
snapshot is 12 days stale with 145 commits since — its own guidance is *"a red you see now is NOT proven
yours — take a control run before concluding"*. Taken; concluded the other way.

## Findings

**F-2251-1 — 12 county-board tests are RED on main, pre-existing and undocumented.** OPEN.
Not this slice's, not blocking it, and not fixed by refusing it. But it is a live red on a
player-facing surface (`lb-01:730` is *"Claim Ledger renders the seeded county board and its empty
contract state"*), and the red inventory still records the suite as clean, so the next fire to gate
anything near the county board will re-pay this same 14 minutes of control-running. It rotted onto main
somewhere in the 145 commits since 2026-08-11.
➡️ Owed: a bisect-and-fix corrective, plus a red-inventory snapshot refresh. Filed to BACKLOG.

**F-2251-2 — inherited null-floor `--check` era-stamp mismatch.** NON-BLOCKING, reported by the runner
rather than fixed, which is the correct firewall behaviour. The mismatch is the era stamp alone
(`26e9a9d9f` vs `8f16b97c6`); the protected floors themselves are untouched. It arrived with the L4
merge, not with this slice.

## Merge classification

Base `e49c36ba3`; main moved by **exactly one commit** between gate and merge (`28f34976f`, this fire's
lock line, `STATUS.md` only), so the gated tree still describes the merged tree. `git merge-tree`
proved the three-way clean (0 conflict lines) before anything was touched. Every path is LANE-TOUCHED;
the single MAIN-MOVED file is `tasks/BACKLOG.md`, auto-merged on disjoint lines. The 17 `.png` changes
are screenshot rebaselines — factory churn under F-1407-1, expected for a slice that changes what the
Field Book renders.
