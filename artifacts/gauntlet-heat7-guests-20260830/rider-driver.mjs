import { execFileSync, spawn } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { createInterface } from 'node:readline';

const [rider, contract, seed, tapeArg, logArg, reasoningArg, continuation] = process.argv.slice(2);
if (!reasoningArg) throw new Error('usage: rider-driver.mjs rider contract seed tape log reasoning [continuation]');
const deadline = Date.now() + 20 * 60_000;

const root = '/tmp/heat7g-81caa695';
const evidence = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/artifacts/gauntlet-heat7-guests-20260830';
const commons = '/Users/robin/Claude/Projects/goldrush-gauntlet';
const rigs = {
  pi: { label: 'Prime Agent', notebook: 'pi__gpt-5.6-sol' },
  omp: { label: 'OMP', notebook: 'omp__gpt-5.6-sol' },
  hermes: { label: 'Hermes', notebook: 'hermes__subscription' },
  openclaw: { label: 'OpenClaw', notebook: 'openclaw__gpt-5.6-sol-max' },
};
const rig = rigs[rider];
if (!rig) throw new Error(`unknown rider: ${rider}`);

const tape = resolve(tapeArg);
const log = resolve(logArg);
const reasoning = resolve(reasoningArg);
mkdirSync(resolve(log, '..'), { recursive: true });
const charter = readFileSync(`${evidence}/charter.md`, 'utf8').replace('<rig>', rig.notebook);
const manual = readFileSync(`${root}/public/skill.md`, 'utf8');
const notebook = readFileSync(`${commons}/memories/${rig.notebook}/NOTEBOOK.md`, 'utf8');
const almanacId = contract === 'the-claim' ? 'e1-the-claim' : contract;
const almanac = readFileSync(`${commons}/almanac/${almanacId}.md`, 'utf8');
const warRoom = contract === 'e1-baron' ? readFileSync(`${commons}/baron-campaign/BOARD.md`, 'utf8') : '';
const briefing = `${charter}\n\nDOOR MANUAL:\n${manual}\n\nYOUR NOTEBOOK:\n${notebook}\n\nALMANAC:\n${almanac}${warRoom ? `\n\nBARON WAR-ROOM:\n${warRoom}` : ''}`;

const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tape], {
  cwd: root, stdio: ['pipe', 'pipe', 'pipe'],
});
const simExit = new Promise((resolveCode) => sim.once('close', resolveCode));
sim.stderr.on('data', (chunk) => appendFileSync(log, chunk));
sim.stdin.on('error', (error) => { if (error.code !== 'EPIPE') throw error; });

let call = 0;
let terminal;
for await (const line of createInterface({ input: sim.stdout })) {
  appendFileSync(log, `VIEW ${line}\n`);
  const view = JSON.parse(line);
  if (view.schema !== 'goldrush.view.v1') {
    terminal = view;
    continue;
  }
  if (view.now?.hero?.hp <= 0) continue;
  const prompt = call === 0
    ? `${briefing}\n\n${continuation ? 'This is another attempt after your prior run failed; improve your own plan.\n' : ''}Return ONLY one JSON array of standing orders for this view:\n${line}`
    : `Return ONLY one JSON array of standing orders for this next Gold Rush view:\n${line}`;
  const output = withCapacityRetry(prompt, call > 0).trim();
  call += 1;
  const orders = JSON.parse(output.replace(/^```(?:json)?\s*|\s*```$/g, ''));
  if (!Array.isArray(orders)) throw new Error(`${rig.label} did not return an order array: ${output}`);
  appendFileSync(log, `ORDERS ${JSON.stringify(orders)}\n`);
  sim.stdin.write(`${JSON.stringify(orders)}\n`);
}

const exitCode = await simExit;
if (exitCode !== 0) throw new Error(`gr-sim exited ${exitCode}`);
const reflection = withCapacityRetry(`The Gold Rush run ended with this terminal result: ${JSON.stringify(terminal)}. Report concise attempt reasoning, what worked, what failed, whether era-4 BUILD walking changed your plan, and one next hypothesis. Do not invent facts.`, true);
writeFileSync(reasoning, reflection.trim() + '\n');

function withCapacityRetry(prompt, resume) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const output = runRider(prompt, resume);
      if (output.includes('HTTP 429')) throw Object.assign(new Error(output), { stderr: output });
      return output;
    } catch (error) {
      if (attempt >= 3 || !String(error?.stderr ?? error).includes('429')) throw error;
      appendFileSync(log, `SHIM 429 retry ${attempt}/2\n`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2_000 * attempt);
    }
  }
}

function runRider(prompt, resume) {
  const timeout = Math.min(330_000, deadline - Date.now());
  if (timeout <= 0) throw new Error('20-minute attempt wall reached');
  const state = `/tmp/heat7g-${rider}-state`;
  if (rider === 'pi') {
    return execFileSync('prime-agent', [
      '--daemon-socket', '/tmp/heat7g-prime-agent.sock', '--offline', '--provider', 'heat4-shim',
      '--model', 'gpt-5.6-sol', '--cwd', root, '--no-session', '--no-tools', '--no-skills',
      '--no-extensions', '--no-context-files', '--print', prompt,
    ], { cwd: root, encoding: 'utf8', timeout, env: { ...process.env, HEAT4_SHIM_KEY: 'local-subscription', PRIME_AGENT_CODING_AGENT_DIR: state } });
  }
  if (rider === 'omp') {
    return execFileSync('omp', [
      '--model', 'heat4-shim/gpt-5.6-sol', '--cwd', root, '--session-dir', `${state}/${basename(log)}`,
      '--no-tools', '--no-skills', '--no-rules', '--max-time', '5m', '--print', ...(resume ? ['--continue'] : []), prompt,
    ], { cwd: root, encoding: 'utf8', timeout, env: { ...process.env, HEAT4_SHIM_KEY: 'local-subscription', PI_CODING_AGENT_DIR: state } });
  }
  if (rider === 'hermes') {
    const usage = `${log}.usage-${call + 1}.json`;
    return execFileSync(`${process.env.HOME}/.hermes/hermes-agent/venv/bin/hermes`, [
      '--provider', 'custom', '--model', 'gpt-5.6-sol', '--safe-mode', '--toolsets', '', '--usage-file', usage,
      ...(resume ? ['--continue'] : []), '--oneshot', prompt,
    ], { cwd: root, encoding: 'utf8', timeout, env: { ...process.env, HERMES_HOME: state, OPENAI_API_KEY: 'local-subscription' } });
  }
  const config = `${state}/openclaw.json`;
  const response = JSON.parse(execFileSync('openclaw', [
    'agent', '--local', '--message', prompt, '--model', 'heat4-shim/gpt-5.6-sol',
    '--session-id', `heat7g-${basename(log)}`, '--json',
  ], { cwd: root, encoding: 'utf8', timeout, env: {
    ...process.env, PATH: `${process.env.HOME}/.nvm/versions/node/v24.19.0/bin:${process.env.PATH}`,
    HEAT4_SHIM_KEY: 'local-subscription', OPENCLAW_STATE_DIR: state, OPENCLAW_CONFIG_PATH: config,
  } }));
  return response.payloads?.[0]?.text ?? '';
}
