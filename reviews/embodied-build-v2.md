# embodied-build-v2 (EH-1b) — the Embodied Hand

**Slice:** `embodied-build-v2` (EH-1b) · **branch:** `lane/b` · **lane tip:** `272e56ba6623eb80dd6c593b5a989f24922ddffd`
**Merged to main:** `db8de38a6fc39c03c0ef572c2eeb8ea963fe5338` (s2372)
**Gated in:** detached worktree `gate-s2372` on merged main `196b28c0f` (§3.0b), playwright `--workers=1` throughout (§3.1)

## VERDICT: MERGED — gates green on the merged tree; the one banked blocker is cured with a named cause, and the drain additionally clears a standing main red.

## What it does

Agent BUILD orders now **travel** to their target within placement reach instead of failing at range, **confirm from the ordering body** rather than always the local hero, and **fail unreachable terrain honestly** with `UNREACHABLE: BUILD target has no traversable approach` after a four-second no-progress stall. The load-bearing change is one line of body law in `BuildSystem.confirmDiagnosticsFor(origin)` — `this.ghostPos - this.heroPosition` becomes `this.ghostPos - origin` — with `origin` defaulting to the hero so every human call site is unchanged. `Game.ts` threads the ordering actor's position into `placeBuilding`; `ToolSurface`/`StandingOrders` gain the reach and reachability predicates and the stall timer. Public `skill.md` now states that BUILD and repair orders imply travel.

This bumps the engine registry to **era 4, "the Embodied Hand"**.

## Evidence (all on the merged tree unless stated)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.16 s |
| `scripts/engine-era-guard.test.mjs` | **2 pass / 0 fail** (was the blocker — see below) |
| `scripts/law-pointer-guard.mjs` | **PASS**, 50 pointers / 67 instruments |
| `e2e/m4-01-tool-surface.spec.ts` + `e2e/m4-05-agent-closeout.spec.ts` | **20 passed** (10 desktop-chrome + 10 mobile-chrome), 53.4 s |
| Boot probes (`_s106-prospector`, `_s2080-f1742-1`, `f1297-2-plain-boot-tape-button`) | **10 passed** both projects, 44.9 s, zero console/page errors |
| `npm run test:node-guards` | **banked by s2371** — rc=1, 557 tests / 545 pass / 7 fail / 5 skipped, 546.8 s. Deliberately NOT re-run, per F-2371-4's explicit instruction. |

**Two of s2371's seven banked failures are cured by this drain** (`engine-era-guard`, `law-pointer-guard`); the remaining five are the scratch-gate false-red class and pre-existing main debt, each attributed by control in F-2371-4.

## The blocker, and how it was cleared

F-2371-4 banked one real blocker: `engine-era-guard` expected `0bd10f71…ea440a` and measured `dbf8b14e…dfd5d9` on the merged tree. The runner pinned era 4 **against the lane**, and merging moves the engine hash.

Measured here on a **fresh** merge (the banked `gate-s2371` tree was 4 commits stale):

| Tree | registry pin | actual hash |
|---|---|---|
| `main` before merge | `8a0559cd…5f074d` (era 3) | `1c0406f6…03eac3` — **already red** |
| `lane/b` | `0bd10f71…ea440a` (era 4) | measured against the lane checkout |
| merged tree | — | `dbf8b14e…dfd5d9` |

Re-pinned to `dbf8b14e…dfd5d9` **with the cause written at the site**, as F-1441-3 requires — never to make a red go away. Era stays 4: the bump is the lane's behavioural change and is correct; only the constant moved, because merging absorbed the era-3 copy edits (s2371 drain 1, `LanternShow.ts` / `RunSuspend.ts`) that had **already** left main's own era-3 pin stale.

⭐ **Consequence worth naming: this drain does not merely avoid a regression, it cures a standing main red.** Verified on main after the merge — `engine-era-guard` **2 pass / 0 fail**, where it was red before.

The independent corroboration that the re-pin is honest: s2371 measured `dbf8b14e…dfd5d9` on its own, older merged tree, and this fire measured the identical value on a tree four commits newer — consistent with the fact that none of those four commits touches an `ENGINE_SOURCE_INPUTS` path.

## The law-pointer re-base — and why the usual lesson inverts here

