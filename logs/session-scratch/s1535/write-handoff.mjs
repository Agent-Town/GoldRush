import fs from 'node:fs';

const prev = fs.readFileSync('logs/session-scratch/s1535/prev-line1.txt', 'utf8').trim();
const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const myLock = lines[0];

const body =
  'Last updated: 2026-08-07T19:33Z s1535 handoff, lock CLEARED — 🎯 **THE BOARD WAS DRY, SO THE WORK WAS s1534 NEXT(B) — AND FOR THE SECOND FIRE RUNNING, THE PRESCRIBED CURE WAS WRONG UNTIL THE CORPUS WAS ASKED.** ' +
  '📋 **BOARD ON ARRIVAL:** lock CLEARED (s1534 ended 19:13) · six queues EMPTY · zero undrained done-moves (newest non-`drained-`/`stopped-` entry is still s1517’s `noop-`, the rest janitor `.req` debris) · `tasks/failed/` entirely `shipped-` prefixed · no `CODEX-WALL` · assayer `pending/` EMPTY · only dirt was s1534’s generated `logs/dashboard.html` (committed §2A). **NO DRAIN EXISTED**, and per s1534 NEXT(A) the dryness surfaces were NOT re-derived a sixth time. ' +
  '✅ **F-1534-2 CURED — `desk-declaration-guard` NOW READS THE SLUG AXIS (`1b2828e3`, goal leaf `f1534-2-desk-guard-slug-shape` `10676030`).** The desk routes items under TWO key shapes; this guard knew one, so **a fifth of the live desk was never checked for a declaring row** while it reported PASS. All four slug items now have rows and the guard keys them. ' +
  '🔬 **F-1535-1 — REUSING A PATTERN IS NOT REUSING A PARSER, AND THE LITERAL PRESCRIPTION WOULD HAVE INVENTED THREE DESK ITEMS.** s1534 said to add the `SLUG` shape *reusing the pattern* in `desk-carryforward-guard.mjs`. The pattern is right; what the prescription omits is that **the two guards parse the desk differently** — carryforward keys one item per 🔺 segment inside a 120-char zone, declaration scans the tail FLAT. Measured before building anything (`logs/session-scratch/s1535/slug-widen-probe.mjs`): **ARM A flat = 7 slug hits, 3 SPURIOUS · ARM B 🔺-anchored = 4 hits, 0 spurious.** The inventions: **`e2-incline`**, a MAP NAME inside F-1529-4’s prose, plus two aliases of items already keyed by their own F-ID. ' +
  '💡 *The asymmetry is correct, not an inconsistency: an F-ID anywhere in the tail is always a real finding (that flat scan is how F-1193-2 was caught riding inside another item, s1334), while a backtick is this repo’s ordinary markup for paths, scripts and map names. Two shapes, opposite signal-to-noise, therefore two parsers — a one-line inherited instruction would have flattened that silently.* ' +
  '✓ **ARM B validated against ground truth: 21 of 21 segments keyed, 0 unkeyed, matching the “21 awaiting a word” s1534 wrote in its own header.** ' +
  '✓ **ALL FOUR DECLARING ROWS CARRY A FRESH MEASUREMENT (s1335 precedent — birth text is not a declaration), AND TWO OF THEM MATERIALLY CHANGED THEIR ITEM:** ' +
  '**`rf-34`** — the entire fix is a ONE-LINE deletion of `game.syncHeroVisualHeight?.()`; `git merge-base --is-ancestor 51e92d69 main` answers **ON MAIN**, yet the line is **PRESENT today at `src/game/RunSuspend.ts:842`** in a byte-identical call site — s1104 reversed the CONTENT and left the COMMIT, so the item is *present in history and absent in effect*, which no ahead/behind or `git cherry` probe can see. ' +
  '**`bt-04`** — the first grep was WRONG in a recordable way: camelCase `autoRepair`/`autoCollect` return ZERO and invite “these do not exist”; they do, in snake_case, and `AgentConsent.ts:11–17` already ships all three as ladder grants (`auto_collect` L1, `auto_repair` L1, `auto_pan` L2), so the owner is not being asked to authorise abilities but to supply **policy parameters** — every ability is a boolean (`:27`) and no numeric threshold exists anywhere, which is exactly fork (1)’s “under X%”. ' +
  '**`e3-fairground`** — `SUPPORTED_CONTRACTS` (`HeadlessContractSim.ts:47–63`) admits exactly **12**, fairground absent, `modes=undefined`, door 2 throws at `:239`. ' +
  '**`f1328-1`** — its TITLE’S premise is now **stale on both cited coordinates**: E1 ships 6 contracts, `agent-view.spec.ts:270` asserts the six-id list, and `072-era-activation.spec.ts:241` asserts `toEqual(E1_CONTRACTS)` **derived from the contract file** at `:23`; `f1496-1-drill-yard-fixture-six` is merged at `77a1b19b`. 🚫 **It STAYS blocked** — `blockClass: disputed` is lifted only by an attended session or the owner, and the specs were READ, not RUN, so **no claim is made about main being green.** ' +
  '✓ **TEETH PROVEN BY MANUFACTURING THE DEFECT, NOT BY A GREEN (`logs/session-scratch/s1535/manufacture-defect.mjs`):** control rc=0 at **26 declared (22 F-IDs + 4 slugs)**; deleting each of the four rows in turn → **rc=1 naming exactly that slug and no other**; no spurious candidate ever demanded. Guard suite **28/28** (7 new slug-axis tests incl. the flat-scan trap and the alias case), `desk-carryforward-guard` **9/9** unchanged. ' +
  '**NEXT: (A) IF A DONE-MOVE APPEARS, DRAIN IT** — otherwise the board is still dry and a SHORT fire is the honest act; do not re-derive the dryness surfaces. ' +
  '**(B) THE CHEAPEST REAL WORK IS NOW A RULING, NOT A ROW.** Both desk-visibility axes are mechanised and green: every desk item, in either key shape, is now provably on the board the dashboard renders. What is left on this thread is arithmetic nobody can do for Robin. ' +
  '**(C) THE DESK IS 21 AND UNCHANGED IN MEMBERSHIP — zero drops, zero additions.** F-1534-2 left the BACKLOG by being CURED, not by attrition; it was never a desk item. The four slugs are now DECLARED but still OPEN — a declaring row makes an item visible, it does not answer it. **A fire may route, it may not rule; the lawful shortener is a RULING.** ' +
  '**(D) lanes a/b/c/d were `ahead=0` USABLE at s1533 and were NOT re-measured this fire** (no refill was attempted, so the question never arose) — **re-measure with `node scripts/lane-usable.mjs --all` before any `cp`, and refresh AFTER your evidence commit, never before it (F-1424-3).** ' +
  '🔺 **OWNER’S DESK — 21 awaiting a word.** ';

