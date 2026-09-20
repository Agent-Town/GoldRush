// s1468: prove lane/b's tip is fully absorbed by main before ruling on the HOLDS verdict.
// The classifier buckets tasks/BACKLOG.md + tasks/goals.json as BOTH-MOVED (main moved too),
// but reports 0 added lines absent. Verify that independently, per path, by content.
import { spawnSync } from 'node:child_process';

function sh(args) {
  const r = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  return (r.stdout || '');
}

// 1. git cherry: does main contain an equivalent of every lane commit?
console.log('=== git cherry main lane/b (- = already applied) ===');
console.log(sh(['cherry', 'main', 'lane/b']).trim());

// 2. per-path: every line lane/b ADDED vs its base — is it present in main's version?
const base = sh(['merge-base', 'main', 'lane/b']).trim();
for (const p of ['tasks/BACKLOG.md', 'tasks/goals.json']) {
  const added = sh(['diff', `${base}..lane/b`, '--', p])
    .split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1));
  const mainVer = sh(['show', `main:${p}`]);
  const missing = added.filter(l => l.trim() && !mainVer.includes(l));
  console.log(`\n${p}: ${added.length} added line(s), ${missing.length} ABSENT from main`);
  missing.slice(0, 3).forEach(l => console.log('   ABSENT:', l.slice(0, 160)));
}

// 3. the 27 pure-add files: present in main?
const files = sh(['show', '--name-only', '--format=', '780d27e3']).trim().split('\n').filter(Boolean);
const absentFiles = files.filter(f => sh(['cat-file', '-e', `main:${f}`]) === '' &&
  spawnSync('git', ['cat-file', '-e', `main:${f}`]).status !== 0);
console.log(`\nlane commit touched ${files.length} files; ${absentFiles.length} absent from main`);
absentFiles.forEach(f => console.log('   ABSENT:', f));
