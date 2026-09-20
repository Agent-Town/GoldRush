import fs from 'node:fs';

const L = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const run = fs.readdirSync('tasks/running').filter((n) => n.endsWith('.md'))[0];
const before = L[0].length;

const oldQueued = 'Queued **04:44**; `tasks/running/` was **empty** at handoff, so **re-verify liveness before gating**';
const newQueued =
  'Queued **04:25** and **THE RUNNER TOOK IT AT 04:26:04, BEFORE THIS HANDOFF CLOSED** — at close it holds `tasks/running/' +
  run +
  '` plus a live `lane-a.pid`, so **the work is LIVE, not finished. Do NOT gate it in this state**; re-verify liveness first';

const oldParen = '(`tasks/running/` empty + a `done`-move + the lane branch ahead with a real commit)';
const newParen =
  '(`tasks/running/` empty + a `done`-move + the lane branch ahead with a real commit — it was mid-flight at handoff, exactly as guard-fx-03 was one fire ago)';

if (!L[0].includes(oldQueued)) console.log('WARN: queued sentence not found verbatim');
if (!L[0].includes(oldParen)) console.log('WARN: paren sentence not found verbatim');

L[0] = L[0].replace(oldQueued, newQueued).replace(oldParen, newParen);
fs.writeFileSync('STATUS.md', L.join('\n'));

console.log('running file:', run);
console.log('corrected:', L[0].includes('THE RUNNER TOOK IT AT 04:26:04'));
console.log('len', before, '->', L[0].length);
