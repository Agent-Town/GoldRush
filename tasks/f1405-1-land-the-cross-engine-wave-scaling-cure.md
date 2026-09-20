CODEX: model=gpt-5.6-sol effort=high
# f1405-1-land-the-cross-engine-wave-scaling-cure — the same cure, with a gate that can be satisfied (FIRE-AUTHORED, attended review welcome)
ROLE: main-slot implementer. WORKDIR: repo root. One task, firewalled.

WHY (F-1405-1 + F-1405-2, s1405 drain gate — reviews/f1404-1-cross-engine-wave-scaling-stop.md):
you already ran this cure. It worked. You stopped anyway, correctly, because the master told you to
stop if any non-hash gameplay assertion moved — and the Claim's kill count moved 140 → 137.

**The stop gate was wrong, not your run.** Do not re-litigate that; it is settled, and here is why
in one line: the diagnosis that authored the previous master proved that a 1-ULP shift flips replay
event 662 from `enemy_killed` to `hero_damaged`
(`reviews/f1403-1-twin-banks-hash-divergence.md:81`) — i.e. it proved that ~1e-16 DOES change kill
counts in this sim, and the master then demanded that it not. No arithmetic can pass that gate:

  Math.pow(1.115, 3)  →  1.3861958749999999  (Node 23.11.1, yours)
                      →  1.386195875         (Node 26.4.0, the fires')

"Preserve current behaviour" is not a defined target — current behaviour differs per interpreter.
Any deterministic cure must pick one value and therefore must move behaviour on at least one engine.

MEASURED THIS FIRE, both interpreters, full reachable exponent ranges (s1405 gate):
 · Repeated multiplication is **bit-identical on Node 23.11.1 and Node 26.4.0** for all three bases,
   including `trickleDecay` out to exponent **29** (the previous check stopped at 20). The cure is
   sound — this is verified, not assumed.
 · It differs from `Math.pow` at **34 of 71** reachable exponents (hpScale 11/21, speedScale 2/21,
   trickleDecay **21/30**), worst deviation **3 ULP / 3.459e-16**. So the behavioural shift is
   dominated by *spawn timing* via `trickleDecay`, not by one enemy's HP at wave 3.
 · Of the five gameplay assertions the old scope 6(b) named, **four do not move**: `secured` true,
   `waves` 10, `gold` 0, `timeMs` 300000, `calls` 0 — on both engines. Only `kills` moves, 140→137.
   The contract still secures at the same wave for the same gold. `Balance.ts` is untouched.

⚖️ **OWNER VETO WINDOW (s1405, per CLAUDE.md §7.4):** re-baselining the bench pins is being taken
as reversible work inside ratified specs — the bench is a determinism certificate, not a balance
spec. Robin can reverse the whole thing with one word and one revert.

READ-FIRST (paths, read them, do not skim):
 · `reviews/f1404-1-cross-engine-wave-scaling-stop.md` — this task's evidence, the ULP tables, and
   why the old gate was unsatisfiable.
 · `reviews/f1403-1-twin-banks-hash-divergence.md` — the original causal chain and the five sites.
 · `src/systems/WaveSystem.ts` — the five sim-reachable sites (find them by READING; on `915950b0`
   they are at `:579` speedScale, `:582` hpScale, `:744` trickleInterval, `:838` waveHpScale,
   `:839` waveSpeedScale).

PRE-FLIGHT (main slot, tracked-clean): `git status --porcelain` must show no tracked dirt you did
not create (`logs/*` churn is expected and is not yours). If tracked dirt exists that belongs to no
task, STOP and report.

SCOPE (numbered, each testable):
 1. Add the shared helper (file-local in `WaveSystem.ts` is fine and is what you chose last time):

        const scalePerWave = (base: number, wave: number): number => {
          let s = 1;
          for (let i = 0; i < wave; i++) s *= base;
          return s;
        };

    Guard non-integer / negative `wave` the way the surrounding code guards inputs. ⓘ All five call
    sites currently pass non-negative integers (`decaySteps` is a `Math.floor`) — verified s1405 —
    so the helper is semantically equivalent to `Math.pow` there, differing only in rounding.

 2. Replace all FIVE sim-reachable `Math.pow(base, wave)` calls with it. `:838`/`:839` are the
    BARON's component-HP path and are in scope deliberately — the baron is E1 driver 5 of 5 and
    would otherwise fail this same way on its own re-land.
    🚫 Do NOT touch `Vfx.ts:230` or `Game.ts:8009` — render-side easing, not sim.

 3. Re-derive EVERY pinned `fnv1a32:` literal in `scripts/gr-sim.test.mjs` that this moves, and
    leave the rest alone. For each pin state: old value, new value (or "unchanged"), and the exact
    command that produced it. **Both interpreters must produce the same new value** — that is the
    point of the whole exercise. Expected from the s1405 measurements: the Claim moves
    `02561b7f → b1eeb320`; verify rather than trust that.

 4. **The acceptance test is cross-engine identity, not a pinned number.** Add a check that runs a
    contract outcome under BOTH interpreters and asserts the hashes are equal:
      `/opt/homebrew/bin/node`                        (v26.4.0)
      `$HOME/.nvm/versions/node/v23.11.1/bin/node`    (v23.11.1)
    Skip cleanly if a second interpreter is absent, but FAIL — not skip — when both are present and
    disagree. Wire it into `npm run test:node-guards`. Reuse `scripts/twin-banks-hash-probe.mjs`
    rather than writing a second instrument.

 5. Add `.nvmrc` (or `engines` in `package.json` — your call, say which and why) naming the version
    the factory gates under. Humans-facing note; scope 4 is the enforcement. (F-1404-3.)

 6. **THE REPLACEMENT GATE. Record, do not stop, when `kills` moves. STOP AND REPORT only if:**
    (a) any pin still DISAGREES ACROSS ENGINES after scope 2 — that means a second divergent
        primitive exists (`Math.sin`/`cos`/`sqrt`/`hypot` are the suspects). Name it, do not fix it.
    (b) any of `secured`, `waves`, `gold`, `timeMs`, `calls` moves on either engine. These are the
        outcome invariants; all five held last run, so a change means the edit is not what we think.
    (c) `kills` moves by MORE THAN 10% on any contract (the observed shift is 3/140 = 2.1%). A
        large jump means a semantic error — e.g. an exponent off by one — not float rounding.
    (d) the two engines report DIFFERENT `kills` for the same contract after the change.
    ✅ Otherwise: a `kills` delta within 10%, identical on both engines, is EXPECTED and ACCEPTED.
       Report it in a table; do not stop for it. That is the whole difference from the last master.

TOUCH-ONLY: `src/systems/WaveSystem.ts` · `scripts/gr-sim.test.mjs` (pins only) · the new
cross-engine guard script · `.nvmrc` or `package.json` (scope 5) · `package.json` (wiring the guard
into `test:node-guards`).
NO: `src/entities/Enemy.ts` (read it; it needs no edit once its input is stable) · `Balance.ts` (no
balance value changes — if you think one is needed, that is 6(b): STOP) ·
`src/sim/HeadlessContractSim.ts` · `assets/contracts/bench-seeds.json` · `src/world/Terrain.ts` ·
the twin-banks graft on `save/f1400-1-twin-banks-reland-s1403` (it re-lands separately, AFTER this)
· any lane branch · browser behaviour · meta.

SELF-CHECK (name the exact commands and paste real numbers):
 · `npx tsc --noEmit` clean · `npm run build` green.
 · `node --test scripts/gr-sim.test.mjs` — FULL FILE, must EXIT. Report the pass/fail triple.
 · **THE SAME FILE UNDER BOTH INTERPRETERS** — report both triples side by side; they must match.
 · `npm run test:node-guards` — exact `tests/pass/fail` triple, including your new guard.
 · Escort canary: `node scripts/gr-sim.mjs --contract e2-hill-mine --seed e2-escort-headless --mode escort --policy=idle`
   must exit rc=0 (clean main gives `fnv1a32:b3706fdc`). If it hangs, F-1400-3 is back: STOP.
 · The before/after pin table, and the outcome table showing `secured`/`waves`/`gold`/`timeMs`/
   `calls` unchanged plus the `kills` delta on BOTH engines.

READY-FOR-GATES + report: the five replaced sites, the pin before/after table, both interpreters'
triples side by side, the outcome-invariant table, and the `kills` delta per contract per engine.
