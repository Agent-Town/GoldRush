# Task lane-approach-steer-to-arrival (rf-37): NINE TOWN-APPROACH HELPERS WALK BY WALL CLOCK, THEN POLL FOR AN ARRIVAL THE INPUT CAN NO LONGER PRODUCE
**FIRE-AUTHORED (attended review welcome) — s1106, 2026-07-27. This is F-1104-3's owed "deterministic-stepping fix", re-measured from 2 sites to 9.**
**RE-AUTHORED s1111, 2026-07-27 — ATTEMPT 3 UNDER fire.md §7.5, WITH A CHANGED PREMISE. Attempts 1 and 2 both STOPPED LAWFULLY at the same firewall. The nine-site content below is unchanged and still correct; what changed is WHICH RUNTIME TABLE you resolve a target id against. Read the next section before anything else.**

**READ THIS FIRST — THE DEFECT IS NOT "A TIMEOUT IS TOO SHORT". Raising the holds or the poll timeout is a FIREWALL VIOLATION here.** The bug is structural: the helper releases the key, *then* waits for the hero to arrive. Once the key is up nothing moves, so the poll can only ever observe a hero who already got there — and under load, fewer frames render inside a fixed `waitForTimeout`, so less distance is travelled and the poll times out against a hero standing still. A bigger number changes the odds and not the shape. See CURE.

You are Codex (worktrees/lane-a).

CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY THIS IS ATTEMPT 3 — F-1111-1, AND WHAT EXACTLY CHANGED (read before the scope)

**Both prior runs were RIGHT to stop. Neither was a failure; both were the firewall working.**

- **Attempt 1** (`20260727-065051`) stopped because `stamp-mill` had no runtime-published approach point at all. s1109 paid that lift and merged it at **`425d2a9a`**, verified by captured payload.
- **Attempt 2** (`20260727-073534`) was re-queued **byte-unchanged** on the strength of that merge — and stopped again, in its own words: *"`stamp-mill` is absent from `diagnostics.buildings`; it only exists in `diagnostics.plaza.slots`. The task explicitly requires `buildings` and says to stop if that hook is absent."* It discarded its partial seven-file patch and left `lane/m3` clean.

**The payload was real; the ADDRESS was wrong.** s1109's lift published the slot on the **`plaza`** object, while this master told you to read **`buildings`**.

⚠️ **s1110 diagnosed that correctly but then aimed the fix at the wrong line, and s1111 re-measured it before acting.** s1110's parting instruction was *"scope item 2 (`:69`) should read 'resolve against `buildings`, then `plaza.slots`'"*. **Scope item 2 was never the blocker.** Item 2 governs **sites 7 and 8 only** (`town-t1-square`, `town-t2-naming`), and every prompt id their callers actually pass — `tavern`, `claim_office`, `schoolhouse`, `assay_office` (`town-t1-square:83,85,86,87,93`, `town-t2-naming:106,107`) — **is present in `buildings` today.** Item 2 is executable exactly as written. Patching only item 2 would have left **site 4** still ordering `stamp-mill` out of `buildings`, and attempt 3 would have stopped at the identical line. The real blocker is **scope item 1 + the CURE's target rule**, and that is what this re-author changes.

**THE VERIFIED SOURCE FACTS (s1111 read all four files; do not re-derive, but do re-confirm in pre-flight):**

| fact | where | consequence |
|---|---|---|
| `TownBuildingId = 'tavern' \| 'claim_office' \| 'schoolhouse' \| 'assay_office' \| 'general_store' \| 'chapel'` | `src/town/townLayout.ts:1` | **`stamp-mill` is not a legal building id at the TYPE level.** It is absent from `townBuildings` by design, not by oversight. No amount of waiting will add it. |
| `townBuildings` = those same 6 ids | `townLayout.ts:185-245` | `buildings` in the diagnostics can never contain `stamp-mill`. |
| `townPlazaLayout.slots` = **7** entries — the 6 buildings **plus** `{ id: 'stamp-mill', position: {x:4.8,z:9}, approach: {x:3.45,z:6.5} }` | `townLayout.ts:94-100` | `plaza.slots` is a **superset** of `buildings` for steering purposes. |
| `slots: townPlazaLayout.slots.map((slot) => ({ id, position, approach }))` | `TownScene.ts:2086` (type at `:188`) | `plaza.slots` publishes **`id` + `position` + `approach`** — every field the cure needs. |
| `approach: townPlazaSlot(building.id).approach` | `TownScene.ts:2077` | **`buildings[].approach` is literally derived from the plaza slot table.** `plaza.slots` is not a fallback — it is the *origin* of the very field you want, and `buildings` is the lossy copy that drops one row. |
| `const approach = townPlazaSlot(STAMP_MILL_ID).approach` | `TownScene.ts:1234` | `src/` itself already resolves stamp-mill's stand-point this exact way. You are copying an in-repo pattern, not inventing one. |

