import fs from 'node:fs';

const p = 'tasks/goals.json';
let s = fs.readFileSync(p, 'utf8');
const H = 'e43e0223c76a8709c1918cae2533981255033253';

const anchor = '"id": "f1631-1-asset-diet-fallback-provenance",';
const i = s.indexOf(anchor);
if (i < 0) throw new Error('leaf not found');

const target = '"status": "queued",';
const j = s.indexOf(target, i);
if (j < 0 || j - i > 1200) throw new Error('status field not inside this leaf');

const note = [
  'DRAINED s1634. Gated in detached worktree gate-s1634 (section 3.0b custody), merged as ONE act per F-1589-5.',
  'tsc clean; build green; test:asset-diet 6/6 both projects 7.3m exit 0, zero console/page errors.',
  'ALL THREE provenance paths proven in the drain own gate, not inherited:',
  'map-HIT gives measured-in-this-run 22497140 both projects;',
  'map-MISS with artifact != HEAD gives read-from-the-on-disk-fallback-artifact 22497140 (1 passed 3.6m);',
  'map-MISS with artifact == HEAD gives read-from-the-committed-artifact 21903056 (1 passed 3.5m).',
  'Substance: the fallback path reported 3096944 headroom where the same build measures 2502860,',
  'i.e. 594084 bytes of headroom the build does not have.',
  'Firewall exact: one file +33/-5, literal 25_000_000 count 1 on both sides,',
  'TOWN_TRANSFER_CEILING_BYTES count 4 unchanged, cue test :241 assertion intact, artifacts untouched.',
  'Classification LANE-TOUCHED / MAIN-UNTOUCHED off base 1321f9fc6, no graft needed.',
  'Findings: F-1634-1 (maxBuffer 1MB silent-mislabel ceiling, non-blocking, 7.8x headroom today);',
  'F-1634-2 (the runner third label is load-bearing and is the path most real fallbacks take);',
  'F-1634-3 (gpt-5.5 effort=high is merge-quality, s1632 priority B answered, section 2E refills unblocked).',
  'Review: reviews/f1631-1-asset-diet-fallback-provenance.md',
].join(' ');

const repl =
  '"status": "merged",\n' +
  '              "mergeHash": ' + JSON.stringify(H) + ',\n' +
  '              "drainNotes": ' + JSON.stringify(note) + ',';

s = s.slice(0, j) + repl + s.slice(j + target.length);
fs.writeFileSync(p, s);

// Prove it parses and the leaf reads right
const g = JSON.parse(fs.readFileSync(p, 'utf8'));
let found = null;
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) return n.forEach(walk);
  if (n.id === 'f1631-1-asset-diet-fallback-provenance') found = n;
  [...(n.subgoals || []), ...(n.tasks || [])].forEach(walk);
})(g);

console.log('PARSES OK');
console.log('status   =', found.status);
console.log('mergeHash=', found.mergeHash, 'len', found.mergeHash.length);
console.log('40-hex   =', /^[0-9a-f]{40}$/.test(found.mergeHash));
console.log('stopNote still present =', 'stopNote' in found);
