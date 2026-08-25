# Task f2289-1: diagnose why the recorder and the assayer hash the same input stream differently (lane-a, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome) — s2290.**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`. DIAGNOSTICIAN ONLY — this task **finds and proves the cause**. It does **not** cure it.

READ FIRST: `AGENTS.md`; `reviews/gauntlet-heat5b-reearn.md` (the fire that measured the divergence — its F-2289-1 and F-2289-2 sections); `src/game/RunTape.ts` (the hash function); `src/agent/StandingOrders.ts` (the thing being hashed); `scripts/gr-sim.mjs` and `scripts/assay-replay-agent.mjs` (the two call sites).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then a cleanliness line: `git -C worktrees/lane-a status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`.** What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

SEQUENCING: this task depends on the heat-5b evidence being on main. Verify before starting:
`git log --oneline | grep -q 'gauntlet-heat5b-reearn'` → must match. If it does not, **STOP and report "heat5b evidence not landed"** — do not improvise the artifacts.

## Why (F-2289-1, measured by fire s2289 2026-08-25, re-verified and merged by s2290 at `77c85566a`)

The county's own door **rejected an honest win**. Hill Mine's winning submission came back
`"assay":"rejected","assayReason":"eventLogHash mismatch: claimed fnv1a32:a45ba9ac, replayed fnv1a32:85cb8a01"`.
s2289 verified by measurement that the win was real: the RAW uncurated
`artifacts/gauntlet-heat5b-20260825/e2-hill-mine/attempt-10-tape.json` — which claims `a45ba9ac` —
replays on main to `85cb8a01` with the outcome matching exactly. The tape was then *curated* to
carry the replayed hash and resubmitted (F-2289-2: the rejection message discloses the replayed
value, so the check is an oracle). **That papering-over is the reason this defect has never been
diagnosed: the one signal it exists to produce is the signal the workaround destroys.**

⚖️ **Severity, stated so you do not over-read it: this cannot fabricate a win.** The outcome is
recomputed from the input stream, so no checksum edit turns a loss into a secure. The cost is that
an honest win was refused by its own county — and that a real disagreement between two pieces of
repo code has been routed around instead of understood.

**The divergence is CONDITIONAL, which is what makes it cheap**: Night Shift (one scored launch)
claims `889d9357` and replays `889d9357`. Hill Mine (attempt 10 of a 10-attempt campaign) does not.

### Verified facts — established by reading main at s2290, quote these, do not re-derive them

- Both endpoints call the **same function on the same input**: `agentOrdersEventLogHash(snapshotStandingOrders())` — the writer at `scripts/gr-sim.mjs:260`, the reader at `scripts/assay-replay-agent.mjs:174`.
- That function is `src/game/RunTape.ts:271` `export function agentOrdersEventLogHash`. It hashes **only** `orders.log` entries of `type === 'orders_replaced'`, with `at` and `seq` **stripped**.
- ➡️ **Therefore this is NOT two hash implementations disagreeing.** One function, one input shape, two results ⇒ **`snapshotStandingOrders()` must be returning a different set of `orders_replaced` events in the two contexts.** That is the question this task answers.
- `snapshotStandingOrders()` (`src/agent/StandingOrders.ts:477`) reads a **module-level `installedExecutor`** and returns `{ needsRider: false, orders: [], log: [] }` when none is installed — i.e. an **empty log is a reachable, silent state**, not an error.
- `resetStandingOrders()` (`src/agent/StandingOrders.ts:481`) exists and is called by `scripts/gr-sim-campaign.mjs:91` and `src/agent/Embodiment.ts:86`. **Neither `gr-sim.mjs` nor `assay-replay-agent.mjs` calls it.**
- The log carries other event types too — `orders_rejected` among them (`src/agent/StandingOrders.ts:60`) — and `gr-sim.mjs` has a rejection path that writes `gr-sim rejected orders: <reason>` to stderr.

## Scope

1. **Reproduce the divergence and pin it to a minimal case.** Replay the raw Hill Mine tape and confirm the claimed-vs-replayed split still holds on current main; do the same for Night Shift and confirm it agrees. Record both hashes and both outcomes. **If the split does NOT reproduce, that is a complete and valuable answer — say so with the numbers and stop at scope 1**, noting what on main changed since `77c85566a`.

