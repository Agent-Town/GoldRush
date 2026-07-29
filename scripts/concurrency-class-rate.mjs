#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLAYWRIGHT = path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');
const PROJECTS = ['desktop-chrome', 'mobile-chrome'];

if (process.argv.includes('--self-test')) {
  selfTest();
} else {
  await main();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const outputDir = path.resolve(ROOT, options.output);
  const rawDir = path.join(outputDir, 'raw');
  if (fs.existsSync(outputDir) && fs.readdirSync(outputDir).length) {
    throw new Error(`Output directory is not empty: ${outputDir}`);
  }
  fs.mkdirSync(rawDir, { recursive: true });

  const initialHead = gitHead();
  const baseURL = `http://127.0.0.1:${options.port}`;
  await assertPortFree(options.port);
  const vite = await createServer({
    logLevel: 'error',
    server: { host: '127.0.0.1', port: options.port, strictPort: true },
  });
  const runs = [];

  try {
    await vite.listen();
    const response = await fetch(baseURL);
    if (!response.ok) throw new Error(`Vite readiness returned HTTP ${response.status}`);
    console.log(`server ${baseURL} tree ${initialHead}`);

    for (let cycle = 1; cycle <= options.runs; cycle += 1) {
      for (const workers of options.workers) {
        const runNumber = runs.length + 1;
        const head = gitHead();
        if (head !== initialHead) throw new Error(`Tree changed: ${initialHead} -> ${head}`);
        console.log(`run ${runNumber}/${options.runs * options.workers.length}: cycle=${cycle} workers=${workers}`);
        const startedAt = new Date().toISOString();
        const loadavgStart = os.loadavg();
        const artifactsDir = path.join(outputDir, 'test-results', `run-${runNumber}`);
        const result = await runPlaywright(options.subjects, workers, baseURL, artifactsDir);
        const loadavgEnd = os.loadavg();
        const endedAt = new Date().toISOString();
        const rawPath = path.join(rawDir, `run-${String(runNumber).padStart(2, '0')}-w${workers}.json`);
        fs.writeFileSync(rawPath, result.stdout);
        // ponytail: compact JSON is the rate evidence; rerun one row if a full trace is needed.
        fs.rmSync(artifactsDir, { recursive: true, force: true });
        if (!result.stdout.trim()) throw new Error(`Playwright emitted no JSON; stderr: ${result.stderr}`);

        let report;
        try {
          report = JSON.parse(result.stdout);
        } catch {
          throw new Error(`Invalid Playwright JSON in ${rawPath}; stderr: ${result.stderr}`);
        }
        const executions = collectExecutions(report);
        assertComplete(executions, options.subjects);
        const run = {
          cycle,
          workers,
          configuredWorkers: report.config?.workers,
          actualWorkers: report.config?.metadata?.actualWorkers,
          head,
          startedAt,
          endedAt,
          loadavgStart,
          loadavgEnd,
          exitCode: result.code,
          executions,
        };
        runs.push(run);
        fs.appendFileSync(path.join(outputDir, 'runs.jsonl'), `${JSON.stringify(run)}\n`);
        writeSummary(outputDir, { ...options, initialHead, baseURL, runs });
      }
    }
  } finally {
    await vite.close();
    await assertPortFree(options.port);
    console.log(`released ${baseURL}`);
  }
}

function parseArgs(args) {
  if (args.includes('--help')) {
    console.log('Usage: node scripts/concurrency-class-rate.mjs --subjects file:line,... --workers 1,2,4 --runs 8+ --port 5267 --output logs/session-scratch/<run>');
    process.exit(0);
  }
  const values = Object.fromEntries(args.flatMap((arg, index) =>
    arg.startsWith('--') && args[index + 1] && !args[index + 1].startsWith('--')
      ? [[arg.slice(2), args[index + 1]]]
      : []
  ));
  const subjects = values.subjects?.split(',').map(normalizeSubject).filter(Boolean) ?? [];
  const workers = values.workers?.split(',').map(Number) ?? [];
  const runs = Number(values.runs);
  const port = Number(values.port);
  if (!subjects.length || !workers.length || !Number.isInteger(runs) || runs < 8
    || workers.some((value) => !Number.isInteger(value) || value < 1)
    || !Number.isInteger(port) || port < 1 || port > 65535 || port === 5188
    || !values.output) {
    throw new Error('Required: --subjects file:line,... --workers 1,2,4 --runs N (>=8) --port PORT (not 5188) --output DIR');
  }
  return { subjects: [...new Set(subjects)], workers: [...new Set(workers)], runs, port, output: values.output };
}

