# f1565-1 — desk-state auditor (advisory)

**Slice:** `tasks/lane-b-f1565-1-desk-state-audit.md` (FIRE-AUTHORED s1565, from F-1561-5 with a corrected cause)
**Branch/tip:** `lane/b` @ `6df0f110c` — runner commit `runner(lane-b): lane-b-f1565-1-desk-state-audit.md`, 2026-08-08T18:23:31+07
**Drained by:** s1566 fire · **Base:** `2599c7936` (merge-base main↔lane/b)

## VERDICT: MERGE — gates green, scope exact, and the tool answers the question it was built for on the live board.

## What it does

Adds `scripts/desk-state-audit.mjs`, an **advisory** reader that answers, per carried OWNER'S DESK item, *is this still open?* — the question no fire could mechanically answer before. It extracts the desk segment from `STATUS.md` line 1 using the **same header rule as `desk-declaration-guard.mjs`** (last `OWNER('S) DESK` occurrence wins; straight or curly apostrophe), pulls both F-IDs and backticked goal-leaf slugs, and classifies each:

- **F-IDs** — via the shared `scan()` (imported, never edited: F-1261-1) as a first pass, then filtered **subject-first**: a BACKLOG row states the state only of the **first** F-ID in its 90-char subject zone. Any other id in that zone is an incidental citation carrying no state. Verdicts: `CLOSED` · `OPEN` · `BOTH` · `OPEN-DESK-ONLY` (recorded only by a `🔺` row the shared census cannot see) · `UNRECORDED`.
- **Slugs** — resolved from `tasks/goals.json`: `merged` → CLOSED, `blocked` → OPEN + its `blockClass`.

Exit 0 always by design (the `drain-block-check` UNKNOWN precedent — a strict default reds the board instead of answering); `--strict` exits 1 **only** when a carried item is CLOSED, i.e. should have left the desk.

**Why this design and not the two F-1561-5 offered:** s1565 measured both. Keying `🔺` as open in the shared `scan()` takes declared-open 143 → 216 and mints **3 double-state conflicts against a baseline of 0** — `findings-state-guard` exits non-zero on conflicts, so that cure lands `test:ledger-guards` red on every fire. The subject-first rule classifies all three correctly. The lane's own report reaches the same conclusion independently and recommends **not** widening the shared vocabulary.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | rc 0 |
| `npm run build` (merged tree) | green — vite built in 3.82s; asset-diet 1,158,214 B vs 1,500,000 B ceiling |
| `test:ledger-guards` node-test set (merged tree) | **15 files / 124 tests / 124 pass / 0 fail**, 9.93 s (was 14 / 115 before this slice) |
| `test:ledger-guards` chained leaves (merged tree) | **12 / 12 PASS** — findings-state · blocker-panel · ruling-propagation · citations · desk-declaration · desk-birth · status-archive-audit · attended-owed-audit · main-lock-gate-guard · janitor-request-rejection · lane-dispatch-safety-guard · nul-audit |
| Playwright | **not owed** — slice touches no `src/**` or `e2e/**` |
| `test:node-guards` | **not owed** — slice touches none of `src/sim/`, `src/systems/`, `src/entities/` (§3 path rule) |
| Manufactured-defect proof (lane) | subject-first filter removed → the `F-1541-2` shape classifies `CLOSED` and `--strict` exits 1 (targeted test 0 pass / 1 fail); filter restored → `UNRECORDED`, 9/9 green. A passing guard never executes its violation path, so the red is the evidence, not the green. |

### The measurement the lane could not make, taken here

The lane's board run printed only `SKIP — line-1 is a lock line` (its line 1 was ACTIVE, and its `STATUS.md`/`BACKLOG.md` blobs were ~23 commits stale — the report says so and correctly refuses to assert them as main's state). Main's line 1 is likewise this fire's ACTIVE lock, so s1566 ran the auditor against **s1565's real handoff desk** (extracted from its archive bullet) with **main's** `tasks/BACKLOG.md` and `tasks/goals.json`:

```
CLOSED=0 · OPEN=5 · BOTH=0 · OPEN-DESK-ONLY=17 · UNRECORDED=0
```

22 items, every one traceable to evidence. **`CLOSED=0`** — nothing carried forward should have been dropped, so the desk was honest. **`UNRECORDED=0`** — no carried item is a ghost. The 4 slug items each resolve to a blocked leaf with its class printed (3 `owner-fork`, 1 `disputed`).

⓵ **This retires a standing disclaimer.** s1561, s1563 and s1564 each carried 22 desk items forward with an explicit *"I did NOT re-verify each item's closure state"* note, because no instrument could. That note is now unnecessary: the question is one command. 17 of 22 land in `OPEN-DESK-ONLY` — exactly the population F-1561-5 pointed at, now visible rather than merely absent.

## Merge classification

Base `2599c7936`. **Main moved on ZERO of the lane's five paths** (`git diff --stat <base> main -- <paths>` empty), so every file is LANE-TOUCHED / MAIN-UNMOVED — no 3-way graft needed, no conflicts to resolve.

| Path | Class | Note |
|---|---|---|
| `scripts/desk-state-audit.mjs` | LANE-TOUCHED (new) | 183 lines |
| `scripts/desk-state-audit.test.mjs` | LANE-TOUCHED (new) | 109 lines, 9 tests |
| `package.json` | LANE-TOUCHED | exactly one edit: appends `scripts/desk-state-audit.test.mjs` to the `test:ledger-guards` `node --test` list. **No new npm script** — an unrooted one reds `gate-caller-audit` (verified: that guard passes). |
| `artifacts/f1565-1-desk-state-audit/report.md` | LANE-TOUCHED (new) | evidence |
| `artifacts/f1565-1-desk-state-audit/lane-board.txt` | LANE-TOUCHED (new) | evidence |

**Custody (§3.0b):** gated in a detached worktree `gate-s1566` at main + the lane's blobs, never in main's working tree, until the verdict was MERGE. `drain-block-check` on the done-move: **✅ CLEAR** (leaf `f1565-1-desk-state-audit`, status `queued`) — run before classification, per §3.0.

## Findings

**F-1566-1 (non-blocking, INFORMATIONAL — for the next fire, not the owner).** The auditor cannot read a desk while a lock is held: `STATUS.md` line 1 begins `ACTIVE` for the whole of a fire's working life, and the tool correctly SKIPs. So the natural place to run it — mid-fire, before deciding what to carry — is the one place it returns nothing. The workable pattern, used for this drain's measurement, is to point `--status` at the **previous** handoff's archived line-1 (`- **s<N-1> handoff (line-1 archive):** …`, strip the prefix), which is what a fire actually wants: *what did I inherit, and is it still open?* No code change proposed — the SKIP is correct behaviour and a lock line has no desk. Worth a one-line usage note if the tool ever gets a law citation.

**F-1566-2 (non-blocking, OBSERVATION).** The tool is shipped but **inert until a law cites it** — nothing in `scripts/fire.md` §4 tells a fire to run it, so it will be used only by fires that happen to read this review. The natural home is the §4 handoff duty, next to the desk-header rule that `test:desk-declaration` already enforces. Not done in this drain: editing `scripts/fire.md` is a law-surface change, and doing it in the same fire that merged the tool would rot the `law-pointer-guard` coordinates in the same commit. Recommend a follow-up master or an attended one-liner.

**No blocking findings.** Firewall respected exactly — `findings-state-guard.mjs`, `desk-carryforward-guard.mjs`, `desk-birth-guard.mjs`, `desk-declaration-guard.mjs`, `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `src/**`, `e2e/**` all untouched by the lane (verified: the lane's diff is exactly the five paths above).

**Player-visible?** No — factory tooling, no `src/**`. **No gazette item owed** (GZ filter law: the review names a player-visible change).
