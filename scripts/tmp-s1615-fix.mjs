import fs from 'node:fs';

// 1. citations: my F-1615-1 BACKLOG row carries two bare spec:line coordinates.
const bp = 'tasks/BACKLOG.md';
let b = fs.readFileSync(bp, 'utf8');

const before77 = "the helper defaults to `?terrain2d` (`e2e/town-tavern-blender.spec.ts:77` and the same line in all eight)";
const after77 = "the helper defaults to `?terrain2d` (its `const query = search || '?terrain2d';` line, identical in all eight specs — cited by content because that line sits in a helper, not a test, so no title can anchor it)";
if (!b.includes(before77)) { console.error('citation 77 span not found'); process.exit(1); }
b = b.replace(before77, after77);

const before205 = "⓷ **REPRODUCED:** `e2e/town-tavern-blender.spec.ts:205` FAILED";
const after205 = "⓷ **REPRODUCED:** `e2e/town-tavern-blender.spec.ts:205` (\"LITE tier always keeps the facade and never fetches the GLB\") FAILED";
if (!b.includes(before205)) { console.error('citation 205 span not found'); process.exit(1); }
b = b.replace(before205, after205);
fs.writeFileSync(bp, b);
console.log('BACKLOG citations titled');

// 2. desk-birth: three owner-gated rows filed this window, all ruled/superseded, none owed.
const sp = 'STATUS.md';
const lines = fs.readFileSync(sp, 'utf8').split('\n');
const anchor = '🔺 **F-1166-1 OPEN** — unchanged, and it is the ONLY `blocked` leaf on the board';
if (!lines[0].endsWith(anchor)) { console.error('line-1 does not end at the expected desk anchor'); process.exit(1); }
lines[0] +=
  ' ⓘ **THREE OWNER-GATED ROWS WERE FILED THIS WINDOW AND ARE NOT OWED — `desk-birth-guard` catches them because s1614 filed the rulings into rows it did not then desk (F-1541-2 shape), and the guard asks whoever holds the next line-1:** ' +
  'DESK-NOT-OWED: e3-fairground-socket — ruled 2026-08-09, gate CLOSED, superseded s1614 (F-1614-1); the residual act is owed by an ATTENDED SESSION, not the owner · ' +
  'DESK-NOT-OWED: bt-04-homestead-automation — ruled 2026-08-09, block LIFTED, superseded s1614 (F-1614-1); unblocked as a PROGRAM but still missing its four PARAMETERS, which is authoring input, not an owner question · ' +
  'DESK-NOT-OWED: F-1532-2 — gate MET 2026-08-09 by the owner ruling and AUTHORED s1614 as `f1614-1`; it is work in flight, not a question.';
fs.writeFileSync(sp, lines.join('\n'));
console.log('STATUS desk-not-owed declarations appended');
