# lane-survive-copy — E1 cards say "survive" where survive is the truth

Slice: `lane-survive-copy` · branch `lane/e2-arsenal` · lane tip `c922d39e` · merge-base `0ae711c9` · drained s1328
Verdict: **MERGED (path-scoped graft, 17 lane files + 2 drain-side propagation edits)**

## What it does

Owner ruling 2026-08-01, verbatim: *"keep it as it is for now and switch the word to survive"* (defeat fork = option (C) now; (A) and (B) stay banked). E1's briefing goals claimed the player must **hold** a claim — a rule the game does not have, since `endRun()`'s only gameplay caller is hero death. This slice changes the copy to state what is actually true: you **survive** to a wave.

Three E1 contracts change one goal line each:

| Contract | before | after |
|---|---|---|
| `the-claim` | "Hold the claim through wave 10." | "Survive through wave 10." |
| `e1-dry-gulch` | "Hold the gulch through wave 20." | "Survive through wave 20." |
| `e1-twin-banks` | "Hold both banks through wave 20." | "Survive through wave 20." |

`e1-twin-banks` is the line that confused the owner ("Secure the south claim"). The pause panel now asserts the full goal list rather than only the second line, so the copy is pinned in both surfaces.

## Merge classification

Base `0ae711c9`; main had **not** moved any of the three lane-touched files since the base (`git log base..main -- <files>` empty) → clean LANE-TOUCHED graft, no 3-way needed.

⚠️ **Stale-base trap avoided.** The two-dot diff (`main..lane`) showed a **fourth** file, `e2e/charter-press-totality.spec.ts` (`9 +--------`), absent from the three-dot diff: that is **MAIN-MOVED-ONLY** (s1326's F-1324-3 label-addressing fix, which the lane's base predates). A whole-branch merge or a blind copy would have **reverted** it. Taken files were enumerated explicitly; `charter-press-totality.spec.ts` was **not** taken.

Files taken (17): `assets/contracts/epoch-1-frontier/contracts.json` · `e2e/contract-briefings.spec.ts` · `e2e/pause-goal-progress.spec.ts` · 14 × `artifacts/survive-copy/*.png`.

## Drain-side propagation (2 files, 3 lines) — F-1328-2

The lane changed a **broadcast value** and did not update its consumers. Grep for the old strings found two live assertion sites the lane left stale, both confirmed red **on the merged tree** and green **on the control**:

- `e2e/locked-win.spec.ts:126,130` — asserted `'Hold the claim through wave 10.'`
- `e2e/agent-view.spec.ts:22` — the `WAVE_THREE_SNAPSHOT` byte-stable fixture embedded the same string

Both updated to `'Survive through wave 10.'` in this drain (mechanical propagation of an already-ruled change, not new scope). Filed as **F-1328-2** so the class is on the ledger.

## Evidence

All fire-side playwright runs `--workers=1` (§3.1). Both projects (desktop-chrome + mobile-chrome/390px).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in 1.75s; asset-diet within ceilings |
| `contract-briefings` + `pause-goal-progress` (slice specs) | **16/16 passed** |
| `locked-win` + `agent-view` (adjacent, post-propagation) | 12 passed / **2 failed — pre-existing, fingerprint-matched to control** |
| `072-era-activation` (adjacent) | 8 passed / **1 failed — pre-existing** |
| `profile-first-boot` + `_s106-sci-copy-boot-probe` (boot) | **14/14 passed**, zero console/page errors |

### The control runs (the part that matters)

**Main was already red before this drain, and this drain cures part of it.**

- **Control on clean main**, `contract-briefings.spec.ts`: **4 failed / 10 passed** — `all 41 card briefings…` and `board cards show the same briefing data`, both projects. **After merge: 16/16 green.**
- **Control on clean main**, `locked-win` + `agent-view`: **2 failed / 12 passed**. Post-merge, pre-propagation: **6 failed**. Post-propagation: **2 failed** — byte-identical fingerprint to the control (same test, same two projects). The 4 extra reds were mine and are cured; the 2 remaining are not mine.

## Findings

**F-1328-1 — the drill-yard merge broadcast a value it changed and left main red across three specs. 🟡 OPEN (corrective owed).**
`f0bf5251` (`runner(lane-b): lane-drill-yard.md`, 2026-08-01 08:14) added `e1-drill-yard` as a **6th** E1 contract (42nd overall) without updating any spec that asserts an E1 **census**. Measured blast radius — 7 red assertions across 3 specs:

| Spec | assertion | status |
|---|---|---|
| `contract-briefings.spec.ts:305` | `toHaveLength(41)` | ✅ cured by this drain (lane's own fix) |
| `contract-briefings.spec.ts:372` | board `toHaveCount(5)` | ✅ cured by this drain |
| `agent-view.spec.ts:266` | `expect(ids).toEqual([…5 ids])` | 🔴 **still red** (both projects) |
| `072-era-activation.spec.ts:241` | `listContracts()… toEqual(E1_CONTRACTS)` | 🔴 **still red** (desktop; mobile skipped) |

Sampling lists that merely *iterate* contracts (`release-build.spec.ts:18`, `tr-02-splat-ground.spec.ts:23`, `terrain-seamless.spec.ts:11`) are **not** red — they are coverage gaps, not assertions. `src/town/TownScene.ts:2783` carries a stale *comment* ("all 41 cards"), cosmetic.

Not fixed here, deliberately: `agent-view.spec.ts:261` requires regenerating the **derived** fixture `e2e/fixtures/e1-mechanics-manifests.json` with a 6th entry, which lands inside the AP-11 NO-UNDECLARED-MECHANICS law (hand-written manifests forbidden). That is the drill-yard drain's debt and a corrective slice, not this drain's scope. Corrective master authored: `tasks/f1328-1-drill-yard-census-debt.md`.

**F-1328-2 — a copy slice changed a broadcast string without updating its two consumers.** Cured in-drain (above). The general shape is the standing "broadcast an expected value your merge changes" drain duty; recorded because it has now fired twice in one morning (F-1328-1 is the same shape at contract-census resolution).

**F-1328-3 — every gate run rewrites shipped evidence PNGs in place, silently falsifying the record reviews cite. 🟡 OPEN (owner/attended ruling wanted).**
Specs screenshot into **tracked** directories. Merely *running* the battery dirtied **34** tracked PNGs this fire — `reviews/shots-e1-briefing-truth/` (10), `artifacts/072-era-activation` (3), `artifacts/locked-win` (4), `artifacts/profile-first-boot` (3), `artifacts/raise-at-site` (2), `reviews/shots-sci-copy` (2), plus the 12 s1327 inherited. **This explains the 12 PNGs s1327 left dirty and could not account for** ("not mine… someone should rule on them") — they are not anyone's work, they are gate byproducts. The hazard is real: those bytes are the measurements shipped reviews cite, so any fire that runs `git add artifacts/` after a gate silently rewrites the record (the same RETENTION-LAW violation F-1327-2 refused for the rename). **All 34 were restored (`git checkout --`) in this fire; only `artifacts/survive-copy/` (this slice's own new evidence) was committed.** Note this slice *partially* cures the class: it repoints `contract-briefings.spec.ts`'s `ARTIFACT_DIR` off `reviews/shots-e1-briefing-truth` onto `artifacts/survive-copy`. A general cure (per-run output dirs, or gitignored scratch) is a small slice worth authoring.

## Player-visible

Yes — E1 contract cards, the run briefing, and the pause panel. Plain no-debug boot covered (`plain no-debug board launch still briefs The Claim`, green). Gazette item appended.
