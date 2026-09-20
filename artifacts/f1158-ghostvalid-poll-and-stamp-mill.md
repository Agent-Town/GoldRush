# s1158 — F-1156-3 re-measured, and a 20-day red it uncovered

Date: 2026-07-28 · Fire s1158 · Box quiet (load 2.97/2.21/2.77, 16 CPUs, port 5188 free, no
`codex exec`, all five queues empty, four lanes false-ahead).

s1157 left F-1156-3 as "the obvious authorable slice, one more quiet fire". This is that fire.
Per the standing duty, I re-measured the finding's list *and its proposed fix* before authoring.
**The answer is: do not author it.** Details below, including one hypothesis of my own that a
mutation control killed.

---

## F-1158-1 — F-1156-3's mechanism holds; its count and its payoff do not

### (a) ✓ CONFIRMED at source and at runtime: the `.toBe(true)` polls are redundant

`BuildSystem`'s `heroPosition` is not a copy — it is `Game.actionActorPosition` itself, passed by
reference at `Game.ts:1211`. F-1153-1's cure (`1db114dc`) made `__GR_TEST__.teleport()` call
`updateActionActorPosition()` synchronously, so that vector is fresh the instant teleport returns.
`confirm()` then **recomputes** validity from it (`BuildSystem.ts:902`, `this.valid =
this.computeValid()`) rather than trusting the cache. So `confirmBuild()` no longer needs a tick.

Measured, interleaved A/B (arm order is a confound, so arms alternate A,B,A,B…), 16 iterations,
`artifacts/f1158-ghostvalid-poll/records.json`:

| arm | n | placed OK | `ghostValid` read true immediately |
|---|---|---|---|
| A — poll then confirm | 8 | **8/8** | 5/8 |
| B — confirm with **no poll** | 8 | **8/8** | 3/8 |

**Arm B placed 8/8 with no poll at all — including 5 iterations where `ghostValid` read `false`
at the moment of confirming.** The diagnostic is a stale cache; `confirm()` does not consult it.

### (b) ✗ REFUTED: the count is not 17, and the shape is a trap

F-1156-3 counted 17 within its own denominator (the 23 files holding a private `placeBuildableAt`
helper). The population an authored sweep would actually face is larger and mixed:

| | count |
|---|---|
| `expect.poll(… ghostValid …)` sites in `e2e/` | **40** |
| … asserting `.toBe(true)` (removal candidates) | **31**, across **27 files** |
| … asserting `.toBe(false)` (**must NOT be removed**) | **9** |
| other `ghostValid` uses (helpers, inline guards) | 14 |

The 9 inverted sites are near-identical to their siblings — they differ only in `?? true` vs
`?? false` and the `.toBe()` argument. A mechanical 27-file sweep is very likely to eat some of
them, and they are load-bearing (see (d)).

### (c) ✗ REFUTED: the payoff is ~1.8 s, not "measurable suite wall-time"

Arm A poll cost, same run: **mean 56.75 ms, max 127 ms, total 454 ms over 8 polls.** Extrapolated
across all 31 removable sites: **≈ 1.8 s** for the entire e2e suite. Most of that is `expect.poll`'s
own first-retry interval (100 ms), not time waiting for the game.

The cost is real but it is not a wall-time argument. If these polls are ever removed, the honest
reason is **clarity** — they encode a bug that no longer exists — not speed.

### (d) ✗ REFUTED — *my* hypothesis, killed by a mutation control

Reading the source, I formed a sharper claim than F-1156-3's: `setBuildMode(false)` **forces**
`this.valid = false` (`BuildSystem.ts:741`) and nothing recomputes it until the next `update()`
tick, so an `expect.poll(() => ghostValid).toBe(false)` fired right after `teleport()` +
`selectBuildable()` should pass **vacuously** off the forced `false` — making up to 9 "placement is
blocked" assertions blind to the block actually breaking. Two of those sites
(`045-megaproject.spec.ts:104`, `e2-stamp-mill.spec.ts:193`) have no `confirmBuild()` check behind
them, so the poll is the only thing asserting the block.

**Control: I removed the block itself** — `BuildSystem.ts:1548`, passing `[]` instead of
`this.reservedFootprints.filter(…)`, so reserved footprints stop blocking placement entirely —
and re-ran `045-megaproject.spec.ts`.

> **The test caught it.** It failed at exactly `:104`, timing out after 5000 ms having read `true`
> the whole time. Reverting `:1548` restored green (3/3 with `e2-stamp-mill`).

