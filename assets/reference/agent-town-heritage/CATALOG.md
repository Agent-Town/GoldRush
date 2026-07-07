# Agent Town Heritage Catalog

Surveyed 233 image candidates: Portal `public/images` root 5, district scenes 76, district logos 18, `public/assets` 27, ERC image cache 1, GPT image drops 56, frontier-ledger branch Brand kit images 12, `agent-town-assets/` 38. Kept/imported 26 files. Contact sheets used for visual review live in `artifacts/heritage-mine/contact-sheets/`.

## Imported Keepers

| Import | Source | Depicts | Day/night pairing | Style class | Verdict | Reason |
|---|---|---|---|---|---|---|
| `atlas-map-bg.jpg` | `/Users/robin/Projects/Portal/public/images/atlas-map-bg.jpg` | parchment atlas map background | n/a | texture | direct-reuse-candidate | Fits ledger/map UI surfaces with no processing. |
| `leather-bg.jpg` | `/Users/robin/Projects/Portal/public/images/leather-bg.jpg` | dark embossed leather texture | n/a | texture | direct-reuse-candidate | Useful for restrained trim or modal backing. |
| `parchment-bg.jpg` | `/Users/robin/Projects/Portal/public/images/parchment-bg.jpg` | warm parchment panel field | n/a | texture | direct-reuse-candidate | Direct match for reading planes and cards. |
| `wood-header.jpg` | `/Users/robin/Projects/Portal/public/images/wood-header.jpg` | plank wood strip texture | n/a | texture | direct-reuse-candidate | Direct header/button/rail material. |
| `town-bg.jpeg` | `/Users/robin/Projects/Portal/public/images/town-bg.jpeg` | original Agent Town square with wagons and storefronts | pairs loosely with `home-settlement-diorama.png` | district-scene | landing-brand | Best original town-square signal for `agenttown.app`. |
| `avalanche-district-day.png` | `/Users/robin/Projects/Portal/public/images/districts_style_images/Avalanche_1.png` | mountain frontier district, warm tower, day | day half of `avalanche-district-*` | district-scene | reference-conditioning | Strong place silhouette; too cinematic for direct game art. |
| `avalanche-district-night.png` | `/Users/robin/Projects/Portal/public/images/districts_style_images/Avalanche_2.png` | mountain frontier district, lit rails, night | night half of `avalanche-district-*` | district-scene | reference-conditioning | Keeps the paired lighting vocabulary for future prompts. |
| `gnosis-district-day.png` | `/Users/robin/Projects/Portal/public/images/districts_style_images/gnosis_1.png` | civic tower town square, daylight | day half of `gnosis-district-*` | district-scene | landing-brand | Good civic-square reference with teal lamps. |
| `gnosis-district-night.png` | `/Users/robin/Projects/Portal/public/images/districts_style_images/gnosis_2.png` | civic tower town square, evening lights | night half of `gnosis-district-*` | district-scene | landing-brand | Paired evening treatment for landing sections. |
| `farm-plot-isometric.png` | `/Users/robin/Projects/Portal/public/assets/icons/agent-town/farm-plot-gpt-image-2-v1.png` | fenced crop plot | n/a | iso-building | direct-reuse-candidate | Small, clean, nonviolent, and already cutout-like. |
| `lumber-camp-isometric.png` | `/Users/robin/Projects/Portal/public/assets/icons/agent-town/lumber-camp-gpt-image-2-v1.png` | saw frame and timber pile | n/a | iso-building | direct-reuse-candidate | Direct fit for wood/lumber UI or town references. |
| `quarry-isometric.png` | `/Users/robin/Projects/Portal/public/assets/icons/agent-town/quarry-gpt-image-2-v1.png` | stone quarry mine opening | n/a | iso-building | reference-conditioning | Strong mine silhouette, but style is cleaner than Gold Rush ledger art. |
| `research-lodge-isometric.png` | `/Users/robin/Projects/Portal/public/assets/icons/agent-town/research-lodge-gpt-image-2-v1.png` | blue-brass research building | n/a | iso-building | reference-conditioning | Useful for teal-brass agent-tech building prompts. |
| `hq-command-isometric.png` | `/Users/robin/Projects/Portal/public/assets/icons/agent-town/hq-command-gpt-image-2-v1.png` | command hall with banner and lantern | n/a | iso-building | reference-conditioning | Good civic HQ shape; not Gold Rush weathered enough for direct use. |
| `expedition-board-isometric.png` | `/Users/robin/Projects/Portal/public/assets/icons/agent-town/expedition-board-gpt-image-2-v1.png` | map board with lantern and compass | n/a | iso-building | direct-reuse-candidate | Very close to ledger UI and contract-board needs. |
| `settler-convoy-wagon.png` | `/Users/robin/Projects/Portal/public/assets/icons/agent-town/settler-convoy-gpt-image-2-v1.png` | covered supply wagon | n/a | iso-building | reference-conditioning | Strong settlement motif; avoid leaning into horse/cowboy genre in game use. |
| `site-plan-map.png` | `/Users/robin/Projects/Portal/public/assets/icons/agent-town/site-plan-gpt-image-2-v1.png` | rolled site plan with teal pin | n/a | texture | direct-reuse-candidate | Excellent assay/plan/contract icon reference. |
| `construction-scaffold-state.png` | `/Users/robin/Projects/Portal/tmp/gpt-image-drops/building-state-constructing-v1-b.png` | timber construction scaffold | pairs with output/upgrading states in source | iso-building | direct-reuse-candidate | Clean construction-state prop with no canon issues. |
| `home-settlement-diorama.png` | `/Users/robin/Projects/Portal/tmp/gpt-image-drops/home-settlement-diorama-v1-a.png` | sepia town block diorama | pairs loosely with `town-bg.jpeg` | district-scene | landing-brand | Compact original town reference for landing or prompt conditioning. |
| `outpost-camp-isometric.png` | `/Users/robin/Projects/Portal/tmp/gpt-image-drops/outpost-camp-v1-a.png` | tent camp and palisade outpost | n/a | iso-building | reference-conditioning | Good camp layout; gray backdrop means reference, not direct game art. |
| `town-cluster-isometric.png` | `/Users/robin/Projects/Portal/tmp/gpt-image-drops/town-cluster-v1-a.png` | isometric frontier town cluster | n/a | district-scene | reference-conditioning | Best compact settlement cluster for future town prompts. |
| `terrain-underlay-parchment.png` | `/Users/robin/Projects/Portal/tmp/gpt-image-drops/terrain-underlay-v2-b.png` | parchment terrain underlay | n/a | texture | direct-reuse-candidate | Quiet full-field texture; useful for landing/map surfaces. |
| `wagon-shop-day.png` | `/Users/robin/Projects/agent-town-assets/983BAF47-8FB4-4FF6-ACEC-AA0FA191FB5C.PNG` | covered wagon shop exterior, day | day half of `wagon-shop-*` | iso-building | reference-conditioning | Excellent building form, but pixel heritage not direct game style. |
| `wagon-shop-night.png` | `/Users/robin/Projects/agent-town-assets/5B04CA72-ED13-42CF-801B-E912F42D606B.PNG` | covered wagon shop exterior, lantern-lit night | night half of `wagon-shop-*` | iso-building | reference-conditioning | Same form as day keeper with valuable night lighting. |
| `agent-town-gate-logo.jpg` | `git:claude/frontier-ledger-assets-2026-06-10:public/logo.jpg` | Agent Town gate logo/mascot mark | n/a | brand | landing-brand | Best revival mark for `agenttown.app`; heritage-only for Gold Rush. |
| `default-homesteader-avatar.png` | `git:claude/frontier-ledger-assets-2026-06-10:public/brand-kit/default_user_avatar.png` | default homesteader avatar | n/a | chibi-character | landing-brand | Useful as original avatar reference; too polished/chibi for in-game sprites. |

## Skipped Survey Buckets

| Source bucket | Count | Verdict | Reason |
|---|---:|---|---|
| `public/images/districts_style_images/logos/` | 18 | skip | Chain logos are third-party marks, not Agent Town or Gold Rush art. |
| Most district scene variants | 72 of 76 | skip | Strong cyber/modern city language, saturated neon, or duplicate formats. |
| ERC cache data URI | 1 | skip | 1x1 placeholder image; no usable visual content. |
| GPT medallion/frontier rider/person drops | 24 | skip | Firearms, horses, or genre-forward cowboy signals conflict with canon guardrails. |
| Remaining loose `agent-town-assets/` | 36 of 38 | skip | Mostly chibi/pixel, character sheets, food props, duplicate collages, or firearm-forward figures. |
| Remaining branch Brand kit images | 10 of 12 | skip | Valuable brand history, but not top import candidates for this slice. |

Direct-reuse shortlist: `parchment-bg.jpg`, `wood-header.jpg`, `atlas-map-bg.jpg`, `farm-plot-isometric.png`, `lumber-camp-isometric.png`, `expedition-board-isometric.png`, `construction-scaffold-state.png`, `site-plan-map.png`, `terrain-underlay-parchment.png`.
