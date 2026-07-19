# Task lane-save-compat-guard: THE SAVE-COMPAT LAW gets teeth (LADDER → next free lane, commit prefix "feat:")
You are Codex, implementer for Gold Rush (worktree per lane).
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: src/game/ProfileTransfer.ts (pack/unpack: gzip-base64 envelope, importProfileRecord, save-slot merge) · ProfileStorage/gr.profile.v2 scoping · reconcileActiveEpoch (the healing precedent).
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Why (OWNER LAW 2026-07-19, verbatim: "we have to update the server later and MUST keep players progress.")
Deploys update production in place; the storage origin persists — but only discipline keeps the FORMAT loadable. The law needs an enforcer.
## Scope
1. FREEZE A FIXTURE: generate a representative ledger pack (profiles at several eras, save slots, meta progress, difficulty presets) via the REAL pack path; commit it as e2e/fixtures/ledger-pack-v2026-07-19.json — the eternal ancestor.
2. Spec e2e/save-compat.spec.ts (both projects): a fresh boot UNPACKS the frozen fixture green — profiles load, the active epoch reconciles, a run boots from an imported profile, zero console. Every future format change must keep this spec green (migrate-on-import, never reject) or consciously version the envelope WITH a migration.
3. Document the law in the transfer module header: storage keys are append/migrate-only; imports never destroy; new fixtures get ADDED (never replace the ancestors).
## Firewall: fixture + spec + comments only; NO transfer logic changes (unless the fixture round-trip exposes a real defect — then fix minimally and report it as a finding).
END: READY-FOR-GATES + what the fixture contains.
