# b4v2-picnic-stake-pressure — the ruled pressure works; the hero pins its own stake

**Slice:** `b4v2-picnic-stake-pressure` · **branch:** `lane/b` · **tip:** `1731de225026ba6f0fc8fcf8a42e3586315a1a08`
**Run log:** `tasks/runs/20260820-205454-lane-b-b4v2-picnic-stake-pressure.md.log` (3.1 MB, 288,359 tokens)
**Evaluated by:** s2090, read-only (`git show lane/b:<path>`) — no checkout, no merge, main's tree never touched (§3.0b)
**Merged to main:** **NO — Law-2 STOP by the runner, upheld.**

## VERDICT: HOLD — NOT MERGED. The STOP is correct, and the residual defect is STRUCTURAL, not a tuning gap.

The runner stopped itself under the master's own honesty guard, exactly as instructed
(*"if idle STILL survives, STOP per Law 2 and report the mechanism"*):

> 25% stake pressure is implemented, but current-main synthetic idle runs still secured both
> seeds at wave 20: `6d306221` / `612de94b`. Even 6.25% still false-secured seed 01 because the
> hero permanently contests west. Pressure WIP preserved; admission changes reverted.
> TypeScript and focused tests: 7/7 green.

**The runner did the right thing twice over** — it swept four weights rather than shipping the
first one, and it refused to buff past its own acceptance test (Mistake #14, reject-don't-stretch).

## The owner's ruling landed and WORKS — it just answers only half of F-2085-1

The v1 review named **two** independent mechanisms behind the unloseable objective:

1. enemies target only the hero, so centre/east discs are never entered — **CURED.** The ruled
   pressure weight routes a minority of each wave onto undefended stakes, and centre and east
   now fall on both seeds.
2. *"the hero's body permanently contests west"* — **UNTOUCHED by the ruling, and untouchable by
   any weight.**

The owner ruled `(1) yes` on the question that was put to them (*"should enemies also press
undefended stakes?"*). That ruling was implemented faithfully and is a real improvement. It was
simply never the binding constraint.

## Why NO pressure weight can ever cure this — proven from the data and the code, not from the sweep

Verified this fire by reading the lane's own sources, not inherited from the run report:

| Fact | Source (on `lane/b`) |
|---|---|
| All three stakes carry `heroStart: true` | `assets/contracts/epoch-6-atomic/contracts.json` — `sandwich-west` (-16,18), `sandwich-center` (0,26), `sandwich-east` (16,18) |
| Hero start = the **first** heroStart marker, deterministically = `sandwich-west` | `HeadlessContractSim.ts:388` + `:1463`, `Game.ts:8783` — `stakeMarkers?.find((m) => m.heroStart)` |
| The hero is unconditionally a **defender** | `HeadlessContractSim.ts:945–948` — `picnicDefenders[0] = { position: this.hero.group.position }` |
| A defended stake's claim timer resets to 0 every tick | `PicnicHoldSystem.ts` `update()` — `timer = enemyPresent && !defenderPresent ? timer + delta : 0` |
| Loss requires **every** stake claimed | `PicnicHoldSystem.ts` — `this.stakes.every(({ claimed }) => claimed)` |

⇒ The hero spawns at distance **0** from `sandwich-west`, well inside `PICNIC_HOLD_RADIUS = 3`.
An idle hero never moves. Therefore `sandwich-west` is contested on every tick it is alive,
therefore it can never be claimed, therefore `lost` can never become true.
**While the idle hero lives, the hold objective is unloseable — at any enemy pressure weight.**

### And the tuning direction is INVERTED, which is why the sweep looked non-monotonic

`pressureTarget()` deliberately excludes defended stakes:

```ts
const undefended = this.stakes.filter((stake) => !stake.claimed
  && !defenders.some((defender) => inside(defender.position, stake.position)));
```

So raising the weight sends **more** enemies to centre/east and **none** to the hero's stake —
by construction it can never touch the blocking stake. Worse, `HeadlessContractSim.ts:955` skips
`handleEnemyContact` for any enemy holding a pressure target, so a pressed enemy does not attack
the hero. **More stake pressure ⇒ fewer enemies attacking the hero ⇒ the hero survives longer ⇒
a false secure is MORE likely, not less.**

That is exactly what the sweep measured, and it explains the one result that otherwise looks like
noise — seed 02 dying at 12.5% but not at 25%:

| Weight | seed 01 | seed 02 |
|---|---|---|
| 25% | false-secured w20 `fnv1a32:6d306221` | false-secured w20 `fnv1a32:612de94b` |
| 12.5% | false-secured w20 `fnv1a32:4ea4e13f` | **died w19** `fnv1a32:b5637940` |
| 10% | false-secured w20 | — |
| 6.25% | false-secured w20 | — |

The only idle loss path left is **hero death**, which is a different terminal from the one the
objective is supposed to test. Seed 02's w19 death at 12.5% is that path firing by luck, not the
hold working.

## F-2090-1 — the enable-gate is coupled to the thing that breaks it (NEW, owner design fork)

`PicnicHoldSystem.isEnabled(markers)` is `markers.filter(({ heroStart }) => heroStart).length >= 2`.
**The hold consumer is switched on by the very flag that guarantees the hero begins standing on a
stake.** The two cannot be decoupled by tuning; one of them has to change, and every candidate is
a design fork:

- **(a) Move the hero off the stakes** — give the picnic a hero start that is not a stake position.
  Cheapest and most local, but `isEnabled` currently *counts* heroStart markers, so the enable
  predicate needs a new key (e.g. `holdStake: true`) or the count moves to `stakeMarkers.length >= 2`.
- **(b) The hero's body does not contest** — only turrets/beacons defend a stake. Makes the mechanic
  "build to hold" rather than "stand to hold", which reads truer to a tower-defence objective, but
  it changes the ratified hold design and the player's most obvious instinct stops working.
- **(c) Weaken the loss rule** — e.g. ≥2 stakes claimed ⇒ loss, so pinning one stake is not a
  guaranteed survival. Smallest diff, but it makes "hold all three" a misnomer.

**RECOMMENDATION: (a).** It cures the idle floor without touching the hold's semantics or the
player's instinct, and it is the only option that leaves the owner's just-issued pressure ruling
fully intact. (b) and (c) both re-open design the owner has already signed off.

⚠️ **The master's firewall forbade every one of these** — its NO list names `hero-start selection`
explicitly, and (b)/(c) are hold semantics. **The runner could not have cured this inside its
scope no matter how well it worked.** That is an authoring finding, not an implementer failure:
v2's WHY assumed the pressure ruling was sufficient, so its firewall was drawn around a cure that
could not work.

## 🚫 Do NOT author b4v3 as another tuning pass

Two runs have now stopped on this thread (s2085 v1, s2090 v2) at a combined **~570k tokens**, and
the second spent 288k empirically re-deriving a fact that the contract JSON and 20 lines of
`PicnicHoldSystem.ts` state outright. §7.5 permits a third attempt **only with a changed premise**;
a weight re-tune is the identical premise and is forbidden. The changed premise must be an owner
ruling on (a)/(b)/(c) above.

## What is preserved

`lane/b` is `ahead=2`, HOLDS 7 paths (`lane-usable lane-b`), tip `1731de225026ba6f0fc8fcf8a42e3586315a1a08`:
`PicnicHoldSystem.ts` (+pressure), the e2e spec, `er01-e6-census`, `MechanicsManifest`, `pools.ts`,
`Game.ts`, `HeadlessContractSim.ts`. Admission changes were reverted by the runner, so **the Picnic
stays honestly refused on main** and the WIP is inert where it sits (picnic-gated by contract id).
The lane must NOT be reset — it is the salvage for whichever ruling lands.
