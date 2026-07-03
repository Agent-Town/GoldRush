# Review — m1/06-level-up-choices

**Verdict: PASS** (Codex implementation + supervisor test-formulation fixes + one systemic harness fix; no Codex correction round).
Codex session F: `019f277f-e96a-7513-8a9a-30b4442485de` (~14 chunks; same write-phase pattern as m1-05 — low reasoning + "write NOW" nudges).

## What shipped

- `src/game/Upgrades.ts` — the 9 defs verbatim (ids/effects/max from spec README), patent-office flavor lines ("Thin brass mercy, fitted under the coat."), weight hook = 1 (07 tunes).
- `src/game/StatSheet.ts` — stack counts → pure `effectiveStats()`; additive stacking is the single rule.
- `src/game/Progression.ts` — sole StatSheet writer; `need(L) = 12 + 8(L−1)` (Balance.xp.needBase/needStep); cumulative-XP consumption from `combat.xpCount` (single XP truth; X debug enters the same counter); pendingLevels queue with sequential offers; `rollOffer` seeded (`seed:upgrades` stream), 3 distinct, eligibility = not-maxed ∧ dynamo-needs-beacon; `applyUpgrade` validates id ∈ offer → stacks+1 → broadcast → resume or next choice; `reset()` rebroadcasts base.
- Stat routing (explicit broadcast, no polling): Game mutates the kept `heroShooter` handle (cooldown/damage/range/projSpeed/volley from Balance × stats), `Hero.applyStats + heal` (plating heals 25 per pick), `HarvestSystem.applyStats` (tick/capacity/respawn), `BuildSystem.applyStats` (live cooldown mutation on registered beacon handles + future placements — beacon_dynamo works through the one combat path).
- `src/ui/UpgradeOverlay.ts` — DOM-only, DeathOverlay mount pattern, 3 parchment cards (name, flavor, stack pips, teal 1/2/3 badges), click or Digit1/2/3, offer-key dedup (no per-frame DOM churn), HTML-escaped, aria labels, focus on card 1.
- GameState: 'levelup' transitions existed since M0 (`simActive` false, pause guarded) — zero changes needed; wave clock freezes for free via the unified sim clock.
- HUD XP truth from Progression (level, xpInto/xpNeed) — the 02-era "21 / 12 XP" overflow display is gone.
- `__GR_TEST__.grantXp` + `placeBeacon` (routes through BuildSystem.confirm → Economy — sole-spender preserved); diagnostics `progression: {level, xpInto, xpNeed, pendingLevels, offer, stacks, stats, eligibility}`.
- **`?nolevel` debug param (supervisor, systemic):** m1-06 legitimately changed sim semantics under older suites — mid-swarm kills now freeze the sim with an offer, which deadlocked m1-01's death test (caught by full regression) and made m1-02's kill-count tests race mote pickup. `isLevelUpDisabled` joins the `nowaves/nokill/nospawn` family (XP math intact, choice overlay suppressed), injected into Progression like WaveSystem's `areWavesDisabled`; pre-06 combat tests opt in via URL.
- `e2e/m1-06-level-up-choices.spec.ts` — 8 tests: freeze (enemy count + wave clock + timeAlive static across 500 ms), pick→stacks→resume with the un-drift identity `Δ(nextWaveInSim) ≡ Δ(timeAlive)`, seeded offer determinism across two page loads, no-duplicate sampling, maxed-leaves-pool (forced double_tap_coil to 3 then 3 clean offers), beacon_dynamo gating (absent pre-beacon + eligibility flip after placement), Split Spark live double-bolt via in-page rAF max-tracker, resetRun restores level 1 / 0-12 XP / base stats / HUD.

## Supervisor fixes (test formulations, in-commit)

- Freeze/drift asserts originally compared against a pre-keypress sample — sim legitimately advances between sample and keypress (0.45 s at ×3); replaced with the frozen-window identity and the Δ≡Δ un-drift invariant.
- `debugLevel` presses X until threshold crossing — `need(L)` outgrows a single 50-XP grant around L6.
- Split Spark bolt-visibility: 4-pack-on-hero was the swarm-death coin flip (hero died mid-assert, probed via page snapshot); now single Jumper at r8 + in-page rAF max sampler (double bolt lives ~1 headless frame — protocol polling can't see it).

## Findings / notes

1. **split_spark semantics**: implemented as +1 bolt to the SAME target (volley through the existing single combat path) — README's flavor says "at next-nearest target", which would require a targeting change the slice firewalled ("no new combat mechanics beyond volley"). Accepted for M1; flag for the 07 feel pass — Robin should say whether same-target double-shot feels right.
2. The determinism test runs two pages against one vite server — fine serially; don't parallelize this file.
3. Mobile (390px): cards stack readably; the ?debug lil-gui overlaps card 1 (debug-only, not a play-mode issue). Real-play mobile shot deferred to the 07 pass.
4. Death overlay + upgrade overlay are both in DOM permanently (hidden) — aria snapshots list them; don't mistake that for visible state when debugging (bit me twice this session).

## Evidence (GATE-STD)

- tsc clean; build green.
- **Full regression 38/38** — visual 5, feedback-fx 3, m1-01 4, m1-02 3, m1-03 5, m1-04 4, m1-05 6, m1-06 8; serial desktop-chrome on final state. The m1-01/m1-02 fixes are semantic opt-ins (`&nolevel`), not softened asserts — the death test still dies, the kill tests still count kills.
- Draw calls: overlay is DOM-only; renderer untouched (m1-01 stress gate re-passed: ≤200 budget upheld).
- Screenshots (`reviews/shots-m1-06/`): `desktop-levelup-cards.png` (Patent Office / three parchment cards / pips / teal badges / focus ring — readable and on-canon), `desktop-second-offer-pips.png`, `mobile-levelup-cards.png`.
- Playable checkpoint: kill → mote → level → freeze → pick (1/2/3 or click) → visible run change (volley 2 provable live; XP bar shows within-level progress); death→restart resets progression fully.

## Deferred

- Upgrade weights (all 1) + split_spark next-nearest question + card hover/pick flourish → m1-07.
- beacon_dynamo offer-frequency feel (gated correctly; whether it FEELS findable needs the tune gate).
