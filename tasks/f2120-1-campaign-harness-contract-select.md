# Task f2120-1: teach the sanctioned campaign harness to select a contract, and to REFUSE loudly when it cannot (lane-a, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2120, from F-2086-1's `RECORDED-NOT-BUILT` clause.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` line 60 (F-2086-1, the finding this cures); `artifacts/f2086-canyon-census/REPORT.md` (the stopped run's own account of what it could and could not establish); `scripts/gr-sim-campaign.mjs`; `scripts/gr-sim-campaign.test.mjs`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**LANE CURRENCY (verified by the author at dispatch, F-1320-2):** `lane/a` contains `0a342bffc` (the harness's only commit) and its `scripts/gr-sim-campaign.mjs` is **byte-identical to main**. Its `assets/contracts/bench-seeds.json` differs from main by exactly +8 lines (`e7-echo-canyon`, `e7-relay-rush`) which this task does not touch; **`e3-canyon-works` is present in the lane's copy with both seeds.** No refresh needed.

## Why (F-2086-1, measured s2086, drained s2087 `fe4949756`; every line below re-verified at source by the author s2120)

F-2086-1 is a **CLASS blocker** in its own words: *"every future E2–E10 census slice hits it, and the failure mode is the dangerous one — the harness **succeeds** and returns numbers about the wrong contracts."* It carries an explicit **`RECORDED-NOT-BUILT`** clause naming the cure — *"widening the harness needs either a `--contract` argument or a relaxed board filter; both edit an existing sanctioned script, which that task's firewall forbade"* — and a standing **`GATE: an E3+ census slice is not authorable until the harness can select its contract.`** It has sat unbuilt for 33 fires.

Verified on main **today**, by reading the files:
- `scripts/gr-sim-campaign.mjs:67-68` — the board is `listBoardContracts()` filtered to `contract.id === 'the-claim' || contract.id.startsWith('e1-')`.
- `scripts/gr-sim-campaign.mjs:186` — the argument parser accepts **only** `['player', 'output', 'checkpoint', 'resume', 'test-fixture']` and throws `Unknown argument` on anything else. There is no contract argument.
- `assets/contracts/bench-seeds.json` — **`e3-canyon-works` IS seeded** (`["e3-canyon-works-01","e3-canyon-works-02"]`; 34 contracts seeded in total, including all four E3s). So the `:78-79` seed requirement is **already satisfied** for the census target and is NOT a blocker.

⚠️ **THE FINDING'S CURE SKETCH IS NECESSARY BUT NOT SUFFICIENT, AND THIS IS THE PART THAT WOULD OTHERWISE BURN YOUR RUN.** Relaxing the filter alone cannot produce an E3 number, because **three** gates stand between the filter and a result and F-2086-1 named only the first:
1. **the board filter** — `:67-68` (named by the finding);
2. **the unlock gate** — `:73` selects only a candidate satisfying `contractUnlockStatus(candidate).unlocked`, and `src/meta/ContractUnlock.ts:22` returns `unlocked:false` for any contract whose epoch is not active. `epochIsActive` is `active.order >= requested.order` (`src/meta/ContractFamilies.ts:1111-1115`), and a fresh profile is epoch-1 — **so `e3-canyon-works` is LOCKED by construction from a default profile**;
3. **the campaign-walk loop** — `:71-74` is a `while(true)` that picks the first unsecured-and-unlocked contract and `break`s when none matches. With the filter widened but the contract locked, the loop **breaks immediately and the harness exits having measured nothing** — which is precisely the silent-wrong-answer failure mode the finding warns about, merely relocated.

## Scope

1. **Add `--contract <id>` to the parser.** Extend the allowlist at `scripts/gr-sim-campaign.mjs:186` and surface the value on the parsed args object alongside the existing keys.

2. **When `--contract` is supplied, the board is exactly that one contract.** Replace the `:67-69` board construction so that the epoch/`e1-` filter applies **only when `--contract` is absent**. The `practice?.scores !== false` filter at `:69` stays in force in both arms.

3. **When `--contract` is ABSENT, behaviour is byte-identical to today.** This is a hard requirement, not a preference: existing baselines must remain reproducible. The control already exists and must pass **unmodified** — `scripts/gr-sim-campaign.test.mjs:62` ("campaign walks E1 legally, persists each leg, and hashes deterministically"), which asserts a 5-leg walk. Do **not** edit that test.

