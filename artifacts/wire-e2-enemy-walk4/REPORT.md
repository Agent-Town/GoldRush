# E2 enemy walk4 wiring

- Rail Tough: candidate A selected — stable company-coat identity, readable tool silhouette, and the cleaner four-phase gait; B was rear-profile heavy. 16/16 cells, keyed 73.4%, average height 282.8px, footline 392–402px.
- Steam Wrecker: candidate A selected — stable amber eye and wrench arms, consistent machine identity, and cleaner gait; B was rear-profile heavy. 16/16 cells, keyed 68.2%, average height 244.1px, footline 374–380px.
- Coal Thief: candidate A selected — stable left-shoulder sack, low thief silhouette, and cleaner gait; B was rear-profile heavy. 16/16 cells, keyed 70.0%, average height 259.0px, footline 378–393px.

All selected sheets passed the visual firewall: no mirrors, repeated gait frames, letters, firearms, or gore; clean `#ff00ff` key. Runtime uses three E2-only asset slots and the existing `SpriteAnimator`; E1 stays on `char.bandit_base` walk8.

Gates: `npx tsc --noEmit`; `npm run build`; focused spec 2/2 desktop/mobile; untouched adjacent suites 20/20 desktop/mobile; zero console/page errors. Direction evidence: `desktop-chrome-{south,west,east,north}.png` and `mobile-chrome-{south,west,east,north}.png`.