➡️ **THE CHANGED PREMISE, IN ONE SENTENCE: resolve building-shaped targets against `plaza.slots` (all 7 ids, and the source of `approach`), not against `buildings` (6 ids, a derived copy).** Nothing else about this task changes.

## WHY (the original evidence chain, dated — unchanged)

**F-1104-3 — `reviews/078-focus.md:69-75`, s1104, measured on both trees:**

> First sample looked like a regression: failed on merged, passed on clean-main control. **Repeating it disproved that** — merged **1 pass / 1 fail**, control **1 pass / 1 fail**, identical. The failure is never in a ledger assertion; it is in the `approachSchoolhouse` helper, where `hold(page,'KeyA',1150)` and `hold(page,'KeyS',900)` are **wall-clock** holds whose distance travelled depends on how many frames the box renders in that window. Load-sensitive by construction — F-1101-1's class. Not a blocker; worth a deterministic-stepping fix on the ladder.

**THE LIST WAS RE-MEASURED s1106 AND IT GREW FROM 2 TO 9** (the standing law — s1092's "five specs" was four, s1095's "four callers" was six). s1105's handoff carried this as *"the flake fix for `en-02-e1-coverage:244` + `restore-validation:186`"*. Both halves of that sentence were wrong in a way that matters:

- `en-02-e1-coverage.spec.ts:244` is the **test declaration line**, not the defect. The defect is at `:183` and `:189`, in the two helpers that test calls.
- **`restore-validation.spec.ts:186` IS NOT A MEMBER OF THIS CLASS AND IS OUT OF SCOPE.** It contains no `hold`, no key input and no movement at all — it is a page-load restore test built on `waitForFunction`. F-1104-6 (`reviews/hero-y-restore-roundtrip.md:61-71`) proved it flakes on both trees but never identified a mechanism, and its closing line *"both are wall-clock races"* **lumps two different defects on an untested assumption.** Do not touch it. Its diagnosis is separately owed.

**THE NINE SITES — `grep -n "async function approach\|async function openBoard" e2e/` plus a read of each body. Every one has the identical shape: one or more fixed-duration holds, then `expect.poll` for an arrival:**

| # | site | walks | then polls for | resolve target from |
|---|------|-------|----------------|---------------------|
| 1 | `e2e/en-01-claim-ledger.spec.ts:76` `approachSchoolhouse` | `KeyA 1150`, `KeyS 900` | `activePrompt === 'schoolhouse'` | `plaza.slots` |
| 2 | `e2e/en-02-e1-coverage.spec.ts:183` `approachSchoolhouse` | `KeyA 1150`, `KeyS 900` | `activePrompt === 'schoolhouse'` ← **F-1104-3's named site** | `plaza.slots` |
| 3 | `e2e/en-02-e1-coverage.spec.ts:189` `approachTavern` | `KeyA 850`, `KeyW 850` | `activePrompt === 'tavern'` | `plaza.slots` |
| 4 | `e2e/072-era-activation.spec.ts:145` `approachStampMill` | `KeyD 650`, `KeyS 1150` | `activePrompt === 'stamp-mill'` ← **the site that STOPPED both prior runs** | `plaza.slots` (**only** source) |
| 5 | `e2e/072-era-activation.spec.ts:152` `openBoard` | `KeyA 850`, `KeyW 850` | `activePrompt === 'tavern'` | `plaza.slots` |
| 6 | `e2e/gz-h1-newsie.spec.ts:79` `approachNewsie` | `KeyA 480`, `KeyW 520` | `activeBark.actorId === 'newsie'` | `actors` |
| 7 | `e2e/town-t1-square.spec.ts:53` `approach` | caller-supplied `[key, ms][]` | caller-supplied prompt | `plaza.slots` |
| 8 | `e2e/town-t2-naming.spec.ts:48` `approach` | caller-supplied `[key, ms][]` | caller-supplied prompt | `plaza.slots` |
| 9 | `e2e/wd02-barks.spec.ts:68` `approachNewsie` | inline `down`/`waitForTimeout 480`/`up`, then `520` — **same shape, no helper** | `activeBark.actorId === 'newsie'` | `actors` |

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

The loop re-aims every iteration and exits **on the condition**, not on a clock. A slow box simply takes more iterations. (That reference uses a frozen literal for its target — **copy the loop shape, not the literal**; see the ⚠️ below.)

