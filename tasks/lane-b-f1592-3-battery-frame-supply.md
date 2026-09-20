# Task f1592-3: does the REAL gate battery starve frame supply? — Arm B with a positive control (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome).** s1592, 2026-08-09.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.

READ FIRST:
- `AGENTS.md`.
- `artifacts/f1592-1-cdp-throttle-lever/REPORT.md` — **the whole file.** It is the s1592 lever proof and it is why this task can be trusted to mean something. It contains the line `**LEVER PROVEN, AND THE F-1591-1 DERIVATION IS NOW DIRECTLY CONFIRMED AT THE REGIME THAT MATTERS.**` — **grep for that exact span; expect 1, STOP and report if 0** (do not proceed, do not "fix" it).
- `artifacts/f1592-1-cdp-throttle-lever/probe.mjs` — **your starting point; copy it, do not re-derive it.** It contains the line `    await cdp.send('Emulation.setCPUThrottlingRate', { rate });` — **grep for it, expect 1, STOP if 0.**
- `artifacts/f1591-1-frame-supply-cliff/probe.mjs` — its unthrottled parent, merged `5936ec48e`.
- `src/core/Loop.ts` — **the whole file, it is 159 lines.** It contains `const MAX_PRESENTATION_DELTA_SECONDS = 0.05;` — **grep for that exact span, expect 1, STOP if 0.**
- `reviews/f1591-1-frame-supply-cliff.md` — the drained predecessor plus the s1592 drain verdict that filed F-1592-1.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1590-2's Arm B, unmeasured after four attempts — and now finally interpretable)

F-1587-2 has survived four attempts. The s1592 drain of `f1591-1` established the mechanism beyond reasonable doubt, but it established it **synthetically**, and the gap that remains is precisely stated:

- ✅ **Proven (s1592, `artifacts/f1592-1-cdp-throttle-lever/`):** the 0.05 presentation clamp is real and engages exactly as derived. At CDP throttle rate 60 and 80 the ratio `Δelapsed/Δframe` sat at **`0.050000` on every single frame** (mean and max identical), at 4.94 and 4.05 fps respectively. Below ~2.7 fps sustained, the 81 presented frames the spec's wait requires cannot fit inside its 30 s cap, and it times out — the 41.8 s class.
- ❌ **NOT proven, and this task is that question:** that anything in the factory's **real** arrangement ever depresses frame supply that far. A synthetic throttle proving the mechanism *can* fire is not evidence that the gate battery *does* fire it.

This is F-1590-2's original batch-position axis, which `f1591-1` correctly stopped before reaching. It has now been carried, unmeasured, across three fires.

⭐ **WHY THIS ATTEMPT IS DIFFERENT, AND IT IS NOT A BETTER HYPOTHESIS — IT IS A POSITIVE CONTROL.**

Every previous attempt in this thread produced a null result that **nobody could interpret**, because a null is ambiguous between two completely different worlds: *"the load does not starve frame supply"* and *"my harness cannot see starvation even when it happens."* `f1591-1` spent a whole lane run in exactly that trap — its arm criterion was correct and honest, and its lever still could not move the observable, so its null taught nothing.

**You now have a lever that is PROVEN to move the observable.** That converts a null result from noise into a finding. Run the real-load arm and the positive-control arm on the same harness in the same session, and the two possible outcomes are both conclusive:

| Positive control arms? | Real battery arms? | Conclusion |
|---|---|---|
| Yes | Yes | **F-1587-2's mechanism is live in the factory.** Report the fps and the ratio; a cure becomes authorable. |
| Yes | No | **The harness works and the real battery does NOT starve frame supply.** F-1587-2 is then NOT a frame-supply defect in practice, and the thread must be re-aimed or closed. This is a REAL result — report it as such. |
| No | — | Your harness is broken. Report that and STOP; measure nothing else. |

**A null result is a deliverable here, provided the positive control armed.** That sentence is the entire reason this task exists.

## Scope

