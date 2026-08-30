# Review — true-reel-show (EH-3): the Lantern Show plays the truth

**Slice:** `true-reel-show` (EH-3) · **branch:** `lane/d` · **lane tip:** `ecc2a1a1b989de5b5c02f2c4b5e0702d53dbb9d7`
**Base:** `e55a11726ddec4c1a7d0115d45a14f757a6772d5` · **merge:** `af85497537fb973b8798089794498ff9b2974110` · **drain re-pin:** `4350ab7113d903b0a595ad706809de3c9385c632`
**Drained:** s2374, 2026-08-30 · **Verdict:** ✅ **MERGED**

## What it does

The approximation path for agent reels is **removed**. A persistent module worker owns an
`AgentTapeReplaySession` — the county's own replay core from EH-2 — and the main thread requests true
ticks from it, rendering the real hero, rider, enemies, works, gold, wave and HP each displayed tick.
Pause, 1×/2×/4×, restart and next-wave all drive that worker; restart re-steps from tick 0 inside the
sub-2 s budget EH-2 measured. At completion the show states the event-log hash it reproduced **in the
viewer's own browser**. A tape whose engine stamp does not match this engine is refused *before*
playback, naming both eras, and keeps the recorded-outcome card. Human reels are untouched and keep
their existing path.

This answers the owner's 2026-08-30 words directly — *"If the user cannot watch the AI play then that
is kind of pointless… can we not convert the AI tape to a human watchable tape?"* — and retires the
approximation that made him rightly call the crown reel fake (F-ASSAY-E2E-3).

## Evidence (measured on the merged tree, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (twice: pre- and post-re-pin) |
| `npm run build` | green, 1.46 s / 1.91 s |
| `e2e/agent-reels.spec.ts` (own spec) | **6/6** desktop + mobile, 31.1 s |
| `tape-02-lantern-show` + `run-suspend` + `task-025` + `m1-01` | **30/30** both projects, 5.0 m |
| node replay suites (`assay-replay`, `assay-worker`, `agent-reels`, `engine-era-guard`, `worker-type-coverage`) | **18/18** |
| Console/page errors | zero across all runs |
| Render p95 (runner-measured) | **25.0 ms** true driver vs **41.6 ms** show baseline — **-39.9%**, an improvement, not a regression |
| Screenshots | `reviews/shots-true-reel/{desktop,mobile}-chrome-{true-world,outcome}.png` |

**The runner reported 29/30 with a mobile `run-suspend:194` console red; my re-run of the same suites
on the merged tree is 30/30.** The drain's own re-run is the free control on the runner's headline
(§3.1: a red is not evidence until it reproduces at `--workers=1`), so I did not inherit that red.

## Merge classification

Base `e55a11726`; clean three-way merge, **no conflicts**. All 15 paths classified `LANE-ONLY` by
`lane-usable` except `tasks/BACKLOG.md` (`BOTH-MOVED`, auto-merged — the lane appended one row while
main appended elsewhere). New files: `src/replay/BrowserAgentTapeReplay.ts`, the `artifacts/eh3-fixture/`
set, four screenshots.

## Findings

### F-2374-1 — the engine hash had to move, and the era deliberately did NOT bump (resolved in `4350ab711`)

`ENGINE_SOURCE_INPUTS` includes the whole of `src`, so **any** merge touching `src/**` moves the engine
hash. This one moved it `dbf8b14e… → d5b04061…`, which reddened `engine-era-guard.test.mjs` on the
merged tree. **Control: that guard is green on pristine main and red on the merged tree, so the red was
this merge's, not pre-existing.** The master firewalled the runner out of `assets/engine-era.json`, so
the re-pin is the drain's — exactly the s2372 precedent recorded in the registry's own note.

**Era stays 4.** This is a presentation/observability change, not a behavioural one, and that is
*proven rather than asserted*: the **original committed fixture replays on the merged tree and
reproduces its own claimed `fnv1a32:bd5a603b` exactly**; every semantic check (malformed, simVersion,
legacy-v1, extra-streams, terminal, unreached-orders) is preserved verbatim in the new
`AgentTapeReplaySession` constructor and `result()`; and `snapshot()` only *reads* sim state into a
render-side cache. Re-pinned with a named cause per F-1441-3 — never to make a red go away.

### F-2374-2 — the re-pin staled the slice's own fixture, and that coupling is worth naming

The committed fixture was stamped `engineHash: dbf8b14e` — **main's** hash, i.e. it was minted before
the lane's `src` edits were complete. The show refuses on *exact* hash equality (`Game.ts:7015`), so the
moment the registry was correctly re-pinned, the slice's own era-current test went red 2/6. I
regenerated the fixture on the merged tree using the runner's own order stream (HARVEST ×2 →
BUILD palisade @ goldGte 10 → MOVE_TO), so its stamp is **self-consistent and generated, never
hand-written**. The spec derives every expectation from the tape at runtime, so the regenerated
`eventLogHash` (`fnv1a32:5df74748`) is read from the artifact rather than pinned in the test.

⚠️ **The general shape is a live hazard, non-blocking, and belongs on the ladder:** a committed fixture
whose validity is *exact-hash* equality against a constant that moves on **every** `src`-touching merge
is self-staling — the next engine merge reds this test for whoever drains it. The durable cure is for
the test to stamp (or mint) its fixture from the live registry at setup. Recommend a small corrective;
I did not author it, because editing the slice's test is authoring, not draining.

### F-2374-3 — public agent reels still cannot play (pre-existing, out of firewall, already named)

The runner's own STOP: `functions/api/standings.ts:383-395` projects public reels as `{ buildId }`,
stripping both `engineHash` and `era` — so no public reel carries an era claim and every one meets the
honest unstamped-era refusal. That projection was ruled otherwise by `engine-era-law-v3` and then
**vetoed** (`d96dacb15`), so this is a standing owner-side state, not a regression. **The runner
reporting it instead of reaching outside its firewall is a firewall success** (§4.5). The follow-up is
already named: `engine-era-browser-stamp`. Nothing here blocks this merge — the slice's behaviour on a
public reel is an *honest refusal*, which is strictly better than the fake playback it replaces.

### F-2318-1 — CLOSED

The production-shaped plain-boot arm proves WATCH reaches the show **without `?debug`**
(`agent-reels.spec.ts:81`, both projects). Mistake #10's question — *where does the player see this in a
plain boot?* — is answered by a passing no-`?debug` e2e.

## Truth-contract gaps (named placeholders, per scope §1)

Claim Keeper dot · Prospector diamond · enemy ring · work block. Named in-show rather than skipped
silently, as the master required. Bespoke VFX polish was explicitly not required at r1.
