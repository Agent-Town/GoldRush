import fs from 'node:fs';

const L = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const prevLine1 = fs.readFileSync('logs/session-scratch/s1520-prev-line1.txt', 'utf8');
const desk = fs.readFileSync('logs/session-scratch/s1520-desk.txt', 'utf8');
const myLock = L[0];

if (!/^ACTIVE .*s1520 fire/.test(myLock)) throw new Error('line-1 is not my lock: ' + myLock.slice(0, 80));
if (!/^Last updated: .*s1519 handoff/.test(prevLine1)) throw new Error('saved prev line-1 is not s1519 handoff');

const body =
  'Last updated: 2026-08-07T11:47Z s1520 handoff, lock CLEARED — 🛠️ **NO DRAIN EXISTED, SO I BUILT THE CURE s1519 ASKED FOR — AND THE CORPUS MEASUREMENT CHANGED ITS DESIGN BEFORE IT SHIPPED.** ' +
  '📋 **BOARD ON ARRIVAL, MEASURED NOT INHERITED:** `tasks/done/` fully drained (newest is s1518’s `drained-0da47f37`) · no failed runs this week · no `CODEX-WALL` · `assets/crafting-queue/pending/` EMPTY · `marketing/outbox/ticker-digest-2026-08-06.md` present, so TK-01 owes nothing · **lane-a BUSY** (runner live on `f1424-4-worker-arm-rates` since 11:17, writing harness self-test arms) and **lane-b BUSY** (picked up `lane-fd3-boards-pass` at 11:34, not mine). **Nothing to drain — correctly, not for lack of looking.** ' +
  '✅ **F-1520-1 (`6a547acf` + `07008eca`) — THE UNWALKED SUCCESSOR POINTER IS NOW GUARDED**, which is s1519 NEXT (C) executed: `scripts/stale-successor-pointer-guard.test.mjs`, wired into `test:ledger-guards` (now **81/81**, 4 new tests, 1.3 ms). A `stopped` leaf may not name a `Successor:` that has already shipped. ' +
  '📏 **THE PARSER IS DELIBERATELY NARROW, AND THAT IS THE FINDING RATHER THAN A CAVEAT.** Successor pointers live in a structured `supersededBy` key AND in prose under **ten** key spellings (`stopReason`, `stopNote`, `drainNotes`, `supersededNote_s1116`, `stoppedNote_s1216`, `authorNotes`, `note`, `priorBlockedReason`, `authorNotesSuccessor`, `reason`). Across all **663** leaves the strict `Successor: <file>.md` form appears **3 times and resolves 3/3, misresolving 0**. ' +
  '⚠️ **A LOOSER PARSER WAS DRAFTED FIRST AND KILLED BY MEASUREMENT:** `f1424-4-lane-shell-worker-arms` carries `authorNotesSuccessor: "SUPERSEDED IN PRACTICE BY f1426-2-…"` and **f1426-2 IS merged** — so the loose reading reds a **correctly parked** leaf, because f1426-2 repaired a BLOCKER and never made the measurement that leaf exists for. *A hedge is not a commitment.* A third test locks the narrowness in, so widening the regex reds on purpose. ' +
  '✅ **PROVEN AGAINST REAL HISTORY, NOT ONLY A FIXTURE — stronger than the s1299/s1300 standard asks.** Replayed over **884 revisions of `tasks/goals.json` since 2026-07-01: exactly 2 stale pairs fire, ZERO false positives.** `tb-stall-census → f1441-2` was live **3.3 d / 114 revisions** — and at `f39cc18fc~1`, the tree immediately before s1519’s cure, the guard reds on exactly that pair, so **it would have caught F-1519-1 the day it landed**. The second, `f1404-1 → f1405-1`, was live **2.4 d / 90 revisions** and nobody had ever named it. **204 board-revisions carried a ghost a 1.3 ms check would have caught.** ' +
  '⚖️ **SCOPE STATED HONESTLY: this catches ONE of the two ghost tells.** F-1518-2’s ghost was an expired *dispatch-time claim* naming no `Successor:` — this guard is blind to it and does not pretend otherwise. ' +
  '🔍 **AND s1519’S "3 CORRECTLY PARKED" WAS RE-VERIFIED BY READING ALL THREE, NOT INHERITED (Mistake #4): CONFIRMED** — `f1424-4-lane-shell-worker-arms` (successor `building` in lane-a right now), `eight-winds-wiring-e2-enemies` (blocked on an ART correction: Coal Thief’s missing southwest row), `anim-8frame-townsfolk` (PIPELINE-DRY pending an owner ruling on whether plaza townsfolk walk at all). ' +
  '🧹 Also committed the accumulated factory telemetry churn (`64d3e0e6`). Backup pushed `bd6c228da..07008eca1`; no gameplay code merged, so no deploy. ' +
  '🚦 **LANES DELIBERATELY NOT REFRESHED:** lane-c is **66** and lane-d **89** commits behind main (both `ahead=0`, clean, USABLE). I left them — the F-1424-3 dispatch-order law wants the refresh **after** the evidence commit at dispatch time, so a speculative refresh now buys nothing and main moves every fire. `lane-usable.mjs` warns the next dispatcher; note `package.json` is among lane-c’s drifted files, so a green there is a **subset** of a green on main. ' +
  '**NEXT: (A)** lane-a’s `f1424-4-worker-arm-rates` is the next drain the moment it lands — it is a *timing* measurement, so gate it `--workers=1` per §3.1 and read F-1507-1 first (the lane runs Node 23.11.1, the fire 26.4.0); **(B)** the **second ghost tell is still unguarded** — an expired dispatch-time claim ("stays stopped … supersedes nothing", written before the successor ran). It is a genuinely harder parse than the one I built and its corpus has **not** been measured; **price it before authoring it**, and do not assume it is as cheap as this one was; **(C)** if a third stale pair ever appears, the battery now names it instead of costing a fire’s attention — so **do not re-audit stopped leaves by hand** (s1519 NEXT B still stands, and is now mechanised). ' +
  desk +
  ' 🆕 **Nothing added to the desk this fire.**';

L[0] = body;
L.splice(1, 0, '- **s1520 lock line (archived):** ' + myLock, '- **s1519 handoff (line-1 archive):** ' + prevLine1);
fs.writeFileSync('STATUS.md', L.join('\n'));

const after = fs.readFileSync('STATUS.md', 'utf8');
console.log('line-1 chars:', body.length);
console.log('s1519 handoff archive bullets:', (after.match(/s1519 handoff \(line-1 archive\)/g) || []).length);
console.log('s1518 handoff archive bullets:', (after.match(/s1518 handoff \(line-1 archive\)/g) || []).length);
console.log('desk header present on line-1:', /OWNER.?S DESK/.test(body));
