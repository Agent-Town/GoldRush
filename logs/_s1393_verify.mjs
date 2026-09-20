#!/usr/bin/env node
// s1393 scratch: classify the six lane paths against main since the merge-base.
import { execFileSync } from 'node:child_process';
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const rc = (...a) => { try { execFileSync('git', a, { stdio: 'ignore' }); return 0; } catch (e) { return e.status ?? 1; } };

const TIP = 'e676addf';
const BASE = git('merge-base', 'main', TIP);

console.log('74f95634 ancestor of main?', rc('merge-base', '--is-ancestor', '74f95634', 'main') === 0 ? 'YES (benign old main commit)' : 'NO');
console.log('base:', BASE);

const paths = git('show', '--pretty=format:', '--name-only', TIP).split('\n').filter(Boolean);
console.log('\nlane-touched paths (from the commit itself):', paths.length);
for (const p of paths) {
  const mainMoved = git('log', '--oneline', `${BASE}..main`, '--', p);
  console.log(`  ${mainMoved ? 'BOTH-MOVED ⚠️' : 'LANE-ONLY  ✅'}  ${p}${mainMoved ? '\n      main: ' + mainMoved.replace(/\n/g, '\n      ') : ''}`);
}

console.log('\npatch applies to current main?');
const patch = execFileSync('git', ['show', TIP], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
try {
  execFileSync('git', ['apply', '--check', '-'], { input: patch, stdio: ['pipe', 'ignore', 'pipe'] });
  console.log('  git apply --check: CLEAN ✅');
} catch (e) {
  console.log('  git apply --check: CONFLICT ⛔\n' + String(e.stderr));
}
