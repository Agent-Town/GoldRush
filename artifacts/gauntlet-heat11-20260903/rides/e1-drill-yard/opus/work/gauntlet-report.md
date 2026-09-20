# Heat 11 — `e1-drill-yard` on `gold-rush` (live county, trail)

rider: claude-opus-5 · harness: claude-code-cli 2.1.257 · worldModel: `sim-import` · generation 5

## The short version

`e1-drill-yard` is the county's **practice yard**, and it cannot be secured by anyone, through any
door, with any orders. That is not a wall I failed to climb — it is authored, in three independent
places, and it is almost certainly deliberate. The contract list carries it as `bench seeds: none
published | unclaimed`, and `unclaimed` here does not mean "hard". It means "no such receipt can
exist".

## The proof, read rather than inferred

**1. The contract authors its secure wave to zero.**
`assets/contracts/epoch-1-frontier/contracts.json` → `e1-drill-yard.twist.secureWave = 0`.

**2. Zero is a closed gate, not an open one.**
`HeadlessContractSim.ts:1089` (`secureWaveForRun`) and `:1123` (`autoSecureWaveForRun`) both resolve
to `this.manifest.twist.secureWave ?? Balance.run.secureWave`. `??` only falls back on
`null`/`undefined`, so the authored `0` is what reaches `RunManager`. And `RunManager.ts:289-294`:

```js
private maybeSecureRun(wave: number): void {
  const secureWave = this.host?.secureWave?.() ?? Balance.run.secureWave;
  if (!this.host || secureWave <= 0 || wave < secureWave) return;   // <- returns at EVERY wave
  ...
  this.secureRun(wave);
}
```

`secureWave <= 0` returns unconditionally, at every wave, forever. So `secureRun()` is never called,
`run_secured` is never emitted, `HeadlessContractSim.secured` stays `false`, `now.pendingSecure`
never appears in any view, and `SECURE_CHOICE` — the only verb that can bank a claim — is never
accepted. My four rides confirm the prediction exactly: `pendingSecure` was `null` in every single
view, and `defaultedSecure` was `0` in every outcome.

**3. The same zero also caps the ride at two waves.**
`gr-sim.mjs:108-111` computes `waveCeiling = secureWave + 2` for a non-boss contract → **2**. Every
ride therefore ends at wave 2, 60.03 s, `endReason: "wave-ceiling"`, with the runner setting
`hero.hp = 0` itself. The `rider-down` in the last append-log entry is that ceiling kill, not a death
I earned.

**4. The county says the same thing twice more, independently.**
- `assets/contracts/winnability-receipts.json` → `e1-drill-yard: { status: "unclaimed", reason:
  "standings-disabled" }`.
- `e2e/field-book.spec.ts:113-126` asserts that a drill-yard standing POSTed to `/api/standings`
  returns **HTTP 400 `training_ground`** — "The Drill Yard is the training ground — practice is its
  own reward." — writes no KV row, and that the GET board refuses too. `training_ground` is a
  published entry in skill.md's own refusal taxonomy. So even a hypothetical secure could not become
  a standing.
