# Task gz-02-news-page: agenttown.app/news — the Gazette's public window (lane-d; commit prefix "feat:")

⛔ **DO NOT QUEUE — ALREADY SHIPPED. Verified by file-probe s1042 (2026-07-25).** `site/news.html` exists
on main (4753 bytes, Jul 11) and `git log -- site/news.html` returns **`d9897a26` "gz-02: Gazette news
page (site/news.html + nav + styles) — tsc/build green, 6/6 e2e desktop+390, herald.json kept from
main"** — scope 1 + 2 landed under this master's own name. **This file was INVISIBLE to the ledger:
`grep -c "gz-02-news-page" tasks/BACKLOG.md` returned 0**, so no fire reading BACKLOG could know it was
spent, while any fire scanning `tasks/` for lane-d work would have queued a 14-day-old master whose
deliverable is already on main — Mistake #8, The 824k Flail. Now ledgered (BACKLOG, s1042
pipeline-verification bullet). Kept on disk per the Retention Law; if a residual GZ-02 gap is ever
found, author a NEW master citing that gap — never re-run this one.

CODEX: model=gpt-5.6-sol effort=medium
FROM specs/marketing/README.md STAGE 2.6 GZ-02. READ: the stage verbatim (owner-approval law; ≤3/week cadence), news/herald.json (GZ-H1's feed — ONE spine), site/ structure + deploy-site.sh.
## Scope
1. site/news.html (+ nav link): renders news/herald.json newest-first — headline, lines, date, optional image ref; the game's parchment web styling; empty state "No fresh ink yet."
2. The deploy pipeline copies the feed with the site (verify deploy-site.sh picks it up; adjust its copy set if needed).
3. NO auto-posting, NO approval flow changes — this renders what the owner already approved into herald.json.
4. Gate: local render check with a fixture feed + the empty state; no console errors; mobile-width readable.
Firewall: site/news.html + styles + the deploy copy set + fixture. NO game src/, NO functions/, NO posting automation.
End: READY-FOR-GATES + desktop/mobile screenshots.
