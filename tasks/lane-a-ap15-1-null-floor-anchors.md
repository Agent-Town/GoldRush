CODEX: model=gpt-5.6-sol effort=high

# Task ap15-1: the null floor — pin what the MAP gives away free, for every door-servable bench seed (LANE-A, commit prefix "assay:")

**FIRE-AUTHORED (attended review welcome)** — s1650, from `specs/agent-play/ap-15-assay-of-minds.md` slice 1, with the run cost measured before authoring rather than estimated.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a` (branch `lane/a`). Commit prefix `assay:`. Never touch STATUS.md, reviews/, tasks/queue/, or other lanes.

READ FIRST:
1. `AGENTS.md`.
2. `specs/agent-play/ap-15-assay-of-minds.md` — this task is its **"What ships first (cheap, in order)"** item 1. Verify you have the right spec with `grep -c "Null-floor artifacts for the 12 door-servable contracts" specs/agent-play/ap-15-assay-of-minds.md` → must be **1**. If it is 0, the lane is stale — STOP and report "ap-15 spec key absent, lane stale".
3. The same spec's **Laws** section, law 3 (`grep -c "Anchors are artifacts" …` → **1**): *"null floors and frontiers are pinned files with era stamps, re-derived by the census stream when the sim changes"*. That sentence is this task's shape: a pinned artifact plus a re-derivation path — **not** a standing test.
4. `scripts/gr-sim.mjs` — the headless door runner (args, view-per-line, outcome-last).
5. `src/sim/HeadlessContractSim.ts` — the `SUPPORTED_CONTRACTS` set and the constructor that throws `AP-07 supports only …` for anything outside it.
6. `assets/contracts/bench-seeds.json` — the pinned public bench seeds.
7. `scripts/bench-seeds.test.mjs` — the EXISTING bench-seed guard (id uniqueness, seeds reference known contracts). Your new guard is complementary; do not duplicate its assertions.

## Why (spec slice + measured evidence, s1650 2026-08-11)

AP-15 exists because the county had no floor. Quoting the spec's own statement of the problem: **"It has no floor. F-BAL-1 proved a contract could be idle-securable — a 0-decision 'win' divides by zero and, worse, credits a mind for what the MAP gives away free."** The Goodhart clause (law 2) is written *against* that floor — *"decision economy is void where the null floor secures"* — so until the floor is a pinned artifact, law 2 is unenforceable and every efficiency number the Field Book prints is unanchored.

**The run cost was MEASURED, not estimated (s1650), because the last fire to queue an unmeasured full-corpus run cost the factory a parked master and an owner escalation (F-1648-1, a ~9h saturating run).** Measured on main at `784e94f02`, one process at a time:

- 17 bench contracts × 1 seed each, sequential: **63.2 s total**. Per-run range **1.4 s – 8.4 s**.
- Of those 17, **exactly 12 are door-servable**; the other 5 (`e3-fairground`, `e6-glow-mesa`, `e6-showroom`, `e6-half-life-hollow`, `e6-picnic`) are refused by the `HeadlessContractSim` constructor at rc=1. This is **known and already cured as a documentation matter** — `public/skill.md` carries the `door-contracts` block and the sentence *"Not every bench contract is servable through the headless door yet"* (F-DOOR-4, 2026-08-08). **Do not treat the 5 as a bug and do not try to socket them** — they are out of scope and their era sockets are browser-side only.
- The 12 servable contracts carry **35 bench seeds** between them, so the full derivation is **~35 runs ≈ 2.5 minutes**. That is the entire cost of this task's data.
- **Determinism verified** by running three contracts twice each: `the-claim`, `e1-baron`, `e2-hill-mine` reproduced `eventLogHash`, `waves`, `kills` **and** `timeMs` exactly. The artifact is therefore pinnable and driftable — which is what makes the `--check` mode in scope 1 meaningful.

Reference floors measured this way (first seed of each servable contract; your run must reproduce these exactly for these 12 pairs):

| contract | seed | secured | waves | eventLogHash |
|---|---|---|---|---|
| the-claim | e1-the-claim-01 | false | 2 | fnv1a32:e9c32234 |
| e1-dry-gulch | e1-dry-gulch-01 | false | 4 | fnv1a32:79712a38 |
| e1-night-shift | e1-night-shift-01 | false | 4 | fnv1a32:3bcb3c2d |
| e1-twin-banks | e1-twin-banks-01 | false | 3 | fnv1a32:01e5173c |
| e1-baron | e1-baron-01 | false | 5 | fnv1a32:b128731a |
| e2-hill-mine | e2-hill-mine-01 | false | 18 | fnv1a32:a60bfc0a |
| e2-trestle | e2-trestle-01 | false | 18 | fnv1a32:135b7464 |
| e2-pressure-garden | e2-pressure-garden-01 | false | 1 | fnv1a32:a3bc4be8 |
| e2-incline | e2-incline-01 | false | 2 | fnv1a32:0042112a |
| e3-blackout-ridge | e3-blackout-ridge-01 | false | 4 | fnv1a32:928c3618 |
| e3-moth-season | e3-moth-season-01 | false | 4 | fnv1a32:7f1ac8a2 |
| e3-canyon-works | e3-canyon-works-01 | false | 3 | fnv1a32:ac7eaf69 |

**Two things in that table are findings in their own right and must survive into your report:** (a) **no** servable contract is idle-*securable* at its first seed — so F-BAL-1's zero-decision win does not reproduce anywhere in the current servable set, which is a negative result worth stating plainly; (b) `e2-hill-mine` and `e2-trestle` each survive **18 waves** with zero decisions, an order of magnitude above `e2-pressure-garden`'s 1 — the free ride varies enormously by map, which is exactly the spread the anchor exists to expose.

**DELIBERATE, STATED REFINEMENT OF THE SPEC (flagged for attended veto):** the spec's slice 1 says *"12 idle runs"*; this task derives **35** — one per (contract, seed) pair — because county bench rows are keyed per seed, so a per-contract floor could not be compared against the row it is meant to anchor. The spec's "12" reads as an effort estimate, not a grain ruling, and the measured cost of the finer grain is ~2.5 min. If an attended reviewer disagrees, the coarser artifact is a one-line filter over the same file.

## Scope

1. **Add `scripts/null-floor-anchors.mjs`** — the derivation tool.
   - It **derives** the servable set as the intersection of `assets/contracts/bench-seeds.json`'s keys with the sim's own `SUPPORTED_CONTRACTS`. **Do NOT hardcode the 12 contract names or the 5 refused ones** — a hardcoded copy of something the code already knows is a defect awaiting the next contract rename. If importing `SUPPORTED_CONTRACTS` directly is impractical, derive it by probing the constructor and catching the `AP-07 supports only` throw, and say in your report which route you took and why.
   - For each (contract, seed) in that intersection it runs the headless door with the **idle** policy and records the terminal outcome.
   - Default mode **writes** `assets/contracts/null-floors.json`.
   - **`--check` mode** re-derives and compares against the pinned file, printing a per-pair diff and exiting **1** on any drift, **0** when identical. This is law 3's "re-derived when the sim changes" half.
   - Run it **sequentially, one child process at a time**. Do not parallelise; the fire shell's CPU ceiling makes concurrent sim children slower and noisier, and this corpus is only ~2.5 min serial.
2. **Generate and commit `assets/contracts/null-floors.json`.** Required shape: a top-level object carrying `schema: "goldrush.nullfloor.v1"`, an `eraStamp` (the short commit hash of the `main` tip you derived under), a `policy: "idle"` field, and a `floors` map of contract → seed → `{ secured, waves, timeMs, gold, kills, eventLogHash }`. Report the file's byte size.
3. **Add `scripts/null-floor-anchors.test.mjs`** and root it by appending it to the **`test:node-guards`** file list in `package.json` (that list is explicit, not a glob — an unrooted guard is invisible). The guard must be **pure JSON/shape validation and must NOT run the sim** (it has to stay in the milliseconds; the derivation stays manual). It asserts: the artifact parses and carries `schema`/`eraStamp`/`policy`; `eraStamp` is lowercase hex; the `floors` contract set equals the derived bench∩supported intersection **exactly** (both directions — missing *and* extra); every servable contract's seed keys equal its `bench-seeds.json` list exactly; every entry has all six fields with the right types. It must additionally **fail loudly if any entry has `secured: true`** — not because securing is wrong, but because law 2 voids decision-economy scoring on such a row, so a securing null floor is a ledger event that must not land silently. If a future contract genuinely idle-secures, the guard's failure is the intended alarm and the row gets a spec ruling, not a quiet re-pin.
4. **Report the full 35-row table** (contract, seed, secured, waves, eventLogHash) in your run report, plus total wall time.

## Firewall

Touch ONLY: `scripts/null-floor-anchors.mjs` (new), `scripts/null-floor-anchors.test.mjs` (new), `assets/contracts/null-floors.json` (new), and the single `test:node-guards` line in `package.json`.

NO changes to: `src/**` (any sim semantics — this task OBSERVES the sim and must not move it, and moving it would invalidate the very artifact you are pinning) · `assets/contracts/bench-seeds.json` · `public/skill.md` · `scripts/gr-sim.mjs` · `scripts/bench-seeds.test.mjs` · any existing e2e assertion · any other `package.json` line (no new dependency — Node's built-ins are sufficient) · **no wiring of the derivation into `playwright`, `test:node-guards`, `test:ledger-guards` or any standing battery.** That last one is load-bearing: a ~2.5-minute sim corpus inside a gate is precisely the shape that produced F-1648-1's parked 9-hour run. Only the millisecond shape-guard from scope 3 gets rooted.

The 5 non-servable contracts are explicitly OUT of scope: do not socket them, do not add them to the artifact, do not edit `SUPPORTED_CONTRACTS`.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` green; `npm run build` green (report the asset-diet line — the new JSON ships under `assets/` and must not breach a ceiling).
- `node scripts/null-floor-anchors.mjs --check` exits **0** against the artifact you just committed (prove the tool agrees with its own output).
- **Prove the `--check` mode BITES**, do not merely observe it passing: hand-edit one `waves` value in a scratch copy, run `--check` against it, show it exits **1** naming that pair, then restore. A passing checker never executes its violation path, so its green is not evidence about the red.
- `node --test scripts/null-floor-anchors.test.mjs` green; then `npm run test:node-guards` green **as a whole** (it is ~181 s and the dominant term is `gr-sim.test.mjs` — **run it ALONE**, not overlapped with another battery, or you will contaminate both).
- `node scripts/bench-seeds.test.mjs` unmodified-green.
- Report the artifact's byte size and the total derivation wall time.
- No screenshots required: this task renders nothing.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report (a) the full 35-row table, (b) total wall time and whether it matched the ~2.5 min estimate, (c) how you derived `SUPPORTED_CONTRACTS` (import vs constructor probe) and why, (d) whether any contract idle-secured, (e) the `--check` bite proof, (f) anything in the spec you found stale or under-specified — report it, do not fix it.