- The manifest's `practice` block declares `standings: false, tapes: false, scores: false,
  metaProgress: false, runHistory: false`.

I stopped after one scored attempt rather than spending the second. A second ride cannot secure: no
order, difficulty, seed or flag reachable through the door changes `twist.secureWave`, and
`--overtime` is no help either, since its rush path requires a `bankedSecureWave` that only
`run_secured` can set. Spending attempt 2 would have been theatre, not evidence.

## What I did measure

Four rides, all deterministic, all ending identically at wave 2 / 60.033 s:

| run | policy | gold | kills | calls | works | eventLogHash |
|---|---|---|---|---|---|---|
| `probe-idle.json` | `--policy=idle` | 0 | 23 | 0 | 0 | `fnv1a32:134de7dc` |
| `tune-1-tape.json` | first controller | 15 | 23 | 6 | 0 | `fnv1a32:7ff9b669` |
| **`attempt-1-tape.json`** | **scored** | **5** | **23** | **3** | **1 standing (60/60 hp)** | **`fnv1a32:eed8345a`** |

The scored attempt is the honest one: it landed a palisade, took the `double_tap_coil` draft
explicitly (`defaultedPicks: 0`), harvested, and raised **zero order failures** — no `needsRider`
spike, no surprise in the append log. The door's `BUILD`, `HARVEST`, `REPAIR_UNDER`, `PICK_UPGRADE`,
`FALLBACK_IF` and `HOLD` paths all work fine on this map. The only thing that does not work is the
one thing the objective needs.

The tune carried more gold (15 vs 5) because it spent no time building. Neither is secured, so
neither is submittable, and I am not dressing the richer one up as a result.

---

## Outcome

**Not secured — and not securable.** Best and scored ride: `attempt-1-tape.json` — `secured: false`,
**waves 2**, **timeAlive 60.033 s**, **gold 5**, **kills 23**, **calls 3**, `defaultedPicks: 0`,
`defaultedSecure: 0`, `eventLogHash fnv1a32:eed8345a`, `endReason: "wave-ceiling"`. **4 sim runs, 1
scored attempt.** I put forward **no tape for submission**: the run is unsecured, and the county's
own door would refuse a drill-yard standing with HTTP 400 `training_ground` even if it were not.

## What the map asked

It asked me almost nothing, and the interesting part is *why*. This is not E1 survival-and-bank-cap
wearing a name — it is not a claim at all. It is the tutorial range: two straw men, two rolling logs
and a third straw man that respawn every 1.5 s with `speedScale: 0` and `contactDamageScale: 0`,
plus a gold faucet that lends 100 practice gold and a bell that rings one 8-enemy wave on demand. The
era's signature mechanic — the bank cap and the opening economy — is *present in the fixtures but
unreachable through the door*: `stablePrefix.mechanics.interactables` publishes
`assay_tent_faucet` with operation `top_up` and `drill_bell` with operation `ring`, and **the grammar
has no verb for either**. `CONTEXT_ACTION` accepts `upgrade`, `demolish`, `fund`, `recover`, `plant`,
`redig`, `backfill` — nothing that pulls a lever or rings a bell. So the yard's whole designed economy
(a 100-gold faucet, repeatable against the bank cap, which is exactly where you would *study* the E1
cap) is a browser-only affordance, and a headless rider is left with `HARVEST` alone: 5 gold a pan,
15 gold in the entire 60-second ceiling, against a 25-gold beacon and a 50-gold turret. The fields
that carried anything at all were `now.seams` (three of six live), `now.gold`, and `now.pendingOffer`;
`now.pendingSecure` — the field the objective actually depends on — never appeared. The one genuinely
useful thing the map taught me is that `practice.scheduledWaves: false` is *also* browser-side: the
headless sim ran its ordinary 30-second wave schedule anyway and killed 23 enemies, so the "no
stakes" yard is, headless, just a very short ordinary map with the secure gate welded shut.

## Winnability

**No — `e1-drill-yard` is not winnable through the door from its starting kit, and the blocker is
neither the map, the economy nor my budget: it is authored in the contract.** `twist.secureWave = 0`
makes `RunManager.maybeSecureRun` (`RunManager.ts:291`, `secureWave <= 0` → early return) refuse to
secure at every wave, so `pendingSecure` never appears and `SECURE_CHOICE` is never accepted, while
`gr-sim.mjs:111` caps the same run at wave 2 — and the county independently marks the contract
`standings-disabled` and refuses its standings with `training_ground`. This is a **finding about the
door contract list, not a failure**: L2 says every door contract must be winnable from its own
starting kit, and this one is served by `gr-sim` and listed in `door-contracts` while being, by
design, a practice ground that cannot be won. The honest fix is a list change, not a balance change —
either drop `e1-drill-yard` from the door-contract roster and the standing marker, or mark it
explicitly as a training ground exempt from L2, so no future rider spends a heat proving this again.

## Lessons for my notebook

- **Read the contract manifest before writing a single order.** Two minutes in
  `assets/contracts/<epoch>/contracts.json` told me more than four rides did. `twist.secureWave` is
  the first field to look at: it sets both the objective *and*, through `gr-sim.mjs`, the wave ceiling
  (`secureWave + 2` for a non-boss map). A ceiling of 2 is a tell that something is wrong before you
  ride at all.
- **`secureWave: 0` means "cannot be secured", not "secures immediately".** The gate is
  `if (secureWave <= 0 || wave < secureWave) return` — zero and negative are the *closed* case. I
  guessed "already secured" first and the code said the opposite; the guess would have cost me the
  whole heat.
- **`unclaimed` on the door list is not a difficulty rating.** It can mean "structurally
  unclaimable". Cross-check `assets/contracts/winnability-receipts.json` — it carries a per-contract
  `status`/`reason`, and for this one it said `standings-disabled` outright.
- **The published refusal taxonomy is a map of what the county won't take.** `training_ground` sits
  in skill.md's own list; I could have inferred a whole class of unsubmittable contracts from that
  word alone, before touching the sim.
- **A practice contract's suppressions are browser-side, not sim-side.** `practice.scheduledWaves:
  false` did not stop the headless sim from running its normal wave schedule (23 kills in 60 s).
  Never assume a manifest flag reaches the headless engine — check which engine reads it.
- **The mechanics manifest lists interactables the grammar cannot reach.** `top_up` and `ring` are
  published under `stablePrefix.mechanics.interactables` with no corresponding verb. A published
  operation is not a promise of a door verb — the same lesson as gen-3's "a rejected array installs
  nothing", one layer up: *an advertised affordance is not an available one*.
- **Repeating gen-4's correction, now proven again in the other direction:** an identical retry is
  worthless when the blocker is structural. I had a second scored attempt in hand and deliberately
  did not spend it, because I could name the line of code that would refuse it. Knowing when *not*
  to ride is worth as much as a good policy.
- **A lone `PICK_UPGRADE` array wipes your standing orders.** Replace semantics apply to the draft
  answer too. Put the pick first in the array so it owns the tick, then resend every order you still
  want — my first tune stood the whole claim down for a wave and I nearly shipped that.
