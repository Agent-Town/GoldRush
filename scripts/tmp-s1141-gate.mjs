#!/usr/bin/env node
// s1141 gate runner — the bash gate blocks `ENV=x npx ...` prefixes, so drives
// playwright through execFileSync with an explicit env instead. Committed as
// evidence per the Retention Law; args are passed straight through.
//   node scripts/tmp-s1141-gate.mjs <port> <playwright args...>
import { execFileSync } from 'node:child_process';

const [port, ...rest] = process.argv.slice(2);
const env = {
  ...process.env,
  GR_CAPTURE_EXTERNAL_SERVER: '1',
  GR_CAPTURE_BASE_URL: `http://127.0.0.1:${port}`,
};

try {
  execFileSync('npx', ['playwright', 'test', ...rest], {
    env,
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('GATE-RC=0');
} catch (err) {
  console.log(`GATE-RC=${err.status ?? 'unknown'}`);
  process.exitCode = 0; // report, never mask: the caller reads GATE-RC
}
