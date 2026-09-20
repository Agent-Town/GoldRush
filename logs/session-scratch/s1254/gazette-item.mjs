// s1254 GZ-01 duty: append one news item for the merge this fire landed.
import { appendFileSync } from 'node:fs';

appendFileSync(
  'marketing/outbox/gazette-queue.md',
  `
## The Trail Guide Waits Until You Have Read the Line

A first-timer's lessons used to talk over one another — take a level while the movement lesson is still on the board and the second line wiped the first before it could be read.
Each lesson now holds the board for four seconds, or until you touch a key, and the ones behind it wait their turn in order.
Old hands are unaffected; once the trail has taught you, the feed speaks as fast as the day does.
merge 6f343a6e · artifacts/trail-guide-beat-priority/desktop-chrome-storm.png
`,
);
console.log('appended');
