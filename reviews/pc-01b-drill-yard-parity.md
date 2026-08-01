# pc-01b — The Drill Yard board/manifest parity (and the pc-01 stack it lands)

- **Slice:** `pc-01b-drill-yard-board-manifest-parity`, landing its predecessor `pc-01-drill-yard` with it
- **Branch:** `lane/m4` — tip `74df35dcfcd8d09a3f36a3ce8d01e3d9e6fb30da`
- **Base at drain:** `5f81a36d` (main, s1323 lock commit)
- **Drained by:** s1323 fire, 2026-08-01
- **VERDICT: ✅ ACCEPT — merged.** This **supersedes the REJECT in `reviews/pc-01-drill-yard.md`** (s1321), whose
  single blocking objection this corrective resolves. That review stays on disk as the record of why the slice
  waited a cycle; read it for the fork's history.

Two merge-caused guard reds were found and cured **inside this drain**, both proven by mutation. Three remaining
node-guard reds are **pre-existing on main**, proven by a clean-main control.

## What it does

`pc-01` adds **The Drill Yard**, a practice contract in the E1 Frontier chapter: a borrowed corner of the river
claim where the county lends 100 gold, straw men and rolling logs respawn, and a Drill Bell rings one small wave
of eight. Its point is that **nothing in the yard enters the county ledger** — the contract's own `practice`
block declares `scores`, `standings`, `runHistory`, `metaProgress` and `tapes` all `false`, and the slice's e2e
proves it rather than assuming it: 14 storage keys byte-equal on exit *and* re-entry, ledger delta `[]`,
standings requests `0`.

`pc-01b` resolves the fork s1321 rejected the predecessor over. The Drill Yard is a **6th** E1 contract, but
`TownScene` filtered its card out of the rendered board until the town welcome had been seen — so the manifest
said 6 while the board rendered 5 for any un-welcomed profile, and the divergence leaked into
`discoverLedgerContract` too. The runner chose **fork (a)**: no welcome gate; `renderBoard()` consumes the epoch
manifest directly. That matches the ratified *"standing / always available"* wording, and the three formerly
literal `toHaveCount(5)` assertions now derive their expected count from
`loadEpoch('epoch-1-frontier').contracts.length` instead of a hard-coded number — so board cards, chapter count
text, chapter navigation and ledger discovery all read from one six-contract list.

s1321's warning that *either* implementation reds two specs is worth recording as resolved: it held only while
the counts were literals. Deriving them from the manifest is what made fork (a) land clean — **no guard was
loosened to pass.**

## Evidence

All playwright runs `--workers=1` per §3.1. The merge was **clean — zero conflicts**.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc 0 |
| `npm run build` | green, `✓ built in 1.46s` |
| `drill-yard` + adjacency (desktop-chrome) | **17 passed (2.1m)** |
| `drill-yard` + `town-t3-board` (mobile-chrome 390px) | **8 passed (1.2m)** |
| Wave battery, merged tree | **8 passed / 1 failed (1.4m)** |
| Wave battery, **clean-main control** | **8 passed / 1 failed (1.4m)** — identical |
| `test:node-guards` (209 tests) | **206 pass / 3 fail** — all three pre-existing, see F-1323-2 |
| Console/page errors | zero, asserted in `drill-yard.spec` on both projects |
| Screenshots | `artifacts/pc-01-drill-yard/`, `artifacts/pc-01b-drill-yard-parity/` — incl. plain-boot cards, desktop + 390px |

Adjacency set was **derived by grep, not inherited from the runner**: the slice adds a member to the E1 contract
set, so every spec denominated in that set's size is a claim about this change — `drill-yard`,
`board-era-chapters`, `en-02-e1-coverage`, `town-t3-board`, `board-gating-and-profiles`.

Mistake #10 — *where does the PLAYER see this in a plain boot?* — is answered on camera: the parity work's own
plain-boot screenshots (`desktop-chrome-plain-boot-card.png`, `mobile-chrome-plain-boot-card.png`) show the Drill
Yard card on the board with no `?debug` and no welcome seen.

## Merge classification

`main..lane/m4` was 3 commits. `467ed904` (ap-07 night-shift fixtures) was **already absorbed into main** as
`07854e6b` at s1319 — confirmed with `git merge-base --is-ancestor`, and none of its files appear in the two-dot
diff. The two live commits are `f0bf5251` (Drill Yard) and `74df35dc` (parity corrective). All 31 merged paths
are **LANE-TOUCHED**; main had moved none of them, so no 3-way graft was required.

⚠️ **For the next reader:** the lane was **26 commits behind main**, so a raw `git diff main lane/m4` renders
main's *newer* files (`terrain-seed-cache.spec.ts`, `drain-block-check.mjs`, `lane-usable.mjs`, `Vfx.ts`, …) as
**deletions**. Nothing was deleted and nothing was lost — that is the behind-lane artefact s1322 §E warns about,
and the durable instrument is `lane-usable`'s merge-base classification, not a two-dot diff.

