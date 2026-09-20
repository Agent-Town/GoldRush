import { appendFileSync } from 'node:fs';

const item = `

## The Yard Speaks for Itself Now, and the Board Says What a Course Buys

Buy a second course on the Stockpile Yard and the works used to answer in the turret's voice — brass cadence, on a building with no brass in it.
The yard now says its own line, and the build board prints what each course is worth before you spend: a second course, two hundred and forty more gold held.
The figure is read off the yard's own ledger, so the board cannot promise a ceiling the yard does not keep.
merge 8c8d6139fb346594b5f65e66c640c31bcf4b63d8 · reviews/f1314-3-stockpile-tier-voice.md · artifacts/f1314-3-stockpile-tier-voice/ (desktop 1280 + mobile 390, plain resumed boot, no debug)
OWNER CHOICE — bug on camera: the build-board line reads correctly, but the message that floats over the yard is cut to six letters by a fixed-width sign that predates all of this (every upgrade message has always been cut the same way; short numbers fit, sentences never did). Filed F-1316-1. Three cures: fit the lettering to the sign, make the sign taller, or shorten the message to a name and a course and let the context card carry the flavour. The third is a wording call and is yours; the other two need no ruling.
`;

appendFileSync('marketing/outbox/gazette-queue.md', item);
console.log('gazette item appended');
