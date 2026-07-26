# Task lane-approach-steer-to-arrival (rf-37): NINE TOWN-APPROACH HELPERS WALK BY WALL CLOCK, THEN POLL FOR AN ARRIVAL THE INPUT CAN NO LONGER PRODUCE
**FIRE-AUTHORED (attended review welcome) — s1106, 2026-07-27. This is F-1104-3's owed "deterministic-stepping fix", re-measured from 2 sites to 9.**

**READ THIS FIRST — THE DEFECT IS NOT "A TIMEOUT IS TOO SHORT". Raising the holds or the poll timeout is a FIREWALL VIOLATION here.** The bug is structural: the helper releases the key, *then* waits for the hero to arrive. Once the key is up nothing moves, so the poll can only ever observe a hero who already got there — and under load, fewer frames render inside a fixed `waitForTimeout`, so less distance is travelled and the poll times out against a hero standing still. A bigger number changes the odds and not the shape. See CURE.

You are Codex (worktrees/lane-a).

CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated)

**F-1104-3 — `reviews/078-focus.md:69-75`, s1104, measured on both trees:**

> First sample looked like a regression: failed on merged, passed on clean-main control. **Repeating it disproved that** — merged **1 pass / 1 fail**, control **1 pass / 1 fail**, identical. The failure is never in a ledger assertion; it is in the `approachSchoolhouse` helper, where `hold(page,'KeyA',1150)` and `hold(page,'KeyS',900)` are **wall-clock** holds whose distance travelled depends on how many frames the box renders in that window. Load-sensitive by construction — F-1101-1's class. Not a blocker; worth a deterministic-stepping fix on the ladder.

**THE LIST WAS RE-MEASURED THIS FIRE AND IT GREW FROM 2 TO 9** (the standing law — s1092's "five specs" was four, s1095's "four callers" was six). s1105's handoff carried this as *"the flake fix for `en-02-e1-coverage:244` + `restore-validation:186`"*. Both halves of that sentence were wrong in a way that matters:

- `en-02-e1-coverage.spec.ts:244` is the **test declaration line**, not the defect. The defect is at `:183` and `:189`, in the two helpers that test calls.
- **`restore-validation.spec.ts:186` IS NOT A MEMBER OF THIS CLASS AND IS OUT OF SCOPE.** It contains no `hold`, no key input and no movement at all — it is a page-load restore test built on `waitForFunction`. F-1104-6 (`reviews/hero-y-restore-roundtrip.md:61-71`) proved it flakes on both trees but never identified a mechanism, and its closing line *"both are wall-clock races"* **lumps two different defects on an untested assumption.** Do not touch it. Its diagnosis is separately owed.

**THE NINE SITES — `grep -n "async function approach\|async function openBoard" e2e/` plus a read of each body. Every one has the identical shape: one or more fixed-duration holds, then `expect.poll` for an arrival:**

| # | site | walks | then polls for |
|---|---|---|---|
| 1 | `e2e/en-01-claim-ledger.spec.ts:76` `approachSchoolhouse` | `KeyA 1150`, `KeyS 900` | `activePrompt === 'schoolhouse'` |
| 2 | `e2e/en-02-e1-coverage.spec.ts:183` `approachSchoolhouse` | `KeyA 1150`, `KeyS 900` | `activePrompt === 'schoolhouse'` ← **F-1104-3's named site** |
| 3 | `e2e/en-02-e1-coverage.spec.ts:189` `approachTavern` | `KeyA 850`, `KeyW 850` | `activePrompt === 'tavern'` |
| 4 | `e2e/072-era-activation.spec.ts:145` `approachStampMill` | `KeyD 650`, `KeyS 1150` | `activePrompt === 'stamp-mill'` |
| 5 | `e2e/072-era-activation.spec.ts:152` `openBoard` | `KeyA 850`, `KeyW 850` | `activePrompt === 'tavern'` |
| 6 | `e2e/gz-h1-newsie.spec.ts:79` `approachNewsie` | `KeyA 480`, `KeyW 520` | `activeBark.actorId === 'newsie'` |
| 7 | `e2e/town-t1-square.spec.ts:53` `approach` | caller-supplied `[key, ms][]` | caller-supplied prompt |
| 8 | `e2e/town-t2-naming.spec.ts:48` `approach` | caller-supplied `[key, ms][]` | caller-supplied prompt |
| 9 | `e2e/wd02-barks.spec.ts:68` `approachNewsie` | inline `down`/`waitForTimeout 480`/`up`, then `520` — **same shape, no helper** | `activeBark.actorId === 'newsie'` |

