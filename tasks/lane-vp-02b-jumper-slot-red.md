# Task lane-vp-02b-jumper-slot-red: cure the `vp-02b:233` jumper red by observing a jumper, and settle the dormancy assert against shipped behaviour (lane-b, commit prefix "test:")

**FIRE-AUTHORED s1143 (attended review welcome).** From a **known, already-fingerprinted pre-existing red** (`reviews/vp-02d.md:26`) plus the **residual named on the face of `tasks/025-vp-02e-jumper-8way-activation.md`** (F-1132-7). It invents no scope: the 8-way jumper behaviour is already shipped by the walk8 route, task 025 is already guarded `⛔ SHIPPED, BY A DIFFERENT ROUTE — DO NOT QUEUE`, and this task only makes the test observe the thing it was always named for. **No product code. `src/**` is barred.**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE** — every modified/deleted/untracked file's content must already exist somewhere in git (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1143 pre-verified this lane and you must still re-verify it: `git log main..lane/m4` shows **one** commit, `5e9eba91 runner(lane-b): lane-vp02-capture-error-surface.md`. That slice is **DRAINED** — s1142 landed it on main as `8cab8791` by tip-graft, its done-move is `tasks/done/shipped-8cab8791-20260727-223821-lane-vp02-capture-error-surface.md`, and `reviews/vp02-capture-error-surface.md` is present on main. A tip-graft drain leaves the branch **falsely "ahead"**; nothing is lost by the reset.)*

## READ FIRST (paths, in this order)

1. `e2e/vp-02b-rotation-resolver.spec.ts:233-290` — the failing test, end to end. Note it presses `KeyP` to **pause** at `:235` and only then spawns.
2. `reviews/vp-02d.md:26` — the diagnosis, already written by an earlier slice.
3. `tasks/025-vp-02e-jumper-8way-activation.md` — its `⛔` header (what shipped, and where) and its **`## e2e` item 4** (the dormancy inversion this task finally settles). **Do NOT run task 025 itself; it is guarded DO-NOT-QUEUE.**
4. `src/game/Game.ts:1656-1659` — the `__GR_TEST__` spawn surfaces (`spawnPack`, `spawnThief`, `spawnWrecker`).
5. `src/assets/slots.ts:5` — `charClaimJumper: 'char.claim_jumper'`.
6. `src/entities/Enemy.ts:198`, `:753`, `:755`, `:888`, `:894` — the live 8-way resolver + `grab`/`flee` clips.

## WHY (quoting the evidence, dated)

`e2e/vp-02b-rotation-resolver.spec.ts:233` — *"action clips stay on coarse orientation cells and jumper diagnostics stay old shape"* — is **RED on main**, and has been long enough to be recorded as a known pre-existing red. `reviews/vp-02d.md:26` states the cause verbatim:

> 1. **`:233` jumper diagnostics** (desktop + mobile) — `spawnPack()` exposes `char.bandit_base`, not `char.claim_jumper`; the wait times out. Runner reported this independently. Pre-existing, untouched by this slice.

✓ **Re-measured at source by s1143 on current main, not inherited** — `npx playwright test e2e/vp-02b-rotation-resolver.spec.ts --project=desktop-chrome` → **1 failed, 6 passed (1.6m)**. The failure is a **30 s timeout at `:283`**, the `waitForFunction` waiting for `spriteAnimations['char.claim_jumper']?.loaded === true`. **The assert at `:285` is therefore never reached** — the test has never actually checked the jumper's diagnostics shape at all.

🔑 **Why this is worth a slice.** The test is named for the jumper and gates the jumper's diagnostics shape, but it observes a slot that never appears, so it fails for a reason unrelated to its own claim. Meanwhile `tasks/025-vp-02e-jumper-8way-activation.md` is guarded as **already shipped by the walk8 route** — *"the behaviour is live: `src/entities/Enemy.ts:198` `new OrientationResolver()`, `:753` … `.resolve(...)`, `:755` `.idleDirection()`, with grab/flee clips at `:888`/`:894`"* (all five ✓ verified at source by s1143) — and its own remainder says the gap left behind is **test coverage, not unshipped behaviour** (F-1132-7). So a red test and a coverage gap describe **one** missing thing: nobody has ever watched a real claim jumper's diagnostics.

## SCOPE (numbered, each testable)

