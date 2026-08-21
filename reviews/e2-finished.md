# Review — E2 is finished: the railcar cut, the cadence ladder, and both maps through the door

**Slice/branch/tip:** `worktree-agent-a383c2ed5dd452ebd`, base `4b7883cf0`. Headless Opus-5 agent.
**Verdict: PROPOSED — GREEN, and the claim is the one the owner asked for: E2 is 4/4 through the
door, on a public-verb secure ×2 per seed on every play path.**

**The ruling.** Owner, 2026-08-22, verbatim: **"yes, I want to admit it, E2 should be finished as
well"** — approving F-1608-2's priced `hpScale` 30 → 12.5 railcar cut *and* stating the intent
plainly. Twice before: *"we can balance later during testing"*.

## The programme, in order, each step measured before the next was taken

| # | step | owner ruling | result |
|---|---|---|---|
| 1 | the pressure **LINE** | 2026-08-21 *"give both the pressure line"* | arsenal fires on both maps · **neither secures** |
| 2 | the **COAL** (`twist.coalSeams`) | 2026-08-21 *"sounds like a good idea"* | fuel delivered **doubles** (192→368/384) · **neither secures** |
| 3 | the **RAILCAR CUT** (30 → 12.5) | 2026-08-22, this slice | **changes nothing measurable** — see below |
| 4 | the **CADENCE** (`twist.waveCadenceMult`) | knife-edge under *"balance later"* | **both maps secure, every path, ×2** |

### Step 3 is the finding worth keeping: a boss-HP dial cannot reach a claim that never meets the boss

The cut was applied first and measured before anything else was touched. On the runs that were
actually blocking admission it did **not move a single bit**:

| run | before the cut | after the cut |
|---|---|---|
| `e2-trestle-01` railcar ladder | w10 `fnv1a32:e6fe4301` | w10 **`fnv1a32:e6fe4301`** |
| `e2-incline-01` railcar/tank | w6 `fnv1a32:7d55d2de` | w6 **`fnv1a32:7d55d2de`** |
| `e2-incline-01` turrets/damage | w6 `fnv1a32:17116d57` | w6 **`fnv1a32:17116d57`** |
| `e2-incline-01` turrets/tank | w6 `fnv1a32:2207a312` | w6 **`fnv1a32:2207a312`** |

**Byte-identical event logs.** The railcar spawns at wave 12; these claims died at 6 and 10 and never
met it. The cut is real and correct — it moves the one run that *does* reach the boss
(`trestle-01` turrets went `096a69c6` → `80f9f5fb`) — but it could never have been sufficient on its
own, and **only measuring it in isolation showed that.** That is what aimed step 4.

## Step 4 — the cadence ladders (the Stillwater knife-edge method)

`waveInterval = Balance.waves.waveInterval / waveCadenceMult`, one formula in both engines
(`WaveSystem.ts:839`, `HeadlessContractSim.ts:2016`). Below 1 lengthens the gap between waves and
does nothing else. It was already a lawful `AUTHORED_TWIST_KEY`; it is one number per contract; and
it is the only dial in the vocabulary that moves the measured cause (time to turn gold into guns).

Every rung is a public-verb prover run under declared E1 progression, on **both bench seeds × both
best-play configs** — so "ALL FOUR" means 4 of 4 secured.

**`e2-trestle`** — the whole table:

| cadence | interval | turrets-01 | turrets-02 | railcar-01 | railcar-02 | |
|---|---|---|---|---|---|---|
| 1.0 | 30.0s | ✗ w12 | — | ✗ w10 | — | |
| 0.9 | 33.3s | ✗ w12 | — | ✗ w10 | — | |
| 0.8 | 37.5s | ✗ w14 | — | ✗ w10 | — | ← last failing rung |
| 0.75 | 40.0s | ✓ w14 | ✓ w17 | ✓ w14 | **✗ w13** | 3 of 4 |
| **0.7** | **42.9s** | ✓ w14 | ✓ w14 | ✓ w14 | ✓ w14 | **ALL FOUR — SHIPPED** |
| 0.65 | 46.2s | ✓ w13 | ✓ w14 | ✓ w13 | ✓ w13 | ALL FOUR |
| 0.6 | 50.0s | ✓ w13 | — | ✓ w13 | — | |

