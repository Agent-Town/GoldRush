# lane-gold-quantization — F-BW-12: gold is coins, not floats

**Slice:** `lane-gold-quantization` (master `tasks/done/20260803-173341-lane-gold-quantization.md`)
**Branch:** `lane/e2-arsenal` · **Tip drained:** `ce12d8c9c6593912f0a4b26f317f0d2bd0b5a343` (bottom of a 3-commit stack)
**Base:** `3aa4d123652cc601d3e645d8aac5ed6e9fa26360` — which is *also* `merge-base(main, lane/e2-arsenal)` and the commit's own parent
**Drained by:** s1439 fire · **Gate worktree:** detached `gate-s1439` (§3.0b), scratch port 5199 then 5231, every playwright run `--workers=1` (§3.1)

## VERDICT: MERGED

The owner's complaint is answered at the mint rather than the label, which is what the master asked for and the harder of the two options.

## What it does

Owner, gate walk 2026-08-03, verbatim: *"after upgrading the seam harvest, there are these unround numbers that mess things up. It is not visible anymore what the maximum gold storage is because of the numbers after the . - this should be truncated in the box"*.

Fractional yield multipliers (seam upgrades, 1.4× twists) were accruing float gold, so the HUD overflowed its box (`29.9999999` pushed the `/cap` out of view) **and** affordability quietly lied — `29.99999 < 30` while the label read `30`.

The fix keeps Economy as the sole gold writer (§4 one-writer law) and adds a **per-actor fractional dust bucket** at `GOLD_DUST_PER_COIN = 1_000_000`: yields accrue as integer dust, the player-visible gold advances only in whole coins, and the remainder is carried. The m4-08 per-actor attribution split survives exactly, because the dust is split per actor too. Debits stay integer and now *say so* — `apply()` throws on a fractional `gold_spent`/`gold_stolen`, and `decodeEconomyEvent` rejects the same at the envelope boundary. `canReceiveIncome` asks whether the coins that would actually be **minted** fit under the bank cap, rather than whether the raw float does. The dust rides through suspend/restore as an optional `goldDust` envelope field, validated by `decodeGoldDust` and omitted entirely when both actors are at zero, so existing saves are byte-identical.

The HUD change is deliberately belt-and-braces: gold is already integral by the time it arrives, and `goldText` truncates anyway.

## Merge classification

`git diff --name-only 3aa4d123 main` over the five slice paths is **EMPTY** — main never moved any of them since the lane's base. All five are **PURE LANE-TOUCHED**, zero conflicts, nothing to graft.

Applied as a **path-scoped blob copy from `ce12d8c9`, not a branch merge**: `lane/e2-arsenal` carries two further commits (`39cfef9d` fort-solidity STOP report, `9236e9ba` tb-stall-census) that are *not* part of this slice and are being drained separately. Every applied blob was hash-verified against `ce12d8c9` before and after landing.

| file | classification |
|---|---|
| `src/game/Economy.ts` | LANE-TOUCHED |
| `src/game/RunSuspend.ts` | LANE-TOUCHED |
| `src/ui/Hud.ts` | LANE-TOUCHED |
| `e2e/lane-gold-quantization.spec.ts` | LANE-TOUCHED (new) |
| `scripts/gr-sim.test.mjs` | LANE-TOUCHED |
| `artifacts/lane-gold-quantization/*` | LANE-TOUCHED (3 new) |

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.23s** |
| `scripts/gr-sim.test.mjs` (determinism) | **9/9 pass**, 82.2s — includes the slice's new fractional-seed replay-stability cases |
| own spec `e2e/lane-gold-quantization.spec.ts` | **4/4 green**, desktop + mobile, 12.3s |
| adjacent battery (6 suites, both projects) | **97 passed / 3 failed**, 10.4m — all 3 disposed of below |

Adjacent suites derived **by grep**, not from the runner's list: `bankCap|BANK_CAP|canReceiveIncome`, `hud-gold|gold-value|goldText`, and `runSuspend|suspendEnvelope` over `e2e/` → `m2-01-build-menu`, `m2-02-sluice-and-stockpile`, `m2-04-gold-stealing`, `restore-validation`, `run-suspend`, `save-slots`.

Artifacts: `artifacts/lane-gold-quantization/before.png`, `after-desktop-chrome.png`, `after-mobile-chrome.png`.

