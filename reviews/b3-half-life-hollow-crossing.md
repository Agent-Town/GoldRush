# b3-half-life-hollow-crossing — drain review (s2091)

**Slice:** B3 Half-Life Hollow crossing (`e6-half-life-hollow`) · **Branch:** `lane/d` · **Lane tip:** `2c222f191`
**Base:** `4fb04ef6c` (main at drain time, already carrying b7 from this same fire) · **Merge:** `68011ece8`
**Gate worktree:** `gate-s2091` (detached, §3.0b) · landed as ONE atomic ref update, never staged (F-1589-5)

## VERDICT: MERGED + ADMITTED — gates green on the merged tree, all eight conflicts resolved by measurement.

## What it does

The Half-Life Hollow is crossed, not merely survived. Two **glow bridges** flank one central
**causeway**; the authored route is *south launch shelf → a declared bridge or the causeway → the
north extraction radius*, and **direct extraction is refused**. The glow bridges deal **1 HP/s per
rider, independently**; the causeway is radiation-safe. That is the trade the map asks: the safe
road is the long one. Both engines share the objective latch, so the headless door and the browser
agree on what winning means.

**ADMITTED, on its own evidence.** Both bench seeds secure at wave 20 under public verbs alone
(`fnv1a32:6204c6d0` / `fnv1a32:61359a06`), twice each. The idle floors stay honest: unsecured deaths
at waves 17 and 20 (`fnv1a32:5e7517ff` / `fnv1a32:1b1e7157`), **zero `secured:true`**. The
pre-build pool-disease measurement is preserved for contrast (honest deaths, w19 `b417ad11` /
w5 `8d2a865c`).

## Evidence (all measured on the MERGED tree, `--workers=1` serial per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, 8.5s |
| `npm run build` | green, 32.6s |
| `e2e/e6-half-life-hollow-crossing.spec.ts` + `er01-e6-census` + `ap16-4-contract-admission` + `e6-showroom-capture-quota` | **22/22** passed (56.0s), desktop + 390px mobile, incl. both plain boots |
| Adjacent — shared secure/reset/diagnostics chain: `e7-relay-rush-front`, `e7-echo-canyon-mirror`, `e8-far-side-probe`, `e9-seed-run-caravan` | **24/24** passed (2.0m) — see the flake note below |
| `npm run test:node-guards` | **469 tests / 464 pass / 0 fail / 5 skipped**, rc=0, 572.2s, run alone |
| `nul-audit` | **CLEAN** — the lane's known red does not survive the merge (see below) |
| Plain-boot console/page errors | **zero**, desktop + 390px |
| Same-game audit stack | **463 / 977 / 6 over 1446 rows**, 7 exemptions, door **29** |

**The b7 spec was included deliberately.** b7 merged earlier in this same fire, so b3's merge is the
first tree where both live together; its 6 tests are a regression check on my own previous drain,
not padding.

