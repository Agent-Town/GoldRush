// TRANSPORT SHIM: operator-authored. The prompt contains field rules and evidence;
// the returned controller is saved byte-for-byte with no strategy edits.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const [rider, contract, firstViewPath, outputPath, previousPath, outcomePath, transcriptPath] = process.argv.slice(2);
if (!outputPath || !['pi', 'prime'].includes(rider)) throw new Error('usage: author-controller.mjs pi|prime contract first-view output [previous outcome transcript]');
const evidence = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/artifacts/gauntlet-heat10-20260901';
const commons = '/Users/robin/Claude/Projects/goldrush-gauntlet';
const arena = '/tmp/heat10-c13b4c24';
const notebook = rider === 'pi' ? 'pi__gpt-5.6-sol-codex-shim' : 'prime__gpt-5.6-sol-codex';
const almanac = contract === 'the-claim' ? 'e1-the-claim' : contract;
const parts = [
  readFileSync(`${evidence}/${rider}/charter.md`, 'utf8'),
  `DOOR MANUAL:\n${readFileSync(`${arena}/public/skill.md`, 'utf8')}`,
  `FIRST LIVE VIEW (cheap transport probe, not a scored ride):\n${readFileSync(firstViewPath, 'utf8')}`,
  `YOUR NOTEBOOK:\n${readFileSync(`${commons}/memories/${notebook}/NOTEBOOK.md`, 'utf8')}`,
  `ALMANAC:\n${readFileSync(`${commons}/almanac/${almanac}.md`, 'utf8')}`,
  contract === 'e1-baron' ? `BARON WAR-ROOM:\n${readFileSync(`${commons}/baron-campaign/BOARD.md`, 'utf8')}\n\nR22 LEAN-LINE POINTER:\n${readFileSync(`${commons}/baron-campaign/attempts/r22-claude-opus-5-embodied.md`, 'utf8')}` : '',
];
if (previousPath) parts.push(`YOUR PREVIOUS CONTROLLER, saved verbatim:\n${readFileSync(previousPath, 'utf8')}`);
if (outcomePath) parts.push(`EXECUTION OUTCOME:\n${readFileSync(outcomePath, 'utf8')}`);
if (transcriptPath) {
  const lines = readFileSync(transcriptPath, 'utf8').trimEnd().split('\n');
  parts.push(`TRANSCRIPT TAIL (last 24 lines):\n${lines.slice(-24).join('\n')}`);
}
parts.push(previousPath
  ? 'Iterate your own controller from the evidence. Return the complete replacement source, not a patch. Mark whether the next full ride is scored.'
  : 'Choose controller authoring or lawful per-turn play. If authoring, return the complete source and mark whether the first full ride is scored.');
const prompt = parts.filter(Boolean).join('\n\n');
const common = ['--offline', '--provider', 'heat10-shim', '--model', 'gpt-5.6-sol', '--no-tools', '--no-skills', '--no-extensions', '--no-context-files', '--no-session', '--print', prompt];
const env = { ...process.env };
let output;
if (rider === 'pi') {
  env.PI_CODING_AGENT_DIR = '/tmp/heat10-pi-state';
  output = execFileSync('/tmp/heat9-r2-pi-install/node_modules/.bin/pi', common, { cwd: arena, encoding: 'utf8', timeout: 330_000, env });
} else {
  env.PRIME_AGENT_CODING_AGENT_DIR = '/tmp/heat10-prime-state';
  output = execFileSync('prime-agent', ['--daemon-socket', '/tmp/heat10-prime-agent.sock', '--cwd', arena, ...common], { cwd: arena, encoding: 'utf8', timeout: 330_000, env });
}
writeFileSync(outputPath, output);
process.stdout.write(output);

