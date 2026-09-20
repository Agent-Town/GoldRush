# ap-07-the-claim-pin-lift — drain review (s1316)

- **Slice:** AP-07 — lift the GR-SIM contract pin from a constant to a set, admitting `the-claim`
- **Branch / tip:** `lane/m4` @ `f34b37ce`
- **Merge:** `f05fd161` (`f05fd161e7f49aedc3b822de560fc591c442c137`), merge-base `465c8ac1`
- **Verdict:** ✅ **MERGED** — and the specific trap s1315 pre-declared as a REJECT condition was **avoided**, which is the headline.

## What it does

`HeadlessContractSim` failed closed on a single-constant equality. The slice turns
`const SUPPORTED_CONTRACT = 'e1-dry-gulch'` into
`const SUPPORTED_CONTRACTS = new Set(['e1-dry-gulch', 'the-claim'])`
(`src/sim/HeadlessContractSim.ts:34`) and the constructor guard into `!SUPPORTED_CONTRACTS.has(contractId)`
(`:119-120`). Everything else fails closed exactly as before. **No contract-specific objective logic was
added, and none was needed** — `startWave` already reads `this.manifest.twist.secureWave` with no contract
branch, and `the-claim` declares `{secureWave: 10}` against its briefing goal *"Hold the claim through
wave 10."*

Plus: one new determinism/positive case in `scripts/gr-sim.test.mjs`, and the two **current-truth** prose
surfaces corrected (`env/goldrush-verifiers/README.md:13`, `docs/bench/agent-playability-census.md`
executive summary + E1-E2 row + action-ladder item 2).

## 🪤 The F-1315-1 trap — the bar this slice was queued against, and it CLEARED it

s1315 built the wrong cure deliberately and found that a runner could satisfy the scope while leaving
`scripts/gr-sim.test.mjs:40` **green and unchanged** — by adding the set but leaving the old constant
inside the thrown string, producing an error message reading *supports only e1-dry-gulch* on a build where
that is false, **with a passing test certifying it.** The pre-declared verdict was: *if `:40` is still
green and unchanged, that is a REJECT, not a convenience.*

**The runner enumerated the set instead.** The throw is now
``AP-07 supports only ${[...SUPPORTED_CONTRACTS].join(', ')}; received ${contractId}.`` and `:40` was
updated to `/AP-07 supports only e1-dry-gulch, the-claim/` — updated *because the message changed*, which
is the correct causal order.

✓ **I did not take this from the diff.** I ran the refusal path and read the runtime string:

```
$ node scripts/gr-sim.mjs --contract e5-deepwater-claim --seed x
Error: AP-07 supports only e1-dry-gulch, the-claim; received e5-deepwater-claim.
```

The message names the set the build actually enforces. Fail-closed is intact for everything outside it.

## Evidence (re-measured on the MERGED tree this fire — none inherited)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green**, 1.47 s |
| `node --test scripts/gr-sim.test.mjs` | **2 passed / 0 failed** (10.5 s) |
| Full `test:node-guards` (37 files) | **204 passed / 0 failed** (37.2 s) |
| Refusal path, run by hand | enumerated message, non-zero exit ✓ (above) |
| `the-claim` seed 01, my run | `fnv1a32:277307cf` |
| `the-claim` seed 02, my run | `fnv1a32:ce8be929` |
| `e1-dry-gulch` control | unchanged behaviour, still supported |

**The 204 is DERIVED, not inherited, and I own both ends of the arithmetic:** I measured **203** myself on
the drain-1 tree earlier this same fire (before this branch existed), and this slice adds exactly one test
→ 204. The runner reported the same derivation independently. Two independent paths to the same baseline.

**Both hashes reproduce the runner's report exactly** (`277307cf`, `ce8be929`) — on a different tree, from
a different process, after a merge. That is the determinism claim discharged at the drain rather than
accepted from the lane.

## ✓ The "AGENT-READY: 2 of 41" claim — checked, and it survives a real objection

