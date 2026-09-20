# bounded-prefetch-town-halls — the halls belong to the town, and the stream names its terminal state

Slice `bounded-prefetch-town-halls` · lane `lane/b` · Claude Opus 5 · 2026-09-05.
Corrects F-PBW-2 (`reviews/asset-diet-explicit-manifest.md`), opened by the bounded prefetch `c7856dca7`
(`reviews/prefetch-bounded-warming.md`).

## 1. The ruling (scope 1)

**The town's priority-1 set INCLUDES its two bulk halls under normal connections — no code change was
needed, and none was made to `TownTavernPilot.ts`.** `townPrefetchUrls()` already emits the stamp mill
and the dynamo hall unconditionally, and `AdvanceStream.ts` already trims them only when Save Data is
on (`townUrls`, `AdvanceStream.ts:105-106`). The halls sit inside the single `town` target, which is
priority 1 in the menu and run scenes. The master permitted moving the URL grouping "only if it must
move"; the measurement below says it must not, so it was left alone.

### The byte table — MEASURED ON THE BUILT TREE (`npm run build`, manifest hash `1408f6b4`)

Method: `artifacts/bounded-prefetch-town-halls/measure-town-bytes.mjs` resolves the real
`townPrefetchUrls()` / `contractPrefetchUrls()` output in a browser against the dev server (so the era
and variant selection is the engine's own, not a re-derivation), then maps every basename onto its
emitted `dist/assets/*-diet-1408f6b4.*` file and `stat`s it. Raw per-URL numbers in `town-bytes.json`.

| Epoch (town era) | town URLs | town **WITH** halls | town **WITHOUT** halls | the two halls | halls as % of the 12 MB mobile allowance |
|---|---:|---:|---:|---:|---:|
| epoch-1-frontier | 12 | **2,614,544** | 2,279,784 | 334,760 | 2.79% |
| epoch-2-steamworks | 17 | 3,182,388 | 2,771,500 | 410,888 | 3.42% |
| epoch-3-voltage | 20 | 3,457,020 | 3,028,816 | 428,204 | 3.57% |
| epoch-4-motor | 24 | **3,764,624** (worst) | 3,274,356 | 490,268 | 4.09% |
| epoch-5-deepwater | 16 | 2,834,628 | 2,501,032 | 333,596 | 2.78% |
| epoch-6-atomic | 16 | 3,529,212 | 3,058,236 | 470,976 | 3.92% |
| epoch-7-signal | 16 | 2,950,576 | 2,617,944 | 332,632 | 2.77% |
| epoch-8-orbital | 15 | 3,097,688 | 2,679,244 | 418,444 | 3.49% |
| epoch-9-redfields | 15 | 2,639,324 | 2,326,028 | 313,296 | 2.61% |
| epoch-10-deepsky | 15 | 2,808,552 | 2,457,092 | 351,460 | 2.93% |

Era-1 per-URL (the first boot every player sees): `town-plate` 878,812 · `town-v3-tavern` 294,492 ·
`assay-office` 249,280 · `schoolhouse` 224,384 · `chapel` 203,764 · `general-store` 195,920 ·
`claim-office` 191,604 · **`stamp-mill` 183,160** · **`dynamo-hall` 151,600** · `pan_monument` 17,012 ·
`covered_wagon` 14,348 · `water_trough` 10,168.

### Does it fit the 12,000,000 B mobile allowance WITH the destination? **YES, with 3.1 MB to spare.**

The plan in normal mode is priorities 1–2 only. Worst case over every scene and every board pairing:

| Scene | priority 1 | priority 2 | worst-case total | % of 12 MB mobile allowance |
|---|---|---|---:|---:|
| `menu` | town (worst era, 3,764,624) | likely contract (worst, `e4-gusher-county` 4,630,356) | **8,394,980** | 69.96% |
| `run` | town (worst era, 3,764,624) | successor (worst, `e4-boneyard` 4,227,504) | 7,992,128 | 66.60% |
| `town` | likely contract (`e4-gusher-county` 4,630,356) | successor (`e4-boneyard` 4,227,504 — the adjacent board entry) | **8,857,860** | 73.82% |

The largest plan the stream can build is **8,857,860 B = 73.8%** of the mobile allowance, leaving
3,142,140 B of headroom. The two halls are 313,296–490,268 B of that, i.e. **2.6%–4.1%** of the
allowance. **The allowance is NOT raised and no change to it is proposed.**

### End-to-end confirmation on the built tree (`vite preview` of `dist/`, port 5312, plain `/` boot)

`built-boot-probe.json` + `built-menu-*.png`. Real bytes over the wire, no route interception:

| Project | terminal state | `assetPrefetchTownState` | progress | failed | allowance | bytes used | % | halls fetched | console/page errors |
|---|---|---|---|---:|---:|---:|---:|---|---|
| desktop-chrome (1280×800) | `ready` | `ready` | 19/19 | 0 | 24,000,000 | 5,122,772 | 21.3% | `stamp-mill…glb` 183,160 + `dynamo-hall…glb` 151,600 | 0 / 0 |
| mobile-chrome (390×844) | `ready` | `ready` | 19/19 | 0 | 12,000,000 | 5,122,772 | **42.7%** | same | 0 / 0 |

5,122,772 = town 2,614,544 + `the-claim` 2,508,228 exactly, so the table above and the running engine agree.

## 2. The state machine and the terminal state (scope 2)

Documented in a comment at the top of `src/assets/AdvanceStream.ts`, and typed:
`export type AdvanceStreamState` + `export const ADVANCE_STREAM_TERMINAL_STATES`.

```
     enter(scene) ──▶ settling ──▶ resolving ──▶ fetching ──┐
                         ▲            ▲   │                 │
                         │            └───┘ (next target)   │
     pause()/dispose() ──┴──▶ paused          ┌─────────────┘
                                              ▼
                     plan drained? ──yes──▶ ready      TERMINAL (no failures)
                           │                partial    TERMINAL (≥1 resolve/fetch failed)
                           no
                           ▼
                  bytes >= allowance? ──yes──▶ allowance TERMINAL (work still queued)
                           │
                           no ──▶ keep fetching
```

**The terminal state's name is `allowance`.** Honest note for the drain: an allowance stop was ALREADY
published by the slice this corrects — as `budget-exhausted` (`c7856dca7`, `AdvanceStream.ts:176`). The
master's READ-FIRST line did not list it. Two things changed here:

1. **Renamed `budget-exhausted` → `allowance`.** Blast radius verified by grep before renaming: the
   literal existed in exactly two files, `src/assets/AdvanceStream.ts:176` and
   `e2e/advance-stream-bounded.spec.ts:41,57,61` — both inside this task's firewall. No player-facing
   string, no other consumer. (The four `"outcome": "budget-exhausted"` hits in
   `reviews/shots-e1-depth/*.json` are an unrelated run outcome field.) The new name matches the
   vocabulary the dataset already publishes — `assetPrefetchAllowance` /
   `ADVANCE_STREAM_BYTE_ALLOWANCE` — and stops colliding with the *other* budget in this repo, the
   25 MB deploy budget verdict in `scripts/deploy.sh`.
2. **F-BPTH-1, a real bug, fixed: the allowance check preempted the drained-plan check.** It sat at the
   top of `run()`, so a plan that fetched every URL and landed at or over the allowance published the
   early-stop state and NEVER `ready` — "we finished" and "we gave up" were the same word, and anything
   waiting for `ready` hung on a stream with no work left. The drained check now runs first, so
   `allowance` can only ever mean "stopped short".

   Control run, proving the new regression test bites (old ordering restored, then reverted):
   ```
   Expected: "ready"   Received: "allowance"
   <canvas … data-asset-prefetch-ready="19" data-asset-prefetch-total="19"
             data-asset-prefetch-failed="0"  data-asset-prefetch-state="allowance" …>
   ```
   19 of 19 fetched, zero failures — and the stream still called itself stopped short. Both projects.

## 3. Changed assertions

### `e2e/town-stamp-mill-blender.spec.ts` — one test, renamed
`normal connections prefetch both bulk town halls` → **`normal connections prefetch both bulk town
halls inside the town priority-1 set`** (`:163`).

| # | Before | After | Why |
|---|---|---|---|
| 1 | `waitForFunction(assetPrefetchState === 'ready')`, 20 s | `expect.poll` on a helper that reports `terminal` / `still-running:<state>` against the **exported** `ADVANCE_STREAM_TERMINAL_STATES`, 20 s, **then** `toHaveAttribute(state,'ready')` | Waiting on one terminal state hangs whenever the other happens. The poll proves the stream STOPPED; the strict assert then proves it stopped by *finishing*. A hang and a stop-short now report differently, and the list of terminal states comes from the engine rather than a copy in the spec. |
| 2 | — (new) | `page.route('**/*.glb')` fulfils **prefetch-header** requests with `Buffer.alloc(37)` | Harness fix, not a law change. `AdvanceStream` accounts real response bytes and the dev server ships the pre-diet sources: the era-1 town is **18,049,588 B** on the dev tree (`town-plate.glb` alone 7,904,068 B) vs 2,614,544 B built. On mobile the 12 MB allowance was spent 6 URLs into the town and the halls were never asked for. Same house pattern and same reason as `advance-stream.spec.ts:63-66`. |
| 3 | — (new) | `toHaveAttribute('data-asset-prefetch-town-state','ready')` | The town's set completed — it was never truncated. This is the law itself. |
| 4 | `prefetched` filtered for both halls | kept, on pathnames | unchanged in substance |
| 5 | — (new) | `townPrefetchUrls()` (imported in-page) contains both halls | The halls are in the town's SET, not merely somewhere in the plan. |
| 6 | — (new) | `townPaths.filter((p) => !prefetched.includes(p))` is `[]` | Every town URL was actually fetched. |
| 7 | — (new) | last town request index **<** first non-town request index | "Priority 1" means FIRST: no priority-2 destination URL may be requested before the town is done. |
| 8 | — (new) | `assertNoErrors(errors)` | The test previously collected no console/page errors at all. |

### `e2e/advance-stream-bounded.spec.ts`

| # | Line | Before | After |
|---|---|---|---|
| 1 | `:41` | `data-asset-prefetch-state` = `budget-exhausted` | `allowance` |
| 2 | `:57` | `budget-exhausted` | `allowance` |
| 3 | `:61` | `budget-exhausted` | `allowance` |
| 4 | `:84` (new test) | — | **`a plan that completes exactly at the allowance publishes ready, not the allowance stop`** — presets sessionStorage bytes to `allowance − planSize × 37` so the last batch lands exactly ON the allowance with nothing queued, then asserts `data-asset-prefetch-bytes` == allowance, state == `ready`, and that all `planSize` URLs were requested. This is the F-BPTH-1 regression guard; the control run above shows it failing on the old ordering. |

## 4. Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0 (asset-diet table unchanged: 412 GLBs 846,134,176 → 122,590,004) |
| The five named suites in one run: `town-stamp-mill-blender` (6) + `advance-stream` (6) + `advance-stream-bounded` (3, was 2) + `advance-stream-walkthrough` (1) + `advance-stream-cache-reuse` (2) | **36/36 passed** (2.5 min), desktop-chrome 1280×800 **and** mobile-chrome 390×844, own dev server on port 5302, `--workers=1`, `GR_CAPTURE_EXTERNAL_SERVER=1` |
| console/page errors | zero, in every spec above and in the built-tree boot probe |
| `scripts/engine-era-guard.test.mjs` | 4/5 — reds by design until the drain pins. **Engine hash for the pin: `17943318aff7d1081a502fc2d31b0223139c0e8188ad48c1cafee31b87482761`, era 5.** `assets/engine-era.json` is outside this task's firewall and was NOT touched. |

Nothing new renders, so there is no perf table: the change is a dataset value, a check order and a
comment. The screenshots are the plain built-tree boot at both viewports, kept only as the
zero-console-error evidence for Mistake #10 ("where does the PLAYER see this, in a plain boot?" — the
player sees it as the town being already warm when they walk in).

