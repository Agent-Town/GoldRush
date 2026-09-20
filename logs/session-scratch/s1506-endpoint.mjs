import { execFileSync } from 'node:child_process';
const g = (...a) => execFileSync('git', ['-C', 'gate-s1506', ...a], { encoding: 'utf8' });
// discard ONLY the screenshot churn my own gate runs produced, inside the gate worktree
console.log('discarding churn:', g('checkout', 'HEAD', '--', 'artifacts', 'reviews').trim() || '(ok)');
console.log('remaining tracked dirt:', JSON.stringify(g('status', '--porcelain', '--untracked-files=no')));
console.log(g('checkout', '--detach', 'b66905c64c0f30cbb1b018128288c19ebca5fa79').trim());
console.log('now at:', g('log', '-1', '--format=%h %cI').trim());
