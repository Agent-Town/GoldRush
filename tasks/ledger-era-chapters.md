# ledger-era-chapters — the Claim Ledger reads like a saga (lane-d; commit prefix "feat:")
ROLE: UI + content organization. WORKDIR: lane-d (worktrees/lane-d).
CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner: "and in the school encyclopedia according to each epoch?" — entries exist (incl. per-era overview entries era_frontier/era_steamworks/era_voltage) and epoch discovery ships, but the READER is not organized by era.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules. If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## READ-FIRST: src/encyclopedia/registry.ts (entry inventory + epochLedgerEntryById + how entries associate to eras today — add an `epochId` tag where association is implicit) · src/encyclopedia/reader.ts (current organization/markup) · installEpochLedgerDiscovery (src/encyclopedia/state.ts — discovery flow) · the research chart era row (src/ui/ResearchChart.ts renderEraRow — the era-tab grammar players already know) · src/ui/EraBackdrop.ts (chapter headers may use the era plates — lazy, LITE-safe).

## SCOPE:
1. Every registry entry carries an `epochId` (existing entries: tag them — E1 content to frontier, E2 enemies/buildings/pressure to steamworks, era overviews to their own era). Untagged legacy entries default to frontier; the type makes the tag REQUIRED for new entries.
2. The reader groups entries into ERA CHAPTERS: an era tab row (same grammar as the research chart — "The Frontier ✓ / The Steamworks — active / …"), each chapter headed by its era name + (non-LITE) its kit plate strip, listing that era's entries with the existing discovered/undiscovered states. Eras beyond the player's active order show as a locked chapter stub ("The ledger has pages yet unwritten") — never their content.
3. Deep links keep working: openClaimLedger(entryId) lands on the right chapter+entry (the events channel from main.ts).
4. e2e `e2e/ledger-era-chapters.spec.ts`: E2-active profile sees two open chapters + locked future stub; era tabs switch chapters; a deep link opens the correct chapter; E1-only profile sees one chapter; discovery states preserved; zero console/page errors, both projects. Existing encyclopedia specs unmodified-green.

## Firewall
Touch ONLY: src/encyclopedia/registry.ts (epochId tags + type), src/encyclopedia/reader.ts (chapter organization), the new spec, artifacts/ledger-era-chapters/. NO entry content rewrites, NO discovery logic changes, NO town/research surfaces.

## Self-check
tsc + build green · new spec + existing encyclopedia suites green both projects · zero console/page errors · chapter screenshots (E1-only + E2-active). If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the entry→era tag table.
