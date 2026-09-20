// F-1541-2 PRICING, ARM 2 — s1542. Arm 1 asked "how many hits, are they real?" (false
// POSITIVES). This arm asks the two questions a green arm-1 cannot answer:
//   (a) FALSE NEGATIVES — does the predicate's owner-word filter DROP rows that a later
//       fire nonetheless put on a desk? Those are owner items the guard would never see.
//   (b) MEMBERSHIP HONESTY — arm 1 scored "on the desk" as "the id appears anywhere on
//       line-1". Line-1 also carries narrative prose. Score it BOTH ways: FORGIVING
//       (anywhere) vs STRICT (at least one occurrence after the desk header).
//
// ⚠️ CORRECTED s1542, mid-run: the first version of (b) used indexOf, i.e. the FIRST
// occurrence, and so scored any item that is mentioned in the narrative AND declared on
// the desk as "prose only" — 6 of its 8 reported cases were wrong. An id can legitimately
// appear 2-7 times on one line-1. Membership must ask "is ANY occurrence after the desk
// header", never "is THE occurrence".
import { execFileSync } from 'node:child_process';

const git = (...a) => execFileSync('git', a, { maxBuffer: 1 << 28 }).toString();
const N = Number(process.argv[2] || 25);

const handoffs = git('log', '--format=%H\t%cI\t%s', '--', 'STATUS.md')
  .trim().split('\n')
  .map(l => { const [sha, date, ...s] = l.split('\t'); return { sha, date, subj: s.join('\t') }; })
  .filter(c => /^s\d+ handoff/.test(c.subj))
  .slice(0, N + 1)
  .reverse();

const ID = /\*\*([A-Z]{1,4}-[A-Z0-9]+-[A-Za-z0-9]+|F-[A-Za-z0-9]+-[A-Za-z0-9]+)/;
const SLUG = /^[^*]*\*\*`?([a-z0-9]+(?:-[a-z0-9]+){2,})`?/;
const rowId = t => (t.match(ID) || [])[1] || (t.match(SLUG) || [])[1] || null;
const gateText = t => { const i = t.toUpperCase().lastIndexOf('GATE:'); return i === -1 ? '' : t.slice(i); };

const l1cache = new Map();
function line1At(sha) {
  if (!l1cache.has(sha)) { try { l1cache.set(sha, git('show', sha + ':STATUS.md').split('\n')[0]); } catch { l1cache.set(sha, ''); } }
  return l1cache.get(sha);
}
function deskStart(l1) {
  const m = [...l1.matchAll(/OWNER(?:'|’)?S? DESK/gi)];
  return m.length ? m[m.length - 1].index : -1;
}
function occurrences(l1, id) {
  const re = new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  return [...l1.matchAll(re)].map(x => x.index);
}

const rows = [];
for (let i = 1; i < handoffs.length; i++) {
  const prev = handoffs[i - 1], cur = handoffs[i];
  let diff = '';
  try { diff = git('diff', prev.sha + '..' + cur.sha, '--', 'tasks/BACKLOG.md'); } catch { continue; }
  const added = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1))
    .filter(l => /^\s*(\u{1F53A}|✅|⛔|\u{1F7E1})/u.test(l) || /\*\*F-/.test(l));
  for (const text of added) {
    const id = rowId(text); if (!id) continue;
    const g = gateText(text);
    rows.push({ idx: i, fire: (cur.subj.match(/^s(\d+)/) || [])[1], sha: cur.sha, id,
      owner: /owner/i.test(g), hasGate: g.length > 0, gate: g.replace(/\s+/g, ' '),
      text: text.replace(/\s+/g, ' ').slice(0, 200) });
  }
}

console.log('=== (b) MEMBERSHIP: FORGIVING (anywhere on line-1) vs STRICT (after desk header) ===');
let forgiving = 0, strict = 0, proseOnly = [], noHeader = [];
for (const r of rows.filter(r => r.owner)) {
  const l1 = line1At(r.sha), ds = deskStart(l1), occ = occurrences(l1, r.id);
  if (!occ.length) continue;
  forgiving++;
  if (ds === -1) noHeader.push(r);
  else if (occ.some(o => o > ds)) strict++;
  else proseOnly.push(r);
}
const qualifying = rows.filter(r => r.owner);
console.log('  qualifying rows: ' + qualifying.length);
console.log('  matched FORGIVING: ' + forgiving + '  => hits ' + (qualifying.length - forgiving));
console.log('  matched STRICT:    ' + strict + '  => hits ' + (qualifying.length - strict));
for (const r of proseOnly) console.log('    PROSE-ONLY s' + r.fire + ' ' + r.id + '\n      gate: ' + r.gate.slice(0, 260));
for (const r of noHeader) console.log('    NO DESK HEADER ON LINE-1  s' + r.fire + ' ' + r.id);

console.log('\n=== (a) FALSE NEGATIVES: dropped rows that a desk declared anyway ===');
const dropped = rows.filter(r => !r.owner);
const fn = [];
for (const r of dropped) {
  for (let j = r.idx; j < handoffs.length; j++) {
    const l1 = line1At(handoffs[j].sha), ds = deskStart(l1);
    if (ds === -1) continue;
    if (occurrences(l1, r.id).some(o => o > ds)) { fn.push([r, handoffs[j].subj.split(' ')[0]]); break; }
  }
}
for (const [r, by] of fn) console.log('  s' + r.fire + ' ' + r.id + ' -> desked by ' + by + '\n     gate: ' + (r.hasGate ? r.gate.slice(0, 190) : '(NO GATE CLAUSE)'));
console.log('  dropped rows=' + dropped.length + '  (no gate clause at all: ' + dropped.filter(r => !r.hasGate).length + ')');
console.log('  FALSE NEGATIVES=' + fn.length);
