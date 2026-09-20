import { appendFileSync } from 'node:fs';

const p = 'marketing/outbox/gazette-queue.md';
const heading = '## GAZETTE — The County Speaks Of Teams, And The Drill Yard Keeps No Score';
const item = [
  '',
  '',
  heading,
  '',
  'The standings talk plainly now: a team of two, three or four, ranked only against teams its own',
  'size. And the Drill Yard has stepped off the ladder for good — it is the training ground, so it',
  'takes no entries and prints no ranks. Practice is its own reward. The claim itself is unchanged',
  'and open whenever you want it.',
  'merge 7123f2d566d2cf5da063273831d1bb2396e901d0 · reviews/team-and-training.md · reviews/shots-team-and-training/',
  'NO OWNER CHOICE — this is your own words landing, both of them ("Can we call it team of 2/3/4 -',
  'not Posse?" and "the Drill Yard is not a contract that needs a ladder - it is the training',
  'ground"). The Drill Yard stays fully playable — visible, launchable, resettable — and that was',
  'tested rather than assumed: its own two suites came back green against the merged tree. Only the',
  'scoring door is shut.',
  '',
].join('\n');

appendFileSync(p, item);
console.log('gazette item appended');
