import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const PLAYLIST_PATH = path.resolve(ROOT, process.env.GR_STREAM_PLAYLIST ?? 'marketing/stream-playlist.json');
const RAW_DIR = path.resolve(ROOT, 'marketing/raw/stream');
const VIDEO_TMP_DIR = path.join(RAW_DIR, '.tmp-video');
const PROFILE_KEY = 'gr.profile.v2';
const META_PROGRESS_KEY = 'gr.meta.v1';
const RESEARCH_STATE_KEY = 'gr.research.v1';
const PROFILE_ID = 'stream-runner';
const PROFILE_NAME = 'Stream Runner';
const durationScale = positiveNumber(process.env.GR_STREAM_DURATION_SCALE, 1);
const maxSegments = positiveNumber(process.env.GR_STREAM_MAX_SEGMENTS, Number.POSITIVE_INFINITY);
const captureDate = process.env.GR_STREAM_DATE ?? new Date().toISOString().replaceAll(':', '-').slice(0, 19);
const port = Number(process.env.GR_STREAM_PORT) || (await freePort(5400, 5499));
const baseURL = `http://127.0.0.1:${port}`;
const mergeHash = execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], { encoding: 'utf8' }).trim();

await mkdir(RAW_DIR, { recursive: true });

const server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
let shuttingDown = false;
const stopServer = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  server.kill('SIGTERM');
};
process.on('SIGINT', () => {
  stopServer();
  process.exit(130);
});
process.on('SIGTERM', () => {
  stopServer();
  process.exit(143);
});

try {
  server.stdout.on('data', (chunk) => process.stdout.write(chunk));
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));
  await waitForHttp(baseURL);
  const playlist = await loadPlaylist();
  const browser = await chromium.launch({ headless: process.env.GR_STREAM_HEADLESS === '1' });
  const results = [];
  try {
    for (const segment of playlist.segments.slice(0, maxSegments)) results.push(await recordSegment(browser, segment));
  } finally {
    await browser.close();
  }
  const manifest = await writeManifest(results);
  console.log(`stream manifest: ${manifest}`);
  stopServer();
  process.exitCode = results.some((result) => result.verdict === 'FAIL') ? 1 : 0;
} catch (error) {
  stopServer();
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
}

async function recordSegment(browser, segment) {
  await rm(VIDEO_TMP_DIR, { recursive: true, force: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    screen: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: VIDEO_TMP_DIR, size: { width: 1920, height: 1080 } },
  });
  await context.addInitScript(seedStreamStorage, {
    profileKey: PROFILE_KEY,
    metaProgressKey: META_PROGRESS_KEY,
    researchStateKey: RESEARCH_STATE_KEY,
    profileId: PROFILE_ID,
    profileName: PROFILE_NAME,
  });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const assertionState = new Map();
  const video = page.video();
  const webm = path.join(RAW_DIR, `${segment.id}-${captureDate}.webm`);
  const firstFrame = path.join(RAW_DIR, `${segment.id}-${captureDate}-first.png`);
  await rm(webm, { force: true });
  await rm(firstFrame, { force: true });

  const startedAt = Date.now();
  try {
    await page.goto(new URL(pathForSegment(segment), baseURL).toString());
    await waitForBoot(page);
    await page.addStyleTag({ content: '.lil-gui, #gr-meta-debug { display: none !important; }' });
    await installOverlay(page, segment);
    for (const action of segment.setup ?? []) await runAction(page, action);
    await updateAssertions(page, segment, assertionState);
    await page.screenshot({ path: firstFrame, fullPage: false });

    const durationMs = Math.max(1000, Math.round(segment.durationMs * durationScale));
    await playSegment(page, segment, durationMs, assertionState);
  } catch (error) {
    assertionState.set('runner', fail(error instanceof Error ? error.message : String(error)));
    await pushOverlay(page, assertionState).catch(() => {});
  } finally {
    await releaseMoveKeys(page).catch(() => {});
  }

  for (const message of errors.consoleErrors) assertionState.set(`console:${assertionState.size}`, fail(message));
  for (const message of errors.pageErrors) assertionState.set(`page:${assertionState.size}`, fail(message));
  await pushOverlay(page, assertionState).catch(() => {});
  await page.waitForTimeout(750).catch(() => {});
  await context.close();

  const tempVideo = await video?.path();
  if (!tempVideo) throw new Error(`No video emitted for ${segment.id}`);
  await rename(tempVideo, webm);
  const bytes = (await stat(webm)).size;
  const assertions = [...assertionState].map(([id, result]) => ({ id, ...result }));
  const verdict = assertions.some((result) => result.status === 'FAIL') ? 'FAIL' : 'PASS';
  return {
    id: segment.id,
    task: segment.task,
    seed: segment.seed,
    mergeHash,
    verdict,
    startedAt: new Date(startedAt).toISOString(),
    durationSeconds: probeDurationSeconds(webm),
    plannedDurationSeconds: segment.durationMs / 1000,
    webm: path.relative(ROOT, webm),
    firstFrame: path.relative(ROOT, firstFrame),
    bytes,
    assertions,
  };
}

