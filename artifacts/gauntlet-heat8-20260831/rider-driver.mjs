import { randomUUID } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { createInterface } from 'node:readline';

const [rider, contract, seed, tapeArg, logArg, reasoningArg, continuation] = process.argv.slice(2);
if (!reasoningArg) throw new Error('usage: rider-driver.mjs rider contract seed tape log reasoning [continuation]');
const deadline = Date.now() + 20 * 60_000;
const root = '/tmp/heat8-4675cfd7';
const evidence = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/artifacts/gauntlet-heat8-20260831';
const commons = '/Users/robin/Claude/Projects/goldrush-gauntlet';
const rigs = {
  codex: { label: 'Codex shim', notebook: 'codex__gpt-5.6-sol' },
  pi: { label: 'Prime Agent', notebook: 'pi__gpt-5.6-sol' },
  omp: { label: 'OMP', notebook: 'omp__gpt-5.6-sol' },
  hermes: { label: 'Hermes', notebook: 'hermes__subscription' },
  openclaw: { label: 'OpenClaw', notebook: 'openclaw__gpt-5.6-sol-max' },
  'claude-fable': { label: 'Claude Fable 5', notebook: 'claude__fable-5', model: 'claude-fable-5' },
  'claude-opus': { label: 'Claude Opus 5', notebook: 'claude__opus-5', model: 'claude-opus-5' },
};
const rig = rigs[rider];
if (!rig) throw new Error(`unknown rider: ${rider}`);
const tape = resolve(tapeArg);
const log = resolve(logArg);
const reasoning = resolve(reasoningArg);
mkdirSync(resolve(log, '..'), { recursive: true });
const charter = readFileSync(`${evidence}/charter.md`, 'utf8').replace('<rig>', rig.notebook);
const manual = readFileSync(`${root}/public/skill.md`, 'utf8');
const notebookPath = `${commons}/memories/${rig.notebook}/NOTEBOOK.md`;
const notebook = existsSync(notebookPath) ? readFileSync(notebookPath, 'utf8') : 'EMPTY NOTEBOOK: first ride in county history; generation 1 will be scribed after this field.';
const almanacId = contract === 'the-claim' ? 'e1-the-claim' : contract;
const almanac = readFileSync(`${commons}/almanac/${almanacId}.md`, 'utf8');
const warRoom = contract === 'e1-baron' ? readFileSync(`${commons}/baron-campaign/BOARD.md`, 'utf8') : '';
const briefing = rider.startsWith('claude-')
  ? `${charter}\n\nUse Read on the charter-listed manual, notebook, almanac${warRoom ? ', and Baron war-room' : ''} before your first order. Your notebook is ${existsSync(notebookPath) ? notebookPath : 'empty because this is your first county ride'}.`
  : `${charter}\n\nDOOR MANUAL:\n${manual}\n\nYOUR NOTEBOOK:\n${notebook}\n\nALMANAC:\n${almanac}${warRoom ? `\n\nBARON WAR-ROOM:\n${warRoom}` : ''}`;
