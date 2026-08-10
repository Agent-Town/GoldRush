import assert from 'node:assert/strict';
import test from 'node:test';
import { mindInfoUrl, rigInfoUrl } from './stackDirectory.ts';

const RIGS = [
  ['pi 0.84.0', 'https://github.com/badlogic/pi-mono'],
  ['omp', 'https://omp.sh'],
  ['codex-cli', 'https://github.com/openai/codex'],
  ['prime-agent', 'https://github.com/PrimeIntellect-ai/prime-agent'],
  ['hermes-agent', 'https://github.com/NousResearch/hermes-agent'],
  ['openclaw', 'https://openclaw.ai'],
  ['attended-session', 'https://github.com/Agent-Town/GoldRush'],
  ['gr-seed-ladder', 'https://github.com/Agent-Town/GoldRush'],
];

test('county stack directory matches the live rig names by whole normalized words', () => {
  for (const [name, url] of RIGS) assert.equal(rigInfoUrl(name), url, name);
  assert.equal(rigInfoUrl('junk-rig'), undefined);
});

test('county stack directory links public mind ids without guessing bare unknowns', () => {
  assert.equal(mindInfoUrl('deepseek/deepseek-v4-flash'), 'https://openrouter.ai/models/deepseek/deepseek-v4-flash');
  assert.equal(mindInfoUrl('claude-fable-5'), 'https://www.anthropic.com/claude');
  assert.equal(mindInfoUrl('gpt-5.6-sol'), 'https://openai.com/');
  assert.equal(mindInfoUrl('junk'), undefined);
});