## Findings

### F-1323-1 — a practice contract was owed a bench seed set it can never use. ✅ **CURED in this drain.**

`scripts/bench-seeds.test.mjs` required **every** Frontier contract to carry a frozen bench seed set, so the
merge went red with `e1-drill-yard needs a bench seed set`. **Merge-caused** — `bench-seeds` passes on the
clean-main control and fails on the merged tree.

The mechanical fix — invent seeds for the Drill Yard — is the **wrong** one. A bench seed set exists to freeze
the maps a score was earned on, so agent-play runs stay comparable across sessions
(`specs/agent-play/README.md:61`). The Drill Yard records no score at all, so there is no measurement to hold
comparable; seeds for it would be dead data wearing the costume of a baseline.

The guard now narrows to the set its *purpose* covers, keyed on the contract's **own declaration**
(`practice.scores === false`) and never an id allow-list — so a practice contract that ever starts scoring is
covered again automatically. The exemption is asserted **bidirectionally**: an exempt contract must *not* carry
seeds either, so the new branch cannot decay into a silent skip that hides genuinely missing coverage.

**Proven by mutation, not by a green** — a passing guard never executes its violation path:

| Mutation | Result |
|---|---|
| baseline, cure in place | GREEN rc=0 |
| drop `e1-dry-gulch`'s seeds (a **scoring** contract) | **RED** ✓ `needs a bench seed set` |
| give `e1-drill-yard` a seed set | **RED** ✓ `must NOT carry a bench seed set` |
| restore | byte-exact, sha256 `868465be2a4b5865…`, GREEN rc=0 |

### F-1323-2 — three node-guard reds are pre-existing on main; s1322's "209/209 fail 0" does not hold. 🔺 **OPEN.**

The runner reported *"four unrelated collection/law-pointer failures"*; s1322 §H(4) rightly said not to inherit
that number — but its own replacement figure is also wrong, and I am not passing it on unmeasured.

Measured here: `whole-suite-collection` fails **deterministically (2/2 runs)** with
`TypeError: Cannot read properties of undefined (reading 'goals')` at `e2e/charter-press.rig.ts:70`, and it drags
two wrappers down with it — `collection-guards-cwd-invariance` and `fixture-teardown` each report *its* child
failure as their own. **Three reds, one root.**

**Attribution is a control, not an argument:** the same failure reproduces at the same line on a detached
worktree at clean main (`5f81a36d`); the rig is untouched by this merge and was last modified at `2ce1a2ca`
(2026-07-17). I falsified the obvious hypothesis first — that the new contract lacked `briefing.goals` — by
reading all six E1 contracts: the Drill Yard has `goals: 2`. Not the cause.

Left open deliberately: it is main's red, not this slice's, and diagnosing a fuzz rig is outside this drain.

### F-1323-3 — the feared wave regression does not exist, and one wave red is main's. ✅ **CLOSES F-1321-4.**

The runner and s1322 §H(3) both reported the wave battery at **7 passed / 2 failed**, flagged as the unmeasured
shared-behaviour risk from the predecessor's `WaveSystem` change (`scheduledDisabled()` no longer forcing
`waveState='quiet'`). Now measured on both sides:

- **Clean-main control:** 8 passed / 1 failed — `m2-03-wave-scheduler:126` knee-budget stalls at wave 10.
- **Merged tree:** 8 passed / 1 failed — **identical, same single test.**

So the knee-budget red is **pre-existing on main** and owes nothing to the Drill Yard, and the `m1-03` grace red
(*"1 enemy before sim-t 5"*) **does not reproduce at all** — it was measured on a tree 26 commits stale. The
`WaveSystem` change is clear of adjacent regression. **F-1321-4 is answered.**

The knee-budget red itself remains open as main's, folded into F-1323-2's neighbourhood of standing reds.

### F-1323-4 — the merge rotted a law pointer, exactly as the law predicts. ✅ **CURED in this drain.**

Adding 74 lines to `Game.ts` moved three coordinates cited by the `e1-hold-the-claim-defeat-fork` claim in
`tasks/goals.json`. Re-based against the **code**, never the coordinate: `endRun()` `:6600 → :6636` (content
still `private endRun(): void {`, verified by eye as the guard instructs), `finishPendingDeath()` `:6623 → :6657`,
`endRunForTest` `:1786 → :1804`. The claim's *substance* — that `endRun()` is the only defeat path and its only
gameplay caller is hero death — is unchanged and still true. Baseline re-based with
`node scripts/law-pointer-guard.mjs --update` (16 pointers).

This is the standing hazard §2E names: a fire mutates law surfaces late in its own run, so the guard that judges
them must run again afterwards. It did, and it caught this.
