import fs from 'node:fs';
import { execSync } from 'node:child_process';

const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

// carry forward s1397's findings tail verbatim so nothing silently drops off the board
const prevHandoff = lines.find((l) => l.startsWith('- **s1397 handoff (line-1 archive):**'));
if (!prevHandoff) { console.error('s1397 archive bullet missing'); process.exit(1); }
const tailMarker = 'Carried: ';
const tailIdx = prevHandoff.lastIndexOf(tailMarker);
if (tailIdx === -1) { console.error('carried tail not found'); process.exit(1); }
const carried = prevHandoff.slice(tailIdx + tailMarker.length);

const H = [
  'Last updated: 2026-08-02T18:36Z s1398 handoff, lock CLEARED —',
  '✅ **(A) THE DRAIN LANDED — `2daeb68908a4c0e764d148ee382c82a63bbac908`, and it answers a LAUNCH question the owner needs BEFORE the tag, not after.**',
  '`f1397-1-e1-release-door-drill-yard` (lane-c tip `67d28607`) merged after a full re-gate on the merged tree.',
  '**§3.0 block-check FIRST, `--strict`, before forming an opinion: ✅ CLEAR** (leaf `queued`, not blocked) — and I read the WORD, not the exit code.',
  '🔺 **THE RESULT: the E1 release door now boots ALL SIX shipping E1 contracts.** `e2e/release-build.spec.ts:18` held a five-name roster that predated the owner-ratified sixth contract, and that array drives a parameterised loop — so `e1-drill-yard` had **never** gone through the gate a vE1.0 tag is measured by.',
  '**The runner took the GREEN branch: `e1-drill-yard boots through the E1 release door` passes in both projects. There is no product defect, and the tag is safe on this axis.**',
  'The master was MEASURE-FIRST by design (a red would have been a launch-readiness finding to REPORT, not a bug to fix), so the green is a real answer rather than an absence of evidence.',
  '🔬 **(B) GATES IN A DETACHED WORKTREE (§3.0b), `--workers=1` THROUGHOUT (§3.1).**',
  'tsc clean · build green 1.09s · **release suite 28/28** (14 desktop + 14 mobile) · adjacent **26/26** · node-guards **228/228** · boot probes **16/16** desktop+390px, zero console/page errors.',
  '⚠️ **AND THE HARNESS WAS THE WHOLE GAME HERE — READ THIS BEFORE GATING THIS SPEC AGAIN.**',
  '`playwright.config.ts:40` lists this spec in `claimedByAnotherConfig`, so the DEFAULT config does not collect it at all; it must be run under `playwright.release.config.ts`.',
  'Adjacency was **derived by grep, not inherited**: `grep -rln e1-drill-yard e2e/` yields exactly four specs, and no file imports the spec (it names only itself), so the e2e blast radius is provably closed.',
  '⚠️ **(C) THE TWO-DOT DIFF LIED AGAIN, THE SECOND FIRE RUNNING ON THIS LANE.** `git diff main..lane/e2-arsenal` reported **23 files / 1,197 deletions**; every one is a phantom of a stale base.',
  '`git show 67d28607` is the fact: **one file, +1/−1.** Classified `e2e/release-build.spec.ts` **LANE-TOUCHED**, and `git log 59dacbd3..main -- <path>` **empty** = main never moved it. Clean merge, `main..lane/e2-arsenal` now empty.',
  '🟢 **(D) F-1398-1 — AN AUTHORED MASTER PRESCRIBED A HARNESS THAT CANNOT RUN ITS OWN SPEC, AND MEASURING IT CORRECTED MY FIRST INSTINCT.**',
  'The master told the runner at its lines 38 and 61 to run the spec under the default config — the config that ignores it. **My instinct was "false green"; I measured instead: it prints No tests found and exits rc=1, so it fails LOUDLY.**',
  'The real cost is a runner cycle spent diagnosing a harness error, which this runner absorbed and reported correctly. This is the author-could-not-run-its-own-cure class.',
  'Worth knowing the same config file records the INVERSE direction of this trap already biting once — a grep-derived adjacency swept this spec INTO the wrong harness and manufactured **eight false reds**.',
  '**REC (cheap, mechanical, fire-authorable, deliberately NOT done this fire): the claimed-spec list is machine-readable, so a guard can red when a task file names a claimed spec without naming its owning config.** Filed as its OWN BACKLOG row, not buried inside the drain row (F-1328-3 shape).',
  '👥 **(E) AN ATTENDED SESSION CAME LIVE MID-FIRE, AND THE CORRECT MOVE WAS TO COEXIST, NOT TO STAND DOWN.**',
  'Two commits (`96fb9059`, `a2b34fdb`) landed on top of my push at ~18:22, queueing three masters that the runner has already picked up — **lanes a/c/d are RUNNING with live .pid files**. My lock was untouched and my drain landed before theirs; no collision.',
  '✅ **I discharged the one thing they explicitly handed over.** Their BACKLOG entry ends verbatim: "GOAL-LEAF DEBT (3 masters) next fire." All three masters were queued with **no goal leaves** — invisible to `drain-block-check` and to every sweep that walks the goal tree.',
  '**Three leaves registered `cd85bc8d`** (`e1-headless-twin-banks` + `e1-headless-baron` under `e1-frontier`, `e2-escort-mode-as-data` under `e2-steamworks`), status `building` because the runner had already consumed the queue copies when I measured.',
  '**Registered, NOT authored or gated** — I did not touch their masters. Leaf count 579 → 582, +30 lines, pure additions; the debt line is retired in the same commit as the event, not left half-retired.',
  'ⓘ **The absence was proven with a CONTROL, not asserted:** my walker finds my own leaf from this fire, so its three "NO LEAF" verdicts are a real absence rather than a blind instrument — the trap s1395/s1396/s1397 each recorded, and I built a fresh walker this fire too.',
  '✅ **(F) DUTIES, ALL VERIFIED NOT INHERITED.** **ASSAYER 0** (`pending/` opened, empty). **TICKER 0 owed** — `ticker-digest-2026-08-01.md` present, and it is named for its COVERAGE day, so yesterday is compiled; I listed the directory myself.',
  '**GAZETTE 0, CORRECTLY** — the filter law wants a *player-visible* change and this merge is test-only, so it has no subject. The launch-readiness FACT it establishes is owner-facing and went to the desk, which is where it belongs.',
  '**ART untouched**, law not triggered. **DEPLOY SKIPPED, correctly** — no gameplay code merged. **BACKUP pushed** (`ba60b2d4`).',
  '🚫 **(G) NO SECOND DRAIN EXISTED AND I DID NOT MANUFACTURE ONE; I ALSO DID NOT AUTHOR, AND THAT IS NOT PIPELINE-DRY.**',
  'The three lanes started minutes ago and have produced nothing yet. `lane-usable.mjs --all`: lane-a/c/d **USABLE** but now BUSY, **lane-b `lane/m4` HOLDS** with 9 named paths (owner-blocked `7c4f132f`, genuinely unmerged) — 🚫 **STILL DO NOT RESET IT.**',
  '**Authoring was declined on purpose: every usable lane is occupied, so an authored master would have had nowhere to go, and the attended session is actively driving the ladder.** The board is FULL, not dry — the opposite failure from the last two fires.',
  '➡️ **(H) NEXT FIRE, IN ORDER. (1) DRAIN whichever of the three lanes finishes first** — block-check each first; their leaves now exist, so the check will resolve instead of returning UNKNOWN.',
  'Expect `e1-headless-twin-banks` (lane-a) and `e1-headless-baron` (lane-c, first BOSS driver — E1 bench reaches **5/5** when both land) and `e2-escort-mode-as-data` (lane-d, the one F-CEN rung deliberately promoted out of the post-launch gate).',
  '**(2) The E2 drivers ×4 (hill-mine/trestle/pressure-garden/incline) become authorable once mode-as-data lands** — that is the attended session\'s stated ladder sequence, not my invention.',
  '**(3) DO NOT touch the four files held in `7c4f132f`** — F-1396-4 is an owner carve-out ask. **(4) DO NOT fix cp03** — F-1396-2 is an unresolved attended fork. **(5) DO NOT widen the five SAMPLED roster sites** — measured s1397 as sampling decisions and unlock rulings, not omissions.',
  '**(6) DO NOT author F-CEN-1..8 or an E10 ladder** (post-launch gate, unsatisfied). **(7) Standing, re-affirmed:** don\'t re-run the desk-gate/FACT-currency/s1351/s1369–s1379 sweeps; don\'t widen the goal-tracker ancestry sample; F-1257-4 is a NON-DEFECT; don\'t author 079a; don\'t touch the `fire-runner.sh` retention epitaph; don\'t widen `law-pointer-guard`; do NOT prune `test:ledger-guards`; do NOT re-red `stale-open-candidates`; never hand-edit `suite-red-inventory.md`.',
  '💡 **THE THROUGH-LINE: THE INSTRUMENT CAN BE WRONG IN A WAY THAT LOOKS LIKE THE SUBJECT BEING RIGHT.**',
  's1397 learned an inherited classifier\'s CATEGORIES are an argument. Mine is one layer lower: **the harness a test runs under is part of the claim, and naming the wrong one produces an output that is not a measurement at all.**',
  'A spec excluded by its config returns "No tests found" — which is neither pass nor fail, and would have been reported as a green by anyone reading only for the absence of reds. Here it exited rc=1 and was loud; **that was luck of implementation, not a property of the mistake.**',
  'The cheap discriminator was **reading the config before trusting the command**, which cost one grep. ⓘ At my own expense: I wrote "false green" into my own review before measuring, and had to correct it — the finding\'s severity is lower than my first draft claimed, and saying so is the point.',
  '🔺 **OWNER DESK — nothing I did needs your word, and the cheapest item is unchanged.**',
  '⭐⭐ **F-1396-4 — let a fire carve the FOUR uncontested files out of the blocked `7c4f132f`** (two roster literals, one count, one comment) **and leave the disputed AP-11 fixture blocked.** One word; cures **6 of the 8** remaining red project-results; costs you no design decision.',
  '⭐⭐ **CLOSE LAUNCH (`rf-05-fixed-version`) — the vE1.0 tag + your final E1 walk blessing.** Sole gate on eight ready-to-author rungs (F-CEN-1..8) plus the E10 Static ladder. **NEW AND RELEVANT THIS FIRE: the E1 release door has now been MEASURED to boot all six shipping E1 contracts, including the Drill Yard. That gap is closed before the tag, exactly as intended.**',
  '⭐⭐ **THE 27-MAP CAMPAIGN IS STILL WAITING ON YOU, SINCE 2026-07-18.** You greenlit 27 maps (*"Lets build them as quickly as possible - I will have to test them all!"*) and set the bargain yourself: *"the last column is yours — verdict in one word, I file the rest."* **25 maps are wired, landmarked and playable; all 27 `OWNER VERDICT` cells are `—`.** *Partial verdicts are useful — play as many as you have patience for and I file the rest.*',
  '⭐ **AP-03 RE-GREENLIGHT — ONE WORD, THREE LEAVES, 34th consecutive carry.** Genuine conjunction (`specs/agent-play/README.md:2`); conjunct 1 closed `4d04e3b8`, conjunct 2 (your re-greenlight) genuinely unmet. **Rec UNCHANGED: greenlight.**',
  '💵 Carried from s1367: was the 2026-07-11 pose-library run charged **108 credits or 324**? One `higgsfield account transactions` query at `2026-07-11T13:22Z` settles it.',
  '🟢 **F-1330-1 remains a high-leverage owner word** (69th carry, rec **(a)**).',
  'Carried: 🟢 **F-1398-1 (new — a master named a harness that cannot run its own spec; rc=1, loud not silent)** · ✅ **F-1397-2 CLOSED — the E1 release door boots all 6 E1 contracts** · ✅ **f1397-1-e1-release-door-drill-yard SHIPPED `2daeb689`** · ' + carried,
].join(' ');

lines[0] = H;
// archive my own lock line
const lockIdx = lines.findIndex((l) => l.startsWith('- **s1397 handoff (line-1 archive):**'));
lines.splice(lockIdx, 0, '- **s1398 lock (line-1 archive):** ACTIVE 2026-08-02T18:19Z (s1398 fire) — drained 2daeb689 (F-1397-2 CLOSED); re-triaging, all 6 queues empty');

fs.writeFileSync(p, lines.join('\n'));
console.log('handoff written, line-1 chars =', lines[0].length);
