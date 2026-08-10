# Task f1631-1: make the town-budget ceiling assertion say WHICH bytes it just gated (LANE-C, commit prefix "test:")

CODEX: model=gpt-5.5 effort=high

**FIRE-AUTHORED s1631 (attended review welcome)** — from F-1629-1, measured s1629 at the f1627-1 drain and re-verified against main by this fire before authoring.

⚙️ **WHY THIS MASTER IS ROUTED OFF THE HOUSE DEFAULT (s1632, F-1632-1 — not a preference, a wall):** the house default is `gpt-5.6-sol` (owner ruling 2026-07-10, `lane-runner-v3.sh:173`), and that model is **quota-walled until 2026-08-16 03:30** — it is what killed this master's first dispatch at 16:05:22 having touched nothing. `gpt-5.5` was measured answering (`codex exec -m gpt-5.5` → exit 0) and is the best model on the account's current list, so this run is routed there at `effort=high` to offset the lower tier. Read `tasks/CODEX-WALL` before queueing anything else. **Nothing about the scope, the firewall or the gate below changes because of the model** — if you cannot meet the GATE, STOP and report rather than lowering it.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `reviews/f1627-1-ab-ceiling-coverage.md` (the drain that filed this); `e2e/asset-diet.spec.ts`; the F-1629-1 row in `tasks/BACKLOG.md`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. ⚠️ The trap this closes: a run that STOPPED still ran playwright and still regenerated screenshots, so a stopped predecessor leaves tracked dirt that freezes its successor — three consecutive masters (gazette-welcome-drift-observation-frame v1/v2, newsie-drift-shell-divergence-rate) died before measuring anything, the third killed by the exhaust of the first two.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE, WHICH THE LANE TEMPLATE OWED AND DID NOT CARRY UNTIL s1505 (F-1505-1): `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

SEQUENCING LAW: this task edits a file f1627-1 repaired recently. Verify that repair is present before you touch anything:
`git log --oneline | grep -q 'ab-ceiling-coverage'` — if that returns nothing, **STOP and report "f1627-1 not landed"**. Do NOT improvise its de-duplication; it is already done and is not your scope. (Do not gate on `git log -N` with a small N — search the whole log by pattern.)

## Why (F-1629-1, measured s1629 at the f1627-1 drain; code re-verified on main by s1631 before this master was written)

`e2e/asset-diet.spec.ts` has two tests that share a module-level cache:

- **`const cueTestMeasurementsByProject = new Map<string, TownTransferMeasurements>();`** (`:45`) is populated in **exactly one place**: `cueTestMeasurementsByProject.set(testInfo.project.name, cueTestMeasurements);` (`:229`), inside the cue test *"honest town and claim cues appear while GLBs are throttled and leave at ready"* (`e2e/asset-diet.spec.ts:211`).
- The budget test *"town byte budget reports normal and saveData arms by URL"* (`e2e/asset-diet.spec.ts:261`) reads it at **`const cueTestMeasurements = cueTestMeasurementsByProject.get(testInfo.project.name)`** (`:352`), with `?? JSON.parse(await readFile(... 'town-transfer-<project>.json'))` on the next line.
- It then asserts **`expect(cueTestStats.totalBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES);`** (`:437`).

**So whenever the budget test runs without the cue test in the same worker — a solo `-g` run, a shard, a retry — that assertion gates a COMMITTED FILE, not the build.** The green it produces means strictly less than the green it appears to produce, and nothing at the site says so.

✅ **PROVEN BY MANUFACTURING THE DEFECT (s1629), not inferred:** inflating one entry of `artifacts/asset-diet/town-transfer-desktop-chrome.json` by 4,000,000 bytes (sum 21,903,056 → 25,903,056), **with no code change and no rebuild**, turned the solo run rc=1 reporting `Received: 25903056` — the number written to disk. The artifact was restored byte-identically (sha256 `96bc43ab…ab51f4`).

⚠️ **The sting, and the reason this is worth a lane: the f1627-1 master's own self-check tells a runner who hits the F-1627-3 timeout to re-run that test alone.** The prescribed fallback procedure is *exactly* the case that makes the assertion vacuous — so the factory has a documented path that silently downgrades its own release gate.

This is **not** a blocker and **not** introduced by f1627-1 (both the fallback and the assertion predate it).

## Scope

1. At `:352`, before the `??` expression, capture whether the measurements come from this run: a `const` boolean from `cueTestMeasurementsByProject.has(testInfo.project.name)`. Keep the existing `.get() ?? readFile(...)` behaviour **exactly as it is** — you are observing the path, not changing it.
2. Add a comment at that site naming **F-1629-1** and stating in one line what the two paths mean: map hit = this run's cue test measured it; map miss = the committed `town-transfer-<project>.json` from a previous run.
3. Make the provenance **visible in the generated report** (the markdown this test writes under `artifacts/`): add a line, or a column/qualifier on the existing `| cue test |` row of the *"Release-gated cue-window transfer total"* table, that states plainly whether those bytes were measured **in this run** or **read from the committed artifact**. A reader of the artifact must be able to tell without knowing this finding exists.
4. Make the assertion at `:437` self-describing: pass a message to `expect` naming the provenance, so a failure (and the assertion itself) says which bytes it gated. Add a comment naming F-1629-1 above it, alongside the existing F-1627-2 / F-1625-4 comment block — **extend that block, do not replace it.**

## ⛔ What this task must NOT do — read before writing

- **Do NOT make the fallback FAIL, throw, or skip.** The fallback is the prescribed F-1627-3 re-run procedure; breaking it would break the documented recovery path. The cure is **visibility, not enforcement.** If you think the gate should refuse historical values, say so in your report as a finding — do not implement it.
- **Do NOT change `TOWN_TRANSFER_CEILING_BYTES = 25_000_000`** (`:32`). Re-pinning it is the F-1441-3 class, and the ceiling's value is the OPEN OWNER FORK **F-1625-4** — not yours to settle.
- **Do NOT wire the A/B arms to the ceiling.** F-1627-2 measured desktop normal at 24,604,025 / 26,115,186 / 23,259,297 across three runs — straddling the ceiling. Gating them installs a flake. The existing comment at `:433–436` says this; leave its meaning intact.
- **Do NOT change the pass/fail outcome of any existing assertion**, including `expect(cueWindowResponseBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES);` (`:241`, the cue test's own live assertion, which is NOT vacuous and needs nothing).
- **Do NOT edit or regenerate `artifacts/asset-diet/town-transfer-*.json`.** Those are the committed baselines this finding is about; changing them would destroy the evidence.

## Firewall

Touch ONLY: `e2e/asset-diet.spec.ts`.

NO changes to:
- ⛔ `TOWN_TRANSFER_CEILING_BYTES` / the literal `25_000_000` (`:32`).
- ⛔ The cue test (`:211`) and its assertion at `:241` — this task is about the *budget* test's read of the cache, not the cue test's own measurement.
- ⛔ `artifacts/**` — including `artifacts/asset-diet/town-transfer-desktop-chrome.json` and `-mobile-chrome.json`.
- ⛔ Any `src/**`, `scripts/**`, `package.json`, `playwright.config.ts`, `playwright.preview.config.ts`, `scripts/deploy.sh`.
- ⛔ Any other spec file, and any other test in this file.
- ⛔ Sim semantics of any kind.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- **`npm run test:asset-diet` → 6/6, both `desktop-chrome` and `mobile-chrome`**, zero console/page errors. (That script already pins `--workers=1` and uses `playwright.preview.config.ts`; expect roughly 400 s — s1629 measured 406.9 s. Do not "speed it up".)
- **PROVE BOTH PROVENANCE PATHS, because a cure that is only ever exercised on one path is untested on the other:**
  - **(a) map-HIT path** — the full-suite run above. Quote the report line/row from the generated markdown showing it says *measured in this run*.
  - **(b) map-MISS path** — re-run **only** the budget test (`-g 'town byte budget reports normal and saveData arms by URL'`), which is the F-1627-3 fallback case and leaves the map empty. Quote the report line showing it says *read from the committed artifact*, and quote the assertion message. **This is the whole point of the task: the solo run must now announce what it is gating.**
- `git diff --numstat` showing **exactly one file changed**, and a `git diff` confirming `25_000_000` does not appear in the diff at all.
- `grep -c "TOWN_TRANSFER_CEILING_BYTES" e2e/asset-diet.spec.ts` → report the count and confirm it is unchanged versus main (`git diff main -- e2e/asset-diet.spec.ts` must not show `:32`, `:241` or the ceiling constant).
- Adjacent suites, named not implied: **none owed** — this diff touches one spec file and no `src/**`, so no other suite can observe it. `test:node-guards` is **NOT required** (no `src/sim`, `src/systems`, `src/entities` path — F-1460-1). Say so explicitly rather than omitting it; do not run the 181 s battery for a test-only change.

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report (a) both provenance paths with their quoted report lines and the solo-run assertion message, (b) the `test:asset-diet` result and duration, (c) confirmation the ceiling constant and the cue test's own assertion are untouched, and (d) anything you had to adapt — in particular, if making the provenance visible in the report required restructuring the table, say exactly how and why.
