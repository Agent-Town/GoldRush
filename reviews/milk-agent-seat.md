# THE AGENT SEAT — a rig rides in a live room

**Slice:** milk/agent-seat · **branch tip:** see `git log -1 milk/agent-seat` · **shift:** the milk shift of 2026-08-06
**Verdict: READY-FOR-GATES on what it claims, and explicit about the two things it does not claim.**

---

## What it does

The owner's sentence was *"the icing on the cake would be if from the get go people and agents/models/harnesses could play the game together"*, and it was sized as a transport swap: GR-SIM already runs the full deterministic sim, a lockstep room already carries only inputs, so a seat should be a **transport, not a second engine**.

That is what this is. `gr-sim --room <claim word> --origin <url>` boots the same `HeadlessContractSim` every solo run boots, wires it into the same `LockstepClient` the browser rider uses — unchanged — and steps it exactly one tick per tick-bundle the room agrees on. It takes its chair through doors that already existed: `GET /api/multiplayer/inspect` for the ride's setup, then an ordinary join. **No relay or Durable Object change. No `Game.ts` change. No `src/mp` change.**

Three properties are load-bearing and all three are proven by execution below, not asserted:

1. **The wall-clock throttle is a law, not politeness.** A headless sim runs hundreds of times faster than realtime. The relay allows each rider `RATE_LIMIT_MESSAGES = 600` per `RATE_WINDOW_MS = 10_000` — 60 messages a second — and a seat spends one `input` per tick plus one `hash` per 30. Run the loop at the sim's natural speed and the room throws `rate_limited` and closes the socket: the rig is ejected for riding too hard. Default 30 ticks/s (the room's own clock), hard ceiling 45. Lockstep *would* eventually pace the seat, but only after the inputs have been sent — which is exactly the traffic being limited — so the throttle has to sit in front of the wire, not behind it.
2. **Orders land at wave boundaries, never per frame.** The rider is asked for orders only when the sim owes it a turn, exactly as a solo headless run does. Between answers the seat streams empty ticks. The room never waits on an inference and the rider never has to answer at tick rate — THE TWO CLOCKS in one loop.
3. **A desync resigns, loudly.** Every rider exchanges a determinism hash; when this seat's stops matching the table's it stops, names the tick and names the engine, and exits non-zero. There is no code path in which a rig quietly plays a different game than the people it is sitting with.

## Files

| File | What |
|---|---|
| `src/sim/SeatedLockstepSim.ts` | new — the transport seam (join, pace, tick, hash, resign) |
| `src/sim/SeatOrders.ts` | new — the standing-orders driver (order → wire act, or a named refusal) |
| `src/sim/HeadlessContractSim.ts` | +79/-1 — four additive seam methods and one exported constant; `advanceToTurn()`, `outcome()` and every pinned hash untouched |
| `scripts/gr-sim.mjs` | the seated driver alongside the solo one; the solo path's statements are unchanged |
| `public/skill.md` | the join flow — a host shares a claim word with a rig the way they would with a friend |
| `scripts/agent-seat.test.mjs` | new — the seam's contract, no network, 2.76 s |
| `scripts/agent-seat-room.mjs` | new — the two-seat shared-run proof against a real relay |
| `e2e/agent-seat.spec.ts` | new — the human + rig boot probe |
| `package.json` | +1 file in the `test:node-guards` roster (see F-SEAT-5) |

---

## Evidence

### 0. An adversarial pass found six real defects; all six are fixed

An independent reviewer was pointed at `SeatedLockstepSim.ts`, `SeatOrders.ts`, the `HeadlessContractSim` diff, `gr-sim.mjs` and the unchanged `LockstepClient.ts`, and told to hunt rather than praise. It cleared categories 1 (lockstep/determinism ordering), 2 (lifecycle/hang) and 3 (solo-path regression) **by execution** — including an A/B of the seated CLI against `main`'s own `gr-sim.mjs` on both policies, byte-identical stdout (`fnv1a32:27d33b38` and `fnv1a32:79bdeed2`) — and reproduced the 37/37 room proof independently. It also found six things I had wrong:

| # | Defect | Fix |
|---|---|---|
| 1 | **A resigned seat could report an outcome.** `outcome` was gated on terminality alone. A desync detected on the very tick that ends the run resigns and breaks in the *same* iteration, so the envelope would have carried a real-looking verdict beside exit 3 — and reddened both my own `outcome === null` assertions. | `resignation === null && isTerminal`, with both clauses' reasons in the comment |
| 2 | **`consume()` dropped every peer's movement, uncounted.** `mx`/`my` are the highest-frequency thing on the wire and had no tally, so `unhonouredActions: {}` read as "nothing was dropped" — the exact clean reading §1's table leans on. | movement is tallied as `move`; the doc comment now says *nothing* leaves uncounted |
| 3 | **The stall timer killed a seat mid-reconnect and blamed the peer.** `beginReconnect()` clears `error` and pauses, so a seat whose *own* socket dropped waited out 30 s and resigned `peer_stalled`. `state().reconnecting` was sitting there unread. | resigns `connection_lost` immediately, saying why a headless seat cannot rejoin |
| 4 | **No short-circuit on run-transition acts.** `Game.applyMultiplayerActions` breaks the bundle for `restart`/`death_action`/`secure_choice`; the seat tallied them and rode on — in a *different run* than the table. | `UNHONOURABLE_ON_A_SEAT` (those three plus `set_pause`) now **resigns**, because unhonourable is not the same as unhonoured |
| 5 | **My control-arm proof passed only because every build was refused.** "A seated ride equals a solo ride" is true only while no wire act changed the world — so curing F-SEAT-3 would have flipped a green into a mystery red. Two claims were conflated. | the harness now asserts the **precondition** (`builds.placed === 0`) beside it and says in-line which claim is expected to move |
| 6 | `lastHash` reports what the seat **computed**, which under `--desync-at` differs from what it **sent**. | kept — it is the useful reading (the sims agreed; only the wire lied) — and now documented as deliberate |

Only #1, #3 and #4 are behaviour changes; #2 is accounting, #5 is the test's own honesty, #6 is a comment. The reviewer explicitly withdrew one suspected bug (`--desync-at 0` reaching the parser guard) after tracing it, and confirmed no busy-loop, no readline hang, and no solo-path regression.

### 1. Two seats, one shared run — `node scripts/agent-seat-room.mjs`, **51/51 checks**

Real relay (wrangler room worker + `pages dev`, the same pair `scripts/test-multiplayer.mjs` stands up), two `gr-sim` seats in one room, orders handed to **one** of them. Reproduced across three independent runs of the harness (22 checks, then 37, then 51 as arms were added), with identical tick counts and hashes each time.

| | Rig A (ordered) | Rig B (`--policy=idle`, never given an order) |
|---|---|---|
| exit | 0 | 0 |
| ticks | 2193 | 2193 |
| pace | **44.98 ticks/s** (ceiling 45) | **44.98 ticks/s** |
| wall clock | 48.757 s | 48.759 s |
| roster | `Rig B of Calculating House`, `Rig A of Calculating House` | *identical, same order* |
| last determinism hash | `tick 2190 → fnv1a32:032a2383` | *identical* |
| acts applied | `{placed: 0, refused: 2}` | **`{placed: 0, refused: 2}`** |
| unhonoured peer acts | `{}` | `{}` |
| resigned | `null` | `null` |
| outcome | `{secured:false, waves:2, timeMs:73100, gold:0, kills:30, calls:0, eventLogHash:"fnv1a32:27d33b38"}` | *identical* |

**Control arm, run in the same harness and never a pinned number:** a solo `gr-sim --contract the-claim --seed e1-the-claim-04 --policy=idle` returns `fnv1a32:27d33b38` — byte-identical to both seats' outcomes on every field. **Riding in a room does not perturb the sim.**

**The transport proof is the third row from the bottom.** Only Rig A was ever handed orders. Rig B's tally of 2 applied acts can only be non-zero because Rig A's two `place_build` acts crossed the wire and were applied at both seats — and it is *exactly* 2, matching the 2 BUILD orders given.

