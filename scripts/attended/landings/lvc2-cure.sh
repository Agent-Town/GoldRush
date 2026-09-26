#!/bin/bash
# lvc2 cure (in the chain after the merge): the film's three phase-3 owner decisions as their own desk rows (F-LVC2-1, -2, -3); the four game findings ledgered as deferred.
G=$1
node scripts/attended/desk-row.cjs F-LVC2-1 "(2026-09-26, from the launch-video-capture-2 landing, for the edit): may STAGED frames appear in the public cut?** Four takes needed a staged setup and are labelled so in the treatment's as-shot list: the Baron's arrival (a copy of the capture profile's ledger with one secured Twin Banks score added, then real play at 1x to wave 20), Herald No. 5, the Field Book board with names hidden, the Ride Together invitation. Recommendation: yes for the Baron and the Herald, disclosed in the edit notes; no for the fixture board; the invitation only if disclosed. One word per take class, or silence keeps the recommendation."
node scripts/attended/desk-row.cjs F-LVC2-2 "(2026-09-26, from the launch-video-capture-2 landing, for the edit): the takes were played by a capture script, not a hand on the keys.** Every kept take is real play at 1x on the plain seed with no debug and no seed, but the inputs came from a scripted pilot (\`scripts/launch-video/lib/pilot.mjs\`). Recommendation: count them as real footage, disclosed in the edit notes ('played by the capture pilot'). One word; silence keeps the recommendation."
node scripts/attended/desk-row.cjs F-LVC2-3 "(2026-09-26, from the launch-video-capture-2 landing, for the edit): the end card's second line.** The treatment's end card carries a second line under the title; the implementer recommends keeping it. Read it in the treatment (B12) and say keep or cut; silence keeps it."
python3 - <<'PY'
p='tasks/BACKLOG.md'; s=open(p,encoding='utf-8').read()
row='🟨 **F-LVC2-4 to F-LVC2-7 — GAME FINDINGS from the film captures (2026-09-26), DEFERRED:** a bare `?contract=<id>` link boots the Claim in a plain dev boot (`ContractFamilies` fallback `debug-disabled`; every map must be launched from the town board) (F-LVC2-4); the open charter swallows a click behind it, so the Prospector order is G, G, then a click (F-LVC2-5); the dev-only "Open every claim" button shows in board frames (F-LVC2-6); the Lantern Show\'s control bar prints the page\'s local address (F-LVC2-7). Small polish slices for after the ruled work; none blocks the film.\n'
i=s.find('🧭 **OWNER RULINGS 2026-09-26'); s=s[:i]+row+s[i:]; open(p,'w',encoding='utf-8').write(s)
PY
if ! git diff --quiet -- tasks/BACKLOG.md; then
  git add -- tasks/BACKLOG.md && git commit -q -m "drain: launch-video-capture-2 — the three phase-3 decisions as the owner's own desk rows (F-LVC2-1/-2/-3); the four game findings ledgered as deferred (F-LVC2-4..7)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure lvc2: desk rows and findings committed $(git rev-parse --short HEAD)" >> "$G" || { echo "cure lvc2: commit failed — needs hands" >> "$G"; exit 1; }
else echo "cure lvc2: rows already present" >> "$G"; fi
