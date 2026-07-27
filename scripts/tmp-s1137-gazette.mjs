import fs from 'node:fs';
const p = 'marketing/outbox/gazette-queue.md';
const item = [
  '',
  '',
  '## And Now He Walks The Diagonals In His Own Coat',
  '- The bug the last item put on camera has been caught. Walking north-east, south-east, north-west or south-west, your prospector was drawn in his plain east or west art — four headings wearing two costumes, and the four diagonal drawings hanging unworn in the wardrobe beside them.',
  '- All eight headings now show their own art. Strike out on any diagonal and the figure you follow is the one that was painted for that direction.',
  '- The drawings were always right and always there. The builder had been letting a general-purpose stand-in overwrite work that had been done properly, so the town asked for the diagonal coat and was handed the east one. The stand-in still serves every character who genuinely has no coat of their own — only the prospector\'s own wardrobe now takes precedence over it.',
  '- merge: `e6961aee` (vp-02e-diagonal-clip-resolution, lane-b, drained s1137) · evidence: `reviews/vp-02e.md` — the resolver\'s own suite reads 10 of 14 on desktop and 390px with all eight headings green for the first time, and the neighbouring animation suite climbs from 13 of 22 to 19 of 22 on the same two screens, console and page errors asserted empty · both remaining reds were each carried to a clean copy of the town with the one-line repair taken back out, and behaved differently there, so their cause is named honestly rather than guessed · shots: `reviews/shots-vp-02e/`',
  '- ✅ ANSWERS THE OPEN QUESTION ON THE ITEM ABOVE: the repair that item offered to wait for has landed, so the two can now be announced together as one story — he learned to stand still facing east, and then to walk the diagonals in his own coat.',
  '- ⚠️ OWNER\'S CHOICE, bug on camera: gating this one turned up a smaller one behind it. On the narrow phone screen only, the test that watches him walk west can no longer catch him in the frame it expects; on the wide screen he is correct. We do not yet know whether the man is wrong or only the watcher, and we have deliberately not guessed — a probe is owed before anyone claims either.',
  '',
].join('\n');
fs.appendFileSync(p, item);
console.log('gazette item appended');
