// s1468: retain s1455's untracked run-gate.mjs (it dies with the worktree otherwise),
// then remove ONLY my own gate worktree, whose content is 100% on main as c42d653a.
// gate-s1455 is LEFT IN PLACE: it still holds 10 AT-RISK modified artifact blobs.
import { copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

copyFileSync('gate-s1455/run-gate.mjs', 'logs/session-scratch/s1455-run-gate-SALVAGED.mjs');
console.log('salvaged run-gate.mjs -> logs/session-scratch/s1455-run-gate-SALVAGED.mjs');

const rm = spawnSync('git', ['worktree', 'remove', '--force', 'gate-s1468'], { encoding: 'utf8' });
console.log('remove gate-s1468 -> rc=' + rm.status, (rm.stderr || '').trim().slice(0, 200));

const list = spawnSync('git', ['worktree', 'list'], { encoding: 'utf8' }).stdout || '';
console.log('remaining gate worktrees:', list.split('\n').filter(l => /gate-/.test(l)).join(' | ') || '(none)');