1. **FIND THE SURFACE THAT ACTUALLY EXPOSES `char.claim_jumper` — measure, do not assume.**
   `spawnThief()` (`Game.ts:1658`) is the *likely* answer and the encyclopedia maps the claim jumper to that slot (`registry.ts:199` → `assetSlots.charClaimJumper`), **but I have not proven it spawns one, and you must.** Determine empirically which `__GR_TEST__` surface makes `window.__THREE_GAME_DIAGNOSTICS__.spriteAnimations['char.claim_jumper']` reach `loaded === true`.
   - ⚠️ **If NO surface does, STOP and report that** — with the list of slots `spriteAnimations` actually contains after each spawn call. That would mean the jumper sprite never mounts in a harness at all, which is a bigger finding than this task and is **not** to be fixed in `src/`.
   - ⚠️ **Mind the pause.** The test pauses via `KeyP` at `:235` before spawning. If the sprite only loads while unpaused, say so explicitly and choose the minimal honest ordering (spawn/load before pausing, or pause later) — **do not** delete the pause, which the first half of the test depends on.

2. **Point the test at that surface** so `:283` waits on a jumper that genuinely mounts. Keep the existing first half (`panEast` / `aimSouth` hero action-clip asserts at `:277-281`) **byte-unchanged** — it passes today and is not this task's business.

3. **SETTLE THE DORMANCY ASSERT AGAINST WHAT YOU OBSERVE — and you may contradict me.**
   `:285` currently asserts the jumper snapshot's keys are exactly `['clip','fps','frame','frameCount','frameKey','loaded']` — the pre-walk8 "old shape". Task 025's `## e2e` item 4 anticipated this exact moment: *"Dormancy inversion: the old jumper-shape dormancy assert flips to an activation assert — update that ONE test with an in-file note."*
   - Once the jumper is genuinely observed, **record its real key set and clip/direction values** and make the assert state the truth.
   - **If the shape now carries the 8-way fields (e.g. `direction` / `mirrored`), invert it to an activation assert** and leave a one-line in-file note citing task 025 item 4 and this task.
   - **If the shape is still the old six keys, KEEP the old-shape assert** and report that plainly — that would mean the walk8 route did *not* reach the jumper's diagnostics and the `⛔` guard on task 025 overstates what shipped. **Either outcome is a success for this task; do not bend the assert to match my expectation.**
   - **Do NOT change `src/`** to make either outcome happen.

4. **Prove the cure with a mutation control, not just a green.** After the test passes, deliberately re-point the wait at a slot that does not exist (e.g. `char.claim_jumper_NOPE`), confirm the test goes **RED at the wait**, then restore byte-exact. Paste both outcomes. (A test that passes because it silently observes nothing is the defect being cured here — prove it cannot.)

## FIREWALL

**TOUCH-ONLY:** `e2e/vp-02b-rotation-resolver.spec.ts`.
**NO:** `src/**` (barred entirely — this is a test-truth slice, not a behaviour change) · `tasks/025-vp-02e-jumper-8way-activation.md` (guarded DO-NOT-QUEUE; read it, never edit it) · any other `e2e/*.spec.ts` · `assets/**` · `Balance.ts` · the `:277-281` hero asserts · the `KeyP` pause the first half depends on.
Canon (brief §9.2): the claim jumper is an unarmed thief — no weapon/blood language in any note you add.

## SELF-CHECK (name the exact commands and paste real numbers)

- `npx tsc --noEmit` clean.
- `npm run build` green.
- `npx playwright test e2e/vp-02b-rotation-resolver.spec.ts --project=desktop-chrome --workers=1` → **7/7** (it is **1 failed / 6 passed** today; the delta is the whole point).
- Same spec on **`--project=mobile-chrome`** — `reviews/vp-02d.md:26` records this red on **desktop *and* mobile**, so both must be reported.
- Adjacent, UNMODIFIED and green: `e2e/vp-02-sprite-animation.spec.ts` and `e2e/066-walk8-engine.spec.ts` (both touch the same diagnostics surface). ⚠️ `vp-02-sprite-animation` has **known flaky reds** (s1142 measured 19 passed / 3 failed with a west-capture flake); report its numbers honestly and **do not chase them** — they are not yours.
- `vp-02b:113` is a **separate** known red (`reviews/vp-02d.md`) — leave it alone and say whether it still fails.
- Scope-4 mutation control shown RED then restored byte-exact.
- Zero console/page errors in the spec's own boot probes.

READY-FOR-GATES + report: which spawn surface exposes `char.claim_jumper` and how you proved it; the jumper's **actual** observed key set and values; which way scope 3 resolved (inversion vs old-shape-kept) and therefore whether task 025's `⛔` guard is accurate; the mutation control's red; desktop **and** mobile numbers; and `vp-02b:113`'s state.
