⛔ SHIPPED ALREADY UNDER ANOTHER NAME — DO NOT QUEUE (attended 2026-09-02: `t3-refinery` merged bc388f4c2 as "T3 THE REFINERY — the door to E4 (F-CER-1 fix + valve ceremony)" from `lane-c-t3-refinery-ceremony.md`; the drain-block gate's `Others:` line caught it before dispatch — the successor-master collision class, F-2403 family). Kept for the record; the E3 story loop still owes only `ss-04-e3-beats` and the E3 town era pass.

# Task t3-refinery-ceremony: T3, the Refinery — the E3→E4 megaproject and its played ceremony (lane-c, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; `lore/STORYBOOK.md` THE INTERSTITIALS (near line 631; the line beginning "**T3 · E3→E4 — THE REFINERY.**" is the script: trigger sci-10 + refinery complete; THE HAND: the player opens the crack-tower valve, the twin spigots run, gold fuel and black tar; built at night, lit like E3 taught); `src/meta/Megaproject.ts` (stages, materials, buildTicks, defenseWaves, unlock-by-science: the framework T1 and T2 already use); `src/story/beats.ts` (`e3-ceremony-dynamo/tree/title` ~:295–:320: the T2 ceremony beats, the SHAPE for T3's `e4-ceremony-*` beats); `reviews/ceremony-stage-wiring.md` (how a ceremony stage is wired and gated); `specs/epoch-saga/e4-motor-bundle.md` §A1.2 (the Refinery's art: twin spigots, flare stack).
SEQUENCING LAW: verify `git log --oneline main | grep -q 'ss-04-e3-beats'` (the E3 beats must be merged — they share `beats.ts`); if absent, STOP and report "ss-04-e3-beats not landed". Do NOT gate on `git log -N` with a small N.
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner 2026-09-02 "I would love to be able to play the story as well"; BUILD-PLAN §4 E3 "T3 (S)"; the interstitial script is owner-ratified canon)
The E3 era has a door into it (T2) and none out of it. A player who finishes the Canyon Works' science has nowhere to spend it. T3 closes the loop: science 10 unlocks the Refinery megaproject, the town builds it under defense across runs, and the ceremony hands the valve to the player.

## Scope
1. **The Refinery manifest** in `src/meta/Megaproject.ts`: stages, materials (copper, current, iron per the bundle), buildTicks, defenseWaves, unlock at science 10, following T2's manifest one-for-one; the Claim Office funds it the way T1/T2 are funded (cite the site).
2. **The ceremony T-script:** `e4-ceremony-*` beats with `presentation:'epoch-ceremony'`, steps refinery/valve/title; THE HAND is a real player input (hold to open the valve; touch equivalent), never auto-played; the postscript fires per the postscript law; the town transforms (facade keys) only where art exists (cite files; placeholder-first law otherwise).
3. **Transition:** completing T3 advances the profile's active epoch to `epoch-4-motor` exactly as T2 advances to E3 (cite the reconcile site); the next era's locked door is visible with its teaser.
4. **e2e** `e2e/t3-refinery-ceremony.spec.ts`: seed a profile at science 10 with the Refinery complete (use the existing ceremony harness if T2's spec has one; cite it), play THE HAND, assert the ceremony steps, the epoch advance, and that a plain boot afterwards opens in E4's town; desktop + 390px; zero console/page errors; screenshots to `reviews/shots-t3-refinery-ceremony/`.

## Firewall
Touch ONLY: `src/meta/Megaproject.ts`, `src/story/beats.ts` (append `e4-ceremony-*` only), `src/story/ceremonyPostscripts.ts` (append), the town facade key table if a transform exists, the epoch-advance site, the new spec, BACKLOG row. NO changes to: T1/T2, the sim, contracts, E3 beats (ss-04's), other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; the new spec green desktop + 390px; the T2 ceremony spec (name it) unmodified-green both projects; zero console/page errors; screenshots at the paths above; a perf line for the ceremony stage (frame p95 vs T2's).
End: READY-FOR-GATES + the manifest table, the T-script step list, the epoch-advance evidence.

## No-op / honesty guard
If the megaproject framework cannot express a night-lit build (the script's "built at night, lit like E3 taught"), ship the ceremony without the lighting and file the lighting as a finding; do not fork the framework.
