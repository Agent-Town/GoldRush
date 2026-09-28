# E7 Tape Reel phone hit-target audit

READY-FOR-GATES — audit passes both projects; the adjacent inheritance gate remains red on unchanged pre-task source.

**Verdict: instrument artefact, no production change.** No F-TAPE ID is warranted. `src/**` is unchanged (no layering lines, simulation, or gameplay changes). The historical run-16 canvas interception does not reproduce in the requested plain-board audit; this result does not establish its precise historical cause or complete either map's native objective ride.

## Measurements

Desktop: 1280 × 800. Mobile: 390 × 844, Chromium Pixel 5 touch emulation. Echo Canyon was launched from the town board on both projects; Relay Rush and Dead Band were also launched from the board on mobile. Only persisted access prerequisites and a named profile/town were seeded; no debug/seed/timescale/no-wave/no-level/invulnerability flags or run-state mutations were used. Every launch asserted the requested active contract and absence of `__GR_TEST__`.

Each row samples the centre and all four corners inset by 2 CSS px using `document.elementFromPoint`. All **40 unobscured points** reached the toggle. All **10 points with Patent Office open** reached its modal overlay, as expected. The overlay arose naturally through play and was closed with its first invention card. An ordinary desktop click and an actual mobile `tap()` then opened the library; its Close button worked. Console errors: **0**; page errors: **0** across every audit boot.

| Project | Map | Moment | Wave / sim time | Centre top element | Top pointer-events / z-index | Points reaching toggle |
| --- | --- | --- | --- | --- | --- | ---: |
| desktop-chrome | e7-echo-canyon | HUD mounted | 0 / 1.80s | `BUTTON[data-testid=playbook-toggle]` | `auto` / `auto` | 5/5 |
| desktop-chrome | e7-echo-canyon | wave 1 | 1 / 30.17s | `BUTTON[data-testid=playbook-toggle]` | `auto` / `auto` | 5/5 |
| desktop-chrome | e7-echo-canyon | Patent Office open | 2 / 70.63s | `SECTION[data-testid=upgrade-overlay]` | `auto` / `11` | 0/5 |
| desktop-chrome | e7-echo-canyon | Patent Office closed | 2 / 70.73s | `BUTTON[data-testid=playbook-toggle]` | `auto` / `auto` | 5/5 |
| mobile-chrome | e7-echo-canyon | HUD mounted | 0 / 2.30s | `BUTTON[data-testid=playbook-toggle]` | `auto` / `auto` | 5/5 |
| mobile-chrome | e7-echo-canyon | wave 1 | 1 / 30.73s | `BUTTON[data-testid=playbook-toggle]` | `auto` / `auto` | 5/5 |
| mobile-chrome | e7-echo-canyon | Patent Office open | 2 / 70.63s | `SECTION[data-testid=upgrade-overlay]` | `auto` / `11` | 0/5 |
| mobile-chrome | e7-echo-canyon | Patent Office closed | 2 / 70.67s | `BUTTON[data-testid=playbook-toggle]` | `auto` / `auto` | 5/5 |
| mobile-chrome | e7-relay-rush | HUD mounted | 0 / 1.70s | `BUTTON[data-testid=playbook-toggle]` | `auto` / `auto` | 5/5 |
| mobile-chrome | e7-dead-band | HUD mounted | 0 / 1.57s | `BUTTON[data-testid=playbook-toggle]` | `auto` / `auto` | 5/5 |

The toggle itself has computed `pointer-events: auto`, `z-index: auto`. Desktop bounds are `(1083.40625, 213.484375, 166.59375, 44)`; mobile bounds are `(202, 92, 54, 52)` on all three maps. Width and height retain the required 44 px minimum. The JSON records every point, rectangle, ancestor, and computed style.

**Layering finding:** the toggle is mounted in `.hud-panel--weapon`, independently of the non-interactive `.playbook-surface` wrapper. Its own pointer-events rule is active. Patent Office is an intentional modal above the HUD (`z-index: 11` versus HUD `5`); after a player selects an invention, the toggle immediately becomes reachable again. No canvas hits were measured.

## Evidence

- [Desktop audit JSON](audit-desktop-chrome.json)
- [Phone audit JSON](audit-mobile-chrome.json)
- [Desktop outlined toggle](desktop-chrome-toggle.png): 169209 bytes.
- [390 px outlined toggle](mobile-chrome-toggle.png): 52469 bytes.
- Both screenshots were visually inspected: live nonblank gameplay, visible toggle and magenta outline. PNG palette compression preserves screenshot dimensions; both files are below 400000 bytes.
- [Command results and pre-task source identity](verification.json)

