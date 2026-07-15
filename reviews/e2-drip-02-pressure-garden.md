# Review — e2-drip-02-pressure-garden (RE-LAND attempt, s584 fire)

**Slice/branch/tip:** drip-02 pressure-garden · salvage source `lane/e2-arsenal @1e057810` (real drip-02: contract JSON +161, spec +151, screenshots) · re-land target = fresh `main @f8efb73e`
**Verdict:** ⛔ **HOLD — NOT MERGED.** Contract + spec are **engine-verified-ready in isolation**, but the drain lands into an attended-owned contract-board test surface that (a) needs a design answer for one new red and (b) already carries 5 pre-existing reds from attended's `172143e5` e4/e5 epoch additions. A fire must not resolve the design question blind (Mistake #12, §7.6).

## What it does (player-visible)
Adds **"The Pressure Garden"** (`e2-pressure-garden`) — the 3rd Steamworks contract, unlocked by `secured:e2-trestle`. A geothermal terrace map: 3 boiler beds + 4 stepped terraces + one clean water band; twist `pressureEnabled:true`, secureWave 12; roster rail_tough (S) / steam_wrecker (E+W) / coal_thief (N). Teaches the pressure/coal/boiler loop (keep ≥2 boilers hot through waves 8–12).

## Evidence (what s584 actually ran — all green)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` (spec imports src) | ✓ clean |
| `npm run build` | ✓ built 656ms |
| `e2-pressure-garden.spec.ts` **desktop-chrome + mobile-chrome** | ✓ **2 passed (7.7s)** — main's generalized pressure engine + this contract produce the asserted seams `[{-12,39},{-5,43},{3,39}]`, coal=4, hotBoilers=3, objective.complete=true, run.secured=true |
| contracts.json parse | ✓ 3 contracts (hill-mine, trestle, **pressure-garden**) |

→ The contract data and spec are **correct and engine-compatible on current main**. The re-land content itself is sound.

## Findings
### F-1 (BLOCKER, needs owner/attended design answer) — board-gating muted count 3→2
`e2e/board-gating-and-profiles.spec.ts:82` `expect(mutedDots [data-contract-playable="false"]).toHaveCount(3)` → **receives 2** once the real contract is present. On clean main pressure-garden shows as a **muted upcoming-survey** dot (part of the 3); adding the real contract flips it out of the muted set.
- ⚠ **The seed (`seedProfile(page,'epoch-2-steamworks')`) has NO trestle win** (fresh profile, no scoreboard). Yet the muted count drops as if pressure-garden became **playable** — its `unlock:"secured:e2-trestle"` gate is UNMET here. The passing pressure-garden spec only unlocks it *after* `seedTrestleWin()`. So `toHaveCount(3)→(2)` is **NOT a confident blind fixture bump** — it may be masking an unlock-gate / survey-accounting interaction. **Needs attended/design confirmation of the intended fresh-epoch-2 board state before the count is changed.**

### F-2 (NON-BLOCKING, fingerprinted PRE-EXISTING — attended `172143e5` debt, NOT this slice)
On **clean main (no pressure-garden)**, these 5 already fail — proven by reverting the contract and re-running:
- `sci-04-contract-registry.spec.ts:59` — registry now lists **`epoch-4-motor` + `epoch-5-deepwater`** (added by `172143e5`); test expects only `[frontier, steamworks, voltage]`. Pure e4/e5 fixture debt.
- `sci-04-contract-registry.spec.ts:123`, `board-upcoming-surveys.spec.ts:44`, `contract-briefings.spec.ts:259`, `e2-pressure-economy.spec.ts:94` — same contract-board suite, red on clean main independent of pressure-garden.
These are the `audit-drip-data-path` paradox territory (task 647cd7a4, deleted from queue by `172143e5`). **Attended owns them.** They should go green before / alongside landing any new epoch-2 contract, so board-gating's F-1 count can be judged against a stable suite.

## Re-land recipe (for the session that lands it once F-1 has a design ruling + F-2 clears)
1. Salvage source is `lane/e2-arsenal @1e057810` — cherry-pick CONTENT only (stale base; a blind merge REVERTS `172143e5`).
2. `git checkout lane/e2-arsenal -- e2e/e2-pressure-garden.spec.ts` (new file, clean).
3. Insert the `e2-pressure-garden` contract object into `assets/contracts/epoch-2-steamworks/contracts.json` (append to `contracts[]`). **Do NOT** apply the lane's stale `-pressureEnabled:true` deletion at the hill-mine/trestle twist (main's pressure-generalize already added it).
4. Update `board-gating-and-profiles.spec.ts:82` per the F-1 ruling (muted 2 vs 3).
5. Gate: tsc + build + `e2-pressure-garden` desktop+mobile (proven green) + the F-2 five green + boot probe.
6. GZ item on merge (new playable contract = player-visible).

## Working-tree note (s584 residual — git-unstage was sandbox-gated this fire)
Left staged/untracked, RECOVERABLE, source-of-truth is the lane branch:
- `A e2e/e2-pressure-garden.spec.ts` (staged; `git reset` + `rm` were all gated for this headless fire)
- `?? artifacts/e2-pressure-garden/*.png` (untracked gate evidence)
Next fire/attended: `git reset e2e/e2-pressure-garden.spec.ts && rm e2e/e2-pressure-garden.spec.ts` (or land it per recipe). Main's **committed** tree is clean — only the STATUS lock landed.
