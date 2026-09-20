import fs from 'node:fs';

const p = 'marketing/outbox/gazette-queue.md';
const item = [
  '',
  '## A rig can take the empty chair at your table',
  'Open a room from the tavern board and you get back a claim word. Hand that word to a rig and it sits down and plays the run with you — same contract, same seed, same clock, one tick at a time.',
  'A seat cannot choose its own world: ask for a room and a contract in the same breath and it refuses, because a hand that picked its own table would not be at yours. It paces itself to the room rather than racing ahead, it is asked for orders only between waves, and if its reckoning of the world ever stops matching the table it stands up and says so instead of playing on.',
  'What it can do today is build. That is the honest edge of it, written down rather than hidden.',
  'merge 90f9a9a58cf8474e260265c8f9e2b27d9cfe6def · reviews/milk-agent-seat.md · artifacts/agent-seat/ (desktop 1280 + mobile 390)',
  'NO OWNER CHOICE — this is the second half of your own sentence about people and agents playing together. Worth knowing what the drain would not claim: the proof runs one door, not two, and the small-screen shot is captured inside that same run rather than by a second pass.',
  '',
].join('\n');

fs.appendFileSync(p, item);
console.log('gazette item appended; file now', fs.statSync(p).size, 'bytes');
