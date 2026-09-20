import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

// Verify the symlink is a symlink and points where we expect, THEN unlink it FIRST,
// so nothing can follow it into main's node_modules during worktree removal.
const link = 'gate-s1506/node_modules';
const st = fs.lstatSync(link);
if (!st.isSymbolicLink()) throw new Error('REFUSING: gate node_modules is not a symlink');
const target = fs.readlinkSync(link);
console.log('symlink ->', target);
if (!target.endsWith('/node_modules')) throw new Error('REFUSING: unexpected target');
fs.unlinkSync(link);
console.log('symlink unlinked (main node_modules untouched):', fs.existsSync('node_modules'));

console.log(execFileSync('git', ['worktree', 'remove', '--force', 'gate-s1506'], { encoding: 'utf8' }) || 'worktree removed');
console.log('gate-s1506 present?', fs.existsSync('gate-s1506'));
console.log(execFileSync('git', ['worktree', 'list'], { encoding: 'utf8' }).split('\n').filter((l) => l.includes('gate-s')).join('\n') || 'no gate-s* worktrees except owner-gated');
