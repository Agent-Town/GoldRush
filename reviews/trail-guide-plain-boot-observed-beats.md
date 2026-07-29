# Review — `lane-trail-guide-plain-boot-observed-beats` (ATTEMPT 3 OF 3)

- **Slice:** record what the `hud-agent-feed` *displayed* instead of sampling what it *displays*
- **Branch / tip:** `lane/m4` @ `45f78f6e3478cf9347f931d898a56dd6b385b2fa`
- **Pinned as:** `archive/lane-m4-trail-guide-observed-beats` (a lane pre-flight `reset --hard`s; the tip is preserved before anything else touches lane-b)
- **Drained by:** s1206 fire, 2026-07-29
- **§3.0 `drain-block-check`:** ✅ CLEAR — run first, before classification
- **Run report:** `tasks/runs/20260729-094453-lane-b-lane-trail-guide-plain-boot-observed-beats.md.log` (151,238 tokens)

## Verdict: **NOT MERGED — ESCALATED under §5 (third consecutive failure)**

Not a rejection of the craft. The run **stopped on its own first red and reported it**, which is exactly the behaviour whose absence made attempt 2 untrustworthy. It is escalated because the *premise* failed for the third time, and §5 is explicit: *"Third failure = escalate: reassign / decompose / park with reasons."* A fourth cure authored by a fourth confident fire is the pattern this lineage keeps repeating, not a way out of it.

## The lineage — three premises, three reds

| Attempt | Tip | Premise | Outcome |
|---|---|---|---|
| 1 (s1204) | `d7d8ba03` | the spec is correct | BLOCKED — 4/4 red canonical, green alone |
| 2 (s1205) | `7b2d63f5` | the waits are too short → raise as a class | BLOCKED — 3/4 red; **premise refuted** |
| 3 (this) | `45f78f6e` | later barks OVERTAKE a single-slot feed → record history | **3/4 red; premise NOT confirmed** |

Each attempt was complete, competent, and correctly scoped. Attempt 3 delivered exactly what its master ordered: a `MutationObserver` feed recorder installed via `addInitScript` **before** `goto`, positive assertions polling the recorded history, dismissal negatives left as current-text checks, and two mutation controls that both passed (m1: an impossible "lava" copy fails and prints history; m2: a disabled click fails with current text intact). No `src/**` changes, plain `/` boot and the no-`?debug` assertion intact — the Mistake #10 property the whole proof exists for is preserved.

## Why this escalates instead of getting a fourth cure

**The run's own report offers two readings and cannot choose between them** — quoted verbatim:

> The result refutes the overtaking-only premise—or shows that reading current text from a batched `MutationObserver` callback can itself miss an intermediate mutation.

Those are **different defects with opposite cures**, and nobody has separated them. The evidence that makes this sharp:

- At failure the recorded history held **two entries** — the first-run line and `""`.
- s1205 measured the same feed, at the same beat, **alive and cycling**: 43 samples over the 20 s wait, showing `"That horn marks their road in"` ×23, `"You took a hard knock"` ×6, `"The trail has taught you something"` ×14.

A working recorder watching a feed that cycles 43 samples of barks cannot record two entries. So **either** the recorder went deaf (it binds to the first `[data-testid="hud-agent-feed"]` node it sees; the trailing `""` is consistent with that node being emptied or detached while a replacement carried the real messages) **or** the feed genuinely stayed empty in these runs — in which case the overtaking premise is dead and the beat never displayed at all, which is a *product* finding, not a test one.

⚠️ **These two readings point at opposite cures.** "Recorder deaf" → fix the instrument and the proof may pass unchanged. "Feed empty" → the guide beat is genuinely not reaching the player under contention, and the *test has been right all along*. Shipping either cure without separating them is a coin flip.

## What I measured myself, including the part that failed

I tried to settle it with an A/B on a **single run** — the shipped recorder (copied verbatim from `45f78f6e`) and a dumb 100 ms polling sampler installed on the same page, so neither reading could be blamed on run-to-run variance or arm order, the confound every prior attempt carried by comparing a green run to a red one. Probe retained at `logs/session-scratch/s1206-probes/`.

**It did not answer the question, and I am reporting that rather than the reasoning I could have dressed it in:**

| Probe | Result | What it actually shows |
|---|---|---|
| run 1 (waited in town) | `recorder 0 / poll 0 / pollTicks 473 / feedPresentAtEnd false` | **Null.** `hud-agent-feed` exists only inside a launched claim; both instruments honestly reported an absent subject. *A probe that executes nothing reports zero.* |
| run 2 (drove town → board → Launch) | failed at `activePrompt` → `null` after 30 s | Never reached the tavern; the subject state was never entered. n=1, confounded — **not** evidence about the walk. |

Two null probes cost me the ability to settle this in-fire. They are recorded because the alternative — presenting the inference as if measured — is the exact failure this lineage is made of.

## Findings

- **F-1206-1 (HIGH, open — the question that must be answered before any fourth attempt).** Separate "recorder went deaf" from "feed genuinely empty". The decisive measurement is cheap and does **not** need a new cure: run the attempt-3 spec at the canonical gate and, at the moment of failure, dump **both** the recorded history **and** a live independent sample of the feed node (plus whether the node's identity changed since install). If the live sample shows barks the history lacks → instrument. If both are empty → the beat never displayed, and this is a `src/` finding, not an e2e one. **Do not author a fourth cure before this returns.**
- **F-1206-2 (MEDIUM, open).** The recorder binds to the **first** matching node (`observed` WeakSet + a document-level observer to re-attach). If the HUD replaces the feed node, the document observer must fire *and* re-query for the swap to be caught. That re-attachment path is **unproven** — it has no test, and attempt 3's own m1/m2 controls exercise only the happy path where the original node survives. Whatever the answer to F-1206-1, this path should be mutation-proven before the recorder is trusted as a gate.
- **F-1206-3 (informational).** Attempt 3 regenerated all 10 committed screenshots (Bin deltas on every one). Same class as F-1204-2, and the same standing request applies: a gitignore / run-scoped-output ruling would stop rejected slices leaving screenshot churn behind. Never gate on byte-identity of a regenerated screenshot.

## Recommendation

**PARK the slice; do not queue attempt 4.** The next act is F-1206-1's measurement — one instrumented run that separates the two readings — and it is small enough to ride as a scope-1 observe-first gate on whatever eventually fixes this. The three spent premises (spec-correct, waits-too-short, overtaking) are all now on record with evidence, so a fourth attempt starts from a genuinely different place *once the discriminator has run*.

**Nothing about the proof's value has changed:** it is the Mistake #10 guarantee for the first-run trail guide — the one test that asserts a plain-boot player is actually taught. It is worth getting right slowly.
