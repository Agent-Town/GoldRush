# lane-boss-healthbar-steady — F-BW-17: the bar stops dancing

**Slice:** `tasks/lane-boss-healthbar-steady.md`
**Branch:** `lane/m3` (lane-a) · **Tip:** `183562b30f056b9aa0ad37e83df6ae11a17d56a7`
**Merge-base:** `4983ce0385df3bee69a79bee7486c626e3d0b8f6`
**Drained by:** s1443 fire, 2026-08-03
**Verdict:** ✅ **MERGED FULL** — every scope item satisfied, firewall held, all reds proven pre-existing by a clean-main control in the same worktree/server/port.

## What it does

The owner, on the gate walk 2026-08-03, verbatim: *"the healthbar is now 3D, so it swings with its moves in 3D. I would prefer if it would be not swinging, but be always on top of this head so that the amount of health can be easily determined."*

The boss HP bar used to inherit the boss body's yaw (`state.yaw = baron.group.rotation.y`, then `bossHpGroup.rotation.set(0, state.yaw, 0)`), so it swung with every animation sway and became unreadable mid-fight. This slice splits **position** from **orientation**: the bar's position now tracks a per-boss *head anchor* (`scale × visualScale + clearance`), while its orientation is unconditionally camera-facing (`quaternion.copy(camera.quaternion)`, falling back to `identity()` when there is no camera). The `yaw` field is deleted from `BossBarState` entirely, so there is no longer a code path that can re-introduce the sway.

Per-boss anchors live in one table, `BOSS_BAR_HEAD_ANCHORS`, with `DEFAULT_BOSS_BAR_HEAD_ANCHOR` for anything unlisted — so the fix is applied to the **class**, not to the Baron alone.

| Consumer | Head anchor | Semantic |
|---|---|---|
| Baron | `1.5 × scale + 0.35` | Health |
| Armored Railcar | `1.5 × scale + 0.95`; mounted GLB top `+0.35` | Health |
| Dredge Queen | Highest component, `1.5 × scale + 0.95` | Health |
| Homemaker-9000 | Same grouped anchor | Health |
| Salvage King's Claw | Same grouped anchor | Health |
| Old Digger | Same grouped anchor | Resistance unchanged |

### Ruling lineage — recorded in the code, deliberately

The master demanded both rulings be written side by side so a later session does not "fix" this backwards. `src/entities/pools.ts` carries, at the orientation site:

```
// Mistake #6 still stands for building damage bars: world things anchor in the building's frame.
// Boss readability overrides orientation only: follow the head position, but never inherit body sway/rotation.
```

⚠️ **This is an intentional, owner-ordered override of Mistake #6, scoped to BOSS bars only.** Building damage bars keep the object-frame ruling. Do not "restore" camera-independence here.

## Evidence

