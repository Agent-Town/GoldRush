# Task f2131-1-picnic-enable-key: the picnic hold must know which contract it belongs to (lane-b, prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2131, 2026-08-21.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST:
- `AGENTS.md`
- `reviews/b4v3-picnic-active-defense.md` — the drain that found this, with the full bisection.
- `tasks/b4v3-picnic-active-defense.md` — the master whose output this re-lands.
- The BACKLOG row for **F-2090-1**, which predicted this exact defect one slice early:
  *"`isEnabled` then needs a new key (`holdStake:true`) or `stakeMarkers.length >= 2`, since it
  currently *counts* `heroStart` markers."*
- The reverted content itself: `git show e6aa6e073` (the merge) and `git show 6c5f8a7a2` (the revert).

## WHY — quoted evidence, not a hunch

The b4v3 slice was merged at `e6aa6e073` on a complete green battery and **reverted at `6c5f8a7a2`**
the same fire, because its enable-key is not contract-scoped:

```ts
static isEnabled(markers: readonly ContractStakeMarker[]): boolean {
  return markers.filter(({ heroStart }) => heroStart).length >= 2;
}
```

Exactly two shipped contracts satisfy that predicate:

| contract | heroStart markers | epoch | status |
|---|---:|---|---|
| `e6-picnic` | 3 | epoch-6-atomic | intended, NOT admitted |
| `e10-last-claim` | 3 | epoch-10-deepsky | **NOT intended, and ADMITTED** |

So `e10-last-claim` silently gained the picnic quarter-of-enemies stake-pressure targeting **and the
picnic loss condition** (`onAllClaimed -> postHeroDeath`). Measured on the audit's own reachability
table, deterministic 2 runs per arm in one worktree: **`e10-last-claim` terminates in 2 turns where
main takes 5.**

The b4v3 master forbade precisely this — *"hold-consumer-gated — no other contract's behavior may
move"*, and its NO list names *"global targeting for other contracts"*. This is not the implementer's
error: the key was inherited from the v1 WIP, which predates the ruling.

## Pre-flight — RE-LAND ON A REVERTED MERGE (read this, it is not the usual shape)

`lane/b` is fully absorbed into main's history (`git log main..lane/b` is empty) and its tip is
archived at `archive/lane-b-s2131-b4v3-absorbed-2cc5a1d4b` (`2cc5a1d4b`). **Because main carries a
REVERT of that merge, re-merging the lane will bring back NOTHING** — git considers those commits
already merged. You must **revert the revert**:

```
git revert --no-commit 6c5f8a7a2      # restores the whole b4v3 stack onto your lane
```

**Refresh the lane first — this is SAFE-DUPE-verified and the reset is authorised.** At authoring
time `node scripts/lane-usable.mjs lane-b` read **`USABLE`**, `ahead=0 behind=25`, no tracked dirt:
the whole b4v3 stack is already in main's history and its tip is archived, so the lane holds nothing
main has not absorbed. Re-run that command yourself; if it does NOT say `USABLE`, **STOP** and report
— something landed after this master was written.

```
node scripts/lane-usable.mjs lane-b        # must print USABLE; STOP if not
git fetch origin && git reset --hard main  # lane now carries the revert 6c5f8a7a2
# restore the CODE ONLY, from the merge commit that the revert undid:
git checkout e6aa6e073 -- src/systems/PicnicHoldSystem.ts src/sim/HeadlessContractSim.ts \
    src/game/Game.ts src/entities/pools.ts src/agent/MechanicsManifest.ts \
    e2e/e6-picnic-hold.spec.ts e2e/er01-e6-census.spec.ts
```

⛔ **DO NOT use `git revert --no-commit 6c5f8a7a2`. Attempt 1 of this task did exactly that, on my
instruction, and it CONFLICTED — correctly — in `tasks/BACKLOG.md`** (run
`20260821-151824-lane-b-f2131-1-picnic-enable-key.md.log`; the runner aborted and stopped per the
honesty guard, 44,298 tokens, zero damage, lane left clean). **That was an authoring defect in this
master, not a lane problem (F-2131-5):** `6c5f8a7a2` reverts eight paths *including* `tasks/BACKLOG.md`,
and s2131 rewrote that file afterwards (the picnic narrative row and the F-2131-1 desk row), so
reverting it wholesale is guaranteed to collide with rows that must NOT be rolled back. The
path-scoped `checkout` above restores byte-identical code and leaves every ledger row alone.

Verify the restore before building — it must reproduce the merged tree exactly for those paths:

```
git diff e6aa6e073 -- src/ e2e/    # MUST be empty; if not, STOP and report
```

