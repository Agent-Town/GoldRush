# Review — door-tick-ceiling-v2 (the two-site ceiling)

**Slice:** `door-tick-ceiling-v2` · **branch:** `lane/c` · **tip:** `0add68c96` · **base:** `main` @ `36e2004b3`
**Drained by:** s2280 fire, 2026-08-24 · **merged at:** `d8cae3c3bed0707fba400fe9b068a0d2e34b9e31` · **gate worktree:** detached `gate-s2280/` (§3.0b — undecided content never entered main's working tree)

## VERDICT: MERGE

The re-authored master's whole point — that the 18,000-tick ceiling is enforced at **two** sites and both must move together or not at all — is satisfied, and the proof is a controlled experiment rather than a claim.

## What it does

`MAX_PLAYBOOK_TICKS` stops being one global constant answering two different questions. It remains the **browser recorder's DoS bound**, unchanged at 18,000 and still applied by `validatePlaybook`'s default parameter — so `parsePlaybookText`, the path a browser feeds, is byte-for-byte as bounded as it was. A new `maxRunTapeTicksForContract(contractId)` derives a **per-contract** lawful duration from each contract's own semantics (secure wave, wave cadence, a six-wave boss grace, plus the terminal-instant entry seam) and floors it at 18,000, so no contract ever gets a *smaller* ceiling than today. The two enforcement sites — the county door (`functions/api/standings.ts` `validTapeInput`) and the assayer (`src/game/RunTape.ts` `validateRunTape`) — now both read that one function, which is exactly the coupling v1 stopped for lacking.

The 413 body-size disposition is renamed `payload_too_large` → `reel_too_large` **on the standings endpoint only**, with a message that names the cure ("Submit compact JSON without whitespace").

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **green**, ✓ built in 1.20s |
| `node scripts/test-standings.mjs` | **green — both arms**: `standings assay kv checks passed (132)` · `standings assay sqlite checks passed (132)` |
| `node scripts/test-stats.mjs` | green — `stats worker checks passed (87)` |
| `node scripts/test-ledger-worker.mjs` | green — `ledger worker HTTP contract checks passed (15)` |
| `test:node-guards` (required: diff touches `src/`) | **6 of 7 legs PASS**; 1 leg reds on one inherited test — see **Battery** below |
| **THE CURE'S OWN GATE** — stranded night-shift tape | **rc=0 `secured:true, waves:25, timeAlive:750.033`** |
| CONTROL — same tape, same command, pre-merge `main` | **rc=1 `assay replay failed: malformed tape`** |

### The cure proven by a controlled experiment

`node scripts/assay-replay-agent.mjs artifacts/gauntlet-heat5-20260824/e1-night-shift/winning-tape.json`

- on **pre-merge main**: `rc=1`, stderr `assay replay failed: malformed tape`
- on the **merged tree**: `rc=0`, `{"outcome":{"secured":true,"waves":25,"gold":115,"timeAlive":750.033},"ticks":23101}`

Same tape (`durationTicks: 22501`, `contract: e1-night-shift`), same command, same shell minutes apart — the merge is the only variable. This is the gate v1 could not reach in scope, and it is now met.

### Battery: `test:node-guards`, run ALONE, leg-by-leg

Run leg-by-leg rather than as one `&&` chain, because an `&&` battery reports a **floor**, not a count:

| leg | result |
|---|---|
| `run-node-guards.mjs` (≈90 files) | **FAIL rc=1**, 492.8 s — exactly one failing child |
| `test-ticker-stats.mjs` | PASS |
| `test:findings-state` | PASS |
| `test:blocker-panel` | PASS |
| `test:ruling-propagation` | PASS |
| `test:desk-declaration` | PASS |
| `nul-audit.mjs` | PASS |

The single failing child is `scripts/blocker-panel-closed-guard.test.mjs`. **It is INHERITED, and that is proven by control rather than inherited from the runner's say-so** (the runner asserted it "reproduces unchanged on clean current main"; Mistake #4 says verify):

```
# CONTROL — repo root, main WITHOUT this merge:
$ node --test scripts/blocker-panel-closed-guard.test.mjs
✖ reds on the pre-strike ledger that manufactured the owner directive, greens on the struck one
  AssertionError: panel rows: 7 / rows with an F-ID: 7 / census closed: 176 / closed-on-panel: 0
  0 !== 1   at blocker-panel-closed-guard.test.mjs:47
```

Same assertion, same numbers, on a tree this slice has not touched. Node v26.4.0 (matching `.nvmrc`, so per-test budgets are consulted), `--test-concurrency=1`.

**Environment note:** `test:node-guards` could not be invoked by npm script name from the fire shell's bash allowlist, so the same set was run through `node` directly — the gate denies the fire, not the factory.

### The E1 ceiling table, re-derived independently

Re-computed from `assets/contracts/**` + `Balance.waves.waveInterval = 30` rather than copied from the runner's report; all six agree with the pinned test:

| contract | ceiling |
|---|---|
| `the-claim` | 18,000 |
| `e1-drill-yard` | 18,000 |
| `e1-dry-gulch` | 18,001 |
| `e1-night-shift` | **22,501** |
| `e1-twin-banks` | 18,001 |
| `e1-baron` | 20,349 |

### The DoS bound survives — the master's one "bad cure" condition

`scripts/test-standings.mjs` now pins `MAX_PLAYBOOK_TICKS === 18_000` ("browser recorder keeps its ten-minute DoS bound") and asserts **both** validators accept 22,501 and refuse 22,502 for night-shift. The bound is not raised and not deleted; it is scoped. Note also that a longer duration does not widen the byte surface — `MAX_TAPE_BYTES` (64 KB) and the 2,000-entry cap are untouched, so the abuse door does not grow with the clock.

## Merge classification

Base `36e2004b3`; three-way `--no-ff` merge of the gated commit `0add68c96` itself. **No conflicts.**

| file | class |
|---|---|
| `functions/api/standings.ts` | LANE-TOUCHED (main had not moved it since the lane's base) |
| `src/playbook/PlaybookFormat.ts` | LANE-TOUCHED |
| `src/game/RunTape.ts` | LANE-TOUCHED |
| `scripts/test-standings.mjs` | LANE-TOUCHED |

`STATUS.md` and `tasks/BACKLOG.md` appear in the two-dot diff `main..lane/c` but **not** in the lane's own commit — they are MAIN-MOVED and were correctly left alone. The runner explicitly declined the BACKLOG edit because main had moved that whole-file ledger concurrently (the right call under F-2273-2, since a path-scoped add is still whole-file); the drain writes that row instead.

## Findings

### F-2280-1 — the per-contract table reads ONE epoch bundle; the door admits TEN (non-blocking, spawns a corrective)

`DURATION_CONTRACTS` in `src/playbook/PlaybookFormat.ts` is built from `assets/contracts/epoch-1-frontier/contracts.json` alone, while `functions/api/standings.ts` assembles `CONTRACT_EPOCHS` from **ten** bundles (frontier, steamworks, voltage, motor, deepwater, atomic, signal, orbital, redfields, deepsky). Any non-E1 contract therefore falls through to the 18,000 default.

Measured across all 10 bundles / 42 contracts, applying the slice's own formula, **4 contracts are structurally unwinnable through the public door for exactly the F-2276-1 reason**:

| contract | needs | effective |
|---|---|---|
| `e2-trestle` | 23,144 | 18,000 |
| `e2-incline` | 21,601 | 18,000 |
| `e3-canyon-works` | 18,001 | 18,000 |
| `e4-dust-flats` | 18,001 | 18,000 |

**This is NOT a regression and does not block the merge** — it is precisely today's behaviour, preserved, and the master scoped its table to "the six E1 contracts" deliberately (E1 is launch week). But the cure generalises for free: the formula already handles cadence and baron waves correctly for these contracts; only the bundle list is narrow. Recorded as a corrective rather than fixed in the drain, because widening the import set is a code change with its own gates and belongs to a task, not to a merge.

### F-2280-2 — the cure is complete on the AGENT path and still capped on the BROWSER path (non-blocking, by the master's own design — but it bounds what F-2276-1 can claim)

`MAX_PLAYBOOK_TICKS` has more readers than the two sites this slice re-pointed. `src/game/RunTape.ts:129` — `RunTapeRecorder.record()` — still truncates at the flat 18,000:

```
if (this.tick >= MAX_PLAYBOOK_TICKS) return this.truncate('max-ticks');
```

`grep` for `new RunTapeRecorder` matches exactly one construction site, `src/game/Game.ts:7128` — i.e. this is the **browser** recorder, and `src/playbook/PlaybookSession.ts:148` carries the same flat cap. The master ordered that bound preserved ("leave the browser recorder's DoS bound intact"), so **the runner did exactly what it was told and this is not a defect in the slice.** It is recorded because it bounds the claim the cure can make:

- **MEASURED:** the heat-5 winning tape carries `durationTicks: 22501` with `truncated: null` and `meta.buildId 4c5ca6609` — a shape `RunTapeRecorder` cannot emit past tick 18,000, so it came from the headless harness. The agent path is the one heat-5 exercised and the one this drain proves end-to-end.
- **BY CODE READING (not executed):** a browser rider whose night-shift run passes tick 18,000 gets `truncation = {reason:'max-ticks', atTick:18000}`. `validTapeTruncation` (`functions/api/standings.ts:1081`) *accepts* that shape, so the door admits it — but the assayer then replays only 18,000 ticks and cannot reproduce a wave-25 secure, so the row would be refused on outcome mismatch rather than on `invalid-duration`.

So F-2276-1 is cured **for the harnesses that actually ride the county gauntlet**, and for a browser-played night-shift the refusal moves rather than disappears. This is worth the owner's attention precisely because it is the argument for desk option **(c)** (change the secure condition), which would close both paths at once; options (a) and (b) close only the agent path.

### F-2280-3 — `public/skill.md` was not updated with the compact-JSON guidance (non-blocking, informational)

The master allowed `public/skill.md` "IF the compact-JSON guidance lands", and the 413 message now instructs riders to submit compact JSON — but the door document was not touched. The error text is self-documenting at the point of failure, so this is cosmetic; noted so the next skill.md sweep can fold it in. No `skillmd-guard` re-pin was owed, since the file is unchanged.

### F-2280-4 — `blocker-panel-closed-guard`'s ONLY defect arm has stopped constructing its defect (pre-existing on main; NOT this slice)

Two fires and one runner have now seen this red and each recorded it as "the blocker-panel failure". None diagnosed it, and the diagnosis inverts what it means. **The guard is not failing. Its defect arm is.**

- `node scripts/blocker-panel-closed-guard.mjs` on the live board: **PASS** (`panel rows 33 · closed-on-panel 0`), and the `test:blocker-panel` leg passes in 0.2 s.
- What reds is `blocker-panel-closed-guard.test.mjs:40`, the arm whose own comment reads: *"REAL HISTORY … A guard that cannot red here is decoration."* It asserts `historical.status === 1` with offender `F-1030-2`; it now gets **status 0, zero offenders**.

**Mechanism:** the fixture at `:16` is **half-frozen and half-live** by deliberate design — it pairs the BACKLOG *frozen* at `2e02098f` with the **current** `scripts/dashboard-gen.sh`, on the stated grounds that "a hand-written stub would test nothing." That is a defensible choice, and it is exactly what disarmed the arm: the live panel's row-selection rule has since drifted, so it now draws only **7 panel rows** from that historical ledger and `F-1030-2` is no longer among them. Nothing is wrong with the ledger or the guard — the *coupling* rotted.

**Why it matters more than a red line:** `blocker-panel-closed-guard` is chained in `test:node-guards`, and its red path is now **proven unexercised**. It passes on the live board, and nothing demonstrates it can still fail. By the arm's own standard it is decoration until the arm is re-anchored — pin the panel script alongside the BACKLOG at the same commit, or re-point the fixture at a historical pair that the current rule still reds on.

**Not this slice's to fix**, and deliberately not fixed in the drain: it is out of the firewall, and a guard-fixture repair needs its own gates.

## Env exceptions

The runner reported it could not run an independent Codex review ("the installed CLI does not support configured `gpt-5.6-sol`") — a client-floor artefact of the runner's shell, not a property of this slice, and orthogonal to the gates above, all of which were re-run drain-side.
