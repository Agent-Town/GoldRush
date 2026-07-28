# Review — `lane-c-asset-diet-skip-duty-split`

**Slice:** give the asset-diet "may these tests run at all" duty its own `GR_ASSET_DIET_BUNDLE`, so an external-server run stops un-skipping a production-bundle-only suite.
**Branch / tip:** `lane/e2-arsenal` @ `e9a1eecf` (`runner(lane-c): lane-c-asset-diet-skip-duty-split.md`, 2026-07-28T13:52:23+07:00)
**Base (merge-base with main):** `f5f3627b`
**Drained by:** s1169 fire, 2026-07-28
**Run report:** `tasks/runs/20260728-134156-lane-c-asset-diet-skip-duty-split.md`

## Verdict

**ACCEPT.** The cure was re-proven **in both directions on the merged tree by me**, not inherited from the runner: the old flag alone now **skips**, the new flag still **runs and asserts**. The `25_000_000` budget is byte-untouched. Third instance of the F-1026-1/F-1047-1 class, and the first one to cure the *class* rather than the instance.

§3.0 `drain-block-check` run as the first command: **✅ CLEAR** (`factory-diet-skip-duty-split`, status `queued`).

## What it does

`GR_CAPTURE_EXTERNAL_SERVER` answered two unrelated questions — *"I brought my own server"* (`playwright.config.ts:20`) and *"these tests may run at all"* (`e2e/asset-diet.spec.ts:15`). Because one variable carried both duties, **any full-suite run against an external dev server silently un-skipped a suite that only means anything against the built bundle.** That is exactly what produced the 2 false reds at `asset-diet.spec.ts:101` in `logs/suite-red-inventory.md`, which s1167 then named the board's best-evidenced authoring target and s1168 refuted (F-1168-1).

The slice introduces `GR_ASSET_DIET_BUNDLE` for the skip duty only, leaves the server duty at `playwright.config.ts:20` untouched, and migrates **both** real consumers.

## Evidence (measured on the merged tree, this fire)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.91 s** (diet: 235 GLBs 592,176,964 → 92,768,500 B, 84% cut) |
| **4(a) the defect is gone** — `GR_CAPTURE_EXTERNAL_SERVER=1` alone, preview config | **4 skipped**, emitting `[asset-diet] SKIPPED: … set GR_ASSET_DIET_BUNDLE=1 via: npm run test:asset-diet` |
| **4(b) the suite still really runs** — `GR_ASSET_DIET_BUNDLE=1` | **4 passed** (run 2; see the flake note below) |
| **4(c) it can still fail** (runner, in-lane) | threshold → `1_000` ⇒ `Expected: < 1000 / Received: 15966607`, **2 failed**; threshold reverted, `:101` re-read as `25_000_000` |
| **4(d) deploy gate still measures** (runner, in-lane) | `asset budget desktop-chrome: 15966661 bytes (9033339 headroom)`, same mobile; deploy then self-skipped on missing `CLOUDFLARE_API_TOKEN` |
| Adjacent `058-device-tiers` | **not re-run under load**; the runner's red fingerprint-matched by me to the known pre-existing entry at `logs/suite-red-inventory.md:21` (`:209`, deterministic-economy hero-`y`) |

**The real bundle number settles F-1168-1 from the other side:** the honest production measurement is **15,966,607 B / 16,480,463 B against a 25,000,000 budget — ~9 MB of headroom**, versus the **45,604,607 B** the inventory recorded off the *dev server*. There was never a 25 MB regression; there was an instrument reading the wrong thing.

### The one red, and why it is not one

Run 1 of gate 4(b) returned **1 failed / 3 passed (1.5 m)** — `e2e/asset-diet.spec.ts:72` (*"honest town and claim cues appear while GLBs are throttled…"*, desktop-chrome), a **throttle-timing** test, not the `:101` budget assertion.

Discriminated rather than asserted: the lane-a runner owned the box (**load average 24.59**), my run took **1.5 m against the runner's in-lane 52.4 s — 72% slower** — and an immediate **re-run of the identical command on the identical tree returned 4 passed**. Same tree, same command, opposite result ⇒ load artifact, F-1167-2's class. The runner also recorded **4/4** for this gate in-lane. Not a regression, and nothing in this diff can reach a throttle timer (zero `src/`).

