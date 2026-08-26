# Task f2315-1: make `run-guards.mjs` incapable of dirtying its own tree via the guard-stats append (LANE-D, commit prefix "f2315-1:")

**FIRE-AUTHORED (attended review welcome)** — authored by fire s2315 from F-2315-1 (`tasks/BACKLOG.md`), which was measured by controlled experiment rather than inherited.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` (the F-2315-1 row — the finding this executes); `reviews/f2313-1.md` (the predecessor slice whose cure this corrects); `scripts/run-guards.mjs`; `scripts/guard-stats-persistence.test.mjs` (the guard you will EXTEND, not replace).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-2315-1, measured by fire s2315 2026-08-25 — controlled experiment, both arms banked)

`29c674b02` (drained s2314) landed the guard-stats append. Its commit headline reads *"persist the guard runner per-leg rows to a **tracked** JSONL"*, `reviews/f2313-1.md:129` records tracking as *"the master's stated intent"*, and the s2314 handoff invites the next fire to `git add` it *"when convenient"*.

**Tracking it breaks a documented, guarded invariant.** `.claude/skills/drain/SKILL.md:46` states as verified: *"a gate can no longer dirty its own tree (verified: a full eight-guard run leaves `git status` clean)"*. `scripts/test-accounts.mjs:307` gives the reason verbatim: *"harmless by hand and fatal in a gate, because a drain's own precondition is a clean tree"*.

**The runner enforces that contract on its CHILDREN and breaks it ITSELF.** `scripts/run-guards.mjs:260` sets `env: { ...process.env, GR_GUARD_NO_ARTIFACT: '1' }` for every child it spawns, and `scripts/run-guards.test.mjs:232` guards it — test title `'guards run with GR_GUARD_NO_ARTIFACT so a gate cannot dirty its own tree'`. But `scripts/run-guards.mjs:307` — `appendFileSync(statsPath, ...)` — runs in the runner's OWN process, outside that flag's reach. The guard asserts the principle at the level where it holds and never at the level where it fails.

**MEASURED, not argued (s2315, detached worktree `gate-s2315`, control asserted its own validity first per F-2215-1).** Same runner, same leg (`--only test:power-budget`), the ONLY variable being whether the stats file is tracked:
- CONTROL (untracked, today's live state): `git status --porcelain` → `?? logs/guard-stats.jsonl` — untracked debris, NOT tracked dirt. Gate ran, 1 record appended.
- DEFECT ARM (file `git add`ed + committed, exactly as the headline promises): baseline clean → gate run → `git status --porcelain` → ` M logs/guard-stats.jsonl` — **tracked dirt on a tree that was clean before the gate ran.**

**LEVER PROVEN IN THE FIXTURE SHAPE THE GUARD WILL USE (skill §0.7), so this master is not asking you to build an arm nobody has fired.** A temp `git init` repo, `package.json` mapping `test:citations` to `node -e ""`, a COMMITTED `stats.jsonl`, and `GR_GUARD_STATS_PATH` pointed at it reproduces it exactly: baseline `""` → runner rc=0, *"appended 1 record(s)"* → ` M stats.jsonl`.

⚖️ **SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED: this is LATENT.** The file is untracked today, so no gate run has ever produced tracked dirt and every green this streak has read was true. What earns it a corrective is that the defect is **one routine, invited, explicitly-documented act away** — and that act is described in the handoff as low-attention bookkeeping. When it lands, every drain gate leaves tracked dirt in main's tree, which contaminates §2A dirt-ownership triage and makes `lane-usable.mjs` read `DIRTY` (rc=2, refill blocked) on any tree that ran a gate.

## Scope

1. In `scripts/run-guards.mjs`, before the append at `:307`, resolve whether `statsPath` is TRACKED in git (e.g. `git -C <dirname(statsPath)> ls-files --error-unmatch -- <statsPath>`, via `spawnSync`, which reports by return value and never throws). Use the exit code as the verdict; **exit 128 (not a repository) and a missing/failed git are NOT "tracked"** — a stats path outside any repo is the ordinary fixture case and must keep appending.
2. If the path IS tracked: **SKIP the append** and DECLARE on stdout in one line naming the path and the reason (a gate must not dirty its own tree). If it is NOT tracked: append exactly as today — byte-identical output.
3. The declaration prints on the SKIP path only. The existing happy-path declaration at `:308` is unchanged. Rationale, and do not "tidy" it: this file's own convention is that a state which REFUSES is unambiguous without an always-on banner, and an extra line on the most-run command in the factory is the noise that decays a declaration into a formality.
4. **The runner's exit expression is UNTOUCHED.** `process.exit(failed.length ? 1 : 0)` stays exactly as it is. The instrument must never red the factory by its own bookkeeping — that is the shipped slice's own stated principle and it is preserved here.
5. Wrap the new git probe so it cannot throw past the existing `try` — a failure to CLASSIFY must fall back to the behaviour that cannot break the invariant (skip + declare), never to a silent append.
6. EXTEND `scripts/guard-stats-persistence.test.mjs` (do NOT create a new guard file — it is already rooted in `test:ledger-guards` at `package.json:28`, so extending it raises no gate-caller-audit question). Add arms:
   - a TRACKED stats path in a temp git repo leaves `git status --porcelain` with no ` M` entry for it, and the runner's rc is unchanged;
   - the SKIP declares on stdout, naming the path;
   - REVERSE CONTROL: an UNTRACKED stats path in that SAME git repo still appends (proves the cure did not simply disable the feature);
   - REVERSE CONTROL: a stats path outside any git repo still appends (proves exit-128 is not read as "tracked");
   - the guard's exit code is unchanged in every arm above.
7. Prove the teeth by MANUFACTURING the defect, not by reading a green: restore the pre-cure append on a scratch copy (the file already has `variant()`/`replaceOnce()` helpers for exactly this) and record WHICH arms red. Report the count honestly and separate SUBSTANTIVE detections from arms that merely red because a seam vanished.

## Firewall

Touch ONLY: `scripts/run-guards.mjs`, `scripts/guard-stats-persistence.test.mjs`.

NO changes to: `package.json` (the guard is already rooted; if you believe it needs a new leg, STOP and report instead) · `.claude/skills/**` (the drain SKILL's wording is the drain's business, not this slice's) · `logs/guard-stats.jsonl` (do NOT `git add` it — that is the very act this master makes safe, and tracking it is a separate decision that belongs to the finding, not to you) · `tasks/**`, `STATUS.md`, `reviews/*.md` (fire/drain bookkeeping) · sim semantics · any existing e2e assertion · any other file under `src/`, `scripts/`, `functions/`.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean. `npm run build` green. `npm run test:ledger-guards` rc=0 — report the test/pass/fail/skipped counts and the wall time, and confirm `guard-stats-persistence.test.mjs` is among the legs that ran. `node scripts/gate-caller-audit.mjs` PASS with `unrouted: 0`. Run `node scripts/run-guards.mjs --only test:power-budget` from the lane and paste the last two stdout lines plus `git status --porcelain` for `logs/guard-stats.jsonl`, proving the untracked path still appends and the tree carries only `??`.

**BEHAVIOUR-NEUTRALITY (F-1274-2), and assert the control's own validity first (F-2215-1):** on the untracked live path, stdout must be BYTE-IDENTICAL to pre-cure and rc unchanged. State the byte counts of both arms before you believe any diff — a control whose failure mode is silence cannot be told from the silence it measures.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: READY-FOR-GATES + report (1) the tracked/untracked classification method you used and the exit codes you observed for each of the three git states (tracked, untracked-in-repo, outside-repo); (2) which arms redden under the manufactured pre-cure defect, split into substantive vs seam-refusal; (3) the neutrality byte counts; (4) anything adjacent you noticed and did NOT fix (report it, do not fix it — that is a firewall success, not a failure).
