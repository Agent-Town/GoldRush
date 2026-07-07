# Finding: ③ E2 science-tree is architecturally BLOCKED — not a Silent No-Op

**Slice:** WP-E2 ③ `tasks/lane-a-e2-science-tree.md` (lane-a / lane/m3, prefix `e2:`)
**Verdict:** 🔴 BLOCKED — needs a predecessor engine slice. NOT re-queueable as scoped. NOT a lost/Silent No-Op.
**Session:** s178 fire (2026-07-07T23:12Z). Root-causes two consecutive no-op runs (043551 s177, 055749 s178).

## What happened
③ was queued twice and produced ZERO commits on lane/m3 both times. s176/s177 suspected a "Silent No-Op" (§5 #1) or a reset-lost commit. s177 re-queued it once pressure ② merged (correct "changed premise" reasoning). It no-op'd AGAIN. s178 read the runner log and the code, and root-caused it.

Both runs did the SAME correct thing: `git checkout -B lane/m3 main`, `npm install`, `npm run build` (green), then **refused to edit** and wrote a blocker digest. Codex's own words (run log `tasks/runs/20260708-055749-lane-a-lane-a-e2-science-tree.md.log`):
> "Not READY-FOR-GATES. I reset lane/m3 to current main … I did not edit repo files or commit, because the task firewall says to flag this exact case instead of changing ResearchTree/chart code. Blocker: `loadEpoch()` still does not expose research-tree nodes."

This is **reject-don't-stretch working correctly** (§5 #14, canon "generator proposes, contract disposes"). The refusal is the right outcome; the task premise is wrong.

## Verified root cause (✓ read the code, not the log)
③'s firewall: *"Touch ONLY epoch-2 manifest science data, e2e, artifacts. NO ResearchTree engine changes (data through the socket)."* It assumes the SCI-04 epoch socket can carry science nodes. It cannot:

- **`EpochBundle` has no research-node channel.** `loadEpoch()` (`src/meta/ContractFamilies.ts:381–396`) returns `{ tile, devTiles, megaprojects, resources, claimOffice, contracts, families, gates, masteryConversions, synergyCards, contractTiers }` — no science/research field. Manifest science data has nowhere to live.
- **The research node list is a static const.** `src/meta/ResearchTree.ts:70 RESEARCH_NODES` is a hardcoded Frontier-only array. It never reads epoch manifests.
- **The chart renders only that static list.** `src/ui/ResearchChart.ts:2` imports `RESEARCH_NODES`; line 65 filters `RESEARCH_NODES` by branch to draw the silhouette. It never calls `loadEpoch()` for nodes.

Therefore manifest-only E2 nodes = dead data no consumer reads; the locked Steamworks silhouette can never show them, and the debug epoch override can never unlock an E2 tree — exactly as ③'s "flag, don't hack" clause anticipated.

## Recommended fix (attended — a design fork, NOT fire-authorable)
Author a predecessor **`e2-science-socket`** ENGINE slice, then re-scope ③ to depend on it:
1. Add a typed research-nodes part to `EpochManifest`/`EpochBundle` so `loadEpoch(id)` exposes epoch-declared science nodes (shape mirroring `ResearchNode`: id, branch, cost, prereqs, effect-first copy).
2. Make `ResearchChart.ts` (and `ResearchTree.ts` gating) merge the static Frontier `RESEARCH_NODES` with epoch-declared nodes for the **locked-epoch silhouette** — greyed, "awaits the town", not purchasable while epoch-1 active.
3. Decide the design fork this raises: does Frontier `RESEARCH_NODES` itself migrate to epoch-1 manifest data (uniform), or stays static + epochs add a supplementary channel (minimal)? **Owner/attended call** — it sets the science-dimension socket contract for all 10 epochs.

Until that slice exists and merges, **③ must not be re-queued** — it is proven to no-op. Flagged **PIPELINE-DRY: lane-a** in STATUS + BACKLOG line 84.

## Housekeeping done this fire
- Both no-op done-moves moved out of `tasks/done/` (they falsely implied success) → `tasks/failed/noop-s177-e2-science-tree-safedupe-stop.md`, `tasks/failed/noop-s178-e2-science-tree-socket-blocked.md`.
- BACKLOG line 84 ③ entry rewritten from "likely Silent No-Op / re-queue" to this verified blocker.
- No code changed; no drain performed (correctly — there was nothing to drain).
