/**
 * measure-crashes.mjs — F-NCB-9 / F-POC-8 arm measurement.
 *
 * 20 DIRECT runs (`node scripts/<file>`, 120 s timeout each) per file per arm. A run counts as a
 * CRASH when it exits by a signal or with status >= 128 — the shape a native SIGBUS/SIGSEGV in
 * vite's rolldown binding leaves behind (rc 138 = 128 + SIGBUS(10)). A run killed by the harness's
 * own 120 s timeout is recorded separately (`timeout: true`) so a hang can never be counted as a
 * native crash.
 *
 * Usage: node artifacts/battery-robustness/measure-crashes.mjs <label> <runs> <file...>
 * Writes artifacts/battery-robustness/crash-runs-<label>.json and prints the raw table.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { loadavg } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const [label, runsArg, ...files] = process.argv.slice(2);
const RUNS = Number(runsArg);
if (!label || !Number.isInteger(RUNS) || files.length === 0) {
  console.error('usage: measure-crashes.mjs <label> <runs> <file...>');
  process.exit(2);
}

const viteVersion = JSON.parse(
  spawnSync(process.execPath, ['-e', "process.stdout.write(JSON.stringify({vite:require('vite/package.json').version,rolldown:require('@rolldown/binding-darwin-arm64/package.json').version}))"], { cwd: ROOT, encoding: 'utf8' }).stdout,
);

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

const rows = [];
for (const file of files) {
  for (let i = 1; i <= RUNS; i += 1) {
    const started = Date.now();
    const child = spawnSync(process.execPath, [file], {
      cwd: ROOT, encoding: 'utf8', env, timeout: 120_000, killSignal: 'SIGKILL',
      maxBuffer: 64 * 1024 * 1024,
    });
    const ms = Date.now() - started;
    const timeout = child.error?.code === 'ETIMEDOUT';
    const crash = !timeout && (child.signal !== null || (child.status ?? 0) >= 128);
    const row = {
      file, run: i, status: child.status, signal: child.signal, ms, timeout, crash,
      load1: Number(loadavg()[0].toFixed(2)),
      stderrTail: crash || timeout ? child.stderr.split('\n').slice(-6).join('\n') : undefined,
    };
    rows.push(row);
    console.log(
      `${file}\t${i}/${RUNS}\trc=${child.status}\tsignal=${child.signal ?? '-'}\t${(ms / 1000).toFixed(1)}s\tload=${row.load1}\t${crash ? 'CRASH' : timeout ? 'TIMEOUT' : 'ok'}`,
    );
  }
}

const summary = files.map((file) => {
  const own = rows.filter((row) => row.file === file);
  return {
    file,
    runs: own.length,
    crashes: own.filter((row) => row.crash).length,
    timeouts: own.filter((row) => row.timeout).length,
    green: own.filter((row) => row.status === 0).length,
    medianMs: own.map((row) => row.ms).sort((a, b) => a - b)[Math.floor(own.length / 2)],
  };
});

const out = { label, at: new Date().toISOString(), node: process.version, ...viteVersion, summary, rows };
const path = new URL(`./crash-runs-${label}.json`, import.meta.url);
writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`);
console.log('\n=== SUMMARY ===');
console.log(`label=${label} node=${process.version} vite=${viteVersion.vite} rolldown-binding=${viteVersion.rolldown}`);
for (const row of summary) {
  console.log(`${row.file}: ${row.crashes}/${row.runs} crashes, ${row.timeouts} timeouts, ${row.green} rc0, median ${(row.medianMs / 1000).toFixed(1)}s`);
}
console.log(`written: ${fileURLToPath(path)}`);
