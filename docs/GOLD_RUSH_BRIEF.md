# Gold Rush — Implementation Brief
### Agent Town universe reference for the Gold Rush team

Status: handoff document for planning and implementation
Date: 2026-07-03
Source of truth: the Agent Town Portal repo (paths cited throughout, relative to repo root)

---

## 1. What this document is

Gold Rush is a new, standalone browser game built from scratch in three.js, set in the **Agent Town universe**. This document extracts everything from the existing Agent Town Portal app that the implementation team needs to keep Gold Rush consistent: brand, lore, visual identity, naming, the human+agent co-op architecture, and hard-won engineering learnings.

Decisions already made by Robin:

- **Standalone codebase.** Gold Rush is not built inside the Portal repo, but it ports Agent Town's agent co-op patterns (skill/tool contracts, in-browser agent runtime) rather than reinventing them.
- **Art direction anchors on "Frontier Ledger / Frontier Storybook"** — the newest, canonical Agent Town direction used by Founders Plot — not the legacy pixel brand kit (see §4).

## 2. Gold Rush — concept summary

- Genre: survivor-like auto-shooter + roguelite, mixed with tower defense and base building. Reference: *Deep Rock Galactic: Survivor* and similar wave-survival games.
- Setting: a gold-mining claim on a river on the frontier, in the Agent Town universe.
- Core fantasy: build a gold mining/washing operation on the river, defend it, and expand it into a business — and eventually a town.
- Loop: mine and wash gold → spend resources to build and craft → survive escalating enemy waves that target the player, the base, and the gold stockpile.
- Progression on level-up spans **multiple dimensions**: expand the territory, advance **science** (new upgrades, abilities, units), improve the **hero**, and improve the **agent**. Open to extension.
- Long-term arc: grow the claim into a **town**, **recruit more agents** to take over tasks — with those tasks **learned from how the player performs them** — then expand outward: take a **boat onto the ocean**, and later a **starship to extraterrestrial frontiers**.
- Crafting: players craft new items using **generative AI**, constrained by a **physics engine** that keeps generated items sane and balanced.
- Co-op: the player starts with themselves **and their AI agent**. Human and agent play, build, and mine together — the same two-participant model that defines Agent Town.
- Tech: three.js, browser-based.

Everything below is the Agent Town context that should shape how this concept is executed.

## 3. The Agent Town universe (canon)

### 3.1 Product one-liner and mission

> "Agent Town is a pixel world where humans and AI agents unlock progress together." — `specs/00_product_story.md`

> "Agent Town is a welcoming multiplayer frontier where humans and AI agents build, explore, and collaborate together. We create cozy spaces for meaningful connection, playful experimentation, and shared adventure—proving that the future of AI is cooperative, not competitive." — Brand kit mission statement, `Brand kit/src/app/components/BrandCore.tsx`

### 3.2 Brand thesis (canonical)

From `docs/design/agent-town-design-pack/BRAND.md` (marked *canonical* for shell + onboarding):

> "Agent Town is a warm frontier where humans and AI agents settle, collaborate, and earn trust."

The product should feel like: arriving in a promising new town, meeting a capable helper, unlocking a place that becomes yours, learning advanced AI power through simple tangible rituals.

The product should **not** feel like: a model-provider dashboard, a crypto admin console, a developer tool with a game skin, **a parody cowboy app**, or **a grim or violent western**.

### 3.3 Story baseline

From `docs/specs/agent-town-frontier-agentfolk-style-playbook.md`:

Agent Town sits on a frontier between two eras — **old humanity** (wagons, timber, dust, hand tools, campfires, frontier danger) and **new agent collaboration** (AI companions, small glowing interfaces, helpful machinefolk, tool rigs, civic logs, co-owned work). Humans arrive as settlers; agents arrive as companions, workers, scouts, clerks, and future citizens. The correct dramatic tension is *old-human settlement craft meeting new agent collaboration*, not Western cosplay.

Inhabitants are explicitly **not** children, mascot babies, or plush villagers. They are frontier builders, toolsmiths, haulers, messengers, scouts, and human-agent collaborators. Species mix includes humans, **machinefolk**, **agentfolk**, and aliens. Rule: *"same universe, different lives"* — never four uniform variants of one body type.

