# Review — lantern-show-agent-honesty

- **Slice:** `lantern-show-agent-honesty` (owner playtest 2026-08-25 → the Lantern Show's false theater)
- **Branch / tip:** `lane/d` @ `982926333`
- **Base:** `858baeb81`
- **Gated in:** detached worktree `gate-s2318` at main (§3.0b — undecided content never entered main's tree)
- **Merge commit:** `0a2dbdeaac76faada134e28d15b49e0e1fbdbb6d`
- **Drained by:** s2318, 2026-08-25

## VERDICT: MERGED

The gated commit itself was landed by `git merge --ff-only`, so main's tree is **byte-identical** to the
tree every number below was measured on — `4b4617ccfb753c3e690f8c21716f94c2aa57c788` on both sides,
verified after the merge, not assumed.

## What it does

The owner watched a published Dry Gulch agent reel and reported (verbatim): *"this reel ended but the
player should die: [the dry-gulch watch URL] instead it looks like this continues? weird, somehow very
weird"* and *"and I can't play the 20 waves that it is supposed to have?"*

The county already proved (F-ASSAY-E2E-3) that agent tapes **cannot** faithfully replay in the browser —
the worlds differ from tick 0. The assayer learned that and routes agent tapes to the sim engine; the
**viewer never did**. So the Lantern Show was rendering a divergent hallucination under a "Verified" chip,
and then running *past* the reel's content into an endless swarm around an apparently undying idle hero.
That is the worst failure available to this surface: false theater presented as proof.

This slice does not try to make the browser replay agent tapes faithfully — that is the proven-impossible
path. **Honesty about the approximation is the fix.** Three changes:

1. **The approximation banner.** Agent reels open with a plain statement in the county voice, carrying the
   tape's own recorded verdict: *"This is a browser APPROXIMATION of a machine ride. VERIFIED outcome:
   SECURED · wave 20 · fnv1a32:08ad7db2 — replayed exactly on the county's engine."* It reuses the replay
   seam's existing `agentTape` discriminator rather than minting a second one.
2. **The recorded-outcome card.** At the end the show renders the truth from the tape's own `outcome`,
   regardless of what the approximation did — and when the approximation diverged terminally earlier, it
   says so by wave: *"The approximation diverged from the verified ride at wave 9 — exact replay runs on
   the county's engine."*
3. **The hard ending.** Root cause found and named by the runner: replay death cleared `deathPending`
   without completing playback, leaving a zero-HP immortal hero, and secure-state early returns bypassed
   the end-of-update finisher entirely. Duration, death and early secure now route through one
   `finishRunTapeReplay` hard-stop, and a completed replay returns `false` from the fixed-step callback so
   the diagnostics tick cannot advance behind the card.

Human (browser-recorded) reels keep the match/refusal path and show no banner — they replay faithfully by
construction.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **green, 1.72 s** (asset-diet ceilings respected) |
| `e2e/agent-reels.spec.ts` + `e2e/tape-02-lantern-show.spec.ts` | **4/4 pass**, desktop-chrome + mobile-chrome, `--workers=1` (1.1m) |
| `e2e/task-025-bandits-dont-swim.spec.ts` | green (both projects) |
| `e2e/m1-01-claim-jumpers-death.spec.ts` | green (both projects) |
| `e2e/run-suspend.spec.ts` desktop | **5/5 pass** run alone |
| `e2e/run-suspend.spec.ts` mobile | 4/5 — **1 INHERITED red, proven below** |
| Zero console/page errors | asserted inside both slice specs (`expect(errors).toEqual([])`) |
| Screenshots | `reviews/shots-lantern-honesty/` — banner + outcome, desktop + 390px |
| `test:node-guards` | **not mandated** — diff touches `src/game/` and `src/ui/`, **not** `src/sim|systems|entities` (F-1460-1 keys on the directory) |

All playwright runs passed `--workers=1` per §3.1.

### The one red, and why it is not this slice's

`run-suspend.spec.ts:194` (*wave-boundary suspend restores state and matches the uninterrupted seeded run*)
fails on **mobile-chrome** and reproduces in isolation, so it is not contention noise. It is an inherited
red, proven by a **revert control** rather than argued:

- With the slice's two source files reverted to main (`git checkout main -- src/game/Game.ts
  src/ui/LanternShow.ts`), leaving everything else on the merged tree, **the same test fails the same way.**
- The failure is a console-error assertion collecting three `THREE.GLTFLoader: Couldn't load texture
  blob:...` messages — an asset/texture-loading artifact on the 390px viewport, with no relationship to
  replay, the lantern show, or any path this slice touches.

The differential is therefore **clean**: no red on the merged tree is attributable to this slice.

Two further desktop reds (`:194`, `:282`) appeared only in the first combined 28-test invocation and did
**not** reproduce when `run-suspend.spec.ts` was run alone (5/5). Recorded as contention, not findings.

## Merge classification

Base `858baeb81`.

| File | Class | Resolution |
|---|---|---|
| `src/game/Game.ts` | LANE-TOUCHED | lane side taken |
| `src/ui/LanternShow.ts` | LANE-TOUCHED | lane side taken |
| `e2e/agent-reels.spec.ts` | LANE-TOUCHED | lane side taken |
| `e2e/tape-02-lantern-show.spec.ts` | LANE-TOUCHED | lane side taken |
| `reviews/shots-lantern-honesty/*.png` (4) | LANE-TOUCHED (new) | added |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | **three-way graft** |

`tasks/BACKLOG.md` is the only both-moved path: s2317 appended the F-2316-1 row to main this same fire
while the lane appended its own row. `ort` auto-merged, and **the result was verified by content, not by
the absence of a conflict** (a clean merge is not proof): `grep -c "F-2316-1"` = 1 and
`grep -c "LANTERN SHOW AGENT HONESTY BUILT"` = 1 on the merged tree, with the line count 4738 → 4739,
i.e. exactly the lane's one added line on top of main's intact row. A blind lane-side copy would have
silently reverted s2317's row.

Every other file main moved since the base (`STATUS.md`, `logs/*`, `reviews/f2315-1.md`, `tasks/goals.json`,
`tasks/lantern-show-agent-honesty.md`) is MAIN-MOVED-ONLY and untouched by the lane.

## Findings

### F-2318-1 — the agent-reel arm of the new e2e can only boot with `?debug`, so no committed test asserts the banner on a plain boot (NON-BLOCKING)

Mistake #10 asks of every user-facing merge: *where does the PLAYER see this, in a plain boot?* Answering
it here took a probe, and the answer is good — but the test coverage does not carry it.

`e2e/agent-reels.spec.ts` boots with `debug: ''` in its query string. That is not laziness: **both** of the
mechanisms it needs are debug-gated. `assayReplayBoot` (`src/game/Game.ts:420`) returns the boot unchanged
unless `isDebugEnabled()`, and the `window.__GR_TEST__` harness hook used to drive the sim to
`durationTicks` exists only in debug. I wrote a scratch probe that repeated the spec's assertions with no
debug flag; it timed out on `waitForFunction(() => window.__GR_TEST__)` — i.e. it failed on the *harness*,
not on the feature. The probe was discarded, not committed.

**The feature itself is genuinely reachable by the player, and this is VERIFIED by reading rather than
inferred:** `agentTape` is derived at `src/game/Game.ts:6940-6941` from the tape's own content
(`recordings.some(... isAgentOrdersAction)`) and has no dependence on debug whatsoever. The plain-boot path
into the show is separately proven green by `tape-02-lantern-show.spec.ts`, which reaches the show through
the town board's WATCH button and **explicitly asserts `searchParams.has('debug') === false`** — and that
spec now also asserts the banner is *hidden* for a browser reel and that the RECORDED OUTCOME card renders
at completion. So the no-debug path, the hard ending and the human-reel negative are all covered; only the
agent-reel *positive* rides on debug.

Closing the gap needs an agent tape reachable without the `assayReplay` injection — e.g. a seeded standings
row the board can serve — which is a test-fixture project of its own and outside this slice's firewall.

**Not blocking:** nothing is unproven about player reachability, and the owner's reported defect is
demonstrably cured. Recorded so the next fire touching agent-reel e2e knows the constraint is structural.

### F-2318-2 — `run-suspend.spec.ts:194` mobile texture-blob console red is live on main (NON-BLOCKING, inherited)

Measured above by revert control on the merged tree. Three `THREE.GLTFLoader: Couldn't load texture
blob:` console errors on the 390px viewport fail that spec's zero-console assertion. It is **on main**,
predates this slice, and belongs to whichever fire has budget for it. Filed here because it was measured
here with a control — not carried as a rumour.

## Where the player sees this

The town board's WATCH THIS button on any standings row whose tape exists opens the Lantern Show with no
debug flag (proven by `tape-02-lantern-show.spec.ts`). For any row whose tape carries agent orders —
every agent submission, per the EXECUTION-PUBLIC LAW — the banner appears at the top of the show from the
first frame, and the recorded-outcome card closes it. Screenshots of both, desktop and 390px, are in
`reviews/shots-lantern-honesty/`.
