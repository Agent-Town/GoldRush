#!/bin/bash
# cpl1 cure (in the chain after the merge): the shelf-launch fork declared as the owner's own desk row (F-CPL1-2).
G=$1
node scripts/attended/desk-row.cjs F-CPL1-2 "(2026-09-26, from the charter-press-locked-lands-1 landing, measured on base and branch): the Full Press shelf's Launch of a LOCKED charter (Twin Banks, the Dry Gulch on a fresh profile) still opens the Claim and briefs 'The Claim'.** The same fork you ruled (a) for the lever, on another surface. Recommendation: the shelf refuses the Launch of a locked charter with an honest line (a small slice, \`charter-shelf-locked-launch-1\`), authored on your word or after a quiet week; the two red rows it explains (\`cp03:64\`, \`press-edit-visibility:75\`) are red on main today for exactly this reason."
if ! git diff --quiet -- tasks/BACKLOG.md; then
  git add -- tasks/BACKLOG.md && git commit -q -m "drain: charter-press-locked-lands-1 — the shelf-launch fork declared as the owner's own desk row (F-CPL1-2)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure cpl1: desk row committed $(git rev-parse --short HEAD)" >> "$G" || { echo "cure cpl1: commit failed — needs hands" >> "$G"; exit 1; }
else echo "cure cpl1: desk row already present" >> "$G"; fi
