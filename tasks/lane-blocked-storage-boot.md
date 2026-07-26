# Task lane-blocked-storage-boot: THE GAME MUST BOOT WHEN THE BROWSER REFUSES STORAGE (LANE-A, commit prefix "fix:")
**FIRE-AUTHORED (attended review welcome) — s1081, 2026-07-26.**
You are Codex (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high

**PRE-FLIGHT (SAFE-DUPE, mandatory).** `lane/m3` sits **5 commits ahead of main** and every touched path is accounted for, so a reset is loss-free — but verify, do not inherit:
- The three spec files (`e2e/contract-briefings.spec.ts`, `e2e/gt-05-water-depth.spec.ts`, `e2e/task-025-bandits-dont-swim.spec.ts`), both `assets/contracts/epoch-1-frontier/*.json`, both `scripts/*ticker-stats.mjs` and 2 of the briefing screenshots are **content-merged to main** (`git diff main lane/m3 -- <file>` is EMPTY for each). Safe dupes.
- `rehearsal/segments/e1-depth-play.mjs` **DIFFERS, and that is expected and safe**: both sides *added* the file from a base that lacked it — the lane's copy is **427 lines**, main's is **537 lines**. Main's is the later, live rig (the one F-1077-3 describes, port default at its `:27`). ⚠️ **The lane's copy is a superseded earlier draft — do NOT re-land it, and do NOT "restore" it if you notice it vanish on reset.**
- 9 `reviews/shots-e1-briefing-truth/*.png` differ by regeneration only (evidence re-shot, same tests). Safe to drop.
Reset with `git checkout -B lane/m3 main` and confirm `git log main..lane/m3` is **EMPTY** before you touch a file. If the branch holds source under `src/` or `functions/` that main lacks: **STOP and report** — something undrained is on this lane.

READ FIRST (paths, on main, before writing anything):
- `src/game/ProfileStorage.ts` — specifically `browserStorage():476-482` (**the pattern to copy — it already guards**), `rawGet():484-486` and `rawSet():488-491` (**the defect — they do not**), and `readLegacyDifficulty():378-380`.
- `e2e/task-024-blast-aim-presets.spec.ts:130` — the existing test `'difficulty preset falls back to default when profile storage is blocked'` and its `blockedStorage` stub, whose `length`/`key`/`getItem`/`setItem` **all throw**. This is your acceptance oracle; read it before you design the fix.
- `tasks/BACKLOG.md` F-1077-5 (the origin finding) and F-1081-6 (**a collection hazard you must not trip — see self-check**).

## Why this task
F-1077-5, re-verified by reading the file at authoring time (s1081): **`rawGet` has no `try`/`catch` while its sibling `browserStorage` does**, four lines above it. `rawGet` calls `storage.getItem(key)` (or `nativeStorage.getItem.call(...)`) directly, so in any browser that *throws* on storage access rather than returning null — Safari with "Block All Cookies", a third-party-blocked iframe, some private-window configurations — the exception escapes. `readLegacyDifficulty():378-380` calls it inside a plain function with no guard of its own, so the throw propagates up the boot path. **The player-facing symptom is the worst kind: the game does not degrade, it fails to start, with nothing on screen to explain why.** The guarding pattern already exists four lines away, which is why this is a small fix and not a design question.

**Scope item 2 exists because of a standing lesson** (`cured-defect-survives-in-the-sibling-script`): F-1077-5 named only `rawGet`, but `rawSet():488-491` is the *same* class of defect in the *same* helper pair, and the blocked-storage stub in the existing test throws from `setItem` too. Fixing one and leaving the other is how this returns as a second finding.

## Scope
1. **`rawGet` becomes fail-soft.** Wrap its storage access so a throwing `getItem` returns **`null`** — indistinguishable to every caller from "key absent", which is already a state they all handle. Do not change its signature or return type.
2. **`rawSet` becomes fail-soft in the same commit.** A throwing `setItem` must not propagate; the write is simply lost. Follow `notifyProfileDataChanged():497-503`'s existing house voice for this ("Storage still wrote; sync is best-effort.") — i.e. a one-line comment saying why swallowing is correct here. Do NOT invent a retry, a queue, or an in-memory shadow store; that is a larger design and not this task.
3. **Trace the boot path and confirm nothing else on it is unguarded.** Start from `readLegacyDifficulty():378-380` and walk outward to whatever calls it during first boot. If you find a *third* unguarded storage touch on the boot path, **guard it and say so in your report**; if you find one that needs a design decision, **STOP and report rather than guessing**.
4. **Prove it with the test that already exists.** `e2e/task-024-blast-aim-presets.spec.ts:130` is the oracle — run it and make it green. If it was already green before your change, **that is a finding, not a success**: it means the test does not reach `rawGet`, and you must say so explicitly and add a case that does.
5. **Mutation control (mandatory, this is how the fix is proven).** Once green, revert *only* your `rawGet` guard, re-run the test, and **record the failure message verbatim** in your report; then restore the guard and confirm green again. A green test proves nothing about a fix that would have passed either way (F-1080-B). Do the same for `rawSet` if any assertion covers it.

## Firewall
**TOUCH-ONLY:** `src/game/ProfileStorage.ts` · `e2e/task-024-blast-aim-presets.spec.ts` (only if scope item 4 requires a new case).
**NO:** any other file under `src/` · `functions/` **at all** · `src/game/Balance.ts` (a live tune landed there today) · `rehearsal/segments/e1-depth-play.mjs` (F-1077-3 is a separate task) · `src/town/**` and `src/ui/**` (the wagon just landed there) · no new dependency · no reformatting of untouched lines in `ProfileStorage.ts`.

## Self-check before you report
- `npx tsc --noEmit` clean · `npm run build` green.
- `e2e/task-024-blast-aim-presets.spec.ts` green on **both** projects (desktop-chrome and mobile-chrome/390).
- Adjacent, unmodified-green on both projects: `e2e/profile-first-boot.spec.ts` · `e2e/m3-06-demo-profiles.spec.ts` · `e2e/board-gating-and-profiles.spec.ts` · `e2e/cosmetic-grants.spec.ts` (it asserts profile-key persistence, which `PROFILE_DATA_KEYS` feeds).
- ⚠️ **Do NOT add `e2e/town-t5-townsfolk.spec.ts` or any `ts-0*`/`safari-swap`/`never-trap` spec to your battery: they abort at COLLECTION via `import.meta.glob` (F-1081-6) and take the whole run's verdict with them.** And per that finding: **if any run prints no `N passed`/`N failed` summary line, treat it as ABORTED, not clean.**
- Zero console/page errors in a plain boot probe (no `?debug`), desktop and 390px.
- Report the mutation-control output from scope item 5 verbatim. Report your scope-3 trace even if it found nothing.

READY-FOR-GATES + report: the mutation-control failure message, the scope-3 boot-path trace, whether the existing test was already green (and what you added if it was), and any third unguarded storage touch you guarded or escalated.
