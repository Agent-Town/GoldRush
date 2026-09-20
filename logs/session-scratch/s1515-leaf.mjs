import fs from 'node:fs';
const gp = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(gp, 'utf8'));

const leaf = {
  id: 'f1515-1-citation-scan-nondestructive',
  title:
    'F-1515-1 + F-1515-2 (one task, same file, interacting cures): (1) the 790a66f5 union scan is a BACKSTOP not a cure — both ' +
    'scanners still walk the 400-char window with a global lastIndex, so an ODD count of same-kind quotes before the title ' +
    'defeats BOTH arms; replace it with a non-destructive all-pairs enumeration. Priced against the live corpus at 2 genuine ' +
    'citations (e2e/tl-01-run-telemetry.spec.ts:229, e2e/asset-diet.spec.ts:73), a LOWER BOUND since the probe matcher was ' +
    'stricter than the shipped matchesATitle. (2) TITLE_DECL\'s (?:\\.\\w+)* matches any dotted helper, so ' +
    'test.setBalance(\'e10Static.arrivalZ\', 20) is harvested as a title — 87 non-title strings across 393 specs against 1270 ' +
    'genuine ones; 0 of 206 live CARRIES-TITLE rows are carried by one (LATENT, not live) but 67 clear the 12-char floor, so ' +
    'the fail-open is reachable. The two interact: 2 of the 4 raw hits pricing F-1515-1 were F-1515-2 pollution, so curing (2) ' +
    'makes (1)\'s measurement honest. Hard bar: citations == 511, CARRIES-TITLE >= 206, NUMBER-ONLY <= 262 — and scope 3 ' +
    'PREDICTS the pollution fix moves NOTHING, so any movement refutes the 0-live measurement and must STOP the run.',
  status: 'queued',
  taskFile: 'lane-f1515-1-citation-scan-nondestructive.md',
  lane: 'lane-a',
  attempts: 0,
  authoredBy: 's1515 (fire)',
  authorNotes:
    'Authored s1515 immediately after draining f1501-5 (790a66f5), from findings this fire filed and PRICED rather than ' +
    'inherited. Method, per F-1514-1 (run the proposed cure against the live corpus BEFORE authoring): copied the guard, ' +
    'dropped its CLI at :293, re-rooted it, widened rows.push to carry win+titles — with a CONTROL first, the copy reproducing ' +
    'the shipped tally 511/262/206/43 exactly, so the answer is about the corpus and not the copy. F-1515-2 was NOT looked for: ' +
    'it fell out of F-1515-1\'s false positives (2 of 4 hits resolved to a setBalance key that looked wrong on sight and was ' +
    'confirmed by reading the spec). Citation key is file-scoped — grep -c "const QUOTED_BY_KIND = " ' +
    'scripts/citation-title-guard.mjs, measured 1 on main and 0 in tasks/BACKLOG.md — so neither this note nor the master can ' +
    'self-rot it. Dispatch order per F-1424-3: master+leaf committed FIRST, lane refreshed SECOND, key re-grepped in the lane ' +
    'THIRD, cp LAST.',
};

// register as a sibling of the f1501-5 leaf we just merged
let placed = 0;
const walk = (n) => {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) {
    const at = n.findIndex((c) => c && c.id === 'f1501-5-citation-quote-pairing');
    if (at >= 0) { n.splice(at + 1, 0, leaf); placed++; return; }
    for (const c of n) walk(c);
    return;
  }
  for (const k of Object.keys(n)) walk(n[k]);
};
walk(g);
if (placed !== 1) throw new Error('expected to place exactly once, placed ' + placed);
fs.writeFileSync(gp, JSON.stringify(g, null, 2) + '\n');
console.log('leaf registered as sibling of f1501-5, status queued');
