# Task f1549-2: declare the instrument — pin `wrangler` to exactly 4.107.0 as a devDependency (LANE-D, commit prefix "chore:")

**FIRE-AUTHORED (attended review welcome)** — s1551, from F-1549-2 (measured s1549) plus three premises re-measured at source this fire.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` the **F-1549-2** row (the finding this discharges — read all four of its measured premises); `reviews/f-mp503-1-unconfigured-503-copy.md` (the drain whose un-actioned runner note started this, and whose cure this must NOT break); `scripts/test-multiplayer.mjs:280`, `:313–318`, `:488` (the spawn sites and `cleanEnv`); `package.json:16` and `:41–55` (the script entry point and the devDependency block you are editing).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**CITATION CHECK (hard STOP if it fails).** Before scope 1, run these three greps in the lane. Each must return **exactly 1** (all three verified `1` on main at `492c56fcd`, s1551):

- `grep -c '"test:mp": "node scripts/test-multiplayer.mjs",' package.json`
- `grep -c "const child = spawn('wrangler', args, {" scripts/test-multiplayer.mjs`
- `grep -c '  delete env.AUTH_CODE_PEPPER;' scripts/test-multiplayer.mjs`

If any returns 0, the lane is stale relative to the master — **STOP and report the counts**; do not adapt.

## Why (F-1549-2, s1549; premises re-measured by s1551 on 2026-08-08)

`npm run test:mp` is a gate. It stands up a real Cloudflare relay by shelling out to `wrangler` — and **the repo does not declare `wrangler` anywhere**. The chain, verified by reading (✓ VERIFIED s1551, not inherited):

1. `wrangler` appears in neither `dependencies` nor `devDependencies` (`package.json:37–55`) — the gate runs **whatever this Mac happens to have**, today Homebrew's `4.107.0` (recorded as `"wranglerVersion": "4.107.0"` in `artifacts/multiplayer-relay/test-multiplayer.json`).
2. `scripts/test-multiplayer.mjs:280` and `:488` call `spawn('wrangler', …)` — a **bare command name**, therefore **PATH** resolution.
3. `cleanEnv()` (`:313–318`) copies `process.env` wholesale and deletes only `RESEND_API_KEY` and `AUTH_CODE_PEPPER` — so **PATH survives intact**, and under `npm run test:mp` (which prepends `node_modules/.bin`) a declared devDependency **is** the binary that runs.
4. `wrangler@4.107.0` is published and resolvable (registry probe, s1551: `version 4.107.0`, `unpackedSize 18,805,100`, deps `unenv, esbuild, workerd, miniflare, blake3-wasm, path-to-regexp, @cloudflare/unenv-preset, @cloudflare/kv-asset-handler`).

**A gate that depends on an unversioned external binary can go red with an empty repo diff.** That is not hypothetical here — it is exactly the shape F-MP503-1 wore for a full morning, and "local wrangler version drift" was one of the two candidate causes named in its own row before the real cause was found.

⚠️ **THE OBJECTION THAT KILLED THIS CORRECTIVE TWICE IS FALSE, AND YOU SHOULD KNOW WHY BEFORE YOU START.** The obvious fear is that pinning breaks the f-mp503-1 cure, whose entire mechanism is running the unconfigured fixture **outside the repository** so wrangler cannot resolve project config. It does not: **config resolution is CWD-based, binary resolution is PATH-based, and PATH is cwd-independent.** The fixture keeps failing to find project config (cure intact) while gaining a deterministic binary. Do not "protect" the cure by skipping the pin.

## Scope

1. **`package.json`**: add `"wrangler": "4.107.0"` to `devDependencies`, in alphabetical position. **EXACT version, no `^`, no `~`.** The point is that the pin is **behaviour-preserving by construction** — 4.107.0 is the version the gate demonstrably resolves today, so this is a declaration of the status quo, not an upgrade wearing a pin's clothes. A caret here would re-open the exact non-determinism the finding is about.
2. **`package-lock.json`**: regenerate by running `npm install --no-audit --no-fund` (tracked file — it must be committed). Do not hand-edit it.
3. **Prove the binary actually moved, with the instrument, not by reasoning.** Report `node -p "require('child_process').execSync('wrangler --version',{env:process.env}).toString()"` run **under npm** (e.g. via a temporary `npm exec` or by reading the resolved path with `npm exec -- which wrangler`) and show that it resolves inside `node_modules/.bin`, **not** `/opt/homebrew/bin`. Paste both paths.
4. **Before/after control on the SAME commit** (this is the slice's proof, see Self-check).

## Firewall

Touch ONLY: `package.json`, `package-lock.json`, and evidence under `artifacts/multiplayer-relay/`.

NO changes to: `scripts/test-multiplayer.mjs` · `scripts/agent-seat-room.mjs` · `functions/**` · the unconfigured fixture or anything else the f-mp503-1 cure installed · any `src/**` · any other dependency's version (if `npm install` moves an unrelated entry in the lock, **report it and revert that hunk** — a pin task must not smuggle an upgrade).

⛔ **FORBIDDEN GREENS — each makes this look done while the finding survives:** using a range (`^4.107.0`) instead of the exact version · pinning a *different* version because npm resolved one (if `4.107.0` is unavailable, **STOP and report**, do not substitute) · marking it a `dependency` rather than a `devDependency` · declaring success from `npm ls wrangler` alone without showing the gate still passes.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)

**The control is the deliverable.** Run `npm run test:mp` **twice on this same commit** — once BEFORE the pin, once AFTER:

- **BEFORE**: paste the pass/fail line (s1549 recorded **462 checks green**; if it is red before you touch anything, that is a FINDING to attribute and report — **STOP**, because a red baseline makes the after-run uninterpretable) and the `wranglerVersion` recorded in `artifacts/multiplayer-relay/test-multiplayer.json`.
- **AFTER**: same two numbers. **Both must be identical**, and `wranglerVersion` must still read **`4.107.0`**. ⚠️ **If the recorded version moves, the pin failed its own premise — STOP and report; do not re-pin to whatever appeared** (F-1441-3: re-pin only with a named cause, never to make a number agree).

Then: `npx tsc --noEmit` **0** · `npm run build` green · `node scripts/agent-seat.test.mjs` green · **`npm run test:node-guards`** — paste the tests/pass/fail line and name any red you attribute rather than fix. ⓘ Expect this to take ~3 minutes serial and **run it ALONE** (F-1537-1: overlapping batteries contaminate each other on shared fixtures).

📏 **MEASURE THE COST AND REPORT IT — this is a required number, not a nicety.** Lane worktrees have **real `node_modules` directories, not symlinks into main** (measured s1551: `worktrees/lane-a/node_modules` and `worktrees/lane-d/node_modules` are both real dirs), so this install is paid **per worktree** — up to six times across main + four lanes + art, on every pre-flight. Report: `du -sh node_modules` before and after, and the wall time of the `npm install` that added it. **This number is not yours to act on** — it goes in your report so the drain can weigh it and, if it is egregious, escalate the alternative cure (a version *assertion* in the harness rather than an install) rather than discovering the cost after six worktrees have grown.

## Known limitation to state in your report, NOT to fix here

The pin binds **only the `npm run` entry point**, because `node_modules/.bin` reaches PATH only when npm puts it there. s1551 measured a **second undeclared consumer**: `scripts/agent-seat-room.mjs:681` also calls `spawn('wrangler', args, …)` by bare name, and it is invoked as plain `node scripts/agent-seat-room.mjs` (that is how the mp-07c-1 drain ran its 86/86 harness — `reviews/mp-07c-1-order-channel.md:27`), so **no npm PATH prepend reaches it and this pin does nothing for it.** That is filed as **F-1551-1** and is deliberately OUT of scope here: closing it means changing how those scripts resolve their binary, which is a different edit with a different blast radius. **Do not widen this task to cover it.** Just confirm in your report that you did not touch `agent-seat-room.mjs`.

End: **READY-FOR-GATES** + report: the before/after `test:mp` pass lines and both recorded `wranglerVersion` values, the resolved wrangler path under npm (before and after), the `du -sh node_modules` delta and install wall time, any unrelated lockfile hunk you reverted, and confirmation that `scripts/**` is untouched.
