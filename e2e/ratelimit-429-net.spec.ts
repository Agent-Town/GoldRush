import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const UNKNOWN_CODE = 'GR-A1B2C3-D4E5F6-000000-FFFFFF';

let redeemWorker: ChildProcessWithoutNullStreams;
let accountsWorker: ChildProcessWithoutNullStreams;
let redeemURL: string;
let accountsURL: string;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({}, workerInfo) => {
  const mobile = workerInfo.project.name === 'mobile-chrome';
  const redeemPort = mobile ? 8817 : 8816;
  const accountsPort = mobile ? 8819 : 8818;
  const redeemPersistPath = `test-results/ratelimit-429-redeem-${workerInfo.project.name}`;
  const accountsPersistPath = `test-results/ratelimit-429-accounts-${workerInfo.project.name}`;
  redeemURL = `http://127.0.0.1:${redeemPort}`;
  accountsURL = `http://127.0.0.1:${accountsPort}`;
  await Promise.all([
    rm(redeemPersistPath, { recursive: true, force: true }),
    rm(accountsPersistPath, { recursive: true, force: true }),
  ]);

  redeemWorker = spawn(
    'wrangler',
    [
      'pages',
      'dev',
      'public',
      '--kv',
      'TELEMETRY',
      '--port',
      String(redeemPort),
      '--inspector-port',
      String(mobile ? 9237 : 9236),
      '--ip',
      '127.0.0.1',
      '--persist-to',
      redeemPersistPath,
      '--log-level',
      'error',
      '--show-interactive-dev-session=false',
    ],
    { stdio: 'pipe' },
  );
  accountsWorker = spawn(
    'wrangler',
    [
      'pages',
      'dev',
      'public',
      '--kv',
      'ACCOUNTS',
      '--binding',
      'DEV_AUTH=1',
      '--port',
      String(accountsPort),
      '--inspector-port',
      String(mobile ? 9239 : 9238),
      '--ip',
      '127.0.0.1',
      '--persist-to',
      accountsPersistPath,
      '--log-level',
      'error',
      '--show-interactive-dev-session=false',
    ],
    { stdio: 'pipe' },
  );
  await Promise.all([
    waitForWorker(`${redeemURL}/api/redeem`, redeemWorker),
    waitForWorker(`${accountsURL}/api/request-code`, accountsWorker),
  ]);
});

test.afterAll(async () => {
  await Promise.all([stopWorker(redeemWorker), stopWorker(accountsWorker)]);
});

test('redeem limits the sixth well-formed stub from one IP', async () => {
  for (let index = 0; index < 5; index += 1) {
    const response = await post(redeemURL, '/api/redeem', { code: UNKNOWN_CODE }, '198.51.100.10');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: false, error: 'bad_stub' });
  }

  const declined = await post(redeemURL, '/api/redeem', { code: UNKNOWN_CODE }, '198.51.100.10');
  expect(declined.status).toBe(429);
  await expect(declined.json()).resolves.toMatchObject({ ok: false, error: 'rate_limited' });

  const isolated = await post(redeemURL, '/api/redeem', { code: UNKNOWN_CODE }, '198.51.100.11');
  expect(isolated.status).toBe(200);
});

test('request-code limits the sixth request for one email', async () => {
  for (let index = 0; index < 5; index += 1) {
    expect((await requestCode('net-email@example.test', '198.51.100.20')).status).toBe(200);
  }

  const declined = await requestCode('net-email@example.test', '198.51.100.20');
  expect(declined.status).toBe(429);
  await expect(declined.json()).resolves.toMatchObject({ error: 'rate_limited' });
});

test('request-code independently limits the twenty-first request from one IP', async () => {
  for (let index = 1; index <= 20; index += 1) {
    expect((await requestCode(`net-${String(index).padStart(2, '0')}@example.test`, '198.51.100.21')).status).toBe(200);
  }

  const declined = await requestCode('net-21@example.test', '198.51.100.21');
  expect(declined.status).toBe(429);
  await expect(declined.json()).resolves.toMatchObject({ error: 'rate_limited' });
});

function requestCode(email: string, ip: string): Promise<Response> {
  return post(accountsURL, '/api/request-code', { email }, ip);
}

function post(origin: string, pathname: string, body: unknown, ip: string): Promise<Response> {
  return fetch(`${origin}${pathname}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip },
    body: JSON.stringify(body),
  });
}

async function waitForWorker(url: string, child: ChildProcessWithoutNullStreams): Promise<void> {
  const deadline = Date.now() + 20_000;
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Wrangler exited early (${child.exitCode}).\n${output}`);
    try {
      await fetch(url);
      return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  child.kill('SIGTERM');
  throw new Error(`Wrangler did not start.\n${output}`);
}

async function stopWorker(child: ChildProcessWithoutNullStreams | undefined): Promise<void> {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([
    new Promise<void>((resolve) => child.once('exit', () => resolve())),
    new Promise<void>((resolve) => setTimeout(resolve, 2_000)),
  ]);
}
