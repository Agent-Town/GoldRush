# Marketing — Gold Rush campaign (launch + maintain)
Status: DRAFT v1, 2026-07-07 ~16:40, attended — owner ordered ("making a marketing campaign… Seedance 2.0 and Higgsfield or some other provider of your choice… launch and maintain"). 4 ratification questions batched at bottom. Audience ruling applies: family & friends first, public planned ("I also need to make a living").

## Positioning (the one-liner and its pillars)
**"A frontier claim your whole family defends — built by a human and his AI factory, live, in public."**
- P1 — THE GAME: warm illustrated survivors-TD with a real meta-saga: your claim becomes a town, becomes ten eras, ends in the stars. No firearms, no gore — teal-brass frontier tech (a differentiator in the genre, lead with it).
- P2 — THE AGENT: you play alongside YOUR agent (the Prospector) — consent rungs, receipts, real delegation. Nobody else's tower defense has a trustworthy robot deputy.
- P3 — THE STORY BEHIND IT: the factory itself (Codex lanes, fires, evidence gates, the mistake catalog) — the build-in-public angle with genuine novelty; feeds the vibeeval audience move (consultant audit Move 7).

## The staged plan
**Stage 0 — free, starts now (no new provider, no owner money):**
- Trailer raw material from the game itself: scripted Playwright captures (video-on) of the money shots — dawn over the carved valley, a wave breaking on lane-aligned kill-gaps, the Prospector collecting, blast charges over rubble (now correctly layered!), the demolish "single sad plank," the science chart. Task `mkt-01-footage-rig` (lane-c).
- Key art: gpt-image-2 batch (art slot) — one hero image (the Prospector + player silhouette on the ridge over the claim at golden hour), 3 aspect crops (16:9, 9:16, 1:1). Reuses the existing style anchor; batch-012-mkt.
- Copy block: ledger-voice taglines bank (this spec §Copy).
- The channel shell: an itch.io page (free, the natural indie-browser-game home; embeds or links the Pages URL) as the campaign's landing — decoupled from the family's private URL.
**Stage 1 — the teaser (one provider, small budget, owner-gated):**
- 45–60s hero teaser: real gameplay captures (Stage 0) intercut with 4–6 generated cinematic shots (the pan filling with gold; the ten-era time-lapse of one hill; the Ark rising — the saga tease). Generated shots = ONE video provider.
- **Provider recommendation: Seedance 2.0 ONLY for v1** (best stylized-motion quality mid-2026; takes image conditioning — our gpt-image-2 key art becomes first frames, keeping the trailer ON-STYLE). Higgsfield: NOT initially — the audit's retire-one rule; one provider until its output proves insufficient. Revisit only with a named gap.
- Budget ask: owner sets a cap (recommendation: modest starter pack, ~1 teaser + retakes ≈ $30–60 class).
**Stage 2 — maintain (the factory runs it):**
- **Marketing as a lane.** A weekly content loop the fires execute: on notable merges (owner-visible features), a fire authors a `mkt-` capture task → GIF/short + ledger-voice caption → lands in `marketing/outbox/` → **owner approves with one word → posts**. NOTHING publishes without explicit owner approval per the escalation laws (publishing = owner-gated, always).
- Cadence target: 2 posts/week (1 game feature, 1 factory/behind-the-scenes) + 1 monthly devlog compiling the playtest docs (they're already written in publishable voice).
- `marketing/LEDGER.md`: every asset, where posted, when, response notes — completeness law applies.

## Channels (focus beats breadth)
PRIMARY: X/Twitter (indie-dev + AI-builder audience overlap — both pillars land) + itch.io devlog. SECONDARY (Stage 1+): YouTube Shorts/TikTok for the teaser's 9:16 cut. LATER: Reddit r/incremental_games / r/WebGames at open-beta, Twitch factory-cam (owner's old idea — revisit at E2 ship).

## Copy bank (ledger voice, starters)
"Stake the claim. Teach the machines. Leave with the stars." · "Your agent works the claim. You decide what it's allowed to touch." · "Built by one human and a factory of AIs — every merge gated, every mistake named." · "No guns on this frontier. Brass, steam, and stubbornness." · "The gold remembers."

## Laws
- Owner approves every public artifact before it posts (one-word approvals; batch weekly).
- Kids never appear; profile names redacted from captures (demo profiles exist for capture).
- Canon guardrails apply to ALL marketing art (ADR-001, warm, no peoples-as-enemies).
- Factory-pillar content shows real evidence (actual dashboards/ledgers) — the story IS true, never dramatize.
- Spend: any new provider/subscription = owner one-time approval with a cap; the ledger tracks per-asset cost.

## Ratification — ANSWERED 2026-07-07 ~16:45 (owner, interactive)
1. **Provider: Higgsfield (platform) with Seedance 2.0 inside it** — owner: "Higgsfield has Seedance included." One subscription seat covers the model we want; retire-one rule satisfied. Owner signs up when Stage 1 arms (cap below).
2. **Landing: agenttown.app — THE AGENT TOWN BRAND REVIVAL.** Owner: "I have a domain — agenttown.app… agenttown also has an X account with 450 followers… It would be great to revive the Agent Town brand." The campaign is a BRAND campaign: agenttown.app = the town square of the universe; Gold Rush = its first tale. Existing brand assets: `~/Projects/agent-town-branding` + `agent-town-assets` (mine for logo/type/voice before generating anything new). itch.io demoted to later/secondary. X: @agenttown revives with the content loop (owner posts/approves; 450 followers = warm start).
3. **Title: "Gold Rush — an Agent Town tale"** — confirmed.
4. **Stage 1: after the visual pass settles (W1/GT + lit buildings owner-confirmed), budget cap ~$50** — confirmed. Footage RIG builds now (free); teaser shots re-taken cheaply once visuals settle.

## Landing page (mkt-02, factory-built)
`site/` static one-pager in this repo → own Cloudflare Pages project (`agenttown`) → owner points agenttown.app DNS (one-time, ~5 min, when the page is review-approved). Content v1: brand mark + "Gold Rush — an Agent Town tale" + hero key art + teaser slot (poster frame until Stage 1) + 3 pillar blurbs + devlog link + email/waitlist (simple mailto or CF form later) + "played by the founder's family since 2026" honesty line. NO tracking/analytics v1 (privacy = public-readiness pack later); NO game embed yet (owner gates when the public build is ready).
