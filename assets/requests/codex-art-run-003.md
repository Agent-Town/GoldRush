# Codex Art Run 003 - S2 Town v1 backlog

Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260705-230328-029-art-shift-001.md`

Mode: built-in Codex `image_gen`, copied from `/Users/robin/.codex/generated_images/019f3305-3c9e-7fb0-808b-5e092b21caac/` into `assets/raw/`.

Notes:
- Read `assets/BACKLOG.md`, `assets/requests/batch-001.md`, `assets/LEDGER.md`, `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9, `STATUS.md` verification lessons, and the only present `docs/pipelines/animation-pipeline.md` copy under `worktrees/lane-c-salvage/`.
- `assets/LEDGER.md` still describes `codex-art-run-003.md` as the next jumper-rotation regen log, but this task explicitly assigned this log to S2 Town v1. Followed the task.
- Existing building raws were already present at the exact target filenames before this run. I visually QA'd them, accepted them, and resized them to the requested 1024x1024 instead of burning five duplicate generations.
- The built-in tool did not expose a direct local-reference attachment argument. I inspected the existing building and character-sheet style references and folded the reference constraints into the prompts.
- Gray portrait backgrounds are generator-gray, not mathematically flat in every pixel. This matches existing accepted raws and should remain usable for border-key extraction.

## Burn count

- New image generations: 9
- Retries: 0
- Reused pre-existing building outputs: 5
- Limit: 16 max

## Outputs and QA

| File | Size | Burn | QA |
|---|---:|---:|---|
| `assets/raw/bld-tavern.png` | 1024x1024 | 0 | Accepted existing output. Two-story timber tavern, warm windows, swinging sign has no text. |
| `assets/raw/bld-general-store.png` | 1024x1024 | 0 | Accepted existing output. Porch, barrels, crates, warm windows, no text. |
| `assets/raw/bld-claim-office.png` | 1024x1024 | 0 | Accepted existing output. Ledger-house feel, brass plaque shapes, no letters. |
| `assets/raw/bld-schoolhouse.png` | 1024x1024 | 0 | Accepted existing output. Small bell tower, warm frontier style, no text. |
| `assets/raw/bld-chapel.png` | 1024x1024 | 0 | Accepted existing output. Modest chapel, warm not grim, no text. |
| `assets/raw/townsfolk-tavernkeeper.png` | 768x768 | 1 | Stout tavernkeeper, towel over shoulder, warm expression, no text/weapons. |
| `assets/raw/townsfolk-storekeeper.png` | 768x768 | 1 | Spectacles and apron, helpful face, no text/weapons. |
| `assets/raw/townsfolk-assay-clerk.png` | 768x768 | 1 | Ink-stained fingers and blank ledger grid, no readable writing. |
| `assets/raw/townsfolk-schoolteacher.png` | 768x768 | 1 | Chalk and satchel, no slate/writing, warm expression. |
| `assets/raw/townsfolk-preacher.png` | 768x768 | 1 | Kind broad-hat preacher, book has no readable text, not solemn. |
| `assets/raw/townsfolk-elder.png` | 768x768 | 1 | Weathered elder, pipe clearly unlit and smokeless. |
| `assets/raw/townsfolk-youngster-a.png` | 768x768 | 1 | Freckles, toy slingshot tucked in belt, not held or aimed. |
| `assets/raw/townsfolk-youngster-b.png` | 768x768 | 1 | Braids, frog visible in pocket; generator returned a vertical canvas, centered and padded to 768 square. |
| `assets/raw/tavern-interior-backdrop.png` | 1536x1024 | 1 | Full-bleed tavern interior, long bar, hearth, empty notice board, no text. |

## Generated source files

| Target | Source |
|---|---|
| `townsfolk-tavernkeeper.png` | `/Users/robin/.codex/generated_images/019f3305-3c9e-7fb0-808b-5e092b21caac/ig_06f818e9a60fae7e016a4a80f75b0c81919fd87b41d1f4f3d1.png` |
| `townsfolk-storekeeper.png` | `/Users/robin/.codex/generated_images/019f3305-3c9e-7fb0-808b-5e092b21caac/ig_0ff5edc3763c0fe8016a4a8196e67c8191b059f84b2f6ae8fc.png` |
| `townsfolk-assay-clerk.png` | `/Users/robin/.codex/generated_images/019f3305-3c9e-7fb0-808b-5e092b21caac/ig_0affc93f7e237b63016a4a81ff5cb48191963a1fcec7c22da0.png` |
| `townsfolk-schoolteacher.png` | `/Users/robin/.codex/generated_images/019f3305-3c9e-7fb0-808b-5e092b21caac/ig_097eb293ab7f3a58016a4a826c19f8819188220f79f55a6d9e.png` |
| `townsfolk-preacher.png` | `/Users/robin/.codex/generated_images/019f3305-3c9e-7fb0-808b-5e092b21caac/ig_0fbe764e2331850a016a4a82e2f278819a944ad4ea233f6ff7.png` |
| `townsfolk-elder.png` | `/Users/robin/.codex/generated_images/019f3305-3c9e-7fb0-808b-5e092b21caac/ig_0664b547a5af0c0d016a4a834af0e48191a22c69a765c89bc2.png` |
| `townsfolk-youngster-a.png` | `/Users/robin/.codex/generated_images/019f3305-3c9e-7fb0-808b-5e092b21caac/ig_0f0f4c9b4b2daa5c016a4a83bc054c819bba45302f782e0dd7.png` |
| `townsfolk-youngster-b.png` | `/Users/robin/.codex/generated_images/019f3305-3c9e-7fb0-808b-5e092b21caac/ig_03cf65f37fac5477016a4a844759888191b8b7044b8f0788b3.png` |
| `tavern-interior-backdrop.png` | `/Users/robin/.codex/generated_images/019f3305-3c9e-7fb0-808b-5e092b21caac/ig_04ae1f607499f60c016a4a84ccfe8c819185bf21f62b7ccbb7.png` |
