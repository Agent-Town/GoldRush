// s1655: propagate owner ruling (3) of 2026-08-11 — "F-1166-1 RULED (b)" — into the vp-02e leaf.
// The leaf was already flipped to `superseded` by attended at 19640717b, but kept a LIVE owner-fork
// refusal citing a finding the owner has now answered, which is what ruling-propagation-guard flags.
// NOTHING IS DELETED: the prior block text is moved verbatim into note_s1655 (RETENTION LAW; and the
// note_s* family is a first-class closure-reason key for drain-block-check / goal-closure-reason).
import fs from 'node:fs';

const PATH = 'tasks/goals.json';
const raw = fs.readFileSync(PATH, 'utf8');
const L = raw.split('\n');

const idIdx = L.findIndex((l) => /"id": "vp-02e-jumper-8way-activation"/.test(l));
if (idIdx < 0) throw new Error('vp-02e leaf not found by id');

// Find its blockClass / blockedReason lines (each is a single physical line in this file).
const bcIdx = L.findIndex((l, n) => n > idIdx && n < idIdx + 12 && /^\s*"blockClass":/.test(l));
const brIdx = L.findIndex((l, n) => n > idIdx && n < idIdx + 12 && /^\s*"blockedReason":/.test(l));
if (bcIdx < 0 || brIdx < 0) throw new Error('blockClass/blockedReason not found near the leaf');

const pad = L[brIdx].match(/^\s*/)[0];
const priorClass = JSON.parse(`{${L[bcIdx].trim().replace(/,$/, '')}}`).blockClass;
const priorReason = JSON.parse(`{${L[brIdx].trim().replace(/,$/, '')}}`).blockedReason;

const note =
  'OWNER RULING PROPAGATED s1655 (2026-08-11). The owner RULED F-1166-1 as option (b) the same morning, verbatim: "this is not too much to do, lets fix things when we can" — recorded in tasks/BACKLOG.md line 1 as ruling (3) of three. ' +
  'Attended had already flipped this leaf to superseded at 19640717b and authored both successors (art-jumper-rotation-regen in the ART slot, lane-c-jumper-8way-wiring banked art-gated), but the leaf kept a LIVE owner-fork refusal citing the very finding the owner had just answered. ' +
  'scripts/ruling-propagation-guard.mjs caught it on my closing test:ledger-guards run — the s1301 law working exactly as written: the battery runs after the bookkeeping, and it saw a surface the bookkeeping had missed. ' +
  'A stale refusal is not cosmetic: a fire reading this leaf would have refused authorable work as an unanswered owner fork, which is the precise cost F-1383-1 describes. ' +
  'NOTHING WAS DELETED — the prior refusal is preserved verbatim here. PRIOR blockClass: "' + priorClass + '". PRIOR blockedReason: ' + priorReason;

// Replace the two refusal keys with one note_s* key. Order: keep the leaf shape stable.
L.splice(bcIdx, brIdx - bcIdx + 1, `${pad}${JSON.stringify('note_s1655')}: ${JSON.stringify(note)},`);
fs.writeFileSync(PATH, L.join('\n'));

// --- verify -------------------------------------------------------------
const g = JSON.parse(fs.readFileSync(PATH, 'utf8'));
let leaf = null;
(function w(n) {
  if (Array.isArray(n)) return n.forEach(w);
  if (n && typeof n === 'object') {
    if (n.id === 'vp-02e-jumper-8way-activation') leaf = n;
    Object.values(n).forEach((v) => { if (v && typeof v === 'object') w(v); });
  }
})(g.goals);
if (!leaf) throw new Error('leaf vanished');
if (leaf.status !== 'superseded') throw new Error('status changed unexpectedly');
if (leaf.blockedReason || leaf.blockClass) throw new Error('refusal keys still present');
if (!/F-1166-1/.test(leaf.note_s1655)) throw new Error('history not preserved');
console.log('OK — vp-02e refusal retired into note_s1655; prior text preserved verbatim.');