F-2371-4 predicted `law-pointer-guard` would red because "`Game.ts` grows +16 lines, so the coordinate moves". **The guard did red, but not for that reason, and the distinction is the finding.**

The cited members did **not** move: `placeBuilding`/`panAt` are still at `src/game/Game.ts:2486–2487` (eye-checked with `sed -n '2486,2487p'`). The slice's +16 lines all land *below* the citation, at `:3339`. What changed is the cited **content** — the call now passes a body position:

```
was: placeBuilding: (id, position, rotation = 0) => this.placeAgentBuilding(id, position, rotation),
now: placeBuilding: (id, position, rotation = 0) => this.placeAgentBuilding(id, position, rotation, this.prospector.position),
```

fire.md's claim — *"carries the exact `placeBuilding`/`panAt` members the master demanded — a GHOST"* — is **still supported**, so this is a baseline re-record, not a repoint, and the prose coordinate is left alone. Baseline diff is exactly two lines (one fingerprint, one excerpt).

⚠️ **This is the inverse of the warning that coordinate's own history repeats.** That parenthetical has recorded eighteen consecutive rots and hammers *"re-grep, never carry a remembered delta"*. Here a fire that had re-based by **adding** the predicted `+16` would have moved a **correct** coordinate to a wrong one — the remembered-delta habit fails in *both* directions, and the only safe method is the one the law already states: re-grep the content, then eye-check the line.

## Findings

**F-2372-1 — the runner's honest STOP-shaped flag is EXONERATED BY CONTROL, not by known-red membership.** The runner reported *"the unchanged human river-ghost test remains red on both projects despite unchanged human call sites/default origin"* without naming the file. Identified by extracting failing spec names from its own run log: `e2e/m1-05-sentry-beacon-build.spec.ts`.

This mattered more than a routine known-red: the failing assertion is `build.ghostValid === false` for a river placement, i.e. **exactly the predicate the slice's body law rewrites**, so it is precisely where a body-law regression would surface.

Attributed with a **reverted-files control** (F-1444-2), not membership:

| Arm | `m1-05:80` mobile-chrome |
|---|---|
| merged tree | **FAIL** — `ghostValid` true, false expected |
| merged tree, 4 slice `src/` files reverted to main | **FAIL** — identical assertion, identical message |
| merged tree, desktop-chrome | PASS |

**Control validity asserted before the result was believed (F-2215-1):** `git diff main -- <the 4 files>` was **empty** during the control arm, proving it really held main's content. ⇒ **Pre-existing main debt, mobile-chrome only. Not the slice.** The runner was right to flag it and right not to touch it — reporting a defect instead of fixing it out of scope is a firewall success.

**F-2372-2 — the second mobile red in that file is the known F-2320-1 flake, DEMONSTRATED rather than asserted.** `m1-05:112` ("renderer memory stable") failed on texture count 41 vs 42, then **passed on immediate re-run in the same shell on the same tree**. That is the rotating mobile flake already on the owner's desk as F-2320-1 (aborted-on-unload texture fetch); it is named here with its reproduction rather than waved at by class membership.

## Merge classification

**Base:** `12710087e` (`git merge-base main lane/b`). Merge strategy `ort`, **no conflicts**.

All 13 lane paths classify **LANE-ONLY** against main (`lane-usable` reports 13 HELD LANE-ONLY, 0 BOTH-MOVED, 0 MAIN-ONLY) — main had not moved any of them, so there was nothing to graft.

`tasks/BACKLOG.md` was the only auto-merged file. Three-way verified by line census rather than trusted: base **4855** / main **4871** / lane **4856** / merged **4872**, with **0 lines from main absent from the merge** and **0 lines from the lane absent** — the lane's single added row present, all of s2371's rows intact.

Post-merge: `main..lane/b` empty, `lane-usable lane-b` → `ahead=0 · USABLE`.

## Where does the PLAYER see this, in a plain boot? (Mistake #10)

Through the agent, in normal play: a BUILD order given to the Prospector now walks it to the site and raises the building, where before it failed at range. `public/skill.md` — the public order vocabulary — states the new law. The engine-era bump is player-visible news by definition (`tasks/engine-era-law-v3.md`), so a GZ-01 item is filed for this merge. The boot probes above assert a clean plain boot with no `?debug`.
