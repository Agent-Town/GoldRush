# f1401-1 — bound the headless driver, rule the escort bench

**Slice:** `f1401-1-bound-the-headless-driver-and-rule-the-escort-bench`
**Slot:** main (working-tree output + done-move `20260803-005456-…`)
**Base:** `1ea51415` (s1410 lock) · **Drained by:** s1410 fire, 2026-08-03
**§3.0 block-check:** `--strict` → ✅ **CLEAR**, read as the WORD (`status="queued"`).

## VERDICT: MERGE

Two files, +6/−2, entirely inside TOUCH-ONLY. Every scope verified independently on this
tree — the scope-3 ruling by reading the production code, the canary by a control run, and
the ceiling by manufacturing the failure. Nothing was inherited from the runner's report.

## What it does

`scripts/gr-sim.mjs`'s driver loop had no bound: `advanceToTurn()`'s own `maxTicks` guard
returns early on every wave change, so a contract that never auto-secures spins forever
(F-1401-1: 99.4% CPU, alive past 150 s, immune to the caller's `spawnSync` timeout because
the `--policy=idle` path contains no `await` and never yields). The slice adds a
`secureWave + 2` ceiling inside that loop; exceeding it throws a diagnostic naming contract,
mode, seed, wave reached and ceiling, and exits non-zero.

It also rules the divergence the bound exposes, per scope 3 option **(a)**: production
withholds Hill Mine's auto-secure while its baron lives, so the bench assertion
`cli.status === 0` was pinning an outcome the real game would not produce. It is re-based
to `cli.signal === null` — *"the driver terminated on its own"* — which is true both today
(the run secures at wave 12) and after `lane/e2-arsenal` lands (the run stops at the ceiling).

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | ✓ green, built in 2.40 s |
| `npm run test:node-guards` (merged tree) | **rc=0 · 235 tests · 232 pass · 0 fail · 3 skipped** · 212.0 s |
| `node --test scripts/gr-sim.test.mjs` isolated | 6/6 pass; see the flake note below |
| Adjacent suites | derived by grep, not from the runner's list: only `HeadlessContractSim.ts` (string id), `twin-banks-hash-probe.mjs` (URL host only) and `package.json` reference `gr-sim`. **No `e2e/` or browser surface consumes the driver**, so no boot probe or screenshots are owed. |

The 3 skips are the s1409 fire-shell cross-engine cure (`9b3961f6`) doing its job, with the
reason printed — not lost coverage.

### Scope 3 — the ruling, verified by reading, not adopted from the master's preference

`Game.ts:4709 waitsForBaronDefeat()` returns
`baron.variantId !== 'dynamo_crawler' || wave >= baron.wave` once a baron exists and is
unbeaten. ✓ **VERIFIED in the data**, not assumed: `e2-hill-mine` carries
`twist.baron = {wave: 12, bossKind: "railcar", …}` with **no `variantId` key** (`"variantId" in baron` → `false`;
the token appears **nowhere** in `assets/contracts/epoch-2-steamworks/contracts.json`). So the
predicate is `undefined !== 'dynamo_crawler'` → **true** → `autoSecureWaveForRun()` returns
`Number.MAX_SAFE_INTEGER` (`Game.ts:4673-4680`). **Production withholds. Ruling (a) is correct.**
`secureWave: 12` also confirms the ceiling arithmetic: 12 + 2 = **14**.

### Scope 2 — the red path, manufactured rather than assumed

A green driver never executes the new branch, so its green says nothing about it. I built a
probe copy with the ceiling forced to `3` and ran the real escort command:

```
MANUFACTURED  rc=1  signal=null  2.1 s   (4 turns printed, then the throw)
Error: gr-sim wave ceiling exceeded: contract=e2-hill-mine mode=escort \
       seed=e2-escort-headless wave=4 ceiling=3
```

Non-zero, self-terminated, all five fields present. Probe deleted; `git status` shows only
the runner's two files plus the expected `logs/**` churn.

### Scope 4 — the load-bearing assertion survives the world this ruling creates

The concern with `cli.signal === null` is that it is weaker than `cli.status === 0`, so it
must not become vacuous once the baron slice makes the run fail. Measured on the
ceiling-failing probe: **rc=1, `signal=null`, and stdout's first line still parses to
`stablePrefix.mechanics.modes[0].id === "escort"`.** The ceiling check sits *before* the
`process.stdout.write`, but the first turn is wave 1, so the prefix is always emitted. The
bench still proves escort-boots-from-data after `lane/e2-arsenal` lands. Scope 4 holds.

