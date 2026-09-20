// s1468: is gate-s1455's staged content already on main, or is it unlanded work?
// VERIFY-DON'T-INHERIT: probe by FILE and by BLOB, never by commit message.
import { spawnSync } from 'node:child_process';
const WT = 'gate-s1455';

const staged = [
  'artifacts/f1453-1/census-after.txt', 'artifacts/f1453-1/census-before.txt',
  'artifacts/f1453-1/report.md', 'artifacts/f1453-1/speeds-after.txt',
  'artifacts/f1453-1/speeds-before.txt', 'e2e/f1453-crossings-hygiene.spec.ts',
  'src/entities/Enemy.ts',
];

for (const p of staged) {
  const onMain = spawnSync('git', ['cat-file', '-e', `main:${p}`]).status === 0;
  let same = null;
  if (onMain) {
    const mainBlob = spawnSync('git', ['rev-parse', `main:${p}`], { encoding: 'utf8' }).stdout.trim();
    const wtBlob = spawnSync('git', ['hash-object', p], { cwd: WT, encoding: 'utf8' }).stdout.trim();
    same = mainBlob === wtBlob;
  }
  console.log(`${onMain ? (same ? 'ON-MAIN-IDENTICAL' : 'ON-MAIN-DIFFERS  ') : 'ABSENT-FROM-MAIN '} ${p}`);
}

console.log('\n=== does main mention F-1453-1 / the spec at all? ===');
const bl = spawnSync('git', ['show', 'main:tasks/BACKLOG.md'], { encoding: 'utf8', maxBuffer: 32e6 }).stdout || '';
const hits = bl.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => l.includes('F-1453-1'));
console.log(`BACKLOG rows naming F-1453-1: ${hits.length}`);
hits.slice(0, 2).forEach(([n, l]) => console.log(`  :${n} ${l.slice(0, 300)}`));
