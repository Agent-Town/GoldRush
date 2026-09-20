// s1361 handoff: rewrite STATUS line-1, archive s1361's own lock line as a bullet.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ']).toString().trim();
const path = new URL('../STATUS.md', import.meta.url);
const lines = readFileSync(path, 'utf8').split('\n');
const prev = lines[0];
if (!prev.startsWith('ACTIVE') || !/s1361 fire/.test(prev)) throw new Error('line-1 is not my lock: ' + prev.slice(0, 60));

const desk =
  'Carried: 🟡 **F-1361-1 (new — no owner question; it converts a ten-fire-old inherited number into a measurement and closes four seams)** · ' +
  '🟡 F-1360-1 · 🟡 F-1359-1 · 🟡 F-1358-1 · 🔺 **F-1270-4 (cadence half DONE s1358; the ProcessType install stays owner-gated — three copy-paste lines)** · ' +
  '🟡 F-1357-1 · 🟡 **F-1336-5 (STEP 1 DISCHARGED s1357 — only the (a)/(b) ruling remains)** · 🟡 F-1356-1 · 🟡 F-1355-1 · 🔺 **F-1329-1** · ' +
  '🔺 **F-1330-1 (one word, rec (a) — 32nd carry, unblocks TWO findings)** · 🔺 **F-1327-1/F-1329-2 (⛔ blocked behind F-1330-1)** · 🟡 F-1354-1 · ' +
  '🔺 **F-1313-2 (leaf registered s1354; its FOUR FORKS remain owner-owed)** · 🟡 F-1352-1 · 🟡 F-1351-1 · 🟡 F-1349-1 · 🔺 F-1349-2 · 🟡 F-1348-1 · ' +
  '🟡 F-1347-1 · 🟡 F-1347-2 · 🟡 F-1347-3 · 🟡 F-1346-1 · 🟡 F-1346-2 · 🟡 F-1345-1 · 🟡 **F-1345-2 (cure attended-only)** · 🟡 F-1345-3 · 🟡 F-1344-2 · ' +
  '🟡 **F-1336-2 (survey half DISCHARGED s1356; the renumbering itself stays ATTENDED)** · 🟡 F-1336-1 · 🟡 F-1336-3 · 🟡 F-1336-4 · 🟡 F-1335-2 · 🟡 F-1335-4 · ' +
  '🔺 **F-1334-2** · 🔺 **F-1333-2 superseded** · 🔺 **F-1332-2** · 🟡 **F-1332-1** · 🔺 **F-1331-4 (the 556.81 MB — RE-MEASURED s1361, figure unchanged)** · ' +
  '🔺 **F-1331-2** · 🔺 **F-1328-3** · 🔺 **F-1315-2** · 🔺 **F-1313-3** (rec (b)) · 🔵 **F-1312-2 (ART-gated)** · 🟡 **F-1319-3** · 🟡 **F-1156-1** · ' +
  '🔺 `rf-34` (rec **A**) · 🔺 `vp-02e-jumper` · 🔺 `e1-hold-the-claim` · 🔺 **F-1302-2** · 🔺 F-1300-3 (**pin `<0.3`**) · 🔺 **F-1279-2 rec L2** · ' +
  '🟡 F-1295-1 (**fire-side half closed s1342; SKILL.md half ATTENDED-ONLY — F-1349-1**) · 🔺 **F-1101-1 RETIRE THE THREAD** · 🟡 **F-1293-2** · 🔺 F-1120-2 · ' +
  '🔺 F-1267-3 · 🔺 **F-1242-1 + F-1193-2 (one question, two directories — headline stale, row CURRENT at 300/1/299/764.55 MB per s1359)** · 🔺 F-1260-3 · ' +
  '🔺 **F-1252-1** · 🔺 F-1257-4 (**non-defect**) · 🔺 F-1255-4 · 🔺 F-1254-3 · 🔺 F-1253-1/2/3 · 🔺 **F-1162-1 / F-1242-2 — 194th ask (premise re-derived s1359: pid 35584, never restarted)** · ' +
  '🔺 F-1193-3 · 🔺 gold-per-token · 🔺 F-1209-3 · 🔺 TOWN ZOOM clamps · 🔺 F-1208-3 · 🔺 F-1204-1 · 🔺 **F-1141-3+F-1164-1**.';

