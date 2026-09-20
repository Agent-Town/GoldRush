import { execFileSync, spawn } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { basename, resolve } from 'node:path';

let [contract, seed, tape, log, continuation] = process.argv.slice(2);
if (!log) throw new Error('usage: rider-driver.mjs contract seed tape log [continuation]');
tape = resolve(tape);
log = resolve(log);

const root = '/tmp/heat4-4c5ca660';
const manual = readFileSync(`${root}/public/skill.md`, 'utf8');
const state = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/artifacts/gauntlet-heat4-20260824/openclaw/state';
const config = `${state}/openclaw.json`;
const sessionId = `heat4-${basename(log)}`;
const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tape], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
sim.stderr.on('data', (chunk) => appendFileSync(log, chunk));
sim.stdin.on('error', (error) => { if (error.code !== 'EPIPE') throw error; });

let call = 0;
for await (const line of createInterface({ input: sim.stdout })) {
  appendFileSync(log, `VIEW ${line}\n`);
  const view = JSON.parse(line);
  if (view.schema !== 'goldrush.view.v1' || view.now?.hero?.hp <= 0) continue;
  const message = call === 0
    ? `You are the OpenClaw rider in the Gold Rush gauntlet. Do not call tools. Here is the complete door manual:\n\n${manual}\n\n${continuation ? 'This is another attempt after a prior failed run; improve your plan.\n' : ''}Return ONLY one JSON array of standing orders for this view:\n${line}`
    : `Do not call tools. Return ONLY one JSON array of standing orders for this next Gold Rush view:\n${line}`;
  call++;
  const output = execFileSync('openclaw', ['agent', '--local', '--message', message, '--model', 'heat4-shim/gpt-5.6-sol', '--session-id', sessionId, '--json'], {
    cwd: root, encoding: 'utf8', timeout: 330_000,
    env: { ...process.env, PATH: `${process.env.HOME}/.nvm/versions/node/v24.19.0/bin:${process.env.PATH}`, HEAT4_SHIM_KEY: 'local-subscription', OPENCLAW_STATE_DIR: state, OPENCLAW_CONFIG_PATH: config },
  });
  const response = JSON.parse(output);
  const text = response.payloads?.[0]?.text?.trim();
  const orders = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''));
  if (!Array.isArray(orders)) throw new Error(`OpenClaw did not return an order array: ${text}`);
  appendFileSync(log, `ORDERS ${JSON.stringify(orders)}\n`);
  sim.stdin.write(`${JSON.stringify(orders)}\n`);
}

const exitCode = await new Promise((resolve) => sim.once('close', resolve));
if (exitCode !== 0) throw new Error(`gr-sim exited ${exitCode}`);
