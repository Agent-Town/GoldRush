# Task lane-desk-upload-fit: the Complaints Desk learns to receive + fit (LANE-D, launch-gating, commit prefix "fix:")

You are Codex, implementer for Gold Rush (worktrees/lane-d).
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: the shipped desk (RF-03b: src/ surface + e2e/bug-office-desk.spec.ts) · the bug-office api's screenshot cap (~180KB base64 jpeg, server-enforced) · the house dialog/overlay sizing patterns · OWNER FINDINGS 2026-07-24 (verbatim): ① "the complain desk should allow to upload screenshots taken before from the level or other parts of the game. Not take on right there and then." ② "I have the feeling I can't see the full dialog?!" (evidence: the panel overflows the viewport bottom — submit below the fold, no scroll).

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green.

## Scope
1. UPLOAD FIRST-CLASS: "Hand the clerk a picture" — file picker + drag-drop (accept image/*), client-side downscale/re-encode to the api cap; the uploaded image REPLACES the moment as the attached evidence (thumbnail swaps). The auto-captured entry moment remains the DEFAULT when nothing is handed over; Retake stays. In-world copy ("Brought your own picture? The clerk prefers evidence from the scene of the trouble.").
2. THE DIALOG FITS: the desk panel constrains to the viewport (max-height + internal scroll of the form body; header/submit always visible — sticky footer with the submit/ticket area), verified at 1280×800, 1440×900, and 390×844 (mobile). No content below the fold ever again.
3. VERSION HONESTY (attended find, same walk): the diagnostics line's build field reports the REAL build variant (release builds stamp their tag/variant, e.g. "e1-preview"; dev says dev) — one datum, baked at build time.
4. Spec extensions (bug-office-desk.spec.ts): upload path round-trips (a fixture png attaches, submits, arrives at the api) · downscale respects the cap (oversize fixture accepted after re-encode) · the submit button is within the viewport at all three sizes (bounding-box assertion) · the version string matches the build variant · zero console, both projects.
## Firewall: desk UI + capture/upload plumbing + the version datum + specs. NO api changes (the cap is law), NO crafting surface changes.
END: READY-FOR-GATES + screenshots at the three viewports + the upload round-trip evidence.
