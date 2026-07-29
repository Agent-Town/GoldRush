# AP-06b — standing-orders adapter wiring (BUILD + HARVEST reach the world)

**Slice:** `ap-orders-adapter-wiring.md` (F-1212-3 corrective, fire-authored s1215)
**Branch/tip:** `lane/e2-arsenal` @ `2f216af0` — base `90c54abc`
**Drained by:** s1217 fire, 2026-07-29
**VERDICT: 🔴 NOT MERGED — BLOCKED ON F-1217-1.** The wiring itself is correct and its own evidence is genuinely good. It is blocked because merging it turns **6 test executions across 3 adjacent specs from green to red on main**, and a matched control proves **this slice is the cause**. The runner reported those failures as *"stale pre-wiring expectations … outside the task firewall"* and did not report that its slice **adds a visible ability row to the player's Prospector panel**.

---

## What it does

`Game.ts:2055` installs the agent surface as an **adapter object literal**, not `this`. It previously exposed five members (`diagnostics`, `economyLog`, `repair`, `collectXp`, `collectGold`), so `ToolSurface.pan_at` and `place_building` both resolved to `undefined` and BUILD/HARVEST were inert — F-1212-3's finding, re-derived and confirmed.

This slice adds two members to that literal:
- **`placeBuilding`** — goes through the legal `BuildSystem.confirmPlacement`, so placement rules stay the law; on success it calls `discoverLedgerBuildable` + `recordCountyAction`. It chose an **explicit named method over leaking `buildSystem`**, which is what the master asked for ("a named method is a contract; a leaked `buildSystem` is a coupling").
- **`panAt`** — captures/restores `HarvestSystem` future-state around a single pan tick so a production pan cannot advance or steal an active *player* channel.

Plus 146 lines extending `e2e/ap-standing-orders.spec.ts` with two new tests. **The new tests are good and answer Mistake #10 properly**: `plain-boot production orders pan a seam and place a real building` boots with **no `?debug`** and asserts `window.__GR_TEST__` is `undefined` first, then asserts **world state** — palisade count `+1`, seam `remaining −10`, `gold === 0`, two `gold_panned` economy-log events, a final `gold_spent/build_palisade` — and then that an unaffordable BUILD **fails with a reason rather than throwing**. A receipt that says ok is not a building that exists; this spec checks the building.

## Merge classification

Real delta vs base `90c54abc` is **2 files, +192/−0** (`src/game/Game.ts`, `e2e/ap-standing-orders.spec.ts`). The large deletion counts in a three-dot diff are stale-base phantoms — the branch is 60 behind.

| File | Class | Handling |
|---|---|---|
| `e2e/ap-standing-orders.spec.ts` | LANE-TOUCHED only | main never moved it since base — direct copy |
| `src/game/Game.ts` | **BOTH MOVED** | 3-way graft, verified both directions |

The graft was performed and verified before gating: `git merge-file` returned **0 conflicts**, and `diff` of the grafted file against the lane's own version showed **exactly main's `b5cb6c60` seed/`seedMode` hunk at `:5552` and nothing else**. Lane's hunk sits at `:2055`, main's at `:5506` — fully disjoint. The graft is not the problem; it was clean. **All gates below ran on the grafted tree.**

## Evidence

| Gate | Result |
|---|---|
| `test:node-guards` (**run first**) | ✅ **74 / 74**, fail 0 — incl. `whole suite collects without loading Vite-only modules` |
| `npx playwright test --list` | ✅ **2464 tests / 344 files** — exactly `2460 + 4`, the two added tests × two projects; file count unchanged, as it must be for a slice extending an existing spec |
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green, vite **1.45 s** |
| Own spec, both projects | 🟡 **5 passed / 1 failed** — the one failure is the **known** F-1215-1 red (below) |
| Adjacent agent battery (m4-01/05/06/07/08/09/10 + task-026), `--workers=1` | 🔴 **55 passed / 8 failed / 1 skipped**, 64 tests, 10.2 min |
| Boot probe desktop + 390 | ⏸️ **not run** — the drain stopped at the adjacent battery; no merge, so no boot evidence is claimed |

All runs used an external scratch vite on **port 5291** with `GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL`. **Port 5188 was never bound** — lane-d is live on the concurrency-rate instrument and must not be starved. Load was heavy throughout (1-min loadavg 25.6 → 13.7 → 18.6).

### The own-spec failure is the known one, and it is not this slice's
`ap-standing-orders.spec.ts:115` (desktop only) fails at **`:156`** — `expect.poll(… log.some(e => e.surprise === 'wave_early')).toBe(true)`, timeout 5000 ms. That is **F-1215-1 exactly**: the same test, the same `wave_early` surprise poll, moved from `:80`/`:121` to `:115`/`:156` only because this slice's helper shifted the line numbers. s1215 proved it pre-existing with a matched control. **Both new tests passed on both projects.**

---

## Findings

### 🔴 F-1217-1 (BLOCKING) — wiring `panAt` registers the `auto_pan` capability, which adds a row to the Prospector panel and reddens three adjacent specs

**Mechanism, verified at source — not inferred.** `src/agent/ToolSurface.ts:375`:

```ts
if (typeof game.panAt === 'function') {
  capabilities.push({ id: 'auto_pan', level: 3, label: 'Let the Prospector work claim pans', tools: ['et.goldrush.pan_at'] });
}
```

The capability list is **derived from adapter membership**. Supplying `panAt` therefore does more than make HARVEST work: it makes a **level-3 ability appear in the player-facing panel**, at every rung.

