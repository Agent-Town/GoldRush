#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const outDir = path.resolve(import.meta.dirname);
const probePort = 5253;
const batteryPort = 5234;
const lifecycle = { startedAt: new Date().toISOString(), probeServer: null, repetitions: [] };
const jobs = JSON.stringify([[
  'beauty-town desktop', 'npx', 'playwright', 'test', 'e2e/beauty-town.spec.ts', '--project=desktop-chrome', '--workers=1',
]]);

await mkdir(outDir, { recursive: true });

const alive = (pid, group = false) => {
  try {
    process.kill(group ? -pid : pid, 0);
    return true;
  } catch {
    return false;
  }
};

const start = (command, args, env = {}) => spawn(command, args, {
  cwd: root,
  env: { ...process.env, ...env },
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});

const capture = (child) => {
  let text = '';
  child.stdout.on('data', (chunk) => { text += chunk; });
  child.stderr.on('data', (chunk) => { text += chunk; });
  return () => text;
};

const completed = (child) => new Promise((resolve) => {
  child.once('exit', (code, signal) => resolve({ code, signal }));
});

const ready = async (port) => {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`server on ${port} did not become ready`);
};

const stop = async (child, record) => {
  const done = completed(child);
  record.killSignal = 'SIGTERM';
  if (alive(child.pid, true)) process.kill(-child.pid, 'SIGTERM');
  await Promise.race([done, new Promise((resolve) => setTimeout(resolve, 2_000))]);
  record.deadAfterKill = !alive(child.pid, true);
};

const probe = async (name, rate, backgroundLoad = null) => {
  const output = path.join(outDir, `${name}.json`);
  const child = start(process.execPath, [path.join(outDir, 'probe.mjs'), output, String(rate)], {
    GR_CAPTURE_EXTERNAL_SERVER: '1',
    GR_CAPTURE_BASE_URL: `http://127.0.0.1:${probePort}`,
    ...(backgroundLoad ? { GR_PROBE_BACKGROUND_LOAD: JSON.stringify(backgroundLoad) } : {}),
  });
  const outputText = capture(child);
  const done = completed(child);
  const result = await done;
  if (result.code !== 0) throw new Error(`${name} probe failed rc=${result.code}: ${outputText()}`);
  return JSON.parse(await readFile(output, 'utf8'));
};

const runBatteryArm = async (name) => {
  const record = { name, spec: 'e2e/beauty-town.spec.ts', project: 'desktop-chrome', workers: 1 };
  const server = start('npm', ['run', 'dev', '--', '--port', String(batteryPort), '--strictPort']);
  const serverOutput = capture(server);
  record.serverPid = server.pid;
  await ready(batteryPort);

  const transcript = path.join(outDir, `${name}-battery.txt`);
  const battery = start(process.execPath, [
    'scripts/gate-battery.mjs', '--transcript', transcript, '--label', name,
    '--env', 'GR_CAPTURE_EXTERNAL_SERVER=1', '--env', `GR_CAPTURE_BASE_URL=http://127.0.0.1:${batteryPort}`,
    jobs,
  ]);
  const batteryOutput = capture(battery);
  const batteryDone = completed(battery);
  record.batteryPid = battery.pid;
  record.batteryLiveBeforeProbe = alive(battery.pid);
  const started = performance.now();

  try {
    record.probe = await probe(name, 1, {
      kind: 'factory-gate-battery',
      driver: 'scripts/gate-battery.mjs',
      spec: record.spec,
      project: record.project,
      workers: record.workers,
      batteryPid: battery.pid,
      serverPid: server.pid,
      serverPort: batteryPort,
    });
    const batteryResult = await batteryDone;
    record.batteryWallMs = performance.now() - started;
    record.batteryExit = batteryResult;
    record.batteryDeadAfterExit = !alive(battery.pid, true);
    record.batteryOutputTail = batteryOutput().split('\n').slice(-30).join('\n');
    if (batteryResult.code !== 0) throw new Error(`${name} battery failed rc=${batteryResult.code}`);
  } finally {
    if (alive(battery.pid, true)) await stop(battery, record);
    await stop(server, record);
    record.serverOutputTail = serverOutput().split('\n').slice(-20).join('\n');
    lifecycle.repetitions.push(record);
    await writeFile(path.join(outDir, 'process-lifecycle.json'), `${JSON.stringify(lifecycle, null, 2)}\n`);
  }
  return record.probe;
};

const probeServer = start('npm', ['run', 'dev', '--', '--port', String(probePort), '--strictPort']);
const probeServerOutput = capture(probeServer);
lifecycle.probeServer = { pid: probeServer.pid, port: probePort };

try {
  await ready(probePort);
  const positive = await probe('arm-p', 60);
  lifecycle.positiveControl = { armed: positive.armed, meanElapsedPerFrame: positive.summary.meanElapsedPerFrame };
  if (!positive.armed || Math.abs(positive.summary.meanElapsedPerFrame - 0.05) > 0.001) {
    lifecycle.verdict = 'HARNESS-FAILED';
    throw new Error('positive control did not arm at the 0.05 ratio');
  }

  await probe('arm-c-1', 1);
  await probe('arm-c-2', 1);
  const battery1 = await runBatteryArm('arm-b-1');
  const battery2 = await runBatteryArm('arm-b-2');
  lifecycle.verdict = battery1.armed || battery2.armed ? 'ARMS-IN-PRACTICE' : 'DOES-NOT-ARM-IN-PRACTICE';
} finally {
  await stop(probeServer, lifecycle.probeServer);
  lifecycle.probeServer.outputTail = probeServerOutput().split('\n').slice(-20).join('\n');
  lifecycle.finishedAt = new Date().toISOString();
  await writeFile(path.join(outDir, 'process-lifecycle.json'), `${JSON.stringify(lifecycle, null, 2)}\n`);
}
