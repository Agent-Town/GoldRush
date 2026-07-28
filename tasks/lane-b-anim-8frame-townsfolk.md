# Task lane-b-anim-8frame-townsfolk: give the three 4-column town walkers a real 4-frame gait — and prove the defect existed before you cure it (lane-b, commit prefix "fix:")

**FIRE-AUTHORED s1162 (attended review welcome).** This is the BACKLOG ladder item **ANIM-8FRAME**, which is `reviews/anim-pass-2026-07-25.md` §4 item 1 — its author called it *"the highest value-per-byte item left in the whole pass"* and it was blocked only on `src/` sitting outside that claim's territory. **s1162 re-verified every premise at source before authoring** (the review is 3 days old) and found **two things the review's "three lines" does not state**: a cadence consequence (scope 3) and a forward-hazard (scope 6). Both are in scope. Do not skip them.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): `lane/m4` is **1 commit ahead** of main (`efe3b209`) and that commit is **genuinely FALSE-AHEAD — its content is already on main.** s1162 verified this by content, not by the ahead-count: the commit's only substantive change is the `char.claim_jumper`→`char.bandit_base` rename across 7 e2e files, and on main `git grep claim_jumper` in those files returns **zero** while `bandit_base` returns **5/3/2 hits**. **Nothing unique dies on a reset.** Re-verify that yourself with the **unique-blob invariant** rather than a file list: no dirty/modified blob in this worktree may exist *nowhere else* in git (`git hash-object <file>` then `git cat-file -e <hash>`; `.wrangler/tmp/**` and `artifacts/**` are build scratch and are exempt). If every blob is reachable → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and name that file** — that is the Mistake #2 shape. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

⚠️ **Your two-dot diff against main will look enormous and that is EXPECTED, not a conflict** — this lane predates main's 428-file `.wrangler`/`artifacts` absorption. **Judge this lane by the three-dot diff only.**

⛔ **THE BOX IS LOADED AND YOU MUST NOT RUN THE FULL SUITE.** At authoring time `lane-d` was 90 minutes into a **2396-test** red-inventory run (started 09:24) and the ART slot was mid image-generation; **loadavg was 9.77 / 16 cores**. That inventory's entire value is an accurate red list, and a second playwright load injects contention false-reds into it (**Mistake #12**). **Run ONLY the named spec, with `--workers=1`, and report `uptime` immediately before and after.** If any run of the named spec TIMES OUT, treat it as **suspect environment**, not a red: re-run it once and say so.

⛔ **`assets/**` IS OWNED BY A LIVE ATTENDED PROGRAM — DO NOT TOUCH IT.** THE EIGHT WINDS (owner directive 2026-07-28, `gr-task-anim-pass/TASK-8DIR.md`) is generating diagonal sibling sheets right now. Its territory is `assets/raw/char-*.png`, `assets/processed` cells, the review and the LEDGER; **its territory note says explicitly `NO src/`.** Yours is the exact mirror: **`src/` and `e2e/` only, never `assets/`.** The two do not collide — keep it that way.

## READ FIRST (paths, in this order)

1. `reviews/anim-pass-2026-07-25.md` **§4 item 1** (line 254) — the writeup you are landing, and **§0/§1 F-A1** (lines 38–61) for why. Its author measured everything; **do not re-derive the frame counts.**
2. `src/town/townsfolk.ts:31` — the type: `fullBody?: { sheet: string; animated: boolean; frameMap?: readonly number[]; fps?: number }`. **`frameMap` already exists; you are not adding a feature.**
3. `src/town/townsfolk.ts:203` — **the shipped precedent.** `newsie` already carries `frameMap: [0, 1, 6, 7], fps: 8`. Copy its shape.
4. `src/town/townsfolk.ts:121`, `:135`, `:149` — **the three subjects** (`preacher`, `schoolteacher`, `assay_clerk`), each `fullBody: { sheet, animated: true }` with **no** `frameMap`.
5. `src/town/TownScene.ts:2429-2434` — the tick: `frameDuration = 1 / (fps ?? 8)` and `frame = (frame + 1) % (frameMap?.length ?? 8)`.
6. `src/town/TownScene.ts:2453-2463` — `applyFullBodyFrame`: `sourceFrame = frameMap?.[frame] ?? frame`, and note that **`currentFrameKey` is assigned BEFORE the async texture load** — that is why the diagnostics can see a key for a cell that does not exist.
7. `e2e/cast-motion-wiring.spec.ts:68-71` — the existing assertion. **It names your three actors and then accepts `c\d+`, so it passes while the defect is live.** That is what you are tightening.
8. `CLAUDE.md` §5 Mistake #10 (debug-gate leftover: where does the PLAYER see this?) and Mistake #12, §6 (drain gate), §7 (escalation).

## WHY (quoting the evidence, dated)

`reviews/anim-pass-2026-07-25.md:55` (attended Opus-5 anim pass, 2026-07-25), verbatim:

