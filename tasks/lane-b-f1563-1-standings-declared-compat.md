# Task f1563-1: the county board tolerates a row that predates `declared` (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome).** s1563, from the f-board-1 gate evidence.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in **worktrees/lane-b**.

READ FIRST:
- `reviews/f-board-1.md` — the gate that produced this task, finding **F-1563-1** (read it before editing anything).
- `src/encyclopedia/reader.ts` — `isStandingStack`, `isCountyStanding`, and `countyRows` (the `filter` at the call site is the whole mechanism; read all three together).
- `src/app/GameApi.ts` — 4 lines. `GAME_API_ORIGIN` is a **hardcoded production origin**; this is why the compatibility direction matters and is not hypothetical.
- `e2e/lb-01-county-standings.spec.ts` around **`:550`** — the fixture that fails today. **You are not allowed to change it** (see Firewall); read it to understand what shape it serves.

## ⛔ PRE-FLIGHT — THIS LANE IS NOT TO BE RESET. READ THIS FIRST; IT INVERTS THE USUAL RULE.

`lane/b` holds **undrained** work: commit **`0a1fa333e050e9c7e1d0d553e57c835c53472268`** (f-board-1), which s1563 gated and **HELD, not merged**. Its content is **absent from main**. This task builds **ON TOP** of it.

The usual `git checkout -B lane/b main` pre-flight would **DESTROY that commit** — the exact shape that cost w1-03 and polish-02 (Mistake #2). **Do not run it. Do not reset. Do not `clean -fd`.**

Run these four checks and **STOP-and-report on any mismatch** — do not "fix" a mismatch, report it:

1. `git -C worktrees/lane-b rev-parse HEAD` → must print **`0a1fa333e050e9c7e1d0d553e57c835c53472268`**.
2. `grep -c "function isStandingStack" src/encyclopedia/reader.ts` → must print **`1`**. (It prints `0` on main; s1563 verified both. A `0` here means the lane was reset out from under this task — **STOP, and say so plainly: the f-board-1 work is recoverable from `archive/lane-b-s1563-fboard1-0a1fa333e`.**)
3. `git -C worktrees/lane-b status --short` → clean, with the **FACTORY-CHURN EXCEPTION** (F-1407-1), always expected and never a STOP: `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png`. List what you discard. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
4. `npm install --no-audit --no-fund`, then `npm run build` green **before touching anything**.

## Why (gate evidence, s1563 — quoted, not paraphrased)

f-board-1 correctly implements the owner ruling of 2026-08-08 ("I think we have to not make it anonymous and explain which harness and which model were used for each entry"). Its API half is sound and is **not in dispute**. But it also hardened the CLIENT validator: `isCountyStanding` gained `isStandingStack(row)`, which opens `typeof value.declared === 'boolean'`, and the call site is a **per-row silent drop**:

```
return board.slice(0, 100).filter(isCountyStanding);   // reader.ts:661
```

So every row lacking `declared` is discarded without a word. **Production serves exactly such rows today**, and `GAME_API_ORIGIN` is hardcoded to production, so dev builds, preview builds, and any client newer than the deployed function all address it. Measured at the gate:

- `e2e/lb-01-county-standings.spec.ts:550` — **2 failed / 32**, desktop AND mobile.
- **CONTROL, same test, clean main, same shell — 1 passed (3.5s).** The red is the slice's.
- Failure is **silent**: no console error, no page error, `expectNoErrors` passes. The board renders *"No standings yet – the door is open."* directly beneath the slice's own new copy, *"Every rider names the mind and rig they declared."* Three rows were served. Screenshot: `reviews/shots-f-board-1-hold/blank-county-board-desktop-chrome.png`.

## Scope

1. **Make an absent `declared` mean `declared: false`, not "reject this row".** In `isStandingStack`, an undefined `declared` is valid and means undeclared. A row that omits it must survive validation and render as **`Undeclared rider`** — which is already this slice's own semantic for a stackless row (f-board-1's master: *"A row with NO stack is a human-or-undeclared entry: include `declared: false`"*).
2. **Keep the strictness that is actually load-bearing.** These must still be REJECTED, and each needs a test: `declared` present but not a boolean; `model`/`harness`/`harnessVersion` present with a non-string value; **and the existing invariant that an UNDECLARED row carries no stack fields** (today: `value.declared || (model === undefined && harness === undefined && harnessVersion === undefined)`) — decide and state in your report how that reads when `declared` is absent rather than `false`, and make the code and the test agree. Do not silently drop this rule.
3. **Same treatment for riders.** `isCountyParty` applies `isStandingStack` per rider; a party row whose riders predate the field must render with rider names and `Undeclared rider`, not vanish.
4. **`renderCountyStack` must not print `undefined`** for a row whose `declared` is absent. Check the rendered text, not just the type.
5. **Tests — and note what is DELIBERATELY not a test change.** Add cases to the standings test surface for scope 2. **`e2e/lb-01-county-standings.spec.ts` MUST PASS UNMODIFIED.** That is the acceptance proof of this whole task: if you find yourself editing that file's fixtures to make it pass, **the cure is wrong — stop and report instead.**

## Firewall

Touch ONLY: `src/encyclopedia/reader.ts`, and the one standings unit-test file you extend for scope 2 (name it in your report).

**NO changes to** — and this list is the point of the task, not boilerplate:
- ❌ **`e2e/lb-01-county-standings.spec.ts` — not one byte.** It is the canary.
- ❌ `functions/api/standings.ts` — the API half is correct; leave it whole.
- ❌ Ranking/sort logic, the POST/validation path, stored row shapes, stack honesty laws.
- ❌ `src/app/GameApi.ts`.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate (Mistake #1).

## Self-check (evidence, not vibes) — SPEC FILES ARE NAMED BY PATH ON PURPOSE (F-1563-2)

The previous runner satisfied a self-check that said *"board e2e green"* by running the **other** board spec, and so never learned it had broken this one. Every file below is named by path; run **each** one, both projects, `--workers=1`:

- `npx tsc --noEmit` rc=0; `npm run build` green.
- `npx playwright test e2e/lb-01-county-standings.spec.ts --workers=1` → **green both projects, file UNMODIFIED**. Report the pass count.
- `npx playwright test e2e/milk-county-board.spec.ts --workers=1` → green both projects (was 14/14 each at the gate).
- `npx playwright test e2e/field-book.spec.ts --workers=1` → green both projects (was 6/6 at the gate; it is a third consumer of `/api/standings`).
- `node scripts/test-stats.mjs` (was 87/87) and `node scripts/test-multiplayer.mjs` (was 462/462) — `functions/` routing is shared, F-1229-1.
- Zero console/page errors; screenshots desktop + 390px to `reviews/shots-f1563-1/` showing a board rendered from rows **without** `declared`.
- `test:node-guards` is NOT required: this diff touches `src/encyclopedia/` only — no `src/sim/`, `src/systems/`, `src/entities/` — so F-1460-1 does not bind. Say so rather than implying coverage.

⚠️ **Known-red, do not chase and do not "fix":** `e2e/m4-06-embodiment.spec.ts:395` fails intermittently on clean main under full-spec load (F-1563-3, s1563: 2 of 2 control runs). It is unrelated to this task. If you see it, name it and move on.

End: **READY-FOR-GATES** + report: the exact `isStandingStack` predicate you settled on, your ruling on scope 2's undeclared-carries-no-stack invariant, the rendered text for an absent `declared`, the pass counts for all five suites by path, and both screenshot paths.
