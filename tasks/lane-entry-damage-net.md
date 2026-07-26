# Task lane-entry-damage-net: THE E1 LADDER TUNE GETS A NET (LANE-A, commit prefix "test:")
**FIRE-AUTHORED (attended review welcome) — s1087, 2026-07-26. This is F-1081-3, whose owed deliverable is quoted verbatim below. The SCOPE RULINGS are decided, not open questions: s1087 ran the import experiments that produced them, and three plausible-looking approaches are ruled OUT with the measurement that killed each. Do not "improve" the scope back into them.**

You are Codex (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high

## WHY (the evidence chain, dated)

**F-1081-3 (BACKLOG, s1081) — quoted verbatim:**
> "**F-1081-3 — THE E1 LADDER TUNE HAS NO REGRESSION NET (owner-visible risk, small).** `Balance.waves.entryDamageScale` + `applyEntryDamageScale` shipped in `eb7278ac` with **no spec asserting any of it**. The only proof the opening is now walkable is a manual `rehearsal/segments/e1-depth-play.mjs` run (Night Shift died wave 9→11, Baron 3→16). So: reorder `spawnAt`'s parameters, mistype a contract id, or drop the table and **nothing goes red** — the two named contracts would quietly return to killing a new player in the first minutes, which is precisely the release-blocking symptom this slice existed to fix. […] ➡️ **Owed: a cheap spec asserting a wave-3 spawn on `e1-night-shift` carries a reduced `contactDamageScale` and a wave-12 spawn does not.** Fire-authorable (no design fork, no canon). Note it should NOT be built on the rig until F-1077-3 is fixed — that harness still defaults its own port and can measure a foreign tree."

**Why now (s1087, 2026-07-26):** F-1086-1 landed this week — `tl-01-run-telemetry.spec.ts:229`, the Mistake-#10 plain-boot "can a real player secure a claim?" test, was found **deterministically RED on main in both projects**, recorded as PASSING at ship in `reviews/tl-01.md:18`, and **listed nowhere as a known red**. It rotted silently because no battery was watching it. The E1 ladder tune is in exactly that position today: tuned by hand, proven once by a manual rig run, watched by nothing. That is the argument for this net, and F-1086-1's own BACKLOG line names this task as the fix for the class.

## PRE-FLIGHT — verify by CONTENT, never by counting

⚠️ **`git log main..lane/m3` WILL PRINT ONE COMMIT (`f231b073 runner(lane-a): lane-blocked-storage-access-throw.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
s1087 verified the reset is **loss-free by content, not by counting**:
- That commit is rf-23, **content-merged to main as `7be9ce7b263a8e700547afff844e8708d3816f59`** (goal leaf `rf-23`, same `taskFile: lane-blocked-storage-access-throw.md`).
- `git diff main lane/m3 -- src/ e2e/ functions/` shows **zero `src/` difference**, and the branch only *lacking* main's newer work (`e2e/ratelimit-429-net.spec.ts`, `functions/api/_ratelimit.ts` and the rf-25 hoist) — the branch is **behind, never ahead**, on every code path.
An ahead-count is not a drain signal (F-1066-1 / F-1073-1).

All three must hold before you touch a file:
1. `git log --oneline main..lane/m3` prints **exactly `f231b073` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. `grep -n "ENTRY_WAVE_DAMAGE_SCALE" src/game/Balance.ts` on main → **must print `:5` (the table) and `:89` (`entryDamageScale: ENTRY_WAVE_DAMAGE_SCALE`).** If the table is gone or renamed, the premise of this task changed — STOP and report.
3. `ls scripts/entry-damage-table.test.mjs` on main → **must not exist.** If it does, this task has already been done — STOP and report.

If all three hold, start from fresh main (`git checkout -B lane/m3 main`) — `f231b073` is safe to leave behind.

## READ FIRST (in your worktree, before writing anything)

- `src/game/Balance.ts:5-8` — **`ENTRY_WAVE_DAMAGE_SCALE`**, the table under test. Measured on main s1087:
  `'e1-night-shift': [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.5, 0.5, 0.5, 0.5]` and `'e1-baron'` identical — **11 entries, indices 0–10.**
- `src/game/Balance.ts:89` — `entryDamageScale: ENTRY_WAVE_DAMAGE_SCALE` — how it is exposed as `Balance.waves.entryDamageScale`.
- `src/systems/WaveSystem.ts:478-525` — `spawnAt`. **`applyEntryDamageScale = true` is the 9th positional parameter (`:487`)**; the lookup is `Balance.waves.entryDamageScale[this.contract.id]?.[wave]` (`:513-515`); the application is `(options.contactDamageScale ?? 1) * entryDamageScale` (`:521-523`). **Read this to understand the contract you are pinning — you will NOT be testing this file (see RULING 2).**
- `src/systems/WaveSystem.ts:365` — the one call site that opts out by passing `false` as the 9th arg.
- `scripts/goal-tracker.test.mjs` — **the house pattern for a `node --test` guard.** Mirror its shape (`node:test` + `node:assert/strict`).
- `package.json` — `test:node-guards` (the guard lane you are joining) and `test:power-budget` (the precedent for a node test that needs `--experimental-strip-types`).

## THE THREE RULINGS (decided by measurement — do not revisit)

**RULING 1 — the test imports the REAL `src/game/Balance.ts`. No copied table, no re-declared constant.**
A guard that re-states the numbers it is guarding tests nothing. ✓ s1087 PROVED this import works headlessly:
`node --experimental-strip-types` importing `src/game/Balance.ts` → **OK**, exports `Balance,DIFFICULTY_PRESET_STORAGE_KEY,applyDifficultyPreset,…`. It only imports `three`, which is a real node dependency.

**RULING 2 — you will NOT test `WaveSystem.spawnAt`, and you will NOT add a debug bridge to `src/` to reach it.**
Both were tried and killed by measurement s1087:
- Importing `src/systems/WaveSystem.ts` headlessly **FAILS**: `TypeScript parameter property is not supported in strip-only mode`. It is not reachable from the `node --test` lane, full stop.
- Reaching it from a browser test would require **adding a test-only hook to `src/`** — there is no existing enemy/wave bridge (✓ verified: zero hits for a wave or enemy test global across `e2e/`). Inventing one is scope invention (§7.3), and a blanket `src/` firewall has lawfully STOPPED two prior rounds (F-1082-1).
- The rig (`rehearsal/segments/e1-depth-play.mjs`) is **explicitly barred by F-1081-3 itself** until F-1077-3 is fixed — it defaults its own port and can measure a foreign tree.

➡️ **Consequence, which you must state plainly in your report rather than paper over: this net does NOT cover the `spawnAt` parameter-reordering risk that F-1081-3 names.** It covers the table — dropped, renamed, mistyped id, regressed values, moved boundary, inverted sign. That is three of the four named risks, cheaply and today. Claiming more would be false.

**RULING 3 — assert the BOUNDARY, not just a sample.**
F-1081-3 asks for "wave-3 reduced, wave-12 not". Both are interior to their regions and would survive an off-by-one. Pin the **edge**: the last scaled wave and the first unscaled one. Lookup is by **direct array index on the wave number** (`?.[wave]`), and the array has 11 entries, so on main **wave 10 → 0.5** and **wave 11 → `undefined`**.

## SCOPE (numbered, each item testable)

1. **Add `scripts/entry-damage-table.test.mjs`** — a `node --test` guard importing `Balance` from `../src/game/Balance.ts`. Read `Balance.waves.entryDamageScale` once; assert against it:
   1. **Both contracts present.** `e1-night-shift` and `e1-baron` are each present and are arrays. (Catches: table dropped; contract id renamed/mistyped.)
   2. **F-1081-3's literal ask — wave 3 is reduced.** For `e1-night-shift`, the wave-3 lookup is defined and **`< 1`** (on main: `0.2`).
   3. **F-1081-3's literal ask — wave 12 is not.** For `e1-night-shift`, the wave-12 lookup is **`undefined`**, i.e. a wave-12 spawn takes no entry scaling.
   4. **The boundary (RULING 3).** For both contracts: **wave 10 is defined and `< 1`**, and **wave 11 is `undefined`**. (Catches an off-by-one or a resized table.)
   5. **Sign sanity.** Every entry in both tables is a finite number **`> 0` and `<= 1`**. A value `> 1` would *increase* early-wave damage — the exact inversion of the slice's purpose, and silent today.
   6. **The two tables agree.** `e1-baron` and `e1-night-shift` are element-wise equal on main; assert it, so a one-sided edit is a deliberate act that has to update this guard.
2. **Wire it into the guard lane.** Add it to `test:node-guards` in `package.json` so it runs with the other guards. **If and only if** the plain `node --test` form cannot import the `.ts` file on this Node, add `--experimental-strip-types` (precedent: `test:power-budget`). **Report which form you used and why** — do not silently pick one.
3. **Prove the guard actually guards (MANDATORY MUTATION CONTROL, both reverted).** A green test proves nothing until you have seen it go red:
   - Change `e1-night-shift`'s wave-3 entry from `0.2` to `1` → **item 1.2 must FAIL.** Revert.
   - Append a 12th entry to `e1-night-shift` → **item 1.4 must FAIL** (wave 11 is no longer `undefined`). Revert.
   - After both reverts, `git diff -- src/game/Balance.ts` must be **empty**, and you must paste that empty-diff proof in your report.

## FIREWALL

**TOUCH-ONLY:**
- `scripts/entry-damage-table.test.mjs` (new file — the deliverable)
- `package.json` (the `test:node-guards` script line ONLY)
- `src/game/Balance.ts` — **ONLY** as the temporary mutation control in scope item 3, and **ONLY** if reverted to a byte-identical file in the same run.

**NO — do not touch, for any reason:**
- `src/systems/WaveSystem.ts` — you are pinning its contract, not editing it (RULING 2).
- Any other file under `src/` — no test hooks, no debug bridges, no exports added "to make it testable" (RULING 2).
- `e2e/` — entirely. This is not a playwright slice.
- `rehearsal/` — barred by F-1081-3 until F-1077-3 is fixed.
- `functions/`, `tasks/`, `reviews/`, `STATUS.md`, `logs/`.
- **Do NOT retune the ladder.** If you believe a value is wrong, that is a finding for your report, not an edit. The numbers are owner-facing balance, tuned by a measured rehearsal run.

## SELF-CHECK (run these, paste real output)

- `npx tsc --noEmit` → **exit 0.** (Note: `tsconfig.json` includes `src`, `e2e`, `playwright.config.ts`. Your new file is under `scripts/`, so it is **not** typechecked — do not claim tsc as evidence for it; F-1087-1.)
- `npm run build` → **exit 0.**
- Your new guard, run directly → **all assertions pass**, and paste the runner's summary line.
- `npm run test:node-guards` → **exit 0**, with your guard visible in the output and **the pre-existing guards still passing**.
- The two mutation controls of scope item 3, each shown going **RED** then reverted, **plus the empty `git diff -- src/game/Balance.ts`**.
- **Adjacent playwright suites: NOT required.** This slice touches no runtime code path — `Balance.ts` is byte-identical at the end of your run (prove it) and the only shipped change is a new test file plus one `package.json` line. If you find yourself needing a playwright run to justify this diff, you have exceeded scope.
- **Zero console errors** is not applicable (no browser surface). Say so explicitly rather than claiming a probe you did not run.
- No screenshots (nothing renders).

⚠️ **KNOWN RED, DO NOT CHASE:** `e2e/tl-01-run-telemetry.spec.ts:229` (*plain no-debug secure return keeps telemetry invisible to gameplay*) is **RED on main in both projects** (F-1086-1) and is **not yours**. If you run any playwright at all and see it, ignore it and say so.

## READY-FOR-GATES — report back

1. The **pre-flight** result: the three checks, with their actual output.
2. Which `node --test` invocation form you used for scope item 2, and **why** (did the plain form import the `.ts`?).
3. The **mutation controls**: both failures quoted, both reverts, and the empty `git diff -- src/game/Balance.ts`.
4. `npm run test:node-guards` output showing your guard **and** the pre-existing ones green.
5. **Any finding you hit but did not fix** — especially: anything about the ladder values you think is wrong, and anything that made you want to touch `WaveSystem.ts` (that is useful signal for whether the parameter-order half is worth a follow-up slice).
6. State explicitly, in one line, **what this net does NOT cover** (RULING 2's consequence), so the drain does not over-claim it in the review.