Then fix the key on top. Verify before you build:
`src/systems/PicnicHoldSystem.ts` and `e2e/e6-picnic-hold.spec.ts` must exist again.
`npm install --no-audit --no-fund`; build green. FACTORY-CHURN EXCEPTION (F-1407-1) as usual.

## Scope

1. **Re-land the b4v3 stack** by reverting the revert, as above. No content changes in this step —
   prove it with `git diff 2cc5a1d4b -- src/systems/PicnicHoldSystem.ts` being empty.
2. **Give the hold a contract-scoped enable key.** The shape is yours to choose and to justify in
   the report, but it MUST NOT be a property that any other contract can satisfy by coincidence.
   Two candidates, both pre-approved:
   - a new explicit marker key (`holdStake: true`) declared only on `e6-picnic`'s stake markers, or
   - an explicit contract-level declaration (a `picnicHold` twist/param) read the way the sim's other
     sockets read theirs.
   Whichever you pick, **`e10-last-claim` must not construct an enabled `PicnicHoldSystem`.**
3. **Prove the isolation by measurement, not by reading.** Regenerate `docs/bench/same-game-audit.md`
   and show `e10-last-claim` reads **5 turns**, matching main. Report the row verbatim in both arms.
4. **Gate the ungated diagnostics field.** In the final snapshot (`HeadlessContractSim`, the object
   whose neighbours read `crawler: … ?? null`, `atomic: … ?? null`), the slice shipped a bare
   `picnicHold: this.picnicHold.diagnostics`, which is `[]` off-contract where every sibling is
   `null`. The A10 comment immediately below it states the rule: *"null off every other contract,
   exactly like its neighbours, so no admitted contract's determinism hash grows a field."* Make it
   match. ⓘ **Honest note: I tested this in isolation and it is NOT what moved e10-last-claim** —
   gating it alone left the run at 2 turns. Fix it because it violates the stated convention, not
   because it is the regression.
5. **Add the regression test that would have caught this.** A node guard asserting that
   `PicnicHoldSystem.isEnabled()` is true for `e6-picnic` and false for **every other contract in
   every epoch** — driven from the contract JSON, so it keeps working when contracts are added.
   Prove it fails on the old key by manufacturing the defect (the s1299/s1300 standard: a passing
   guard never executes its violation path, so its green is not evidence about its red).

## Firewall

Touch ONLY: `src/systems/PicnicHoldSystem.ts`, the two engines' picnic construction/enable sites,
the `e6-picnic` contract block (the enable key ONLY — no balance, no anchors), the new guard script
and its `test:node-guards` rooting, `docs/bench/same-game-audit.md` (regen), the b4v3 e2e spec if the
key change touches its setup, BACKLOG row.

NO: the contest predicate's semantics (the owner's ruling stands exactly as built — see below);
`e10-last-claim`'s own contract data; global targeting; WrangleSystem; balance values; hero-start
selection; admission/door state for e6-picnic (it stays REFUSED — see below).

## What this task does NOT do, and must not drift into

**Admission stays refused.** F-2131-1's other half is unresolved and is an OWNER FORK: the headless
idle floor is armed (`heroShooter.enabled = () => !this.dead && this.weapon === 'rig'`, no policy
term), so an idle hero auto-fires and refreshes the active-defense window forever. That is why b4v3
reached a Law-2 STOP. **Do not attempt to fix the idle floor here and do not flip admission.** If
your isolation work happens to make idle lose, report it as a surprise and STOP — do not admit.

## Self-check

`npx tsc --noEmit`; `npm run build`; **full `test:node-guards`** (the diff touches `src/sim` and
`src/systems` — run it SOLO, it is ~405 s and contends; bracket with `pgrep`); `e6-picnic-hold` both
projects; `er01-e5` + `er01-e6` + `ap16-4` both projects; plain boots ×2 viewports, zero console/page
errors; the audit regen showing `e10-last-claim` at 5 turns.

⚠️ Two reds are KNOWN-ENVIRONMENTAL and are not yours if they appear:
`node-guards-contention` (fires whenever a second battery runs concurrently) and `fixture-teardown`
(its cascade). Fingerprint-match them with proof; never re-pin to silence them.

End: **READY-FOR-GATES** + report: the enable key you chose and why, the `e10-last-claim` audit row in
both arms verbatim, the new guard's manufactured-defect proof, gate counts.

## No-op / honesty guard

If the revert-of-the-revert does not restore the stack cleanly, STOP and report the conflict — do not
hand-reconstruct the slice from the diff. If a contract-scoped key turns out to be expressible only
by changing contract data the firewall forbids, STOP and name what you would need.
