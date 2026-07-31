# f1305-2 — console-watch single source

**Slice:** `lane-a-f1305-2-console-watch-single-source` · **branch:** `lane/m3` · **lane tip:** `c15b20b4` · **base:** `502e7bc3`
**Merged to main at:** `d596f9120f84febbf21c4f82d56b6d5b840b9017` · **drained by:** s1307 · **date:** 2026-08-01

## Verdict

**MERGED — PASS.** tsc clean · build green 1.60 s · `test:node-guards` **rc=0** (the new guard included) · reference spec **8/8 both projects** · the other 15 migrated specs **44 passed / 2 failed**, both failures fingerprint-matched to a documented 55.4% known red and **proven pre-existing by byte-identical assertion text**, not by a re-run.

## What it does

`e2e/support/console-watch.ts` is now the single definition of the console/pageerror watcher. It exports `watchErrors(page): ErrorWatch` — which routes exactly the literal prefix `THREE.GLTFLoader: Couldn't load texture blob:` into `suppressed[]` and **everything else into `errors[]`** — plus `expectNoConsoleErrors(watch, label?)`, which logs the suppressed count before asserting `errors` is empty. Putting the accounting *inside* the assertion helper is the design point: a call site cannot silently drop the count. 16 specs now import it; their 16 local copies are gone (**160 insertions / 202 deletions**, a net −42). A new guard, `scripts/console-watch-single-source.test.mjs`, is rooted in `test:node-guards` and reds if a local definition reappears or if the literal prefix decays into a loose pattern.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in **1.60 s** |
| `node --test scripts/console-watch-single-source.test.mjs` | **1/1 pass** |
| `npm run test:node-guards` (full battery) | **rc=0**; findings-state PASS (185 subjects / 145 closed / 40 open / **0 double-state**), blocker-panel PASS (16 rows, 0 closed-on-panel), ruling-propagation PASS (0 stale) |
| `e2e/agent-view.spec.ts` desktop+mobile `--workers=1` | **8 passed (19.8 s)**, rc=0 |
| 15 remaining migrated specs, desktop+mobile `--workers=1` | **44 passed / 2 failed (6.6 m)** — both failures = `cw-02-escort.spec.ts` known red |
| `src/` files changed | **0** — no runtime surface |

Every playwright arm ran `--workers=1` (§3.1).

### The mutation control is the real evidence, not the greens

`agent-view.spec.ts` keeps its permanent in-file control, which injects both a known-prefix error and a foreign one. It reported **`suppressed 1`** on *both* projects of the run — the only non-zero suppression anywhere — while all four real consumers reported **`suppressed 0`**. That asymmetry is the proof the shared filter fires *and* stays narrow. Per F-1305-1, a run count is not evidence here: the `0`s are the expected honest result, not a failure to widen the filter.

### The 21 reconcile exactly

`grep -rln "support/console-watch" e2e/` → **16** files (the migrated set). `grep -rln "function watchErrors" e2e/` → **5** remaining local definitions, precisely the divergent ones the master scoped out (`gz-02-news-page`, `tl-03-assay-office-site`, `ceremony-framework`, `mobile-overlay-input`, `board-era-chapters`) plus the new module itself. **16 + 5 = 21**, matching the original finding's count.

## Merge classification

All **19** paths **LANE-TOUCHED only**. `git diff --name-only 502e7bc3 main` restricted to those 19 paths is **EMPTY** — main never moved any of them since the base (its commits since `502e7bc3` are pure STATUS/BACKLOG/task bookkeeping). **No 3-way graft needed.** Applied by `git checkout lane/m3 -- <19 paths>`, committed path-scoped.

## Findings

### ✅ The runner's reported baseline red does NOT reproduce on main — stale base, verified not inherited

The run report says *"Full `test:node-guards` remains baseline-red: 195/197, both failures caused by unchanged `tasks/BACKLOG.md` declaring F-1304-1 open and closed."* That is true of its base and false of main. The lane's merge-base is `502e7bc3`; the fix is `8f078fb1` (s1306); `git merge-base --is-ancestor 8f078fb1 502e7bc3` → **base predates the fix**. On the merged tree the full battery is **rc=0 with 0 double-state**. Nothing owed. Recorded because a future reader of that log would otherwise inherit a red that never existed here.

### 🟡 F-1307-1 — a completed lane task ran a second time (observation solid, mechanism OPEN)

