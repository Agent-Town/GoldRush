#!/bin/bash
G=$1
node scripts/attended/desk-row.cjs F-KV2-6 "(2026-09-25, from the kv-counters-to-ledger-2 landing): does pages.dev keep a standings surface at all?** Once \`STANDINGS_CANONICAL_ORIGIN\` is set on the ops evening the Pages copy answers a no-store 308 to agenttown.app and writes nothing; deleting the handler outright is a further step that removes the preview deployments' standings copy too. One word: keep the redirect (recommended) or delete the copy." >> "$G" 2>&1
git add -- tasks/BACKLOG.md && git commit -q -m "drain: kv-counters-to-ledger-2 — the owner decision declared as its own desk row (F-KV2-6: the pages.dev standings surface)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure kv2: desk row committed $(git rev-parse --short HEAD)" >> "$G"
