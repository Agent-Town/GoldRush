// s1521 — GZ-01: the fd3 merge is a player-visible change, so it owes a news item.
import { readFileSync, appendFileSync } from 'node:fs';

const item = `

## The county's standings learned to read like a board, and your own claims sit beside them
The standing sheet listed riders and little else. Now each line reads in the order a person asks: rank, the name, what they took, and when they rode.
Under it there is a second, shorter list that belongs only to you — the claims from your own ledger, kept plainly apart from the county's. Where nothing has happened yet the sheet says so in the county's own voice instead of showing you an empty frame, and the Field Book no longer rules columns for contracts nobody has attempted. Both read the same on a narrow screen.
One column is honest but still bare: "when" shows a dash on rows the public board has not yet been taught to hand over. The clerk knows the hour; the window has not been widened to show it. That work is written and queued.
merge 7abee977a3cbaae1a7e604580bcf0d4cfb573bf6 · reviews/lane-fd3-boards-pass.md · reviews/shots-fd3/ (before/after, desktop 1280 + mobile 390)
NO OWNER CHOICE — this improves a board you already had. Worth knowing what the drain would not claim: the runner who built it ended its own report saying it was NOT ready, over that bare column, and it was right — the merge went ahead because the column degrades to a dash rather than breaking, and the missing half is now a queued task rather than a note. Three of the board's tests were red on the machine before this merge and are red after it, for a reason that has nothing to do with the boards; that was proved by rebuilding the county as it stood beforehand and watching the same three fail.
`;

appendFileSync('marketing/outbox/gazette-queue.md', item);
const txt = readFileSync('marketing/outbox/gazette-queue.md', 'utf8');
const headline = "The county's standings learned to read like a board, and your own claims sit beside them";
console.log('headline chars:', headline.length, headline.length <= 80 ? 'OK' : '⚠️ OVER 80 — trim');
console.log('items in queue:', (txt.match(/^## /gm) || []).length);