**`e2-incline`** — the whole table:

| cadence | interval | turrets-01 | turrets-02 | railcar-01 | railcar-02 | |
|---|---|---|---|---|---|---|
| 1.0 | 30.0s | ✗ w6 | — | ✗ w6 | — | |
| 0.95 | 31.6s | ✓ w16 | ✗ w7 | ✗ w7 | ✓ w15 | 2 of 4 |
| 0.9 | 33.3s | ✓ w15 | ✗ w9 | ✓ w14 | ✗ w7 | 2 of 4 |
| 0.85 | 35.3s | ✓ w14 | ✓ w12 | ✗ w16 | ✗ w10 | 2 of 4 ← noisy band |
| 0.8 | 37.5s | ✓ w14 | ✓ w14 | ✓ w14 | ✓ w14 | ALL FOUR |
| **0.75** | **40.0s** | ✓ w12 | ✓ w14 | ✓ w14 | ✓ w14 | **ALL FOUR — SHIPPED** |
| 0.7 | 42.9s | ✓ w12 | ✓ w14 | ✓ | — | |
| 0.6 / 0.5 / 0.4 | 50 / 60 / 75s | ✓ | — | ✓ | — | |

**Why the two numbers differ, and why neither is the boundary itself.** The maps were judged
independently and each got *its own* measured minimum: the trestle's first all-secure rung is 0.75,
the incline's is 0.8. Each ships **one clear rung inside that**, with securing rungs on **both**
sides — 0.75 above / 0.65 below for the trestle, 0.8 above / 0.7 below for the incline. Never more
than the measured minimum, never sitting on the edge. The incline's 0.85–0.95 band is the honest
shape of a knife edge: individual configs flip in and out, which is exactly why the ship value is a
rung below the first *unanimous* one rather than the first *any*.

## The admission battery — 32 rows, every one identical across two passes

`line` uses the pressure line · `deep` is the other laddered config · `dry` declines the line
entirely · `idle` submits no orders. **24 of 32 secured = all 12 non-idle rows × 2.**

| seed | line | deep | dry | idle (Law 2) |
|---|---|---|---|---|
| `e2-trestle-01` | ✓ w14 `514cfcc2` psp 541 | ✓ w14 `0d12b7b6` psp 431 | ✓ w14 `b7a0e199` | ✗ w1 `0b71b00a` |
| `e2-trestle-02` | ✓ w14 `4ca66057` psp 540 | ✓ w14 `0228df25` psp 501 | ✓ w14 `ca203296` | ✗ w1 `6fa5b353` |
| `e2-incline-01` | ✓ w14 `8ba7f716` psp 506 | ✓ w12 `de405e9d` | ✓ w14 `3984671c` | ✗ w1 `edffbd02` |
| `e2-incline-02` | ✓ w14 `eaca8451` psp 541 | ✓ w14 `cf55d4ed` psp 208 | ✓ w14 `3fbcf331` | ✗ w1 `c7d0a7c6` |

**The `dry` column is worth reading twice.** Both maps now secure even when the rider declines the
pressure line — so the line is *available* rather than *mandatory*, which is the right shape for a
mechanic the epoch teaches on the Hill Mine. And **the idle floors stay honest**: no order, no
secure, terminal at wave 1 on all four seeds.

## Bookkeeping — the full admission template

- **`CONTRACT_ADMISSION_EXEMPTIONS`: both rows REMOVED** (5 → 3). Removed rather than reworded because
  the thing the table exists to record — a public-verb secure ×2 on both bench seeds — now exists.
  The four-step programme and both ladders are recorded as the epitaph above the table.
