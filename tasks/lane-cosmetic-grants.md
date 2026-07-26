# Task lane-cosmetic-grants: the clerk pays in coats (LANE-D, release, commit prefix "feat:")
You are Codex (worktrees/lane-d). CODEX: model=gpt-5.6-sol effort=high
READ FIRST: the Complaints Desk submit flow + ticket ids · the Prospector sprite binding (placeholder-first name-binding precedent) · ProfileStorage (profile-scoped unlocks) · functions/api/ bug-office patterns (KV, token reads).
## Why (owner ruling verbatim: everyone who hands in a bug gets a cosmetic; top-3 get a custom skin)
## Scope
1. SKIN SYSTEM (minimal): a profile datum `prospectorSkin` + `heroSkin` (name-keyed, stock fallback); the agent's sheet resolves by skin name with stock fallback (art may land after — placeholder-first); THE TAILOR'S WAGON (specs/cosmetics/README.md V1 — owner-ratified): a wagon prop + cloth sign on the plaza (reuse the shipped wagon body; render-side), whose door opens THE WARDROBE (house UI): two racks — Prospector (stock/complainant/gilded) and The Partner (heroine: stock/claim-day-neckerchief); equip per profile. NO Settings picker — the wagon is the one surface.
2. THE REPORTER'S COAT: submitting a bug at the desk grants+equips THE REPORTER'S SET on the spot (complainant coat + the heroine's claim-day neckerchief — the county dresses both of you) — the clerk says so in-world ("The county pays honest eyes. The Complainant's Coat is yours.") — once per profile, offline-safe (grant is local at submit success).
3. THE PRIZE STUB: a redeem field at the desk ("Hand the clerk a prize stub") → POST /api/redeem {code} checked against KV set `prize:<code>` (owner seeds 3 codes post-contest via a tiny scripts/mint-prize-codes.mjs, token-gated) → grants 'gilded'; single-use codes; in-world decline for bad stubs.
4. Spec e2e/cosmetic-grants.spec.ts: submit→coat granted+equipped+persists reload · stub redeem grants gilded (wrangler rig) · bad stub declines in-world · sheet binding falls back to stock when art absent · zero console, both projects.
## Firewall: skin datum+binding+picker, desk grant+redeem, the api+mint script, specs. NO gameplay stats (cosmetic law), NO desk report-flow changes.
END: READY-FOR-GATES + screenshots (grant moment + picker).
