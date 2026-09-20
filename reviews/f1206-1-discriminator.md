# F-1206-1 — the discriminator, run

- **Slice:** none. **This merged no code and cured nothing.** It is the measurement s1206 escalated for.
- **Run by:** s1207 fire, 2026-07-29
- **Instrument:** `logs/session-scratch/s1207-probes/trail-guide-f1206-1-discriminator.spec.ts` (retained, committed)
- **Raw output:** `logs/session-scratch/s1207-probes/run-{quiet-desktop,quiet-mobile,load-1,load-2,load-trace}.txt`
- **Subject tree:** `main` @ `058762f9`, dev server on scratch port **5241** (5188 was occupied by a live process — the lane-collision law)

## Verdict: **F-1206-1 ANSWERED. The recorder is not deaf. The feed is genuinely silent — and it is silent CORRECTLY.**

And the answer does not stop there, because the obvious follow-up ("so the beat never displayed → a `src/` bug") is **also refuted**. The beat never displayed because **its precondition never happened**: the hero never earns a nugget, because the *test's own approach helper* leaves him standing outside the harvest radius. All three spent premises are now explained, and the fourth attempt has a genuinely different place to start.

## The question, and why it could be answered this time

s1206 asked for one instrumented run dumping, at the moment of failure, **both** the recorded history **and** a live independent sample of the feed, plus whether the node's identity changed. Its own two attempts returned nulls because their bespoke navigation never reached the subject (*"a probe that executes nothing reports zero"*).

**This rig fixes exactly that**: it reuses attempt 3's navigation **verbatim** — a path already proven to arrive — and asserts arrival (`contract.activeId === 'the-claim'`) *before* believing any zero. Every failure quoted below carries `arrived=true`. Three instruments ride the same page in the same run, so no reading depends on comparing a green run to a red one, the confound every prior attempt carried.

## Evidence

**Quiet box — both projects, 1 worker:** identical and fully green. All four beats seen, `hintsSeen` complete.

| | recorder entries | poller changes | feed nodes | bound nodes | node swapped? |
|---|---|---|---|---|---|
| desktop-chrome | **7** | 6 | 1 | 1 | no |
| mobile-chrome | **7** | 6 | 1 | 1 | no |

➡️ **The recorder is strictly the STRONGER instrument** — it caught all seven transitions; the dumb 100 ms poller *missed beat 4 entirely* in both runs. F-1206-2's "recorder went deaf" reading is refuted on its face: the thing suspected of missing mutations is the one that missed none. The feed node was never replaced (`boundNodeIsCurrent=true`), so the re-attachment path was never even exercised.

**Under load — `--repeat-each 4 --workers 4`, three separate batteries:** stable **5 passed / 3 failed** every time.

At every failure, with arrival proven:

```
VERDICT INPUT for beat 1: recorder saw it = false, POLL saw it = false
==> FEED GENUINELY SILENT for this beat (arrived=true).
```

Two independent instruments, one page, one run, both empty. **That is the discriminator, and it points at "feed", not "recorder".**

**Then the second-order split — why the feed was empty.** The sim was interrogated at the same instant:

| arm | frames/sec | `channeling` | distance to nearest active seam |
|---|---|---|---|
| **PASS** (5/8) | — | `true` | 0.886 · 1.175 · 1.258 · 1.335 · 1.594 |
| **FAIL** (3/8) | **35.0 · 34.5 · 34.9** (and 30.0 · 29.2 · 33.2 in the trace battery) | `false` | **1.876 · 1.956 · 2.111 · 2.214 · 2.592 · 3.026** |

➡️ **The sim is healthy at ~30–35 fps. "Starved by load" is refuted.** The hero simply is not harvesting: `channeling=false`, and his position is *frozen at identical coordinates* from frame 1046 through frame 2488. The feed is quiet because there is no first nugget to announce. **The trail-guide feature is not broken** — 5 of 8 runs display all four beats.

## Root cause — measured, not argued

The walk trace names it. Target `{x:-9, z:6.7}`; helper tolerance ±0.12 per axis; three failures, one shape:

