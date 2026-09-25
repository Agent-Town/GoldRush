#!/bin/bash
# sf1 cure (in the chain after the merge): the owner item declared as its own desk row.
G=$1
node scripts/attended/desk-row.cjs F-SF1-7 "(2026-09-25, from the small-fixes-1 landing, optional): the leaked test fixtures on this Mac, listed and NOT deleted.** 250 \`s2673-desk-*\`, 78 \`s2677-stamp-*\` and 8,834 \`s2337-*\` directories (about 333 MB) in the system temp dir, left by guards that never cleaned up (all three cured or being cured); test fixtures, not factory history, but deletion is your word: \`ls \"\$TMPDIR\" | grep -cE '^s2673-desk-|^s2677-stamp-|^s2337-'\` counts them. The question the implementer left you (is RESEND_API_KEY set on Pages) is ANSWERED by the drain: it is not, and it does not need to be; see F-SF1-8." >> "$G" 2>&1
git add -- tasks/BACKLOG.md && git commit -q -m "drain: small-fixes-1 — the owner item declared as its own desk row (F-SF1-7: the leaked test fixtures listed, not deleted; the Pages-secret question answered by the API read, F-SF1-8)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure sf1: desk row committed $(git rev-parse --short HEAD)" >> "$G"
