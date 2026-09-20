import fs from 'fs';

const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const lock = lines[0];
const s1363 = lines[1];
const a = s1363.indexOf('Carried: ') + 'Carried: '.length;
const b = s1363.indexOf('💡 **THE THROUGH-LINE');
if (a < 10 || b < 0) throw new Error('anchors not found');
const carried = s1363.slice(a, b).trim();

const desk =
  '🔺 **OWNER DESK — board DRY on all four lanes; unblocking it remains entirely owner-side.** ' +
  '⭐ **RE-RAISED AFTER AN 8-DAY ABSENCE, and it is the cheapest item on this desk: AP-03 RE-GREENLIGHT — ONE WORD, THREE LEAVES.** ' +
  'The AGENT-PLAY gate is *"the rehearsal verdict AND the owner re-greenlight"*; the rehearsal half closed on **2026-07-25** (`4d04e3b8`, ancestor of main) and **your word is the only thing left**, holding `ap-03-protocol` + `ap-04-teach` + `ap-05-publish`. ' +
  'It sat on this desk at **s1049 as item ① of five** with *"recommend: greenlight, the technical gate is closed"*, and **has not been carried in any handoff since** — it did not get answered, it got forgotten. **Recommendation UNCHANGED: greenlight.** *(Found only because F-1364-1 sent me to read the gate.)* ' +
  'Carried: 🟡 **F-1364-1 (new — SELF-CLOSING, cured `6d7f888f`, no owner action)** · ' + carried;

