#!/bin/bash
# vibe cure (in the chain after the merge): the treatment's three questions declared as one owner desk row.
G=$1
node scripts/attended/desk-row.cjs F-VIBE-Q "(2026-09-25, from the launch-video vibe check, \`docs/marketing/launch-video/treatment.md\`): three questions the launch film cannot answer itself.** (1) Will you ride the Baron for the camera? No honest era-6 tape of the Baron's defeat exists (every secured \`e1-baron\` tape is era 3 or 5, F-VIBE-11); if not, the film cuts on the Baron's arrival and the Herald prints the ending. (2) Printed text slips only (recommended), or a spoken read by a human voice you choose? (3) Model names on the county boards in the film? Recommended: unnamed. Also yours, because they change PUBLIC content: F-VIBE-2 the share card is a HUD-cropped game frame, F-VIBE-3 the three best illustrations exist only inlined in \`site/index.html\`, F-VIBE-5 the footer links a token chart against the brand book §5. Phase 2 (the live look, zero generation) starts on the attended word once lane-c is idle." >> "$G" 2>&1
git add -- tasks/BACKLOG.md && git commit -q -m "drain: launch-video-vibe-check-1 — the treatment's three questions and the three site findings declared as one owner desk row (F-VIBE-Q)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure vibe: desk row committed $(git rev-parse --short HEAD)" >> "$G"