**Why `tsc` never caught any of it:** these are wall-clock races in test plumbing, not type errors. Nothing here is detectable without running under load, which is exactly why it has manufactured false reds for drains passing nearby (s1104 burned a control battery proving one of them pre-existing).

## THE CURE — steer to arrival, and take the target from the RUNTIME

**The pattern already exists in this repo and is proven green.** `e2e/e3-research-tree.spec.ts:66-82` (and its twins in `e4`/`e5`/`e10-research-tree`, `board-era-chapters`, `cw-02-escort`, `078-ux-hygiene`) does exactly the right thing:

```ts
for (let step = 0; step < 48; step += 1) {
  if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === 'schoolhouse') break;
  const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
  const keys: string[] = [];
  if (Math.abs(SCHOOLHOUSE.x - position.x) > 0.6) keys.push(SCHOOLHOUSE.x > position.x ? 'KeyD' : 'KeyA');
  if (Math.abs(SCHOOLHOUSE.z - position.z) > 0.6) keys.push(SCHOOLHOUSE.z > position.z ? 'KeyS' : 'KeyW');
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(160);
  for (const key of keys.reverse()) await page.keyboard.up(key);
}
```

The loop re-aims every iteration and exits **on the condition**, not on a clock. A slow box simply takes more iterations.

**TAKE THE TARGET FROM THE RUNTIME, NOT FROM A NEW LITERAL.** `TownScene.ts:2029-2102` already publishes both, and you must use them:
- **buildings** (`:2064-2074`) expose `id`, `position` **and `approach`** — `approach` is the intended stand-point (`townPlazaSlot(building.id).approach`). Prefer `approach`; fall back to `position` only if `approach` is null, and say so in your report.
- **actors** (`:2081-2093`) expose `id` and a live `position` — use these for sites 6 and 9 (`newsie`).

⚠️ **Do NOT copy the `const SCHOOLHOUSE = { x: -8.2, z: 5.4 }` literal.** It is duplicated in **13** spec files and is a frozen copy of a value `src/` publishes at runtime — the same "frozen spec + moved source" class as F-1101-2. Adding a 14th is a scope violation. **Report the 13, do not fix them** (that is a separate owed corrective, and it needs its own battery).

**`teleport` is FORBIDDEN in this task.** `__GR_TOWN_DIAGNOSTICS__.teleport` (`:2036`) exists and `e2e/trail-guide.spec.ts:53-58` uses it, so it will look like the shorter road. It is stronger medicine than this defect needs and it **stops exercising the walk** — sites 7 and 8 in particular are *about* prompts appearing as the hero moves between shells. If you believe a specific site should teleport, **propose it in the report and leave the code steering.**

## SCOPE (numbered; each item is testable)

