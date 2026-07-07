# Audio — generated-first pipeline (spec-lite)
Ratified 2026-07-07 (owner: "Generated-first, now"). Key: `ELEVENLABS_API_KEY` in `.env.local` (gitignored line 3) — NEVER committed, NEVER echoed into logs/reports/transcripts, read only via dotenv at generation time.

## Budget law (~20,000 credits total: 10k active key + 10k on a second gifted account, owner 2026-07-07)
- batch-001 hard cap: **4,000 credits** — UNCHANGED despite the bigger pool. The cap exists for the listen-review gate, not scarcity: no batch-002 until the owner has HEARD batch-001 and the grammar is confirmed. Credits are not a reason to skip taste.
- Every generation run queries remaining credits BEFORE and AFTER, writes both to the audio ledger, STOPS at its cap or at the 5,500-remaining floor. Running dry silently is forbidden.
- **Key swap protocol**: when the active pool nears the floor, a desk line asks the owner to locate the second gifted account and swap the `.env.local` line (one edit, same file); generation tasks self-stop cleanly at the floor either way. ≤2 takes per sound; failed takes ledgered with cost, honestly.
- With the doubled pool, the batch roadmap extends: 001 core SFX → 002 E1 ambience + music stings → 003 E2 steam/rail set (rides WP-E2) — each gated on the previous batch's owner listen-review.

## Sound design laws (Frontier Ledger, in audio)
Warm, woody, brassy, handmade — a workshop, not a war. **ADR-001 applies to audio: NO gunshot sounds, ever** — bolts are electric twangs/sparks, mortars are steam-thumps, impacts are timber and dust. SFX short (0.5–2.5s); loops ≤4s seamless. Consistent loudness target (~-14 LUFS note in prompts). Grammar: agent-teal actions = soft chime family · UI = paper/pencil/ledger family · economy = metal-pan/coin/water family · danger = low woody knocks, never shrieks.

## Pipeline
`scripts/gen-audio.mjs` (Node, reads .env.local) → ElevenLabs sound-generation API → `assets/audio/raw/<name>.mp3` + `assets/audio/LEDGER.md` row {name, prompt, seconds, credits, takes, status}. Generation = ART-slot tasks. INTEGRATION is a separate slice (SoundSystem: pooled playback, master volume wired to task 044's Settings stub — its first real job). Silence is the placeholder; the game must keep passing zero-console gates with audio absent.

## Batch plan
batch-001 core SFX (~28 sounds, task exists) → batch-002 E1 ambience + music sting set (after 001 review + credit check) → per-epoch sets ride the epoch WPs (E2 adds steam/rail per its bundle).
