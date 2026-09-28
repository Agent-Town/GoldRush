// Sequential followups, never a second browser worker beside the broad roster.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, createWriteStream, readdirSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const out = 'artifacts/sol/map-art-campaign-2/run-8/phone-hud';
const env = { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5312' };
function preserve(dir = 'test-results') {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) preserve(file);
    else if (entry.name === 'error-context.md' || entry.name.startsWith('test-failed')) {
      const dest = path.join(out, 'failures/followups', path.relative('test-results', file));
      mkdirSync(path.dirname(dest), { recursive: true }); copyFileSync(file, dest);
    }
  }
}
while (true) {
  try { if (existsSync(`${out}/stable-server.json`) && JSON.parse(readFileSync(`${out}/e2e-exits.json`, 'utf8')).length === 2) break; } catch {}
  await new Promise(r => setTimeout(r, 5000));
}
const results = [];
async function run(name, command, args, json = false) {
  preserve();
  const log = createWriteStream(`${out}/${name}.log`);
  const child = spawn(command, args, { env: { ...env, ...(json ? { PLAYWRIGHT_JSON_OUTPUT_FILE: `${out}/${name}.json` } : {}) }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false });
  const exitCode = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  log.end(); results.push({ name, command, args, exitCode });
  writeFileSync(`${out}/followup-exits.json`, JSON.stringify(results, null, 2) + '\n');
  console.log(name, exitCode);
  return exitCode;
}
const projects = ['--project=desktop-chrome', '--project=mobile-chrome', '--workers=1', '--reporter=line,json'];
if (await run('layout-check', 'node', [`${out}/check-layout.mjs`])) process.exitCode = 1;
else {
  await run('census-final', 'node', ['scripts/phone-hud-entry-census.mjs', 'after']);
  await run('census-final-guard', 'node', ['--test', 'scripts/phone-hud-entry-census.test.mjs']);
  await run('boards-final', process.env.HUD_IMAGE_PYTHON ?? 'python3', [`${out}/boards.py`]);
  await run('e2e-additional', 'npx', ['playwright', 'test', ...JSON.parse(readFileSync(`${out}/additional-hud-specs.json`, 'utf8')), ...projects], true);
  await run('e2e-mp-hud', 'npx', ['playwright', 'test', 'e2e/mp-02-lockstep.spec.ts', '--grep', 'both riders place buildings and pick upgrades with equal hashes for 300 ticks', ...projects], true);
}
preserve();
