# lane-a — F-1314-3 + F-1314-4: the stockpile got a tier and nobody taught the UI to say so

**FIRE-AUTHORED (attended review welcome) — s1314, 2026-08-01.**
**Role:** implementer. **Workdir:** `worktrees/lane-a` (branch `lane/m3`). One task, one branch, path-scoped commits.

## READ FIRST (paths, in this order)

1. `reviews/bt-02b-stockpile-tiers.md` — the drain that spawned this, findings **F-1314-3** and **F-1314-4**.
   Do not re-litigate the measurement; it was verified at source.
2. `src/systems/BuildSystem.ts:1990-2001` — **both** helpers, read together. `tierGain` (`:1990`) and
   `upgradeFloatText` (`:1996`) have the identical shape: an `if` for `palisade`, an `if` for `sluice`, and a
   **bare `return` that is silently the turret's text**. Note the call sites: `upgradeFloatText` at `:1254`,
   `tierGain` at `:1931`. ⚠️ **These coordinates were measured s1314 and drift whenever anything above them
   moves — find the symbols by name, and if a coordinate misses, trust the name.**
3. `src/game/buildables.ts:181-196` — `buildableTierEffectLine`, same shape, three explicit branches
   (`palisade` / `sluice` / `turret`) and no stockpile. Read what each branch *returns* — the format is
   `T<n>: <value>` and each one computes from `Balance.tiers.<id>[tier - 1]`.
