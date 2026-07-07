# Task audio-batch-001: the game's first sounds — core SFX set (ART slot, ElevenLabs)

You are Codex on Robin's Mac. READ FIRST: specs/audio/README.md (laws + budget cap are BINDING); .env.local must contain ELEVENLABS_API_KEY — if absent or the API rejects it, STOP and report (no retries against auth). NEVER print the key or any Authorization header into logs, reports, or the run file.

## Deliverables
1. **`scripts/gen-audio.mjs`**: reads .env.local (no new deps if possible — hand-parse the env line; else document), calls the ElevenLabs sound-generation endpoint, writes `assets/audio/raw/<name>.mp3`, appends a row to `assets/audio/LEDGER.md` (create with header: name · prompt · seconds · credits-cost · takes · status · remaining-credits-after). Query remaining credits BEFORE the batch and AFTER every generation; **hard-stop the run at 4,000 credits spent or if remaining < 5,500** (protects the owner's pool), writing the stop honestly.
2. **The core set (~28 SFX, ≤2 takes each, 0.5–2.5s, prompts follow the spec's sound-grammar laws — write each prompt into the ledger):**
   - Combat: spark-bolt fire (electric twang), spark-bolt hit (dry spark), blast-charge arm (wind-up tick), blast-charge boom (steam-thump, NO explosion bass-boom realism), turret fire (brass snap), palisade hit (timber knock), palisade crack (splitting wood), palisade collapse (timber tumble + dust).
   - Economy: pan swish (gravel+water), gold chime (small warm bell), sluice water (≤4s seamless loop), stockpile deposit (coins on wood), demolish (timber disassembly + single sad plank).
   - UI: menu tap (pencil dot), build place (stamp on paper), invalid (dry double-knock), tier-up (short 2-note brass), research pick (page turn + pencil scratch), ledger open (book thump).
   - Agent: prospector hover (≤3s soft steam-hiss loop), chirp-acknowledge (2-note teal chime), chirp-refuse (down-note chime), agent works (tiny ratchet).
   - World: river ambience (≤4s loop), wind gust, wave-start horn (distant brass, warm not martial), victory sting (3s, rising brass+bell), defeat sting (3s, low wood + single bell — melancholy never doom).
3. QA per sound (in the ledger row): duration in bounds, "reads as" one-line listen description, loop seams noted for the 3 loops.

## Firewall
Touch ONLY: scripts/gen-audio.mjs, assets/audio/** . NO src/ changes (integration is a later slice), NO package.json deps without documenting why, NO key material anywhere in output. No commits.

End: READY-FOR-GATES + credits spent / remaining + any sounds that missed the grammar (flagged for retake in batch-002, not silently retried past the take cap).
