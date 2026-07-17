# Review — <slice-name> (<slot/session>)

**Slice:** <task/wave id — what was delegated>
**Branch/tip:** `<branch> @ <full tip hash>`
**Base:** `<base hash>` (<how fresh; anything notable about the branch's history>)
**Verdict:** <PASS — merged to main (<drain id>) | FAIL — reverted, corrective spawned: <task>>

## What it does
<One paragraph, plain language, for the next session that touches this area: what changed, through which seam, and what deliberately did NOT change. State the boundary honored — e.g., "wires into the presentation layer; the sim never notices.">

## Evidence
| Gate | Result |
|------|--------|
| <typecheck> | <GREEN / output> |
| <build> | <GREEN (time)> |
| <the slice's own spec> | **<N/N>** <platforms> (<duration>) |
| <adjacent suite 1> | <N/N unmodified-green> |
| <boot probe> | <N/N — zero console/page errors, plain boot, all platforms> |
| <user-visibility check, if user-facing> | <where the USER sees it, no debug flags> |
| <perf snapshot, if anything renders> | <p95 vs baseline, ratio — within <budget>%> |
| screenshots | `reviews/shots-<slice>/<name>.png`, … |
<!-- Real numbers only. "Tests pass" is vibes. Failures excused ONLY by exact fingerprint match to a documented known-red, with proof it predates this change. -->

## Merge classification
Base `<hash>` → tip `<hash>`. <What moved on main since base, and how it was verified disjoint or resolved.>
| File | Class | Resolution |
|------|-------|-----------|
| <path> | LANE-TOUCHED only | clean apply |
| <path> | MAIN-MOVED too | <3-way judgment: which side won and why> |
| <path> | NEW | free |
<!-- If you are inventing a resolution, stop and re-classify. Stale + conflicted on hot files = RE-LAND, not a hand-merge. -->

## Firewall
<Clean, or the violation and what was done about it. Name what was touched vs the task's TOUCH-ONLY list.>

## Findings
- **F-<slice>-1** — <what was noticed>. <NON-BLOCKING: <reason + who owns it> | CORRECTIVE SPAWNED: `tasks/<name>.md`, queued, same commit.>
- <It is a PASS-compatible act to reject part of the task's own premise here, with a reason — record the rejection, ship the correct thing.>
<!-- Findings are the gate acting as a sensor: everything noticed but out of scope lands here with an F-ID, or it is lost. -->