*Honest reading of `refused: 2`:* both seats **refused** the palisade, identically, because a run starts on an empty purse. A refusal is as good a lockstep citizen as a placement — it is a decision both engines made from state they agree on, and had they disagreed about gold the hash exchange would have caught it. That the build cannot land is F-SEAT-3, below. The act **landing** is proven separately in `scripts/agent-seat.test.mjs` ("a wire act crosses into the sim and changes it": same act, refused on an empty purse, then honoured after a 100-gold grant, `build.diagnostics.palisades` 0 → 1).

*Roster order:* the second run happened to seat Rig B first, and both seats read the roster in that same order. The order is the relay's join order, carried in the tick bundle, so it is agreed within a run — which is what determinism needs — and is not stable across runs, which is correct and worth knowing.

### 2. The fail-loud path, **exercised** — same harness, second arm

One seat is told to corrupt its own hash at tick 30 (`--desync-at`, test-only). A claim that a desync resigns is worth nothing until a desync has been made to happen:

| | Rig Liar | Rig Honest |
|---|---|---|
| exit | **3** | **3** |
| ticks | 31 | 31 |
| resigned | `{reason: "desync", tick: 30}` | `{reason: "desync", tick: 30}` |
| detail | names the tick **and** `gr-sim.headless.v1` | *identical* |
| outcome | **`null`** | **`null`** |

Caught at the exact tick the lie was told, at both seats, in under a second. Neither claims an outcome it did not earn.

### 2b. A bounded ride — the third arm, added because `skill.md` promised something untested

`skill.md` documents `--max-ticks` and promises that a seat which stopped early *"reports its hash and no outcome — it will not name a verdict it did not earn"*. That was a claim in the agents' door with no test behind it. Two seats at `--max-ticks 60`:

| | Rig Short A | Rig Short B |
|---|---|---|
| exit | 0 | 0 |
| ticks | **exactly 60** | **exactly 60** |
| resigned | `null` | `null` |
| outcome | **`null`** | **`null`** |
| last hash | `tick 30 → fnv1a32:7424b99b` | *identical* |
| wall clock | 1.358 s | 1.359 s |

A free cross-check falls out: that hash is the *same value* the desync arm's seats computed at tick 30 in a **different room** — same contract, same seed, same tick, same fingerprint, across independent rides.

### 3. The seam's contract — `node --test scripts/agent-seat.test.mjs`, **4 pass / 0 fail, 2.76 s**

- a wire act crosses into the sim and changes it (and every other vocabulary word is *reported*, never swallowed);
- two independently booted sims agree tick for tick — **and the hash MOVES** (an unmoving hash would make "identical" prove nothing), **and a one-tick drift is visible** (the smallest divergence there is, which is exactly what the wire has to catch);
- the seat carries BUILD and refuses to stretch for the other five verbs, with a malformed BUILD reported as a *different* failure from an unspeakable one;
- the throttle ceiling is **read out of `functions/api/_multiplayer.ts` at test time**, so if the relay's rate limit ever moves, this reds instead of rotting.

### 4. Human + rig boot probe — `e2e/agent-seat.spec.ts`, **1 pass / 1 skipped**, 7.1 s

A human opens a room in a real browser, gets a claim word (`CB3EB35D00B39D4FF1F52EE5` on the first run, `362E36DFA4814136E86CE2CD` on the second — it reproduced), and a headless rig takes the empty chair. The human's own roster reads **`["Robin of Dawn Claim", "Rig of Calculating House"]`** and the screenshot (`artifacts/agent-seat/seat-desktop.png`, 1280×800) shows the RIDERS panel with both names and the rig's name chip standing in the world beside the host.

The probe runs on `desktop-chrome` only and the skip lives in the `beforeAll` **as well as** the test body — standing up two wranglers for the other projects just to skip the body is a minute of nothing.

Then the engines declare their disagreement and the rig resigns at tick 0 (F-SEAT-2). The 390px capture (`artifacts/agent-seat/seat-390px.png`, 390×844) is the nicest accident of this shift: the human's client shows **"RIDE TOGETHER — Holding the trail. Rig has 60 seconds to return."** The game already has vocabulary for a rider leaving the table; it treats a resigned rig exactly like a friend who dropped.

