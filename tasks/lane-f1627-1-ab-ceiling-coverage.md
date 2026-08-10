# Task f1627-1: delete the duplicated ceiling assertion and say, at the site, which arms this test gates — WITHOUT gating the two that would flake (LANE-C, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1627, from **F-1627-1** recorded at the `f1625-1` drain (`reviews/f1625-1-town-ceiling-recalibration.md`, merged `bc35fa79cd9e8509e16c8cc5a4857e60fae35447`).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.

READ FIRST: `AGENTS.md`; `reviews/f1625-1-town-ceiling-recalibration.md` **in full** — it is the finding, the three-run measurement behind it, and the explicit statement of the one fix you must NOT apply; `e2e/asset-diet.spec.ts` — the whole `town byte budget reports normal and saveData arms by URL` test, and the cue test's own ceiling assertion near `:241`.

SEQUENCING: verify the f1625-1 merge is on main by **FILE PROBE, never by grepping commit messages** (Mistake #16 — a message grep matches every *announcement* of a thing, including the authoring commit that preceded the code): `git ls-files artifacts/asset-diet/town-transfer-desktop-chrome.json` must print that path; empty → **STOP and report "f1625-1 not landed"**. Then verify the subject is still what this master claims:
`grep -c "cueTestStats.totalBytes" e2e/asset-diet.spec.ts` → **must be 3**, and `grep -c "expect(cueTestStats.totalBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES)" e2e/asset-diet.spec.ts` → **must be 2**. (Three lines: one artifact-table row carrying both the value and its headroom cell, plus the two duplicated assertions. `grep -c` counts *lines*, not occurrences — which is why the first number is 3 and not 4.) If either differs, the site has moved under this master; **STOP and report the drift** rather than guessing which line to delete. ⓘ Both counts were measured against `e2e/asset-diet.spec.ts` **on main at `bc35fa79c`** while this master was written, not recalled.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1627-1 + F-1627-2, measured s1627 at the f1625-1 drain — every number re-derived from the live tree, not inherited)

`f1625-1` correctly restored the release gate's feed. At the A/B test's assertion site it did something else: it **replaced** the two arms' ceiling checks with two byte-identical copies of a third measurement's check. At the tail of `e2e/asset-diet.spec.ts` ("town byte budget reports normal and saveData arms by URL") two adjacent lines now read, identically:

```ts
expect(cueTestStats.totalBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES);
```

where main had `expect(normalBytes)` and `expect(saveDataBytes)`. `cueTestStats` is not this test's measurement — it is the *cue* test's figure, carried across by map or re-read from `town-transfer-<project>.json`, and **already asserted at `:241`**. So this test now holds **zero independent ceiling coverage**, one dead line, and two computed-and-tabled quantities (`normalCueWindowBytes`, `saveDataCueWindowBytes`) checked against nothing but each other.

⛔ **AND THE OBVIOUS FIX IS THE WRONG ONE — THIS IS THE WHOLE POINT OF THE TASK.** Do not "restore" the two arms by wiring them to the ceiling. The drain measured that arm three times:

| A/B normal arm, desktop, cue-window bytes | run | vs 25,000,000 |
|---|---|---|
| 24,604,025 | `75632a7e3` (f1621-1 — last time it was gated) | under by 395,975 (1.6% headroom) |
| **26,115,186** | the f1625-1 runner's own run | **OVER by 1,115,186** |
| 23,259,297 | the f1625-1 drain's gate run, same tree | under by 1,740,703 |

**A 12.3% swing that straddles the ceiling.** Wiring those two lines makes the suite **intermittently red** — and an intermittent red that nobody owns acquires an excused label and rots (F-1460-1, which cost this factory two days of a red board). Whether the budget should govern that quantity at all is **owner fork F-1625-4**, already on the desk. You will not answer it.

## Scope