4. Its **two** consumers, both of which a player can see: `src/systems/BuildSystem.ts:528` (the build-menu
   card's `tierLine`) and `src/encyclopedia/registry.ts:353` (the encyclopedia entry).
5. `src/game/Balance.ts` — the new `Balance.tiers.stockpile` rungs (`capMult 1 / 1.6 / 2.4`) and
   `Balance.stockpile.capBonus`. **Read them; do not retype the numbers into a string.**
6. `e2e/bt-01-tiers.spec.ts` — the suite you extend. It already contains the bt-02b stockpile case.

PRE-FLIGHT (LANE-SAFETY invariant): `node scripts/lane-usable.mjs lane-a` must print **USABLE**. If it prints
AHEAD-BUT-ABSORBED, HOLDS, DIRTY or BUSY: **STOP** and report the word verbatim. Dirty tracked blobs must be
reachable in git, else STOP.

## WHY (measured s1314 at the bt-02b drain, verified at source)

bt-02b (`5528331e`) made the Stockpile Yard the **fourth** upgradeable buildable by adding it to
`upgradeableBuildableIds` and `isUpgradeableBuildable`. That was correct and its cap maths is proven. But
three sibling helpers encode "which buildable is this?" as a **hand-maintained branch list with a turret
fallback**, and none of them gained a fourth branch. So today, on main:

- A player who buys a Stockpile tier sees the float text **`Turret II - brass cadence quickens`**. Verified:
  `upgradeFloatText:2000` is the fallback and `:1254` calls it inside `upgradeBuilding`, the path bt-02b just
  opened. **Before that merge this was unreachable for a stockpile; now it is the normal case.**
- The build-menu card and the encyclopedia both show **no tier effect line at all** for the stockpile, because
  `buildableTierEffectLine` returns nothing for it — while the in-world context card correctly reads
  `Stockpile Yard · Tier N`. So the two surfaces disagree.

**The class, not the instance:** this is one defect — *a per-buildable branch list gained a member without
gaining a branch* — wearing three faces. Fixing only the float text would leave the player half-informed;
that is why F-1314-3 and F-1314-4 ship together.

⚠️ **`tierGain` is the UNVERIFIED one.** The bt-02b runner reported that its returned `gain` string is "not
currently rendered". **s1314 did not confirm that.** Your scope 1 is to *find out*, not to assume — and the
answer changes what you do (see below). A fix shipped on an unchecked premise is the thing this factory keeps
finding in its own history.

## SCOPE (numbered; each item testable)

1. **Determine whether `tierGain`'s output reaches a player.** Read `:1931` and trace what consumes the object
   it builds. Write the answer, with the file:line you read, into the run report **before** editing anything.
   - If it **is** rendered: give it a stockpile branch too, same as the others.
   - If it is **not**: leave the string alone and say so in the report. Do not "fix" dead text.
2. **`upgradeFloatText` gets a stockpile branch.** Match the existing cadence exactly — the shape is
   `<Name> <Roman numeral> - <lowercase clause>` (`Sluice II - the works run richer`,
   `Palisade II - timber holds longer`). The clause must be frontier-plain and describe **what the player
   gained: the yard holds more gold**. ⛔ Canon (`docs/GOLD_RUSH_BRIEF.md` §9): frontier-tech only, no
   firearms, warm and never gory. ⛔ Do not invent a new name — the buildable is the **Stockpile Yard**.
3. **`buildableTierEffectLine` gets a stockpile branch**, in the same `T<n>: <value>` format as its three
   siblings, computing from `Balance.stockpile.capBonus` and the rung's `capMult` — **read the numbers from
   `Balance`, never hard-code them**, and round the same way `BuildSystem` does for the cap
   (`Math.round`), so the menu cannot disagree with the live Economy cap.
4. **After the turret fallbacks have four branches, make the fallback honest.** In each helper you touched,
   the bare `return` is now reached only by `turret`. Make that explicit (an `if (id === 'turret')` with the
   existing string, or an equivalent that a reader cannot mistake). **This is the actual bug — the next
   archetype must fail loudly, not silently inherit the turret's voice.** If your change makes an exhaustive
   check possible at compile time, prefer that.
5. **Extend `e2e/bt-01-tiers.spec.ts`** with one case, both projects, asserting: upgrading a stockpile floats
   text naming the **Stockpile**, and the build-menu card shows its tier effect line. ⛔ **No existing
   assertion may be edited, loosened, skipped, or have its timeout raised.**

## TOUCH-ONLY

- `src/systems/BuildSystem.ts` — **only** `tierGain`, `upgradeFloatText` (and scope 1's read of `:1931`).
- `src/game/buildables.ts` — **only** `buildableTierEffectLine`.
- `e2e/bt-01-tiers.spec.ts` — additive only.
- `artifacts/f1314-3-stockpile-tier-voice/report.md` + screenshots.

## NO (firewall — report, do not fix)

- ⛔ **No `Balance` value changes.** The tier costs and `capMult`s are ratified by the bt-02b drain. You are
  writing *words about* numbers, not numbers.
- ⛔ No changes to the cap write sites, `Economy.ts`, `Upgrades.ts`, `ResearchChart.ts`, or the
  `upgrade:stockpile_cap` research source. The cap maths is proven; do not touch it.
- ⛔ No steal-pressure coupling (design-adjacent, firewalled out of BT-02b for the same reason).
- ⛔ Do not repair the two known-red `bt-01-tiers` assertions (`Enter tears down after clicking upgrade…`,
  `insufficient gold leaves tier and gold unchanged`) — they are **pre-existing**, fingerprinted at merge-base
  by the s1314 drain. Expect them red. Report them, change nothing.
- ⛔ Do not touch `e2e/m2-04-gold-stealing.spec.ts`. Its `:226` red is the documented F-1156-2 budget
  assertion with an **owner-gated** cure (F-1131-3/F-1131-5). Widening it is forbidden by standing law.
- ⛔ Do not restructure the upgradeable-ID registries or introduce a shared per-buildable text table. That is a
  real refactor and it needs its own slice — **report it as a finding if you think it is warranted.**

## SELF-CHECK (name the exact evidence)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/bt-01-tiers.spec.ts --workers=1` **both projects** — your new case green; exactly
  the two known reds above still red and **no others**. `--workers=1` is mandatory (§3.1, F-1270-1).
- Adjacent, by consumer: `npx playwright test e2e/m2-01-build-menu.spec.ts --workers=1` (the menu card) and
  the encyclopedia suite if one covers `registry.ts` — **derive it by grep, do not guess.**
- `node --test scripts/*.test.mjs` equivalent of `test:node-guards` — 203 passed expected.
- Plain boot, no `?debug`, desktop **and** 390 px: zero console/page errors.
- **Mistake #10 answer, in the report:** where does a player see this, in a plain boot? Screenshot the float
  text and the menu card at desktop and 390 px into `artifacts/f1314-3-stockpile-tier-voice/`.
- Collection arithmetic: report `playwright test --list` before and after (expect `+1` test × 2 projects).

**READY-FOR-GATES** — report: scope 1's answer with its file:line, the four branch sites you touched, the new
strings verbatim, the two expected reds, and anything you were forbidden to fix but think matters.
