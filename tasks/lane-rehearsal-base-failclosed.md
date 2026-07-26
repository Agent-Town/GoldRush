# Task lane-rehearsal-base-failclosed: THE RIG STOPS MEASURING STRANGERS (LANE-C, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome) — s1088, 2026-07-26. This is F-1077-3. Every RULING below was decided by a measurement s1088 actually ran, and the measurements are quoted so you inherit proof rather than opinion. Do not re-litigate them; do not "improve" the scope back into the approaches they killed.**

You are Codex (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high

## WHY (the evidence chain, dated)

**F-1077-3 (BACKLOG:1046, s1077 2026-07-26) — quoted verbatim:**
> "**THE REHEARSAL RIG SILENTLY MEASURES WHATEVER IS ON :5247. EVERY FIRE THAT RUNS IT MUST READ THIS.** `rehearsal/segments/e1-depth-play.mjs:27` is `const BASE = process.env.E1_BASE ?? "http://127.0.0.1:5247"` — **a fixed port with no ownership check.** When s1077 ran the master's own named verification with the default, a vite dev server **8h36m old whose cwd was `/Users/robin/Claude/Projects/gr-task-e1-gameplay`** (the attended `review/e1-gameplay-depth` worktree, where the cap is still **6**) was listening there. The rig played 12 waves against **another tree's code** and reported `double_tap_coil: 6` **under a cap of 3** — which reads exactly like *the cap is unenforced, so this slice is inert in real play*. **That false P0 was one commit from being filed.** […] **Owed corrective (attended or fire-authorable): make the rig fail closed when `E1_BASE` is unset, or assert the served tree's identity before playing.**"

**Why now, and why it is worse than that finding says (s1088 MEASURED, 2026-07-26 22:1x):** I ran the ownership probe against every default port in the rig. **BOTH hardcoded defaults are being served by FOREIGN TREES RIGHT NOW:**

```
ROOT = /Users/robin/Claude/Projects/Gold Rush
port 5247: pid 61156  cwd=/Users/robin/Claude/Projects/gr-task-e1-gameplay   => FOREIGN TREE
port 5231: pid 95039  cwd=/Users/robin/Claude/Projects/gr-task-rehearsal     => FOREIGN TREE
port 5207: pid  8787  cwd=/Users/robin/Claude/Projects/Gold Rush             => OURS
port 5252: pid 42553  cwd=/Users/robin/Claude/Projects/Gold Rush             => OURS
```

So this is **not a historical hazard** — `:5247`, the very port that produced s1077's false P0, is *still* answered by *that same worktree*, and any fire running the rig with defaults today repeats the mistake. **It is also wider than F-1077-3 knew** (see RULING 1).

Secondary evidence, same week: rf-26 shipped (`dc483d74`) covering 3 of F-1081-3's 4 named risks, and the uncovered fourth — `spawnAt` parameter reordering — is uncoverable **because F-1081-3 itself bars building on this rig until F-1077-3 is fixed.** This task is the unblocker. It has findings queued behind it.

## PRE-FLIGHT — verify by CONTENT, never by counting (SAFE-DUPE)

⚠️ **`git log main..lane/e2-arsenal` WILL PRINT ONE COMMIT (`03e52f90 runner(lane-c): lane-ratelimit-hoist.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
s1088 verified the reset is **loss-free by content, not by counting**: that commit is rf-25, merged to main as `e4ec2a13f85c3bd7892f896ef083dc638fac0c5e`, and
`git diff main lane/e2-arsenal -- functions/` is **EMPTY** across all five of its files (`_accounts.ts`, `_bugs.ts`, `_ratelimit.ts`, `redeem.ts`, `telemetry.ts`). The branch is **FALSE-AHEAD**. An ahead-count is not a drain signal (F-1066-1 / F-1073-1).

All four must hold before you touch a file:
1. `git log --oneline main..lane/e2-arsenal` prints **exactly `03e52f90` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. `grep -n "127.0.0.1:5247" rehearsal/segments/e1-depth-play.mjs rehearsal/segments/e1-depth-rivercamp.mjs` on main → **must print `:27` and `:30`.** If either is gone, the premise changed — STOP and report.
3. `grep -n "REHEARSAL_BASE" rehearsal/lib.mjs` on main → **must print `:9`.** Likewise.
4. `ls rehearsal/base-url.mjs` on main → **must not exist.** If it does, this task has already been done — STOP and report.

If all four hold, start from fresh main (`git checkout -B lane/e2-arsenal main`) — `03e52f90` is safe to leave behind.

## READ FIRST (in your worktree, before writing anything)

- `rehearsal/lib.mjs:1-35` — `ROOT` (`:8`, derived from the script's own location), **`export const BASE` (`:9`)**, `openSegment` (`:16`), and the console filter at **`:30`** which hardcodes the string `ws://127.0.0.1:5231`. Read all of it; `:30` is a trap described in RULING 4.
- `rehearsal/segments/e1-depth-play.mjs:20-37` — its own `ROOT` (`:20`), the six-line comment `:21-26` that **warns of exactly the hazard the code does not enforce**, and `BASE` (`:27`). Uses: `:87`, `:515`.
- `rehearsal/segments/e1-depth-rivercamp.mjs:30` — the same defaulted `BASE`. Uses: `:57`, `:59`, `:120`.
- `scripts/entry-damage-table.test.mjs` — **the house pattern for a `node --test` guard, and the freshest one** (shipped `dc483d74` this same day). Mirror its shape (`node:test` + `node:assert/strict`).
- `package.json` — the `test:node-guards` line you will join (it currently lists **six** files).

## THE FOUR RULINGS (decided by measurement — do not revisit)

**RULING 1 — FIX THE CLASS: there are THREE declaration sites, not the one F-1077-3 names, and the one it misses is the widest.**
✓ s1088 grepped it: `rehearsal/lib.mjs:9` carries the **same defect** (`process.env.REHEARSAL_BASE ?? 'http://127.0.0.1:5231'`), and ✓ **20 segments import `lib.mjs`** (`e1-01-founding` … `e10-01-finale`) and inherit that BASE through `openSegment`. So the fixed-port-with-no-ownership-check defect governs **22 segments via 3 declarations**. Curing only the two `e1-depth` files would leave the cured defect alive in the shared library next door — the exact "sibling script" failure the house has been bitten by before. **All three sites must route through one resolver.**

**RULING 2 — THE OWNERSHIP CHECK IS `lsof` PID→CWD, AND IT IS PROVEN TO DISCRIMINATE. Do not invent a sentinel-fetch scheme instead.**
✓ s1088 ran it and it correctly said **OURS** for two servers started from this checkout and **FOREIGN TREE** for both rig defaults (output quoted in WHY). The mechanism, exactly:
```
lsof -nP -iTCP:<port> -sTCP:LISTEN     -> first LISTEN row, field 2 = pid
lsof -a -p <pid> -d cwd -Fn            -> the line starting "n" = the listener's cwd
compare that cwd to the resolver's ROOT
```
This is the same probe s1077 used by hand to catch the false P0; you are automating a known-good check, not designing a new one. ✗ **A build-stamp / sentinel-fetch identity scheme is explicitly OUT** — it needs a new served artifact, which is new surface and a new thing to keep in sync, to answer a question `lsof` already answers exactly.

**RULING 3 — FAIL CLOSED MEANS *THROW*, ON ALL FOUR BRANCHES. A warning is not a fix.**
The resolver refuses to return a base unless ownership is *positively proven*:
| Case | Required behaviour |
|---|---|
| env var **unset** | **THROW.** No default port, ever. Message must tell the operator to start a server from *this* checkout and pass the env var. |
| listener's cwd **≠ ROOT** | **THROW**, naming both the foreign cwd and ROOT. |
| **no listener** on that port | **THROW** (nothing is being measured). |
| `lsof` missing / unusable | **THROW.** An unusable probe means ownership is *unknown*, and unknown must never read as OK. |
| cwd **== ROOT** | return the base. |
⚠️ **Deleting the hardcoded defaults is the point of the task.** Do not replace `5247`/`5231` with different hardcoded ports — that moves the defect, it does not cure it.

**RULING 4 — RESOLVE LAZILY, AND DERIVE THE CONSOLE FILTER FROM THE RESOLVED BASE.**
- ✓ s1088 verified `export const BASE` in `lib.mjs` has **ZERO external consumers** (no `import … BASE` anywhere in the repo outside `worktrees/`), so you are free to stop exporting it as an eagerly-evaluated constant. **Resolve inside `openSegment`**, not at module scope: an import-time throw would fire merely from importing the library.
- ⚠️ **`lib.mjs:30` filters console errors with the literal `'ws://127.0.0.1:5231'`** (vite's HMR socket). The moment the port stops being 5231, that filter **silently stops matching** and HMR noise starts counting as real page errors — a guard going vacuous exactly as it is being fixed. **Derive the filtered origin from the resolved base.**

## SCOPE (numbered, each item testable)

1. **Add `rehearsal/base-url.mjs`** exporting `resolveBase(envVarName, options)`:
   - `options.root` — the tree to demand (caller passes its own `ROOT`).
   - `options.probeListener` — **an injectable seam so the resolver is unit-testable without spawning `lsof`** (default implementation does the real `lsof` probe of RULING 2). This seam is required, not optional; scope 4 depends on it.
   - Behaviour exactly per RULING 3's table. Errors must be **actionable in one read**: name the env var, the port, the foreign cwd, and ROOT.
2. **Route all three declaration sites through it (RULING 1).**
   - `rehearsal/lib.mjs:9` → lazy resolution inside `openSegment` with `REHEARSAL_BASE`; **plus the `:30` filter fix of RULING 4.**
   - `rehearsal/segments/e1-depth-play.mjs:27` → `E1_BASE`. Keep the `:21-26` comment but **update it to say the check is now enforced, not merely advised** — a comment that still says "always confirm by hand" next to code that enforces it will rot.
   - `rehearsal/segments/e1-depth-rivercamp.mjs:30` → `E1_BASE`.
3. **Prove the fail-closed behaviour by RUNNING the truth table (MANDATORY — this is the deliverable's whole value).** A resolver that has never refused anything is not known to refuse. Paste real output for each:
   1. **env unset** → the segment exits **non-zero** with your message, and **does not open a browser.**
   2. **env pointing at a FOREIGN tree** → rejected, naming the foreign cwd. ⭐ **You have a live target and do not need to build one: `http://127.0.0.1:5247` was served by `/Users/robin/Claude/Projects/gr-task-e1-gameplay` at 22:1x, and `:5231` by `/Users/robin/Claude/Projects/gr-task-rehearsal`.** Re-probe first (they may have exited) and say which you used. **Read those servers only — never write to, restart, or kill them; they are attended-owned worktrees.**
   3. **env pointing at a port with NO listener** (pick a free one, verify it is free) → rejected as no-listener.
   4. **env pointing at a server YOU started from `worktrees/lane-c` on a scratch port** → **ACCEPTED.** ⚠️ Note `ROOT` derives from the script's location, so inside the lane worktree the resolver correctly demands a server started **from the lane worktree** — that is intended semantics, not a bug to "fix".
4. **Add `scripts/rehearsal-base.test.mjs`** — a `node --test` guard over the resolver's decision logic, using the `probeListener` seam (fake it: own-cwd / foreign-cwd / no-listener / probe-throws). Assert it **returns** in the own-cwd case and **throws** in the other three. **Wire it into `test:node-guards`** in `package.json` (alphabetical, as the existing list is).
5. **Mutation control on your own new guard (MANDATORY, reverted).** Make the resolver wrongly accept a foreign cwd (e.g. invert the comparison) → **scope-4's foreign-cwd assertion must FAIL.** Revert, and paste the empty `git diff -- rehearsal/base-url.mjs` afterwards.

## FIREWALL

**TOUCH-ONLY:**
- `rehearsal/base-url.mjs` (new — the resolver)
- `rehearsal/lib.mjs` (line 9 + the `:30` filter + the `openSegment` resolution site ONLY)
- `rehearsal/segments/e1-depth-play.mjs` (the `BASE` declaration + its comment ONLY)
- `rehearsal/segments/e1-depth-rivercamp.mjs` (the `BASE` declaration ONLY)
- `scripts/rehearsal-base.test.mjs` (new — the guard)
- `package.json` (the `test:node-guards` script line ONLY)

**NO — do not touch, for any reason:**
- **`src/` and `e2e/` — entirely.** This is tooling. If you believe a game file is wrong, that is a finding for your report, not an edit.
- `functions/`, `tasks/`, `reviews/`, `STATUS.md`, `logs/`, `marketing/`.
- **`scripts/deploy.sh` — FORBIDDEN, standing (F-1073-1).**
- **The other 20 rehearsal segments.** They inherit the fix through `lib.mjs`; editing them individually is the opposite of RULING 1.
- **The `gr-task-*` worktrees and any server they run.** Read their cwd; never write, restart, or kill. They are attended-owned.
- **Do NOT run a full rehearsal segment to completion.** A 12-minute play run is not this task's evidence and burns the lane; scope 3.4 proves the accept-path by resolution, not by playing.

## SELF-CHECK (run these, paste real output)

- `npx tsc --noEmit` → **exit 0.** ⚠️ **`tsconfig.json` includes only `src`, `e2e`, `playwright.config.ts` — so `rehearsal/` and `scripts/` are NOT typechecked. Do NOT cite tsc as evidence for any file you wrote (F-1087-1).** Run it to prove you broke nothing that *is* covered.
- `npm run build` → **exit 0.**
- Your new guard run directly → all assertions pass, **paste the summary line.**
- `npm run test:node-guards` → your guard visible **and the pre-existing guards still passing.** ⚠️ **KNOWN, NOT YOURS, TWO OF THEM (measured on main s1088, do NOT chase and do NOT "fix"):** **(a)** the trailing `node scripts/test-ticker-stats.mjs` **exits 1** on main — `StatsEndpointReadError`, because `liveStats.ts:5` now uses `gameApiUrl(...)` while `ticker-stats.mjs:75` matches only a quoted literal (**F-1088-1, on the owner's desk**). So `npm run test:node-guards` exits 1 **as a whole** on main today; report the **`node --test` phase counts** (main's baseline: **49 tests / 49 pass**) rather than the overall rc. **(b)** `scripts/stream-showcase-queue.test.mjs:42` is **load-sensitive** (**F-1088-2**) — it failed 1 of 4 concurrent runs and passes at `--test-concurrency=1`. If you see it red, re-run serially before believing it.
- The **scope-3 truth table**: four cases, real output each.
- The **scope-5 mutation control**: the failure quoted, the revert, and the empty diff.
- **No playwright suites, no screenshots, no boot probe** — this slice touches zero runtime code and has no browser surface. **Say so explicitly rather than claiming a probe you did not run.**

## READY-FOR-GATES — report back

1. The **pre-flight** result: all four checks with their actual output.
2. The resolver's error messages, verbatim — a fire reading them at 3am must know what to do next.
3. The **scope-3 truth table**, four cases, with which foreign server you used (and whether you had to re-probe because the s1088 ones had exited).
4. The **scope-5 mutation control**: failure, revert, empty diff.
5. `npm run test:node-guards` — the **`node --test` phase counts**, your guard visible, and confirmation the two known reds above are the only reds.
6. **State explicitly, in one line, what is still NOT protected** after this lands — e.g. any port-bearing tool outside `rehearsal/` that still defaults, if you noticed one. Do not go fix it; name it so the board can.
