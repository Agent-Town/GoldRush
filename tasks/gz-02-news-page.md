# Task gz-02-news-page: agenttown.app/news — the Gazette's public window (lane-d; commit prefix "feat:")
CODEX: model=gpt-5.5 effort=medium
FROM specs/marketing/README.md STAGE 2.6 GZ-02. READ: the stage verbatim (owner-approval law; ≤3/week cadence), news/herald.json (GZ-H1's feed — ONE spine), site/ structure + deploy-site.sh.
## Scope
1. site/news.html (+ nav link): renders news/herald.json newest-first — headline, lines, date, optional image ref; the game's parchment web styling; empty state "No fresh ink yet."
2. The deploy pipeline copies the feed with the site (verify deploy-site.sh picks it up; adjust its copy set if needed).
3. NO auto-posting, NO approval flow changes — this renders what the owner already approved into herald.json.
4. Gate: local render check with a fixture feed + the empty state; no console errors; mobile-width readable.
Firewall: site/news.html + styles + the deploy copy set + fixture. NO game src/, NO functions/, NO posting automation.
End: READY-FOR-GATES + desktop/mobile screenshots.