async function playSegment(page, segment, durationMs, assertionState) {
  const actions = segment.script?.length ? segment.script : [{ type: 'autopilotSimple' }];
  const deadline = Date.now() + durationMs;
  for (const action of actions) {
    if (action.type !== 'autopilotSimple') {
      await runAction(page, action);
      continue;
    }
    const pattern = action.pattern?.length ? action.pattern : ['KeyW', 'KeyD', 'KeyS', 'KeyA'];
    let index = 0;
    while (Date.now() < deadline) {
      const key = pattern[index % pattern.length];
      index += 1;
      await page.keyboard.down(key);
      await page.waitForTimeout(Math.min(action.moveMs ?? 1800, Math.max(0, deadline - Date.now())));
      await page.keyboard.up(key);
      await updateAssertions(page, segment, assertionState);
      await page.waitForTimeout(Math.min(action.restMs ?? 400, Math.max(0, deadline - Date.now())));
    }
  }
  const remaining = deadline - Date.now();
  if (remaining > 0) await page.waitForTimeout(remaining);
}

async function updateAssertions(page, segment, state) {
  for (const assertion of segment.assertions ?? []) state.set(assertion.id, await evaluateAssertion(page, assertion));
  await pushOverlay(page, state);
}

async function evaluateAssertion(page, assertion) {
  try {
    if (assertion.type === 'contract') {
      const actual = await page.evaluate(() => window.__GR_TEST__?.activeContract().id ?? '');
      return actual === assertion.equals ? pass(actual) : fail(`expected ${assertion.equals}, saw ${actual || 'none'}`);
    }
    if (assertion.type === 'minWave') {
      const actual = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0);
      return actual >= assertion.value ? pass(String(actual)) : fail(`wave ${actual} < ${assertion.value}`);
    }
    if (assertion.type === 'minEnemiesSpawned') {
      const actual = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0);
      return actual >= assertion.value ? pass(String(actual)) : fail(`spawned ${actual} < ${assertion.value}`);
    }
    if (assertion.type === 'minEliteEnemies') {
      const actual = await page.evaluate((eliteKind) => window.__GR_TEST__?.enemyPositions().filter((enemy) => enemy.eliteKind === eliteKind).length ?? 0, assertion.eliteKind);
      return actual >= assertion.value ? pass(String(actual)) : fail(`${assertion.eliteKind} ${actual} < ${assertion.value}`);
    }
    if (assertion.type === 'terrainTraversable') {
      const actual = await page.evaluate((point) => window.__GR_TEST__?.terrainSample(point.x, point.z)?.traversable ?? false, assertion);
      return actual ? pass('traversable') : fail(`blocked at ${assertion.x},${assertion.z}`);
    }
    if (assertion.type === 'diagnosticPathTruthy') {
      const actual = await page.evaluate(
        (pathKey) =>
          pathKey.split('.').reduce((value, key) => {
            if (value && typeof value === 'object' && key in value) return value[key];
            return undefined;
          }, window.__THREE_GAME_DIAGNOSTICS__),
        assertion.path,
      );
      return actual ? pass('truthy') : fail(`${assertion.path} missing`);
    }
    return fail(`unknown assertion ${assertion.type}`);
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
}

