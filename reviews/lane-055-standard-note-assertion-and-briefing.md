# Lane 055 — standard-note assertion and briefing

- Slice: `lane-055-standard-note-assertion-and-briefing`
- Branch: `lane/m3`
- Base: `0d0873bd`
- Verdict: READY-FOR-GATES; slice gates pass, with unrelated current-main adjacent reds recorded below.

## What changed

`prepareManualBaronKill()` dismisses the contract briefing after `resetRun()`, which is the last call that re-shows it and restarts its 8,000 ms timer, then waits for the briefing root to be hidden. At the standard-note check, the test directly asserts that no visible briefing exists, that the note root is visible, and that it carries `data-object-class="baron_standard"` before retaining the title and compact-safe body text assertions.

## Evidence

| Check | Result |
|---|---|
| Pre-change `npm run build` | PASS |
| Direct briefing proof at note poll | PASS in every target run: `await expect(page.locator('[data-testid="contract-briefing"]:not([hidden])')).toHaveCount(0);` executes immediately before the note-root poll |
| Desktop repeat, 10 runs | PASS, target 10/10 green and full file 40/40 green in 5.2m; red count **0/10** |
| Target spec, desktop + 390 px mobile | PASS: 7 passed, 1 intentional desktop-only hash-test skip on mobile |
| `e2e/polish-03-mobile-hud.spec.ts`, both projects | PASS on mobile; intentional project skip on desktop |
| `e2e/world-info-notes.spec.ts`, both projects | RED: 6 failures, 9 passes, 1 skip in the combined adjacent command; details below |
| `npx tsc --noEmit` | PASS |
| Final `npm run build` | PASS (`vite` 1.31s; asset diet completed) |
| Console/page errors in target | PASS via retained `assertNoErrors()` |
| Firewall | PASS: only `e2e/055-baron-kill-stop.spec.ts` and this review remain changed; zero `src/`, zero other `e2e/` |
| Screenshot changes | Both required desktop 055 PNGs regenerated with different bytes, then were restored to main because artifacts are outside the touch-only firewall |

The adjacent command was:

```text
npx playwright test e2e/world-info-notes.spec.ts e2e/polish-03-mobile-hud.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1
```

`world-info-notes.spec.ts` failed on both projects at the pre-existing build-ghost validity poll (`:111`), fixed-key town-shell navigation assertions (`:301`/`:307`), and the mobile-note geometry assertion (`:335`, note bottom 636 vs maximum 586). This slice cannot affect those outcomes: `git diff --exit-code main -- e2e/world-info-notes.spec.ts e2e/polish-03-mobile-hud.spec.ts src` passed, and the only executable diff is another isolated Playwright spec. They remain an adjacent gate issue for the supervisor; the firewall forbids fixing them here.

## Honest boundary

The historical red occurred once in 43 runs. The observed 0/10 red count is underpowered to prove closure and must not be described as closing F-1101-1. This slice closes the proven false-green branch and directly proves that the contract-briefing clause cannot fire when the standard-note poll begins; it does not establish the cause of the historical red.

## Premise check

No task premise was contradicted. The only unexpected result was the unrelated adjacent-suite baseline red above.

## Final firewall output

Before the runner auto-commit, `git diff --name-only main...HEAD` is empty because the changes remain in the working tree:

```text
```

The complete working-tree output is:

```text
e2e/055-baron-kill-stop.spec.ts
reviews/lane-055-standard-note-assertion-and-briefing.md
```

---

## Drain verdict — s1123 (supervisor)

- **Verdict: MERGED.** Accepted on the scope-4 **direct proof**, per the master's own acceptance clause — **not** on the 10-run green.
- Merge classification: base `0d0873bd`. `git log 0d0873bd..main -- <both paths>` was **empty**, i.e. main never moved either file, so this landed as a clean two-path `git checkout` plus a path-scoped commit. No 3-way graft, no conflict resolved.

### Gates re-run by me on the merged tree (not inherited from the report)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, `✓ built in 1.44s` |
| `e2e/055-baron-kill-stop.spec.ts` desktop + mobile-390 | **7 passed / 1 skipped** (47.6s); the skip is the intentional desktop-only sim-hash test |
| `e2e/polish-03-mobile-hud.spec.ts` desktop + mobile | 1 passed / 1 intentional project skip (19.0s) |
| `e2e/world-info-notes.spec.ts` **on clean main, before merging** | **6 failed / 8 passed** — `:193`, `:286`, `:318` on BOTH projects (3.1m) |
| Console/page errors | none — the spec's retained `assertNoErrors()` passed |
| Firewall | `git diff --name-only main...lane/m3` = exactly 2 files; **zero `src/`**, no `e2e/` file but 055 |

### Why the adjacent red does not block

I did **not** accept the report's structural argument ("the diff touches no shared file"). I ran `world-info-notes.spec.ts` on **clean main at `452af90c`, before merging**, and got a **byte-identical failure set** to the runner's post-change run — same three tests, same both-project pattern. Fingerprint matched ⇒ pre-existing, and a 055-only diff cannot have moved it. Those three remain an unrelated open red on main.

### What this slice does and does not establish

**Does:** the `contract-briefing` clause at `Game.ts:5664` provably cannot fire when the standard-note poll begins, and the proven green-direction unsoundness at `:150` is closed — a vanished note now **fails**, because the note root must be *visible* and carry `data-object-class="baron_standard"`.

**Does not:** close F-1101-1. The historical red was **1 in 43**; 0/10 is underpowered. The runner stated this itself and I have not upgraded the claim.

### Findings

- **F-1123-0 (non-blocking, credit):** the dismissal sits *after* `resetRun()` — the only correct position, since `resetRun()` is the call that re-shows the briefing and restarts its 8,000 ms timer (F-1122-1). The runner also left `:151`'s body assertion byte-untouched, respecting the s1122 hazard that adding a visibility requirement there would introduce a **new** flake in compact mode (`WorldInfoNotes.ts:197-203`, `body.hidden` when `seenCount < 2`).
