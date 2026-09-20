# Heat 11 — the unclaimed sweep — operator's note

Operator: an attended Claude agent (Fable 5.1 session `session_01Rpu6VBzeT24Kk8jHuRHkpQ`), hosting
headless `claude -p` rides from detached arena worktrees. Rigs: **Claude Opus 5** and **Claude Fable
5** via Claude Code CLI **2.1.257**. Started 2026-09-03 ~12:46Z, stopped 2026-09-04 ~04:45Z
(~16 h wall clock against a 20 h budget). Full per-ride record: `matrix.md`.

---

## 1. The receipts delta — measured from the live API, verified rows only

`receipts-before.json` (2026-09-03 13:03:09Z) recorded **32 unclaimed contracts**.
`receipts-after-32.json` re-queries **those same 32** against `https://agenttown.app/api/standings`
and counts only rows whose `assay` is `verified`.

> ### **32 unclaimed → 5 unclaimed. 27 contracts claimed for the first time in county history.**
>
> *(23 during the heat itself; **four more on 2026-09-05**, after the F-HEAT11-1 fix shipped — three
> previously-refused reels admitted on the identical bytes, plus one the operator had failed to
> submit. See §7.)*

Claimed, with the verified rows the door holds (Opus = O, Fable = F):

| era | contracts claimed |
|---|---|
| E1 | `e1-dry-gulch` (O w20/12g, F w20/12g) · `e1-twin-banks` (O w20/200g) |
| E2 | `e2-incline` (O w14/197g, F w14/88g) · `e2-pressure-garden` (O w12/52g, F w12/63g) · `e2-trestle` (F w15/18g) |
| E3 | `e3-blackout-ridge` (O w12/90g, F w12/200g) · `e3-fairground` (F w12/167g) · `e3-moth-season` (O w12/45g, F w12/200g) |
| E4 | `e4-boneyard` (O w12/200g, F w12/100g) · `e4-dust-flats` (O w14/40g, F w14/10g) · `e4-gusher-county` (O w12/80g, F w12/0g) · `e4-long-road` (O w12/0g) |
| E5 | `e5-deepwater-claim` (O w12/40g, F w12/165g) · `e5-flotilla` (O w12/200g) · `e5-regatta` (O w12/200g) · `e5-stillwater` (O w12/0g) |
| E6 | `e6-glow-mesa` (O w12/1g) |
| E7 | `e7-echo-canyon` (O w20/295g) |
| E8 | `e8-eclipse` (O w20/60g) · `e8-far-side` (O w20/200g) · `e8-low-orbit` (O w20/200g) |
| E9 | `e9-devils-alley` (O w20/200g) |
| E10 | `e10-last-claim` (O w8/136g) |

Two operator **skew probes** were also submitted and verified but deliberately **unranked**
(`harness: operator-probe`), so they touch no board: `fnv1a32:cc026656` from each arena.

---

## 2. The contracts neither rig secured — with the rig's own one-line diagnosis

Nine of the 32 remain unclaimed. They fall into **three distinct classes**, and only one of them is a
question about winnability at all.

### (a) Refused by the door for a published reason — the run was WON

| contract | what happened |
|---|---|
| `e1-drill-yard` | **Not winnable through the door by construction.** Both rigs independently traced `twist.secureWave = 0` → `RunManager.ts:291` never secures, and `gr-sim.mjs:111` caps the practice yard at wave 2. The door answers `bad_contract` / `training_ground`. Fable: `SECURE_CHOICE` "requires a live secure window". *The Drill Yard is a practice ground, not a contract.* |
| `e6-half-life-hollow` | **SECURED** w20 / 600.000 s / 200 g — reel refused `reel_duration_exceeded`. See §3. |
| `e6-picnic` | **SECURED** w20 / 155 g — reel refused `reel_duration_exceeded`. See §3. |
| `e7-relay-rush` | **SECURED** w20 / 200 g — reel refused `reel_duration_exceeded`, and this one the operator **predicted before submitting**. See §3. |
| `e7-relay-valley` | Not secured inside the wall, but the rig proved the same envelope defect from the code and **declined to put forward a reel it had computed was inadmissible**. |
| `e7-dead-band` | `tune-1` **SECURED**; the rig computed `durationTicks 18001 > this contract 18000-tick door envelope` and refused to submit it. |

**Four of these six were won.** They are unclaimed for an accounting reason, not a play reason.

### (b) Genuinely not secured inside the operator's wall