```
KeyD x=-10.130 (+122ms)
KeyD x=-7.535  (+491ms)   <-- 2.6 units in ONE sample. Target -9. Stop line -8.88.
KeyW z=6.611   (+258ms)   <-- overshoots z the same way
KeyS z=7.550   (+150ms)   <-- the single correction pass overshoots BACK
```

| failure | walk miss dx | walk miss dz | samples | dt mean | dt max |
|---|---|---|---|---|---|
| 1 | **1.400** | 1.580 | 19 | 189 ms | 419 ms |
| 2 | **1.600** | 0.979 | 21 | 178 ms | 491 ms |
| 3 | **2.819** | 1.099 | 22 | 166 ms | 429 ms |

`moveHeroTo` walks **one correction pass per axis, x then z, with no convergence loop and no re-check of x after z**. Its stopping accuracy is bounded by how far the hero travels between two `page.evaluate` round-trips — and under 4-worker concurrency those round-trips cost **166–491 ms against an intended 25 ms loop**. The hero lands 1.9–3.0 from the seam; the pass/fail split puts the harvest radius at ~1.6–1.9.

**This is why attempt 2's premise had to fail.** Raising the waits as a class cannot help: the error scales with *sampling latency*, not with elapsed time, and a hero who has already stopped in the wrong place will stand there for any timeout you give him. The three spent premises were all aimed downstream of this.

## THE CLASS — this is not the trail guide's bug, and it is already costing the board a red

`grep -rln pressUntil e2e/` returns **two** files: this probe, and **`e2e/release-build.spec.ts:308-329`**, which is the **origin** — byte-identical single-pass structure, same 0.12 tolerance, **9 call sites** (`:80,:81,:83,:296,:297,:298,:301,:302,:303`). Line `:303` is literally `moveHeroTo(page, -9, 6.7)` — *the exact target this trace measured*. Attempt 3 inherited the helper and the defect together.

And it is **already on the board as an unexplained known-red**, independently of the trail guide — `logs/suite-red-inventory.md:198` / `:358`:

```
e2e/release-build.spec.ts:297 | Error: Hero blocked while moving KeyW | 67.9 s | MOBILE-ONLY
```

`:297` is a `moveHeroTo` call site and that string is the `pressUntil` throw verbatim. **Fixing the helper converts a documented mystery red into an explained, cured one.** Fix the class, not the instance.

## Findings

- **F-1207-1 (HIGH, answers F-1206-1 — CLOSE IT).** Recorder not deaf; feed genuinely silent; silent *correctly*. Root cause is the e2e approach helper `moveHeroTo`/`pressUntil`, whose stopping error is proportional to `page.evaluate` latency. **Successor authored: `tasks/lane-b-approach-convergence-class.md`.**
- **F-1207-2 (HIGH).** The defect is a **class** in `e2e/release-build.spec.ts:308-329` (9 call sites), not a property of the trail-guide proof — and it already owns the `release-build.spec.ts:297` known-red at `suite-red-inventory.md:198`.
- **F-1207-3 (MEDIUM) — F-1206-2 is refuted, not merely unproven.** The re-attachment path was never exercised because the feed node was **never swapped** (`boundNodes=1`, `boundNodeIsCurrent=true`, every arm). The recorder also out-performed the independent poller 7:6. Keep the mutation-proof request open if the recorder is ever re-landed, but drop the suspicion.
- **F-1207-4 (informational).** The failure rate is stable at **3/8 (37.5%) across three independent batteries** at 4 workers, and **0/2 at 1 worker** — a concurrency-sensitive defect with a reproducible rate, not a mystery flake. That rate is the control any cure must move.
- **F-1207-5 (informational, retention).** The probe regenerated Playwright `test-results/` artifacts, untracked. Same class as F-1204-2/F-1206-3; the standing owner request for a gitignore / run-scoped-output ruling applies.

## What this does NOT claim

The trail-guide proof is **still not merged and is still parked** — this fire did not re-land it and did not author a fourth cure, which F-1206-1 forbids until exactly this measurement returned. It has now returned. The successor below fixes the *approach class* on main, where it also pays for itself by curing a live red; re-landing the proof is the rung after, and it starts from a premise no previous attempt held.
