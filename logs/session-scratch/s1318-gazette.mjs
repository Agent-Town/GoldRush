// s1318 — GZ-01 duty: one news item for the f1316-1 merge (player-visible change).
import { appendFileSync } from 'node:fs';

const item = `
## The Sign Grew to Fit the Words

For as long as the works have spoken, the sign that carries their words was cut to one size, and any message longer than a number was trimmed away at both ends before it reached you.
Buy a course on the Stockpile Yard and the sign now grows to hold the whole line — the lettering set to fit the board it is painted on, down to a floor it will not go below.
Short calls like a nugget's worth are unchanged; it is the sentences that were never readable, and now are.
merge efa3b25215220305154f92feadf6d6a3d50859e4 · reviews/f1316-1-float-text-legibility.md · reviews/shots-f1316-1/ (desktop 1280 + mobile 390, re-rendered on the merged tree)
OWNER CHOICE — this closes the F-1316-1 bug that was put to you on camera last night, by the first of the three cures offered: the lettering now fits the sign. Two things are worth your eye. On mobile the line is large and plain; on desktop it is complete but small, about a sixth of the screen's width. And the fit has two characters of room left in it — the longest line we ship sits one pixel above the floor the lettering will not shrink past, so the next sentence written could be cut again without any test noticing (filed F-1318-1, engineering cure owed, no ruling needed). The wording cure — a name and a course, with the flavour moved to the context card — is still open and still yours.
`;

appendFileSync('marketing/outbox/gazette-queue.md', item);
console.log('gazette item appended for efa3b252');
