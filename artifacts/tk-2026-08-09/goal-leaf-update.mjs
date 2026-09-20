// s1618 drain bookkeeping helper: update one goal leaf while preserving the file's
// house format (2-space indent, non-ASCII escaped as \uXXXX). Round-trip verified
// before writing — a ledger edit must be surgical, not a whole-file reformat.
import fs from 'node:fs';

const P = 'tasks/goals.json';
const src = fs.readFileSync(P, 'utf8');

const enc = (o) =>
  JSON.stringify(o, null, 2).replace(
    /[-￿]/g,
    (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
  ) + '\n';

const parsed = JSON.parse(src);
if (enc(parsed) !== src) {
  console.error('REFUSING: round-trip is not byte-identical; format assumption is wrong.');
  process.exit(2);
}

const walk = (node, cb) => {
  if (Array.isArray(node)) return node.forEach((x) => walk(x, cb));
  if (node && typeof node === 'object') {
    cb(node);
    Object.values(node).forEach((v) => walk(v, cb));
  }
};

const MERGE = 'f5dbb5448ba8dfa2ea1d23f03347fe831b411a83';
const NOTES =
  's1618 drain: MERGED at f5dbb5448. advance-stream 10/10 both projects UNMODIFIED (the contract that reads 8/10 without the trim); scope-4 normal-path assertion 2/2 both projects; tsc clean; build 1.17s; test:node-guards correctly OUT per F-1460-1 (zero src/sim|systems|entities). Salvage verified verbatim: git diff lane/a lane/c over the eleven files = +13 only, the scope-4 test. lane/a untouched at 914a7e93b. ' +
  'F-1618-1: the ten town-*-blender specs are red on BOTH arms in the fire shell and the slice makes them markedly LESS red - control (main, no slice) 33 failed/49 passed vs merged 14 failed/70 passed, same shell, same hour, --workers=1. The control-only 19 are fast (2-4s) request-laziness assertion failures this slice cures (main asserts no GLB request while prefetch warms it); all 14 remaining are the p95 frame-time timing class, not one an assertion about behaviour. Spot checks alone on the merged tree: tavern desktop GREEN 8.2s (vs 17.6s red in batch), stamp-mill mobile 3/3 GREEN 7.5/8.2/8.3s vs control 7.3s. ' +
  'Reusable: "in isolation" is a property of the MEASUREMENT, not the command - a single-spec run is still loaded when the spec holds six tests and one fetches two bulk GLBs; that mis-reading made this drain briefly believe it had a slice-attributable p95 regression. ' +
  'F-1618-2 non-blocking: an instrument that reds 33/82 on an untouched control cannot adjudicate a p95 gate at all; fires should compare red SETS across arms, not chase an absolute green the fire shell cannot produce. Review: reviews/f1617-1-savedata-town-trim.md';

let hits = 0;
walk(parsed, (n) => {
  if (n.id === 'f1617-1-savedata-town-trim') {
    hits++;
    n.status = 'merged';
    n.mergeHash = MERGE;
    n.drainNotes = NOTES;
  }
});

if (hits !== 1) {
  console.error('REFUSING: expected exactly 1 leaf, found ' + hits);
  process.exit(2);
}

fs.writeFileSync(P, enc(parsed));
console.log('leaf updated (hits=' + hits + ')');
