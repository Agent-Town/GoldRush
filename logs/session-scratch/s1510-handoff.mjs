import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const P = `${ROOT}/STATUS.md`;
const lines = readFileSync(P, 'utf8').split('\n');

// s1509's line-1 was dropped when this fire took the lock; recover it VERBATIM from git.
const prev = execFileSync('git', ['show', '1d5153d73:STATUS.md'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).split('\n')[0];
if (!/s1509 handoff/.test(prev)) throw new Error('recovered line is not the s1509 handoff');

const myLock = lines[0];
if (!/s1510 fire, lock ACTIVE/.test(myLock)) throw new Error('line-1 is not my lock line');

const desk = [
  "🔺 **OWNER'S DESK — 15 awaiting a word (1 added this fire).**",
  "🔺 **F-1510-1 (NEW) — IS \"THE ENEMY GOES AROUND THE LANDMARK\" STILL THE INTENDED READ?** The 08-04 cure for your own *\"the opponents get stuck a lot on the different objects\"* made the slide goal-relative, which fixed the wedge and broke the go-around. **The corrective is already dispatched and does NOT need you** — it hunts a deadband that satisfies both. The word I'd like eventually: whether E2-era enemies should still path politely around scenery, or read blunter on purpose. **REC: keep the go-around.**",
  "🔺 **F-1507-1 — UNIFY THE LANE AND FIRE ONTO `.nvmrc`'s 26.4.0?** Lanes gate on **v23.11.1**, fires on **v26.4.0**; the two differ in `--test-timeout` granularity, in `Math.pow` by 1 ULP (F-1404-2) and in process warnings. **REC: one line in `~/.zshrc` — `nvm use 23` → `nvm use` — which is YOUR file, so no fire has touched it.**",
  "🔺 **F-1501-3** motion-pilot staging: `art-staging-audit` reads **AT RISK 582 files / 527.89 MB**. **REC: (a) commit the pose-library PNGs and leave the 49 regenerable MP4s, or (c) rule the staging EXEMPT from §10b.**",
  "🔺 **f1328-1 — still the cheapest word on the list. REC: close it.**",
  "🔺 **F-1499-2 — DOES A HEADLESS RIDER GET A BODY?** Both AGENT-READY E2 contracts are unwinnable while the headless hero is `IDLE_INTENTS` forever. **REC: grow the body.**",
  "🔺 **F-MTS-2** `AgentGameAdapter` has no verb for two epochs' defining action. **REC: rule on CAPTURE first.**",
  "🔺 **F-MILK-SS-3** Dust Flats says *\"four surveyed fields\"* and authors **three**. **REC: take the one-word prose fix.**",
  "🔺 **F-MSD-1** 13 of 25 campaign maps cannot be opened. **REC: verdict the 12 that can.**",
  "🔺 **F-MSD-2** five reuse maps ship 25 bespoke landmark `.glb` the game can never mount.",
  "🔺 **F-1494-1** remove `gate-s1455/` and reclaim 14 GB? Provably lossless. **REC: remove.**",
  "🔺 **F-1493-3** Hill Mine Railcar dying at wave 14 under a 100,000-HP rig — acceptable tuning? **REC: accept.**",
  "🔺 **F-1475-1** e3-fairground diagnostics-only construction path — **REC: (c) a `diagnostic:true` boot flag**; F-1495-1 prices it at **30 contracts** unblocked.",
  "🔺 **F-1096-2** rf-34 hero-Y: (A) merge as-is [rec] or (B) terrain-visualY authoritative.",
  "🔺 **F-1166-1** vp-02e jumper: (a) accept coarse [rec] or (b) real 8-way art.",
  "🔺 **F-1294-1** calibrate-suite-workers-v2 — worth a v3? [rec: RETIRE].",
  "**Robin owes (unchanged, never blocking):** turret-feel + water-feel playtests, Mac full-regression evidence, favicon 16px eyeball.",
].join(' ');

const body = [
  `Last updated: ${process.argv[2]} s1510 handoff, lock CLEARED —`,
  '🟩 **ONE DRAIN, AND THE BISECT IT STOPPED ON FINISHED FIRE-SIDE IN TWO PROBES.**',
  '🔬 **DRAINED f1507-2 → `bc482de1a`** (docs-only, 66 lines; tsc rc0; three-dot diff touches no run surface —',
  '`build` and a browser battery were not run and are **not owed**, said out loud rather than silently skipped).',
  "**The runner was RIGHT to stop.** The master's proposed GOOD endpoint `f449dd65b` is **itself red**, so",
  '**`e788002cf` (fort-solidity) is EXONERATED** — the hypothesis this row carried for three fires. It refused to',
  'bisect, refused to touch `Enemy.ts`, and wrote a 180-sample read-only probe instead.',
  '🎯 **THAT PROBE IS WHY I COULD FINISH THE JOB IN TWO RUNS RATHER THAN ELEVEN — CULPRIT NAMED:',
  '`70eb5b50d3bb6852b8cd6b6646dec9a2b2af6577`** (*drain(s1445) lane-night-stuck-census, F-BW-10*, 2026-08-04).',
  'Arms, `--workers=1` both projects in detached `gate-s1510` on scratch port 5234: `1761da401` **GREEN 10/10** ·',
  '`e2a6a5641` (culprit parent) **GREEN 2/2** · `70eb5b50d` **RED 2/2** · main RED.',
  "⚠️ **I DID NOT INHERIT THE GREEN ENDPOINT FROM `CLEAN-IN-INVENTORY`, AND THAT IS THE REUSABLE HALF.** The",
  "inventory's markdown lists **failures only**, so its silence about a spec cannot distinguish *ran and passed*",
  'from *never ran* — the exact ambiguity F-1224-3 already documents. Resolved instead from',
  '`logs/suite-red-inventory-compact.json`, whose `suites` tree carries the **332-spec denominator** the markdown',
  'lacks, plus an explicit per-test record: `"ok":true,"status":"passed","duration":4463,`',
  '`"startTime":"2026-07-28T02:59:19.439Z"`. Then re-measured that tree green myself.',
  '🔧 **MECHANISM, read from a 9-insertion/9-deletion diff rather than guessed:** `blockerSlideDirection()`',
  'returned `avoidanceSide()` — position-derived and **constant** for a given approach, so a blocked enemy slid one',
  'way until it cleared the corner. It now returns `Math.sign(moveTarget[axis] - position[axis]) || avoidanceSide()`,',
  "which **flips whenever the enemy crosses the goal's axis**. The spec runs the enemy from directly south to",
  'directly north of `ruined_mining_operation`, so goal-x == blocker-x and the slide points back at the centre from',
  'both sides: 180 samples pinned at `z=-8.652`, `1.845 ≤ x ≤ 2.061`, max x-deviation **0.175** vs `halfX=3.176`.',
  '📮 **AUTHORED + DISPATCHED `lane-f1510-1-blocker-slide-deadband.md` → lane-a** (now BUSY) in the F-1424-3 order:',
  'master+leaf+BACKLOG committed **first** (`e0f48db9`), lane cured **second** (tip archived to',
  '`archive/lane-a-fire-absorbed-9e38976c`), citation key grepped **1 on main and 1 in the lane**, `cp` **third**.',
  'It **FORBIDS** reverting the culprit (it cured a real owner complaint), **FORBIDS** editing either e2e spec (both',
  'are the judges), and **explicitly licenses a NEGATIVE result** — if no deadband greens both, that is a finding,',
  'not a failure.',
  '🧾 **F-1510-2 — the s1445 drain was one of the better-gated merges on the board and still shipped this.** Not',
  'carelessness: its 7-suite adjacent list was chosen by **suite name**, and prose cannot see a call graph. Four e2e',
  'specs consume `Terrain.landmarkBlockers()`; only the slice\'s own `never-trap` was in the battery. One',
  '`grep -rl landmarkBlockers e2e/` finds all four. **I deliberately did NOT build the mechanism** — a helper that',
  'recommends a 40-spec battery gets ignored in two fires, so it needs its corpus measured first.',
  '🗞️ **TK-01: the 2026-08-06 digest is COMPILED** (`marketing/outbox/ticker-digest-2026-08-06.md`, classifier at',
  '`artifacts/tk-2026-08-06/classify.mjs`) — **253 commits / 24 merges / 17 player-visible / 207 bookkeeping**. Written',
  'eight minutes before the 06:00 trigger on an already-complete day, noted in the digest rather than done quietly.',
  '⚠️ **Its caveat inverts yesterday\'s:** the day\'s biggest event — *the county\'s first standing*, an agent securing',
  'The Claim through the **public door** (`c8315de9`) — lands in the FACTORY bucket because its diff touched',
  '`scripts/` and not `src/`. A path-counter cannot see that a tool run was the point.',
  '🗄️ **s1509\'s handoff was DROPPED at lock time and I restored it verbatim from `1d5153d73`** — it was missing from',
  'the archive when I arrived (line 2 held s1508). Exactly the §4 trap; `grep -c` verified 1.',
  '**NEXT: (A)** **refill lanes b/c/d** — all three `ahead=0` USABLE, idle since s1509, and I was at the',
  'one-authored-master cap; this is the third consecutive handoff to name it. **(B)** F-1508-2 (red-inventory-lookup\'s',
  'two false-verdict surfaces) is fire-authorable and small — and F-1510-3 folds into it: the inventory records no',
  'snapshot commit, which is why this fire needed timestamp archaeology. **(C)** drain f1510-1 when lane-a reports.',
  'No gazette item: docs-only merge, not player-visible (filter law). No deploy: no gameplay code merged.',
  desk,
].join(' ');

const out = [body, `- **s1509 handoff (line-1 archive):** ${prev}`, `- **s1510 lock line (archived):** ${myLock}`, ...lines.slice(1)];
writeFileSync(P, out.join('\n'));
console.log('line1 chars:', body.length);
console.log('archive check s1509:', out.filter((l) => l.startsWith('- **s1509 handoff (line-1 archive):**')).length);
console.log('head-2 has ACTIVE-lock pattern?', /ACTIVE 2/.test(out[1]));