const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tape], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
const simExit = new Promise((done) => sim.once('close', done));
sim.stderr.on('data', (chunk) => appendFileSync(log, chunk));
sim.stdin.on('error', (error) => { if (error.code !== 'EPIPE') throw error; });
let call = 0;
const claudeSession = randomUUID();
let terminal;
for await (const line of createInterface({ input: sim.stdout })) {
  appendFileSync(log, `VIEW ${line}\n`);
  const view = JSON.parse(line);
  if (view.schema !== 'goldrush.view.v1') { terminal = view; continue; }
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
const reflection = withCapacityRetry(`The Gold Rush run ended with this terminal result: ${JSON.stringify(terminal)}. Report concise attempt reasoning, what worked, what failed, whether embodied BUILD walking changed your plan, explicitly acknowledge the era-5 fresh-board rule, and give one next hypothesis. Do not invent facts.`, true);
writeFileSync(reasoning, reflection.trim() + '\n');

function withCapacityRetry(prompt, resume) {
  for (let attempt = 1; ; attempt += 1) {
    try { return runRider(prompt, resume); }
    catch (error) {
      if (attempt >= 3 || !String(error?.stderr ?? error).includes('429')) throw error;
      appendFileSync(log, `SHIM 429 retry ${attempt}/2\n`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2_000 * attempt);
    }
  }
}

function runRider(prompt, resume) {
  const timeout = rider.startsWith('claude-') ? deadline - Date.now() : Math.min(330_000, deadline - Date.now());
  if (timeout <= 0) throw new Error('20-minute attempt wall reached');
  const state = `/tmp/heat8-${rider}-state`;
  if (rider === 'codex') {
    const payload = JSON.stringify({ model: 'gpt-5.6-sol', stream: true, messages: [{ role: 'user', content: prompt }] });
    const sse = execFileSync('curl', ['-fsSN', '-H', 'Authorization: Bearer local-subscription', '-H', 'Content-Type: application/json', '--data-binary', payload, 'http://127.0.0.1:8899/v1/chat/completions'], { encoding: 'utf8', timeout });
    return sse.split('\n').filter((line) => line.startsWith('data: ') && line !== 'data: [DONE]').map((line) => JSON.parse(line.slice(6)).choices?.[0]?.delta?.content ?? '').join('');
  }
  if (rider.startsWith('claude-')) {
    const env = { ...process.env };
    delete env.CLAUDE_CONFIG_DIR;
    delete env.CLAUDECODE;
    const args = ['-p', prompt, '--model', rig.model, '--allowedTools', 'Read', 'Bash(node scripts/gr-sim.mjs *)', '--permission-mode', 'dontAsk', '--safe-mode', '--output-format', 'text', ...(resume ? ['--resume', claudeSession] : ['--session-id', claudeSession])];
    appendFileSync(log, `CLAUDE INVOCATION ${JSON.stringify(['claude', '-p', prompt, ...args.slice(2)])}\n`);
    return execFileSync('claude', args, { cwd: root, encoding: 'utf8', timeout, env });
  }
  if (rider === 'pi') return execFileSync('prime-agent', ['--daemon-socket', '/tmp/heat8-prime-agent.sock', '--offline', '--provider', 'heat4-shim', '--model', 'gpt-5.6-sol', '--cwd', root, '--no-session', '--no-tools', '--no-skills', '--no-extensions', '--no-context-files', '--print', prompt], { cwd: root, encoding: 'utf8', timeout, env: { ...process.env, HEAT4_SHIM_KEY: 'local-subscription', PRIME_AGENT_CODING_AGENT_DIR: state } });
  if (rider === 'omp') return execFileSync('omp', ['--model', 'heat4-shim/gpt-5.6-sol', '--cwd', root, '--session-dir', `${state}/${basename(log)}`, '--no-tools', '--no-skills', '--no-rules', '--max-time', '5m', '--print', ...(resume ? ['--continue'] : []), prompt], { cwd: root, encoding: 'utf8', timeout, env: { ...process.env, HEAT4_SHIM_KEY: 'local-subscription', PI_CODING_AGENT_DIR: state } });
  if (rider === 'hermes') return execFileSync(`${process.env.HOME}/.hermes/hermes-agent/venv/bin/hermes`, ['--provider', 'custom', '--model', 'gpt-5.6-sol', '--safe-mode', '--toolsets', '', '--usage-file', `${log}.usage-${call + 1}.json`, ...(resume ? ['--continue'] : []), '--oneshot', prompt], { cwd: root, encoding: 'utf8', timeout, env: { ...process.env, HERMES_HOME: state, OPENAI_API_KEY: 'local-subscription' } });
  const response = JSON.parse(execFileSync('openclaw', ['agent', '--local', '--message', prompt, '--model', 'heat4-shim/gpt-5.6-sol', '--session-id', `heat8-${basename(log)}`, '--json'], { cwd: root, encoding: 'utf8', timeout, env: { ...process.env, PATH: `${process.env.HOME}/.nvm/versions/node/v24.19.0/bin:${process.env.PATH}`, HEAT4_SHIM_KEY: 'local-subscription', OPENCLAW_STATE_DIR: state, OPENCLAW_CONFIG_PATH: `${state}/openclaw.json` } }));
  return response.payloads?.[0]?.text ?? '';
}
