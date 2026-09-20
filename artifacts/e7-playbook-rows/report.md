# e7-playbook-rows — implementer report

Lane `lane/b`, worktree `worktrees/lane-b`, 2026-09-05, Claude implementer.
Master: `tasks/e7-playbook-rows.md`. Audit rows: `docs/audits/2026-09-02-era-mechanic-audit.md:43-46`
and the smallest-slice lines `:79-82`.

## 1. What the audit measured, and what it measures now

| Contract | Audit verdict | Audit's own evidence | This slice, measured on `lane/b` |
|---|---|---|---|
| `e7-relay-valley` | RESKIN | no E7 system reachable; `1c8a5f74` | a program lights `relay-site-r1` itself; `relaysLitByProgram: ["relay-site-r1"]`, `objectiveMet: true` |
| `e7-echo-canyon` | PARTIAL | `recordedUses: 0`, `bodiesFielded: 0` | `recordedUses: 2`, `squadsFielded: 2`, `bodiesFielded: 4`, `maxRepeat: 1`, `objectiveMet: true` |
| `e7-dead-band` | PARTIAL | "all refusal counters 0", "only by construction" | `signalSuppression.refusals.playbooks: 1`, reason `signal-suppressed`, `objectiveMet: true` |
| `e7-relay-rush` | RESKIN | `frontsArrived: 0`, no ladder mechanic | `frontsArrived: 1`, `interferenceFront.refusals.playbooks: 1`, program suspended once and RESTORED, `objectiveMet: true` |

## 2. The verb

`{"verb":"PLAYBOOK_USE","name":"<string>"}` — one additive rider verb, permission rung 2.

It carries a NAME and nothing else, for three reasons stated at the site
(`src/agent/StandingOrders.ts:58-68`):

1. a name is what the player's own loop produces (`Game.stopPlaybookRecording` saves a named tape
   to the shelf, `Game.startNamedPlaybookReplay` plays it), so the rider's handle is the player's
   handle;
2. `scripts/skillmd-guard.test.mjs:180` expands the `StandingOrder` union into `public/skill.md`
   and can only expand scalars, literal unions and named references — a tape- or order-shaped
   argument could not be published in the grammar at all;
3. a verb that carried orders would be a verb an order could carry, and no bound in
   `PlaybookFormat` covers that recursion (reject-don't-stretch, Mistake #14).

Rung 2 is stated rather than inherited (`StandingOrders.ts:574`) because the browser gates the
same act on `Balance.e7Playbook.requiredPermissionLevel` (= 2, `Game.playbookConsentGranted`); one
rung written down in both engines is a parity claim a reader can check.

What a use does, in the browser's own order (`Game.startPlaybookReplay:3786-3790`: A4 "first",
A5 "second, and never both"):

1. `SignalSuppression.refuse('playbooks')` -> `signal-suppressed`, counted;
2. `InterferenceFrontSystem.refuse('playbooks', prospector)` -> `interference-muted`, counted;
3. resolve the tape — a name the run has not seen RECORDS the rider's accepted submissions so far
   as a canonical tape (the exact shape `scripts/gr-sim.mjs:279` already writes for a whole run,
   which is the exact shape `BroadcastMirror.shapeOfTape` reads); a known name is a REPEAT;
4. `BroadcastMirror.noteUse({ id: <canonical tape hash>, entries })`;
5. INSTALL the tape's orders as the standing order set at the top of the next step, so the sim
   executes the rider's own demonstration (CAPABILITY-LADDER L1, "writing programs the sim
   executes"). It carries no new authority: every order in the program was validated and permitted
   when the rider first submitted it, and it is re-validated on install.

`PLAYBOOK_USE` is stripped from every recorded tape and from every installed program, so a program
can never play itself.

## 3. Changes, with the verb

### `src/agent/StandingOrders.ts`
| Line | Verb | What |
|---|---|---|
| `:58-68` | ADDED | the `PLAYBOOK_USE` union member and the three reasons it is name-only |
| `:147` | ADDED | `FinalVerbHandlers.playbookUse?` (optional, exactly like `motor`/`capture`) |
| `:170`, `:287` | ADDED | the executor's handler field and its bind |
| `:430-437` | ADDED | the execute branch (its own branch, so `FALLBACK_IF` narrowing is unchanged) |
| `:574` | ADDED | the explicit rung-2 line |
| `:663-668` | ADDED | validation: `exactKeys(['verb','name'])` + the 1..80 char handle `BOAT_BUILD` accepts |
| `:872` | ADDED | `standingOrderIdentity` for the verb |

