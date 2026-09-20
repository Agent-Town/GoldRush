---
source: codex
project: Gold Rush
date: 2026-07-08
type: digest
---

# SS-02 Beat Table Report

Beat count: 21 authored story beats in `src/story/beats.ts`.

Implemented against registered SS-01 signals only:
- founding/town naming
- first board contract
- town growth sighting
- first wave-five pressure
- first building loss/repair pointer
- first victory/science pointer
- Prospector first contact, rung denial, and two promotion beats
- science first pick, mastery, shadow, ceiling, and captured rocket pointer
- per-contract board flavor for Dry Gulch, Twin Banks, Night Shift, and the Baron
- Steamworks site funding pointer

Flagged signal gaps:
- `science-threshold` is registered but not emitted, so science first-pick/mastery/shadow beats are authorable but not live.
- `rung-promotion` is registered but not emitted, so Prospector promotion ceremony lines are authorable but not live.
- `wave-complete` is registered but not emitted, so the wave-five beat is authorable but not live.
- Baron taunt/arrival/defeat migration needs a registered Baron event payload with contract/elite context. The current registered signals cannot safely distinguish Baron wave 20 from any other wave 20, so the hand-placed Baron cards remain until that signal seam is authorized.
- First repair credited needs a repair-complete/repair-spend signal. `building-lost` covers the repair prompt, not the credited repair.
- Steamworks each-stage and complete beats need megaproject-funded/stage-complete/complete signals. `stamp-site-found` covers the door/funding prompt only.