## The three adjacent reds

**1. `m2-04-gold-stealing.spec.ts` — "thief routes around a finite palisade line to steal" (desktop-only).**
Matched `logs/suite-red-inventory.md:162` **by title and by assert coordinate** (`:226`), same error class (`toBeLessThan`), same DESKTOP-ONLY marking. Known red.

**2. `restore-validation.spec.ts` — "active megaproject wrecker references survive strict normalization and restore" (mobile-only).**
Matched inventory `:201`/`:202` **by title**; coordinate differs (inventory `:708`, run reports the test's opening line `:656`) — **F-1436-2 reproducing for the third fire running: look these up by TITLE, never by coordinate.** The error string is byte-identical to the recorded one (`root.hero.position.y: 0.14559222393281415 != 0.2763519114255905`), and inventory `:472` records it at 52/59 (88.1%) desktop. Known red.

**3. `run-suspend.spec.ts:194` — "wave-boundary suspend restores state and matches the uninterrupted seeded run". This one was NOT waved through, and it nearly convicted the slice.**

It is absent from the inventory by title, and F-1180-2's load-ceiling entry explicitly does **not** cover it: *"A casualty that fails in isolation, or two casualties in one run, is NOT covered by this entry."* It failed in isolation on **both** projects. And this slice **changes the suspend envelope**, so a suspend/restore equality test is exactly where a real defect would surface.

Measured, same worktree / same port / same instrument, control produced by reverting the four code paths to `HEAD` and proven main-equivalent by an **EMPTY** `git status --porcelain -- src e2e scripts`:

| arm | run 1 | run 2 | red instances |
|---|---|---|---|
| merged tree, isolation | desktop RED + mobile RED | desktop RED + mobile RED | **4/4** |
| clean main, isolation | 10/10 GREEN | mobile RED | **1/4** |

**Clean main fails this test too.** The first control came back 10/10 green and, taken alone, would have convicted the slice; a second sample is the only reason this review says what it says.

Causal disconnection, read at the code rather than inferred:
- The failing assertion is `run-suspend.spec.ts:278`, `expect(errors.consoleErrors).toEqual([])`. The casualties are `THREE.GLTFLoader: Couldn't load texture blob:...` — **F-1436-1's open class**.
- The assertion this slice could actually break — **`:276`, `economy.gold` deep-equals the saved value** — is **GREEN in every single red run, on both arms**.
- The slice touches gold accrual, HUD text and the envelope's *economy* fields. It touches no asset, GLB, texture or blob-URL path.
- **F-1437-1** (filed last fire) names why this suite is uniquely exposed: `run-suspend`'s error collector never calls the `suppressed[]` GLTF helper that `console-watch` provides and `drill-yard.spec` visibly uses. The ambient error class is filtered elsewhere and unfiltered here.

⚠️ **Recorded against my own verdict:** the rate asymmetry — **4/4 merged vs 1/4 control** — is real and unexplained. At n=4 per arm it is not statistically separable from the base rate (Fisher's exact ≈ 0.14), and I did not chase it further. A plausible-but-unmeasured mechanism exists: `accrueGold` allocates slightly more per event, and blob-URL texture loading is timing-sensitive, so a small perf delta could shift a flake rate. **The slice is not convicted; it is not proven rate-neutral either.** That gap is F-1439-1, not a silence.

## Findings

- **F-1439-1 🟡** — `run-suspend:194` reds at **4/4 on the merged tree vs 1/4 on clean main** under an identical instrument. The failure is F-1436-1 GLTF console noise and the slice's own assertion is green, so it did not block this merge, but the asymmetry is unmeasured. **Do not "cure" this by deleting `run-suspend`'s console-error assertion** — that is the F-1435-1 standing order's shape. The real cure is F-1437-1: route this collector through the `suppressed[]` helper, which removes the ambient class from the measurement entirely and makes the rate question answerable.
- **F-1439-2 🟢** — `drain-block-check` returned **UNKNOWN** for this master (no goal leaf), continuing F-1438-3. Leaf registered and flipped `merged` by this drain.
- **F-1439-3 🟢** — the inventory-by-title rule (F-1436-2) held for the **third consecutive fire**: 2/2 inventory matches by title, 1/2 by coordinate. The coordinate column is the *assert* line; run output reports the *test opening* line. They coincide only by accident.
