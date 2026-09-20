# Task f2397-2-multi-pin-lineage-arm: restore the era-pin-lineage consumer arm on a fixture registry (lane-d, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome) — s2407, 2026-08-31.**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `reviews/era-five-replayed-board.md` (finding **F-2397-2**, the section headed *"era-pin-lineage's core multi-pin property is now asserted nowhere"*); `scripts/assay-worker.test.mjs`; `scripts/assay-worker.mjs`; `assets/engine-era.json`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then a cleanliness line: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (drain finding F-2397-2, `reviews/era-five-replayed-board.md`, s2397 drain 2026-08-31, `9b5603fd2`)

The review says, verbatim:

> `scripts/assay-worker.test.mjs` **deleted** its `matching-round2-lineage` arm — the one asserting that a tape carrying an *earlier* pin of the *same* era still verifies. That is precisely the property `era-pin-lineage` (s2393, `ab6c0c738`) was built to deliver, one fire ago. […] The deletion is **forced, not careless**: era 5 seeds a fresh single-pin array, so the old `pins.find(startsWith('d5b04061'))` lookup has nothing to find and its `assert.ok` would fail. But the right cure was to seed a second pin into a **fixture-local** registry and keep the arm, not to remove coverage of a mechanism that is now load-bearing for every board decision.

**Verified on current main (s2407, by reading and by measurement):**

1. `scripts/assay-worker.mjs:91` is the live membership test: `&& (tapeEra !== engineEra.era || !engineEra.pins.some((pin) => pin.engineHash === tapeEngineHash));`
2. `assets/engine-era.json` holds era 5 with **exactly one pin**, whose `engineHash` equals the top-level `engineHash`. So `pins.some(...)` and `x === engineEra.engineHash` are behaviourally identical against the live registry, and no test can tell them apart.
3. The surviving arm `scripts/assay-worker.test.mjs:118` ("engine lineage wins over build id, with build id retained for legacy tapes") verifies only `matchingRow('matching-round2', engineEra.engineHash)` — the **head** pin.
4. **PROVEN BY MANUFACTURING THE DEFECT**, in a detached worktree, control asserting its own validity first (F-2215-1): unmodified suite → `tests 9 / pass 9 / fail 0`, rc=0, 2.0 s (the control really ran). Then `pins.some(...)` replaced by `tapeEngineHash !== engineEra.engineHash` — i.e. the multi-pin lineage mechanism removed outright — and the suite still reports **`tests 9 / pass 9 / fail 0`, rc=0**. The whole mechanism can be deleted and this battery stays green.

`scripts/engine-era-guard.test.mjs` guards the **registry's own shape** (pins unique, append-only within an era, fresh array on a bump). It does **not** assert that any CONSUMER honours an earlier pin. That is the hole.

**THE LEVER IS PROVEN, NOT ASSUMED (skill §0.7) — and the review's literal wording is NOT achievable.** The deleted arm read a real earlier pin out of the LIVE registry (`engineEra.pins.find(({ engineHash }) => engineHash.startsWith('d5b04061'))`), and that lever is gone until era 5 accrues a second pin. Nor can you swing the registry with `cwd`: `scripts/assay-worker.mjs:8` does `import engineEra from '../assets/engine-era.json' with { type: 'json' }`, a **static, module-relative** import, so `runWorker`'s `cwd: root` is irrelevant to it.

**A lever that DOES work was built and measured by the authoring fire.** Copy the worker's whole non-builtin surface — exactly two files, `scripts/assay-worker.mjs` and `scripts/assay-replay-agent.mjs` — into a scratch tree beside a **fixture** `assets/engine-era.json`, and spawn the copy from there. Measured result, worker run with `--once` against a mock queue of three rows:

| tape carries | cured worker | worker with `pins.some` collapsed to head-pin equality |
|---|---|---|
| an **earlier** fixture pin | `verified` | `unassayable` — *"tape claims unknown pin aaaa…"* |
| the **head** pin | `verified` | `verified` |
| an **unknown** pin | `unassayable` | `unassayable` |

