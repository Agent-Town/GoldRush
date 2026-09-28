// desk-row.cjs <F-ID> <row text without the leading glyph>: declares an owner item as its OWN BACKLOG row (desk-declaration-guard:
// a mention inside another finding's row is not a declaration; the ID must be the first F-ID in the row's subject zone).
// Inserted above the first existing desk row; idempotent on the F-ID. Run from the repo (or chain) root.
const fs = require('fs');
const [id, text] = process.argv.slice(2);
if (!id || !text) { console.error('usage: desk-row.cjs <F-ID> <text>'); process.exit(2); }
const f = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(f, 'utf8').split('\n');
if (lines.some(l => l.startsWith(`🔺 **${id} — OWNER'S DESK`))) { console.log(`desk row ${id}: present`); process.exit(0); }
const at = lines.findIndex(l => /^🔺 \*\*F-[A-Z0-9-]+ — OWNER'S DESK/.test(l));
if (at < 0) { console.error('no desk block found in tasks/BACKLOG.md'); process.exit(1); }
lines.splice(at, 0, `🔺 **${id} — OWNER'S DESK ${text}`, '');
fs.writeFileSync(f, lines.join('\n'));
console.log(`desk row ${id}: inserted at line ${at + 1}`);
