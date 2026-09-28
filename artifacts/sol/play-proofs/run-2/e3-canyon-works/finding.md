# F-PP2-2 — Canyon Works southern slope blocks the gallery economy

2026-09-25. FAIL desktop/phone after two honest attempts. Both boots and clean PASS, zero console/page errors; terminal, banking, Book return and reload remain unproved. Both enabled commands exit 1. Native WASD probes test the bridge and the flanking approaches. No engine calls, teleport, source/contract edits or gold grants.

Desktop probes at intended x=0,-24,-44 all stop at z=-7.878 to -7.879. Actual stop coordinates and subsequent nearest-seam retries are in the row notes. The player reaches wave 12 / 386.53 s with 86 HP, zero gold, zero paid buildings and CONNECT 0/2; the wave-8 deadline is failed. Both current seams remain north of the barrier at (-22,34) and (34,30). Banking and reload cannot be exercised without the terminal.

## Root cause and scope

The contract declares creekHeight=0.5, railHeight=-1, creekBlendStart=-8 and creekBlendEnd=-6, elevation cellSize=2. `src/sim/TileHeight.ts` computes that transition independently of x and takes a central difference with step 0.5. At z=-7 the slope magnitude is 1.03125; at z=-7.8 it is 0.422625. Both exceed `Balance.terrainSim.slopeMax=0.35`. `isTraversable` rejects the slope and `Terrain.sample` applies this rejection before its ford handling. The blocked band spans the 96-unit map width. The central ford cannot override it. [Static calculation](slope-calculation.json) records the values and explicitly distinguishes them from browser observations.

This evidence supports a contract/simulation traversal defect, rather than merely a poor beacon order. A fix would touch the forbidden contract or runtime surface, so none is made. The game continues past the permanently missed CONNECT deadline; the test stops after observing its failed latch. The bounded funding helper finishes its current wait before that check, which explains the later wave at the final board.

[Desktop row](row-desktop-chrome.json) · [desktop terminal](terminal-desktop-chrome.png) · [phone row](row-mobile-chrome.json) · [phone terminal](terminal-mobile-chrome.png).

Phone control: intended x=0,24,44 approaches all refused at approximately z=-7.88. End wave 12 / 389.07 s, 118 HP, zero gold and zero paid buildings, CONNECT 0/2 with deadline failed. The three exact stop positions are in the phone row notes. No host-load failure or timing rerun. Two attempts exhausted; continue to Fairground.
