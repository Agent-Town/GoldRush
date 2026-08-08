import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

/**
 * THE BOOT PROBE — a human-shaped browser rider and one thin agent seat, one room.
 *
 * scripts/agent-seat-room.mjs proves two SEATS share a run. This proves the other half
 * of the owner's sentence — "people and agents could play the game together" — as far as
 * it is true today, and is deliberately explicit about where that stops:
 *
 *   1. THE DOOR OPENS. A host opens a room in a browser, shares the claim word, and a
 *      headless rig takes the empty chair. The human's own roster shows the rig by name
 *      and town. That is the join flow skill.md documents, exercised end to end.
 *   2. THE ROOM SERVES THE VIEW. The seat boots no second sim and sends no hashes, so the
 *      browser remains the only world while the NDJSON door keeps its existing shape.
 */

type RelayProcess = { url: string; logs: () => string; stop: () => Promise<void> };
type SeatRun = { stdout: string; stderr: string; exitCode: number | null };

const ROOT = process.cwd();
const SCRIPT_NAME = `gold-rush-seat-probe-${process.pid}`;
const STATE_ROOT = path.join(ROOT, `test-results/agent-seat-probe-state-${process.pid}`);
const ARTIFACT_DIR = path.join(ROOT, 'artifacts/agent-seat');
const HOST = { id: 'robin', name: 'Robin', town: 'Dawn Claim' };
const RIG = { name: 'Rig', town: 'Calculating House' };
const PROBE_QUERY = 'debug&mp=dev&nowaves&nolevel&nosteal&nowreck&nokill&contract=the-claim&seed=agent-seat-probe';

let relay: RelayProcess;
let worker: RelayProcess;

test.describe.configure({ mode: 'serial' });

// The probe runs on ONE project — a door either opens or it does not, and standing up
// two wranglers for the other two projects only to skip the body is 60s of nothing.
// The skip therefore lives in the hook as well as in the test.
const PROBE_PROJECT = 'desktop-chrome';

test.beforeAll(async ({}, testInfo) => {
  if (testInfo.project.name !== PROBE_PROJECT) return;
  await rm(STATE_ROOT, { recursive: true, force: true });
  worker = await startRoomWorker();
  try {
    relay = await startPages();
  } catch (error) {
    await worker.stop();
    throw error;
  }
});

test.afterAll(async () => {
  await relay?.stop();
  await worker?.stop();
});

test('a thin rig takes the empty chair and receives the browser world without desyncing it', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== PROBE_PROJECT, 'one door proof is enough; the 390px arm is captured in-test');
  test.setTimeout(180_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = watchErrors(page);

  // The human opens the room from their own browser and is handed the claim word.
  await seedProfile(page);
  await page.goto(`/?${PROBE_QUERY}&mpRelay=${encodeURIComponent(relay.url)}&mpName=${encodeURIComponent(HOST.name)}&mpTown=${encodeURIComponent(HOST.town)}`);
  await expect.poll(
    () => page.evaluate(() => {
      const state = window.__GR_MP__?.state();
      return { connected: state?.connected ?? false, error: state?.error ?? null };
    }),
    { message: 'the host opens a room', timeout: 45_000 },
  ).toEqual({ connected: true, error: null });

  const code = await page.evaluate(() => window.__GR_MP__!.state()!.code);
  expect(code, 'the claim word is the 96-bit room code the host can read out loud').toMatch(/^[A-F0-9]{24}$/);

  // The rig is handed that word and nothing else. It reads the ride's setup off the relay
  // and boots the contract and seed the host already committed to.
  const seat = startSeat(code);

  // 1. THE DOOR OPENS: the human's own roster names the rig.
  await expect.poll(
    () => page.evaluate(() => (window.__GR_MP__?.state()?.roster ?? []).map((player) => `${player.name} of ${player.town}`)),
    { message: 'the rig appears on the human roster', timeout: 60_000 },
  ).toEqual([`${HOST.name} of ${HOST.town}`, `${RIG.name} (scout) of ${RIG.town}`]);
  await expect(page.getByTestId('party-rider-card')).toHaveCount(2);
  expect(await page.getByTestId('party-rider-card').locator('[data-rider-name]').allTextContents()).toEqual([HOST.name, RIG.name]);
  await expect(page.getByTestId('party-rider-card').filter({ hasText: RIG.name })).toHaveAttribute('data-agent', 'true');
  await expect(page.getByTestId('party-rider-card').filter({ hasText: RIG.name }).locator('[data-rider-agent]')).toHaveText('Agent');

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'seat-desktop.png'), fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'seat-390px.png'), fullPage: false });

  // 2. THE BROWSER SERVES THE WORLD; the bounded thin seat exits without inventing an outcome.
  const run = await seat.finished;
  const envelope = seatEnvelope(run);
  expect(envelope.roster, 'the rig read the same table the human did').toEqual([
    `${HOST.name} of ${HOST.town}`,
    `${RIG.name} (scout) of ${RIG.town}`,
  ]);
  expect(envelope.resigned, 'the thin rig never resigned').toBeNull();
  expect(envelope.outcome, 'a bounded thin rig claims no outcome it did not observe').toBeNull();
  expect(envelope.lastHash, 'a thin rig computes no determinism hash').toBeNull();
  expect(run.exitCode, 'the bounded thin rig exits cleanly').toBe(0);
  expect(run.stdout, 'the room served the NDJSON view schema').toContain('"schema":"goldrush.view.v1"');

  // The browser keeps its own hash lane and sees no cross-engine disagreement.
  await expect.poll(
    () => page.evaluate(() => window.__GR_MP__?.state()?.desyncs ?? 0),
    { message: 'the browser rider registered the mismatch too', timeout: 30_000 },
  ).toBe(0);

  // A rig joining and then resigning must not cost the human a clean boot. This is the
  // shift's zero-console law, ASSERTED — the review may not claim it otherwise.
  expect(errors.consoleErrors, 'the host boots without console errors').toEqual([]);
  expect(errors.pageErrors, 'the host boots without page errors').toEqual([]);

  await writeFile(
    path.join(ARTIFACT_DIR, 'boot-probe.json'),
    `${JSON.stringify(
      { code, roster: envelope.roster, ticks: envelope.ticks, resigned: envelope.resigned, exitCode: run.exitCode, ...errors },
      null,
      2,
    )}\n`,
  );
  await testInfo.attach('agent-seat-boot-probe', {
    path: path.join(ARTIFACT_DIR, 'boot-probe.json'),
    contentType: 'application/json',
  });
});

function watchErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const bucket = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function seatEnvelope(run: SeatRun): {
  roster: string[];
  ticks: number;
  lastHash: { tick: number; hash: string } | null;
  resigned: { reason: string; tick: number; detail?: string } | null;
  outcome: unknown;
} {
  const lines = run.stdout.trim().split('\n').filter(Boolean);
  const last = lines.at(-1);
  if (!last) throw new Error(`the seat wrote nothing:\n${run.stderr}`);
  const parsed = JSON.parse(last) as { schema?: string };
  if (parsed.schema !== 'goldrush.seat.v1') throw new Error(`the seat wrote no envelope:\n${run.stderr}`);
  return parsed as never;
}

function startSeat(code: string): { finished: Promise<SeatRun> } {
  const child = spawn(
    process.execPath,
    ['scripts/gr-sim.mjs', '--room', code, '--origin', relay.url, '--name', RIG.name, '--town', RIG.town, '--policy=idle', '--max-ticks', '120'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });
  const finished = new Promise<SeatRun>((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`the rig never left the table:\n${stderr}`));
    }, 120_000);
    child.once('error', reject);
    child.once('exit', (exitCode) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode });
    });
  });
  return { finished };
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, scoreKey, relayKey, relayUrl, seeded }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(relayKey, relayUrl);
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          version: 2,
          activeId: seeded.id,
          profiles: [{ id: seeded.id, name: seeded.name, createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
        }),
      );
      localStorage.setItem(townKey, seeded.town);
      localStorage.setItem(scoreKey, '[]');
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(HOST.id, TOWN_NAME_KEY),
      scoreKey: profileDataKey(HOST.id, SCOREBOARD_KEY),
      relayKey: 'gr.mp.relayBase.v1',
      relayUrl: relay.url,
      seeded: HOST,
    },
  );
}

// ---------------------------------------------------------------------------
// The relay, stood up the way e2e/mp-02-lockstep.spec.ts stands it up.
// ---------------------------------------------------------------------------

async function startRoomWorker(): Promise<RelayProcess> {
  const port = await freePort();
  const configPath = path.join(STATE_ROOT, 'wrangler-seat-probe.jsonc');
  await mkdir(STATE_ROOT, { recursive: true });
  await writeFile(
    configPath,
    `${JSON.stringify(
      {
        name: SCRIPT_NAME,
        main: path.relative(STATE_ROOT, path.join(ROOT, 'functions/api/_multiplayer.ts')),
        compatibility_date: '2026-07-08',
        durable_objects: { bindings: [{ name: 'MULTIPLAYER_ROOMS', class_name: 'MultiplayerRoom' }] },
        migrations: [{ tag: 'mp-01', new_sqlite_classes: ['MultiplayerRoom'] }],
      },
      null,
      2,
    )}\n`,
  );
  return spawnWrangler([
    'dev', '--config', configPath, '--port', String(port), '--ip', '127.0.0.1',
    '--persist-to', path.join(STATE_ROOT, 'room-worker'), '--log-level', 'error',
    '--show-interactive-dev-session=false',
  ], port, '/');
}

async function startPages(): Promise<RelayProcess> {
  const port = await freePort();
  return spawnWrangler([
    'pages', 'dev', 'public', '--port', String(port), '--ip', '127.0.0.1',
    '--persist-to', path.join(STATE_ROOT, 'pages'), '--compatibility-date', '2026-07-08',
    '--log-level', 'error', '--show-interactive-dev-session=false',
    '--do', `MULTIPLAYER_ROOMS=MultiplayerRoom@${SCRIPT_NAME}`, '--kv', 'MULTIPLAYER_RATE_LIMITS',
  ], port, '/api/multiplayer/create');
}

async function spawnWrangler(args: string[], port: number, route: string): Promise<RelayProcess> {
  const child = spawn('wrangler', args, { cwd: ROOT, env: cleanEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr.on('data', (chunk) => {
    output += chunk;
  });
  const url = `http://127.0.0.1:${port}`;
  const started = Date.now();
  while (Date.now() - started < 30_000) {
    if (child.exitCode !== null) throw new Error(`wrangler exited early:\n${output}`);
    try {
      const response = await fetch(`${url}${route}`, {
        method: route === '/' ? 'GET' : 'OPTIONS',
        headers: { Origin: 'http://localhost:5188' },
      });
      if (response.status < 500 || response.status === 503) break;
    } catch {
      // still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return {
    url,
    logs: () => output,
    stop: async () => {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 2_000);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve();
        });
      });
      if (child.exitCode === null) child.kill('SIGKILL');
    },
  };
}

function cleanEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.RESEND_API_KEY;
  delete env.AUTH_CODE_PEPPER;
  return env;
}

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === 'object') resolve(address.port);
        else reject(new Error('No free port'));
      });
    });
    server.on('error', reject);
  });
}
