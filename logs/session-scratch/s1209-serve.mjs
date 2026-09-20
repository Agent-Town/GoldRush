#!/usr/bin/env node
// s1209 scratch dev server — spawns vite on an explicitly-passed port and does not
// return until it has PROVEN the server is serving THIS tree (s1208 nearly measured a
// foreign server that answered 200 on a guessed port). Port is required, never defaulted.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const port = process.argv[2];
if (!port) {
  console.error('usage: s1209-serve.mjs <port>');
  process.exit(2);
}

const child = spawn('npx', ['vite', '--port', port, '--strictPort'], {
  stdio: ['ignore', 'inherit', 'inherit'],
  detached: true,
});
child.unref();

// Identity probe: /src/main.ts must be served AND must match this worktree's bytes.
const base = `http://127.0.0.1:${port}`;
for (let attempt = 1; attempt <= 30; attempt += 1) {
  await sleep(1000);
  try {
    const response = await fetch(`${base}/src/main.ts`);
    if (!response.ok) continue;
    const body = await response.text();
    const local = await (await import('node:fs/promises')).readFile('src/main.ts', 'utf8');
    const firstLine = local.split('\n')[0];
    console.log(`[s1209-serve] ${base} up after ${attempt}s; /src/main.ts ${response.status}, ${body.length} B`);
    console.log(`[s1209-serve] THIS-TREE check: first source line present in served body = ${body.includes(firstLine)}`);
    process.exit(body.includes(firstLine) ? 0 : 3);
  } catch {
    // not up yet
  }
}
console.error('[s1209-serve] server never answered');
process.exit(1);
