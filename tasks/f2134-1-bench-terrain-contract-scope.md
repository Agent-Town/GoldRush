# Task f2134-1: give F-A10-1 an instrument — measure what contract the bench's Terrain actually answers for (LANE-B, commit prefix "test:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.
READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` (the F-A10-1 row — "Engine debts filed for fires", and the A10 OLD CANAL row that raised it); `reviews/e9-old-canal.md`; `src/world/Terrain.ts`; `src/sim/HeadlessContractSim.ts`; `src/meta/ContractFamilies.ts`.

**FIRE-AUTHORED (attended review welcome).**

**SEQUENCING LAW:** none — this slice is additive and touches no shipped behaviour. But verify the premise still holds before building: `grep -Fc "return editorPreviewContract ?? ACTIVE_CONTRACT;" src/world/Terrain.ts` must return **1**. If it returns 0, the seam has moved — STOP and report "Terrain override seam not found"; do NOT improvise a replacement.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-A10-1, filed 2026-08-21 at the A10 old-canal proposal; re-measured at source by the s2134 fire before this master was written)

The BACKLOG files F-A10-1 as a **"Fire-authorable corrective"**: *"`Terrain`'s module-level `ACTIVE_CONTRACT` resolves to **`the-claim`** under SSR, so `HeadlessContractSim` tests every placement against The Claim's ground — authored `buildZones` and authored terrain are NOT enforced on the bench. Grid-probed. This re-frames the 'only buildZone within 30wu' reasoning in `reviews/e9-seed-run.md` and `reviews/e7-relay-rush.md` as BROWSER facts, not bench facts."*

**s2134 verified every link of that chain by reading the code, and then MEASURED the blast radius. All figures below are from `scripts/tmp-s2134-terrain-ssr-probe.mjs`, committed with this master — run it yourself, do not trust this paragraph:**

1. `src/world/Terrain.ts:78` — `const ACTIVE_CONTRACT = activeContract();` is **module scope**, evaluated once at import.
2. `src/meta/ContractFamilies.ts:2294` — `currentSearch()` returns `''` when `globalThis.location` is absent (i.e. under SSR/node).
3. With no `?contract=` param, `activeContractSelection()` falls through to the fallback at `:1319` = `DEFAULT_CONTRACT_ID`, which is `'the-claim'` (`:837`).
4. `src/sim/HeadlessContractSim.ts` does `import * as Terrain from '../world/Terrain';` and consumes `bounds` / `sample` / `landmarkBlockers()` (the terrain sampler triple) and `Terrain.nodeAnchors` as its harvest-anchor fallback.

**MEASURED CONSEQUENCE — 22 of the 36 contracts that declare `buildZones` have the centre of their OWN first declared buildZone rejected by `Terrain.isBuildable` under SSR:**
`e3-moth-season · e3-canyon-works · e4-dust-flats · e4-long-road · e4-gusher-county · e4-boneyard · e5-regatta · e6-showroom · e6-half-life-hollow · e6-picnic · e7-relay-valley · e7-relay-rush · e8-mare-claim · e8-far-side · e8-low-orbit · e8-eclipse · e9-dome-basin · e9-seed-run · e9-devils-alley · e9-old-canal · e10-archive-world · e10-last-claim`

⚠️ **AND THE MECHANISM IS SHARPER THAN THE FINDING'S WORDING, which matters because it changes where a cure must go.** `the-claim` declares `buildZones: []`, and `isBuildable` treats an empty list as *"buildable anywhere"* — so the divergence is **NOT** the buildZone list. It is the **terrain sample and the baked bounds**: The Claim is 64×64, and probe points like `(0,-48)`, `(-45,41)` and `(-136,-14)` are simply off its map. The bench is not applying the wrong buildZones; it is applying **The Claim's ground** to every contract in the saga.

🔍 **THE INVARIANT IS ALREADY WRITTEN DOWN AND ALREADY TESTED — ON ONE CONTRACT.** `scripts/gr-sim.test.mjs:630` asserts `Terrain.isBuildable(centre) === true` for every declared buildZone, inside the test titled *"Twin Banks consumes its declared crossings and build zones before securing at wave 20"* (`:573`). It passes honestly: `e1-twin-banks` is one of the 14 contracts whose geometry fits inside The Claim's ground. **The test is not wrong and is not to be edited — it is scoped to one contract by its own title. The defect is that nothing ranges over the other 35.**

🧩 **AN OVERRIDE SEAM ALREADY EXISTS AND IS WIRED TO THE WRONG HALF.** `previewEditorContract(contract)` (`:371`) sets `editorPreviewContract`, and `currentContract()` (`:406`) returns `editorPreviewContract ?? ACTIVE_CONTRACT`. But **21 reads in `Terrain.ts` go to `ACTIVE_CONTRACT` directly and only 7 go through `currentContract()` — and all 7 are cosmetic** (palette tint, dampTint, dampAmount, heightfield, tilePalette). Every legality-bearing read — `buildZones` (`:241`), river/ford (`:187`–`:190`), `stakeMarkers` (`:308`), `nodeAnchors` (`:167`), and the baked `CLAIM_WIDTH`/`CLAIM_HEIGHT` consts (`:85`–`:86`) — **bypasses the seam.**

**WHY THIS SLICE IS DIAGNOSTIC ONLY, STATED PLAINLY SO NOBODY READS IT AS TIMIDITY.** Routing those 21 reads through the seam would change what *every* bench number on the board means — floors, pins, admission exemptions, and the placement reasoning in at least two shipped review files. That re-baseline is a cross-cutting sim event (CLAUDE.md §3's `src/sim|systems|entities` rule), and it needs exactly the instrument this slice builds in order to be provable. **Measure first, rewire second, with the before/after in hand.** The rewire is named as the successor at the foot of this file; do NOT attempt it here.

## Scope

1. **New `scripts/terrain-contract-scope.mjs`** — an SSR probe, modelled on `scripts/same-game-audit.mjs`'s vite `ssrLoadModule` pattern (`createServer({ middlewareMode: true, appType: 'custom' })`, `await vite.close()` in a `finally`). It must:
   - resolve the SSR-baked contract id and assert nothing, only report it;
   - enumerate contracts **from the contract data itself** via `listBoardContracts()` — never a hardcoded id list, so new epochs/contracts are covered automatically the day they land;
   - for every contract declaring a non-empty `buildZones`, probe the centre of its **first** declared zone through `Terrain.isBuildable` and classify `AGREE` / `DIVERGE`;
   - additionally report the **seam census**: the count of direct `ACTIVE_CONTRACT` reads vs `currentContract()` call sites in `src/world/Terrain.ts`, derived by parsing the source file at runtime — **not hardcoded**, so it tracks the rewire when it lands.
2. **`--write-report` writes `docs/bench/terrain-contract-scope.md`** — a dated, ledger-voice report carrying: the SSR-resolved contract id, the AGREE/DIVERGE table with every contract named, the two totals, the seam census, and a short "what this means" paragraph stating the browser-fact-vs-bench-fact distinction in plain words.
3. **`--check` exits 1 when the committed report does not match a freshly derived one**, printing the differing lines — the same shape as `same-game-report-guard`. Exit 0 when current. This is what keeps the report from silently rotting (the F-2131-2 failure mode).
4. **New `scripts/terrain-contract-scope.test.mjs`** (node:test) asserting, each as its own named test:
   - `--check` is clean on the committed report;
   - the SSR-resolved contract id equals `DEFAULT_CONTRACT_ID` — i.e. the documented defect is still the live state (when the rewire lands, this test is the one that legitimately changes, and it should say so in its own assertion message);
   - the consumption sites still exist, cited **by content not coordinate**: `import * as Terrain from '../world/Terrain';` present in `src/sim/HeadlessContractSim.ts`, and `return editorPreviewContract ?? ACTIVE_CONTRACT;` present in `src/world/Terrain.ts`. If either grep returns 0 the test fails loudly with "the F-A10-1 premise has moved — re-derive before trusting this report".
5. **Root the new test FIRST in `test:node-guards`** in `package.json`, mirroring how `scripts/picnic-hold-contract-scope.test.mjs` is rooted first today. This is the §0.5 rooting decision, made here in the master: the battery is `test:node-guards`, and it is an explicit file list, so the entry must be added by hand — `gate-caller-audit` reads tracked files only and cannot see the file you just wrote.
6. **Commit the report generated on your own tree**, so `--check` is green at gate time.

**NO-OP GUARD:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

**Touch ONLY:** `scripts/terrain-contract-scope.mjs` (new) · `scripts/terrain-contract-scope.test.mjs` (new) · `docs/bench/terrain-contract-scope.md` (new) · `package.json` (the single `test:node-guards` line, to root the new test).

**NO changes to:**
- **`src/**` — ANY file.** This slice changes zero behaviour. Routing the 21 reads through the seam is the successor slice and moves every bench number on the board.
- **`scripts/gr-sim.test.mjs`.** Its buildZone assertion at `:630` is correct and honestly scoped by its own title. Widening it to range over all contracts would red 22 of them — you cannot ship a red board, and the widening only becomes lawful *after* the rewire. Reporting the divergence is this slice's job; asserting it away is not.
- **`scripts/same-game-audit.mjs`, `scripts/same-game-audit.test.mjs`, `docs/bench/same-game-audit.md`.** ⚠️ **A live lane-d task (`f2133-1-seam-legibility`) is editing all three RIGHT NOW.** Adding rows there would collide (Mistake #12). That is precisely why this slice ships a standalone reporter instead of extending the audit.
- Any contract JSON under `assets/contracts/**`, `src/meta/Balance.ts`, any existing `e2e/**` assertion, `scripts/citation-title-baseline.json`, `scripts/gate-caller-baseline.json`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `node scripts/terrain-contract-scope.mjs --check` → exit 0 on the committed report.
- `node --test scripts/terrain-contract-scope.test.mjs` → all tests pass; **report the DIVERGE count you measured** and whether it matches the 22 recorded above. If it differs, that is a finding, not a number to overwrite — say which contracts moved and why.
- **Prove the guard by manufacturing the defect (the s1299/s1300/s2133 standard — a passing guard never executes its violation path, so its green says nothing about the red it claims to own):** hand-edit one row of the committed `docs/bench/terrain-contract-scope.md`, confirm `--check` exits **1** and names the differing line, then restore the file **byte-identically** and confirm `--check` is green again. Quote both outputs in your report.
- `npm run test:node-guards` — full battery, **run ALONE** (F-1537-1/F-2099-1: it is ~405 s and overlapping batteries contaminate both). Report `pass/fail/skip` + wall time + load average. Any red must be controlled against clean main before you attribute it to this slice.
- No new e2e spec and no rendering change, so **no screenshots and no perf table are owed** — say so explicitly rather than reporting a vacuous green.

End: **READY-FOR-GATES** + report: the DIVERGE count and whether it matched 22 · the seam census numbers you derived (expected 21 direct / 7 via `currentContract()`) · the manufactured-defect red and its restore · the full-battery tally with load average · anything in the F-A10-1 premise that had moved.

---

**SUCCESSOR (do NOT build here):** *route Terrain's 21 legality reads through the existing `currentContract()` seam and have `HeadlessContractSim` call `previewEditorContract(this.manifest)` before sampling.* That slice re-baselines every bench floor, pin and admission exemption in the repo, so it needs this report's before/after, a full re-pin with named causes (F-1441-3 — never a re-pin reflex), and almost certainly an attended session to sequence it against the live admission program.
