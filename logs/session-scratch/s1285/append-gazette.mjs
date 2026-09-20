import fs from 'node:fs';

const p = 'marketing/outbox/gazette-queue.md';
const item = `

## The Prospector's Hands Reach the Ground at Last

Give the Prospector a standing order to work a claim and the claim is worked — the seam draws down, the gold is real.
Tell them to raise a palisade and a palisade stands where you asked, paid for out of the strongbox like any other.
Until now those orders were heard and answered honestly, and then reached nothing at all; the hands were never wired to the world.
merge 12b0011e6cacc1299bda731ed861fdc16a9f9119 · reviews/ap-06b-adapter-reland-s1285-drain.md · reviews/shots-ap-06b-adapter-reland/plain-boot-desktop-chrome.png
`;

fs.appendFileSync(p, item);
console.log('gazette item appended,', item.length, 'chars');
