// Exercise the existing release spec on the already-built E1 payload, using only port 5312.
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, createWriteStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { cases } from './summarize-tests.mjs';
const out = 'artifacts/sol/map-art-campaign-2/run-10/phone-hud';
const hash = value => createHash('sha256').update(value).digest('hex');
const exits = [];
async function run(name, locations = []) {
  const args = ['playwright', 'test', ...locations, '--config', `${out}/playwright.release.config.ts`, '--workers=1', '--reporter=line,json', `--output=${out}/failures/${name}`];
  const log = createWriteStream(`${out}/${name}.log`);
  const child = spawn('npx', args, { env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '0', GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5312', PLAYWRIGHT_JSON_OUTPUT_FILE: `${out}/${name}.json` }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false });
  const exitCode = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  log.end(); exits.push({ name, args, exitCode });
  writeFileSync(`${out}/release-exits.json`, JSON.stringify(exits, null, 2) + '\n');
  console.log(name, exitCode);
  return cases(JSON.parse(readFileSync(`${out}/${name}.json`)));
}
const initial = await run('e2e-release');
const failed = initial.filter(c => c.status === 'unexpected');
if (failed.length) {
  const targets = readdirSync('dist/assets').filter(p => p.endsWith('.css')).map(p => `dist/assets/${p}`).filter(p => readFileSync(p, 'utf8').includes('data-terrain3d-pilot-contract=e1-night-shift'));
  if (targets.length !== 1) throw new Error(`Expected one compiled run-10 stylesheet, found ${targets.length}`);
  const target = targets[0];
  const original = readFileSync(target);
  const css = original.toString();
  const marker = css.indexOf('data-terrain3d-pilot-contract=e1-night-shift');
  const start = css.lastIndexOf('@media', marker);
  const open = css.indexOf('{', start);
  if (css.slice(start, open) !== '@media (width:390px) and (height>=701px)') throw new Error('Unexpected compiled media rule');
  let end = open + 1, depth = 1;
  for (; end < css.length && depth; end++) depth += css[end] === '{' ? 1 : css[end] === '}' ? -1 : 0;
  if (depth) throw new Error('Unbalanced compiled CSS');
  const control = Buffer.from(css.slice(0, start) + css.slice(end));
  const receipt = { target, originalHash: hash(original), controlHash: hash(control), removedBytes: original.length - control.length, removedRule: css.slice(start, end), scope: 'Only the compiled run-10 media rule removed; all JavaScript and assets stay identical.', restored: false };
  try {
    writeFileSync(target, control);
    const guard = spawnSync(process.execPath, ['scripts/assert-release-build.mjs'], { env: { ...process.env, GR_RELEASE: 'e1' }, encoding: 'utf8' });
    receipt.releaseGuardControlExit = guard.status;
    writeFileSync(`${out}/assert-release-build-control.log`, (guard.stdout ?? '') + (guard.stderr ?? ''));
    writeFileSync(`${out}/release-css-control.json`, JSON.stringify(receipt, null, 2) + '\n');
    await run('e2e-release-control', [...new Set(failed.map(c => `e2e/${c.file.replace(/^e2e\//, '')}:${c.line}`))]);
  } finally {
    writeFileSync(target, original);
    receipt.restored = hash(readFileSync(target)) === receipt.originalHash;
    writeFileSync(`${out}/release-css-control.json`, JSON.stringify(receipt, null, 2) + '\n');
  }
}
