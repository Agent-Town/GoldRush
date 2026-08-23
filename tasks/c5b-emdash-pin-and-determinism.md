# Task c5b-emdash-pin-and-determinism: land the two pins the em-dash sweep moved (lane-c, prefix "fix:")

**FIRE-AUTHORED s2235 (attended review welcome).** Corrective for `c5-emdash-sweep`, which is GATED, GOOD, and HELD on exactly two items — see `reviews/c5-emdash-sweep.md`, findings F-2235-4 and F-2235-5.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.

READ FIRST: `AGENTS.md`; `reviews/c5-emdash-sweep.md` (the whole VERDICT and BLOCKER sections — they contain the measurement you are acting on, so you do not have to re-derive it); `scripts/gr-sim-campaign.test.mjs` around line 164; `scripts/gr-sim.test.mjs` around line 828; `src/sim/HeadlessContractSim.ts:1198` (the `eventLogHash` construction); `src/meta/ContractUnlock.ts`.

## ⚠️ PRE-FLIGHT — BUILD-ON-PREDECESSOR, NOT SAFE-DUPE. READ THIS FIRST.

**`lane/c` is `ahead=1` of main and that commit is `6a7bafb26`, the em-dash sweep. It is UNDRAINED and it is the thing you are building ON. DO NOT reset, DO NOT `checkout -B lane/c main`, DO NOT `clean -fd`.** The ordinary lane pre-flight would destroy it (Mistake #2: w1-03 and polish-02 were lost exactly this way).

Verify the predecessor is present before you touch anything, and STOP if it is not:

```
git -C worktrees/lane-c log --oneline -1        # expect: 6a7bafb26 runner(lane-c): c5-emdash-sweep.md
grep -c "The Rocket Cart, captured" assets/contracts/epoch-1-frontier/contracts.json   # expect: 1
```

If the first does not name `c5-emdash-sweep`, or the grep returns `0`, the lane has been reset and the predecessor is gone: **STOP and report** — do not re-derive the sweep.

Then a cleanliness line, `git -C worktrees/lane-c status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1):** (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. **What still STOPs:** modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — i.e. anything a live drain or a concurrent task could actually own. ⓘ Note the c5 predecessor's own gate wrote `reviews/shots-c5/*.png`; those are regenerated evidence and are covered by the exception.

Then `npm install --no-audit --no-fund` and `npm run build` green before editing.

## Why (measured s2235 at the drain gate, not inherited)

`npm run test:node-guards` on the merged tree is **rc=1, 4 failures**. Two are inherited (F-2234-3, s2234's known main reds). Two are the sweep's, and they were attributed by reverting one variable at a time in the same root:

| Arm | `src/` | `assets/` | Baron determinism |
|---|---|---|---|
| full slice | swept | swept | **FAIL** `fnv1a32:9a7d4dfd` |
| `src/` reverted | main | swept | **FAIL** `fnv1a32:9a7d4dfd` |
| `assets/` reverted | swept | main | **PASS** |
| full control | main | main | **PASS** |

## Scope — exactly two items, both small

1. **F-2235-4 — the missed pin (one line).** `scripts/gr-sim-campaign.test.mjs:164` still pins the pre-sweep text:
   `'Contract "e3-canyon-works" is locked: The Voltage Age awaits — raise the Dynamo Hall.'`
   The runtime string now comes from `src/meta/ContractUnlock.ts` reading `: raise`. Update the pin to the new copy. **Preserve the assertion's INTENT** — it proves a locked contract refuses loudly and names its condition; only the text moves. Do not weaken the regex to a substring or a wildcard to make it pass.
   ⓘ The old string exists **only** in this test file in the whole repo, which is why the runner's `e2e/`-scoped pin sweep missed it. While you are here, grep `scripts/*.test.mjs` for any other pre-sweep copy and report what you find (fix any you find; they are the same class).

2. **F-2235-5 — the determinism re-pin, WITH ITS CAUSE WRITTEN AT THE SITE.** `scripts/gr-sim.test.mjs:828` pins the Baron `eventLogHash` at `fnv1a32:5b1d21f1`; the merged tree produces `fnv1a32:9a7d4dfd`. Re-pin to the new value **and add a comment at the pin naming the cause**, in this shape:

   > re-pinned s<NN> (F-2235-5): `assets/contracts/*` prose is inside `eventLogHash` via `canonicalReplayEvents` — the wave-20 medal event carries `medalBlurb`, which the c5 em-dash sweep rewrote. Gameplay outcome UNCHANGED and verified: kills 862, waves 20, timeMs 528400, gold 0, secured true, defaultedPicks 21, defaultedSecure 1 — only the log hash moved. A copy edit to contract prose is therefore expected to move this pin.

   **You must verify that outcome-unchanged claim yourself before re-pinning — do not copy it from this master.** Run the Baron test and read the assertion diff: if ANY field other than `eventLogHash` differs, this is a real sim regression, **STOP and report** — the re-pin is then wrong and the whole premise of this task is dead.

## Firewall
Touch ONLY: `scripts/gr-sim-campaign.test.mjs` (the one pin), `scripts/gr-sim.test.mjs` (the one pin + its comment), and a BACKLOG row. **NO** changes to: `src/**` (the sweep's src half is gated and innocent — do not "improve" it), `assets/contracts/**` (do not un-sweep the prose to make a hash pass — that reverses the owner's ruling), `src/sim/HeadlessContractSim.ts` (do NOT change what `eventLogHash` covers; that is the design question this task deliberately does not decide), `public/**`, `e2e/**`, `package.json`.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green. `npm run test:node-guards` run **ALONE** (it is ~9 minutes and contends badly): expect **rc=1 with exactly the 2 INHERITED failures** — `blocker-panel-closed-guard` (*"reds on the pre-strike ledger…"*) and the `fixture-teardown` cascade it causes. **Those two are NOT yours and must NOT be cured here** (F-2234-3 is deliberately open and wants an owner of the guard's intent). If you see a third failure, report it — do not chase it.

Report the before/after failure count and name every failure you see.

## No-op / honesty guard
If the Baron re-pin's outcome fields are not identical, **STOP** — do not re-pin, report the diff. Never re-pin to make a red go away; the cause must be named and true (F-1441-3).

End: **READY-FOR-GATES** + report: the two pins moved (old → new verbatim), any other `scripts/*.test.mjs` pre-sweep copy found, the `test:node-guards` failure list before and after, and confirmation that the Baron outcome fields were byte-identical.