1. **Sites 1–6 and 9** — replace the fixed-duration holds with a steer-to-arrival loop per the CURE. Keep each helper's existing signature and its final `expect.poll` assertion **exactly as they are** — the assertion is the contract and it is correct; only the walking changes. Resolve each target by id from the runtime arrays (`schoolhouse`, `tavern`, `stamp-mill`, `newsie`).
2. **Sites 7 and 8** (`town-t1-square:53`, `town-t2-naming:48`) — these take a caller-supplied `[key, ms][]` route, so there is no single target coordinate inside the helper. Change them to steer toward **the prompt they are already given as an argument**: resolve that prompt id against the runtime `buildings` array and steer to its `approach`, ignoring the `ms` values. Keep the parameter list source-compatible so callers need no edit; if a caller passes a prompt id absent from `buildings`, **STOP and report that caller** rather than inventing a fallback.
3. **Every loop is bounded and fails loudly.** Cap iterations (48 is the proven figure) and, on exhaustion, let the existing `expect.poll` produce the failure — do **not** swallow a non-arrival into a silent pass. A helper that returns successfully without the prompt being active is a worse bug than the one you are fixing.
4. **Do not modify `src/`.** Every hook you need already ships. If a needed field is genuinely absent from the diagnostics, **STOP and report** — extending the diagnostics surface is its own slice.
5. **Do not touch `e2e/board-card-images.spec.ts`.** It carries the same `hold(page,'KeyA',850)` shape and is a real member of this class, **but it is the adjacency gate of the concurrently-queued `lane-contract-art-key-adoption` task (lane-c)**, and two lanes must not edit and gate the same file at once (Mistake #12: Gate Contamination). It is site 10, deliberately deferred; name it in your report as owed once lane-c lands.

## FIREWALL

**TOUCH-ONLY:** `e2e/en-01-claim-ledger.spec.ts` · `e2e/en-02-e1-coverage.spec.ts` · `e2e/072-era-activation.spec.ts` · `e2e/gz-h1-newsie.spec.ts` · `e2e/town-t1-square.spec.ts` · `e2e/town-t2-naming.spec.ts` · `e2e/wd02-barks.spec.ts`

**NO:** `src/**` · `e2e/board-card-images.spec.ts` (see scope 5) · `e2e/restore-validation.spec.ts` (see WHY — not this class) · any `*-research-tree.spec.ts` (they are the reference implementation, already correct) · `playwright.config.ts` (**F-1101-1's worker calibration is live on lane-d right now — do not touch the config**) · `tasks/**` · `STATUS.md` · `reviews/**`

Reporting an adjacent problem is good and welcome. Fixing one outside TOUCH-ONLY is a violation.

## PRE-FLIGHT — verify by CONTENT, and run the premise checks AFTER the reset

1. `git log --oneline main..lane/m3` → **must be EMPTY.** s1106 measured `lane/m3` at `f1fce725`, **0 ahead of main**. **Any** commit means undrained work: **STOP and report** (LANE-SAFETY LAW — a pre-flight `reset --hard` over unmerged output is how w1-03 and polish-02 were destroyed).
2. Start from fresh main: `git checkout -B lane/m3 main`.
3. **NOW, and only now, the premise checks** — a stale lane answers for its own tree, not for main (F-1090-2):
   - `grep -c "waitForTimeout" e2e/en-02-e1-coverage.spec.ts` → **must be ≥ 1.** If 0, someone already fixed it: **STOP and report.**
   - `grep -n "approach\|position\|buildings" src/town/TownScene.ts | head` → confirm `buildings[].approach` and `actors[].position` still ship. **If either is gone, STOP and report** — the whole cure rests on them.

## SELF-CHECK (report COLLECTED COUNT beside pass count — F-1104-5)

Every path below was `ls`-verified by s1106 at authoring time. A positional arg that matches **no** file contributes **zero tests without failing**, so a battery that only says "passed" is unauditable — **report `<passed>/<collected>` for each command.**

```
npx tsc --noEmit
npm run build
npx playwright test e2e/en-01-claim-ledger.spec.ts e2e/en-02-e1-coverage.spec.ts e2e/072-era-activation.spec.ts e2e/gz-h1-newsie.spec.ts e2e/town-t1-square.spec.ts e2e/town-t2-naming.spec.ts e2e/wd02-barks.spec.ts --project=desktop-chrome --workers=1 --reporter=line
npx playwright test e2e/en-01-claim-ledger.spec.ts e2e/en-02-e1-coverage.spec.ts e2e/072-era-activation.spec.ts e2e/gz-h1-newsie.spec.ts e2e/town-t1-square.spec.ts e2e/town-t2-naming.spec.ts e2e/wd02-barks.spec.ts --project=mobile-chrome --workers=1 --reporter=line
```

- **THE PROOF THIS TASK EXISTS FOR IS A REPEAT RUN, NOT A SINGLE GREEN.** A wall-clock race passes most of the time; one green battery proves nothing. **Run the desktop command 3× and report all three results.** F-1104-3's own evidence was 1-pass/1-fail on both trees — your fix must turn that into 3/3.
- **Record the BEFORE baseline first:** run the desktop command once on the unmodified tree and report the failures, so the fix has a measured starting point rather than an assumed one.
- **Expected collected count is non-zero for all seven files on BOTH projects.** If any file collects 0, say so loudly — that is the F-1094-1 silent-zero class, and it means the run proved nothing.
- ⚠️ **Do not run a wide battery while lane-d's worker calibration is live** — it is measuring this box under controlled load, and a concurrent suite corrupts its numbers *and* trips its own foreign-process gate. If the calibration is still running when you reach this section, **say so and wait**; the runner will still be here.
- Zero console/page errors in the town boot probe, desktop **and** 390px mobile.
- Screenshots the specs already emit are sufficient; no new artifact paths required.

**READY-FOR-GATES.** Report: the before/after pass **and collected** counts per project; **all three repeat-run results**; which target each of the nine sites resolved to and whether it came from `approach` or fell back to `position`; the exact iteration cap you used; whether any caller in sites 7–8 passed a prompt id absent from `buildings`; the count of spec files still carrying the hardcoded `SCHOOLHOUSE` literal (expected 13, **report, do not fix**); and anything you found that looks wrong but which you correctly did **not** touch.
