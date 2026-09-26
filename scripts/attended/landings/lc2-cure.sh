#!/bin/bash
# lc2 cure (in the chain after the merge): the two owner decisions declared as their own desk rows BEFORE any deploy (F-LC2-5, F-LC2-6).
G=$1
node scripts/attended/desk-row.cjs F-LC2-5 "(2026-09-26, from the localhost-cors-2 landing): after this slice deploys, a game served locally is refused by every live county door.** ✅ RULED 2026-09-26, owner verbatim: \"B5 - deploy\". The client always targets the live origin (\`src/app/GameApi.ts:5\`, agenttown.app), so a vite dev build on localhost loses standings, accounts and Ride Together against production (the droplet's accounts door already refused it); this is F-SEC2-2 made effective. Local development runs its own functions with \`wrangler pages dev\` and a \`.dev.vars\` carrying \`ALLOW_LOCALHOST_ORIGINS=1\` (\`.dev.vars.example\`), and points accounts at them with \`VITE_ACCOUNTS_API_URL\`. Deployed by this landing."
sed -i '' 's/^🔺 \(\*\*F-LC2-5 \)/✅ \1/' tasks/BACKLOG.md
node scripts/attended/desk-row.cjs F-LC2-6 "(2026-09-26, from the localhost-cors-2 landing): should \`.env.local\` keep reaching local wrangler servers in the primary checkout?** Wrangler loads \`.dev.vars\` OR \`.env.local\`, not both: creating \`.dev.vars\` in the checkout (the switch for local functions) stops the provider tokens in \`.env.local\` from reaching local wrangler runs. Today no \`.dev.vars\` exists there. Recommendation: a \`.dev.vars\` holding only the switch (the local functions never needed those tokens; the harnesses pass the switch themselves and were measured green with no env file at all). One word; nothing changes until then."
if ! git diff --quiet -- tasks/BACKLOG.md; then
  git add -- tasks/BACKLOG.md && git commit -q -m "drain: localhost-cors-2 — the two owner decisions declared as their own desk rows before any deploy (F-LC2-5 a local game against the live county; F-LC2-6 .env.local and local wrangler)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure lc2: desk rows committed $(git rev-parse --short HEAD)" >> "$G" || { echo "cure lc2: commit failed — needs hands" >> "$G"; exit 1; }
else echo "cure lc2: desk rows already present, nothing to commit" >> "$G"; fi
