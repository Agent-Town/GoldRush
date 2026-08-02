# pc-01c — the Drill Yard's practice mechanics are DERIVED, not invisible

**Slice:** `pc-01c-drill-yard-practice-derivation` · **Branch:** `lane/m3` · **Lane tip:** `23868f4d`
**Merge:** `eec90e2b79a0ae34c37406df4e0a259798ba09f6` (main, s1386 fire, 2026-08-02)
**Gated in:** detached scratch worktree `worktrees/gate-s1386` at `0282d3fb` (§3.0b custody), pruned after.

## VERDICT: ACCEPT — merged.

## What it does

`src/game/DrillYard.ts` used to hardcode its own staging: five `TARGET_POSITIONS`, kinds assigned by
index parity, and the faucet/bell positions as `THREE.Vector3` literals. Because that staging lived in
src and nowhere in the contract, **no derivation reading only the contract could produce honest counts** —
the manifest either omitted the Drill Yard's mechanics or had to assert a hand-authored `count: 5`,
which is exactly the "id-hardcode is a manifest hole" lie AP-11 §1 forbids.

This slice is therefore ordered **lift-then-derive**, not "teach the derivation to read practice":

1. The staging moves into `practice.stations` + `practice.targets` (behaviour-identical).
2. `deriveMechanicsManifest` reads `practice` and **counts** what it finds.
3. `AUTHORED_PRACTICE_KEYS` closes the validation hole F-1385-1 found (`practice` was the one authored
   section whose inner keys were validated by nothing — a typo inside it was silently accepted).

The derived manifest now reports `straw_man ×3` and `rolling_log ×2` **because it counted them**, and
`assay_tent_faucet` / `drill_bell` with their operations, each carrying a `source` field naming the
contract path it came from.

## Evidence (all `--workers=1` — a correctness requirement of the fire shell, not an optimisation)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (built 1.09s) |
| `e2e/drill-yard-manifest.spec.ts` (new) | **2/2** — desktop + mobile |
| `e2e/drill-yard.spec.ts` **UNMODIFIED** (item 2's gate) | **4/4 (34.7s)** — matches s1385's measured baseline `4 passed (32.4s)` |
| `e2e/contract-bundle-validation` + `e2e/contract-briefings` | **16/16 (1.2m)** |
| `playwright.release.config.ts` | **26/26 (1.9m)** — **measured here, not inherited** |
| `test:node-guards` (38 files) | **226/226, rc=0** |
| `findings-state` · `blocker-panel` · `ruling-propagation` · `desk-declaration` · `ticker-stats` | all PASS |
| `e2e/agent-view.spec.ts` | 6 passed / **2 failed at `:266`** — expected, see below |

**Plain-boot / Mistake #10:** `drill-yard.spec.ts:67` ("plain boot keeps the Drill Yard visible and
launchable on both sides of the welcome") passes on **both** projects with no `?debug`, and
`contract-briefings.spec.ts:358` ("plain no-debug board launch") passes on both. Console watch reported
`0` suppressed errors across runs.

## The two reds, classified honestly

**1. `agent-view.spec.ts:266` — RED, both projects. INTENDED SUPERSESSION, not a regression.**
The assertion hardcodes a five-id list; the derivation now legitimately emits a sixth
(`+ "e1-drill-yard"`, diff confirmed). That fixture is owned by the **blocked** leaf
`f1328-1-drill-yard-census-debt` (`blockClass: "disputed"`), which this slice is firewalled out of
touching. The master pre-authorised this exact red as **a report item, not a repair item**, and named
`:266` specifically — it failed there and nowhere else, which is the discriminating check.

**2. The runner's `test:node-guards` 224/226 rc=1 — DID NOT REPRODUCE. Its lane base was the cause.**
The runner blamed a stale `fire.md` pointer to `scripts/goal-tracker.test.mjs:81`. Rather than accept
the explanation, I re-ran the battery on the merged tree: **226/226, rc=0**. The lane forked before
s1385 re-based `scripts/law-pointer-baseline.json`, which main carries and the merged tree inherits.
A red that belongs to the lane's base, not the slice — and the only way to know that was to measure it
on the tree that will actually ship.

## Verification I did not inherit

- **The lift is behaviour-identical — checked element by element, not asserted.** Old constants
  (`git show main:src/game/DrillYard.ts`): faucet `(-8,0,12)`, bell `(8,0,12)`, `TARGET_POSITIONS`
  `[-9,-9] [-4.5,-10] [0,-9] [4.5,-10] [9,-9]` with `index % 2 === 0 → straw-man` ⇒ 3 straw-man,
  2 rolling-log. New `practice` data matches **all seven positions, both station ids, and every kind in
  the same order**. The derived counts (3/2) are therefore the old behaviour, counted rather than typed.
- **Absence-grep given a positive control.** `TARGET_POSITIONS|faucetPosition = new THREE|bellPosition
  = new THREE` over `src/` returns zero — and the *same* grep over the *same* paths finds
  `stationPosition` / `practice.targets` live, so the zero is a measurement, not a dead command.
- **Containment, with its denominator.** Exactly **1 of 10** contract bundles declares `practice`
  (`epoch-1-frontier`), so the other five E1 manifests must be untouched — asserted directly by the new
  spec (lines 33–36, byte-comparison against the fixture) and corroborated by agent-view's diff showing
  only an addition.
- **The new validator is actually tested.** `drill-yard-manifest.spec.ts:38-52` clones the real contract,
  plants `practice.bogus`, and asserts both that `validateContractsBundle` throws and that
  `parseContractDescriptor` returns the exact reason object. A validator with no manufactured red is
  untested (the s1299/s1300 standard); this one has one.

## Merge classification

Base: `main` at `40296b25`. Three-dot diff vs merge-base = **exactly the five firewall files**
(`contracts.json`, `MechanicsManifest.ts`, `DrillYard.ts`, `ContractFamilies.ts`, and the new
`drill-yard-manifest.spec.ts`). Merge was clean under `ort`, **zero conflicts**. The two-dot diff's
extra paths (`STATUS.md`, `logs/*`, `law-pointer-baseline.json`, `BACKLOG.md`) are all MAIN-MOVED —
s1385's bookkeeping and this fire's own lock commit — not lane content.

**Custody (§3.0b):** all gating happened in a detached worktree; main's tree received the content only
after the verdict was ACCEPT. Test runs regenerated **19 tracked PNGs** (8 `pc-01b-drill-yard-parity`,
11 `survive-copy`) — those stayed in the scratch tree and **were never merged**, which is F-1328-3
handled by construction rather than by remembering to `git checkout --` afterwards.

## Findings

- **F-1385-1 — CURED HERE.** `practice` inner keys are now validated via `AUTHORED_PRACTICE_KEYS`
  with a planted-violation test. Filed s1385, cured in the slice that added fields to that section.
- **F-1386-1 (new, 🟡 non-blocking).** The manifest ids `assay_tent_faucet`, `drill_bell`, `straw_man`,
  `rolling_log` and ops `top_up`, `ring`, `strike` were chosen by the authoring fire to match existing
  manifest grammar. They are internal ids, never player-facing copy, so they bend no canon — but they
  are **cheap to rename only while the fixture that would freeze them is still owned by a blocked leaf**.
  An attended session may want to rule before `f1328-1` unblocks and the fixture sets them in stone.