4. **THREE LOUD REFUSAL ARMS — never a silent fallback, never a silent empty run.** This is the substance of the task. When `--contract` is supplied, the harness must exit **non-zero** with a distinct, greppable message before starting any sim, in each of these cases:
   - **unknown id** — not present in `listBoardContracts()`. Message names the id and states that it is not on the board.
   - **unseeded** — no `benchSeeds[id]?.[0]`. Message names the id and says no pinned bench seed exists. (Today `:79` already throws here; make it a pre-flight refusal with the same force, so it fires before any setup work.)
   - **locked** — `contractUnlockStatus(contract).unlocked === false`. Message must include the **`condition` string returned by that call verbatim** (e.g. the "awaits the … era" text), so the operator learns *why* rather than seeing an empty result.
   ⚠️ Under no circumstance may an unresolvable `--contract` fall back to the default board or exit 0 having measured nothing. A wrong number is worse than no number — that is the whole finding.

5. **RESOLVE-AND-REPORT (do not fix): can an E3 census actually be run once selection works?** From source, establish whether the harness's existing `--resume <checkpoint>` path (`:55-61`) can supply a profile in which `epoch-3-voltage` is active, thereby satisfying gate 2 for `e3-canyon-works`. Write the answer with file:line into your report — **yes/no and the mechanism**. If the answer is no, say so plainly and name what would be needed. **Do NOT build an unlock bypass, do NOT call `activateEpoch`, do NOT edit any profile fixture** — see the firewall.

6. **Extend `scripts/gr-sim-campaign.test.mjs`** (do not create a new file — it is already rooted in `test:node-guards`) with coverage for: `--contract` selecting a single named contract; and each of the three refusal arms exiting non-zero with its distinct message. Follow the file's existing spawn+vite fixture pattern and the `--test-fixture` path (`:82-86`) rather than inventing a runner.

7. **No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

**Touch ONLY:** `scripts/gr-sim-campaign.mjs` · `scripts/gr-sim-campaign.test.mjs` · your report under `artifacts/f2120-campaign-harness/`.

**NO changes to:**
- `src/**` — this task changes a factory instrument, not the game. Nothing here may alter sim semantics, and a number produced by a modified sim would be inadmissible anyway.
- `assets/contracts/**` — no new seeds, no contract or epoch edits. `e3-canyon-works` is already seeded; if you believe another seed is needed, STOP and report.
- **Any unlock bypass whatsoever** — no `activateEpoch` call, no forcing `unlocked`, no editing `src/meta/ContractUnlock.ts` or `ContractFamilies.ts`. Scope item 5 is deliberately resolve-and-**report**: making a locked contract run is a sim-semantics decision with canon reach and is not yours or mine to take.
- `scripts/gr-sim-campaign.test.mjs:62` ("campaign walks E1 legally, persists each leg, and hashes deterministically") and the other two existing tests — they are the backward-compatibility control for scope item 3. Extend the file; do not edit existing assertions. If one of them legitimately must change, that is a STOP-and-report, not a fix.
- `scripts/gr-sim-campaign.fixture-player.mjs` — the shared fixture player is used by the existing tests; changing it would contaminate the control.
- No other file under `scripts/`, and no `e2e/**`, `tasks/**`, `specs/**`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `node --test scripts/gr-sim-campaign.test.mjs` — all tests green, including the three pre-existing ones **unmodified**. Paste the pass/fail counts.
- `npm run test:node-guards` green (this is the battery `gr-sim-campaign.test.mjs` is rooted in). ⏱️ Budget ~405 s and **run it ALONE** — it is the slow battery (472 tests / ~404.7 s measured s2099); do not overlap it with another suite.
- Demonstrate each of the three refusal arms by actually invoking the harness and pasting the **exact stderr line and exit code** for each. A refusal arm asserted only in a test but never observed at the command line is not evidence.
- Demonstrate the default arm is unchanged: run the harness with no `--contract` and show the 5-leg walk still produced.
- Report to `artifacts/f2120-campaign-harness/REPORT.md`, including scope item 5's yes/no with file:line.
- No screenshots or perf table required — this task renders nothing.

End: **READY-FOR-GATES** + report: (a) the three refusal messages verbatim with exit codes; (b) whether the default board is provably unchanged and how you proved it; (c) scope item 5's verdict — can `--resume` supply an E3-active profile, yes/no, with file:line; (d) anything you found adjacent and did NOT fix.
