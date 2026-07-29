import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = process.env.GOLD_RUSH_ROOT
  ?? dirname(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    cwd: SOURCE_ROOT,
    encoding: 'utf8',
  }).trim());
const STATS_FILE = resolve(ROOT, process.env.GOLD_RUSH_TASK_STATS_FILE ?? 'logs/task-stats.jsonl');
const RUNS = join(ROOT, 'tasks/runs');
const ARCHIVE = join(ROOT, 'logs/runs-archive');
const ENTRY_FLOOR = 228;

test('every recorded run log remains recoverable', () => {
  const archiveFiles = readdirSync(ARCHIVE);
  const tracked = new Set(execFileSync('git', ['ls-files', '--', 'logs/runs-archive'], {
    cwd: ROOT,
    encoding: 'utf8',
  }).split(/\r?\n/).filter(Boolean));
  const atRisk = archiveFiles.filter((name) => !tracked.has(`logs/runs-archive/${name}`));
  const atRiskBytes = atRisk.reduce((bytes, name) => bytes + statSync(join(ARCHIVE, name)).size, 0);
  console.log(
    `AT RISK (archive files absent from git ls-files; informational): ${atRisk.length} files, ${(atRiskBytes / 1048576).toFixed(2)} MB`,
  );

  const entries = readFileSync(STATS_FILE, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
  assert.ok(
    entries.length >= ENTRY_FLOOR,
    `task-stats floor: expected at least ${ENTRY_FLOOR} entries, found ${entries.length}`,
  );

  const recoverableLogs = new Set(
    [...readdirSync(RUNS), ...archiveFiles].filter((name) => name.endsWith('.log')),
  );
  const missing = entries.filter(
    ({ stamp, lane, task }) => !recoverableLogs.has(`${stamp}-${lane}-${task}.md.log`),
  );
  console.log(`Run log retention: ${entries.length} entries checked, ${missing.length} unrecoverable`);
  assert.deepEqual(
    missing,
    [],
    `unrecoverable run logs:\n${missing
      .map(({ stamp, lane, task }) => `  ${stamp} | ${lane} | ${task}`)
      .join('\n')}`,
  );
});
