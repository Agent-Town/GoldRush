# Canyon Works mask coordinates

Game coordinates are `(x, z)` in a 96 × 112 authored footprint (`x = -48..48`, `z = -56..56`). Future terrain sculpture must preserve these code-owned masks.

| Mask | Coordinates |
|---|---|
| Water / reserved dam channel | `x -48..48`, `z -6.25..6.25`; deep channel `z -5..5`; bridge `x -4..4` |
| Sub-hall build yard | `x -36..36`, `z -52..-28` |
| West switchback build yard | `x -30..-8`, `z -26..-12` |
| East switchback build yard | `x 8..30`, `z -26..-12` |
| West gallery pads | `x -42..-16`, `z 7..40` |
| East gallery pads | `x 16..42`, `z 7..40` |
| PYLON SITES west | `(-12,-36)`, `(-24,-20)`, `(-28,8)`; radius `2.5` |
| PYLON SITES east | `(12,-36)`, `(24,-20)`, `(28,8)`; radius `2.5` |
| Sub-hall / loss stake | `(0,-44)` |
| Saboteur spawn gates | west `(-46,38)`, east `(46,38)` |
| General spawn edges | west, east, south |
| Gallery lamps | west `(-32,32)`, east `(32,32)` |
| Copper gallery anchors | `(-34,30)`, `(-22,34)`, `(22,34)`, `(34,30)` |

The dam channel is authored but no surge event is scheduled by CW-01.
