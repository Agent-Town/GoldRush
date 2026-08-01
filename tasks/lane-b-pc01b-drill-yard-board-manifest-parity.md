CODEX: model=gpt-5.6-sol effort=high
# lane-b — PC-01b: the Drill Yard ships a 6th E1 contract that the board refuses to render

**FIRE-AUTHORED (attended review welcome)** — s1321, 2026-08-01.
**Role:** Codex runner, lane-b. **Workdir:** `worktrees/lane-b` (branch `lane/m4`).

> ⚠️ **THIS TASK BUILDS ON TOP OF UNDRAINED WORK ALREADY ON YOUR LANE.** `lane/m4` is
> intentionally ahead of `main`. Do **not** reset, rebase, or clean the lane, and do not
> treat "branch is ahead of main" as a pre-flight failure — here it is the precondition.

---

## READ FIRST (paths, in this order)

1. `reviews/pc-01-drill-yard.md` — the s1321 drain that REJECTED your predecessor. **This is your brief.**
   Read F-1321-1 in full; it explains why *both* candidate implementations red two specs, which is
   the trap this task exists to get out of.
2. `specs/practice-claim/README.md` line 4 — the one ratified sentence that decides the fork:
   *"A standing card on the tavern board (always available once the welcome has run)"*.
3. `src/town/TownScene.ts:1937-1980` — the render-time filter your predecessor added (`:1941`).
4. `e2e/board-era-chapters.spec.ts:85-92` (`expectChapter`) — asserts `rendered == epoch.contracts.length`.
5. `e2e/en-02-e1-coverage.spec.ts:323-338` — asserts board-open discovers every `CONTRACT_ENTRY_IDS` id.
6. `e2e/town-t3-board.spec.ts:194` and `:335`, `e2e/board-gating-and-profiles.spec.ts:63` —
   the three hard-coded `toHaveCount(5)` assertions on the E1 chapter. **These currently PASS only
   because the filter hides the new card from them.** Whatever you do, they must end up asserting a
   number they actually mean.

---

## PRE-FLIGHT (build-on-predecessor — NOT the standard clean-vs-main check)

Run these three and STOP with a report if any fails. **Do not `git reset --hard`.**

1. `git log -1 --format=%H` on `lane/m4` **contains** commit `f0bf5251`
   (`git merge-base --is-ancestor f0bf5251 HEAD` must pass). If absent → STOP: your predecessor's
   work is missing and this task's premise is void.
2. `src/game/DrillYard.ts` and `e2e/drill-yard.spec.ts` both exist in the worktree. If not → STOP.
3. `git status --porcelain` shows no **tracked** dirt other than files you are about to edit.
   Untracked debris is fine. If tracked dirt exists that is not yours → STOP and report it.

---

## WHY (quoted evidence, dated)

`specs/practice-claim/README.md`, RATIFIED by the owner **2026-08-01**, line 4 verbatim:
*"A standing card on the tavern board (always available once the welcome has run): a small claim
where nothing is at stake."*

s1321's drain, measured on the grafted tree (`reviews/pc-01-drill-yard.md`):

```
main   E1 contracts: 5   → board renders 5 → board-era-chapters GREEN
graft  E1 contracts: 6   → board renders 5 → board-era-chapters RED (Expected 6, Received 5)
                                          → en-02-e1-coverage  RED (ledger never discovers
                                             contract_e1_drill_yard)
```

The slice itself is green — `drill-yard.spec.ts` passes desktop **17.4s** and mobile-390px **17.3s**,
tsc clean, build green, zero console errors. **Only the parity question blocks the merge.**

---

## THE FORK YOU MUST RESOLVE (state your choice and your reason in the report)

The manifest lists 6 E1 contracts; the board renders 5. Pick **one** and make it true everywhere:

- **(a) NO GATE — the card is always on the board.** Simplest, and the reading of line 4 that treats
  *"once the welcome has run"* as describing when a player first reaches the board at all, not as an
  instruction to hide the card. Delete the `TownScene.ts:1941` filter; manifest and board agree
  unconditionally; `board-era-chapters` and `en-02` go green with no spec edits. Cost: the three
  hard-coded `toHaveCount(5)` assertions must become **6**, and each needs its E1 contract list
  re-read so the number is derived or at least correct.
- **(b) GATE AT THE MANIFEST, NOT AT THE RENDERER.** If the card genuinely must be hidden pre-welcome,
  then `chapter.contracts` itself must not contain it pre-welcome, so that *every* consumer — board,
  ledger discovery, counts, chapter nav — sees one consistent list. `board-era-chapters` then stays
  green untouched because both sides of its assertion move together. Cost: `en-02`'s
  `CONTRACT_ENTRY_IDS` expectation must model the gate explicitly, and the fixture must state which
  side of the welcome it is testing.

