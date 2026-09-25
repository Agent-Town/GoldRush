#!/bin/bash
G=$1
node scripts/attended/desk-row.cjs F-SGA1-2 "(2026-09-25, from the same-game-audit-verbs-1 landing, measured): in the bench sim a HARVEST order out-earns a human's dispatch when two \`pan_legend\` stacks are held.** The receipt keeps the Prospector on the seam 0.9 s and in the harness the Prospector is the passive panner, so the order earns one extra passive pan: double the dispatch's gold on 41 of 41 boards with a seam; equal with one stack or none; reach unaffected (the dispatch pairing stands). Decide whether the bench sim should pan like the browser (a harness change) or the asymmetry is accepted and documented." >> "$G" 2>&1
git add -- tasks/BACKLOG.md && git commit -q -m "drain: same-game-audit-verbs-1 — the bench's harvest-versus-dispatch asymmetry declared as an owner desk row (F-SGA1-2)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure sga1: desk row committed $(git rev-parse --short HEAD)" >> "$G"
