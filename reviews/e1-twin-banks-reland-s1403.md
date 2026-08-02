# e1-twin-banks re-land (f1400-1) — s1403 drain gate

**Slice:** `f1400-1-twin-banks-rebase-and-repin` (MAIN slot, fire-authored s1400)
**Run:** `tasks/runs/20260802-204650-main-f1400-1-twin-banks-rebase-and-repin.md.log` (9,663 lines)
**Base:** main `91a4473e` · **Salvage:** `save/f1400-1-twin-banks-reland-s1403` @ `2a54c386`
**Gate:** s1403 fire, 2026-08-02

## VERDICT: REFUSED — NOT MERGED. Work salvaged, nothing lost.

The graft is **correct**. The slice is refused on **one defect**: its pinned secure-run hash
does not reproduce anywhere except inside the Codex runner's own process.

---

## What it does

Re-lands lane/m3's twin-banks headless driver onto current main as 98 additions / 4 deletions:
adds `'e1-twin-banks'` to `SUPPORTED_CONTRACTS` (the entire `src/` change is that one line),
converts the twin-banks call sites to the post-`372808f0` object-boot form, and adds a
behavioural test asserting declared crossings, gravel bars, build zones, `twist.secureWave`
posting at wave 20, two-run determinism, and the five pinned bench seeds.

## Scope conformance — verified by READING, not by the runner's report

| # | Scope item | Verdict |
|---|---|---|
| 1 | Graft (not raw checkout) of the two BOTH-MOVED files | ✓ VERIFIED — `constructor(readonly boot: HeadlessContractBoot)` intact at `HeadlessContractSim.ts:127`; main's escort test intact at `gr-sim.test.mjs:86` |
| 2 | Zero positional call sites | ✓ VERIFIED — all 5 sites object-form (`gr-sim.test.mjs:86,145,210,237`, `gr-sim.mjs:33`); zero `new HeadlessContractSim('` in `scripts/ src/ env/` |
| 3 | Re-derive and pin the measured hash | ✗ **FAILED** — see below |
| 4 | Explain the discrepancy | ⚠️ Explained, but the explanation is contradicted by measurement |
| 5 | Keep every behavioural assertion | ✓ VERIFIED — crossings, build zones, `twist.secureWave` (`:192`), two-run determinism (`:246`), 5 bench seeds |
| 6 | Explicit timeout | ✓ VERIFIED — `{ timeout: 45_000 }` at `:174` |
| — | TOUCH-ONLY firewall | ✓ VERIFIED — exactly the 4 authorized paths; other dirt is `logs/*` factory churn |

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc 0** |
| `npm run build` | **green**, 2,168 modules, 1.48s |
| `node --test scripts/gr-sim.test.mjs` | **6 pass / 1 fail** (×3 runs) |
| same, isolated (`--test-name-pattern`) | **0 pass / 1 fail** |
| `npm run test:node-guards` | **229 pass / 1 fail**, exit 1 |
| direct probe, warm vite cache | `bfd79d2a` |
| direct probe, **cold** vite cache | `bfd79d2a` |
| direct probe, detached worktree @ salvage | `bfd79d2a` |

**The single failure, eight times over:**

```
actual:   ... eventLogHash: 'fnv1a32:bfd79d2a'
expected: ... eventLogHash: 'fnv1a32:5f57f7be'
```

Every other outcome field matches the runner's report **exactly**
(`secured:true, waves:20, timeMs:600000, gold:0, kills:189, calls:0`). The behaviour is not
in question — only the event-log hash is.

## F-1403-1 🔺 BLOCKER — the twin-banks pin reproduces in the runner's process and nowhere else

This is **not** the stale pin F-1400-2 described, and it must not be filed as one. F-1400-2's
theory was "a late edit after measuring". That theory is now **refuted**: the runner ran the
full file twice at the end of its session (log `:6623`, `:7218` → `tests 7 / pass 7 / fail 0`)
and then `npm run test:node-guards` (log `:7711` → `tests 230 / pass 230 / fail 0`), and it
made **no edits after those runs** (no `apply_patch` after log `:7540`). Its greens are real
output, printed in the log, including a direct transcript at log `:2814`.

