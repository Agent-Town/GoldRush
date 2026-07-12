import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const OUT = path.resolve(ROOT, 'artifacts/stream-capture');
const MANIFEST = path.resolve(ROOT, 'assets/stream/loop-manifest.json');
const APPROVAL = 'class-delegation-2026-07-12';
const DATE = process.env.GR_CAPTURE_DATE ?? new Date().toISOString().slice(0, 10);
const DURATION = Math.max(60, Math.min(90, Number(process.env.GR_CAPTURE_SECONDS) || 60));
const ONLY = process.env.GR_CAPTURE_ONLY ?? 'all';
const CONTRACTS = ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e2-hill-mine'];
const contract = CONTRACTS[hash(DATE) % CONTRACTS.length];

await mkdir(OUT, { recursive: true });
const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));

if (ONLY === 'all' || ONLY === 'slides') {
  await slideshow('art-kit-era-slideshow', /^kit-era-(?:[2-9]|10)\.png$/, 'Kit Era Cards');
  await slideshow('art-contract-plate-slideshow', /^plate-contract-.*\.png$/, 'Contract Plates');
}
if (ONLY === 'all' || ONLY === 'gameplay') await captureGameplay();
if (ONLY === 'all' || ONLY === 'ceremony') await captureCeremonyIfAvailable();

manifest.entries.sort((a, b) => (a.id ?? a.file).localeCompare(b.id ?? b.file));
await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`updated ${path.relative(ROOT, MANIFEST)} (${manifest.entries.length} entries)`);

async function captureGameplay() {
  const id = 'capture-duty-gameplay';
  const port = await freePort(5500, 5599);
  const server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'inherit' });
  try {
    await waitForHttp(`http://127.0.0.1:${port}`, server);
    const browser = await chromium.launch({ headless: true });
    const rawDir = path.join(OUT, '.video');
    await rm(rawDir, { recursive: true, force: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: rawDir, size: { width: 1920, height: 1080 } },
    });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`));
    page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
    const video = page.video();
    const contextStarted = Date.now();
    await page.goto(`http://127.0.0.1:${port}/?debug&contract=${contract}&timescale=1&nolevel&nopause&nosteal&nowreck&seed=stream-${DATE}`);
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
    await page.addStyleTag({ content: '.lil-gui, #gr-meta-debug, [data-debug-ui] { display: none !important; }' });
    await page.evaluate(() => {
      const api = window.__GR_TEST__;
      if (!api) throw new Error('missing __GR_TEST__');
      for (const [key, value] of [
        ['enemy.contactDamage', 0], ['waves.graceSeconds', 0.1], ['waves.waveInterval', 12],
        ['waves.trickleInterval', 9999], ['waves.pulseBase', 5], ['waves.pulsePerWave', 0],
        ['waves.pulsesPerWave', 1], ['waves.edgesPerPulse', 2], ['waves.aliveCap', 50],
      ]) if (!api.setBalance(key, value)) throw new Error(`setBalance failed: ${key}`);
      api.resetRun();
      api.maxUpgrades();
      api.grantGold(9999);
      for (const [x, z] of [[-8, 4], [0, 4], [8, 4], [-8, 10], [8, 10]]) api.placeFree('turret', x, z);
      api.startWaveForTest(3);
    });
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0) >= 3);
    const hidden = await page.locator('.lil-gui:visible, #gr-meta-debug:visible, [data-debug-ui]:visible').count();
    if (hidden) throw new Error(`debug UI visible: ${hidden} nodes`);
    const captureOffset = (Date.now() - contextStarted) / 1000;
    const samples = [];
    const sampleEvery = Math.max(1, Math.floor(DURATION / 4));
    for (let elapsed = 0; elapsed < DURATION; elapsed += sampleEvery) {
      const sample = path.join(OUT, `${id}-${DATE}-${String(samples.length + 1).padStart(2, '0')}.png`);
      await page.screenshot({ path: sample });
      samples.push(sample);
      await page.keyboard.down(['KeyW', 'KeyD', 'KeyS', 'KeyA'][samples.length % 4]);
      await page.waitForTimeout(Math.min(sampleEvery, DURATION - elapsed) * 1000);
      for (const key of ['KeyW', 'KeyD', 'KeyS', 'KeyA']) await page.keyboard.up(key);
    }
    const wave = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0);
    await context.close();
    const raw = await video.path();
    await browser.close();
    if (errors.length) throw new Error(errors.join('\n'));
    if (wave < 3 || wave > 8) throw new Error(`capture ended outside waves 3-8: wave ${wave}`);
    const output = path.join(OUT, `${id}.mp4`);
    ffmpeg(['-ss', String(captureOffset), '-i', raw, '-t', String(DURATION), '-c:v', 'libx264', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', output]);
    await rm(rawDir, { recursive: true, force: true });
    await makeStrip(samples, path.join(OUT, `${id}-frame-strip.png`));
    await writeFile(path.join(OUT, `${id}.json`), `${JSON.stringify({ date: DATE, contract, seed: `stream-${DATE}`, wave, errors, debugUiVisible: hidden, durationSeconds: probe(output) }, null, 2)}\n`);
    replace(id, { file: relative(output), title: `${title(contract)} — Waves 3–${wave}`, class: 'finished-game-footage' });
  } finally {
    server.kill('SIGTERM');
  }
}

