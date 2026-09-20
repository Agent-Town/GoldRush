# ap16-4 — SAME-GAME ADMISSION: the door derives its contracts

- **Slice**: AP-16-4 (`specs/agent-play/ap-16-same-game-law.md:33`), master `tasks/lane-a-ap16-4-same-game-admission.md`
- **Branch/tip**: `lane/a` @ `6f74bf510` · base `38fc39906304cea79f7e58b5fa7166536b4cd206`
- **Merge**: `effe1057fbc55acbb13b216037ed0692bdf5a126` (main, `--no-ff`)
- **Drained**: s1643 fire, 2026-08-11
- **Verdict**: ✅ **MERGED.** All gates green on the merged tree; the one red in the battery is proven PRE-EXISTING by a main-side control.

## What it does

`SUPPORTED_CONTRACTS` in `src/sim/HeadlessContractSim.ts` stops being a hand-maintained set literal and becomes a **derivation**: `listBoardContracts()` minus contracts the browser itself cannot open (`tileParams.harvestAnchors?.length !== 0`) minus a **cited exemption table**. That is law rule 1 of the same-game spec made mechanical — *the door admits every contract the browser offers a solo player, read from the same registry the browser reads.*

The exemption table (`CONTRACT_ADMISSION_EXEMPTIONS`) is the substance of the design: five entries, each carrying a `reason` **and a `citation`** typed as `` `F-${string}` | `reviews/${string}.md` ``. The type makes an uncited exemption a compile error, which is exactly the spec's *"an exemption is a debt, not a policy"* turned into something the compiler enforces rather than something a reviewer must remember:

| Contract | Reason | Citation |
|---|---|---|
| `e3-fairground` | owner design fork — advertised crowd-flock escort has no headless consumer | `F-1475-1` |
| `e5-deepwater-claim` | measured Deepwater socket run did not reach a lawful terminal | `reviews/milk-twin-sockets.md` |
| `e5-stillwater` | same | `reviews/milk-twin-sockets.md` |
| `e6-glow-mesa` | measured Atomic socket run did not reach a lawful terminal | `reviews/milk-twin-sockets.md` |
| `e6-showroom` | same | `reviews/milk-twin-sockets.md` |

A new `admissionProbe?: true` boot option bypasses admission **for measurement only** — it is documented in-source as making no playability claim, which keeps the audit able to measure a refused contract without the audit becoming a way to launder one in.

**Reachability moved from `equal 12 · divergence 30 · not-offered 0` to `equal 22 · divergence 5 · not-offered 15`.** The door went from 12 contracts to 22.

## Evidence (fire shell, all playwright `--workers=1` per §3.1; detached worktree `gate-s1643` per §3.0b)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (built in 1.57s; asset-diet ceilings respected) |
| `e2e/ap16-4-contract-admission.spec.ts` + `er01-e2-census` + `er01-e4-census` | **18/18** desktop + 390px |
| `e2e/skillmd-door.spec.ts` + `e2e/ap-standing-orders.spec.ts` (unmodified) | **14/14** both projects, incl. plain-boot production test, zero captured errors |
| node-guards, 3 serial batches (F-1460-1: diff touches `src/sim/`) | **446 tests · 0 fail** (441 pass, 5 env skips) |
| — of which `scripts/gr-sim.test.mjs` pins | **ZERO hash drift; nothing re-pinned** |
| — of which re-aimed `skillmd-guard` door-contracts test | green, **and its positive control "the guard BITES a drifted skill.md" also green** |
| `e2e/front-door-parity.spec.ts` | red 0/4 — **PRE-EXISTING, see F-1643-1** |

### Scope 8 — the era claim was verified, not restated

The spec asserts AP-16-4 is additive and lands *inside* Season 2 without re-stamping eras, because admitting new contracts changes no existing seed's event log. The master ordered that claim **tested**, with a moved pin to be reported as a finding and never re-pinned around (F-1441-3). Measured on the merged tree: `gr-sim.test.mjs` green, **zero drift**. The additive-law premise holds; no era re-stamp is owed.

### The tautology risk s1642 named in advance — closed

