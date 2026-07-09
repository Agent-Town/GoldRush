# Task 063-claim-ledger-voice: the Claim Ledger speaks IN-WORLD — strip internal facts, give every character a quote (lane-a; commit prefix "fix:")
**OWNER ORDER 2026-07-09 (verbatim, with two ledger screenshots — "The claim-holder is a young woman; never call her the Prospector. (lore/characters.md, 2026-07-09)" and "Tavernkeeper belongs to the batch-009 town roster. (lore/characters.md, 2026-07-09)" rendered to the PLAYER): "this is more internal information, not needed. If you want you can give each character a quote and add it there instead."**
You are Codex in worktrees/lane-a. Pre-flight per LANE-SAFETY. READ FIRST: the Claim Ledger reader + fact source (`reader.ts` lineage, EN-01/02 — how facts are extracted/curated), `lore/characters.md` (the wiki = the AGENTS' source of truth; its citation convention is for agents, NEVER for players), the story-spine cast voice sheet (tavernkeeper = quest-giver flavor, clerk = numbers-lover, elder = dry/kind/brief).

## The law this task installs
**A fact renders in the player's ledger ONLY if it is true INSIDE the world — something a kid could overhear in the tavern.** Production metadata (batch numbers, rosters, file names, dates), canon RULES ("never call her X"), and citations ("(lore/…, 2026-…)") are agent-side and NEVER render.

## Scope
1. **AUDIT every rendered fact** across all ledger entries (characters, buildings, enemies, contracts, era): remove/replace any fact that violates the law above. Strip ALL source-citation suffixes from player rendering (they stay in the wiki files, agents still need them).
2. **QUOTES:** every CHARACTER entry gains a `quote` — one in-universe line in that character's ratified voice, rendered as styled flavor ("…") where the internal facts sat. Write them per the cast voice sheet; ≤12 words; kid-readable; no future-lore spoilers (mystery law). Cover: hero, Prospector, tavernkeeper, assay clerk, elder, preacher, storekeeper, schoolteacher, youngsters, Baron, Claim Jumper. Store the quotes as additive `QUOTE:` lines in `lore/characters.md` (wiki stays the single source; reader whitelists quote + world-facts only).
3. **e2e:** rendered ledger contains NO "(lore/", ".md", "batch-", or ISO-date strings anywhere (walk all discovered entries); each discovered character page shows exactly one quote.

## Firewall
Touch ONLY: the ledger reader/content filter, additive QUOTE lines in `lore/characters.md`, its e2e, artifacts. **NO engine, NO sim, NO discovered-state/save changes, NO entry-unlock logic.**

## Self-check
tsc/build · en-01 + en-02 + new assertions green both projects · zero console · desktop + 390px screenshots of a character page with its quote → `artifacts/063/`.
End: **READY-FOR-GATES** + the quote table (character → quote) + screenshots.