| contract | the rig's own diagnosis (verbatim, trimmed) |
|---|---|
| `e3-canyon-works` | *"Undecided-leaning-no through the door, and the wall is the map's economy against its own deadline, not the grammar and not my budget"* — the connect latch wants **330 g of beacons across six sites spanning 80 wu while `wave <= 6` (t < 210 s)**, against an income ceiling near **3.0 g/s** (four seams ~78 wu north across the river, two ever live, `capacity 30` on a 20 s respawn) and a **measured 0.44–0.69 g/s**. Underneath that, the hero died at wave 3 in all three runs — idle, grid-first and palisades-first alike. It named two caveats against its own verdict unprompted. **The heat's only real L2 winnability doubt.** |
| `e8-mare-claim` | Both scored attempts spent, w19 / 95 g and w14 / 15 g, Arena B with gravity and air composed. No structural blocker claimed — it simply did not close. |
| `e9-dome-basin` | Four runs, best w13 / 33 g. No structural blocker claimed. |

*(`e8-eclipse`, `e8-far-side` and `e8-low-orbit` were all secured and verified from Arena B — three of the four Orbital maps fell on their first ride each.)*

### (c) Not ridden at all

Nothing was left unridden by choice except **the Fable half of every contract after
`e5-deepwater-claim`**, which is booked `not ridden (Fable budget)` — an owner allocation decision
communicated mid-heat, not a DNF and not a rig result. `e4-long-road` (Fable) is also open, because a
sim-path terrain canonicalization landed on main mid-heat and any further E4 ride needs a fresh arena.

---

## 3. F-HEAT11-1 — the finding of the heat (and the operator's own correction)