Re-aiming `skillmd-guard.test.mjs` from a **source regex** to the **evaluated module** (`vite.ssrLoadModule` → `supportedContractIds()`) is precisely the move that minted F-1636-1's tautology. Both the assertion and its manufactured-defect positive control were re-run here on the merged tree and both are green, so the guard is reading a real value and still has teeth. The runner's own teeth proof (`phantom-contract` → `AssertionError ... + phantom-contract`, reverted byte-identical) is corroborated rather than inherited.

### The 10 admitted candidates (runner's table, all pass boot/first-view/terminal)

`e1-drill-yard` (4 turns) · `e10-last-claim` (5) · `e4-dust-flats` (5) · `e4-long-road` (5) · `e4-gusher-county` (4) · `e4-boneyard` (6) · `e7-relay-valley` (4) · `e8-mare-claim` (5) · `e8-eclipse` (5) · `e9-dome-basin` (6).

Final derived door (22): `e1-baron`, `e1-drill-yard`, `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e10-last-claim`, `e2-hill-mine`, `e2-incline`, `e2-pressure-garden`, `e2-trestle`, `e3-blackout-ridge`, `e3-canyon-works`, `e3-moth-season`, `e4-boneyard`, `e4-dust-flats`, `e4-gusher-county`, `e4-long-road`, `e7-relay-valley`, `e8-eclipse`, `e8-mare-claim`, `e9-dome-basin`, `the-claim`.

**The 15/15 split predicted by F-1642-1 was confirmed by measurement**, not assumed: 15 not-offered (browser-unofferable) and 15 genuine candidates, of which 5 are already-ruled refusals and 10 were attempted — all 10 admitted.

## Merge classification

9 paths, **ALL LANE-ONLY**. Main moved 16 paths since base `38fc39906` (`STATUS.md`, `src/seasons/registry.ts`, `scripts/season-registry.test.mjs`, `tasks/goals.json`, `tasks/BACKLOG.md`, the mint-season-2 review + shots, `logs/*`, `marketing/outbox/gazette-queue.md`, two e2e specs). **The intersection with the lane's 9 paths is EMPTY**, so no graft was required and none was performed. `main..lane/a` is empty after the merge.

## Findings

### F-1643-1 (REAL, non-blocking, PRE-EXISTING — not this slice's defect)

`e2e/front-door-parity.spec.ts` is **red 0/4** (both projects, both tests). The runner reported it as *"unmodified and red on stale pre-AP-16-2 upgrade assumptions"* and did not touch it — correctly, since it sits outside the firewall.

**I did not take that on trust. A main-side control was run in the gate worktree at `main` BEFORE the merge: red 0/4 there too**, same two tests, same assertion:

```
e2e/front-door-parity.spec.ts:72
expect(terminalView.now.hero).toMatchObject({ hp: 0, level: 3, upgradesTaken: { heavy_spark: 2 } })
```

So the red is inherited, not introduced, and this slice is exonerated. The likely author is the AP-16-2/2b pick-clock work (`PICK_UPGRADE` + the silence default changed which upgrades a deterministic idle run ends up holding), which would make this spec stale from `89e97e293` onward. **That attribution is INFERRED, not verified** — the control proves only that main was already red.

**Owed**: a corrective that re-baselines `front-door-parity`'s progression expectations against the post-pick-clock door, or retires the assertion if the pick clock made it meaningless. It is a stale-expectation repair, not a behaviour bug, and it is fire-authorable once a lane is free. Filed to the ladder, not the owner's desk.

### F-1643-2 (advisory — the red inventory could not answer this)

`node scripts/red-inventory-lookup.mjs e2e/front-door-parity.spec.ts` returned `NOT-IN-INVENTORY` against a **13-day-old snapshot** (threshold 7; 372 commits have touched `e2e/` or `src/` since), and correctly said so rather than implying green. The instrument behaved well; the *data* is stale, so every adjacent-suite red in this window costs a fire a full control run. Re-running `scripts/suite-red-inventory.mjs` is a cheap standing chore that would have answered F-1643-1 in one second instead of ~4 minutes.
