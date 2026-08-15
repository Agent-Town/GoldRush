# Task assay-replay-fidelity: WHY does a live browser tape diverge from its own replay? (lane-d, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; **`tasks/assay-replay-door.md` incl. its attended drain rider (F-ASSAY-1 — the measured divergence this investigates)**; the instrument + fixture it built (`scripts/assay-replay.mjs`, `scripts/fixtures/assay/rob-the-claim-reel.json`, the `?assayReplay` seam); `src/game/RunTape.ts` (recorder — what IS and is NOT captured); the Lantern replay path (`Game.startRunTapeReplay`); the playbook replay suite (curated tapes that DO replay green — the working control).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): ahead commits already on main = SAFE DUPE → `git checkout -B lane/lane-d main && git clean -fd`, PROCEED; STOP only on un-merged ahead content or foreign uncommitted edits. **If the assay-replay-door output is still undrained on this lane, STOP and report (drain-before-refill is the fire's duty).** EVIDENCE-ARTIFACT EXCEPTION (F-1266-1) + FACTORY-CHURN EXCEPTION (F-1407-1) as usual: `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` never a STOP; modified tracked `src/**`/`scripts/**`/`e2e/**`/`tasks/**`/`specs/**`/`reviews/*.md` still STOP. Then `npm install --no-audit --no-fund`; `npm run build` green.

## Why (F-ASSAY-1 — the launch keystone, measured 2026-08-15; SHARPENED after verifying the action semantics)
Rob's LIVE reel replays deterministically (twice byte-identical: the instrument is sound) but does NOT reproduce its recording: recorded `secured w10/280g/fnv1a32:f6390382` vs replayed `unsecured w4/30g/fnv1a32:29454bf2`. VERIFIED (attended): `restart` is the DEATH-SCREEN try-again — it acts only when `state==='dead'` and triggers `resetRun()` (`Game.ts:2885`, `:6917`); pause is a distinct action (`:6891`). The tape holds three restart presses at ticks 4793/4894/5050 → **the live session contained a death + try-again, the recorder kept recording ACROSS lives, and the recorded outcome describes only the FINAL life.** The replay's verdict (died unsecured ~tick 4240, w4) looks like a faithful replay of the FIRST life. **LEAD HYPOTHESIS (test FIRST, cell (c)): the replay path treats the first death as terminal and never consumes the restart → it replays life 1 while the outcome claims the last life.** Also note the arithmetic tension to resolve while measuring: `durationTicks` 9000 = 300s = exactly the recorded `timeAlive` of the FINAL life, yet the restarts sit at ~160s — establish precisely what the recorder's tick counter and duration mean across `resetRun()`. Until live tapes reproduce, NO submitted tape is a verifiable proof; the assay program (owner-ruled launch-gating) is blocked at its foundation.

## Scope — MEASUREMENT MATRIX FIRST, fix second
1. **Matrix (report every cell before any fix):**
   (a) replay the SECOND live reel (Robin's, `bd7400eb-5d78-4e03-8fb5-e3f49ffabf67`, fetch live) — same divergence class or clean?
   (b) record a FRESH controlled tape via playwright in the real browser game (a short scripted run, NO restart) — does it replay to its own hash?
   (c) same, WITH one mid-run restart — does the restart break reproduction?
   (d) a curated playbook tape through the same instrument — confirms the control still reproduces.
   This isolates the class: restarts vs live-input capture vs recording-side gap.
2. **Root cause** — name file:line. Candidate classes to CHECK, not assume: restart handling (does `startRunTape`/the recorder span restarts while replay re-seeds or resets differently?); inputs consumed by the live sim but absent from `entries{t,mx,my,a}` (pointer aim, camera-dependent auto-target, non-seeded RNG draws); hash computed over different event streams live vs replay.
3. **The fix — OWNER-RULED (2026-08-15, verbatim: "yes, one tape per life makes the most sense"): ONE TAPE PER LIFE.** `resetRun()` cuts a fresh tape — a board claim is exactly one life's proof; a tape never spans a death-restart. Implement this shape unless the §1 matrix DISPROVES the lead hypothesis (if the divergence persists on a fresh single-life tape, STOP and report — the ruling targets the restart class, not whatever else the matrix might expose). Sim semantics for LIVE play must not change (determinism law); recording/replay plumbing may.
4. **Prove it**: after the fix, cell (b) (and (c) if restarts were the cause) reproduces byte-for-byte twice; re-run rob's reel and REPORT its status honestly (an old-format tape may stay divergent — if so, say so; Q4 retro-assay policy for pre-fix tapes then becomes an owner line-item, flag it).
5. Update the pinned fixture test per what is now true (green battery, truth asserted — the drain-rider pattern).

## Firewall
Touch ONLY: `src/game/RunTape.ts` (recorder), the replay path (`Game.startRunTapeReplay` + the `?assayReplay` seam), `scripts/assay-replay.mjs`/its test/fixtures, new e2e for the record→replay round-trip.
NO changes to: live-sim semantics (a fix may not alter how a LIVE run plays); `functions/api/**`; ranking; the tape 64KB cap (if the fix needs more data, STOP and report the size math); existing e2e assertions beyond the pinned-fixture truth update.

## Self-check
tsc + build green. The full matrix table with hashes per cell. `npm run test:node-guards` green (pinned test asserts truth). Round-trip e2e green desktop+mobile at `--workers=1`. Adjacent `task-025`/`m1-01`/`m2-01` unmodified-green. Zero console/page errors.
End: READY-FOR-GATES + report: matrix, root cause file:line, the fix side chosen (recorder vs replay), rob's-reel post-fix status, and whether pre-fix live tapes remain unverifiable (owner flag).

## No-op / honesty guard
If the matrix shows fresh no-restart tapes ALREADY reproduce (cause = restarts only), say so plainly — the fix narrows to restart handling and the finding halves. The forbidden green stands: nothing may be tuned to make one specific tape pass; the law is round-trip reproduction for NEW tapes.
