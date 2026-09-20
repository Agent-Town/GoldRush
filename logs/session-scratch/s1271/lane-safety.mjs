import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';

const out = 'logs/session-scratch/s1271/lane-safety.json';
mkdirSync('logs/session-scratch/s1271', { recursive: true });

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const config = readFileSync('playwright.config.ts', 'utf8');
const workersLines = config.split('\n')
  .map((line, index) => `${index + 1}:${line}`)
  .filter((line) => line.includes('workers'));
const premise = {
  isFireShellCount: (config.match(/isFireShell/g) ?? []).length,
  workersLines,
  headConfigBlob: git('rev-parse', 'HEAD:playwright.config.ts'),
  mainConfigBlob: git('rev-parse', 'main:playwright.config.ts'),
  head: git('rev-parse', 'HEAD'),
  headBehindMain: Number(git('rev-list', '--count', 'HEAD..main')),
};

if (premise.isFireShellCount < 1 || !workersLines.some((line) => /workers:\s*isFireShell/.test(line))
    || premise.headConfigBlob !== premise.mainConfigBlob) {
  writeFileSync(out, JSON.stringify({ premise, environment: null, runs: [] }, null, 2));
  throw new Error('PREMISE ABSENT — predicate not in this tree, measurement impossible');
}

const environment = {
  CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR ?? null,
  CLAUDE_CONFIG_DIRDefined: process.env.CLAUDE_CONFIG_DIR !== undefined,
  SHELL: process.env.SHELL ?? null,
  cwd: process.cwd(),
  cpus: os.cpus().length,
  node: process.version,
  loadavg: os.loadavg(),
};
const result = { premise, environment, runs: [] };
writeFileSync(out, JSON.stringify(result, null, 2));

const baseArgs = [
  'playwright', 'test', 'e2e/gazette-welcome.spec.ts',
  '--project=desktop-chrome', '--project=mobile-chrome',
  '--repeat-each=3', '-g', 'fires once', '--reporter=list',
];
const arms = [
  { arm: 'A', flags: [] },
  { arm: 'B', flags: ['--workers=1'] },
  { arm: 'A', flags: [] },
  { arm: 'B', flags: ['--workers=1'] },
];

for (const [index, arm] of arms.entries()) {
  const args = [...baseArgs, ...arm.flags];
  const loadavgBefore = os.loadavg();
  const started = process.hrtime.bigint();
  let output = '';
  const child = spawn('npx', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', (chunk) => {
    output += chunk;
    process.stdout.write(chunk);
  });
  child.stderr.on('data', (chunk) => {
    output += chunk;
    process.stderr.write(chunk);
  });
  const exitCode = await new Promise((resolve) => child.on('close', resolve));
  const wallSeconds = Number(process.hrtime.bigint() - started) / 1e9;
  const workers = output.match(/Running \d+ tests? using (\d+) workers?/);
  const passed = output.match(/(\d+) passed/);
  const failed = output.match(/(\d+) failed/);
  result.runs.push({
    seq: index + 1,
    arm: arm.arm,
    command: ['npx', ...args].join(' '),
    workersObtained: workers ? Number(workers[1]) : null,
    exitCode,
    passed: passed ? Number(passed[1]) : 0,
    failed: failed ? Number(failed[1]) : 0,
    wallSeconds: Number(wallSeconds.toFixed(2)),
    loadavgBefore,
    loadavgAfter: os.loadavg(),
  });
  writeFileSync(out, JSON.stringify(result, null, 2));
  console.log(`\nRECORDED ${index + 1}/4 arm ${arm.arm}\n`);
}