All playwright runs `--workers=1` (§3.1). Gates run in detached worktree `gate-s1443` (§3.0b — undecided content never entered main's working tree), removed after.

⚠️ **CORRECTION, filed against my own first draft of this file (F-1443-4).** This section originally read *"scratch port **5199**"*. That was **false**: I passed `PORT=5199` in the environment, but `playwright.config.ts:4` hardcodes `const baseURL = captureBaseURL ?? 'http://127.0.0.1:5188'` and reads no `PORT` variable, so **every run in this gate actually used port 5188**. I caught it only in the next drain, when a failure message quoted a `blob:http://127.0.0.1:5188/…` URL. **The measurement is still sound and the correction does not change the verdict** — 5188 was verified FREE by `lsof` before gating (no playwright, no lane-runner Codex live), and playwright's own `webServer` therefore started `npm run dev` with cwd = this gate worktree. **Positive proof it served the right tree, not another one:** the own spec asserts `data-boss-bar-anchor = 'head-screen'`, a string that exists only in the grafted tree, and it passed. What was wrong was the *label*, not the *number* — and a review that names the wrong port teaches the next fire a scratch-port habit that does not exist. The scratch-port family (5199/5231/5234) requires `GR_CAPTURE_BASE_URL`, not `PORT`.

| Gate | Result |
|---|---|
| `drain-block-check.mjs` | **UNKNOWN** — no goal leaf (rc=0 by DEFAULT, **not** a clearance, §3.0). Registered at drain — see F-1443-1 |
| `npx tsc --noEmit` (gate tree) | **rc=0**, 4.2 s |
| `npm run build` (gate tree) | **rc=0**, 15.0 s wall / **971 ms** vite build |
| Own spec `lane-boss-healthbar` | **2/2 PASS** — desktop-chrome 7.1 s, mobile-chrome 7.5 s, `expect(errors).toEqual([])` green |
| Adjacent battery (8 suites, derived BY GREP) | **59 passed / 4 failed / 1 skipped**, 6.6 min |
| **Control run, clean main, same worktree/server/port** | **identical 4 failures**, 7 passed / 1 skipped, 1.1 min |
| `npx tsc --noEmit` (merged **main** tree) | **rc=0** |
| Own spec on merged **main** tree | **2/2 PASS** — desktop 7.8 s, mobile 7.8 s |

### Adjacent set — derived by grep, not inherited

`git grep -l` over `e2e/` for `boss-bar|bossBar|bossHp|lightFactor|lightDimming|feverAccent|watchPaint|data-boss` → `054-baron-epic`, `e1-baron`, `e2-enemies`, `fevered-tell`, `fix-e2-railcar-read`, `freed-legibility`, `night-light-doctrine`, `wire-railcar-3d`. The light/fever/watchPaint patterns are included deliberately: main's s1440 perf rework moved that cluster inside the same file this slice edits.

### The 4 reds are pre-existing — proven, not argued

All four live in `e2e/e2-enemies.spec.ts` and **none** is in the boss-bar path.

| Failure | Merged tree | Clean-main control | Inventory |
|---|---|---|---|
| `:113` "wave pulses spawn…" → asserts at **`:125`**, `maxHp` **34.02** vs **37.9323** | FAILS desktop + mobile | **FAILS desktop + mobile, byte-identical numbers** | `logs/suite-red-inventory.md:102-103` |
| `:314` "same seed keeps the E2 roster wave deterministic" → asserts at **`:317`**, hash mismatch | FAILS desktop + mobile | **FAILS desktop + mobile** | `logs/suite-red-inventory.md:100-101` |

The control was proven main-equivalent, not assumed: `HEAD == main` (`5c509edf`) with an **EMPTY** `git status --porcelain -- src e2e reviews`, run in the same worktree, against the same server, on the same port (5188 — see the correction above).

Per F-1441-2 / F-1440-3, the discriminator is the **inner assertion line**, and both match exactly (`:125`, `:317`). Per the F-1442-1 standing, the reporter was read **raw** — no filter was applied to any run that decided this merge. `:314`'s hashes differ between arms and between runs; that is the defect itself (it compares two fresh sessions to each other, so it has no pinned baseline), and its assertion line and failure mode match the inventory exactly.

## Merge classification

| Path | Class | Handling |
|---|---|---|
| `src/entities/pools.ts` | **BOTH-MOVED** — main +25/−20 (s1440 perf: `renderedLightFactors`, `lightDimmingSources`, `feverAccentFor`/`syncWatchPaint` physical-light threading); lane +29/−10 (boss anchor) | **3-way graft**, clean auto-merge. Hunks are adjacent but disjoint — the lane's last hunk ends immediately before `syncEnemyInstance`, main's begins inside it |
| `e2e/lane-boss-healthbar.spec.ts` | LANE-TOUCHED | applied |
| `reviews/shots-bossbar/{desktop,mobile}-chrome-mid-fight.png` | LANE-TOUCHED | applied |

**Both sides verified surviving, not assumed.** Main's six s1440 markers (`renderedLightFactors`, `lightDimmingSources`, the two re-signatured methods, `this.renderedLightFactors[enemy.id] ?? 1`, `this.lightDimmingSources.length = config.sources.length`) all **PRESENT**; the lane's eight markers all **PRESENT**; the two deleted `yaw` constructs confirmed **ABSENT**.

**The graft carries zero drift:** `git diff --numstat` of the grafted tree is **27/2 + 29/10**, byte-identical to the lane's own `183562b3^..183562b3` numstat, and reproduced a third time when the decided merge was applied to main.

## Firewall

TOUCH-ONLY was *the boss bar component + per-boss anchor offsets + spec*. The diff touches exactly `src/entities/pools.ts` (boss-bar region only), the spec, and its two screenshots. NO list held: bar design/colors untouched (`BOSS_HP_STYLE` unmodified), **building damage bars untouched** (their ruling stands, and is now written into the code beside the override), boss models untouched.

## Findings

- 🟡 **F-1443-1 (bookkeeping, non-blocking):** `drain-block-check.mjs` answered **UNKNOWN** — no goal leaf matched `20260803-184448-lane-boss-healthbar-steady.md`. Per §3.0 that is a Goal Registration Law finding, **not** a clearance; rc was **0 by default**, which is exactly the shape that reads as permission. Registered `e1-boss-healthbar-steady` as `merged` with the 40-hex merge hash in the drain bookkeeping commit. **This is the SEVENTH consecutive fire** with the same debt (F-1438-3 → F-1439-2 → F-1440-1 → F-1441-1 → F-1442-2 → F-1443-1). The pattern is now long enough to be structural: masters are being authored without leaves faster than drains register them. Worth an attended ruling on whether authoring should hard-STOP without a leaf.
- 🟢 **F-1443-2 (resolved by measurement, no action):** the runner's own report predicted the adjacent risk as *"Homemaker reload timed out on both projects from an unrelated `waveSystem` initialization error"*. **No such failure occurred in either arm of this gate.** The reds that did appear are a different pair entirely. The runner's claim was neither confirmed nor needed — it was simply not what this tree does, which is why it was measured rather than inherited.

## Player-facing (Mistake #10)

In a plain boot with no `?debug`: fight any boss. The health bar sits above the head, holds still, and stays readable while the boss animates and turns. Screenshots: `reviews/shots-bossbar/desktop-chrome-mid-fight.png`, `reviews/shots-bossbar/mobile-chrome-mid-fight.png` (390px). The spec proves it mechanically — it scripts the boss through three positions with three different body rotations and asserts the orientation set has size **1** while the position set has size **3**.