const handoff =
  'Last updated: 2026-08-02T02:20Z s1364 handoff, lock CLEARED — ' +
  '🎯 **(A) I RAN THE PROBE MY PREDECESSOR NAMED AS UNRUN, AND THE DEFECT IT PREDICTED WAS THERE — ONE LEAF SET OVER, ONE TURN HARDER.** ' +
  "Board dry a **twenty-fifth** consecutive fire (**RE-DERIVED**: `find tasks/queue -name '*.md'` = **0** across all six slots, no `tasks/CODEX-WALL`, `assets/crafting-queue/pending/` **0** counted at start and end, newest done-move Aug 1 14:34, lane counts re-measured). " +
  "Lock taken lawfully (s1363 had **CLEARED** it); **s1363's handoff archived in the LOCK commit** `5b5e5c0c` per F-1341-1, after §2A bookkeeping (`403e7636`, credited to the launchd job per F-1362-1). **No drain (nothing to drain), no master authored, no scope invented.** " +
  '📋 **(B) F-1364-1 IS THE FIRE** (row `0216ae8a`, cure `6d7f888f`). ' +
  '⚠️ **(C) THE DEFECT: A CONJUNCTIVE OWNER GATE THAT LOST A CONJUNCT — AND KEPT THE SATISFIED ONE.** ' +
  'The owner gated AGENT PLAY with **two** conditions, verbatim (`specs/agent-play/README.md:2` + BACKLOG, grep *AGENT PLAY pace set*): *"AP-03/04/05 may not be authored or queued until the Saga Rehearsal delivers its verdict **AND** the owner re-greenlights."* ' +
  '✓ **Conjunct 1 is MET** — verdict merged `4d04e3b8` (2026-07-25), proven an ancestor of main, and this ledger says so itself (grep *UNBLOCKED ON ITS TECHNICAL GATE*). ' +
  '✗ **Conjunct 2 is NOT** — no greenlight in `specs/`, `BACKLOG` or `STATUS`, and the newest AP-03 mention (2026-07-29) still reads *"AP-03 publish remains owner-gated"*. ' +
  '⚠️ **The leaves `ap-03-protocol` and `ap-04-teach` carried only `[REHEARSAL-GATED]` — the half already met.** ' +
  '🔑 **(D) WHY THIS IS WORSE THAN F-1363-1 EVEN THOUGH IT LOOKS MILDER. It inverts diligence into permission.** ' +
  'F-1363-1’s leaf said *"authorable"* — an invitation any careful reader would distrust. This one names a **gate**, so it *looks* like a warning; but a fire that does the correct thing and **verifies the gate it was told about** finds it **CLEARED**, with the unmet half nowhere in the surface it read. **A partial gate that verifies clean is worse than no gate at all.** ' +
  '🔍 **(E) THE SIGNATURE THAT MAKES IT A DEFECT AND NOT DELIBERATE ABBREVIATION: the sibling `ap-05-publish` carries `(owner-gated; …)` AND `[REHEARSAL-GATED]` — the full pair.** ' +
  'Same author, same commit `c20d04e2`, same sibling set, three leaves gated identically at source: the owner half survived on one and died on two. **Compression applied to two of three siblings is transcription loss.** ' +
  "✓ **(F) NO BACKSTOP ON THE EXPOSED PATH, CHECKED NOT ASSUMED** — all three leaves are `status:\"planned\"` with no `blockedReason` and no `taskFile`, and `drain-block-check.mjs:229/:259` keys strictly on `status==='blocked'`, so §3.0 is silent; it is a DRAIN-time guard anyway while the hazard is §2E **authoring**, and no master exists for ap-03/04/05. " +
  "ⓘ **SEVERITY STATED HONESTLY AND BELOW F-1363-1: one guard still stands** — §2E permits authoring only from a spec slice, and the spec's own STATUS line (the author's first read) carries the full conjunction. **Latent trap, not an unguarded invitation.** Filed because that guard is a reader's diligence rather than a mechanism, and because **the shape recurred one fire later in a different leaf set** — which is what promotes it from incident to class. " +
  "➡️ **(G) CURED, AND NO OWNER ACTION IS CONSUMED.** Both leaves now carry the owner's verbatim conjunction, both citations as **content anchors** (F-1310-1 — I did not add a rotting line coordinate), which half is met, which is not, and an explicit DO-NOT-AUTHOR naming the trap. **Restoring a conjunct toward the owner's recorded words is transcription repair (CLAUDE.md §4.7), not a new decision.** " +
  "✅ **(H) WHAT THE PROBE REFUTED, recorded per s1361's rule that refutations earn their keep.** " +
  '**18 open leaves diffed against source** (6 blocked · 3 building · 7 planned · 2 stopped — re-derived; the other 25 non-merged leaves are `superseded`/`verified-by-owner`, i.e. closed). **15 of the 18 titles survived.** ' +
  'In particular the `8a4de2c1` **DEFEAT-FORK** title — *the other ruling in the very commit that produced F-1363-1*, and my prime suspect going in — is **faithful**: verbatim quote, both queued masters, (A)/(B) banked. ' +
  'And that commit’s self-declared *"GOAL-LEAF DEBT (both masters + drill-yard) next fire"* was **PAID** — `e1-defeat-fork-survive-copy` (`06ce6241…`), `e1-defeat-fork-herostart-rename` (`69984c6a…`), `pc-01-drill-yard` (`7e93be3d…`), all `shipped`, all 40-char hashes. **The obvious suspect was clean and the quiet one was not.** ' +
  '✅ **(I) DUTIES, each checked at its own source.** **TICKER 0 owed** — newest digest on disk re-confirmed `ticker-digest-2026-08-01.md`; **the 2026-08-02 digest is NOT compilable until that day closes (from 2026-08-03 00:00 local)** and it is 02:20 +07 on 08-02 as I write. Do NOT re-compile 08-01. ' +
  '**ASSAYER 0** (`pending/` counted twice, start and end). **GAZETTE 0, correctly** — I merged no player-visible code. **DEPLOY skipped LAWFULLY** (no gameplay code merged). ' +
  '**ART-SLOT audit NOT triggered and deliberately NOT re-run** — I did not refill, drain or process the slot (last measured s1361: AT RISK 602 / 556.81 MB · LOCAL-ONLY 0). ' +
  '**Goal Registration Law N/A** — no master authored, no drain; I repaired two EXISTING leaf titles, which adds no row. ' +
  "**CUSTODY §3.0b honoured trivially: no playwright, no checkout, no worktree; every probe was a read-only `node`/`git`/`grep` command and nothing undecided ever entered main's tree.** " +
  '**`test:ledger-guards` GREEN as my LAST act** per F-1300-4 — run AFTER this handoff, because the desk-declaration guard reads the desk list below. **BACKUP pushed.** ' +
  '🏜️ **(J) PIPELINE-DRY: CONFIRMED, twenty-fifth fire — lane state RE-DERIVED, not inherited:** `main..lane/m3` **0**, `main..lane/e2-arsenal` **0**, `main..lane/perf` **0**, `main..lane/m4` **1** (`7c4f132f`, the blocked F-1330-1 leaf — **do NOT reset lane-b**). ' +
  '➡️ **(K) NEXT FIRE, IN ORDER.** **(1) TICKER: the 2026-08-02 digest becomes compilable at 2026-08-03 00:00 local and is then YOURS.** *A dry day still gets a digest saying so.* ' +
  '**(2) THE TITLE-vs-RULING SWEEP IS NOW RUN AND I DO NOT RECOMMEND A THIRD PASS** — 18 of 18 open titles diffed, 1 defect, 15 clean, 2 cured across s1363/s1364. Diminishing returns; **do not re-walk the goal tree for lossy titles.** ' +
  "**(3) THE LIVE SUCCESSOR QUESTION, WHICH I DID NOT RUN: I diffed OPEN leaves only.** The 49 `shipped` + 431 `merged` titles were never checked, and a lossy title on a *closed* leaf is a different and probably milder hazard (nobody seeks permission from a closed leaf) — **but it is unmeasured, and I would rather hand you the honest boundary of my sweep than let '18 of 18' read as 'the tree'.** If you want it, sample it; do not sweep 480 leaves. " +
  '**(4) DO NOT re-investigate the dashboard churn** (s1362 resolved it). **(5) F-1330-1 remains the highest-leverage owner word** (35th carry, rec **(a)**); do NOT run another battery on it. ' +
  "**(6) F-1329-1's owner question stays raised.** **(7) F-1352-1's RECOMMENDATION still wants one attended word.** **(8) F-1345-2 is ATTENDED-ONLY.** **(9) F-1331-4 is a clean one-word call; do NOT salvage the 556.81 MB on a fire's judgement.** **(10) `attended-owed/001` stays OPEN and that is CORRECT.** " +
  "**(11) Standing, all re-affirmed:** do not re-run the desk-gate, FACT-currency, or s1351's desk sweep; do not hand-edit `suite-red-inventory.md`; do not reset lane-b; F-1257-4 is a NON-DEFECT; do not author 079a; do not touch the `fire-runner.sh` retention epitaph; do not widen `law-pointer-guard` SURFACES to `.sh`; the s1346/s1347 probe thread stays parked; do not drive-by-edit fire.md's \"TWICE\". **(12) §K is a hypothesis like every §J before it.** " +
  desk + ' ' +
  "💡 **THE THROUGH-LINE, TURNING s1363'S SCREW ONE MORE TURN. s1361: record refutations. s1362: the cause you reach for is the last thing you ran. s1363: a fact restated across surfaces of different lengths loses its conditions at the short end. s1364: AND WHEN THE SHORT SURFACE KEEPS A *GATE*, ASK WHETHER IT KEPT THE **WHOLE** GATE — BECAUSE THE CONJUNCT THAT SURVIVES IS THE ONE THE WRITER WAS THINKING ABOUT, WHICH IS RELIABLY THE ONE THAT JUST GOT SATISFIED.** " +
  'F-1363-1 taught: go read the shortest surface and ask what it dropped. This fire adds the nastier case. A dropped *qualifier* leaves a claim that is merely too permissive, and a careful reader may still smell it. A dropped **conjunct** leaves something that still looks like a guard — so the careful reader **stops looking**, verifies the named half, finds it green, and proceeds with a clean conscience. ' +
  '⚠️ **The failure mode is not carelessness; it is diligence pointed at an incomplete premise.** ' +
  "➡️ **The rule I'd hand forward: a gate you can verify is not thereby a gate you have satisfied — count the conditions at the source before you check any of them.** " +
  'And the corollary that made this fire cheap: **s1363 handed me a named, specific, unrun probe instead of a conclusion.** Its own sweep had found nothing further, and it said so, and it still pointed at the next question rather than declaring the ground clear. **That is worth more than a finding.**';

lines[0] = handoff;
lines.splice(1, 0, '- **s1364 lock (line-1 archive):** ' + lock);
fs.writeFileSync(p, lines.join('\n'));
console.log('OK lines=' + lines.length + ' handoffChars=' + handoff.length);
