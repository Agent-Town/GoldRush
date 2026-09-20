# Task e10s-1: author the Ember Shore's data — twist, roster, anchors, bench seeds (lane-c, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s2121, from `specs/agent-play/e10-ember-shore-preserve.md` §4 slice **E10S-1**, under the owner's ratified B1–B6 ALL BUILD ruling.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `specs/agent-play/e10-ember-shore-preserve.md` (**your spec — read all of it, especially §2 Laws and §3 defaults**); `specs/enemy-rosters-e6-e10.md` §E10 (the Static movement grammar your roster rows must obey); `assets/contracts/epoch-10-deepsky/contracts.json` (the `e10-ember-shore` block you are authoring into); `assets/contracts/bench-seeds.json`.

**REFRESH THIS LANE FIRST — IT IS 232 COMMITS BEHIND AND DOES NOT CARRY YOUR SPEC.** This is step ONE, before the pre-flight below and before `npm install`. The author verified at dispatch that `lane/c` is `ahead=0`, tracked-dirt 0, untracked 0 — **there is nothing on this branch to lose**, so the reset is unconditionally safe here:

```
git checkout -B lane/c main && git clean -fd
```

**THEN THE DEPENDENCY GREP — IT IS A HARD STOP.** Your spec was authored 2026-08-20 and only reaches this lane via the reset above. Run:
`grep -Fc "the twist block, roster, anchors, bench seeds" specs/agent-play/e10-ember-shore-preserve.md`
Expect **exactly 1** (the author proved this count against `main` before writing it here, per F-1425-2). If it is 0, the reset did not take — **STOP and report "lane lacks the E10S spec"**; do not attempt the task from this file alone, and do not reconstruct the spec from this master.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**LANE CURRENCY (verified by the author at dispatch, F-1320-2):** at authoring time `lane/c` read `ahead=0 behind=232 tracked-dirt=0 untracked=0` (`node scripts/lane-usable.mjs lane-c` → **USABLE**) and did **not** carry your spec. ⓘ **Stated honestly: the author did NOT perform the reset** — the fire shell's bash allowlist refused `git checkout -B`, and routing around a permission gate to touch a lane was not worth doing. **So the reset is YOUR first step above, and the dependency grep is the guard on it.** The key was proven `1` against `main` at dispatch; it cannot have been proven in the lane, which is precisely why the grep is a hard STOP rather than a note. Because `ahead=0` with a clean tree, the reset destroys nothing — this was re-measured immediately before queueing.

## Why (owner ruling + spec, every line re-verified at source by the author s2121)

**The owner overruled the deferral and ordered this built.** `specs/agent-play/door-completion-sheet.md:2`, RATIFIED 2026-08-20, owner verbatim: *"Group 1: approved (with any tweaks). **Group 2: don't defer, lets keep building but put these in the queue after the other tasks.** Group 3: cap fix yes, difficulty stands yes leave it."* Line 3 records the ruling in force: ***"B1–B6 ALL BUILD (sequenced AFTER the A-wave — nothing deferred; deferral recommendations are OVERRULED; Ember Shore + Archive World get attended design/content specs before their builds)"***, and line 4: *"Ratified items become fire/agent-authorable masters."*

**The prerequisite that gated it is DISCHARGED.** B5 required an attended design/content spec before its build; that spec was authored 2026-08-20 and is `specs/agent-play/e10-ember-shore-preserve.md` — its own line 3 says so: *"The sheet routed B5 through 'attended design/content specs before their builds' — this file is that spec."* Its Status line is DRAFT but **build-authorized**: *"build-authorized with the defaults below under the NO-BLOCKER LAW (owner 2026-07-18, verbatim: 'you can wire things in game, I just correct them later')"*, and its §6 correction points are explicitly **non-blocking — defaults ship**.

**Sequencing satisfied.** The B-wave's Group 1 has landed: B1 regatta `d13a54e5c`, B2 flotilla `19e778135`, B3 half-life-hollow `bb3ef65c0`, B7 showroom-capture-quota `64e446f7c`. B4 picnic is parked behind owner fork F-2090-1. B5 is next.

**Mistake #8 checked — this is genuinely UNBUILT.** Read on main today by the author, `assets/contracts/epoch-10-deepsky/contracts.json` → `e10-ember-shore`: `twist {}` · `enemyRoster []` · `harvestAnchors []` · description *"Board-launch-only until its preserve-contract Static squall consumer lands."*; `assets/contracts/bench-seeds.json` has **no** `e10-ember-shore` key. No master and no done-move exists for any `E10S-*` slice. The spec's §1 "verified in data, 2026-08-20" still holds exactly.

## Scope — DATA ONLY (this is slice 1 of 4; the consumers are NOT yours)

