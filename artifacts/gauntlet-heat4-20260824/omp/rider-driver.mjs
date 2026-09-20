import { execFileSync, spawn } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { basename, resolve } from 'node:path';

let [contract, seed, tape, log, continuation] = process.argv.slice(2);
if (!log) throw new Error('usage: rider-driver.mjs contract seed tape log');
tape = resolve(tape);
log = resolve(log);

const root = '/tmp/heat4-4c5ca660';
const manual = readFileSync(`${root}/public/skill.md`, 'utf8');
const state = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/artifacts/gauntlet-heat4-20260824/omp/state';
const modelArgs = ['--model', 'heat4-shim/gpt-5.6-sol', '--cwd', root, '--session-dir', `${state}/${basename(log)}`, '--no-tools', '--no-skills', '--no-rules', '--max-time', '5m', '--print'];
const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tape], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
sim.stderr.on('data', (chunk) => appendFileSync(log, chunk));

let first = true;
sim.stdin.on('error', (error) => { if (error.code !== 'EPIPE') throw error; });
for await (const line of createInterface({ input: sim.stdout })) {
  appendFileSync(log, `VIEW ${line}\n`);
  const view = JSON.parse(line);
  if (view.schema !== 'goldrush.view.v1') continue;
  if (view.now?.hero?.hp <= 0) continue;
  const message = first
    ? `You are the OMP rider in the Gold Rush gauntlet. Here is the complete door manual:\n\n${manual}\n\n${continuation ? 'This is another attempt after the prior run died; improve your own plan.\n' : ''}Return ONLY one JSON array of standing orders for this view:\n${line}`
    : `Return ONLY one JSON array of standing orders for this next Gold Rush view:\n${line}`;
  const args = [...modelArgs, ...(!first ? ['--continue'] : []), message];
  const output = execFileSync('omp', args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 330_000,
    env: { ...process.env, HEAT4_SHIM_KEY: 'local-subscription', PI_CODING_AGENT_DIR: state },
  }).trim();
  first = false;
  const orders = JSON.parse(output.replace(/^```(?:json)?\s*|\s*```$/g, ''));
  if (!Array.isArray(orders)) throw new Error(`OMP did not return an order array: ${output}`);
  appendFileSync(log, `ORDERS ${JSON.stringify(orders)}\n`);
  sim.stdin.write(`${JSON.stringify(orders)}\n`);
}

const exitCode = await new Promise((resolve) => sim.once('close', resolve));
if (exitCode !== 0) throw new Error(`gr-sim exited ${exitCode}`);
