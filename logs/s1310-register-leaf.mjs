import fs from 'node:fs';

const p = 'tasks/goals.json';
const t = fs.readFileSync(p, 'utf8');
const i = t.indexOf('"id": "f1309-1-goal-ledger-pointer-guard"');
if (i < 0) { console.error('predecessor leaf not found'); process.exit(2); }
let s = t.lastIndexOf('{', i), d = 0, e = s;
for (; e < t.length; e++) {
  if (t[e] === '{') d++;
  else if (t[e] === '}') { d--; if (d === 0) break; }
}

const leaf = {
  id: 'f1310-1-backlog-coordinate-ban',
  title: "Ban line coordinates into BACKLOG from non-terminal blockedReason. F-1310-1: both BACKLOG line-coordinates that existed in the ledger's live owner gates were rotted (2 of 2) — one by 571 lines, and one invalidated INSIDE ITS OWN CURE COMMIT because s1309 prepended a 2-line finding row at the top of BACKLOG in the same commit that wrote the coordinate. Measured across the last 25 commits touching the file: 2206 to 2240 lines, growth at the TOP, so every deep BACKLOG coordinate rots on every fire that files a finding. A drift guard would therefore red nearly every fire and train --update into a rubber stamp; the rule is a SHAPE BAN instead. Population is ZERO after s1310's two content-anchor cures, so the guard is green on arrival and its entire value is the manufactured red — including the load-bearing assertion that --update CANNOT bury it.",
  taskFile: 'lane-a-f1310-1-backlog-coordinate-ban.md',
  lane: 'lane-a',
  status: 'queued',
  authoredBy: 's1310',
  authorNotes: "Extends the ledger walk shipped s1310 (a180b468); adds no new script and no npm entry, so gate-caller-audit is unaffected. Scoped narrow to BACKLOG deliberately: the guard's documented KNOWN GAP exists because resolving shorthand like v3 requires guessing which file is meant, and BACKLOG names exactly one file — the rule rejects the shape rather than resolving it, so nothing is guessed. Firewalled OFF tasks/goals.json and the baseline file: a runner must not re-point a live owner gate, and a baseline diff would mean the shape was resolved instead of rejected.",
};

const ind = '        ';
const rendered = JSON.stringify(leaf, null, 2).split('\n').map((l, k) => (k === 0 ? l : ind + l)).join('\n');
fs.writeFileSync(p, t.slice(0, e + 1) + ',\n' + ind + rendered + t.slice(e + 1));

const g = JSON.parse(fs.readFileSync(p, 'utf8'));
let n = 0, q = 0, blocked = 0;
const walk = (x) => {
  if (typeof x.taskFile === 'string') { n++; if (x.status === 'queued') q++; if (x.status === 'blocked') blocked++; }
  const kids = (x.subgoals || []).concat(x.tasks || []);
  for (const c of kids) walk(c);
};
for (const x of g.goals) walk(x);
console.log('JSON parses OK | leaves:', n, '| queued:', q, '| blocked:', blocked);
