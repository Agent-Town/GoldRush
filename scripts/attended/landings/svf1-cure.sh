#!/bin/bash
# svf1 cure (in the chain after the merge): the share card's framing is a taste call for the owner, declared as its own desk row (F-SVF1-2).
G=$1
node scripts/attended/desk-row.cjs F-SVF1-2 "(2026-09-26, from the site-vibe-fixes-1 landing, a look after the site deploy): the new share card (\`site/assets/share-card.jpg\`, 1200x630, from the heroine-with-pan illustration) keeps the whole hat and the ridge of walkers, and the gold in the pan does not fit; no full-width crop holds both.** Look at the card once (the site's \`og:image\`; any link-preview tool shows it) and say if the framing should favour the pan instead: one number in \`scripts/site-share-card.mjs\` reframes it and \`node scripts/site-share-card.mjs\` regenerates the byte-exact file. Silence keeps the hat-and-walkers framing."
if ! git diff --quiet -- tasks/BACKLOG.md; then
  git add -- tasks/BACKLOG.md && git commit -q -m "drain: site-vibe-fixes-1 — the share card's framing declared as the owner's own desk row (F-SVF1-2)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure svf1: desk row committed $(git rev-parse --short HEAD)" >> "$G" || { echo "cure svf1: commit failed — needs hands" >> "$G"; exit 1; }
else echo "cure svf1: desk row already present" >> "$G"; fi