Author into the `e10-ember-shore` contract block, per the spec §3 defaults. **Every number below is the spec's; do not invent, and do not tune.**

1. **The twist block.** Author `twist.emberShore.preserve` and `twist.emberShore.squall` (the new field keyed per F-1471-1, spec §3), plus `twist.secureWave: 12`. Values from spec §3: warmth 100 · squall decay −4/s · STOKE 15 gold → +40 warmth · vent disc radius 4 · squall cycle calm 60s → telegraph 8s → squall 25s. Secure latch semantics (vent alight AND one full squall survived) are DECLARED in data here; the latch is **enforced** in E10S-3, not by you.

2. **The roster.** Two rows per spec §3 and `specs/enemy-rosters-e6-e10.md` §E10: `static_mote` (orbit the vent, peel inward; 0.25× height; **disperses**) and `unraveled_machine` (chase; mask over the **e6 `feral_toaster`** source sheet — sheets exist from batch R-E6). Mote count scales with squall proximity; `unraveled_machine` arrives from wave 4. ⚠️ **`static_squall` NEVER enters `enemyRoster`** — the roster spec states this explicitly ("lane geometry as a scheduled front in the contract weather scheduler"); it is the weather, not an enemy. `the_quiet` is NOT on this map.

3. **Four `harvestAnchors`** along the cooling veins south and west of the vent, **inside walkable reach of both declared buildZones** (`last-warm-vent-site` x[-2..8] z[-16..-4]; `cooled-titan-machine-mount` x[14..38] z[22..46]). These fund the stoking economy — F-1741 forbids minting gold to force a green, so the anchors must be genuinely reachable.

4. **Bench seeds** `e10-ember-shore-01` and `e10-ember-shore-02` in `assets/contracts/bench-seeds.json`, following the existing key shape exactly.

5. **Update the contract `description`** — it currently promises "Board-launch-only until its preserve-contract Static squall consumer lands", which stays TRUE after this slice (the consumer lands in E10S-3). **Leave it unchanged** unless leaving it breaks a guard; if it does, report rather than rewriting the promise.

6. **RESOLVE-AND-REPORT (do not act):** the spec §3 squall says *"If the A5 relay-rush interference-front consumer has merged, reuse its band/phase plumbing with Static presentation; if not, the storm-cycle scheduler is the fallback — implementer reads both and says which it took."* That choice belongs to **E10S-2**, not to you. **Read both, and report in one paragraph which one E10S-2 should take and why.** Author no scheduler code.

## Firewall

**TOUCH-ONLY:** `assets/contracts/epoch-10-deepsky/contracts.json` (the `e10-ember-shore` block ONLY) · `assets/contracts/bench-seeds.json` · regenerated floors/audit artifacts if and only if the gate below requires them.

**NO — do not touch, for any reason:** any other contract block, in this file or any other (**`e10-last-claim` is ADMITTED today — its floors and pins must not move; prove them byte-unmoved**) · `e10-river` (post-credits, exempt-by-design) · `src/**` (no consumer, no scheduler, no latch — those are E10S-2/3) · `specs/**` · `e2e/**` · `scripts/**` · `src/config/Balance.ts` (F-1741: no balance buffs) · the Quiet / boss tech · procgen v3 · `STATUS.md` · `tasks/**` other than your own done-move.

## Self-check before READY-FOR-GATES

- `npx tsc --noEmit` clean · `npm run build` green.
- **Contract loads on BOTH engines** (the spec's own gate) — browser and headless; report how you proved each.
- **Floors regen `--check` clean.** Per the spec's gate: rows appear **only with admission**, and **`0 secured:true`** for `e10-ember-shore`. A secured row here would mean the map is claimable with no consumer built — report it as a STOP, do not adjust anything to hide it.
- **`e10-last-claim` floors/pins BYTE-UNMOVED** — diff them and state the result explicitly.
- `npm run test:node-guards` — this touches contract DATA the sim replays, so run it and run it **ALONE** (~405 s, F-2099-1). Attribute any red off-slice with a reverted-content control before blaming or excusing it; **never re-pin to make a red go away** (F-1441-3).
- Zero console/page errors in a plain boot (no `?debug`), desktop **and** 390px mobile, `--workers=1`. Screenshots to `artifacts/e10s-1-ember-shore-data/`.

**READY-FOR-GATES** — report: the twist/roster/anchor/seed values you wrote and where each came from in the spec; both-engine load evidence; the floors `--check` result including the `secured:true` count; the `e10-last-claim` byte-unmoved diff result; the `test:node-guards` result with attribution for any red; and your scope-6 paragraph naming which scheduler E10S-2 should take. If any gate is red, report it — do not tune data to make it green.