async function runAction(page, action) {
  if (action.type === 'teleport') {
    await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), action);
  } else if (action.type === 'grantGold') {
    await page.evaluate((amount) => window.__GR_TEST__?.grantGold(amount), action.amount);
  } else if (action.type === 'setBalance') {
    const ok = await page.evaluate(([key, value]) => window.__GR_TEST__?.setBalance(key, value), [action.path, action.value]);
    if (!ok) throw new Error(`setBalance failed: ${action.path}`);
  } else if (action.type === 'placeFree') {
    const ok = await page.evaluate(([id, x, z, rotation]) => window.__GR_TEST__?.placeFree(id, x, z, rotation ?? 0), [
      action.id,
      action.x,
      action.z,
      action.rotationSteps,
    ]);
    if (!ok && !action.optional) throw new Error(`placeFree failed: ${action.id} at ${action.x},${action.z}`);
  } else if (action.type === 'spawnPack') {
    await page.evaluate(([count, radius]) => window.__GR_TEST__?.spawnPack(count, radius), [action.count, action.radius ?? 6]);
  } else if (action.type === 'setWave') {
    await page.evaluate((wave) => window.__GR_TEST__?.setWave(wave), action.wave);
  } else if (action.type === 'startWave') {
    await page.evaluate((wave) => window.__GR_TEST__?.startWaveForTest(wave), action.wave);
  } else if (action.type === 'setManualSim') {
    await page.evaluate((enabled) => window.__GR_TEST__?.setManualSim(enabled), action.enabled);
  } else if (action.type === 'advanceSim') {
    await page.evaluate(([seconds, stepSeconds]) => window.__GR_TEST__?.advanceSim(seconds, stepSeconds), [action.seconds, action.stepSeconds]);
  } else if (action.type === 'wait') {
    await page.waitForTimeout(action.ms);
  } else if (action.type === 'press') {
    await page.keyboard.press(action.key);
  }
}

async function installOverlay(page, segment) {
  await page.evaluate(
    ({ task, mergeHash }) => {
      const root = document.createElement('div');
      root.id = 'gr-stream-ledger';
      root.innerHTML = `
        <div class="gr-stream-task"></div>
        <div class="gr-stream-meta"></div>
        <div class="gr-stream-ticker"></div>
      `;
      document.body.append(root);
      const style = document.createElement('style');
      style.textContent = `
        #gr-stream-ledger {
          position: fixed;
          left: 22px;
          top: 22px;
          z-index: 2147483647;
          width: min(680px, calc(100vw - 44px));
          padding: 14px 16px;
          color: #fff8e6;
          background: rgba(22, 18, 13, 0.82);
          border: 1px solid rgba(245, 196, 97, 0.78);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.34);
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          pointer-events: none;
        }
        #gr-stream-ledger .gr-stream-task { font-size: 20px; font-weight: 800; line-height: 1.18; }
        #gr-stream-ledger .gr-stream-meta { margin-top: 6px; color: #8fe8dc; font-size: 13px; letter-spacing: 0; }
        #gr-stream-ledger .gr-stream-ticker { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        #gr-stream-ledger .gr-stream-pill { padding: 4px 7px; border: 1px solid currentColor; font-size: 12px; font-weight: 800; }
        #gr-stream-ledger .pass { color: #7dff95; background: rgba(24, 92, 46, 0.62); }
        #gr-stream-ledger .fail { color: #ff837a; background: rgba(100, 22, 18, 0.68); }
      `;
      document.head.append(style);
      root.querySelector('.gr-stream-task').textContent = task;
      root.querySelector('.gr-stream-meta').textContent = `merge ${mergeHash} | seeded QA stream | failures stay on screen`;
    },
    { task: segment.task, mergeHash },
  );
  await pushOverlay(page, new Map());
}

async function pushOverlay(page, state) {
  const rows = [...state].map(([id, result]) => ({ id, ...result }));
  await page.evaluate((assertions) => {
    const ticker = document.querySelector('#gr-stream-ledger .gr-stream-ticker');
    if (!ticker) return;
    ticker.replaceChildren(
      ...assertions.map((assertion) => {
        const pill = document.createElement('span');
        pill.className = `gr-stream-pill ${assertion.status.toLowerCase()}`;
        pill.textContent = `${assertion.status} ${assertion.id}`;
        if (assertion.detail) pill.title = assertion.detail;
        return pill;
      }),
    );
  }, rows);
}

function pathForSegment(segment) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(segment.debugParams ?? {})) {
    if (value === false) continue;
    if (value === true) params.set(key, '');
    else params.set(key, String(value));
  }
  params.set('seed', segment.seed);
  return `/?${params.toString()}`;
}

