// s1557 — F-1557-1: banner the stale F-1495-1 advertisement, file the finding row.
import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const L = fs.readFileSync(p, 'utf8').split('\n');

// ---- 1. Banner F-1495-1 (line 199 => index 198) --------------------------
const i = 198;
if (!/F-1495-1/.test(L[i])) { console.error('L199 is not F-1495-1 — ABORT'); process.exit(1); }
if (/CURED — DO NOT AUTHOR/.test(L[i])) { console.error('already bannered — ABORT'); process.exit(1); }

const banner =
  '⛔ **CURED — DO NOT AUTHOR FROM THIS ROW (F-1557-1, verified s1557 by FILE-PROBE, never by message-grep — Mistake #16): ' +
  'the `e9-dome-basin` era-socket this row declares FIRE-AUTHORABLE is SHIPPED.** ' +
  '`src/sim/E9CanalSocket.ts:52` returns `new E9CanalSocket(contract, economy, enemies)` for `contract.id === \'e9-dome-basin\'`, ' +
  'and goal leaf `e9-dome-basin-socket` reads `status:"merged"` at `716f3e2989`. ' +
  'ⓘ **This row was structurally INVISIBLE to the s1556 audit that catalogued exactly this class**, because that audit filtered on ' +
  '`FIRE-AUTHORABLE` + `GATE: none` and this row\'s GATE is a prose conditional. ' +
  '⚠️ **And it would have read OPEN on BOTH of its halves**: the substantive half said dome-basin *is* authorable, and the deferring half — ' +
  '*"drains outrank refills and the milk pile holds 7 undrained shifts including two era-sockets"* — has ALSO cleared (the pile is empty, ' +
  'measured s1556 and re-measured s1557). A row whose only brake has been released is the most dangerous kind of stale advertisement. ' +
  '**The `e7-relay-valley` half of this row stands UNCHANGED and is still NOT authorable** (its LOS inertness is an owner-adjacent ' +
  'gameplay-terrain question, not a socket one). ';

L[i] = banner + L[i];

// ---- 2. File F-1557-1 as the new top row --------------------------------
const row =
  '🔬 **F-1557-1 (s1557 2026-08-08, THE DRY-LADDER VERDICT WAS RIGHT AND ITS METHOD COULD NOT HAVE KNOWN THAT — AN AUDIT\'S FILTER IS ITS ' +
  'DENOMINATOR, AND s1556\'s SAW 4 ROWS OF ~40. DISCHARGED IN THE SAME COMMIT).** ' +
  'F-1556-1 concluded *"the authorable ladder is exhausted"* and *"WHAT REMAINS is NOT fire-authorable"* from a scan of the **4** BACKLOG rows ' +
  'marked `FIRE-AUTHORABLE` **+ `GATE: none`**. ✓ **RE-DERIVED s1557 rather than inherited (Mistake #4): `FIRE-AUTHORABLE` appears on 40 lines; ' +
  'after a FULL-LINE scan for dead-markers (CURED/CLOSED/SUPERSEDED/STRUCK/ABSORBED/DISCHARGED/NOT-FIRE-AUTHORABLE), 9 rows carry no retirement ' +
  'marker anywhere on the line.** So the filter that produced the verdict could see **4 of 9 live rows, out of 40 mentions** — and `GATE: none` ' +
  'is precisely the wrong discriminator, because **a SATISFIED conditional gate is exactly as authorable as an absent one** (the ' +
  '"count the CONJUNCTS / read a CLOSING gate\'s disjuncts" class). ' +
  '⚠️ **MATERIALITY PROVED, not asserted — the missed set contains a real member of the very class s1556 was cataloguing: `F-1495-1` (L199) ' +
  'advertises the `e9-dome-basin` era-socket as FIRE-AUTHORABLE, and it is SHIPPED** (`src/sim/E9CanalSocket.ts:52`; leaf `e9-dome-basin-socket` ' +
  '`merged` `716f3e2989`) — so the true tally was never *"3 of 4 cured"*, and the miss was invisible by construction rather than by carelessness. ' +
  '**Bannered in this commit.** ' +
  '🟡 **ALSO MISSED, AND THIS ONE IS GENUINELY OPEN: `F-1285-2` (L1084)** — a drift red at `--workers=1` on `e2e/m4-06-embodiment.spec.ts:410` ' +
  '(0.4846 vs `< 0.45`), red in the fire shell and green in the lane shell, i.e. an INSTRUMENT finding that would amend §3.1 ' +
  '(*`--workers=1` is a floor, not a cure*). Its **GATE: re-run both arms idle** is checkable by any fire — it was simply never looked at. ' +
  '⛔ **NOT ACTIONED s1557, and the reason is itself the evidence: the machine was not idle.** lane-c was running a live Codex job ' +
  '(pid 34965, `f1554-1-node-guards-contention-stamp`, dispatched 13:48) — **the exact confound F-1285-2 names** (*"lane-d ran a heavy Codex job ' +
  'throughout both arms … do not quote 5/5 as this test\'s standing failure rate on an idle machine"*). ' +
  'Worse, running a heavy playwright pair now would have **contaminated lane-c\'s own self-check**, which F-1554-1 requires to run ALONE — ' +
  'a fire measuring an idleness finding would have destroyed the idleness it was measuring, and a neighbour\'s gate with it. ' +
  '➡️ **A fire arriving at a board with ALL FOUR lanes quiet should take F-1285-2 first: it is the one open fire-authorable row, it costs two ' +
  'playwright arms, and it settles a live §3.1 law claim.** ' +
  '💡 **THE REUSABLE HALF, and it is not "s1556 was sloppy" — s1556 verified every row it looked at by file-probe and was right about all four: ' +
  'a filter chosen to make an audit CHEAP silently becomes the audit\'s DENOMINATOR, and the conclusion then inherits the filter\'s blind spot ' +
  'while wearing the evidence\'s authority.** The verdict happened to survive re-derivation here; that is luck, not method. ' +
  'ⓘ **I caught the same shape in my OWN first pass one level down and record it rather than hide it:** my first classifier scanned each row\'s ' +
  'first 900 characters and reported **25** live rows — it read `F-1329-2` as live when a `⛔ SUPERSEDED s1354` banner sits further along the ' +
  'same (single, enormous) line. **A scan WINDOW is a denominator too.** BACKLOG rows are one-line-per-finding and thousands of characters long, ' +
  'so any `head`/`cut`/preview-based read of this file is a sampling instrument, not a census — grep the WHOLE line or you are auditing a prefix. ' +
  '**GATE: none — this row is a correction to a method plus one banner, both landed. The one open item it names (F-1285-2) carries its own gate.**';

L.splice(0, 0, row, '');
fs.writeFileSync(p, L.join('\n'));
console.log('OK — bannered F-1495-1, filed F-1557-1 at top');
