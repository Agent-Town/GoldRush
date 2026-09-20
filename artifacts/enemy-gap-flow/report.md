---
slice: fix-enemy-pathing-wrecker-read-2
date: 2026-07-13
---

# Enemy gap-flow evidence

- `Balance.wreck.gnawMult = 0.25`: ordinary enemies deal 2 damage per 0.9s gnaw hit versus the wrecker's base 8. This slightly weakens fully sealed walls; owner playtest may veto or retune the multiplier.
- Gap scenario: all 8 non-wreckers reached the hero side in 10 simulated seconds with `stuckWatchdogTrips: 0` on desktop and mobile.
- Finite-line corrective: the lone runner reached `(0.03, 11.98)` beside the hero at `(0, 12)` after 10 simulated seconds with `stuckWatchdogTrips: 0` and `gnawing: 0` on both projects. The route graph now keeps only the nearest blocker in each direction, so clearance-sized enclosure gaps stay sealed without hiding a dense line's real endpoints.
- Enclosure scenario: `stuckWatchdogTrips: 1`, `gnawing: 1`, and the selected palisade fell from 60 HP to 56 HP before the scripted breach; `gnawing` returned to 0 on the next simulation step.
- Wrecker scenario: the Steam Wrecker ignored the gap, damaged the nearest palisade, and exposed the shared rust marker (`#a0522d`).
- Frame series: `*-gap-{0s,5s,10s}.png`; `*-finite-line-10s.png`, breach, and wrecker-tell captures sit beside them.
- Review regressions: three-segment, successive, and connected U-shaped open walls route around their ends without damage; active gnaw/watchdog state survives strict suspend normalization plus reconnect restore.

## Supporting surfaces

- `Game.ts` and `vite-env.d.ts` expose/type the requested diagnostics; `registry.ts` owns the requested ledger copy.
- `RunSuspend.ts` preserves the new committed route, watchdog, and gnaw fields so suspend/reconnect cannot reset the watchdog or silently change a restored enemy's behavior. This is the only state-lifecycle addition beyond the steering firewall.

## Gates

- `npm run build`: green.
- `enemy-gap-flow.spec.ts`: all 16 desktop + mobile cases green with zero captured console/page errors.
- `m2-01-build-menu.spec.ts`: 14/14 green across desktop + mobile, including the formerly failing finite-line guard.
- `task-025`, `m1-01`, and `e2-escort-mode`: 24/24 green across desktop + mobile.
- Baron batteries: 10 stale assertions reproduced byte-for-byte on clean base `02db6ba2` (live Baron 240x HP / `science-complete+2-secured` versus old 160x / `science-complete` expectations, plus the existing claim-sprite fallback load race); the remaining 41 passed and 1 skipped across desktop + mobile. Existing specs were not edited.
