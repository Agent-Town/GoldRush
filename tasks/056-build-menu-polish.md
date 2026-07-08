# Task 056: build-menu polish — every card has an icon, every pick explains itself (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; the build menu implementation + `buildableDefs` (src/game/buildables — where icons/names live; the ASSAY OFFICE entry lacks an icon while the other five have them — find how their icons are wired and why assay's isn't); the assay office's in-game sprite (processed art EXISTS — the menu icon is likely a missing crop/wiring, not missing art); the world-info-notes task (lane-c, in flight — buildable blurbs LIVE IN buildableDefs as the one source; that task reads them for world notes; coordinate, don't duplicate). Pre-flight: zero staged/modified tracked files under src/ e2e/ configs — EXEMPT artifacts/ logs/ reviews/shots docs/ tasks/ (list briefly, proceed). SUPERSEDES ladder item 011 (build-menu-blurbs — this is its refreshed form).

## Owner findings (2026-07-08 ~07:26, screenshot)
1. "Assay office has no icon" — slot 6 renders text-only beside five iconed cards.
2. "The tooltips for the buildings are not yet shown in the top" — no description surface: the player picks buildings by name and price alone.

## Scope
1. **The assay icon**: wire the assay office menu icon from its existing processed sprite (same crop/manner as the other five; if their icons come from dedicated assets and assay's is genuinely absent, derive the icon crop from the building sprite and note it for a future art-batch entry — placeholder-first, never text-only).
2. **`blurb` per buildableDef** (ledger voice, legibility law — what it does + its key number): Sentry Beacon ("Lights the dark and slows what it touches — radius Xwu") · Palisade ("Timber that holds. Bandits break it before you.") · Sluice Works ("Works the river for you — Xg per cycle beside water") · Stockpile Yard ("Holds +X gold above the pan cap") · Signal Turret ("Spark bolts, line-of-sight, Xwu range") · Assay Office ("Write orders; the town's craftsmen answer. One per claim."). Numbers read from Balance at render (never hardcoded).
3. **The blurb surface**: the selected/hovered card's blurb renders in a fixed strip at the TOP of the build menu (the owner's expected location) — updates on selection/hover, keyboard (1–6) included; tier'd buildings append their current-tier effect line (from the BT data).
4. Mobile: the strip readable at 390px; tap = select shows blurb (no hover dependency).

## Firewall
Touch ONLY: buildableDefs (icon wiring + blurb data), the build-menu UI strip, e2e, artifacts. NO build mechanics/costs/caps changes, NO Balance value changes (reads only), NO world-info-notes work (it consumes the defs later).

## Self-check
tsc/build; extended m2-01-build-menu spec: all SIX cards have icons (asserted by asset-state) · blurb strip shows the selected buildable's text incl. a Balance-read number (2 sampled) · keyboard + tap paths · 390px; m2-01 + m1-01 + task-025 unmodified green both projects; zero console errors; screenshots (the menu with all icons + blurb strip, 390px) into artifacts/056/. End: READY-FOR-GATES + whether assay's icon was missing art or missing wiring + results.