async function waitForBoot(page) {
  await page.waitForSelector('#game-canvas', { timeout: 15_000 });
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 15_000 });
}

async function releaseMoveKeys(page) {
  for (const key of ['KeyW', 'KeyA', 'KeyS', 'KeyD']) await page.keyboard.up(key);
}

function collectErrors(page) {
  const bucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function seedStreamStorage(input) {
  localStorage.clear();
  sessionStorage.clear();
  const now = Date.now();
  localStorage.setItem(
    input.profileKey,
    JSON.stringify({
      version: 2,
      activeId: input.profileId,
      profiles: [{ id: input.profileId, name: input.profileName, createdAt: now, updatedAt: now, difficultyPreset: 'trail', hintsSeen: [] }],
    }),
  );
  localStorage.setItem(
    `${input.profileKey}.${input.profileId}.${input.metaProgressKey}`,
    JSON.stringify({ version: 1, tracks: { territory: 3, science: 4, hero: 2, agent: 2 } }),
  );
  localStorage.setItem(
    `${input.profileKey}.${input.profileId}.${input.researchStateKey}`,
    JSON.stringify({
      version: 1,
      taken: ['assay_grading', 'mother_lode_survey', 'chain_spark_primer', 'beacon_cadence'],
      proposalSalt: 0,
      pinnedTarget: null,
    }),
  );
}

async function loadPlaylist() {
  const parsed = JSON.parse(await readFile(PLAYLIST_PATH, 'utf8'));
  if (!Array.isArray(parsed.segments)) throw new Error(`${PLAYLIST_PATH} must contain segments[]`);
  return parsed;
}

async function writeManifest(results) {
  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    playlist: path.relative(ROOT, PLAYLIST_PATH),
    mergeHash,
    durationScale,
    segments: results,
  };
  const manifestPath = path.join(RAW_DIR, `manifest-${captureDate}.json`);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(RAW_DIR, 'manifest-latest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return path.relative(ROOT, manifestPath);
}

async function waitForHttp(url) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`vite exited early with ${server.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`vite did not answer at ${url}`);
}

function probeDurationSeconds(file) {
  try {
    const raw = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return probeWebmDurationSeconds(file);
  }
}

function probeWebmDurationSeconds(file) {
  const buffer = readFileSync(file);
  const limit = Math.min(buffer.length, 64 * 1024);
  let timecodeScale = 1_000_000;
  for (let index = 0; index < limit - 12; index += 1) {
    if (buffer[index] === 0x2a && buffer[index + 1] === 0xd7 && buffer[index + 2] === 0xb1) {
      const size = readEbmlSize(buffer, index + 3);
      if (size && size.value > 0 && size.value <= 8) {
        let value = 0;
        const start = index + 3 + size.length;
        for (let offset = 0; offset < size.value; offset += 1) value = value * 256 + buffer[start + offset];
        if (value > 0) timecodeScale = value;
      }
    }
    if (buffer[index] === 0x44 && buffer[index + 1] === 0x89) {
      const size = readEbmlSize(buffer, index + 2);
      if (!size) continue;
      const start = index + 2 + size.length;
      const duration = size.value === 4 ? buffer.readFloatBE(start) : size.value === 8 ? buffer.readDoubleBE(start) : null;
      if (duration !== null && Number.isFinite(duration) && duration > 0) return (duration * timecodeScale) / 1_000_000_000;
    }
  }
  return null;
}

function readEbmlSize(buffer, offset) {
  const first = buffer[offset];
  if (first === undefined) return null;
  let length = 1;
  let marker = 0x80;
  while (length <= 8 && (first & marker) === 0) {
    length += 1;
    marker >>= 1;
  }
  if (length > 8 || offset + length > buffer.length) return null;
  let value = first & (marker - 1);
  for (let index = 1; index < length; index += 1) value = value * 256 + buffer[offset + index];
  return { length, value };
}

function pass(detail = '') {
  return { status: 'PASS', detail };
}

function fail(detail = '') {
  return { status: 'FAIL', detail };
}

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function freePort(start, end) {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      if (port > end) {
        reject(new Error(`no free port in ${start}-${end}`));
        return;
      }
      const tester = net.createServer();
      tester.once('error', () => tryPort(port + 1));
      tester.once('listening', () => {
        tester.close(() => resolve(port));
      });
      tester.listen(port, '127.0.0.1');
    };
    tryPort(start);
  });
}