1. **Delete the duplicate.** Exactly one `expect(cueTestStats.totalBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES)` remains in this test. Leave `expect(saveDataCueWindowBytes).toBeLessThanOrEqual(normalCueWindowBytes)` exactly as it is — it is this test's real, stable assertion and it is not in question.
2. **Say at the site what the test does and does not gate, in a comment.** A future reader must be able to learn, without leaving the file: that the surviving ceiling assertion is on the **cue test's** figure (the release-gated quantity, also asserted at its own site); that the A/B arms' cue-window totals are **recorded, not release-gated** — which is already what this file's own artifact heading calls them; and that gating them is **refused on evidence, not overlooked** — cite F-1627-2's three measurements and name **F-1625-4** as the open owner fork. Keep it to a short block; it must read as a decision, not an apology.
3. **Make the artifact say it too.** The *A/B cue-window transfer totals (recorded, not release-gated)* table is already correctly headed; add one line beneath it stating the measured swing (the three figures above, with their provenance) so the number that justifies the refusal travels with the evidence rather than only in a review file.

## Firewall

Touch ONLY: `e2e/asset-diet.spec.ts`, and generated evidence under `artifacts/asset-diet/**`.

NO changes to: **`TOWN_TRANSFER_CEILING_BYTES` / `25_000_000`** (F-1441-3 — a threshold moves only with a named cause, and "the arm straddles it" is a reason to *report*, not to re-pin) · **`scripts/deploy.sh`** (the consumer; a needed change there is a FINDING) · **anything under `src/**`** (the prefetch is the subject of this measurement) · the `:241` cue-test assertion · `playwright.config.ts`, `playwright.preview.config.ts` · `package.json` · any other `e2e/*.spec.ts` · `tasks/**`, `specs/**`, `reviews/**`, `STATUS.md`, `tasks/BACKLOG.md`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:asset-diet` — **6/6 both projects, `--workers=1`**. Name the pass/fail counts and wall time.
  ⚠️ **If the desktop `town byte budget` arm TIMES OUT at 240 s, that is F-1627-3, a KNOWN load-conditional red, not your slice** — re-run that one test alone (`--project=desktop-chrome -g "town byte budget"`), report **both** results with the machine's `uptime` load average beside each, and do not adjust any tolerance. It passed alone in 204 s at the drain.
- `grep -c "expect(cueTestStats.totalBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES)" e2e/asset-diet.spec.ts` → **must be exactly 1**. Paste the number.
- `grep -c "TOWN_TRANSFER_CEILING_BYTES = 25_000_000" e2e/asset-diet.spec.ts` → **must be 1** (proof the threshold is untouched). Paste the number.
- **Prove the release gate is still fed correctly, without running a deploy.** Capture the spec's output for `--grep "honest town and claim cues"` and run the gate's own parser over it — `sed -nE 's/.*\[asset-diet\] ([^ ]+) townResponses: ([0-9]+) bytes.*/\1 \2/p'` — confirming **exactly two lines**, one per project, both below 25000000. Paste the parser's output verbatim. ⓘ Run the parser, do **not** run `deploy.sh`: a guard probe must never run the real side-effecting command (it publishes).
- Adjacent suite, unmodified-green both projects: `npx playwright test e2e/advance-stream-cache-reuse.spec.ts --workers=1`. If red, fingerprint against main BEFORE claiming this task caused it.
- `npm run test:node-guards` is **NOT** required — this task touches no `src/sim/`, `src/systems/` or `src/entities/` path (F-1460-1). Say so in your report rather than silently omitting it.
- Zero console/page errors in every arm; `expectNoConsoleErrors` call count unchanged at 6.
- `git diff --numstat` reported in your message.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate (Mistake #1).

End: READY-FOR-GATES + report (1) the suite's counts both projects, with the load average if the desktop arm needed a solo re-run; (2) both grep counts, verbatim; (3) the parser output proving the release gate still gets two sub-ceiling numbers; (4) the exact text of the comment you wrote at the assertion site; (5) confirmation that you did NOT wire the A/B arms to the ceiling, and did not touch `25_000_000`, `deploy.sh` or `src/**`.
