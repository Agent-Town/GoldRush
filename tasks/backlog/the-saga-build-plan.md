# Task backlog — closed rows: the-saga-build-plan

Closed rows split out of `tasks/BACKLOG.md` by `scripts/backlog-split-closed.mjs`
(owner ruling 2026-09-24, item 13a). NOTHING HERE WAS DELETED — these rows were MOVED, byte
for byte, and this file is tracked exactly as the index is (CLAUDE.md §4.10b, the Retention
Law). The COMPLETE work ledger is the index PLUS every file in this directory; read them
together, and list them with `backlogFiles()` in `scripts/ledger-corpus.mjs`.

- ✅ **F-owner-profiles-back FIXED same-session** (owner playtest 2026-07-11: "there is no way back to the menu from the profiles page" — VERIFIED in `ProfileManager.ts` render: list/create/export/import/start, zero exit affordance). Fix `7b65c503` (attended, 13-line src): `InstallOptions.onBack` + "Back to the menu" button (`profile-back`, list view only, menu path only — skipTitle paths unaffected) + `main.ts` wires back→`showStartMenu()`. Gate: tsc 0 · build green · 044+m3-06+profile-first-boot battery 16/16 both projects incl. NEW `044:104` round-trip test 2/2 · **DEPLOYED https://048103f8.gold-rush-3in.pages.dev**.
