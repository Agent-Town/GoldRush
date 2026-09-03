# tape-resume — a rider's tape becomes its checkpoint

**Slice:** `tape-resume` (HarnessDev §3 E, the checkpointing gap)
**Branch:** `lane/c` · **tip** `ed3203ab3726672e1a14ee38114181cd0a424663` (runner commit)
**Merged to main:** `54ad83927f0325b25bb78e5c4a1df67a821047b9` (drain s2471, 2026-09-03)
**Gate base:** `5b20071a35f4a0dda2a6d734ea4088e30c0b5cf2` (main tip at gate time)
**Gate worktree:** `gate-s2471` (detached — §3.0b custody: nothing undecided ever entered main's tree)

## VERDICT: MERGED

---

## What it does

A rider that hit a wall mid-ride used to lose the ride. The sim is deterministic and the tape is
the complete input log, so the state at tick N was always reconstructible — nothing exposed it.
`scripts/gr-sim.mjs` now takes `--resume <tape.json> [--to-tick N]`: it replays the tape's inputs
through the **shared** `AgentTapeReplaySession` to that tick, hands the *same* headless sim back to
the rider loop, and continues recording into the *same* tape. Entries before the resume tick are
carried through unchanged; `id`, `meta` and `runStart` are inherited from the base tape, so the
finished reel is one contiguous input log with one era stamp and a single `durationTicks`.

`src/replay/AgentTapeReplay.ts` gains exactly one additive entry point, `resumeAt(targetTick)`,
which advances the existing session and returns the live sim. No existing code path changed.
`public/skill.md` teaches the three real commands under "Your tape is your checkpoint", and
`scripts/skillmd-guard.test.mjs` pins that paragraph and the resume command line.

The door needed **no new field** — the resumed tape is an ordinary v2 reel.

## Evidence (measured on the MERGED tree, in `gate-s2471`)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, built in 3.82 s; asset-diet within ceiling (1,158,214 / 1,500,000 B) |
| `scripts/gr-sim.test.mjs` (own spec) | **rc=0** — 24 tests / **22 pass / 0 fail** / 2 skipped, 491.6 s |
| `scripts/skillmd-guard.test.mjs` (conflicted file) | **rc=0** — **14/14**, 12.0 s |
| `npm run test:stats` | **rc=0** — 87 stats-worker / **215 KV** / **215 sqlite** / 26 ledger-worker, 7.7 s |
| `scripts/engine-era-guard.test.mjs` | **rc=0** — 5/5 |
| `scripts/view-schema-guard.test.mjs` | **rc=0** — 3/3 |
| `e2e/true-reel-harness.spec.ts` (shared replay must not move) | **rc=0** — **2 passed** (desktop + mobile), `--workers=1` |
| `e2e/_s2080-f1742-1-boot-probe.spec.ts` | **pass**, both projects |
| `e2e/agent-reels.spec.ts` | 22 passed / **2 failed** — **PRE-EXISTING ON MAIN, control-proven**, see F-2471-1 |

**The determinism proof is inside the slice's own spec and it ran here, not only on the lane.**
`gr-sim resumes at a recorded mid-ride tick as one byte-identical tape` asserts, in one test:
a straight ride and a resume at a mid-ride entry tick produce **byte-identical tape files**; the
independent assayer (`scripts/assay-replay.mjs`) reproduces the same `eventLogHash`; and
`validateTape` from `functions/api/standings.ts` **accepts** the resumed reel. It passed on the
merged tree. The runner's own slip for the same assertions: `[tape-resume]
straight=fnv1a32:feed2f7c resumed=fnv1a32:feed2f7c assay=fnv1a32:feed2f7c door=accepted`.

`test:stats` reproduces s2470's counts exactly (87/215/215/26), which is a free control that the
refusal-taxonomy merge one fire earlier is intact under this one.

## Engine era — a lineage APPEND, not a bump

`src/` is inside `ENGINE_SOURCE_INPUTS`, so the additive `resumeAt` moved the identity hash:

- main before: `8ccbfe165813b81a468e23676903a807b2c91f89a0e4fae813cfdc6a3293969f` (s2469 harness-receipts)
- merged tree: **`2a06eb514e3037efc403fc59f4540bbca31ef8947ee1e58cd56cf157a5aecd47`**

Era 5 gains pin 15 with that hash; `era` stays **5** and `history` is untouched — simulation
behaviour did not change, so this is **not** player-visible news by the engine-era-law-v3 test.
Re-measured after writing the pin: the hash is **unchanged**, confirming `assets/engine-era.json`
sits outside its own corpus (the s2423 narrowing).

**Teeth, proven by manufacturing the defect rather than by reading a green (F-2215-1 — the control
arm asserted its own validity first: main's era file is 11,979 B and really was written):** with
the era file reverted to main's version on the merged tree, `engine-era-guard` goes
**rc=1, 4 pass / 1 fail**, naming *"the landed registry names the live engine and stays outside its
hash corpus"* (`actual: false, expected: true`). With the pin: **5/5**. The pin is load-bearing,
and this is the exact duty the runner reported as owed to the drain.

## Merge classification (base `5b20071a3`, lane behind=19)

| File | Class | How resolved |
|---|---|---|
| `src/replay/AgentTapeReplay.ts` | LANE-TOUCHED | clean |
| `scripts/gr-sim.test.mjs` | LANE-TOUCHED | auto-merged clean |
| `public/skill.md` | BOTH-MOVED | auto-merged clean (lane's paragraph lands below main's refusal-list section) |
| `tasks/BACKLOG.md` | BOTH-MOVED | auto-merged clean |
| `scripts/gr-sim.mjs` | **CONFLICT** | union — see below |
| `scripts/skillmd-guard.test.mjs` | **CONFLICT** | syntactic-boundary resolution — see below |
| `assets/engine-era.json` | MAIN-ONLY + drain edit | pin appended by this drain (firewalled from the runner by the master) |

**`scripts/gr-sim.mjs` — a plain union, both hunks.** `SOLO_KEYS`/`SEAT_KEYS`: main had added
`harness-ref` (s2469 harness-receipts), the lane had added `resume`/`to-tick`; kept both. `--help`:
kept the lane's `--resume` usage line **and** main's room line carrying `[--harness-ref …]`.
`node --check` rc=0.

**`scripts/skillmd-guard.test.mjs` — this is F-2469-1's hazard, hit for the second consecutive
fire, and s2470's finding is why I looked before splicing.** Both sides left their final `test(`
**open**, closed by a single **shared** `});` below the conflict marker. A keep-both union
therefore yields `test(` nested inside `test(` — a file that will not parse — while a
presence-check for each side's strings passes happily. Resolved by closing HEAD's open `test()`
explicitly before the lane's block, and **verified by parsing and by set algebra, never by diffing
lines**:

- `node --check` **rc=0**; 0 conflict markers left
- **14 top-level `test(` / 0 nested** (per-line scan; note a naive `/^\s+test\(/m` reports a
  false nested count on *both parents* too, because `\s` eats the newline — the per-line scan is
  the authoritative one)
- set algebra on test names: main **13** ∪ lane **10** = **14**, actual **14**, `missing []`,
  `invented []`
- then **14/14 green**, so both sides' assertions run rather than merely being present

The merged tree's `git diff --cached HEAD` stat is **byte-for-byte the lane's own
`main...lane/c` stat** (6 files, +137/−27) before the pin was added — a free corroboration that
the resolution lost nothing of main's and invented nothing of the lane's.

## Findings

### F-2471-1 — the browser's era refusal is UNREACHABLE for the exact tape shape it names, and its guard is RED on main today (PRE-EXISTING, not this slice)

`e2e/agent-reels.spec.ts:301` — *"plain town board WATCH gives a half-stamped reel its honest
unstamped-era refusal"* — **fails on both projects**, expecting `data-era-refused="true"` and
receiving `"false"`, with the show reading `data-playback="playing"`: the reel is **played**, not
refused.

**CONTROL, and it is what keeps this out of my merge's account: the identical failure, identical
fingerprint, both projects, reproduces on `main`'s own worktree with none of my files present**
(rc=1, 2 failed, same line 307, same expected/received). It is a known-red of the tree I merged
onto, not a red I introduced — §3's "fingerprint-matched to known-reds with proof".

**Diagnosed by READING, and the mechanism is exact.** `src/game/Game.ts:7091` computes the
refusal correctly — `!meta?.engineHash || meta.era !== engineEra.era || !engineEraIncludes(...)`
— and it is the **only** site that computes it. But the routing condition seventeen lines above,
`Game.ts:7033`, is `if (hasAgentOrders && tape.meta?.engineHash && tape.meta.era)`. A tape whose
`meta` carries an `engineHash` and **no `era`** — precisely the "half-stamped" shape the refusal
at 7091 exists to catch — fails that guard and falls through to the **legacy human-tape replay
path**, which never computes `eraRefusal` and simply plays the reel. **The router and the refusal
are complements that overlap wrongly: the gate diverts the case away from the only code that can
judge it.**

⚖️ **Severity stated honestly and deliberately not inflated.** This is **not** a ranking or data
defect: the door's server-side era filter (`functions/api/standings.ts`) is untouched, and
`test:stats` proves it green at 215/215 across both storage paths, so no unstamped reel can rank.
The cost is **honesty on a player-visible surface** — the Lantern Show plays a reel that does not
announce its era instead of showing the refusal the owner's 2026-08-31 era ruling promises — plus
a **guard that is red in the mandated e2e battery**, which is how a red decays into something
nobody investigates (F-1460-1).

🚫 **Deliberately NOT fixed here.** `src/game/Game.ts` and `src/ui/LanternShow.ts` are outside this
master's TOUCH-ONLY list, and a routing change on the true-reel driver needs its own gate. Filed
priced: the cure is one condition at `Game.ts:7033` (route on `hasAgentOrders` alone and let 7091
judge the stamp), and the e2e that must go green is the one that is already written and already
failing — so the corrective needs no new test, only the fix.

## Retention

Regenerated evidence under `reviews/shots-reel-era/`, `reviews/shots-lantern-true-terrain/`,
`reviews/shots-true-reel-sprites/`, `reviews/shots-f1742-1/` is byte-churn from re-running those
specs in the gate worktree; it was **not** committed by this drain (the merge commit carries
exactly the 7 files in the stat above). The failing test's own context lives in
`gate-s2471/test-results/agent-reels-plain-town-boa-eaa6c-onest-unstamped-era-refusal-*/`.
