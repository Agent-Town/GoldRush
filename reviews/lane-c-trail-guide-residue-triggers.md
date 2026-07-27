# lane-c-trail-guide-residue-triggers — drain review (s1147)

- **Slice:** the polish-04 Trail Guide residue — the two first-run triggers named as owed and never shipped: *first build-menu open* and *first confirmed theft*.
- **Branch / runner tip:** `lane/e2-arsenal` @ `32824327` (`runner(lane-c)`, run `20260728-002215`, 303,634 tokens).
- **Base:** `9b3778fd` (s1145). **Merged to main at `83f4c761`.**
- **Task master:** `tasks/done/shipped-83f4c761-20260728-002215-lane-c-trail-guide-residue-triggers.md` (FIRE-AUTHORED s1145).
- **§3.0 `drain-block-check`:** ✅ **CLEAR** — run as the first command of the drain, before classification and before forming an opinion.

## Verdict

**ACCEPT — merged.** Every clause of s1145's stated bar was met, and the clauses that mattered I re-derived at source rather than inheriting from the runner's report. One adjacent suite is red; it is **pre-existing and not caused by this merge**, proven by a clean-main control rather than asserted (F-1147-1 below).

## What it does

Adds two members to the `TrailGuideTrigger` union and their two barks, then fires them from the two moments the original polish-04 brief named and RF-02 never covered:

- **`first-build-menu`** — `Game.ts:6861`, inside `toggleBuildMenu()` *after* `this.buildSystem.setBuildMode(true)`. That is the single choke point both the desktop `KeyB` path and the mobile Build-button intent path funnel through, so the hint is not a desktop-only lie. Copy: *"Every line here names its price and its work. Set what the claim is short of, not what looks grandest."*
- **`first-theft`** — `Game.ts:6420`, on the confirmed `gold_stolen` path, placed *before* `this.onThiefGrabbed(enemy, amount)`. Copy: *"One of them is away with your gold. Give chase and it comes back to the pile, or let them run and keep your place at the claim."*

Bark copy ships fire-side under **F-903-1** ("tunable copy — owner wording review welcome"); Robin retunes the wording exactly as he may for the original eight. The runner raised no canon objection, and neither do I: brief §9.2's unarmed-thief rule is respected — no weapon, wound or blood language.

## Merge classification

**LANE-TOUCHED-ONLY. No graft.**

| File | Class | Evidence |
|---|---|---|
| `e2e/trail-guide.spec.ts` | LANE-TOUCHED | `git log 9b3778fd..main --` **empty** |
| `src/game/Game.ts` | LANE-TOUCHED | `git log 9b3778fd..main --` **empty** |
| `src/story/trailGuide.ts` | LANE-TOUCHED | `git log 9b3778fd..main --` **empty** |

Main never moved any of the three since the merge-base, so a path-scoped `git checkout 32824327 -- <3 files>` is exactly the 3-way result: the staged diff came out **byte-identical to the lane commit's own diff — 3 files, +98/−4.**

⚠️ **Trap recorded for whoever reads this branch next:** the two-dot `git diff main..lane/e2-arsenal` is **stale-base contaminated** — it spans 22 files and renders s1146's merges as phantom deletions (`reviews/vp-02b-jumper-slot-repair.md`, `scripts/tmp-s1146-*.mjs`, seven e2e specs). Checking s1145's *EXACTLY THREE FILES* bar against that diff would have failed a correct slice. The commit's **own** diff (`32824327^..32824327`) is the true change.

## Evidence

All numbers measured by me on the **merged** tree. Suite's own `webServer` on **5188**, verified free by `lsof` first — and unclaimable mid-gate, since all six queues were empty so no lane runner could start (Mistake #12). `--workers=1`.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 3.49 s |
| `npm run build` | **rc=0**, 13.95 s |
| `e2e/trail-guide.spec.ts` desktop+mobile | **rc=0 — 12/12** (6/6 desktop, 6/6 mobile), 53.3 s |
| `e2e/m2-04-gold-stealing.spec.ts` desktop+mobile | 2 failed / 12 passed — **pre-existing, F-1147-1** |
| `npm run test:guards` | **rc=0 — 8/8** (run via `spawnSync`; a green counter is not a green exit code) |
| Console / page errors | **zero** — both new tests assert `{consoleErrors: [], pageErrors: []}`, desktop **and** 390 px mobile |

Runner's own before/after, for comparison: before desktop 4/4, mobile 4/4; after 6/6 and 6/6, 12 passed in 55.1 s. **My 53.3 s / 12 passed reproduces it.**

### s1145's bar, clause by clause

| Clause | Result |
|---|---|
| `git diff --stat` shows **exactly three files** | ✅ `trailGuide.ts`, `Game.ts`, `e2e/trail-guide.spec.ts` |
| The existing **eight** barks byte-unchanged | ✅ the only `−` line in `trailGuide.ts` is the union's `'first-return';` terminator |
| `m2-04-gold-stealing.spec.ts` unmodified-green both projects | ⚠️ **unmodified yes, green no** — see F-1147-1 |
| `:82-86` exact-equality reported **explicitly** | ✅ **byte-unchanged and PASSED both projects** |
| Scope-8 mutation control red, then restored | ✅ `NOPE-not-a-bark` failed 1/1 showing the real bark; restored passed 1/1 |
| Scope-7 back-to-back observation present as a **finding** | ✅ reported, not fixed — see F-1147-2 |
| **REJECT if** it adds a bark queue, delay, or `__GR_TEST__` hook | ✅ none — the three-file diff is itself the proof, since a new hook would have required `vite-env.d.ts` |