async function slideshow(id, pattern, titleText) {
  const names = (await readdir(path.join(ROOT, 'assets/raw'))).filter((name) => pattern.test(name) && !name.includes('superseded')).sort();
  if (!names.length) throw new Error(`no inputs for ${id}`);
  const list = path.join(OUT, `${id}.ffconcat`);
  await writeFile(list, `ffconcat version 1.0\n${names.map((name) => `file '${path.join(ROOT, 'assets/raw', name).replaceAll("'", "'\\''")}'\nduration 5`).join('\n')}\nfile '${path.join(ROOT, 'assets/raw', names.at(-1)).replaceAll("'", "'\\''")}'\n`);
  const output = path.join(OUT, `${id}.mp4`);
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p', '-r', '30', '-c:v', 'libx264', '-movflags', '+faststart', '-an', output]);
  replace(id, { file: relative(output), title: titleText, class: 'era-art-reel' });
}

async function captureCeremonyIfAvailable() {
  const spec = path.join(ROOT, 'e2e/e2-t2-dynamo-ceremony.spec.ts');
  try { await stat(spec); } catch { return; }
  const id = 'ceremony-e3-voltage';
  const port = await freePort(5500, 5599);
  const server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'inherit' });
  try {
    await waitForHttp(`http://127.0.0.1:${port}`, server);
    const browser = await chromium.launch({ headless: true });
    const rawDir = path.join(OUT, '.ceremony-video');
    await rm(rawDir, { recursive: true, force: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: rawDir, size: { width: 1920, height: 1080 } } });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`));
    page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
    const video = page.video();
    const contextStarted = Date.now();
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      const prefix = 'gr.profile.v2.robin.';
      localStorage.setItem('gr.profile.v2', JSON.stringify({ version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] }));
      localStorage.setItem(`${prefix}gr.town.name.v1`, 'Quartz Hill');
      localStorage.setItem(`${prefix}gr.firstClaim.done.v1`, '1');
      localStorage.setItem('gr.activeEpoch.v1', 'epoch-2-steamworks');
      localStorage.setItem(`${prefix}gr.meta.v1`, JSON.stringify({ version: 1, tracks: { territory: 3, science: 14, hero: 0, agent: 0 } }));
      localStorage.setItem(`${prefix}gr.research.epoch-2-steamworks.v1`, JSON.stringify({ version: 1, steps: 8, metaScienceCursor: 14, taken: [], proposalSalt: 0, pinnedTarget: null }));
      localStorage.setItem(`${prefix}gr.megaprojects.v1`, JSON.stringify({ version: 1, projects: { 'dynamo-hall': { stage: 3, funded: false, ticksRemaining: 0, hp: 210, delayTicks: 0, defenseWave: 0 } } }));
      localStorage.removeItem('gr.epochCeremony.v1');
      localStorage.removeItem('epoch-3-voltage');
    });
    await page.reload();
    await page.getByTestId('start-menu-enter-town').click();
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
    await page.locator('canvas').click({ position: { x: 960, y: 540 } });
    await page.keyboard.down('KeyA');
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.player.x ?? 0) < -6);
    await page.keyboard.up('KeyA');
    await page.keyboard.down('KeyS');
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.player.z ?? 0) > 2);
    await page.keyboard.up('KeyS');
    await page.waitForFunction(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt === 'schoolhouse');
    await page.getByTestId('town-open-schoolhouse').click();
    await page.getByTestId('crank-dynamo').dispatchEvent('pointerdown');
    await page.waitForSelector('[data-beat-id="e3-ceremony-dynamo"]');
    const captureOffset = (Date.now() - contextStarted) / 1000;
    const samples = [];
    for (const beat of ['e3-ceremony-dynamo', 'e3-ceremony-tree', 'e3-ceremony-title']) {
      await page.waitForSelector(`[data-beat-id="${beat}"]`);
      await page.waitForTimeout(300);
      const sample = path.join(OUT, `${id}-${beat}.png`);
      await page.screenshot({ path: sample }); samples.push(sample);
      await page.waitForTimeout(2_700);
      await page.locator('[data-story-ceremony-continue]').click();
    }
    await context.close();
    const raw = await video.path();
    await browser.close();
    if (errors.length) throw new Error(errors.join('\n'));
    const output = path.join(OUT, `${id}.mp4`);
    ffmpeg(['-ss', String(captureOffset), '-i', raw, '-t', '9', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', output]);
    await rm(rawDir, { recursive: true, force: true });
    await makeStrip(samples, path.join(OUT, `${id}-frame-strip.png`));
    replace(id, { file: relative(output), title: 'The Voltage Age Ceremony', class: 'ceremony-recording' });
  } finally {
    server.kill('SIGTERM');
  }
}

function replace(id, entry) {
  manifest.entries = manifest.entries.filter((item) => item.id !== id && !(id === 'capture-duty-gameplay' && item.class === 'finished-game-footage') && !(id === 'art-kit-era-slideshow' && item.class === 'era-art-card'));
  manifest.entries.push({ id, ...entry, addedAt: DATE, approvedBy: APPROVAL });
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
}

async function makeStrip(samples, output) {
  ffmpeg(samples.flatMap((file) => ['-i', file]).concat(['-filter_complex', `${samples.map((_, i) => `[${i}:v]scale=480:270[v${i}]`).join(';')};${samples.map((_, i) => `[v${i}]`).join('')}hstack=inputs=${samples.length}`, output]));
}

function probe(file) {
  return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim());
}

function relative(file) { return path.relative(ROOT, file); }
function hash(value) { return [...value].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 0); }
function title(id) { return ({ 'the-claim': 'The Claim', 'e1-dry-gulch': 'Dry Gulch', 'e1-night-shift': 'Night Shift', 'e1-twin-banks': 'Twin Banks', 'e2-hill-mine': 'Hill Mine' })[id]; }

async function freePort(first, last) {
  for (let port = first; port <= last; port += 1) if (await available(port)) return port;
  throw new Error('no free capture port');
}
function available(port) {
  return new Promise((resolve) => { const server = net.createServer(); server.once('error', () => resolve(false)); server.listen(port, '127.0.0.1', () => server.close(() => resolve(true))); });
}
async function waitForHttp(url, server) {
  for (let i = 0; i < 80; i += 1) {
    if (server.exitCode !== null) throw new Error(`vite exited ${server.exitCode}`);
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('vite did not start');
}
