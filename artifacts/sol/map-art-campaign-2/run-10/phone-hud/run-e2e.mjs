// Run the existing HUD contracts serially against lane-b's own dev server.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, createWriteStream } from 'node:fs';
const out = 'artifacts/sol/map-art-campaign-2/run-10/phone-hud';
const summaries = [];
async function run(name, specs, projects) {
  const args = ['playwright', 'test', ...specs, ...projects.map(p => `--project=${p}`), '--workers=1', '--reporter=line,json', `--output=${out}/failures/${name}`];
  const env = { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5312', PLAYWRIGHT_JSON_OUTPUT_FILE: `${out}/${name}.json` };
  const log = createWriteStream(`${out}/${name}.log`);
  const child = spawn('npx', args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false });
  const exitCode = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  log.end(); summaries.push({ name, args, exitCode });
  writeFileSync(`${out}/e2e-exits.json`, JSON.stringify(summaries, null, 2) + '\n');
  console.log(name, exitCode);
}
await import('./check-layout.mjs');
await run('e2e-campaign', ['e2e/e1-night-shift.spec.ts', 'e2e/e1-twin-banks.spec.ts', 'e2e/e1-baron.spec.ts', 'e2e/e2-trestle.spec.ts'], ['mobile-chrome']);
await run('e2e-hud', JSON.parse(readFileSync(`${out}/hud-spec-roster.json`, 'utf8')).specs, ['desktop-chrome', 'mobile-chrome']);
