# F-1710-1 — make gate-caller capture complete under battery load

**FIRE-AUTHORED s1710 (attended review welcome).**
**CODEX: model=gpt-5.6-sol effort=medium**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. ⚠️ The trap this closes: a run that STOPPED still ran playwright and still regenerated screenshots, so a stopped predecessor leaves tracked dirt that freezes its successor — three consecutive masters (gazette-welcome-drift-observation-frame v1/v2, newsie-drift-shell-divergence-rate) died before measuring anything, the third killed by the exhaust of the first two.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE, WHICH THE LANE TEMPLATE OWED AND DID NOT CARRY UNTIL s1505 (F-1505-1): `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Goal

Make `gate-caller-audit.test.mjs` obtain complete child stdout/stderr under the full parallel ledger battery. The shared `run()` helper must stop reading the audit through a `spawnSync` pipe; the audit's exit code and final PASS line remain the positive control.

## Read first / freshness gate

Read `AGENTS.md`, the F-1710-1 row in `tasks/BACKLOG.md`, `scripts/gate-caller-audit.test.mjs` (`run()` and **"POSITIVE CONTROL: the real repo passes, with a non-empty measured subject"**), `scripts/gate-caller-audit.mjs` (the final PASS line), and `reviews/collection-guards-spawnsync-truncation.md` F-1205-1.

Before editing, run:

```sh
grep -Fc "The full ledger battery truncated gate-caller-audit's captured stdout before its final PASS line." tasks/BACKLOG.md
grep -Fc "return spawnSync(process.execPath" scripts/gate-caller-audit.test.mjs
```

Expected: exactly `1` from each. Otherwise STOP: the evidence or subject this master targets moved.

## Why (F-1710-1, measured s1710 on 2026-08-12)

`npm run test:ledger-guards` passed 178/179 tests and failed only gate-caller's real-repo positive control. The child exited `0`, and the test parsed `subjects: 128`, but captured stdout ended mid-grandfather reason before the final `PASS — every gate-shaped subject...` line. The audit run directly emitted 22,348 complete bytes ending in PASS, and the focused test then passed 26/26. That is a capture failure under battery load, not an audit verdict.

The shared test helper already asks `spawnSync` for a 32 MiB buffer, so another larger pipe is not the cure. F-1205-1 measured this class and the durable cure: child output goes to file descriptors and is read after close, removing the pipe race by construction. Reuse that standard-library pattern; do not add a dependency or a parallel capture abstraction.

## Scope

1. Change only the shared `run()` helper in `scripts/gate-caller-audit.test.mjs` so child stdout/stderr are file-backed and complete. Preserve the existing `{ status, stdout, stderr, signal, error }` behavior expected by all 26 tests, including spawn failures.
2. Reuse the file's existing tracked-temp cleanup (`track()` / `MADE`) or an equally smaller in-file standard-library pattern. Close descriptors on success and error; leave no scratch directory behind after the test process exits.
3. Keep verdict semantics unchanged: fixtures still judge the child exit code, and the positive control still requires a non-empty subject set plus the audit's final PASS line. Do not weaken or delete either anchor.
4. Run the focused file and the complete ledger battery. The focused file must pass 26/26; `npm run test:ledger-guards` must reach the later chained guards and finish green. Report the direct audit byte count and final line so capture completeness is evidence, not inference.
5. If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `scripts/gate-caller-audit.test.mjs`.

No changes to `scripts/gate-caller-audit.mjs`, `scripts/gate-caller-baseline.json`, `package.json`, other guards, task/ledger files, gameplay, specs, Playwright suites, or dependencies. Do not shorten grandfather reasons to make the pipe smaller; their length is evidence the helper must carry.

## Self-check (evidence, not vibes)

```sh
node --test scripts/gate-caller-audit.test.mjs
node scripts/gate-caller-audit.mjs
npm run test:ledger-guards
npm run build
git diff --check
git diff --name-only main...HEAD
```

The final path list must be exactly `scripts/gate-caller-audit.test.mjs`. Report the file-backed capture shape, cleanup proof, focused count, full ledger-battery verdict, direct audit byte count/final line, and any environment exception with evidence. End `READY-FOR-GATES` only if every gate is green.