### The canary — the master's hash was stale, and that is proven, not argued

The master demanded the clean-main canary still yield `fnv1a32:b3706fdc`, and warned that a
changed hash means the bound is too tight. The runner reported `fnv1a32:14d45400` and claimed
the master's value predates `eaefdb24`. **That claim is correct, and I did not take its word
for it** — I materialised HEAD's driver (no ceiling) and ran both arms back to back:

| Arm | rc | waves | secured | eventLogHash |
|---|---|---|---|---|
| CONTROL — HEAD driver, no bound | 0 | 12 | true | `fnv1a32:14d45400` |
| ARM — bounded driver | 0 | 12 | true | `fnv1a32:14d45400` |

Byte-identical. The bound did not move behaviour; `b3706fdc` was measured before the
s1406 wave-scaling cure `eaefdb24` re-based every hash in this family. The master's own
scope 5 forbade pasting its hashes for exactly this reason, and the trap it was guarding
against duly sprang — on its own canary line.

## Findings

**F-1410-1 🔺 — F-1409-1's escape hatch does not hold: the flake reaches the ISOLATED arm too.**
F-1409-1 (s1409) characterised `scripts/gr-sim.test.mjs` as flaky *inside* `test:node-guards`
in a fire shell, and told the next runner: *"re-run the file ISOLATED, report both results,
and treat the isolated result as the signal."* Measured this fire, that instruction is unsafe.
**Merged tree, isolated, 5 runs: 4 green, 1 × rc=1 at 158.3 s.** **Clean main, isolated
(detached worktree), 4 runs: 4 green — but the escort test alone ranged 7.5 s → 36.7 s, a
4.9× spread on the same test, same file, same shell, same hour.** So the isolated arm is not
a clean oracle; it is the same load-variable instrument with a smaller denominator, and its
tail is long enough to cross a budget. F-1409-1's mechanism (the F-1269-1 CPU ceiling) is
unaffected and its filing was right — only its *remedy* over-promises. ⚠️ **The single rc=1
is recorded as UNATTRIBUTED**: I did not capture which test failed, and it did not recur in
seven subsequent runs across both trees. It is *not* charged to this merge, and the reason is
a control, not a preference — the same file flakes on clean main, and the decisive battery
(`test:node-guards`, the loaded arrangement where F-1409-1 lives) is **rc=0, 0 fail** on the
merged tree.

**F-1410-2 🟡 — the new 120 s per-test timeout is a real, deliberate, and correctly-chosen new red surface.**
Scope 6 required it and F-1400-4 is why: `test:node-guards` runs `node --test` with
`--test-timeout=0`, so before this slice one non-terminating sim hung the **whole** battery
unbounded. The trade is sound — a bounded red beats an unbounded hang. But the margin is
thinner than it looks. Observed escort-test durations: **8–12 s** typical, **36.7 s** on clean
main under load, **41.3 s** in F-1409-1's battery measurements. That is a ~3× headroom against
120 s, in a shell where s1408 watched a probe go 61.5 s alone → >180 s with one sibling.
Non-blocking, and **do not "fix" it by raising the number blindly** — if it ever fires, the
question is the arrangement (F-1409-1's slice), not the budget.

**F-1410-3 🟢 — `lane/e2-arsenal` is now unblocked, and this is the road it was waiting on.**
The runner reports `git merge-tree` structurally clean. The substantive gate was never the
merge shape: it was that the merged tree made the escort driver spin forever, and that main's
bench asserted the side of the divergence production does not produce. Both are now fixed —
the driver cannot spin, and the bench asserts termination rather than success. ⚠️ **lane-c
still HOLDS `src/systems/WaveSystem.ts` — RE-GRAFT it, never reset over the cure.**

## Merge classification

Pure main-slot working-tree output. No lane base, no graft, no conflicts. Both files
LANE-TOUCHED only; main moved neither since the runner started. Path-scoped add of exactly
`scripts/gr-sim.mjs` and `scripts/gr-sim.test.mjs`.

**GAZETTE 0 / DEPLOY skipped, correctly** — a headless dev driver is not shipped in the build
(`npm run build` bundles `src/`, not `scripts/`) and no player-visible change merged.
