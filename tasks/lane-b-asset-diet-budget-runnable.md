# Task lane-b-asset-diet-budget-runnable: the 25MB budget check must be able to FAIL, then ride the deploy (LANE-B, commit prefix "test:")

**FIRE-AUTHORED s1047, 2026-07-25 (attended review welcome).** Closes the F-1029-4 GATE (`tasks/BACKLOG.md:819`)
and the F-1047-1 defect it depends on — measured by this fire, not inherited.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`).
CODEX: model=gpt-5.6-sol effort=high

READ FIRST (paths, not memory):
- `AGENTS.md`
- `e2e/asset-diet.spec.ts` — the whole file, especially **`:13-16`** (the skip guard) and **`:102`** (the budget)
- `playwright.preview.config.ts` — all 14 lines
- `playwright.config.ts:20-25` — the base `webServer` ternary
- `package.json:8-12` — `build`, `build:release`, `test:asset-diet`
- `scripts/deploy.sh` — the whole file (it is 50 lines); note its stated law at `:3-4` and `STRICT` at `:25`
- `reviews/asset-diet-gate-honesty.md` — the drain that made this check opt-in (F-1026-1)

> Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.
>
> (Already checked for you at authoring time, but sanity-check it rather than trusting me: `git log main..lane/m4 --oneline` was **EMPTY** at `625420ef` — lane-b holds nothing undrained.)

## Why (measured by the s1047 fire, 2026-07-25 — do not re-litigate, but DO reproduce scope 1)

The owner's slow line is the evidence chain behind this whole thread. He said the town *"seem[ed] quite big?"*
on <10Mbit, the asset diet shipped to fix it (`0dfa1d3f`), and `e2e/asset-diet.spec.ts:102` holds the resulting
product commitment: **`expect(townResponseBytes).toBeLessThan(25_000_000)`**. F-1026-1 then correctly made that
spec **opt-in**, because Playwright's default `webServer` serves undieted originals and the guard was red by
construction. `tasks/BACKLOG.md:819` (F-1029-4) recorded the debt that created: *"GATE: add the
production-preview asset-diet run to a periodic or pre-deploy sweep so the budget is checked on a schedule."*

**F-1047-1 — the sweep cannot be wired yet, because the command that exists to run it is a guaranteed no-op.**
`GR_CAPTURE_EXTERNAL_SERVER` carries **two unrelated duties**:
- `playwright.config.ts:20` — "=1 means I brought my own server, do not start `npm run dev`";
- `e2e/asset-diet.spec.ts:16` — "=1 means these tests may run at all".

`playwright.preview.config.ts` satisfies duty 1 **structurally** — it overrides `webServer` with
`npm run build && npx vite preview --host 127.0.0.1 --port 5189` — but it **never sets the variable**, so duty 2
still skips every test. `package.json:12` (`test:asset-diet`) invokes exactly that config with no env prefix.

**Verified empirically by this fire, not inferred** — the exact command was run:
```
npx playwright test --config playwright.preview.config.ts e2e/asset-diet.spec.ts --reporter=line
  → [asset-diet] SKIPPED: asset diet measures the BUILT bundle; run: ...
  → Running 4 tests using 2 workers
  → 4 skipped
