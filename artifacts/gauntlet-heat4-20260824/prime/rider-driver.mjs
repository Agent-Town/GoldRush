import { execFileSync, spawn } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';

let [contract, seed, tape, log, continuation] = process.argv.slice(2);
if (!log) throw new Error('usage: rider-driver.mjs contract seed tape log [continue]');
tape = resolve(tape);
log = resolve(log);

const root = '/tmp/heat4-4c5ca660';
const manual = readFileSync(`${root}/public/skill.md`, 'utf8');
const state = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/artifacts/gauntlet-heat4-20260824/prime/state';
const modelArgs = ['--daemon-socket', '/tmp/heat4-prime-agent.sock', '--offline', '--provider', 'heat4-shim', '--model', 'gpt-5.6-sol', '--cwd', root, '--no-session', '--no-tools', '--no-skills', '--no-extensions', '--no-context-files', '--print'];
const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tape], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
sim.stderr.on('data', (chunk) => appendFileSync(log, chunk));
sim.stdin.on('error', (error) => { if (error.code !== 'EPIPE') throw error; });

let first = true;
for await (const line of createInterface({ input: sim.stdout })) {
  appendFileSync(log, `VIEW ${line}\n`);
  const view = JSON.parse(line);
  if (view.schema !== 'goldrush.view.v1' || view.now?.hero?.hp <= 0) continue;
  const message = `You are the Prime Agent rider in the Gold Rush gauntlet. Here is the complete door manual:\n\n${manual}\n\n${first && continuation ? 'This is another attempt after a prior failed run; improve the plan shown in the current view.\n' : ''}Return ONLY one JSON array of standing orders for this view:\n${line}`;
  const args = [...modelArgs, message];
  const output = execFileSync('prime-agent', args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 330_000,
    env: { ...process.env, HEAT4_SHIM_KEY: 'local-subscription', PRIME_AGENT_CODING_AGENT_DIR: state },
  }).trim();
  first = false;
  const orders = JSON.parse(output.replace(/^```(?:json)?\s*|\s*```$/g, ''));
  if (!Array.isArray(orders)) throw new Error(`Prime Agent did not return an order array: ${output}`);
  appendFileSync(log, `ORDERS ${JSON.stringify(orders)}\n`);
  sim.stdin.write(`${JSON.stringify(orders)}\n`);
}

const exitCode = await new Promise((resolve) => sim.once('close', resolve));
if (exitCode !== 0) throw new Error(`gr-sim exited ${exitCode}`);
