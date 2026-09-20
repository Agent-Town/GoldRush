// s1507 — GZ-01: one news item per real-change merge. Ledger voice, frontier speak, no token or
// price talk, and the drain's own caveat stated plainly.
import { appendFileSync } from 'node:fs';

const item = `
## The far country came back to the prospector who had earned it
A lantern show was added to the county last week, and to run its replays it taught the game to read which age you were in from the contract in your hand. Every ordinary morning after that, the game read the same answer — the first claim on the river — no matter how far you had come.
The consequence was quiet and total: the late-age arsenal never woke. The terraforming cannon would not fire, and the county's own instruments reported the age as inactive while you stood in it.
The lantern show keeps its reading, and now only on the replay road. Every other way into the county asks the ledger which age you have reached, as it did before.
merge 39987a4252dad31fb8ba3d267dde1c288dc6dc42 · reviews/f1506-2-e9-roster-bisect.md · docs/bench/e9-roster-regression.md (bisect table, 11 revisions)
NO OWNER CHOICE — this restores behaviour you already had rather than proposing new. Worth knowing what the drain would not claim: the fault was found by bisecting eleven revisions to a named commit, not by guessing; and six of the county's other instruments were already reading red before this merge and still are — they were each checked one at a time against the county as it stood before, and none of them moved.
`;

appendFileSync('marketing/outbox/gazette-queue.md', item);
console.log('gazette item appended');
