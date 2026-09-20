// s2664 self-correction: two defects in my OWN bookkeeping, fixed surgically.
//  (1) `$STAMP` was never substituted — my shell escaped the `$`, so §1.3's
//      date-derived stamp never reached either line. The attended session's own
//      edit carried the defect forward without noticing it.
//  (2) my NEXT-FIRE priority (A) says the drain is STILL UNLANDED. The attended
//      session LANDED it while I was closing — F-2373-1 exactly.
// The attended session's inserted CORRECTIONS RUN 2 sentence is left untouched.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const FILE = 'STATUS.md';
const DOLLAR = '$' + 'STAMP';
const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
const lockStamp = '2026-09-20T15:54Z'; // = a870cb0b9's OWN commit date (§1.3: judge by the owning commit)

const STALE = readFileSync('artifacts/s2664/stale-a.txt', 'utf8').replace(/\n+$/, '');
const FRESH = readFileSync('artifacts/s2664/fresh-a.txt', 'utf8').replace(/\n+$/, '');

const L = readFileSync(FILE, 'utf8').split('\n');
const beforeLen = L[0].length;

if (!L[0].includes(DOLLAR)) throw new Error('line-1 carries no placeholder — REFUSING (already fixed?)');
if (!L[1].includes(DOLLAR)) throw new Error('line-2 carries no placeholder — REFUSING');
L[0] = L[0].replace(DOLLAR, stamp);
L[1] = L[1].replace(DOLLAR, lockStamp);

if (!L[0].includes(STALE)) throw new Error('the stale (A) text did not match verbatim — REFUSING rather than corrupting');
L[0] = L[0].replace(STALE, FRESH);

// --- post-flight: refuse rather than ship a broken line-1 -----------------
if (L[0].includes(DOLLAR) || L[1].includes(DOLLAR)) throw new Error('a placeholder survived — REFUSING');
if (!/OWNER.?S DESK/i.test(L[0])) throw new Error('the desk header vanished — REFUSING');
if (!L[0].includes('CORRECTIONS RUN 2 DRAINED')) throw new Error('the attended sentence was lost — REFUSING');
const deskAt = L[0].toUpperCase().lastIndexOf('OWNER');
if (L[0].slice(deskAt).includes('(A) ')) throw new Error('priority text leaked AFTER the desk terminator — REFUSING');
if (L.length !== readFileSync(FILE, 'utf8').split('\n').length) throw new Error('line count moved — REFUSING');

writeFileSync(FILE, L.join('\n'));
console.log('line-1 stamp ->', stamp);
console.log('line-2 stamp ->', lockStamp, "(= the lock commit's own date)");
console.log('line-1 length', beforeLen, '->', L[0].length);
console.log('desk markers :', (L[0].match(/OWNER.?S DESK/gi) || []).length);
console.log('attended sentence intact:', L[0].includes('CORRECTIONS RUN 2 DRAINED'));
console.log('stale (A) gone:', !L[0].includes('THE DRAIN IS STILL UNLANDED'));
