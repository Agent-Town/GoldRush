# The outside review of 2026-09-24: verdicts, what is done, what is yours

**What this is.** On 2026-09-24 the owner handed the attended session an outside review of the project (Opus 5.5, ten dimensions, 86 findings, 78 of them checked by a second reviewer; file `GoldRush-project-review-2026-09-24.md` in the owner's downloads). The same day three read-only verification passes re-checked every finding against the code on `main` (the review worked from a shallow, store-less clone; this repo has the art store beside it, which changes several verdicts). This page is the result: the verdicts, what was fixed the same day, what is queued as tasks, and the decisions that are the owner's. The review's own text is not reproduced here; each finding is named by its id.

## The verdicts in one table

| Dimension | Findings | Confirmed | Partly (true in substance, a number or cause off) | Refuted or artifact of the store-less clone | Grade given, and whether it is fair |
|---|---|---|---|---|---|
| Process / factory | 9 | 5 | 4 | 0 | D. Fair: the ledgers, the self-auditing dry fires and the argument-limit outage are real |
| Build / deploy | 10 | 6 | 4 | 0 (BUILD-4's wrangler drift was the reviewer's host) | D. Fair, with the clone caveat: `tsc` is green here |
| Testing / CI | 8 | 3 | 5 | 0 ("gates never green" is wrong for the node battery: eight green runs on main this week; right for the e2e inventory of 2026-08-11) | D. Fair on CI and the e2e baseline; too hard on the node battery |
| Repo hygiene | 7 | 5 | 2 | 0 | D. Fair; the tree is 8.4 GB tracked and growing about 1 GB a day |
| Simulation / netcode | 8 | 7 | 1 (SIM-6: the store resolves here; the missing pin is real) | 0 | C. Fair; SIM-1 and SIM-2 are the two that matter |
| Architecture | 9 | 9 | 0 (ARCH-1's drift examples are partly wrong in detail and worse in one place) | 0 | C. Fair |
| Performance | 8 | 5 | 3 (PERF-3's VRAM figure and its budget premise are stale; PERF-6 misses the recorded perf-r2 verdict; PERF-4 is low) | 0 | C. Fair |
| Code quality | 9 | 6 | 3 (QUALITY-3's cadence is per rendered frame, so larger; QUALITY-5 and 6 are low or clone artifacts) | 0 | C. Fair |
| Security | 10 | 7 | 3 (SEC-5 has a fire-side stop already; SEC-6 is three credentials, not five; SEC-9 cites lines that do not exist) | 0 | C. Fair, and the three that matter are small fixes |
| Player UX | 8 | 8 | 0 (UX-7's "no gating" half is partly) | 0 | C. Fair; UX-1 was seen live |

Headline, agreed: the game code is in better shape than the machinery around it, and the leverage is outside `src/`.

## Fixed the same day (2026-09-24)

- **PROCESS-1, confirmed and cured.** `scripts/fire.md` reached 1,049,539 bytes, past the macOS argument limit of 1,048,576; `scripts/fire-runner.sh` passed it as one argument, and 478 fires in a row died at rc=126 since 2026-09-20 while the attended sessions carried every duty. The launcher now reads the law file on stdin (`9e1aca30c`, no line moved), the two liveness probes that read the prompt out of argv now read the runner's lock dir (`76e0f3d09`), and this week's county rotation `r2026w39`, which no fire had minted, is minted and deployed (`b541ac711`). The fires are held by their own lock until the day's attended landings finish, then resume on the next tick.
- **REPO-3, the address half.** A personal address redacted from nine places in seven tracked files (`65e7947cb`). The nine commits that carry it as author are the owner's history question (below).
- **PROCESS-9, partly.** The three desk items that stood only in the STATUS tail are carried into `docs/OWNER-DESK-2026-09-19.md` (`76e0f3d09`).
- **Adjacent, the same morning:** the seven E1 test reds on main root-caused (one contract-data change on Twin Banks, F-TB-1 on the desk; six test-side, being fixed by `tasks/e1-spec-truth-1.md`); the entry-framing-2 landing (`76e22a128`, pin #56) surfaced the strict release build's asset leak (F-SEF2-2), which the review names as BUILD-1's consequence.

## Queued as tasks (Opus implementers, one at a time under the attended drain lock)

| Master | Findings | What it does |
|---|---|---|
| `tasks/sec-signin-hardening-1.md` | SEC-1, SEC-10, SEC-9 | atomic guess counting before the compare, a per-IP cap on `/api/verify`, no counter reset on a new code, `isDev` needs two conditions, the admin token moves to a header with a constant-time compare; the nginx `limit_req` lines written for the owner's droplet evening |
| `tasks/ux-entry-robustness-1.md` | UX-1, UX-2, UX-4, UX-7 | tracking and share links show the start menu and mint no profile; a boot guard with one parchment card for chunk, script and WebGL failures; focus loss clears the keys and freezes the solo pick clock; the first-boot greeting fires where the profile is made |
| `tasks/release-gate-on-deploy-1.md` | BUILD-1, F-SEF2-2, F-SEF2-3 | the E4 hauler leaves the E1 bundle, the release assertion runs on every production deploy, the release suite's two harvest reds measured |
| `tasks/sec-headers-and-data-hygiene-1.md` | SEC-8, SEC-5, SEC-7 | security headers with a report-only CSP measured against a preview boot, the ledger mirror and bug reports out of the repo by rule, bug reports with a retention TTL, a plain-words notice at the sign-in form |
| `tasks/e1-spec-truth-1.md` (running) | the E1 control reds | the six test-side reds re-pinned; the red inventory's misattributed rows corrected |

Filed for authoring next (rows in `tasks/BACKLOG.md`, F-REV-2 to F-REV-7): the campaign runner binds every E1 leg to the Claim's terrain (ARCH-6, a real bug in `gr-sim-campaign`); the T key spawns packs for the whole co-op party (SIM-4); the per-frame save rewrite, the economy replay in the diagnostics and the HUD's unconditional DOM writes (PERF-1, ARCH-7, PERF-5); the art store pinned to a commit the pin records (BUILD-2, SIM-6, REPO-2); a size guard on `artifacts/` per drain (REPO-1, PROCESS-8); co-op join adopting the host's progress for the run (SIM-3).

## The decisions that are the owner's (desk item F-REV-1)

1. **Credentials (SEC-6).** Three have no rotation record since 2026-08-25: the edge API token (it carries DNS edit and Pages edit on the live zone), the coding-agent subscription token, and the voice key. One `ls` on the box, three rotations, one dated line on the F-2299-1 row. Only the owner can do this.
2. **The live seed (SIM-2).** Every human on the public build plays every contract on the seed `gold-rush`; the weekly rotation seeds exist, are minted and enforced by the county door, and are read by nothing under `src/`, so no human ever rides one. Options: (a) humans ride the open rotation's seed per contract (comparable, the board means something); (b) a random seed per run (variety); (c) both, the rotation for ranked runs and random for practice. Recommendation: (a), one helper behind three literals.
3. **The two engines' first disagreement (SIM-1).** The browser seeds the harvest from the debug seed and the headless sim from the run seed, so a human and an agent on the same seed see different seams (demonstrated: three seams against two). The one-line cure re-hashes every human tape, so it needs an era bump on a day the owner names; the ruling of 2026-09-07 ("AI and human users have to have the same options and tools, otherwise it is unfair") says it should happen.
4. **The KV budget (SEC-2).** One visitor can exhaust the shared free-tier write budget in a few hours and break co-op, bug reports and prizes. The Workers Paid plan (about $5 a month) plus separate namespaces fixes most of it; the code side (batching telemetry, wrapping the room connect) is authorable without it.
5. **The droplet (SEC-4, BUILD-6).** Services run as root with no sandboxing and the real client IP is not restored behind the edge; the fixes are unit-file lines and two nginx lines, applied on the box in one evening.
6. **History (REPO-3).** Nine commits on `main` carry the personal address as author. The public switch was on 2026-09-20 with zero forks; a rewrite is cheapest now and is the owner's call.
7. **CI (TEST-1, BUILD-4).** A three-step GitHub workflow (install, tsc, build) on every push needs the owner's account; the draft in `docs/proposals/gate.workflow.yml` names a script that does not exist and pins the wrong Node, and would be corrected first.
8. **The ledgers (PROCESS-2, PROCESS-4, PROCESS-5, REPO-6).** STATUS is 20.5 MB of archived line-1s in one file, BACKLOG 9.2 MB with the findings above its title, the law file 1 MB, and the line-number pointer family shapes the code. Retention-compliant shape: old line-1s rotated into dated archive files, BACKLOG as a short index plus per-epic files, stable anchors instead of line numbers. The retention law is the owner's; the shape is his ruling.
9. **Evidence (REPO-1, PROCESS-8).** 7.4 GB of the 8.4 GB tracked tree is evidence, growing about 1 GB a day; the archive repo or a bucket with an index is the reviewers' path and costs a word and possibly money.
10. **The device verdict (PERF-7, B1).** Every frame-time number in the repo comes from the owner's Mac; the ten-minute phone test on his desk since B1 is the only real measurement.

## Where the review is wrong or overstated (so nobody chases it)

- "A clean clone cannot build" (BUILD-2, REPO-2, SIM-6, TEST-6, QUALITY-6): `tsc` and the headless sim are green here; the failures were the reviewer's store-less clone. What is real is the unpinned store (no lock, no commit recorded in the pin), which has already moved an engine hash mid-heat once.
- "The gates are never green" (TEST-2): the node battery ran green eight times on main this week; the e2e inventory of 2026-08-11 is stale and does carry 547 reds. "The tail never runs" (TEST-3): it runs when the first stage is green, and did three times this week.
- The 6× fire-to-implementation token ratio (PROCESS-3): Codex is unmetered in the accounting, so the ratio is an artifact; measured against the run stats it is about 2.2×.
- PERF-6's sort advice is superseded by the recorded 2026-08-04 verdict in `generated.ts`: the instanced path already sorts and still failed the mobile pixel gate; the only legal fix is a shared atlas and material.
- PERF-3's VRAM figure is hypothetical (only the atlas uploads) and its payload premise is two budget raises stale; the download half (127 MB of PNG cells) is exact.
- SEC-6 names five credentials; one is an account identifier and one was rotated on 2026-09-06. Three remain.
