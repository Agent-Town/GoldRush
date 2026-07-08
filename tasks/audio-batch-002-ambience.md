# Task audio-batch-002: E1 ambience + the stings — the claim's soundscape deepens (ART slot, ElevenLabs)

You are Codex on Robin's Mac. READ FIRST: specs/audio/README.md (grammar laws + BUDGET: this batch cap 4,000 credits, hard floor 5,500 remaining — query before/after, ledger every row); assets/audio/LEDGER.md (batch-001's 28 + listen notes; the owner's mix findings shaped 050/051 — respect the governor: loops get ONE instance, so ambience layers must be SEAMLESS); scripts/gen-audio.mjs (reuse; extend only if a param is missing). .env.local must hold ELEVENLABS_API_KEY (absent/rejected → STOP, no retries vs auth). NEVER print key material.

## Deliverables (~14 sounds, ≤2 takes each; the mix-governor era demands QUALITY loops over quantity)
1. AMBIENCE BEDS (seamless loops ≤8s, -18 LUFS-ish quiet beds): desert-day (dry wind + distant insects) · desert-dusk (crickets sparse) · river-bed-v2 (richer than batch-001's, still governor-single) · town-square (light bustle murmur, NO voices/words — for the town scene) · tavern-interior (wood creak + low murmur, wordless).
2. STINGS & MOMENTS: research-pick sting (pencil + small bell, 1.5s) · epoch-door sting (low brass + steam breath, 3s — for the Stamp Mill completion beat) · baron-arrival sting (dark brass, 2.5s — the horn's villain cousin) · baron-defeat fanfare (4s, brass+bells, triumphant-warm) · town-enter chime (2s, arrival-warm) · founding-stamp thunk (the naming confirm).
3. UI SET COMPLETION: save-tick (tiny pencil scratch, 0.3s) · slot-save confirm (ledger book close, 1s) · sign-in chime (2 notes, post-code).
QA per row: seamlessness note for loops (edge-wrap listen), duration, "reads as", credits before/after. LEDGER batch-002 rows. NO processing, NO src/, no commits.
End: READY-FOR-GATES + credit accounting + QA table.
