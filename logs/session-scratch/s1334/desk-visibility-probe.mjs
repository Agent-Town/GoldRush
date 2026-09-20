// s1334 — the OWNER-DESK visibility census.
// For every F-ID the STATUS desk list routes to the owner, ask three separate questions:
//   (a) is the ID mentioned ANYWHERE in tasks/BACKLOG.md?
//   (b) does it have a DECLARING row (ID inside the 90-char subject zone findings-state-guard uses)?
//   (c) does that declaring row carry the house `GATE:` clause that states its gating?
// (b) and (c) are different questions and are reported separately on purpose.
import fs from 'node:fs';

const status = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const backlog = fs.readFileSync('tasks/BACKLOG.md', 'utf8').split('\n');

const deskLine = status.find((l) => l.includes('OWNER DESK'));
const desk = deskLine.slice(deskLine.indexOf('OWNER DESK'));
const ids = [];
const re = /(🔺|🔻|🟡)\s*\*{0,2}\s*(F-\d{3,4}-\d+)/g;
let m;
while ((m = re.exec(desk))) if (!ids.some((x) => x.id === m[2])) ids.push({ marker: m[1], id: m[2] });

const rows = backlog.map((l, i) => {
  const body = l.trim().replace(/^[-*]\s+/, '');
  return { n: i + 1, body, zone: body.slice(0, 90) };
});

let mentioned = 0;
let declared = 0;
let gated = 0;
const unmentioned = [];
const undeclared = [];
const nogate = [];

for (const { id, marker } of ids) {
  const anywhere = rows.filter((r) => r.body.includes(id));
  // A row DECLARES an id only if that id is the FIRST F-ID in its subject zone.
  // "zone contains the id" is not enough: F-1329-3's row cites F-1328-3 in its own
  // first 90 chars, which made an earlier pass of this probe credit F-1328-3 with
  // two declaring rows it does not have.
  const decl = rows.filter((r) => {
    const first = (r.zone.match(/F-\d{3,4}-\d+/) || [])[0];
    return first === id;
  });
  if (anywhere.length === 0) {
    unmentioned.push(id);
    continue;
  }
  mentioned++;
  if (decl.length === 0) {
    undeclared.push(id + ' (mentioned on ' + anywhere.map((r) => r.n).join('/') + ')');
    continue;
  }
  declared++;
  if (decl.some((r) => /GATE:/.test(r.body))) gated++;
  else nogate.push(id + ' @' + decl.map((r) => r.n).join('/') + ' [' + marker + ']');
}

console.log('desk F-IDs:', ids.length);
console.log('  mentioned anywhere in BACKLOG :', mentioned);
console.log('  has a DECLARING row (<=90ch)  :', declared);
console.log('  declaring row carries GATE:   :', gated);
console.log('\nNOT MENTIONED AT ALL (' + unmentioned.length + '):');
for (const x of unmentioned) console.log('  ' + x);
console.log('\nMENTIONED BUT NEVER DECLARED (' + undeclared.length + '):');
for (const x of undeclared) console.log('  ' + x);
console.log('\nDECLARED BUT NO GATE: CLAUSE (' + nogate.length + '):');
for (const x of nogate) console.log('  ' + x);
