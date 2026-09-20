# b1-regatta-race — drain review (s2084)

- **Slice:** `b1-regatta-race` (ratified door-completion-sheet B1; owner 2026-08-20 overruled the deferral)
- **Branch / tip:** `lane/lane-c` @ `c59841c63` (`runner(lane-c): b1-regatta-race.md`, committed 2026-08-20T12:53:12+07:00)
- **Base:** `12507a20d` — which is also, exactly, the `eraStamp` the lane wrote into `null-floors.json`. Useful confirmation that the lane stamped its own base and not something inherited.
- **Merged to main:** `d13a54e5c02efba17625ab1ed7ebab2ba120fbda` (17 files, +1072 / −709)
- **Gate transcript:** `artifacts/b1-regatta-race-gate.txt`

## VERDICT: MERGED — green on every arm, with three conflicts resolved by re-derivation rather than by choosing a side.

## What it does

`e5-regatta` becomes the second contract to enter the existing deepwater socket. A dedicated
`RegattaRaceSystem` consumes the five authored gates **in order** and then the `claim-boat` finish
disc, and the secure latches only if that circuit closes **before wave 12**. The slice reuses the
water tile, Claim-Boat, storm track, weather, wrecks, corsair wave size and boat vehicle roster
rather than adding a parallel set; `fast-water` carries the declared **×1.35** positional movement
advantage, independent of storms. Admission comes from five authored near-deck `harvestAnchors`,
which move the contract through the door's own `harvestAnchors?.length !== 0` filter into
`supportedContractIds()` — the same empty-data door the Dead Band came through, not an exemption.

**RECORDED-NOT-BUILT (carried from the runner, verified in the merged tree):** competing-racer loot
has no authored roster or loot zones; manifest and census both report `competingRacerLoot:false`
and the slice invents none. That is the Vocabulary Stretch rule (Mistake #14) obeyed correctly.

## Evidence — all on the MERGED tree, in a detached worktree (`gate-s2084`, fire.md §3.0b)

| Arm | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 6.7 s |
| `npm run build` | **rc=0**, 30.7 s |
| Own spec + adjacent, desktop **and** mobile-390 | **48/48 passed, rc=0**, 289.3 s, `--workers=1` |
| `npm run test:node-guards` (mandatory: diff touches `src/sim/`, `src/systems/`) | **469 tests · 464 pass · 0 fail · 5 skipped**, 654 s |
| Null floors re-proved on the merged tree | **47/47 byte-equivalent — 1 difference, and it is only the `eraStamp`**, 222 s |
| Boot / console | `ap16-4-contract-admission` ("every derived door contract boots and emits its first view") green on **both** projects; zero page errors in the transcript |

Suites run: `e5-regatta-race`, `er01-e5-census`, `ap16-4-contract-admission`, `task-025-bandits-dont-swim`,
`m1-01-claim-jumpers-death`, `m2-01-build-menu`.

The null-floor arm is the strongest single piece of evidence here: re-running
`null-floor-anchors.mjs --check` re-simulates every door-servable bench seed, and it reported
exactly **one** difference — the stamp — meaning the Regatta's two new floors and the Dead Band's
floors hold **together**, and no pre-existing floor moved. Both new floors are `secured:false` and
the fleet still has **0 `secured:true`** floors.

## Merge classification

Base `12507a20d`; 17 files. Fourteen were LANE-TOUCHED or NEW and applied cleanly
(`RegattaRaceSystem.ts` and `e5-regatta-race.spec.ts` are new; `Game.ts`, `MechanicsManifest.ts`,
`HeadlessContractSim.ts`, `DeepwaterSocket.ts`, `DeepwaterClaimTile.ts`, the E5 contract/mask/seed
assets, `skill.md`, `door-admission-baseline.json`, `er01-e5-census.spec.ts`, `BACKLOG.md`
auto-merged — note that all three hot code files auto-merged with no conflict).

**Three files conflicted, all of them derived surfaces, and all three were resolved by re-deriving
the answer on the merged tree:**

| File | Resolution |
|---|---|
| `assets/contracts/null-floors.json` | Conflict was the **`eraStamp` only** — the floors themselves unioned cleanly. Set to the derived value `480bab1aa (archive: pruned by the A3 rewrite)` after the re-proof above, not hand-picked from either side. |
| `docs/bench/same-game-audit.md` | **Regenerated** with `same-game-audit.mjs --write-report`. A generated report is never hand-merged; the conflicted copy was discarded outright. |
| `scripts/same-game-audit.test.mjs` | Both attribution comment blocks kept (both are true history); the pins take the re-measured merged output verbatim. |

### The part worth recording — a conflict where **both sides were right and both pins were wrong**

Main and the lane had each moved the same same-game audit counters, for different reasons, against
bases that did not contain the other's work:

- **main** (via `e7-dead-band`) pinned `agent-lacks 341 / equal 779 / not-offered 14`, exemptions **5**.
- **the lane** (via the Regatta's anchors) pinned `agent-lacks 341 / equal 779 / not-offered 14`, exemptions **6**.

They agree numerically, which is exactly what makes it dangerous: the summary line **did not
conflict at all** and would have been carried through a `--theirs`/`--ours` resolution silently.
But two admissions stack, so on the merged tree neither pin is true. Re-running the audit measured:

**`agent-lacks 351 · equal 809 · not-offered 13`, 1173 rows, 42 contracts, 5 exemptions, 10 measurements.**

The Regatta contributes +10 agent-lacks and +30 equal and takes the last not-offered row, on top of
the Dead Band's own move. Exemptions resolve to **5**, not the lane's 6: the lane's 6 was correct
against its base (before `e2-pressure-arsenal-headless` took `e2-hill-mine` out, 6 → 5) and is
simply stale here — and the Regatta moves no exemption at all, because it was never in
`CONTRACT_ADMISSION_EXEMPTIONS`. The comment block records this reasoning at the pin site so the
next reader does not have to re-derive it.

## Findings

- **F-2084-1 (non-blocking, cured in this drain).** The `b1-regatta-race` BACKLOG row asserts
  `not-offered 15→14`, `exemptions unchanged at 6`, `agent-lacks 341 / equal 779`. All four figures
  were true against the lane's base `12507a20d` and are false on main as merged; the row is
  corrected in this commit to the measured `351 / 809 / 13` with exemptions `5`. **This is the
  generic hazard of a corpus-count pin authored on a lane: it is measured against a base that the
  merge, by definition, moves.** No mechanism proposed — the existing guard already re-derives the
  counts live and would have reddened, which is precisely how this was caught.
- **F-2084-2 (non-blocking, observation).** The lane's own attribution ("contributes 10 equal rows
  and 10 agent-lacks rows") under-counts the equal delta on the merged tree (+30, not +10). Not a
  defect in the slice — it is the same stale-base artifact as F-2084-1 — but it is why the merged
  comment states the measured deltas rather than reusing the lane's prose.

## Where does the PLAYER see this, in a plain boot? (Mistake #10)

`e5-regatta` is a door contract: it is offered in the browser's own contract list without `?debug`,
and `ap16-4-contract-admission` asserts it boots and emits a first view on desktop and at 390px.
The race itself is player-visible as the five ordered gates and the return-to-Claim-Boat finish.
