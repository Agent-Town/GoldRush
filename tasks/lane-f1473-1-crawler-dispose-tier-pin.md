CODEX: model=gpt-5.6-sol effort=xhigh

# lane-f1473-1-crawler-dispose-tier-pin — pin the post-death Crawler 3D state on the lite and failed tiers (closes F-1473-1)

**FIRE-AUTHORED s1475 (attended review welcome).** TEST-ONLY corrective. It closes the GATE written into F-1473-1 by the s1473 drain of `e3-crawler-socket` (merged `682f632f`, review `reviews/e3-crawler-socket.md`).

🚫 **THIS SLICE CHANGES NO PRODUCTION CODE.** You are pinning behaviour that already shipped, not revising it. `src/systems/CrawlerBossSystem.ts` is on the NO list. If you finish and believe the *behaviour* is wrong, say so in your report — do not fix it here.

ROLE: implementer on lane-a. WORKDIR: `worktrees/lane-a` (branch `lane/a`). Commit prefix `crawlerpin:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 exists because a master offered the refresh as a conditional and put a currency probe beside it; the runner ran the probe first against a stale lane and truthfully reported "stale lane" about a lane that was one command from correct — 27,551 tokens, zero edits. The probe below CANNOT distinguish "the lane is stale" from "I asked too early". So the refresh is not a conditional. Do step 1, then step 2.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```
*(Measured s1475 at authoring time: `lane-usable.mjs` reports lane-a `USABLE ahead=0 tracked-dirt=0`, but BEHIND main. USABLE is not CURRENT — that is exactly why step 1 is unconditional.)*

**STEP 2 — CURRENCY PROBE (only after step 1):**
```
grep -c "never checked that the INSTRUMENT could be CONSTRUCTED" tasks/BACKLOG.md
```
Expect **1**. If **0**, step 1 did not take — STOP and report "refresh did not land", do NOT report a stale lane.
*(Measured to return exactly 1 on main at dispatch time, per F-1425-2. Deliberately apostrophe-free and on a single physical line: `grep` is line-oriented and prose wraps, so a key spanning a line break matches nowhere — including in the file it was copied from.)*

**STEP 3 — SAFE-DUPE:**
```
grep -c "data-crawler3d-state', 'disposed'" e2e/wire-crawler-3d.spec.ts
```
Expect **1** — today exactly ONE test asserts the disposed state, the GLB-tier test at the end of *"mounts the Crawler GLB, flips all three damage morphs, and disposes on kill"*. If **≥2**, the tier pin already exists — STOP and report; do not re-derive.
*(Measured s1475 on main: **1**. This probe is semantic, not incidental: your whole job is to make this number grow.)*

**STEP 4 — LANE SAFETY:** `git branch --show-current` = `lane/a`. Any dirty *tracked* blob not reachable in git → STOP.
⚠️ **FACTORY-CHURN EXCEPTION (F-1407-1 / F-1266-1):** modifications under `logs/**` and `artifacts/**` are the factory's own background churn and are **NOT** lane dirt. Ignore them in step 4; they must never STOP this run.

## WHY

`tasks/BACKLOG.md` F-1473-1 reads, in part (cited by content per F-1310-1 — grep the finding id):

> The old teardown read `components.size === 0 && (crawler3dState === "loading" || === "ready")`; the refactor rewrote it as `components.size === 0 && crawler3dState !== "disposed"`, which is **strictly broader**. Two constructor-reachable states now hit it that previously could not: **`lite`** (set on the lite performance tier) and **`failed`** (unparseable GLB).

And its reusable half, which is the reason this task exists at all:

> `wire-crawler-3d.spec.ts:151` and `:163` are the *only* tests that reach `lite` and `failed`, and **both assert immediately after `spawnCrawler(page)`, while the boss is still ALIVE**. Neither kills the component ladder, so neither ever executes the changed line. Both passed, and their green is silent on this.

Its GATE, verbatim: **"closes when a spec kills the full component ladder on the lite tier and pins the intended post-death `crawler3dState`."**

## GROUND TRUTH — MEASURED s1475 BY READING THE CODE, SO YOU DO NOT HAVE TO REDERIVE IT