### `src/sim/HeadlessContractSim.ts`
| Line | Verb | What |
|---|---|---|
| `:494-512` | ADDED | the block header: what the verb is, what a use does, why the era scope is the bundle |
| `:514-516` | ADDED | `SIGNAL_BUNDLE_CONTRACT_IDS`, READ off `epoch-7-signal/contracts.json`, never typed out |
| `:533-561` | ADDED | `PlaybookUseDiagnostics`, the rider row |
| `:564` | ADDED | `PROGRAM_ORDER_CAP = 32`, the rider's own submission ceiling restated |
| `:600-614` | REWROTE | the A4 note: suppression is no longer "by construction" for playbooks; drones and relay chains still are, and that half is still stated |
| `:646-651` | REWROTE | the A3 note: the record half was inert and is now live, exactly as that note predicted |
| `:664-687` | ADDED | the shelf, the demonstration, the program-lit relays, the objective, the counters |
| `:920` | ADDED | the tape header's difficulty, read once from `Balance.readDifficultyPreset` |
| `:970-981` | ADDED | the relay sites, read with the SAME predicate `InterferenceFrontSystem.create` uses |
| `:982-992` | ADDED | the per-map objective, derived from that map's own declarations |
| `:1326` | ADDED | the verb bind |
| `:1382` | ADDED | `|| !this.playbookObjectiveAllowsSecure` in `autoSecureWaveForRun` |
| `:1571` | ADDED | the terminal-hash spread, keyed on `playbookRan` (see section 5c) |
| `:1692` | ADDED | `applyPendingProgram()` at the top of `step()` |
| `:1773-1775` | ADDED | `syncProgramSuspension()` + `syncProgramRelays()` beside the front's own update |
| `:1875` | ADDED | `view.now.playbookUse`, contract-scoped |
| `:1966-1972` | ADDED | the demonstration record + the rider taking the wheel back, in `submitOrders` |
| `:2273` | ADDED | the `playbookUse` diagnostics row (null off the bundle) |
| `:2781-3040` | ADDED | `recordDemonstration`, `usePlaybook`, `refusePlaybook`, `recordPlaybook`, `applyPendingProgram`, `syncProgramSuspension`, `syncProgramRelays`, `playbookObjectiveAllowsSecure`, `playbookUseDiagnostics`, `playbookRan` |
| `:3177-3192` | ADDED | `programOrders`, the executable half of a tape |

### `src/agent/View.ts`
| Line | Verb | What |
|---|---|---|
| `:44-58` | ADDED | `AgentPlaybookUseView`, structural so this module keeps its render-free import list |
| `:109-116` | ADDED | `now.playbookUse?`, contract-scoped like `preserve`/`gravity`/`air`/`motor` |

### `public/skill.md`
| Line | Verb | What |
|---|---|---|
| `:71` | EDITED | `now.playbookUse` joins the contract-scoped field list |
| `:121` | ADDED | `{"verb":"PLAYBOOK_USE","name":"<string>"}` in the source-locked grammar block |
| `:156` | ADDED | the E7 paragraph under EPOCH LEVERS |

No view-schema version bump. The document's own rule (`public/skill.md:71`) is that contract-scoped
fields are absent from the stamped canonical set and do not move the version, and
`scripts/view-schema-guard.test.mjs` confirms it: the canonical view is built for `the-claim`, where
`now.playbookUse` is absent, so the stamped field set is unchanged and the guard is green. The
registry (`assets/engine-era.json`) is outside this slice's firewall in any case.

### Tests and evidence (new)
- `scripts/e7-playbook-rows.test.mjs` — 6 tests, wired into `test:node-guards` (`package.json`).
- `scripts/e7-playbook-digest.mjs` — the shared Node/browser ride table.
- `e2e/e7-playbook-rows.spec.ts` — 3 tests x 2 projects.
- `artifacts/e7-playbook-rows/*.log` — the four gr-sim ride logs and their stderr.

## 4. The four secure rules, and the event evidence for each

Each rule is DERIVED from what that map's own contract already declares — no new contract field, no
new twist key, nothing authored twice — and is scoped to the four ids the Signal bundle declares.
`playbookObjective` is `null` on every other contract, so `playbookObjectiveAllowsSecure` is `true`
there and no admitted contract's terminal moves.

