// F-1541-2 PRICING, ARM 3 — s1542. Arms 1-2 priced ONE predicate. This arm asks the
// design question they exposed: the two knobs are (i) how tightly "an owner gate" is
// recognised, and (ii) how strictly desk membership is scored. Sloppy membership hides a
// loose selector. Measure the 2x2 and pick the tightest cell that still scores 0 hits on
// rows that were handled correctly.
//
// NOTE: run AFTER the F-1542-1 cure — the backtick spelling is now matched, so s1529's
// desk is readable and the STRICT column means something it did not mean this morning.
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

// (i) SELECTORS — loose "the word appears" vs tight "the gate turns on an owner ACT".
const SELECTORS = {
  loose: g => /owner/i.test(g),
  tight: g => /owner(?:'s|’s)?\s+(?:word|answers?|rules?|ruling|picks?|verdict|decision|names?|triage)/i.test(g)
           || /\bGATE:\s*\**\s*OWNER\b/i.test(g)
           || /(?:closes|retires|rules?)\s+(?:on|when)\s+(?:an?\s+)?(?:attended\s+or\s+)?owner/i.test(g),
};
// (ii) MEMBERSHIP — anywhere on line-1 vs inside the declared desk segment.
const DESK_WORD = /OWNER(?:'S|’S|S|`S)? DESK/g;
const l1cache = new Map();
const line1At = sha => {
  if (!l1cache.has(sha)) { try { l1cache.set(sha, git('show', sha + ':STATUS.md').split('\n')[0]); } catch { l1cache.set(sha, ''); } }
  return l1cache.get(sha);
};
function deskStart(l1) { const m = [...l1.matchAll(DESK_WORD)]; return m.length ? m[m.length - 1].index : -1; }
function occ(l1, id) { return [...l1.matchAll(new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))].map(x => x.index); }
const MEMBERSHIP = {
  forgiving: (l1, id) => occ(l1, id).length > 0,
  strict: (l1, id) => { const d = deskStart(l1); return d !== -1 && occ(l1, id).some(o => o > d); },
};

const rows = [];
for (let i = 1; i < handoffs.length; i++) {
  const prev = handoffs[i - 1], cur = handoffs[i];
  let diff = '';
  try { diff = git('diff', prev.sha + '..' + cur.sha, '--', 'tasks/BACKLOG.md'); } catch { continue; }
  const added = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1))
    .filter(l => /^\s*(\u{1F53A}|✅|⛔|\u{1F7E1})/u.test(l) || /\*\*F-/.test(l));
  for (const text of added) {
    const id = rowId(text); if (!id) continue;
    rows.push({ fire: (cur.subj.match(/^s(\d+)/) || [])[1], sha: cur.sha, id,
      gate: gateText(text).replace(/\s+/g, ' ') });
  }
}

console.log('corpus: ' + (handoffs.length - 1) + ' windows, ' + rows.length + ' rows added\n');
console.log('            selector   qualifying   hits   (hit ids)');
const cells = {};
for (const [sn, sel] of Object.entries(SELECTORS)) {
  for (const [mn, mem] of Object.entries(MEMBERSHIP)) {
    const q = rows.filter(r => sel(r.gate));
    const hits = q.filter(r => !mem(line1At(r.sha), r.id));
    cells[sn + '/' + mn] = hits;
    console.log((sn + '/' + mn).padEnd(22) + String(q.length).padStart(6) + String(hits.length).padStart(8)
      + '   ' + hits.map(h => 's' + h.fire + ':' + h.id).join(' '));
  }
}
console.log('\n=== gate text of every hit in the TIGHT/STRICT cell ===');
for (const h of cells['tight/strict'] || []) console.log('s' + h.fire + ' ' + h.id + '\n   ' + h.gate.slice(0, 230) + '\n');