2. **Dump both `orders_replaced` sequences and DIFF them.** For the diverging case, capture `snapshotStandingOrders().log` filtered to `orders_replaced` (post-`at`/`seq`-strip, exactly as the hash sees it) from **both** the recording path and the replay path, and write both to `artifacts/f2289-1-<date>/`. **The diff IS the finding.** State precisely how they differ: extra entries, missing entries, reordered, or same count with different content — and at which index the first difference falls.

3. **Name the mechanism, and prove it.** Test the hypotheses below **as hypotheses** — each one is a lead from reading the code, not a conclusion, and refuting one is as valuable as confirming it. Do not stop at the first plausible story; the diff from scope 2 is the arbiter.
   - **(H1) Cross-attempt accumulation.** `installedExecutor` is module-level and neither call site resets it. A 10-attempt rider in one process could carry earlier attempts' `orders_replaced` events into attempt 10's snapshot, while a 1-attempt run cannot. This would explain the conditionality exactly. **Check whether the campaign that produced attempt 10 ran its attempts in one process or ten.**
   - **(H2) Rejected orders counted on one side only.** The recorder observes every order the rider *attempted*; the replay applies only what the tape *retained*. If a rejected or partially-applied order still appends an `orders_replaced` event during recording, the recorder's log is a superset.
   - **(H3) Terminal-instant boundary.** `gr-sim.mjs:250–259` documents a real off-by-one at the terminal tick (F-ASSAY-E2E-2). If the last order lands at the boundary, the replay may end before applying it — note `assay-replay-agent.mjs` already throws on an unreached order, so check whether that arm is silent here.
   - **(H4) Empty-log fallback.** `snapshotStandingOrders()` returns an empty log when no executor is installed. Confirm the replay path really has one installed; an empty log hashes to a stable value that would look like a legitimate answer.

4. **Quantify the blast radius.** How many retained tapes on main claim a hash their own replay does not reproduce? Sweep `artifacts/**` for agent tapes with an `eventLogHash`, replay each, and report a table: total / agree / diverge / unreplayable. **This tells the owner whether F-2289-1 cost the county one standing or many.**

5. **Write the diagnosis memo** to `artifacts/f2289-1-<date>/diagnosis.md`: the reproduction, the diff, the mechanism with its proof, each hypothesis marked CONFIRMED or REFUTED with its evidence, the blast-radius table, and **a priced recommendation for the cure — described, not implemented**, naming the file and the function that would change and what would have to be true for it to be safe.

## Firewall

Touch ONLY: `artifacts/f2289-1-*/**`, `tasks/BACKLOG.md` (your row). Probe scripts you need go in `artifacts/f2289-1-*/` alongside their output, **not** in `scripts/` — `scripts/` is a run surface and a one-shot probe there degrades `lane-usable`'s drift signal (F-1665-1).

NO changes to: `src/game/RunTape.ts` · `src/agent/StandingOrders.ts` · `scripts/gr-sim.mjs` · `scripts/assay-replay-agent.mjs` · `functions/api/standings.ts` · any other `src/**`, `scripts/**`, `e2e/**` · sim semantics · existing e2e assertions · any retained tape under `artifacts/gauntlet-*/` (read them, replay them, **never rewrite one** — a curated tape is how this defect got buried the first time).

⚠️ **This firewall is the point of the task, not an obstacle to it.** You will very likely find the cure obvious once the mechanism is proven. **Write it in the memo and do not apply it.** A cure authored in the same breath as its diagnosis has never been reviewed against the diagnosis, and this defect already has one workaround shipped on top of it.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean and `npm run build` green — both must remain untouched-green, since this task changes no code; if either moves, you have edited something the firewall forbids. No spec is added or modified, so **no e2e suite should change**: `git status --short` at the end must show changes only under `artifacts/f2289-1-*/` and `tasks/BACKLOG.md`. Every hash you report is one you produced yourself, with the exact command that produced it written beside it. Every claim about which side has which entries is backed by the dumped logs committed under `artifacts/f2289-1-<date>/`.

End: **READY-FOR-GATES** + report: (a) did the divergence reproduce, with both hashes; (b) the first-differing index and the shape of the difference; (c) which hypothesis is CONFIRMED and which are REFUTED, each with its evidence; (d) the blast-radius table; (e) the priced cure recommendation, unimplemented.

## No-op / honesty guard

If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate. A proven "the divergence does not reproduce, here is what changed" is a complete answer and must be written up as one, not reported as a failure. Likewise, a hypothesis you REFUTE is a result: record it with its evidence so the next fire does not re-test it. **Never curate, rewrite, or regenerate a tape to make a hash agree** — that is the workaround this task exists to undo.