The reason strings named **`the Fixture Era`**, proving the copy read the fixture registry and not the repo's. So the arm flips exactly on the defect and holds steady on both controls: it has teeth and is not decoration (s2226's reachability duty).

⚠️ `scripts/assay-replay-agent.mjs` imports `vite`, so the scratch tree needs module resolution — the authoring fire's proof symlinked the repo's `node_modules` into the scratch root. That is the one non-obvious step; without it the copied worker dies at import.

## Scope

1. Restore a lineage arm to `scripts/assay-worker.test.mjs` asserting **a tape carrying an earlier pin of the same era still verifies**, using a **fixture registry** rather than the live one. Build the scratch tree as described above (copy the two worker files, write a fixture `assets/engine-era.json` carrying **two** pins of the current era — an invented earlier pin plus the real head pin — and make `node_modules` resolvable from the scratch root).
2. The arm must assert all three rows in the table above in one run: earlier pin → `verified`; head pin → `verified`; unknown pin in the same era → `unassayable` with the existing `tape claims unknown pin <hash> in era <n>` reason. The two controls are load-bearing — an arm that only asserts the earlier pin cannot distinguish a correct worker from one that verifies everything.
3. Clean up the scratch tree in a `finally`, the way `scripts/assay-worker.test.mjs:158` ("engine hash ignores a doc-only commit and moves on a Balance edit in a scratch worktree") already does. `scripts/fixture-teardown.test.mjs` is in `test:node-guards` and reds on leaked temp dirs — F-2393-3 cost a whole battery exactly this way.
4. **PROVE THE TEETH BEFORE YOU REPORT DONE.** On a scratch copy of `scripts/assay-worker.mjs`, replace `!engineEra.pins.some((pin) => pin.engineHash === tapeEngineHash)` with `tapeEngineHash !== engineEra.engineHash`, re-run `scripts/assay-worker.test.mjs`, and confirm your new arm **REDS**. Restore the file and confirm green. Report both rc values and the failing assertion text. A guard that has never been seen to fail is not evidence.
5. Report the arm's wall-time cost. `scripts/assay-worker.test.mjs` is rooted in `test:node-guards`, a battery already measured at a **529.8 s floor** (F-2166-2). If your arm adds more than ~20 s, say so plainly in the report rather than absorbing it silently — battery cost is gate policy, not an implementer's call (the F-2159-1 precedent).

## Firewall

Touch ONLY: `scripts/assay-worker.test.mjs`.

NO changes to: `scripts/assay-worker.mjs` (the production worker — scope 4's edit is on a **scratch copy** and must be reverted; the file must be byte-identical to `main` when you finish) · `assets/engine-era.json` (the live registry: adding a real pin is an engine-era act governed by `tasks/engine-era-law-v3.md`, never a test's convenience) · `scripts/assay-replay-agent.mjs` · `scripts/engine-era-guard.test.mjs` · `functions/api/standings.ts` · `src/game/Game.ts` · `package.json` · any other file under `src/`, `scripts/`, `e2e/`, `functions/`.

⚠️ **F-2397-1 IS EXPLICITLY OUT OF SCOPE.** The sibling finding — that the membership predicate now has THREE implementations (`functions/api/standings.ts:818` `currentLineageRefusal`, `src/game/Game.ts:7020`, `scripts/assay-worker.mjs:91`) and no guard asserts they agree — is a separate corrective needing a design call about sharing one predicate across a browser bundle, a node worker and a Cloudflare Pages Function. **Do not extract, unify, or "while I'm here" any of the three.** Report it untouched if you notice it.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean. `npm run build` green. `node --test scripts/assay-worker.test.mjs` green, and report the test/pass/fail counts (it was `9/9/0` before your arm). `npm run test:node-guards` green — run it **ALONE**, never overlapping another battery (F-1537-1), and report its wall time and rc. Scope 4's teeth demonstration reported with both rc values and the failing assertion text. `git status --short` in the lane must show `scripts/assay-worker.test.mjs` as the ONLY modified tracked file.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: READY-FOR-GATES + report (a) the restored arm's three assertions and their results, (b) the teeth demonstration's red and its message, (c) the added wall-time cost, (d) anything you noticed about F-2397-1 without touching it.