## Verification and existing gate failures

Pre-task revision: `a7ea93c4694252ddbf2e02b9497090976938b1e9`. Lane was clean, with no ahead commits; no reset or cleanup of other work was needed. Required `npm install --no-audit --no-fund` and pre-flight `npm run build` both exited **0**. Install-only lockfile metadata churn was restored before implementation.

- `npx tsc --noEmit`: **exit 0** ([log](typecheck.log)).
- `npm run build`: **exit 0** ([log](build.log)); existing Vite/chunk/asset-diet warnings remain.
- `npx playwright test e2e/e7-tape-toggle-phone-hit-target.spec.ts e2e/e7-playbook-surface.spec.ts e2e/m2-01-build-menu.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1`: **exit 1**, **18 passed / 2 failed** ([log](playwright.log)). New audit **2/2 passed**; build menu **14/14 passed**; record/name/shelf/replay **2/2 passed**.
- The two reds are the unchanged inheritance test at `e2e/e7-playbook-surface.spec.ts:49`: after its final plain `/?contract=the-claim&nowaves&nolevel&nopause` boot, `playbook-toggle` is absent. This is not a centre hit-test failure. [Desktop failure](adjacent-desktop-failure.md), [mobile failure](adjacent-mobile-failure.md).
- Control: `git diff --exit-code a7ea93c4694252ddbf2e02b9497090976938b1e9 -- src e2e/e7-playbook-surface.spec.ts e2e/m2-01-build-menu.spec.ts playwright.config.ts package.json package-lock.json` exited **0**. Those runtime, test and configuration paths are byte-identical to pre-task source. Then `npx playwright test e2e/e7-playbook-surface.spec.ts --grep 'the tape drawer arms' --project=desktop-chrome --project=mobile-chrome --workers=1` independently reproduced **both reds**, **exit 1** ([control log](pre-task-source-control.log)). No existing assertions were changed.

All browser commands used the config-owned dev server at `http://127.0.0.1:5188`, one worker. The task's unchanged-green adjacency requirement is therefore **not met**; the pre-task-source control attributes the reds without hiding them or making an out-of-scope fix.

## Instrument adaptations and scope

The first draft stopped at town naming because the fixture omitted a town name; the fixture now seeds it. A later map launch was cancelled by Playwright's default dismissal of the normal suspended-run abandonment confirmation. The audit now accepts only that expected confirmation and provides the Echo unlock prerequisite for Dead Band. No synthetic DOM clicks, forced hits, or production changes were used to obtain passing hit tests.

Run-16 findings were read in sibling `worktrees/lane-c/artifacts/sol/play-proofs/run-16/` because they are absent from lane-a and the root checkout. The newer `clickTape` driver was likewise inspected read-only in lane-c. Nothing in lane-c was modified.

Regenerated adjacent evidence restored after checks: `artifacts/056/desktop-build-menu-icons-blurb.png`, `artifacts/056/desktop-build-menu-palisade.png`, `artifacts/056/mobile-390-build-menu-icons-blurb.png`. No other agent edits were discarded. The task's TOUCH-ONLY firewall takes precedence over the general Obsidian-write convention; this report is the durable handoff, with no out-of-scope vault write.

## Commits

Audit/spec/evidence: `6693dfa371064988421d30efa63b13a08b6a9d65` (`fix: audit E7 phone Tape Reel hit targets through plain board launches`). This report is committed separately with the `fix:` prefix; its exact commit is available via `git log -1 -- artifacts/e7-tape-toggle-phone-hit-target-1/report.md` and in the final handoff.

## REMAINING LIST IN ORDER

1. Orchestrator/HUD owner: separately scope the existing epoch-inheritance failure at `e2e/e7-playbook-surface.spec.ts:49`, then restore the all-green adjacent gate. The firewall prohibits fixing that assertion or its unrelated launch/progression path here.
2. Native-proof owner: original run-16 Echo/Relay phone objectives remain unproved. Any further full ride requires its own task; the present result proves toggle reachability only.

Assigned hit-target audit and report are complete. Conditional production fix was correctly skipped because the mobile hit tests passed.

Evidence directory total, including this report: **646406 bytes**.