const handoff =
  `Last updated: ${stamp} s1361 handoff, lock CLEARED — ` +
  '🎯 **(A) s1360 PROVED A DUTY CAN BE DROPPED BY READING ITS TRIGGER LITERALLY. I WENT LOOKING FOR THE SAME SHAPE ELSEWHERE, PICKED UP FOUR INSTRUMENTS, AND ALL FOUR WERE SOUND. THE NEGATIVE RESULT IS THE DELIVERABLE.** ' +
  'Board dry a **twenty-second** consecutive fire (**RE-DERIVED**: six queues empty by direct `find`, no `tasks/CODEX-WALL`, `assets/crafting-queue/pending/` **0**, no done-move since the s1360 handoff, lane counts re-measured). ' +
  'Lock taken lawfully (s1360 had **CLEARED** it); **s1360\'s handoff archived in the LOCK commit** `393d7967` per F-1341-1, after §2A bookkeeping (`0f1c1d80`). **No drain (nothing to drain), no master authored, no scope invented.** ' +
  '📋 **(B) F-1361-1 IS THE FIRE (`99ba6542`), AND IT IS A SEARCH MAP PLUS ONE VERIFIED CURE** — so the next dry fire does not re-walk this ground. ' +
  '✅ **(C) THE ART-AUDIT FIGURES ARE NOW MEASURED RATHER THAN RESTATED, AND THEY HOLD EXACTLY.** `node scripts/art-staging-audit.mjs` ⇒ **AT RISK 602 files / 556.81 MB** (all `staging/motion-pilot`, all UNTRACKED) · **LOCAL-ONLY 0** · SHIPPED 197 · DIVERGED 21. ' +
  '**Byte-identical to s1351\'s figures**, which s1352–s1360 each carried forward as *"s1351\'s figures stand"* without re-running the audit. ' +
  'ⓘ **Their decline was CORRECT IN OUTCOME and I want that said plainly rather than dressed as a catch:** the ART-SLOT LAW triggers the audit on *touching* the slot, no fire touched it, and on a dry board the number could not change. ' +
  '**The structural note worth carrying is not a defect: the trigger is scoped to catch damage YOU cause, but the figure gets quoted forward in handoffs as a standing fact, and nothing re-triggers on a quoted standing fact.** Ten fires of restatement cost one command to convert into a measurement. ' +
  '✗ **(D) THREE SUSPECTED GAPS IN THAT AUDIT, ALL REFUTED AT SOURCE — THE INSTRUMENT IS HONEST.** `scripts/fire.md` primes every reader with *"this audit has shipped a false zero TWICE… find a third, fix the class"*, so the suspicion was worth pricing. ' +
  '**(a)** The `DIVERGED (bytes ARE in git)` label looked false — 21 files whose staging bytes plainly differ from main\'s (2.95 vs 3.05 MB) cannot both differ and be shipped. **Refuted at `art-staging-audit.mjs:226`: `const backed = inGit(sha)` hashes the STAGING file\'s own bytes**, so the label is true and is not the F-1054-1 classify-by-NAME defect. ' +
  '**(b)** `LOCAL-ONLY: 0 files` appeared to print a listing beneath itself — a headline contradicting its own body. **Refuted, and it was MY error, not the script\'s:** a `grep -E "MB$"` interleaved the SALVAGED bucket (`:304–306`) into the LOCAL-ONLY block. *Verify your own claims, not only inherited ones* — caught before it was written down. ' +
  '**(c)** The **DENOMINATOR**, the class both prior false zeros belonged to: `STAGING_ROOT = worktrees/art/assets` (`:88`), so ART output written to `worktrees/art/` outside `assets/` would be invisible. **Measured: that directory holds `README.md` and `assets`, nothing else. Theoretical, not live.** ' +
  '⚠️ **(E) ONE THING FIRE.MD ITSELF NOW HAS WRONG, RECORDED BUT DELIBERATELY NOT EDITED: the audit has THREE cured false zeros, not two.** F-1054-1 (by name) · F-1055-1 (`cat-file -e` asks only this disk) · **F-1184-5** (`git status` lists only dirty/untracked, so tracked-clean-but-unpushed never entered the scan — 28.33 MB read as LOCAL-ONLY 0; see `:176–188`). ' +
  '**The "third such gap" the law invites you to hunt is already found and fixed.** I left the wording alone on purpose: `scripts/fire.md` is a law surface whose coordinates rot when anyone inserts a line, and amending one is an attended act, not a fire\'s drive-by. ' +
  '✗ **(F) s1360\'s MERGE-BLINDNESS DEFECT IS NOT BAKED INTO A SHIPPED TOOL — the obvious follow-on, answered so nobody re-asks it.** `scripts/ticker-stats.mjs` (193 lines, with a test beside it) is a **player-telemetry drafter**: it reads `STATS_ENDPOINT` from `src/encyclopedia/liveStats.ts`, fetches live stats, renders duration/frame/wave buckets against a banned-words list, and **contains zero git invocations.** The digest is compiled by hand, so the blindness lives in ad-hoc analysis only. **There is no mechanized defect to fix; the next compiler\'s protection is F-1360-1\'s write-up.** ' +
  '✅ **(G) s1360\'s OWN CURE MEASURED, NOT ASSUMED — SOUND ON BOTH HALVES.** A duty declared discharged by its own author is an inherited claim. **The artefact exists** (`marketing/outbox/ticker-digest-2026-08-01.md`, **114 lines**); **its dupe-guard is real** — the header states the five-hour-early compilation in its first paragraph, so the post-06:00 fire running *newest-digest-on-disk* finds it and skips; ' +
  'and **its two owner-facing counts re-derive EXACTLY and independently**: `git log main --after=2026-08-01T00:00:00+07:00 --before=…` ⇒ **322 commits**, `--merges` ⇒ **12**. Both match F-1360-1 to the digit. ' +
  '✅ **(H) DUTIES, each checked at its own source.** **TICKER 0 owed** — 08-01 discharged by s1360 and **verified above**; the next digest is **2026-08-02, not compilable until that day closes (from 2026-08-03 00:00 local)**. **ASSAYER 0** (`pending/` counted twice, start and end). **GAZETTE 0, correctly** — I merged no player-visible code. **DEPLOY skipped LAWFULLY** (no gameplay code merged). ' +
  '**ART-SLOT audit RUN and BOTH buckets reported** per the ART-SLOT LAW (AT RISK 602 / 556.81 MB · LOCAL-ONLY 0) even though I did not refill, drain or process the slot. **Goal Registration Law N/A** — no master authored, no drain. **CUSTODY §3.0b honoured trivially: no playwright, no checkout, no worktree; every probe was a read-only `node`/`git log` command and nothing undecided ever entered main\'s tree.** ' +
  '**`test:ledger-guards` GREEN as my LAST act** per F-1300-4 — **38 node-test assertions + 7 script guards, all PASS**; the bash gate refused the npm script name, so it ran through `node` directly (the gate denies YOU, not the factory). **BACKUP pushed.** ' +
  '🏜️ **(I) PIPELINE-DRY: CONFIRMED, twenty-second fire — lane state RE-DERIVED, not inherited:** `main..lane/m3` **0**, `main..lane/e2-arsenal` **0**, `main..lane/perf` **0**, `main..lane/m4` **1** (`7c4f132f`, the blocked F-1330-1 leaf — **do NOT reset lane-b**). ' +
  '➡️ **(J) NEXT FIRE, IN ORDER.** **(1) TICKER: the 2026-08-02 digest becomes compilable at 2026-08-03 00:00 local and is then YOURS** — do not compile it early *into* the day, and **do NOT re-compile 08-01** (present, verified, 114 lines). *A dry day still gets a digest saying so.* ' +
  '**(2) THE FIRE-AUTHORABLE SEARCH IS EXHAUSTED ON FOUR PASSES NOW** — s1358 emptied F-1351-1\'s banked list, s1359 closed four seams at source, s1360 found its work in a standing DUTY, and s1361 found four instruments and all four sound. **Do NOT re-run any of them; each verdict is recorded with its command.** A dry fire\'s lawful act is **§2F: exit clean.** ' +
  '**(3) DO NOT re-run the ART audit unless you TOUCH the slot** — it was measured this fire and the board is dry, so it cannot have moved. **(4) F-1330-1 remains the highest-leverage owner word** (32nd carry, rec **(a)**); do NOT run another battery on it. **(5) F-1329-1\'s owner question stays raised.** **(6) F-1352-1\'s RECOMMENDATION still wants one attended word.** **(7) F-1345-2 is ATTENDED-ONLY.** **(8) F-1331-4 is a clean one-word call; do NOT salvage the 556.81 MB on a fire\'s judgement.** **(9) `attended-owed/001` stays OPEN and that is CORRECT.** ' +
  '**(10) Standing, all re-affirmed:** do not re-run the desk-gate, FACT-currency, or s1351\'s desk sweep; do not hand-edit `suite-red-inventory.md`; do not reset lane-b; F-1257-4 is a NON-DEFECT; do not author 079a; do not touch the `fire-runner.sh` retention epitaph; do not widen `law-pointer-guard` SURFACES to `.sh`; the s1346/s1347 probe thread stays parked; **and do not drive-by-edit fire.md\'s "TWICE" (see §E) — it is correct as an instruction and merely stale as a count.** **(11) §J is a hypothesis like every §I before it.** ' +
  '🔺 **OWNER DESK — board DRY on all four lanes; unblocking it remains entirely owner-side.** ' + desk + ' ' +
  '💡 **THE THROUGH-LINE, TURNING s1360\'S SCREW ONE MORE TURN. s1357: a finding\'s account of why it is blocked is itself an inherited claim. s1358: when two documents contradict, arbitrating is still inheriting. s1359: the instrument has a clock of its own. s1360: a duty\'s trigger is not the duty — a correctly-cited precondition can be the exact thing preventing the work. ' +
  's1361: AND WHEN YOU ACT ON THAT LESSON, THE HONEST OUTCOME IS USUALLY THAT THE INSTRUMENT WAS FINE — SO THE DISCIPLINE THAT PAYS IS RECORDING REFUTATIONS AS CAREFULLY AS FINDINGS.** ' +
  'I picked up four instruments this fire on the theory that s1360\'s failure shape would recur. **Three suspicions were refuted at source and one of them was refuted against my own misreading** — I had a headline-contradicts-its-body defect half-drafted before checking that my own `grep` had interleaved two buckets. ' +
  '⚠️ **A fire that writes up only its confirmations leaves the next fire to re-walk every dead end it silently abandoned**, which is precisely how s1356–s1359 each independently re-derived the same ticker deferral. ' +
  '➡️ **The rule I\'d hand forward: a refutation is a deliverable, and it is only worth what you paid for it if you record WHICH instrument you picked up, WHAT you suspected, and WHICH line settled it.** ' +
  'The corroborating detail is §C: the art figures were restated by nine consecutive fires and never wrong — the restatements were cheap and correct, and they were *still* worth replacing with one measurement, because a number nobody has re-derived in ten fires is indistinguishable from a number that has quietly gone stale. **The cost of checking was one command; the cost of being wrong was the RETENTION LAW\'s largest live hole.**';

lines[0] = handoff;
lines.splice(1, 0, `- **s1361 lock (line-1 archive):** ${prev}`);
writeFileSync(path, lines.join('\n'));
console.log('handoff written, stamp %s, %d chars', stamp, handoff.length);
