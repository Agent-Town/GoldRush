import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { classifyRoot } from './master-shipped-classifier.mjs';

function fixture(master, files = [], goals = [], masterText = `# Human title for ${master}\n`) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'master-shipped-'));
  fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tasks', master), masterText);
  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({ goals }));
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), 'evidence\n');
  }
  return root;
}

test('a drained done-move ships the master and names its hash', (t) => {
  const root = fixture('lane-c-foo.md', ['tasks/done/drained-abc1234-20260808-lane-c-foo.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const item = classifyRoot(root).verdicts[0];
  assert.equal(item.verdict, 'SHIPPED');
  assert.equal(item.evidence[0].hash, 'abc1234');
});

test('a slot-stripped review ships the master and manufactures F-1569-1', (t) => {
  const root = fixture('lane-c-foo.md', ['reviews/foo.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const result = classifyRoot(root);
  const item = result.verdicts[0];
  assert.equal(item.verdict, 'SHIPPED');
  assert.equal(item.evidence[0].path, 'reviews/foo.md');
  assert.equal(result.counts.DISAGREES, 1);
  // RED arm (F-1569-1): a stem-only classifier loses the review and falsely banks shipped work.
  assert.equal(item.transforms.full, 'NO-TRACE');
});

test('a failed trace is ran but unmerged', (t) => {
  const root = fixture('lane-c-foo.md', ['tasks/failed/20260808-lane-c-foo.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const item = classifyRoot(root).verdicts[0];
  assert.equal(item.verdict, 'RAN-UNMERGED');
  assert.equal(item.evidence[0].path, 'tasks/failed/20260808-lane-c-foo.md');
});

test('a master with no trace and no banner is a candidate', (t) => {
  const root = fixture('lane-c-foo.md');
  t.after(() => fs.rmSync(root, { recursive: true }));
  const result = classifyRoot(root);
  const item = result.verdicts[0];
  assert.equal(item.verdict, 'NO-TRACE');
  assert.equal(item.banner, '');
  assert.deepEqual(item.evidence, []);
  assert.equal(item.evidenceSummary, 'empty set');
  assert.equal(result.counts.CANDIDATES, 1);
});

test('a no-trace master records its DO NOT QUEUE banner and is not a candidate', (t) => {
  const root = fixture('lane-c-foo.md', [], [], '# Human title\n⛔ SHIPPED — DO NOT QUEUE\n');
  t.after(() => fs.rmSync(root, { recursive: true }));
  const result = classifyRoot(root);
  assert.equal(result.verdicts[0].verdict, 'NO-TRACE');
  assert.equal(result.verdicts[0].banner, 'DO NOT QUEUE');
  assert.equal(result.counts.CANDIDATES, 0);
});

test('archive-CODEX-WALL real NEVER QUEUE wording is a banner', (t) => {
  const root = fixture('archive-CODEX-WALL-dead-flag-s915.md', [], [], '# NOT A WORK MASTER — NEVER QUEUE\n');
  t.after(() => fs.rmSync(root, { recursive: true }));
  const result = classifyRoot(root);
  assert.equal(result.verdicts[0].banner, 'NEVER QUEUE');
  assert.equal(result.counts.CANDIDATES, 0);
});

test('art-era-motion real NOT QUEUEABLE wording is a banner', (t) => {
  const root = fixture('art-era-motion-hero-e2.md', [], [], '# OPEN BUT NOT QUEUEABLE — ITS INPUT DOES NOT EXIST AND ITS PIPELINE IS CREDIT-GATED\n');
  t.after(() => fs.rmSync(root, { recursive: true }));
  const result = classifyRoot(root);
  assert.equal(result.verdicts[0].banner, 'NOT QUEUEABLE');
  assert.equal(result.counts.CANDIDATES, 0);
});

test('058b real NOT FIRE-QUEUEABLE wording is a banner', (t) => {
  const root = fixture('058b-adjacent-reds-fingerprint.md', [], [], '# OPEN BY DELIBERATE CHOICE — ATTENDED/OWNER, NOT FIRE-QUEUEABLE\n');
  t.after(() => fs.rmSync(root, { recursive: true }));
  const result = classifyRoot(root);
  assert.equal(result.verdicts[0].banner, 'NOT FIRE-QUEUEABLE');
  assert.equal(result.counts.CANDIDATES, 0);
});

test('regression: DO NOT QUEUE and DO-NOT-QUEUE remain banners', (t) => {
  for (const wording of ['DO NOT QUEUE', 'DO-NOT-QUEUE']) {
    const root = fixture(`lane-c-${wording.replaceAll(' ', '-').toLowerCase()}.md`, [], [], `# ${wording}\n`);
    t.after(() => fs.rmSync(root, { recursive: true }));
    assert.equal(classifyRoot(root).verdicts[0].banner, wording);
  }
});

test('queue this after the drain mentions queueing without refusing it', (t) => {
  const root = fixture('lane-c-foo.md', [], [], '# Queue this after the drain\n');
  t.after(() => fs.rmSync(root, { recursive: true }));
  const result = classifyRoot(root);
  assert.equal(result.verdicts[0].banner, '');
  assert.equal(result.counts.CANDIDATES, 1);
});

test('the banner window ends after line six', (t) => {
  const root = fixture('lane-c-foo.md', [], [], '1\n2\n3\n4\n5\n6\n7\n8\nDO-NOT-QUEUE\n');
  t.after(() => fs.rmSync(root, { recursive: true }));
  const result = classifyRoot(root);
  assert.equal(result.verdicts[0].banner, '');
  assert.equal(result.counts.CANDIDATES, 1);
});

test('a merged goal leaf ships its exact task file with its hash', (t) => {
  const root = fixture('lane-c-foo.md', [], [
    { id: 'foo', taskFile: 'lane-c-foo.md', status: 'merged', mergeHash: 'def5678' },
  ]);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const item = classifyRoot(root).verdicts[0];
  assert.equal(item.verdict, 'SHIPPED');
  assert.equal(item.evidence[0].hash, 'def5678');
});
