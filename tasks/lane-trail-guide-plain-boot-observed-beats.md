# Task lane-trail-guide-plain-boot-observed-beats: the plain-boot proof asserts on a SINGLE-SLOT live feed's CURRENT text, so under contention later barks OVERTAKE the guide beat and the proof goes red — record what the feed displayed instead of sampling what it displays (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1205, 2026-07-29.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `reviews/trail-guide-plain-boot-timeouts.md` (**the s1205 BLOCK — finding F-1205-5, where every number below was measured**); `reviews/trail-guide-plain-boot-proof.md` if present plus STATUS.md's s1204 archive bullet (**the FIRST rejection, whose premise this task replaces**); `logs/session-scratch/s1205-unmerged-trail-guide-timeouts/trail-guide-plain-boot.spec.ts` (**the rejected-but-good spec you are starting from — it is NOT on main**); `e2e/` neighbours for house helpers; `tasks/BACKLOG.md`.

CODEX: gpt-5.6-sol effort=medium

## ⛔ THIS WORK HAS BEEN REJECTED TWICE. READ WHY BEFORE YOU TOUCH ANYTHING.

Protocol §5: *"A task failed twice → third attempt only with a CHANGED premise. Identical retry is forbidden."* The premise **has** changed, and the change is the whole point of this task:

| Attempt | Premise | Outcome |
|---|---|---|
| `d7d8ba03` (s1204) | the spec is correct | BLOCKED — flaky at canonical worker count |
| `7b2d63f5` (s1205) | **the waits are too short** → raise them as a class | BLOCKED — **3/4 red anyway**; premise refuted |
| **this task** | **the assertion samples a transient single-slot feed that later barks OVERTAKE** | ← you |

⚠️ **DO NOT RAISE ANY TIMEOUT AS YOUR FIX.** That was attempt 2. It is already done, it is already in your starting file, it is complete and correct as far as it goes, and it did not work. Raising waits further plausibly makes this **worse**: longer upstream waits let the sim advance further, which is exactly what lets a later bark overtake an earlier beat.

## Why (F-1205-5, measured by the s1205 drain on the merged tree)

The proof walks a plain `/` boot and asserts, at four beats, that `hud-agent-feed` currently contains that beat's copy. `hud-agent-feed` is a **single-slot live region** — one message at a time. Under contention the walk is slower, the simulation reaches wave/damage/level-up events, and their barks replace the guide beat before the assertion samples it.

### 🔑 WHAT THE DRAINING FIRE MEASURED. DO NOT RE-DERIVE FROM MEMORY.

1. **The signature is identical across both rejected attempts — green alone, red together:**

   | Arm | `d7d8ba03` (attempt 1) | `7b2d63f5` (attempt 2) |
   |---|---|---|
   | `--project=desktop-chrome --workers=1 --repeat-each=2` | PASS 25.5 s | **2/2 PASS** (57.2 s) |
   | canonical, both projects, `--repeat-each=2` | **4/4 FAIL** | **3/4 FAIL** |

   4/4 → 3/4 is **noise at this sample size, not a cure.**

2. 🔬 **THE MECHANISM, AT THE CAPTURED BYTES.** The failing assertion waits the full 20 s and samples 43 times, and the beat copy is never among them — the feed is alive the whole time, showing *other* messages:

   ```
   Expected substring: "Raise a sluice beside water"
   Received string:    "The trail has taught you something. Pick the card that suits the claim you mean to keep."
   Timeout: 20000ms
     23 × "That horn marks their road in. Walls turn the rush; a turret watches the gap you leave."
      6 × "You took a hard knock. Catch your breath when you need it; the claim will hold still."
     14 × "The trail has taught you something. Pick the card that suits the claim you mean to keep."
   ```

   This is **not** an expired wait. It is the right message having already come and gone.

3. 🚨 **ATTEMPT 2's OWN RUN REPORT SAW THIS AND DISCARDED IT**, verbatim: *"one stress-following run saw **beat 3 overtake beat 2**; a fresh-server canonical rerun passed 2/2."* It then reported the passing arm as the result. **A green obtained by rerunning after a red is a sample, not a result.** If you find yourself about to re-run a red until it goes green, you are repeating attempt 2 — report the red instead.

## Scope

### 1. Observe-first gate — reproduce BOTH arms before changing anything (MANDATORY; a STOP here is a SUCCESS)

Start from `logs/session-scratch/s1205-unmerged-trail-guide-timeouts/trail-guide-plain-boot.spec.ts` (copy it to `e2e/`; it is not on main). Then, unchanged:

**1a.** `npx playwright test e2e/trail-guide-plain-boot.spec.ts --repeat-each=2` — expect **red** (~2–3 of 4), the failure being a beat's `toContainText` timing out while the feed shows a *different* live message.
**1b.** `npx playwright test e2e/trail-guide-plain-boot.spec.ts --project=desktop-chrome --workers=1 --repeat-each=2` — expect **green**.

⚠️ **If 1a is GREEN, do not conclude the premise is gone** — this is contention-dependent and a quiet machine hides it. Re-run 1a while `npm run build` runs alongside, and say so. Only if it stays green under load do you STOP and report — and quote the exact received-vs-expected text either way, because the mechanism in §2 above is what you are confirming, not the rate.

