import fs from 'node:fs';
const P = 'marketing/outbox/gazette-queue.md';
const item = `
## The yard stops calling them straw mans
The practice yard's card had begun to contradict itself. Its written word said the straw men lend their patience; the line beneath it, the one the yard assembles for itself out of what it holds, called them straw mans.
The yard now names them the same way twice. Nothing else on any card moved — the rolling logs, the lantern posts, the sentry beacons and the turrets all read exactly as they did.
merge efb5465dca18c964a69aba8a0d69ead8cf4cf223 · reviews/f1501-4-manifest-plural.md · artifacts/f1501-4-manifest-plural/ (desktop 1280 + mobile 390)
NO OWNER CHOICE — a word the yard was already using in its own prose, now used by the line beside it. Worth knowing what the drain would not claim: the old test compared the card against the same code that wrote it, so it agreed with the mistake; the new one pins the words themselves, and the mistake was put back deliberately to watch it fail before it was taken away again.
`;
fs.appendFileSync(P, item);
console.log('gazette item appended');
