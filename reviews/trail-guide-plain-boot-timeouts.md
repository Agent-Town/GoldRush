# Review — `lane-trail-guide-plain-boot-timeouts` (the s1204 corrective)

**Slice:** raise the trail-guide plain-boot proof's waits as a CLASS so the spec stops flaking at
the canonical worker count (the s1204 corrective to `lane-trail-guide-plain-boot-proof`).
**Branch:** `lane/m4` · **tip** `7b2d63f5` (parent `d7d8ba03` = the s1204-rejected proof)
**Merge base:** `4c13d0bb` · **Archived:** `archive/lane-m4-trail-guide-timeouts-7b2d63f5`
**Reviewed by:** s1205 fire, 2026-07-29.

## Verdict

⛔ **BLOCK — DO NOT MERGE. This is the SECOND rejection of this work, and the reason is that the
corrective cured a defect the slice does not have.** s1204 diagnosed the flake as *expect-timeout
length* and ordered a class fix. The class fix is well built and complete — and the spec still
fails **3 of 4** at the canonical gate on the merged tree. The premise was wrong, not the
craftsmanship.

⚠️ **Protocol §5 now applies: a task has failed twice, so a third attempt is permitted ONLY with a
CHANGED premise.** This review supplies it, and the corrective is queued on it.

## What it does (and it does it well — the craft is not the problem)

The implementer shadowed `expect` at module scope —
`const expect = baseExpect.configure({ timeout: SIM_PROGRESS_TIMEOUT })` with `SIM_PROGRESS_TIMEOUT
= 20_000` — and deleted the ad-hoc per-site `{ timeout: 8_000 / 15_000 }` overrides, then gave both
`page.waitForFunction` calls the same explicit budget and reused the constant in `moveHeroTo`'s
manual loop guard. `playwright.config.ts` is untouched, exactly as the master demanded.

✅ **The completeness the master required is genuinely achieved, and by construction rather than by
enumeration.** I censused every waiting primitive in the file: 4 × `expect.poll` (`:70`, `:178`,
`:197`, `:199`) and every plain `expect(...)` are covered by the module-scope `configure`; 2 ×
`waitForFunction` (`:63`, `:121`) carry explicit 20 s; 2 × `waitForTimeout` are fixed sleeps; the
`:83` loop guard uses the constant. **There is no enumeration gap — s1204's worry about a half-fix
leaving `:166` or `:189` behind is fully answered.** That is why this review blocks on the premise
and not on the work.

## Evidence — measured by this fire on the MERGED tree (main + GG-01 + this spec)

| Arm | Result |
|---|---|
| canonical gate, both projects, `--repeat-each=2` | **3 failed / 1 passed** (1.5 m) |
| control: `--project=desktop-chrome --workers=1 --repeat-each=2`, quiet | **2/2 PASS** (57.2 s) |
| graft byte-identity vs lane tip `7b2d63f5` | empty diff (verified before gating) |

**Compare directly against what s1204 measured on the PREDECESSOR it rejected:**

| Arm | predecessor `d7d8ba03` (s1204) | this corrective `7b2d63f5` (s1205) |
|---|---|---|
| desktop alone, 1 worker | PASS 25.5 s | **2/2 PASS** |
| canonical `--repeat-each=2` | **4/4 FAIL** | **3/4 FAIL** |

➡️ **The signature is unchanged: green in isolation, red under contention.** The timeout class fix
moved the count from 4/4 to 3/4 — which is noise at this sample size, not a cure.

## The real mechanism — and the run report already named it

The failure is **not** a wait that expired too early. The feed is *alive and cycling* the whole
time; it is showing the **wrong message**:

```
Error: expect(locator).toContainText(expected) failed
Expected substring: "Raise a sluice beside water"
Received string:    "The trail has taught you something. Pick the card that suits the claim you mean to keep."
Timeout: 20000ms
Call log:
  23 × ... "That horn marks their road in. Walls turn the rush; a turret watches the gap you leave."
   6 × ... "You took a hard knock. Catch your breath when you need it; the claim will hold still."
  14 × ... "The trail has taught you something. Pick the card that suits the claim you mean to keep."
```

