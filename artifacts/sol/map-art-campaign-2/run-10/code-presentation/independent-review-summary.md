# Independent review — presentation owners

2026-09-24. Read-only local Codex CLI review, session `01a0d1e9-e3a7-78e0-bc8f-958537c801b8`. Review covered the bounded source patch, new unit checks and browser additions. No other reviewer or edits by the reviewing agent.

Resolved findings:

- Canyon Works' retraced rail polyline reversed its offset normal at the turnaround. Keep the incoming normal on an exact reversal; derive buffer endpoints from the unique-edge graph, including interior turnaround vertices. Reversal regression passes.
- Terrain replacement could rebake a hidden scatter card using its zero-size transform. Bake its authored transform, restore hidden visibility, then retain the existing hide ranges. Hide/re-ground/unhide regression passes.
- Reed contact patches followed embedded roots below terrain. Sample the terrain surface independently with a 0.012 m contact offset. Root/contact regression passes; old contact InstancedMesh is disposed during rebatching.
- Relay cleanup could retain the scene hook after only a partial GLB set mounted. First owned material disposal now disposes every binding and restores the prior hook.
- Terminal lite/failed/empty mounts could search the scene every frame. The presentation now waits for the existing terrain mount receipt, discovers once, and unhooks on off/lite/failed/cancelled/empty mounts. The existing canvas's primary terrain state takes precedence over a stale landmark receipt after restart.

Final bounded follow-up: **P2 resolved; no concrete remaining issue.** TypeScript, the existing relay test and independent full/partial/empty/pending/terminal/cancelled lifecycle probes passed. Pending state made zero simulation reads and zero discovery calls; every terminal case restored the prior hook. Cancellation is observed on the next render; the discarded scene has no outside retention through this owner.

Raw evidence: `independent-review.log`, `review-followup.log`, `review-prompt.txt`, `review-followup.txt`, `final-unit.log`.
