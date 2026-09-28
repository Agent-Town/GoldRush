# Native play proofs — run 3 findings and continuation

2026-09-25. **READY-FOR-GATES**, with failed native objectives explicitly held. Three-map batch: **no new full native proof**. Each map received two honest attempts, desktop then phone. The findings describe route and survival limits; none establishes that the map is impossible. Base `1a7c09a341f0f0aac4b14ddf65e5aead84a8ed4d`, lane `sol/map-art-campaign-2`. Closing at the expected three-to-six-map batch boundary; no quota refusal, disconnect or host-load failure is claimed.

| Map | Desktop / phone outcome | Finding |
| --- | --- | --- |
| Dust Flats | FAIL: death waves 2 / 4 | Haul-first delivered at 43.9 s, defense-first built two defenses but never dispatched. Land-Yacht not reached. [F-PP3-1](e4-dust-flats/finding.md). |
| Gusher County | FAIL: death waves 14 / 4 | Desktop missed north dispatch; phone completed all three deliveries by 94.4 s, using 27.631 fuel, then died funding first defense. [F-PP3-2](e4-gusher-county/finding.md). |
| Boneyard | FAIL: death waves 4 / 10 | Boiler-edge route failed desktop; phone stopped 1.112 units from road head, outside walking tolerance. Hitch unproved. Four phone defenses. [F-PP3-3](e4-boneyard/finding.md). |

All six new map rows pass boots/clean with zero console/page errors. None passes terminal/bank/Book/reload. Enabled full-objective assertions remain red; no partial result is called a full proof. No timeouts warranted a host-load rerun.

## Method and adaptations

Existing progressed-profile seed, staged contract launch, permitted timescale 4, real WASD/Space, upgrade keys and HUD clicks. Diagnostics remain read-only. Fuel and Hauler state are now retained in snapshots. Motor errands harvest the actual tar nodes and grade/call through the real confirm key. The driver verifies the published destination and retries up to five confirms after handling upgrades. This resolves the observed north-dispatch failure in the phone delivery route; the exact cause of the earlier missed input is not established.

Dust Flats first delivered before building; the retained version builds a turret/beacon first. Gusher grades each spoke, returns through camp, and uses the contract weather clock to avoid closed deliveries. Phone proved that route fuel-feasible. Boneyard's retained version funds a gate turret first and plans a southern boiler approach; the latter was NOT reached, so it is not accepted evidence. Its 0.8-unit road-head walking tolerance refused a 1.112-unit near approach; a future planned attempt can guide around it or accept an appropriate reachable point within the 2.5-unit objective reach. Do not label this a full-width traversal defect like Canyon Works.

The first desktop attempts used the earlier helper/openings from this run; the phone attempts used the adaptations above. Each row and log preserves the actual result. Existing native full-goal assertions are unchanged. No runtime, balance, contract, art-store, config or existing non-native-test edits.

## Preflight and host discipline

Clean lane, no ahead commits or uncommitted edits. No regenerated evidence discarded. `npm install --no-audit --no-fund` and preflight `npm run build` passed. Restored only npm-generated optional-platform libc metadata in package-lock and verified clean status before edits. The task referenced this run-3 note before it existed; read run-2 and run-1 handoffs instead.

Own Vite PID 33322 on port 5303 (stopped at closeout), one Playwright worker, desktop and phone sequential, trace off. No attended ports used. The TOUCH-ONLY firewall excludes vault writes; this artifact is the durable handoff.

## Commands and gates

Per-map command: `GR_NATIVE_PROOF=1 GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/native-proofs/<id>.spec.ts --project=<desktop-chrome|mobile-chrome> --workers=1 --reporter=line --output=artifacts/sol/play-proofs/run-3/<id>/<desktop|mobile>-results`. Six new-map commands exit 1 at the full-goal assertion. Their rows, terminal PNGs and failure contexts are retained per map.

- Final `npx tsc --noEmit`: PASS, exit 0 ([log](tsc-final.log)).
- `npx playwright test --list --workers=1`: PASS, exit 0, 3438 tests / 469 files ([log](default-list.log)). Collection alone does not establish skipping.
- Actual env-unset native invocation: **20 skipped, exit 0** ([log](gate-unset.log)).
- Shared-driver Incline regression: **PASS desktop/phone**, both wave 14, 575.73 / 591.33 s sim, carts 180/180 HP, all six cells, zero errors. Add `GR_NATIVE_RUN=3` to keep the unchanged Incline spec's evidence under run-3. [Desktop row](e2-incline/row-desktop-chrome.json) · [phone row](e2-incline/row-mobile-chrome.json).
- Existing unmodified `e2e/locked-win.spec.ts --grep 'The Claim card names'`, both projects, one worker, trace off: **2 passed, exit 0** ([log](adjacent.log)). This is a bounded adjacent check, not the full suite.
- Scope/rows/PNGs verification: PASS, [result](verification.json), rerunnable with `python3 artifacts/sol/play-proofs/run-3/verify.py`. Three status cells changed, second column only; one report section; all eight rows boot/clean; Incline full journey passes; all terminal PNGs and both Incline Book PNGs present. Direct visual inspection includes Dust Flats desktop death, Gusher phone death, Incline desktop secure and phone Book. No new map is credited as green.
- Final `npm run build`: **PASS, exit 0**, including TypeScript and asset checks ([log](build-final.log)); existing Vite/asset-diet warnings only.

## Commits

- `4f7dd4d7b` — Dust Flats attempts.
- `16fb3008b` — Gusher County attempts.
- `aa0bac166` — Boneyard attempts.
- Final gate evidence and handoff: containing closeout commit, hash in final response.

## REMAINING LIST IN ORDER

Current unresolved map first, then untouched maps in task order, then this run's exhausted findings. Next **untouched** map: e8-far-side. Do not repeat the two-attempt findings without a planned follow-up.

1. e4-boneyard — FAIL, F-PP3-3; two attempts exhausted.
2. e8-far-side.
3. e8-low-orbit.
4. e8-eclipse.
5. e9-dome-basin.
6. e9-seed-run.
7. e9-devils-alley.
8. e9-old-canal.
9. e10-last-claim.
10. e10-river.
11. e4-dust-flats — FAIL, F-PP3-1; two attempts exhausted.
12. e4-gusher-county — FAIL, F-PP3-2; two attempts exhausted.

Earlier campaign holds remain: Blackout Ridge F-PP2-1, Canyon Works F-PP2-2 (assigned map defect, do not retry), Fairground F-PP2-3, Baron F-PP1-1, Twin Banks F-PP1-2, Pressure Garden F-PP1-3. The latter holds stay reserved for the campaign's planned final attempt.
