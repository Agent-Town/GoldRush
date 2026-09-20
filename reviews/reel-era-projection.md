# reel-era-projection (EH-3b) — the WATCH reel's era papers

- **Slice:** `reel-era-projection` (EH-3b), lane-d
- **Branch / tip:** `lane/d` @ `5518d9a04` (`runner(lane-d): reel-era-projection.md`)
- **Base:** `main` @ `3b8c9354b`
- **Gated by:** s2376, in a detached worktree (`gate-s2376`) per fire.md §3.0b — **the merge never touched main's tree**
- **Evidence:** `artifacts/reel-era-gate-s2376/gate.txt`

## VERDICT: HOLD — NOT MERGED

Two findings, one blocking on its own. `F-2376-1` is a NEW red proven against a control;
`F-2376-2` is a user-facing behavioural regression whose cure is outside this master's
firewall. The slice's *intended* change is sound and its named suites are green — this is a
scope gap, not a bad idea, and the corrective re-lands it whole.

## What it does

EH-3 shipped the honest projectionist: an agent reel replays through the county's own engine
and re-verifies its event-log hash in the viewer's browser. But a reel fetched from the public
board arrived stripped of its era papers, so the show refused *everything* fail-closed. This
slice widens the public `?reel=` projection from `{ buildId }` to
`{ buildId, engineHash, era }`, flips the plain-boot WATCH e2e arm from era-refusal to TRUE
PLAYBACK, and mints the EH-3 fixture's identity from the live era registry at test setup so it
can never self-stale again (F-2374-2's cure).

**The s2308 veto's premise is genuinely dead, and that was the first thing checked.**
`ef9038425` vetoed exactly this projection on measured evidence: `validateTapeMeta` is an
exact-key allowlist over `['buildId']`, so a projected `era` made `validateRunTape` return
null and every node-produced WATCH reel unplayable. **That chain no longer exists.** EH-3
(`ed0d3c5389`, s2374) added `validateAgentRunTape` at `src/ui/LanternShow.ts:31`, which strips
`engineHash`/`era` back to `{ buildId }` *before* calling `validateRunTape` and re-attaches
them after. Verified by measurement, not by reading: a fully-stamped payload round-trips to
**PLAYABLE**. The veto was correct when written and was retired by a merge four days later.

## Evidence (merged tree, `gate-s2376`)

| Arm | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `scripts/test-standings.mjs` | **rc=0** — kv 173 / sqlite 173, both arms |
| `scripts/agent-reels.test.mjs` | **rc=1 — NEW RED** (see F-2376-1) |
| CONTROL: same suite, pristine main `3b8c9354b` | **rc=0**, 1/1 pass |
| Half-stamped round-trip | **REFUSED** (see F-2376-2) |

Battery deliberately stopped at the first blocking red rather than completing playwright —
the verdict was already decided and the corrective must re-gate from scratch anyway.

## Merge classification

Base `3b8c9354b`; `git merge --no-ff lane/d` applied by the `ort` strategy with **no
conflicts**. All five paths are LANE-TOUCHED only; main has not moved any of them since the
lane branched.

| File | Class | Note |
|---|---|---|
| `functions/api/standings.ts` | LANE-TOUCHED | the projection at `:394`; retires the s2308 veto comment |
| `scripts/test-standings.mjs` | LANE-TOUCHED | mirror assertion updated to the new shape |
| `e2e/agent-reels.spec.ts` | LANE-TOUCHED | plain-boot arm flips to playback; live-registry fixture minting |
| `reviews/shots-reel-era/*.png` (×2) | NEW | plain-boot playing, desktop + mobile |

## Findings

### F-2376-1 — BLOCKING. One half of a deliberately-mirrored contract was updated; the other reds.

`scripts/agent-reels.test.mjs:52` asserts `reel.meta` deep-equals `{ buildId: 'abcdef12' }`.
The merged projection returns all three fields, so it fails:

```
actual:   { buildId: 'abcdef12', engineHash: 'aaaa…aaaa', era: 3 }
expected: { buildId: 'abcdef12' }
```

**CONTROL: green on pristine main, red on the merged tree — the red is this merge's own, not
pre-existing.**

This is not carelessness by the runner. The veto comment in that very file says the assertion
is *"deliberately identical to `scripts/test-standings.mjs:111`"* — a **contract between two
surfaces, not a mirror of one line**. The master's firewall named "the suites named above",
which covered the standings suite and the reel e2e but never this node suite, so the runner
updated the half it was pointed at and was firewalled out of the other. **The gap is in the
master's scope, not in the runner's obedience** (§4.5: reporting beats reaching outside).

⚠️ It would have been caught by the ordinary drain battery: `scripts/agent-reels.test.mjs` is
a leg of `test:node-guards`, which the drain skill runs **always**, on every drain, regardless
of diff paths. The runner's report named tsc, build, engine guard and `test:stats` — not
node-guards. This is exactly why the drain's own re-run is a free control on a runner's
headline.

### F-2376-2 — BLOCKING. A half-stamped reel regresses from an honest refusal to a false "cannot find that reel".

The store-side validator (`functions/api/standings.ts:1004–1008`) accepts `engineHash` and
`era` as **independently optional**, and `src/replay/AgentTapeReplay.ts:184` explicitly accepts
**both** key sets — `'buildId,engineHash'` and `'buildId,engineHash,era'`. So a tape carrying
`engineHash` **without** `era` is a first-class shape this codebase supports, not merely a
contract accident.

Measured end-to-end on the merged tree, through the real modules:

| Stored meta | Wire meta after projection | Browser verdict |
|---|---|---|
| `{buildId, engineHash, era}` | all three | **PLAYABLE** ✅ |
| `{buildId, engineHash}` | `{buildId, engineHash}` | **REFUSED → `reason:'unavailable'`** ❌ |
| `{buildId}` | `{buildId}` | **PLAYABLE** ✅ |

`validateAgentRunTape` only enriches when era is a positive safe integer; absent it, the raw
two-key meta falls through to `validateTapeMeta`'s `['buildId']` allowlist and nullifies the
whole tape.

**On main that same tape is projected to `{ buildId }`, plays, and reaches the honest
`"This reel rode era unknown (unstamped build …)"` refusal** — the exact message the e2e arm
this slice *deleted* used to assert. After the merge the viewer instead gets *"The county
clerk cannot find that reel"* for a reel that is demonstrably on the shelf.

⚖️ **Stated honestly and not inflated:** this is a NARROW case — the veto's harm was *every*
node-produced reel, this is only the half-stamped ones — and I have not established that any
such tape exists in production today. But it is a lie in the county's own voice about a reel
that exists, which is precisely the harm the whole EH honesty program is built to prevent, and
the slice removed the coverage that would have caught it.

The cure is a design choice touching `src/` (widen `validateTapeMeta`; or have
`validateAgentRunTape` normalise *any* extra-key meta down to `{ buildId }` rather than only
the fully-enriched case; or require `era` alongside `engineHash` at the store). All three are
outside this master's firewall — **correctly so**, which is why this is a re-author rather
than a drain-time fix.

## Disposition

- Corrective master `tasks/reel-era-projection-v2.md` authored this fire, carrying the whole
  slice plus both findings. Lane-d's branch is left as-is for salvage; nothing is lost.
- No `save/*` ref minted — the branch is unmerged and intact, so the content is already safe.
- `tasks/goals.json` leaf `reel-era-projection` → `blocked`, `blockClass: "gate-side"` (a fire
  readiness hold, **not** an owner fork — no owner word is owed and nobody should carry this to
  the desk; it lifts by satisfying the stated condition).
