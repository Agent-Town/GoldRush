# Accounts v1 — email + code sign-in, save-sync (family-safe)
Status: RATIFIED 2026-07-07 ~21:30 (owner, overruling the earlier LATER-parking: "if we use an email + number via email sign in, then we are kind of safe that also family and friends don't lose their games by accident"). Scope = SAVE SAFETY, not public-scale auth, not multiplayer.

## The model (deliberately boring)
- **Passwordless**: enter email → 6-digit code arrives by email → enter code → signed in (session ~30 days, this browser). Kid-friendly: no passwords to forget.
- **One email = one account = the whole family's profiles ride it** (matches demo-profiles: parent signs in once per device; profiles stay the per-kid boundary).
- **Sync = the ledger bundle**: the SAME JSON that "Pack the ledger" exports (profile-first-boot task) is the sync payload. Push on wave-boundary + meta changes (debounced ≥30s); pull on sign-in with a compare card ("Cloud has town 'X' at science 6 from yesterday — use cloud / keep local?"). Last-write-wins + the server keeps the last 5 versions per profile (accident recovery — the whole point).
- **Offline-first stands**: signed-out play works exactly as today; sign-in ADDS safety, never gates play.

## Stack (all things we already operate)
Cloudflare Pages Functions (`functions/api/*` in this repo — deploys with the site pipeline) + **KV** for everything (codes w/ native TTL, sessions, save blobs + versions; zero migrations) + **Resend** for the email (free tier 3k/mo ≫ family scale) sending from `claim@agenttown.app`.

## Security musts (v1, non-negotiable)
Codes: hashed at rest, 10-min TTL, 5 attempts then cooldown, constant-time compare. Rate limits per-email AND per-IP (KV counters). Sessions: 256-bit random opaque tokens, httpOnly-equivalent handling (localStorage acceptable v1 — no cookies/CSRF surface), revoke-on-new-code option. No user enumeration (same response either way). Save blobs: 200KB cap, content-type locked, versioned envelope validated server-side. CORS: our origins only. The Resend key: CF secret (`wrangler pages secret`), NEVER in repo/env.local commits. PII = the email address, full stop; deletion endpoint from day one ("burn the ledger").

## Slices
- **AC-01 the worker** (buildable NOW): functions/api — request-code / verify / session / push / pull / versions / delete-account; KV bindings; DEV MODE (no Resend key → code returned in response ONLY when `env.DEV_AUTH=1`, for e2e; production refuses to boot without the key). Gate: worker unit/e2e via wrangler dev + the API contract doc.
- **AC-02 client integration** (after profile-first-boot + run-suspend land — their bundle format is the payload): menu sign-in card, sync status chip ("ledger backed up ✓ 2 min ago"), the pull compare card, burn-the-ledger. Gate: full round-trip e2e vs local worker (dev-mode codes); offline-first regression (signed-out = byte-identical behavior).
- **AC-03 production smoke** (after owner one-time): real email delivery to the family, DNS verified, rate-limit probe. OWNER ONE-TIME: Resend signup + API key into CF secrets + 2 DNS records on agenttown.app (SPF/DKIM — exact records to the desk when AC-01 lands).

## Explicitly OUT (v1)
Passwords · OAuth/social · real-time sync · shared/multiplayer state · public-scale abuse hardening beyond the rate limits (revisit at the PUBLIC gate) · account merging.

## TELEMETRY — anonymous run-stats (owner order 2026-07-09: 'do we keep information about the runs? Could give us information for optimizations. Of course anonymous, not attached to the user.')
**TL-01 (fire-authorable):** per-run stat beacon on run END only: {contract, waves, duration, upgradesTaken, tier(FULL/BALANCED/LITE), frameP95, deviceClass, buildHash} → POST to a functions/ route → KV aggregate. LAWS: NO identifiers (no profile/email/wallet/IP-storage; a per-install random nonce rotated monthly, used only for dedup); kids indistinguishable from adults by design; a Settings toggle ('Share anonymous run stats') default ON with plain-words disclosure in the panel + the Claim Ledger encyclopedia; the landing page's no-tracking promise updated honestly ('anonymous gameplay statistics, no personal data, opt-out in Settings'). USES: balance evidence at population scale (047-class decisions from real runs) + perf targeting (which tier/device suffers where). Never sold, never shared, never joined to accounts.
