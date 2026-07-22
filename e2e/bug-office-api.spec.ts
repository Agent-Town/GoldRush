import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const TOKEN = 'test-office-token';
const REPORT = {
  description: 'A claim marker walked through the assay wall.',
  prospectorName: 'Copper Finch',
  screenshot: 'data:image/jpeg;base64,/9j/2Q==',
  diagnostics: {
    contractId: 'the-claim',
    wave: 4,
    position: { x: 12.5, z: -8 },
    tier: 'FULL',
    version: 'dev',
  },
};

let worker: ChildProcessWithoutNullStreams;
let workerURL: string;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({}, workerInfo) => {
  const mobile = workerInfo.project.name === 'mobile-chrome';
  const port = mobile ? 8813 : 8812;
  const inspectorPort = mobile ? 9233 : 9232;
  const persistPath = `test-results/bug-office-worker-${workerInfo.project.name}`;
  workerURL = `http://127.0.0.1:${port}`;
  await rm(persistPath, { recursive: true, force: true });
  worker = spawn(
    'wrangler',
    [
      'pages',
      'dev',
      'public',
      '--kv',
      'TELEMETRY',
      '--binding',
      `BUG_OFFICE_TOKEN=${TOKEN}`,
      '--port',
      String(port),
      '--inspector-port',
      String(inspectorPort),
      '--ip',
      '127.0.0.1',
      '--persist-to',
      persistPath,
      '--log-level',
      'error',
      '--show-interactive-dev-session=false',
    ],
    { stdio: 'pipe' },
  );
  await waitForWorker(workerURL, worker);
});

test.afterAll(async () => {
  if (!worker || worker.exitCode !== null) return;
  worker.kill('SIGTERM');
  await Promise.race([
    new Promise<void>((resolve) => worker.once('exit', () => resolve())),
    new Promise<void>((resolve) => setTimeout(resolve, 2_000)),
  ]);
});

test('round-trips a report while keeping screenshots out of the paged list', async () => {
  const created = await postReport(REPORT, '198.51.100.1');
  expect(created.status).toBe(201);
  const { id } = await created.json() as { id: string };
  expect(id).toMatch(/^\d{13}-[a-f0-9]{8}$/);

  const list = await getJson(`/api/bugs?token=${TOKEN}`);
  expect(list.bugs).toHaveLength(1);
  expect(list.bugs[0]).toMatchObject({ id, description: REPORT.description, prospectorName: REPORT.prospectorName, diagnostics: REPORT.diagnostics });
  expect(list.bugs[0]).not.toHaveProperty('screenshot');

  const detail = await getJson(`/api/bugs/${id}?token=${TOKEN}`);
  expect(detail.bug).toMatchObject({ id, screenshot: REPORT.screenshot });
});

test('rejects a JPEG over the decoded 180 KiB cap', async () => {
  const bytes = Buffer.alloc(180 * 1024 + 1, 0);
  bytes.set([0xff, 0xd8, 0xff], 0);
  bytes.set([0xff, 0xd9], bytes.length - 2);
  const response = await postReport({ ...REPORT, screenshot: bytes.toString('base64') }, '198.51.100.2');
  expect(response.status).toBe(413);
  await expect(response.json()).resolves.toMatchObject({ error: 'screenshot_rejected' });
});

test('rate-limits the sixth report from one IP', async () => {
  for (let index = 0; index < 5; index += 1) {
    expect((await postReport({ ...REPORT, description: `Repeated complaint ${index}` }, '198.51.100.3')).status).toBe(201);
  }
  const declined = await postReport({ ...REPORT, description: 'One complaint too many' }, '198.51.100.3');
  expect(declined.status).toBe(429);
  await expect(declined.json()).resolves.toMatchObject({ error: 'rate_limited' });
});

test('makes tokenless reads look absent', async () => {
  for (const pathname of ['/api/bugs', '/api/bugs/1700000000000-deadbeef']) {
    const response = await fetch(`${workerURL}${pathname}`);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: 'not_found' });
  }
});

function postReport(body: unknown, ip: string): Promise<Response> {
  return fetch(`${workerURL}/api/bug-report`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip },
    body: JSON.stringify(body),
  });
}

async function getJson(pathname: string): Promise<Record<string, any>> {
  const response = await fetch(`${workerURL}${pathname}`);
  expect(response.status).toBe(200);
  return response.json() as Promise<Record<string, any>>;
}

async function waitForWorker(origin: string, child: ChildProcessWithoutNullStreams): Promise<void> {
  const deadline = Date.now() + 20_000;
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Wrangler exited early (${child.exitCode}).\n${output}`);
    try {
      await fetch(`${origin}/api/bugs`);
      return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  child.kill('SIGTERM');
  throw new Error(`Wrangler did not start.\n${output}`);
}