```
It **built the bundle and booted the preview server first**, so it costs a full build and looks like it did
something. Wiring *that* into the deploy path would install a false green in front of a player-facing budget —
the exact class this board has now paid for five times (F-1026-1, F-1029-3, F-1032-1, F-1041-1, F-1044-1).

**One constraint that shapes the fix, so design for it:** a headless fire is permission-denied on env-prefixed
commands (`F-1024-4`, e.g. `GR_CAPTURE_EXTERNAL_SERVER=1 npx playwright ...`). A gate only a human can invoke is
not a gate this factory can keep. The env assignment therefore belongs **inside** `package.json` / the config /
`deploy.sh` — somewhere an unprefixed command reaches it.

## Scope (numbered, each independently testable)

1. **Reproduce first, and put the numbers in your report.** Run `npm run test:asset-diet` (and, if your shell
   makes it easier, the raw `npx playwright test --config playwright.preview.config.ts …` form). Report the
   skip/pass/fail counts you actually saw **before** changing anything. If your reproduction disagrees with the
   block above, STOP and report — the premise is the task.

2. **Make the check execute its assertions.** Recommendation (not an order): set the variable inside
   `package.json:12`'s `test:asset-diet` script, since `playwright.preview.config.ts` already supplies its own
   `webServer` and so is unaffected by duty 1. If you find a cleaner seam (e.g. keying the spec's skip on
   something that means *"a production bundle is being served"* rather than on a dual-duty env var), take it —
   but say in your report **why**, and keep it to these files.

3. **Prove the guard can still FAIL — this is the deliverable, not the green run.** Temporarily lower the
   threshold at `e2e/asset-diet.spec.ts:102` (e.g. to `1_000_000`), run, paste the **RED** output, then restore
   the line **byte-identically** and paste the **GREEN** output. A gate that has never been seen failing is
   exactly what F-1047-1 is. Confirm the restore with `git diff` showing that line unchanged.

4. **Report the real number.** Print `townResponseBytes` for **both** projects (desktop + mobile) and state the
   headroom against 25,000,000. (BACKLOG:819 recorded 16.4MB at the time — say whether it moved.)

5. **Wire it pre-deploy, without breaking `deploy.sh`'s own law.** `scripts/deploy.sh:3-4` promises it *"never
   blocks anything"* and exits 0 in default mode; `:36` already aborts on a failed build ("never deploy a red
   build"). Add the budget check **after the build at `:36` and before the `wrangler pages deploy` at `:42`**,
   such that: default mode **records the measured byte total and any overshoot into `$LOG` and proceeds**
   (never blocks the deploy); `STRICT=1` **fails the deploy** on an over-budget bundle. Reuse the bundle the
   build already produced if you can — do not build twice if one build serves both.

6. **No-op guard.** If you find yourself about to exit without changes, WRITE WHY into your report first — a
   silent no-op wastes a queue slot and a gate.

## Firewall

**Touch ONLY:** `package.json` (the `scripts` block only) · `playwright.preview.config.ts` ·
`e2e/asset-diet.spec.ts` (the **skip guard / comment header** only — plus the temporary scope-3 mutation, restored) ·
`scripts/deploy.sh`.

**NO changes to:** the `25_000_000` threshold at `:102` (a budget edited to fit its measurement is not a guard —
F-1026-1's master forbade exactly this, and so does this one) · the spec's other assertions or its screenshot
tolerances · `playwright.config.ts` (changing the base `webServer` semantics would move every other suite on the
board) · anything under `src/` · any other e2e spec · `scripts/asset-diet.mjs` (the diet itself is not in
question) · new dependencies (a fire cannot gate `npm install` — F-1024-4).

## Self-check before you report (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:asset-diet` — **4 passed** (0 skipped), both projects, with the byte totals printed.
- The scope-3 mutation run pasted in **both** directions (RED then GREEN), and `git diff` proving `:102` restored.
- `bash scripts/deploy.sh` in default mode with wrangler absent/unauthenticated still **exits 0** and still
  self-skips — paste the tail of its log showing the budget line was recorded and nothing blocked.
- Adjacent unmodified-green, both projects, `--workers=1` (cap workers — uncapped sweeps manufacture reds,
  F-1026-2): `e2e/advance-stream.spec.ts`, `e2e/044-start-screen.spec.ts`, `e2e/_s106-prospector-boot-probe.spec.ts`.
- Zero console/page errors in the boot probe.

END: **READY-FOR-GATES** + the before/after run counts (scope 1 vs scope 2), the two mutation outputs, the real
`townResponseBytes` per project with headroom, and one plain sentence on where the check now sits in the deploy
path and what it does when the bundle is over budget.