| Map | Rule (`HeadlessContractSim:2994-3003`) | Keyed on | Event evidence (gr-sim ride, seed `-01`) |
|---|---|---|---|
| `e7-relay-valley` | `programLitRelays.size > 0` | four `relay-site*` build zones and none of the twists below | `playbook_recorded` -> `playbook_used` -> `playbook_program_ran` -> `relaysLitByProgram: ["relay-site-r1"]`; `objectiveMet: true` |
| `e7-echo-canyon` | `broadcastMirror.squadsFielded > 0` | `twist.broadcastMirror` | two `playbook_used` (second `repeat: 1`), `recordedUses: 2`, `squadsFielded: 2`, `bodiesFielded: 4`, `maxRepeat: 1` |
| `e7-dead-band` | `signalSuppression.refusals.playbooks > 0` | `twist.signalSuppression.playbooks === false` | `playbook_refused reason: signal-suppressed`; `refusals.suppressed: 1`; `uses: 0` (a refused use is not a use, so nothing is mirrored) |
| `e7-relay-rush` | `interferenceFront.refusals.playbooks > 0` | `twist.interferenceFront` | `playbook_program_ran` -> `playbook_program_suspended reason: interference-muted` -> `playbook_program_resumed`; `front.refusals.playbooks: 1`, `programSuspensions: 1`, `runningProgram: "relay-program"` after the wall passed |

Why the era scope is the BUNDLE and not the twist. `e8-far-side` declares `twist.signalSuppression`
too (`SignalSuppression.ts:20`). A latch keyed on the twist would hand the Far Side an E7 objective
it has no way to discharge — F-1471-1's exact casualty, a declaration with no completion path
pinning a run unsecurable forever. The guard rides `e8-far-side` as the load-bearing control: it
still refuses the verb (A4 is a contract read, not an epoch read) and it grows no row and no latch.