So the vacuous-pass window is real but sub-frame: the `page.evaluate` round-trip is normally longer
than one tick, so the poll's *first* read already sees fresh state. **The 9 inverted polls are
load-bearing today.** My hypothesis was wrong, and reading the source would never have told me —
only the mutation did.

### ➡️ Recommendation: DO NOT AUTHOR the sweep

31 removals across 27 files, worth ~1.8 s, next to 9 near-identical siblings that a mutation
control just proved are real assertions. The risk/benefit does not justify it. Recorded, measured,
deliberately not authored — the same verdict s1156 reached about F-1150-2, for the same reason.

---

## F-1158-2 — a 20-day-old red, fixed (`e2e/e2-stamp-mill.spec.ts:202`)

Found while running the baseline for the control above.

`e2-stamp-mill.spec.ts:157` ("Stamp Mill manifest builds to the door without switching epochs")
asserted the story beat reads **"The survey's done."**. It has not said that since **2026-07-08**:

| commit | when | what |
|---|---|---|
| `ffcf2c8d` | 07-08 **08:45** | "fix: make stamp site read as surveyed claim" — wrote the expectation |
| `1511fcb2` | 07-08 **17:47** | "story: E1 beat table (ss-02)" — re-authored all 21 beats, giving `stamp-site-found` the lines `['Fund the first stage here.', "The Steamworks wants a founder's gold."]` (`src/story/beats.ts:173`) |

Nine hours apart, and the expectation was never updated — **red for 20 days**.

It is a stale *test*, not a regression: `:200` asserts `data-beat-id === 'stamp-site-found'` and
passes (the right beat fires), `:183` asserts the plaque still contains 'surveyed for the town' and
passes (ffcf2c8d's substance is intact), and `e2e/ss-02-beats.spec.ts:375` independently asserts the
shipped copy and is green. Only the one string literal was stale.

**Fix:** the expectation now reads the shipped, reviewed copy. The assertion's intent — both
authored lines render on the card — is preserved, and the old text is kept in a comment with its
dates so nobody re-derives this.

---

## F-1158-3 — 🆕 NEW: a mobile-only red that the stale text had been masking

⚠️ **Fixing F-1158-2 did not turn the test green on mobile — it advanced it to a deeper failure.**

| project | before F-1158-2 | after F-1158-2 |
|---|---|---|
| desktop-chrome | red at `:202` | ✅ **green, full test** |
| mobile-chrome (390px) | red at `:202` | ❌ **red at `:145` (via `:216`)** |

Control run, proving the mobile red is not mine: I restored the old string, re-ran mobile, and got
the **identical `:202` stale-text failure**. So mobile was red at `:202` too — meaning **the code
path past `:202` has not been exercised on mobile for 20 days**, and whatever lives at `:145` has
been invisible that whole time.

Measured failure, `fundStage(page, 0)` with `STAGE_COSTS[0] = 90`:

```
expect(economy.gold).toBe(beforeGold - cost)
  Expected: -90
  Received: 0
```

`Expected: -90` means **`beforeGold` read as 0** — on the line immediately after
`grantGold(90)` (`:140` → `:141`). Post-funding gold is also 0, and `site.funded` did flip true.
So on mobile the grant is not visible to the very next read, while on desktop it is.

**Not diagnosed further, deliberately** — the mechanism is unproven and I will not guess at it in a
ledger. Stated as measured. Next step for whoever takes it: instrument `economy.gold` across
`:140`→`:145` on mobile-chrome and find out whether `grantGold` is tick-deferred or the read races
it. Note the shape rhymes with the `ghostValid` staleness above (a harness write whose effect a
following read can beat), which is a hypothesis, not a finding.

---

## Gates on what shipped

| gate | result |
|---|---|
| `npx tsc --noEmit` | ✅ rc=0 (`tsconfig.json` includes `e2e`, so it covers the changed file) |
| `npm run build` | ✅ rc=0, 1.37 s |
| `e2-stamp-mill` + `045-megaproject`, desktop | ✅ **3 passed** (24.1 s) |
| `ss-02-beats` (adjacent — same beat table) | ✅ **4 passed** (35.0 s) |
| `e2-stamp-mill`, mobile-chrome | ❌ 1 passed / 1 failed — **F-1158-3, pre-existing, control-proven above** |
| `src/` touched | **none** — the `:1548` mutation was reverted and `git status src/` is clean |
