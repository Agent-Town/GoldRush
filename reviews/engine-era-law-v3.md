# engine-era-law-v3 — drained s2308, with the §7.4 projection ruling VETOED

**Slice:** `engine-era-law-v3` · **branch:** `lane/a` · **lane tip:** `2715daf10`
**Base:** `main` @ `749eb411c` · **Merge:** `ef9038425b8c10c038c9539f1d0b79c58edeca49`
**Verdict:** **MERGED** — with one ruling reversed and three mechanical integration fixes (F-2308-1).

## What it does

Declares an **engine era**: a named, dated boundary at which the simulation engine's identity is
allowed to change. `assets/engine-era.json` records era 3, *"the Honest Hypot"*, with the engine
content hash; it sits deliberately **outside** the hashed corpus (F-2301-1's cure), which is what
lets it contain its own hash as a fixed point. `scripts/engine-era-guard.test.mjs` reds whenever the
computed engine hash drifts from the declared one, so an undeclared engine change can no longer ship
silently. Node-produced tapes now carry `meta.era` beside `meta.engineHash`, the assay worker's skew
verdicts name **eras** rather than raw hashes, and the replay agent normalizes the new key.

This answers the owner's puzzle of 2026-08-25 verbatim — *"Should I create reference tapes again for
the new deploy? this inconsistency leaves me puzzled"* — a tape now says which era it was born
under, and eras change only on purpose.

## Provenance — this run STOPPED; it did not arrive ready

The runner's report opens **`STOPPED LAWFULLY — not READY-FOR-GATES`** (556,123 tokens). Its diff
exists only because the lane runner **auto-commits**, so the partial implementation was swept onto
`lane/a` by machinery at `2715daf10`. It stopped on its own honesty guard having found two validator
surfaces outside its firewall — **the fourth consecutive firewall success in this lineage, and
correct.** This drain did not override that judgement: both of its blockers were *dissolved* by
reversing the single ruling that caused them.

## The finding — the master is internally contradictory (F-2308-1)

v3's §7.4 **RULING** is *"RETAIN `era` in the public projection"*. Its **DEFERRAL** is *"no `src/**`
edits at all"*, justified on the ground that the browser is only a **producer** (*"a browser reel
simply makes no era claim, and that is honest, not a gap"*).

These are **jointly unsatisfiable**. `src/game/RunTape.ts:350` `validateTapeMeta` is not merely the
browser's own stamp type — it is the **validator of the public reel**, reached from
`src/ui/LanternShow.ts:24` `readStandingsReel`, whose own comment says so:

> *A reel arriving from `/api/standings?reel=` is parsed by the SAME validator as a local tape … so
> a standings row and a shelved reel can never disagree about whether a show is threadable.*

**Proven end-to-end** against main's real modules via `vite.ssrLoadModule`, on a real recorded tape
(`artifacts/gauntlet-heat4-20260824/omp/the-claim-attempt-1.tape.json`), control asserting its own
validity first:

| probe | result |
|---|---|
| `validateRunTape(meta {buildId})` | **ACCEPTED** (control) |
| `validateRunTape(meta {buildId, era:3})` | **REFUSED (null)** — `:331` treats `meta===null` as a whole-tape refusal |
| `readStandingsReel({reel:{buildId}})` | `{ok:true, tape:…}` |
| `readStandingsReel({reel:{buildId, era:3}})` | **`{ok:false, reason:'unavailable'}`** |

That last row is what the player sees as *"The county clerk cannot find that reel."* — **every
node-produced WATCH reel would have become unplayable.**

Why the authoring fire missed it: s2303 **did** find `RunTape.ts:352` — its own goal-leaf note names
it — and filed it under the **producer** axis, as *"the browser era STAMP"*, costed at five further
surfaces. Under that reading the deferral is obviously right. **The consumer question — *who
validates the thing my ruling changes?* — was never asked**, so the same file was audited correctly
against the wrong question.

## Findings

**F-2308-1 (this drain, non-blocking after cure).** Two inherited surfaces instructed the next fire
to **delete the only guard on this invariant**. `scripts/test-standings.mjs:111` asserts
`equal(response.body.reel.meta, { buildId: 'abcdef12' }, 'public WATCH reel stays compatible with
the shared browser validator')`. F-2304-1 prices it as *"an AUTHORING finding … the cure is a
one-line assertion update"* and directs that it *"must become `{ buildId: 'abcdef12', era: <n> }`"*;
s2307's handoff compressed that into an unconditional instruction. Following it would have converted
a **true** assertion into a false one and shipped a player-visible break with a green suite
attesting to it.

**F-2304-1 is not wrong and is not re-opened.** It carries the escape this fire took — *"verify the
served object first … if the runner STOPPED there is no diff"* — and its GATE ends *"or retires
untouched if the ruling is vetoed and the projection stays `{ buildId }`."* **Both conditionals
fired.** The loss happened in the **compression** from row to handoff, where the conditional was
dropped and only the imperative survived.

> **Reusable:** an assertion over an exact shape is either a **mirror** or a **contract**, and
> *"update it to match the new behaviour"* is safe only for a mirror. They are indistinguishable by
> reading the assertion's **value**, and usually distinguishable by reading its **message** — the
> field nobody diffs. Here the message named the browser validator, and one probe settled it.

## Integration fixes applied at drain time (all inside v3's existing TOUCH-ONLY)

1. **`functions/api/standings.ts`** — projection reversed to `{ buildId }`, using the fallback
   **v3's own master pre-authorized**: *"if vetoed, the projection stays `{ buildId }` and this
   master is otherwise unchanged."*
2. **`scripts/agent-reels.test.mjs:46`** — the **mirror**-side assertion reversed to match. This is
   the contradiction made concrete: under v3's ruling this test demanded `{ buildId, era: 3 }` while
   `test-standings.mjs:111` demanded `{ buildId }` — **two tests in one slice that could not both
   pass.**
3. **`assets/engine-era.json`** — the era-3 hash was seeded on the **lane's** tree (`f7f4b105…`) and
   does not describe the merged tree. Re-seeded to `8a0559cd…` and **verified a fixed point**, which
   holds only because F-2301-1 had already moved the registry outside `ENGINE_SOURCE_INPUTS`.

> ⚠️ **General property, and the next identity-pinning slice should expect it:** a pin computed on a
> lane tree is stale the moment main moves, so such a slice **cannot be drained by an ordinary
> merge** — the pin must be recomputed on the **merged** tree, in the drain, or the guard reds on
> arrival.

## Evidence (merged tree, detached gate worktree per §3.0b, landed by fast-forward)

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, `built in 1.89s` |
| `test:stats` | **408 checks, rc=0** — `87` + `153` + `153` + `15`, byte-matching F-2305-1's baseline |
| ⤷ `test-standings.mjs:111` | **GREEN AND UNTOUCHED** — the measurement that proves the veto correct |
| `test:node-guards` | **549 tests / 544 pass / 0 fail / 5 skipped, rc=0, 731 s** — reproduces the runner's own figure |
| `engine-era-guard.test.mjs` | 2/2; registry ↔ computed hash a verified fixed point |
| boot probe | **6/6**, desktop **and** 390px mobile, zero console/page errors |

Screenshots: `reviews/shots-engine-era-law-v3/` (6 files).
**Stated honestly:** these are evidence the merged tree **boots clean**, not evidence of a visual
change — the slice touches **zero `src/` files**, so nothing renders differently.

## Merge classification

Base `749eb411c`; three-way merge of `lane/a`, **no conflicts**, 11 files from the lane. Both
`package.json` guard-leg additions verified present after the merge — the lane prepends
`engine-era-guard.test.mjs` to `test:node-guards`, s2307 appended
`bash-leg-misuse-code-guard.test.mjs` to `test:ledger-guards`; they touch different lines and both
survived. All 11 lane paths were `LANE-ONLY` except `package.json` (`BOTH-MOVED`, cleanly resolved).
Landed by **fast-forward** from the gate worktree so main's working tree never held undecided
content.

## Veto window (§7.4)

The projection reversal is **one line and reverses with one word.** It was taken with the owner
absent because the alternative is **measurably broken**, not because the fork was mine to settle.
The genuine design question — *should the browser ever carry `era`?* — is deferred **intact** to the
named follow-up **`engine-era-browser-stamp`** (widening `RunTapeMeta` + `validateTapeMeta` + the
stamp). **Until that lands, `{ buildId }` is the invariant rather than a compromise.**