**Matched control, one variable, same scratch server, same `--workers=1`:** treatment = the grafted tree; control = `src/game/Game.ts` reverted to clean main, everything else identical.

| Subject | Treatment | Control | Verdict |
|---|---|---|---|
| `m4-10-agent-actions-integrity:103` "panel only offers registered ToolSurface capabilities" | 🔴 fails **both** projects | ✅ passes both | **caused by this slice** |
| `m4-09-agent-rung-clarity:89` "rung 0 panel shows the canonical ladder…" | 🔴 fails **both** projects | ✅ passes both | **caused by this slice** |
| `m4-06-embodiment:364` "debug receipt moves the Prospector toward a panning target and floats ledger voice" | 🔴 fails **both** projects | ✅ passes both | **caused by this slice** |
| `m4-06-embodiment:395` permission-denied receipts | 🔴 mobile | 🔴 **both** | pre-existing — the known ~45% flake (F-1212-2) |
| `m4-07-prospector-panel:113` | 🔴 desktop (1.3 min) | ✅ (not in control set) | timeout shape; unattributed |
| `m4-06-embodiment:196` | ✅ | 🔴 mobile (48.1 s) | pre-existing/stochastic — **fails in the control only** |

Three subjects flip green→red on **both projects** — that is not flake shape, and the control settles it.

**Two of the three have the same explained cause:**
- `m4-10:112` — `capabilities.map(e => e.id)` returns `['auto_collect','auto_repair','auto_pan']` where the spec asserts `['auto_collect','auto_repair']`.
- `m4-09:107` — `getByTestId('prospector-ability-auto_pan')` resolves to **1 element** where the spec asserts count **0**, 13 consecutive resolutions.

**The third does NOT, and must not be waved through with the other two.** `m4-06:384` asserts the agent's ledger voice line is `'pan...'` and it now reads **`'shine'`**. That is a *different symptom* — a behaviour/voice change, not a capability-registration change — and I did **not** verify its mechanism. Do not assume it is the same supersession.

**Why this blocks rather than merges.** The drain gate requires adjacent suites unmodified-green, or failures fingerprint-matched to **known** reds with proof. These are new reds, proven caused, and none is inventoried. Merging would put 6 red executions on main. Separately, the master's **NO** list reserved *"the permission-ladder semantics"*, and whether a level-3 ability should be displayed at rung 0 is precisely a ladder-presentation question.

**Note the likely resolution is supersession, not a bug.** `m4-09:105-106` shows that *ungranted* abilities are displayed with a `needs approval-required (rung 1)` label — so a third row reading `needs … (rung 3)` is plausibly the correct, consistent post-wiring truth, and the three specs simply encode the pre-wiring world. **But that is a hypothesis, it is player-visible, and it does not cover `m4-06:364` at all.** It needs a runner to prove `auto_pan` is *gated* at rung 3 rather than merely *displayed*, and to root-cause the voice line. Corrective queued: `tasks/lane-c-ap-06b-panel-ladder-and-voice.md`.

### 🟡 F-1217-2 (method, affects the live lane-d instrument) — `--workers=4` on a single-file spec cannot exceed 2 workers, so "run it at `--workers=4`" is not the control three fires think it is

`playwright.config.ts` sets **no `fullyParallel`** and **no `workers`** key (read, lines 7-25). Playwright's default `fullyParallel: false` parallelises across **files**, running tests *within* one file serially in one worker. A run scoped to **one spec file across two projects therefore tops out at 2 workers**, whatever `--workers` says.

Measured, not reasoned: both my own-spec run and the runner's reported `--workers=4` probe printed **`Running 6 tests using 2 workers`**. s1216 logged the same surprise on its own spec ("I invoked with `--workers=4` and Playwright allocated 2") and recorded it as an oddity; it is not an oddity, it is the config.

Consequences, in order of cost:
1. The AP-06b master ordered *"run `ap-standing-orders.spec.ts` **once at `--workers=4`** and REPORT the count"* as the discriminator against F-1215-1. That instruction **cannot do what it was written to do** on a single-file scope — the runner dutifully ran it and reported `6/6` green, which is a **2-worker** sample presented as a 4-worker one. (My own 2-worker run of the same file *did* reproduce the red, so the class engages at 2 — the instruction was not useless, just not what it claimed.)
2. **The lane-d instrument now live (`concurrency-class-failure-rate`) varies workers over {1,2,4}.** If its subject set is narrow, its `4` arm and its `2` arm are **the same arm**, and the table will report a flat rate as a *finding* about the defect when it is an artefact of the harness. This is the "line-number control goes inert" shape. Its calibration subject (`tl-01:236` at 58.3%) will not catch this, because a flat-but-wrong arm still calibrates.
   ➡️ **Whoever drains that instrument must check the `Running N tests using M workers` line of each arm and confirm `M` actually differs across arms** — not merely that `--workers` differed.

---

## Disposition

- **Not merged.** `lane/e2-arsenal @ 2f216af0` is untouched and holds the work; the graft is reproducible in one `git merge-file` (documented above).
- Done-move re-prefixed `blocked-s1217-F1217-1-…` so the next fire does not read it as undrained runner output and re-gate it into a luckier battery.
- Goal leaf `ap-06b-adapter-wiring` → `blocked`, with a `blockedReason` stating **plainly that this is a TECHNICAL gate, not an owner design fork**, and naming the discharge condition. No owner action is required.
- Corrective authored and queued to lane-c with its own goal leaf in the same commit.

**No gazette item** (GZ-01): nothing merged. **No deploy**: nothing merged.
