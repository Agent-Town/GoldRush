// s1468: did the rig rewrite the tracked evidence it just merged?
import { spawnSync } from 'node:child_process';
const WT = process.cwd() + '/gate-s1468';
const r = spawnSync('git', ['status', '--short'], { cwd: WT, encoding: 'utf8' });
const out = (r.stdout || '').trim();
console.log(out === '' ? 'CLEAN — no file rewritten by the gate run' : out);
