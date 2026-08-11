// s1655 one-shot: splice the F-1655-1 leaf in beside f1643-2, and record the f1643-2 STOP.
// SPLICE, never re-serialize (JSON.stringify would rewrite the whole 910-line-wide file).
import fs from 'node:fs';

const PATH = 'tasks/goals.json';
const L = fs.readFileSync(PATH, 'utf8').split('\n');

const i = L.findIndex((l) => l.includes('"f1643-2-suite-red-inventory-refresh"'));
if (i < 0) throw new Error('anchor leaf not found');

// --- 1. record the STOP on the f1643-2 leaf -------------------------------
const statusIdx = L.findIndex((l, n) => n > i && l.includes('"status"'));
if (statusIdx < 0 || statusIdx > i + 4) throw new Error('status line not where expected');
if (!L[statusIdx].includes('"queued"')) throw new Error('f1643-2 status is not "queued" — re-read before editing');

const stopNote =
  'STOPPED s1655, and this is BOOKKEEPING ON A RUN OUTCOME — it does NOT reverse the owner throttle ruling that attended executed at 19640717b, which stands. ' +
  'The 11:42:59 dispatch ended in ~4 minutes without launching the day-scale suite: that was this master OWN STOP CONDITION firing correctly, not a failure, and it left zero diff. ' +
  'Its runner proved scripts/suite-red-inventory.mjs overwrites logs/suite-red-inventory.md without preserving the additive-only corrections section. ' +
  's1655 verified that independently (the reducer has ZERO occurrences of Corrections, readFileSync(output) or existsSync(output)) and re-measured the blast radius as TEN sections, 291 of 844 lines (34.5%), not one. ' +
  'LIFT CONDITION IS MECHANICAL, NOT AN OWNER WORD: this is blockClass gate-side and must NEVER be carried to the owner desk. It lifts the moment f1655-1-inventory-corrections-preservation merges. ' +
  'TO RESUME: cp tasks/lane-a-f1643-2-suite-red-inventory-refresh.md into tasks/queue/lane-a/ and flip this leaf to queued. The master itself needs no edit; its throttle (nice -n 19, --workers=3) is already correct.';

L[statusIdx] = L[statusIdx].replace('"queued"', '"blocked"');
const pad = L[statusIdx].match(/^\s*/)[0];
L.splice(statusIdx + 1, 0,
  `${pad}"blockClass": "gate-side",`,
  `${pad}${JSON.stringify('blockedReason')}: ${JSON.stringify(stopNote)},`,
);

// --- 2. splice the new sibling leaf in after f1643-2's closing brace ------
const close = L.findIndex((l, n) => n > statusIdx && /^ {16}\},$/.test(l));
if (close < 0) throw new Error('closing brace of the f1643-2 leaf not found');

const note =
  'FIRE-AUTHORED s1655 from the f1643-2 run STOP of 2026-08-11 11:42:59 (tasks/runs/20260811-114259-lane-a-lane-a-f1643-2-suite-red-inventory-refresh.md.log). ' +
  'THE STOP FOUND ONE SECTION; THE AUTHORING RE-MEASUREMENT FOUND TEN. The reducer emits six body headings; the live logs/suite-red-inventory.md carries sixteen. ' +
  'The other ten are hand-authored durable findings accumulated across ~14 fires (s1196, 2026-07-29, s1216, s1223, s1224, s1304, s1425, and the 2026-08-11 aborted-refresh record) totalling 291 of 844 lines, and the next legitimate reduce erases all of them. ' +
  'LOAD-BEARING, VERIFIED NOT ASSUMED: scripts/red-inventory-lookup.mjs:170 parses the corrections table by its exact header and its :161-167 comment states the doctrine (the snapshot is NOT rewritten, that would launder a real drift) and is deliberately fail-closed. ' +
  'The file states a law, a live instrument depends on it, and the only tool that writes the file violates it. ' +
  'The master RULES the preservation contract rather than leaving it open (generated-set derived from the code being edited, non-generated sections preserved byte-for-byte, placement anchored on ## Failing tests, absent-output = today behaviour, and a loss guard that fails CLOSED writing nothing). ' +
  'Tests go into the EXISTING scripts/suite-red-inventory.test.mjs, already rooted in test:node-guards — deliberately no new gate file, because a new one reds gate-caller-audit as a gate with no caller (the trap s1654 hit). ' +
  'Scope 3 requires RED-then-GREEN proof per test: a passing test never executes its violation path. ' +
  'Firewall makes writing the live logs/suite-red-inventory.md a hard STOP — doing so would destroy the 291 lines before the fix protecting them has been reviewed. ' +
  'Sibling scripts/suite-red-inventory-compact.mjs was checked and is NOT affected (it compacts raw JSON, a different subject) — the master says so, to stop a well-meant fix-the-class edit. ' +
  'Three citation keys proved on main before dispatch (1 / 0 / 1) per F-1425-2.';

const B = ' '.repeat(16);
const F = ' '.repeat(18);
const leaf = [
  `${B}{`,
  `${F}"id": "f1655-1-inventory-corrections-preservation",`,
  `${F}${JSON.stringify('title')}: ${JSON.stringify('F-1655-1: the red-inventory reducer must PRESERVE the ten hand-appended sections it does not generate (291 of 844 lines, incl. the corrections table a live instrument parses)')},`,
  `${F}"status": "queued",`,
  `${F}"taskFile": "lane-a-f1655-1-inventory-corrections-preservation.md",`,
  `${F}${JSON.stringify('note_s1655')}: ${JSON.stringify(note)}`,
  `${B}},`,
];
L.splice(close + 1, 0, ...leaf);

fs.writeFileSync(PATH, L.join('\n'));

// --- 3. prove it still parses and says what we think ---------------------
const tree = JSON.parse(fs.readFileSync(PATH, 'utf8'));
let found = 0, blocked = 0;
(function walk(n) {
  if (Array.isArray(n)) return n.forEach(walk);
  if (n && typeof n === 'object') {
    if (n.id === 'f1655-1-inventory-corrections-preservation') { found++; if (n.status !== 'queued') throw new Error('new leaf status wrong'); }
    if (n.id === 'f1643-2-suite-red-inventory-refresh') { blocked++; if (n.status !== 'blocked' || n.blockClass !== 'gate-side') throw new Error('f1643-2 not recorded as gate-side blocked'); }
    Object.values(n).forEach(walk);
  }
})(tree);
if (found !== 1) throw new Error(`expected 1 new leaf, found ${found}`);
if (blocked !== 1) throw new Error(`expected 1 f1643-2 leaf, found ${blocked}`);
console.log('OK — new leaf spliced, f1643-2 recorded blocked/gate-side, JSON parses.');
