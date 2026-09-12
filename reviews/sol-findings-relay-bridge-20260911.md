# Relay Valley — the authored bridge cannot be placed

## F-RV-1 — the player cannot bridge the two ridge chains

**Confirmed, actual contract.** Relay Valley permits building only in four surveyed ridge zones. Every west/east pair of allowed placements is at least40 units apart; `Balance.e7Signal.linkRange` is28. A node cannot connect the two sides from any permitted ground. `Terrain.isBuildable(0,41)` is false, even though the same hypothetical bridge node connects both ridge pairs through the shipped signal graph.

This contradicts the existing design-locked requirement in `specs/epoch-saga/e7-signal-bundle.md` sectionC.1 S1: the dead gap remains unbridged until a correctly placed tower bridges it. The four-zone centres produce two disconnected pairs. Adding a hypothetical central node produces one connected graph.

The existing `e2e/e7-signal-systems.spec.ts:34` boots generic The Claim and probes `graphFor` with (-15,30),(0,30),(15,30). All three positions are outside the actual Relay Valley build zones. That passing test proves graph behavior, not the player's ability to construct the bridge. `reviews/card-truth-audit.md` marks the four-relay goal true without this actual placement proof.

**Evidence:** `artifacts/map-art-repairs-20260908/relay-bridge-audit-237/receipt.json`, `probe.mjs`, `probe.log`, and `actual-contract.png`. The audit reads the actual runtime placement predicate and graph; it does not place buildings, grant currency or claim native completion. The four original ridge grounds are buildable. The mathematical40>28 bound covers every permitted cross-ridge position, independently of line of sight.

**Next correction:** expose a small surveyed central bridge ground consistent with the already-ratified puzzle, retain the four ridge sites and existing ranges/fog/physics, mirror the contract in its mask and factory evidence, and verify an earned native bridge and patrol on desktop/mobile. Do not lower the authored goal to two independent pairs. The current playbook secure latch accepts one lit site and therefore does not prove the full four-relay/bridge objective.

## Native tape regression evidence

Focused original tests on Signal candidate233 are3 pass/1 fail. The mobile human-parity trace shows the library open before the final Tape Reel click, then hidden immediately after that click, followed by a request to click hidden Save Tape (`e2e/e7-playbook-rows.spec.ts:249`). This is a verified state mismatch in the test's action sequence. It does not yet prove the complete cause of desktop/mobile divergence; do not label the whole regression green. Existing specs remain unchanged. The intended native recording, drawer close, placement, drawer open and save route needs explicit state assertions.

## Verification238–244

The isolated correction passes earned desktop241/mobile242 construction and completed replay, with all four original sites lit. Both use the unchanged storage values from two earned Archive95 wins, with origin-only adaptation recorded. Factory240 preserves five mounted landmarks, exports the expected welded grid and reproduces byte-identically from saved source. Four native alias cases243 retain their original build rules. See `artifacts/map-art-repairs-20260908/relay-bridge-factory-240/verification.json`.14-file integration244 is applied; original build, inventory246 and integrated native245 desktop/mobile earned bridge patrol pass. The full integrated regression is running. Full native253/256 subsequently passes survival, Echo capture and bank/reload on desktop/mobile; visual acceptance and full regression remain open.

## F-RV-2 — placed relay artwork does not read as the concept’s relay installation

`src/game/Run3dPilot.ts:19` selects the same generic sentry-beacon GLB in every epoch. The current body is444 triangles and0.959m high. `assets/pilots/relay-tower-3d/relay-tower.glb` exists as a saved blend/GLB, but source search finds it only in terrain-factory preview code. It is9174 triangles,9.991m high and7.429m wide; direct substitution would exceed the run loader’s8000-triangle budget and dwarf the new4m ground. A game-sized, budgeted derivative should follow the existing asset process and be verified in the run. Do not change animations or simulate this with only a label.

Fresh image-only review of native241 confirms poor terrain/actor separation, dark trough detail, dominant cyan/cream graphics and indistinct local machinery. It cannot judge distant landmarks outside the close frame. These are open art findings, not a reversal of the bounded bridge mechanics pass.

## F-MC-1 — Archive medium-portrait guidance and objective text collide

Actual320×640 UI-only screenshot `map-controls-236/secured-contracts/e10-archive-world-320x640-secured.png` shows the Claim Stake panel covering Prospector guidance and0/3 restored overlapping West light. Fresh236 image review confirms both. The weapon/Tape controls are clear. The Game tuning bar is diagnostic-fixture occlusion, not native-game behavior. Trace the Archive and guidance layout owners before fixing these remaining collisions.

## Signal artwork follow-up247–252

247 is rejected: a3.566×2.338-unit derivative overlaps legally adjacent1×1 beacon placements. Independent code review and the capacity screenshot agree. Fresh image-only250 review also confirms inadequate material detail, glow, structural separation and ground readability. Native earned placement250 and saved-source gates pass only their bounded scopes. See signal-relay-model-247/report.md.

Isolated251 fits the existing footprint at0.966×0.633 units, keeps the original proportions/atlas, and gives the glass/signal UV regions a luminous material. Source repeat and saved-source export reproduce exactly. All12 renderer fixtures, typecheck, bundle and2 earned native252 checks pass. Independent code review finds no introduced regressions. Fresh252 image review keeps the dish/major-edge/contact readability unaccepted. No production integration is claimed. Large concept-landmark scale and whole-map art remain open.

## Current253–259 evidence

Full Relay Valley native253/256 passes all four sites, connected five-beacon chain, completed patrol, Echo capture,20waves/600s,bank95,exact score/jar reload and Town return with0errors. See relay-bridge-integration-244/full-native-253-256.json.

Contrast candidate254 improves readability but fails the inherited1024 atlas against props512.258 normalizes only the derivative through the existing Blender process; source/re-export, prospective guard, bundle, typecheck,12 renderer and2 native259 cases pass. Fresh259 review still rejects tower scale and architectural readability. Compact motifs are not full concept correspondence. No relay-art candidate is integrated.

## Archive263 candidate resolves F-MC-1 layout overlap

The isolated three-file correction passes the failing320x640 baseline,16 corrected layouts,8 disclosure cases, native265 touch entry/return, typecheck, bundle and independent code/visual review. Production still has the pre-correction layout while244 regression runs. Evidence: `artifacts/map-art-repairs-20260908/archive-mobile-layout-263/verification.json`.