1. **Copy the probe, do not rewrite it.** Start from `artifacts/f1592-1-cdp-throttle-lever/probe.mjs` into `artifacts/f1592-3-battery-frame-supply/probe.mjs`. It already: seeds the profile, enters town, polls `window.__GR_TOWN_DIAGNOSTICS__` every ~250 ms for `(wallMs, frame, elapsed)`, computes `meanElapsedPerFrame` / `maxElapsedPerFrame` / `fps` / `meanFrameIntervalMs`, sets `armed = meanFrameIntervalMs > 50`, and records its own lever state including an in-page busy-loop liveness timing. **Keep all of that.** Editing anything under `e2e/` is forbidden; copying out of it is allowed.

2. **Arm P — the positive control (RUN THIS FIRST).** One repetition at CDP rate **60**. It must come back `armed: true` with the ratio at or near `0.050000`. **If it does not, your harness differs from the s1592 proof: STOP and report, and run nothing else.** This is a gate on your instrument, not a result.

3. **Arm C — unloaded control.** Two repetitions at rate 1, no background load. Expect ~120 fps, ~8.3 ms interval, ratio ~0.0084, `armed: false`. This anchors the machine's baseline on the day you run.

4. **Arm B — the real battery.** Two repetitions at rate 1 **while a genuine gate battery runs concurrently** against a SEPARATE scratch port. Use the factory's real driver (`scripts/gate-battery.mjs` or the npm gate script the drain skill invokes) on a real spec set — **not** a synthetic hog, which F-1592-1 proved is the wrong lever class. Record, for each repetition, the probe's full summary plus what the battery was running and its wall time. ⚠️ **`--workers=1` is mandatory for every fire-side Playwright command (F-1270-1) and applies to the battery you launch here** — so note honestly that the realistic load is one chromium plus vite, not six, and that this is what the factory actually does.

5. **Report the discriminating table.** For every repetition: arm, rate, background load, `busyLoopMs`, `armed`, `fps`, `meanFrameIntervalMs`, `meanElapsedPerFrame`, `maxElapsedPerFrame`, frames, wait seconds, `errors`. Then state the verdict using the three-row table in the Why section **by name** — say which row you landed in.

6. **Rule on it, and do NOT ship a cure.** Write `reviews/f1592-3-battery-frame-supply.md` with a verdict of **ARMS-IN-PRACTICE** / **DOES-NOT-ARM-IN-PRACTICE** / **HARNESS-FAILED**. The cure is deliberately the next author's call, exactly as it was for `f1591-1`, and for the same reason: three predecessors were right to refuse a cure on an unconfirmed cause. Raising the spec's 30 s timeout stays forbidden (F-1275-1), and `MAX_PRESENTATION_DELTA_SECONDS` is firewalled — changing it would alter sim behaviour for every scene in the game.

## Firewall

**TOUCH-ONLY:** `artifacts/f1592-3-battery-frame-supply/**` (new), `reviews/f1592-3-battery-frame-supply.md` (new).

**NO:** any file under `src/**` (especially `src/core/Loop.ts` and `src/town/TownScene.ts`) · any file under `e2e/**` (read and copy from it; never edit it) · any file under `scripts/**` (you RUN the battery driver; you do not modify it) · `playwright.config.ts` · `tasks/**` · any other `reviews/*.md`. **Report adjacent problems; do not fix them.**

## Self-check before you report

- `npx tsc --noEmit` clean and `npm run build` rc=0 — **expected to be trivially true, because this task changes zero product bytes.** Say so explicitly rather than implying you exercised the game.
- `git status --short` shows changes ONLY under the two TOUCH-ONLY paths.
- Every repetition's artifact JSON exists on disk and its numbers **match the table in your report** — the s1592 drain spot-checked its predecessor's tables against the raw JSON and will do so again.
- Arm P is reported first and its `armed: true` is stated before any other result is interpreted.
- Every kill of a background process is evidenced (PIDs, and a final check showing them dead), per the F-1592-2 standard: **the lever's state belongs in the artifact, not in prose.**
- Scratch ports only (5199/5231/5234/5253-class), `GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL`; **`PORT` sets nothing.**

**READY-FOR-GATES.** Report: the discriminating table, which of the three verdict rows you landed in, the positive control's numbers first, and — if you landed in row 2 — say plainly that the real battery does not starve frame supply, because that is a result and not a failure.
