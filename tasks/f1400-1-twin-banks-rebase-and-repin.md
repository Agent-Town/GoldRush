CODEX: model=gpt-5.6-sol effort=high
# f1400-1-twin-banks-rebase-and-repin — re-land the twin-banks driver on current main, honestly (FIRE-AUTHORED, attended review welcome)
ROLE: main-slot implementer. WORKDIR: repo root. One task, firewalled.

WHY (F-1400-1 + F-1400-2, s1400 drain gate — reviews/e1-headless-bench-twin-banks-baron-s1400.md): `lane-headless-twin-banks` (lane/m3 tip `e1bff1e8`) was gated and REFUSED on two control-proven defects. Its work is sound and is NOT lost — the branch is intact — but it cannot merge as-is.
  (1) F-1400-1: main's `372808f0` changed `HeadlessContractSim`'s constructor from positional `(contractId, seed)` to an object `(boot: HeadlessContractBoot)`. The lane branched before that, so its two new call sites use the old form. git merges this cleanly and `tsc --noEmit` is BLIND to it (the callers are `.mjs`, loaded via `vite.ssrLoadModule`). At runtime: `Error: Unknown contract: undefined`.
  (2) F-1400-2: the pinned secure-run hash `fnv1a32:5f57f7be` (scripts/gr-sim.test.mjs:222) DOES NOT REPRODUCE. Measured `fnv1a32:bfd79d2a` — twice, in two different worktrees and processes, including lane-a's OWN clean worktree with its OWN node_modules. Every other outcome field matches the report exactly (`secured:true, waves:20, timeMs:600000, kills:189, calls:0`) and the idle hash `bdd90123` passes. The run report claims "GR-SIM 6/6" and also says "Review gap fixed" — i.e. a late edit after measuring, the likely origin of a stale pin.

READ-FIRST (paths, read them, do not skim):
 · `reviews/e1-headless-bench-twin-banks-baron-s1400.md` — the full evidence, both controls, and the masking effect.
 · `src/sim/HeadlessContractSim.ts` on CURRENT main — the `boot: HeadlessContractBoot` constructor and `SUPPORTED_CONTRACTS`.
 · `scripts/gr-sim.test.mjs` on CURRENT main — call sites at `:86` and `:145` are the CORRECT object form; copy that shape.
 · `git show lane/m3` — the slice being re-landed (4 files, 98+/4−).

PRE-FLIGHT (main slot, tracked-clean): `git status --porcelain` must show no tracked dirt you did not create. If tracked dirt exists that belongs to no task, STOP and report.

SCOPE (numbered, each testable):
 1. Re-land the lane's four paths onto current main: `git checkout lane/m3 -- assets/contracts/bench-seeds.json env/goldrush-verifiers/README.md scripts/gr-sim.test.mjs src/sim/HeadlessContractSim.ts`. ⚠️ `scripts/gr-sim.test.mjs` and `src/sim/HeadlessContractSim.ts` are BOTH-MOVED — a raw checkout of those two would DISCARD main's escort work (`372808f0`). For those two files you MUST graft, not copy: keep main's version and re-apply only the lane's twin-banks additions. Verify after grafting that `src/sim/HeadlessContractSim.ts` still has `constructor(readonly boot: HeadlessContractBoot)` AND `'e1-twin-banks'` in `SUPPORTED_CONTRACTS`, and that `scripts/gr-sim.test.mjs` still contains main's escort test (`contractId: 'e2-hill-mine' ... mode: 'escort'`).
 2. Convert the twin-banks call sites to the object form, e.g. `new HeadlessContractSim({ contractId: 'e1-twin-banks', seed: 'e1-twin-banks-01' })`. Grep the whole file afterwards: ZERO `new HeadlessContractSim('` (positional) may remain.
 3. RE-DERIVE the secure-run hash on the merged tree and pin the measured value. ⚠️ DO NOT simply paste `bfd79d2a` from this master to make the test green — that is the exact failure this task exists to correct. Run it, read the value, pin what YOU measured, and print the transcript.
 4. EXPLAIN the discrepancy in your report: state whether the re-derived hash matches `bfd79d2a`, and whether the underlying behaviour (kills, waves, secure wave, ford/buildZone consumption) is unchanged from the original report. If your value differs from BOTH `5f57f7be` and `bfd79d2a`, STOP and report — that would mean the hash is unstable, which is a different and more serious finding than a stale pin.
 5. Keep every behavioural assertion the slice already has (declared crossings, build zones, `twist.secureWave` posting, two-run determinism equality, the 5 pinned bench seeds). A pin without them is not a determinism gate.
 6. Give the twin-banks node test an explicit timeout if it lacks one (F-1400-4: `test:node-guards` runs `node --test` with `--test-timeout=0`, so one non-terminating sim hangs the WHOLE battery unbounded).

TOUCH-ONLY: `scripts/gr-sim.test.mjs` · `src/sim/HeadlessContractSim.ts` · `assets/contracts/bench-seeds.json` · `env/goldrush-verifiers/README.md`.
NO: `src/systems/WaveSystem.ts` (that is the baron's file and is separately blocked by F-1400-3) · browser behaviour · Balance · meta · any other contract's driver.

SELF-CHECK (name the exact commands and paste real numbers):
 · `npx tsc --noEmit` clean · `npm run build` green.
 · `node --test scripts/gr-sim.test.mjs` — FULL FILE, and it must EXIT (see scope 6). Report pass/fail counts.
 · `npm run test:node-guards` green (it contains both `gr-sim.test.mjs` and `bench-seeds.test.mjs`, the direct consumer of the changed seeds file).
 · Confirm the escort run still terminates: `node scripts/gr-sim.mjs --contract e2-hill-mine --seed e2-escort-headless --mode escort --policy=idle` must exit rc=0 (clean main gives `eventLogHash: fnv1a32:b3706fdc`). This is the F-1400-3 canary — if it hangs, you have reintroduced the baron's defect and must STOP.

READY-FOR-GATES + report: the re-derived hash with its transcript, the before/after of the call-site conversion, the full-file node test result, and the escort-canary rc.