1. The guard is live at `src/systems/CrawlerBossSystem.ts`, the single line reading `if (components.size === 0 && this.crawler3dState !== 'disposed') this.disposeCrawler3d('disposed');`
2. `private disposeCrawler3d(nextState)` assigns `this.crawler3dState = nextState` and then calls `this.publishCrawler3d()`, which writes the canvas dataset. So on **any** tier where the components reach zero, the published state becomes `disposed`.
3. **THEREFORE THE EXPECTED VALUE FOR BOTH NEW ASSERTIONS IS `disposed`.** ⚠️ **If you measure anything else, that is a FINDING — report it and STOP. Do NOT edit the assertion to match what you observed.** A test that pins whatever happened blesses the bug it was written to catch.

## ⚠️ THE ONE HARD PART, GIVEN AWAY DELIBERATELY — `destroyComponent()` CANNOT BE REUSED AS-IS ON THESE TIERS

The existing kill ladder in the GLB test is `for (const componentId of COMPONENTS) await destroyComponent(page, componentId)`. **That helper calls `awaitMounted(page)`, and `awaitMounted` asserts `data-crawler3d-state` is `ready` with a 15 s timeout.** On the lite tier the state is `lite` and on the invalid-GLB tier it is `failed` — **so a naive reuse fails after 15 s per component, on an assertion that has nothing to do with what you are testing.**

*(This is written down because the fire that authored the previous master did not probe whether its harness could be constructed for its target, and the run cost 124,606 tokens to discover the door was locked — F-1475-1. The door here opens; the hinge is `awaitMounted`.)*

Everything else in `destroyComponent` is tier-agnostic: the suspend/restore HP edit, `crawlerParts`, `setBalance('blast.damage', …)`, `launchBlastAt`, and the poll that the component is gone. Only the mount-wait is GLB-specific. That is your seam.

## SCOPE — numbered, each item testable

1. **Make the kill ladder tier-agnostic.** Factor the mount-wait out of `destroyComponent` so the same blast-kill sequence can run when no GLB is mounted — e.g. an options parameter defaulting to today's behaviour (`awaitMount = true`), or a shared inner helper that `destroyComponent` wraps. **The existing GLB test must keep waiting for the mount exactly as it does now**; its call site and its returned renderer counts must be unchanged.
2. **Pin the LITE tier.** In *"LITE keeps the placeholder and never requests the Crawler GLB"*, after the existing placeholder assertions, kill all three `COMPONENTS` and then assert `data-crawler3d-state` is `disposed`.
3. **Pin the FAILED tier.** Same addition in *"invalid Crawler GLB bytes keep the placeholder presentation"*.
4. **Assert the siblings did NOT move**, in both new blocks: `data-crawler3d-source` stays `placeholder` and the mounted flag stays false. F-1473-1 claims exactly this and nothing currently checks it; if either moved, the change was not as narrow as the finding says — report it.
5. Both new blocks keep the existing `expect(errors).toEqual([])` console-error assertion at the end.

## TOUCH-ONLY

- `e2e/wire-crawler-3d.spec.ts`

## NO — firewall

1. 🚫 **`src/systems/CrawlerBossSystem.ts`.** This slice pins shipped behaviour; it does not revise it. Do not widen, narrow or "clean up" the guard.
2. 🚫 **Any other spec file.** If you believe a sibling suite has the same blind spot, report it — do not fix it here.
3. 🚫 **The GLB test's assertions, baselines or artifact writes** (`renderer-counts-*.json`). Item 1 must be behaviour-preserving for that test.
4. 🚫 `src/**` generally, `Balance.ts`, and all contract/asset data.

## SELF-CHECK — run these and paste the real numbers

1. `npx tsc --noEmit` — clean.
2. `npx playwright test e2e/wire-crawler-3d.spec.ts` — **both projects (desktop + 390px mobile)**. Report pass/fail counts per project. Every test in the file must pass, not only your two.
3. Confirm by `--list` that your two new assertions live in tests that actually run (a spec named on a command line proves nothing about whether your block executed).
4. Zero console/page errors in both projects.
5. State the measured post-death `data-crawler3d-state` for each tier explicitly, even though you expect `disposed` both times.

READY-FOR-GATES + report: where you cut the mount-wait seam and why that shape, the two measured post-death states, per-project test counts, confirmation that the GLB test's renderer baselines are byte-unchanged, and any finding you were told to report rather than repair.
