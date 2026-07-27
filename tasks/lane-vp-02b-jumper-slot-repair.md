# Task lane-vp-02b-jumper-slot-repair: retire the dead `char.claim_jumper` runtime lookup across the stranded spec class (lane-b, commit prefix "test:")

**FIRE-AUTHORED s1144 (attended review welcome).** Successor to `lane-vp-02b-jumper-slot-red`, which **STOPPED lawfully at its own scope-1 gate** — see `reviews/vp-02b-jumper-slot-red-stop.md`. That STOP was correct and its finding is the lift: **no spawn surface can ever mount `char.claim_jumper`, because the slot was renamed 15 days ago and the specs were never updated.** This task invents no scope — it propagates a rename that `82543f27` left half-done. **No product code. `src/**` is barred.**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE** — every modified/deleted/untracked file's content must already exist somewhere in git (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1144 measured this lane and you must still re-verify it: `git log main..lane/m4` was **EMPTY** — the predecessor STOPPED with zero diff, so there is nothing on this branch to lose. If it is no longer empty, a later run landed something: apply the invariant above before resetting.)*

## READ FIRST (paths, in this order)

1. `reviews/vp-02b-jumper-slot-red-stop.md` — the predecessor's STOP, the root cause, and the measured red table. **This is your evidence base; do not re-derive it from scratch, but do re-measure the numbers you rely on.**
2. `src/entities/pools.ts:337` and `:355` — the enemy animators, built with `assetSlots.charBanditBase` / `charBanditThief`. Note the *batch names* still read `GeneratedClaimJumperThiefSprites`; that vestige is why this was missed.
3. `src/assets/SpriteAnimator.ts:208` — `spriteAnimationDiagnostics()`, keyed per **constructed animator**. This is why no spawn surface could ever satisfy the old wait.
4. `src/assets/slots.ts:5-7` — `charClaimJumper`, `charBanditBase`, `charBanditThief`.
5. `src/assets/generated.ts:8-10` — the slot→PNG map. `char.claim_jumper` → `enemy-claim-jumper.png` (now the encyclopedia portrait only); `char.bandit_base` → `char-bandit-base-sheet-walk8-*.png`.

## WHY (quoting the evidence, dated)

**Root cause, verified at source s1144:** `82543f27` (2026-07-12T21:32, `runner(lane-d): wire-e1-bandit-variants.md`) rewired the enemy `SpriteAnimator`s from `charClaimJumper` to `charBanditBase`/`charBanditThief`, added both slots to `assets/layer-contracts/characters.v2.json`, **and updated zero of the seven e2e specs that name the old slot.** `git log -G"charBanditBase" -- src/entities/pools.ts` returns exactly one commit — that one.

✓ **The runtime half was correct and complete — checked before blaming it.** `char.bandit_base` carries `walk8: true` and its processed PNGs are on disk. **Do not "fix" `src/`.** The enemy got new art; only the specs were left behind.

The predecessor runner proved the consequence empirically: `spawnPack`, `spawnThief`, `spawnWrecker` all return truthy and **none** produces `spriteAnimations['char.claim_jumper']`. Its report lists the 16 slots that *do* appear. Its STOP was the right call.

🔑 **Why this is worth a slice.** Seven specs perform a runtime lookup on a slot that has not existed for 15 days. Successive drains recorded them **one at a time** as "pre-existing, untouched by this slice" (`reviews/vp-02d.md:26`, `reviews/vp-02e.md:60`, `reviews/vp-02e-runner-report.md:81` and `:108`) without ever joining them to one cause. This is the "fix the class, not the instance" law failing in slow motion.

## SCOPE (numbered, each testable)

1. **RE-MEASURE THE STRANDED SET BEFORE CHANGING ANYTHING — and record each spec's FIRST failing line.**
   The seven: `066-walk8-engine`, `lane-c-activations-assay-office`, `task-031-anim-roundness`, `task-042-anim-smoothness`, `visual-polish-assets`, `vp-02-sprite-animation`, `vp-02b-rotation-resolver`. Run each on `--project=desktop-chrome --workers=1` and paste the first failure line + received value per spec. **`lane-c-activations-assay-office` was never measured by me — it may already be green, or red for a third reason. Report what you find.**
   ⚠️ **Split by failure LINE, not by spec name.** A red at row 1 says nothing about rows 2..N.

2. **Repair the Class-B lookups: `char.claim_jumper` → the slot the runtime actually mounts.**
   Use `char.bandit_base` for the ordinary enemy and `char.bandit_thief` for the thief variant — **verify which one each call site is actually about before choosing**, and say how you decided. Sites to repair (re-confirm by grep, do not trust this list blindly):
   `vp-02b-rotation-resolver.spec.ts:284-285` · `vp-02-sprite-animation.spec.ts:739` · `visual-polish-assets.spec.ts:8` and `:87` · `066-walk8-engine.spec.ts:219-229` · `task-042-anim-smoothness.spec.ts:76-86` · `task-031-anim-roundness.spec.ts:209-223` · `lane-c-activations-assay-office.spec.ts:93-98`.

