CODEX: model=gpt-5.6-sol effort=high
# f1403-1-diagnose-the-twin-banks-hash-divergence — find WHY two processes disagree, then pin the truth (FIRE-AUTHORED, attended review welcome)
ROLE: main-slot implementer. WORKDIR: repo root. One task, firewalled.

WHY (F-1403-1, s1403 drain gate — reviews/e1-twin-banks-reland-s1403.md): the twin-banks re-land
has now been refused TWICE over one pinned literal, and the second refusal proves the first
diagnosis wrong. `scripts/gr-sim.test.mjs` pins the secure-run hash `fnv1a32:5f57f7be`. That value
reproduces **in the Codex runner's process** — the previous run printed it directly (run log :2814)
and closed `npm run test:node-guards` at 230/230 (:8369-72) with **no edits afterwards** (no
apply_patch after :7540). It reproduces **nowhere else**: s1403 measured `fnv1a32:bfd79d2a` EIGHT
times — bare `node --test` ×3, an isolated single-test run, the runner's own npm battery (229/230),
a direct probe, the same probe on a COLD vite dep cache, and again in a clean detached worktree.

⛔ **DO NOT "FIX" THIS BY RE-DERIVING AND RE-PINNING.** That is exactly what the last two runs did,
and it is why this is the third attempt. Whichever value you pin, the other environment reds. The
job is to find the MECHANISM first. A hash that two observers disagree on is not a determinism gate.

⚠️ These are already eliminated — do NOT spend the run re-testing them (evidence in the review):
CPU/timing (advanceToTurn is a pure fixed-step loop, performance.now only feeds advanceCpuMs) ·
clock in the hash (outcome() hashes contractId/seed/replayEvents/economy/orders/final only) ·
test order (isolated run agrees) · node or shell version (both v26.4.0, /opt/homebrew/bin/node) ·
tree drift (mtimes unchanged mid-run) · performance tier (localStorage absent in node → always
`full`) · harness (the runner's own npm script reds for the fire) · vite dep cache (cold run agrees).
POSITIVE CONTROL, already run: the bench's other pin, the-claim `fnv1a32:02561b7f`
(gr-sim.test.mjs:162), reproduces EXACTLY in the fire shell — so the fire's instrument is faithful
in general. The one thing that control does NOT cover is twin-banks' extra systems (fords, gravel
bars, crossings), which the-claim never exercises. **That gap is your prime suspect.**

READ-FIRST (paths, read them, do not skim):
 · `reviews/e1-twin-banks-reland-s1403.md` — the eight measurements, the elimination table, the
   stated limit of the positive control.
 · `scripts/twin-banks-hash-probe.mjs` — the instrument; it re-derives the hash and `--dump`s its
   full inputs (replay events, economy log, final state) to JSON.
 · `artifacts/twin-banks-probe-s1403-fire.json` — the fire side's reference dump: 957 replay
   events, `bfd79d2a`. This is the thing you diff against.
 · `git show save/f1400-1-twin-banks-reland-s1403` — the graft. It is CORRECT and verified; reuse
   it, do not re-graft from lane/m3.

PRE-FLIGHT (main slot, tracked-clean): `git status --porcelain` must show no tracked dirt you did
not create (`logs/*` churn is expected and is not yours). If tracked dirt exists that belongs to no
task, STOP and report.

SCOPE (numbered, each testable):
 1. Restore the graft from the salvage branch — it is already verified correct, so do NOT redo it:
    `git checkout save/f1400-1-twin-banks-reland-s1403 -- assets/contracts/bench-seeds.json env/goldrush-verifiers/README.md scripts/gr-sim.test.mjs src/sim/HeadlessContractSim.ts`
    Confirm afterwards: `constructor(readonly boot: HeadlessContractBoot)` present, main's escort
    test (`contractId: 'e2-hill-mine' ... mode: 'escort'`) present, zero `new HeadlessContractSim('`.
 2. Run `node scripts/twin-banks-hash-probe.mjs --dump artifacts/twin-banks-probe-codex.json` and
    print the hash. **Report it honestly even if it is `bfd79d2a`** — that result is a legitimate
    and welcome outcome, not a failure, and it would close this finding immediately (scope 5a).
 3. If your hash is `5f57f7be`: DIFF your dump against `artifacts/twin-banks-probe-s1403-fire.json`
    and find the FIRST differing replay event. Report its index, its contents on both sides, and
    the wave/tick it belongs to. That event names the divergent system. This is the deliverable —
    a single event index is worth more than any amount of reasoning about it.
 4. From that event, name the MECHANISM in code: which system emitted it, and what input could
    differ between two processes on one tree. Prime suspects, given the control: ford / gravel-bar
    crossing selection, enemy pathing across water, or any iteration over a Set/Map whose insertion
    order depends on module evaluation order. ⚠️ Attribute the effect only to a mechanism you have
    READ — do not name a suspect you have not opened.
 5. Then, and only then, RULE:
    (a) if the divergence is a genuine nondeterminism in the sim → that is a **game defect**, not a
        pin problem. STOP, do not repin, and report it as a blocker — it would mean the E1 bench has
        been certifying a coin flip, which is far more serious than one wrong literal.
    (b) if the divergence is an artefact of one environment → pin the value from the CORRECT
        environment, state which one and why in your report, and make the test assert the hash in a
        way that names what it is pinning.
 6. Keep every behavioural assertion the slice has (crossings, build zones, `twist.secureWave`,
    two-run determinism, the five bench seeds) and the explicit `{ timeout: 45_000 }`.

TOUCH-ONLY: `scripts/gr-sim.test.mjs` · `src/sim/HeadlessContractSim.ts` · `assets/contracts/bench-seeds.json` · `env/goldrush-verifiers/README.md` · `artifacts/twin-banks-probe-codex.json`.
NO: `src/systems/WaveSystem.ts` (the baron's file, separately blocked by F-1400-3) · `src/world/Terrain.ts` · browser behaviour · Balance · meta · any other contract's driver. If the mechanism you find lives in one of these, that is scope 5a: REPORT IT, do not fix it here.

SELF-CHECK (name the exact commands and paste real numbers):
 · `npx tsc --noEmit` clean · `npm run build` green.
 · `node --test scripts/gr-sim.test.mjs` — FULL FILE, must EXIT. Report pass/fail counts.
 · `npm run test:node-guards` — report the exact `tests/pass/fail` triple.
 · The probe hash + the dump path, and (if they differ) the first divergent replay event index.
 · Escort canary: `node scripts/gr-sim.mjs --contract e2-hill-mine --seed e2-escort-headless --mode escort --policy=idle` must exit rc=0 (clean main gives `fnv1a32:b3706fdc`). If it hangs you have reintroduced F-1400-3 — STOP.

READY-FOR-GATES + report: the probe hash, the first divergent event (or a statement that the dumps
are identical), the mechanism you READ, your ruling under scope 5, and the full-file test counts.