And the tree it measured is byte-for-byte the tree I measured: the four files carry mtime
`2026-08-02T13:48:15Z` (20:48 local, mid-run) and were untouched afterwards.

**So the same tree yields `5f57f7be` in the runner's process and `bfd79d2a` in every other
process.** Hypotheses eliminated, each by measurement or by reading the code:

| # | Hypothesis | How it died |
|---|---|---|
| 1 | Fire-shell CPU ceiling (F-1269-1) skews the sim | **Read the code**: `advanceToTurn()` (`:241–256`) is a pure fixed-step loop; `performance.now()` only accumulates `advanceCpuMs`, never reaching control flow. Confirms s1400's claim. |
| 2 | Timing/clock inside the hash | **Read the code**: `outcome()` (`:269`) hashes contractId, seed, replayEvents, economy log, standing orders, final state. No clock. |
| 3 | Test-order / leaked global state | **Measured**: isolated single-test run still `bfd79d2a`. |
| 4 | Different node or shell | **Measured**: fire shell and `/bin/zsh -lc` both `v26.4.0` at `/opt/homebrew/bin/node`. |
| 5 | Tree drifted after the run | **Measured**: mtimes show the four files untouched since mid-run. |
| 6 | Performance tier differs | **Read the code**: the override reads `localStorage`, unavailable in node, so detection returns `full` in *any* node process. |
| 7 | Wrong harness | **Measured**: the runner's *own* command, `npm run test:node-guards`, gives me 229/230. |
| 8 | Stale vite dep cache | **Measured**: cleared `node_modules/.vite`, re-ran → still `bfd79d2a`. |

**Positive control — my instrument is faithful.** On main the bench's other pinned hash is
the-claim's `fnv1a32:02561b7f` (`gr-sim.test.mjs:162`); my probe measures **exactly
`02561b7f`**. So this environment reproduces the bench's pins in general; it is not
systematically divergent, and that is what makes the twin-banks disagreement reportable
rather than merely suspicious.

⚠️ **The honest limit of that control, stated against my own verdict:** the-claim is a
different contract exercising different systems — twin-banks adds fords, gravel bars and
crossings that the-claim never touches. The control proves my instrument is faithful *for
the-claim*; it does **not** prove it is faithful for twin-banks' extra systems. I therefore
cannot rule out that the runner's environment is the correct one and mine is subtly wrong.
**That uncertainty is exactly why this is refused rather than repinned.**

## Why I did not simply correct the pin

I measured the value eight times and could have pasted `bfd79d2a` and merged. I did not:

1. **Nobody knows which value is true.** A determinism gate whose two observers disagree is
   not a determinism gate. Pinning *either* value ships a hash that is false somewhere.
2. **It would ping-pong.** Pin `bfd79d2a` and the next Codex run reds and "corrects" it back
   to `5f57f7be` — the same two-fire loop, now with a guard enforcing it.
3. **The gate does not get to edit the slice's substance.** Scope 3 exists precisely because
   pasting a number to turn a test green is the defect this task was created to cure.

## Disposition

- **Salvaged, not lost.** The graft was uncommitted main-slot working-tree dirt; reverting it
  would have destroyed it. It is committed at `save/f1400-1-twin-banks-reland-s1403`
  (`2a54c386`, parent = main `91a4473e`) **before** main's tree was restored. Restore verified
  by blob hash in both directions (worktree == main, salvage != main, all four paths) — per
  F-1295-1, `git status` alone cannot tell "reverted" from "committed out from under you".
- **Main's working tree is clean.** The main slot is unblocked.
- **Reference dump banked:** `artifacts/twin-banks-probe-s1403-fire.json` — the full hash
  inputs (957 replay events, economy log, final state) as measured on this side.
- **Instrument shipped:** `scripts/twin-banks-hash-probe.mjs`.
- **Corrective:** `tasks/f1403-1-diagnose-the-twin-banks-hash-divergence.md`, leaf registered.

## Findings

- **F-1403-1** 🔺 BLOCKER — the twin-banks pinned hash reproduces only in the runner's
  process; eight measurements against two, eight hypotheses eliminated, positive control
  passing. Supersedes F-1400-2's "stale pin" reading. Corrective authored.
- **F-1400-1** — remains CLOSED by this graft (call sites correct); the graft is reusable
  as-is from the salvage branch.
