// s1171: classify inventory reds for the six building-context-prompt specs.
import { readFileSync } from 'node:fs';

const inv = JSON.parse(readFileSync('logs/suite-red-inventory-compact.json', 'utf8'));
const want = ['bt-00-demolish', 'bt-01-tiers', 'e2-stamp-mill', 'night-light-doctrine', 'world-info-notes', 'building-prompt-flicker'];
const strip = (s) => s.replace(/\[[0-9;]*m/g, '');

let prompt = 0;
let other = 0;
for (const suite of inv.suites) {
  if (!want.some((n) => suite.file && suite.file.includes(n))) continue;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      for (const result of test.results ?? []) {
        if (result.status === 'passed') continue;
        const msg = strip((result.errors ?? []).map((e) => e.message ?? '').join(' | '));
        const lines = (result.errors ?? []).map((e) => (e.location ? e.location.line : '?')).join(',');
        const isPrompt = /building-context-prompt/.test(msg);
        if (isPrompt) prompt += 1;
        else other += 1;
        console.log([suite.file, test.projectName, 'L' + lines, isPrompt ? 'PROMPT' : 'OTHER', spec.title.slice(0, 46), msg.split('\n')[0].slice(0, 88)].join(' :: '));
      }
    }
  }
}
console.log('--- PROMPT rows:', prompt, ' OTHER rows:', other);
