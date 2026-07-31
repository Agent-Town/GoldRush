# Review — gazette-welcome-drift-observation-frame-v3

**Slice:** `gazette-welcome-drift-observation-frame-v3` (lane-b) · **Branch:** `lane/m4` · **Tip:** `81a9b428 test: measure Gazette newsie drift in-page`
**Base:** `90b0c65b` (merge-base with main) · **Drained:** s1296, 2026-07-31
**Task master:** `tasks/lane-b-gazette-welcome-drift-observation-frame-v3.md` (FIRE-AUTHORED s1293, attempt 3)

## Verdict

**MERGED.** tsc clean · build rc=0 · subject 10/10 green desktop+mobile at `--workers=1` · every adjacent red fingerprint-matched to `logs/suite-red-inventory.md` **and** one of them additionally exonerated by an interleaved PRE/POST control arm · node guards 1/1 · zero console/page errors across 10 boots.

## What it does

`e2e/gazette-welcome.spec.ts` asserted that dismissing the Gazette welcome's last beat releases the newsie without yanking it away, and measured that as the distance between a position sampled **before** `click('town-welcome-next')` and one sampled **after** the click round-trip and an `expect.poll` had both returned. The newsie walks home at `delta * 7` = **7 world units/second**, so the `< 1` bound was in plain arithmetic an assertion that *the observation window closed in under ~143 ms*. It was a latency test wearing a behaviour test's clothes, and the thing it measured was supposed to be moving throughout.

The slice moves the observation window **inside the page**. A `requestAnimationFrame` sampler is installed via `page.evaluate` **before** the click; it ignores frames while `welcomeFollowsPlayer` is `true`, latches an anchor `{x, z, elapsed}` on the first frame it reads `false`, tracks `peak = max(peak, hypot(pos − anchor))`, and sets `done` once the town's own `elapsed` has advanced `0.08 s` past the anchor. The test then clicks, waits for `done`, and asserts **(a)** an anchor was latched and **(b)** `peak < 1`.

**The anchor changes** — from "position before the click" to "position at the frame the release is observed in-page". That is the fix, not a side effect: the two anchors differ by exactly the round-trip the task exists to remove.

The bound is now a **guarantee rather than a hope**, and the arithmetic is carried as a comment on the `0.08` so a future speed change is visibly coupled to it: `Loop.ts` clamps `presentationDeltaSeconds` at `MAX_PRESENTATION_DELTA_SECONDS = 0.05`, and `TownScene` constructs its `Loop` with no options (so the variable-timestep path applies), giving a worst-case window of `0.08 + 0.05 = 0.13 s` and a peak of `7 × 0.13 = 0.91 < 1`.

**No `src/` file is touched. Nothing a player sees changes** (Mistake #10: this is the factory retiring a question permanently instead of re-measuring it every quiet fire). **Therefore no GZ-01 item** — the filter law asks for a player-visible change and there is none.

## Merge classification

`node scripts/lane-freeze-classify.mjs lane/m4` → `ahead=1 base=90b0c65b paths=1`:

| bucket | count | detail |
|---|---|---|
| LANE-ONLY | **1** | `e2e/gazette-welcome.spec.ts` · base `7c0d0016` · lane `6076480e` · **main `7c0d0016`** |
| DUPLICATE / MAIN-ONLY / BOTH-MOVED | 0 | — |

Main's blob equals the base blob: **main never moved this file**, so the graft is an exact path-scoped checkout, no 3-way needed. Applied blob verified `6076480e6dfb…` **by absolute hash**, not by a clean `git status` (F-1295-1).

The two-dot `git diff --stat main lane/m4` shows 48 files / −1433 lines. **That is stale-base noise, not content** — main is 12 commits ahead of the merge-base. The commit's own `--stat` is the content: **1 file, +47/−7** (the ledger's *headline names intent, `--stat` names content*).

## Custody

Gated in a **detached worktree** (`/Users/robin/Claude/Projects/gr-s1296-gate`, detached at `aada0e4e`), never in main's working tree — the free cure adopted at the end of s1295 after **F-1295-1**, where a concurrent attended session's broad `git add` swept a deliberately-HELD slice onto main because it had been checked into main's tree in order to gate it. Main's tree held foreign content only between the final checkout and the commit.

## Evidence

