# fix-town-variant-orientation — the town stands back up (lane-b; commit prefix "fix:") P0
CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-15 — OWNER LIVE SCREENSHOT: town buildings render TIPPED FLAT (lying on their backs on the pads) on the deployed build. Prime suspect: the era-variant loader mounts .e2/.e3 sibling GLBs with a wrong/missing rotation or up-axis vs the base files (e3-wide merged today). PROBE FIRST headed on E1/E2/E3 profiles; convict base-vs-variant transform difference; fix the LOADER (never Sol's assets); e2e: an upright probe (bbox height > width) per mounted building on all three era profiles. Firewall: era-switch loader + spec + artifacts.
END: READY-FOR-GATES + the conviction.
