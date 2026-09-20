// s1528 gate scratch driver — PLAIN-BOOT probe for the f1526-1 drain.
// Mistake #10 asks "where does the PLAYER see this in a plain boot?"; for a rider-facing
// VIEW field the honest answer is "nowhere", so this probe's job is the OTHER half:
// prove the new buildNow() branch cannot throw or log on a boot with NO ?debug flag,
// at desktop 1280x800 and mobile 390x844. Starts its own dev server on a scratch port
// (5234) so it never contends with a live lane on 5188 (CLAUDE.md Mistake #12).
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 5234;
const base = `http://127.0.0.1:${PORT}`;

const dev = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
});
let devLog = '';
dev.stdout.on('data', (d) => { devLog += d; });
dev.stderr.on('data', (d) => { devLog += d; });

async function waitForServer(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(base + '/');
      if (res.ok) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
];

try {
  if (!await waitForServer()) throw new Error('dev server never came up:\n' + devLog.slice(-2000));
  const browser = await chromium.launch({ channel: 'chromium' });
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    await page.goto(base + '/', { waitUntil: 'load' });
    await page.waitForTimeout(9000);
    await page.screenshot({ path: `boot-${vp.name}.png` });
    // GLTFLoader blob-texture noise is a known, suite-suppressed class (see e2e watchErrors).
    const real = errors.filter((e) => !e.includes('GLTFLoader'));
    console.log(`${vp.name}: total console/page errors=${errors.length} · non-GLTFLoader=${real.length}`);
    for (const e of real.slice(0, 8)) console.log('   ' + e.slice(0, 200));
    await context.close();
  }
  await browser.close();
} finally {
  dev.kill('SIGTERM');
}
