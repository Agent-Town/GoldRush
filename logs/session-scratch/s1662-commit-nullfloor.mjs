import { execFileSync } from 'node:child_process';
const g = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1e8 });
g('add', 'assets/contracts/null-floors.json');
const msg = [
  'fix: F-1662-1 — drop the three de-listed railcars from the pinned null-floor artifact',
  '',
  'f1660-1 removed e2-hill-mine/e2-trestle/e2-incline from the AP-07 door, and',
  'scripts/null-floor-anchors.test.mjs asserts null-floors.json equals bench seeds',
  'INTERSECT supportedContractIds() — so the door change made that guard red.',
  '',
  'The f1660-1 runner reported this honestly and stopped: its firewall said "NO changes',
  'to assets/contracts/**". That firewall was right about its subject and wrong about its',
  'scope. Its rationale names contract BUNDLES (data; editing a manifest to change',
  'admission is Mistake #14), but null-floors.json is a GENERATED measurement artifact —',
  'scripts/null-floor-anchors.mjs writes it by intersecting bench-seeds.json with the',
  'derived door. Removing these rows FOLLOWS admission rather than changing it.',
  'A firewall keyed on a PATH inherits every file that happens to live under it.',
  '',
  'Surgical splice, not regeneration: a full regen re-runs 35 idle sims and also rewrites',
  'eraStamp (= git merge-base HEAD main, F-1653-3). Verified 312 -> 258 lines, 12 -> 9',
  'contracts, all 9 survivors byte-identical, eraStamp untouched at d279d4b0a.',
  'null-floor-anchors: RED before ("floors must equal bench seeds intersected with',
  'supported contracts") -> GREEN after, on main.',
].join('\n');
g('commit', '-m', msg);
console.log(g('log', '-1', '--format=%h %s'));
console.log('assets dirt:', g('status', '--porcelain', '--', 'assets').trim() || '(clean)');
