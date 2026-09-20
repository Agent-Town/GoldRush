import fs from 'node:fs';
const P = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(P, 'utf8'));

let hit = null;
const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk);
  if (n && typeof n === 'object') {
    if (n.id === 'f1501-4-manifest-plural') hit = n;
    Object.values(n).forEach(walk);
  }
};
walk(g);
if (!hit) throw new Error('leaf not found');

console.log('BEFORE status:', hit.status, 'mergeHash:', hit.mergeHash);
hit.status = 'merged';
hit.mergeHash = 'efb5465dca18c964a69aba8a0d69ead8cf4cf223';
hit.closureReason = 'Merged s1506. Render-boundary cure: IRREGULAR_PLURALS holds exactly one entry (straw_man -> "straw men"), consulted only on the count!==1 branch; humanize/toSnakeCase/deriveMechanicsManifest and the byte-stable E1 fixture untouched. Gated in detached worktree gate-s1506 (S3.0b): tsc clean, build 1.02s, own spec 8 passed (4 titles x 2 projects, the DERIVED count, no new titles), adjacent RE-DERIVED from the tree (grep returns 10 manifest-referencing specs; runner named 3 and missed all eight er01-e*-census) -> 11 non-own specs, 84 passed / 0 failed, boot probes 18 passed, test:node-guards rc=0 (345 tests, fail 0, 3 cross-engine skips). Manufactured-defect probe RE-RUN by the drain rather than inherited: reverting the expression reddened ONLY the :297 test on BOTH projects at :354 (Expected "straw men" / Received "...straw mans..."), restore verified sha256:e3aa742e5a7749e3 identical and worktree clean. That probe also proved the master crux: execution reached :354, so the pre-existing self-referential assertion at :348-352 passed WITH the defect present. Screenshots read by eye (F-1332-2), desktop + 390px. Review: reviews/f1501-4-manifest-plural.md';
fs.writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('AFTER  status:', hit.status, 'mergeHash:', hit.mergeHash);
