# Task AP-16 audit follow-up: attribute the 29 menu rows to their admission gate (LANE-D, commit prefix `test:`)

**FIRE-AUTHORED s1699 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `specs/agent-play/ap-16-same-game-law.md` rules 1–4 and AP-16-4; `tasks/BACKLOG.md` owner CLEAN-SLATE ruling and finding **F-1692-1**; `reviews/f1636-1-same-game-audit-independence.md`; `scripts/same-game-audit.mjs`; `scripts/same-game-audit.test.mjs`; `docs/bench/same-game-audit.md` summary through **Worst offenders**.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Sequencing and premise checks

AP-16-6C must be present. AP-16-7 must remain unmerged and gate-side blocked; this task is independent of its held candidate and must not absorb any lane-b bytes.

```sh
git merge-base --is-ancestor dbcbf31220e2dc332f7e809c3ab00572f7fe88bb HEAD
grep -Fc "THE 29 DIVERGENT MENU ROWS ARE NOT A SECOND INDEPENDENT DEBT" tasks/BACKLOG.md
grep -Fc "Browser-menu versus door" scripts/same-game-audit.mjs
grep -Fc "same-game audit follows the door grammar through the final AP-16 verbs" scripts/same-game-audit.test.mjs
```

The ancestor check must succeed and each grep must return `1`. If not, STOP and report the moved premise.

Before editing, run the JSON audit and report this exact partition from current main:

- divergent browser-menu rows: **29**;
- by contract: `e3-fairground` 5; `e5-deepwater-claim` 6; `e5-stillwater` 6; `e6-glow-mesa` 6; `e6-showroom` 6;
- independent menu-vs-door rows whose contract reachability is already `equal`: **0**.

If the live partition differs, STOP and report the new table. Do not force the report back to these counts.

## Why (owner CLEAN-SLATE ruling, priced 2026-08-12; F-1692-1)

The generated report calls 29 rows a separate **“Browser-menu versus door”** divergence class. Current JSON proves all 29 belong to exactly five contracts whose reachability row already says the browser can launch while the headless door rejects before play. Among contracts whose reachability is `equal`, the existing audit test already measures **zero** menu-vs-door disagreements.

The rows are truthful evidence, so do not delete or relabel them. The defect is attribution: one admission refusal is being advertised as a second independent buildable debt. The same report also counts every `headless rejects ... before play` row as “browser-offered,” which mixes the 15 contracts refused by both species into that sentence. This follow-up must derive both partitions from the reachability rows it already owns.

## Scope

1. In `scripts/same-game-audit.mjs`, derive the reachability population once from rows with surface `verb` and the launch/unavailable wording already used by the report.
2. Partition divergent browser-menu rows into:
   - **independent**: contract reachability is `equal`;
   - **reachability-derived**: contract reachability is `agent-lacks`.
   Keep the full row table and its direction values unchanged.
3. Rewrite the report bullet so it says the derived live counts plainly: zero independent menu-vs-door gaps and 29 rows downstream of five admission refusals today. Derive every number; hardcode none.
4. Correct the contract-reachability bullet from the same derived population: browser-offered door refusals and jointly `not-offered` contracts are separate counts. Do not change admission policy or exemptions.
5. Extend the existing test titled **“same-game audit follows the door grammar through the final AP-16 verbs”** with an invariant that all current divergent browser-menu rows are either independently attributed or reachability-derived, and that independent gaps are zero. Do not pin `29`; AP-16-7 and later admission work must be allowed to shrink the downstream count without a test rewrite.
6. Regenerate `docs/bench/same-game-audit.md` from the script. The report must be byte-identical on a second generation.
7. If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `scripts/same-game-audit.mjs`; `scripts/same-game-audit.test.mjs`; regenerated `docs/bench/same-game-audit.md`.

NO changes to: `src/**` (especially `HeadlessContractSim.ts`, `StandingOrders.ts`, `MechanicsManifest.ts`); `public/skill.md`; `assets/contracts/**`; `e2e/**`; `package.json`; `tasks/**`; `STATUS.md`; AP-16-7's saved branch/candidate. This is attribution in an existing audit, not admission, parity policy, a new guard, or runtime work.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit`; `npm run build`.
- `node scripts/same-game-audit.test.mjs` green; report its test count.
- Run `node scripts/same-game-audit.mjs --write-report` twice and prove the second run leaves `docs/bench/same-game-audit.md` byte-identical.
- Re-run the JSON partition and report independent vs reachability-derived counts and the five contract counts.
- `npm run test:node-guards` ALONE, zero failures. Do not overlap it with another battery.
- Diff proves row schema, row count, summary direction totals, admission exemptions and runtime sources are unchanged; only classification prose/test attribution moves.
- No Playwright, boot or screenshots: this renders nothing and changes no game behavior.

End with `READY-FOR-GATES`, the before/after report bullets, the live partition, and confirmation that all 1,095 row records and direction totals remain unchanged.
