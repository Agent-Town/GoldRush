# Task sprite-motion-pilot: walk cycles FROM video — the consistency machine (ART slot, higgsfield CLI + local tools)

You are Codex on Robin's Mac. TOOLS: `higgsfield` CLI (logged in, workspace set — `generate create seedance_2_0 --prompt ... --start-image <path> --wait`); ffmpeg if present (`which ffmpeg`; absent → document + use the CLI's frame tools if any, else STOP after generation with files ready). OWNER QUESTION (2026-07-09): "the next pressing matter is the character animation/sprites and consistency there — can Higgsfield help?" This pilot answers it with evidence. Budget: ≤8 video generations this task (log per-gen in the LEDGER).

## The hypothesis
Video frames are temporally coherent by construction → a generated walk LOOP yields an 8–12 frame cycle with better inter-frame consistency than independently-generated grid cells (the current walk4 pain). Kit plate `kit-the-baron.png` + the processed hero sprite = the conditioning anchors (character consistency via reference).

## Scope
1. **Generate walk loops** (Seedance, ~4s each, conditioned on the character's processed sprite/kit plate): HERO side-walk ("walking steadily in place against a plain flat sand-colored background, full body, side view, constant framing, seamless loop, no camera motion" + ANCHOR from the briefs) · HERO down-walk (front view) · BARON side-walk (kit-the-baron conditioned). ≤2 takes each.
2. **Frame extraction**: pick the cleanest single gait cycle inside each video; extract 8 evenly-spaced frames (ffmpeg -vf fps/select); crop/align consistently (constant framing was prompted — verify, note drift).
3. **Assessment sheet** (THE deliverable): for each character, a contact-sheet PNG of the 8 frames side-by-side + honest notes: silhouette consistency across frames? style match vs the in-game sprite? background separability (flat bg → alpha-keyable)? limb coherence? VERDICT per character: pipeline-worthy / needs-different-prompting / dead-end.
4. **NO integration** — this is evidence for the owner's pipeline decision (walk8 sheets would follow as their own batch + SpriteAnimator work if the verdict is GO).
5. Outputs: marketing-adjacent → `assets/motion-pilot/` (videos + contact sheets + NOTES.md with the verdicts + credit costs).

## Firewall
Touch ONLY: assets/motion-pilot/**, LEDGER rows (motion-pilot entries), the run notes. NO src/, NO processed sprite changes, NO sheet replacement.

End: READY-FOR-GATES + the three verdicts + contact sheets called out for the owner.