3. **`visual-polish-assets` is a JUDGEMENT CALL, not a rename — STOP-and-report if it does not resolve cleanly.**
   `:6-12`'s `batch001Slots` is a **boot canary**: it asserts every listed slot reads `'loaded'` in a plain boot. Measured s1144: `char.claim_jumper` → **`"missing"`** (expected `"loaded"`). Before substituting `char.bandit_base`, **measure whether `char.bandit_base` is itself `'loaded'` in a plain boot** — the enemy animator may not load until an enemy spawns, in which case a blind rename would turn a real canary into one that asserts a falsehood or has to be weakened.
   - If `char.bandit_base` **is** loaded at boot: substitute it and say so with the measurement.
   - If it is **not**: **STOP on this file only**, leave it unchanged, and report the finding with numbers. Repair the other specs and land those. **Do not weaken the canary to make it pass.**

4. **DO NOT TOUCH THE HERO `walk4` ASSERTS — they are a SEPARATE, OWNER-GATED class.**
   Measured s1144: `task-031:202` `hero.frameCount` **Expected 4, Received 8**; the same wait times out at `task-042:59` and `066:81`. The runtime hero is **walk8**; three specs still assert `4` / `fps ≈ 9.5` / `char-hero-sheet-walk4-`, and `066-walk8-engine.spec.ts:200-205` asserts `.not.toContain('walk8')` **on purpose** — that spec was written when the hero was deliberately walk4 while the jumper went walk8.
   **Whether the hero being walk8 is the intended shipped state or a regression is a real fork and NOT yours to settle.** Leave every hero assert byte-unchanged. Consequence to state plainly in your report: **`066`, `task-042` and `task-031` will REMAIN RED at their Class-A line even after your Class-B repair lands** — because Class A fails first and masks the jumper asserts entirely. That is expected, and it is not a failure of this task.

5. **Expect real bugs to surface behind the repaired waits — finding one is a SUCCESS, not a regression.**
   Assertions behind these waits have not executed since 2026-07-12. When a wait finally passes, the asserts after it run for the first time in 15 days and **may legitimately fail** (e.g. `vp-02b:285`'s six-key "old shape" assert, which task 025's `## e2e` item 4 anticipated flipping to an activation assert). **Report any such failure with its real values and do NOT bend the assert to make it green, and do NOT change `src/` to satisfy it.** Record it as a finding; a newly-visible true red is worth more than a green.

6. **Prove the cure with a mutation control, not just a green.** For one repaired spec, re-point the wait at a slot that does not exist (e.g. `char.bandit_base_NOPE`), confirm it goes **RED at the wait**, then restore byte-exact. Paste both outcomes. (A test that passes because it silently observes nothing is the exact defect being cured — prove it cannot.)

## FIREWALL

**TOUCH-ONLY:** the seven `e2e/*.spec.ts` files named in scope 2.
**NO:** `src/**` (barred entirely — this is a test-truth slice; the runtime is correct) · every hero `walk4`/`fps 9.5`/`char-hero-sheet-walk4-` assert (scope 4) · `tasks/025-vp-02e-jumper-8way-activation.md` (guarded ⛔ DO-NOT-QUEUE; read it, never edit it) · `assets/**` · `Balance.ts` · `vp-02b:277-281` hero action-clip asserts · the `KeyP` pause at `vp-02b:235` that the first half depends on.
Canon (brief §9.2): the claim jumper is an unarmed thief — no weapon/blood language in any note you add.

## SELF-CHECK (name the exact commands and paste real numbers)

- `npx tsc --noEmit` clean.
- `npm run build` green.
- Each of the seven specs, `--project=desktop-chrome --workers=1`, before **and** after, with first-failure lines.
- `vp-02b-rotation-resolver` and `vp-02-sprite-animation` **also** on `--project=mobile-chrome` (`reviews/vp-02d.md:26` records the red on desktop *and* mobile).
- ⚠️ `vp-02-sprite-animation` has **known flaky reds** (s1142: 19 passed / 3 failed, a west-capture flake). Report its numbers honestly and **do not chase them** — they are not yours.
- `vp-02b:113` is a **separate** known red (`reviews/vp-02d.md`) — leave it alone and say whether it still fails.
- Scope-6 mutation control shown RED then restored byte-exact.
- Zero console/page errors in the specs' own boot probes.
- **A grep proving the class is closed:** `git grep "char.claim_jumper" -- e2e/` returns only lines you deliberately kept (with a reason for each), or nothing.

READY-FOR-GATES + report: the before/after table with first-failure lines for all seven; how you decided base-vs-thief per call site; how scope 3 resolved (substituted with proof, or stopped with numbers); the exact set that is now green; **which specs remain red and at which line** (Class A is expected); any true red newly surfaced by scope 5, with values; the mutation control's red; desktop **and** mobile numbers; and `vp-02b:113`'s state.

## FINDINGS FOR A LATER SLICE (do NOT act on these here — `src/**` is barred)

- `src/assets/generated.ts:206` — `isCriticalStartupAssetSlot()` still names `charClaimJumper` as boot-critical, yet that asset measures `"missing"` in a plain boot. Likely a vestige of the same rename. **Report only.**
- `src/entities/pools.ts:343/:349` — batch names `GeneratedClaimJumperThiefSprites` / `…Fades` still carry the old character's name. Cosmetic, but it is what made this rename invisible for 15 days. **Report only.**
