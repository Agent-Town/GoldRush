# Task sprite-production-05: THE TOWN FIVE — walk sheets for tavernkeeper, storekeeper, elder, youngster-m, youngster-f (ART slot; the 01-hero v2 pipeline, per character)
**OWNER ORDERS 2026-07-09 (verbatim): "We just need them for the new reference characters now." + "We have a lot of credits now. Lets make these animations good." + "try to not save money by making copies/inverting stuff, lets make it thorough."**
Follow `tasks/art-sprite-production-01-hero.md` v2 EXACTLY (stills-first pipeline, tools, `/tmp` imageio-ffmpeg, 280×340 bottom-aligned cells [verify per character band], 4×8 `#ff00ff` grid, QA + credit-log discipline), ONE CHARACTER AT A TIME in this order:

| # | Character | Turnaround anchor (VERIFY exists first) | Extra identity notes |
|---|---|---|---|
| 1 | Tavernkeeper | `turn-tavernkeeper.png` + batch-009 sprite | apron/towel side: pin from turnaround |
| 2 | Storekeeper | batch-009 sprite + townsfolk-storekeeper raw | if NO turnaround exists: generate one FIRST (A-pose, 5 angles, the turnaround template) and LEDGER it |
| 3 | Elder | `turn-elder.png` + batch-009 sprite | frail, kind, small steps — gait reads AGED, not slow-motion |
| 4 | Youngster-M | `turn-youngster-m.png` | **MINORS ALWAYS CLOTHED (hard law)**; lively short-stride gait |
| 5 | Youngster-F | `turn-youngster-f.png` | same laws as #4 |

## Per character (the v2 pipeline)
1. **Stills first**: 4 direction stills via gpt-image-2 conditioned on the turnaround + their in-game sprite; pin EVERY asymmetric detail's side from the turnaround ONCE (state sides in the run note); QA each still (identity, sides, silhouette) before any video.
2. **Videos**: Seedance 2.0, 4s, 720p, 1:1, per direction from that direction's still + turnaround anchor; identity-first descriptor in every prompt. **THOROUGH: 3 takes per direction, select the best — NO mirrors, NO frame reuse, every direction genuinely generated.**
3. **QA**: identity every frame · pinned sides hold · locked footline · silhouette/limb coherence · drift metric reported.
4. **Extract + composite**: 8 frames, `assets/raw/char-<name>-sheet-walk8.png` (rows down/left/right/up). Evidence → `assets/motion-pilot/production-<name>/`.
5. LEDGER rows + per-gen credit log per character. If a character's turnaround is missing/ambiguous: generate the turnaround first (it becomes a deliverable), never proceed on a weak reference.

## Budget & order
~15 videos/character incl. selects (~270 cr) → ~1350 cr for all five; balance ~2596 (ultra). STOP and report if balance would drop below 400. One character fully done (sheet + note) before the next starts — a crash mid-task loses at most one character's tail.
Firewall: `assets/raw/char-*-sheet-walk8.png` + stills + `assets/motion-pilot/production-*/**` + LEDGER + run notes ONLY. NO src/, NO existing-sprite changes, NO dependency install. **Bandits ×3 = the NEXT batch (06, fire-authorable from this file once 05 ships).**
End: **READY-FOR-GATES** + five 4×8 grids + per-character QA verdicts + sides tables + the credit log.