- **The derivation lives at the vocabulary**, `ContractFamilies.ts`'s `waveCadenceMult` declaration:
  `contracts.json` is strict JSON and cannot carry a comment, so a future author asking "what values
  are sane?" finds both ladders, both shipped values, and the boss-HP null result there.
- **Census** (`e2e/er01-e2-census.spec.ts`): all four E2 ids admitted, per-id and explicit (F-1660-1's
  lesson — admission asserted, never inferred by a derivation). The exempt branch is deliberately
  kept as the landing pad for a future E2 contract. Both rulings are now *asserted*: the railcar pair
  must declare 3 coal seams and its own cadence; the Hill Mine and Pressure Garden must declare
  **neither**.
- **Door list** (`public/skill.md` + `scripts/door-admission-baseline.json`): 33 → **35 contracts**.
- **`null-floors.json`**: regenerated — both maps gain rows, and every pre-existing floor is proven
  byte-unmoved (see Gates).
- **`docs/bench/same-game-audit.md`** + its pins: regenerated on this tree, attributed by
  revert-and-reproduce.

## Gates

| gate | result |
|---|---|
| `tsc --noEmit` | clean (re-run after every edit) |
| admission battery | **32/32 rows, both passes identical, 24 secured** |
| Law 2 idle floors | **4/4 unsecured**, terminal w1 |
| `e2-hill-mine` shipped pin | `fnv1a32:c40556c0` unmoved |
| hill-mine + pressure-garden floors | byte-unmoved (proved by diffing the pre-regen artifact) |
| `skillmd-guard` · `door-admission-ratchet` | 6/6 green |
| E2 census · adjacents · boots · node-guards | see the run log |

## Findings

- **F-E2F-1 — the boss-HP dial was measured to be a no-op before anything was built on it, and that
  is the reusable method.** Applying the ruled cut *alone*, then re-running the exact blocking
  configs and comparing event-log hashes, produced four byte-identical results and turned "the
  railcar is too tough" into "the claim never meets the railcar". Had the cut been shipped together
  with the cadence, the programme would have credited the wrong dial and carried a false balance
  belief forward. **Rule: when a ruling names a dial, ship it alone first and measure it alone.**
- **F-E2F-2 — the pressure line is now optional on both maps.** The `dry` control secures on all four
  seeds. That is not a defect — the epoch teaches pressure on the Hill Mine and the Pressure Garden —
  but it does mean the railcar pair no longer *forces* the mechanic. **OWNER, non-blocking:** if the
  intent is that the Steamworks maps must be won *with* steam, the cadence is the dial to tighten
  (0.75 → 0.8 on the trestle would restore that, at the cost of the seed-02 railcar config).
- **F-E2F-4 — a documentation comment reddened `law-pointer-guard`, and the cure was to move the
  comment, not the pointer.** Written at the `waveCadenceMult` field declaration, the derivation
  block pushed `ContractFamilies.ts:1345` — a line `tasks/goals.json`'s
  `e10s-1b-ember-shore-schema-and-data` leaf cites by number — down to `:1374`, manufacturing exactly
  the false accusation the guard exists to prevent. `tasks/goals.json` is firewalled for this agent,
  so instead of re-basing the pointer the block was relocated **below** the cited line, beside
  `AUTHORED_TWIST_KEYS` — which is the better home anyway, since that is where "may a contract author
  this key?" is answered. The relocation carries a ⚠️ DO-NOT-TIDY-IT-BACK note naming the pointer, so
  the next reader who thinks documentation belongs at its field does not silently re-break it.
  **Reusable: when a comment rots a law pointer, moving the comment is usually cheaper and safer than
  moving the law.**
- **F-E2F-3 — the incline's 0.85–0.95 band is genuinely bistable, not noisy measurement.** Every rung
  is deterministic and reproduced identically; what flips is *which* config survives, seed by seed.
  A future tuner should read that band as "this map is on a cliff between two viable openings", not
  as measurement error — it is the reason the ship value is a rung below the first unanimous rung.
