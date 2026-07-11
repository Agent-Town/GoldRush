# Owner QA Script — the full walkthrough (2026-07-12)
Everything that shipped this week, ordered as one natural playthrough. Tags: ⭐ = never seen by human eyes (machine-green only — your look IS the gate) · 🔍 = a specific suspect to squint at · 💬 = answer in words, not pass/fail. Note your device+browser per section (desktop Chrome vs iPad matters). Anything odd: screenshot + one sentence = a corrective task.

## If you only have 20 minutes — the TOP TEN
1. ⭐ Fresh profile first-boot: greeting → glowing trail → tavern pulse → first launch (then NEVER again on that profile?)
2. ⭐ The hero in-run: female everywhere (walk/idle/attack), pan at her RIGHT hip in all directions, 8-frame smoothness
3. ⭐ Music: Pan Theme at the menu (starts after your first click?), E1 loop under a run — 💬 annoying after 20 min or good company?
4. ⭐ Build flow: open build menu → click the GROUND outside the menu — menu folds but placement mode STAYS, click places the building (the new collapse behavior)
5. ⭐ Pause → open Claim Ledger → read → close → 🔍 STILL PAUSED? (the old bug un-paused you)
6. ⭐ Die on purpose: 🔍 death screen's gold/kills EXACTLY match the HUD's last frame?
7. ⭐ Two browsers, Ride Together word: BOTH players place buildings + BOTH pan different seams AT THE SAME TIME (the week's headline)
8. ⭐ The editor on the iPad: `?editor&contract=e1-dry-gulch` — drag a zone corner, widen the pond, slide a spawn gate BY FINGER
9. ⭐ Night Shift: the pre-placed lantern posts — 🔍 do their arms face DIFFERENT directions now? (they all faced east for months)
10. 💬 The town: walk it for two minutes. Does it feel like a PLACE? What's the first thing that bothers you?

## A. BOOT & MENU (desktop first, then iPad)
- A1 ⭐ Title music starts on first gesture (autoplay law) — and the volume slider in Settings persists after reload?
- A2 🔍 With a suspended run: the CONTINUE button shows and enters the run? (This regressed once — 081 fixed it; confirm on YOUR real profile.)
- A3 Settings panel: tier selector (Full/Balanced/Lite) live-applies mid-run? Telemetry toggle present with the plain-words line?
- A4 💬 First impression of the menu after all changes — anything missing?

## B. THE TOWN (the week's biggest visual delta)
- B1 ⭐ The plaza: circular, painted sand, wagon-rut trails to every building, survey-peg empty plots?
- B2 ⭐ Facades: all six buildings rich-painted (tavern, claim office, schoolhouse, assay office, general store, chapel) — 💬 which facade is weakest?
- B3 ⭐ The prop ring: wagons/fences/cacti/trough/lanterns + THE PAN MONUMENT center — 💬 does the dry plinth read as "future fountain" or just "pole"?
- B4 ⭐ The living pass: townsfolk walk the TRAILS (not straight lines)? Youngsters loop the ring road? The Prospector idles near the monument? Dust motes at golden hour?
- B5 ⭐ The horizon: dunes beyond the plaza — or does the world still end at a cliff?
- B6 ⭐ Mei the newsie: on the plaza, barks a headline, hands you the Claim Herald page — 💬 does her sprite read as HER (cap, braid, satchel-left)?
- B7 ⭐ The whole cast walk8: tavernkeeper (BOTH profile directions distinct now), storekeeper, elder (gait reads aged?), youngster-m (lamp on ONE side), youngster-f
- B8 🔍 Town music vs run music transition — clean or jarring?

## C. THE CLAIM LEDGER + BOARD
- C1 Character pages: every discovered character has a QUOTE in-voice; 🔍 ZERO file paths/batch numbers/dates anywhere?
- C2 ⭐ The era page ("The Age of the Frontier") exists; NO future-era pages visible?
- C3 ⭐ Assay Office Records page (after ≥1 completed run): live tallies or the honest "wire is quiet" line?
- C4 Locked contracts in the LEDGER: teaser-only (the side-door leak is fixed) — try to find goals/rules for a locked contract ANYWHERE?
- C5 The catalog: each contract's OWN plate (💬 judge all six — which teases best?), swipe + dots + page memory, locked pages tease-only
- C6 ⭐ Research: node icons match in-game icons? Unlock reveal card on completing a research? 🔍 Sky-Rocket node LOCKED with the in-world Baron line until you've beaten him?

## D. IN-RUN (one full Claim run + one Night Shift)
- D1 ⭐ Shots: muzzle/tracer/impact follow terrain height (watch a turret on any slope)
- D2 ⭐ The E1 music loop: 💬 after 20 minutes — companion or wallpaper or annoyance?
- D3 The build collapse (top-ten #4) + rotate ghost (R) still works
- D4 ⭐ Night Shift lanterns: rotations vary (086) + relight flow + the dark still owns the edges
- D5 🔍 Wave 20 on your Mac at FULL tier: any hitching? (The perf branch is still undrained — this is the baseline.)
- D6 Die → tick-end consistency (top-ten #6) → Return to Town PRIMARY on every ending
- D7 Suspend mid-run (close tab) → reopen → Continue: 🔍 wave, gold, buildings, enemies all sane? Research state survived?
- D8 💬 The claim's river: continuous past both edges into the distance — done, or does it need another pass?

## E. MULTIPLAYER (desktop + iPad if possible)
- E1 Ride Together: open claim → word → second device joins — 💬 how long did the word entry take a non-you human?
- E2 ⭐ BOTH build simultaneously; BOTH pan DIFFERENT seams simultaneously (per-rider channels — the gold rate should feel ~2x)
- E3 🔍 Same seam: second rider gets turned away politely (one channel per node)?
- E4 Name chips, per-player camera, shared pot, shared end-screen credit
- E5 Invalid word: the friendly "claim's gone quiet" line (no freeze)?
- E6 💬 Kill the guest's tab mid-run: what does the host SEE? (Honest card expected; reconnect is still parked — the guest CANNOT rejoin. Confirm the failure is at least graceful.)

## F. THE EDITOR (the iPad is the real test)
- F1 ⭐ Inspector sliders live-rebuild the terrain
- F2 ⭐ The brush: raise/lower/smooth + paint water/zones — undo survives a RELOAD?
- F3 ⭐ Gizmos by touch: zone corner-drag, pond radius, spawn-gate slide — 💬 are the handles big enough for a thumb?
- F4 ⭐ Break a map on purpose (pond off the claim, gate off its edge): the rejection reads in-world and NOTHING half-applies?
- F5 Export → reimport → identical?
- F6 💬 Twenty minutes of free editing: what tool did you reach for that ISN'T there? (This answer designs ED-05/06/07.)

## G. DO NOT PRESS (yet)
- The schoolhouse's "Raise the Stamp Mill" action — it exists, it's armed, and it's THE CEREMONY. Confirm you can SEE it; press it only when we do it together.

## H. THE VERDICT BUNDLE (answer in one message, any format)
Device(s) used · the top-ten answers · every 💬 answer · screenshots of anything odd · and the one question that matters most: 💬 **would your kids, unprompted, play this again tomorrow?**
