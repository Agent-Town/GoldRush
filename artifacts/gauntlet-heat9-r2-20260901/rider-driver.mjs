import { execFileSync, spawn } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const [rider, contract, seed, tape, log, reasoning, continuation] = process.argv.slice(2);
if (!reasoning || !['pi', 'prime'].includes(rider)) throw new Error('usage: rider-driver.mjs pi|prime contract seed tape log reasoning [continuation]');
const root = '/tmp/heat9-r2-c13b4c24';
const evidence = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/artifacts/gauntlet-heat9-r2-20260901';
const commons = '/Users/robin/Claude/Projects/goldrush-gauntlet';
const rig = rider === 'pi'
  ? { label: 'PI', notebook: 'pi__gpt-5.6-sol-codex-shim', state: '/tmp/heat9-r2-pi-state' }
  : { label: 'Prime Agent', notebook: 'prime__gpt-5.6-sol-codex', state: '/tmp/heat9-r2-prime-state' };
const almanacId = contract === 'the-claim' ? 'e1-the-claim' : contract;
const briefing = [
  readFileSync(`${evidence}/${rider}/charter.md`, 'utf8'),
  `DOOR MANUAL:\n${readFileSync(`${root}/public/skill.md`, 'utf8')}`,
  `YOUR NOTEBOOK:\n${readFileSync(`${commons}/memories/${rig.notebook}/NOTEBOOK.md`, 'utf8')}`,
  `ALMANAC:\n${readFileSync(`${commons}/almanac/${almanacId}.md`, 'utf8')}`,
  contract === 'e1-baron' ? `BARON WAR-ROOM:\n${readFileSync(`${commons}/baron-campaign/BOARD.md`, 'utf8')}` : '',
].filter(Boolean).join('\n\n');
const deadline = Date.now() + 20 * 60_000;
const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tape], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
const simExit = new Promise((done) => sim.once('close', done));
sim.stderr.on('data', (chunk) => appendFileSync(log, chunk));
sim.stdin.on('error', (error) => { if (error.code !== 'EPIPE') throw error; });
let call = 0;
let terminal;
for await (const line of createInterface({ input: sim.stdout })) {
  appendFileSync(log, `VIEW ${line}\n`);
  const view = JSON.parse(line);
  if (view.schema !== 'goldrush.view.v1') { terminal = view; continue; }
  if (view.now?.hero?.hp <= 0) continue;
  const prompt = `${briefing}${call === 0 && continuation ? '\nThis is another attempt after your prior run failed; improve your own plan.' : ''}\nReturn ONLY one JSON array of standing orders for this view:\n${line}`;
  const output = complete(prompt).trim();
  call += 1;
  const orders = JSON.parse(output.replace(/^```(?:json)?\s*|\s*```$/g, ''));
  if (!Array.isArray(orders)) throw new Error(`${rig.label} did not return an order array: ${output}`);
  appendFileSync(log, `ORDERS ${JSON.stringify(orders)}\n`);
  sim.stdin.write(`${JSON.stringify(orders)}\n`);
}
if (await simExit) throw new Error('gr-sim failed');
writeFileSync(reasoning, complete(`The Gold Rush run ended with this terminal result: ${JSON.stringify(terminal)}. Report concise attempt reasoning, what worked, what failed, whether embodied BUILD walking changed your plan, explicitly acknowledge the era-5 fresh-board rule, and give one next hypothesis. Do not invent facts.`).trim() + '\n');

function complete(prompt) {
  const timeout = Math.min(330_000, deadline - Date.now());
  if (timeout <= 0) throw new Error('20-minute attempt wall reached');
  const common = ['--offline', '--provider', 'heat9-shim', '--model', 'gpt-5.6-sol', '--no-tools', '--no-skills', '--no-extensions', '--no-context-files', '--no-session', '--print', prompt];
  if (rider === 'pi') return execFileSync('/tmp/heat9-r2-pi-install/node_modules/.bin/pi', common, { cwd: root, encoding: 'utf8', timeout, env: { ...process.env, PI_CODING_AGENT_DIR: rig.state } });
  return execFileSync('prime-agent', ['--daemon-socket', '/tmp/heat9-r2-prime-agent.sock', '--cwd', root, ...common], { cwd: root, encoding: 'utf8', timeout, env: { ...process.env, PRIME_AGENT_CODING_AGENT_DIR: rig.state } });
}
