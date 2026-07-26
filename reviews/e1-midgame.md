# e1-midgame — THE MIDGAME GETS ITS PRESSURE BACK (Double-Tap Coil capped at three)

**Slice:** `lane-e1-midgame` (attended-authored DRAFT, E1-depth review leg 2, 2026-07-26)
**Branch / tip:** `lane/m4` @ `1e603005` — `runner(lane-b): lane-e1-midgame.md`, committed 2026-07-26T15:07:41+07
**Drained by:** s1077 fire · **Merge base:** `286c2f48`
**VERDICT: MERGED** — path-scoped to `src/game/Balance.ts` only, plus one coupled test repair (F-1077-2). Two findings go to the OWNER'S DESK; one is a trap for every future fire.

## What it does
Optimisation **#1 of four** from the midgame master, which explicitly authorised *"land one, measure, then decide"*: `doubleTapCoilMaxStacks` **6 → 3**, in **both** required literals — the public datum (`Balance.upgrades`, `:823`) and the `TRAIL` preset-reset table (`:1009`). The runner's reasoning for touching both is **correct and load-bearing** (✓ VERIFIED by reading `applyDifficultyPreset`, `Balance.ts:1043-1065`): that function resets every datum from `TRAIL` on *every* preset application including the default `'trail'`, so changing only `:823` would be silently reverted the moment any preset applied. The intent is to stop fire-rate compounding (6× +25%) from deleting Trail waves before they can reach the hero, which is what made Dry Gulch's middle sixteen waves decision-free.

## Merge classification (§3)
`lane/m4` is ahead of main by exactly **two files across two commits**, and they required opposite treatment:

| File | Commit | Classification | Action |
|---|---|---|---|
| `src/game/Balance.ts` | `1e603005` | **LANE-TOUCHED only** — `git diff 286c2f48 main -- <file>` **empty**, i.e. main never moved it since the merge-base | Grafted from the pinned commit; result verified **byte-identical** to `1e603005` |
| `scripts/deploy.sh` | `793c9f2f` | **MAIN-MOVED past it** — the F-1073-1 trap | **EXCLUDED.** Not merged |

`scripts/deploy.sh` was deliberately left behind: F-1073-1 (twice-recorded, s1066 + s1073) establishes that main carries `PAGES_PRODUCTION_URL` + a 3-attempt retry loop, while `793f...`'s version checks the ephemeral per-deploy URL once with no retry. Merging it would regress the deploy chain. Because the lane's two commits touch **disjoint files**, a path-scoped graft of `Balance.ts` alone threads the needle exactly — no 3-way was needed and none was invented.

## Evidence (real numbers, measured in main's tree)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0** |
| `npm run build` | **exit 0**, `✓ built in 1.38s` (chunk-size advisory pre-existing) |
| Datum-reading suites, desktop-chrome + mobile-chrome, `--workers=1` | **56 passed / 2 failed (6.0m)** — `task-024-blast-aim-presets`, `sci-02-families-mastery`, `meta-presence`, `sci-01-research-loop`, `sci-04-contract-registry` |
| The 2 reds | `task-024:130` *"difficulty preset falls back to default when profile storage is blocked"*, both projects — **PROVEN PRE-EXISTING** (below) |
| Cap enforcement, real level-up path | `"stacks":{"heavy_spark":3,"double_tap_coil":3,"long_resonator":2,...}` — **the cap binds at 3** |
| Console / page errors | **0 / 0** (rehearsal `errors: console=0 page=0`; both suites assert empty buckets inside passing tests) |
| Rehearsal (master's named check) | `e1-dry-gulch`, timescale 2 — died **wave 7**, 172 kills, HP moved 100→76→52 |
| Artifacts | `reviews/shots-e1-depth/s1077-cap3-maintree-*` (6 shots + `-report.json`) |

**Pre-existing red, proven not inherited (the cp-revert fingerprint).** I reverted `Balance.ts` to clean `HEAD` and re-ran the two failures. Result: `task-024:130` **failed identically on clean main** (both projects, same 30s timeout at `openGame`/`:19`, same stack), while `meta-presence:114` **passed** — which is what exposed F-1077-2 as mine. Graft then restored and re-verified byte-identical to `1e603005`.

**Honest limit on the balance verdict.** My run ended at **wave 7**, so it does **not** independently reproduce the master's stated check (*"at least one wave where hp falls between waves 10 and 19"*); the runner's own run did (HP 159→135→127→31 across w10–13, died w13). Three runs of this rig produced **w7 / w12 / w13**, and the two on main-tree code ran at very different frame rates (33 fps under load vs 104 fps). **Run-to-run variance is large enough that no single run settles a balance question** — I am reporting corroboration (pressure is restored; the cap binds; HP moves in the midgame) and explicitly **not** claiming the wave-7 death is the new expected outcome. Whether this *overshoots* — the cited baseline secured wave 20 taking zero damage w3→w19 — is a design call, folded into F-1077-1 below.

## Findings

### F-1077-1 — the coil cap has stopped being a difficulty lever (owner, one word) · NON-BLOCKING
✓ VERIFIED by reading `Balance.ts:1043-1065`. `applyDifficultyPreset` resets all presets from `TRAIL`, then `vein-hunter` overrides with **`balance.upgrades.doubleTapCoilMaxStacks = 3`** (`:1061`). With `TRAIL` now also **3**, and `greenhorn` never overriding this datum, **all three presets now cap the coil at 3** — `:1061` is a no-op and the hard preset no longer differs from default on this axis.

Consequence for the tests: `e2e/task-024-blast-aim-presets.spec.ts:103` (`expect(hard.balance?.doubleTapCoilMaxStacks).toBe(3)`) **still passes and has gone VACUOUS** — it can no longer detect `vein-hunter` failing to apply the cap, because the baseline now supplies the same value. Same shape as the `ed-04` vacuous-guard class.

**Options:** (1) give `vein-hunter` a *lower* cap (2) so the lever stays real and `:103` regains its discriminating power; (2) accept that the coil cap is now a global constant, delete `:1061` as dead code and re-point `:103` at a datum the preset actually changes. **Recommendation: (1)** — it preserves the hard preset's meaning and costs one datum. Either way this is a design call on difficulty, so §7.3 → owner. *One word does it.*

### F-1077-2 — a test hardcoded the datum it also derives (FIXED IN THIS MERGE) · was BLOCKING
`e2e/meta-presence.spec.ts:139` asserted the literal string `'0/6 stacks toward Spark Pressure Ring'` while **line 13 of the same file** already derived the cap from `Balance.upgrades.doubleTapCoilMaxStacks`. The graft therefore turned it red on both projects. Traced to source, not guessed: the rendering site is `Game.ts:7233-7239`, where `total` = Σ `def.maxStacks` over the firerate family, and `Upgrades.ts:48` feeds `double_tap_coil.maxStacks` from the datum — so with the cap at 3 the panel truthfully renders `0/3`. **The engine was right and the test was lying about it** (the F-1068 shape again). Repaired by deriving the value, matching line 13's own convention:

```
`0/${Balance.upgrades.doubleTapCoilMaxStacks} stacks toward Spark Pressure Ring`
```

This is a precondition/derivation repair, **not a bent expectation** — the assertion still requires the rendered number to equal the datum, so it stays regression-sensitive and does **not** go vacuous. Green on desktop + mobile-390 after the repair. The runner never caught this because it ran only "focused difficulty/mastery" tests; its *"broader desktop battery 9/10, unrelated"* claim covered a different battery than the one that breaks.

### F-1077-3 — ⚠️ THE REHEARSAL RIG SILENTLY MEASURES WHATEVER IS ON :5247 (a trap for every fire) · NON-BLOCKING but ACT ON IT
`rehearsal/segments/e1-depth-play.mjs:27` reads `const BASE = process.env.E1_BASE ?? 'http://127.0.0.1:5247'` — a **fixed port with no ownership check**. When I ran the master's named verification with the default, a vite dev server **8h36m old, cwd `/Users/robin/Claude/Projects/gr-task-e1-gameplay`** (the attended's `review/e1-gameplay-depth` worktree, where the cap is still 6) was listening there. The rig happily played 12 waves against **another tree's code** and reported `"double_tap_coil":6` **under a cap of 3**.

