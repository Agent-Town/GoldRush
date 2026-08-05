CODEX: model=gpt-5.6-sol effort=high
# f1404-1-make-the-wave-scaling-cross-engine-deterministic — kill the Math.pow ULP, then re-pin the bench on evidence from BOTH engines (FIRE-AUTHORED, attended review welcome)
ROLE: main-slot implementer. WORKDIR: repo root. One task, firewalled.

WHY (F-1404-2, s1404 drain gate — reviews/f1403-1-twin-banks-hash-divergence.md): the f1403-1 run
DIAGNOSED the twin-banks hash divergence correctly and ruled scope 5(a) — a game defect, stop, do
not repin. The s1404 gate reproduced that diagnosis end-to-end and then proved the mechanism one
level deeper. It is settled, and it is small:

  V8's `Math.pow` differs by 1 ULP at wave 3 → `hpScale` differs → `Enemy.spawn` stores the
  unrounded product → a lethal hit lands one tick differently at wave 13 → replay event 662
  differs (`enemy_killed` vs `hero_damaged`) → the event-log hash differs.

MEASURED, one tree, one directory, zero edits between runs — only the interpreter changed:

  Math.pow(1.115, 3)   Node 26.4.0 → 1.386195875          (the FIRE shell's node)
                       Node 23.11.1 → 1.3861958749999999  (the RUNNER's node — yours)

  node --test scripts/gr-sim.test.mjs  @ Node 26.4.0 → 6 pass / 1 fail, fnv1a32:bfd79d2a
  node --test scripts/gr-sim.test.mjs  @ Node 23.11.1 → 7 pass / 0 fail, fnv1a32:5f57f7be

Waves 1, 2, 4, 5, 13 and 20 agree; wave 3 is where the two V8 versions round differently. ECMA-262
leaves `Math.pow` precision **implementation-defined** — it is not required to be correctly rounded,
and V8 changed its implementation between these releases. IEEE-754 `*`, by contrast, is exactly
specified. That asymmetry is the whole cure.

⚠️ **YOU RUN ON NODE 23.11.1 AND THE FIRES RUN ON NODE 26.4.0 (F-1404-3).** This is why the last
three attempts failed: every one of them measured a hash that was true in its own process and false
in the other. **A single-engine green is NOT evidence for this task.** Scope 4 exists to make that
structural rather than a matter of anyone's care.

⛔ **DO NOT re-pin a hash you measured only in your own process.** Three runs have now done that.
⛔ **DO NOT "fix" this with an epsilon, a tolerance, or `toFixed`.** The values must be *identical*,
not *close*; a tolerance would hide the next instance of this class instead of removing it.

READ-FIRST (paths, read them, do not skim):
 · `reviews/f1403-1-twin-banks-hash-divergence.md` — the full causal chain, the five sites, the
   verified cure, and why the other bench pins are green by luck rather than by design.
 · `src/systems/WaveSystem.ts` lines 575–585, 740–748, 834–842 — the five sim-reachable sites.
 · `src/entities/Enemy.ts` lines 596–602 — `spawn()` stores `Balance.enemy.hp * hpScale` unrounded.
 · `scripts/gr-sim.test.mjs` — every pinned `fnv1a32:` literal in the file is a subject of scope 3.

PRE-FLIGHT (main slot, tracked-clean): `git status --porcelain` must show no tracked dirt you did
not create (`logs/*` churn is expected and is not yours). If tracked dirt exists that belongs to no
task, STOP and report.

SCOPE (numbered, each testable):
 1. Add ONE shared helper — suggested `src/systems/waveScaling.ts`, or a non-exported local if you
    prefer, but it must be used by every site in scope 2:

        export const scalePerWave = (base: number, wave: number): number => {
          let s = 1;
          for (let i = 0; i < wave; i++) s *= base;
          return s;
        };

    Guard `wave` being negative or non-integer the way the surrounding code already guards inputs.
    ✅ ALREADY VERIFIED BY THE AUTHOR — do not re-litigate the approach, just check my numbers:
    63 values (3 bases × waves 0..20) computed this way are **IDENTICAL** on Node 23.11.1 and
    Node 26.4.0, and `1.115^3` = `1.386195875`.

 2. Replace all FIVE sim-reachable `Math.pow(base, wave)` calls with it:
      `WaveSystem.ts:579` speedScale · `:582` hpScale · `:744` trickleInterval ·
      `:838` waveHpScale · `:839` waveSpeedScale.
    ⚠️ `:838`/`:839` are the BARON's component-HP path. They are in scope precisely because the
    baron is E1 driver 5 of 5 and would otherwise fail this same way on its own re-land.
    🚫 Do NOT touch `Vfx.ts:230` or `Game.ts:8009` — those are render-side easing curves, not sim.
    ⓘ Line numbers are from `463cb4bd` and may drift; find the call sites by READING, not by number.

 3. Re-derive EVERY pinned `fnv1a32:` literal in `scripts/gr-sim.test.mjs` that this change moves,
    and leave the ones it does not move alone. Most may not move at all — the other six tests
    currently pass on BOTH engines — but you must MEASURE that rather than assume it. For each pin:
    state its old value, its new value (or "unchanged"), and the command that produced it.

 4. **The acceptance test is cross-engine identity, not a pinned number.** Add a check that runs the
    twin-banks (or, if the graft is not yet landed, the Claim) outcome under BOTH interpreters and
    asserts the hashes are equal. Both are on this machine:
      `/opt/homebrew/bin/node`                              (v26.4.0)
      `$HOME/.nvm/versions/node/v23.11.1/bin/node`          (v23.11.1)
    Skip cleanly (do not fail) if a second interpreter is absent, so the check is portable — but it
    must FAIL, not skip, when both are present and disagree. Wire it into `npm run test:node-guards`.
    ⓘ `scripts/twin-banks-hash-probe.mjs` already re-derives a hash and `--dump`s its inputs; reuse
    it rather than writing a second instrument.

 5. Record the runtime so this stops being invisible: add `.nvmrc` (or `engines` in `package.json`,
    your call — say which and why) naming the version the factory gates under. This is a note to
    humans, not a load-bearing gate; scope 4 is the enforcement.

 6. STOP AND REPORT — do not attempt — if either of these turns out to be true:
    (a) a pin still disagrees across engines after scope 2, which would mean a SECOND divergent
        primitive exists (`Math.sin`/`cos`/`sqrt`/`hypot` are the suspects; name it, do not fix it);
    (b) any gameplay assertion outside the hashes changes — kill counts, wave counts, secured
        flags, gold. The value shift is ~1e-16 and MUST be invisible to behaviour. If behaviour
        moved, the change is not what this task thinks it is.

TOUCH-ONLY: `src/systems/WaveSystem.ts` · the new scaling helper file · `scripts/gr-sim.test.mjs`
(pins only) · the new cross-engine guard · `.nvmrc` or `package.json` (scope 5) · `package.json`
(wiring the guard into `test:node-guards`).
NO: `src/entities/Enemy.ts` (reading it is required; it needs no edit once its input is stable) ·
`Balance.ts` (no balance value changes — if you think one must, that is scope 6b: STOP) ·
`src/sim/HeadlessContractSim.ts` · `assets/contracts/bench-seeds.json` · `src/world/Terrain.ts` ·
the twin-banks graft on `save/f1400-1-twin-banks-reland-s1403` (it re-lands separately, AFTER this) ·
any lane branch · browser behaviour · meta.

SELF-CHECK (name the exact commands and paste real numbers):
 · `npx tsc --noEmit` clean · `npm run build` green.
 · `node --test scripts/gr-sim.test.mjs` — FULL FILE, must EXIT. Report pass/fail counts.
 · **THE SAME FILE UNDER THE OTHER INTERPRETER**:
   `$HOME/.nvm/versions/node/v23.11.1/bin/node --test scripts/gr-sim.test.mjs` **and**
   `/opt/homebrew/bin/node --test scripts/gr-sim.test.mjs`. Report BOTH triples. They must match.
 · `npm run test:node-guards` — report the exact `tests/pass/fail` triple, including your new guard.
 · Escort canary: `node scripts/gr-sim.mjs --contract e2-hill-mine --seed e2-escort-headless --mode escort --policy=idle`
   must exit rc=0 (clean main gives `fnv1a32:b3706fdc`). If it hangs, you have reintroduced F-1400-3: STOP.
 · The before/after table of every pin from scope 3.

READY-FOR-GATES + report: the five replaced sites, the pin before/after table, both interpreters'
triples side by side, and an explicit statement of whether ANY non-hash assertion moved (scope 6b).

---
## RE-QUEUE ADDENDUM (attended, 2026-08-05 — CHANGED PREMISE per escalation law)
Prior stop was a wall-casualty (the fires died 2026-08-04 06:57 mid-cycle; rc-1 runs unclassifiable), not a refuted premise. Changed since: main moved 40+ merges (E1 release settled, mp-06/co-op/living-paper/beauty landed); re-run `git checkout -B` pre-flight against TODAY'S origin/main and re-verify the ULP repro still reproduces before curing (the diagnosis is s1404's, the tree is new — VERIFY-DON'T-INHERIT). Everything else in this master stands as written. ER-00 of `specs/e2-readiness/README.md` rides on this cure; the twin-banks re-pin and the baron driver re-land queue AFTER this merges.

## PRE-FLIGHT CARVE-OUT (attended, 2026-08-05, after the first STOP proved the gate too broad)
The tracked-clean gate's INTENT is "no undrained WORK in the tree". These paths are KNOWN infrastructure churn and do NOT stop this task: `logs/*` (the dashboard launchd job rewrites them continuously), `tasks/queue/**` deletions (the runner consumes queue copies without committing). Any OTHER dirty tracked path still stops you cold.
