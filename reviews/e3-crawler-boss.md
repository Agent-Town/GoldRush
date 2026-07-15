# Review — cw-03-crawler-boss (the Rival Dynamo Crawler)

**Slice/branch/tip:** cw-03-crawler-boss · lane/m3 (lane-a) · lane tip `2d05fc4c` (`runner(lane-a): cw-03-crawler-boss.md`)
**Base:** merge-base `96411db` (stale — main advanced ~30 commits since: e3-blackout-ridge, e5-01, publish-e3-mask-tables, wire-landmark-mounts, terrain3d, etc.)
**Merged to main:** s565 fire, drain commit below.
**Verdict:** APPROVED — merged.

## What it does
Adds the **Rival Dynamo Crawler**, E3's three-component boss (DRAIN-MAST / TRACKS / CAPACITOR-BANK), wired onto canyon-works' wave 14, playing the STORYBOOK four-act choreography:
- **Act 0 — the flicker:** two waves before arrival the wave-start horn falls silent and all lamps dim one heartbeat (LightRig `lampIntensityMult`, lantern-only flicker).
- **Act 1 — the shrinking shore:** drain-beam attaches to nearest pylon as a NEGATIVE consumer (six `crawler-drain` grid nodes, `online` only while active), pulling current and darkening coverage — kill the DRAIN-MAST to stop the drain.
- **Act 2 — the stand:** mast broken → capacitor area-bursts on a visible dial (`burstIntervalSeconds`/`burstDialSeconds`); break TRACKS to pin.
- **Act 3 — the gift-back:** capacitor cracks → town-wide +100% turret fire-rate for 10s and night-turned-noon (`overchargeActive` forces light phase `full`); **the wreck persists on the tile** (`restoreWreck` + `baronStandardPosition`).
New system `CrawlerBossSystem` (own `.group`, placeholder presentation — swap-ready seam for Sol's model per placeholder-first law). Ledger suppresses the crawler components as discoverable enemies (`variantId === 'dynamo_crawler'` guards). Failed CONNECT objective can no longer be converted into a boss victory (`objectiveAllowsSecure` guard in `onBaronDefeated`).

## Merge classification (stale base, both-moved handled by hand — `git merge`/cherry-pick are sandbox-gated for a headless fire)
- **New files (cp from lane, hash/`--no-index`-verified identical):** `src/systems/CrawlerBossSystem.ts` (404), `src/game/RunSuspend.ts` (89), `e2e/e3-crawler-boss.spec.ts` (275).
- **Lane-only modified, main==base (wholesale cp, verified disjoint from main):** `src/entities/pools.ts` (railcar-3d guards now `variantId === 'baron_railcar'` so the crawler variant never triggers railcar 3D — no new sprite batch, `lazy:true` memory concern N/A), `src/systems/WaveSystem.ts` (component-boss groupId + variantId passthrough), `src/world/LightRig.ts` (`lampIntensityMult`), `src/vite-env.d.ts`.
- **Both-moved (3-way by hand, content-anchored Edit):**
  - `src/game/Game.ts` — 15 lane hunks landed clean (all in regions main did not touch); the ONE genuine conflict was `contractPowerDefinition`'s consumer branch: main added the `storage` branch + `contractId` signature; lane changed the consumer's `online: true` → `online: node.role !== 'crawler-drain'`. Resolved to keep BOTH (storage branch retained, consumer `online` gated on role).
  - `src/game/Balance.ts` — `crawler{}` block added as sibling to main's `power.storage{}` (disjoint).
  - `src/meta/ContractFamilies.ts` — `'crawler-drain'` added to the consumer role enum (kept alongside main's `storage` union member); `variantId?`/`variantLabel?` added to `ContractBaronTwist` (main untouched here).
  - `assets/contracts/epoch-3-voltage/contracts.json` — main ADDED a new `e3-blackout-ridge` contract at the head of the array; lane MODIFIED the existing `e3-canyon-works` contract (second rail, six `crawler-drain` nodes+wires, the `baron` wave-14 block). Disjoint objects — both retained.

## Evidence (native, this fire)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (618ms) |
| contracts.json JSON.parse | OK |
| e3-crawler-boss.spec (own) | **8/8** both projects — four acts + wreck persist, act-ordering hold, run-suspend restore without revealing offstage baron, failed-CONNECT-≠-victory |
| e3-canyon-works.spec (host contract) | **4/4** both projects |
| e3-blackout-ridge.spec (secured-logic interaction) | **4/4** both projects — the `objectiveAllowsSecure`/`powerGrid` merge does not regress storage/no-connect contracts |
| e3-power-graph + e3-power-prototype | **20/20** both projects — flag-off/no-debug boot asserts zero graph work; drain-node topology deterministic |
| Console/page errors | zero (all suites assert clean boot, desktop + 390px mobile) |
| Act captures | `artifacts/e3-crawler-boss/{desktop,mobile}-chrome-act-{1-drain-beam,2-visible-dial,3-gift-back-wreck}.png` |

## Findings
- **F-CW03-1 (non-blocking, presentation):** crawler presentation is placeholder (tinted primitives / plate crops per the task's placeholder-first mandate). Sol's `plate-e3-boss-crawler` model wires in a later slice via the swap-ready seam, as the railcar's did. No action this slice.
- No blocking findings. Firewall clean: no power-graph internals rewritten (drain is a negative consumer via the existing grid-node API), no railcar/E2 touched, no Sol assets added.