The census now asserts `the-claim` is agent-ready. My runs return `{"secured":false,"waves":2,...}`, and a
`secureWave` of **10** against a run that ends at wave **2** looks at first like an objective the sim can
never satisfy — which would make the five frozen Claim eval rows unwinnable by construction and the
census line an overclaim.

**It is not.** Reading the termination predicate: `:261` returns `this.secured || this.dead` — a run ends
on *secured or death*, not on a wave cap. The horizon is `maxTicks` at `:212`, computed from
`(secureWave + 2) × waveInterval`, so it **scales with `the-claim`'s 10** and does not truncate it. The
idle policy simply dies. Control: `e1-dry-gulch` under the same idle policy also fails to secure, dying at
wave 5 (`fnv1a32:661bf469`). So `secured:false` is the idle agent losing, which is the correct score for
an agent that does nothing — and a competent agent that survives to wave 10 hits `:309-310` and secures.

ⓘ Incidental and useful for the bench: the idle baseline dies at **wave 2** on `the-claim` vs **wave 5**
on `e1-dry-gulch`. The new row is materially harder, which is a desirable eval property, not a defect.

## Merge classification

`git diff --name-only 465c8ac1..main` restricted to the four touched paths → **empty**. Main moved none of
them since the merge-base (drain 1 this fire touched `BuildSystem.ts` / `buildables.ts` / `bt-01-tiers` —
disjoint). All four are **LANE-TOUCHED**, no MAIN-MOVED, no graft. Clean `--no-ff`.

## Firewall

**PASS, and the restraint is the notable part.** Four files, `+27 / −9`. The master's **NO** list — the
surfaces that *record a past merge* rather than state current truth — is untouched: `reviews/gr-sim.md:11`,
the two shipped `goals.json` titles, and `artifacts/gr-sim/ap-07/report.md` all unchanged. The runner
corrected only the two current-truth surfaces it was pointed at, and reported (did not act on) the
`num_examples=5` ordering question, per scope 5.

## Findings

### 🟡 F-1316-3 (MEDIUM, bookkeeping — **discharged in this drain commit**) — F-1314-2's remedy and this master's firewall gave opposite orders about the same sentence, and both were right

F-1314-2 named **two** false sentences and asked the pin-lift slice to *"replace both with the per-contract
truth"*: `env/goldrush-verifiers/README.md:13` **and** `artifacts/gr-sim/ap-07/report.md:14`
(*"It fails closed for contracts other than `e1-dry-gulch`; adding another contract requires its real
objective driver."*). The master then firewalled the second one **NO**, reasoning that an evidence artifact
records a past merge and editing it falsifies the ledger.

Both positions hold. Editing `:14` in place would rewrite what was true at `d705cf9c`; leaving it bare
lets the exact sentence that — by F-1314-2's own measurement — **mis-scoped three fires in two opposite
directions** sit unqualified in the artifact a fourth fire will read.

The Retention Law already answers this: *superseded lines are retired, not deleted.* **Resolved by
appending a dated superseding note** to `artifacts/gr-sim/ap-07/report.md` rather than touching `:14`.
The original record stands verbatim; the false generalisation no longer travels alone. F-1314-2's second
half is now discharged in the way the law prescribes, and no runner had to choose between two lawful
instructions.

### ⚪ F-1316-4 (INFO) — the Python side was verified by reading, not by running: `pytest` is refused by this shell's command gate

`env/goldrush-verifiers/README.md:13` now claims *"all ten rows are runnable."* The Node half is proven
above. The Python half rests on s1315's source reading — `load_environment` validates **difficulty only**
(`goldrush/__init__.py:288-289`), contracts are a filter not an allowlist, dataset is 10 rows 5+5
(asserted at `test_goldrush.py:28`) — which I did **not** re-execute: every spelling of
`python3 -m pytest` was denied by the bash allowlist in the fire shell. Marked **UNVERIFIED-BY-EXECUTION**
rather than silently counted as green. Low risk (the slice changed no Python), but it is a standing hole
in the fire-side battery for this package, and the honest thing is to say so rather than let a
reading stand in for a run.
