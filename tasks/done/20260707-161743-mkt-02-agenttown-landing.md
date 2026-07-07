# Task mkt-02: agenttown.app landing — the brand revival page (LANE-D, branch lane/perf, commit prefix "mkt:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; specs/marketing/README.md (§Landing page = the content contract; positioning pillars + copy bank = the voice); **mine `~/Projects/agent-town-branding` and `~/Projects/agent-town-assets` READ-ONLY for the existing logo/wordmark/palette/voice — reuse before inventing**; docs/GOLD_RUSH_BRIEF.md §4 (art direction). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits).

## Why (owner ruling 2026-07-07: "I have a domain — agenttown.app… It would be great to revive the Agent Town brand")
The campaign's public door: agenttown.app as the universe's town square, Gold Rush as its first tale. 450-follower @agenttown X account revives against this page.

## Scope
1. **`site/` static one-pager** (plain HTML/CSS, zero build step, zero JS beyond a smooth-scroll nicety — this is NOT the game; keep it <200KB before images): Agent Town mark (from branding repo if usable; else a clean wordmark in the brief's type spirit) → hero: "Gold Rush — an Agent Town tale" + key art slot (placeholder gradient + game screenshot until batch-012 lands) → teaser video slot (poster frame, "coming soon") → three pillar blurbs (spec's P1/P2/P3, ledger voice) → devlog link placeholder → contact/waitlist mailto → footer: "played by the founder's family since 2026" + no-tracking note.
2. **Parchment-and-teal visual language** consistent with the game (the brief's palette); fully responsive (390px first-class); dark-mode friendly.
3. **`scripts/deploy-site.sh`**: like deploy.sh but `wrangler pages deploy site --project-name agenttown` (creates project on first run if token allows; same .env.local auth; same self-skip discipline). DO NOT touch the game's deploy.sh or the `gold-rush` project.
4. **NO DNS action** (owner points agenttown.app when he approves the page — the pages.dev preview URL is the review artifact).
5. Lighthouse-basics sanity: images sized, alt texts, title/meta description ("A frontier claim your whole family defends…"), og:image = key art slot.

## Firewall
Touch ONLY: site/**, scripts/deploy-site.sh, artifacts/mkt-02 screenshots. NO game src/, NO game deploy pipeline, NO fonts requiring licenses (system stack or brief-consistent free fonts only), NO analytics/tracking of any kind.

## Self-check
Page validates (no broken refs), renders desktop + 390px (screenshots to artifacts/mkt-02/), <200KB pre-image budget stated, deploy-site.sh dry-runs clean (skip-path if no token). Standard game suites untouched (m1-01 green as canary). Commit on lane/perf. End: READY-FOR-GATES + the preview deploy URL if token permitted + screenshots.
