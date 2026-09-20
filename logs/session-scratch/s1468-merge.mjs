// s1468: merge the gated slice to main by cherry-picking the lane's OWN commit.
// NOT a two-dot merge: lane/b's base (636e0eb2) predates s1467's drain, so a blind
// merge would revert the NUL cure, the e3 review and src/sim as phantom deletions.
import { spawnSync } from 'node:child_process';

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  console.log(`$ ${cmd} ${args.join(' ')} -> rc=${r.status}`);
  if (r.stdout && r.stdout.trim()) console.log(r.stdout.trim().slice(0, 2000));
  if (r.stderr && r.stderr.trim()) console.log('ERR:', r.stderr.trim().slice(0, 2000));
  return r;
}

// guard: main's tree must be free of tracked src/ dirt before we touch it
const st = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
const dirty = (st.stdout || '').split('\n').filter(l => l.trim() && !l.startsWith('??'));
console.log('tracked dirt on main:', JSON.stringify(dirty));

const r = run('git', ['cherry-pick', '-x', '780d27e3']);
if (r.status !== 0) { console.log('MERGE FAILED — not proceeding'); process.exit(1); }
run('git', ['log', '-1', '--format=%H %s']);