**TAKE THE TARGET FROM THE RUNTIME, NOT FROM A NEW LITERAL. `TownScene.ts:2070-2101` publishes all three tables; use them as follows:**
- ✅ **`plaza.slots`** (`:2086`, type `:188`) — **THE target table for all seven building-shaped ids**, including `stamp-mill`. Each entry is `{ id, position, approach }`. Steer to **`approach`** (the intended stand-point); fall back to `position` only if `approach` is null, and say so in your report.
- ✅ **`actors`** (`:2088-2101`) expose `id` and a live `position` — use these for sites 6 and 9 (`newsie`).
- ⚠️ **`buildings`** (`:2070-2079`) also expose `id`/`position`/`approach`, but only for the **6** ids in `TownBuildingId`. **Do not resolve steering targets from it** — it omits `stamp-mill`, and its `approach` is a derived copy of the plaza slot's (`:2077`). It remains fine to read for anything else you may need (`visible`, `name`, `facadeKey`).

⚠️ **Do NOT copy the `const SCHOOLHOUSE = { x: -8.2, z: 5.4 }` literal.** It is duplicated in **13** spec files and is a frozen copy of a value `src/` publishes at runtime — the same "frozen spec + moved source" class as F-1101-2. Adding a 14th is a scope violation. **Report the 13, do not fix them** (that is a separate owed corrective, and it needs its own battery).

**`teleport` is FORBIDDEN in this task.** `__GR_TOWN_DIAGNOSTICS__.teleport` (type at `:148`) exists and `e2e/trail-guide.spec.ts:53-58` uses it, so it will look like the shorter road. It is stronger medicine than this defect needs and it **stops exercising the walk** — sites 7 and 8 in particular are *about* prompts appearing as the hero moves between shells. If you believe a specific site should teleport, **propose it in the report and leave the code steering.**

## SCOPE (numbered; each item is testable)

1. **Sites 1–6 and 9** — replace the fixed-duration holds with a steer-to-arrival loop per the CURE. Keep each helper's existing signature and its final `expect.poll` assertion **exactly as they are** — the assertion is the contract and it is correct; only the walking changes. Resolve each target by id: `schoolhouse`, `tavern`, **`stamp-mill`** from **`plaza.slots`**; `newsie` from `actors`.
   **Site 4 is the one that stopped both prior runs — it is now unblocked and there is no remaining reason to STOP on it.** `plaza.slots` contains `stamp-mill` with a real `approach` pair (`{x:3.45,z:6.5}`, `townLayout.ts:100`). If `plaza.slots` is somehow absent at runtime, that IS a genuine STOP — but pre-flight will have caught it first.