### 5. Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green, **1.10 s** |
| `GR_RELEASE=e1 npm run build:release` | green — 1883 files, 110,044,576 bytes, zero later-era assets |
| `npm run test:node-guards` | **306 pass / 0 fail / 3 skip over 309**, 145.0 s (re-run after the six fixes; 155.1 s before) — includes `gr-sim.test.mjs`, whose determinism pins are intact |
| solo `gr-sim` pin, re-run by hand | `{secured:false, waves:4, timeMs:135667, gold:4, kills:37, calls:5, eventLogHash:"fnv1a32:68b99428"}` — byte-identical to `scripts/gr-sim.test.mjs:37` |
| collection guards, re-run **after** adding `e2e/agent-seat.spec.ts` | 23/23 |
| `node scripts/gate-caller-audit.mjs` | PASS — 9 orphans, all grandfathered, **unchanged** by this slice (verified by execution, not inference — but see F-SEAT-4 for why that PASS is weaker than it looks) |
| CLI arg probes, 11 arms | every misuse errors with a named message at rc=1; the solo path's `--contract/--seed/--policy` arm still rc=0 |
| adjacent e2e: `agent-seat` + `mp-reconnect` + `second-rider` | 2 passed, **1 failed — `second-rider.spec.ts:96`, control-proven pre-existing** (below) |

**The one adjacent red, and how it was settled.** `e2e/second-rider.spec.ts:96` (`TimeoutError: page.waitForFunction` in `openHostRide`) failed on the merged tree. It is inventory entry #5 (`logs/suite-red-inventory.md:212-213`, BOTH projects, 5/47 = 10.6%) — **and a known-red lookup was not treated as exoneration.** A matched control was run in a detached worktree at `565a145a5` (this branch's parent, none of this slice present), same spec, same project, `--workers=1`:

- control run 1 (**cold** cache): failed **earlier**, at `:85` (the town→tavern wait, 10 s);
- control run 2 (**warm** cache): failed at **`:96`, 20 s timeout — byte-identical to the merged tree's failure and to the inventory line.**

The file is provably untouched by this slice: `git diff 565a145a5 HEAD -- e2e/second-rider.spec.ts` is empty and both trees hash the blob to `2431121be33ee7e0f7021f7f345ad8650a084ab3`. **So the red exists without this change.** The cold/warm split is worth keeping: the first control arm looked like a *different* red purely because the dev server was cold, and had I stopped there I would have reported "not the same failure" about the same defect. **Control arms must be warmth-matched, not just tree-matched.**

**Zero console errors and zero page errors in the boot probe — ASSERTED, not observed.** The first draft of this review claimed it while the spec merely attached an artifact; the spec now collects both buckets and `expect`s them empty, and `artifacts/agent-seat/boot-probe.json` records `"consoleErrors": []` / `"pageErrors": []` from the run that produced this line. A rig joining a human's room and then resigning costs the host nothing.

---

## Findings

**F-SEAT-1 (P1, the headline — the wire has no word for the standing-orders DSL).** `LockstepAction` has a word for exactly one of the six standing-order verbs: BUILD, as `place_build`. `HARVEST`, `REPAIR_UNDER`, `MOVE_TO`, `HOLD` and `FALLBACK_IF` command a body the vocabulary cannot name. The seat **rejects** them by name with a message that foreshadows the rung that fixes them, rather than smuggling them through (e.g. through `place_build.id`, which would have bought a working demo and cost the wire its meaning). This is Mistake #14 applied deliberately: *generator proposes, contract disposes.*
**Next rung:** a `standing_orders` entry in the lockstep vocabulary — a `src/mp/LockstepClient.ts` change, which is **outside this shift's TOUCH-ONLY firewall**. Not attempted, on purpose.

