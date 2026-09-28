#!/usr/bin/env node
/**
 * battery-legs.mjs (localhost-cors-2): runs `npm run test:node-guards` exactly as package.json defines it, but
 * each `&&` leg on its own, so a red leg cannot hide the legs chained after it (small-fixes-1 had to run them by
 * hand for that reason). The combined verdict is what `npm run test:node-guards` would return: 0 only if every
 * leg exits 0.
 * usage (repo root, under the drain lock): GR_GUARD_NO_ARTIFACT=1 node artifacts/localhost-cors-2/battery-legs.mjs <out dir>
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const OUT = path.resolve(ROOT, process.argv[2] ?? 'artifacts/localhost-cors-2/gates');
mkdirSync(OUT, { recursive: true });
const script = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')).scripts['test:node-guards'];
const legs = script.split(' && ');
let combined = 0;
legs.forEach((leg, index) => {
  const started = Date.now();
  const result = spawnSync('bash', ['-c', leg], { cwd: ROOT, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, env: process.env });
  const seconds = Math.round((Date.now() - started) / 1000);
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  writeFileSync(path.join(OUT, `battery-leg-${String(index + 1).padStart(2, '0')}.log`), `$ ${leg}\n${output}`);
  const rc = result.status ?? (result.signal ? `signal ${result.signal}` : 'unknown');
  if (rc !== 0) combined = 1;
  const counts = output.split('\n').filter((line) => /^ℹ (tests|pass|fail|skipped|cancelled) \d+/.test(line)).join(', ');
  const last = output.trim().split('\n').slice(-1)[0] ?? '';
  const shown = leg.length > 90 ? `${leg.slice(0, 90)}...` : leg;
  console.log(`leg ${index + 1}/${legs.length} rc=${rc} ${seconds}s :: ${shown} :: ${counts || last.slice(0, 200) || '(no output)'}`);
});
console.log(`BATTERY: ${legs.length} legs, combined rc ${combined}`);
process.exitCode = combined;