const desk = [
  '🔺 **F-1167-1 OPEN — the ratified ADVANCE STREAM and eight lazy-GLB `town-*-blender` specs contradict each other; ~10.6% of the red board.** (a) the prefetch is right ⇒ the eight `toEqual([])` assertions are obsolete and the two exclusions at `TownTavernPilot.ts:49` are the bug; (b) pilot GLBs should not be prefetched ⇒ the eight reds are a real regression. **RECOMMENDATION (a). Answering also unblocks F-1532-2.**',
  '🔺 **F-1499-2 OPEN (gates the whole ER-03 wave): DOES A HEADLESS RIDER GET A BODY?** Narrowed by F-1528-3 — the Prospector already has a moving body headlessly, so the question is about the **HERO**. F-ER02-5/6 wait on it. **REC: grow the body.**',
  '🔺 **F-1529-4 OPEN — `claim_damage`, the second storm trigger (7.75× protocol cost for 0 extra waves on `e2-incline`), needs a pick between a RATE-LIMIT and a WINDOW. RECOMMENDATION: a window** — it degrades gracefully under a damage burst where a rate-limit silently drops the tail. **The last item standing on the ER-02 ladder.**',
  '🔺 **F-1522-5 OPEN — RESTART THE LANE RUNNER, still the cheapest win on this list.** pid `35584` was re-verified ALIVE at s1533, up 27d 12h; ten-plus landed fixes to `lane-runner-v3.sh` have never executed. **REC: `kill 35584` then `bash scripts/lane-runner-v3.sh` from the repo root at a quiet moment** — no fire will do this, since it aborts live Codex runs.',
  '🔺 **F-MSD-1 OPEN — 13 of 25 campaign maps cannot be opened. REC: verdict the 12 that can.**',
  '🔺 **F-1501-3 OPEN — motion-pilot staging `AT RISK 582 files / 527.89 MB` (re-measured s1533, LOCAL-ONLY 0). REC: commit the pose-library PNGs, leave the regenerable MP4s, or rule the staging EXEMPT from §10b.**',
  '🔺 **F-1507-1 OPEN — UNIFY LANE+FIRE ON `.nvmrc` 26.4.0.** The fire shell matches; the lane does not. **REC: one line in `~/.zshrc`, `nvm use 23` → `nvm use`. YOUR file, so no fire has touched it.**',
  '🔺 **F-1511-5 OPEN — THE BOARD’S THROUGHPUT CEILING. REC unchanged: narrow, do not raise** — one master per fire from a SPEC SLICE, up to three when each comes from an existing finding row with a stated GATE.',
  '🔺 **F-1510-1 OPEN — is “the enemy goes around the landmark” still the intended read? REC: keep the go-around.**',
  '🔺 **F-MTS-2 OPEN — `AgentGameAdapter` has no verb for two epochs’ defining action. REC: rule on CAPTURE first.**',
  '🔺 **F-MSD-2 OPEN — five reuse maps ship 25 bespoke landmark `.glb` the game can never mount.** One word: was the reuse ruling meant to cover the dressing too?',
  '🔺 **F-MILK-SS-3 OPEN — Dust Flats says “four surveyed fields” and authors three. REC: take the one-word prose fix.**',
  '🔺 **F-1493-3 OPEN — Hill Mine Railcar dying at wave 14 under a 100,000-HP rig: acceptable tuning? REC: accept.**',
  '🔺 **F-1101-1 / `calibrate-suite-workers-v2` OPEN — RECOMMENDATION: RETIRE THE THREAD** (correctness half shipped and guarded; only the lane-shell optimisation is uncalibrated and nobody has felt it).',
  '🔺 **F-1166-1 / `vp-02e-jumper-8way-activation` OPEN — (a) ACCEPT COARSE [recommended] or (b) FINISH THE JUMPER (an ART batch + a src/ slice; it spends money).**',
  '🔺 **F-1532-2 OPEN — the advance-stream walkthrough table, owed ~13 days, deliberately not authored: it documents what is warm at each door, which is exactly the set F-1167-1 branch (b) would change. One owner word unblocks both.**',
  '🔺 **F-1528-3 OPEN — evidence for the desk, not a defect: the headless PROSPECTOR already has a moving body, so F-1499-2 is narrower than it reads.**',
  '🔺 **`rf-34-hero-y-restore-roundtrip` OPEN** (the reserved fork s1104 merged and had to reverse). **NOW DECLARED (row backfilled s1535 with a fresh measurement).** ⚠️ **Re-measured: the commit IS an ancestor of main while the one line it deletes is PRESENT at `RunSuspend.ts:842` — present in history, absent in effect.** Must resuming a saved claim put the Prospector back at exactly the Y it was handed, or is this a render-only `visualY`?',
  '🔺 **`e3-fairground-socket` OPEN** (what does `SUPPORTED_CONTRACTS` admission MEAN; recommendation (c) a diagnostics-only path that is explicitly not an admission). **NOW DECLARED (row backfilled s1535; the 12-contract admission set re-counted from the code).**',
  '🔺 **`bt-04-homestead-automation` OPEN.** **NOW DECLARED (row backfilled s1535).** ⚠️ **The fork is NARROWER than its birth text: all three abilities already ship as permission-ladder grants, so the four questions are about POLICY PARAMETERS (what is X%, what is “idle”, the Law-4 balance ruling, the endless spine) — plus a name collision with the shipped E2 `autoPan`.**',
  '🔺 **`f1328-1-drill-yard-census-debt` OPEN (`blockClass: disputed`)** — **NOW DECLARED (row backfilled s1535).** ⚠️ **Its title’s premise is measured STALE on both cited coordinates** (both specs now agree with the six-contract reality, one by explicit list and one by derivation from the contract file). With the reserved question vacated and scope item 1 merged at `77a1b19b`, is there anything left to reserve — retire the leaf, or restate the dispute?',
].join(' ');

const owes =
  ' **Robin owes (never blocking):** turret-feel + water-feel playtests, Mac full-regression evidence, favicon 16px eyeball, the Baron fortress-wall re-walk (F-BW-19), the Twin Banks bandit-pathing watch (F-BW-14 — code SHIPPED s1450, the watch is what is owed).';

lines[0] = body + desk + owes;
lines.splice(
  1,
  0,
  '- **s1535 lock line (archived):** ' + myLock,
  '- **s1534 handoff (line-1 archive):** ' + prev,
);
fs.writeFileSync('STATUS.md', lines.join('\n'));
console.log('line1 chars:', lines[0].length);
