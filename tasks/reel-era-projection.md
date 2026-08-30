# Task reel-era-projection: the WATCH reel carries its era papers — the show's fail-closed check gets what it needs (EH-3b, lane-d, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.

READ FIRST: AGENTS.md; **the EH-3 run report tail** (`tasks/runs/20260830-181947-lane-d-true-reel-show.md.log`, final section): the true-reel show merged COMPLETE in its permitted paths, fail-closed by design — *"production standings strips `meta.engineHash` and `meta.era` from WATCH reels ... the browser cannot establish that the recorded engine matches the current engine, so playback now fails closed instead of counterfeiting the ride"* — the door file was outside its firewall, this master admits it; `functions/api/standings.ts` (`:372` the `?reel=` fetch; find the projection that strips tape meta); the show's era-check consumer (where EH-3 reads the reel's era identity and fails closed on absence — align field names exactly); **F-2374-2** (BACKLOG): the EH-3 e2e fixture is gated on EXACT engine-hash equality and self-stales on every src-touching merge — its cure is folded in here.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe (ahead content on main = SAFE DUPE → `git checkout -B lane/d main && git clean -fd`, PROCEED; STOP on unmerged ahead content or foreign edits). **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1)** and the **FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — always expected, never a STOP; list and proceed.** Still-STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. Then `npm install --no-audit --no-fund`; `npm run build` green.

## Why
EH-3 shipped the honest machine: agent reels replay through the county's own engine and re-verify in the viewer's browser — but a reel fetched from the public board arrives without its era papers, so the show refuses EVERYTHING fail-closed. One read-side field and the whole watchability program lights up.

## Scope
1. **The projection**: the `?reel=<id>` WATCH response includes the stored tape's era identity — `meta.era`, `meta.engineHash`, `meta.buildId` (read-side only; the stored tape already carries them; nothing else about the projection changes — reel handles on board rows stay handles).
2. **The consumer**: the show's era check reads those fields (align names with what EH-3 shipped; if EH-3's reader already matches, prove it with the e2e and touch nothing).
3. **Tests**: (a) the standings suite asserts the reel response carries the three fields, BOTH storage arms (KV + SQLite/L1); (b) the EH-3 plain-boot WATCH arm flips from era-refusal to TRUE PLAYBACK for an era-current stored reel — completing the F-2318-1 closure; the era-MISMATCH arm stays green (refusal for a doctored hash); (c) **F-2374-2's cure**: the EH-3 e2e fixture is stamped/minted against the LIVE era registry at test setup instead of a committed exact-hash artifact, so it can never self-stale again — note in the test why.
4. If the engine hash rotates (these are door/UI/test files — it should NOT): the era-guard duty per the standing law, or STOP if that surprises you.

## Firewall
Touch ONLY: `functions/api/standings.ts` (the reel projection ONLY — no ranking, no write paths, no caps), the show's era-read glue if names must align (`src/ui/LanternShow.ts` / `src/replay/**`, minimal), the suites named above + the fixture machinery, BACKLOG row. NO sim, NO `src/agent/**`, NO worker logic, NO `assets/engine-era.json` (unless scope 4 fires, per the law).

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:stats` green both arms; the EH-3 reel e2e green both projects with the plain-boot TRUE-PLAYBACK arm demonstrated; human-reel suites unmodified-green; zero console/page errors; one screenshot of a plain-boot agent reel PLAYING with the hash-match line, to `reviews/shots-reel-era/`. Report: the projection diff, the field names, the F-2318-1 verdict, the fixture-staling cure.
End: READY-FOR-GATES + the above.

## No-op / honesty guard
If you are about to exit without changes, WRITE WHY first. If exposing era identity leaks anything beyond `{era, engineHash, buildId}` (rider privacy is the county's law: moves public, mind private), STOP and name it.