⚠️ Recorded honestly: **a green measured under load 24.59 is a *stronger* result than one on a quiet box** (contention can only hurt), so 4(a)/4(b) stand. The single flake is *not* evidence about the game, in either direction.

## Merge classification

Base `f5f3627b`; main had advanced by three commits (`3b1a921b` s1168 handoff, `4bffa880` my lock, `f88ded97` `runner(art)`, `ae7fbb7f` my authored master). The raw two-dot `main..lane/e2-arsenal` diff therefore lists **21 paths**, all but four of them **stale-base phantoms** — main-side additions (the E9 art commit, my lane-a master) that read as deletions from the lane's older tree. Classified per file rather than trusted:

| File | Class | Resolution |
|---|---|---|
| `e2e/asset-diet.spec.ts` | LANE-TOUCHED | grafted (`git checkout lane/e2-arsenal -- …`) |
| `package.json` | LANE-TOUCHED | grafted |
| `scripts/deploy.sh` | LANE-TOUCHED | grafted |
| `tasks/runs/20260728-134156-…md` | LANE-TOUCHED (new) | grafted |
| `assets/**`, `reviews/shots-art-e9-town-icons/**`, `tasks/lane-a-*`, `logs/**`, `STATUS.md`, `tasks/goals.json`, `tasks/BACKLOG.md` | MAIN-MOVED-ONLY | untouched |

`git diff --stat f5f3627b..main` for the three code files is **empty** — main never moved them since the fork — so there was **no conflict to resolve and no 3-way graft needed**. Path-scoped adds only; `-A` never used.

The unstaged deletion of `tasks/queue/lane-a/lane-a-world-info-build-fixture-realign.md` visible during the drain is the **lane-a runner consuming its queue file at 14:00:32**, not part of this slice, and was deliberately left unstaged.

## Findings

- **F-1169-2 (non-blocking, recorded — the class is now measured and it is a singleton).** The task's scope-5 audit (`grep -rn "test.skip(process.env" e2e/`) returns exactly **1** match across the whole suite — `asset-diet.spec.ts:15`, i.e. the file just fixed — and **0** other file-level env guards an external-server run could flip. ➡️ **The F-1026-1 → F-1047-1 → F-1168-1 class is closed at one member.** No sweep is owed; a future fire should not go looking for siblings that do not exist.
- **F-1169-3 (non-blocking, recorded).** `package.json:12` **dropped** `GR_CAPTURE_EXTERNAL_SERVER=1` entirely, which the master permitted only if proven safe. It is proven: `playwright.preview.config.ts` overrides `webServer` unconditionally, so the preview path never needed the server duty — and gate 4(b) executed real assertions with real byte numbers without it. `scripts/deploy.sh:61` correctly **kept** the flag (its external-server duty is genuine there) and **added** the new one — the miss that would have turned the deploy's player-facing asset-budget gate into a silent *"0 tests run"* while still printing success.
- **F-1169-4 (non-blocking, inherited — NOT this slice's).** `058-device-tiers.spec.ts:209` remains red on its deterministic-economy hero-`y` assertion, reproduced twice by the runner with only `y` differing. Fingerprint-matched to `logs/suite-red-inventory.md:21`. Untouched, correctly — outside the firewall.

## Firewall audit (verified, not accepted from the report)

- `git diff --stat` on the merged graft: **exactly 3 tracked code files**, 6 insertions / 6 deletions.
- **`25_000_000` is byte-identical to main** — read directly off the lane tip at `:101` before grafting. *A budget edited to fit its measurement is not a guard.*
- **Zero `src/`**, zero other `e2e/` specs, `playwright.config.ts` and `playwright.preview.config.ts` untouched, `logs/suite-red-inventory.md` unannotated (its byte-reproducibility is a proven property — s1167).
- `src/assets/AdvanceStream.ts` and `src/town/TownTavernPilot.ts` untouched, as the open owner fork **F-1167-1** requires.

## Deploy / gazette

**No deploy, no gazette item** — zero `src/` bytes changed, so nothing player-visible moved. The deploy *gate* itself was strengthened, which is factory infrastructure, not a player-facing change.
