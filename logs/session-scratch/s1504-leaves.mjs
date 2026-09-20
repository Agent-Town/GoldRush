import fs from 'node:fs';
const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));
const MERGE = 'ced0fc61b4c851cc991c273a213a72dadc00c1cc';

let found = null, parentArr = null, idx = -1;
const walk = (node) => {
  for (const key of ['goals', 'subgoals', 'tasks']) {
    const arr = node[key];
    if (!Array.isArray(arr)) continue;
    arr.forEach((child, i) => {
      if (child.id === 'f1501-1-drill-yard-briefing') { found = child; parentArr = arr; idx = i; }
      walk(child);
    });
  }
};
walk(g);
if (!found) throw new Error('f1501-1 leaf not found');

found.status = 'merged';
found.mergeHash = MERGE;
found.review = 'reviews/f1501-1-drill-yard-briefing.md';

const already = parentArr.some((l) => l.id === 'f1504-1-drill-yard-stale-absence');
if (!already) {
  parentArr.splice(idx + 1, 0, {
    id: 'f1504-1-drill-yard-stale-absence',
    title:
      'F-1504-1: e2e/drill-yard.spec.ts:92 asserts the Drill Yard briefing is ABSENT (toHaveCount(0)) — the pre-AP-11 shape. f1501-1 merged at ' +
      MERGE +
      ' makes the card render its briefing, so the assertion is stale by construction and red on both projects; a pre-merge control at 1466e681e returned 4 passed, proving the red is merge-caused. Invert it into a positive check that the briefing is present and carries every authored rule (derived from loadEpoch, not hardcoded copy). f1501-1 could not do this: its firewall forbade e2e/**, deliberately.',
    taskFile: 'lane-f1504-1-drill-yard-stale-absence.md',
    lane: 'lane-a',
    status: 'planned',
    attempts: 0,
    authoredBy: 's1504 fire',
  });
}
fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('f1501-1 ->', found.status, found.mergeHash);
console.log('new leaf added:', !already);