**Recommendation: (a).** It is fewer moving parts, it removes a divergence rather than relocating it,
and the ratified sentence's emphasis is *"standing"* / *"always available"* — a permanently available
practice claim, not a progression unlock. **But (b) is legitimate if you can show the card must not
appear pre-welcome; if you choose it, say what breaks if a player reaches the board pre-welcome.**

⛔ **What is NOT acceptable:** leaving the manifest and the board disagreeing, or editing an adjacent
spec so that it stops asserting parity. Weakening a guard to pass is the F-1319-2 failure and it is
the one outcome that gets this task rejected a second time.

---

## SCOPE

1. **Resolve the fork.** Implement (a) or (b) so that the E1 contract list is identical everywhere it
   is consumed: board render, contract count text, chapter nav, and `discoverLedgerContract`.
2. **Fix the four reds, honestly.** `board-era-chapters.spec.ts:98/:125/:146` and
   `en-02-e1-coverage.spec.ts:323` must pass because the code is consistent, not because the
   assertion was loosened. Any number you change, change it to one you can justify in the report.
3. **Correct the three `toHaveCount(5)` assertions** (`town-t3-board.spec.ts:194`, `:335`,
   `board-gating-and-profiles.spec.ts:63`) to the count the E1 chapter genuinely has after your
   change. Prefer deriving the count from the manifest over typing a literal.
4. **PLAIN-BOOT PROOF (Mistake #10 — this is release content).** `e2e/drill-yard.spec.ts` runs
   entirely under `?debug&nolevel&nopause`, so nothing currently proves a player can see the Drill
   Yard in a normal boot. Add an assertion — new test or an added beat in an existing plain-boot
   spec — that with **no `?debug`**, a welcomed profile opens the tavern board and the
   `contract-card-e1-drill-yard` card is visible and launchable. Screenshot it, desktop and 390px.
5. **Report the parity as a number, not a claim:** print the manifest's E1 contract count and the
   rendered `[data-contract-id]` count side by side, in both the pre-welcome and post-welcome states,
   and paste that into the report.

---

## FIREWALL

**TOUCH-ONLY:** `src/town/TownScene.ts` · `assets/contracts/epoch-1-frontier/contracts.json` (only if
you choose (b)) · `e2e/board-era-chapters.spec.ts` · `e2e/en-02-e1-coverage.spec.ts` ·
`e2e/town-t3-board.spec.ts` · `e2e/board-gating-and-profiles.spec.ts` · `e2e/drill-yard.spec.ts` ·
one plain-boot spec of your choosing · `artifacts/pc-01b-drill-yard-parity/`.

**NO:** do not touch `src/game/DrillYard.ts`, `src/game/Economy.ts`, `src/entities/pools.ts`,
`src/meta/ContractFamilies.ts` or the faucet/bell/target logic — that slice passed its gates and is
not what was rejected. Do not touch `src/systems/WaveSystem.ts` **except** to answer self-check 4
below. Do not rebalance anything. Do not add a second contract. Do not delete or rewrite
`e2e/drill-yard.spec.ts`'s persistence-absence assertions — they are the best part of the slice.

---

## SELF-CHECK (name the exact commands and paste real numbers)

1. `npx tsc --noEmit` clean · `npm run build` green.
2. `npx playwright test e2e/drill-yard.spec.ts --project=desktop-chrome --workers=1` and
   `--project=mobile-chrome` — both green, zero console errors.
3. **The four reds, now green, run by name:**
   `npx playwright test e2e/board-era-chapters.spec.ts e2e/en-02-e1-coverage.spec.ts
   e2e/town-t3-board.spec.ts e2e/board-gating-and-profiles.spec.ts --project=desktop-chrome --workers=1`
   → paste the pass/fail line. s1321 measured **11 passed / 4 failed (4.6m)**; you must reach **15/15**.
4. **F-1321-4, the one adjacent suite s1321 did not run:** your predecessor changed shared behaviour in
   `WaveSystem.update` — `scheduledDisabled()` used to force `waveState = 'quiet'` unconditionally and
   now preserves `'active'`/`'cleared'`, which every spawn-disabled contract goes through. Run
   `e2e/m2-03-wave-scheduler.spec.ts` and `e2e/m1-03-wave-pressure.spec.ts` (`--workers=1`) and report
   the result. If either reds, that is a **finding about the predecessor**, not about your change —
   report it, do not silently fix it.
5. `npm run test:node-guards` — report the total and any delta.
6. Screenshots to `artifacts/pc-01b-drill-yard-parity/`, desktop + 390px, including the plain-boot card.
7. **`--workers=1` on every playwright command** (§3.1: at default workers the fire shell manufactures
   drift reds; a red seen at default workers is not evidence until it reproduces at `--workers=1`).

**READY-FOR-GATES** + report: which fork you chose and why · the parity number table from scope 5 ·
the 15/15 line · the wave-suite result · the plain-boot screenshot paths.
