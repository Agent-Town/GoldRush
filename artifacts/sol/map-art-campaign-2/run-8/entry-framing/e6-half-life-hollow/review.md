# Half-Life Hollow — run 8: entry, 2026-09-22

**FIXED offscreen entry / HELD full plate composition.** Both contract copies declare `south-countdown-gate`: the large clock gate leads the plate foreground and marks the timed crossing into the hollow. The actual mount at (0,−59) is reachable from the unchanged hero start (0,12) with the original fixed camera offset, FOV and zoom.

| View | Rest body pixels | Peak body pixels | Return body pixels | Observed time in frame |
| --- | ---: | ---: | ---: | --- |
| 1280 | 0 | 26,671 | 0 | 1.700–1.816 s |
| 390 | 0 | 29,787 | 0 | 1.684–1.791 s |

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Counts](metrics.json) · [Ordinary captures](captures.json) · [Separate uninterrupted timing pass](duration.json). Both viewports have zero console/page errors. Captures retain ordinary HUD/story layers, seed `map-art-campaign-2`, DPR1 and no debug/test hook. Read-only camera instrumentation and the separate frozen depth census use the method in the Glow Mesa review. The before arm suppresses only the new entry hook. The 2.5 s authored window eases 0.7 s in and out around a 1.1 s hold, then returns to the live hero.

The simple clock frame remains less architectural than the plate's gate. The close view exposes the existing straight terrain/continuation seam behind it, and the phone claim panel overlaps its lower body. The central ochre/teal slabs, suspended-crossing presentation, full ravine depth and HUD composition remain HELD with the Game/crossing, layout/art and UI owners. This camera pass neither alters nor conceals those limitations. The gate is not held as unreachable.

Only `entryLandmark` differs in the two JSONs; all prior fields and all model/atlas/blend bytes are unchanged ([invariants](invariants.json)). The existing `hollow_crossing` manifest rule gains one sentence naming the mount. All other fields across 42 manifests remain byte-identical. This map adds no source-code change; it uses the fixed-offset ease verified in Far Side. Existing replay, simulation, input, collision, stations and view schema remain untouched.

Engine `b3a86513d6b6511e4fa3049104211051d4cddac7fdda6c314a52144cdb98a288` → `a8afc11f313a5bc6567deac76bb40da24aab1ff19d7f935146229510289ad7c1`; pin drain-owned. Store `d8938178a7464c637a79bca81d5f788bc8ad954d`, pushed on `astra/entry-framing`.

TypeScript/default/full/E1 builds pass; E1 payload **34,309,830 B**. Scoped guards **61/61**, named **3/3**, own crossing/roster/census **20/20** pass, including the ordinary mounted-terrain boot. Shared loading/reload proofs from Far Side apply unchanged; this map modifies metadata only. [Builds](build-gates.json) · [Guards](guards-gates.json) · [Own tests](e2e-own.json). READY-FOR-GATES.