That output reads exactly like *"the cap is not enforced, so this slice is inert in real play"* — a false P0 I was one commit from filing. Caught by `lsof -nP -iTCP:5247` + the listener's `cwd`, then re-measured on a scratch port (5251, verified free **and** verified serving main) where the cap binds at 3. This is textbook **Mistake #12**, and the rig's default makes it the *easy* path. **Recommendation:** the rig should either fail closed when `E1_BASE` is unset, or assert the served tree's identity before playing (a build stamp / sentinel fetch). Until then: **any fire running this rig must verify the listener's `cwd` first.** Contaminated evidence retained, not deleted, under the RETENTION LAW: `reviews/shots-e1-depth/s1077-midgame-cap3-*` — **those seven files are the FOREIGN-TREE run; do not cite them as this slice's evidence.**

### F-1077-4 — `src/game/Balance.ts.orig` is tracked merge debris in main (hygiene, PRE-EXISTING)
`git ls-files` matches it; it landed **2026-07-06 at `680775c3`, `runner(art): art-batch-008-prospector-companion.md`** — i.e. an **art** run swept a merge `.orig` into main, which is precisely what the path-scoped-`git add` law (§4.2) exists to prevent. It holds a stale duplicate of `applyDifficultyPreset` / `applyStoredDifficultyPreset` (at `.orig:305`/`:329`), is not importable (the extension does not resolve) and so is dead weight — but it **already polluted this investigation's greps**, surfacing alongside the real `Balance.ts` and offering a second, wrong set of line numbers for the exact functions I was reading. Fires cannot `rm`/`git rm` (gated), so this needs an attended or owner hand. 20 days tracked.

### F-1077-5 — the blocked-storage boot path may hang the game for real players (PRE-EXISTING, wants triage)
The one red I merged past is not merely a test artifact and should not be filed as one. `task-024:130` times out because frames never start, and the dev-server log shows the cause: **`[Unhandled rejection] Error: blocked storage`** thrown from `rawGet` (`ProfileStorage.ts:475`) via `readLegacyDifficulty` (`:369`) → `ensureProfileState` (`:103`) → `activeProfile` (`:138`) → `new TileStateStore` (`TileStateStore.ts:44`) → `new Game` (`Game.ts:1189`) → `startGame` (`main.ts:122`). The test's own name is *"falls back to default when profile storage is blocked"* — the fallback it asserts is **not happening**; the rejection escapes during construction. If that reproduces in a browser with storage blocked (private mode, strict privacy settings), **the game does not boot for that player**. Pre-existing to this slice and proven so, therefore not a gate blocker — but it deserves an attended triage rung, not another fire's shrug. Unverified in a real browser profile; I did not chase it inside this drain's scope.

## Where the player sees this
The changed datum is rendered on an already-player-visible surface: the pause panel's mastery line, `Firerate mastery — 0/3 stacks toward Spark Pressure Ring` (`Game.ts:7239`), now asserted against the datum by `meta-presence:114` on **both** desktop and mobile-390. In play, the effect is that the level-up offer must diversify after the third coil instead of stacking six.
