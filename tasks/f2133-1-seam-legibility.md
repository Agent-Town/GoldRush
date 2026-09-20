# Task f2133-1-seam-legibility: make the seam predicate say what it means, in both places it is asked (lane-d, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s2133, 2026-08-21.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST:
- `AGENTS.md`
- `reviews/f2124-1.md` — the slice that shipped live seam positions and left both halves of this owed.
- The BACKLOG rows for **F-E3CF-5** (the "+ audit rows" half, marked **FIRE-AUTHORABLE**) and
  **F-2127-2** (the collapsed assertion, marked advisory/non-blocking).
- `scripts/same-game-audit.mjs` — read `row()` and `audit()` before adding anything.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

⚠️ At authoring time `node scripts/lane-usable.mjs lane-d` read **USABLE**, `ahead=0 behind=25`, no tracked dirt. Re-run it yourself; if it does NOT say `USABLE`, **STOP** and report. The reset above makes the lane current — you need it, because main gained `scripts/picnic-hold-contract-scope.test.mjs` and its `package.json` rooting at `afbda29bc`, so an un-refreshed lane's `test:node-guards` is a strict SUBSET of main's.

## WHY — one predicate, asked twice, legible in neither place

`f2124-1` (`b253af85c`) gave the agent view live seam positions. It shipped with the seam predicate
written **once, collapsed**, and left the audit half unbuilt. Both are recorded and both are cheap.

**F-2127-2** — verified at source by the s2133 drain, not inherited. `e2e/agent-view.spec.ts:557-559`
("the seeded rider view stays cache-shaped and grows one honest wave at a time") ends:

```ts
expect(views.wave3.now.seams.every((seam) => seam.active
  ? Number.isFinite(seam.x) && Number.isFinite(seam.z) && seam.anchorIndex !== null && seam.anchorIndex >= 0
  : seam.x === null && seam.z === null && seam.anchorIndex === null)).toBe(true);
```

A failure reports **"expected false to be true"** against a six-seam fixture — naming neither the seam,
nor which of `x`/`z`/`anchorIndex` went wrong, nor whether the `active` or the inactive arm broke. That
is a diagnosability cost on a guard whose entire purpose is catching a subtle join bug.

**F-E3CF-5, the "+ audit rows" half** — `grep -c seam scripts/same-game-audit.mjs` returns **0**
(measured s2133 on main). The audit is the instrument that asks "do humans and agents get the same
game?", and seam location — the thing f2124-1 proved diverged **2 of 2**, sending an agent joining by
id 13 units off in x and 13.5 in z — is currently outside its denominator entirely.

✅ **The lever is verified, which is why this is authorable rather than a guess:** `same-game-audit.mjs`
already SSR-loads the sim (`vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts')`, `:30`) and already
holds `HeadlessContractSim` and `supportedContractIds` in scope, so it can construct a sim and read a
real view. You are extending an instrument that already has the capability, not adding one.

## Scope

1. **Give the e2e assertion a per-seam loop.** In `e2e/agent-view.spec.ts:512` ("the seeded rider view stays cache-shaped and grows one honest wave at a time"), replace that test's **final
   assertion — the collapsed `views.wave3.now.seams.every(...)` immediately before `const receipt`** —
   with a loop that asserts the same predicate **per seam**, so a
   failure names the seam and the field. Assert the **same** logic — this is a diagnosability change,
   NOT a strictness change: it must pass today, unmodified, on the same fixture.
2. **Prove the message by manufacturing the defect.** Temporarily corrupt exactly one seam in the
   evaluated view object (e.g. set one active seam's `x` to `null`), run the spec, and **paste the
   resulting failure message verbatim into your report** — it must name the seam id and the field.
   Then revert the corruption and show the spec green again. A passing assertion is not evidence
   about the red it claims to own.
3. **Add a seam-legibility row to the same-game audit.** One row per seam-bearing contract, in the
   existing `row(contract, surface, humansGet, agentsGet, direction, evidence)` grammar, surface
   `'seam'`, asserting the published contract: **active seams carry finite `x`/`z` and an
   `anchorIndex >= 0`; inactive seams publish `null` for all three** — never `(0,0)`. Resolve the
   seam-bearing contracts **from the data**, not a hardcoded list, so the row keeps working when
   contracts are added. Evidence strings use the existing `line(file, needle)` helper so the
   citations cannot rot silently.
4. **Bound the cost and report it.** The audit's three guards already cost ~5.3 s each. Measure the
   wall-time of `scripts/same-game-audit.test.mjs` before and after, and **report both numbers**. If
   your row adds more than **~15 s**, do NOT ship it as written — narrow it (fewer contracts, one
   sim reused across rows) and say what you narrowed and why.
5. **Regenerate `docs/bench/same-game-audit.md`** so the committed table carries the new rows, and
   quote two of the new rows verbatim in your report.

## Firewall

Touch ONLY: `e2e/agent-view.spec.ts` (the assertion at `:557-559` and nothing else in the file),
`scripts/same-game-audit.mjs`, `scripts/same-game-audit.test.mjs` (ONLY if the row-schema guard needs
to learn the new surface — say so explicitly if you touch it), `docs/bench/same-game-audit.md` (regen).

NO: the seam predicate's SEMANTICS (scope 1 is diagnosability only — if you believe the predicate is
wrong, report it, do NOT change it); `src/**` of any kind; the agent view's shape or payload;
`now.seams` itself; any other e2e assertion in `agent-view.spec.ts`; any other audit row or surface;
`package.json`; contract data. 🔒 **This task adds NO new script**, so there is no `gate-caller-audit`
rooting question — if you find yourself creating a file under `scripts/`, you have left scope: STOP.

## Self-check (evidence, not vibes)

`npx tsc --noEmit`; `npm run build` green. `agent-view` green **desktop and mobile-390**, with the
manufactured-defect message from scope 2 pasted verbatim. `scripts/same-game-audit.test.mjs` +
`scripts/same-game-report-guard.test.mjs` green with before/after wall-times. **Full
`npm run test:node-guards`** — the audit is rooted there and its report guard cross-checks the
markdown; run it **SOLO** (~450 s on main at s2133; it contends, so bracket with `pgrep` and never
overlap it with a second battery — F-2099-1: a red is a question about the arrangement before it is a
question about the code). Zero console/page errors.

⚠️ Known-environmental in a fire shell, not yours if they appear: the three `cross-engine-skip` guards
(F-1408-2) and `node-guards-contention`. Fingerprint-match with proof; never re-pin to silence.

End: **READY-FOR-GATES** + report: the manufactured-defect message verbatim, the two new audit rows
verbatim, the before/after audit wall-times, and whether you narrowed scope 3 (and why).

## No-op / honesty guard

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op
wastes a queue slot and a gate. If the audit turns out to be structurally unable to express the seam
row within the cost budget (scope 4), that is a legitimate STOP: say exactly what the instrument
cannot express and what you would need, and still land scopes 1+2, which are independent of it.
