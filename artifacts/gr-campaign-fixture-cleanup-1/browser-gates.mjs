import { spawn } from 'node:child_process';
import { openSync, closeSync } from 'node:fs';
import { runBattery } from '../../scripts/gate-battery.mjs';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const log = openSync(new URL('vite.txt', import.meta.url), 'a');
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5317', '--strictPort'], { cwd: ROOT, stdio: ['ignore', log, log] });
const closed = new Promise((resolve) => server.once('close', resolve));
server.on('error', (error) => console.error(error));
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Vite exited ${server.exitCode}`);
    try { ready = (await fetch('http://127.0.0.1:5317/@vite/client')).ok; } catch {}
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error('Vite did not become ready');
  const result = runBattery([
    ['plain desktop and 390px boots', process.execPath, 'artifacts/gr-campaign-fixture-cleanup-1/plain-boots.mjs'],
    ['adjacent suites both projects', 'npx', 'playwright', 'test', 'e2e/task-025-bandits-dont-swim.spec.ts', 'e2e/m1-01-claim-jumpers-death.spec.ts', 'e2e/m2-01-build-menu.spec.ts', '--project=desktop-chrome', '--project=mobile-chrome', '--workers=1', '--output=artifacts/gr-campaign-fixture-cleanup-1/playwright-results'],
  ], { transcript: 'artifacts/gr-campaign-fixture-cleanup-1/browser-gates.txt', label: 'campaign fixture cleanup', cwd: ROOT,
    env: { GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5317' } });
  process.exitCode = result.overall;
} finally {
  if (server.exitCode === null && server.signalCode === null) server.kill('SIGTERM');
  await closed;
  closeSync(log);
}