function normalizeSubject(value) {
  const normalized = String(value).replaceAll('\\', '/');
  const e2e = normalized.lastIndexOf('/e2e/');
  const relative = (e2e >= 0 ? normalized.slice(e2e + 1) : normalized).replace(/^\.\//, '');
  return /^[^/]+\.spec\.ts(?::\d+)?$/.test(relative) ? `e2e/${relative}` : relative;
}

async function runPlaywright(subjects, workers, baseURL, outputDir) {
  const args = [
    PLAYWRIGHT,
    'test',
    ...subjects,
    ...PROJECTS.flatMap((project) => ['--project', project]),
    '--workers', String(workers),
    '--reporter', 'json',
    '--output', outputDir,
  ];
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      env: {
        ...process.env,
        GR_CAPTURE_EXTERNAL_SERVER: '1',
        GR_CAPTURE_BASE_URL: baseURL,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

function collectExecutions(report) {
  const executions = [];
  const walk = (suites) => {
    for (const suite of suites ?? []) {
      for (const spec of suite.specs ?? []) {
        const subject = `${normalizeSubject(spec.file ?? suite.file)}:${spec.line}`;
        for (const test of spec.tests ?? []) {
          if (!PROJECTS.includes(test.projectName)) continue;
          const result = test.results?.at(-1);
          executions.push({
            subject,
            project: test.projectName,
            title: spec.title,
            status: test.status === 'expected' && result?.status === 'passed' ? 'pass' : 'fail',
            resultStatus: result?.status ?? 'missing',
            durationMs: result?.duration ?? 0,
          });
        }
      }
      walk(suite.suites);
    }
  };
  walk(report.suites);
  return executions;
}

function assertComplete(executions, subjects) {
  const found = new Set(executions.map(({ subject, project }) => `${subject}\0${project}`));
  const expected = subjects.flatMap((subject) => PROJECTS.map((project) => `${subject}\0${project}`));
  const missing = expected.filter((key) => !found.has(key));
  const extras = [...found].filter((key) => !expected.includes(key));
  if (missing.length || extras.length || executions.length !== expected.length) {
    throw new Error(`Incomplete run: missing=${JSON.stringify(missing)} extras=${JSON.stringify(extras)} executions=${executions.length}/${expected.length}`);
  }
}

function rates(runs) {
  const rows = new Map();
  for (const run of runs) {
    for (const execution of run.executions) {
      const key = `${execution.subject}\0${execution.project}\0${run.workers}`;
      const row = rows.get(key) ?? {
        subject: execution.subject,
        project: execution.project,
        workers: run.workers,
        failures: 0,
        executions: 0,
      };
      row.executions += 1;
      row.failures += execution.status === 'fail' ? 1 : 0;
      rows.set(key, row);
    }
  }
  return [...rows.values()].sort((a, b) =>
    a.subject.localeCompare(b.subject) || a.project.localeCompare(b.project) || a.workers - b.workers
  );
}

function writeSummary(outputDir, state) {
  const rateRows = rates(state.runs);
  fs.writeFileSync(path.join(outputDir, 'rates.json'), `${JSON.stringify({ ...state, rateRows }, null, 2)}\n`);
  const labels = new Map(state.subjects.map((subject, index) => [subject, `S${index + 1}`]));
  const lines = [
    '# Concurrency-class failure rates',
    '',
    `- Tree: \`${state.initialHead}\``,
    `- External Vite: \`${state.baseURL}\` (one server reused; port checked free before binding and after close)`,
    `- Schedule: ${state.runs} interleaved cycles × workers ${state.workers.join(' → ')}`,
    `- Projects: ${PROJECTS.join(', ')}`,
    '',
    ...state.subjects.map((subject) => `- ${labels.get(subject)}: \`${subject}\``),
    '',
    '## Failure-rate table',
    '',
    '| Subject | Project | Workers | Failures / executions | Rate |',
    '|---|---|---:|---:|---:|',
    ...rateRows.map((row) =>
      `| ${labels.get(row.subject)} | ${row.project} | ${row.workers} | **${row.failures}/${row.executions}** | ${(100 * row.failures / row.executions).toFixed(1)}% |`
    ),
    '',
    '## Per-run observations',
    '',
    '| Cycle | Workers | Project | Loadavg 1m start → end | ' + state.subjects.map((subject) => labels.get(subject)).join(' | ') + ' |',
    '|---:|---:|---|---|' + state.subjects.map(() => '---').join('|') + '|',
  ];
  for (const run of state.runs) {
    for (const project of PROJECTS) {
      const outcomes = state.subjects.map((subject) =>
        run.executions.find((execution) => execution.subject === subject && execution.project === project)?.status.toUpperCase() ?? 'MISSING'
      );
      lines.push(`| ${run.cycle} | ${run.workers} | ${project} | ${run.loadavgStart[0].toFixed(2)} → ${run.loadavgEnd[0].toFixed(2)} | ${outcomes.join(' | ')} |`);
    }
  }
  lines.push('', 'Every run record in `runs.jsonl` also carries both full loadavg vectors, timestamps, requested/configured/actual workers, exit code, subject duration, and `git rev-parse HEAD`.', '');
  fs.writeFileSync(path.join(outputDir, 'rates.md'), lines.join('\n'));
}

function gitHead() {
  const { status, stdout, stderr } = fs.existsSync(path.join(ROOT, '.git'))
    ? spawnSyncGit()
    : { status: 1, stdout: '', stderr: 'missing .git' };
  if (status !== 0) throw new Error(`git rev-parse HEAD failed: ${stderr}`);
  return stdout.trim();
}

function spawnSyncGit() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

async function assertPortFree(port) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}

function selfTest() {
  const options = parseArgs([
    '--subjects', '/tmp/tree/e2e/a.spec.ts:4,e2e/b.spec.ts:8',
    '--workers', '1,2,4',
    '--runs', '8',
    '--port', '5267',
    '--output', 'logs/session-scratch/test',
  ]);
  assert.deepEqual(options.subjects, ['e2e/a.spec.ts:4', 'e2e/b.spec.ts:8']);
  assert.deepEqual(options.workers, [1, 2, 4]);
  assert.throws(() => parseArgs([
    '--subjects', 'e2e/a.spec.ts:4', '--workers', '1', '--runs', '1',
    '--port', '5267', '--output', 'x',
  ]), />=8/);
  assert.throws(() => parseArgs([
    '--subjects', 'e2e/a.spec.ts:4', '--workers', '1', '--runs', '8',
    '--port', '5188', '--output', 'x',
  ]), /not 5188/);
  const report = {
    suites: [{ specs: [{ file: 'a.spec.ts', line: 4, title: 'a', tests: PROJECTS.map((projectName) => ({
      projectName,
      status: projectName === 'desktop-chrome' ? 'expected' : 'unexpected',
      results: [{ status: projectName === 'desktop-chrome' ? 'passed' : 'failed' }],
    })) }] }],
  };
  const executions = collectExecutions(report);
  assertComplete(executions, ['e2e/a.spec.ts:4']);
  assert.deepEqual(executions.map(({ status }) => status), ['pass', 'fail']);
  assert.deepEqual(rates([{ workers: 2, executions }]).map(({ failures, executions: count }) => [failures, count]), [[0, 1], [1, 1]]);
  console.log('concurrency-class-rate self-check passed');
}
