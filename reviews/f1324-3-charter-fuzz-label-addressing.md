# F-1324-3 — charter fuzz totality: address arms by LABEL, widen the sweep

- **Slice:** `lane-c-f1324-3-charter-fuzz-label-addressing.md` (authored s1325, FIRE-AUTHORED)
- **Branch / tip:** `lane/e2-arsenal` @ `9d6e66c3` · base `3146eec6` · merged to main as `d961bcd3` (s1326)
- **Run:** `20260801-105916-lane-c-…` — dispatched 10:59:16, READY-FOR-GATES 11:04, 125,780 tokens
- **Verdict: ACCEPTED — merged.** The cure does what the master asked, and I proved it by manufacturing the defect rather than by reading a green.

## What it does

`e2e/charter-press-totality.spec.ts` stopped addressing the charter-mutation menu by hardcoded index. It now
derives a `label → index[]` map by invoking every arm on its own fresh charter, and asserts that map is
**injective** — any label that becomes ambiguous or absent reds the test *naming the label*. The bidirectional
assertion (the arm still FIRES when a briefing exists, and noops after `illegal:missing-briefing`) is kept at
full strength and re-pointed through the map. The totality sweep widened from 169 pairs on one template at
one rng draw to **169 pairs × 3 draws × all 6 Frontier templates = 3,042 scenarios per project.**

One file changed. No `src/`. The rig itself is on the NO list — it is the subject under test.

## Evidence (re-measured by me on the MERGED tree; nothing inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.47s |
| **whole-suite collection** `--list --workers=1` | **`Total: 2476 tests in 350 files`** — baseline held exactly |
| totality + `cp02-charter-boot` + `cp02-charter-stamp`, desktop-chrome, `--workers=1` | **25 passed** (14.6s) |
| same, mobile-chrome (390px), `--workers=1` | **25 passed** (13.6s) |
| `npm run test:node-guards` | **tests 209 / pass 209 / fail 0**, rc=0 |
| console/page errors | zero across both projects |

Boot surface: `cp02-charter-boot` is green in both projects, and the three-dot diff is **one e2e file with zero
`src/` bytes**, so runtime behaviour is bit-identical to `2047781d` by construction.

## The cure was proven by manufacturing its failure, not by its green

A passing guard never executes its violation path, so its green says nothing about the red. Four probes, each
applied to the merged tree and each reverted byte-identical (verified with `git status`):

| # | Manufactured defect | Result |
|---|---|---|
| **A** | renamed arm label `blank:briefing.goal` → `…goalz` (label ABSENT) | **RED** — `mutation arm label "blank:briefing.goal" must map to exactly one index`, at the call site (`:52`) |
| **B** | made `illegal:missing-briefing` return `blank:briefing.goal` (label AMBIGUOUS) | **RED** — same message, raised inside the map builder (`:22`) |
| **C** | swapped menu arms 3 ↔ 4 (a genuine REORDER — the thing the finding was about) | **GREEN** — the new test self-adapts, which is the whole point |
| **D** | simplified the template search to `templates[0]` | **RED** — `mutation arm label "noop" must not occur on a fresh charter` (`:54`) |

**Probe D is the one to remember: the template search at the head of `mutationArmIndices()` is LOAD-BEARING,
not decorative.** A future reader trying to tidy it into `templates[0]` will red the guard. Reason measured
below.

## F-1326-1 (NEW, non-blocking) — the finding's verb was wrong, but the finding was right

F-1324-3 said a menu reorder would leave the old test *"passing while asserting nothing"*. I ran the control:
old spec (`git show 2047781d:…`) against the probe-C reordered rig. It went **RED, loudly** —
`Expected "blank:briefing.goal" / Received "illegal:spawn-edges-empty"`. So for *that* reorder the claim is
false; the old test would have caught it.

Then I measured why the finding was nonetheless correct. Probing every Frontier contract:

```
0 the-claim      buildZones=undefined      3 e1-night-shift buildZones=undefined
1 e1-drill-yard  buildZones=undefined      4 e1-twin-banks  buildZones=2
2 e1-dry-gulch   buildZones=undefined      5 e1-baron       buildZones=undefined
```

**Only 1 of 6 templates has build zones** — and it is *not* `templates[0]`, which is what the test body uses.
So on `the-claim` the `illegal:zone-outside-claim` arm returns `'noop'` on a *fresh* charter. The old test's
second assertion was `expect(arms[3]!()).toBe('noop')`: **move the zones arm to index 3 and that assertion
passes while asserting nothing whatsoever about the briefing guard.** The silent path is real; my first
reorder simply happened to hit the loud one.

That same measurement explains probe D. `mutationArmIndices()` builds its map from the buildZones template
precisely so that `'noop'` never appears on a fresh charter and the map stays injective. Point it at
`templates[0]` and `'noop'` appears, the injectivity assertion fires, and the guard dies.

**The residual, and it is small:** the message *"noop must not occur on a fresh charter"* is only true of
`e1-twin-banks`; it is false for the other five templates, including the one the test body actually runs.
The assertion is sound where it is taken and the map is template-independent, so nothing is wrong — but the
wording claims more than it measures. **GATE: none owed.** Fold a one-line comment naming the template into
the next touch of this rig.

## Merge classification

- Base `3146eec6` = `git merge-base main lane/e2-arsenal`.
- Three-dot diff: **`e2e/charter-press-totality.spec.ts` only** (+47 / −16). LANE-TOUCHED.
- `git log 3146eec6..main -- e2e/charter-press-totality.spec.ts` → **empty**: main never moved the file. No
  MAIN-MOVED bucket, no BOTH-MOVED, no graft needed.
- Two-dot noise (CLAUDE.md, STATUS.md, goals.json, scratch files) is main moving ahead of the lane, not lane
  content — it does not travel with a merge of the lane into main.
- `--no-ff` merge commit `d961bcd3`, parents `2047781d` + `9d6e66c3`.

## §3.0

`node scripts/drain-block-check.mjs <done-move> --strict` → **`✅ CLEAR … status="queued"`, rc=0.** Run under
`--strict` deliberately: a real leaf matched, so this is a genuine clearance and not the UNKNOWN-reads-as-0
trap.

## Runner conduct

Reported an out-of-scope discrepancy instead of silently working around it: *"The task's adjacent filenames do
not exist; used the actual `cp02-charter-boot.spec.ts` and `cp02-charter-stamp.spec.ts`."* Correct behaviour —
and it means **the master I inherited named two specs that do not exist.** Derived adjacency myself by grep for
`charter-press.rig|charterMutationArmsForTest`, which returns exactly those two specs plus the rig. The
runner's substitution was right.

The master pre-declared a STOP if the widened sweep uncovered a real throw. It did not: 3,042 scenarios per
project, all total. That is a genuine negative result, not an absence of testing.
