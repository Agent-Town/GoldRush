// F-2102-1 evidence probe (s2102, 2026-08-21) — ANCHORED fire-log rc rate counter.
//
// WHY THIS EXISTS: logs/fire-*.log EMBEDS each fire's full transcript, so an
// un-anchored `grep -c "FIRE END"` counts every fire that writes ABOUT the
// marker in its handoff prose. That defect has now been independently
// re-derived TWICE — logs/fire-20260819.log:147 ("427 starts / 1031 ends …
// I was saved by the number being absurd, and absurdity isn't always
// available") and again by s2102 while measuring F-2062-1's gate, whose own
// baseline figures were inflated ~2.7x by it.
//
// THE CURE: anchor on the runner's line-start emitter prefix, and validate
// with the free control the log hands you — START must equal END.
// Retained as cited evidence under artifacts/ per the Retention Law; NOT
// placed in scripts/, which is a run surface (F-1665-1).
import fs from 'fs';
// ANCHORED on the runner's own emitter prefix at line start — prose mentions cannot match.
const START = /^\[fire-runner\] \d{2}:\d{2}:\d{2} FIRE START/;
const END = /^\[fire-runner\] \d{2}:\d{2}:\d{2} FIRE END rc=(\d+)/;
const files = fs.readdirSync('logs').filter(f => /^fire-\d{8}\.log$/.test(f)).sort();
console.log('day        START   END   rc=0   rc=1   rc1%    APIerr   verdict');
const rows = [];
for (const f of files.slice(-10)) {
  const lines = fs.readFileSync(`logs/${f}`, 'utf8').split('\n');
  let start = 0, rc0 = 0, rc1 = 0, api = 0;
  for (const l of lines) {
    if (START.test(l)) start++;
    const m = l.match(END);
    if (m) { if (m[1] === '0') rc0++; else rc1++; }
    if (/API Error: Connection closed mid-response/.test(l)) api++;
  }
  const end = rc0 + rc1;
  const pct = end ? rc1 / end * 100 : 0;
  const day = f.slice(5, 13).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
  rows.push({ day, end, rc1, pct });
  console.log(day, String(start).padStart(6), String(end).padStart(5), String(rc0).padStart(6),
    String(rc1).padStart(6), (pct.toFixed(1) + '%').padStart(7), String(api).padStart(7),
    '  ', end === 0 ? '—' : (pct < 5 ? 'BELOW ~5%' : 'ABOVE'));
}
console.log('\nF-2062-1 GATE: "closes when a day\'s FIRE END rc=1 rate returns below ~5%"');
const since = rows.filter(r => r.day > '2026-08-19' && r.end > 0);
console.log('days after the 08-19 incident:', since.map(r => `${r.day} ${r.rc1}/${r.end} = ${r.pct.toFixed(1)}%`).join(' · '));
console.log('gate MET:', since.length > 0 && since.every(r => r.pct < 5));
