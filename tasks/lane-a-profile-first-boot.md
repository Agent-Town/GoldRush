# Task profile-first-boot: strangers stop being Robin + saves become portable (LANE-A, branch lane/m3, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; src/game/ProfileStorage.ts (DEFAULT_PROFILE_NAME='Robin' at :13, ensureProfileState auto-creates it; PROFILE_DATA_KEYS = everything per-profile); the 044 menu profile section; town-T2's naming card styling (reuse the pattern). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m3 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after run-suspend in this lane's queue (both touch profile persistence; suspend data must be included in export).

## Owner finding (2026-07-07 ~21:15, thinking about the public URL)
"Everyone that visits the website plays the same game, right?" — No (per-browser isolation), but the REAL issues: (1) every fresh visitor auto-becomes a profile named "Robin"; (2) saves are browser-bound — no backup, no device transfer, one browser-cleanup from losing a town.

## Scope
1. **First-boot profile creation**: when NO profile state exists, the menu leads with "Who's prospecting?" (ledger card, text input, T2-naming styling/validation) instead of silently creating "Robin". Existing states (like the owner's) untouched — migration-safe: a state that already exists never re-prompts. The dev/e2e path keeps a seeded profile (test harness needs determinism — `?profile=robin` debug param or equivalent documented).
2. **Save export**: menu → Profiles → "Pack the ledger" — downloads a JSON file (all PROFILE_DATA_KEYS for the active profile + profile record + version envelope; filename `goldrush-<profile>-<date>.json`). Plain JSON, human-readable (the family can SEE their save).
3. **Save import**: "Unpack a ledger" — file picker, validates the envelope/version, imports as a NEW profile (name collision → "(2)" suffix; NEVER silently overwrites), confirm card shows what's inside before applying ("Robin — town 'X', science 6, territory III — bring them in?").
4. **The honesty line**: Profiles screen states plainly: "Saves live in this browser. Pack the ledger to keep or move them."
5. All copy ledger-voice; mobile-safe (390px file pickers work).

## Firewall
Touch ONLY: ProfileStorage first-boot path (additive + migration-safe), menu profile UI, export/import module (new src/game/ProfileTransfer.ts), e2e. NO changes to: profile key schema, run-suspend internals (include its key in export generically via PROFILE_DATA_KEYS), sim, existing profiles' behavior.

## Self-check
tsc/build; new `e2e/profile-first-boot.spec.ts`: cleared-storage boot → prompt → named profile created (no "Robin" ghost) · existing-state boot → NO prompt · export downloads valid JSON containing seeded keys · import round-trip restores a profile's meta (science/territory/town-name asserted) · collision suffixing · malformed file rejected warmly; demo-profiles + m1-01 + m2-01 + 044-menu specs unmodified green both projects (the seeded-profile harness path proven); zero console errors; screenshots into artifacts/profile-first-boot/. Commit on lane/m3. End: READY-FOR-GATES + results.
