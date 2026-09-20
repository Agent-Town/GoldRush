// s1265 — measure the node-version effect as a RATE, not as one reading.
// Single readings on this assertion have now misled three consecutive fires. Two arms,
// INTERLEAVED (order is a confound), starting with node26 so the order is opposite to the
// first observation. Output of each run goes to its own file via an fd -- spawnSync
// truncates piped stdout under load (known finding), so nothing is piped.
import { spawnSync } from 'node:child_process';
import { openSync, closeSync, readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const NODE23 = '/Users/robin/.nvm/versions/node/v23.11.1/bin/node';
const NODE26 = process.execPath;
const DIR = 'logs/session-scratch/s1265/rate';
mkdirSync(DIR, { recursive: true });

const ARGS = [
  'node_modules/@playwright/test/cli.js', 'test', 'e2e/gazette-welcome.spec.ts',
  '--project=desktop-chrome', '--project=mobile-chrome',
  '--repeat-each=3', '-g', 'fires once', '--reporter=list',
];

const plan = [['node26', NODE26], ['node23', NODE23], ['node26', NODE26], ['node23', NODE23]];
const rows = [];

for (let i = 0; i < plan.length; i += 1) {
  const [label, bin] = plan[i];
  const out = DIR + '/' + String(i + 1) + '-' + label + '.txt';
  const fd = openSync(out, 'w');
  const load0 = os.loadavg()[0];
  const t0 = Date.now();
  spawnSync(bin, ARGS, { stdio: ['ignore', fd, fd] });
  const wall = (Date.now() - t0) / 1000;
  closeSync(fd);

  const text = readFileSync(out, 'utf8');
  const failed = /(\d+) failed/.exec(text);
  const passed = /(\d+) passed/.exec(text);
  // Count only reds that are the drift assertion itself, not other assertions in the same test.
  const drift = (text.match(/toBeLessThan\(expected\)/g) || []).length;
  rows.push({
    run: i + 1, node: label,
    failed: failed ? Number(failed[1]) : 0,
    passed: passed ? Number(passed[1]) : 0,
    driftReds: drift,
    wall: wall.toFixed(1),
    load0: load0.toFixed(2),
  });
  console.log(JSON.stringify(rows[rows.length - 1]));
}

console.log('');
console.log('run | node   | failed | passed | drift-assertion reds | wall s | load at start');
for (const r of rows) {
  console.log(
    String(r.run).padEnd(3) + ' | ' + r.node.padEnd(6) + ' | ' + String(r.failed).padEnd(6) +
    ' | ' + String(r.passed).padEnd(6) + ' | ' + String(r.driftReds).padEnd(20) +
    ' | ' + String(r.wall).padEnd(6) + ' | ' + r.load0
  );
}
const tally = (n) => {
  const rs = rows.filter((r) => r.node === n);
  return n + ': ' + rs.reduce((a, r) => a + r.driftReds, 0) + ' drift reds / ' + rs.length * 6 + ' instances';
};
console.log('');
console.log(tally('node26'));
console.log(tally('node23'));
process.exit(0);
