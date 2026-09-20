# Task f1623-1: make the town-transfer instrument DETERMINISTIC before anyone asserts on it again (LANE-A, commit prefix "test:")

**FIRE-AUTHORED s1623 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.

READ FIRST: `AGENTS.md`; `e2e/asset-diet.spec.ts` (the whole file — the header comment states the problem you are solving and both instruments live here); `reviews/f1621-1-town-budget-instrument-reconciliation.md` (the drain that measured this, findings F-1623-1..3); `tasks/BACKLOG.md` line 1 (finding **F-1623-1**, which this task closes); `artifacts/asset-diet/town-budget-desktop-chrome.md` and `-s1623-control.md` (the two runs, side by side — the pair IS the evidence); `src/assets/AdvanceStream.ts` (READ ONLY — the prefetch whose in-flight behaviour is the suspected cause).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP, whether uncommitted dirt or the entire content of an ahead commit. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

CURRENCY CHECK: this task edits the file that landed in `7e2f03497`. Verify the lane has it before starting — BOTH must succeed:
- `grep -c "export const TOWN_TRANSFER_CEILING_BYTES = 25_000_000;" e2e/asset-diet.spec.ts` must print `1`
- `grep -c "DO NOT QUOTE A SINGLE RUN OF THIS INSTRUMENT AS A FACT" e2e/asset-diet.spec.ts` must print `1`

If either prints `0`, STOP and report "lane stale — f1621-1 absent"; do NOT improvise the predecessor.

## Why (F-1623-1, measured s1623 at the f1621-1 drain — the drain ran the slice's own code as a control and got a different answer)

`tasks/BACKLOG.md` line 1 states the gate this task closes, verbatim: **"Closes when one named town-transfer instrument returns the same figure (within ~1%) across three consecutive runs, and that instrument is the one the release gate reads."**  No owner word is owed — the row records `GATE: none owed to the owner`.

**The instrument swings up to 3.08× at FIXED configuration, and the 25 MB ceiling sits inside the swing.** Two runs of identical code, same machine, ~40 minutes apart (run 1 = the f1621-1 runner, 09:18; run 2 = the s1623 drain control, 09:42):

| quantity | run 1 | run 2 | swing |
| --- | ---: | ---: | ---: |
| A/B `normal` — mobile | **26,542,805** (assertion RED) | 22,469,496 (green) | −4,073,309 |
| A/B `normal` — desktop | 24,604,025 | 21,297,362 | −3,306,663 |
| A/B `saveData` — desktop | 23,363,925 | 13,600,227 | −9,763,698 |
| cue window | 22,497,140 both | 12,376,473 dsk / 13,942,714 mob | up to −10,120,667 |
| decomposition `false/false` | 19,954,153 / 20,650,367 | 6,471,185 both | **3.08×–3.19×** |

➡️ **`expect(normalBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES)` is presently a coin-flip** — it went red for one run and green for the next — so it carries no information about the bundle. Every asset-budget decision downstream of this instrument is currently resting on a single draw.

**A mechanism is available and is stated as a HYPOTHESIS you must test, never assume.** ✓ VERIFIED by reading the code: both instruments stop counting at `assetLoadingState === 'ready'` (`countTownTransfer = false`), but the advance-stream prefetch keeps issuing requests *concurrently* with that flip. So the total is **whatever happened to land before a race resolved** — which is exactly the shape of a 3× swing that grows with how much is still in flight. If that holds, the cure is to stop counting at a **defined** point (network genuinely idle) rather than at a **racing** one, and to separate the duplicate-fetch component out of the total. This is plausibly the same root cause as **F-1621-1** (7 DOUBLE-DOWNLOAD + 8 OVERLAP at the `contract1` door, 4/4 reproducible) and **F-1620-4** (prefetch issuing each URL 2–3×), seen from the byte side.

**One thing IS already stable and must stay that way:** the `content-length` audit read **27 absent / 0 unparseable** in every arm of both runs — all dev/preview-server JS/CSS/HTML, no GLB, no PNG (F-1623-3). Do not disturb it; it is the control that proves the byte totals themselves are not silently truncated.

## Scope

1. **Add a settled stopping point.** After the existing `assetLoadingState === 'ready'` wait, and BEFORE `countTownTransfer = false`, wait until the page has had **no in-flight same-origin request for a continuous 1500 ms** (track in-flight count off `request` / `requestfinished` / `requestfailed`; cap the total wait at 20 s and record whether the cap was hit). Keep counting throughout that settle window. Report the settle duration and the cap-hit flag per arm.
   - ⚠️ **Do NOT change what is counted or how bytes are totalled** — same `content-length` sum, same same-origin/blob filters. You are moving *when counting stops*, nothing else.