Measured, not inferred. Run `20260801-002355` completed READY-FOR-GATES (300,016 tokens) and done-moved — and the runner then started **run `20260801-004329` of the same master, 14 s later**, **for reasons not yet established** (see the correction below). The second run burned **24,818 tokens** for zero output. **It was contained, and by exactly the right mechanism:** the master's safe-dupe pre-flight (`lane-usable.mjs` must print `USABLE`) read **`HOLDS`** against run 1's own committed work and stopped without changes, reporting the word verbatim. Had that master used a bare `reset --hard` pre-flight, run 2 would have destroyed run 1 — Mistake #2 exactly. So this is a **cost finding, not a data-loss finding**, and it is standing evidence for the safe-dupe template. ⚠️ **Correction, same fire:** I first wrote that the runner *copies* queue→running. That is **false** — `scripts/lane-runner-v3.sh:59` is `mv "$f" "$run"`. A tracked-file-restore theory is also refuted (`git ls-files tasks/queue/` lists only three `.req` files). The leading hypothesis is now a double `cp` at queue time, with the per-slot pidfile at `:37` deferring the duplicate until run 1 finished — **stated as a hypothesis, not a conclusion.** No cure should be authored until the mechanism is established, because the two candidate cures (dedupe at queue time vs. idempotence at pickup) point in opposite directions.

### 🟡 F-1307-2 — `logs/suite-red-inventory.md` line coordinates rot whenever a spec is edited above a cited line

This merge shifted lines in 4 specs that the inventory cites, rotting **18 citations** across them. Repaired in the drain commit, each verified by **unique content match**, not by applying the net delta — which would have been wrong: `asset-diet:101 → :102` and `release-build:160 → :161, :199 → :200` moved **+1**, because they sit above the deleted block but below the added import, while `cw-02-escort:134 → :128` and `agent-view:283 → :268` moved down. **Three citations were deliberately left alone and are not mine:** `release-build:107` and `:165` are generic brace lines with no unique content match, and **`release-build:393` already exceeds that file's 349 lines at HEAD** — pre-existing rot. ⓘ The practical severity is low *because the fingerprint's load-bearing columns are file + test name + project + error text*, and the line is supplementary; this drain matched `cw-02-escort` on those three despite the stale line. Worth a row so the class is known, not worth a guard yet.

### 🟡 F-1307-3 — `F-1304-2` names two different findings

`reviews/ap-11-mechanics-manifest.md:97` declares *"F-1304-2 — the master shipped without a goal leaf (**closed by this drain**)"*, while `tasks/BACKLOG.md:28` declares F-1304-2 as the open, fire-authorable `deploy.sh` alias-window finding. Both were minted by s1304. A fire grepping the ID meets one row marked closed and one open, with different subjects — the "half-retired ledger entry is worse than none" hazard. `findings-state-guard` cannot see it (both rows are 🔵, and the census counts only 🟡/✅), so it is invisible to the battery. Disambiguated in the BACKLOG row rather than by renumbering, because three handoffs already cite BACKLOG's F-1304-2 by ID.

### 🔵 F-1304-2 (deploy alias window) — premise re-verified, not authored

s1305 and s1306 both named this the best fire-authorable master. I re-measured its premise before authoring and it **holds**: `scripts/deploy.sh:116`–`:133` is `for ATTEMPT in 1 2 3` with `sleep 15` between, so total patience is **~30 s of sleep**, and Cloudflare's alias promotion outlasted it. **AUTHORED AND QUEUED this fire** as `tasks/lane-b-f1304-2-deploy-alias-patience.md` (leaf `f1304-2-deploy-alias-patience`, lane-b; §3.0 ✅ CLEAR under `--strict`, matched by name).

⚠️ **One of my own assumptions was wrong, and the correction is the useful part.** I first reasoned — and wrote here — that *"a lane runner cannot execute a real Cloudflare deploy, so the cure needs a new testable seam."* **False.** `scripts/test-deploy-contract.sh` already stubs `wrangler` and `npm`, stands up a local alias server whose `builds` array is consumed one entry per request, and drives `deploy.sh` end-to-end across nine cases including `alias-stale`, `alias-http-500` and `alias-retry`. The seam existed; I nearly specced a redundant one. The master is gated on that harness instead, with the acceptance bar being a late-promotion case **demonstrated to fail on the old window and pass on the new one** — not a green.

Two further things checked rather than assumed: the `wrangler pages deployment list` discriminator is named **out of scope as a design fork** (in the stub harness it would reclassify the asserted `alias-stale` case), and the documented sibling-script class does **not** apply — `scripts/deploy-site.sh` is 69 lines with no alias-verification loop at all.

## Non-blocking notes

- `pageerror` is routed through the same `record()` predicate as console errors, so a *pageerror* whose message began with the GLTFLoader prefix would also be suppressed. This is **not introduced here** — `git show main:e2e/agent-view.spec.ts` shows the s1305-merged original doing the same, byte-identical. Recorded only so the next reader does not mistake it for a widening.
- The 5 divergent specs still carry local watchers with four different return contracts. The new guard covers only the single-source invariant for the migrated 16; it does not force the remaining 5 to converge. That is the follow-up s1306 asked the next fire to raise, and it is now raised here.