**Screenshots:** `reviews/shots-b3-half-life-hollow-crossing/` — `{desktop,mobile}-chrome-plain-boot.png`
(the contract card as the player first meets it: *"A south-to-north hollow of two glow bridges, one
central causeway, and two middle shelves"*, with the four authored rules) and
`{desktop,mobile}-chrome-crossing.png` (card dismissed). **Stated honestly: the camera opens on the
south launch shelf, so these frames show the shelf, the Prospector, the claim stake and the flanking
bridge geometry at the frame edges — they do NOT show the whole span.** They are evidence that the
crossing renders in a plain boot with zero console errors, which is the Mistake #10 question; they
are not a composition review of the map.

### The one red, and why it is a flake rather than a regression

The first run of the four sibling objective suites returned **23 passed / 1 failed** —
`e9-seed-run-caravan.spec.ts:137` on mobile-chrome. It was **not** waved away:

1. **Isolated re-run, same tree, `--workers=1`: PASSED** (11.6s).
2. **Full four-suite batch re-run, same tree, same flags: 24/24 PASSED** (2.0m, versus 2.9m for the
   red run — the slower wall is consistent with contention on the red run).
3. That same test passed **24/24 in this fire's earlier b7 gate**, on the tree b3 was merged onto.

Red once, green three times across two different framings on the identical tree. Recorded rather
than hidden, because "it passed alone" is exactly the excuse pattern that let F-1460-1 sit red for
five fires — the distinguishing fact here is that the *full batch* went green on repeat, not merely
the isolated test.

### The lane's `nul-audit` red was a stale-lane artifact — verified, not inherited

s2090 predicted this red would be false. I re-measured rather than trusting it:
`artifacts/proto-pool-recycle/diff-floors.mjs` is **3293 bytes with a raw NUL on `lane/d`** and
**3298 bytes clean on `main`**, and `git diff --name-only main...lane/d` does **not** list that file
— so b3 never touched it, main's fixed version wins the merge automatically, and the red cannot
survive. Confirmed by outcome: `nul-audit: CLEAN` in the merged battery.

## Merge classification

Base `4fb04ef6c`; lane/d was **30 behind**, and main had moved twice more during this fire (the A3/A5
layers plus my own b7 merge). **Eight conflicts** — several are decay from draining a pile in order,
the known hazard, not lane misbehaviour.

**Auto-merged, LANE-TOUCHED only:** `artifacts/e6-half-life-hollow/prover.mjs` (new),
`assets/contracts/epoch-6-atomic/contracts.json`, `e2e/e6-half-life-hollow-crossing.spec.ts` (new),
`public/skill.md`, `scripts/door-admission-baseline.json`, `src/meta/ContractFamilies.ts`,
`src/systems/HollowCrossingSystem.ts` (new), `src/vite-env.d.ts`.

**CONFLICTED — eight hunks:**

1. **`src/game/Game.ts` ×1** — BOTH-MOVED in the run-reset chain. Main added
   `this.broadcastMirror.reset()` (A3); lane/d added `this.hollowCrossing.reset()`. Independent
   system resets. **Both kept.**
2. **`src/sim/HeadlessContractSim.ts` ×1** — BOTH-MOVED in the spread-if-declared diagnostics block.
   Main added `interferenceFront` (A5), lane/d added `hollowCrossing`. Both are `isDeclared`-gated,
   so each is ABSENT on contracts that do not declare it and **no pinned hash moves either way**.
   **Both kept.**
3. **`src/agent/MechanicsManifest.ts` ×2** — the import line and the rules block. Main's
   `ShowroomCaptureObjective` import (my b7 merge, minutes earlier) versus lane/d's
   `HOLLOW_EXTRACTION_RADIUS` / `HOLLOW_GLOW_DAMAGE_PER_SECOND`; then the `showroom_capture_quota`
   rule-push versus the `hollow_crossing` rule-push. Independent contract-rule blocks. **Both kept**,
   with the `}));`/`}` closing restored around each so both `if` blocks stand.
4. **`e2e/er01-e6-census.spec.ts` ×2** — the expected-rules table and the admission prose. Showroom
   gains `showroom_capture_quota` (b7) and Half-Life Hollow gains `hollow_crossing` (b3). **Both rows
   kept, both prose blocks kept.**
5. **`assets/contracts/null-floors.json` ×1** — only the `eraStamp` line conflicted. Resolved to
   **main's** (`1817cb273`); the stamp is *derived* (`null-floor-anchors.mjs` computes it from
   `git merge-base HEAD main`) and the attended ruling of 2026-08-20 calls this drift benign. Lane/d's
   **19 new floor lines auto-merged and are present** — verified by probing the merged file for
   `half-life-hollow`, not assumed.
6. **`tasks/BACKLOG.md` ×1** — my own b7 ship row versus b3's completion row. **Both kept.**
7. **`docs/bench/same-game-audit.md` ×38** — generated; **REGENERATED** on the merged tree per the
   generated-report law.
8. **`scripts/same-game-audit.test.mjs` ×2** — the audit pins. Treated at length below.

### The audit pins — re-pinned with a named cause, and predicted before measured

This is the file where a lazy resolution ships a silent red. Main pinned **453/947/7 at 7
exemptions** (post-A3+A5); lane/d pinned **422/938/8 at 6** (measured on a pre-A3/A5 base).
**Neither describes the merged tree** — the sixth recurrence of the F-2084-1 shape in one day, and
exactly the "two lanes can pin the same wrong count and git sees no conflict" hazard, except that
here git *did* conflict, which is luck rather than protection.

Per F-1441-3 a re-pin needs a **named cause**, never "make the red go away". The cause: the Hollow's
four authored `harvestAnchors` take it through the same data-derived door every layer above came
through, worth one contract — `+10 agent-lacks, +30 equal, −1 not-offered, +39 rows`.

**I wrote the prediction down before running the generator: 463 / 977 / 6 over 1446 rows, 7
exemptions.** The regen returned **exactly** that, and `--json` confirmed `exemptions: 7`,
`measurements: 10`, `not-offered rows: 6`. The exemption count does **not** move, for the reason the
Echo Canyon note records: the Hollow was never in `CONTRACT_ADMISSION_EXEMPTIONS`, it was excluded by
empty data — a different door — and unlike Relay Rush and the Seed Run **it secures**, so it enters
the **door** (28 → 29) rather than the exemption table. The crossing consumer is a mechanics RULE and
adds no audit row, the fourth consecutive layer to find that shape.

## Findings

**No blocking findings.**

**Recorded, not a finding — the lane's dismissed review suggestion was dismissed correctly.** An
independent review of b3 pressed for a *mandatory* centre route. The runner declined, citing that the
ratified task explicitly permits causeway **or** bridge alternatives. That is the right call and the
right reason: the choice between a safe long road and a fast irradiated one **is** the slice's
design, and mandating the centre would delete it. Generator proposes, contract disposes.

## Goal leaf

`b3-half-life-hollow-crossing` → `status: "merged"`, `mergeHash: 68011ece84e21d1c4c570597a5aa1a486c333c1c`.
