# Task lane-a-town-info-note-dead-reckoning: the town walk is timed dead reckoning against a plaza that grew colliders — observe where it actually arrives, then steer by the coordinates the game itself publishes (lane-a, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1174, 2026-07-28. This is the sibling F-1169-1 named and firewalled OUT of its own slice ("`:286`/`:301` … is the **next** fire's target"), and it stayed barred for four consecutive fires because lane-a held the file live (Mistake #12). lane-a is idle now, the file is on main, and **s1174 re-measured the red itself on a quiet box before writing a line of this** — see WHY. No new scope invented.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `e2e/world-info-notes.spec.ts:289-319` — **the whole target test, read it before anything else.** Note that the four legs are wall-clock key holds (`hold(page,'KeyD',2_000)`), i.e. dead reckoning.
- `e2e/world-info-notes.spec.ts:132-136` (`hold`) and `:86-89` (`teleport` — note it calls `__GR_TEST__`, the RUN-world seam, **not** the town's)
- `src/town/TownScene.ts:2035-2087` — the town diagnostics payload. **`teleport(x,z)`, `player{x,z}`, `activePrompt`, `buildings[].approach` and `plaza.slots[]` all already exist here.** This is the seam; you are not adding one.
- `src/town/TownScene.ts:548-560` (`sampleTown`) — **walkability now excludes shells AND props**, and the prop term reads `this.canvas.dataset.town3dPlazaPropsState === 'loaded'`, i.e. it changes when an async load completes.
- `src/town/TownScene.ts:1258-1300` (`syncPrompt`'s render branches) — how `town-approach-prompt` gets its text, and the `promptKey` memo at `:1268`.
- `src/town/TownLayout.ts:94-100` — the seven slots with their `position` and `approach` literals. **Read them to understand the shape; do NOT copy them into the test.**
- `e2e/ceremony-framework.spec.ts:119` — the in-repo town-teleport idiom … and the thing to improve on: it hardcodes `(-6.6, 2.4)`, which is the schoolhouse `approach` literal from `TownLayout.ts:97`. Steer by the published value instead.
- `e2e/town-t1-square.spec.ts` — the SIBLING that already made this move. Its drain (`425d2a9a`, s1109) says in its own commit message: *"TownDiagnostics.plaza publishes slots[] (id/position/approach) additively; town-t1-square asserts shape not literals."*

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**The dupe is PRE-PROVEN for you — do not spend budget re-deriving it.** s1174 verified at 2026-07-28T16:39Z: `lane/m3` is 1 ahead at `715669bf` (`runner(lane-a): lane-a-build-mode-prompt-spec-realign.md`), whose deliverable shipped to main as `e42ed4ef`. **`git diff main lane/m3 -- e2e/` is EMPTY** — all four spec edits are on main — and the only two-dot delta anywhere is `scripts/check-power-graph-budget.mjs` + `scripts/run-guards.mjs`, where **main is AHEAD** (the `d1b6545e` power-budget merge landed after the lane branched). `git -C worktrees/lane-a status --porcelain` was empty. Textbook SAFE DUPE → reset and proceed. Re-run those two `git diff`s to confirm nothing changed since, then move on.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated, measured by the authoring fire — not inherited)

**The measurement, taken by s1174 at 2026-07-28T16:31Z on a quiet box** (`uptime` 1-min loadavg **2.31**), `npx playwright test e2e/world-info-notes.spec.ts --workers=1`: **6 failed / 8 passed**, which byte-matches the fingerprint this file has carried on clean main since s1123. *(The worker count is stated on purpose — F-1173-5: a red inherits its harness config, and the same file reads 17 vs 13 reds depending on it. Use `--workers=1` and say so in your report.)*

Of those six, **this task owns exactly two rows** — `:289 'town shells use info notes beside opens-soon prompts'`, red on **BOTH** projects with an **identical** fingerprint:

```
Error: expect(locator).toContainText(expected) failed
Locator: getByTestId('town-approach-prompt')
Expected substring: "Claim Office"
Received string:    ""
  14 × locator resolved to <div hidden="" ... data-testid="town-approach-prompt"></div>
```

Read what that says: the prompt is not *wrong*, it is **absent** — `syncPrompt` found no nearest building at all. So the hero was not where the test believed it was.

🔑 **THE FIRST LEG PASSES AND THE SECOND DOES NOT.** `:296-300` (`KeyA` 850 ms + `KeyW` 850 ms → tavern) asserts the prompt, the `town-open-board` button **and** the `town_tavern` note, and all three pass. The failure is at **`:304`**, after `:302-303` (`KeyD` 2 000 ms + `KeyS` 350 ms) tries to cross the plaza to the Claim Office. **Walking works; this particular crossing does not arrive.** That is the fact the whole task is built on, and it is why scope 1 is an observation and not a rewrite.

**The dated premise — the walk was authored against a plaza that has since grown obstacles:**
- The test's timings arrived **2026-07-08** in `66bb9f46` (`feat: add world info notes`) and have never been retimed.
- **2026-07-19, `d1f549d5`** (`runner(lane-a): lane-landmark-collision.md`) introduced **`townPropAt` into `sampleTown`'s `walkable` term** (`git log -S townPropAt -- src/town/TownScene.ts` returns exactly that one commit). The plaza gained colliders **eleven days after** the straight-line crossing was timed.
- Worse for a fixed-duration hold: one term of that predicate is `this.canvas.dataset.town3dPlazaPropsState === 'loaded'`, so **the walkable set changes when an async load lands** — a hold that cleared the plaza before the props arrived will not after.

⚠️ **What was checked and is NOT the cause, so you do not spend budget there:** `9095bee9` (07-23, *"grow town and add spyglass zoom"*) sounds like the culprit and is not — `Balance.town.scale = 1.5` (`src/game/Balance.ts:916`) has exactly **one** consumer, `new CameraRig(this.camera, Balance.town.scale)` (`TownScene.ts:282`). It scales the CAMERA, not the world; the slot coordinates in `TownLayout.ts` are untouched. Verified at source by s1174.

**The shipped precedent for the cure is this file's own neighbourhood:** s1109 (`425d2a9a`) published `plaza.slots[]` *specifically* so town specs could stop asserting literals, and realigned `town-t1-square` onto it. This task extends the same move from *asserting* coordinates to *navigating* by them.

## Scope

### 1. OBSERVE THE DEFECT FIRST — and this step can STOP the task (declared a FULL SUCCESS)
Do **not** change a single line of the walk yet. Instrument the existing test (temporarily, or in a throwaway copy under `logs/session-scratch/` — your choice, but the numbers must come from the *unmodified* walk) and record, **after each of the four legs**:

| leg | target building id | published `approach` from `plaza.slots` | hero `player{x,z}` on arrival | Δ (distance) | `activePrompt` | `canvas.dataset.town3dPlazaPropsState` |

Sample `player{x,z}` **during** leg 2 as well (say every 200 ms while `KeyD` is held) — a position that stops advancing mid-hold is a collision, and a position that advances the whole way but lands short is a timing shortfall. They are different faults and the table must be able to tell them apart.

Then rule, and **write the verdict sentence explicitly**:

- **(a) NAVIGATION / FIXTURE FAULT** — the hero is not at the target approach (Δ large, or motion stalls against something). ⇒ the timed walk is obsolete. **Proceed to scope 2.**
- **(b) THE PROMPT DID NOT FIRE AT THE GAME'S OWN PUBLISHED APPROACH POINT** — the hero IS at (or within a plausible interaction radius of) `plaza.slots['claim_office'].approach` and `activePrompt` is still `null`. ⇒ **this is a `src/` behaviour question, not a test fixture fault: STOP. Do not edit `e2e/`. Report the table.** A player who walks to the Claim Office door and sees nothing is a real bug, and installing a teleport that hides it would be a false green over a live regression. *(This is the F-1169-1 1(d) shape, and that STOP is exactly why its slice was worth draining.)*
- **(c) SOMETHING ELSE** — report it in the same table form and STOP rather than improvise.

State which of (a)/(b)/(c) you took and the numbers that decided it. **A STOP here with a filled-in table is a complete, successful task.**

### 2. CURE — steer by published coordinates, only if scope 1 ruled (a)
Replace each of the four timed legs with: read the target slot's `approach` from `__GR_TOWN_DIAGNOSTICS__.plaza.slots` **by id** (`tavern`, `claim_office`, `schoolhouse`, `assay_office`), `teleport` there via the town diagnostics' own `teleport(x, z)`, then **poll `activePrompt` until it equals that building id** before asserting anything in the DOM. A small local helper in this spec file is welcome; name it plainly (e.g. `approachTownBuilding`).

**Hard rules for this scope:**
- **No coordinate literals.** If `TownLayout.ts` moves tomorrow the test must follow it for free. That is the entire point.
- **Every existing assertion survives**, all four buildings: the `town-approach-prompt` text, `town-open-board` visible, `town-rename` visible, and all four `expectNote(...)` calls with their exact `objectClass` + text. **Deleting an assertion to reach a green is a task failure, not a cure.** (s1173 has a live example of a deletion that *was* correct — it was correct because the claim was proven unsatisfiable and it was REPLACED, not dropped. You have no such proof here.)
- Poll, never sleep: no new `waitForTimeout` as a synchronisation device.

### 3. MUTATION CONTROL (mandatory — the cure must be able to fail)
Point one leg's teleport at a deliberately wrong slot (the plaza `gate` is a good choice), run it, and **show the test going RED at that leg's own assertion line**. Restore. Paste both outputs. A green that cannot go red has proven nothing.

### 4. REPORT THE NEIGHBOURS, FIX NOTHING
List every other red still in `e2e/world-info-notes.spec.ts` after your change, by line, with its one-line fingerprint. Two are expected and are **not yours** (see NO). Report, do not touch.

## Firewall

**TOUCH-ONLY:**
- `e2e/world-info-notes.spec.ts` — the test at `:289-319`, plus a new local helper in the helper block above `:162` if scope 2 needs one.
- your run report under `tasks/runs/`
- scratch instrumentation under `logs/session-scratch/` (keep it, per the RETENTION LAW — do not delete it at the end)

**NO — do not touch, do not "fix", do not tidy:**
- **All of `src/**`.** If the cure seems to need a `src/` edit, you are in scope 1(b) and the answer is STOP + report.
- **`e2e/world-info-notes.spec.ts:321-341` — THE OPEN OWNER FORK.** F-1141-3 + F-1164-1 (`BACKLOG:1543`, one constant at `src/styles.css:1620`, `+240px`). s1174 re-measured it red on both projects this fire (`:338`, expected `<= 586`, received `636` — a 50 px overlap). **It is on Robin's desk awaiting one decision that closes two reds. A runner that "helpfully" fixes it pre-empts the owner.**
- **`e2e/world-info-notes.spec.ts:195` `'building notes sit with existing assay and upgrade prompts'`** — red on both projects with a **different** fingerprint (`world-info-note` resolves *with* the correct `data-object-class="assay_office"` but stays `hidden`). Separately owned. Report it in scope 4; do not fix it.
- every other spec file, `playwright.config.ts`, `package.json`, and any `--workers` default.
- `src/town/TownLayout.ts` and `src/town/TownScene.ts` — read-only here, including the diagnostics payload. **You are consuming a seam that already exists; adding one is out of scope.**

## Self-check before you report

1. `npx tsc --noEmit` — clean.
2. `npm run build` — green, note the time.
3. `npx playwright test e2e/world-info-notes.spec.ts --workers=1` — **both projects**, and state the worker count in your report. Give before/after counts AND the failure LINES, not just totals: the baseline is **6 failed / 8 passed**, and success is `:289` leaving that list on **both** projects while `:195` and `:321` remain (they are firewalled). *A count that moves is weaker evidence than a line that moves.*
4. Adjacent suites, unmodified, `--workers=1`, both projects: `e2e/town-t1-square.spec.ts` and `e2e/town-t3-board.spec.ts`. Report their counts; any red must be fingerprint-matched to a pre-existing one with proof (run it on the unmodified tree if you must).
5. Zero console errors / page errors in the target test (the spec already asserts this via `assertNoErrors` — do not weaken it).
6. Screenshot the Claim Office prompt + note after the cure into `artifacts/world-info-notes/` (both projects), and say where it is.

READY-FOR-GATES + report: the scope 1 table and your (a)/(b)/(c) verdict sentence first; then the before/after failure LINES per project with the worker count; the mutation-control red and its restore; the neighbour reds you left alone; and one sentence on whether anything you saw suggests the town's approach prompts are drifting for a real player, not just for this test.