> **Still owed, and stated plainly:** the sheets carry 4 real frames per direction, and `TownScene` asks for 8 (`frameMap?.length ?? 8`). Columns 4–7 no longer exist, and `loadProcessedCharacterTexture` resolves `null` for a missing cell (`src/assets/generated.ts:180`), so the sprite **holds its previous frame** for half the cycle: a whole man with a stuttering gait instead of a bisected one.

and `:254`:

> **`frameMap: [0, 1, 2, 3]`** for `assay_clerk`, `preacher` and `schoolteacher` in `src/town/townsfolk.ts` — three lines, no art, and it turns the current hold-every-other-frame gait into an exact 4-frame walk. **This is the highest value-per-byte item left in the whole pass** and it is blocked only on `src` being outside this claim.

**s1162 re-measured the premise at source (2026-07-28) and it HOLDS:**
- `assets/processed/char-preacher-sheet-walk8-a.frames.json` declares `"grid": { "cols": 4, "rows": 4 }`; preacher / schoolteacher / assay-clerk each ship **16 cells**. `char-newsie-mei-sheet-walk8` ships **32** — which is exactly why newsie already has a `frameMap` and these three do not.
- All three still lack `frameMap`, so they take the `?? 8` default and the cycle runs `frame = 0..7` while only columns 0–3 exist.

➡️ **The player-visible symptom, stated precisely so you can recognise it on screen:** at the default 8 fps the walk plays poses c0→c1→c2→c3 over 500 ms and then the sprite **freezes on pose 3 for a further 500 ms** before snapping back. It is not a subtle stutter; it is a half-second hitch in every second of walking, on three plaza actors, in a plain boot.

## THE QUESTION THIS TASK ANSWERS (one sentence)

**Do the three 4-column town walkers stop addressing cells that do not exist — and does the resulting gait keep the same stride cadence as the 8-column walkers beside them?**

## SCOPE (numbered; each item testable)

1. **PROVE THE DEFECT FIRST, WITH `src/` STILL UNCHANGED.** Boot the town and sample `window.__GR_TOWN_DIAGNOSTICS__.actors` for the three subjects repeatedly (~100 ms apart, over ≥ 6 s of walking). **Paste the observed `frameKey` set per actor.** You are expected to see keys ending `c4`–`c7`. ⛔ **If you do NOT observe any `c4`–`c7` key for any of the three, STOP and report that** — it would mean the premise is wrong (they never walk, or something already cures it) and this task must not ship a fix for a defect it could not observe.
2. **Ship the cure: add `frameMap: [0, 1, 2, 3]`** to the `fullBody` of `preacher` (`:121`), `schoolteacher` (`:135`) and `assay_clerk` (`:149`) in `src/town/townsfolk.ts`. Match `newsie:203`'s formatting exactly.
3. **RESOLVE THE CADENCE, WHICH THE REVIEW DOES NOT MENTION — this is a real behavioural change, not a detail.** The cycle length halves (8 ticks → 4) while `fps` stays at its `?? 8` default, so **the stride rate of these three DOUBLES relative to the 8-column walkers beside them** (an 8-frame walker at 8 fps completes one cycle per second; a 4-frame walker at 8 fps completes two). Feet that cycle twice as fast at unchanged movement speed read as sewing-machine legs.
   - **Default and recommended: also set `fps: 4`** on the same three, which restores a 1.0 s cycle and matches their neighbours.
   - **But VERIFY rather than assume:** measure the effective cycle time of a neighbouring 8-column walker (`tavernkeeper` or `elder`) from the diagnostics, and report both numbers. **Screenshot the plaza with the three walking and eyeball it against a neighbour.**
   - **You are licensed to contradict the recommendation** — if 4 fps reads as too choppy and 8 fps reads better on camera, ship 8 and **say so with the screenshot and the measured cycle times**. Either answer is acceptable; **an unmeasured answer is not.**
   - ⚠️ Note honestly in your report that 4 real frames is the *art's* limit, not the wiring's — the missing frames are `reviews/anim-pass-2026-07-25.md` §4 item 2, still owed, and not yours.