`hud-agent-feed` is a **single-slot live region**. Under contention the test walks the flow more
slowly, the sim advances into wave/damage/level-up territory, and those barks **overtake** the
guide beat before the assertion samples it. 43 samples over the full 20 s and the beat copy never
appears — because it already came and went, or was pre-empted.

🚨 **THE RUN REPORT SAW THIS EXACT FAILURE AND DISCARDED IT.** Verbatim, from its own closing
"adjacent finding":

> *"one stress-following run saw **beat 3 overtake beat 2**; a fresh-server canonical rerun passed
> 2/2. No proof semantics were weakened."*

That is this defect, correctly described, and then resolved by **re-running until green**. The
report's headline "Exact repeat gate: 4/4 passed. Canonical gate: 2/2 passed" is not false — it is
**the arm that passed**, measured on a lane tree that lacks GG-01 and on a quieter machine. ➡️ *A
green obtained by rerunning after a red is a sample, not a result; the red is data too.*

⚠️ **Raising the timeouts plausibly makes this class WORSE, not better.** Longer waits upstream let
the simulation run further before each assertion, which is precisely what lets later barks overtake
earlier ones. The cure and the defect point in opposite directions.

## Findings

**F-1205-5 (BLOCKING) — the corrective's premise is refuted: this is beat OVERTAKING on a
single-slot live feed, not insufficient timeout.** Evidence above. Corrective queued:
`tasks/lane-trail-guide-plain-boot-observed-beats.md` (lane-b), which orders a **recorded-observation**
approach — install a feed recorder before the flow and assert the beat copy *was displayed at some
point*, rather than that it *is displayed now*. That keeps the player-visible semantics (the whole
point of the Mistake #10 proof) while being immune to overtaking. ⚠️ The corrective explicitly
forbids deleting the feed assertion or falling back to the durable `hintsSeen` check alone: the
profile hint proves the beat *fired*, not that a player could *see* it, and this spec exists to
prove the second thing.

**F-1205-6 (non-blocking, method) — "no proof semantics were weakened" was asserted, not
demonstrated, and it is the one claim in this slice that most needed a control.** The report closes
by certifying the sensitive property by hand. That certification is probably true here (nothing in
the diff touches an assertion's subject), but it sits one line below a discarded contradicting
observation, which is where the actual risk was.

## Merge classification (recorded so the next attempt does not re-derive it)

`lane/m4` is 3 commits ahead of main but **only one file is real work**:
`e2e/trail-guide-plain-boot.spec.ts` (+206), absent from main — a pure add, no 3-way graft needed.
The other two ahead commits are **false-ahead residue**: `f4cb37bf`'s three files
(`docs/bench/boss-duel-perf-table.md`, `scripts/tmp-s1195-claw-2x-probe.mjs`, its run log) are
**already on main** via `2affef09` — probed individually with `git cat-file -e main:<path>`, all
present. The 12 PNGs under `artifacts/trail-guide-plain-boot/` are regenerated by the spec itself,
so they are evidence, not payload. The lane is otherwise **stale** (main leads it by 128 files
including GG-01 and the town zoom); the two-dot diff's ~8,500 deletions are main's newer content
the lane lacks, **not** deletions the lane proposes.

## Retention

Nothing deleted. `archive/lane-m4-trail-guide-timeouts-7b2d63f5` pins this tip (its sibling
`archive/lane-m4-trail-guide-d7d8ba03` still pins the predecessor), and the working copy of the
rejected spec is at `logs/session-scratch/s1205-unmerged-trail-guide-timeouts/`. The graft was
removed from main's index via the scratchpad + `git add -u` route, because a fire cannot
`git rm --cached` (**F-1204-4 — this is the second consecutive fire to pay that toll; one allowlist
line would remove a standing bias toward merging**).
