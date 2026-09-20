CODEX: model=gpt-5.6-sol effort=high
# lane-gg-01b-welcome-release-gate — GG-01b CORRECTIVE: the welcome blocks the release gate's board click
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled. **FIRE-AUTHORED s1210 (attended review welcome).**

WHY: **F-1210-5, measured by the s1210 drain that merged GG-01b and is therefore reporting its own regression.** GG-01b landed at `9825441f` (review `reviews/gg-01b-gazette-welcome.md`). It passed every gate it was given — tsc 0, build green, its own spec 8/8 both projects, `task-025`+`m1-01`+`m2-01` 32/32 — and it still turned the RELEASE gate suite red, because that suite runs under a **different playwright config** and no listed gate reaches it.

MEASURED, ONE VARIABLE, SAME TREE (both arms carry lane-b's convergence cure `0114f5bb`):
- **with GG-01b:** `e2e/release-build.spec.ts:21` **2/2 FAILED** desktop+mobile — `locator.click` timeout 150 s on `getByTestId('town-open-board')`, call log *"element is not visible"* (2× "waiting for element to be visible, enabled and stable", retried).
- **with GG-01b reverted** (`TownScene.ts`/`ProfileStorage.ts` restored from `9825441f^`, `TownWelcome.ts` + `e2e/gazette-welcome.spec.ts` moved out, `grep -c TownWelcome src/town/TownScene.ts` → **0**): **2/2 PASSED, 57.9 s.**

The coherent mechanism — **which you must verify, not assume**: the welcome takes over a **fresh profile's first town entry**, and its first anchored beat is the **Tavern board**, exactly the control `:21` clicks. `release-build.spec.ts` creates precisely that fresh profile and knows nothing about the welcome.

READ-FIRST (paths, all of them, before you change a line):
- `reviews/gg-01b-gazette-welcome.md` (the drain, F-1210-1..4) and `reviews/approach-convergence-class.md` (F-1210-5 write-up).
- `src/town/TownWelcome.ts` — the phase machine (`idle`/`paper`/`walk`, `TOWN_WELCOME_BEATS`, `TOWN_WELCOME_SEEN_KEY`, arrival-radius advance).
- `src/town/TownScene.ts` — the hook, and **whatever it does to the approach prompt / board button while the welcome is active**. This is the file that answers the whole question.
- `e2e/release-build.spec.ts:21` — the failing scenario; `playwright.release.config.ts` — **the only config it runs under** (`testMatch: /release-build\.spec\.ts/`, `vite preview` on port **5190**).
- `specs/greenhorn-gazette/README.md` §THE WELCOME — the owner law: beats are **skippable** and the welcome **dissolves to normal play**, **never replaying uninvited**.
- `e2e/gazette-welcome.spec.ts` — how the welcome is already driven and skipped in tests.

PRE-FLIGHT (LANE-SAFETY, safe-dupe proved BY CONTENT by the authoring fire — re-verify before you reset, never trust this paragraph):
`lane/perf` is **2 ahead of main and both are safe to reset over**, verified s1210: (1) `06eeac68` is the **REJECTED** GG-03 panel swap, pinned at `archive/lane-perf-gg03-06eeac68` (`git rev-parse --verify` returns `06eeac6864f3…`); (2) `f83f8f76` is GG-01b, whose content is **byte-identical on main** — `git diff main f83f8f76 -- src/town/TownWelcome.ts src/town/TownScene.ts src/game/ProfileStorage.ts e2e/gazette-welcome.spec.ts` is **EMPTY**. Re-run both probes yourself. If either fails, or any dirty tracked blob is unreachable in git, **STOP and report** — do not reset.

SCOPE — **OBSERVE FIRST. This is a diagnosis that may become a one-line cure, and it is explicitly allowed to conclude the test is wrong, the product is wrong, or that this is an owner call.**

1. **MEASURE-FIRST STOP GATE — reproduce the control before curing anything.** Run `npx playwright test --config playwright.release.config.ts -g "first player reaches textured town actors" --workers=2 --reporter=line` on your base. Record pass/fail per project and the exact failure string. Then reproduce the *negative* arm the same way s1210 did (revert the four GG-01b files, move the two new ones out, re-run, restore). **If the failure does not reproduce, write `PREMISE-NOT-REPRODUCED` with both arms' raw counts and STOP** — do not cure a defect you cannot see. (F-1209-1 rider: report your cells *and* these, pooled; do not silently discard prior evidence.)

2. **ANSWER THE PLAYER QUESTION BEFORE THE TEST QUESTION (Mistake #10).** On a **plain boot, no `?debug`**, fresh profile, desktop **and** 390px: after the welcome delivers, **can a player who wants to open the board actually do so** — is there a visible, reachable skip/dismiss affordance, and does the board button become clickable once the welcome dissolves? Screenshot both widths into `artifacts/gg-01b-welcome-release-gate/`. **This answer decides everything below**, and it is the one thing that must not be inferred from code reading.

3. **THEN, and only then, choose ONE and justify it from §2's evidence:**
   - **(a) TEST-KNOWLEDGE FIX** — if a player is genuinely meant to be walked through first and has a working skip: teach `release-build.spec.ts:21` to complete or skip the welcome before clicking the board, reusing the existing helper/testids from `e2e/gazette-welcome.spec.ts` rather than inventing new ones. **Do not weaken the assertion** — the test must still prove a player reaches the board and places the sluice.
   - **(b) PRODUCT FIX** — if the welcome leaves a plain-boot player with **no** reachable way to the board, that is a real defect and the minimal cure belongs in `src/town/`: the welcome must not swallow the board prompt, per the spec's own "skippable / dissolves" law.
   - **(c) STOP AND REPORT** — if the honest answer is a design fork (e.g. "should the release scenario model a returning player instead?"), **do not invent scope**: write the two options with evidence and stop. An owner ruling is cheaper than a wrong cure.

4. **MUTATION PROOF (load-bearing — a guard only ever seen passing is not a guard).** Whatever you fix, show it *fails* when reverted: re-apply the pre-fix state, show `:21` red again with the same fingerprint, restore, show green. Record both.

5. **RE-RUN THE SUITE WHOLE, under its real config**, both projects: `--config playwright.release.config.ts --workers=2`. Report the full count. s1210 measured **24/26** with only `:21` red; anything worse than **26/26** needs its rows fingerprinted against `logs/suite-red-inventory.md`, not waved through.

TOUCH-ONLY: `e2e/release-build.spec.ts` · `src/town/TownWelcome.ts` and `src/town/TownScene.ts` **only under 3(b), only the minimal prompt/visibility hunk** · new screenshots under `artifacts/gg-01b-welcome-release-gate/`.
NO: `e2e/gazette-welcome.spec.ts` (**firewalled OUT — it is GG-01b's own instrument; editing it to agree with you is the one forbidden move**) · `playwright.release.config.ts` and `playwright.config.ts` (F-1204-3 precedent) · `logs/suite-red-inventory.md` (**this red must be CURED or RULED ON, not absorbed** — see F-1210-5) · `src/news/**` · Gazette panel content · Balance · contracts · `assets/raw/**`.

SELF-CHECK: `npx tsc --noEmit` 0 · `npm run build` green · the release suite under **its own config**, both projects, count reported · `e2e/gazette-welcome.spec.ts` **unmodified and still green 8/8** (prove the cure did not cost the welcome) · adjacent `town-t1-square` + `town-t5-townsfolk` fingerprinted against `suite-red-inventory.md` rows 277/278/283/284, which s1210 re-measured as pre-existing at 61.1% / 94.1% · zero console/page errors · screenshots desktop + 390px.

⚠️ LOAD RIDER (F-1210-2, measured this box): a single red battery under an unmeasured load is not evidence. **Run `uptime` and record the load averages beside every timing verdict.** s1210 saw the same suite give 2 failed/3.3 m at load-avg **46.00** and **8/8 in 59.8 s** at **12.03** — identical command, identical tree.

READY-FOR-GATES + report: both arms of §1 with raw counts · the §2 plain-boot player answer with screenshots · which of 3(a)/(b)/(c) you chose **and why, from evidence** · the §4 mutation pair · the §5 full suite count with load averages.
