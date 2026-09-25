#!/bin/bash
# sf1 cure (in the chain after the merge): the owner item declared as its own desk row.
G=$1
node scripts/attended/desk-row.cjs F-SF1-7 "(2026-09-25, from the small-fixes-1 landing): confirm \`RESEND_API_KEY\` is set in the Pages PRODUCTION and PREVIEW environments.** The bug office and the accounts handler refuse localhost origins only when it is set (an unconfigured setup still admits localhost for local play); the implementer could not check without a live request. One look in the Pages dashboard. Optional, same breath: the leaked temp directories on this Mac (250 \`s2673-desk-*\`, 78 \`s2677-stamp-*\`, 8,834 \`s2337-*\`, about 333 MB, all test fixtures, none factory history) are listed and NOT deleted; deletion is your word." >> "$G" 2>&1
git add -- tasks/BACKLOG.md && git commit -q -m "drain: small-fixes-1 — the owner item declared as its own desk row (F-SF1-7: the Pages secret the localhost refusals key on; the leaked test fixtures listed, not deleted)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure sf1: desk row committed $(git rev-parse --short HEAD)" >> "$G"
