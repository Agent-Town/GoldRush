# vp-02b-jumper-slot-red — LAWFUL STOP (no merge), s1144

**Slice:** `lane-vp-02b-jumper-slot-red` · **Lane:** lane-b (`lane/m4`) · **Runner:** run `20260727-234321-lane-b-lane-vp-02b-jumper-slot-red.md.log`
**Tip:** repo clean at `66c5890b`; `main..lane/m4` **empty** — zero diff, nothing to merge.

## Verdict

**STOP — LAWFUL AND CORRECT.** The master's scope 1 was an explicit measure-first STOP gate; it fired exactly as designed and the runner stopped instead of inventing a cure. Per Mistake #1 (the Silent No-Op), a run that changes nothing must write WHY — this one did, in full, with the enumerated evidence. **No corrective is owed against the runner.** The master's *hypothesis* was wrong; the master's *shape* did its job.

## What the runner reported

`spawnPack(1, 5)`, `spawnThief('north')` and `spawnWrecker('north')` on fresh boots all returned truthy but none produced `spriteAnimations['char.claim_jumper']`. All three exposed the same 16 slots, none of them `char.claim_jumper`. Source tracing: `EnemyPool` builds animators for `char.bandit_base` / `char.bandit_thief`; `char.claim_jumper` survives only as a placeholder tag. The probe and candidate edit were restored byte-exact.

## Verification — I re-derived the claim at source rather than inheriting it

✓ **The runner is RIGHT, and the cause is a 15-day-old rename nobody propagated to the specs.**

- `src/entities/pools.ts:337` and `:355` construct the enemy `SpriteAnimator`s with `assetSlots.charBanditBase` / `assetSlots.charBanditThief`. The *batch names* still read `GeneratedClaimJumperThiefSprites` — a vestige that makes the rename easy to miss on a skim.
- `spriteAnimationDiagnostics()` (`src/assets/SpriteAnimator.ts:208`) returns `animationDiagnostics`, populated per constructed animator ⇒ **`char.claim_jumper` can never be a key.** No spawn surface could have satisfied the wait; the master's scope-1 hypothesis (`spawnThief`) was unfalsifiable-by-construction.
- `char.claim_jumper` now survives only as an asset URL (`src/assets/generated.ts:8`), placeholder tags (`src/entities/Enemy.ts:264`, `src/entities/pools.ts:1150/1196/1209`), an encyclopedia entry (`src/encyclopedia/registry.ts:199/201`) and a contract slot.
- **Root cause: `82543f27` (2026-07-12T21:32, `runner(lane-d): wire-e1-bandit-variants.md`).** `git log -G"charBanditBase" -- src/entities/pools.ts` returns **exactly one** commit — this one. Its 12 touched files added `char.bandit_base`/`char.bandit_thief` to `assets/layer-contracts/characters.v2.json` and rewired `pools.ts`, **and updated zero of the seven e2e specs that name the old slot.** It added one new spec of its own.

✓ **No gameplay or art regression — checked before saying so.** `char.bandit_base` carries `walk8: true` in `characters.v2.json` and maps to `assets/processed/char-bandit-base-sheet-walk8-*.png`, which are present on disk. The enemy got *new* art; `enemy-claim-jumper.png` is now the encyclopedia portrait only. The runtime half of `82543f27` was correct and complete. **The damage is confined to the e2e layer.**

## F-1144-1 — the stranded set is SEVEN specs, and it was fingerprinted as separate "known reds" for 15 days

Seven specs perform a runtime lookup on the dead slot: `066-walk8-engine`, `lane-c-activations-assay-office`, `task-031-anim-roundness`, `task-042-anim-smoothness`, `visual-polish-assets`, `vp-02-sprite-animation`, `vp-02b-rotation-resolver`.

Successive drains recorded these one at a time as *pre-existing, untouched by this slice* — `reviews/vp-02d.md:26`, `reviews/vp-02e.md:60`, `reviews/vp-02e-runner-report.md:81` and `:108` — without ever joining them to one root cause. That is the "fix the class, not the instance" law failing in slow motion.

⚠️ **`reviews/066-walk8-engine.md:24` records `claim_jumper now walk8 — pass ×2`. That review is dated 2026-07-10, two days BEFORE the rename.** Its green describes a tree that no longer exists; do not inherit it.

## F-1144-2 — TWO stale classes, and Class A MASKS Class B

Measured this fire, `--project=desktop-chrome`, port 5188 verified free with all six queues empty and no runner live (Mistake #12):

| Spec | First failure | Class | Evidence |
|---|---|---|---|
| `task-031-anim-roundness` | `:202` | **A** | `hero.frameCount` **Expected 4, Received 8** |
| `task-031-anim-roundness` | `:242` | **A** | same shape |
| `task-042-anim-smoothness` | `:59` | **A** | 30 s timeout waiting `char.hero` `frameCount === 4` |
| `066-walk8-engine` | `:81` | **A** | 30 s timeout in `heroWalk`, same wait |
| `visual-polish-assets` | `:68` | **B** | `char.claim_jumper` → **"missing"**, expected `"loaded"` |
| `vp-02b-rotation-resolver` | `:283` | **B** | 30 s timeout on the jumper wait (measured s1143) |
| `vp-02-sprite-animation` | `:705`/`:739` | **B** | `reviews/vp-02e.md:60` |

Batch run of the four unmeasured specs: **4 failed / 1 passed (1.0 m)**.

- **Class A — hero walk4→walk8 staleness.** The runtime hero is **walk8** (`frameCount` 8); three specs still assert `4`, `fps ≈ 9.5`, `char-hero-sheet-walk4-`. Consistent with the standing note that the hero runtime is walk8.
- **Class B — the `82543f27` slot rename.**
- 🔑 **Class A fails FIRST in `066:219`, `task-042:76` and `task-031:209`, so those three never reach their jumper assertions at all.** Repairing Class B alone will not green them, and repairing Class A will *unmask* three more Class-B failures. A red at row 1 says nothing about rows 2..N.

**Not fixed here, deliberately:** this STOP produced zero diff and one master per fire is the cap. The repair is authored as `lane-vp-02b-jumper-slot-repair` with the ordering above written into its scope.

## Bookkeeping

Done-move renamed `stopped-lawful-s1144-…` — it is a lawful STOP, not a shipped slice, and must never read as one (Mistake #13: report merges and diffs, never done-move counts). Goal leaf `lane-vp-02b-jumper-slot-red` → `status: "stopped-lawful"` with this file as its evidence pointer. **No `mergeHash`** — unfinished work carries no hash.

**Task `tasks/025-vp-02e-jumper-8way-activation.md` stays ⛔ DO-NOT-QUEUE.** F-1132-7's residual is unchanged by this STOP.
