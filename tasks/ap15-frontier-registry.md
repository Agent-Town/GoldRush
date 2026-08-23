# Task ap15-frontier-registry: the county keeps frontiers — the record book + the Field Book strips (lane-d, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; **specs/agent-play/ap-15-assay-of-minds.md (RATIFIED 2026-08-23 — the three owner answers at the foot are LAW: frontier-anchored EFF relabels old rows, dethronements are Herald items, the axis names are the county's voice)**; its "What ships first" list (items 1-4 — note item 1, null-floor artifacts, SHIPPED long since as assets/contracts/null-floors.json: premise-check and skip); functions/api/standings.ts + server/ledger/serve.mjs (the boards this reads — SINCE THE L3 CUTOVER the live book is the droplet sqlite; anything you add must work through BOTH backends via the L1 storage seam); src/encyclopedia/reader.ts (the Field Book / first-ledger client surfaces); src/news/editionLadder.ts (where Herald items are made).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — expected, list, proceed. NOTE: `l4-ledger-backup-discipline` may be queued/running ahead of you on this lane — that is LAWFUL QUEUE DEPTH, not foreign work; your pre-flight judges only branch/worktree state. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (spec RATIFIED 2026-08-23; owner same day: "Lets burn and make things happen!")
The assay era measures WHAT a mind did, not just whether it won. The spec's first buildable slices: the frontier registry (the county's record book — best verified row per contract+seed, era-stamped) and the Field Book strips (axes 1-3 render from existing data). Ranking stays outcome-based and species-blind (spec Law 1) — the assay is information, never ordering.

## Scope
1. **The frontier registry**: a pinned artifact (follow the null-floors shape: a generated, era-stamped JSON under assets/contracts/ or the spec's named home) seeded from the existing VERIFIED rows; a regen script (`scripts/` + a `--check` mode) that re-derives it from the boards; frontier definition per the spec (leanest verified secure per contract+seed — the Surveyor's side; the Homesteader crown only if overtime data exists, else name it absent).
2. **Frontier-anchored EFF**: the Field Book relabels old fixture-anchored rows by era, deletes nothing (ruling 1 verbatim).
3. **Dethronement = a ledger event + a Herald item** (ruling 2): when the regen detects a new frontier, it emits the record the news system consumes (read how editionLadder items are born; smallest honest wiring).
4. **The Field Book strips**: axes 1-3 (Outcome / Economy / Cost — ruling 3's names) render per row from data the boards already carry; axes 4-8 are LATER slices — do not stub them visibly.
5. **Both backends**: whatever the API serves goes through the L1 storage seam; suites extended on both arms (the l1 pattern).
6. Tests: registry regen deterministic + `--check` clean on a seeded fixture; dethronement event fires exactly once per new frontier; the strip renders for a verified row and absents honestly for an unverified one.

## Firewall
Touch ONLY: the registry artifact + its script, functions/api/standings.ts + server/ledger (read paths only — no verdict/ranking changes), the Field Book client surface, the news item birth-point, tests, BACKLOG row. NO changes to: ranking order, verdict flow, sim, tapes, null-floors.

## Self-check (evidence, not vibes)
tsc + `npm run build` green; test:stats + the standings/ledger suites green both arms; the new tests green; floors `--check` untouched-clean; zero console/page errors plain boot. End: READY-FOR-GATES + report: the registry's seeded row count, the strip's data sources per axis, the dethronement wiring shape.

## No-op / honesty guard
If the existing verified rows are too few to seed a meaningful registry (the sqlite book is DAYS old — the L3 cutover started it empty; the OLD verified rows live in the KV backend), say which backend you seeded from and why; never invent rows. If the Field Book surface the spec names does not exist where expected, STOP and report the real surface.
