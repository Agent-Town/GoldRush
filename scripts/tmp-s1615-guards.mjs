import { execSync } from 'node:child_process';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts;
const chained = [
  ['test:findings-state', pkg['test:findings-state']],
  ['test:blocker-panel', pkg['test:blocker-panel']],
  ['test:ruling-propagation', pkg['test:ruling-propagation']],
  ['test:citations', pkg['test:citations']],
  ['test:desk-declaration', pkg['test:desk-declaration']],
  ['test:desk-birth', pkg['test:desk-birth']],
  ['main-lock-gate-guard', 'bash scripts/main-lock-gate-guard.test.sh'],
  ['janitor-request-rejection', 'bash scripts/janitor-request-rejection.test.sh'],
  ['lane-dispatch-safety-guard', 'bash scripts/lane-dispatch-safety-guard.test.sh'],
  ['nul-audit', 'node scripts/nul-audit.mjs'],
];

let failed = 0;
for (const [name, cmd] of chained) {
  if (!cmd) {
    console.log(`?? ${name}: no such npm script`);
    failed++;
    continue;
  }
  try {
    execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
    console.log(`PASS  ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL  ${name}  (rc=${err.status})`);
    const out = `${err.stdout || ''}${err.stderr || ''}`.trim().split('\n').slice(-12).join('\n');
    console.log(out);
  }
}
console.log(failed === 0 ? 'ALL CHAINED LEAVES PASS' : `${failed} chained leaf/leaves FAILED`);
process.exit(failed === 0 ? 0 : 1);
