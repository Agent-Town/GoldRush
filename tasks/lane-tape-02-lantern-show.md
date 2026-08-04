CODEX: model=gpt-5.6-sol effort=xhigh

# lane-tape-02-lantern-show — THE LANTERN SHOW: watch a tape (TAPE-02)

ROLE: implementer on lane-c. WORKDIR: worktrees/lane-c (branch lane/c). You implement EXACTLY this task, commit on the lane branch with prefix `tape-02:`, and never touch STATUS.md, reviews/, tasks/queue/, or other lanes.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` must print `lane/c`. Run `git status --porcelain` — if ANY dirty tracked blob exists that is not reachable in git (no commit/stash holds it), STOP and report instead of resetting. If the branch is stale vs main, `git checkout -B lane/c origin/main` ONLY when the worktree is clean. Verify this feature is NOT already on main before writing: `grep -rn "lantern-show\|watchTape\|boot-from-tape" src/ e2e/` must come back empty of an implementation (spec/task mentions don't count). If it is already there, STOP and report SAFE-DUPE.

## WHY (dated evidence)
Owner, 2026-08-04: "I saw that I can record tapes now, but I did not see where I can replay them in town. I thought you worked on that already? This seems interesting. But probably only if the contract leaderboards are established." The leaderboards ARE established (LB-01..03 shipped). TAPE-01 shipped the recorder (`0ef80c1b`, s1297) and its runner correctly refused the viewer pending a ratified semantics extension. That extension is now RATIFIED: `specs/agent-play/tape-02-lantern-semantics.md` (2026-08-04). This task is its implementation.

## READ-FIRST (in order)
1. `specs/agent-play/tape-02-lantern-semantics.md` — THE LAW. Its six semantics rules and four non-negotiable gates bind every line you write.
2. `src/game/RunTape.ts` — the tape format, the ring/kept storage, the TAPE-01 determinism proof machinery (`eventLogHash`).
3. `reviews/tape-01.md` — how the recorder was gated; the replay path it already exercises for the determinism assert (your boot-from-tape starts from THAT code path, not from scratch).
4. The run bootstrapping path in `src/game/Game.ts` (how a contract run boots from contract+seed+difficulty) and the existing spectate/camera grammar.
5. The tape shelf UI (where "Keep this tape" and the latest-ring render — grep `RUN_TAPES_KEY` consumers).
6. `specs/agent-play/README.md` §AP-09 — the theater's voice and the version-law framing.

## SCOPE (numbered, each testable)
1. `annotations?: Array<{ atMs: number; text: string }>` added to `RunTape` as additive-optional per the spec §4: validator (`hasOnlyKeys` list) accepts and PRESERVES it; emitters unchanged; a tape without it replays plain.
2. Boot-from-tape: a replay entry point that boots the sim from `(contract, seed, difficulty, inputLog)` on a FRESH in-memory run — no profile reads beyond what the sim boot itself requires, ZERO writes (spec gate 2: localStorage byte-identical after a full replay).
3. The show: full-screen replay on the run-map renderer — lantern-frame vignette, follow-camera on the primary slot with free pan, intertitle cards for annotations when present.
4. Controls: pause, 1×/2×/4×, restart, wave-skip. No backward scrub (spec §5).
5. Version law: `simVersion` mismatch shows the period-refusal line (write it in the projectionist's voice, ≤2 sentences) and never replays. Refused reels stay listed with date + outcome.
6. WATCH action on the tape shelf (every listed tape, ring or kept). Plain no-debug boot reaches it (Mistake #10).
7. e2e `e2e/tape-02-lantern.spec.ts`: record a short run (or seed a known-good tape fixture via the TAPE-01 path), WATCH it, assert (a) replayed `eventLogHash` equals the tape's on a fresh profile, (b) localStorage byte-identical pre/post replay, (c) doctored `simVersion` → refusal line visible, no replay, (d) controls change playback state, (e) zero console/page errors. Both projects.

## TOUCH-ONLY
`src/game/RunTape.ts` · the run-boot path you need for boot-from-tape (minimal, additive) · new viewer module(s) under `src/ui/` or `src/game/` · tape-shelf UI wiring · `e2e/tape-02-lantern.spec.ts` · `tasks/BACKLOG.md` (goal-leaf line, same commit).

## NO
Standings write path (`functions/api/standings.ts`) · recording/emission code beyond the additive validator key · Balance/Economy/sim logic (if replay needs a sim change, the sim is wrong or your boot path is — STOP and report) · town theater BUILDING (explicitly out per spec §6) · TAPE-03 ("watch this run" from standings — separate task) · any `?debug` gating of the WATCH path.

## SELF-CHECK (before done-move)
tsc clean · `npm run build` green · `e2e/tape-02-lantern.spec.ts` green desktop+mobile · TAPE-01's own suite green UNMODIFIED · adjacent: `e2e/save-slots.spec.ts` + `e2e/restore-validation.spec.ts` green or fingerprint-matched to the red inventory · zero console/page errors on a plain boot · screenshots: the show mid-replay + the refusal line, desktop + 390px, into `reviews/shots-tape-02/`.

READY-FOR-GATES. Report: files touched, the determinism assert's hash pair, the refusal line's wording, screenshot paths.
