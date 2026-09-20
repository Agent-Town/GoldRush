// F-1541-2 PRICING HARNESS — s1542. NOT a guard; runs the proposed predicate over the
// live corpus so the finding's GATE ("price it first, build only if false positives == 0")
// can be answered with numbers instead of a design argument.
//
// PREDICATE (verbatim from the F-1541-2 row):
//   "restrict the cross-check to rows added to tasks/BACKLOG.md SINCE THE PREVIOUS HANDOFF
//    COMMIT, and among those only rows whose GATE text names an owner word."
// A HIT = such a row that does NOT appear on that fire's own handoff line-1.
import { execFileSync } from 'node:child_process';

const git = (...a) => execFileSync('git', a, { maxBuffer: 1 << 28 }).toString();
const N = Number(process.argv[2] || 25);

// 1. handoff commits, newest first, then reversed to oldest-first
const handoffs = git('log', '--format=%H\t%cI\t%s', '--', 'STATUS.md')
  .trim().split('\n')
  .map(l => { const [sha, date, ...s] = l.split('\t'); return { sha, date, subj: s.join('\t') }; })
  .filter(c => /^s\d+ handoff/.test(c.subj))
  .slice(0, N + 1)
  .reverse();

// 2. row parsing
const ID = /\*\*([A-Z]{1,4}-[A-Z0-9]+-[A-Za-z0-9]+|F-[A-Za-z0-9]+-[A-Za-z0-9]+)/;
const SLUG = /^[^*]*\*\*`?([a-z0-9]+(?:-[a-z0-9]+){2,})`?/;
function rowId(text) {
  const m = text.match(ID); if (m) return m[1];
  const s = text.match(SLUG); if (s) return s[1];
  return null;
}
function gateText(text) {
  const i = text.toUpperCase().lastIndexOf('GATE:');
  return i === -1 ? '' : text.slice(i);
}
const ownerWord = g => /owner/i.test(g);

function line1At(sha) {
  try { return git('show', sha + ':STATUS.md').split('\n')[0]; } catch { return ''; }
}

const rows = [];
for (let i = 1; i < handoffs.length; i++) {
  const prev = handoffs[i - 1], cur = handoffs[i];
  let diff = '';
  try { diff = git('diff', prev.sha + '..' + cur.sha, '--', 'tasks/BACKLOG.md'); } catch { continue; }
  const added = diff.split('\n')
    .filter(l => l.startsWith('+') && !l.startsWith('+++'))
    .map(l => l.slice(1))
    .filter(l => /^\s*(🔺|✅|⛔|🟡)/.test(l) || /\*\*F-/.test(l));
  const l1 = line1At(cur.sha);
  for (const text of added) {
    const id = rowId(text); if (!id) continue;
    const g = gateText(text);
    rows.push({
      fire: (cur.subj.match(/^s(\d+)/) || [])[1], sha: cur.sha.slice(0, 8), date: cur.date.slice(0, 10),
      id, owner: ownerWord(g), hasGate: g.length > 0, onDesk: l1.includes(id),
      gate: g.replace(/\s+/g, ' ').slice(0, 210), text: text.replace(/\s+/g, ' ').slice(0, 260),
    });
  }
}

const qualifying = rows.filter(r => r.owner);
const hits = qualifying.filter(r => !r.onDesk);

const first = (handoffs[1] || {}).subj || '?', last = (handoffs[handoffs.length - 1] || {}).subj || '?';
console.log('WINDOWS: ' + (handoffs.length - 1) + ' handoff pairs, ' + first.split(' ')[0] + ' .. ' + last.split(' ')[0]);
console.log('ROWS ADDED (any):             ' + rows.length);
console.log('  with a GATE clause:         ' + rows.filter(r => r.hasGate).length);
console.log('QUALIFYING (GATE names owner): ' + qualifying.length);
console.log('  of which ON the desk:        ' + (qualifying.length - hits.length));
console.log('  HITS (owner gate, off-desk): ' + hits.length);
console.log('\n=== HIT LIST ===');
for (const h of hits) console.log('s' + h.fire + ' ' + h.sha + ' ' + h.date + '  ' + h.id + '\n    GATE: ' + h.gate + '\n    ROW:  ' + h.text + '\n');
console.log('=== CONTROL ARM: qualifying rows that WERE desked ===');
for (const r of qualifying.filter(r => r.onDesk)) console.log('s' + r.fire + ' ' + r.sha + ' ' + r.id + '  GATE: ' + r.gate.slice(0, 130));
