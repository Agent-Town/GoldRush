// s1507 — merge lane/a into main. Three-way (`git merge`), never a two-dot copy: main's own
// commits would read as deletions in a two-dot diff.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const run = (...a) => {
  const r = spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' });
  console.log(`$ git ${a.join(' ')}\n${(r.stdout || '').trim()}${r.stderr ? '\n[stderr] ' + r.stderr.trim() : ''}\n  rc=${r.status}\n`);
  return r;
};

run('rev-parse', '--abbrev-ref', 'HEAD');
run('status', '--short', '--untracked-files=no');
run('merge', '--no-ff', 'lane/a', '-m',
  'merge(f1506-2-e9-roster-bisect): the Lantern Show took every ordinary boot to E1 — contract-derived epochs now ride the replay route alone');
run('log', '--oneline', '-2');
run('rev-parse', 'HEAD');
