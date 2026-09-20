// s1334 — measure F-1333-2's proposed guard BEFORE building it.
// Rule under test: "every 🔺 id in the STATUS desk list carries 🔺, not 🟡, on its BACKLOG row."
// Precedent: s1317 built the analogous guard, measured 1 true / 3 fired, and did NOT ship it.
import fs from 'node:fs';

const status = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const backlog = fs.readFileSync('tasks/BACKLOG.md', 'utf8').split('\n');

// The desk list lives in the OWNER DESK segment of a handoff line-1 (or its archive bullet).
const deskLine = status.find((l) => l.includes('OWNER DESK'));
if (!deskLine) {
  console.log('NO DESK LINE');
  process.exit(0);
}
const desk = deskLine.slice(deskLine.indexOf('OWNER DESK'));

const deskIds = [];
const re = /(🔺|🔻|🟡)\s*\*{0,2}\s*(F-\d{3,4}-\d+)/g;
let m;
while ((m = re.exec(desk))) deskIds.push({ marker: m[1], id: m[2] });
const uniq = new Map();
for (const d of deskIds) if (!uniq.has(d.id)) uniq.set(d.id, d.marker);

// Declaring row = a BACKLOG row carrying the F-ID inside the 90-char subject zone
// (the same zone findings-state-guard.mjs uses).
function declRows(id) {
  const out = [];
  backlog.forEach((l, i) => {
    // strip the markdown list bullet: rows are either "🔺 **F-…" or "- 🔺 **F-…"
    const body = l.trim().replace(/^[-*]\s+/, '');
    if (body.slice(0, 90).includes(id)) {
      out.push({ line: i + 1, lead: [...body][0], text: body.slice(0, 100) });
    }
  });
  return out;
}

let agree = 0;
let disagree = 0;
let norow = 0;
let multi = 0;
const details = [];
for (const [id, marker] of uniq) {
  const rows = declRows(id);
  if (rows.length === 0) {
    norow++;
    details.push([id, marker, 'NO-DECLARING-ROW', '']);
    continue;
  }
  if (rows.length > 1) multi++;
  const leads = [...new Set(rows.map((r) => r.lead))];
  if (leads.every((l) => l === marker)) agree++;
  else {
    disagree++;
    details.push([id, marker, 'LEADS=' + leads.join(','), rows.map((r) => r.line).join('/')]);
  }
}

const markerCounts = {};
for (const v of uniq.values()) markerCounts[v] = (markerCounts[v] || 0) + 1;
console.log('desk ids (unique):', uniq.size, JSON.stringify(markerCounts));
console.log('agree:', agree, ' disagree:', disagree, ' no-declaring-row:', norow, ' multi-row:', multi);
console.log('--- non-agreeing ---');
for (const d of details) console.log(d.join('  |  '));