Relay Rush's SUSPEND is A5's own rule asked at a second moment. `Game.startPlaybookReplay` asks the
front "is a playbook off at this spot right now?" once, when a use is REQUESTED. A running program
is not a request, so it is asked the same question on every fixed step it runs, at the body that
runs it. The counter moves on the EDGE, never per tick (`refuse()` is documented "exactly once per
attempted use"), the program's orders are cleared while the wall stands over the body, and they are
restored unchanged the instant it passes — the shooter seam's own shape and the ratification's own
words ("muted != damaged", back "ON the instant it passes").

## 5. The hash table

### 5a. Both engines, one order stream (`e2e/e7-playbook-rows.spec.ts`, 6/6 green)

The county's own definition of "both engines" for agent reels: the same `HeadlessContractSim`, one
seed, one order stream, ridden in Node and in the browser runtime.

| Contract | Seed | Ticks | Node `tickHash` | Browser `tickHash` | Agree |
|---|---|---|---|---|---|
| `e7-relay-valley` | `e7-relay-valley-01` | 890 | `fnv1a32:57b04716` | `fnv1a32:57b04716` | yes |
| `e7-echo-canyon` | `e7-echo-canyon-01` | 890 | `fnv1a32:6b7915fe` | `fnv1a32:6b7915fe` | yes |
| `e7-dead-band` | `e7-dead-band-01` | 890 | `fnv1a32:97bdab00` | `fnv1a32:97bdab00` | yes |
| `e7-relay-rush` | `e7-relay-rush-01` | 890 | `fnv1a32:00793392` | `fnv1a32:00793392` | yes |

Every field of the digest agrees as well as the tick hash: objective, `objectiveMet`, `uses`,
`repeats`, `programRuns`, `programSuspensions`, `relaysLitByProgram`, `refusals`, the shelf's
canonical tape hashes, `recordedUses`, `pendingMirrors`. Inside the 890-tick bound the Valley's
relay is already lit BY THE PROGRAM and the Dead Band's refusal has already fired, so the browser
arm agrees about the mechanic firing and not merely about numbers.

### 5b. The full Node rides (`scripts/e7-playbook-digest.mjs --all`, and the gr-sim ride logs)

| Contract | Seed | `eventLogHash` | waves | `objectiveMet` | secured |
|---|---|---|---|---|---|
| `e7-relay-valley` | `e7-relay-valley-01` | `fnv1a32:5fbb0728` | 2 | true | false |
| `e7-echo-canyon` | `e7-echo-canyon-01` | `fnv1a32:485a1c39` | 4 | true | false |
| `e7-dead-band` | `e7-dead-band-01` | `fnv1a32:781f1539` | 4 | true | false |
| `e7-relay-rush` | `e7-relay-rush-01` | `fnv1a32:faf04318` | 3 | true | false |

The gr-sim ride logs in this directory reproduce these hashes exactly (the digest and the door agree
byte for byte). None of the four rides SECURES: the playbook objective is met on all four, and the
run then dies to waves. The verb is not a survival aid, and this slice adds no balance number.

### 5c. The null floors are byte-identical — no regression

All eight idle floor rides re-measured on this tree against `assets/contracts/null-floors.json`,
unchanged:

| Contract | Seeds | Recorded | Re-measured | secured |
|---|---|---|---|---|
| `e7-relay-valley` | `-01` / `-02` | `1c8a5f74` / `2aa1c47d` | `1c8a5f74` / `2aa1c47d` | false |
| `e7-echo-canyon` | `-01` / `-02` | `1cf3c0e1` / `d80bdd95` | `1cf3c0e1` / `d80bdd95` | false |
| `e7-dead-band` | `-01` / `-02` | `8659e124` / `7ba6b083` | `8659e124` / `7ba6b083` | false |
| `e7-relay-rush` | `-01` / `-02` | `ebf7134e` / `862ecace` | `ebf7134e` / `862ecace` | false |

That is why the terminal hash spreads the `playbookUse` row only when the mechanic produced a fact
(`playbookRan`, `HeadlessContractSim:3032`) rather than spread-if-declared like its neighbours: an
absent key keeps every idle hash recorded before this slice exactly where it was, while any run the
verb actually touched still hashes differently from one it did not.

### 5d. Engine identity (the DRAIN pins this — `assets/engine-era.json` is outside the firewall)

| | sha256 |
|---|---|
| lane base = `main` `5d8603982`, BEFORE any edit | `49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9` |
| this lane tip | `2e6af2be015c161d8f87b4a4ef3b586cdcdf68e822e78b5d58fc40af62952178` |
| registry top-level `engineHash` | `5d2fc15616271e8c900824450ce803eb5145c1136dae0d9655c393724794b11b` |

`engine-era-guard` was ALREADY RED at the lane base, measured before any edit of mine: the base hash
`49c34f8b...` is absent from era 5 (`node --test scripts/engine-era-guard.test.mjs` on the untouched
tree: 4 pass / 1 fail, "engine hash 49c34f8b... is absent from era 5"). Suggested pin for the drain,
same era (no view field removed or renamed, no tape shape invalidated):

> `2e6af2be015c161d8f87b4a4ef3b586cdcdf68e822e78b5d58fc40af62952178` — e7-playbook-rows merge:
> `src/agent/StandingOrders.ts` gains the `PLAYBOOK_USE` verb, `src/sim/HeadlessContractSim.ts`
> composes it and latches the four Signal maps' secure on the proof each one's contract declares,
> `src/agent/View.ts` gains the contract-scoped `now.playbookUse`. `src` is inside
> `ENGINE_SOURCE_INPUTS`, so the content re-hashes. This IS a real behaviour change for the four
> `epoch-7-signal` contracts and for those four only: each now requires its own playbook proof
> before it can secure at any wave. Every other contract decides exactly as before, and all eight
> E7 idle null-floor hashes are byte-identical. Same era: no view field was removed or renamed and
> no tape shape changed.

## 6. Gates

| Gate | Command | Exit | Result |
|---|---|---|---|
| tsc | `npx tsc --noEmit` | 0 | clean |
| build | `npm run build` | 0 | green (`tsc && vite build && asset-diet`) |
| E7 node guard | `node --test scripts/e7-playbook-rows.test.mjs` | 0 | 6 pass / 0 fail (11.7s) |
| `test:stats` | `npm run test:stats` (node 26.4.0) | 0 | stats 87 / standings KV 223 / standings sqlite 223 / ledger worker 26 |
| `test:node-guards` | `npm run test:node-guards` (node 26.4.0) | see section 7 | see section 7 |
| E7 e2e (new) | `npx playwright test e2e/e7-playbook-rows.spec.ts --workers=1` | 0 | 6 pass / 0 fail, desktop-chrome + mobile-chrome 390px, zero console/page errors |
| adjacent E7 e2e | `e7-dead-band-suppression`, `e7-echo-canyon-mirror`, `e7-signal-systems`, `e7-relay-rush-front`, `e7-playbook-surface`, `e7-playbook-spike`, `er01-e7-census` | 0 | 36 pass / 0 fail single-worker, both projects, unmodified |
| adjacent verb/tape e2e | `ap16-6-final-verbs`, `c7-standing-order-replay`, `ap16-3-blast-verb`, `tape-01-run-tape`, `tape-02-lantern-show` | 0 | 18 pass / 0 fail, both projects, unmodified |
| skill.md guards | `node --test scripts/skillmd-guard.test.mjs scripts/no-emdash-guard.test.mjs scripts/skillmd-contracts-guard.test.mjs` | 0 | 19 pass / 0 fail |
| view schema + battery | `node --test scripts/view-schema-guard.test.mjs scripts/battery-manifest.test.mjs scripts/gate-battery.test.mjs` | 0 | 25 pass / 0 fail |

Two environment facts a reader needs. (a) `test:stats` and `test:node-guards` require Node 26.4.0
exactly (`assertCanonicalAssayNode`, `scripts/assay-replay-agent.mjs:50`); the shell's default node
here is 23.11.1, so both were run under `~/.nvm/versions/node/v26.4.0/bin`. (b) The adjacent E7
suites go red under `--workers=4` on this machine and green single-worker — the repo's documented
heavy load-flake at default workers; every red re-run alone passed, so there is nothing left to
attribute to a control.

## 7. `test:node-guards`

`npm run test:node-guards` under node 26.4.0, exit **1**: **637 pass / 6 distinct fail, and ZERO of
the six is attributable to this slice.** Every one was re-run against a CONTROL — a detached
worktree of this lane's own base commit `5d8603982`, created with `git worktree add --detach` and
never `git stash` — or reproduced as an instrument fault.

| Guard | Failure | Cause | Control at `5d8603982` |
|---|---|---|---|
| `scripts/bench-seeds.test.mjs` | "rotation registry stays outside the engine identity corpus" | asserts `computeEngineHash() === registry.engineHash`; this is the engine pin the slice owes the DRAIN (section 5d) | **RED** (`49c34f8b...` != `5d2fc156...`) |
| `scripts/engine-era-guard.test.mjs` | "the landed registry names the live engine..." | the same missing pin | **RED**, same reason |
| `scripts/fixture-teardown.test.mjs` | "all 121 scripts/*.test.mjs fixture owners remove their temp directories" | its own message names the cause: "scripts/bench-seeds.test.mjs child failed" — it re-runs the guard above | derivative of the two above |
| `scripts/desk-declaration-guard.test.mjs` | "the live board is green under this guard (baseline is honest)" | the guard REFUSES by design from a linked worktree: "this is a linked worktree and its STATUS.md line-1 is NOT the one main carries ... Re-run from the main worktree" | **RED**, identical refusal |
| `scripts/stale-ready-for-gates-guard.test.mjs` | "the live ledger carries no stale READY-FOR-GATES claim" | names `tasks/BACKLOG.md:5`, the **e8-mare-claim-physics** row, whose leaf is `status="merged" a121c7f1` and whose row still says NOT drained. Someone else's Ghost Line (Mistake #5) | **RED**, same row |
| `scripts/node-guards-contention.test.mjs` | "contention is advisory, correctly counted, and absent when alone" | INSTRUMENT FAULT, mine: I ran a single guard concurrently with the battery, and the battery's own tail says so ("CONTENDED - 2 concurrent batteries") | **GREEN** when re-run alone on this tree |

The new `scripts/e7-playbook-rows.test.mjs` is inside that battery and passed 6/6.

## 8. Findings

### F-E7PB-1 — HUMAN PARITY (L7) IS NOT MET: the browser binds no playbook verb and carries no playbook latch
Non-blocking with owner; corrective owed; pinned by two change detectors.

A browser PLAYER already has the whole loop: `Game.stopPlaybookRecording` saves a named tape to the
shelf and `Game.startNamedPlaybookReplay` plays it back, through the SAME two refusals
(`signalSuppression.refuse('playbooks')`, `playbookMutedByFront()`) and the SAME
`BroadcastMirror.noteUse`. What the browser has NOT got is (a) `PLAYBOOK_USE` bound for a rider and
(b) the four secure latches, which live in `HeadlessContractSim.autoSecureWaveForRun` only. So the
four Signal maps decide their secure DIFFERENTLY in the two engines today: headless requires the
map's playbook proof, the browser does not.

Both halves of that are firewalled for this slice (`Game.ts` is not in TOUCH-ONLY, and the master's
own firewall says the E7 systems may be touched "ONLY for a use entry point, behaviour unchanged for
the browser"), so the gap is PINNED rather than papered over:

- `scripts/e7-playbook-rows.test.mjs` asserts `Game.ts` binds no `playbookUse` and carries no
  `playbookObjectiveAllowsSecure`, and that the player path still reaches the mirror and A4;
- `e2e/e7-playbook-rows.spec.ts` asserts a plain browser boot publishes no rider playbook row.

Both go RED the day someone closes the gap, and they SHOULD: that is the day this row can say
"parity". CORRECTIVE OWED: bind `playbookUse` in `Game.ts` off the same shelf the player uses and
mirror the four latches in `Game.autoSecureWaveForRun`. Until then `engineDependencies` on the three
E7 contracts that carry one stays honestly `missing`.

### F-E7PB-2 — a live `HeadlessContractSim` cannot ride to its terminal inside a browser page
Non-blocking, PRE-EXISTING, not this slice's doing; bounds the browser arm of section 5a.

`RunManager.install` builds a `RunSuspendController` whenever `typeof document !== 'undefined'`
(`src/game/RunManager.ts:93`). That controller's `captureBoundary` snapshots a `Game`
(`game.actors[0]`, `game.buildSystem`, `game.harvestSystem`, `game.economy.resources`, ...) through
`JSON.parse(JSON.stringify(...))` (`src/game/RunSuspend.ts:3101`). A `HeadlessContractSim` carries
none of those fields, so the clone throws `SyntaxError: "undefined" is not valid JSON` at the first
wave boundary past its `wave <= 0` guard. In Node `document` is undefined, the controller is never
installed, and the identical ride runs to its terminal.

Nothing on that path is an E7 file. `e2e/e4-roads-and-convoys.spec.ts` hit the same wall on the
preceding lane slice and recorded it as F-E4-1 with `the-claim` as its reproduction. The browser arm
here is therefore bounded to 890 ticks (one tick under the first 30s wave boundary), which is where
the both-engine claim can be made honestly — and it is still enough to cover two of the four proofs
outright.

### F-E7PB-3 — no Signal map has a securing floor, and the reason is survival, not the verb
Non-blocking; information for the ladder.

All four rides meet their playbook objective and none secures: the runs die to waves at wave 2-4.
That is the same shape the preceding E4 slice recorded (its errand landed early and the run then
died), and the cure is a survival floor or a balance pass, both outside this firewall (`Balance.ts`
is explicitly on the NO list). The eight idle null floors are unchanged and still `secured: false`,
so law 2 holds by construction.

## 9. Anything undone, and why

| Item | Why |
|---|---|
| `assets/engine-era.json` pin for `2e6af2be...` | Outside the firewall; the master's common law says "report the engine hash (the drain pins)". The exact pin text is in section 5d. `engine-era-guard` was already red at the lane base, measured. |
| View-schema version bump to 3 | Not required and not correct: `now.playbookUse` is contract-scoped, `view-schema-guard` is green, and the document's own rule says contract-scoped fields do not move the version. The registry is firewalled anyway. |
| Binding the verb in the browser | F-E7PB-1. `Game.ts` is outside TOUCH-ONLY and the firewall requires browser behaviour unchanged. |
| A securing floor for any Signal map | F-E7PB-3. Needs `Balance.ts` or a survival floor; `Balance.ts` is on the NO list. |
| `assets/contracts/epoch-7-signal/contracts.json` | In TOUCH-ONLY but NOT edited: every one of the four objectives is derivable from what each contract already declares, and a new twist key would have needed `AUTHORED_TWIST_KEYS` in `src/meta/ContractFamilies.ts`, which is outside the firewall. Nothing authored twice. |
| `--workers=4` adjacent-suite reds | Not reproduced single-worker (all 54 adjacent tests pass alone), so there is nothing left to attribute; no control worktree was needed. |
