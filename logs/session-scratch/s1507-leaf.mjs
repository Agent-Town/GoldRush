// s1507 — Goal Registration Law: the drain updates the leaf's status and merge hash.
// Separate commit from the merge by necessity (F-1384-1): goal-tracker.test.mjs requires a
// 40-hex mergeHash, and the hash a drain records is the main-side merge commit itself, so a
// commit cannot contain its own hash.
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'tasks/goals.json';
const MERGE = 'e304157887ee45fb02789c01fec82072dc6bd8a6';
if (!/^[0-9a-f]{40}$/.test(MERGE)) throw new Error('mergeHash must be 40 hex — the s1300 defect');

const raw = readFileSync(PATH, 'utf8');
const tree = JSON.parse(raw);

let hit = null;
const walk = (n) => {
  if (!n || typeof n !== 'object') return;
  if (n.id === 'f1506-2-e9-roster-bisect') hit = n;
  for (const k of Object.keys(n)) walk(n[k]);
};
walk(tree);
if (!hit) throw new Error('leaf f1506-2-e9-roster-bisect not found — refusing to guess');

console.log('before:', JSON.stringify({ status: hit.status, mergeHash: hit.mergeHash }));
hit.status = 'merged';
hit.mergeHash = MERGE;
hit.attempts = (hit.attempts ?? 0) + 1;
hit.drainNotes = 'Drained s1507. Bisect named first-bad 9146212f (lane-tape-02-lantern-show): '
  + 'contract-derived activeEpoch sent every ordinary boot to the E1 fallback contract, and '
  + 'E9ArsenalSystem gates on activeEpoch.order >= 9. Cure keeps contract-derived epochs for '
  + '?replay routes only. Own spec 6 passed (matches the GOOD endpoint); culprit\'s own '
  + 'tape-02-lantern-show 2 passed. Both forbidden cures refused - the diff never touches '
  + 'e2e/e9-roster.spec.ts or the red inventory. 25-spec adjacent set derived by grep at drain '
  + 'time: 146 passed / 15 failed; 6 fingerprint-matched KNOWN-RED, 072-era-activation and '
  + 'landmark-collision red IDENTICALLY in a pre-merge control arm (filed F-1507-2), and the one '
  + 'candidate delta (town-dynamo-hall-blender:97) is 6/6 green alone and reds in the CONTROL arm '
  + 'under the same composition, whose failure count is itself unstable on a fixed commit '
  + '(3 then 6) - filed F-1507-3. No red attributable to the merge.';

writeFileSync(PATH, JSON.stringify(tree, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
console.log('after :', JSON.stringify({ status: hit.status, mergeHash: hit.mergeHash }));
