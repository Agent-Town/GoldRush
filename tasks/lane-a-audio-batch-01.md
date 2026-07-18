# Task lane-a-audio-batch-01: the first generated-audio batch — ceremony beats + boss stings (LANE-A, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: AGENTS.md; scripts/gen-audio.mjs (the EXISTING generation script — read its usage/params; it consumes the ElevenLabs key from .env.local; NEVER print or log the key); src/systems/AudioSystem.ts + the audio manifest (how sounds are named/loaded — assets/audio/); src/ceremony/scripts.ts (the named beat events awaiting dressing: t4-first-wave, t5-the-hum, and every SOUND name in the T4/T5 scripts); assets/audio/LEDGER.md (the audio ledger law — entries per generation).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/m3 main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green. VERIFY the key works: ONE tiny probe generation first; if the API errors (quota/auth), STOP and report — never retry-loop against a paid API.

## Why (owner 2026-07-18: key located in .env.local, VALID, 9,252/10,000 characters remaining on the free tier; second funded account exists for scale-up)
The ceremony framework emits named sound beats mapped to placeholders; the audio pipeline is owner-ratified generated-first (2026-07-07). This batch dresses the highest-value beats within a HARD BUDGET.

## Scope — BUDGET LAW: ≤6,000 characters total spend this batch (leave ≥3,000 reserve; track cumulative spend in your report; STOP at budget even mid-list)
1. Generate via the existing script, in priority order: (a) the T4 ceremony beats (first-wave, engines, the silence-breaker), (b) the T5 beats (the winch rhythm tick, the hum, the surfacing), (c) three boss stings (Dredge-Queen arrival horn, Homemaker DONE chime, Digger tape-swap click), (d) IF budget remains: the E5 era ambient loop seed. Sound-effect prompts: short, concrete, era-true (brass/steam/water vocabulary — no orchestral epic language; the house is warm and small).
2. Land files per the audio manifest's conventions (assets/audio/raw/ or wherever the loader reads); wire the ceremony placeholder map + the manifest entries to the new files (the beats resolve to REAL sounds).
3. LEDGER entries per generation (assets/audio/LEDGER.md): prompt, chars spent, file, kept/retake.
4. Spec: extend the ceremony spec or a small audio spec asserting the new manifest entries RESOLVE (no 404s) and plain boot stays zero-console.
## Firewall: generation + manifest wiring + ledger + minimal spec. NO AudioSystem redesign, NO re-generating existing accepted sounds, NO key exposure in any file/log/commit.
## Self-check: tsc+build green · spec green both projects · zero console · the character-spend table in your report.
No-op guard: exit-without-changes = WRITE WHY first (incl. API refusals).
END: READY-FOR-GATES + the spend table + files landed + what the reserve should buy next.
