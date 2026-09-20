import { execFileSync } from 'node:child_process';
const out = execFileSync('git', ['-C', 'gate-s1506', 'merge', '--no-ff', '-m', 'gate-s1506 trial merge lane/c', 'lane/c'], { encoding: 'utf8' });
console.log(out);
console.log(execFileSync('git', ['-C', 'gate-s1506', 'status', '--porcelain'], { encoding: 'utf8' }) || '(clean)');
console.log(execFileSync('git', ['-C', 'gate-s1506', 'log', '--oneline', '-2'], { encoding: 'utf8' }));
