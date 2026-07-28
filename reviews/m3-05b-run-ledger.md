# Review — m3-05b-run-ledger

**Slice:** `lane-m3-05b-run-ledger` (attended-authored `f75f4e4e`, owner "yes" 2026-07-28 on F-1131-1)
**Branch/tip:** `lane/e2-arsenal` @ `d35edc72` (base `f3b5cc17`)
**Merged to main:** `d9c86768`
**Drained by:** s1180 fire, 2026-07-28
**§3.0 drain-block-check:** `? UNKNOWN — no goal leaf matches` → **a bookkeeping finding, not a clearance** (F-1180-1 below). Not a block; the master is owner-approved in its own WHY line.

## Verdict

**ACCEPT — merged.**

## What it does

`gr.history.v1` has been registered in `ProfileStorage.ts:24` — carried across profiles, wiped on reset — and until now **nothing had ever written or read it**; the Run Ledger page its master promised never landed. This slice closes that: on run end `RunManager.ts` appends a bounded entry (newest 50, additive schema that tolerates unknown fields on read), and a new `src/ui/RunLedger.ts` renders the page on the Claim Office surface — date, contract, outcome, waves, gold **with the m4-08 per-actor split (player vs Prospector) rendered, not recomputed**, per the master's re-scope. Empty state is a warm one-liner in house voice. Ledgers exported *before* this key existed still import cleanly (SAVE-COMPAT).

## Merge classification

Base `f3b5cc17`. **All five files LANE-TOUCHED only — no graft needed, and this was verified, not assumed:**

| file | classification | proof |
|---|---|---|
| `src/game/RunManager.ts` | LANE-TOUCHED (+24) | `git log f3b5cc17..main -- src/game/RunManager.ts` **EMPTY** — main never moved it since the base |
| `src/ui/RunLedger.ts` | pure add (+166) | absent from main |
| `e2e/m3-05b-run-ledger.spec.ts` | pure add (+237) | absent from main |
| `artifacts/m3-05b-run-ledger/{desktop,mobile}-chrome.png` | pure add | absent from main |

Applied by path-scoped `git checkout lane/e2-arsenal -- <5 paths>` onto clean main. The two screenshots committed are the ones **my own gate run regenerated on the merged tree**, not the lane's copies.

## Evidence

Gated on **scratch port 5234 with an external server** — three lane worktrees were LIVE and they share port 5188 (Mistake #12). Scratch config used `await import()`, not a static import, because static imports hoist above the env assignments the base config reads at module-evaluation time.

| gate | result |
|---|---|
| `npx tsc --noEmit` | **clean, rc=0** |
| `npm run build` | **green, 1.75 s** |
| `e2e/m3-05b-run-ledger.spec.ts` desktop + mobile, `--workers=1` | **6/6 passed** (27.2 s) |
| `e2e/save-slots.spec.ts` + `e2e/run-suspend.spec.ts`, both projects, `--workers=1` | **21 passed / 1 failed** (3.9 m) |
| console/page errors | zero in the slice's own spec (it asserts them) |

## The one adjacent red — and why it is NOT this slice's

`e2e/run-suspend.spec.ts:193` (desktop) failed. It is **absent from `logs/suite-red-inventory.md`**, i.e. it was green when the red map was taken, and the slice touches run-end — so this got the full control treatment rather than a wave-through.

**A/B by single variable** (revert `src/game/RunManager.ts` to clean main, everything else untouched; restore proved by blob hash `PRE=959fdc5cdf609082e470f7b3cf335b1bc4f41919` = `POST`):

| order | arm | result |
|---|---|---|
| 1–2 | TREATMENT | **FAIL ×2** — `THREE.GLTFLoader: Couldn't load texture blob:…` ×3 at the `:277` zero-console assertion |
| 3 | CONTROL | pass |
| 4 | TREATMENT | **FAIL** |
| 5 | CONTROL | **FAIL** — but a *different* fault: `page.evaluate: Execution context was destroyed, most likely because of a navigation` |
| 6–8 | CONTROL ×3 (`--repeat-each=3`) | **3 passed** |
| 9–11 | TREATMENT ×3 (`--repeat-each=3`) | **3 passed** |

**Totals: treatment 3 fail / 6 runs · control 1 fail / 5 runs. Both arms fail; both arms pass; the failure modes differ.** ⇒ **a load-sensitive flake with at least two distinct faults, not a slice regression.**

⚠️ **The honest part: after step 5 the evidence pointed the other way and I nearly blocked this merge.** Three consecutive treatment failures against one control pass looks damning. What actually changed across the sequence was the **box**, monotonically: `uptime` at the end read **load averages 6.74 / 8.20 / 10.08** — the 15-minute average is *half again* the 1-minute one, because the four lanes that were hammering the machine during steps 1–5 had all gone idle by steps 6–11. My early sequence was interleaved against a background that was itself trending, which is not a control at all. The `--repeat-each` arms are the trustworthy measurement because they ran adjacently under the same load.

## Findings

- **F-1180-1 (bookkeeping, non-blocking).** `lane-m3-05b-run-ledger.md` carries **no goal leaf**, so `drain-block-check` — the §3.0 first-command-of-every-drain guard — answered `? UNKNOWN` for it. Its own output calls that "a bookkeeping finding, not a clearance", and it is: rc=0, so nothing stopped. Registered by this drain (`factory-m3-05b-run-ledger`, status `merged`). The master was attended-authored and owner-approved; the Goal Registration Law applies to attended-authored masters too.
- **F-1180-2 (real, non-blocking, owner-visible).** `e2e/run-suspend.spec.ts:193` is **load-sensitive and fails in two distinct ways** — GLTF texture-blob console errors at the `:277` zero-console assertion, and an execution-context-destroyed navigation race earlier. It is absent from the suite-red inventory, so any future full-suite comparison will read it as a *new* red and mis-attribute it to whatever slice is in flight. It is direct additional evidence for the parked **calibrate-suite-workers-v2** blocker (owner-gated on box load): measured here, the same test on the same tree goes 3-fail-then-3-pass purely as the factory quiets down.

## Where the player sees this (Mistake #10)

The Claim Office surface: a Run Ledger page listing past runs with date, contract, outcome, waves and gold with the per-actor split; a warm one-liner when empty. Covered by `m3-05b-run-ledger.spec.ts:74` ("Claim Office opens a responsive Run Ledger and a profile reset returns its warm empty state"), which runs on both desktop and 390 px mobile.
