# Task reel-era-projection-v2: the WATCH reel carries its era papers — and the half-stamped reel keeps its honest refusal (EH-3b re-land, lane-d, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2376, from the gate findings of the v1 attempt.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.

READ FIRST: AGENTS.md; **`reviews/reel-era-projection.md`** (the v1 gate — READ IT WHOLE, it is your WHY and it already did your homework: the s2308 veto's premise is measured DEAD, and the two findings below are measured, not suspected); `artifacts/reel-era-gate-s2376/gate.txt` (the raw evidence); `tasks/reel-era-projection.md` (the v1 master — its scope 1–3 is still correct and is carried forward verbatim in intent); `functions/api/standings.ts` (the `?reel=` projection ~`:394`, and the store-side meta validator ~`:1004`); `src/ui/LanternShow.ts` (`validateAgentRunTape` ~`:31`); `src/replay/AgentTapeReplay.ts:184` (the key-set allowlist that accepts BOTH `buildId,engineHash` and `buildId,engineHash,era`).

**The v1 branch `lane/d` @ `5518d9a04` is INTACT and is your salvage reference.** Its diff is 90% correct — take it as your starting point rather than re-deriving it. It was held for two findings only; nothing in it was reverted or lost.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe (ahead content on main = SAFE DUPE → `git checkout -B lane/d main && git clean -fd`, PROCEED; STOP on unmerged ahead content or foreign edits). ⚠️ **THIS LANE IS AHEAD WITH UNMERGED CONTENT ON PURPOSE — `5518d9a04` is the held v1.** That is the one case the safe-dupe wording tells you to STOP on. **You are explicitly authorised to reset over it**, because it is preserved: this master names its hash, the review file names its hash, and the drain that held it left it unmerged deliberately. Cherry-pick or diff from it first (`git diff main...5518d9a04`), THEN reset. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1)** and the **FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — always expected, never a STOP; list and proceed.** Then `npm install --no-audit --no-fund`; `npm run build` green.

## Why

EH-3 shipped the honest projectionist but the public board strips a reel's era papers, so the show refuses everything fail-closed. v1 fixed that correctly and was held for exactly two things, both proven with a control:

1. It updated one half of a deliberately-mirrored two-surface contract. `scripts/agent-reels.test.mjs:52` still asserts the OLD `{ buildId }` shape and **reds on the merged tree while passing on pristine main.** That file is a leg of `test:node-guards`, which every drain runs.
2. A tape with `engineHash` but **no** `era` — a shape `AgentTapeReplay.ts:184` explicitly supports — regressed from an honest *"this reel rode era unknown (unstamped build …)"* refusal to a false *"the county clerk cannot find that reel"*. Measured: `{buildId, engineHash}` on the wire returns `null` from `validateAgentRunTape`, because it only strips-and-re-attaches when era is present.

## Scope

1. **The projection** (as v1): the `?reel=` WATCH response carries the stored tape's `meta.buildId`, `meta.engineHash`, `meta.era`. Read-side only; nothing else about the projection changes; reel handles on board rows stay handles. Retire the s2308 veto comment and **replace it with one naming `af85497537` as what retired its premise**, so the next reader does not re-litigate it.
2. **The half-stamped reel keeps its honest refusal (F-2376-2).** After your change, ALL THREE of these must reach the show rather than `reason:'unavailable'`:
   - `{buildId, engineHash, era}` → plays (or refuses on era MISMATCH, as today)
   - `{buildId, engineHash}` → reaches the **unstamped-era refusal**, naming the build
   - `{buildId}` → reaches the **unstamped-era refusal**, naming the build
   The cure is yours to choose and to JUSTIFY in the report; the obvious candidate is to make `validateAgentRunTape` normalise *any* extra-key meta down to `{ buildId }` before `validateRunTape` (it already does exactly this for the enriched case — generalise it) and re-attach whatever subset it verified. **Do NOT widen `validateTapeMeta`'s `['buildId']` allowlist in `src/game/RunTape.ts` without saying why in the report** — that allowlist is load-bearing for stored/local tapes and is a wider blast radius than this slice needs.
3. **Both halves of the contract (F-2376-1).** `scripts/test-standings.mjs` and `scripts/agent-reels.test.mjs` assert the SAME projected shape. Update both, and in each leave a one-line comment naming the other, so the pair can never again be updated singly.
4. **Tests**: (a) the standings suite asserts the three fields on BOTH storage arms (KV + SQLite/L1); (b) the EH-3 plain-boot WATCH arm plays a stamped reel truly, and the era-MISMATCH arm still refuses; (c) **a NEW arm for the half-stamped tape** asserting the honest unstamped refusal — this is the coverage v1 deleted and is the acceptance test for finding 2; (d) v1's F-2374-2 cure (mint the fixture identity from the live era registry, never a committed exact hash) is carried forward.
5. If the engine hash rotates (these are door/UI/test files — it should NOT, though scope 2 may touch `src/ui` or `src/replay`, which ARE in `ENGINE_SOURCE_INPUTS`): the era-guard duty per the standing law — re-pin `assets/engine-era.json` is the DRAIN's job, not yours; **report it, do not do it.**

## Firewall

Touch ONLY: `functions/api/standings.ts` (the reel projection ONLY — no ranking, no write paths, no caps), `src/ui/LanternShow.ts` and/or `src/replay/AgentTapeReplay.ts` (minimal, for scope 2 only), `scripts/test-standings.mjs`, `scripts/agent-reels.test.mjs`, `e2e/agent-reels.spec.ts` + the fixture machinery, BACKLOG row. NO sim, NO `src/agent/**`, NO worker logic, NO `assets/engine-era.json`, NO `src/game/RunTape.ts` unless scope 2 forces it AND you justify it in the report.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean; `npm run build` green; **`npm run test:node-guards` green — SAY THE COUNT** (this is the battery v1 never ran and is where its red lived; route it through node if the shell refuses the npm form); `npm run test:stats` green both arms with its check count; the reel e2e green BOTH projects including the new half-stamped arm; human-reel suites unmodified-green; zero console/page errors; screenshots to `reviews/shots-reel-era/` of a plain-boot reel PLAYING and of the half-stamped honest refusal. Report: the projection diff, the scope-2 cure and why you chose it over the alternatives, the three-shape table from scope 2 measured end-to-end, and both contract surfaces' new assertions.

End: READY-FOR-GATES + the above.

## No-op / honesty guard

If you are about to exit without changes, WRITE WHY first. If exposing era identity leaks anything beyond `{era, engineHash, buildId}` (rider privacy is the county's law: moves public, mind private), STOP and name it. If scope 2's cure turns out to require widening `validateTapeMeta` after all, that is a legitimate finding — implement the rest, report this one, and do NOT reach further.
