// s1318 — GZ-01 duty for the f1297-2 merge. The filter law keys on a player-visible change; this
// merge adds no player-visible behaviour (the button already worked), so per the law it gets no
// GAZETTE headline. What it does change is a promise about the button, which belongs in the roundup.
import { appendFileSync } from 'node:fs';

const item = `
## ROUNDUP — The Keeping of a Run's Tape Is Now Watched in Plain Daylight

No change a player can see: the button that keeps a run's tape has always been there after a death, in ordinary play, with no switches thrown.
What changed is that we can now prove it. Every check we had on that button ran with the workshop doors open — a boot with debug flags set — so the button could have quietly vanished from the ordinary game and no test in the house would have said a word.
There is now a check that boots the game the way you boot it and waits for the button to appear, and it was proven by breaking the button on purpose and watching the new check catch it.
merge 2871c1276d7321cd60a4dd87831c8d003df3140f · reviews/f1297-2-plain-boot-tape-button.md · artifacts/f1297-2-plain-boot-tape-button/ (desktop 1280 + mobile 390, no debug flags)
`;

appendFileSync('marketing/outbox/gazette-queue.md', item);
console.log('roundup item appended for 2871c127 (no headline — no player-visible change)');