2. **Sites 7 and 8** (`town-t1-square:53`, `town-t2-naming:48`) — these take a caller-supplied `[key, ms][]` route, so there is no single target coordinate inside the helper. Change them to steer toward **the prompt they are already given as an argument**: resolve that prompt id against **`plaza.slots`** and steer to its `approach`, ignoring the `ms` values. Keep the parameter list source-compatible so callers need no edit. **All four ids these callers pass today (`tavern`, `claim_office`, `schoolhouse`, `assay_office`) resolve in `plaza.slots` — s1111 verified this, so you should NOT expect to stop here.** If a caller nonetheless passes a prompt id absent from **both** `plaza.slots` **and** `buildings`, **STOP and report that caller** rather than inventing a fallback.
3. **Every loop is bounded and fails loudly.** Cap iterations (48 is the proven figure) and, on exhaustion, let the existing `expect.poll` produce the failure — do **not** swallow a non-arrival into a silent pass. A helper that returns successfully without the prompt being active is a worse bug than the one you are fixing.
4. **Do not modify `src/`.** Every hook you need already ships and s1111 verified each one by reading the file (see the table above). **The "a needed field is absent → STOP" clause has now been invoked twice and is satisfied: `plaza.slots` ships `id`+`position`+`approach` for all seven ids.** If some *other* field is genuinely absent, STOP and report — extending the diagnostics surface is its own slice.
5. **Do not touch `e2e/board-card-images.spec.ts`.** It carries the same `hold(page,'KeyA',850)` shape and is a real member of this class — **site 10, deliberately deferred.** (Its original reason, "lane-c is editing it concurrently", has **expired**: `lane-contract-art-key-adoption` merged at `a659020a`. It stays out of scope anyway, to keep this third attempt's surface byte-identical to the nine sites that were measured. Name it in your report as **owed as its own corrective, now unblocked**.)

## FIREWALL

**TOUCH-ONLY:** `e2e/en-01-claim-ledger.spec.ts` · `e2e/en-02-e1-coverage.spec.ts` · `e2e/072-era-activation.spec.ts` · `e2e/gz-h1-newsie.spec.ts` · `e2e/town-t1-square.spec.ts` · `e2e/town-t2-naming.spec.ts` · `e2e/wd02-barks.spec.ts`

**NO:** `src/**` · `e2e/board-card-images.spec.ts` (see scope 5) · `e2e/restore-validation.spec.ts` (see WHY — not this class) · any `*-research-tree.spec.ts` (they are the reference implementation, already correct) · `playwright.config.ts` (**F-1101-1's calibration has LANDED at `642c5d5d` and its report closed VOID — the config is settled and re-tuning it is a different slice, so still do not touch it**) · `tasks/**` · `STATUS.md` · `reviews/**`

Reporting an adjacent problem is good and welcome. Fixing one outside TOUCH-ONLY is a violation.

## PRE-FLIGHT — verify by CONTENT, and run the premise checks AFTER the reset

1. `git log --oneline main..lane/m3` → **must be EMPTY.** s1111 measured `lane/m3` at **0 ahead of main** and `worktrees/lane-a` clean at lock time. **Any** commit means undrained work: **STOP and report** (LANE-SAFETY LAW — a pre-flight `reset --hard` over unmerged output is how w1-03 and polish-02 were destroyed).
2. Start from fresh main: `git checkout -B lane/m3 main`.
3. **NOW, and only now, the premise checks** — a stale lane answers for its own tree, not for main (F-1090-2):
   - `grep -c "waitForTimeout" e2e/en-02-e1-coverage.spec.ts` → **must be ≥ 1.** If 0, someone already fixed it: **STOP and report.**
   - `grep -n "slots:" src/town/TownScene.ts` → **must show the `plaza.slots` publication at ~`:2086`.** This is THE premise of attempt 3; if it is gone, **STOP and report.**
   - `grep -n "stamp-mill" src/town/townLayout.ts` → **must show the slot at ~`:100` with an `approach` pair.** If gone, **STOP and report.**
   - `grep -n "actors:" src/town/TownScene.ts` → confirm `actors[].position` still ships (sites 6 and 9 rest on it). If gone, **STOP and report.**

## SELF-CHECK (report COLLECTED COUNT beside pass count — F-1104-5)

Every path below was `ls`-verified by s1106 at authoring time and re-confirmed s1111. A positional arg that matches **no** file contributes **zero tests without failing**, so a battery that only says "passed" is unauditable — **report `<passed>/<collected>` for each command.**

```
npx tsc --noEmit
npm run build
npx playwright test e2e/en-01-claim-ledger.spec.ts e2e/en-02-e1-coverage.spec.ts e2e/072-era-activation.spec.ts e2e/gz-h1-newsie.spec.ts e2e/town-t1-square.spec.ts e2e/town-t2-naming.spec.ts e2e/wd02-barks.spec.ts --project=desktop-chrome --workers=1 --reporter=line
npx playwright test e2e/en-01-claim-ledger.spec.ts e2e/en-02-e1-coverage.spec.ts e2e/072-era-activation.spec.ts e2e/gz-h1-newsie.spec.ts e2e/town-t1-square.spec.ts e2e/town-t2-naming.spec.ts e2e/wd02-barks.spec.ts --project=mobile-chrome --workers=1 --reporter=line
```

- **THE PROOF THIS TASK EXISTS FOR IS A REPEAT RUN, NOT A SINGLE GREEN.** A wall-clock race passes most of the time; one green battery proves nothing. **Run the desktop command 3× and report all three results.** F-1104-3's own evidence was 1-pass/1-fail on both trees — your fix must turn that into 3/3.
- **THE BEFORE-BASELINE IS ALREADY BANKED — you may cite it instead of re-running it.** Attempt 2 measured the unmodified desktop tree at **17/21 passed**, with arrival-related failures at **Newsie**, **`town-t1-square`** and **`town-t2-naming`**, plus one unrelated failure (the 390px naming backdrop assertion). Re-run it only if your tree disagrees; if you do re-run, report both numbers.
- **The 390px naming-backdrop failure is NOT yours to fix.** It is unrelated to arrival and outside this cure; expect it to survive and say so.
- **Expected collected count is non-zero for all seven files on BOTH projects.** If any file collects 0, say so loudly — that is the F-1094-1 silent-zero class, and it means the run proved nothing.
- Zero console/page errors in the town boot probe, desktop **and** 390px mobile.
- Screenshots the specs already emit are sufficient; no new artifact paths required.

**READY-FOR-GATES.** Report: the before/after pass **and collected** counts per project; **all three repeat-run results**; **which table each of the nine sites resolved from (`plaza.slots` / `actors`) and whether it used `approach` or fell back to `position`**; the exact iteration cap you used; whether any caller in sites 7–8 passed a prompt id absent from both tables (**not expected — s1111 verified all four resolve**); the count of spec files still carrying the hardcoded `SCHOOLHOUSE` literal (expected 13, **report, do not fix**); and anything you found that looks wrong but which you correctly did **not** touch.
