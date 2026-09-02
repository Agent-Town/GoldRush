# Task view-schema-versioning: the rider's JSON view is versioned, additive-only, and stamped beside the engine hash (lane-b, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; `specs/epoch-saga/CAPABILITY-LADDER.md` §3 L3 (THE VIEW-SCHEMA LAW) and §4 S2; `src/agent/View.ts:151` (`buildView`: the one function that shapes what a rider reads); `src/agent/ToolSurface.ts` (~:197 and ~:224, where the view is served); `assets/engine-era.json` + `scripts/engine-era-guard.test.mjs` (the registry and its guard: the view-schema stamp lives beside the engine hash, never inside its corpus); `public/skill.md` (the published view description; it carries NO schema version today, verified 2026-09-02).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner 2026-09-02, "I agree with your design calls"; CAPABILITY-LADDER L3)
Every era grows the view (E3 adds the grid, E5 the boat, E7 signal). Published rider harnesses (codex, Claude, PI, Prime, OMP, OpenClaw) parse today's fields. Without a version and an additive-only guard, one era's change can silently break every rider at once, and nobody can say which view a tape was ridden against.

## Scope
1. **The stamp:** `assets/engine-era.json` gains `viewSchema: { version: <int>, fields: [...] }` (a sorted list of the top-level and `now.*`/`stablePrefix.*` field paths `buildView` emits on a canonical fixture). The view itself carries `viewVersion`. Start at version 1 with today's field set.
2. **The guard** `scripts/view-schema-guard.test.mjs` (in `test:node-guards`): builds the view on the fixture, diffs its field paths against the registry: an ADDED field passes only if `version` was bumped in the same change (or the era bumped); a REMOVED or RENAMED field reds regardless. Extend `engine-era-guard.test.mjs` only if the registry shape needs it; keep `viewSchema` OUT of the engine-hash corpus (prove: editing `viewSchema` does not rotate `computeEngineHash`).
3. **The tape:** submissions record `viewVersion` in their meta (additive; the door accepts tapes without it as version 1). Name the site.
4. **skill.md:** a "View schema" section stating L3 (additive-only, versioned, stamped) and the current version; per-era extensions get a table row as they land. Guards re-pinned.
5. **Mutation proofs:** remove a field → red; add a field without a bump → red; add with a bump → green. Quote all three.

## Firewall
Touch ONLY: `assets/engine-era.json` (the new key only — never the pins), `src/agent/View.ts` (the `viewVersion` field only), the tape meta site you name, the new guard, `scripts/engine-era-guard.test.mjs` if needed, `package.json` (wire), `public/skill.md` (+ guard baselines), BACKLOG row. NO changes to: any existing view field, the engine hash corpus, ranking, the worker's validation beyond accepting the optional meta field, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` + `npm run test:stats` green (counts); the three mutation proofs; a headless ride (`node scripts/gr-sim.mjs --contract the-claim`) still secures and its tape carries `viewVersion`; `computeEngineHash` unchanged by a `viewSchema` edit (hash quoted before/after).
End: READY-FOR-GATES + the field list, the proofs, the hash evidence.

## No-op / honesty guard
If the view already carries a version somewhere I did not find (name it with file:line), STOP and report; the task then reduces to the guard.
