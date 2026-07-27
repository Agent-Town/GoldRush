> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, content-probed s1132 2026-07-27).** Done-move `tasks/failed/drained-s138-heritage-mine.md`. Both named outputs are tracked on main: `assets/reference/agent-town-heritage/CATALOG.md` and `docs/heritage-notes.md`; `BACKLOG:71` confirms the content reached main via `bc3540c` **before** the s140 w1-05 lane reset. See F-1132-1.

# Task heritage-mine: the Portal expedition — catalog and import Agent Town's original art & brand (LANE-C, branch lane/polish, commit prefix "mkt:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ-ONLY SOURCES (never write to them): `/Users/robin/Projects/Portal` (main + branch `claude/frontier-ledger-assets-2026-06-10` via `git -C ... show <branch>:<path>` — do NOT check branches out) and `/Users/robin/Projects/agent-town-assets` (38 UUID-named PNGs). Owner ruling 2026-07-07 ~19:55: "The code is in the Portal repository and its branches — the other ones are not so important." Pre-flight: safe-dupe rule on lane/polish; npm install not needed unless building; this task writes ONLY into THIS repo. SEQUENCING: after w1-05 (this lane's queue).

## Why
Agent Town's original town — buildings, district art, brand kit, the ancestral style anchor ("playful sci-fi wild west frontier settlement… subtle neon circuitry… warm sunset palette", scripts/style_anchor_agent_town_wild_west.txt) — predates Gold Rush and matches our universe by construction. 229+ images and a design pack are sitting unmined while we generate from scratch.

## Scope
1. **Catalog**: survey Portal `public/images` + `public/images/districts_style_images` + `public/assets` + `data/erc8004-image-cache` + `tmp/gpt-image-drops` + the frontier-ledger-assets branch's Brand kit + `agent-town-assets/`'s 38 PNGs (VIEW each image). Produce `assets/reference/agent-town-heritage/CATALOG.md`: one row per keeper — source path, what it depicts (building type/district/character/texture), day/night pairing, style class (iso-building / chibi-character / texture / brand), Gold-Rush-fit verdict (direct-reuse-candidate / reference-conditioning / landing-brand / skip) with one-line reasoning.
2. **Curated import**: copy the TOP ~25 keepers into `assets/reference/agent-town-heritage/` with descriptive kebab names (wagon-shop-day.png pattern — two already seeded) + provenance line each in the catalog. Priorities: iso BUILDINGS (day/night pairs gold), district/town-square scenes, UI textures (parchment/leather/wood), brand marks from the Brand kit.
3. **Design-pack extraction**: read the branch's `docs/design/agent-town-design-pack/{BRAND,DESIGN,GAME_UX}.md` → write `docs/heritage-notes.md`: 15 lines max — what the original brand defined (palette, type, voice), deltas vs docs/GOLD_RUSH_BRIEF.md §4, and which pieces the agenttown.app landing (site/) should adopt verbatim.
4. **Anchor reconciliation note** (in heritage-notes): the original style anchor verbatim + ours, one paragraph on the lineage ("neon circuitry" → teal-brass agent-tech) — for the owner + future art tasks.
5. NO processing/cutting, NO src/ changes, NO site/ changes (follow-up tasks consume the catalog).

## Firewall
Touch ONLY: assets/reference/agent-town-heritage/**, docs/heritage-notes.md, artifacts/heritage-mine (screenshots optional). READ-ONLY everywhere outside this repo. NO checkouts/writes in Portal, NO deletions anywhere.

## Self-check
Catalog complete (every keeper has source+verdict; count surveyed vs kept stated); imports open correctly (file sizes sane, no truncation); heritage-notes ≤15 lines + the anchor paragraph; nothing outside the firewall touched (`git -C /Users/robin/Projects/Portal status` clean). Commit on lane/polish. End: READY-FOR-GATES + the top-5 finds called out + the direct-reuse shortlist.