### The two firewalled hazards — verified, not trusted

1. **`isPingDisabled()`.** s1145 warned the theft bark must not sit behind `onThiefGrabbed`'s early return on that flag, because `?noping` is the **audio** flag and a teaching hint that dies with the sound is a defect. The runner placed the call at `:6420`, one line *before* `onThiefGrabbed(...)` — outside it entirely. Better still, the spec **proves it positively**: the whole theft case runs against `?debug&…&noping&seed=trail-guide-theft`, so the bark is asserted to appear *with pings disabled*. That is a control, not a claim.
2. **The build-menu early return.** `toggleBuildMenu()` returns early to `closeBuildMenu()` when the menu is already open; the bark sits after `setBuildMode(true)`, so it fires only on a genuine open. The spec pins this by clicking the button three times and asserting the bark does **not** reappear.

## Findings

### F-1147-1 — `m2-04-gold-stealing.spec.ts:211` is RED on main, deterministically, and it is NOT this merge (⚠️ pre-existing regression, owner/next-fire item)

The bar named `m2-04` as *"the adjacent suite that matters most"* because it exercises the exact steal path scope 5 hooks. The runner reported it **7/7 on both projects**. I measure **6/7 on both projects** — `thief routes around a finite palisade line to steal` fails.

**It is not mine, and I proved that rather than assuming it:**

| Tree | Result |
|---|---|
| Merged tree | 2 failed / 12 passed |
| **Clean main** (`git checkout HEAD -- <3 files>`, control) | **2 failed / 12 passed — identical test, identical both projects** |
| Merged tree, quiet box, `-g "palisade line" --repeat-each=3` | **0/6 pass — 6 failed** |

**My first hypothesis was wrong and the control killed it.** The initial tail showed a failure inside `placeBuildableAt` at `:46:82` (`confirmBuild()` not `true`) — the F-1140-1 "discarded return value" shape — and the near-boundary look of the numbers suggested load contention from the wrangler MP servers and the F-1146-7 orphans. Both readings were wrong:

- The real assertion is `:227`, `expect(timeAlive - spawnedAt).toBeLessThan(20)` — **desktop `20.333…`, mobile `20.999…`** against a budget of `20`. The thief's journey around the palisade line overruns by **1.7–5 %**.
- `--repeat-each=3` in a quiet box returned **0/6**, so it is **deterministic, not contention.** Had I stopped at the two-run agreement I would have filed this as a flake.

**This is a regression, not a chronically marginal test:** `reviews/evidence/mac-fullsuite-20260705-*.md` record `m2-04` at **7/0/0/0** twice, and the spec file itself is unchanged since `ea570a81`. So something in `src/` between 2026-07-05 and now slowed the thief's route around a finite palisade line past its budget.

➡️ **Recommended next step:** this smells adjacent to the standing **E① pathing cure (F-1131-5)** on the owner's desk — a pathing change that makes thieves route less efficiently around obstacles is exactly what moves a 20 s budget to 20.3 s. **Do not simply raise the budget**: the assertion is a pathing-efficiency guard, and widening it to fit the data is the failure mode this factory has a law against. The honest next act is a `git bisect` over `src/` between `ea570a81`-era green and today, which is mechanical and fire-authorable.

### F-1147-2 — the back-to-back bark stomp is real, and deliberately unfixed (report-only, by order)

Scope 7 required the runner to measure and report, not solve. It did: **with *"Open Build"* visible, opening Build immediately replaces it with the new build-menu bark.** `speakTrailGuide()` assigns a single `trailGuideLine`, so the second bark overwrites the first — and `first-gold` already says *"Open Build…"*, so an **obedient** player is precisely the one who loses the first line.

No queue, delay or priority rule was added; adding one was declared a firewall violation and a design fork. Recorded here so the fork is visible when someone chooses to open it. Not blocking: both lines are one-shot teaching hints and the stomped one has already done its job (the player did the thing it asked).

### F-1147-3 — the runner's `m2-04` numbers did not reproduce (process note, non-blocking)

The runner reported `m2-04` desktop 7/7 (33.2 s) and mobile 7/7 (27.6 s); I got 6/7 both. The runner ran in `worktrees/lane-c` at base `9b3778fd` with `GR_CAPTURE_EXTERNAL_SERVER=1` on scratch ports; I ran on main's tip with the suite's own server. Since F-1147-1 reproduces on **clean main** too, the delta is environmental (worktree/base/ports), not a false report — but it is a reminder that **an adjacent-suite green from a lane worktree is not a green on main**, and the drain's own re-measurement is the one that counts.

## Duties

- **GAZETTE:** ✅ item appended — this is a genuinely player-visible merge (two new tutorial barks in `src/`).
- **DEPLOY:** ✅ due and run — gameplay-affecting `src/` merged.
- **TK-01 ticker digest:** not due (01:4x local; the 27th's digest compiles today ≥06:00).
- **ART slot:** untouched → staging audit not triggered.
- **Assayer `pending/`:** listed, empty.