Fire shell, `--workers=1` on every playwright command (§3.1 / F-1270-1), scratch ports **5243** / **5244** with an external vite (`GR_CAPTURE_EXTERNAL_SERVER=1`) so the managed 5188 server could not collide with a lane run (Mistake #12).

| gate | result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 4.65 s |
| `npm run build` | **rc=0**, 27.16 s (pre-existing >900 kB chunk warning) |
| **subject** `e2e/gazette-welcome.spec.ts` | **rc=0** — `Running 10 tests using 1 worker` · **10 passed**, 80.0 s, desktop+mobile |
| boot probe | **zero console/page errors** — the spec asserts `{consoleErrors: [], pageErrors: []}` at 5 points (`:159 :185 :208 :260 :283`), green on both projects |
| `node scripts/run-guards.mjs --only test:node-guards` | **rc=0, 1/1**, 35 s (see *contention* below) |
| `npm run test:citations` | **rc=1 — pre-existing, identical on main**, see F-1296-2 |

### Adjacent suites — derived by grep, not inherited

`grep -rln "town-welcome\|newsie" e2e/` → 10 specs (the subject plus 9).

| spec | result |
|---|---|
| `gazette-first-issue` | **PASS** 4/4, 40.3 s |
| `gazette-art-wiring` | **PASS** 4/4, 28.9 s |
| `wd02-barks` | **PASS** 6/6, 23.8 s |
| `cast-motion-wiring` | **PASS** 2/2, 83.3 s |
| `gz-h1-newsie` | RED 2/4 — **known red + control-armed**, see below |
| `ts-04-living-pass` | RED 2/4 — known red row 94 |
| `town-t5-townsfolk` | RED 2/10 — known red row 112 |
| `town-plate-blender` | RED 4/6 — known reds rows 15 + 109 |
| `release-build` | **NOT VALIDLY RUN — my instrument was wrong**, see F-1296-3 |

Every red fingerprint-matched to `logs/suite-red-inventory.md` with the row quoted, matching on **title + assertion coordinate + error string** (not on the reporter's `test(` line, which differs — the F-1295-2 helper/assertion-coordinate shape recurs in three of the four):

| spec | reporter says | inventory row | assertion line I observed | error string | documented rate |
|---|---|---|---|---|---|
| `gz-h1-newsie` | `:106:1` | **40** | `> 114 \| await expect(page.getByTestId('town-bark-speaker')).toHaveText('Pip Quick');` | `expect(locator).toHaveText(expected) failed` | 8/19 (**42.1%**) both projects |
| `ts-04-living-pass` | `:60:1` | **94** | `> 99 \| expect(await page.evaluate(...localStorage...)).toBe(storageBefore);` | `expect(received).toBe(expected)` | 39/46 (**84.8%**) |
| `town-t5-townsfolk` | `:203:1` | **112** | `> 104 \| await expect.poll(...activeBark?.actorId...).toBe(actorId);` | `expect(received).toBe(expected)` | 16/17 (**94.1%**) |
| `town-plate-blender` | `:59:1` / `:114:1` | **15** + **109** | `> 71 \| expect(requests).toEqual([]);` · `> 124 \| expect(requests).toEqual([]);` | `expect(received).toEqual(expected)` | 12/52 (**23.1%**) · 10/11 (**90.9%**) |

### The control arm — `gz-h1-newsie`, PRE vs POST

A fingerprint match is an inherited claim. The slice touches **one file** and this red is in a **different** file, which is already a control-flow guarantee; the measurement was run anyway because the ledger's asymmetry makes it one-directional and cheap: **a red on the PRE arm cannot have been caused by the slice.** Stated before running: a *green* PRE arm would have proven nothing at a 42.1% base rate.

Arms set and asserted **by absolute blob hash** before every run (PRE `7c0d0016` = main, POST `6076480e` = lane), interleaved with round 2 order-reversed, `--workers=1`, port 5244, same detached worktree.

| arm | round | rc | reds | wall | load | `Received` |
|---|---|---|---|---|---|---|
| PRE | 1 | 1 | 2/2 | 94.9 s | 7.72→10.98 | `"Juniper"` |
| POST | 1 | 1 | 2/2 | 100.4 s | 10.98→9.16 | `"Juniper"` |
| POST | 2 | 1 | 2/2 | 97.4 s | 9.16→10.15 | `"Chen Mei"` |
| PRE | 2 | 1 | 2/2 | 92.5 s | 10.15→8.71 | `"Juniper"` |

**PRE 4/4 red · POST 4/4 red — identical. The slice is exonerated by measurement, not merely by argument.**

### Contention — a red I discriminated instead of curing

`node scripts/run-guards.mjs --only test:node-guards` first read **rc=1, 0/1**, while the `release-build` battery was running underneath it at load 23.60. Direct `npm run test:node-guards` in the same tree read **rc=0**. Two readings → park and discriminate rather than cure again: re-run alone → **rc=0, 1/1, 35 s**. The first reading was gate-battery contention, a documented class. Recorded because the failure mode is invisible in a log that only keeps the last result.

## Findings

**F-1296-1 — `gz-h1-newsie` row 40 records 42.1%; I measured 8/8 (100%) instances red, and the observed value is not stable.** Across the four control runs above (4 runs × 2 projects = **8 instances**), the test failed **every time**, on both arms. Under the documented 8/19 (42.1%) per-instance rate, P(8/8) ≈ **0.001**. Either the rate has risen sharply or the inventory's 19 samples were taken under materially different conditions; either way **row 40 is no longer predictive of current behaviour**, and a drain that triages against it will keep being told "42% flake" about something that is currently deterministic here. A mechanism pointer for whoever fixes it: `Expected` is constant `"Pip Quick"` while `Received` varied across runs (`"Juniper"`, `"Chen Mei"`) — the assertion pins one speaker identity but the bark speaker selection is not stable. **Non-blocking for this slice** (exonerated by the control arm above). **Fire-authorable** as a scoped re-measure + inventory correction.

**F-1296-2 — `npm run test:citations` is RED on main, and was already red before this slice.** Run in both trees in the same minute: gate tree **rc=1**, main **rc=1**, byte-identical output. 11 citations in `tasks/lane-c-agent-rung-honest-gate.md` and `tasks/lane-c-agent-rung-honest-gate-v2.md` lack the test title the guard requires (e.g. `tasks/lane-c-agent-rung-honest-gate-v2.md::e2e/trail-guide-beat-priority.spec.ts:71`). Those files are outside this slice's firewall and the runner correctly declined to touch them. The fix is mechanical — quote each cited test's title beside the citation — and is **fire-authorable**. Until it lands, `test:citations` is a standing red that every subsequent drain must re-explain.

**F-1296-3 — deriving adjacent suites by `grep -rln` can pull in a spec that belongs to a *different playwright config*, and running it under the default harness manufactures reds that read as tree reds.** `e2e/release-build.spec.ts` matched the grep, so I ran it against the dev server on my scratch port and got **8 reds** (`debug and era query seams are inert`, `dist has no later manifest ids or plate/GLB assets`, …). It is governed by `playwright.release.config.ts`, whose `webServer` is `GR_RELEASE=e1 npm run build:release && npx vite preview --port 5190` — a **release** build served by preview, which is what `npm run test:release` runs. **Those 8 reds are my instrument's, not the tree's, and I am recording them as mine rather than quietly dropping them.** The spec is excluded from this drain's evidence: it is structurally unreachable from a test-only edit to one other spec file. The general trap is worth a guard — the grep-derived adjacency recipe appears in task masters (including this slice's own self-check) and has no notion of which config owns a spec. `playwright.config.ts` has `testDir: './e2e'` with no exclusion for `release-build.spec.ts`, so **the default harness will happily collect it**. Fire-authorable: either exclude it in the base config's `testIgnore` or teach the adjacency recipe to skip specs claimed by another config's `testMatch`.

**F-1296-4 (non-blocking, deliberate deviation, recorded so it is not mistaken for drift):** the master's scope 2 specified `expect(...)` for assertions (a) and (b); the runner shipped `expect.soft(...)` for both. This is **an improvement, not a violation** — it is what makes the vacuity guard legible. With hard assertions, a null anchor would abort at (a) and (b) would never report; with soft ones both are reported, and if the sampler never latches, (a) fails loudly while (b) passes trivially on `peak === 0` — exactly the failure mode the master demanded not be silent. The runner's mutation arm B confirmed (a) reds alone when the latch is made unreachable.

## Mutation arms (the master's stated acceptance criterion, from the runner's report)

The master made **mutation, not green, the acceptance bar** — correctly, since the fire shell cannot show the original red (F-1267-1/F-1270-1) and the lane shell cannot either.

| arm | mutation | expected | observed |
|---|---|---|---|
| **A** — subject moves | newsie speed `7 → 14` in `src/town/TownScene.ts` | peak assertion reds, `Received` ≈ 1.12 | **failed only the peak assertion**, `1.1723907198540937` |
| **B** — anchor never latches | latch condition made unreachable | assertion (a) reds | **failed only** `"the sampler must observe the newsie release"` |

Each arm redded **only** its predicted assertion, so the two are independently load-bearing. Restoration verified byte-identical by sha256 — `TownScene.ts 262f9768…`, spec `19e66463…` — and independently corroborated by the branch diff being **exactly one file**, which is itself proof arm A's `src/` mutation never reached the commit.

## Firewall compliance

**TOUCH-ONLY** `e2e/gazette-welcome.spec.ts` — honoured exactly; the commit is one file. No `src/` cure (the master's scope 3). No `waitForTimeout` in the replaced block (the two survivors at `:139` and `:256` are pre-existing entry/import settling, outside it). No wall-clock term enters the bound — the window is measured in the town's own `elapsed`, which is what makes it load-invariant.

## Adjacent same-shape sites (scope 5 — reported, not fixed)

The runner listed three further places that sample a moving world object across a CDP round-trip and assert a distance bound on it. **This is the next master, not this one:**

- `e2e/m4-06-embodiment.spec.ts:398`
- `e2e/mp-02-lockstep.spec.ts:426`
- `e2e/m4-10-agent-actions-integrity.spec.ts:138`

## Artifacts

`logs/session-scratch/s1296/` — `gate.mjs`, `pre-arm.mjs`, `results.json`, `prearm-results.json`, per-spec playwright logs. (Per the retention note carried since s1295, the `*.log` files are gitignored; their substance — rc, counts, wall, load, failure titles, arms — is committed in the JSON and quoted above. Force-adding them is the `.gitignore` decision already on the owner's desk as **F-1242-1**, not a drive-by.)
