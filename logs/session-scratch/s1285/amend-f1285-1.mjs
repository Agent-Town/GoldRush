import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const src = fs.readFileSync(p, 'utf8');
const anchor = '➡️ **RECOMMENDATION: stage and commit as ONE action**';
if (!src.includes(anchor)) {
  console.error('F-1285-1 recommendation anchor not found');
  process.exit(1);
}

const rider = ' 🔁 **IT THEN HAPPENED A SECOND TIME, EIGHT MINUTES LATER — so this is a repeating pattern, not a one-off collision.** `3526aead` *"spec: THE EXAMINER’S LAWS…"* (same author, **11:26:56**) swept the drain’s SECOND staged batch: `reviews/ap-06b-adapter-reland-s1285-drain.md` (107 lines), the `tasks/BACKLOG.md` findings (7 lines) and the `tasks/goals.json` leaf flip (4/2). ✓ Content intact again, boundary wrong again. ⚡ **Two sweeps in eight minutes means the window is not rare — it is the normal state of main while a fire gates.** s1285 adopted its own recommendation for every commit after this one (`205f036b` onward: `git add` and `git commit` issued in a single shell invocation, nothing in between) and was not swept again. **That is the mitigation, and it is free.**';

fs.writeFileSync(p, src.replace(anchor, rider + ' ' + anchor));
console.log('F-1285-1 amended with the second occurrence');
