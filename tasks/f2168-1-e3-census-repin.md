# Task f2168-1: re-pin the E3 census to the buildable set ap16-1 deliberately shipped (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2168, 2026-08-22.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `reviews/ap16-1-buildable-parity.md` (the 🟢 F-1636-3 section — the runner that caused this red flagged it at the time and was correctly told not to fix it); `tasks/BACKLOG.md` line 1 (the F-2167-1 row) and the F-2168-1 row directly above it; the WHY below.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

DEPENDENCY CHECK (cheap, do it before scope): this task depends on the ap16-1 manifest change being present. Verify with `git merge-base --is-ancestor 8465f6b33 HEAD` — if that fails, STOP and report "8465f6b33 not in lane". (Measured at authoring time on `lane/b`: present, and `e2e/er01-e3-census.spec.ts`, `src/agent/MechanicsManifest.ts` and `src/sim/HeadlessContractSim.ts` were all byte-identical to main.)

## Why (F-2167-1, s2167 2026-08-22; re-measured and re-classified as F-2168-1, s2168 2026-08-22)

`e2e/er01-e3-census.spec.ts` has been **red on clean main for 12 days**: 4 failed / 4 passed (`e3-canyon-works` and `e3-blackout-ridge`, both projects; `e3-moth-season` and `e3-fairground` pass).

**The cause is deliberate, reviewed, and dated.** `8465f6b33` (2026-08-10T19:08+07, *"feat: ap16-1 buildable parity — one manifest-derived buildable set gates browser and headless door alike"*) rewrote the registry term in `src/agent/MechanicsManifest.ts`. BEFORE it was `listContracts().some(({ id }) => id === contract.id) ? ['sentry_beacon','turret'].map(…) : []`; AFTER it is an unconditional `['sentry_beacon','palisade','sluice','stockpile','turret','assay_office']` with `.filter((id) => !twist.powerGrid || id !== 'turret')`. Since the manifest emits the key only when `buildables.length > 0`, `mechanics.buildables` can no longer be `undefined` for an admitted contract.

**The implementer saw this and said so at the time.** `reviews/ap16-1-buildable-parity.md`, section *"🟢 F-1636-3 — the runner declined an out-of-scope change, correctly"*: *"Its second-opinion review flagged \"old E3 census expectations\"; it left those assertions untouched and said so. That is the reject-don't-stretch convention working (Mistake #14)."* The refusal was correct. **What nobody did was run the spec afterwards** — so the owed measurement became a 12-day red, filed as a green.

**Why this is a re-pin and not a code fix (F-2168-1, and this is the load-bearing part of the scope):** both failing contracts are **admitted** — `supportedContractIds()` contains `e3-canyon-works` and `e3-blackout-ridge` (measured s2168). For an admitted contract the manifest's claim is **true**: the player really can build those pieces. There is a live, open question about whether the manifest should advertise buildables for contracts the sim *refuses* (that is F-2168-1, and it is what keeps `er01-e10-census` red) — **but it cannot touch these two contracts, because under every possible answer an admitted contract still gets the registry set.** So this pin must move regardless of how that question is ruled. That is why this task is safe to do now and why its firewall forbids touching the manifest.

Measured on main at authoring time (`node` + `vite.ssrLoadModule`, s2168):
- `e3-canyon-works` → **5** buildables: `sentry_beacon, palisade, sluice, stockpile, assay_office`, each `source: 'buildables.registry'`. **`turret` is absent** — canyon-works sets `twist.powerGrid`, and ap16-1's filter trades the turret for the current mechanic.
- `e3-blackout-ridge` → **6** buildables: the same five registry entries in that order, then `capacitor_bank` (`source: 'twist.powerGrid'`, cost 75, maxCount 4).

## Scope

1. **`e2e/er01-e3-census.spec.ts:51`** ("e3-canyon-works census support is explicit and deterministic") — replace `expect(mechanics.buildables).toBeUndefined();` with an assertion of the derived set: the five ids above, in that order, each with `source: 'buildables.registry'`. Assert **`id` and `source` only** — do not pin `cost`/`costs`/`maxCount`/`meaning` here; those belong to the buildables registry's own tests and pinning them makes this census brittle to balance edits.
2. **Same test, same site** — add an explicit assertion that `turret` is **NOT** among the ids. This is the one behavioural fact ap16-1 introduced for power-grid maps and the census is exactly the place to state it. Keep it to one line.
3. **`e2e/er01-e3-census.spec.ts:190`** ("e3-blackout-ridge census support is explicit and deterministic") — the `expect(mechanics).toMatchObject({ … })` currently declares a one-element `buildables` array holding `capacitor_bank`. `toMatchObject` requires the array lengths to match, so extend it to the six measured entries, in derivation order: the five registry entries matched by `{ id, source }`, then the **existing `capacitor_bank` object exactly as it is written today** (its `meaning`/`cost`/`maxCount`/`source` assertions are real census content — preserve them verbatim, do not re-derive or re-word them).
4. **Do not weaken anything else in either test.** The `interactables`, `rules`, `posting` and determinism assertions stay exactly as they are. If any of them also fails once you have made the changes above, that is a NEW finding — STOP, report it, and do not adjust it.
5. At each of the two changed sites, leave a one-line comment naming the cause: `// re-pinned s2168 (F-2167-1/F-2168-1): ap16-1 8465f6b33 gave every admitted contract the core registry set.` A pin only moves with a named cause (F-1441-3).

## Firewall

Touch ONLY: `e2e/er01-e3-census.spec.ts`.

NO changes to:
- **`src/agent/MechanicsManifest.ts` — this is the important one.** The manifest's current behaviour is deliberate and reviewed. There IS an open question about whether it should gate on admission, but it is a design question on an agent-facing versioned surface (`goldrush.mechanics.v1`), it is filed as F-2168-1, and it is **not yours to settle**. If you believe the manifest is wrong, say so in your report — do not edit it.
- `e2e/er01-e10-census.spec.ts` — red for the fork-dependent half of the same finding; out of scope, deliberately.
- Any other `e2e/*.spec.ts`, any `src/**`, `scripts/**`, `assets/**`, `tasks/**`, `specs/**`, `reviews/**`, `package.json`.
- Sim semantics, balance numbers, the buildables registry.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean.
- `npm run build` green.
- `npx playwright test e2e/er01-e3-census.spec.ts --workers=1` → **8 passed / 0 failed**, desktop AND mobile. (`--workers=1` is mandatory in this shell and in yours — F-1270-1; a red at default workers is not evidence.)
- Adjacent, unmodified-green both projects: `npx playwright test e2e/er01-e2-census.spec.ts e2e/er01-e4-census.spec.ts --workers=1`. Both were measured green on main at authoring time, so a red there is attributable to you and is a STOP.
- `test:node-guards` is NOT required: the diff touches no `src/sim/`, `src/systems/` or `src/entities/` file (the §3 trigger). Do not run it; it costs ~9 minutes.
- No screenshots and no perf table: nothing renders in this change.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report (a) the exact before/after text of each of the two assertions, (b) whether the derived arrays matched the 5 and 6 entries quoted in the WHY above — **if they differ, report the difference and do NOT adapt the numbers to whatever you observe**, since a mismatch means the manifest moved again since authoring and that is a finding, (c) anything you were tempted to fix outside the firewall.