**A one-tick off-by-one in the run-tape envelope refuses otherwise-lawful secures.**
`src/playbook/PlaybookFormat.ts:63` computes its inclusive-endpoint `+ 2` slack **only inside
`if (twist?.secureWave)`**. A contract declaring no `secureWave` gets a flat 18 000-tick envelope —
and the comment inside that branch spells out precisely why the slack is needed ("the banking order at
that terminal instant… `durationTicks` is an exclusive end").

Measured across eight reels, all wave 20 / 600 s, all on contracts with **no `twist.secureWave`**:

| contract | `durationTicks` | last entry `t` | door |
|---|---|---|---|
| `e6-half-life-hollow` | **18 001** | **18 000** | ❌ refused |
| `e6-picnic` | **18 001** | **18 000** | ❌ refused |
| `e7-relay-rush` | **18 001** | **18 000** | ❌ refused (predicted) |
| `e9-devils-alley` | 18 000 | 17 560 | ✅ verified |
| `e7-echo-canyon` | 18 000 | 17 905 | ✅ verified |
| `e8-far-side` | 18 000 | 17 732 | ✅ verified |
| `e8-low-orbit` | 18 000 | 17 587 | ✅ verified |
| `e8-eclipse` | 18 000 | 17 889 | ✅ verified |

**The only variable that predicts the verdict is whether the last accepted order sits on tick 18 000
or before it.** The door is behaving as documented; the defect is the withheld slack, and it costs
exactly one tick. Suggested fix and full write-up: `envelope-finding.md`. **Reported, not changed** —
`src/**` was untouched per the heat's firewall.

**The operator got this wrong once and is recording that.** The first write-up claimed 13 of the 32
targets were "structurally unclaimable"; the very next two rides (`e9-devils-alley`, `e7-echo-canyon`)
secured at wave 20 on exactly that class of contract and were **admitted**. Lacking the slack is a
**hazard, not a bar**. Both the write-up and the Opus notebook carry the correction.

A second, independent envelope finding from the same rig: `maxTapeBytes` budgets **160 bytes/entry**
(calibrated on sparse Baron-style play at 140.7), but 32-order arrays run ~**4 KB/entry** — the rig
measured a tape at **1 724 873 bytes after 131 of 600 seconds**. Order-dense riders can breach
`reel_too_large` independently of the tick bug.

---

## 4. Reskin observations — the field's answer to the 2026-09-02 audit

**E2 is a reskin, confirmed twice over from two directions.** Opus, on `e2-pressure-garden` — *the map
named for the mechanic*, whose own briefing makes "run boilers and watch the pressure ledger" goal #1 —
secured with **zero boiler houses, no coal approached, no pressure generated**, then dumped the union
of every `now` key across all 63 views of the secured run: a regex for `/pressure|coal|boiler/` over
every `now` **returns false**. Fable found the other half on `e2-incline` and reproduced it on
`e2-pressure-garden` and `e2-trestle`: the vent hazard is real in source (`PressureSystem.update`
auto-vents above `safeMax` 80) but **every consumer is research-gated** (`PressureArsenalSystem.ts:116`)
and a plain door boot has no research. **Unobservable and unspendable — authored, honest, and
unreachable through the door in two independent ways.** None of the three E2 contracts is in the audit.

**E4 is NO LONGER a reskin, and the audit row is stale on all four maps.** The Motor Frontier slice
landed mid-heat; ridden from Arena B, the errand is the win condition:
- `e4-long-road` (Opus) and `e4-gusher-county` (Fable) both **secured with ZERO gold banked** — on two
  different maps, by two different rigs. A stationary survivor with no gold does not secure, so the
  old "ordinary stationary survival" reading cannot even describe the result. *(This is the pattern
  the coordinator asked to be flagged: **errand-driven secures at 0 gold**.)*
- `e4-dust-flats`: the engine states the conjunction in its own comment — *"the Land-Yacht's fall
  cannot secure a railhead the Hauler never reached"* (`HeadlessContractSim.ts:1886`), with
  `autoSecureWaveForRun` (`:1181`) holding wave 12 shut until the boss falls.
- **The two maps disagree about whether the road pays, and that disagreement is the era's content:**
  `GRADE` was nearly worthless on the Boneyard (4.409 of 68.424 wu graded) and decisive on the Dust
  Flats (82.5 wu of open drive at 27.5 fuel, ~39 under storm, against a 36-fuel total, cut to ~12.6 by
  grading `camp-to-railhead` first). `stormMovementMultiplier` prices fuel by the second.

**E3 EXERCISES is confirmed from the field — the first era whose named mechanic genuinely binds.**
On `e3-blackout-ridge`, `syncContractPowerGrid:1991` boots relay/storage nodes offline and brings them
up only while an unwrecked building stands within 2.5 wu; `PowerGraph:488` rebuilds adjacency from
online nodes only, **so a wrecked frame severs everything downstream rather than dimming one lamp**.
The capacitor sites ship empty, so both lamps are dark before the first spawn: *"the map opens already
broken, and noticing that is the puzzle."*

**Two audit rows were corrected by measurement, both in the optimistic direction:**
- `e3-fairground` — the audit says the wheel fell to 0 HP and the escort "became unsecurable". True of
  the idle ride only: Fable **secured it on the first ride with the wheel at 240/240, never hit**. The
  dynamo stops *for the run* on its first damage point (`FerrisWheel.damage` → `spinning=false`), so
  the map is about interposing, not operating. Opus's failed rides found the same: a compact radius-8
  palisade ring held the wheel pristine to t=77.2 s where four of five runs lost it by t=22.13 s.
- `e3-moth-season` — RESKIN confirmed but sharpened: the mechanic is *"present, fully specified,
  genuinely implemented, and entirely optional, because the rider is the one who installs it"*. Lights
  buy only the cancellation of a 1.12 `nightSpeedOutsideLight`, while moths do zero contact and zero
  building damage. **A cost with no matching benefit.**

**A door-document error worth fixing:** `public/skill.md` states `e2-incline` "dies at wave 6 of 12 on
seed 01 with two turrets standing" across 250 measured runs. Opus had two turrets standing at t=61 s
and finished **w14 at 175/175 HP, zero damage taken across 637 spawns**. The refusal note is stale.

**A trap for future riders,** found by Fable on `e3-fairground`: `stablePrefix.map.seams` and
`now.seams` disagree — **the anchors are shuffled per seed; the map lies about node positions.**

---

## 5. How the two rigs differed

They split evenly and in opposite directions, which is the most interesting comparative result here:
**Fable took `e2-trestle` and `e3-fairground`, both of which Opus failed; Opus took `e1-twin-banks`,
which Fable failed.** On `e2-trestle` Fable answered the exact question Opus had named and run out of
wall clock on — *20 g of palisades on the x=0 rail converts the railcar from a passing target into a
stationary one.* Where both secured the same map, a consistent style gap showed: on Blackout Ridge and
Moth Season **Opus banked early and cheap (90 g, 45 g) while Fable rode the economy to the 200 cap** —
and Opus's Blackout Ridge win was the thinnest margin of the heat, 4/100 HP held for three waves.

---

## 6. Operator honesty ledger

- **Two API interruptions and one operator halt**, all booked as DNF-transport and never as rig
  results: a 529 capacity incident (13:29Z, killed both twin-banks rides before first output), the
  subscription's five-hour session limit (15:51Z, cut a Fable ride at 866 s after 7 tune runs), and a
  deliberate SIGTERM halt (23:54Z) to preserve the owner's window.
- **One wall hit** (Fable, `e3-canyon-works`, 1500 s, 0 scored attempts) — an operator-budget stop,
  not a verdict.
- **A tape-path incident that nearly cost a verified secure:** Fable's `run-sim.mjs` wrote every tape
  to the arena root instead of its workdir. The tape was found, **verified against the rig's own
  outcome before being trusted**, restored, and re-landed. Nothing was re-simulated; nothing re-POSTed.
- **Nothing owed to the door:** an audit of all 37 secured tapes on disk against 24 submitted tape ids
  found 14 unsubmitted, every one a *tune* run on a contract whose rig already held a verified scored
  reel. Tune runs are not scored attempts and were not submitted.
- **Two arenas, both era-gated and skew-probed**, and the byte-identical claim for E1 was *verified*
  rather than trusted: the same orders replayed through both arenas produced `fnv1a32:a93d1bbc`
  identically.
- **The operator over-claimed F-HEAT11-1's blast radius and corrected it in the same session**, in
  this note, in `envelope-finding.md`, and in the rig's notebook.


---

## 7. Addendum, 2026-09-05 — the fix landed and four more contracts were claimed

The envelope fencepost F-HEAT11-1 identified was cured and deployed (build `3345a36a`, builtAt
2026-09-04T23:09:00Z). The three reels that had been **won and refused** were resubmitted **unchanged**:

| contract | tape | before (2026-09-04) | after (2026-09-05) |
|---|---|---|---|
| `e6-picnic` | `attempt-1-tape.json`, `durationTicks 18001` | ❌ `reel_duration_exceeded` | ✅ verified `fnv1a32:1df337a8`, rank 1 |
| `e6-half-life-hollow` | `tune-1-tape.json`, `durationTicks 18001` | ❌ `reel_duration_exceeded` | ✅ verified `fnv1a32:356b8d34`, rank 1 |
| `e7-relay-rush` | `attempt-1-tape.json`, `durationTicks 18001` | ❌ `reel_duration_exceeded` | ✅ verified `fnv1a32:f0fbaa92`, rank 1 |

**Nothing was re-ridden, re-simulated or re-authored.** The only variable that changed was the door,
which makes this as clean a controlled test of the cure as the county is going to get: the same bytes
that were refused for exceeding the ceiling now pass, and all three came back
`decidedBy: "crown"`.

**A fourth contract was claimed, and that one was the operator's own error rather than the door's.**
`e7-dead-band` had **secured on 2026-09-04** — the rig promoted `tune-2` *by name* in its outcome file
(`durationTicks 18000`, last order t=**17602**), admissible even under the old envelope, precisely
because it had computed that its `tune-1` at 18001 was not. It was right and did everything correctly.
The operator never submitted it, because `finish-ride.mjs` discovers scored tapes by the filename
pattern `^attempt-\d+-tape\.json$` and does not read the outcome file's own `tape` field — so a rig
that lawfully promotes a differently-named tape is silently reported "NOT SECURED". A re-audit using
the rig's declaration as the authority found exactly one such tape across the whole heat; it was
submitted and verified `fnv1a32:c444c0e8`, which matches the rig's own recorded `tapeEventLogHash`
exactly. **Fixing that discovery rule is worth doing before the next heat.**

**`e7-relay-valley` was listed for resubmission but had never secured.** All three of its tapes read
`secured: false` (best w4 / 130.8 s / 200 g) and the rig's own outcome file says "NOT SECURED, nothing
put forward". Nothing was submitted for it. Recorded because the brief said otherwise and the tapes
are the fact.

### Final receipts delta

Re-measured from the live API over the original 32 targets (`receipts-after-32.json`, verified rows
only): **32 unclaimed → 5.** The regenerated ledger (`assets/rotations/winnability-receipts.json`,
which now lives outside the engine corpus, plus the `public/skill.md` render) agrees: **31 claimed / 5
unclaimed of 36** across all epochs.

**The five that remain**, and they are now a much sharper list than the heat started with:

| contract | why |
|---|---|
| `e1-drill-yard` | **Not a contract.** `twist.secureWave = 0`; the door answers `training_ground`. Both rigs traced it independently. |
| `e3-canyon-works` | **The only genuine L2 winnability doubt of the heat.** 330 g of beacons wanted across six sites before t < 210 s, against a hard income ceiling near 3.0 g/s and a *measured* 0.44–0.69 g/s; the hero died at wave 3 in all three runs. The rig filed two caveats against its own verdict. |
| `e7-relay-valley` | Not secured in 4 runs inside the wall — but this is the ride that **found F-HEAT11-1** and paid for the four claims above. |
| `e8-mare-claim` | Both scored attempts spent (w19 / 95 g, w14 / 15 g) with gravity and air composed. No structural blocker claimed. |
| `e9-dome-basin` | Four runs, best w13 / 33 g. No structural blocker claimed. |

Only one of the five is a winnability question. One is not a contract, and three are ordinary
"not this time" results with rides still available.
