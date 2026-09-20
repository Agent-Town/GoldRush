---
source: claude-code
project: Gold Rush
date: 2026-07-31
type: decision
status: merged
---

# AP-06b adapter re-land — s1285 DRAIN ADDENDUM

Companion to `reviews/ap-06b-adapter-reland.md` (the runner's READY-FOR-GATES report). That file is the implementer's account; this one is the fire-side gate, the merge classification, and the honest record of how the content actually reached main.

**Verdict: MERGED.** Slice `ap-06b-adapter-reland` · branch `lane/e2-arsenal` · tip `0d6357bb` · landed in **`e4336ba8`** — which is *not* a commit I authored, see **F-1285-1**.

## What it does

Production standing orders now reach the world. Before this, `Game.ts` installed the agent stub with a five-member adapter literal that exposed neither `panAt` nor `placeBuilding`, so `ToolSurface.pan_at` resolved `undefined` → `NO_SYSTEM_API` and **HARVEST was inert in production**; `place_building` fell back to `placeBuildingThroughGame`, which reads `buildSystem` off that same absent literal, so **BUILD was inert too**. Both failed loudly rather than silently, which is why nothing looked broken. This re-lands the two adapter members from the reviewed salvage payload `2f216af0` and declares `place_building` at the owner's ruled level 3.

## Merge classification (re-derived, not inherited)

`node scripts/lane-freeze-classify.mjs lane/e2-arsenal` at tip `0d6357bb`: base `9003d5e1 (archive: pruned by the A3 rewrite)`, **paths=11 — DUPLICATE 0 / LANE-ONLY 11 / MAIN-ONLY 0 / BOTH-MOVED 0**. Every one of the 11 had `main == base`, so a path-scoped checkout was exactly the lane's change with no main loss. Merged with `git checkout lane/e2-arsenal -- <the 11 paths>`; never a branch merge, never a file copy.

⚠️ The lane's two-dot diff **also** showed `STATUS.md`, `logs/*`, `tasks/BACKLOG.md`, `tasks/goals.json` and the lane-d master as changed. Those are **main-moved-since-base**, not lane work, and were deliberately not taken. A blind `git merge` or a whole-tree copy would have reverted four fires of bookkeeping.

## The protected clusters survived — verified by probe, not by trusting a diffstat

`git diff --cached --numstat -- src/game/Game.ts` = **46 / 0** on the merged tree, re-derived after the checkout rather than quoted from the runner. s1283's F-1283-1 named two clusters that die if the runner takes the file instead of the hunk; both were probed directly in the lane's blob:

| token | count | cluster |
|---|---|---|
| `TRAIL_GUIDE_DWELL_MS` | 2 | Trail Guide (`e3ee53d6`, main-only, NOT an ancestor of the salvage branch) |
| `pendingTrailGuideLines` | 3 | Trail Guide |
| `trailGuideTimer` | 5 | Trail Guide |
| `showTrailGuide` / `dismissTrailGuide` | 3 / 10 | Trail Guide |
| `benchSeeds` / `getDebugSeed` / `seedMode` | 2 / 8 / 1 | bench-seed + submission-policy telemetry |
| `panAt` / `placeBuilding` | 1 / 1 | the re-landed payload |

## The `m4-06:384` voice change — root cause CONFIRMED at source

The master forbade repainting this assertion without a mechanism, and said an unexplained voice change is a finding rather than a test-maintenance chore. The runner's explanation holds when read at source:

- `src/agent/Voice.ts:44-46` hard-codes `'pan...'` for **exactly** the `pan_at` + `!ok` + `NO_SYSTEM_API` case.
- `agentBark` (`:60-63`) is `lines[Math.abs(index) % lines.length]` over `AGENT_BARKS.pan = ['pan...','sift...','shine','banked']` (`:8`), so ordinal 2 → `'shine'`.

Wiring the adapter removes the `NO_SYSTEM_API` branch, so the bark necessarily falls through to the rotation. **This is a consequence of the fix, not a repaint.** F-1217-1's explicitly-open question ("the supersession hypothesis does not explain it") is answered.

## Gate evidence — all re-derived this fire, fire shell, `--workers=1`

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `vite build` + `scripts/asset-diet.mjs` | green |
| node guards (35 files) | **190/190 pass, 0 fail** — count derived from the run, not inherited |
| own spec `ap-standing-orders` | **10/10**, both projects |
| adjacent agent battery (m4-01/05/06/07/08/09/10, task-026) | 62 passed, 1 skipped, **1 failed** → F-1285-2 |
| `agent-view`, `night-light-doctrine` | pass |
| `e2-arsenal` | 2 failed → pre-existing F-1281-2 |

⚠️ **Adjacent suites were derived by grep, not inherited from the runner's list.** `grep -rln "place_building\|prospector-ability\|auto_pan\|ToolSurface\|agent.capabilities" e2e/` surfaced three specs the runner never ran: `agent-view`, `night-light-doctrine`, `e2-arsenal`. Two are green; the third carries the known F-1281-2 red. Had I trusted the runner's list I would have reported a clean board and missed both reds below.

## Both reds fingerprint-matched to pre-existing causes

**`e2-arsenal.spec.ts:87`, both projects** — fails at `:100`, `placeFree('turret', 0, 10)` → `false`. This is **F-1281-2** verbatim: already open, already control-armed by s1281 on clean main (`45b2ed1a`, detached worktree, `--workers=1`, identical failure on both projects). Structurally it cannot be this merge's: `placeFree` (`Game.ts:1878`) is a `__GR_TEST__` hook routing straight to `buildSystem.placeFree`, and never reads the agent adapter literal these 46 lines added. **lane-d is diagnosing it live** under the master s1284 authored.

**`m4-06-embodiment.spec.ts:395` mobile-chrome** — control-armed this fire, **not caused by this merge**. See F-1285-2.

## Findings

### F-1285-1 (s1285, CLOSED-AS-RECORDED — bookkeeping, no content lost)

**A concurrent writer swept this drain's staged index into an unrelated commit.** At 11:18:45 a process authoring as `Claude (Cowork orchestrator)` committed `e4336ba8` *"LB-03: standings learn difficulty (owner question exposed the blind row) + round-2 plays vein-hunter too"*. That commit contains **LB-03's three files and all eleven of this drain's staged paths** — `Game.ts` +46/−0, `AgentConsent.ts`, `ToolSurface.ts`, the four specs, the conformance guard, this slice's review and both screenshots.

✓ **No content was lost and no gate was skipped** — every path had already passed the battery above; only the commit boundary is wrong. ⚠️ **But the ledger now lies in a specific, searchable way:** a future session running `git log --oneline --grep ap-06b` finds nothing, and the ap-06b merge appears under a standings-difficulty headline. That is Mistake #16's shape inverted — there, an announcement read like a completion; here, a completion hides under someone else's announcement.

➡️ **Not repaired by rewriting history**, deliberately: another writer is active on main, and CLAUDE.md §7 forbids the irreversible move. The repair is this addendum plus the `goals.json` leaf, which both name `e4336ba8` explicitly.

⚡ **The lesson is a law gap, not a mistake by either writer.** CLAUDE.md §4.2 says "path-scoped `git add` only" and §7.6 says "two writers might touch main's tree at once → serialize". Both were followed by me — I staged path-scoped and I held the STATUS lock. **The lock did not protect me, because the other writer never read it.** A staged-but-uncommitted index is a shared mutable resource that no lock in this factory covers, and the window between `git add` and `git commit` is exactly where a drain is most valuable and least defended. ➡️ **Recommendation for the next attended session: stage and commit in one action** (`git commit -o <paths> -m ...` or `git add && git commit` with nothing in between), and treat any gap as a hazard rather than a convenience.

### F-1285-2 (s1285, OPEN — a `--workers=1` drift red that the fire shell manufactures and the lane shell does not)

`e2e/m4-06-embodiment.spec.ts:395` *"permission-denied receipts do not send the Prospector to the denied target"* fails on **mobile-chrome** at `:410`, `distance(after.position, before.position)` **0.4846** against a `< 0.45` threshold — a 7.7% tolerance miss, with the semantic assertions (`after.moving === false`, target unchanged) never reached.

✓ **Rate-measured on both arms, same shell, same hour, `--workers=1`, `--repeat-each=5`:**

| arm | tree | result |
|---|---|---|
| merged | main + this slice | **4/5 failed** |
| control | `0b87c662 (archive: pruned by the A3 rewrite)`, pre-merge, detached worktree, external server on scratch port 5234 | **5/5 failed** |

➡️ **The merge is exonerated — the red is *more* frequent without it.** The control used a detached worktree on a scratch port precisely so it could not contend with lane-d's live run (Mistake #12).

⚠️ **The interesting part is what this does to a law surface.** F-1270-1 and `scripts/fire.md` §3.1 record `--workers=1` → **0 drift reds / 18** in the fire shell. This is a drift red **at `--workers=1`**. So serialisation is **necessary but not sufficient**: it removes the 6-worker starvation, not the fire shell's per-job CPU ceiling itself (F-1269-1). The runner reported this same spec green in the **lane** shell (73 passed, 0 failed) — so the shell, not the slice, is the discriminator.

⚠️ **Named confound, not hidden:** lane-d was running a heavy Codex job throughout both arms, so the machine was loaded for control and merged alike. That is what makes the *comparison* sound and the *absolute rate* untrustworthy. **Do not quote "5/5" as this test's standing failure rate on an idle machine — it has not been measured there.**

**GATE:** re-run both arms on an idle machine before deciding. If it stays red in the fire shell and green in the lane shell, this is an instrument finding (amend §3.1: `--workers=1` is a floor, not a cure) and the threshold at `:410` should be re-derived rather than nudged. If it goes green when idle, it is a load ceiling (the F-1141-3 shape) and belongs in the flake ledger with its ceiling named. **Do not widen the 0.45 tolerance until that question is answered** — the number encodes "the Prospector did not walk to the denied target", and loosening it to silence a load artifact would retire a real permission assertion.

### Carried from the runner's report — four consent-lifecycle gaps, out of firewall, NOT folded in

The runner's second-opinion review found these and correctly left them alone. They are real and they matter for the *broader* place-building consent story; none invalidates this slice's world-state proof.

1. Direct `ToolSurface.place_building` still inherits the generic side-effect gate at **rung 1**, though the capability advertises rung 3.
2. `StandingOrders.requiredAbility()` does not map BUILD → `place_building`, so **revoking the new checkbox does not block a BUILD order**.
3. `RunSuspend.decodeAgent()` strips `place_building`, so a new save can restore it as `false`.
4. `LockstepClient.normalizeLockstepAction()` drops multiplayer `set_agent_ability` actions for `place_building`.

⚠️ **№2 is the one to carry first** — a consent control that does not actually withhold consent is a player-facing correctness bug, not a polish item.