2. **Separate the duplicate component from the base.** For every arm, report THREE numbers instead of one: `totalBytes` (as today), `uniqueBytes` (sum over distinct URLs, each counted once), and `duplicateBytes` (= total − unique), plus the count of URLs fetched more than once with their fetch counts. Write these into the artifact for each project. This is the number that tells us whether the swing is duplicates or a moving asset set.

3. **Prove stability — this is the actual deliverable.** Run the full `npm run test:asset-diet` **three consecutive times**, both projects, `--workers=1`, in the same shell, with no rebuild between runs. For each of the three runs record, per project: cue-window bytes, A/B `normal` total/unique/duplicate, and the four decomposition cells. Write a **stability table** into a NEW artifact `artifacts/asset-diet/town-transfer-stability.md` with one row per (run, project, quantity) and a final column giving each quantity's **spread as a percentage of its mean across the three runs**.
   - ✅ **PASS condition for the gate:** at least ONE named quantity holds within **±1% of its mean** across all three runs, on both projects. Name it explicitly as the candidate stable instrument.
   - ⚠️ **A null is a result and must be reported as one.** If NOTHING holds within ±1% — including `uniqueBytes` — then the settle window did not cure it, the hypothesis in "Why" is **REFUTED**, and you must say so in those words, report the best (smallest-spread) quantity with its actual percentage, and state what is left unexplained. **Do NOT widen the ±1% to make it pass, do NOT drop the worst run, and do NOT reach for a fourth variable to close the story.**

4. **Update the header reconciliation comment** with your three-run figures, replacing the two-run table there. Keep it to the same dozen-line scale. **Preserve the sentence `DO NOT QUOTE A SINGLE RUN OF THIS INSTRUMENT AS A FACT` verbatim** — later tasks cite it as a currency key, and it stays true until scope 3 says otherwise.

**Do NOT change the ceiling value, do NOT add, remove, weaken or re-target any `expect(...)`, and do NOT re-pin any number.** The ban from s1621 stands and is now better justified: re-pinning would freeze one draw of a 3×-noisy instrument as the project's belief about its own headroom. If a measurement comes out over 25,000,000, report it loudly and leave the assertion as it is. **Making the assertion trustworthy is a LATER task; this one only makes the measurement trustworthy.**

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `e2e/asset-diet.spec.ts`, and generated evidence under `artifacts/asset-diet/**`.

NO changes to: **`src/assets/AdvanceStream.ts` or anything under `src/**`** — the prefetch is the SUBJECT of this measurement, and changing it while measuring it destroys the evidence; if you conclude the prefetch itself must change, that is a FINDING for your report, not an edit · `scripts/deploy.sh` (the release gate, likewise a subject) · `playwright.config.ts`, `playwright.preview.config.ts` · `package.json` (no new scripts) · any other `e2e/*.spec.ts` · `tasks/**`, `specs/**`, `reviews/**`, `STATUS.md`, `tasks/BACKLOG.md`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:asset-diet` — **three consecutive runs**, both projects, `--workers=1`. Name each run's pass/fail counts and wall time. A run that is red for the pre-existing coin-flip assertion is EXPECTED and is not a failure of this task — record it and continue; do not stop the sequence.
- Adjacent suite, unmodified-green both projects: `npx playwright test e2e/advance-stream-cache-reuse.spec.ts --workers=1`. If red, fingerprint against main BEFORE claiming this task caused it.
- `npm run test:node-guards` is **NOT** required — this task touches no `src/sim/`, `src/systems/` or `src/entities/` path (F-1460-1).
- Zero console/page errors in every arm of every run (the file already calls `expectNoConsoleErrors`; do not weaken it).
- Artifacts written and non-empty: `artifacts/asset-diet/town-budget-desktop-chrome.md`, `artifacts/asset-diet/town-budget-mobile-chrome.md` (each carrying the arms table, the four-cell decomposition, the unique/duplicate split, and the unchanged `content-length` audit) **plus the new** `artifacts/asset-diet/town-transfer-stability.md`.
- Confirm by grep after your edit that `DO NOT QUOTE A SINGLE RUN OF THIS INSTRUMENT AS A FACT` still returns `1`, and that the deploy-gate string `townResponses: ` still appears in the emitted `console.info`.
- `git diff --numstat` reported in your message.

End: READY-FOR-GATES + report (1) the stability table's verdict — the named quantity that held within ±1% across three runs on both projects, **or** the word **REFUTED** with the best actual percentage and what is left unexplained; (2) the unique/duplicate split per arm per project, and whether duplicates account for the run-to-run swing; (3) whether the 20 s settle cap was hit in any arm; (4) confirmation that the `content-length` audit still reads 27 absent / 0 unparseable, or the new numbers if it moved; (5) any measurement over the ceiling.
