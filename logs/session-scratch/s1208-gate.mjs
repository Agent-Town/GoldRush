#!/usr/bin/env node
// s1208 gate runner — runs playwright against a scratch dev server so the drain
// never contends with the live lane runners on the repo-default port 5188
// (Mistake #12: gate contamination). Port is passed in, never defaulted, because
// a rig with a default port can silently measure a foreign tree (5231 answered
// 200 from someone else's server this fire).
import { spawnSync } from 'node:child_process';

const [port, ...rest] = process.argv.slice(2);
if (!port || rest.length === 0) {
  console.error('usage: s1208-gate.mjs <port> <playwright args...>');
  process.exit(2);
}

const result = spawnSync('npx', ['playwright', 'test', ...rest, '--reporter=line'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    GR_CAPTURE_EXTERNAL_SERVER: '1',
    GR_CAPTURE_BASE_URL: `http://127.0.0.1:${port}`,
  },
});
process.exit(result.status ?? 1);
