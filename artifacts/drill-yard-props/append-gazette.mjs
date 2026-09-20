import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const p = path.join(ROOT, 'marketing/outbox/gazette-queue.md');

const item = `

## The county sets out its tools at the training ground
The Drill Yard's three stations — the assay table where the county lends you practice gold, the bell you ring to call a wave, and the straw target that takes your shots — have been standing there as plain blocks. They now stand as the engraved yard furniture they were drawn to be: a timber trestle with a brass balance and a hand-cranked strongbox, a bronze bell hung in a braced frame, and a roped straw bundle on crossed timbers.
Nothing about the practice changes. The yard simply looks like a place the county built.
merge a7b7eddb596c884421e9ba43096f7b85abde7fcf · reviews/art-drill-yard-props-extracted.md · artifacts/drill-yard-props/ (in-game, desktop 1280 + mobile 390)
NO OWNER CHOICE — the art was drawn, canon-checked and accepted over three earlier passes; this is only the last step that puts it on screen. Worth knowing that the same drain found and fixed a magenta halo that every keyed sprite has been wearing, which is why these read clean.
`;

fs.appendFileSync(p, item, 'utf8');
console.log('appended gazette item; file now', fs.readFileSync(p, 'utf8').split('\n').length, 'lines');
