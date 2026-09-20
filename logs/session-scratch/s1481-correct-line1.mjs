// s1481 — correct line-1 in place after my own F-1481-2 over-reach was struck.
// Cite by CONTENT and prove the span is unique before replacing it (F-1310-1 / F-1425-2).
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');

const OLD =
  'An E7 master would be **jointly unsatisfiable in exactly the shape s1475 already paid for, twelve times over.** ' +
  '§2E hard limit: needs a design fork ⇒ **DO NOT AUTHOR**. Widening the measurement to all 42 contracts gave ' +
  '**30 walled**, which is what re-prices F-1475-1 on the desk below. ';

const NEW =
  'Widening the measurement to all 42 contracts gave **30 walled**. ' +
  '⚠️ **THEN I STRUCK MY OWN CONCLUSION, SAME FIRE, BEFORE ANY FIRE COULD ACT ON IT — I HAD TREATED A DELIVERABLE ' +
  'AS A PRECONDITION.** A parallel evidence sweep landed while I was writing this handoff and named the escape I ' +
  'had missed; re-reading the template on main confirmed it. `…lane-e2-pressure-socket.md:23`, scope item 4, ' +
  'verbatim: ***“Census re-run for the two refused contracts: admit them (`SUPPORTED_CONTRACTS`)”*** — ' +
  '**opening that door is IN SCOPE for an era-socket slice**, which is exactly how the template’s own two ' +
  'contracts became provable. The wall is the socket’s **work**, not its **blocker**. 🔑 **The real discriminator ' +
  'is whether admission would be HONEST:** fairground stopped because its master *forbade* admission (its ' +
  'crowd-flock objective is deliberately inert, so admitting it would assert playability that does not exist) ' +
  'while still demanding a headless proof. ➡️ **Corrected verdict: 10 of 12 E7/E8/E9 rows stay blocked** — each ' +
  'declares a `missing` consumer whose census stub orders the fix master to *“author one deterministic owner”*, ' +
  'i.e. new gameplay on its own governed surface, the very fork F-1475-1 firewalls. **2 survive: ' +
  '`e7-relay-valley` and `e9-dome-basin`**, which socket systems that ALREADY exist in the browser and declare no ' +
  'residual gap — ⚠️ **but they declare none because they declare no `engineDependencies` at all: they are the ' +
  'F-1480-2 offenders, whose whole point is that an undeclared contract reads as MORE ready than its honest ' +
  'siblings.** So neither is authorable on the strength of a silent field; **the probe for an undeclared missing ' +
  'consumer is the FIRST act of any such master** (the rule s1475 paid 124,606 tokens to earn). ' +
  '*The measurement was right; the inference from it was not — the same shape s1480 struck one fire earlier.* ';

const l = lines[0];
const hits = l.split(OLD).length - 1;
if (hits !== 1) {
  console.error(`anchor matched ${hits} times on line-1 — refusing`);
  process.exit(2);
}
lines[0] = l.replace(OLD, NEW);

// The desk re-pricing must match the corrected verdict, not the struck one.
const DESK_OLD =
  '**So the word does not unblock one socket, it unblocks the construction ' +
  'path for 30 contracts and every era-socket master after them.**';
const DESK_NEW =
  '**So the word does not unblock one socket: it unblocks `e3-fairground` AND the 10 blocked E7/E8/E9 rows in one ' +
  'ruling.** (It does NOT gate `e7-relay-valley`/`e9-dome-basin` — see the strike above.)';
if (lines[0].split(DESK_OLD).length - 1 !== 1) {
  console.error('desk anchor not unique — refusing');
  process.exit(2);
}
lines[0] = lines[0].replace(DESK_OLD, DESK_NEW);

writeFileSync(P, lines.join('\n'));
const prior = (readFileSync(P, 'utf8').match(/s1480 handoff \(line-1 archive\)/g) || []).length;
console.log(`corrected. prior-handoff archive count = ${prior} (expect 1); line-1 length = ${lines[0].length}`);
if (prior !== 1) process.exit(2);
