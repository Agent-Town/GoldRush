# Town variant orientation conviction

- Headed probe: deployed build `86e2114f`, E1/E2/E3, `?town3dPilot=all&tier=full`.
- Result: all eight mounted buildings are upright in every era; zero console or page errors.
- Source probe: every base/E2/E3 GLB is grounded Y-up with zero root X/Z rotation. Variant bounds match their base bounds.
- Conviction: there is no base-versus-variant transform defect. The flat owner view came from the props-only facade mode (`town3dPilot=props`), which does not mount building GLBs.
- Guard added: the loader publishes each mounted building's world-up and bounds; the era-switch spec asserts `upY = 1` and `height > depth` for all eight buildings across E1/E2/E3.
- The requested literal `height > width` is not valid for the accepted Tavern, General Store, Assay Office, or Dynamo Hall, which are intentionally slightly wider than tall. `height > depth` catches a building lying on its back without rejecting valid geometry.

Gates: `npm run build` green; targeted desktop 6/6; targeted mobile 6/6; zero console/page errors.
