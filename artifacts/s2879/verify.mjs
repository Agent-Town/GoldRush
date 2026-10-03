import fs from 'node:fs';
import cp from 'node:child_process';
import assert from 'node:assert/strict';

const read = p => fs.readFileSync(p, 'utf8');
const ancestor = hash => cp.spawnSync('git', ['merge-base', '--is-ancestor', hash, 'main']).status === 0;
const wanted = new Set(['launch-video-cut-3', 'emdash-entities-1', 'skill-door-unclaimed-refresh-1']);
const goals = [];
function visit(value) {
  if (!value || typeof value !== 'object') return;
  if (wanted.has(value.id)) goals.push({ id: value.id, status: value.status, mergeHash: value.mergeHash, ancestor: ancestor(value.mergeHash) });
  for (const child of Object.values(value)) visit(child);
}
visit(JSON.parse(read('tasks/goals.json')));
assert.equal(goals.length, 3);
assert.ok(goals.every(g => g.status === 'merged' && g.ancestor));
const registry = JSON.parse(read('assets/rotations/rotation-seeds.json'));
const fence = read('public/skill.md').split('<!-- skillmd-guard:rotations:start -->')[1].split('<!-- skillmd-guard:rotations:end -->')[0];
assert.deepEqual(JSON.parse(fence.match(/```json\s*([\s\S]*?)```/)[1]), registry);
const next = registry.rotations.find(r => r.id === 'r2026w41');
assert.equal(next.opensAt, '2026-10-05T00:00:00.000Z');
const prior = JSON.parse(read('artifacts/s2873/verification.json'));
const ancestors = prior.ancestors.map(({ hash }) => ({ hash, ancestor: ancestor(hash) }));
assert.ok(ancestors.every(x => x.ancestor));
const gazette = prior.gazette.map(({ hash }) => ({ hash, present: read('marketing/outbox/gazette-queue.md').includes(hash) }));
assert.ok(gazette.every(x => x.present));
assert.equal(read('artifacts/s2879/private-heads.txt'), read('artifacts/s2873/private-heads.txt'));
const entryHead = read('artifacts/s2879/entry-head.txt').trim();
assert.equal(read('artifacts/s2879/origin-before.txt').split(/\s+/)[0], entryHead);
const report = {
  at: new Date().toISOString(), entryHead, goals,
  rotations: { wholeFenceMatches: true, count: registry.rotations.length, comingId: next.id, opensAt: next.opensAt, seeds: Object.keys(next.seeds).length },
  ancestors, gazette, privateHeadsMatchCompletedDuty: true, originMatchesEntry: true,
  releaseVerdictUnsigned: read('docs/release/verdict-954bb2cd.md').includes('SHIP / HOLD — signed: ___'),
  tickerComplete: read('marketing/outbox/ticker-digest-2026-10-02.md').includes('**40 updates**'),
};
assert.ok(report.releaseVerdictUnsigned && report.tickerComplete);
fs.writeFileSync('artifacts/s2879/verification.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
