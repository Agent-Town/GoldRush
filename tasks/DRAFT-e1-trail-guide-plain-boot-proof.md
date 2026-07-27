> ⏸️ **OWNER-GATED — ON THE OWNER'S DESK, DO NOT QUEUE unasked (verified s1130 2026-07-27).** This is the **one genuinely unshipped E1-depth draft** (BACKLOG:1059). ⚠️ **Its own blocking sentence below — "Needs the RF-02 owner's read first" — is STALE: RF-02 has since shipped**, so the stated blocker no longer exists; what remains is simply an unasked go/hold. **And the task is ~40% narrower than this draft claims:** `e2e/trail-guide.spec.ts:113` and `:135` already prove the greenhorn offer on genuine plain boots. Genuinely unproven = the **first-run bark-beat track in a plain launch** (its test at `:42` boots with `?debug&nospawn&nolevel`). **One word — *go* or *hold* — and it is a lane task the same day.**

# DRAFT — PROVE THE TEACHING PATH IN A PLAIN BOOT (Trail Guide + greenhorn offer)
STATUS: DRAFT (E1-depth review session, 2026-07-25). Not queued. Needs the RF-02 owner's read first.
WHY: `reviews/e1-gameplay-depth.md` F-E1-2 (✓ VERIFIED, played). Mistake #10 shape — *"where does the PLAYER see this, in a plain boot?"*

## THE EVIDENCE
Across ~8 fresh-profile boots (brand-new user-data-dir each time) via `?debug&contract=<id>`, the harness logged every time:
`(no start menu on this door — contract door boots straight in)` — no start menu, no *"First time prospecting?"* greenhorn offer, no Trail Guide bark track. Difficulty still resolved correctly to `trail` (`src/game/ProfileStorage.ts:26` `DEFAULT_DIFFICULTY_PRESET = 'trail'`), so the difficulty default is sound; only the **teaching seam** is bypassed.

## WHAT IS AND IS NOT CLAIMED
- ✓ CLAIMED: the `?contract=` door bypasses the first-boot teaching seam.
- ✗ NOT CLAIMED: that the Trail Guide is broken in normal play. **The plain-boot path was never reached this session — it is UNVERIFIED, and that is precisely the hole this task fills.**

## WHY IT MATTERS FOR THE RELEASE
RF-02 (the Trail Guide) + the greenhorn offer are the release's whole answer to the first external tester's *"did not exactly understand what to do"*. The launch gate requires *"Trail Guide plays for a fresh profile"*. Two exposures:
1. **Testing exposure** — a `?contract=` link is the natural way to hand a tester one specific map; that tester gets the untaught experience and reports on a game the release does not ship.
2. **Release exposure** — on the fixed build `?debug` is compiled OUT (spec §"THE FRONTIER IS PHYSICAL" pt 2), so the door closes for players. The *gate* must therefore be proven on the plain boot, which no evidence currently covers.

## THE WORK
1. **Prove it**: an e2e on a genuinely fresh profile, **no `?debug`, no `?contract=`** — assert in order: start menu renders → greenhorn offer present with its copy → declining yields `difficultyPreset === 'trail'` → first-run Trail Guide beats fire (assert the first 3-4 beat ids, each once, dismissible) → the first claim is launchable from the board. Screenshots at each beat, desktop **and** 390 px.
2. **Then decide** (owner/attended, not the runner): should the `?contract=` door replay the Trail Guide for a profile that has never seen it? Arguments both ways — testers want the map fast; the gate wants the taught path exercised. **Do not implement a behaviour change in this task**; land the proof, then put the fork on the owner's desk.

## HOW TO VERIFY
The spec passes on a clean profile in both projects, zero console/page errors, and its screenshots show the greenhorn offer and at least three distinct Trail Guide beats. Re-running it on a profile that has already been taught shows the beats do NOT repeat (the "each once" law).

## FIREWALL
TOUCH-ONLY: the new e2e spec + its fixtures/screenshots.
NO: `src/` · assets · Balance · contracts · the RF-02 bark content itself.
