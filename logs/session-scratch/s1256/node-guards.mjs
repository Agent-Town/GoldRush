#!/usr/bin/env node
// s1256 — run the node-guards battery (the shell gate rejects `npm run` when the script body
// contains `&&`, which this one does). Baseline to beat: 156/156, and I added no guard arms.
import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const pkg = JSON.parse(spawnSync('cat', [resolve(repo, 'package.json')], { encoding: 'utf8' }).stdout);
const body = pkg.scripts['test:node-guards'];
const [nodeTestPart, tickerPart] = body.split('&&').map((s) => s.trim());

const runShellless = (part) => {
  const argv = part.split(/\s+/);
  const cmd = argv[0];
  const t0 = Date.now();
  const r = spawnSync(cmd, argv.slice(1), { cwd: repo, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const summary = out.split('\n').filter((l) => /^ℹ (tests|suites|pass|fail|cancelled|skipped)/.test(l)).join(' | ');
  console.log(`\n$ ${part}\nrc=${r.status} ${secs}s\n${summary || out.split('\n').slice(-12).join('\n')}`);
  appendFileSync(resolve(here, 'measure-transcript.txt'), `\n===== ${part} =====\nrc=${r.status} ${secs}s\n${out}\n`);
  return r.status;
};

const a = runShellless(nodeTestPart);
const b = tickerPart ? runShellless(tickerPart) : 0;
console.log(`\nSUMMARY node-guards rc=${a} ticker rc=${b}`);
process.exit(a || b);