**F-SEAT-2 (P1 — the two engines hash different things).** `Game.multiplayerStateHash` hashes a run-suspend snapshot; `HeadlessContractSim.tickHash` hashes its own planar state. These are different fingerprints of the same world, so a human+rig room mismatches at the **first** exchange (tick 0) by construction. The seat resigns loudly and names the engine (`SEAT_HASH_ENGINE = 'gr-sim.headless.v1'`) precisely so this reads as an engine mismatch and not as corruption — an unlabelled mismatch is indistinguishable from a real desync.
**So the honest bar today is: seat ↔ seat plays a shared run; human ↔ seat opens the door and then stops.** Anyone reading §4's green as "people and agents play together" is reading it wrong, which is why the spec says so in its own header.
**Next rung:** a shared hash basis — either the headless sim learns to produce a run-suspend snapshot, or both engines agree on a narrower planar digest. Both are real slices; neither is a line change.

**F-SEAT-3 (P2 — the two limits are the same limit).** A seated rig's only verb is BUILD; BUILD costs gold; gold comes from panning; panning is `HARVEST`, which the wire cannot carry. So a seated rig can today issue an act it can never afford. This is not a second defect — it is F-SEAT-1 seen from the other side, and it is why the room proof reads `refused: 2` rather than `placed: 2`. Curing F-SEAT-1 cures this.

**F-SEAT-4 (P2, non-blocking — the relay-backed proof has no caller).** `scripts/agent-seat-room.mjs` needs `wrangler` and costs ~110 s of wall clock (two relay boots + a 48.8 s ride + a ~1 s desync arm). It is deliberately **not** wired into `test:node-guards`, on the precedent of `npm:test:mp` (a `run-guards.mjs` GUARDS entry) and `scripts/halo-reextraction-check.mjs` (grandfathered, owner's desk).

⚠️ **And the caller audit's green here is not exoneration — it is blindness, and the mechanism matters.** `node scripts/gate-caller-audit.mjs` is rc=0 with the orphan count unchanged at 9 (verified by execution). But that is **not** because `agent-seat-room.mjs` is reached; it is because `gate-caller-audit.mjs:71` selects its subjects with `GUARDISH_FILE = /(guard|assert|check|audit|contract|ratchet)/i`, and neither `agent-seat-room.mjs` nor `agent-seat.test.mjs` contains any of those six words. **Neither file is a subject at all.** So the audit built to answer "who calls this gate?" cannot see this gate, and a future reader must not take its PASS as evidence that this proof is wired. That is the same class as F-1252-1's citation guard — a real gate, green in its own right, called by nobody — arriving through a naming gap rather than through a missing edge.

**Recommendation:** root it in `run-guards.mjs`'s GUARDS beside `test:mp`; that is gate policy, not a drive-by, and it belongs to whoever owns the gate budget. Widening `GUARDISH_FILE` to cover `\.test\.mjs$` is a separate and probably larger question (it would sweep in every unrostered test file at once), and is named here rather than attempted.

**F-SEAT-5 (P3, firewall declaration).** TOUCH-ONLY named `scripts/gr-sim.mjs · src/sim/* · skill.md source · own test · this review · BACKLOG goal-leaf`. I also edited **`package.json`**: one file added to the existing `test:node-guards` roster, so `scripts/agent-seat.test.mjs` is not an inert test nobody runs. That is the minimum edit that makes "own test" mean something. No new npm script was added — a new gate-shaped script with no caller would have been a fresh orphan for the caller audit, which is F-SEAT-4's whole subject. Declaring rather than hiding it.

**F-SEAT-6 (P3 — `--desync-at` is a test-only door).** It corrupts the seat's own hash so the resignation path can be exercised. It mirrors `LockstepClient.desyncAtTick`, which already exists and is already reachable from the browser via `?mpDesyncAt`. No new capability, and it cannot be reached without an explicit flag.

---

## What a reader should take away

The transport is real and it is proven: two rigs ride one room, tick for tick, and end on a hash equal to each other **and** to a solo control run of the same world. An act issued by one reaches the other. A lie about the world is caught at the tick it is told and ends the ride with a non-zero exit.

The chair at the human's table exists, and a rig can sit in it — there is a screenshot of it happening. What the rig cannot yet do is *stay*, because the two engines fingerprint the world differently (F-SEAT-2), and what it cannot yet *say* is anything but BUILD (F-SEAT-1). Both are named, both have a next rung, and neither was papered over to make this look finished.
