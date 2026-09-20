import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');

// The line we are about to replace is OUR OWN LOCK LINE — archive it as such.
const myLock = lines[0];
if (!myLock.includes('s1513 fire, lock ACTIVE')) {
  throw new Error('line-1 is not my lock line; refusing to guess: ' + myLock.slice(0, 120));
}

// s1512's handoff was saved verbatim BEFORE the lock overwrote it (the s1472 trap).
const s1512 = readFileSync('logs/session-scratch/s1512-line1.txt', 'utf8').replace(/\n$/, '');
if (!s1512.includes('s1512 handoff, lock CLEARED')) {
  throw new Error('saved file is not s1512 handoff: ' + s1512.slice(0, 120));
}

const handoff = [
  'Last updated: 2026-08-07T08:22Z s1513 handoff, lock CLEARED — 🟩 **TWO DRAINS LANDED, BOTH GATED ON THE MERGED TREE, AND THE LANDMARK RED IS GONE FROM MAIN.**',
  '📋 **BOARD ON ARRIVAL:** one undrained done-move (lane-b f1508-2), lane-c still BUSY, all six queues empty, no CODEX-WALL, `assets/crafting-queue/pending/` empty, digest current (`ticker-digest-2026-08-06.md`, s1511). lane-c reported mid-fire, so the second drain was found by re-triaging from the top after the first — which is exactly what §2 asks for and would have been missed by planning the fire up front.',
  '',
  '⭐ **DRAIN 1 — f1508-2 MERGED `c7284596`** (`red-inventory-lookup` refuses off-disk queries and dates every verdict). Gates: `tsc` rc=0 · `test:node-guards` **346 / 343 pass / 0 fail / 3 skipped**, new arm confirmed BY NAME in the raw output · `test:ledger-guards` **77/77**. No build/Playwright owed — `scripts/` + `docs/` only. **Verified against a CONTROL arm rather than inherited:** pre-merge main returns `NOT-IN-INVENTORY` rc=1 for a bare name, the merged tree refuses with **rc=2**. The date is derived, proven twice — no `2026-07-28` literal in the script, and the guard asserts a **`2031-12-25` fixture**, so hardcoding would red the battery.',
  '',
  '⭐ **DRAIN 2 — f1511-2 MERGED `da540bfb`** (drop the `e1-twin-banks` fence so head-on blocker geometry drives the slide on every tile). 🔑 **THE RUNNER RETURNED `CONDITIONAL GREEN` AND THE CONDITION WAS REAL — it refused to sign off until a supervisor reran `test:node-guards` on a supported Node, instead of bending a test to go green. That is the behaviour we want and it deserves saying out loud.** Discharged at Node **26.4.0**: **rc=0, 346 / 343 pass / 0 fail / 3 skipped**, against the lane\'s rc=1 343/345 on Node 23.11.1 — **both lane reds were purely the [F-1507-1] runtime split**, exactly as diagnosed. Gates: `tsc` rc=0 · `build` rc=0 · `landmark-collision` + `never-trap` **18/18 both projects** `--workers=1` · adjacent `fort-landmark-collision` **2/2** · zero console/page errors. ✅ **`landmark-collision:68` PASSED desktop + mobile — it was `2 FAILED`, reproduced twice, at s1512\'s baseline. [F-1511-2] CURED on a third independent instrument** (s1512 scratch worktree, the lane, and this supervisor arm all agree). `never-trap:88`, the F-BW-10 wedge invariant, **PASSED both** — the cure does not re-open the wedge.',
  '⚙️ **[F-1460-1] CHECKED EXPLICITLY, NOT ASSUMED:** the diff touches `src/entities/`, so a slice-local spec is structurally blind to the sim pins — **`the E2 Baron fights keep their pinned outcomes` PASSED, no pin moved, none re-pinned** ([F-1441-3] holds). The tally is byte-identical to the one I took on the same tree *before* this slice, which is the cleanest evidence available that this routing change moved no guarded number.',
  '',
  '🛡️ **BOTH DRAINS GATED IN A DETACHED WORKTREE (`gate-s1513`, inside the repo root, §3.0b) — main\'s working tree never held undecided content.** Removed cleanly at the end (symlink first, then `git worktree remove`), so it does not become a second `gate-s1455`. Ports probed free before use; the default webServer path on 5188, not the `vite preview` scratch-port route the config comments warn about.',
  '🚀 **DEPLOYED + VERIFIED LIVE** — `scripts/deploy.sh` rc=0, published **`b596dd5a`** and confirmed by polling `version.json` (attempt 5/7). Gameplay code merged, so the deploy law applied. Backup push rc=0 (`9fbd5843c..b596dd5af`). 📰 **One gazette item appended** (f1511-2 is player-visible; f1508-2 is a factory tool and correctly filtered out). TK-01: nothing owed.',
  '',
  '📮 **AUTHORED + DISPATCHED `lane-f1510-3-inventory-names-its-commit.md` → lane-a** in F-1424-3 order: master + leaf + BACKLOG committed **first** (`377ead43`), lane fast-forwarded **second** (32 behind → current), citation key grepped **1 on main AND 1 in the lane** and dependency `c7284596` proved present, `cp` **third**. Key is file-scoped to `scripts/suite-red-inventory.mjs`, so my own prose cannot self-rot it. **lane-a has been idle for days — this is the [F-1511-5] ceiling being pushed against, one master at a time.**',
  '🔍 **THAT MASTER CORRECTS THE FINDING IT IMPLEMENTS.** F-1510-3 RECs *"write `HEAD` into the provenance block"* — but **there is no generated provenance block**: `grep -n "provenance" scripts/suite-red-inventory.mjs` returns **nothing**, and the `## Harness provenance (APPENDED 2026-07-29 …)` section at `logs/suite-red-inventory.md:577` was appended **by hand**. The generator emits provenance *lines* in its header array. A runner following the REC literally would hunt for a block that does not exist, so the master names the real cure site and licenses a negative result if `git rev-parse HEAD` turns out to name the reporting tree rather than the tested one — **which I could not rule out from the generator alone, and say so rather than asserting otherwise.**',
  '',
  '⚠️ **TWO THINGS I DECLINED TO CLAIM.** 🔺 **[F-1510-3] is NOT closed** — f1508-2\'s `--snapshot` cures the *archaeology cost* (it derives the commit on demand, verified: `eb3a8a012`, the last main commit before `stats.startTime`), but the gate says *"the inventory names the commit it was taken at"* and **the inventory still does not**. Deriving ≠ recording. Row kept OPEN with its scope narrowed to that one line rather than closed on a cure that satisfied its purpose but not its predicate — counting a gate\'s conjuncts is the failure class this ledger keeps re-learning. 🔺 **[F-1512-1] did NOT reproduce** (`landmark-collision:157` passed both projects here) — **left OPEN anyway; one non-reproduction is not a closure**, and a flake seen red twice and green once is exactly the shape that gets wrongly retired.',
  '',
  '🆕 **[F-1513-1] FILED, non-blocking, no corrective owed:** the f1508-2 run report transcribed **3 skipped tests as passes** ("346 pass / 0 skipped" vs the measured 343 pass / 3 skipped). Gate outcome identical (`fail 0` either way) so the merge is unaffected — recorded because in this factory a skipped test is an invisible one, and the 3 skips look like a standing battery property rather than anything this slice introduced. **REC: paste tallies, never retype them.**',
  '',
  '**NEXT: (A)** drain `f1510-3` when lane-a reports — it is a small `scripts/`-only slice, so the battery is `tsc` + `test:node-guards` and **no browser work is owed**; expect the runner to report rc=1 with exactly 2 reds if its shell is Node 23.11.1, which the master pre-warns about and which is [F-1507-1], not a defect. **(B)** lanes **b, c and d are idle and the queues are empty** — the [F-1511-5] ceiling holds: one authored master per fire, and I spent mine on lane-a. **(C)** [F-1510-1]\'s mechanical half is now cured, so the owner question is much better informed and may answer itself. **(D)** no drains pending, no failed runs, no CODEX-WALL, assayer queue empty.',
  '',
  '🔺 **OWNER\'S DESK — 16 awaiting a word (0 added this fire; F-1513-1 is a fire-side finding, not an owner question).** 🔺 **[F-1511-5] — THE BOARD\'S THROUGHPUT CEILING IS ONE LANE PER FIRE, AND IT CONTRADICTS YOUR OWN "4–5 LANES CONSTANTLY".** Unchanged and now four fires old. **REC: narrow the cap, do not raise it — keep one-per-fire for masters authored from a SPEC SLICE, allow up to three when each comes from an existing BACKLOG finding row with a stated GATE.** A law change is not a fire\'s call (§7.2). 🔺 **[F-1510-1] — IS "THE ENEMY GOES AROUND THE LANDMARK" STILL THE INTENDED READ?** **The mechanical half is CURED this fire** (`da540bfb`); only your design question remains. **REC: keep the go-around.** 🔺 **[F-1507-1] — UNIFY THE LANE AND FIRE ONTO `.nvmrc`\'s 26.4.0?** **A second datum this fire: it cost f1511-2 a conditional verdict and cost me a rerun.** **REC: one line in `~/.zshrc` — `nvm use 23` → `nvm use` — YOUR file, so no fire has touched it.** 🔺 **[F-1501-3]** motion-pilot staging: `art-staging-audit` reads **AT RISK 582 files / 527.89 MB**. **REC: (a) commit the pose-library PNGs and leave the 49 regenerable MP4s, or (c) rule the staging EXEMPT from §10b.** 🔺 **[f1328-1] — still the cheapest word on the list. REC: close it.** 🔺 **[F-1499-2] — DOES A HEADLESS RIDER GET A BODY?** Both AGENT-READY E2 contracts are unwinnable while the headless hero is `IDLE_INTENTS` forever. **REC: grow the body.** 🔺 **[F-MTS-2]** `AgentGameAdapter` has no verb for two epochs\' defining action. **REC: rule on CAPTURE first.** 🔺 **[F-MILK-SS-3]** Dust Flats says *"four surveyed fields"* and authors **three**. **REC: take the one-word prose fix.** 🔺 **[F-MSD-1]** 13 of 25 campaign maps cannot be opened. **REC: verdict the 12 that can.** 🔺 **[F-MSD-2]** five reuse maps ship 25 bespoke landmark `.glb` the game can never mount. 🔺 **[F-1494-1]** remove `gate-s1455/` and reclaim 14 GB? Provably lossless. **REC: remove.** 🔺 **[F-1493-3]** Hill Mine Railcar dying at wave 14 under a 100,000-HP rig — acceptable tuning? **REC: accept.** 🔺 **[F-1475-1]** e3-fairground diagnostics-only construction path — **REC: (c) a `diagnostic:true` boot flag**; F-1495-1 prices it at **30 contracts** unblocked. 🔺 **[F-1096-2]** rf-34 hero-Y: (A) merge as-is [rec] or (B) terrain-visualY authoritative. 🔺 **[F-1166-1]** vp-02e jumper: (a) accept coarse [rec] or (b) real 8-way art. 🔺 **[F-1294-1]** calibrate-suite-workers-v2 — worth a v3? [rec: RETIRE]. **Robin owes (unchanged, never blocking):** turret-feel + water-feel playtests, Mac full-regression evidence, favicon 16px eyeball.',
].join(' ');

const archives = [
  `- **s1512 handoff (line-1 archive):** ${s1512}`,
  `- **s1513 lock line (archived):** ${myLock}`,
];

const out = [handoff, ...archives, ...lines.slice(1)];
writeFileSync(P, out.join('\n'));

const text = out.join('\n');
console.log('s1512 archive bullets :', (text.match(/s1512 handoff \(line-1 archive\)/g) || []).length);
console.log('desk header present   :', /OWNER'S DESK/.test(handoff));
console.log('line-1 chars          :', handoff.length);
console.log('total lines           :', out.length);