## 5. Findings

- **F-BPTH-1 (fixed here):** `AdvanceStream.run()` published the allowance stop above the drained-plan
  check, so a completed plan sitting at/over the allowance reported an early stop and never `ready`.
  `src/assets/AdvanceStream.ts:222-243` (post-fix). Regression-guarded by
  `e2e/advance-stream-bounded.spec.ts:84`.
- **F-BPTH-2 (non-blocking, OUT OF FIREWALL — for the drain or a follow-up):**
  `e2e/asset-diet.spec.ts:339` waits up to 45 s for `data-asset-prefetch-town-state` = `ready` under the
  REAL dev byte flow (`/?town3dPilot=all&tier=full`). On `mobile-chrome` the URL's `tier=full` cannot
  beat `matchMedia('(pointer: coarse)')` at `AdvanceStream.ts:251`, so that arm gets the 12,000,000 B
  allowance and the dev tree's 18,049,588 B town can never complete — the same harness artefact this
  slice fixed in `town-stamp-mill-blender.spec.ts`. The cure is the same three lines (stub prefetch
  bodies, or wait on a terminal state). That spec is outside this task's TOUCH-ONLY list and was not
  touched or run.
- **F-BPTH-3 (non-blocking, observation):** the town's URL order is `[town-plate, …8 buildings…,
  …props…, …era props…]`, which puts the two halls 8th and 9th of 12 at era 1. If the allowance ever
  DID bite inside the town, the halls would be among the first casualties. It cannot happen in a
  shipped build (the whole town is at most 31.4% of the mobile allowance, measured above), so
  `TownTavernPilot.ts` was deliberately left untouched — recorded here so a future asset growth spurt
  has the number to check against rather than a re-derivation.
- **Stale numbers corrected:** `reviews/prefetch-bounded-warming.md` records "Town 4,971,188; The Claim
  2,939,704; Dry Gulch 3,679,340". Those were measured before `asset-diet-explicit-manifest`
  (`e48bbd592`) landed its 86% GLB cut. Post-diet, on this tree: Town 2,614,544 · The Claim 2,508,228 ·
  Dry Gulch 3,248,396. The bounded slice's conclusion ("12 MB covers the town plus either map") holds
  with far more room than it claimed.