4. **TIGHTEN `e2e/cast-motion-wiring.spec.ts` SO THE DEFECT IS FALSIFIABLE — and prove the tightened assertion is RED before your `src/` change.** Today `:70` accepts `c\d+`, so it passes either way and proves nothing (Mistake #10). Replace it, for those three actors only, with an assertion over a **sampled window** that requires BOTH:
   - **(a)** no observed `frameKey` ever ends `c4`–`c7`, **and**
   - **(b)** all four of `c0`, `c1`, `c2`, `c3` are observed for each actor.
   ⚠️ **(b) is not optional and is the whole reason this gate is honest:** (a) alone is satisfied by a sprite frozen on `c0`, so (a) alone would be a **tautological** pass (a test that cannot fail teaches nothing). Together they assert a real 4-frame cycle.
   - **MANDATORY ORDER, and report it: run the tightened spec with `src/` UNCHANGED and show it FAILS on (a); only then apply scope 2/3 and show it PASSES.** A tightened test that was never observed red is an unread verdict. ⛔ **Mutate the SUBJECT, never the guard:** if the spec goes green, it must be because `townsfolk.ts` changed — never because the assertion was relaxed.
5. **Do not touch the other town actors.** `tavernkeeper` and `elder` are asserted at `:64-67` and are 8-column; leave their bindings and those assertions exactly as they are. If you believe another actor has the same defect, **report it as a finding — do not fix it** (the review's table is the authority on which sheets are 4-column, and only these three were named).
6. **WRITE THE FORWARD-HAZARD INTO THE CODE AS A COMMENT — s1162 found this and it is not in the review.** `sourceFrame = frameMap?.[frame] ?? frame` means a **stale** `[0,1,2,3]` would *silently* use only half the art if these sheets are ever regenerated as true 8-column — which is precisely what `reviews/anim-pass-2026-07-25.md` §4 item 2 and its original **REGENERATE** verdict still call for. Add one short comment above the three entries naming that dependency (sheet is 4-column today; remove/extend this map if the sheet gains columns 4–7). **A comment only — do not build a guard, do not touch `assets/`.**
7. **⛔ DO NOT:**
   - Touch **any** file under `assets/` — that territory belongs to the live EIGHT WINDS program (see the banner above).
   - Regenerate, re-slice or graft any sheet. **No art in this task at all.**
   - Relax, delete or rename any existing assertion in `e2e/cast-motion-wiring.spec.ts` other than the `:70` pattern you are tightening.
   - Widen the change to `TownScene.ts` — the `?? 8` default is correct for 8-column sheets and must stay.
   - Add sleeps, retries or waits to `TownScene`'s tick.
   - Touch `STATUS.md`, `tasks/**`, `logs/**`, `reviews/**`.
8. **You are licensed to contradict this task.** If scope 1 cannot observe the defect, or the cure does not change what the diagnostics report, **say so and show the samples.** A well-evidenced *"this does not reproduce"* is a SUCCESS here.

## FIREWALL

**TOUCH-ONLY:** `src/town/townsfolk.ts` — *the three `fullBody` entries plus the scope-6 comment only* · `e2e/cast-motion-wiring.spec.ts` — *the `:68-71` block only* · `artifacts/anim-8frame-townsfolk/**` (new: your samples + screenshots).

**NO:** ❌ `assets/**` (ANY file — live attended program) · ❌ `src/town/TownScene.ts` · ❌ `src/town/town-actor-sheets.json` · ❌ `src/assets/generated.ts` · ❌ any other `src/` file · ❌ any other `e2e/**` spec · ❌ `reviews/**`, `STATUS.md`, `tasks/**`, `logs/**`.

## SELF-CHECK (run these exact commands; report each result)

1. `uptime` **before** any test run → paste it.
2. `npx tsc --noEmit` → **rc=0**.
3. `npm run build` → **rc=0**. ⚠️ Run it as a **single command with NO pipe** — a pipeline masks the exit code.
4. `npm run test:guards` → report the pass count (expect **8/8**). ⚠️ Read this as a **SAMPLE, not a state**: `test:power-budget` is a known load-sensitive guard (F-1160-2) and this box is loaded. If it is the only failure, re-run it and report both results.
5. **The scope-4 RED run:** the tightened spec, `src/` unchanged, `--workers=1`, desktop project → paste the failure showing a `c4`–`c7` key.
6. **The scope-4 GREEN run:** after scope 2/3, `npx playwright test e2e/cast-motion-wiring.spec.ts --workers=1` in **both** projects (desktop + 390px mobile) → rc=0.
7. `uptime` **after** the runs → paste it, and state whether load changed enough to distrust any timeout.
8. The scope-1 `frameKey` sample sets (before) and the same sets (after) — **per actor, pasted, not summarised.**
9. The scope-3 numbers: measured cycle time for the three vs a named 8-column neighbour, before and after, and which `fps` you shipped **with your reason**.
10. Screenshot of the plaza with the three walking → `artifacts/anim-8frame-townsfolk/plaza-after-<project>.png`.
11. `git status --porcelain -- assets/` → **must be empty.** Paste it.
12. Paste the **full `src/` diff** — it should be ~3 entries plus one comment. **Any hunk outside the three `fullBody` entries is a firewall violation — STOP instead.**
13. Zero console/page errors in the boot path; note any that appear.

**READY-FOR-GATES** — then report: the before/after `frameKey` sets per actor · the RED-then-GREEN evidence for the tightened spec, in that order · the measured cadence comparison and the `fps` you chose with your reason · the full `src/` diff · `git status -- assets/` proving you stayed out of the art program's territory · and an explicit statement of whether the gait defect is **GONE** or **REDUCED**.