### 2. Record what the feed DISPLAYED, instead of sampling what it displays (the actual fix)

Install a **feed recorder** in the page before the flow begins — a `MutationObserver` on the `hud-agent-feed` element (plus its initial text) pushing every distinct rendered string into an array on `window`, set up via `page.addInitScript` or an early `page.evaluate` so it is live before the first beat can fire. Then `expectGuideBeat` asserts the beat's copy **appears in the recorded history**, polling the history rather than the current text.

This preserves the semantics the proof exists for — *a player looking at the HUD would have seen this* — while being immune to a later bark replacing it.

⛔ **HARD ANTI-SCOPE — DO NOT "FIX" THIS BY WEAKENING THE PROOF.** Specifically forbidden:
- ❌ deleting the feed assertion and relying on the durable `guideHints`/`hintsSeen` check alone. That proves the beat **fired**, not that it was **visible** — and this whole spec is the Mistake #10 corrective, whose entire subject is "where does the PLAYER see this, in a plain boot?"
- ❌ `?debug`, `?tier=`, or any query parameter. The plain `/` boot is the point; `:130`'s `expect(search.has('debug')).toBe(false)` stays.
- ❌ slowing, pausing, or freezing the simulation so barks cannot occur — that would prove the beat is visible only in a game that is not being played.
- ❌ asserting a *substring-of-any-recent* fuzzy match that would also pass if the wrong beat showed.

### 3. The negative assertions need the same treatment, deliberately

The spec also asserts beats are **dismissed** — `await expect(page.getByTestId('hud-agent-feed')).not.toContainText(GUIDE_BEATS[0][1])` after a click (`:171`, `:177`, and the `taughtCopy` pair at `:198`/`:200`). ⚠️ **These are about the CURRENT text and must stay current-text assertions** — "is no longer showing" is exactly the right question there, and a history-based check would be *wrong* (the copy is in the history by definition, having just been displayed).

**State explicitly in your report that you kept the negatives on current text and why.** Getting this backwards would silently gut the dismissal half of the proof.

### 4. Mutation control — prove the new positive assertion still fails on its own subject

- **m1** — change one expected beat copy to a string the game never emits (e.g. `'Raise a sluice beside lava'`). The history-based assertion must **FAIL**, and its message must show the recorded history so the operator can see what *was* displayed. Restore and confirm byte-identical.
- **m2** — with the real copy restored, confirm the **negative** assertions still bite: make the dismissal click a no-op (comment out the `page.mouse.click(6, 6)` on one beat) and confirm the following `not.toContainText` **FAILS**. Restore.

Both controls must be quoted with their assertion text. A cure that cannot fail is not a cure.

### 5. Re-measure the rate — this task is not done until the canonical gate is green repeatedly

`npx playwright test e2e/trail-guide-plain-boot.spec.ts --repeat-each=2` — **required: 4/4 pass, three times in a row** (12 test executions, zero red). Quote all three invocations. Then run it **once more with `npm run build` running concurrently** and quote that too.

⚠️ **If ANY run is red, report it with its full received-vs-expected text and STOP. Do not re-run for a greener sample** — that is precisely how attempt 2 reached this desk.

### 6. Prove the plain-boot semantics survived

Quote, from the final file: the `page.goto('/')` call, the `expect(search.has('debug')).toBe(false)` assertion, the four positive beat assertions, and the four negative dismissal assertions. Confirm no query parameter and no `src/` byte was added.

## Firewall

**TOUCH-ONLY:**
- `e2e/trail-guide-plain-boot.spec.ts`

**NO:**
- ❌ `playwright.config.ts` — re-timing every suite in the repo is not one slice's call (carried verbatim from the s1204 corrective).
- ❌ `src/**` — this slice ships **zero product bytes**. If you conclude the *game* is at fault (e.g. the guide beat genuinely should out-rank a combat bark in the feed), that is a real finding: **report it, do not implement it.** It is a design question for the owner, and it would be a far more interesting outcome than a green spec.
- ❌ any other `e2e/**` spec.
- ❌ `logs/suite-red-inventory.md` — do not regenerate.
- ❌ raising any timeout as the fix (Why §above). You may keep the 20 s class constant you inherit; you may not treat a bigger number as the cure.

Report adjacent problems; do not fix them.

## Self-check before READY-FOR-GATES

1. `npx tsc --noEmit` clean; `npm run build` green.
2. Scope 1's two arms quoted, with the received-vs-expected text from 1a.
3. Scope 5's **three consecutive 4/4 canonical runs** quoted, plus the under-load run. Any red reported, not re-rolled.
4. Both mutation controls (m1, m2) quoted with verdicts and subjects restored.
5. Scope 3's statement that the negative assertions remain current-text assertions, and why.
6. Scope 6's quoted lines proving the plain boot is intact.
7. `git status` shows **only** `e2e/trail-guide-plain-boot.spec.ts` plus regenerated `artifacts/trail-guide-plain-boot/*.png`.

**READY-FOR-GATES** + report: the scope-1 two-arm result, the recorder design you chose and where you installed it, the m1/m2 verdicts, the scope-5 rates, and **anything this master got wrong** — including, if you find it, evidence that the overtaking premise is itself incomplete. Two premises have already been refuted here; a third refutation is a good outcome, not a failure.