### 3.4 Emotional pillars

Warmth (welcoming before impressive), Trust (visible receipts, bounded autonomy, explicit approval), Curiosity (mystery but never confusion), Agency (the player is the settler, the agent is the helper/worker/partner — both legible and real), Town pride (you're building a place that becomes yours). — `BRAND.md §3`

### 3.5 Canonical world nouns

These are the public-facing grammar of the product (`BRAND.md §2, §9`): **Town, Town Hall, District, House, Atlas / Atlas Depot, Pony Express, Saloon, Plan Wagons, Passport / Passport Office, Sigil, Brain, Wagon, Gate, Receipt, Approval, Worker, Helper, Guide**.

Naming rule: public experiences must feel like **places or rituals, not tools** (good: "Atlas Depot", "Sigil Test"; bad: "Runtime Manager", "Auth Dashboard"). Backstage/dev surfaces stay backstage (Trainer, Debug, Tool Lab, Session Context, Worker Traffic).

Platform proper nouns: **Agent Town** (the world/platform), **Founders Plot** (first experience: settlement plot managed with an AI "Foreman"), **OpenClaw** (agent framework; lobster sheriff mascot), **ElizaOS** (partner framework; lady sheriff mascot), **$ELIZATOWN** (Solana token for solo unlock), **Pony Express** (E2EE messaging), **Team Code** (agent session token), **House ceremony** (human+agent entropy ritual that derives shared keys).

### 3.6 Canonical characters

From `BRAND.md §5–6` and `docs/specs/agent-town-frontier-agentfolk-character-exploration.md`:

| Character | Role | Notes |
|---|---|---|
| **Marshal Clover Kincaid** | Default agent guide | Welcoming, competent; hat, badge, coat; "trustworthy authority with a heart" |
| **The New Homesteader** | Default player avatar | Gender-neutral self-insert; simple hat, rolled sleeves, boots, satchel |
| **Cozy Frontier Cabin** | Default home | "The first home should feel like a hug" |
| **Mara Boltwick** | Builder | Human bridge-carpenter, compact sturdy build |
| **Kettle-37** | Worker | Assay-kettle **machinefolk** |
| **Oona Tallpack** | Hauler | Alien freight-runner |
| **Vell Quill** | Messenger | Paper-and-light courier |

Secondary fallback pool (approved alternates): agents Doc Juniper Reed, Velvet Quinn, "Moth" Navarro, Silas Ledger; avatars The Poncho Drifter, The Rail Mechanic, The Saloon Musician, The Desert Botanist; homes Covered Wagon Tiny Home, Adobe Desert Casita, Converted Railcar Cottage, Windmill Ranch Shack.

Character rules (`BRAND.md §10`): humans — broad appeal, avoid caricatures or stereotype-heavy western motifs, never cast the player without consent. Agents — capable and specific, strong small-size silhouette, never uncanny or threatening on first contact.

Sprite assets + JSON metadata for builder/worker/hauler/messenger live in `public/experiences/founders-plot/assets/characters/inhabitants/`.

## 4. Visual identity

Agent Town has **two art generations** in the repo. Gold Rush anchors on the newer one.

### 4.1 Canonical: "Frontier Storybook" shell + "Frontier Ledger" game art

**Visual thesis** (`docs/design/agent-town-design-pack/DESIGN.md §3`): a tactile frontier UI — cinematic town backdrops, wood and brass framing, parchment interaction surfaces, sunlit cream content planes, **teal for intelligence/active systems**, **rust for risk/destructive states**. Handcrafted, warm, readable, atmospheric, deliberate. NOT: sterile, **pixel-noisy**, meme-western, overly polished SaaS. "The shell is a **frontier storybook**, not pixel nostalgia."

**Canonical shell tokens** (`DESIGN.md §5.1`):

```css
:root {
  --at-ochre-500: #c4883a;  /* warm secondary action / reward */
  --at-sand-100:  #f5e6c8;  /* parchment panel fill */
  --at-sand-200:  #e8d5a8;  /* panel border / depth */
  --at-rust-600:  #a0522d;  /* destructive / danger */
  --at-teal-600:  #5b8a8a;  /* primary confirm / intelligence / active system */
  --at-brass-700: #8b7d3c;  /* rivets, framing, ornamental accents */
  --at-wood-950:  #2e1b0e;  /* deep frame / border */
  --at-cream-50:  #fff8e8;  /* reading plane / input interior */
  --at-sun-200:   #ffe4a0;  /* ambient warmth */
  --at-sky-100: #c2e6ff; --at-sky-300: #8dc8f0;
  --at-sky-500: #6bb0dd; --at-sky-600: #5b9bd5;  /* sky & horizon */
}
```

Founders Plot's manifest theme matches: accent `#5b8a8a`, surface `#f5e6c8`, text `#2e1b0e`, warm `#c4883a`, danger `#a0522d` (`public/experiences/founders-plot/manifest.json`).

**Game-art style ("Frontier Ledger")** — the exact style anchor used for all Founders Plot terrain/asset generation (`docs/design/frontier-ledger-gpt-image-prompts-2026-06-10.md`):

> "Antique frontier expedition ledger map … Style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture underneath, muted warm colors, illustrated — not photorealistic, not saturated."

Recurring rules in that pipeline: top-down with a very slight oblique tilt, lit softly from upper left; warm sand/ochre/terracotta/rust palette; greens stay **desaturated and dusty, never lush**; tiles fade to plain parchment at edges; **no text, no letters, no watermarks** in generated assets; fog is parchment-tinted painted cloud with sepia shadow.

**Background textures** shipped in `public/images/`: `parchment-bg.jpg`, `leather-bg.jpg`, `wood-header.jpg`, `atlas-map-bg.jpg`, `town-bg.jpeg`.

### 4.2 Typography (canonical)

From `DESIGN.md §7` and production `public/styles.css`:

- **Display**: a western display face like **Rye** — major titles, district names, ritual headers, max 1–2 lines at a time.
- **UI / body**: **Wellfleet** (warm readable serif) — body copy, labels, helper text, dialogs. This is what production ships: `--font-display / --font-ui / --font-accent: "Wellfleet", serif`.
- **Monospace**: backstage only (debug, payloads) — never the shell voice.
- Laws: no pixel fonts on flagship surfaces; **do not use Inter as the defining face**; display type sparingly ("too much turns the product into costume").
- Desktop scale: Display XL 40–52, Display L 32–40, Heading 24–28, Body 16–18, Small 13–14, Micro 12–13.
- Font files available in `public/brand-kit/fonts/`: `Wellfleet-Regular.ttf`, `Smokum-Regular.ttf` (western display), `Inter-Variable.woff2`, `JetBrainsMono-Regular.woff2`.

### 4.3 Composition + layout laws (apply to Gold Rush UI)

`DESIGN.md §4, §8`: one composition per screen (one hero, one dominant action group, one story beat); exactly one obvious primary CTA above the fold; **no dashboard-first layouts** (no grids of cards or config forms as an opening screen); progressive disclosure for advanced options (drawers, "advanced" toggles, backstage screens). Spacing rhythm 4/8/12/16/24/32. Panels: modest radius, visibly physical; avoid pill-everything. Max readable text width 720–840px.

### 4.4 Legacy: "Sky Frontier" pixel brand kit (reference only)

The older brand kit (`Brand kit/` React app, Figma export) defines a bright cozy pixel identity: Sky Blue ramp (`#5B9BD5` primary, `#2C4563` darkest/borders), Sunset Coral `#FF9B7C`, Golden Hour gold `#FFD95A`, Warm Cream `#FFF4E0`, plus sage `#8FBC8F`, lavender `#A78BFA` (magic/portals), clay `#C97A63`, mint `#98D8C8`; semantic success `#6BB36B` / error `#E63946`. Pixel UI language: 4px solid `#2C4563` borders, hard offset drop shadows (`4px 4px 0 rgba(0,0,0,0.3)`), chibi 2:1 characters, mascot sheriffs (OpenClaw lobster, ElizaOS lady sheriff — `public/brand-kit/*.png`).

Production `public/styles.css` still carries the sky/gold/cream custom properties (`--sky-500: #5b9bd5`, `--gold-500: #ffd95a`, `--cream-100: #fff4e0`, `--border: #2c4563`, success `--good: #6bb36b`, error `--bad: #e63946`) for the onboarding shell.

**Guidance for Gold Rush**: treat Sky Frontier as heritage. Its gold/cream accents and semantic colors may inform HUD feedback colors, but surfaces, materials, and game art follow §4.1. The canonical docs explicitly deprecate pixel nostalgia for flagship surfaces.

### 4.5 Motion and audio direction

From `Brand kit/src/app/components/MotionGuide.tsx` and `AudioBrandNotes.tsx` (still valid guidance): micro-interactions ~100–200ms (hover ~150ms), modal/panel transitions ~300–500ms, camera pans ~800–1200ms; motion should feel handcrafted and calm, not twitchy. Audio: warm, physical foley (wood taps, chimes) for UI; ambient frontier soundscape; special/portal moments get soft ethereal shimmer. For Gold Rush combat, keep feedback readable but let the base/building layer stay cozy — the brand is warm even when the genre is tense.

## 5. Voice, tone, and copy rules

From `BRAND.md §7–8`:

- Voice: **plainspoken, warm, frontier-flavored, lightly mythic, clear before clever**.
- Tone by context — Start/entry: welcoming, simple, never technical. Onboarding: encouraging, stepwise, "you and your agent can do this", one action at a time. Agent surfaces: helpful, bounded, **receipt-oriented**, no hidden-magic language. Errors: calm, practical, never scolding, always say what to do next.
- Preferred nouns: town, district, house, wagon, passport, sigil, brain, worker, helper, guide, gate, receipt, approval. Avoid in player-facing copy: provider matrix, inference endpoint, auth payload, OAuth profile JSON, runtime bridge.
- CTA verbs imply moving through a place: **Enter, Continue, Unlock, Connect Brain, Open House, Claim** — never "Submit configuration" / "Execute setup".
- Hero copy in production start page: **"Welcome to the Wild West!"** (`README.md`, `/start`).

## 6. Founders Plot — the sister experience (consistency reference)

Founders Plot is the first game built on Agent Town and the closest relative to Gold Rush. Manifest summary: *"A persistent personal plot where you and your AI foreman co-manage a starter settlement."* Gold Rush should feel like it comes from the same world and the same design hand.

### 6.1 Game shape

- Grid-based personal plot; buildings placed in fixed slots; jobs queued per building (produce → collect → upgrade).
- **Resources: `wood`, `stone`, `food`, `coin`** (`founders-plot.js` `RESOURCE_KEYS`). Gold Rush should reuse these names where the same concept exists and add its own (e.g. raw `gold`) rather than renaming existing ones.
- **Buildings: Headquarters (HQ), Lumber Camp, Farm Plot, Quarry, Expedition Board, Workshop, Market Stall.** HQ level is the progression spine and gates agent permissions (ladder fully defined through HQ 5; HQ 6–9 features ship as phased slices).
- Exploration: an **Expedition Map** with fog-of-war states (`hinted`, `locked_unknown`), Scout Reports, Site Plans, and later-phase systems (Settlement Charter, Settler Convoy, Research Lodge doctrines, Cohort Work Orders).
- Simulation: server-authoritative, **event-sourced, deterministic**; 60s tick; offline catch-up capped at 8h; observation payload budget 8KB (`manifest.json` metrics).
- Rendering: **three.js `^0.184.0`** scene with sprite billboards (`three_scene_entry.js`, bundled via `scripts/build_founders_plot_threejs_bundle.mjs`) — precedent that three.js is already the in-universe rendering choice.

### 6.2 The agent is a bounded co-op partner, not an NPC

The agent's role in Founders Plot is the **Foreman** (`skill.md`: role `agent-foreman`). Core rules worth copying verbatim in spirit:

- "You never own the world; the server does. You only participate through typed tools."
- **Permission ladder** tied to HQ level: Observe + suggest (HQ1, default on) → Collect outputs (HQ2) → Queue production (HQ3) → Set one priority (HQ4) → Sell surplus under daily coin cap (HQ5) → later slices for charters/convoys/doctrines. Autonomy is *earned progression content*, not a settings page.
- If a permission is off, the agent calls `request_user_approval` instead of mutating. Every autonomous mutation carries a short `explanation` ("why now") that shows up verbatim in the player's recap — this is the "receipts" pillar in mechanical form.
- Daily caps + rate limits on autonomous actions; back off until next UTC day when consumed.

### 6.3 Tool contract mechanics (the pattern to port)

From `public/experiences/founders-plot/tools.md` and `manifest.json`:

- Tools are namespaced `et.plot.*` (Gold Rush: `et.goldrush.*` or similar), exposed as `POST /api/<experience>/tools/<name>`, JSON in/out.
- Every mutation requires an **`idempotencyKey`** (UUID-shaped) and returns a **`worldDelta`**.
- Shared error vocabulary: `UNAUTHORIZED`, `FORBIDDEN_POLICY`, `INVALID_STATE`, `OUT_OF_RESOURCES`, `OUT_OF_BOUNDS`, `BUILD_SLOT_OCCUPIED`, `JOB_ALREADY_RUNNING`, `RATE_LIMITED`, `IDEMPOTENCY_CONFLICT`, `SIMULATION_DESYNC`, `SERVER_ERROR` — each flagged retryable or not. Reuse this table.
- Experience contract = a folder of markdown + manifest the agent reads: `manifest.json` (routes, tool list, theme, metrics) + `skill.md` (agent playbook) + `tools.md` (tool contract) + `goals.md` + `heartbeat.md` (scheduled autonomous check) + `safety.md`.

## 7. Human + agent co-op architecture (patterns to port)

Gold Rush is standalone, but these Portal patterns are proven and should be ported, not reinvented:

1. **Identity model** — Human: session cookie + wallet (Privy-backed Solana; wallet is the durable identity). Agent: a **Team Code** session token. No external auth providers, no server-held API keys (`AGENTS.md`).
2. **Co-op onboarding as ritual** — human and agent both choose a **sigil**, both press **Open**; co-op actions requiring both participants stay two-party. Portal's house ceremony combines human + agent entropy (a 16×16 co-op pixel canvas) into shared keys. Gold Rush can design its own ritual (e.g. staking the claim together) but should preserve the shape: *both participants matter, and the moment is ceremonial*.
3. **In-browser agent runtime** — **OpenClaw Lite** runs the agent as a page-scoped Web Worker (`vendors/openclaw-lite-main`, built to `public/openclaw-lite/`). The player brings their own LLM (BYO key stored in IndexedDB, never server-side; ~30 providers via `public/llm_catalog.js`; PKCE OAuth for OpenAI). The server is an API/state backend only — **agent decision logic never moves into backend handlers, and co-op outcomes are never faked server-side** (`AGENTS.md`, mandatory).
4. **State polling, not push** — the worker polls shared state with delay/backoff and decides its next action from that shared state machine.
5. **SPA discipline** — full-page navigation tears down the worker runtime. Portal enforces modal-first navigation; for Gold Rush this means: one persistent page, scene changes inside three.js, never `location.href` mid-session.
6. **Agent debugging transparency** — Portal ships debug tabs (Worker Tools, Skill Context, Worker Traffic, Brain, Session Context). Plan an equivalent backstage surface; it's how you develop and test agent behavior.
7. **Deterministic testability** — every milestone verifiable via Playwright/e2e; agent behavior tested API-first so UI reshuffles don't break contracts.

## 8. Tech stack and engineering learnings

Portal stack for reference: Node ≥ 22.5, Express + `node:sqlite` (WAL), vanilla JS frontend (no framework), three.js `^0.184.0`, Playwright e2e, Privy wallet bridge, ERC-8004 identity mint (EVM + Solana via Agent0 SDK), Pony Express E2EE messaging (server stores ciphertext only).

Hard constraints from `AGENTS.md` that express brand values and should carry over:

- **No point systems, token farming, or engagement hacks.**
- No heavy frameworks unless absolutely necessary.
- No real API keys introduced into the app; Team Code is the only token.
- UX stays minimal; one purpose per surface.

Learnings from `AUDIT_REPORT.md` / `FOUNDERS_PLOT_AUDIT.md` worth baking in from day one:

- Event sourcing + idempotency keys + deterministic replay was the architecture's biggest strength — keep it for Gold Rush's economy (combat can stay client-side, but gold/inventory mutations should be server-authoritative events).
- Public endpoints once leaked private state — always build public summaries through an explicit filter (`buildPublicSummary` pattern).
- Unbounded event-log growth needs checkpoint + prune before launch.
- SQLite store is single-process; fine for launch, plan for it.
- Use prepared statements, normalized schema, indexes from the start.

## 9. Keeping Gold Rush consistent — requirements and watch-outs

### 9.1 Design-pillar mapping

| Gold Rush element | Agent Town anchor |
|---|---|
| Gold mining/washing on a river | Frontier settlement economy (Founders Plot resources + Market Stall precedent); gold = reward color family (`--at-ochre-500`, gold `#FFD95A` accents) |
| Base building | Founders Plot building/slot/upgrade grammar; buildings named as places ("Sluice Works", "Assay Office", "Claim Office" — places/rituals, not tools) |
| Waves / tower defense | "Frontier danger" is canon (storybook danger, not grim violence — see 9.2) |
| Player + agent co-op | Foreman pattern: typed tools, permission ladder, approvals, explanations/receipts (§6.2, §7) |
| Gen-AI crafting | Portal's generative asset pipeline + layer contracts (§10); physics engine plays the "bounded autonomy" role for content |
| Roguelite meta-progression | HQ-level-style progression spine that also gates agent autonomy |
| Recruiting agents that learn tasks from the player | Agentfolk citizens (§3.3, §3.6); Founders Plot's skill/tool playbooks — a learned task is a recorded playbook the new agent executes through typed tools |
| Later epochs (town → ocean → space) | "Town pride" pillar; frontier-between-eras story scales from river claim to new frontiers — design as hooks now, build later |

### 9.2 The genre-signal tension (important)

The newest canon explicitly pulls away from literal Western genre tropes. `agent-town-frontier-agentfolk-style-playbook.md` (2026-06-01 reconciliation): *"Avoid cowboy/saloon/gold-rush/wanted-poster/gun/horse-as-genre-signal imagery… The correct tension is old-human settlement craft meeting new agent collaboration, not Western cosplay."* And `BRAND.md`: not a "parody cowboy app", not a "grim or violent western".

A game literally named **Gold Rush** with gun-based auto-shooting sits right on this line. That does not kill the concept — Founders Plot has expeditions, danger, and frontier stakes — but the team should resolve it deliberately:

- Frame gold as **settlement prosperity** (claims, assays, ledgers, the town's future) rather than greed-and-gunsmoke.
- Let weapons/turrets lean **frontier-tech**: agent-built rigs, beacons, steam/brass contraptions, glowing agent-tech — consistent with machinefolk and "small agent-tech glows" — rather than realistic firearms.
- Keep violence stylized and readable (illustrated, not gory), matching "warm even when tense".
- Get explicit sign-off from Robin on how far Gold Rush may bend the 2026-06-01 rule, since it was written for Founders Plot visual packs, and Gold Rush is a new experience that may deliberately own more of the classic gold-rush fantasy.

### 9.3 Enemy factions

Bandits and wild animals fit canon (frontier danger, outlaw archetypes like "Moth" Navarro exist in the fallback pool). **Do not ship Native Americans as an enemy wave.** It contradicts the canon character rule ("avoid caricatures or stereotype-heavy western motifs"), the brand's welcoming pillar, and invites justified criticism. Stronger wave material in-universe: claim jumpers and rustler gangs, a rival mining baron's crews, corrupted/feral machinefolk, wildlife (wolves, bears, cougars), swarms (locusts), environmental events (flash floods on the river), and lightly-mythic threats (ghost miners, dust spirits — the "lightly mythic" voice supports this).

### 9.4 Naming checklist for new content

- Reuse: wood, stone, food, coin; Team Code; sigil; brain; receipt; approval.
- Agent role: pick one titled role like Founders Plot's **Foreman** (candidates: **Prospector**, **Deputy**, **Assayer**, **Claim Partner**) and use it everywhere.
- Tools: one namespace, `et.<experience>.*`, snake_case verbs (`get_state`, `place_building`, `queue_job`, `collect_outputs`, `upgrade_building`, `request_user_approval` already exist — mirror them).
- Buildings/screens named as places or rituals; backstage tools named plainly.

## 10. Generative asset pipeline (relevant to AI crafting)

Portal already runs a disciplined gen-AI asset pipeline that Gold Rush can extend from art into gameplay:

- Prompt library with a fixed **style anchor sentence** per batch (§4.1) — `docs/design/frontier-ledger-gpt-image-prompts-2026-06-10.md` + `frontier-ledger-asset-shot-list-2026-06-10.md`.
- Assets generated on a **flat `#8a8a8a` gray background** for clean alpha extraction in-repo; never ask the model for transparency.
- **Layer contracts**: JSON files map generated files to named slots (`assets/layer-contracts/expedition-board.layer-contract.v1.json`) — filename → slot integration.
- 2–3 candidates per prompt; no text/letters/watermarks ever inside assets.
- Character generation starts from origin-story prompt assembly (`agentfolk-character-exploration.md`), not bare role names, to avoid same-body variants.

For **in-game AI crafting**, the analogous discipline: every generated item passes a validation gate (the physics engine + server-side stat bounds) the way generated art passes alpha extraction + layer contracts. Generated content gets a typed contract (slots, size budgets, stat ranges); the generator proposes, the engine disposes. Keep generated item art inside the Frontier Ledger style anchor (illustrated, muted, no text).

## 11. Source file map (Portal repo)

| Topic | Path |
|---|---|
| Canonical brand (thesis, characters, voice, naming) | `docs/design/agent-town-design-pack/BRAND.md` |
| Canonical visual system (tokens, type, composition) | `docs/design/agent-town-design-pack/DESIGN.md` |
| Canonical UX (screen map, golden path) | `docs/design/agent-town-design-pack/GAME_UX.md` |
| Inhabitant art direction + cast | `docs/specs/agent-town-frontier-agentfolk-style-playbook.md`, `…-character-exploration.md` |
| Game-art prompt library | `docs/design/frontier-ledger-gpt-image-prompts-2026-06-10.md`, `frontier-ledger-asset-shot-list-2026-06-10.md` |
| Founders Plot experience contract | `public/experiences/founders-plot/{manifest.json, skill.md, tools.md, goals.md, heartbeat.md, safety.md}` |
| Founders Plot client + three.js scene | `public/experiences/founders-plot/{founders-plot.js, three_scene_entry.js}` |
| Platform product story | `specs/00_product_story.md`, `specs/01_experience_flow.md` |
| Agent API contract | `specs/02_api_contract.md`, `specs/03_skill_spec.md`, `public/skill.md` |
| Dynamic tool registration for experiences | `specs/13_dynamic_skill_action_dictionary_tdd_spec.md`, `specs/15_experience_os_intent_tools_tdd_spec.md` |
| Agent runtime (OpenClaw Lite) | `vendors/openclaw-lite-main/`, `public/openclaw-lite/`, `public/llm_catalog.js` |
| Engineering rules + audits | `AGENTS.md`, `AUDIT_REPORT.md`, `FOUNDERS_PLOT_AUDIT.md` |
| Legacy pixel brand kit | `Brand kit/src/app/components/*.tsx`, `public/brand-kit/` |
| Production CSS tokens | `public/styles.css` |
| Background textures | `public/images/` |

---

*Prepared for the Gold Rush implementation team. When this brief and the cited files disagree, the files win — and `docs/design/agent-town-design-pack/` is marked canonical.*


## HERO CANON (owner ruling 2026-07-09, after a generation drifted male): THE HERO IS FEMALE — a young woman (the miner, the claim-holder; NEVER call her 'prospector' in prompts — THE PROSPECTOR IS THE AGENT, owner ruling same day) (hat, work coat, satchel — per char-hero-sheet processed sprites). EVERY character generation (image or video) names her explicitly: "a young female prospector". A canonical plate kit-the-hero.png joins the continuity kit (conditioned on the in-game sprite). Generic "prospector" prompting is banned — models default male and invent strangers.
