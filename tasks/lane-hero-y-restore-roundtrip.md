# Task lane-hero-y-restore-roundtrip: THE HERO'S Y DOES NOT SURVIVE SUSPEND/RESTORE AT A MEGAPROJECT SITE (LANE-A, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome) — s1095, 2026-07-27. This defect was invisible for nine days: its spec could not collect until rf-33 (`e3db39ae`) landed one hour ago. It is the first bug the restored suite caught.**

**♻️ RE-AUTHORED s1606, 2026-08-09 — BANKED THIRTEEN DAYS, STALE-CHECKED BEFORE RE-DISPATCH, NOT BLIND-QUEUED (§2E / Mistake #8, the 824k Flail).** The owner greenlit `rf-34` in the 2026-08-09 desk sweep (leaf `rf-34-hero-y-restore-roundtrip` → `planned`, no `blockClass`). Three things were then measured on today's main rather than assumed: **(1) the defect is ALIVE** — the named test still fails with floats byte-identical to July's (see PRE-FLIGHT step 3); **(2) every source coordinate this master cites had rotted** and all six are re-based below; **(3) the pre-flight was pointed at the wrong branch** (`lane/m3`, while `worktrees/lane-a` is on `lane/a`) and lacked the F-1407-1 churn clause — both were live reds in `test:ledger-guards`, and F-1605-1 ruled that they close **inside** this re-authoring and never by editing the pre-flight alone, precisely so a 13-day-stale master could not be laundered into looking queueable. **The diagnosis, scope, firewall and gates below are s1095's and are UNCHANGED — the narrowing was re-read against today's `restoreHero` and still holds.**

You are Codex (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated — every number below was measured by s1095 on the merged tree at `e3db39ae`)

rf-33 restored whole-suite collection (`npx playwright test --list`: **0 tests → 2378 tests in 330 files**). Its standing warning was that the three recovered specs had not *run* in nine days and might be rotted, and that any red was **a finding to attribute, never something to fix by editing `e2e/`**. Three reds appeared. Two are accounted for. **This one is a real bug.**

### The failure

`e2e/restore-validation.spec.ts:658` — *"active megaproject wrecker references survive strict normalization and restore"* — fails on **both** projects, **deterministically** (byte-identical floats across isolated re-runs, `--workers=1`):

```
root.hero.position.y: 0.14559222393281415 != 0.2763519114255905
```

Everything the test is *named* for **passes**: `normalized: true`, `restored: true`, `targetActive: true`, `targetId: 'megaproject:dev-stamp-mill-site'`. **Only `exact` flips false, and the `differences` array has EXACTLY ONE entry** — the hero's Y.

### What the comparison actually asserts

The test captures a suspend snapshot, normalizes it, restores it, captures again, and deep-compares `runSuspendFutureState(normalized)` against `runSuspendFutureState(after)` (`RunSuspend.ts:402`). So the two sides are **the snapshot the game was told to restore** (`0.1456…`) versus **the state the game actually ended up in** (`0.2764…`). ⇒ **Restore is not reproducing the Y it was handed.** The spec's own `exact: true` assertion is the ratified contract here — this is not a new expectation being invented.

### ✓ It is NOT rf-33's module move (attribution already done, do not re-litigate)

The scenario contains **no homemaker boss at all** — it spawns a *wrecker enemy pack* (`test.spawnPack(1, 0.1, { speedScale: 0, wrecker: true })`, tuned via `wreck.damage` / `wreck.hitCooldown`); the Homemaker 9000 is a different variant. rf-33's decoder is byte-identical, imports only `Balance`, and contains no THREE/Terrain/DOM, so it cannot reach a hero render position. Had the move broken decode, the difference would sit in the `homemakerBoss` subtree; it does not.

### 📌 s1095's narrowing — this is your starting point, and it is the interesting part

**`restoreHero` (`src/game/RunSuspend.ts:922–935`) already copies Y exactly.** Read it:

```ts
const position = new THREE.Vector3(snapshot.hero.position.x, snapshot.hero.position.y, snapshot.hero.position.z);
hero.resetRun?.(position);
game.applyStats?.(game.progression?.snapshot?.stats, null);
hero.hp = ...;
hero.group?.position?.copy(position);      // ← exact copy, AFTER resetRun
hero.velocity?.set(...);
hero.restoreIframes?.(...);
hero.targetVelocity?.set(0, 0, 0);
hero.nextPosition?.copy(position);
```

And capture reads the live object (`:536` `hero?.group?.position`, snapshotted at `:580`). ⚠️ **The test sets `test.setManualSim(true)` BEFORE restoring, so no sim step should be running between restore and the second capture.** Yet the value still diverges.

⇒ **Therefore the divergence must enter through one of a small number of doors. Find which, and say so with evidence before you change anything:**
1. **`normalizeRunSuspendDatum` alters the Y** (rounding/clamping/re-deriving) so the "expected" side is already not what was captured;
2. **something after `position.copy()` re-derives Y** — e.g. `resetRun`, `applyStats`, a terrain-height snap, or a hover/bob offset recomputed from a phase that the snapshot does not carry;
3. **`runSuspendFutureState` derives the compared Y** differently on the two sides;
4. **the megaproject site changes ground height under the hero** during restore, and Y is recomputed from terrain rather than restored.

📌 Door 2/4 is the shape s1095 would bet on — the two values look like a composite (ground + offset) versus a re-derived one — **but this is explicitly a hypothesis, not a finding. Measure it. Report what you actually find, including if it is none of the four.**

⚠️ Note the repo law this sits on (CLAUDE.md §4.6): **the sim is planar/deterministic and visual height is render-side `visualY`.** If the divergence turns out to be a *purely render-side* value that the sim never reads, then the right fix may be to make restore reproduce it faithfully **or** to establish that it does not belong in the suspend snapshot at all. **That second option is a DESIGN FORK — if your evidence points there, STOP and report it rather than deciding it yourself.**

## PRE-FLIGHT — verify by CONTENT, never by counting (SAFE-DUPE)

⚠️ **THE BRANCH NAME WAS WRONG FOR THIRTEEN DAYS AND IT IS FIXED HERE (F-1605-1 REDS 2+3, cured s1606).** This master shipped resetting **`lane/m3`** while `worktrees/lane-a` is actually checked out on **`lane/a`** — the F-1464-3 stale-branch-name trap. Codex runs the pre-flight itself, so the old text would have committed this run to a branch **no worktree is on**, and the output would have read as lost. ➡️ **The mapping below was resolved from `git worktree list` on 2026-08-09, never from prose — and if you find it disagreeing with your worktree, believe `git worktree list` and STOP.**

⚠️ **`git log main..lane/a` PRINTS NOTHING — measured s1606: `ahead=0 behind=62`, tracked-dirt 0, untracked 0, verdict USABLE (`node scripts/lane-usable.mjs lane-a`).** The e63d5268 false-ahead clause this paragraph replaced was true in July and is now spent: that commit has long since been absorbed. **So STEP 1 is a plain emptiness check, not a one-commit exception.** An ahead-count is not a drain signal (F-1066-1 / F-1073-1 — it misled on three separate lanes in one week).

⚠️⚠️ **ORDER MATTERS (F-1093-5).** The premise checks below describe **main's** content. Running them on an un-reset lane measures a stale tree and STOPs the run for the wrong reason — and this lane is **62 commits behind**, so that is not a hypothetical here. **Lane-safety first, then the reset, then the premise checks on the fresh tree.**

### STEP 1 — lane safety (on the branch as it stands, BEFORE any reset)

`git log --oneline main..lane/a` must print **nothing at all.** **ANY** commit is undrained work — **STOP and report it by hash**, do not reset over it (Mistake #2: w1-03 and polish-02 were destroyed exactly this way).

**FACTORY-CHURN EXCEPTION — ALWAYS EXPECTED, NEVER A STOP (F-1407-1).** Then `git -C worktrees/lane-a status --short` → list what you see and **proceed** through these two tracked classes: (a) `logs/**` — the fire/runner accounting, rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence, never byte-identity gated, so their bytes differ from main forever (F-1266-1). Discard them and carry on, saying which you discarded. ⓘ **What still STOPs, unchanged and load-bearing:** modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — anything a live drain or a concurrent task could actually own.

### STEP 2 — reset to fresh main

`git checkout -B lane/a main && git clean -fd`, then `npm install --no-audit --no-fund` and `npm run build` green before touching anything.

### STEP 3 — premise checks, **on the freshly-reset tree** (all must hold; each describes **main**)

If any fails **now**, the ground moved under this master — **STOP and report.**

1. `npx playwright test --list` → exit **0**, `Total:` a **non-zero** count. ⚠️ If this is `0 tests in 0 files`, rf-33 has been reverted and this master's premise is gone. (The July figure was ~2378; **do not treat it as a pin** — the suite has grown since and an exact-count check would STOP you for the wrong reason.)
2. `grep -n "function restoreHero" src/game/RunSuspend.ts` → must print **`922`** (was `917` when banked; **re-verified on main s1606** — the function body is unchanged in substance, only its line moved).
3. `npx playwright test e2e/restore-validation.spec.ts --project=desktop-chrome --workers=1 --grep "active megaproject wrecker"` → must **FAIL** with `root.hero.position.y: 0.14559222393281415 != 0.2763519114255905`. ⚠️ **This is the defect itself, and it is your before-measurement. Record the exact line.** If it passes, someone fixed it — STOP. ✅ **RE-RUN ON MAIN s1606 (2026-08-09, thirteen days after banking): STILL RED, and the two floats are BYTE-IDENTICAL to the July measurement** — `restored: false`, `exact` the only flipped key, `differences` still a single entry. So this premise has been re-proved, not merely assumed to have survived.

## READ FIRST (in your worktree, before writing anything)

- `e2e/restore-validation.spec.ts:658` — the failing test **in full** (`test('active megaproject wrecker references survive strict normalization and restore'`), including the `visit()` deep-compare and what `runSuspendFutureState` is fed on each side. **Do not skim this; the comparison's two sides are the whole puzzle.**
- `src/game/RunSuspend.ts:922–935` (`restoreHero`), the capture block around `:536` (`heroPosition`) and `:580` (`vector3Snapshot(heroPosition)`), `:402` (`runSuspendFutureState`), and `:1440` (`decodeVector3` for `hero.position`).

> 📍 **EVERY COORDINATE IN THE LINE ABOVE WAS RE-MEASURED ON MAIN s1606 AND EVERY ONE HAD ROTTED** — `restoreHero` 917→**922**, `runSuspendFutureState` 399→**402**, the spec 656→**658**, `decodeVector3` 1414→**1440**, `heroPosition` 532→**536**, `vector3Snapshot` 575→**580**. Nothing about the defect changed; the file simply grew above them. **Grep for the NAME, not the number, if any of these disagrees with what you find** (F-1310-1: cite by content, coordinates drift).
- `reviews/rf-33.md` — this finding's origin (F-1095-1) and the attribution evidence, so you do not repeat it.

## SCOPE (numbered; each item is checkable)

1. **DIAGNOSE FIRST, AND WRITE THE DIAGNOSIS DOWN BEFORE EDITING.** Identify precisely where the Y diverges — instrument it (log both sides at each stage: captured → normalized → restored → re-captured) and report the four numbers. **Your report must name the exact line that introduces the divergence.** A fix without this is not acceptable here.

2. **FIX IT AT THE CAUSE** so the hero's Y survives the round trip and `restore-validation.spec.ts:658` (*"active megaproject wrecker references survive strict normalization and restore"* — **match the title, not the number**) passes on **both** projects.

3. ⚠️ **THE TRAP — READ THIS TWICE. There are four ways to make this test green that are all FORBIDDEN, because each hides the bug instead of fixing it:**
   - ❌ Editing `e2e/` in any way (see firewall — the test is the **instrument**, and it is currently telling the truth).
   - ❌ Excluding `hero.position.y` (or `hero.position`) from the `visit()` / `runSuspendFutureState` comparison.
   - ❌ Rounding, snapping or epsilon-comparing the value to make the mismatch disappear.
   - ❌ Copying the *post-restore* Y back into the snapshot so both sides agree while the hero still ends up somewhere else.

   ⇒ **The player-facing question this slice answers is: "does resuming a saved claim put the Prospector back exactly where they were?" Any change that makes the assertion stop asking that question is a regression disguised as a fix.**

4. **If, and only if, your diagnosis shows the value is a render-only `visualY` that the sim never reads and that arguably should not be in the snapshot at all — STOP and report it as a design fork.** Do not remove it from the snapshot on your own authority; that is an owner call (CLAUDE.md §4.6, §7.3).

## TOUCH-ONLY

- `src/game/RunSuspend.ts`
- the one source file your diagnosis identifies as the cause, **if** it is not `RunSuspend.ts` (name it in your report, and touch nothing else)

## NO (firewall — report, do not fix)

- ❌ **Do NOT edit anything under `e2e/`.** Not one file, not one line. This is the same firewall rf-31 and rf-33 both carried, and it is why both attributions were clean.
- ❌ **Do NOT touch `scripts/whole-suite-collection.test.mjs`, `package.json`, `src/systems/homemakerBossSuspend.ts` or `src/systems/HomemakerBossSystem.ts`** — rf-33 landed those an hour ago and they are green.
- ❌ **Do NOT "fix" `restore-validation.spec.ts:186` on `mobile-chrome`.** ✓ s1095 measured it: it fails in a full-file run and **passes alone in 4.4s** — it is **load-sensitive (F-1095-2, an F-1084-1 member)**, not a correctness bug, and it is **not yours**. If you see it red, say so and move on.
- ❌ **Do NOT touch `src/world/Terrain.ts`** or any `?raw` / `import.meta.glob` construct.
- ❌ **Do NOT fix any other unrelated red** you meet. Report it with evidence.

## SELF-CHECK (run these exact things; report real numbers)

1. `npx tsc --noEmit` → **exit 0.** ✅ Cite it — this slice is entirely `src/`, which `tsconfig.json` covers.
2. `npm run build` → **exit 0**, report the time.
3. **The target spec**: `npx playwright test e2e/restore-validation.spec.ts --workers=1`, both projects → report passed/failed. **Expect 36/36.** ⚠️ If `:186` on mobile is your only red, re-run it **alone** and report both results — that is F-1095-2, not your slice.
4. **The before/after pair, quoted in full**: the exact `root.hero.position.y: A != B` line from your STEP-3 premise check, and its absence afterwards.
5. 🔬 **MUTATION CONTROL (mandatory, and you must watch it go RED).** Revert **only** your fix, re-run **only** `--grep "active megaproject wrecker"`, and confirm it fails **with the same `root.hero.position.y` difference** — not a timeout, not a different assertion. Then restore and confirm green again, and that the file is byte-identical to your fixed version. **Quote the red in full.**
6. **The headline number must not regress**: `npx playwright test --list` → **exit 0**, `Total:` non-zero (~2378). rf-33 landed this an hour ago; do not undo it.
7. **Adjacent suites**, both projects: `e2e/run-suspend.spec.ts` (8) and `e2e/m3-01-run-scaffold.spec.ts` (8). A red in either is a **real regression** and must be attributed, not waved through.
8. `npm run test:node-guards` → report the **`node --test` phase** count. It is **59 on main today**; expect it **unchanged at 59/59**. ⚠️ **The command's OVERALL exit code is `1` on main today and that is NOT your slice** — the pre-existing ticker `StatsEndpointReadError` (F-1088-1) fires in a separate step after the node phase. **Judge by the phase count, never the overall rc.** This has now misled six drains in a row.
9. **Plain-boot console probe**, desktop 1280×800 **and** mobile 390×844 → **0 errors / 0 warnings / 0 pageErrors**. Use `scripts/probe-plain-boot-console.mjs`; ⚠️ it **requires `PROBE_BASE`** (a bare positional argument throws by design). Set the env var.

READY-FOR-GATES + report: the scope-1 diagnosis naming the exact divergence line and the four instrumented numbers, the before/after `root.hero.position.y` pair, the scope-5 mutation control's red and restore, the target spec's 36/36, the unchanged whole-suite `Total:`, the adjacent suites, the node phase count, and — explicitly — whether your fix restores a value the **sim** reads or only a **render-side** one, because that determines whether this was a player-facing bug or a snapshot-hygiene one.
