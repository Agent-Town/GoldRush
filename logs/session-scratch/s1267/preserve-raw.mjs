// RETENTION (F-1267-3, applied to this fire's own evidence): the eight arm transcripts are
// `*.log` and therefore gitignored by .gitignore:7 — the exact hole this fire measured. Everything
// load-bearing from them is extracted here into a tracked JSON so the readings survive the disk.
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = 'logs/session-scratch/s1267';
const arms = [
  { key: 'fire-concurrent', shell: 'fire (launchd headless claude, node v26.4.0)', cwd: '(repo root)' },
  { key: 'lanedir-concurrent', shell: 'fire (launchd headless claude, node v26.4.0)', cwd: 'worktrees/lane-b' },
];

const out = { subject: 'e2e/gazette-welcome.spec.ts:88 toBeLessThan(1)', mainAt: '0f9c19c2', arms: [] };
for (const a of arms) {
  const meta = JSON.parse(readFileSync(`${OUT}/${a.key}-meta.json`, 'utf8'));
  const runs = [];
  let reds = 0;
  let instances = 0;
  for (const m of meta) {
    const txt = readFileSync(m.log, 'utf8');
    const lines = txt.split('\n');
    const driftReceived = [];
    const otherFailures = [];
    for (let i = 1; i < lines.length; i++) {
      if (!/Received:/.test(lines[i])) continue;
      if (/Expected:\s*<\s*1\s*$/.test(lines[i - 1])) driftReceived.push(Number(lines[i].split('Received:')[1].trim()));
      else otherFailures.push({ expected: lines[i - 1].trim(), received: lines[i].trim() });
    }
    const failed = Number((txt.match(/^\s+(\d+) failed/m) || [0, 0])[1]);
    const passed = Number((txt.match(/^\s+(\d+) passed/m) || [0, 0])[1]);
    reds += driftReceived.length;
    instances += failed + passed;
    runs.push({
      run: m.run,
      reporterLine: (txt.match(/Running \d+ tests using \d+ workers?/) || ['UNKNOWN'])[0],
      failed, passed,
      wallSeconds: m.wallSeconds,
      loadavgBefore: m.loadavgBefore,
      driftReds: driftReceived.length,
      driftReceived,
      nonDriftFailures: otherFailures,
    });
  }
  out.arms.push({ ...a, rate: `${reds} / ${instances}`, runs });
}
writeFileSync(`${OUT}/arms-raw.json`, JSON.stringify(out, null, 2) + '\n');
console.log(out.arms.map((a) => `${a.key} (${a.cwd}): ${a.rate}`).join('\n'));
